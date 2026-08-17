/**
 * Natal chart (free) + numerology (paywalled add-on), combined into one
 * serverless function. Split as two separate files (natal-chart.ts,
 * numerology.ts) initially, but the Hobby-plan Vercel project is capped at
 * 12 Serverless Functions per deployment — merged here, dispatched by
 * `?kind=natal|numerology` (GET) or `{ kind }` in the POST body, to stay
 * under that limit. Logic for each kind is otherwise unchanged from the
 * original standalone files.
 *
 * Natal chart: given in full at registration, no paywall. Requires
 * birth_date + birth_location on the profile (birth_time is optional;
 * without it the chart is computed for local noon and flagged
 * `approximateTime`). Geocodes birth_location once and caches lat/lng on
 * the profile row so repeat views don't re-hit the geocoder.
 *
 * Numerology: the paywalled add-on (separate, higher subscription tier from
 * the base Long Read). Pure math (src/lib/numerology.ts), no AI/API
 * dependency for the numbers themselves; Gemini only writes the narrative
 * wrapped around them.
 *
 * Two ways to unlock it, checked with OR:
 *  - the bundled subscription tier ("long_read_plus_numerology", $12/week
 *    — Long Read + Numerology), purchasable via /api/reading-checkout's
 *    `subscribe` kind with `{ tier: "long_read_plus_numerology" }`, gates
 *    on `subscriptions.tier === 'long_read_plus_numerology'` with an
 *    active or trialing status.
 *  - a one-time $19.99 unlock, purchasable via /api/reading-checkout's
 *    `numerology_unlock` kind, gates on `profiles.numerology_unlocked_at`
 *    being set (written by the webhook once Stripe confirms payment).
 */

import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  fail,
  HttpError,
  supabaseAdmin,
} from "./_lib/server.js";
import {
  computeNatalChart,
  geocodeLocation,
  searchLocations,
  type NatalChart,
} from "./_lib/natalChart.js";
import { generateWithGroq, type GroqFailure } from "./_lib/groq.js";
import { fullNumerologyProfile, NUMBER_MEANINGS } from "../src/lib/numerology.js";
import { BODY_MEANINGS, explainAspect } from "../src/lib/astrologyMeanings.js";

const NUMEROLOGY_SYSTEM_PROMPT = `You are the XI · XVI Reader, writing the numerology narrative for the XI Eleven XVI Sixteen (xixvi.shop) brand — the paid, higher-tier companion to the natal chart. Same voice as always: direct, poignant, specific — never a generic horoscope, never hedging ("may"/"could"), never false authority.

Write one paragraph per number given (Life Path, Expression, Soul Urge, Personality, Personal Year), each grounded in its literal meaning, never generic keyword soup. Close with one direct synthesis paragraph connecting the numbers into a real throughline about this person.

Output each section as a line starting with "## " followed by the exact number name (Life Path / Expression / Soul Urge / Personality / Personal Year), then that number's paragraph — nothing else, no other headers, no bullets, no emoji. Close with a final section "## The Throughline" for the synthesis paragraph. Sparing bold on 3-4 key phrases total. 350-500 words total. Address them by name once, naturally, not as a greeting.`;

const NATAL_PROFILE_SYSTEM_PROMPT = `You are the XI · XVI Reader, writing the personalized personality profile for someone's free natal chart on the XI Eleven XVI Sixteen (xixvi.shop) brand. Same voice as always: direct, poignant, specific — never a generic horoscope, never hedging ("may"/"could"), never false authority, never a list of keywords.

You'll be given their Sun, Moon, Ascendant, Midheaven, all other planetary placements, and their tightest aspects. Write a real synthesis, not a placement-by-placement recap, structured into exactly three sections. Output each section as a line starting with "## " followed by the exact section title below, then the paragraph(s) for that section — nothing else, no other headers, no bullets, no emoji:

## Who You Are
Weave Sun, Moon and Ascendant into one throughline about their identity, inner world and how they come across — the tension or harmony between "who I am," "what I feel," and "how I'm seen." 120-160 words.

## The Texture
Weave the other placements and their tightest aspects into real personality texture — contradictions, strengths, where they get in their own way. Ground specific claims in specific placements. 180-260 words.

## The Highest Use of Your Chart
Concrete, specific guidance on the best and highest thing this person could be doing with their particular astrological gifts. Ground it in real placements (e.g. what their Midheaven, Jupiter, Saturn and Mars are doing), not generic "follow your dreams" language. 150-200 words.

Sparing bold on 4-5 key phrases total across all three sections. Address them by name once, naturally, in the first section only.`;

