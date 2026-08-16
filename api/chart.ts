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
 * NOTE: the higher tier's price/checkout isn't wired yet — pending Tre's
 * call on pricing. Until then this gates on `subscriptions.tier ===
 * 'long_read_plus_numerology'`, which no one can reach through checkout
 * yet, so the numerology branch is effectively dormant (returns 402) until
 * that tier is purchasable.
 */

import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  fail,
  HttpError,
  supabaseAdmin,
} from "./_lib/server.js";
import { computeNatalChart, geocodeLocation, searchLocations } from "./_lib/natalChart.js";
import { generateWithGemini, type GeminiFailure } from "./_lib/gemini.js";
import { fullNumerologyProfile, NUMBER_MEANINGS } from "../src/lib/numerology.js";

const NUMEROLOGY_SYSTEM_PROMPT = `You are the XI · XVI Reader, writing the numerology narrative for the XI Eleven XVI Sixteen (xixvi.shop) brand — the paid, higher-tier companion to the natal chart. Same voice as always: direct, poignant, specific — never a generic horoscope, never hedging ("may"/"could"), never false authority.

Write one paragraph per number given (Life Path, Expression, Soul Urge, Personality, Personal Year), each grounded in its literal meaning, never generic keyword soup. Close with one direct synthesis paragraph connecting the numbers into a real throughline about this person. Sparing bold on 3-4 key phrases. 350-500 words total. No headers, no bullets, no emoji, no sign-off. Address them by name once, naturally, not as a greeting.`;

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

async function handleNatalChart(req: ApiRequest, res: ApiResponse) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Please sign in first");

  const admin = supabaseAdmin();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("birth_date, birth_time, birth_location, birth_lat, birth_lng")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;

  if (!profile?.birth_date) {
    return res.status(200).json({
      success: false,
      reason: "missing_birth_date",
      message: "Add your birth date in your account to generate a natal chart.",
    });
  }
  if (!profile?.birth_location) {
    return res.status(200).json({
      success: false,
      reason: "missing_birth_location",
      message: "Add your birth location in your account to generate a natal chart.",
    });
  }

  let lat = profile.birth_lat != null ? Number(profile.birth_lat) : null;
  let lng = profile.birth_lng != null ? Number(profile.birth_lng) : null;

  if (lat == null || lng == null) {
    const geo = await geocodeLocation(profile.birth_location);
    if (!geo) {
      return res.status(200).json({
        success: false,
        reason: "geocode_failed",
        message:
          "We couldn't place that birth location on the map — try a more specific city and state/country.",
      });
    }
    lat = geo.lat;
    lng = geo.lng;
    // Cache it — best-effort, don't fail the request if this write fails.
    await admin
      .from("profiles")
      .update({ birth_lat: lat, birth_lng: lng })
      .eq("id", user.id);
  }

  const chart = computeNatalChart(profile.birth_date, profile.birth_time, {
    lat,
    lng,
  });

  return res.status(200).json({ success: true, chart });
}

async function handleNumerology(req: ApiRequest, res: ApiResponse) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Please sign in first");

  const admin = supabaseAdmin();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, tier")
    .eq("user_id", user.id)
    .maybeSingle();

  const unlocked =
    !!sub &&
    ["trialing", "active"].includes(sub.status) &&
    sub.tier === "long_read_plus_numerology";

  if (!unlocked) {
    throw new HttpError(
      402,
      "Numerology is part of our higher subscription tier — coming soon.",
    );
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("name, birth_date")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.birth_date) {
    throw new HttpError(400, "Add your birth date in your account first.");
  }

  const fullName = profile.name || "friend";
  const numbers = fullNumerologyProfile(fullName, profile.birth_date);

  const lines = (Object.entries(numbers) as [string, number][]).map(
    ([key, value]) => `${key}: ${value} — ${NUMBER_MEANINGS[value] ?? ""}`,
  );
  const userPrompt = `This reading is for ${fullName}.\n\nTheir numbers:\n${lines.join("\n")}\n\nWrite the numerology narrative now, following the voice and structure rules exactly.`;

  const result = await generateWithGemini(NUMEROLOGY_SYSTEM_PROMPT, userPrompt, 3000);
  if (!result.success) {
    const failure = result as GeminiFailure;
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
    if (kind === "natal" || kind === undefined) {
      return await handleNatalChart(req, res);
    }
    throw new HttpError(400, "Unknown chart kind requested");
  } catch (error) {
    return fail(res, error);
  }
}
