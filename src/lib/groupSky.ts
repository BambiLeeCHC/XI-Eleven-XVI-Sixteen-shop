/**
 * Group / Tandem sky helpers.
 * Shared by GroupReadRoom (client) and api/_lib/groupRead (server).
 * Voice: plain English, short sentences, clear next steps.
 */
import { FULL_DECK } from "../data/fullDeck.js";
import type { ArcanaCard } from "../data/arcana.js";

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
  /** One plain sentence for this position. */
  line: string;
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

function roleLine(person: GroupPerson, index: number): string {
  const seats = [
    "starts the decision and keeps it moving",
    "writes the plan so everyone hears the same thing",
    "turns the decision into steps and a deadline",
    "checks that the plan is honest and people can live with it",
  ];
  const job = seats[index % seats.length];
  const pronouns = (person.pronouns ?? "").toLowerCase();
  const stay = pronouns.startsWith("she")
    ? `She stays with what she already does well, on her own terms.`
    : pronouns.startsWith("he")
      ? `He stays with what he already does well, on his own terms.`
      : `They stay with what they already do well, on their own terms.`;
  return `${person.name} ${job}. ${stay}`;
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

function pickCards(seed: string): GroupCard[] {
  const slots = [
    { slot: "where", slotName: "Where you are" },
    { slot: "means", slotName: "What it means" },
    { slot: "do", slotName: "What to do" },
  ];
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  const out: GroupCard[] = [];
  const used = new Set<number>();
  for (let i = 0; i < slots.length; i++) {
    let idx = (n + i * 17) % FULL_DECK.length;
    while (used.has(idx)) idx = (idx + 1) % FULL_DECK.length;
    used.add(idx);
    const card = FULL_DECK[idx];
    const reversed = ((n >> i) & 1) === 1;
    out.push({
      slot: slots[i].slot,
      slotName: slots[i].slotName,
      card,
      reversed,
      line: "",
    });
  }
  for (const item of out) item.line = cardSentence(item);
  return out;
}

function firstSentence(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.split(/(?<=\.)\s/)[0]?.trim() || "Act on what is already clear.";
}

function cardSentence(card: GroupCard): string {
  const hard = /tower|devil|death|swords|five of|ten of wands|nine of wands/i.test(card.card.name);
  const point = hard
    ? "Keep what is working. Drop what is not. Move the part you control."
    : firstSentence(card.card.upright);
  if (card.reversed) return `${card.card.name} is already in motion. ${point}`;
  return `${card.card.name}. ${point}`;
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

  const where = cards[0];
  const todo = cards[2];
  const asked = question.replace(/[?.!\s]+$/g, "");
  const ask = asked ? `You asked, "${asked}." ` : "";
  const ground = where ? `${where.card.name} is where you are. ` : "";
  const move = todo ? `${todo.card.name} is what to do. ` : "";
  const close = tandem
    ? "The two of you agree on one decision and finish it today."
    : "The group agrees on one decision and finishes it today.";
  return `${ask}${who}, ${connection}. ${ground}${move}${close}`;
}

export function composeGroupReading(
  people: GroupPerson[],
  when: Date = new Date(),
  lens?: ReadLens,
): GroupReading {
  const tandem = people.length === 2;
  const names = people.map(p => p.name);
  const title = tandem
    ? `Tandem · ${names[0]} & ${names[1]}`
    : `Group Read · ${
        names.length <= 3 ? names.join(", ") : `${names.slice(0, 2).join(", ")} + ${names.length - 2} more`
      }`;

  const connection =
    lens?.connectionId === "other" && (lens.otherText ?? "").trim()
      ? (lens.otherText ?? "").trim()
      : lens?.connectionLabel || (tandem ? "Tandem" : "Group");

  const question = (lens?.question ?? "").trim();
  const seed = `${people.map(p => p.id).join("-")}-${when.toISOString().slice(0, 10)}-${question}`;
  const cards = pickCards(seed);

  const portrait = overview(people, tandem, connection, question, cards);
  const roles: GroupRole[] = people.map((p, index) => ({
    id: p.id,
    name: p.name,
    line: roleLine(p, index),
  }));

  const owner = names[0] ?? "Someone";
  const asked = question.replace(/[?.!\s]+$/g, "");
  const directive = asked
    ? `${owner} writes one sentence that answers "${asked}." Everyone agrees on it before the day ends.`
    : `${owner} names the decision in one sentence. Everyone agrees on it before the day ends.`;

  const sections: GroupSection[] = [
    { heading: "Who does what", text: roles.map(role => role.line).join("\n\n") },
    { heading: "Do this today", text: directive },
  ];

  const body = [
    `The answer\n\n${portrait}`,
    ...cards.map(card => `${card.slotName}\n\n${card.line}`),
    ...sections.map(section => `${section.heading}\n\n${section.text}`),
  ].join("\n\n");

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
    magnetize: cards[1]?.line ?? "",
    breakthrough: cards[0]?.line ?? "",
    directive,
  };
}
