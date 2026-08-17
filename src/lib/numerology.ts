/**
 * Numerology — pure math from a name + birth date. No external service,
 * no API key: every number here is a deterministic reduction of digits or
 * letters, computed the same way every time for the same inputs.
 *
 * This is the paywalled half of the natal-chart feature (the chart itself
 * is free at registration; numerology is the add-on).
 */

/** Digit-sum reduction used across the brand (11 and 22 kept as masters).
 * Duplicated from ritual.ts (rather than imported) so this module has no
 * dependency on browser-only code — it's used from both the client and
 * Vercel serverless functions. */
function reduce(n: number): number {
  let v = Math.abs(Math.trunc(n));
  while (v > 22) {
    v = String(v)
      .split("")
      .reduce((a, c) => a + Number(c), 0);
  }
  if (v === 11 || v === 22) return v;
  while (v > 9) {
    v = String(v)
      .split("")
      .reduce((a, c) => a + Number(c), 0);
  }
  return v;
}

/** Pythagorean letter → number map, A=1 ... I=9, repeating. */
const LETTER_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function sumLetters(name: string, filter: (ch: string) => boolean): number {
  let total = 0;
  for (const raw of name.toLowerCase()) {
    if (!/[a-z]/.test(raw)) continue;
    if (!filter(raw)) continue;
    total += LETTER_VALUES[raw] ?? 0;
  }
  return total;
}

export interface NumerologyProfile {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  birthday: number;
  personalYear: number;
}

/** The core number: sum of the full birth date, reduced (11/22 kept as masters). */
export function lifePathNumber(birthDate: string): number {
  const [y, m, d] = birthDate.split("-").map(Number);
  const digits = `${d}${m}${y}`.split("").reduce((a, c) => a + Number(c), 0);
  return reduce(digits);
}

/** All letters of the full name — the "destiny" number. */
export function expressionNumber(fullName: string): number {
  return reduce(sumLetters(fullName, () => true));
}

/** Vowels only — the heart's-desire / soul urge number. */
export function soulUrgeNumber(fullName: string): number {
  return reduce(sumLetters(fullName, (ch) => VOWELS.has(ch)));
}

/** Consonants only — the personality number (how others perceive you). */
export function personalityNumber(fullName: string): number {
  return reduce(sumLetters(fullName, (ch) => !VOWELS.has(ch)));
}

/** Day-of-month alone, reduced — a minor but standard numerology figure. */
export function birthdayNumber(birthDate: string): number {
  const [, , d] = birthDate.split("-").map(Number);
  return reduce(d);
}

/** This calendar year's personal-year number: birth month + day + current year. */
export function personalYearNumber(birthDate: string, asOf: Date = new Date()): number {
  const [, m, d] = birthDate.split("-").map(Number);
  const digits = `${d}${m}${asOf.getFullYear()}`.split("").reduce((a, c) => a + Number(c), 0);
  return reduce(digits);
}

export function fullNumerologyProfile(fullName: string, birthDate: string): NumerologyProfile {
  return {
    lifePath: lifePathNumber(birthDate),
    expression: expressionNumber(fullName),
    soulUrge: soulUrgeNumber(fullName),
    personality: personalityNumber(fullName),
    birthday: birthdayNumber(birthDate),
    personalYear: personalYearNumber(birthDate),
  };
}

/** Plain-language "how we got this" line per category — shown above the
 * number itself so the math isn't a black box before the reading. */
export const NUMEROLOGY_CALC_EXPLAIN: Record<string, string> = {
  lifePath: "Every digit of your full birth date, added together and reduced to one number.",
  expression: "Every letter of your full birth name, converted to a number and reduced.",
  soulUrge: "Just the vowels in your full name, converted to numbers and reduced.",
  personality: "Just the consonants in your full name, converted to numbers and reduced.",
  birthday: "The day of the month you were born, reduced on its own.",
  personalYear: "Your birth month and day, added to the current year and reduced.",
};

/** Short, brand-voiced one-liners per number — used as the base copy the
 * numerology endpoint's AI narrative is written against (kept factual/plain
 * here; the endpoint adds the personalized narrative on top). */
export const NUMBER_MEANINGS: Record<number, string> = {
  1: "Leading, starting, standing alone before anyone follows.",
  2: "Partnership, balance, the work that happens between two people.",
  3: "Expression, creativity, saying the thing instead of sitting on it.",
  4: "Structure, discipline, building something that actually holds weight.",
  5: "Change, freedom, refusing to stay somewhere that's stopped moving.",
  6: "Responsibility, care, the ones who hold a household or a room together.",
  7: "Depth, analysis, needing to understand a thing before trusting it.",
  8: "Power, ambition, the number of real-world results.",
  9: "Completion, compassion, closing one chapter so the next can start clean.",
  11: "A master number — heightened intuition, the one who senses it before it's said.",
  22: "A master number — the builder, turning a big idea into something real.",
};
