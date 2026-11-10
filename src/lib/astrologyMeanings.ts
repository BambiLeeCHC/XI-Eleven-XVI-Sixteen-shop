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
  Sun: "identity and the drive to be yourself",
  Moon: "emotions, instincts, and what helps you feel safe",
  Mercury: "thinking, learning, and how you communicate",
  Venus: "love, values, attraction, and what you enjoy",
  Mars: "action, energy, and how you go after what you want",
  Jupiter: "growth, opportunity, and the bigger plan",
  Saturn: "discipline, responsibility, and long-term structure",
  Uranus: "independence and the need to change a plan that no longer fits",
  Neptune: "intuition, imagination, and what you sense before it is explained",
  Pluto: "power, control, and deep change",
  Ascendant: "the first impression you make",
  Midheaven: "career, reputation, and public image",
};

export const BODY_TITLES: Record<string, string> = {
  Sun: "Sun · Identity & core drive",
  Moon: "Moon · Emotions & instincts",
  Mercury: "Mercury · Thinking & communication",
  Venus: "Venus · Love, values & attraction",
  Mars: "Mars · Action, energy & drive",
  Jupiter: "Jupiter · Growth & opportunity",
  Saturn: "Saturn · Discipline & structure",
  Uranus: "Uranus · Independence & change",
  Neptune: "Neptune · Intuition & imagination",
  Pluto: "Pluto · Power & deep change",
  Ascendant: "Ascendant · First impression",
  Midheaven: "Midheaven · Career & public image",
};

/** Plain noun for aspect cards and reflection questions. */
export const BODY_ROLES: Record<string, string> = {
  Sun: "Identity",
  Moon: "Emotions",
  Mercury: "Thinking",
  Venus: "Love & values",
  Mars: "Action & drive",
  Jupiter: "Growth",
  Saturn: "Discipline",
  Uranus: "Independence",
  Neptune: "Intuition",
  Pluto: "Deep power",
  Ascendant: "First impression",
  Midheaven: "Public image",
};

export const BODY_SHORT: Record<string, string> = BODY_ROLES;

export const SIGN_TRAITS: Record<string, string> = {
  Aries: "direct, independent, and willing to start before the plan is perfect",
  Taurus: "steady, practical, and loyal to what they have decided matters",
  Gemini: "curious, adaptable, and quick to talk a problem through",
  Cancer: "protective, intuitive, and careful with the people they trust",
  Leo: "confident, warm, and willing to be seen for what they contribute",
  Virgo: "detail-oriented, organized, and focused on what is actually useful",
  Libra: "fair-minded, diplomatic, and attentive to both sides",
  Scorpio: "intense, private, and unwilling to stay on the surface",
  Sagittarius: "adventurous, candid, and aimed at the bigger picture",
  Capricorn: "disciplined, ambitious, and patient with a long-term plan",
  Aquarius:
    "independent, inventive, and more interested in a better system than the usual one",
  Pisces: "empathetic, imaginative, and receptive to what is not being said",
};

export const SIGN_SUMMARY: Record<string, string> = {
  Aries: "direct, independent, bold",
  Taurus: "steady, practical, loyal",
  Gemini: "curious, adaptable, expressive",
  Cancer: "protective, intuitive, caring",
  Leo: "confident, warm, expressive",
  Virgo: "detail-oriented, organized, helpful",
  Libra: "fair-minded, diplomatic, social",
  Scorpio: "intense, private, focused",
  Sagittarius: "adventurous, candid, big-picture",
  Capricorn: "disciplined, ambitious, patient",
  Aquarius: "independent, inventive, future-minded",
  Pisces: "empathetic, imaginative, receptive",
};

export const SIGN_KEYWORDS: Record<string, string[]> = {
  Aries: ["direct", "independent", "bold"],
  Taurus: ["steady", "practical", "loyal"],
  Gemini: ["curious", "adaptable", "expressive"],
  Cancer: ["protective", "intuitive", "caring"],
  Leo: ["confident", "warm", "expressive"],
  Virgo: ["detail-oriented", "organized", "helpful"],
  Libra: ["fair-minded", "diplomatic", "social"],
  Scorpio: ["intense", "private", "focused"],
  Sagittarius: ["adventurous", "candid", "big-picture"],
  Capricorn: ["disciplined", "ambitious", "patient"],
  Aquarius: ["independent", "inventive", "future-minded"],
  Pisces: ["empathetic", "imaginative", "receptive"],
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
    detail:
      "House 1 is how you show up — first impression, body language, and the way you enter a situation.",
    keywords: ["show up", "first impression", "body"],
    question: "",
  },
  2: {
    title: "Money and value",
    summary: "money",
    detail:
      "House 2 is money: how you earn it, spend it, save it, and decide what is worth paying for.",
    keywords: ["money", "earning", "value"],
    question: "",
  },
  3: {
    title: "Thinking and communication",
    summary: "thinking and talk",
    detail:
      "House 3 is how you think, talk, text, learn, and handle ordinary day-to-day logistics.",
    keywords: ["thinking", "talk", "logistics"],
    question: "",
  },
  4: {
    title: "Home and family",
    summary: "home and family",
    detail:
      "House 4 is home and family — your private base and what it takes for you to feel settled.",
    keywords: ["home", "family", "settled"],
    question: "",
  },
  5: {
    title: "Pleasure and expression",
    summary: "fun and expression",
    detail:
      "House 5 is fun, creativity, romance, and what you do because you want to, not because you have to.",
    keywords: ["fun", "creativity", "romance"],
    question: "",
  },
  6: {
    title: "Work, health, and routine",
    summary: "work, health, routine",
    detail:
      "House 6 is work, health, and daily routine — the habits that keep your body and schedule working.",
    keywords: ["work", "health", "routine"],
    question: "",
  },
  7: {
    title: "Partnerships",
    summary: "partnerships",
    detail:
      "House 7 is one-to-one relationships — partners, close collaborators, and how you act when it is just you and one other person.",
    keywords: ["partners", "one-to-one", "collaboration"],
    question: "",
  },
  8: {
    title: "Shared resources and deep change",
    summary: "shared money and deep change",
    detail:
      "House 8 is shared money, debt, inheritance, deep trust, intimacy, and changes you do not control alone.",
    keywords: ["shared money", "trust", "change"],
    question: "",
  },
  9: {
    title: "Belief, study, and horizons",
    summary: "beliefs and horizons",
    detail:
      "House 9 is the bigger frame: beliefs, study, travel, and the ideas that steer major choices.",
    keywords: ["beliefs", "study", "travel"],
    question: "",
  },
  10: {
    title: "Career and reputation",
    summary: "career and reputation",
    detail:
      "House 10 is career and reputation — the public work you build and how the outside world reads you.",
    keywords: ["career", "reputation", "public work"],
    question: "",
  },
  11: {
    title: "Friends and groups",
    summary: "friends and groups",
    detail:
      "House 11 is friends, groups, and networks — the people you join for shared aims.",
    keywords: ["friends", "groups", "networks"],
    question: "",
  },
  12: {
    title: "Solitude and inner life",
    summary: "solitude and rest",
    detail:
      "House 12 is solitude, rest, and private processing — what you deal with when no one is watching.",
    keywords: ["solitude", "rest", "inner life"],
    question: "",
  },
};

export const HOUSE_MEANINGS: Record<number, string> = Object.fromEntries(
  Object.entries(HOUSE_MEANINGS_FULL).map(([house, m]) => [
    Number(house),
    `${m.title} — ${m.summary}`,
  ]),
);

/** Short topic shown on a collapsed placement card. */
export const HOUSE_CARD_SHORT: Record<number, string> = {
  1: "Self & image",
  2: "Money & value",
  3: "Communication",
  4: "Home & family",
  5: "Creativity & romance",
  6: "Work & routine",
  7: "Relationships",
  8: "Shared finances & trust",
  9: "Beliefs & travel",
  10: "Career & reputation",
  11: "Friends & community",
  12: "Rest & inner life",
};

/** 144 unique sign-on-cusp explanations — restored from the
 * pre-IMPACT production bundle (dirty deploy a368484). Each
 * pairing is written, not assembled from a trait mashup. */
