/**
 * Group / Tandem sky helpers for GroupReadRoom.
 * Minimal working surface: types, bonds, chart stub, and composeGroupReading.
 */
import { FULL_DECK } from "../data/fullDeck.js";
import type { ArcanaCard } from "../data/arcana.js";

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
    if (connectionId.includes("parent") || connectionId.includes("mother") || connectionId.includes("father")) {
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

  const seed = `${people.map(p => p.id).join("-")}-${when.toISOString().slice(0, 10)}-${lens?.question ?? ""}`;
  const cards = pickCards(seed, 7);

  const portrait = tandem
    ? `${names[0]} and ${names[1]} are in this together. The charts point at shared momentum — use it.`
    : `This room holds ${people.length} people. The composite asks for one clear aim and honest roles.`;

  const sections: GroupSection[] = [
    {
      heading: "The room",
      text: portrait,
    },
    {
      heading: "How each person lands",
      text: people
        .map(
          p =>
            `${p.name} (${p.chart.sun} sun, ${p.chart.moon} moon, ${p.chart.rising} rising) brings a distinct tempo. Name their strength out loud and put it to work.`,
        )
        .join(" "),
    },
    {
      heading: "The move",
      text:
        lens?.question?.trim()
          ? `You asked: ${lens.question.trim()}. Answer it with one concrete decision today — dated, owned, and shared.`
          : "Make one shared decision today. Concrete, dated, and owned. That is how this group turns potential into progress.",
    },
  ];

  const body = sections.map(s => `${s.heading}\n${s.text}`).join("\n\n");

  const details = people.map(
    p => `${p.name}: Sun ${p.chart.sun}, Moon ${p.chart.moon}, Rising ${p.chart.rising}`,
  );

  return {
    title,
    body,
    bond: connection,
    connection,
    question: lens?.question?.trim() ?? "",
    portrait,
    cards,
    sections,
    details,
  };
}
