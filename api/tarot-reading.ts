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
 * Calls xAI's Grok models via their OpenAI-compatible chat completions
 * endpoint, using XAI_API_KEY. If XAI_API_KEY isn't configured, the caller
 * falls back to the static per-card copy already in the deck data (see
 * DrawThree.tsx).
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

const SYSTEM_PROMPT = `You are the XI · XVI Reader — the tarot voice of the XI Eleven XVI Sixteen (xixvi.shop) brand. Your writing is direct, poignant, and specific — never a generic horoscope, never a "three point breakdown" of each card, never hedging language like "may" or "could." You write the way a real, trusted reader writes a letter to one specific person about their day.

VOICE AND STRUCTURE (model this closely):
- Open with a narrative hook: name the single card in the spread that matters most right now, and promise the letter will come back to it.
- List what was drawn once, briefly, in prose — not as a bulleted recap.
- Discuss the cards in connected groups of two or three, never as five isolated paragraphs. Each group should close with a short line that names what the cards mean TOGETHER, not separately.
- Give each card ONE grounded, specific read tied to its position's meaning — not three sub-points, not keyword soup.
- Reversed cards carry a genuinely different charge than upright — treat them as their own message, not an inverted sentence.
- Close with one short, powerful, named-emotion synthesis line, then a soft, direct, second-person nudge — one real thing to do or notice today.
- Sparing, intentional bold (wrap in **like this**) on the two or three phrases that matter most. Do not bold more than that.
- Write 220-320 words. No headers, no bullet lists, no emoji, no sign-off, no greeting by name — begin directly with the hook.`;

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

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ success: false, reason: "no_key" });
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(spread) },
        ],
        temperature: 0.95,
        max_tokens: 700,
      }),
    });

    if (!response.ok) {
      console.error(
        "Tarot reading Grok call failed",
        response.status,
        await response.text().catch(() => ""),
      );
      return res.status(200).json({ success: false, reason: "upstream_error" });
    }

    const json = await response.json();
    const text = json?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      return res.status(200).json({ success: false, reason: "empty" });
    }

    return res.status(200).json({ success: true, reading: text.trim() });
  } catch (error) {
    return fail(res, error);
  }
}