const SIGN_IN_HOUSE: Record<number, Record<string, string>> = {
  1: {
    Aries:
      "With Aries here, you walk into rooms with heat and initiative — when life stalls, that same force is how you start again without waiting for permission.",
    Taurus:
      "With Taurus here, you show up solid and unhurried — people feel your stability, and that steadiness is a real form of strength when everything else is loud.",
    Gemini:
      "With Gemini here, you meet the world with questions and quick wit — your mind keeps doors open, which is useful when one path closes.",
    Cancer:
      "With Cancer here, you lead with care and protectiveness — your softness is not weakness; it is how you make space safe for yourself and others.",
    Leo: "With Leo here, you enter with presence and heart — being seen is not vanity for you; it is how you restore confidence when you have been diminished.",
    Virgo:
      "With Virgo here, you present as precise and useful — the way you refine yourself is how you rebuild dignity after chaos.",
    Libra:
      "With Libra here, you arrive balanced and aware of the room — your sense of fairness is a quiet power when conflict is everywhere.",
    Scorpio:
      "With Scorpio here, you show up intense and selective — you do not dilute yourself, and that focus is how you survive hard seasons intact.",
    Sagittarius:
      "With Sagittarius here, you enter with candor and range — honesty and a wider view pull you forward when small problems try to own you.",
    Capricorn:
      "With Capricorn here, you present as composed and capable — structure is how you carry yourself when motivation alone is not enough.",
    Aquarius:
      "With Aquarius here, you show up original and unborrowed — doing it your way is how you stay whole.",
    Pisces:
      "With Pisces here, you enter soft and perceptive — your sensitivity reads the room, and that same softness is how you stay human under pressure.",
  },
  2: {
    Aries:
      "With Aries here, you treat money as fuel for action — aim that heat so it builds something, not only burns.",
    Taurus:
      "With Taurus here, you earn and hold with patience — slow accumulation is a legitimate kind of peace.",
    Gemini:
      "With Gemini here, money moves through ideas and exchange — flexible plans keep you from feeling trapped by one number.",
    Cancer:
      "With Cancer here, money is tied to safety and care — that instinct can become steady provision, not only worry.",
    Leo: "With Leo here, money links to pride and generosity — investing in what reflects who you are restores self-respect.",
    Virgo:
      "With Virgo here, you track, budget, and cut waste — order with money reduces anxiety and proves you can handle the practical layer.",
    Libra:
      "With Libra here, money decisions weigh fairness — balanced exchanges can create trust instead of scorekeeping.",
    Scorpio:
      "With Scorpio here, money is power and privacy — financial clarity is how you stop feeling at someone else's mercy.",
    Sagittarius:
      "With Sagittarius here, money should fund growth and freedom — spending toward meaning keeps life from shrinking to bills alone.",
    Capricorn:
      "With Capricorn here, you build money like a structure — long-term plans and earned gains are a form of self-respect.",
    Aquarius:
      "With Aquarius here, money follows principles and unconventional paths — inventing a method that fits you can free you.",
    Pisces:
      "With Pisces here, spending follows what moves you — pair heart with a simple plan so need does not wipe you out.",
  },
  3: {
    Aries:
      "With Aries here, you speak fast and direct — clear speech cuts through confusion when your mind is overloaded.",
    Taurus:
      "With Taurus here, you think and talk slowly and concretely — steady communication builds trust when news keeps changing.",
    Gemini:
      "With Gemini here, your mind stays curious — learning on the move keeps despair from hardening.",
    Cancer:
      "With Cancer here, you communicate from feeling — honest emotional language is how you stop carrying everything alone.",
    Leo: "With Leo here, you want your voice to land — saying what matters out loud rebuilds confidence after silence has cost you.",
    Virgo:
      "With Virgo here, you think in details — precision in how you speak and plan is how you regain control of the small things.",
    Libra:
      "With Libra here, you talk to find balance — fair conversation can reopen doors that argument slammed shut.",
    Scorpio:
      "With Scorpio here, you say less and mean more — depth finds truth when surface talk feels useless.",
    Sagittarius:
      "With Sagittarius here, you think big and speak bluntly — a wider story can pull you out of a narrow bad week.",
    Capricorn:
      "With Capricorn here, communication is purposeful — speaking to get something done saves energy when chatter wastes it.",
    Aquarius:
      "With Aquarius here, your mind runs on original angles — reframing the problem is often how you find a way through.",
    Pisces:
      "With Pisces here, you communicate in feeling — naming what is hard still counts as honesty, and it can release pressure.",
  },
  4: {
    Aries:
      "With Aries here, home is somewhere you can act freely — a base that lets you start over is how you recover when the outside world drains you.",
    Taurus:
      "With Taurus here, home must feel solid and comfortable — a stable private space is how your nervous system resets.",
    Gemini:
      "With Gemini here, home needs conversation and mental air — a place where ideas move keeps loneliness from turning heavy.",
    Cancer:
      "With Cancer here, home and family are the core — protecting your private life is how you stay intact.",
    Leo: "With Leo here, home should feel warm and affirming — a private space where you are valued restores pride the public world can strip.",
    Virgo:
      "With Virgo here, home works when it is orderly — small repairs and clean systems are practical care for yourself.",
    Libra:
      "With Libra here, home needs harmony — a peaceful base is how you stop bringing every conflict to bed with you.",
    Scorpio:
      "With Scorpio here, home is private and deeply held — a sanctuary is how you process intensity without performing strength.",
    Sagittarius:
      "With Sagittarius here, home should not feel like a cage — room to grow and return keeps family from becoming a trap.",
    Capricorn:
      "With Capricorn here, home is long-term foundation — building a reliable base is how you give future-you something solid.",
    Aquarius:
      "With Aquarius here, home may be unconventional — a setup that fits your real life is how you stop resenting where you live.",
    Pisces:
      "With Pisces here, home is emotional atmosphere — softness and rest at home are how you heal after hard days.",
  },
  5: {
    Aries:
      "With Aries here, play starts with bold moves — allowing joy without a productivity excuse is how you remember you are alive.",
    Taurus:
      "With Taurus here, pleasure is sensory and steady — real enjoyment rebuilds you when life has been only duty.",
    Gemini:
      "With Gemini here, fun is variety and light curiosity — playfulness is medicine when everything is too serious.",
    Cancer:
      "With Cancer here, creativity and romance need emotional safety — gentle play is how you open again after hurt.",
    Leo: "With Leo here, expression wants heart — creating or loving out loud is how you recover from feeling invisible.",
    Virgo:
      "With Virgo here, craft refines what you make — small creative wins still rebuild momentum.",
    Libra:
      "With Libra here, pleasure is shared and aesthetic — beauty and mutual enjoyment remind you life is not only negotiation.",
    Scorpio:
      "With Scorpio here, play and desire go deep — intensity in what you love is how you feel fully present again.",
    Sagittarius:
      "With Sagittarius here, fun expands the map — adventure and humor pull you out of a closed loop of worry.",
    Capricorn:
      "With Capricorn here, creativity can be serious craft — building something lasting for joy still feeds you.",
    Aquarius:
      "With Aquarius here, expression is experimental — making something true on your terms is how you stay interested in your own life.",
    Pisces:
      "With Pisces here, art and imagination blur with feeling — allowing beauty is how you soften after numbness.",
  },
  6: {
    Aries:
      "With Aries here, you attack tasks and health goals head-on — one clear habit at a time turns stress into motion.",
    Taurus:
      "With Taurus here, routines stick when they feel good in the body — consistency is how you recover.",
    Gemini:
      "With Gemini here, variety keeps work and health from boring you into quitting — small switches keep you showing up.",
    Cancer:
      "With Cancer here, care for body and schedule is emotional — tending yourself is how you stay available for what matters.",
    Leo: "With Leo here, work and health improve when pride is involved — routines that make you feel strong are easier to keep than pure duty.",
    Virgo:
      "With Virgo here, you refine work, health, and routine in detail — fixing what is slightly off is how you prevent collapse and regain quiet confidence.",
    Libra:
      "With Libra here, balance in workload and wellness matters — refusing chronic overextension is self-respect.",
    Scorpio:
      "With Scorpio here, you transform habits when something has to change for real — deep commitment to a healthier pattern is possible once you decide.",
    Sagittarius:
      "With Sagittarius here, routines need meaning — tying habits to a larger why keeps discipline from feeling like punishment.",
    Capricorn:
      "With Capricorn here, you build systems that last — reliable structure around work and health is how you outlast a hard season.",
    Aquarius:
      "With Aquarius here, you design your own method — a plan that fits you beats forced conformity.",
    Pisces:
      "With Pisces here, routines need recovery built in — rest is part of the system, not a failure of will.",
  },
  7: {
    Aries:
      "With Aries here, partnerships move when someone leads — honest initiative is how you stop waiting for the other person to save the dynamic.",
    Taurus:
      "With Taurus here, you want loyal, steady partnership — reliability is a strength, not boredom.",
    Gemini:
      "With Gemini here, partners need talk and mental connection — curiosity keeps the bond from going stale under stress.",
    Cancer:
      "With Cancer here, partnership is care and mutual protection — asking for emotional safety makes the bond a resource, not another drain.",
    Leo: "With Leo here, you give warmth and want recognition back — mutual appreciation keeps both people proud of choosing each other.",
    Virgo:
      "With Virgo here, you improve the relationship through practical care — small reliable acts rebuild trust faster than grand speeches.",
    Libra:
      "With Libra here, partnership is the point — fairness and real listening are how you repair after imbalance.",
    Scorpio:
      "With Scorpio here, bonds go deep or not at all — intensity and honesty forge alliances that hold when shallow ones fail.",
    Sagittarius:
      "With Sagittarius here, partners need freedom and truth — space plus candor keeps commitment from feeling like a sentence.",
    Capricorn:
      "With Capricorn here, partnership is a long project — showing up consistently is how respect accumulates.",
    Aquarius:
      "With Aquarius here, you need friendship inside the bond — equality keeps love from becoming control.",
    Pisces:
      "With Pisces here, partnership is empathy — compassion is powerful when paired with boundaries so you do not disappear.",
  },
  8: {
    Aries:
      "With Aries here, you face shared risk and hard change directly — naming the problem out loud is often the first step out of a stuck crisis.",
    Taurus:
      "With Taurus here, you want solid ground in joint finances and trust — slow security after upheaval is a valid goal.",
    Gemini:
      "With Gemini here, you process deep change through information — understanding a crisis reduces its power over you.",
    Cancer:
      "With Cancer here, shared vulnerability cuts deep — allowing support in the hard places is how intimacy becomes strength.",
    Leo: "With Leo here, pride and heart show up in recovery — reclaiming dignity after loss is part of the work, and you are allowed that.",
    Virgo:
      "With Virgo here, you handle shared money and repair through careful analysis — cleaning up the details makes chaos manageable.",
    Libra:
      "With Libra here, fairness in shared power matters — renegotiating terms can restore balance after one-sided strain.",
    Scorpio:
      "With Scorpio here, you know depth and transformation — facing what others avoid is real power when aimed at healing.",
    Sagittarius:
      "With Sagittarius here, crisis needs a larger meaning — a true story about what this change is for can keep you moving.",
    Capricorn:
      "With Capricorn here, you take responsibility in the heavy material of life — structured recovery is how you climb out.",
    Aquarius:
      "With Aquarius here, you redesign the terms — a new system around shared resources can free you from a toxic old pattern.",
    Pisces:
      "With Pisces here, deep change moves through feeling — allowing grief and then soft rebuilding is how a hard cycle completes.",
  },
  9: {
    Aries:
      "With Aries here, beliefs expand through action — trying the bigger path is how conviction stops being only talk.",
    Taurus:
      "With Taurus here, meaning grows through lived experience — a philosophy you can stand on day after day beats abstract inspiration.",
    Gemini:
      "With Gemini here, study and belief stay open — learning keeps hope intelligent; you are allowed to update what you think is true.",
    Cancer:
      "With Cancer here, faith is personal — a belief that protects your inner life can be a real anchor in public chaos.",
    Leo: "With Leo here, meaning wants to be lived with pride — standing for something visible restores purpose when days feel empty.",
    Virgo:
      "With Virgo here, you refine belief through careful study — a practical truth you can apply is stronger than a vague ideal.",
    Libra:
      "With Libra here, horizons expand through dialogue — other perspectives can reopen a mind that stress narrowed.",
    Scorpio:
      "With Scorpio here, belief goes through underworlds and comes back deeper — hard-won meaning is harder to shake than easy optimism.",
    Sagittarius:
      "With Sagittarius here, this is home territory — growth, travel, and honest philosophy are how you refuse a small life.",
    Capricorn:
      "With Capricorn here, wisdom is earned and applied — learning that changes how you act is real hope, not slogans.",
    Aquarius:
      "With Aquarius here, you rethink the map — new frameworks can pull you out of a worldview that was quietly hurting you.",
    Pisces:
      "With Pisces here, meaning is felt — connection to something larger than the problem can steady you when logic alone is not enough.",
  },
  10: {
    Aries:
      "With Aries here, career moves when you initiate — visible action toward the role you want is how reputation starts to match ambition.",
    Taurus:
      "With Taurus here, public work builds slowly and solidly — lasting status from reliability is a respectable path.",
    Gemini:
      "With Gemini here, career thrives on communication and range — multiple skills keep you employable when one door closes.",
    Cancer:
      "With Cancer here, reputation ties to care — work that shelters others can also become a platform for your own security.",
    Leo: "With Leo here, you want to be known for something with heart — recognition of real contribution repairs worth after private struggle.",
    Virgo:
      "With Virgo here, career advances through competence — being excellent at the useful thing is a quiet form of power.",
    Libra:
      "With Libra here, public role involves partnership — alliances and fair dealing build a name that lasts.",
    Scorpio:
      "With Scorpio here, career can involve influence and deep change — intensity aimed at meaningful work turns private fire into public impact.",
    Sagittarius:
      "With Sagittarius here, vocation needs a mission — work tied to a bigger aim keeps daily grind from eating your spirit.",
    Capricorn:
      "With Capricorn here, this is natural ground — patient climb and earned respect are how you build a life you can stand behind.",
    Aquarius:
      "With Aquarius here, career may look unconventional — a path that fits your principles can succeed without the standard ladder.",
    Pisces:
      "With Pisces here, public work often channels care or imagination — contribution that helps or creates can give purpose when status alone feels empty.",
  },
  11: {
    Aries:
      "With Aries here, you lead or spark the group — initiating community is how you stop waiting to be invited into belonging.",
    Taurus:
      "With Taurus here, friendships are loyal and lasting — a few solid people beat a crowd, and that is enough to lean on.",
    Gemini:
      "With Gemini here, networks run on conversation — light, real contact keeps isolation from becoming permanent.",
    Cancer:
      "With Cancer here, your circle is family-like — mutual care in friendship is a resource you are allowed to need.",
    Leo: "With Leo here, groups thrive on generosity and recognition — being a warm center rebuilds social confidence.",
    Virgo:
      "With Virgo here, you help the group in practical ways — useful friendship creates bonds stronger than performance alone.",
    Libra:
      "With Libra here, peers and allies matter — collaborative circles multiply what one person cannot hold alone.",
    Scorpio:
      "With Scorpio here, friendships are few and deep — intense loyalty in a small network is real support when life gets severe.",
    Sagittarius:
      "With Sagittarius here, groups should expand your world — people who share growth and humor pull you forward.",
    Capricorn:
      "With Capricorn here, networks can be strategic and mature — allies built on respect help long-term aims.",
    Aquarius:
      "With Aquarius here, community and causes are native — finding your people around a shared future turns loneliness into momentum.",
    Pisces:
      "With Pisces here, friendships are empathetic — gentle community can hold you when you cannot hold everything yourself.",
  },
  12: {
    Aries:
      "With Aries here, solitude still wants an outlet for drive — private action and honest rest keep burnout from becoming identity.",
    Taurus:
      "With Taurus here, quiet time restores the body — deliberate rest is productive when you are depleted.",
    Gemini:
      "With Gemini here, the inner life needs mental digestion — private learning or journaling keeps worry from looping forever.",
    Cancer:
      "With Cancer here, private feeling runs deep — a safe container for your inner life stops exhaustion from leaking into everything else.",
    Leo: "With Leo here, solitude needs self-regard — private creativity or rest that honors you rebuilds the self the world wore down.",
    Virgo:
      "With Virgo here, you process by sorting inner clutter — small private systems for rest reduce the noise anxiety feeds on.",
    Libra:
      "With Libra here, alone time rebalances you — peace without performing is how you remember your own preferences.",
    Scorpio:
      "With Scorpio here, the private underworld is familiar — facing what is hidden, then releasing it, keeps transformation clean instead of corrosive.",
    Sagittarius:
      "With Sagittarius here, solitude needs meaning — private faith or honest perspective keeps isolation from turning into hopelessness.",
    Capricorn:
      "With Capricorn here, you may work hard even alone — scheduling real recovery is part of discipline, not a break from it.",
    Aquarius:
      "With Aquarius here, the inner life is independent — your private mind is allowed to differ from the crowd; that can be clarity, not exile.",
    Pisces:
      "With Pisces here, solitude is soft and spiritual — rest and attention to the inner world are how you come back from overwhelm.",
  },
};

