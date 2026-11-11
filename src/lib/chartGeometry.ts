/** Tropical ecliptic math shared by houses, placements, and aspects. */

export const TROPICAL_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type TropicalSign = (typeof TROPICAL_SIGNS)[number];

export const MAJOR_ASPECTS = [
  { aspect: "conjunction", angle: 0, maxOrb: 8 },
  { aspect: "sextile", angle: 60, maxOrb: 6 },
  { aspect: "square", angle: 90, maxOrb: 7 },
  { aspect: "trine", angle: 120, maxOrb: 8 },
  { aspect: "opposition", angle: 180, maxOrb: 8 },
] as const;

export function normalizeLongitude(degree: number): number {
  if (!Number.isFinite(degree)) return 0;
  const wrapped = degree % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

export function roundLongitude(degree: number): number {
  return Math.round(normalizeLongitude(degree) * 100) / 100;
}

/** Same sign cut the house cusps use: 30° tropical slices from 0° Aries. */
export function signAtLongitude(degree: number): {
  sign: TropicalSign;
  degreeInSign: number;
} {
  const lon = normalizeLongitude(degree);
  const index = Math.floor(lon / 30) % 12;
  const degreeInSign = Math.round((lon - index * 30) * 100) / 100;
  return { sign: TROPICAL_SIGNS[index] ?? "Aries", degreeInSign };
}

/** True when `longitude` sits on the arc from `start` up to but not including `end`. */
export function longitudeOnArc(
  longitude: number,
  start: number,
  end: number,
): boolean {
  const lon = normalizeLongitude(longitude);
  const from = normalizeLongitude(start);
  const to = normalizeLongitude(end);
  if (from === to) return true;
  if (from < to) return lon >= from && lon < to;
  return lon >= from || lon < to;
}

/**
 * Placidus (or any unequal) house: the body belongs to the cusp it has most
 * recently crossed, walking forward along the ecliptic. Cusps are absolute
 * longitudes in house order 1..12.
 */
export function houseForLongitude(longitude: number, cusps: number[]): number {
  if (cusps.length === 0) return 1;
  for (let i = 0; i < cusps.length; i += 1) {
    const next = cusps[(i + 1) % cusps.length] ?? cusps[0] ?? 0;
    if (longitudeOnArc(longitude, cusps[i] ?? 0, next)) return i + 1;
  }
  return 1;
}

export function angularSeparation(a: number, b: number): number {
  const delta = Math.abs(normalizeLongitude(a) - normalizeLongitude(b));
  return delta > 180 ? 360 - delta : delta;
}

export type BodyLongitude = { name: string; longitude: number };

export type TightAspect = {
  bodyA: string;
  bodyB: string;
  aspect: string;
  orb: number;
};

/** Major aspects from the same longitudes, tightest orb first. */
export function tightestAspects(bodies: BodyLongitude[]): TightAspect[] {
  const found: TightAspect[] = [];
  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      const left = bodies[i];
      const right = bodies[j];
      if (!left || !right) continue;
      const apart = angularSeparation(left.longitude, right.longitude);
      let best: { aspect: string; orb: number } | null = null;
      for (const major of MAJOR_ASPECTS) {
        const orb = Math.abs(apart - major.angle);
        if (orb <= major.maxOrb && (best === null || orb < best.orb)) {
          best = { aspect: major.aspect, orb };
        }
      }
      if (!best) continue;
      found.push({
        bodyA: left.name,
        bodyB: right.name,
        aspect: best.aspect,
        orb: Math.round(best.orb * 100) / 100,
      });
    }
  }
  return found.sort((a, b) => a.orb - b.orb || a.bodyA.localeCompare(b.bodyA));
}

export type ChartBodyInput = {
  name: string;
  longitude: number;
  retrograde?: boolean;
};

/** House cusp after the same rounding and sign cut as placements. */
export type ChartHouse = {
  house: number;
  sign: TropicalSign;
  degree: number;
};

/** Placement carrying the exact cusp-derived house parameters. */
export type ChartPlacement = {
  body: string;
  sign: TropicalSign;
  degree: number;
  degreeInSign: number;
  house: number;
  houseSign: TropicalSign;
  retrograde: boolean;
};

/**
 * Aspect between two normalized placements. House and sign fields are always
 * filled by the builder; older payloads may omit them.
 */
export type ChartAspect = TightAspect & {
  signA: TropicalSign;
  houseA: number;
  degreeA: number;
  signB: TropicalSign;
  houseB: number;
  degreeB: number;
};

