/**
 * Numerology — the paywalled add-on (separate, higher subscription tier
 * from the base Long Read). Pure math (src/lib/numerology.ts), no AI/API
 * dependency for the numbers themselves; Gemini only writes the narrative
 * wrapped around them.
 *
 * NOTE: the higher tier's price/checkout isn't wired yet — pending Tre's
 * call on pricing. Until then this gates on `subscriptions.tier ===
 * 'long_read_plus_numerology'`, which no one can reach through checkout
 * yet, so this endpoint is effectively dormant (returns 402) until that
 * tier is purchasable.
 */

import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  fail,
  HttpError,
  supabaseAdmin,
} from "./_lib/server.js";
import { generateWithGemini, type GeminiFailure } from "./_lib/gemini.js";
import { fullNumerologyProfile, NUMBER_MEANINGS } from "../src/lib/numerology.js";

const SYSTEM_PROMPT = `You are the XI · XVI Reader, writing the numerology narrative for the XI Eleven XVI Sixteen (xixvi.shop) brand — the paid, higher-tier companion to the natal chart. Same voice as always: direct, poignant, specific — never a generic horoscope, never hedging ("may"/"could"), never false authority.

Write one paragraph per number given (Life Path, Expression, Soul Urge, Personality, Personal Year), each grounded in its literal meaning, never generic keyword soup. Close with one direct synthesis paragraph connecting the numbers into a real throughline about this person. Sparing bold on 3-4 key phrases. 350-500 words total. No headers, no bullets, no emoji, no sign-off. Address them by name once, naturally, not as a greeting.`;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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

    const result = await generateWithGemini(SYSTEM_PROMPT, userPrompt, 3000);
    if (!result.success) {
      const failure = result as GeminiFailure;
      return res.status(200).json({ success: false, reason: failure.reason, numbers });
    }

    return res.status(200).json({ success: true, numbers, narrative: result.text });
  } catch (error) {
    return fail(res, error);
  }
}
