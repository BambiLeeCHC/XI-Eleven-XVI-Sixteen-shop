/**
 * XI · XVI Tarot Reading Engine — the free daily "Embracing Change" spread.
 *
 * Powered by Groq (GROQ_API_KEY). Returns { success: false, reason, error }
 * when the key is missing or the upstream call fails so the UI can fall back
 * to static card copy without a silent hang.
 */

import {
  type ApiRequest,
  type ApiResponse,
  fail,
  HttpError,
} from "./_lib/server.js";
import { generateWithGroq, type GroqFailure } from "./_lib/groq.js";

interface SpreadCardInput {
  position: string;
  positionMeaning: string;
  name: string;
  reversed: boolean;
  keywords: string[];
  meaning: string;
}

const SYSTEM_PROMPT = `You are the XI · XVI Reader — the tarot voice of the XI Eleven XVI Sixteen (xixvi.shop) brand. Your writing is direct, poignant, and specific — never a generic horoscope, never hedging language like "may" or "could," never a false or theatrical sense of authority.

VOICE AND STRUCTURE (model this closely):
- Do NOT open with a "hook" that teases a card and promises to circle back to it later — that device reads as corny and hollow. Just start speaking to the person about what's actually in front of them.
- Address the cards ONE AT A TIME, in draw order, each in its own short paragraph named by its position (e.g. "In your [Position], [Card] ..."). Give each card one grounded, specific, direct read tied to what that position means — not three sub-points, not keyword soup, not a recap list.
- Reversed cards carry a genuinely different charge than upright — treat them as their own message, not an inverted sentence.
- Every paragraph should build on the one before it — by the end the reader should feel the throughline, but earn that by what each card actually says, not by announcing "these mean X together" as a separate authority-flex line.
- Close with one short, direct synthesis of what this spread is really telling them, then one concrete, second-person nudge — one real thing to do or notice today. No dramatic pronouncements, no vague mysticism, no telling the reader how they should feel — just tell them plainly what's true and what to do with it.
- Sparing, intentional bold (wrap in **like this**) on the two or three phrases that matter most. Do not bold more than that.
- Write 220-320 words. No headers, no bullet lists, no emoji, no sign-off, no greeting by name — begin directly addressing the first card.
- If a first name is given below, address that person by name once, naturally, within the opening sentence — not as a greeting line. Don't announce that you're doing this.
- If a gender identity and/or sexual orientation are given below, use them only to get pronouns and relationship framing right where the reading naturally touches on identity or relationships — never call them out directly, never make either the subject of the reading unless it's already clearly relevant.
- After the full reading, leave one blank line, then write exactly one final short line starting with the literal marker "SYNOPSIS:" followed by a brief (1-2 sentence, under 40 words) plain-language personal synopsis of the whole draw — what this spread means for them today, in the most direct possible terms. No card names in the synopsis, no bold, this is the plain takeaway on its own.`;

function buildUserPrompt(
  spread: SpreadCardInput[],
  name?: string,
  genderIdentity?: string,
  sexualOrientation?: string,
): string {
  const lines = spread.map(
    (c, i) =>
      `${i + 1}. Position "${c.position}" (${c.positionMeaning}) → ${c.name}${c.reversed ? ", REVERSED" : ", upright"}. Canonical meaning: ${c.meaning} Keywords: ${c.keywords.join(", ")}.`,
  );
  const identityBits = [
    genderIdentity ? `gender identity: ${genderIdentity}` : null,
    sexualOrientation ? `sexual orientation: ${sexualOrientation}` : null,
  ].filter(Boolean);
  const personalization =
    name || identityBits.length
      ? `\n\nThis reading is for ${name || "the reader"}.${identityBits.length ? ` On file: ${identityBits.join(", ")}.` : ""} Weave this in per the personalization rules.`
      : "";
  return `Today's spread, in draw order:\n${lines.join("\n")}${personalization}\n\nWrite today's reading now, following the voice and structure rules exactly.`;
}

function groqErrorMessage(failure: GroqFailure): string {
  if (failure.reason === "no_key") {
    return "Reading engine offline (GROQ_API_KEY missing). Set it in Vercel and redeploy.";
  }
  if (failure.reason === "upstream_error") {
    return `Reading engine upstream error${failure.detail ? ` (${failure.detail})` : ""}.`;
  }
  return "Reading engine returned an empty response.";
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { spread, name, genderIdentity, sexualOrientation } =
      (req.body ?? {}) as {
        spread?: SpreadCardInput[];
        name?: string;
        genderIdentity?: string;
        sexualOrientation?: string;
      };
    if (!spread || !Array.isArray(spread) || spread.length === 0) {
      throw new HttpError(400, "A spread of drawn cards is required");
    }

    const result = await generateWithGroq(
      SYSTEM_PROMPT,
      buildUserPrompt(spread, name, genderIdentity, sexualOrientation),
      3000,
    );

    if (!result.success) {
      const failure = result as GroqFailure;
      return res.status(200).json({
        success: false,
        reason: failure.reason,
        error: groqErrorMessage(failure),
        detail: failure.detail,
      });
    }
    return res.status(200).json({ success: true, reading: result.text });
  } catch (error) {
    return fail(res, error);
  }
}