/** Looks up the written sign-on-cusp line. */
export function explainSignInHouse(sign: string, house: number): string {
  return SIGN_IN_HOUSE[house]?.[sign] ?? "";
}

const HOUSE_QUESTION: Record<number, string> = {
  1: "Where are you already walking in halfway gone?",
  2: "What are you paying for that you do not actually value?",
  3: "Which sentence, if you said it cleanly, would end the loop?",
  4: "What does your private room need before you can rest?",
  5: "What would you make if nobody had to clap?",
  6: "Which daily habit is care, and which one is just noise?",
  7: "Where are you performing balance instead of asking for it?",
  8: "What shared thing are you still pretending you control alone?",
  9: "Which belief is steering you that you have not said out loud?",
  10: "What public work would you keep if the title disappeared?",
  11: "Who is in the room because they fit, and who is only familiar?",
  12: "What are you processing in private that is ready for a smaller container?",
};

export type HouseBridgeEndpoint = {
  body: string;
  sign: string;
  house: number | null;
};

/** What this planet puts into a house, in plain language. */
const PLANET_FOCUS: Record<string, string> = {
  Sun: "your identity and core drive",
  Moon: "your emotions and instincts",
  Mercury: "your thinking and communication",
  Venus: "how you love, what you value, and who you are drawn to",
  Mars: "your action, energy, and drive",
  Jupiter: "your growth and search for opportunity",
  Saturn: "your discipline and need for structure",
  Uranus: "your independence and need for change",
  Neptune: "your intuition and imagination",
  Pluto: "your relationship to power and deep change",
  Ascendant: "the first impression you make",
  Midheaven: "your career and public image",
};

const HOUSE_FOCUS: Record<number, string> = {
  1: "how you present yourself and the image people meet first",
  2: "money, possessions, and what you decide is worth your resources",
  3: "everyday thinking, conversation, and short-range plans",
  4: "home, family, and the private base you return to",
  5: "creativity, romance, and what you do for enjoyment",
  6: "work, health, and the routines that keep the day running",
  7: "one-to-one relationships and how you show up with a partner",
  8: "shared money, trust, and changes you handle with other people",
  9: "beliefs, study, travel, and the bigger ideas behind your choices",
  10: "career, reputation, and the work other people see",
  11: "friends, groups, and the communities you join",
  12: "rest, solitude, and what you sort out in private",
};

const SIGN_DAY_TO_DAY: Record<string, string> = {
  Aries:
    "you start the work yourself and prefer action over a long planning phase",
  Taurus:
    "you move slowly, stick with what works, and care about tangible results",
  Gemini:
    "you talk it through, keep a couple of options open, and adjust as you learn more",
  Cancer: "you protect the people and routines that make you feel safe",
  Leo: "you want the effort to feel meaningful and to be recognized for it",
  Virgo: "you organize the details and look for a method that actually works",
  Libra:
    "you weigh both sides and care how the outcome lands with other people",
  Scorpio:
    "you keep it private, stay focused, and prefer a few honest commitments",
  Sagittarius:
    "you ask what it is for and get restless when the view stays too small",
  Capricorn:
    "you set a standard, keep the plan, and measure progress over time",
  Aquarius: "you question the usual method and look for a setup that fits you",
  Pisces:
    "you read the mood and need clear limits so you do not take on everyone else's feelings",
};

