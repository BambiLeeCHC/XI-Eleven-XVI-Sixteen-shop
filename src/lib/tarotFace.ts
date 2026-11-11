/**
 * True North by XI XVI — the branded 78-card deck.
 * Files live in public/tarot. Majors keep their Rider-Waite numbers
 * (08 Strength, 11 Justice). Minors are `{rank}-of-{suit}`.
 */

const MAJOR_STEMS = [
  "00-the-fool",
  "01-the-magician",
  "02-the-high-priestess",
  "03-the-empress",
  "04-the-emperor",
  "05-the-hierophant",
  "06-the-lovers",
  "07-the-chariot",
  "08-strength",
  "09-the-hermit",
  "10-wheel-of-fortune",
  "11-justice",
  "12-the-hanged-man",
  "13-death",
  "14-temperance",
  "15-the-devil",
  "16-the-tower",
  "17-the-star",
  "18-the-moon",
  "19-the-sun",
  "20-judgement",
  "21-the-world",
] as const;

function slug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const BY_SLUG = new Map<string, string>();
for (const stem of MAJOR_STEMS) {
  BY_SLUG.set(stem.replace(/^\d+-/, ""), stem);
}

export const TAROT_FACE_WIDTH = 904;
export const TAROT_FACE_HEIGHT = 1548;

export function tarotFaceFile(card: { number: number; name: string }): string | null {
  if (card.number >= 0 && card.number <= 21) return MAJOR_STEMS[card.number];
  const stem = slug(card.name);
  return stem || null;
}

export function tarotFaceFileFromName(name: string): string | null {
  const key = slug(name);
  if (!key) return null;
  return BY_SLUG.get(key) ?? BY_SLUG.get(key.replace(/^the-/, "")) ?? key;
}

export function tarotFaceSources(file: string) {
  return {
    full: `/tarot/${file}.webp`,
    thumb: `/tarot/w480/${file}.webp`,
  };
}

/** Heirloom backs. Index 0, 1, 2 repeat for every card in a spread. */
export const TAROT_BACKS = [
  { id: "x1", name: "Celestial Baroque", file: "x1-celestial-baroque", width: 426, height: 781 },
  { id: "x2", name: "Pearl Filigree", file: "x2-pearl-filigree", width: 428, height: 781 },
  { id: "x3", name: "Stained Glass", file: "x3-stained-glass", width: 427, height: 781 },
] as const;

export function tarotBackForIndex(index: number) {
  const count = TAROT_BACKS.length;
  const slot = ((index % count) + count) % count;
  return TAROT_BACKS[slot];
}
