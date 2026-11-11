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

const PERSONAL = new Set(["Sun", "Moon", "Mercury", "Venus", "Mars", "Ascendant"]);

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
};

export type GroupReading = {
  title: string;
  kindLabel: "Tandem" | "Group Read";
  body: string;
  bond: string;
};

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

export function chartFromSigns(signs: { sun: string; moon: string; rising: string }): GroupChart {
  const chart = buildPreviewNatalChart(signs);
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

function crossFactors(people: GroupPerson[]): Factor[] {
  const found: Factor[] = [];
  for (let i = 0; i < people.length; i += 1) {
    for (let j = i + 1; j < people.length; j += 1) {
      const left = people[i];
      const right = people[j];
      if (!left || !right) continue;
      for (const a of left.chart.placements) {
        for (const b of right.chart.placements) {
          const hit = aspectBetween(a.degree, b.degree);
          if (!hit || hit.orb > 6) continue;
          const harsh = hit.aspect === "square" || hit.aspect === "opposition" || hit.aspect === "quincunx";
          found.push({
            score: scoreOf(hit.aspect, hit.orb),
            bucket: harsh ? "friction" : "bond",
            line: `${left.name}'s ${a.body} at ${spot(a.sign, a.degreeInSign)} ${hit.aspect} ${right.name}'s ${b.body} at ${spot(b.sign, b.degreeInSign)}, orb ${hit.orb}°.`,
          });
        }
        const cusps = right.chart.houses.map(house => house.degree);
        const house = houseForLongitude(a.degree, cusps);
        if (!PERSONAL.has(a.body)) continue;
        const angular = house === 1 || house === 4 || house === 7 || house === 10;
        found.push({
          score: angular ? 3.4 : 1.6,
          bucket: "role",
          line: `${left.name}'s ${a.body} (${spot(a.sign, a.degreeInSign)}) falls in ${right.name}'s ${ordinal(house)} house.`,
        });
      }
    }
  }
  return found.sort((a, b) => b.score - a.score);
}

function patternFactors(people: GroupPerson[]): Factor[] {
  const bodies = people.flatMap(person =>
    person.chart.placements.map(placement => ({ person: person.name, ...placement })),
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
        if (a.person === b.person && b.person === c.person) continue;
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

function roleLine(person: GroupPerson, overlays: Factor[]) {
  const sun = byName(person.chart, "Sun");
  const moon = byName(person.chart, "Moon");
  const node = byName(person.chart, "North Node");
  const overlay = overlays.find(item => item.line.startsWith(`${person.name}'s Sun`) || item.line.startsWith(`${person.name}'s Moon`));
  const parts = [
    sun ? `${person.name}'s Sun is ${spot(sun.sign, sun.degreeInSign)} in their ${ordinal(sun.house)} house` : `${person.name}`,
    moon ? `Moon ${spot(moon.sign, moon.degreeInSign)} in the ${ordinal(moon.house)}` : "",
    `rising ${person.chart.ascendant}`,
    node ? `North Node ${spot(node.sign, node.degreeInSign)}` : "",
  ].filter(Boolean);
  const tail = overlay ? ` ${overlay.line}` : "";
  return `${parts.join(", ")}.${tail}`;
}

function directive(transit: Factor | undefined) {
  if (!transit) return "Stay with the tightest aspect already named. Do that one thing before the day turns.";
  if (/square|opposition|quincunx/.test(transit.line)) {
    return `${transit.line} Name the friction out loud and change one plan that the square is already touching.`;
  }
  return `${transit.line} Use that contact today. One shared decision, made while it is exact, is the move.`;
}

export function composeGroupReading(people: GroupPerson[], now = new Date()): GroupReading {
  if (people.length < 2 || people.length > 8) {
    throw new Error("A group read needs 2 to 8 people.");
  }
  const kindLabel: GroupReading["kindLabel"] = people.length === 2 ? "Tandem" : "Group Read";
  const names = people.map(person => person.name);
  const cross = crossFactors(people);
  const patterns = patternFactors(people);
  const composite = compositeFactors(people, now);
  const bonds = cross.filter(item => item.bucket === "bond").slice(0, 3);
  const friction = cross.filter(item => item.bucket === "friction").slice(0, 3);
  const roles = people.map(person => roleLine(person, cross.filter(item => item.bucket === "role")));
  const coreBits = [
    ...composite.filter(item => item.bucket === "core"),
    ...patterns.filter(item => item.bucket === "core" || item.bucket === "pattern").slice(0, 2),
  ];
  const transit = composite.find(item => item.bucket === "transit");
  const bondLine = bonds[0]?.line ?? "No major cross-aspect inside 6°.";
  const title = `${kindLabel} · ${names.join(" · ")}`;
  const body = [
    `${kindLabel} for ${names.join(", ")}. ${coreBits.map(item => item.line).join(" ")} The sharpest contact is ${bondLine}`,
    roles.join("\n"),
    bonds.length
      ? `Strongest bonds: ${bonds.map(item => item.line).join(" ")}`
      : "Strongest bonds: nothing inside a 6° orb. The house overlays above are the bond.",
    friction.length
      ? `Friction: ${friction.map(item => item.line).join(" ")}`
      : "Friction: no square, opposition, or quincunx inside 6°. The tension is the missing hard aspect, not a hidden one.",
    directive(transit),
  ].join("\n\n");
  return { title, kindLabel, body, bond: bondLine };
}