const HOUSE_LINK: Record<
  number,
  { topic: string; happens: string; shapes: string }
> = {
  1: {
    topic: "how you come across to others",
    happens: "the way you enter a room",
    shapes: "how confident and grounded you look in person",
  },
  2: {
    topic: "money and what you value",
    happens: "your money and your sense of what is worth keeping",
    shapes: "how you earn, spend, and decide what is worth paying for",
  },
  3: {
    topic: "thinking and daily communication",
    happens: "your conversations and daily mindset",
    shapes: "how you think, talk, and handle day-to-day plans",
  },
  4: {
    topic: "home and family",
    happens: "your home life and family ties",
    shapes: "how settled you feel at home and with family",
  },
  5: {
    topic: "creativity, romance, and enjoyment",
    happens: "your creative work, romance, and free time",
    shapes: "what you make, who you date, and how you spend free time",
  },
  6: {
    topic: "work, health, and routine",
    happens: "your work, health, and daily routine",
    shapes: "how you handle tasks, health, and everyday habits",
  },
  7: {
    topic: "one-to-one relationships",
    happens: "your closest one-to-one relationships",
    shapes: "how you show up with a partner or close collaborator",
  },
  8: {
    topic: "shared money, trust, and deep change",
    happens: "shared money, trust, and intimacy",
    shapes: "how you handle shared resources and deep trust",
  },
  9: {
    topic: "beliefs, study, and travel",
    happens: "your beliefs, studies, and travel",
    shapes: "the bigger ideas that steer your major choices",
  },
  10: {
    topic: "career and reputation",
    happens: "your career and public reputation",
    shapes: "the work and reputation other people see",
  },
  11: {
    topic: "friends and community",
    happens: "your friendships and group life",
    shapes: "the people you join and the communities you keep",
  },
  12: {
    topic: "rest and private processing",
    happens: "your rest and private processing",
    shapes: "how you recover when no one is watching",
  },
};

/** How a planet in a sign actually operates inside one house. */
export function explainPlacementInHouse(
  body: string,
  sign: string,
  house: number,
  houseCuspSign: string,
): string {
  const focus = PLANET_FOCUS[body] ?? `the part of you named ${body}`;
  const area = HOUSE_FOCUS[house] ?? `the topics of house ${house}`;
  const signHow = SIGN_DAY_TO_DAY[sign] ?? `you bring a ${sign} approach`;
  const cuspHow =
    SIGN_DAY_TO_DAY[houseCuspSign] ?? `you bring a ${houseCuspSign} approach`;
  if (!house) {
    return `${body} in ${sign} focuses ${focus}. Day to day, ${signHow}.`;
  }
  const opening = `${body} in House ${house} focuses ${focus} on ${area}.`;
  if (houseCuspSign && houseCuspSign !== sign) {
    return `${opening} With ${body} in ${sign}, ${signHow}. ${houseCuspSign} on the house cusp changes the daily approach in this area: ${cuspHow}.`;
  }
  if (houseCuspSign) {
    return `${opening} ${sign} is also on the house cusp, so that same approach runs the day-to-day: ${signHow}.`;
  }
  return `${opening} In ${sign}, the day-to-day approach is that ${signHow}.`;
}

/** How an aspect carries one house's affairs into another. */
export function explainAspectAcrossHouses(
  aspect: string,
  placementA: HouseBridgeEndpoint,
  placementB: HouseBridgeEndpoint,
): string {
  const key = aspect.toLowerCase();
  const houseA = placementA.house ?? 0;
  const houseB = placementB.house ?? 0;
  const linkA = HOUSE_LINK[houseA];
  const linkB = HOUSE_LINK[houseB];
  const supportive =
    key === "trine" || key === "sextile" || key === "conjunction";
  const mismatched = key === "quincunx";

  if (houseA && houseB && houseA !== houseB && linkA && linkB) {
    const connection = `This connects House ${houseA} (${linkA.topic}) with House ${houseB} (${linkB.topic}).`;
    if (mismatched) {
      return `${connection} These two areas do not line up on their own, so a change in ${linkA.happens} asks for a matching adjustment in ${linkB.happens}.`;
    }
    if (supportive) {
      return `${connection} What happens in ${linkA.happens} directly shapes ${linkB.shapes}.`;
    }
    return `${connection} Tension in ${linkA.happens} spills into ${linkB.topic}, and pressure around ${linkB.topic} feeds back into ${linkA.topic}.`;
  }

  const shared = houseA || houseB;
  const link = HOUSE_LINK[shared];
  const topic = link?.topic ?? `house ${shared}`;
  const happens = link?.happens ?? topic;
  if (!shared) {
    return supportive
      ? `${placementA.body} and ${placementB.body} describe two parts of you in the same decision. Progress on one side helps the other.`
      : `${placementA.body} and ${placementB.body} describe two parts of you in the same decision. Tension on one side shows up in the other.`;
  }
  if (mismatched) {
    return `Both planets are in House ${shared} (${topic}). A change in ${happens} needs a small adjustment before the rest of that area feels workable.`;
  }
  if (supportive) {
    return `Both planets are in House ${shared} (${topic}). Progress in ${happens} helps the rest of that area, because both parts of you are working on the same part of life.`;
  }
  return `Both planets are in House ${shared} (${topic}). Tension in ${happens} stays in that one area, because these two needs are competing at the same time.`;
}

interface AspectMeaning {
  nature: string;
}

export const ASPECT_MEANINGS_FULL: Record<string, AspectMeaning> = {
  conjunction: {
    nature: "a 0° angle that blends the two planets into one focus",
  },
  sextile: {
    nature: "a 60° angle of easy teamwork",
  },
  square: {
    nature: "a 90° angle of friction that pushes you to deal with both sides",
  },
  trine: {
    nature: "a 120° angle of natural flow",
  },
  opposition: {
    nature: "a 180° angle that pulls you in two directions",
  },
  quincunx: {
    nature: "a 150° angle that needs a small adjustment",
  },
};

export const ASPECT_MEANINGS: Record<string, string> = Object.fromEntries(
  Object.entries(ASPECT_MEANINGS_FULL).map(([key, m]) => [key, m.nature]),
);

export const ASPECT_TITLES: Record<string, string> = {
  conjunction: "Blended focus",
  sextile: "Easy teamwork",
  square: "Push & friction",
  trine: "Natural flow",
  opposition: "Pulling both ways",
  quincunx: "Needs adjustment",
};

export const ASPECT_ANGLE_LABEL: Record<string, string> = {
  conjunction: "0° Conjunction",
  sextile: "60° Sextile",
  square: "90° Square",
  trine: "120° Trine",
  quincunx: "150° Quincunx",
  opposition: "180° Opposition",
};

export const ASPECT_KEYWORDS: Record<string, string[]> = {
  conjunction: ["0° angle", "combined energy", "amplified"],
  sextile: ["60° angle", "supportive", "cooperative"],
  square: ["90° angle", "friction", "motivator"],
  trine: ["120° angle", "harmonious", "effortless"],
  opposition: ["180° angle", "tug-of-war", "balance"],
  quincunx: ["150° angle", "mismatched", "adaptable"],
};

const BODY_GOVERNS: Record<string, string> = {
  Sun: "identity and core drive",
  Moon: "emotions and instincts",
  Mercury: "thinking and communication",
  Venus: "love, values, and attraction",
  Mars: "action and assertiveness",
  Jupiter: "growth and big-picture plans",
  Saturn: "discipline and long-term structure",
  Uranus: "independence and change",
  Neptune: "intuition and imagination",
  Pluto: "intensity and control",
  Ascendant: "the first impression you make",
  Midheaven: "career and public image",
};

const BODY_ORDER = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Ascendant",
  "Midheaven",
];

function pairKey(bodyA: string, bodyB: string): string {
  const indexA = BODY_ORDER.indexOf(bodyA);
  const indexB = BODY_ORDER.indexOf(bodyB);
  if (indexA < 0 || indexB < 0) return [bodyA, bodyB].sort().join("|");
  return indexA <= indexB ? `${bodyA}|${bodyB}` : `${bodyB}|${bodyA}`;
}

