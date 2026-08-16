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

interface HouseMeaning {
  title: string;
  summary: string;
  detail: string;
  keywords: string[];
  question: string;
}

export const HOUSE_MEANINGS_FULL: Record<number, HouseMeaning> = {
  1: {
    title: "Self & first impressions",
    summary: "How you enter a room, your body, your instinctive approach to life.",
    detail:
      "The 1st House is the lens everyone else looks through before they know anything else about you — your energy on arrival, your reflexes under pressure, the version of you that shows up before you've said a word. It's less \"who you are deep down\" and more \"how you move through the world by default.\"",
    keywords: ["identity", "appearance", "instinct", "first impressions"],
    question: "What do people assume about you in the first thirty seconds — and is it accurate?",
  },
  2: {
    title: "Money, possessions & self-worth",
    summary: "What you value and how you build security.",
    detail:
      "The 2nd House governs everything you consider \"mine\" — money, belongings, talents, and the quieter question underneath all of it: do you believe you're worth investing in? How you earn, spend, save and value yourself all live here, tangled together.",
    keywords: ["money", "value", "possessions", "self-worth"],
    question: "Where does your sense of worth actually come from — what you have, or what you can do?",
  },
  3: {
    title: "Communication & the everyday",
    summary: "Siblings, short trips, how your mind moves.",
    detail:
      "The 3rd House is the mind in motion — how you process, talk, write, learn and get around town. It rules siblings and neighbors, the small daily exchanges that add up to a life, and the mental style you bring to everything else.",
    keywords: ["communication", "learning", "siblings", "curiosity"],
    question: "Is your mind a place you feel at home, or a place you're always trying to outrun?",
  },
  4: {
    title: "Home & roots",
    summary: "Family, upbringing, what 'safe' means to you.",
    detail:
      "The 4th House is the foundation — literally home, and figuratively everything that shaped your definition of safety: family, ancestry, the emotional climate you grew up in. It's the most private house in the chart, the one nobody sees unless you let them in.",
    keywords: ["home", "family", "roots", "safety"],
    question: "What did 'home' actually feel like growing up, and what are you still building toward — or away from?",
  },
  5: {
    title: "Romance & creativity",
    summary: "Pleasure, self-expression, what you make just because you want to.",
    detail:
      "The 5th House is where you play — romance, creativity, children, anything done purely for joy rather than obligation. It's the house of taking up space, being seen, and doing the thing simply because it feels good to do it.",
    keywords: ["romance", "creativity", "play", "self-expression"],
    question: "What's the last thing you made or did purely because you wanted to, with nothing to prove?",
  },
  6: {
    title: "Work & routine",
    summary: "Health, daily habits, how you're useful.",
    detail:
      "The 6th House governs the unglamorous machinery of a life — your body's maintenance, your habits, the work you do day in and day out. It's less about career prestige (that's the 10th) and more about the daily discipline that keeps everything else standing.",
    keywords: ["routine", "health", "service", "habits"],
    question: "Do your daily habits actually serve the life you say you want?",
  },
  7: {
    title: "Partnership",
    summary: "Marriage, close alliances, one-on-one commitment.",
    detail:
      "The 7th House is the mirror — every close one-on-one bond, romantic or otherwise, where you have to negotiate, compromise and see yourself reflected back through someone else. It often shows exactly what you're drawn to and exactly what you need to learn from it.",
    keywords: ["partnership", "marriage", "balance", "commitment"],
    question: "What do the people you commit to have in common — and what does that say about what you're really looking for?",
  },
  8: {
    title: "Transformation",
    summary: "Intimacy, shared resources, what you inherit and what you release.",
    detail:
      "The 8th House is the deep end — sex, death, other people's money, inheritance, and the kind of intimacy that requires losing control. It's uncomfortable by design; it's also where the most real growth in a chart tends to happen.",
    keywords: ["intimacy", "power", "transformation", "shared resources"],
    question: "What are you still holding onto that you already know you need to release?",
  },
  9: {
    title: "Belief & expansion",
    summary: "Travel, higher learning, the philosophy you live by.",
    detail:
      "The 9th House is the search for meaning — travel, higher education, religion or philosophy, anything that stretches your worldview past where you started. It's optimistic by nature, always reaching for the bigger picture.",
    keywords: ["philosophy", "travel", "higher learning", "meaning"],
    question: "What belief did you inherit that you've never actually questioned for yourself?",
  },
  10: {
    title: "Career & reputation",
    summary: "Your public path, ambition, what you're known for.",
    detail:
      "The 10th House is your public face — career, reputation, the mark you're building in the world and the legacy you're aiming at. It's about status and achievement, but more precisely: what you want to be known for by people who barely know you.",
    keywords: ["career", "ambition", "reputation", "legacy"],
    question: "If a stranger only knew your reputation, what would they assume you care about most?",
  },
  11: {
    title: "Community",
    summary: "Friendships, networks, the future you're building with others.",
    detail:
      "The 11th House is where you belong to something bigger than a one-on-one bond — friend groups, causes, communities, the collective future you're working toward. It's less personal than the 7th House and more about shared vision.",
    keywords: ["friendship", "community", "networks", "future vision"],
    question: "Which of your circles actually reflects who you're becoming, not just who you used to be?",
  },
  12: {
    title: "The unconscious",
    summary: "Solitude, closure, what stays hidden until it can't.",
    detail:
      "The 12th House is the most hidden part of the chart — solitude, the subconscious, endings, everything you keep even from yourself until it surfaces on its own timeline. It rules rest, spirituality, and the parts of a story that only make sense in hindsight.",
    keywords: ["solitude", "subconscious", "endings", "spirituality"],
    question: "What have you been avoiding looking at directly — and what would it cost you to finally look?",
  },
};

