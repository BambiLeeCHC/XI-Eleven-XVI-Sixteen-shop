/**
 * Group / Tandem sky helpers.
 * Shared by GroupReadRoom (client) and api/_lib/groupRead (server).
 * Voice: direct, clear, action-first.
 */
import { FULL_DECK } from "../data/fullDeck.js";
import type { ArcanaCard } from "../data/arcana.js";
import { ELEMENT_LINE, MODE_LINE } from "./groupReadVoice.js";

export type ChartPlacement = {
  body: string;
  sign: string;
  degree: number;
  degreeInSign: number;
  house: number;
};

/**
 * Full natal chart shape used by the server path.
 * Matches api/_lib/natalChart.computeNatalChart return shape for the fields we keep.
 */
export type FullChart = {
  /** Sign name of the ascendant, e.g. "Leo" */
  ascendant: string;
  ascendantDegree?: number;
  placements: ChartPlacement[];
  houses: Array<{ house: number; sign: string; degree: number }>;
};

/** Lightweight client chart when only signs are known. */
export type SignChart = {
  sun: string;
  moon: string;
  rising: string;
  seed: string;
};

export type GroupPerson = {
  id: string;
  name: string;
  chart: FullChart | SignChart;
  pronouns?: string;
  gender?: string;
  orientation?: string;
};

export type ReadLens = {
  question?: string;
  connectionId?: string;
  connectionLabel?: string;
  otherText?: string;
  leadId?: string;
};

export type GroupCard = {
  slot: string;
  slotName: string;
  card: ArcanaCard;
  reversed: boolean;
};

export type GroupSection = {
  heading: string;
  text: string;
};

export type GroupRole = {
  id: string;
  name: string;
  line: string;
};

export type GroupReading = {
  title: string;
  body: string;
  bond: string;
  connection: string;
  question: string;
  portrait: string;
  cards: GroupCard[];
  sections: GroupSection[];
  details: string[];
  /** Server + voice layer */
  kindLabel: string;
  privateNote: string;
  roles: GroupRole[];
  magnetize: string;
  breakthrough: string;
  directive: string;
};

export const GROUP_BONDS = [
  { id: "friends", label: "Friends" },
  { id: "team", label: "Team / collaborators" },
  { id: "family", label: "Family" },
  { id: "partners", label: "Partners" },
  { id: "circle", label: "Creative circle" },
  { id: "other", label: "Other" },
] as const;

export const TANDEM_BONDS = [
  { id: "friends", label: "Friends" },
  { id: "partners", label: "Partners" },
  { id: "parent-child", label: "Parent and child" },
  { id: "mother-daughter", label: "Mother and daughter" },
  { id: "mother-son", label: "Mother and son" },
  { id: "father-daughter", label: "Father and daughter" },
  { id: "father-son", label: "Father and son" },
  { id: "mentor", label: "Mentor and mentee" },
  { id: "other", label: "Other" },
] as const;

const FIRE = new Set(["Aries", "Leo", "Sagittarius"]);
const EARTH = new Set(["Taurus", "Virgo", "Capricorn"]);
const AIR = new Set(["Gemini", "Libra", "Aquarius"]);
const CARDINAL = new Set(["Aries", "Cancer", "Libra", "Capricorn"]);
const FIXED = new Set(["Taurus", "Leo", "Scorpio", "Aquarius"]);

function elementOf(sign: string): "fire" | "earth" | "air" | "water" {
  if (FIRE.has(sign)) return "fire";
  if (EARTH.has(sign)) return "earth";
  if (AIR.has(sign)) return "air";
  return "water";
}

function modeOf(sign: string): "cardinal" | "fixed" | "mutable" {
  if (CARDINAL.has(sign)) return "cardinal";
  if (FIXED.has(sign)) return "fixed";
  return "mutable";
}

function isSignChart(chart: FullChart | SignChart): chart is SignChart {
  return "sun" in chart && "moon" in chart && "rising" in chart;
}

