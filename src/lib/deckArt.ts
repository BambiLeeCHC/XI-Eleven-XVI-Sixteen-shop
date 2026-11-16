/** Map card display names to True North print-deck image paths under /deck. */
const SLUG: Record<string, string> = {
  "The Fool": "00-the-fool",
  "The Magician": "01-the-magician",
  "The High Priestess": "02-the-high-priestess",
  "The Empress": "03-the-empress",
  "The Emperor": "04-the-emperor",
  "The Hierophant": "05-the-hierophant",
  "The Lovers": "06-the-lovers",
  "The Chariot": "07-the-chariot",
  Strength: "08-strength",
  "The Hermit": "09-the-hermit",
  "Wheel of Fortune": "10-wheel-of-fortune",
  Justice: "11-justice",
  "The Hanged Man": "12-the-hanged-man",
  Death: "13-death",
  Temperance: "14-temperance",
  "The Devil": "15-the-devil",
  "The Tower": "16-the-tower",
  "The Star": "17-the-star",
  "The Moon": "18-the-moon",
  "The Sun": "19-the-sun",
  Judgement: "20-judgement",
  "The World": "21-the-world",
};

export function deckCardImage(name: string): string | null {
  const key = name.replace(/\s*\(reversed\)\s*/i, "").trim();
  const slug = SLUG[key];
  if (!slug) return null;
  return `/deck/${slug}.jpg`;
}
