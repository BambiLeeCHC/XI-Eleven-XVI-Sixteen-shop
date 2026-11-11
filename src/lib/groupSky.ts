/**
 * Group synastry on the same chart builder as a natal chart.
 * Pair aspects, house overlays, group patterns, a composite, and
 * today's transits. The written read only cites those factors.
 */

import {
  angularSeparation,
  buildPreviewNatalChart,
  houseForLongitude,
  MAJOR_ASPECTS,
  normalizeLongitude,
  signAtLongitude,
} from "./chartGeometry.js";
import { dayKey, drawSeededSpread, type SpreadCard } from "./ritual.js";

const ASPECTS = [
  ...MAJOR_ASPECTS,
  { aspect: "quincunx", angle: 150, maxOrb: 3 },
] as const;

const ELEMENT: Record<string, string> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

const MODALITY: Record<string, string> = {
  Aries: "cardinal", Cancer: "cardinal", Libra: "cardinal", Capricorn: "cardinal",
  Taurus: "fixed", Leo: "fixed", Scorpio: "fixed", Aquarius: "fixed",
  Gemini: "mutable", Virgo: "mutable", Sagittarius: "mutable", Pisces: "mutable",
};

const PERSONAL = new Set(["Sun", "Moon", "Mercury", "Venus", "Mars"]);
const NODES = new Set(["North Node", "South Node"]);
const PATTERN_BODIES = new Set([
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
]);