function signsOf(person: GroupPerson): { sun: string; moon: string; rising: string } {
  if (isSignChart(person.chart)) {
    return { sun: person.chart.sun, moon: person.chart.moon, rising: person.chart.rising };
  }
  const sun = person.chart.placements.find(p => /sun/i.test(p.body))?.sign ?? "Leo";
  const moon = person.chart.placements.find(p => /moon/i.test(p.body))?.sign ?? "Cancer";
  const rising =
    typeof person.chart.ascendant === "string" && person.chart.ascendant
      ? person.chart.ascendant
      : "Aries";
  return { sun, moon, rising };
}

function roleLine(person: GroupPerson): string {
  const { sun, moon, rising } = signsOf(person);
  const el = elementOf(sun);
  const mode = modeOf(sun);
  return (
    `${person.name} holds the ${sun} seat in this room. ${ELEMENT_LINE[el]} ${MODE_LINE[mode]} ` +
    `Moon in ${moon} shows what they need to stay in the work; rising in ${rising} is how the group meets them. ` +
    `Use ${person.name} for what they already do well — do not ask them to become someone else.`
  );
}

export function chartFromSigns(input: {
  sun: string;
  moon: string;
  rising: string;
  seed: string;
}): SignChart {
  return {
    sun: input.sun,
    moon: input.moon,
    rising: input.rising,
    seed: input.seed,
  };
}

export function promptIdeas(connectionId: string, tandem: boolean): string[] {
  if (tandem) {
    if (connectionId === "partners") {
      return [
        "What is the next honest step for us?",
        "Where should we put shared effort this week?",
        "What strength are we underusing together?",
      ];
    }
    if (
      connectionId.includes("parent") ||
      connectionId.includes("mother") ||
      connectionId.includes("father")
    ) {
      return [
        "What does support look like right now?",
        "Where can we meet without force?",
        "What is one thing we should protect together?",
      ];
    }
    return [
      "What is the clearest move for the two of us?",
      "Where is the energy already working?",
      "What should we stop carrying alone?",
    ];
  }
  return [
    "What is this group here to build?",
    "Where should we aim our effort first?",
    "What strength in the room is underused?",
    "What decision would move everyone forward?",
  ];
}

function pickCards(seed: string, count: number): GroupCard[] {
  const slots = [
    { slot: "root", slotName: "Root" },
    { slot: "support", slotName: "Quiet Support" },
    { slot: "you", slotName: "For You" },
    { slot: "move", slotName: "Best Move" },
    { slot: "gift", slotName: "Untapped Gift" },
    { slot: "best", slotName: "Best Case" },
    { slot: "edge", slotName: "Your Advantage" },
  ];
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  const out: GroupCard[] = [];
  const used = new Set<number>();
  for (let i = 0; i < Math.min(count, slots.length); i++) {
    let idx = (n + i * 17) % FULL_DECK.length;
    while (used.has(idx)) idx = (idx + 1) % FULL_DECK.length;
    used.add(idx);
    out.push({
      slot: slots[i].slot,
      slotName: slots[i].slotName,
      card: FULL_DECK[idx],
      reversed: ((n >> i) & 1) === 1,
    });
  }
  return out;
}

function cardCall(card: GroupCard): string {
  const name = card.card.name;
  const rev = card.reversed ? " (reversed)" : "";
  const upright =
    (card.card.upright || "")
      .trim()
      .split(/(?<=\.)\s/)[0]
      ?.trim() || "Act on what is already clear.";
  if (card.reversed) {
    return `${card.slotName} — ${name}${rev}. The lesson is the same, only sooner. ${upright} Do not wait for perfect conditions.`;
  }
  return `${card.slotName} — ${name}. ${upright}`;
}

