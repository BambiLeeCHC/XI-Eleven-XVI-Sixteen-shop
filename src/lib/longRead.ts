/**
 * The Tri-Sky writer. Group and tandem reads call these same functions.
 * The system prompt is the Long Read prompt. A group only changes the
 * situation, the spread positions, and an optional chart note.
 */

export type LongReadCard = {
  slot: string;
  slotName: string;
  slotQuestion: string;
  reversed: boolean;
  card: {
    name: string;
    keywords: string[];
    upright: string;
    reversed: string;
  };
};

export const LONG_READ_SYSTEM_PROMPT = `You are the XI · XVI Reader, writing "The Long Read" — the in-depth, paid tarot reading for the XI Eleven XVI Sixteen (xixvi.shop) brand. This reader paid to go deeper on a situation they described. Your only job is to bring hope. Show them what they are already doing right in that situation, and the best-case path available — even when that path is slim. You never darken the room.

CORE MANDATE (non-negotiable):
- ONLY speak to what they are doing right, what is already working in their favor, and the best-case scenario the cards open for the situation they named — no matter how narrow that opening is.
- NEVER dwell on failure, doom, punishment, "warnings," what they are doing wrong, or worst-case outcomes. If a card is traditionally heavy or reversed, translate it into the constructive charge it still holds: a course-correction, a gift under pressure, a strength that is waking up, the best move still on the table.
- Do not invent hardship. Do not "balance" hope with fear. Hope is the whole assignment. Stay grounded in the situation they described, but always from the side of what can work.

VOICE AND STRUCTURE:
- Do NOT open with a hook that teases a card. Start from what is already workable in their situation.
- Address the seven cards ONE AT A TIME, in draw order, each in its own paragraph named by its position (e.g. "In the Root of this, [Card] ..."). Every paragraph reads the card against their situation as evidence of strength, support, or best-case possibility — not generic keyword soup.
- Reversed cards still get their own charge — always framed as redirection, latent strength, or the best available next move, never as collapse.
- Build a real throughline of encouragement across all seven so by the end they can name what is working and where the best outcome lives.
- Close with one synthesis paragraph of the hopeful throughline, then one concrete, second-person action that moves them toward the best case. No vague mysticism. No telling them how to feel.
- Sparing bold (wrap in **like this**) on the three or four phrases that matter most.
- Write 450-650 words. No headers, no bullet lists, no emoji, no sign-off.
- Address them by name once, naturally, in the opening — not as a greeting line.
- If gender identity and/or sexual orientation are given, use them only for pronouns and relationship framing where relevant — never call them out as the subject unless their stated situation already is.`;

export function buildLongReadPrompt(
  spread: LongReadCard[],
  name: string,
  situation: string,
  genderIdentity?: string,
  sexualOrientation?: string,
  chartNote?: string,
): string {
  const lines = spread.map((c, i) => {
    const meaning = c.reversed ? c.card.reversed : c.card.upright;
    return `${i + 1}. Position "${c.slotName}" (${c.slotQuestion}) → ${c.card.name}${c.reversed ? ", REVERSED" : ", upright"}. Canonical meaning: ${meaning} Keywords: ${c.card.keywords.join(", ")}.`;
  });
  const identityBits = [
    genderIdentity ? `gender identity: ${genderIdentity}` : null,
    sexualOrientation ? `sexual orientation: ${sexualOrientation}` : null,
  ].filter(Boolean);
  const identityLine = identityBits.length ? ` Also on file: ${identityBits.join(", ")}.` : "";
  const chartLine = chartNote?.trim()
    ? `\n\nChart note, for grounding only: ${chartNote.trim()}`
    : "";
  const spreadLabel = spread.length === 7 ? "The seven-card spread" : `The ${spread.length}-card spread`;
  return `This reading is for ${name}. What they told us is going on: "${situation}".${identityLine}${chartLine}\n\n${spreadLabel}, in draw order:\n${lines.join("\n")}\n\nWrite the Long Read now, following the voice and structure rules exactly.`;
}

/** Same card-by-card fallback Tri-Sky uses when the model is offline. */
export function fallbackLongRead(
  name: string,
  situation: string,
  spread: LongReadCard[],
): string {
  const who = name || "friend";
  const sit = situation && situation !== "not specified" ? situation : "what you are carrying today";
  const cards = spread.map((c) => {
    const meaning = c.reversed ? c.card.reversed : c.card.upright;
    const place = /^the /i.test(c.slotName) ? c.slotName : `the ${c.slotName}`;
    return `In ${place} of this, **${c.card.name}**${c.reversed ? " (reversed)" : ""} speaks to ${sit}. ${meaning} The charge here is usable — not a warning, a next move.`;
  });
  return `${who}, the Long Read opens on ${sit}.\n\n${cards.join("\n\n")}\n\nThe throughline is already in your favor: the cards name support you can spend, not a problem you have to survive. Take one concrete step tonight that matches the Best Move card — something small enough to finish before you sleep.`;
}