/** Everyday result of a planet pair. `support` is the easy version; `friction` is the clash. */
const PAIR_THEMES: Record<string, { support: string; friction: string }> = {
  "Sun|Moon": {
    support:
      "your sense of who you are and your emotional needs point the same way, so decisions feel honest and you know what actually settles you",
    friction:
      "what you want to show the world and what you need in private can clash, and you may act confident while feeling unsettled, or protect your mood at the cost of being direct",
  },
  "Sun|Mercury": {
    support:
      "you can say what you mean in a way that matches who you are, and thinking something through usually clarifies your direction",
    friction:
      "you may talk yourself out of what you want, or defend an opinion because it feels like you rather than because it is accurate",
  },
  "Sun|Venus": {
    support:
      "you know what you like and you can show warmth without dropping your own priorities",
    friction:
      "the wish to be liked can pull against what you actually want, so you may agree to keep the peace or insist on your way and miss what the other person values",
  },
  "Sun|Mars": {
    support:
      "you can act on what matters to you without a long delay, because desire and identity are pointing the same way",
    friction:
      "you have a strong need to act and to be right about it, and impatience can turn a delay into a contest",
  },
  "Sun|Jupiter": {
    support:
      "you grow by backing a bigger goal that still feels like you, as long as optimism includes a real next step",
    friction:
      "you may overcommit to a big picture of yourself, or skip the work because the idea already feels true",
  },
  "Sun|Saturn": {
    support:
      "you can build a life that matches your standards, and discipline strengthens your confidence instead of replacing it",
    friction:
      "the wish to be yourself can collide with duty or a harsh inner critic, so you may overwork to prove yourself or hold back until the plan feels safe",
  },
  "Sun|Uranus": {
    support:
      "you are at your best when you have room to be original, and change feels like a choice rather than a threat",
    friction:
      "you may rebel just to prove you are free, or feel boxed in by any role that starts to define you",
  },
  "Sun|Neptune": {
    support:
      "imagination and empathy give your sense of self a direction when a hope is tied to a concrete way of showing up",
    friction:
      "you can lose track of what you want because you are absorbing a mood, an ideal, or someone else's story",
  },
  "Sun|Pluto": {
    support:
      "you can commit fully to a goal that matters, and you are willing to change when an old version of you no longer fits",
    friction:
      "identity and control get tangled, so you may try to force an outcome or hold on because letting go feels like losing yourself",
  },
  "Moon|Mercury": {
    support:
      "you can put feelings into clear words, and talking something through actually helps you settle",
    friction:
      "feelings and thoughts can interrupt each other, so you may rationalize a mood or get so flooded that you cannot say the simple thing you mean",
  },
  "Moon|Venus": {
    support:
      "care and affection line up, and you feel close when the relationship is kind and emotionally safe",
    friction:
      "the need to feel safe and the wish to be pleasing can pull apart, so you may give comfort you do not have or withdraw when a relationship asks for more openness",
  },
  "Moon|Mars": {
    support:
      "you can act on an emotional need instead of sitting with it, and protecting what matters can be the same motion as going after it",
    friction:
      "mood and anger trigger each other, so you may react before you know what you feel or swallow irritation until it comes out sideways",
  },
  "Moon|Jupiter": {
    support:
      "emotional honesty and a wider view help each other, and you feel better when care is generous and your life still has room to grow",
    friction:
      "you may swing between needing comfort and chasing a bigger experience, and overextending is the main thing to watch",
  },
  "Moon|Saturn": {
    support:
      "you can build emotional steadiness through routines, boundaries, and responsibilities you actually chose",
    friction:
      "need and duty argue, so you may act as if you have to be fine, delay rest, or treat a feeling as a problem to manage rather than a signal",
  },
  "Moon|Uranus": {
    support:
      "you settle when you have emotional freedom and relationships that do not require you to perform a mood",
    friction:
      "you may detach suddenly when feelings get intense, or feel restless whenever life becomes too predictable",
  },
  "Moon|Neptune": {
    support:
      "you read moods accurately and compassion comes easily, especially when rest and a little solitude keep that sensitivity useful",
    friction:
      "you absorb feelings that are not yours and can confuse sympathy with an obligation",
  },
  "Moon|Pluto": {
    support:
      "you can handle deep feelings honestly, and you are loyal once trust is real",
    friction:
      "emotions can become all-or-nothing, so you may try to control a situation to feel safe or hold a grudge because letting it go feels unsafe",
  },
  "Mercury|Venus": {
    support:
      "you can talk about what you like, what you value, and what you need in a relationship without turning it into a debate",
    friction:
      "the wish to keep things pleasant can blur what you actually think, so you may edit yourself to avoid friction or criticize someone when you meant to ask for care",
  },
  "Mercury|Mars": {
    support:
      "you think fast and can speak up when something needs to move, and clear words help you act",
    friction:
      "words can come out sharp, or you argue to win before you have understood the point",
  },
  "Mercury|Jupiter": {
    support:
      "you learn by connecting a detail to a bigger idea, and you can explain that idea in a way other people can use",
    friction:
      "you may talk in big claims, skip the facts, or commit to a plan before you have checked it",
  },
  "Mercury|Saturn": {
    support:
      "you think in steps, and you can turn a complicated topic into a plan with priorities",
    friction:
      "you may get stuck perfecting the wording, or go quiet because you do not want to be wrong",
  },
  "Mercury|Uranus": {
    support:
      "you see unusual connections and can explain a new idea before other people have caught up",
    friction:
      "your mind can jump ahead, interrupt, or reject a normal explanation just because it is the normal one",
  },
  "Mercury|Neptune": {
    support:
      "you can translate a hunch or a feeling into words other people understand",
    friction:
      "facts and impressions blur, so you may miss a detail, hear what you hoped was said, or struggle to be specific when the mood is strong",
  },
  "Mercury|Pluto": {
    support:
      "you look for the real issue under the stated one, and you can talk about a difficult topic directly",
    friction:
      "a conversation can turn into a need to be right, and pushing someone for a confession creates the conflict you were trying to solve",
  },
  "Venus|Mars": {
    support:
      "desire and affection can move together, so you can want a person or a result and still stay considerate",
    friction:
      "wanting and liking do not always agree, so you may chase a spark and neglect what you value, or keep the peace and resent that you never asked for what you want",
  },
  "Venus|Jupiter": {
    support:
      "you are generous in relationships, and you grow through shared enjoyment or a partnership that widens your life",
    friction:
      "you may overpromise, overspend, or idealize a relationship, and more is not always better",
  },
  "Venus|Saturn": {
    support:
      "you show love through reliability, and a commitment you keep matters more than a grand gesture with no follow-through",
    friction:
      "affection can feel blocked by duty or the belief that you have to earn warmth, so you may hold back or stay because leaving feels irresponsible",
  },
  "Venus|Uranus": {
    support:
      "you care in a way that leaves room for independence, and attraction works when both people can be themselves",
    friction:
      "closeness and freedom argue, so you may pull away when a relationship gets defined or keep things exciting so you never have to be steady",
  },
  "Venus|Neptune": {
    support:
      "you are romantic and empathetic, and you can offer real care when you also keep a clear sense of what you need",
    friction:
      "you can idealize someone, ignore a mismatch, or give past the point of fairness",
  },
  "Venus|Pluto": {
    support:
      "you want honesty and depth in love, and you can commit fully once trust is earned",
    friction:
      "attraction and control get mixed, so jealousy or testing someone can replace the simpler act of saying what you need",
  },
  "Mars|Jupiter": {
    support:
      "you have the energy to pursue a bigger goal, and confidence helps you start",
    friction:
      "you may take on too much, push too hard, or treat a risk as already won",
  },
  "Mars|Saturn": {
    support:
      "you can work steadily toward a hard goal, and you do not need constant excitement to keep going",
    friction:
      "the urge to act meets a brake, so you may feel blocked and angry at the delay, or so controlled that you never start",
  },
  "Mars|Uranus": {
    support:
      "you act quickly when something needs to change, and you are good at breaking a stuck pattern",
    friction:
      "impulse can run ahead of the goal, so you may rush a decision or pick a fight with a limit that was actually useful",
  },
  "Mars|Neptune": {
    support:
      "you act well when the goal means something, and a checked instinct can time the move better than force",
    friction:
      "drive and uncertainty undercut each other, so you may drift, act on an unchecked feeling, or get angry when a hope does not produce a result",
  },
  "Mars|Pluto": {
    support:
      "you have stamina, and you can pursue a difficult goal without quitting when it gets intense",
    friction:
      "you have huge drive and stamina, but you have to watch impatience or power struggles when things don't move on your timeline",
  },
  "Jupiter|Saturn": {
    support:
      "you can aim high and still build the structure that makes the goal real, because optimism and patience correct each other",
    friction:
      "expansion and caution take turns blocking each other, so you may swing from a big promise to a fear that nothing is ready",
  },
  "Jupiter|Uranus": {
    support:
      "you spot openings other people miss, and you are willing to try a plan that looks ahead",
    friction:
      "you may chase freedom or a lucky break and skip the work that would make it last",
  },
  "Jupiter|Neptune": {
    support:
      "your instincts help guide your plans, and you're good at spotting practical ways to bring creative ideas to life",
    friction:
      "big hopes and soft focus can inflate a plan, so you may believe in a vision before you have checked the facts, the cost, or who is actually helped",
  },
  "Jupiter|Pluto": {
    support:
      "you can grow through a serious commitment or a goal that requires real influence used carefully",
    friction:
      "ambition can turn into a need to win or to control how big the result is, and more power is not the same thing as a better plan",
  },
  "Saturn|Uranus": {
    support:
      "you can change a system without throwing away what still works, and a new idea lasts longer when you give it a structure",
    friction:
      "rules and freedom collide, so you may feel trapped by the plan you built or tear it up before it has had time to work",
  },
  "Saturn|Neptune": {
    support:
      "you can give a hope a schedule, a boundary, and a form other people can rely on",
    friction:
      "doubt and idealism wear on each other, so you may dismiss a real hope as unrealistic or avoid a responsibility because it feels meaningless",
  },
  "Saturn|Pluto": {
    support:
      "you can handle heavy responsibility and rebuild a structure that was being held up by fear or control",
    friction:
      "the pressure to stay in charge can become harsh or exhausting, and the work gets cleaner when you drop a rule that only exists to prevent loss",
  },
  "Uranus|Neptune": {
    support:
      "you can imagine a different future, and you are open to an idea that does not copy the usual script",
    friction:
      "restlessness and vagueness can leave you inspired but unanchored, and a change helps only when you can say what, specifically, is ending",
  },
  "Uranus|Pluto": {
    support:
      "you can make a deep change instead of a cosmetic one, especially when an old system has stopped being honest",
    friction:
      "the urge to overturn things can become compulsive, so you may force a transformation or feel that nothing counts unless it is extreme",
  },
  "Neptune|Pluto": {
    support:
      "you can face what is hidden with compassion and turn a private insight into a real change",
    friction:
      "intensity and escape can blur, so you may obsess over a feeling, idealize a crisis, or avoid a truth by making it mysterious",
  },
};