export function longitudeOfSign(sign: string, degreeInSign = 0): number {
  const index = TROPICAL_SIGNS.indexOf(sign as TropicalSign);
  const base = index < 0 ? 0 : index * 30;
  return normalizeLongitude(base + degreeInSign);
}

/**
 * One house-parameterized pipeline for server charts and local previews.
 * Cusps are rounded first. Placements and aspects then read those exact
 * cusp degrees — never a second, unrounded copy of the sky.
 */
export function buildChartFromLongitudes(input: {
  bodies: ChartBodyInput[];
  cusps: number[];
}): {
  houses: ChartHouse[];
  placements: ChartPlacement[];
  aspects: ChartAspect[];
} {
  const houses: ChartHouse[] = input.cusps.slice(0, 12).map((cusp, index) => {
    const degree = roundLongitude(cusp);
    const { sign } = signAtLongitude(degree);
    return { house: index + 1, sign, degree };
  });
  houses.sort((a, b) => a.house - b.house);

  const cusps = houses.map(house => house.degree);
  const placements: ChartPlacement[] = input.bodies.map(body => {
    const degree = roundLongitude(body.longitude);
    const placed = signAtLongitude(degree);
    const house = houseForLongitude(degree, cusps);
    const houseSign =
      houses.find(item => item.house === house)?.sign ?? placed.sign;
    return {
      body: body.name,
      sign: placed.sign,
      degree,
      degreeInSign: placed.degreeInSign,
      house,
      houseSign,
      retrograde: Boolean(body.retrograde),
    };
  });

  const aspects: ChartAspect[] = tightestAspects(
    placements.map(placement => ({
      name: placement.body,
      longitude: placement.degree,
    })),
  ).map(aspect => {
    const left = placements.find(item => item.body === aspect.bodyA);
    const right = placements.find(item => item.body === aspect.bodyB);
    return {
      ...aspect,
      signA: left?.sign ?? "Aries",
      houseA: left?.house ?? 1,
      degreeA: left?.degree ?? 0,
      signB: right?.sign ?? "Aries",
      houseB: right?.house ?? 1,
      degreeB: right?.degree ?? 0,
    };
  });

  return { houses, placements, aspects };
}

const PREVIEW_OFFSETS: {
  name: string;
  from: "sun" | "moon" | "rising";
  add: number;
}[] = [
  { name: "Sun", from: "sun", add: 10 },
  { name: "Moon", from: "moon", add: 18 },
  { name: "Mercury", from: "sun", add: 22 },
  { name: "Venus", from: "sun", add: -18 },
  { name: "Mars", from: "moon", add: 47 },
  { name: "Jupiter", from: "rising", add: 78 },
  { name: "Saturn", from: "rising", add: 132 },
  { name: "Uranus", from: "sun", add: 96 },
  { name: "Neptune", from: "moon", add: 124 },
  { name: "Pluto", from: "rising", add: 210 },
  { name: "North Node", from: "rising", add: 40 },
  { name: "South Node", from: "rising", add: 220 },
];

/** Equal-house preview from Sun, Moon, and rising — same builder as the server. */
export function buildPreviewNatalChart(signs: {
  sun: string;
  moon: string;
  rising: string;
}) {
  const risingDegree = longitudeOfSign(signs.rising, 15);
  const cusps = Array.from({ length: 12 }, (_, index) =>
    normalizeLongitude(risingDegree + index * 30),
  );
  const anchors = {
    sun: longitudeOfSign(signs.sun, 0),
    moon: longitudeOfSign(signs.moon, 0),
    rising: risingDegree,
  };
  const built = buildChartFromLongitudes({
    cusps,
    bodies: PREVIEW_OFFSETS.map(body => ({
      name: body.name,
      longitude: anchors[body.from] + body.add,
      retrograde: body.name === "Mercury" || body.name === "Saturn",
    })),
  });
  const ascendant = built.houses.find(house => house.house === 1);
  const midheaven = built.houses.find(house => house.house === 10);
  return {
    ascendant: ascendant?.sign ?? signAtLongitude(risingDegree).sign,
    ascendantDegree: ascendant?.degree ?? roundLongitude(risingDegree),
    midheaven: midheaven?.sign ?? signAtLongitude(cusps[9] ?? 0).sign,
    midheavenDegree: midheaven?.degree ?? roundLongitude(cusps[9] ?? 0),
    placements: built.placements,
    houses: built.houses,
    aspects: built.aspects,
    houseSystem: "Equal",
    zodiac: "Tropical",
    approximateTime: true,
    preview: true,
  };
}