export const HOUSE_MEANINGS: Record<number, string> = Object.fromEntries(
  Object.entries(HOUSE_MEANINGS_FULL).map(([house, m]) => [Number(house), `${m.title} — ${m.summary}`]),
);

interface AspectMeaning {
  nature: string;
  feel: string;
}

export const ASPECT_MEANINGS_FULL: Record<string, AspectMeaning> = {
  conjunction: {
    nature: "fused together — these two forces act as one, for better or worse",
    feel:
      "You likely don't experience these as two separate energies at all — they blend into a single instinct, so strong it can be hard to see objectively from the inside.",
  },
  sextile: {
    nature: "an easy opportunity — these forces cooperate when you make the effort",
    feel:
      "This one won't demand your attention, which is exactly the risk — it's a genuine gift that's easy to leave unused if you never actively reach for it.",
  },
  square: {
    nature: "friction that forces growth — tension between these forces you can't ignore",
    feel:
      "Expect real internal tension here, the kind that shows up as a recurring pattern or conflict — uncomfortable, but usually the exact place where your growth is happening whether you notice it or not.",
  },
  trine: {
    nature: "natural flow — these forces support each other with little effort",
    feel:
      "This is talent that comes easily, almost too easily — the upside is real ease, the risk is taking it for granted and never developing it further.",
  },
  opposition: {
    nature: "a pull in two directions — these forces need to find balance, not a winner",
    feel:
      "You'll likely feel this as a push-pull, often projected onto other people or situations before you recognize both sides live inside you — the goal isn't picking one, it's integrating both.",
  },
  quincunx: {
    nature: "an awkward adjustment — these forces don't speak the same language and need translating",
    feel:
      "This aspect rarely announces itself clearly — it shows up as a nagging sense that two parts of you keep missing each other, requiring constant small adjustments rather than one clean resolution.",
  },
};

export const ASPECT_MEANINGS: Record<string, string> = Object.fromEntries(
  Object.entries(ASPECT_MEANINGS_FULL).map(([key, m]) => [key, m.nature]),
);

/** One-line explanation for a Sun/Moon/etc-in-Sign placement. */
export function explainPlacement(body: string, sign: string): string {
  const domain = BODY_MEANINGS[body] ?? "a part of who you are";
  const trait = SIGN_TRAITS[sign] ?? "";
  return `${body} rules ${domain}. In ${sign}, that shows up as ${trait}.`;
}

export function explainHouse(house: number): string {
  return HOUSE_MEANINGS[house] ?? "";
}

/** Full house write-up: detail paragraph + a reflective question, for the
 * expanded House row on the Chart page. */
export function explainHouseFull(house: number): HouseMeaning | null {
  return HOUSE_MEANINGS_FULL[house] ?? null;
}

export function explainAspect(aspectKey: string): string {
  return ASPECT_MEANINGS[aspectKey.toLowerCase()] ?? "";
}

/** Rich, pair-specific explanation of an aspect between two named bodies —
 * combines what each body governs with what the aspect type does to that
 * relationship, plus a second sentence on how it tends to actually feel. */
export function explainAspectPair(bodyA: string, bodyB: string, aspectKey: string): string {
  const key = aspectKey.toLowerCase();
  const meaning = ASPECT_MEANINGS_FULL[key];
  if (!meaning) return "";
  const domainA = BODY_MEANINGS[bodyA] ?? "";
  const domainB = BODY_MEANINGS[bodyB] ?? "";
  const intro = domainA && domainB
    ? `${bodyA} (${domainA}) and ${bodyB} (${domainB}) are ${meaning.nature}.`
    : `${bodyA} and ${bodyB} are ${meaning.nature}.`;
  return `${intro} ${meaning.feel}`;
}