function themeFor(
  bodyA: string,
  bodyB: string,
): { support: string; friction: string } {
  const written = PAIR_THEMES[pairKey(bodyA, bodyB)];
  if (written) return written;
  const governsA = BODY_GOVERNS[bodyA] ?? bodyA.toLowerCase();
  const governsB = BODY_GOVERNS[bodyB] ?? bodyB.toLowerCase();
  return {
    support: `${governsA} can inform ${governsB}, and each one is easier to use when you let it do its own job`,
    friction: `${governsA} and ${governsB} can get in each other's way when you try to satisfy both at the same moment without deciding which one leads`,
  };
}

/** Plain, two-sentence descriptions of a planet in a sign. */
const PLACEMENT_IN_SIGN: Record<string, Record<string, string>> = {
  Sun: {
    Aries:
      "You are direct, decisive, and energized by starting things yourself. You prefer taking action and figuring things out in motion rather than waiting around or overplanning.",
    Taurus:
      "You are steady, practical, and most confident when your life has a solid base. You build identity through reliable habits, tangible results, and sticking with what you value.",
    Gemini:
      "You are curious, quick, and energized by learning and conversation. You feel most like yourself when you can ask questions, share ideas, and keep more than one option open.",
    Cancer:
      "You are protective, emotionally aware, and motivated by taking care of the people you love. You feel most like yourself in familiar settings where loyalty and comfort come first.",
    Leo: "You are warm, confident, and motivated by being recognized for what you actually contribute. You feel most like yourself when you can lead, create, or express yourself openly.",
    Virgo:
      "You are practical, observant, and motivated by doing useful work well. You feel most like yourself when you can improve a process, solve a concrete problem, or be relied on.",
    Libra:
      "You are fair-minded, social, and motivated by cooperation. You feel most like yourself when a decision is balanced, respectful, and made with other people in mind.",
    Scorpio:
      "You are private, focused, and motivated by commitments that go deeper than the surface. You feel most like yourself when you can be honest, loyal, and fully invested.",
    Sagittarius:
      "You are candid, adventurous, and motivated by a bigger picture. You feel most like yourself when you can learn, travel, tell the truth, and keep your life from getting too narrow.",
    Capricorn:
      "You are disciplined, ambitious, and motivated by long-term results. You feel most like yourself when you have a clear goal, a plan, and proof that your effort is paying off.",
    Aquarius:
      "You are independent, inventive, and motivated by ideas that look ahead. You feel most like yourself when you can do things your own way and stay connected to people who respect that.",
    Pisces:
      "You are empathetic, imaginative, and motivated by meaning more than status. You feel most like yourself when you can help, create, or follow a feeling that has a practical outlet.",
  },
  Moon: {
    Aries:
      "You react quickly and feel better once you can do something about what is bothering you. Sitting still with a problem tends to raise your stress, while a clear next step calms you down.",
    Taurus:
      "You feel safest with steady routines, good food, and a comfortable space you can count on. Sudden changes unsettle you, and you recharge by slowing down and sticking with what is familiar.",
    Gemini:
      "You process feelings by talking, reading, or turning them into a clear thought. You recharge through conversation and variety, and you get restless when you have to keep everything inside.",
    Cancer:
      "You feel things deeply and recharge best in safe, familiar spaces with people you trust. Protecting your peace and taking care of your inner circle comes naturally to you.",
    Leo: "You need warmth, appreciation, and a sense that the people close to you are glad you are there. You recharge when you can express yourself and feel genuinely seen, not managed.",
    Virgo:
      "You feel better when the practical details of life are under control. Helping in a concrete way, tidying a problem, or following a useful routine is how you settle your nerves.",
    Libra:
      "You are sensitive to tension between people and feel better when a situation is fair and peaceful. You recharge with pleasant company, and conflict you cannot resolve tends to stay on your mind.",
    Scorpio:
      "You feel things strongly and usually keep them private until you trust someone. You recharge through honesty and a few close bonds, and surface small talk does not settle you.",
    Sagittarius:
      "You need room, honesty, and a sense that life is still expanding. You recharge through movement, humor, learning, or a change of scene, and you feel trapped by heavy routines.",
    Capricorn:
      "You manage feelings by getting practical and making a plan. You recharge when your responsibilities are handled and you have a quiet sense of being on top of things.",
    Aquarius:
      "You need space to process feelings in your own way, often by stepping back and looking at them clearly. You recharge with people who accept you as you are and do not demand a constant emotional performance.",
    Pisces:
      "You absorb other people's moods easily and need quiet time to sort out what is actually yours. You recharge through rest, music, time near water, or any gentle routine that lets you unplug.",
  },
  Mercury: {
    Aries:
      "You think fast and get straight to the point. You prefer honest, direct answers over long debates and trust your first read on a situation.",
    Taurus:
      "You think carefully and prefer ideas you can test in real life. You speak plainly, take your time, and trust conclusions that still hold after you have sat with them.",
    Gemini:
      "You think quickly, ask a lot of questions, and like connecting one idea to another. You communicate best when you can explore options out loud instead of locking in one answer too early.",
    Cancer:
      "You think through memory, mood, and how a choice will affect the people you care about. You communicate best when the conversation feels safe enough to be honest.",
    Leo: "You think in clear stories and speak with confidence when the subject matters to you. You communicate best when you can be direct, warm, and specific about what you actually want.",
    Virgo:
      "You notice details other people skip and you like getting the facts straight. You communicate best when the point is specific, useful, and free of extra noise.",
    Libra:
      "You think by comparing both sides and looking for a fair middle. You communicate best in a calm back-and-forth where people can disagree without talking past each other.",
    Scorpio:
      "You look past the obvious answer and focus on what is actually going on. You communicate best when the talk is honest, and you have little patience for vague or evasive replies.",
    Sagittarius:
      "You think in the big picture and say what you believe, sometimes before you soften it. You communicate best when you can be candid, ask why, and connect a detail to a larger point.",
    Capricorn:
      "You think in steps, priorities, and what will still work next month. You communicate best when the conversation has a point and ends with a clear next action.",
    Aquarius:
      "You think independently and often see a different angle from the one everyone else is using. You communicate best when you can question the usual answer and explain the alternative clearly.",
    Pisces:
      "You pick up tone, context, and what people are not quite saying. You communicate best when you take a moment to put a feeling into plain words instead of assuming others already understand.",
  },
  Venus: {
    Aries:
      "You show interest directly and would rather say what you want than hint. Attraction grows when there is honesty and a clear response, and you lose interest when things stay vague.",
    Taurus:
      "You value consistency, physical comfort, and loyalty you can count on over time. Attraction grows through reliability and shared everyday pleasures, and you are slow to trust sudden intensity.",
    Gemini:
      "You are drawn to people who are curious, funny, and easy to talk to. Attraction grows through conversation, and a relationship goes stale for you when the talk stops.",
    Cancer:
      "You show love by taking care of people and making them feel safe. Emotional security matters more to you than grand gestures, and you need the care to be returned.",
    Leo: "You are warm, generous, and you want affection to be obvious. You feel appreciated when someone is proud to be with you and responds to the effort you put in.",
    Virgo:
      "You show love through practical help, noticing details, and making someone's day easier. You feel close when care is consistent, and empty compliments do not mean much to you.",
    Libra:
      "You value fairness, courtesy, and a relationship that feels like a real partnership. Attraction grows when both people listen, share decisions, and keep the tone respectful.",
    Scorpio:
      "You want loyalty, honesty, and emotional depth, and you can tell when someone is holding back. Trust builds slowly for you, and once it is there you take the bond seriously.",
    Sagittarius:
      "You want honesty, humor, and enough freedom to keep growing inside a relationship. Attraction grows when you can be candid, and control makes you pull away.",
    Capricorn:
      "You take love and commitment seriously and show care through reliability over time. You feel secure when plans are kept and the effort is mutual, and you are wary of drama without follow-through.",
    Aquarius:
      "You need friendship, independence, and respect for differences inside a relationship. Attraction grows when you can be yourself without being managed, and you value a partner who thinks for themselves.",
    Pisces:
      "You are empathetic, romantic, and generous with the people you care about. Emotional closeness matters more to you than status, though you need clear boundaries so you don't overgive.",
  },
  Mars: {
    Aries:
      "You act quickly once you know what you want, and waiting around drains you. You do your best work with a clear target and the freedom to start now.",
    Taurus:
      "You move steadily and prefer to finish what you start rather than chase every new idea. Your energy lasts when the goal is concrete and the pace is one you chose.",
    Gemini:
      "You put energy into ideas, messages, and trying more than one approach. You work best when the task stays interesting, and you stall when it is repetitive with no room to think.",
    Cancer:
      "You act to protect the people and situations you care about. Your drive is strongest when the goal feels personal, and you pull back when a fight does not seem worth the emotional cost.",
    Leo: "You put energy into goals you can be proud of, and you work harder when the effort is recognized. You do your best when you can lead a piece of the work instead of staying invisible.",
    Virgo:
      "You aim your energy at fixing what is inefficient and getting the details right. You work best with a clear method, and a sloppy plan frustrates you faster than hard work does.",
    Libra:
      "You would rather act with someone than against them, but you will push when something is unfair. You work best when the goal is clear and the people involved are treated with respect.",
    Scorpio:
      "You focus hard once you commit, and you do not like quitting halfway. You work best with a meaningful goal, and secrecy or a power struggle around the work will pull your attention.",
    Sagittarius:
      "You are motivated by a goal that feels bigger than the task in front of you. You work best with room to move and a reason you believe in, and being micromanaged shuts you down.",
    Capricorn:
      "You pace yourself and keep going after other people lose interest. You work best with a real deadline, a standard you respect, and visible progress over time.",
    Aquarius:
      "You are motivated by doing it your own way and by a goal that feels original or useful to a group. You work best with independence, and a rigid rule without a reason makes you resist.",
    Pisces:
      "You act from a feeling about what matters, and forced effort tends to stall you. You work best when the goal is meaningful and you have a little quiet time to find a real starting point.",
  },
  Jupiter: {
    Aries:
      "You grow by taking the first step before the plan is perfect. Opportunities open when you act, and you learn more from trying than from waiting for certainty.",
    Taurus:
      "You grow by building something stable and letting it compound. Opportunities tend to come through patience, practical skill, and resources you have taken care of.",
    Gemini:
      "You grow through conversations, classes, and following a question one step further. Opportunities show up when you stay curious and keep talking to people outside your usual circle.",
    Cancer:
      "You grow through the people who feel like home and through taking care of a real base. Opportunities often come from family, close friends, or work that makes other people feel safe.",
    Leo: "You grow when you share what you are good at and let people see it. Opportunities come from confidence, generosity, and being willing to take a visible role.",
    Virgo:
      "You grow by getting better at a useful skill and applying it carefully. Opportunities come from competence, preparation, and being the person who can actually do the job.",
    Libra:
      "You grow through partnerships and learning how to cooperate without disappearing. Opportunities often come from other people when the exchange is fair.",
    Scorpio:
      "You grow by facing what is difficult and committing fully once you trust the path. Opportunities come from research, shared resources, and situations that require honesty.",
    Sagittarius:
      "You grow by studying, traveling, or following a belief into real experience. Opportunities open when you say yes to a bigger view and then do the work it requires.",
    Capricorn:
      "You grow through long-term goals, responsibility, and results you can point to. Opportunities come from reputation, planning, and staying with a hard task longer than is comfortable.",
    Aquarius:
      "You grow through new ideas, groups, and projects that look ahead. Opportunities come when you share an unconventional plan with people who can help build it.",
    Pisces:
      "You grow through imagination, compassion, and a well-tested instinct. Opportunities come when a creative or caring idea is paired with one simple practical step.",
  },
  Saturn: {
    Aries:
      "You build discipline by learning to start and also to finish, without rushing past the hard middle. Your confidence grows when you take responsibility for the first move and then follow a plan.",
    Taurus:
      "You build security through patience, budgets, and habits you can keep. The long-term payoff comes from not abandoning a solid plan just because progress feels slow.",
    Gemini:
      "You build skill by organizing your thoughts and following through on what you say. Clear writing, study, and consistent communication are where the effort pays off.",
    Cancer:
      "You build stability by setting boundaries around home, family, and emotional care. The long-term payoff comes from protecting your private life without shutting people out completely.",
    Leo: "You build confidence by doing work you can stand behind in public. Recognition lasts for you when it is tied to real effort, not just being noticed.",
    Virgo:
      "You build mastery through practice and improving the method. The long-term payoff comes from high standards that stay useful instead of turning into endless self-criticism.",
    Libra:
      "You build trust by keeping agreements and being fair when it would be easier to please everyone. The long-term payoff comes from clear terms in relationships and collaborations.",
    Scorpio:
      "You build strength by facing a difficult truth and staying with a commitment after the easy part ends. The long-term payoff comes from self-control and honesty about shared power or money.",
    Sagittarius:
      "You build judgment by testing a belief against real experience and sticking with a course of study. The long-term payoff comes from a point of view you can explain and live by.",
    Capricorn:
      "You build results through patience, responsibility, and standards you keep even when no one is watching. The long-term payoff comes from work that turns into a reputation you earned.",
    Aquarius:
      "You build a future by committing to an original idea long enough to make it real. The long-term payoff comes from independence that still includes a structure and follow-through.",
    Pisces:
      "You build limits around sensitivity so imagination and compassion have a schedule. The long-term payoff comes from rest, boundaries, and a practice that keeps you grounded.",
  },
  Uranus: {
    Aries:
      "You need the freedom to start something new without waiting for permission. Change works best for you when you act on a real idea, not only react against a rule.",
    Taurus:
      "You need room to change how you handle money, comfort, and daily stability. You resist being locked into someone else's routine, and you update your life in practical steps.",
    Gemini:
      "You need freedom in how you think, learn, and speak. You do your best work when you can question the usual explanation and try a different way of saying it.",
    Cancer:
      "You need freedom in how you define home and family. You are willing to change an old domestic pattern when it no longer feels honest or safe.",
    Leo: "You need freedom to express yourself without performing a role someone else assigned. You change course when being seen starts to require hiding what you actually think.",
    Virgo:
      "You need freedom to improve the method instead of following a process that does not work. You change a routine when a clearer, more useful system becomes obvious.",
    Libra:
      "You need freedom and equal say inside relationships. You pull away from an arrangement that looks polite on the surface but is not actually fair.",
    Scorpio:
      "You need freedom to tell the truth about trust, power, and what you will no longer hide. Change comes when you stop protecting a situation that is already over.",
    Sagittarius:
      "You need freedom to change a belief, a trip, or a course of study when a bigger truth shows up. You get restless when a plan is too small for what you have learned.",
    Capricorn:
      "You need freedom to update the rules of your career and public role. You respect structure, and you will rewrite it when the old ladder no longer fits the work.",
    Aquarius:
      "You need independence, and you are comfortable standing apart from the usual plan. Change comes more easily when you can invent a better system and find people who want it too.",
    Pisces:
      "You need freedom in your inner life and imagination. You change when an instinct is strong enough that staying in the old pattern stops making sense.",
  },
  Neptune: {
    Aries:
      "You trust instincts that push you to act, and you picture a life you can start building now. That instinct is useful when you test it with one concrete step instead of only feeling inspired.",
    Taurus:
      "You sense value through comfort, beauty, and what feels solid in real life. Your imagination works best when you turn it into something you can see, use, or rely on.",
    Gemini:
      "You pick up ideas and stories quickly, sometimes before the facts are complete. Your instinct is useful when you write it down and check it against what was actually said.",
    Cancer:
      "You sense what the people close to you need, sometimes before they say it. That care stays healthy when you also ask what you yourself need.",
    Leo: "You picture a life where your creativity is visible and meaningful. The instinct shows up in what you want to make, and it needs a real project so it does not stay a daydream.",
    Virgo:
      "You notice small mismatches and quiet problems other people overlook. Your instinct is practical when you use it to improve a task, a schedule, or the way you take care of yourself.",
    Libra:
      "You sense the mood between people and can picture how a situation could be fairer. That instinct helps when you name what you notice instead of only smoothing it over.",
    Scorpio:
      "You sense what is being left out of a situation, and a surface explanation rarely satisfies you. Your instinct is strongest when you pair it with facts and do not assume the worst.",
    Sagittarius:
      "You picture a bigger life and you are drawn to study, travel, and questions that widen your view. The instinct helps when you follow it with experience, not only hope.",
    Capricorn:
      "You picture goals that can become a real plan, and a vague dream frustrates you. Your instinct is useful when you give it a timeline, a budget, or a next step at work.",
    Aquarius:
      "You picture better systems and futures that do not copy the usual path. The instinct helps a group when you explain the idea in plain terms and test whether it works.",
    Pisces:
      "You are highly receptive and often feel the mood of a situation before anyone explains it. Imagination is a strength when you give it a creative outlet and a boundary so you are not absorbing everything.",
  },
  Pluto: {
    Aries:
      "You deal with power by taking the lead, and you are ready to start over when a situation has become false. The change sticks when you aim that intensity at a goal instead of at other people.",
    Taurus:
      "You deal with power through money, security, and what you refuse to give up. Deep change for you usually means revising what you own, earn, or treat as non-negotiable.",
    Gemini:
      "You deal with power through information and the story you keep telling. Deep change starts when you stop repeating an explanation that no longer fits the facts.",
    Cancer:
      "You deal with power through family patterns and the need to feel safe. Deep change means choosing which habits of care to keep and which ones are only old fear.",
    Leo: "You deal with power through pride, creativity, and how you want to be seen. Deep change means letting go of a role that gets attention but does not feel true.",
    Virgo:
      "You deal with power through work, health, and the need to get things right. Deep change means dropping a standard or habit that is controlling you more than it is helping.",
    Libra:
      "You deal with power inside partnerships and the wish to avoid open conflict. Deep change means telling the truth about what is unfair instead of keeping the peace at your own expense.",
    Scorpio:
      "You deal with trust, shared resources, and control with unusual intensity. Deep change comes when you stop trying to manage every outcome and deal directly with what is actually ending or beginning.",
    Sagittarius:
      "You deal with power through beliefs and the meaning you attach to events. Deep change means updating a worldview that once protected you and now limits your choices.",
    Capricorn:
      "You deal with power through status, responsibility, and control of the plan. Deep change means using authority cleanly and letting go of a structure that only exists to keep you in charge.",
    Aquarius:
      "You deal with power through groups, ideas, and the pressure to fit in or stand apart. Deep change means leaving a system or identity that no longer matches what you know.",
    Pisces:
      "You deal with power by empathizing, avoiding, or softening a hard problem. Deep change means facing what you have been avoiding and choosing a boundary instead of disappearing.",
  },
  Ascendant: {
    Aries:
      "People meet you as direct, energetic, and ready to start. You come across as someone who would rather act than wait for a perfect opening.",
    Taurus:
      "People meet you as calm, steady, and hard to rush. You come across as someone who values comfort, follow-through, and a practical pace.",
    Gemini:
      "People meet you as curious, talkative, and quick to engage. You come across as someone who wants the facts and the next question.",
    Cancer:
      "People meet you as warm, careful, and attentive to mood. You come across as someone who is protective and who notices whether a situation feels safe.",
    Leo: "People meet you as warm, confident, and easy to notice. You come across as someone who is open with enthusiasm and expects a genuine response.",
    Virgo:
      "People meet you as observant, polite, and capable. You come across as someone who notices details and prefers a clear, useful conversation.",
    Libra:
      "People meet you as pleasant, fair, and socially aware. You come across as someone who wants the interaction to feel respectful on both sides.",
    Scorpio:
      "People meet you as focused, private, and hard to read at first. You come across as someone who pays close attention and does not waste warmth on small talk.",
    Sagittarius:
      "People meet you as candid, upbeat, and interested in the bigger point. You come across as someone who speaks freely and likes room to move.",
    Capricorn:
      "People meet you as composed, serious, and competent. You come across as someone who has a plan and does not need to fill every silence.",
    Aquarius:
      "People meet you as independent, friendly, and a little unexpected. You come across as someone who thinks for themselves and is not trying to match the room.",
    Pisces:
      "People meet you as gentle, receptive, and easy to talk to. You come across as someone who reads the mood before deciding how direct to be.",
  },
  Midheaven: {
    Aries:
      "In public and at work, you are seen as someone who starts things and takes the lead. Your reputation grows when you act decisively and own the result.",
    Taurus:
      "In public and at work, you are seen as reliable, practical, and hard to shake. Your reputation grows through consistent output and results people can count on.",
    Gemini:
      "In public and at work, you are seen as someone who can explain, connect, and adapt. Your reputation grows through writing, speaking, teaching, or handling information well.",
    Cancer:
      "In public and at work, you are seen as caring and attentive to what people need. Your reputation grows through work that supports others or builds a base people can trust.",
    Leo: "In public and at work, you are seen as confident, creative, and willing to be visible. Your reputation grows when you lead with warmth and stand behind work you are proud of.",
    Virgo:
      "In public and at work, you are seen as skilled, precise, and useful. Your reputation grows through competence and fixing problems other people miss.",
    Libra:
      "In public and at work, you are seen as fair, collaborative, and good with people. Your reputation grows through partnership, design, negotiation, or any role that needs balance.",
    Scorpio:
      "In public and at work, you are seen as focused, strategic, and able to handle sensitive material. Your reputation grows when you take on work that requires trust, research, or a real change.",
    Sagittarius:
      "In public and at work, you are seen as candid and aimed at a bigger goal. Your reputation grows through teaching, publishing, travel, or work tied to a clear point of view.",
    Capricorn:
      "In public and at work, you are seen as disciplined, ambitious, and ready for responsibility. Your reputation grows through long-term results and standards you keep.",
    Aquarius:
      "In public and at work, you are seen as independent, inventive, and aimed at what comes next. Your reputation grows through original ideas, groups, or a path that does not copy the standard one.",
    Pisces:
      "In public and at work, you are seen as imaginative, empathetic, and hard to put in one category. Your reputation grows through creative or caring work that still has a clear result.",
  },
};

