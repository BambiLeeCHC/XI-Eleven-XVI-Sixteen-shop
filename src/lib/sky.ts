/**
 * THE HOUSE SKY — shared phase + weather engine.
 *
 * The XI·XVI sky is a brand surface: it tracks the visitor's real local hour
 * and real local weather. This module holds the pure logic so both the LED
 * announcement bar and the full-page Journal backdrop stay in agreement.
 */

export type SkyPhase = "night" | "dawn" | "day" | "dusk";
export type WeatherCondition = "clear" | "cloudy" | "rain" | "storm";

/** Fine-grained phase from the local clock. */
export function getSkyPhase(d: Date = new Date()): SkyPhase {
  const h = d.getHours();
  if (h >= 5 && h < 7) return "dawn";
  if (h >= 7 && h < 18) return "day";
  if (h >= 18 && h < 20) return "dusk";
  return "night";
}

export function weatherCodeToCondition(code: number): WeatherCondition {
  if (code >= 95) return "storm";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "rain";
  if ([2, 3, 45, 48].includes(code)) return "cloudy";
  return "clear";
}

const LOCATION_KEY = "xixvi-weather-location";

/**
 * Resolve the visitor's weather with graceful fallbacks:
 * cached coords → IP lookup → silent give-up (stays "clear").
 * Never prompts for geolocation — the Journal should not throw a permission
 * dialog at someone who came to read.
 */
export async function resolveWeather(): Promise<WeatherCondition | null> {
  const fetchWeather = async (lat: number, lng: number) => {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`,
    );
    const d = await r.json();
    return weatherCodeToCondition(d?.current_weather?.weathercode ?? 0);
  };

  try {
    const cached = sessionStorage.getItem(LOCATION_KEY);
    if (cached) {
      const { latitude, longitude } = JSON.parse(cached);
      return await fetchWeather(latitude, longitude);
    }
  } catch {
    /* ignore — fall through to IP lookup */
  }

  try {
    const res = await fetch("https://ipwho.is/");
    const loc = await res.json();
    if (
      typeof loc?.latitude === "number" &&
      typeof loc?.longitude === "number"
    ) {
      try {
        sessionStorage.setItem(
          LOCATION_KEY,
          JSON.stringify({ latitude: loc.latitude, longitude: loc.longitude }),
        );
      } catch {
        /* private mode — fine */
      }
      return await fetchWeather(loc.latitude, loc.longitude);
    }
  } catch {
    /* offline or blocked — keep the default sky */
  }
  return null;
}

/**
 * Page-scale sky gradient. Deliberately airier than the LED bar version:
 * this sits *behind* reading cards, so it keeps luminance high enough at the
 * horizon for glass surfaces to read, and never goes fully black at night.
 */
export function getPageSkyGradient(
  phase: SkyPhase,
  weather: WeatherCondition,
): string {
  const wet = weather === "rain" || weather === "storm";
  if (wet) {
    switch (phase) {
      case "day":
        return "linear-gradient(180deg, #46596e 0%, #5b7086 26%, #7b8fa3 52%, #9fb0c0 76%, #c3cfda 100%)";
      case "dawn":
        return "linear-gradient(180deg, #3a3352 0%, #5d4a63 26%, #8a6a70 54%, #b18f8b 78%, #d3b8ae 100%)";
      case "dusk":
        return "linear-gradient(180deg, #2b2b44 0%, #423a58 26%, #61506b 54%, #877081 78%, #ab97a2 100%)";
      case "night":
        return "linear-gradient(180deg, #101c33 0%, #1a2b47 28%, #274060 56%, #3a5878 80%, #55738f 100%)";
    }
  }
  if (weather === "cloudy") {
    switch (phase) {
      case "day":
        return "linear-gradient(180deg, #5b83ab 0%, #7a9dc0 30%, #9db9d3 58%, #c0d5e6 80%, #dfeaf4 100%)";
      case "dawn":
        return "linear-gradient(180deg, #3c3560 0%, #6b4c6c 26%, #a5717a 52%, #d69f86 78%, #f0cba4 100%)";
      case "dusk":
        return "linear-gradient(180deg, #2c2b48 0%, #443a5c 26%, #6a5070 54%, #9a7288 78%, #c298a4 100%)";
      case "night":
        return "linear-gradient(180deg, #101d35 0%, #1a2f4d 28%, #2a4568 56%, #3f6288 80%, #5b81a5 100%)";
    }
  }
  switch (phase) {
    case "day":
      return "linear-gradient(180deg, #2f6fb5 0%, #3f83c6 16%, #5599d6 34%, #74b1e3 54%, #9bcaee 74%, #c4e2f7 90%, #e8f4fd 100%)";
    case "dawn":
      return "linear-gradient(180deg, #2b2154 0%, #4c2c63 16%, #82446a 34%, #b86a63 52%, #dd9264 70%, #f2bd80 86%, #fbe0ab 100%)";
    case "dusk":
      return "linear-gradient(180deg, #1c1c3a 0%, #2f2350 16%, #52305c 32%, #82405f 50%, #b45f5c 68%, #dd8b62 84%, #f6bf88 100%)";
    case "night":
      return "linear-gradient(180deg, #0a1730 0%, #102544 24%, #1a3760 46%, #274d7c 68%, #375f92 86%, #4a74a6 100%)";
  }
}

/** Sun / moon placement, as a percentage of the viewport. */
export function getLuminaryPosition(phase: SkyPhase): { x: number; y: number } {
  switch (phase) {
    case "dawn":
      return { x: 80, y: 62 };
    case "day":
      return { x: 76, y: 16 };
    case "dusk":
      return { x: 22, y: 58 };
    case "night":
      return { x: 78, y: 18 };
  }
}

/** Deterministic PRNG so cloud fields never re-shuffle between renders. */
export function seededRng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