function overview(
  people: GroupPerson[],
  tandem: boolean,
  connection: string,
  question: string,
  cards: GroupCard[],
): string {
  const names = people.map(p => p.name);
  const who = tandem
    ? `${names[0]} and ${names[1]}`
    : names.length <= 3
      ? names.join(", ")
      : `${names.slice(0, 2).join(", ")} and ${names.length - 2} others`;

  const root = cards.find(c => c.slot === "root");
  const move = cards.find(c => c.slot === "move");
  const gift = cards.find(c => c.slot === "gift");

  const rootBit = root
    ? `The root of this reading is ${root.card.name}${root.reversed ? " reversed" : ""} — that is the ground you are standing on.`
    : "The charts and cards agree: this room has enough strength to move.";
  const moveBit = move
    ? ` The best move on the table is ${move.card.name}${move.reversed ? " reversed" : ""}. Treat it as an instruction, not a suggestion.`
    : "";
  const giftBit = gift
    ? ` Your untapped gift is ${gift.card.name}${gift.reversed ? " reversed" : ""} — name it out loud and put someone in charge of using it.`
    : "";

  const ask = question
    ? ` You asked: “${question}.” Answer it with one decision the whole group can own today.`
    : " Make one shared decision today — concrete, dated, and owned by name.";

  if (tandem) {
    return (
      `${who} are in this as a pair (${connection}). ` +
      `${rootBit}${moveBit}${giftBit}` +
      ` You do not need more analysis. You need one clear step that both of you will protect.` +
      ask
    );
  }

  return (
    `${who} form this group (${connection}). ` +
    `${rootBit}${moveBit}${giftBit}` +
    ` The power in this room is real. It becomes useful the moment roles are clear and one aim is shared.` +
    ask
  );
}

export function composeGroupReading(
  people: GroupPerson[],
  when: Date = new Date(),
  lens?: ReadLens,
): GroupReading {
  const tandem = people.length === 2;
  const names = people.map(p => p.name);
  const title = tandem
    ? `${names[0]} & ${names[1]}`
    : names.length <= 3
      ? names.join(", ")
      : `${names.slice(0, 2).join(", ")} + ${names.length - 2} more`;

  const connection =
    lens?.connectionId === "other" && (lens.otherText ?? "").trim()
      ? (lens.otherText ?? "").trim()
      : lens?.connectionLabel || (tandem ? "Tandem" : "Group");

  const question = (lens?.question ?? "").trim();
  const seed = `${people.map(p => p.id).join("-")}-${when.toISOString().slice(0, 10)}-${question}`;
  const cards = pickCards(seed, 7);

  const portrait = overview(people, tandem, connection, question, cards);
  const roles: GroupRole[] = people.map(p => ({
    id: p.id,
    name: p.name,
    line: roleLine(p),
  }));

  const personBlocks = roles.map(r => r.line).join("\n\n");
  const cardBlocks = cards.map(cardCall).join(" ");

  const magnetize =
    cards.find(c => c.slot === "support") != null
      ? cardCall(cards.find(c => c.slot === "support")!)
      : "The room already has chemistry. Put it toward one shared aim.";

  const breakthrough =
    cards.find(c => c.slot === "gift") != null
      ? cardCall(cards.find(c => c.slot === "gift")!)
      : "The breakthrough is using a strength you already have instead of hunting for a new one.";

  const directive = tandem
    ? `Between ${names[0]} and ${names[1]}, the work is simple: agree on the next step, write it down, and do it before the day ends. Strength grows when both of you keep the same promise.`
    : `This group gets stronger when effort is aimed. Pick the decision. Name who owns it. Set the date. Then protect that plan until it is real.`;

  const sections: GroupSection[] = [
    { heading: "The dynamic", text: portrait },
    { heading: "How each person plays in", text: personBlocks },
    { heading: "Where you magnetize", text: magnetize },
    { heading: "Breakthrough", text: breakthrough },
    { heading: "What the cards say", text: cardBlocks },
    { heading: "Your next step", text: directive },
  ];

  const body = sections.map(s => `${s.heading}\n\n${s.text}`).join("\n\n");

  const details = people.map(p => {
    const s = signsOf(p);
    return `${p.name}: Sun ${s.sun}, Moon ${s.moon}, Rising ${s.rising}`;
  });

  const privateBits = people
    .map(p => {
      const bits = [p.pronouns, p.gender, p.orientation].filter(Boolean);
      return bits.length ? `${p.name}: ${bits.join(", ")}` : "";
    })
    .filter(Boolean);

  return {
    title,
    body,
    bond: connection,
    connection,
    question,
    portrait,
    cards,
    sections,
    details,
    kindLabel: tandem ? "Tandem" : "Group Read",
    privateNote: privateBits.join("\n"),
    roles,
    magnetize,
    breakthrough,
    directive,
  };
}