/** Location autocomplete for the birth-location field. Deliberately
 * unauthenticated — this needs to work on the sign-up form, before an
 * account exists. */
async function handleGeocodeSearch(req: ApiRequest, res: ApiResponse) {
  const queryQ = req.query?.q;
  const qFromQuery = Array.isArray(queryQ) ? queryQ[0] : queryQ;
  const q = ((req.body as { q?: string } | undefined)?.q ?? qFromQuery ?? "") as string;
  const suggestions = await searchLocations(q);
  return res.status(200).json({ success: true, suggestions });
}

type ChartResolution =
  | { ok: true; chart: NatalChart; name: string | null; sourceKey: string }
  | { ok: false; reason: string; message: string };

/**
 * Shared birth-data → chart resolution, used by both the raw chart endpoint
 * and the personality-profile narrative endpoint so they can't drift.
 */
async function resolveUserChart(userId: string): Promise<ChartResolution> {
  const admin = supabaseAdmin();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("name, birth_date, birth_time, birth_location, birth_lat, birth_lng")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw profileError;

  if (!profile?.birth_date) {
    return {
      ok: false,
      reason: "missing_birth_date",
      message: "Add your birth date in your account to generate a natal chart.",
    };
  }
  if (!profile?.birth_location) {
    return {
      ok: false,
      reason: "missing_birth_location",
      message: "Add your birth location in your account to generate a natal chart.",
    };
  }

  let lat = profile.birth_lat != null ? Number(profile.birth_lat) : null;
  let lng = profile.birth_lng != null ? Number(profile.birth_lng) : null;

  if (lat == null || lng == null) {
    const geo = await geocodeLocation(profile.birth_location);
    if (!geo) {
      return {
        ok: false,
        reason: "geocode_failed",
        message:
          "We couldn't place that birth location on the map — try a more specific city and state/country.",
      };
    }
    lat = geo.lat;
    lng = geo.lng;
    // Cache it — best-effort, don't fail the request if this write fails.
    await admin
      .from("profiles")
      .update({ birth_lat: lat, birth_lng: lng })
      .eq("id", userId);
  }

  const chart = computeNatalChart(profile.birth_date, profile.birth_time, { lat, lng });
  // Stable key for whatever birth inputs produced this chart — if any of
  // these ever change (edited birth details), the key changes too, so a
  // cached narrative keyed on the old value is correctly treated as stale.
  const sourceKey = `${profile.birth_date}|${profile.birth_time ?? ""}|${lat}|${lng}`;
  return { ok: true, chart, name: profile.name ?? null, sourceKey };
}

async function handleNatalChart(req: ApiRequest, res: ApiResponse) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Please sign in first");

  const resolved = await resolveUserChart(user.id);
  if (!resolved.ok) {
    return res.status(200).json({ success: false, reason: resolved.reason, message: resolved.message });
  }

  return res.status(200).json({ success: true, chart: resolved.chart });
}

/** The personalized personality-profile narrative — free, part of the
 * natal chart (not paywalled). Weaves Sun/Moon/Ascendant/Midheaven, the
 * other placements and the tightest real aspects into one synthesis, plus
 * a closing "highest use of your chart" section. */
