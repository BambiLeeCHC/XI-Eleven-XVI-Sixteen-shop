/**
 * The Long Read — the paywalled seven-card deep reading.
 *
 * Requires an active or trialing subscription (checked server-side against
 * `subscriptions`, never trusted from the client). The card draw itself
 * happens in the browser (same pattern as the free five-card spread); this
 * endpoint writes the narrative and saves the result to `deep_readings` so
 * it's kept on the account as a keepsake even before email delivery exists.
 */

import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  fail,
  HttpError,
  supabaseAdmin,
} from "./_lib/server.js";
import { generateWithGemini } from "./_lib/gemini.js";

interface SpreadCardInput {
  position: string;
  positionMeaning: string;
  name: string;
  reversed: boolean;
  keywords: string[];
  meaning: string;
}

const SYSTEM_PROMPT = `You are the XI · XVI Reader, writing "The Long Read" — the in-depth, paid tarot reading for the XI Eleven XVI Sixteen (xixvi.shop) brand. This reader paid specifically to go deeper on a situation they described to us. Your writing is direct, poignant, and specific — never a generic horoscope, never hedging language like "may" or "could," never a false or theatrical sense of authority.

VOICE AND STRUCTURE (model this closely):
- Do NOT open with a "hook" that teases a card and promises to circle back to it later. Just start speaking to them about what's actually in front of them, grounded in the situation they described.
- Address the seven cards ONE AT A TIME, in draw order, each in its own paragraph named by its position (e.g. "In the Root of this, [Card] ..."). Every paragraph should read the card specifically against the situation they told us — not generic card meaning, not keyword soup.
- Reversed cards carry a genuinely different charge than upright — treat them as their own message.
- Build a real throughline across all seven, earned by what each card actually says.
- Close with one direct synthesis paragraph naming what's really true about their situation, then one concrete, second-person thing to do next. No vague mysticism, no telling them how to feel.
- Sparing, intentional bold (wrap in **like this**) on the three or four phrases that matter most.
- Write 450-650 words — this is the long version, not the daily one. No headers, no bullet lists, no emoji, no sign-off.
- Address them by name once, naturally, in the opening — not as a greeting line.`;

function buildUserPrompt(
  spread: SpreadCardInput[],
  name: string,
  situation: string,
): string {
  const lines = spread.map(
    (c, i) =>
      `${i + 1}. Position "${c.position}" (${c.positionMeaning}) → ${c.name}${c.reversed ? ", REVERSED" : ", upright"}. Canonical meaning: ${c.meaning} Keywords: ${c.keywords.join(", ")}.`,
  );
  return `This reading is for ${name}. What they told us is going on: "${situation}".\n\nThe seven-card spread, in draw order:\n${lines.join("\n")}\n\nWrite the Long Read now, following the voice and structure rules exactly.`;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await currentUser(req);
    if (!user) throw new HttpError(401, "Please sign in first");

    const admin = supabaseAdmin();
    const { data: sub } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!sub || !["trialing", "active"].includes(sub.status)) {
      throw new HttpError(402, "An active subscription is required for the Long Read");
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();
    const name = profile?.name || "friend";

    const { spread, situation } = (req.body ?? {}) as {
      spread?: SpreadCardInput[];
      situation?: string;
    };
    if (!spread || !Array.isArray(spread) || spread.length === 0) {
      throw new HttpError(400, "A spread of drawn cards is required");
    }
    const situationText = situation?.trim() || "not specified";

    const result = await generateWithGemini(
      SYSTEM_PROMPT,
      buildUserPrompt(spread, name, situationText),
      5000,
    );
    if (!result.success) {
      return res.status(200).json({ success: false, reason: result.reason });
    }

    const { data: saved, error } = await admin
      .from("deep_readings")
      .insert({ user_id: user.id, spread, reading: result.text })
      .select("id, created_at")
      .single();
    if (error) throw error;

    return res.status(200).json({
      success: true,
      reading: result.text,
      id: saved.id,
      createdAt: saved.created_at,
    });
  } catch (error) {
    return fail(res, error);
  }
}