const PLACEMENT_QUESTIONS: Record<string, string> = {
  Sun: "Where in your life right now do you feel most like yourself?",
  Moon: "What actually helps you recharge when your stress spikes?",
  Mercury:
    "What is one thing you've been overthinking that would be simpler to say plainly?",
  Venus:
    "What makes you feel genuinely appreciated in your closest relationships?",
  Mars: "What goal deserves your energy right now instead of scattered effort?",
  Jupiter: "Where would taking a calculated risk open up more room to grow?",
  Saturn: "Which habit or boundary is paying off over the long run?",
  Uranus: "Where are you outgrowing an old routine or expectation?",
  Neptune:
    "Where is your intuition pointing, and what practical step would test it?",
  Pluto: "What are you ready to stop forcing or trying to control?",
  Ascendant:
    "What do people assume about you in the first minute, and does it match how you want to show up?",
  Midheaven:
    "What kind of work do you want to be known for over the next few years?",
};

export function explainPlacementFull(
  body: string,
  sign: string,
): {
  title: string;
  summary: string;
  detail: string;
  keywords: string[];
  question: string;
} {
  return {
    title: BODY_TITLES[body] ?? body,
    summary: SIGN_SUMMARY[sign] ?? sign,
    detail: PLACEMENT_IN_SIGN[body]?.[sign] ?? explainPlacement(body, sign),
    keywords: SIGN_KEYWORDS[sign] ?? [],
    question:
      PLACEMENT_QUESTIONS[body] ??
      `Where does your ${body.toLowerCase()} ask for a clearer choice right now?`,
  };
}

