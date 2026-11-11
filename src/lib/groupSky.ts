/**
 * Tandem and group reads use the Tri-Sky pull.
 * Charts are blended into the same optional chart note a single
 * natal chart would occupy. They do not change the spread or the letter.
 */

import { buildPreviewNatalChart } from "./chartGeometry.js";
import { dayKey, DEEP_SPREAD, drawSeededSpread, type SpreadCard } from "./ritual.js";
import { fallbackLongRead } from "./longRead.js";

export type GroupChart = {
  ascendant: string;
  placements: Array<{
    body: string;
    sign: string;
    degree: number;
    degreeInSign: number;
    house?: number;
  }>;
  houses: Array<{ house: number; sign: string; degree: number }>;
};

export type GroupPerson = {
  id: string;
  name: string;
  chart: GroupChart;
  /** Only fields the person chose to share. Missing means neutral language. */
  pronouns?: string;
  gender?: string;
  orientation?: string;
};

export type PronounSet = {
  sub: string;
  obj: string;
  pos: string;
  cap: string;
};

const THEY: PronounSet = { sub: "they", obj: "them", pos: "their", cap: "They" };

function sharedField(value?: string) {
  const text = (value ?? "").trim();
  if (!text) return "";
  if (/prefer not|rather not|unspecified|decline|n\/a|none/i.test(text)) return "";
  return text;
}

export function pronounsFor(person: Pick<GroupPerson, "pronouns" | "gender">): PronounSet {
  const explicit = sharedField(person.pronouns).toLowerCase();
  const gender = sharedField(person.gender).toLowerCase();
  const source = `${explicit} ${gender}`;
  if (/she\/her|\bshe\b|trans woman|\bwoman\b|\bfemale\b/.test(source) && !/trans man/.test(source)) {
    return { sub: "she", obj: "her", pos: "her", cap: "She" };
  }
  if (/he\/him|\bhe\b|trans man|\bman\b|\bmale\b/.test(source) && !/woman/.test(source)) {
    return { sub: "he", obj: "him", pos: "his", cap: "He" };
  }
  return THEY;
}

/** Optional focus. Same slot as Tri-Sky's situation. Connection fields are ignored. */
export type ReadLens = {
  question?: string;
};

export type GroupReading = {
  title: string;
  kindLabel: "Tandem" | "Group Read";
  question: string;
  connection: string;
  portrait: string;
  roles: Array<{ name: string; text: string }>;
  magnetize: string;
  breakthrough: string;
  directive: string;
  sections: Array<{ heading: string; text: string }>;
  details: string[];
  cards: SpreadCard[];
  body: string;
  bond: string;
  /** For the model only. Never written into the posted reading. */
  privateNote: string;
};

function byName(chart: GroupChart, body: string) {
  return chart.placements.find(item => item.body === body);
}

function seedDegrees(seed: string) {
  let hash = 2166136261;
  const text = seed || "sky";
  for (let i = 0; i < text.length; i += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  }
  const mixed = hash >>> 0;
  return {
    sunDegree: 3 + (mixed % 24),
    moonDegree: 1 + ((mixed >>> 8) % 26),
    risingDegree: 2 + ((mixed >>> 16) % 25),
  };
}

/** Demo charts keep the named signs and shift the degrees so two Leos are not the same sky. */
export function chartFromSigns(signs: {
  sun: string;
  moon: string;
  rising: string;
  seed?: string;
}): GroupChart {
  const shift = seedDegrees(signs.seed || `${signs.sun}-${signs.moon}-${signs.rising}`);
  const chart = buildPreviewNatalChart({ ...signs, ...shift });
  return {
    ascendant: chart.ascendant,
    placements: chart.placements,
    houses: chart.houses,
  };
}

function addressed(person: GroupPerson) {
  const voice = pronounsFor(person);
  return voice.sub === "they" ? person.name : `${person.name} (${voice.sub}/${voice.obj})`;
}

/** One chart line per person, the same shape a single natal chart would take. */
export function chartNoteFor(people: GroupPerson[]) {
  return people.map(person => {
    const sun = byName(person.chart, "Sun");
    const moon = byName(person.chart, "Moon");
    return `${addressed(person)}: Sun ${sun?.sign ?? "unknown"}, Moon ${moon?.sign ?? "unknown"}, rising ${person.chart.ascendant}.`;
  }).join(" ");
}

export function drawGroupSpread(people: GroupPerson[], now = new Date()): SpreadCard[] {
  const signed = [...people].sort((a, b) => a.id.localeCompare(b.id));
  const signature = signed.map(person => {
    const sun = byName(person.chart, "Sun");
    const moon = byName(person.chart, "Moon");
    return [
      person.id,
      sun?.sign ?? "",
      moon?.sign ?? "",
      person.chart.ascendant,
      Math.round(sun?.degreeInSign ?? 0),
    ].join(":");
  }).join("|");
  return drawSeededSpread(DEEP_SPREAD.slots, `${signature}|${dayKey(now)}`);
}

export function composeGroupReading(people: GroupPerson[], now = new Date(), lens?: ReadLens): GroupReading {
  if (people.length < 2 || people.length > 8) {
    throw new Error("A group read needs 2 to 8 people.");
  }
  const kindLabel: GroupReading["kindLabel"] = people.length === 2 ? "Tandem" : "Group Read";
  const names = people.map(person => person.name);
  const cards = drawGroupSpread(people, now);
  const question = lens?.question?.trim() ?? "";
  const who = people.map(addressed).join(" and ");
  const chartNote = chartNoteFor(people);
  const body = fallbackLongRead(who, question || "not specified", cards);
  return {
    title: `${kindLabel} · ${names.join(" · ")}`,
    kindLabel,
    question,
    connection: "",
    portrait: "",
    roles: people.map(person => ({ name: addressed(person), text: "" })),
    magnetize: "",
    breakthrough: "",
    directive: "",
    sections: [],
    details: [],
    cards,
    body,
    bond: names.slice(0, 2).join(" and "),
    privateNote: chartNote,
  };
}
