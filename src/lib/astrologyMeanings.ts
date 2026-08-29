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

/** Short noun-phrase per body, for direct aspect sentences ("Mercury's
 * communication grinds against Jupiter's growth") instead of the abstract
 * "these forces" phrasing. */
export const BODY_SHORT: Record<string, string> = {
  Sun: "identity",
  Moon: "emotions",
  Mercury: "communication",
  Venus: "love & values",
  Mars: "drive",
  Jupiter: "growth",
  Saturn: "discipline",
  Uranus: "individuality",
  Neptune: "imagination",
  Pluto: "transformation",
  Ascendant: "first impression",
  Midheaven: "public path",
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
    title: "Self and first impressions",
    summary: "how you show up",
    detail: "House 1 is how you show up — first impression, body language, and the way you enter a situation.",
    keywords: ["show up", "first impression", "body"],
    question: "",
  },
  2: {
    title: "Money and value",
    summary: "money",
    detail: "House 2 is money: how you earn it, spend it, save it, and decide what is worth paying for.",
    keywords: ["money", "earning", "value"],
    question: "",
  },
  3: {
    title: "Thinking and communication",
    summary: "thinking and talk",
    detail: "House 3 is how you think, talk, text, learn, and handle ordinary day-to-day logistics.",
    keywords: ["thinking", "talk", "logistics"],
    question: "",
  },
  4: {
    title: "Home and family",
    summary: "home and family",
    detail: "House 4 is home and family — your private base and what it takes for you to feel settled.",
    keywords: ["home", "family", "settled"],
    question: "",
  },
  5: {
    title: "Pleasure and expression",
    summary: "fun and expression",
    detail: "House 5 is fun, creativity, romance, and what you do because you want to, not because you have to.",
    keywords: ["fun", "creativity", "romance"],
    question: "",
  },
  6: {
    title: "Work, health, and routine",
    summary: "work, health, routine",
    detail: "House 6 is work, health, and daily routine — the habits that keep your body and schedule working.",
    keywords: ["work", "health", "routine"],
    question: "",
  },
  7: {
    title: "Partnerships",
    summary: "partnerships",
    detail: "House 7 is one-to-one relationships — partners, close collaborators, and how you act when it is just you and one other person.",
    keywords: ["partners", "one-to-one", "collaboration"],
    question: "",
  },
  8: {
    title: "Shared resources and deep change",
    summary: "shared money and deep change",
    detail: "House 8 is shared money, debt, inheritance, deep trust, intimacy, and changes you do not control alone.",
    keywords: ["shared money", "trust", "change"],
    question: "",
  },
  9: {
    title: "Belief, study, and horizons",
    summary: "beliefs and horizons",
    detail: "House 9 is the bigger frame: beliefs, study, travel, and the ideas that steer major choices.",
    keywords: ["beliefs", "study", "travel"],
    question: "",
  },
  10: {
    title: "Career and reputation",
    summary: "career and reputation",
    detail: "House 10 is career and reputation — the public work you build and how the outside world reads you.",
    keywords: ["career", "reputation", "public work"],
    question: "",
  },
  11: {
    title: "Friends and groups",
    summary: "friends and groups",
    detail: "House 11 is friends, groups, and networks — the people you join for shared aims.",
    keywords: ["friends", "groups", "networks"],
    question: "",
  },
  12: {
    title: "Solitude and inner life",
    summary: "solitude and rest",
    detail: "House 12 is solitude, rest, and private processing — what you deal with when no one is watching.",
    keywords: ["solitude", "rest", "inner life"],
    question: "",
  },
};

export const HOUSE_MEANINGS: Record<number, string> = Object.fromEntries(
  Object.entries(HOUSE_MEANINGS_FULL).map(([house, m]) => [Number(house), `${m.title} — ${m.summary}`]),
);

/** 144 unique sign-on-cusp explanations — restored from the
 * pre-IMPACT production bundle (dirty deploy a368484). Each
 * pairing is written, not assembled from a trait mashup. */
