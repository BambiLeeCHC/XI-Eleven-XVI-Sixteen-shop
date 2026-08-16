/**
 * Static astrology reference content — what each planet/point governs, what
 * each sign's flavor is, what each house rules, and what each aspect type
 * means. Pure data, no AI dependency, so every placement always has an
 * explanation even if the AI narrative call fails or is skipped.
 *
 * Shared between the backend (feeding context into the Gemini personality-
 * profile prompt) and the frontend (per-placement/per-house explanation
 * text on the Chart page), same pattern as `numerology.ts`.
 */

export const BODY_MEANINGS: Record<string, string> = {
  Sun: "your core identity, ego and vitality — the theme you're here to shine at",
  Moon: "your emotional inner world, instincts and what makes you feel safe",
  Mercury: "how you think, talk and process information",
  Venus: "how you love, what you're drawn to, and your sense of beauty and value",
  Mars: "how you assert yourself, take action, and go after what you want",
  Jupiter: "where you expand, take risks, and find luck and meaning",
  Saturn: "where you meet structure and discipline, and earn hard-won mastery",
  Uranus: "where you break convention and need freedom to do things your own way",
  Neptune: "where you dream, blur boundaries, and reach for something transcendent",
  Pluto: "where you transform, confront power, and rebuild from the root up",
  Ascendant: "how you come across on first meeting — the mask you lead with",
  Midheaven: "your public path — career, reputation, the mark you're building",
};

export const SIGN_TRAITS: Record<string, string> = {
  Aries: "bold, direct, quick to act — thrives on challenge and momentum, impatient with hesitation",
  Taurus: "steady, sensual, values comfort and consistency — slow to move, nearly impossible to move once decided",
  Gemini: "curious, quick-witted, needs variety and conversation — adapts fast, gets bored faster",
  Cancer: "protective, intuitive, deeply feeling — needs emotional safety before it opens up",
  Leo: "warm, expressive, wants to be seen — generous and loyal once secure in its spotlight",
  Virgo: "precise, discerning, improves everything it touches — can be hardest on itself",
  Libra: "diplomatic, aesthetic, seeks balance and partnership — avoids conflict, sometimes at its own expense",
  Scorpio: "intense, private, all-or-nothing — drawn to what's hidden, unafraid of what's heavy",
  Sagittarius: "expansive, blunt, restless for meaning and movement — allergic to small talk and small plans",
  Capricorn: "ambitious, disciplined, plays the long game — earns everything the hard way and doesn't forget it",
  Aquarius: "independent, idea-driven, allergic to conformity — thinks in systems, futures and causes bigger than itself",
  Pisces: "porous, imaginative, absorbs the mood of a room — needs a real outlet for its depth or it drifts",
};

export const HOUSE_MEANINGS: Record<number, string> = {
  1: "Self & first impressions — how you enter a room, your body, your instinctive approach to life",
  2: "Money, possessions & self-worth — what you value and how you build security",
  3: "Communication & the everyday — siblings, short trips, how your mind moves",
  4: "Home & roots — family, upbringing, what 'safe' means to you",
  5: "Romance & creativity — pleasure, self-expression, what you make just because you want to",
  6: "Work & routine — health, daily habits, how you're useful",
  7: "Partnership — marriage, close alliances, one-on-one commitment",
  8: "Transformation — intimacy, shared resources, what you inherit and what you release",
  9: "Belief & expansion — travel, higher learning, the philosophy you live by",
  10: "Career & reputation — your public path, ambition, what you're known for",
  11: "Community — friendships, networks, the future you're building with others",
  12: "The unconscious — solitude, closure, what stays hidden until it can't",
};

export const ASPECT_MEANINGS: Record<string, string> = {
  conjunction: "fused together — these two forces act as one, for better or worse",
  sextile: "an easy opportunity — these forces cooperate when you make the effort",
  square: "friction that forces growth — tension between these forces you can't ignore",
  trine: "natural flow — these forces support each other with little effort",
  opposition: "a pull in two directions — these forces need to find balance, not a winner",
  quincunx: "an awkward adjustment — these forces don't speak the same language and need translating",
};

/** One-line explanation for a Sun/Moon/etc-in-Sign placement. */
export function explainPlacement(body: string, sign: string): string {
  const domain = BODY_MEANINGS[body] ?? "a part of who you are";
  const trait = SIGN_TRAITS[sign] ?? "";
  return `${body} rules ${domain}. In ${sign}, that shows up as ${trait}.`;
}

export function explainHouse(house: number): string {
  return HOUSE_MEANINGS[house] ?? "";
}

export function explainAspect(aspectKey: string): string {
  return ASPECT_MEANINGS[aspectKey.toLowerCase()] ?? "";
}
