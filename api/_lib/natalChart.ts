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

// @ts-ignore — no published types for this package; it's CJS-only and its
// named exports aren't statically detectable under Node's ESM loader, so
// import the default and destructure instead of `import { Origin, ... }`.
import circularNatalHoroscope from "circular-natal-horoscope-js";
const { Origin, Horoscope } = circularNatalHoroscope as any;

export interface GeoResult {
  lat: number;
  lng: number;
}

/** Geocode a free-text birth location via Nominatim (OpenStreetMap). Returns
 * null on any failure (no match, network error, rate limit) — callers must
 * treat that as "chart unavailable until location is resolved", not a hard
 * error, since sign-up birth location is optional/free text. */
export async function geocodeLocation(location: string): Promise<GeoResult | null> {
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
export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
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
    const rows = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    return rows
      .map((row) => ({
        displayName: row.display_name,
        lat: Number(row.lat),
        lng: Number(row.lon),
      }))
      .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
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
  house: number | null;
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
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
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

  const placements: NatalPlacement[] = BODIES.map((body) => {
    const cel = horoscope.CelestialBodies[body];
    return {
      body: body.charAt(0).toUpperCase() + body.slice(1),
      sign: cel.Sign.label,
      degree: Math.round(cel.ChartPosition.Ecliptic.DecimalDegrees * 100) / 100,
      house: cel.House?.id ?? null,
      retrograde: Boolean(cel.isRetrograde),
    };
  });

  const houses: NatalHouseCusp[] = (horoscope._houses ?? []).map((h: any) => ({
    house: h.id,
    sign: h.Sign?.label ?? "",
    degree: Math.round(h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees * 100) / 100,
  }));

  const bodyKeySet = new Set(BODIES);
  const aspects: NatalAspect[] = (horoscope.Aspects?.all ?? [])
    .filter((a: any) => bodyKeySet.has(a.point1Key) && bodyKeySet.has(a.point2Key))
    .map((a: any) => ({
      bodyA: a.point1Label,
      bodyB: a.point2Label,
      aspect: a.aspectKey,
      orb: Math.round(a.orb * 100) / 100,
    }))
    .sort((a: NatalAspect, b: NatalAspect) => a.orb - b.orb);

  return {
    ascendant: horoscope.Ascendant.Sign.label,
    ascendantDegree: Math.round(horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees * 100) / 100,
    midheaven: horoscope.Midheaven?.Sign?.label ?? "Unknown",
    midheavenDegree: Math.round((horoscope.Midheaven?.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0) * 100) / 100,
    placements,
    houses,
    aspects,
    houseSystem: "Placidus",
    zodiac: "Tropical",
    approximateTime,
  };
}
