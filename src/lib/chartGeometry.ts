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
export function longitudeOnArc(longitude: number, start: number, end: number): boolean {
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
