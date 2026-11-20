/**
 * Group / Tandem sky helpers for GroupReadRoom.
 * Voice: direct, clear, action-first. Unite the room. Move people forward.
 * Structure: overview of the dynamic, then how each person plays in.
 */
import { FULL_DECK } from "../data/fullDeck.js";
import type { ArcanaCard } from "../data/arcana.js";
import { ELEMENT_LINE, MODE_LINE } from "./groupReadVoice.js";

export type GroupPerson = {
  id: string;
  name: string;
  chart: { sun: string; moon: string; rising: string; seed: string };
  pronouns?: string;
  gender?: string;
  orientation?: string;
};

export type ReadLens = {
  question: string;
  connectionId: string;
  connectionLabel: string;
  otherText: string;
  leadId: string;
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
const WATER = new Set(["Cancer", "Scorpio", "Pisces"]);
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

function roleLine(person: GroupPerson): string {
  const el = elementOf(person.chart.sun);
  const mode = modeOf(person.chart.sun);
  const elText = ELEMENT_LINE[el];
  const modeText = MODE_LINE[mode];
  const moon = person.chart.moon;
  const rising = person.chart.rising;
  return (
    `${person.name} holds the ${person.chart.sun} seat in this room. ${elText} ` +
    `${modeText} ` +
    `Moon in ${moon} shows what they need in order to stay in the work; rising in ${rising} is how the group meets them. ` +
    `Use ${person.name} for what they already do well — do not ask them to become someone else.`
  );
}

export function chartFromSigns(input: {
  sun: string;
  moon: string;
  rising: string;
  seed: string;
}) {
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
    lens?.connectionId === "other" && lens.otherText.trim()
      ? lens.otherText.trim()
      : lens?.connectionLabel || (tandem ? "Tandem" : "Group");

  const question = lens?.question?.trim() ?? "";
  const seed = `${people.map(p => p.id).join("-")}-${when.toISOString().slice(0, 10)}-${question}`;
  const cards = pickCards(seed, 7);

  const portrait = overview(people, tandem, connection, question, cards);

  const personBlocks = people.map(roleLine).join("\n\n");

  const cardBlocks = cards.map(cardCall).join(" ");

  const close = tandem
    ? `Between ${names[0]} and ${names[1]}, the work is simple: agree on the next step, write it down, and do it before the day ends. Strength grows when both of you keep the same promise.`
    : `This group gets stronger when effort is aimed. Pick the decision. Name who owns it. Set the date. Then protect that plan until it is real.`;

  const sections: GroupSection[] = [
    {
      heading: "The dynamic",
      text: portrait,
    },
    {
      heading: "How each person plays in",
      text: personBlocks,
    },
    {
      heading: "What the cards say",
      text: cardBlocks,
    },
    {
      heading: "The move",
      text: close,
    },
  ];

  const body = sections.map(s => `${s.heading}\n\n${s.text}`).join("\n\n");

  const details = people.map(
    p => `${p.name}: Sun ${p.chart.sun}, Moon ${p.chart.moon}, Rising ${p.chart.rising}`,
  );

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
  };
}