async function handleNatalProfile(req: ApiRequest, res: ApiResponse) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Please sign in first");

  const resolved = await resolveUserChart(user.id);
  if (!resolved.ok) {
    return res.status(200).json({ success: false, reason: resolved.reason, message: resolved.message });
  }

  const { chart, name, sourceKey } = resolved;
  const admin = supabaseAdmin();

  // The personality profile is written once ever per birth-data set, then
  // reused on every subsequent visit — no repeat Gemini calls for a
  // narrative that would just be regenerated from the same inputs.
  const { data: cached } = await admin
    .from("profiles")
    .select("natal_profile_narrative, natal_profile_source_key")
    .eq("id", user.id)
    .maybeSingle();
  if (cached?.natal_profile_narrative && cached.natal_profile_source_key === sourceKey) {
    return res.status(200).json({ success: true, narrative: cached.natal_profile_narrative });
  }

  const fullName = name || "friend";

  const placementLines = chart.placements
    .map((p) => `${p.body} in ${p.sign}${p.house ? ` (house ${p.house})` : ""}${p.retrograde ? " retrograde" : ""} — governs ${BODY_MEANINGS[p.body] ?? ""}`)
    .join("\n");

  const aspectLines = chart.aspects
    .slice(0, 8)
    .map((a) => `${a.bodyA} ${a.aspect} ${a.bodyB} (orb ${a.orb}°) — ${explainAspect(a.aspect)}`)
    .join("\n");

  const userPrompt = `This natal chart is for ${fullName}.

Ascendant: ${chart.ascendant}
Midheaven: ${chart.midheaven}

Placements:
${placementLines}

Tightest aspects:
${aspectLines || "None within a tight orb."}

Write the personality profile now, following the voice and structure rules exactly.`;

  const result = await generateWithGroq(NATAL_PROFILE_SYSTEM_PROMPT, userPrompt, 3200);
  if (!result.success) {
    const failure = result as GroqFailure;
    return res.status(200).json({ success: false, reason: failure.reason });
  }

  // Best-effort cache write — don't fail the request if this write fails.
  await admin
    .from("profiles")
    .update({ natal_profile_narrative: result.text, natal_profile_source_key: sourceKey })
    .eq("id", user.id);

  return res.status(200).json({ success: true, narrative: result.text });
}

async function handleNumerology(req: ApiRequest, res: ApiResponse) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Please sign in first");

  const admin = supabaseAdmin();
  const [{ data: sub }, { data: profile }] = await Promise.all([
    admin
      .from("subscriptions")
      .select("status, tier")
      .eq("user_id", user.id)
      .maybeSingle(),
    admin
      .from("profiles")
      .select("name, birth_date, numerology_unlocked_at")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const unlockedBySubscription =
    !!sub &&
    ["trialing", "active"].includes(sub.status) &&
    sub.tier === "long_read_plus_numerology";
  const unlockedOneTime = !!profile?.numerology_unlocked_at;
  const unlocked = unlockedBySubscription || unlockedOneTime;

  if (!unlocked) {
    throw new HttpError(
      402,
      "Numerology is a one-time $19.99 unlock, or included with the Long Read + Numerology tier ($12/week, 7-day free trial).",
    );
  }
  if (!profile?.birth_date) {
    throw new HttpError(400, "Add your birth date in your account first.");
  }

  const fullName = profile.name || "friend";
  const numbers = fullNumerologyProfile(fullName, profile.birth_date);

  const lines = (Object.entries(numbers) as [string, number][]).map(
    ([key, value]) => `${key}: ${value} — ${NUMBER_MEANINGS[value] ?? ""}`,
  );
  const userPrompt = `This reading is for ${fullName}.\n\nTheir numbers:\n${lines.join("\n")}\n\nWrite the numerology narrative now, following the voice and structure rules exactly.`;

  const result = await generateWithGroq(NUMEROLOGY_SYSTEM_PROMPT, userPrompt, 3000);
  if (!result.success) {
    const failure = result as GroqFailure;
    return res.status(200).json({ success: false, reason: failure.reason, numbers });
  }

  return res.status(200).json({ success: true, numbers, narrative: result.text });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const queryKind = req.query?.kind;
    const kindFromQuery = Array.isArray(queryKind) ? queryKind[0] : queryKind;
    const kindFromBody = (req.body as { kind?: string } | undefined)?.kind;
    const kind = kindFromBody ?? kindFromQuery;

    if (kind === "numerology") {
      return await handleNumerology(req, res);
    }
    if (kind === "geocode-search") {
      return await handleGeocodeSearch(req, res);
    }
    if (kind === "natal-profile") {
      return await handleNatalProfile(req, res);
    }
    if (kind === "natal" || kind === undefined) {
      return await handleNatalChart(req, res);
    }
    throw new HttpError(400, "Unknown chart kind requested");
  } catch (error) {
    return fail(res, error);
  }
}