const SIGN_IN_HOUSE: Record<number, Record<string, string>> = {
  1: {
    Aries: "With Aries here, you walk into rooms with heat and initiative — when life stalls, that same force is how you start again without waiting for permission.",
    Taurus: "With Taurus here, you show up solid and unhurried — people feel your stability, and that steadiness is a real form of strength when everything else is loud.",
    Gemini: "With Gemini here, you meet the world with questions and quick wit — your mind keeps doors open, which is useful when one path closes.",
    Cancer: "With Cancer here, you lead with care and protectiveness — your softness is not weakness; it is how you make space safe for yourself and others.",
    Leo: "With Leo here, you enter with presence and heart — being seen is not vanity for you; it is how you restore confidence when you have been diminished.",
    Virgo: "With Virgo here, you present as precise and useful — the way you refine yourself is how you rebuild dignity after chaos.",
    Libra: "With Libra here, you arrive balanced and aware of the room — your sense of fairness is a quiet power when conflict is everywhere.",
    Scorpio: "With Scorpio here, you show up intense and selective — you do not dilute yourself, and that focus is how you survive hard seasons intact.",
    Sagittarius: "With Sagittarius here, you enter with candor and range — honesty and a wider view pull you forward when small problems try to own you.",
    Capricorn: "With Capricorn here, you present as composed and capable — structure is how you carry yourself when motivation alone is not enough.",
    Aquarius: "With Aquarius here, you show up original and unborrowed — doing it your way is how you stay whole.",
    Pisces: "With Pisces here, you enter soft and perceptive — your sensitivity reads the room, and that same softness is how you stay human under pressure.",
  },
  2: {
    Aries: "With Aries here, you treat money as fuel for action — aim that heat so it builds something, not only burns.",
    Taurus: "With Taurus here, you earn and hold with patience — slow accumulation is a legitimate kind of peace.",
    Gemini: "With Gemini here, money moves through ideas and exchange — flexible plans keep you from feeling trapped by one number.",
    Cancer: "With Cancer here, money is tied to safety and care — that instinct can become steady provision, not only worry.",
    Leo: "With Leo here, money links to pride and generosity — investing in what reflects who you are restores self-respect.",
    Virgo: "With Virgo here, you track, budget, and cut waste — order with money reduces anxiety and proves you can handle the practical layer.",
    Libra: "With Libra here, money decisions weigh fairness — balanced exchanges can create trust instead of scorekeeping.",
    Scorpio: "With Scorpio here, money is power and privacy — financial clarity is how you stop feeling at someone else's mercy.",
    Sagittarius: "With Sagittarius here, money should fund growth and freedom — spending toward meaning keeps life from shrinking to bills alone.",
    Capricorn: "With Capricorn here, you build money like a structure — long-term plans and earned gains are a form of self-respect.",
    Aquarius: "With Aquarius here, money follows principles and unconventional paths — inventing a method that fits you can free you.",
    Pisces: "With Pisces here, spending follows what moves you — pair heart with a simple plan so need does not wipe you out.",
  },
  3: {
    Aries: "With Aries here, you speak fast and direct — clear speech cuts through confusion when your mind is overloaded.",
    Taurus: "With Taurus here, you think and talk slowly and concretely — steady communication builds trust when news keeps changing.",
    Gemini: "With Gemini here, your mind stays curious — learning on the move keeps despair from hardening.",
    Cancer: "With Cancer here, you communicate from feeling — honest emotional language is how you stop carrying everything alone.",
    Leo: "With Leo here, you want your voice to land — saying what matters out loud rebuilds confidence after silence has cost you.",
    Virgo: "With Virgo here, you think in details — precision in how you speak and plan is how you regain control of the small things.",
    Libra: "With Libra here, you talk to find balance — fair conversation can reopen doors that argument slammed shut.",
    Scorpio: "With Scorpio here, you say less and mean more — depth finds truth when surface talk feels useless.",
    Sagittarius: "With Sagittarius here, you think big and speak bluntly — a wider story can pull you out of a narrow bad week.",
    Capricorn: "With Capricorn here, communication is purposeful — speaking to get something done saves energy when chatter wastes it.",
    Aquarius: "With Aquarius here, your mind runs on original angles — reframing the problem is often how you find a way through.",
    Pisces: "With Pisces here, you communicate in feeling — naming what is hard still counts as honesty, and it can release pressure.",
  },
  4: {
    Aries: "With Aries here, home is somewhere you can act freely — a base that lets you start over is how you recover when the outside world drains you.",
    Taurus: "With Taurus here, home must feel solid and comfortable — a stable private space is how your nervous system resets.",
    Gemini: "With Gemini here, home needs conversation and mental air — a place where ideas move keeps loneliness from turning heavy.",
    Cancer: "With Cancer here, home and family are the core — protecting your private life is how you stay intact.",
    Leo: "With Leo here, home should feel warm and affirming — a private space where you are valued restores pride the public world can strip.",
    Virgo: "With Virgo here, home works when it is orderly — small repairs and clean systems are practical care for yourself.",
    Libra: "With Libra here, home needs harmony — a peaceful base is how you stop bringing every conflict to bed with you.",
    Scorpio: "With Scorpio here, home is private and deeply held — a sanctuary is how you process intensity without performing strength.",
    Sagittarius: "With Sagittarius here, home should not feel like a cage — room to grow and return keeps family from becoming a trap.",
    Capricorn: "With Capricorn here, home is long-term foundation — building a reliable base is how you give future-you something solid.",
    Aquarius: "With Aquarius here, home may be unconventional — a setup that fits your real life is how you stop resenting where you live.",
    Pisces: "With Pisces here, home is emotional atmosphere — softness and rest at home are how you heal after hard days.",
  },
  5: {
    Aries: "With Aries here, play starts with bold moves — allowing joy without a productivity excuse is how you remember you are alive.",
    Taurus: "With Taurus here, pleasure is sensory and steady — real enjoyment rebuilds you when life has been only duty.",
    Gemini: "With Gemini here, fun is variety and light curiosity — playfulness is medicine when everything is too serious.",
    Cancer: "With Cancer here, creativity and romance need emotional safety — gentle play is how you open again after hurt.",
    Leo: "With Leo here, expression wants heart — creating or loving out loud is how you recover from feeling invisible.",
    Virgo: "With Virgo here, craft refines what you make — small creative wins still rebuild momentum.",
    Libra: "With Libra here, pleasure is shared and aesthetic — beauty and mutual enjoyment remind you life is not only negotiation.",
    Scorpio: "With Scorpio here, play and desire go deep — intensity in what you love is how you feel fully present again.",
    Sagittarius: "With Sagittarius here, fun expands the map — adventure and humor pull you out of a closed loop of worry.",
    Capricorn: "With Capricorn here, creativity can be serious craft — building something lasting for joy still feeds you.",
    Aquarius: "With Aquarius here, expression is experimental — making something true on your terms is how you stay interested in your own life.",
    Pisces: "With Pisces here, art and imagination blur with feeling — allowing beauty is how you soften after numbness.",
  },
  6: {
    Aries: "With Aries here, you attack tasks and health goals head-on — one clear habit at a time turns stress into motion.",
    Taurus: "With Taurus here, routines stick when they feel good in the body — consistency is how you recover.",
    Gemini: "With Gemini here, variety keeps work and health from boring you into quitting — small switches keep you showing up.",
    Cancer: "With Cancer here, care for body and schedule is emotional — tending yourself is how you stay available for what matters.",
    Leo: "With Leo here, work and health improve when pride is involved — routines that make you feel strong are easier to keep than pure duty.",
    Virgo: "With Virgo here, you refine work, health, and routine in detail — fixing what is slightly off is how you prevent collapse and regain quiet confidence.",
    Libra: "With Libra here, balance in workload and wellness matters — refusing chronic overextension is self-respect.",
    Scorpio: "With Scorpio here, you transform habits when something has to change for real — deep commitment to a healthier pattern is possible once you decide.",
    Sagittarius: "With Sagittarius here, routines need meaning — tying habits to a larger why keeps discipline from feeling like punishment.",
    Capricorn: "With Capricorn here, you build systems that last — reliable structure around work and health is how you outlast a hard season.",
    Aquarius: "With Aquarius here, you design your own method — a plan that fits you beats forced conformity.",
    Pisces: "With Pisces here, routines need recovery built in — rest is part of the system, not a failure of will.",
  },
  7: {
    Aries: "With Aries here, partnerships move when someone leads — honest initiative is how you stop waiting for the other person to save the dynamic.",
    Taurus: "With Taurus here, you want loyal, steady partnership — reliability is a strength, not boredom.",
    Gemini: "With Gemini here, partners need talk and mental connection — curiosity keeps the bond from going stale under stress.",
    Cancer: "With Cancer here, partnership is care and mutual protection — asking for emotional safety makes the bond a resource, not another drain.",
    Leo: "With Leo here, you give warmth and want recognition back — mutual appreciation keeps both people proud of choosing each other.",
    Virgo: "With Virgo here, you improve the relationship through practical care — small reliable acts rebuild trust faster than grand speeches.",
    Libra: "With Libra here, partnership is the point — fairness and real listening are how you repair after imbalance.",
    Scorpio: "With Scorpio here, bonds go deep or not at all — intensity and honesty forge alliances that hold when shallow ones fail.",
    Sagittarius: "With Sagittarius here, partners need freedom and truth — space plus candor keeps commitment from feeling like a sentence.",
    Capricorn: "With Capricorn here, partnership is a long project — showing up consistently is how respect accumulates.",
    Aquarius: "With Aquarius here, you need friendship inside the bond — equality keeps love from becoming control.",
    Pisces: "With Pisces here, partnership is empathy — compassion is powerful when paired with boundaries so you do not disappear.",
  },
  8: {
    Aries: "With Aries here, you face shared risk and hard change directly — naming the problem out loud is often the first step out of a stuck crisis.",
    Taurus: "With Taurus here, you want solid ground in joint finances and trust — slow security after upheaval is a valid goal.",
    Gemini: "With Gemini here, you process deep change through information — understanding a crisis reduces its power over you.",
    Cancer: "With Cancer here, shared vulnerability cuts deep — allowing support in the hard places is how intimacy becomes strength.",
    Leo: "With Leo here, pride and heart show up in recovery — reclaiming dignity after loss is part of the work, and you are allowed that.",
    Virgo: "With Virgo here, you handle shared money and repair through careful analysis — cleaning up the details makes chaos manageable.",
    Libra: "With Libra here, fairness in shared power matters — renegotiating terms can restore balance after one-sided strain.",
    Scorpio: "With Scorpio here, you know depth and transformation — facing what others avoid is real power when aimed at healing.",
    Sagittarius: "With Sagittarius here, crisis needs a larger meaning — a true story about what this change is for can keep you moving.",
    Capricorn: "With Capricorn here, you take responsibility in the heavy material of life — structured recovery is how you climb out.",
    Aquarius: "With Aquarius here, you redesign the terms — a new system around shared resources can free you from a toxic old pattern.",
    Pisces: "With Pisces here, deep change moves through feeling — allowing grief and then soft rebuilding is how a hard cycle completes.",
  },
  9: {
    Aries: "With Aries here, beliefs expand through action — trying the bigger path is how conviction stops being only talk.",
    Taurus: "With Taurus here, meaning grows through lived experience — a philosophy you can stand on day after day beats abstract inspiration.",
    Gemini: "With Gemini here, study and belief stay open — learning keeps hope intelligent; you are allowed to update what you think is true.",
    Cancer: "With Cancer here, faith is personal — a belief that protects your inner life can be a real anchor in public chaos.",
    Leo: "With Leo here, meaning wants to be lived with pride — standing for something visible restores purpose when days feel empty.",
    Virgo: "With Virgo here, you refine belief through careful study — a practical truth you can apply is stronger than a vague ideal.",
    Libra: "With Libra here, horizons expand through dialogue — other perspectives can reopen a mind that stress narrowed.",
    Scorpio: "With Scorpio here, belief goes through underworlds and comes back deeper — hard-won meaning is harder to shake than easy optimism.",
    Sagittarius: "With Sagittarius here, this is home territory — growth, travel, and honest philosophy are how you refuse a small life.",
    Capricorn: "With Capricorn here, wisdom is earned and applied — learning that changes how you act is real hope, not slogans.",
    Aquarius: "With Aquarius here, you rethink the map — new frameworks can pull you out of a worldview that was quietly hurting you.",
    Pisces: "With Pisces here, meaning is felt — connection to something larger than the problem can steady you when logic alone is not enough.",
  },
  10: {
    Aries: "With Aries here, career moves when you initiate — visible action toward the role you want is how reputation starts to match ambition.",
    Taurus: "With Taurus here, public work builds slowly and solidly — lasting status from reliability is a respectable path.",
    Gemini: "With Gemini here, career thrives on communication and range — multiple skills keep you employable when one door closes.",
    Cancer: "With Cancer here, reputation ties to care — work that shelters others can also become a platform for your own security.",
    Leo: "With Leo here, you want to be known for something with heart — recognition of real contribution repairs worth after private struggle.",
    Virgo: "With Virgo here, career advances through competence — being excellent at the useful thing is a quiet form of power.",
    Libra: "With Libra here, public role involves partnership — alliances and fair dealing build a name that lasts.",
    Scorpio: "With Scorpio here, career can involve influence and deep change — intensity aimed at meaningful work turns private fire into public impact.",
    Sagittarius: "With Sagittarius here, vocation needs a mission — work tied to a bigger aim keeps daily grind from eating your spirit.",
    Capricorn: "With Capricorn here, this is natural ground — patient climb and earned respect are how you build a life you can stand behind.",
    Aquarius: "With Aquarius here, career may look unconventional — a path that fits your principles can succeed without the standard ladder.",
    Pisces: "With Pisces here, public work often channels care or imagination — contribution that helps or creates can give purpose when status alone feels empty.",
  },
  11: {
    Aries: "With Aries here, you lead or spark the group — initiating community is how you stop waiting to be invited into belonging.",
    Taurus: "With Taurus here, friendships are loyal and lasting — a few solid people beat a crowd, and that is enough to lean on.",
    Gemini: "With Gemini here, networks run on conversation — light, real contact keeps isolation from becoming permanent.",
    Cancer: "With Cancer here, your circle is family-like — mutual care in friendship is a resource you are allowed to need.",
    Leo: "With Leo here, groups thrive on generosity and recognition — being a warm center rebuilds social confidence.",
    Virgo: "With Virgo here, you help the group in practical ways — useful friendship creates bonds stronger than performance alone.",
    Libra: "With Libra here, peers and allies matter — collaborative circles multiply what one person cannot hold alone.",
    Scorpio: "With Scorpio here, friendships are few and deep — intense loyalty in a small network is real support when life gets severe.",
    Sagittarius: "With Sagittarius here, groups should expand your world — people who share growth and humor pull you forward.",
    Capricorn: "With Capricorn here, networks can be strategic and mature — allies built on respect help long-term aims.",
    Aquarius: "With Aquarius here, community and causes are native — finding your people around a shared future turns loneliness into momentum.",
    Pisces: "With Pisces here, friendships are empathetic — gentle community can hold you when you cannot hold everything yourself.",
  },
  12: {
    Aries: "With Aries here, solitude still wants an outlet for drive — private action and honest rest keep burnout from becoming identity.",
    Taurus: "With Taurus here, quiet time restores the body — deliberate rest is productive when you are depleted.",
    Gemini: "With Gemini here, the inner life needs mental digestion — private learning or journaling keeps worry from looping forever.",
    Cancer: "With Cancer here, private feeling runs deep — a safe container for your inner life stops exhaustion from leaking into everything else.",
    Leo: "With Leo here, solitude needs self-regard — private creativity or rest that honors you rebuilds the self the world wore down.",
    Virgo: "With Virgo here, you process by sorting inner clutter — small private systems for rest reduce the noise anxiety feeds on.",
    Libra: "With Libra here, alone time rebalances you — peace without performing is how you remember your own preferences.",
    Scorpio: "With Scorpio here, the private underworld is familiar — facing what is hidden, then releasing it, keeps transformation clean instead of corrosive.",
    Sagittarius: "With Sagittarius here, solitude needs meaning — private faith or honest perspective keeps isolation from turning into hopelessness.",
    Capricorn: "With Capricorn here, you may work hard even alone — scheduling real recovery is part of discipline, not a break from it.",
    Aquarius: "With Aquarius here, the inner life is independent — your private mind is allowed to differ from the crowd; that can be clarity, not exile.",
    Pisces: "With Pisces here, solitude is soft and spiritual — rest and attention to the inner world are how you come back from overwhelm.",
  },
};

/** Looks up the written sign-on-cusp line. */
export function explainSignInHouse(sign: string, house: number): string {
  return SIGN_IN_HOUSE[house]?.[sign] ?? "";
}

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

/** Direct connecting verb per aspect type, so the pair explanation reads as
 * "Your Mercury grinds against your Jupiter" instead of describing the
 * aspect abstractly first and the bodies second. */
const ASPECT_VERBS: Record<string, string> = {
  conjunction: "fuses directly with",
  sextile: "opens an easy door for",
  square: "grinds against",
  trine: "flows easily into",
  opposition: "pulls directly against",
  quincunx: "keeps having to awkwardly adjust to",
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
  const verb = ASPECT_VERBS[key] ?? "connects with";
  const shortA = BODY_SHORT[bodyA];
  const shortB = BODY_SHORT[bodyB];
  const intro = shortA && shortB
    ? `Your ${bodyA} (${shortA}) ${verb} your ${bodyB} (${shortB}).`
    : `Your ${bodyA} ${verb} your ${bodyB}.`;
  return `${intro} ${meaning.feel}`;
}
