/**
 * Natal chart calculation — real astrology math, not AI guesswork.
 *
 * Uses `circular-natal-horoscope-js` (pure JS ephemeris calculations, no
 * native binary, safe on Vercel serverless) to compute actual planetary
 * placements, houses and the ascendant from a birth date/time/location.
 * Geocoding (turning "Chapel Hill, NC" into lat/lng) goes through
 * OpenStreetMap's free Nominatim API — no key required, and the result is
 * cached on the profile row so we only ever geocode a given birth_location
 * once.
 *
 * This is the FREE feature, given in full at registration. Numerology
 * (src/lib/numerology.ts) is the separate paywalled add-on.
 */

// No published types for this package; it's CJS-only and its named exports
// aren't statically detectable under Node's ESM loader, so import the default
// and destructure instead of `import { Origin, ... }`.
import circularNatalHoroscope from "circular-natal-horoscope-js";
import {
  buildChartFromLongitudes,
  type ChartAspect,
  type ChartPlacement,
  roundLongitude,
  signAtLongitude,
} from "../../src/lib/chartGeometry.js";

const { Origin, Horoscope } = circularNatalHoroscope as any;

export interface GeoResult {
  lat: number;
  lng: number;
}

/** Geocode a free-text birth location via Nominatim (OpenStreetMap). Returns
 * null on any failure (no match, network error, rate limit) — callers must
 * treat that as "chart unavailable until location is resolved", not a hard
 * error, since sign-up birth location is optional/free text. */
