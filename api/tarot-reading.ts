/**
 * XI · XVI Tarot Reading Engine.
 *
 * Turns a drawn 5-card spread (cards + positions + orientations) into a
 * single, freshly-written narrative reading — not a template, not a
 * recombination of stock paragraphs. Every request sends the model the
 * canonical upright/reversed meaning of each card and the meaning of the
 * position it landed in; the model is required to synthesize a specific,
 * connected letter the way a real reader would, in the style of a
 * genuinely personal tarot reading (narrative hook, cards discussed in
 * connected groups, one true synthesis line, soft close) — never a
 * generic daily-horoscope template.
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
- Write 220-320 words. No headers, no bullet lists, no emoji, no sign-off, no greeting by name — begin directly addressing the first card.`;

function buildUserPrompt(spread: SpreadCardInput[]): string {
  const lines = spread.map(
    (c, i) =>
      `${i + 1}. Position "${c.position}" (${c.positionMeaning}) → ${c.name}${c.reversed ? ", REVERSED" : ", upright"}. Canonical meaning: ${c.meaning} Keywords: ${c.keywords.join(", ")}.`,
  );
  return `Today's spread, in draw order:\n${lines.join("\n")}\n\nWrite today's reading now, following the voice and structure rules exactly.`;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { spread } = (req.body ?? {}) as { spread?: SpreadCardInput[] };
    if (!spread || !Array.isArray(spread) || spread.length === 0) {
      throw new HttpError(400, "A spread of drawn cards is required");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ success: false, reason: "no_key" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            { role: "user", parts: [{ text: buildUserPrompt(spread) }] },
          ],
          // Gemini's "thinking" tokens are billed against maxOutputTokens
          // before any visible text is produced, so this budget needs a
          // large headroom above the ~320-word (≈450 token) target output
          // or the response gets cut off mid-sentence.
          generationConfig: { temperature: 0.95, maxOutputTokens: 3000 },
        }),
      },
    );

    if (!response.ok) {
      console.error(
        "Tarot reading Gemini call failed",
        response.status,
        await response.text().catch(() => ""),
      );
      return res.status(200).json({ success: false, reason: "upstream_error" });
    }

    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string" || !text.trim()) {
      return res.status(200).json({ success: false, reason: "empty" });
    }

    return res.status(200).json({ success: true, reading: text.trim() });
  } catch (error) {
    return fail(res, error);
  }
}