export type GroupChart = {
  ascendant: string;
  placements: Array<{
    body: string;
    sign: string;
    degree: number;
    degreeInSign: number;
    house: number;
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

function queerShared(value?: string) {
  const text = sharedField(value).toLowerCase();
  if (!text) return false;
  return /gay|lesbian|queer|bisexual|\bbi\b|pansexual|\bpan\b|asexual|\bace\b/.test(text);
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

export const TANDEM_BONDS = [
  { id: "friends", label: "Friends" },
  { id: "couple", label: "Couple / Partners" },
  { id: "dating", label: "Dating" },
  { id: "coworkers", label: "Coworkers" },
  { id: "business", label: "Business partners" },
  { id: "siblings", label: "Siblings" },
  { id: "parent-child", label: "Parent & child" },
  { id: "mother-daughter", label: "Mother & daughter" },
  { id: "mother-son", label: "Mother & son" },
  { id: "father-daughter", label: "Father & daughter" },
  { id: "father-son", label: "Father & son" },
  { id: "family", label: "Family" },
  { id: "roommates", label: "Roommates" },
  { id: "mentor", label: "Mentor & mentee" },
  { id: "other", label: "Other" },
] as const;

export const GROUP_BONDS = [
  { id: "friends", label: "Friend group" },
  { id: "family", label: "Family" },
  { id: "work", label: "Work team" },
  { id: "business", label: "Business / co-founders" },
  { id: "book", label: "Book club" },
  { id: "creative", label: "Creative collective" },
  { id: "band", label: "Band / crew" },
  { id: "sports", label: "Sports team" },
  { id: "class", label: "Classmates / study group" },
  { id: "spirit", label: "Spiritual circle" },
  { id: "roommates", label: "Roommates" },
  { id: "other", label: "Other" },
] as const;

export type ReadLens = {
  question?: string;
  connectionId?: string;
  connectionLabel?: string;
  otherText?: string;
  /** Parent or mentor, when the bond has a direction. */
  leadId?: string;
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

export function promptIdeas(connectionId: string, tandem: boolean): string[] {
  if (tandem && (connectionId === "couple" || connectionId === "dating")) {
    return ["How do we grow closer?", "What is our best next season together?", "How do we keep choosing each other?"];
  }
  if (tandem && (connectionId.startsWith("mother") || connectionId.startsWith("father") || connectionId === "parent-child")) {
    return ["How do we honor what we pass forward?", "What strength do we give each other?", "How do we grow side by side?"];
  }
  if (tandem && (connectionId === "coworkers" || connectionId === "business")) {
    return ["What is our best next goal?", "How do we collaborate at our best?", "What should we build next?"];
  }
  if (!tandem && (connectionId === "work" || connectionId === "business")) {
    return ["What is this team best at building?", "How do we move the goal forward?", "What strength should we lean on?"];
  }
  if (!tandem && connectionId === "family") {
    return ["How do we take care of each other well?", "What do we pass forward?", "What is our best gathering?"];
  }
  return tandem
    ? ["How do we bring out the best in each other?", "What are we building?", "What is the next good step?"]
    : ["What are we at our best?", "What are we building together?", "What should we do next?"];
}

type Factor = {
  score: number;
  bucket: "core" | "bond" | "friction" | "pattern" | "transit" | "role";
  line: string;
};

function aspectBetween(a: number, b: number) {
  const apart = angularSeparation(a, b);
  let best: { aspect: string; orb: number } | null = null;
  for (const major of ASPECTS) {
    const orb = Math.abs(apart - major.angle);
    if (orb <= major.maxOrb && (best === null || orb < best.orb)) {
      best = { aspect: major.aspect, orb: Math.round(orb * 100) / 100 };
    }
  }
  return best;
}

function weight(aspect: string) {
  if (aspect === "conjunction") return 5;
  if (aspect === "opposition") return 4.6;
  if (aspect === "square") return 4.2;
  if (aspect === "trine") return 3.6;
  if (aspect === "quincunx") return 3.2;
  return 2.6;
}

function scoreOf(aspect: string, orb: number) {
  return Math.round((weight(aspect) / (0.35 + orb)) * 100) / 100;
}

function spot(sign: string, degreeInSign: number) {
  return `${Math.round(degreeInSign)}° ${sign}`;
}

function byName(chart: GroupChart, body: string) {
  return chart.placements.find(item => item.body === body);
}

function ordinal(house: number) {
  const teen = house % 100;
  if (teen >= 11 && teen <= 13) return `${house}th`;
  const last = house % 10;
  if (last === 1) return `${house}st`;
  if (last === 2) return `${house}nd`;
  if (last === 3) return `${house}rd`;
  return `${house}th`;
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

function circularMean(degrees: number[]) {
  if (degrees.length === 0) return 0;
  let x = 0;
  let y = 0;
  for (const degree of degrees) {
    const rad = (normalizeLongitude(degree) * Math.PI) / 180;
    x += Math.cos(rad);
    y += Math.sin(rad);
  }
  return normalizeLongitude((Math.atan2(y, x) * 180) / Math.PI);
}

function tally(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function transitLongitudes(now: Date) {
  const days = (now.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
  const rows: Array<[string, number, number]> = [
    ["Sun", 280.46, 0.98564736],
    ["Moon", 218.316, 13.176396],
    ["Mercury", 252.25, 4.09233445],
    ["Venus", 181.98, 1.60213034],
    ["Mars", 355.45, 0.52402068],
    ["Jupiter", 34.4, 0.0830853],
    ["Saturn", 49.94, 0.03344414],
  ];
  return rows.map(([name, origin, motion]) => ({
    name,
    degree: normalizeLongitude(origin + motion * days),
  }));
}

function patternFactors(people: GroupPerson[]): Factor[] {
  const bodies = people.flatMap(person =>
    person.chart.placements
      .filter(placement => PATTERN_BODIES.has(placement.body) && !NODES.has(placement.body))
      .map(placement => ({ person: person.name, ...placement })),
  );
  const found: Factor[] = [];
  const signs = tally(bodies.filter(body => PERSONAL.has(body.body)).map(body => body.sign));
  const stellium = signs.find(([, count]) => count >= 3);
  if (stellium) {
    const names = bodies.filter(body => body.sign === stellium[0] && PERSONAL.has(body.body)).map(body => `${body.person}'s ${body.body}`);
    found.push({
      score: 4 + stellium[1],
      bucket: "pattern",
      line: `Stellium in ${stellium[0]}: ${names.slice(0, 5).join(", ")}.`,
    });
  }

  const elements = tally(bodies.filter(body => PERSONAL.has(body.body)).map(body => ELEMENT[body.sign] ?? "fire"));
  const modes = tally(bodies.filter(body => PERSONAL.has(body.body)).map(body => MODALITY[body.sign] ?? "cardinal"));
  if (elements[0]) {
    found.push({
      score: 3.2,
      bucket: "core",
      line: `The personal planets lean ${elements[0][0]} (${elements[0][1]}) and ${modes[0]?.[0] ?? "cardinal"} (${modes[0]?.[1] ?? 0}).`,
    });
  }

  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      for (let k = j + 1; k < bodies.length; k += 1) {
        const a = bodies[i];
        const b = bodies[j];
        const c = bodies[k];
        if (!a || !b || !c) continue;
        if (a.person === b.person || b.person === c.person || a.person === c.person) continue;
        if (NODES.has(a.body) || NODES.has(b.body) || NODES.has(c.body)) continue;
        const ab = aspectBetween(a.degree, b.degree);
        const bc = aspectBetween(b.degree, c.degree);
        const ca = aspectBetween(c.degree, a.degree);
        if (!ab || !bc || !ca) continue;
        const trio = [ab.aspect, bc.aspect, ca.aspect].sort().join("-");
        const label = `${a.person}'s ${a.body}, ${b.person}'s ${b.body}, ${c.person}'s ${c.body}`;
        if (ab.aspect === "trine" && bc.aspect === "trine" && ca.aspect === "trine") {
          found.push({ score: 8 - ab.orb - bc.orb - ca.orb, bucket: "pattern", line: `Grand trine: ${label}.` });
        } else if (trio === "opposition-square-square") {
          found.push({ score: 7.5 - ab.orb - bc.orb - ca.orb, bucket: "pattern", line: `T-square: ${label}.` });
        } else if (trio === "quincunx-quincunx-sextile") {
          found.push({ score: 7.2 - ab.orb - bc.orb - ca.orb, bucket: "pattern", line: `Yod: ${label}.` });
        }
      }
    }
  }
  return found.sort((a, b) => b.score - a.score).slice(0, 6);
}

function compositeFactors(people: GroupPerson[], now: Date): Factor[] {
  const names = [...new Set(people.flatMap(person => person.chart.placements.map(item => item.body)))];
  const composite = names.map(body => {
    const degrees = people
      .map(person => byName(person.chart, body)?.degree)
      .filter((degree): degree is number => typeof degree === "number");
    const degree = circularMean(degrees);
    const placed = signAtLongitude(degree);
    return { body, degree, sign: placed.sign, degreeInSign: placed.degreeInSign };
  });
  const sun = composite.find(item => item.body === "Sun");
  const found: Factor[] = [];
  if (sun) {
    found.push({
      score: 5,
      bucket: "core",
      line: `The group composite Sun is ${spot(sun.sign, sun.degreeInSign)}.`,
    });
  }
  const houses = tally(people.flatMap(person => person.chart.placements.filter(item => PERSONAL.has(item.body)).map(item => String(item.house))));
  if (houses[0]) {
    found.push({
      score: 2.4,
      bucket: "core",
      line: `The busiest house across the personal planets is the ${ordinal(Number(houses[0][0]))} (${houses[0][1]} placements).`,
    });
  }
  const transits = transitLongitudes(now);
  const hits: Factor[] = [];
  for (const transit of transits) {
    const placed = signAtLongitude(transit.degree);
    for (const target of composite) {
      const hit = aspectBetween(transit.degree, target.degree);
      if (!hit || hit.orb > 4) continue;
      hits.push({
        score: scoreOf(hit.aspect, hit.orb) + (target.body === "Sun" || target.body === "Moon" ? 1 : 0),
        bucket: "transit",
        line: `Transiting ${transit.name} at ${spot(placed.sign, placed.degreeInSign)} ${hit.aspect} the composite ${target.body} at ${spot(target.sign, target.degreeInSign)}, orb ${hit.orb}°.`,
      });
    }
  }
  hits.sort((a, b) => b.score - a.score);
  return [...found, ...(hits[0] ? [hits[0]] : [])];
}

const SIGN_CHARGE: Record<string, string> = {
  Aries: "starts the thing the rest of the room is still naming",
  Taurus: "keeps what is worth keeping and refuses the rest",
  Gemini: "puts the private thought into words before it hardens",
  Cancer: "guards the people, not the plan",
  Leo: "makes the work visible so it can be chosen",
  Virgo: "turns heat into a task that can actually be finished",
  Libra: "holds the mirror until the group can see its own bargain",
  Scorpio: "stays with the truth after everyone else wants the polite version",
  Sagittarius: "aims the room at a farther point than comfort",
  Capricorn: "builds the structure the feeling can live inside",
  Aquarius: "breaks the script when the script is the problem",
  Pisces: "hears the undertow the louder voices miss",
};

const HOUSE_CHARGE: Record<number, string> = {
  1: "identity",
  2: "what you keep",
  3: "the conversation",
  4: "home",
  5: "play and risk",
  6: "the daily work",
  7: "the one across from you",
  8: "what is shared and what is owed",
  9: "the larger meaning",
  10: "the public aim",
  11: "the circle itself",
  12: "what is kept quiet",
};

const ELEMENT_LINE: Record<string, string> = {
  fire: "You ignite. The room moves because someone already stepped.",
  earth: "You stay. The room becomes real because someone refuses to leave the work half-made.",
  air: "You think out loud. The room stays alive because the idea is passed, not owned.",
  water: "You feel the weather first. The room stays loyal because someone remembers who is in it.",
};

const MODE_LINE: Record<string, string> = {
  cardinal: "The tempo is cardinal: you begin.",
  fixed: "The tempo is fixed: you hold.",
  mutable: "The tempo is mutable: you change shape without losing the point.",
};

type LinkHit = {
  score: number;
  harsh: boolean;
  aspect: string;
  orb: number;
  left: string;
  leftBody: string;
  leftSign: string;
  right: string;
  rightBody: string;
  rightSign: string;
};

function proseLinks(people: GroupPerson[]): LinkHit[] {
  const found: LinkHit[] = [];
  for (let i = 0; i < people.length; i += 1) {
    for (let j = i + 1; j < people.length; j += 1) {
      const left = people[i];
      const right = people[j];
      if (!left || !right) continue;
      for (const a of left.chart.placements) {
        if (!PERSONAL.has(a.body)) continue;
        for (const b of right.chart.placements) {
          if (!PERSONAL.has(b.body)) continue;
          const hit = aspectBetween(a.degree, b.degree);
          if (!hit || hit.orb > 5) continue;
          found.push({
            score: scoreOf(hit.aspect, hit.orb),
            harsh: hit.aspect === "square" || hit.aspect === "opposition" || hit.aspect === "quincunx",
            aspect: hit.aspect,
            orb: hit.orb,
            left: left.name,
            leftBody: a.body,
            leftSign: a.sign,
            right: right.name,
            rightBody: b.body,
            rightSign: b.sign,
          });
        }
      }
    }
  }
  return found.sort((a, b) => b.score - a.score);
}

function bondSentence(hit: LinkHit) {
  const pair = `${hit.left}'s ${hit.leftSign} ${hit.leftBody} and ${hit.right}'s ${hit.rightSign} ${hit.rightBody}`;
  if (hit.aspect === "trine") {
    return `${pair} trine is recognition. It feels like already knowing the move. What it creates is a yes the group can spend without a meeting.`;
  }
  if (hit.aspect === "sextile") {
    return `${pair} sextile is an open door, not a fuse. It feels like an invitation. What it creates is a collaboration that still needs someone to walk through.`;
  }
  return `${pair} conjunction puts two wills in the same chair. It feels like heat with no gap. What it creates is focus, and a need to name whose desire is driving.`;
}

function growthSentence(hit: LinkHit) {
  const pair = `${hit.left}'s ${hit.leftSign} ${hit.leftBody} and ${hit.right}'s ${hit.rightSign} ${hit.rightBody}`;
  if (hit.aspect === "opposition") {
    return `${pair} face each other, and that facing is a breakthrough. Each person brings the piece the other is ready to grow into. The invitation is to take the fuller version of the plan, together.`;
  }
  if (hit.aspect === "quincunx") {
    return `${pair} ask for a new method. The growth edge is a kinder way of working, and the next step is already available once you adjust the how.`;
  }
  return `${pair} square into a growth edge. The effort is the gift: it turns a good idea into progress. Use it to move one shared plan forward.`;
}

function roleParagraph(person: GroupPerson, people: GroupPerson[]) {
  const sun = byName(person.chart, "Sun");
  const moon = byName(person.chart, "Moon");
  const sunSign = sun?.sign ?? person.chart.ascendant;
  const moonSign = moon?.sign ?? sunSign;
  const house = sun?.house ?? 1;
  let landed = "";
  for (const other of people) {
    if (other.id === person.id || !sun) continue;
    const houseThere = houseForLongitude(sun.degree, other.chart.houses.map(item => item.degree));
    if (houseThere === 1 || houseThere === 4 || houseThere === 7 || houseThere === 10) {
      landed = ` In this group that Sun falls in ${other.name}'s ${ordinal(houseThere)} house, so the heat lands as ${HOUSE_CHARGE[houseThere]}.`;
      break;
    }
  }
  if (!landed) {
    const other = people.find(item => item.id !== person.id);
    if (other && sun) {
      const houseThere = houseForLongitude(sun.degree, other.chart.houses.map(item => item.degree));
      landed = ` Their Sun falls in ${other.name}'s ${ordinal(houseThere)} house, the place of ${HOUSE_CHARGE[houseThere]}.`;
    }
  }
  const articleSun = article(sunSign) === "an" ? "An" : "A";
  const voice = pronounsFor(person);
  const stay = voice.sub === "they" ? "stay" : "stays";
  return `${person.name} is the one who ${SIGN_CHARGE[sunSign] ?? "keeps the room honest"}. ${articleSun} ${sunSign} Sun in the ${ordinal(house)} makes that ${voice.pos} part in the group, the house of ${HOUSE_CHARGE[house]}. The ${moonSign} Moon is how ${voice.sub} ${stay}, and the ${person.chart.ascendant} rising is the face the others actually meet.${landed}`;
}

function portraitOf(people: GroupPerson[], patterns: Factor[], composite: Factor[]) {
  const bodies = people.flatMap(person => person.chart.placements.filter(item => PERSONAL.has(item.body)));
  const elements = tally(bodies.map(body => ELEMENT[body.sign] ?? "fire"));
  const modes = tally(bodies.map(body => MODALITY[body.sign] ?? "cardinal"));
  const element = elements[0]?.[0] ?? "fire";
  const mode = modes[0]?.[0] ?? "cardinal";
  const sunLine = composite.find(item => item.line.startsWith("The group composite Sun"));
  const sunSign = sunLine?.line.match(/° ([A-Za-z]+)/)?.[1] ?? "Virgo";
  const pattern = patterns.find(item => item.bucket === "pattern");
  const shape = pattern
    ? `A shared figure in the sky keeps that motion honest and aimed.`
    : `The element itself is the pattern, and it is already enough to move.`;
  return `Together you are a ${element} group. ${ELEMENT_LINE[element] ?? ""} ${MODE_LINE[mode] ?? ""} The composite Sun in ${sunSign} is the work you share: ${SIGN_CHARGE[sunSign] ?? "make the private thing public enough to finish"}. ${shape}`;
}

function closingLine(transit: Factor | undefined) {
  if (!transit) {
    return "The sky is clear enough to act. Take the bond that already works and give it one forward decision today.";
  }
  const match = transit.line.match(/Transiting ([A-Za-z]+) at [\d.]+° ([A-Za-z]+) (conjunction|sextile|square|trine|opposition|quincunx) the composite ([A-Za-z]+(?: Node)?)/);
  const planet = match?.[1] ?? "Jupiter";
  const sign = match?.[2] ?? "Leo";
  const aspect = match?.[3] ?? "trine";
  const target = match?.[4] ?? "Sun";
  const charge = aspect === "square" || aspect === "opposition" || aspect === "quincunx"
    ? "a growth edge with real lift behind it"
    : "an open door";
  return `Transiting ${planet} in ${sign} meets the composite ${target}. That contact is ${charge}. Step through it: one shared decision, made today, that moves everyone forward.`;
}

function article(sign: string) {
  return /^[AEIOU]/.test(sign) ? "an" : "a";
}

function cardHope(card: SpreadCard) {
  const upright = card.card.upright.trim().split(/(?<=\.)\s/)[0] ?? card.card.upright;
  const hard = /tower|devil|death|swords|five of|ten of wands|nine of wands/i.test(card.card.name);
  const gift = hard
    ? `${card.card.name} is a breakthrough here: what opens is the next strength, and the way forward is the part you keep.`
    : upright;
  if (!card.reversed) return gift;
  return `Reversed, it is not a setback. It is the same strength, asking to be used now. ${gift}`;
}

function parentPair(people: GroupPerson[], lens?: ReadLens) {
  const [first, second] = people;
  if (!first || !second) return { lead: first, other: second };
  if (lens?.leadId && lens.leadId === second.id) return { lead: second, other: first };
  return { lead: first, other: second };
}

function tandemSlots(people: GroupPerson[], lens?: ReadLens) {
  const [first, second] = people;
  const id = lens?.connectionId ?? "friends";
  const { lead, other } = parentPair(people, lens);
  const a = first?.name ?? "One";
  const b = second?.name ?? "Two";
  const parentish = id === "parent-child" || id.startsWith("mother") || id.startsWith("father");
  const workish = id === "coworkers" || id === "business";
  const close = id === "couple" || id === "dating";
  if (parentish && lead && other) {
    return [
      { slot: "core", slotName: "The legacy", slotQuestion: "What you pass forward together" },
      { slot: "gift-a", slotName: `${lead.name}'s care`, slotQuestion: `How ${lead.name} nurtures ${other.name}` },
      { slot: "gift-b", slotName: `${other.name}'s gift`, slotQuestion: `What ${other.name} brings ${lead.name}` },
      { slot: "build", slotName: "What you grow", slotQuestion: "The life you are growing side by side" },
      { slot: "bond", slotName: "The bond", slotQuestion: "Where love and respect meet" },
      { slot: "breakthrough", slotName: "Breakthrough", slotQuestion: "The growth that brings you closer" },
      { slot: "momentum", slotName: "Momentum", slotQuestion: "What is already thriving between you" },
      { slot: "mend", slotName: "How you nurture", slotQuestion: "How care becomes the next chapter" },
      { slot: "move", slotName: "Next step", slotQuestion: "The empowering step for this family bond" },
    ];
  }
  if (workish) {
    return [
      { slot: "core", slotName: "Shared aim", slotQuestion: "The goal you are best at serving" },
      { slot: "gift-a", slotName: `${a}'s strength`, slotQuestion: `What ${a} brings the work` },
      { slot: "gift-b", slotName: `${b}'s strength`, slotQuestion: `What ${b} brings the work` },
      { slot: "build", slotName: "What you build", slotQuestion: "The result of collaborating well" },
      { slot: "bond", slotName: "The partnership", slotQuestion: "Where your skills magnetize" },
      { slot: "breakthrough", slotName: "Breakthrough", slotQuestion: "The growth edge that moves the goal" },
      { slot: "momentum", slotName: "Momentum", slotQuestion: "What is already working" },
      { slot: "mend", slotName: "How you back each other", slotQuestion: "How support makes the work better" },
      { slot: "move", slotName: "Next step", slotQuestion: "The next goal to take together" },
    ];
  }
  if (close) {
    return [
      { slot: "core", slotName: "Shared heart", slotQuestion: "What the partnership is at its best" },
      { slot: "gift-a", slotName: `${a}'s devotion`, slotQuestion: `What ${a} gives the partnership` },
      { slot: "gift-b", slotName: `${b}'s devotion`, slotQuestion: `What ${b} gives the partnership` },
      { slot: "build", slotName: "What you build", slotQuestion: "The life you are making together" },
      { slot: "bond", slotName: "The vow", slotQuestion: "Where intimacy and choice meet" },
      { slot: "breakthrough", slotName: "Breakthrough", slotQuestion: "The growth that deepens the bond" },
      { slot: "momentum", slotName: "Momentum", slotQuestion: "What is already alive between you" },
      { slot: "mend", slotName: "How you care", slotQuestion: "How you mend and come closer" },
      { slot: "move", slotName: "Next step", slotQuestion: "The next loving step" },
    ];
  }
  return [
    { slot: "core", slotName: "Shared Core", slotQuestion: "What the two of you are together" },
    { slot: "gift-a", slotName: `${a}'s gift`, slotQuestion: `What ${a} gives ${b}` },
    { slot: "gift-b", slotName: `${b}'s gift`, slotQuestion: `What ${b} gives ${a}` },
    { slot: "build", slotName: "What you build", slotQuestion: "The thing you make by staying with it" },
    { slot: "bond", slotName: "The Bond", slotQuestion: "Where you magnetize" },
    { slot: "breakthrough", slotName: "Breakthrough", slotQuestion: "The growth edge that moves you forward" },
    { slot: "momentum", slotName: "Momentum", slotQuestion: "What is already moving in your favor" },
    { slot: "mend", slotName: "The mend", slotQuestion: "How you repair and go further" },
    { slot: "move", slotName: "Next step", slotQuestion: "The empowering directive for the two of you" },
  ];
}

export function drawGroupSpread(people: GroupPerson[], now = new Date(), lens?: ReadLens): SpreadCard[] {
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
  const seed = `${signature}|${dayKey(now)}`;
  const tandem = people.length === 2;
  const slots = tandem
    ? tandemSlots(people, lens)
    : [
        { slot: "core", slotName: "The Room", slotQuestion: "What this group is together" },
        ...people.map(person => ({
          slot: `role-${person.id}`,
          slotName: person.name,
          slotQuestion: `The strength ${person.name} brings the group`,
        })),
        { slot: "bond", slotName: "The Bond", slotQuestion: "Where the group magnetizes" },
        { slot: "breakthrough", slotName: "Breakthrough", slotQuestion: "The growth edge that moves everyone forward" },
        { slot: "move", slotName: "The Move", slotQuestion: "The empowering directive for this group today" },
      ];
  return drawSeededSpread(slots, `${tandem ? "tandem" : "group"}|${seed}`);
}

function lensOf(hit: LinkHit | undefined, easy: boolean) {
  if (!hit) {
    return easy
      ? "The closest gift in the charts is wide, so the card itself is the bond: stay with what it names and build from there."
      : "The sky is already generous. The breakthrough is to use the strength you have, not to hunt for a problem.";
  }
  return easy ? bondSentence(hit) : growthSentence(hit);
}

function lensLine(lens: ReadLens | undefined, tandem: boolean) {
  const label = (lens?.otherText?.trim() || lens?.connectionLabel || (tandem ? "Friends" : "Friend group")).trim();
  const ask = lens?.question?.trim();
  const opener = ask ? `You asked, “${ask}.” ` : "";
  return { label, ask, opener };
}

export function composeGroupReading(people: GroupPerson[], now = new Date(), lens?: ReadLens): GroupReading {
  if (people.length < 2 || people.length > 8) {
    throw new Error("A group read needs 2 to 8 people.");
  }
  const kindLabel: GroupReading["kindLabel"] = people.length === 2 ? "Tandem" : "Group Read";
  const names = people.map(person => person.name);
  const cards = drawGroupSpread(people, now, lens);
  const frame = lensLine(lens, people.length === 2);
  const bySlot = (slot: string) => cards.find(card => card.slot === slot) ?? cards[0];
  const core = bySlot("core");
  const bondCard = bySlot("bond");
  const edgeCard = bySlot("breakthrough");
  const moveCard = bySlot("move");
  const links = proseLinks(people);
  const patterns = patternFactors(people);
  const composite = compositeFactors(people, now);
  const bonds = links.filter(item => !item.harsh).slice(0, 2);
  const growth = links.filter(item => item.harsh).slice(0, 2);
  const sky = portraitOf(people, patterns, composite);
  const toward = frame.ask ? ` The cards answer “${frame.ask}” from the best case in front of you.` : "";
  const couple = people.length === 2 && (lens?.connectionId === "couple" || lens?.connectionId === "dating");
  const affirming = couple && people.filter(person => queerShared(person.orientation)).length > 0
    ? " You are building this partnership on your own terms, and that choice is already a strength."
    : "";
  const chosen = !couple && people.filter(person => queerShared(person.orientation)).length >= 2
    ? " This circle can be chosen family: you show up for each other on purpose."
    : "";
  const portrait = `${frame.opener}${core.card.name} opens this ${frame.label.toLowerCase()} reading. ${cardHope(core)} ${sky}${toward}${affirming}${chosen}`.replace(/\s+/g, " ").trim();
  const tandem = people.length === 2;
  const roles = tandem
    ? []
    : people.map(person => {
        const drawn = bySlot(`role-${person.id}`);
        return {
          name: person.name,
          text: `${drawn.card.name} lands on ${person.name}. ${cardHope(drawn)} ${roleParagraph(person, people)}`,
        };
      });
  const magnetize = `${bondCard.card.name} is where you magnetize. ${cardHope(bondCard)} ${lensOf(bonds[0], true)}${bonds[1] ? ` ${lensOf(bonds[1], true)}` : ""}`;
  const breakthrough = `${edgeCard.card.name} is the breakthrough. ${cardHope(edgeCard)} ${lensOf(growth[0], false)}${growth[1] ? ` ${lensOf(growth[1], false)}` : ""}`;
  const transit = composite.find(item => item.bucket === "transit");
  const directive = `${moveCard.card.name} is the next step. ${cardHope(moveCard)} ${closingLine(transit)}${frame.ask ? ` Let it serve “${frame.ask}.”` : ""}`;
  const sections: Array<{ heading: string; text: string }> = [];
  if (tandem && people[0] && people[1]) {
    const giftA = bySlot("gift-a");
    const giftB = bySlot("gift-b");
    const build = bySlot("build");
    const momentum = bySlot("momentum");
    const mend = bySlot("mend");
    sections.push(
      { heading: giftA.slotName, text: `${giftA.card.name} is ${people[0].name}'s gift to ${people[1].name}. ${cardHope(giftA)} ${roleParagraph(people[0], people)}` },
      { heading: giftB.slotName, text: `${giftB.card.name} is ${people[1].name}'s gift to ${people[0].name}. ${cardHope(giftB)} ${roleParagraph(people[1], people)}` },
      { heading: "What you build", text: `${build.card.name} is the thing you make by staying with it. ${cardHope(build)} ${sky}` },
      { heading: "Where you magnetize", text: magnetize },
      { heading: "Breakthrough", text: breakthrough },
      { heading: "Momentum", text: `${momentum.card.name} is already moving in your favor. ${cardHope(momentum)} Take that motion and give it one more step.` },
      { heading: "The mend", text: `${mend.card.name} is how you mend and go further. ${cardHope(mend)} Repair is progress. The fence you mend becomes the path you walk.` },
      { heading: "Next step", text: directive },
    );
  } else {
    for (const role of roles) sections.push({ heading: role.name, text: role.text });
    sections.push(
      { heading: "Where you magnetize", text: magnetize },
      { heading: "Breakthrough", text: breakthrough },
      { heading: "The move", text: directive },
    );
  }
  const details = [
    ...cards.map(card => `${card.slotName}: ${card.card.name}${card.reversed ? " reversed" : ""}.`),
    ...composite.map(item => item.line),
    ...patterns.filter(item => item.bucket === "pattern").map(item => item.line),
    ...bonds.map(item => `${item.left}'s ${item.leftBody} ${item.aspect} ${item.right}'s ${item.rightBody}, orb ${item.orb}°.`),
    ...growth.map(item => `${item.left}'s ${item.leftBody} ${item.aspect} ${item.right}'s ${item.rightBody}, orb ${item.orb}°.`),
    ...(transit ? [transit.line] : []),
  ];
  const privateNote = people.map(person => {
    const voice = pronounsFor(person);
    const bits = [
      voice.sub === "they" ? "" : `pronouns ${voice.sub}/${voice.obj}`,
      queerShared(person.orientation) ? "a queer orientation was shared; affirm without naming the label" : "",
    ].filter(Boolean);
    return bits.length ? `${person.name}: ${bits.join("; ")}` : "";
  }).filter(Boolean).join("\n");
  const title = `${kindLabel} · ${frame.label} · ${names.join(" · ")}`;
  const body = [
    frame.ask ? `Question: ${frame.ask}` : "",
    frame.label,
    portrait,
    ...sections.map(section => `${section.heading}. ${section.text}`),
  ].filter(Boolean).join("\n\n");
  return {
    title,
    kindLabel,
    question: frame.ask ?? "",
    connection: frame.label,
    portrait,
    roles: tandem
      ? people.map(person => ({ name: person.name, text: sections.find(section => section.heading.startsWith(person.name))?.text ?? "" }))
      : roles,
    magnetize,
    breakthrough,
    directive,
    sections,
    details,
    cards,
    body,
    bond: bonds[0] ? `${bonds[0].left} and ${bonds[0].right}` : names.slice(0, 2).join(" and "),
    privateNote,
  };
}
