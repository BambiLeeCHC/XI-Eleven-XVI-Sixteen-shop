/** Map card display names to True North by XI XVI print-deck image paths under /deck. */
const SLUG: Record<string, string> = {
  // Major Arcana
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

  // Wands
  "Ace of Wands": "ace-of-wands",
  "Two of Wands": "two-of-wands",
  "Three of Wands": "three-of-wands",
  "Four of Wands": "four-of-wands",
  "Five of Wands": "five-of-wands",
  "Six of Wands": "six-of-wands",
  "Seven of Wands": "seven-of-wands",
  "Eight of Wands": "eight-of-wands",
  "Nine of Wands": "nine-of-wands",
  "Ten of Wands": "ten-of-wands",
  "Page of Wands": "page-of-wands",
  "Knight of Wands": "knight-of-wands",
  "Queen of Wands": "queen-of-wands",
  "King of Wands": "king-of-wands",

  // Cups
  "Ace of Cups": "ace-of-cups",
  "Two of Cups": "two-of-cups",
  "Three of Cups": "three-of-cups",
  "Four of Cups": "four-of-cups",
  "Five of Cups": "five-of-cups",
  "Six of Cups": "six-of-cups",
  "Seven of Cups": "seven-of-cups",
  "Eight of Cups": "eight-of-cups",
  "Nine of Cups": "nine-of-cups",
  "Ten of Cups": "ten-of-cups",
  "Page of Cups": "page-of-cups",
  "Knight of Cups": "knight-of-cups",
  "Queen of Cups": "queen-of-cups",
  "King of Cups": "king-of-cups",

  // Swords
  "Ace of Swords": "ace-of-swords",
  "Two of Swords": "two-of-swords",
  "Three of Swords": "three-of-swords",
  "Four of Swords": "four-of-swords",
  "Five of Swords": "five-of-swords",
  "Six of Swords": "six-of-swords",
  "Seven of Swords": "seven-of-swords",
  "Eight of Swords": "eight-of-swords",
  "Nine of Swords": "nine-of-swords",
  "Ten of Swords": "ten-of-swords",
  "Page of Swords": "page-of-swords",
  "Knight of Swords": "knight-of-swords",
  "Queen of Swords": "queen-of-swords",
  "King of Swords": "king-of-swords",

  // Pentacles
  "Ace of Pentacles": "ace-of-pentacles",
  "Two of Pentacles": "two-of-pentacles",
  "Three of Pentacles": "three-of-pentacles",
  "Four of Pentacles": "four-of-pentacles",
  "Five of Pentacles": "five-of-pentacles",
  "Six of Pentacles": "six-of-pentacles",
  "Seven of Pentacles": "seven-of-pentacles",
  "Eight of Pentacles": "eight-of-pentacles",
  "Nine of Pentacles": "nine-of-pentacles",
  "Ten of Pentacles": "ten-of-pentacles",
  "Page of Pentacles": "page-of-pentacles",
  "Knight of Pentacles": "knight-of-pentacles",
  "Queen of Pentacles": "queen-of-pentacles",
  "King of Pentacles": "king-of-pentacles",
};

export function deckCardImage(name: string): string | null {
  const key = name.replace(/\s*\(reversed\)\s*/i, "").trim();
  const slug = SLUG[key];
  if (!slug) return null;
  return `/deck/${slug}.jpg`;
}

/** Heirloom card-back image paths (Celestial Baroque, Pearl Filigree, Stained Glass). */
export const HEIRLOOM_BACK_PATHS = {
  celestial: "/deck/backs/celestial-baroque.png",
  pearl: "/deck/backs/pearl-filigree.png",
  stained: "/deck/backs/stained-glass.png",
} as const;