export async function geocodeLocation(
  location: string,
): Promise<GeoResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`;
    const res = await fetch(url, {
      headers: {
        // Nominatim's usage policy requires an identifying User-Agent.
        "User-Agent": "xixvi-shop-natal-chart/1.0 (https://xixvi.shop)",
      },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!rows.length) return null;
    const lat = Number(rows[0].lat);
    const lng = Number(rows[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export interface LocationSuggestion {
  displayName: string;
  lat: number;
  lng: number;
}

/** Live-search location suggestions for the birth-location autocomplete
 * (used pre-registration, so intentionally unauthenticated/public). Same
 * Nominatim source as geocodeLocation, but returns several ranked
 * candidates with a full display name instead of resolving straight to one
 * lat/lng. Returns [] on any failure or empty query — callers should treat
 * that as "no suggestions right now", never a hard error. */
export async function searchLocations(
  query: string,
): Promise<LocationSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=0&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "xixvi-shop-natal-chart/1.0 (https://xixvi.shop)",
      },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    return rows
      .map(row => ({
        displayName: row.display_name,
        lat: Number(row.lat),
        lng: Number(row.lon),
      }))
      .filter(r => Number.isFinite(r.lat) && Number.isFinite(r.lng));
  } catch {
    return [];
  }
}

export interface NatalPlacement {
  body: string;
  sign: string;
  /** Absolute ecliptic longitude, 0-360°, used to place the body on the
   * chart wheel — NOT degree-within-sign. */
  degree: number;
  /** Degree inside the sign, from the same rounded longitude as `degree`. */
  degreeInSign: number;
  house: number | null;
  /** Sign on the cusp of `house`, from the same rounded cusps. */
  houseSign: string;
  retrograde: boolean;
}

export interface NatalHouseCusp {
  house: number;
  sign: string;
  /** Absolute ecliptic longitude, 0-360°, of the house cusp. */
  degree: number;
}

export interface NatalAspect {
  bodyA: string;
  bodyB: string;
  /** e.g. "conjunction", "trine", "square", "sextile", "opposition" */
  aspect: string;
  /** How exact the aspect is, in degrees — smaller is tighter/stronger. */
  orb: number;
  /** Endpoint houses and signs. Optional so older cached payloads still parse. */
  signA?: string;
  houseA?: number;
  degreeA?: number;
  signB?: string;
  houseB?: number;
  degreeB?: number;
}

export interface NatalChart {
  ascendant: string;
  ascendantDegree: number;
  midheaven: string;
  midheavenDegree: number;
  placements: NatalPlacement[];
  houses: NatalHouseCusp[];
  aspects: NatalAspect[];
  houseSystem: string;
  zodiac: string;
  /** True when birth time was missing — houses/ascendant are approximate
   * (calculated for local noon), and the UI should say so. */
  approximateTime: boolean;
}

const BODIES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

/**
 * Compute a natal chart.
 *
 * @param birthDate  "YYYY-MM-DD"
 * @param birthTime  "HH:MM" (24h), or null if unknown (falls back to noon,
 *                   flagged via `approximateTime`)
 * @param geo        lat/lng of the birth location
 */
export function computeNatalChart(
  birthDate: string,
  birthTime: string | null,
  geo: GeoResult,
): NatalChart {
  const [year, month, date] = birthDate.split("-").map(Number);
  const approximateTime = !birthTime;
  const [hour, minute] = (birthTime ?? "12:00").split(":").map(Number);

  const origin = new Origin({
    year,
    month: month - 1, // library is 0-indexed (0 = January)
    date,
    hour,
    minute,
    latitude: geo.lat,
    longitude: geo.lng,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectPoints: ["bodies", "angles"],
    aspectWithPoints: ["bodies", "angles"],
    aspectTypes: ["major"],
    language: "en",
  });

  const rawBodies = BODIES.map(body => {
    const cel = horoscope.CelestialBodies[body];
    const longitude = Number(cel.ChartPosition.Ecliptic.DecimalDegrees);
    return {
      body: body.charAt(0).toUpperCase() + body.slice(1),
      longitude,
      retrograde: Boolean(cel.isRetrograde),
    };
  });
  const points = horoscope.CelestialPoints ?? {};
  for (const [key, label] of [
    ["northnode", "North Node"],
    ["southnode", "South Node"],
  ] as const) {
    const cel = points[key];
    const longitude = Number(cel?.ChartPosition?.Ecliptic?.DecimalDegrees);
    if (!Number.isFinite(longitude)) continue;
    rawBodies.push({ body: label, longitude, retrograde: false });
  }

  const rawHouses = horoscope.Houses ?? horoscope._houses ?? [];
  const orderedCusps = (rawHouses as any[])
    .map((h: any) => ({
      house: Number(h.id),
      longitude: Number(
        h.ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees ?? 0,
      ),
    }))
    .sort((a, b) => a.house - b.house);
  const built = buildChartFromLongitudes({
    cusps: orderedCusps.map(cusp => cusp.longitude),
    bodies: rawBodies.map(body => ({
      name: body.body,
      longitude: body.longitude,
      retrograde: body.retrograde,
    })),
  });
  const houses: NatalHouseCusp[] = built.houses;
  const placements: NatalPlacement[] =
    built.placements satisfies ChartPlacement[];
  const aspects: NatalAspect[] = built.aspects satisfies ChartAspect[];

  const ascendantCusp = houses.find(house => house.house === 1);
  const midheavenCusp = houses.find(house => house.house === 10);
  const ascendantLongitude = Number(
    horoscope.Ascendant?.ChartPosition?.Ecliptic?.DecimalDegrees ??
      ascendantCusp?.degree ??
      0,
  );
  const midheavenLongitude = Number(
    horoscope.Midheaven?.ChartPosition?.Ecliptic?.DecimalDegrees ??
      midheavenCusp?.degree ??
      0,
  );

  return {
    ascendant: ascendantCusp?.sign ?? signAtLongitude(ascendantLongitude).sign,
    ascendantDegree:
      ascendantCusp?.degree ?? roundLongitude(ascendantLongitude),
    midheaven: midheavenCusp?.sign ?? signAtLongitude(midheavenLongitude).sign,
    midheavenDegree:
      midheavenCusp?.degree ?? roundLongitude(midheavenLongitude),
    placements,
    houses,
    aspects,
    houseSystem: "Placidus",
    zodiac: "Tropical",
    approximateTime,
  };
}