/** One-line explanation for a Sun/Moon/etc-in-Sign placement. */
export function explainPlacement(body: string, sign: string): string {
  const written = PLACEMENT_IN_SIGN[body]?.[sign];
  if (written) return written;
  const domain = BODY_MEANINGS[body] ?? "a part of who you are";
  const trait = SIGN_TRAITS[sign] ?? sign.toLowerCase();
  return `${body} in ${sign} describes ${domain}. Day to day, that looks like someone who is ${trait}.`;
}

export function explainHouse(house: number): string {
  return HOUSE_MEANINGS[house] ?? "";
}

/** Full house write-up: detail paragraph + a reflective question, for the
 * expanded House row on the Chart page. */
export function explainHouseFull(house: number): HouseMeaning | null {
  const full = HOUSE_MEANINGS_FULL[house];
  if (!full) return null;
  if (full.question) return full;
  return { ...full, question: HOUSE_QUESTION[house] ?? "" };
}

export function explainAspect(aspectKey: string): string {
  return ASPECT_MEANINGS[aspectKey.toLowerCase()] ?? "";
}

export function explainAspectFull(
  bodyA: string,
  bodyB: string,
  aspectKey: string,
): {
  title: string;
  summary: string;
  detail: string;
  keywords: string[];
  question: string;
} {
  const key = aspectKey.toLowerCase();
  return {
    title: ASPECT_TITLES[key] ?? aspectKey,
    summary: ASPECT_MEANINGS_FULL[key]?.nature ?? aspectKey,
    detail: explainAspectPair(bodyA, bodyB, aspectKey),
    keywords: ASPECT_KEYWORDS[key] ?? [],
    question: aspectQuestion(bodyA, bodyB, key),
  };
}

function plainRole(body: string): string {
  return (BODY_ROLES[body] ?? body).toLowerCase();
}

function aspectQuestion(bodyA: string, bodyB: string, key: string): string {
  const roleA = plainRole(bodyA);
  const roleB = plainRole(bodyB);
  if (key === "square") {
    return `When your ${roleA} and ${roleB} clash, how can you pause before reacting?`;
  }
  if (key === "opposition") {
    return `How can you make room for both ${roleA} and ${roleB} instead of swinging from one extreme to the other?`;
  }
  if (key === "sextile" || key === "trine") {
    return `Where can you lean on this natural link between ${roleA} and ${roleB} this week?`;
  }
  if (key === "conjunction") {
    return `How are you channeling this combined focus on ${roleA} and ${roleB}?`;
  }
  if (key === "quincunx") {
    return `What small adjustment helps your ${roleA} and ${roleB} stop working at cross-purposes?`;
  }
  return `How do your ${roleA} and ${roleB} show up in the same decision?`;
}

/** What two planets are doing at this angle, in everyday behavior. */
export function explainAspectPair(
  bodyA: string,
  bodyB: string,
  aspectKey: string,
): string {
  const key = aspectKey.toLowerCase();
  const governsA = BODY_GOVERNS[bodyA] ?? bodyA.toLowerCase();
  const governsB = BODY_GOVERNS[bodyB] ?? bodyB.toLowerCase();
  const intro = `${bodyA} governs ${governsA}, while ${bodyB} governs ${governsB}.`;
  const { support, friction } = themeFor(bodyA, bodyB);
  const angle = ASPECT_ANGLE_LABEL[key] ?? key;
  if (key === "sextile") {
    return `${intro} A ${angle.toLowerCase()} means these two parts of you cooperate easily: ${support}.`;
  }
  if (key === "trine") {
    return `${intro} A ${angle.toLowerCase()} means they support each other with little effort: ${support}.`;
  }
  if (key === "square") {
    return `${intro} A ${angle.toLowerCase()} creates real internal pressure between them—${friction}.`;
  }
  if (key === "opposition") {
    return `${intro} A ${angle.toLowerCase()} pulls you in two directions: ${friction}. The workable move is to give both a place in the same decision instead of swinging from one extreme to the other.`;
  }
  if (key === "conjunction") {
    return `${intro} A ${angle.toLowerCase()} blends them into one focus: ${support}.`;
  }
  if (key === "quincunx") {
    const lead = friction.charAt(0).toUpperCase() + friction.slice(1);
    return `${intro} A ${angle.toLowerCase()} means they do not share a natural method. ${lead}. A small adjustment in timing, priority, or boundaries helps them stop working at cross-purposes.`;
  }
  return intro;
}
