/**
 * XI · XVI Tarot Reading Engine — the free daily "Embracing Change" spread.
 *
 * Turns a drawn 5-card spread (cards + positions + orientations) into a
 * single, freshly-written narrative reading — not a template, not a
 * recombination of stock paragraphs. Every request sends the model the
 * canonical upright/reversed meaning of each card and the meaning of the
 * position it landed in; the model is required to synthesize a specific,
 * connected reading the way a real reader would — direct, card-by-card,
 * never a generic daily-horoscope template, never a narrative hook that
 * promises to circle back later.
 *
 * If the reader is signed in, the reading is lightly personalized: addressed
 * by name once. Anonymous/guest readers still get the full reading, just
 * without that layer. The reading always closes with a short "SYNOPSIS:"
 * line — a plain-language personal takeaway for the whole draw — which the
 * frontend splits out and renders as its own closing line (see DrawThree.tsx).
 *
 * Calls Google's Gemini API using GEMINI_API_KEY (free tier). If
 * GEMINI_API_KEY isn't configured, the caller falls back to the static
 * per-card copy already in the deck data (see DrawThree.tsx).
 */

import {
  type ApiRequest,
  type ApiResponse,
  fail,
  HttpError,
} from "./_lib/server.js";
import { generateWithGemini, type GeminiFailure } from "./_lib/gemini.js";

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

    const result = await generateWithGemini(
      SYSTEM_PROMPT,
      buildUserPrompt(spread, name, genderIdentity, sexualOrientation),
      3000,
    );

    if (!result.success) {
      const failure = result as GeminiFailure;
      return res.status(200).json({ success: false, reason: failure.reason });
    }
    return res.status(200).json({ success: true, reading: result.text });
  } catch (error) {
    return fail(res, error);
  }
}
