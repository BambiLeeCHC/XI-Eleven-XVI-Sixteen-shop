import { useEffect } from "react";

interface GradientColors {
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  c5: string;
}

/** Deep fashion skies. Bright enough to see the loop, dark enough to read cream type. */
const TIME_GRADIENTS: Record<string, GradientColors> = {
  night: { c1: "#07080d", c2: "#12101c", c3: "#1a1030", c4: "#0c1218", c5: "#160e16" },
  predawn: { c1: "#100c18", c2: "#241428", c3: "#3a2040", c4: "#1a1424", c5: "#201018" },
  dawn: { c1: "#1a1020", c2: "#3a2048", c3: "#6a3058", c4: "#2a1830", c5: "#3a2018" },
  sunrise: { c1: "#201018", c2: "#4a2840", c3: "#7a4060", c4: "#3a2430", c5: "#4a2818" },
  morning: { c1: "#101820", c2: "#1c2838", c3: "#243848", c4: "#182028", c5: "#1a2420" },
  lateMorning: { c1: "#121820", c2: "#1a2834", c3: "#1e3444", c4: "#162028", c5: "#1c2428" },
  midday: { c1: "#10161e", c2: "#182430", c3: "#1c3040", c4: "#141c28", c5: "#1a2228" },
  afternoon: { c1: "#14161c", c2: "#201c28", c3: "#2a2438", c4: "#1a1824", c5: "#241c20" },
  lateAfternoon: { c1: "#18141c", c2: "#2a2030", c3: "#3a2840", c4: "#201820", c5: "#2a1c18" },
  sunset: { c1: "#1a1018", c2: "#3a2038", c3: "#6a3050", c4: "#2a1828", c5: "#3a2018" },
  dusk: { c1: "#120e18", c2: "#221830", c3: "#3a2850", c4: "#161422", c5: "#1c1420" },
  twilight: { c1: "#0c0e16", c2: "#161228", c3: "#241838", c4: "#10141c", c5: "#140e18" },
  evening: { c1: "#080a10", c2: "#12101a", c3: "#1a1430", c4: "#0e1218", c5: "#120e14" },
};

function paletteForHour(hour: number): GradientColors {
  if (hour < 5) return TIME_GRADIENTS.night;
  if (hour < 6) return TIME_GRADIENTS.predawn;
  if (hour < 7) return TIME_GRADIENTS.dawn;
  if (hour < 8) return TIME_GRADIENTS.sunrise;
  if (hour < 10) return TIME_GRADIENTS.morning;
  if (hour < 12) return TIME_GRADIENTS.lateMorning;
  if (hour < 14) return TIME_GRADIENTS.midday;
  if (hour < 16) return TIME_GRADIENTS.afternoon;
  if (hour < 18) return TIME_GRADIENTS.lateAfternoon;
  if (hour < 19) return TIME_GRADIENTS.sunset;
  if (hour < 20) return TIME_GRADIENTS.dusk;
  if (hour < 22) return TIME_GRADIENTS.twilight;
  return TIME_GRADIENTS.evening;
}

function mix(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const channel = (from: number, to: number) =>
    Math.round(from + (to - from) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
}

export function smoothedSky(now = new Date()) {
  const hour = now.getHours();
  const t = now.getMinutes() / 60;
  const current = paletteForHour(hour);
  const next = paletteForHour((hour + 1) % 24);
  return {
    c1: mix(current.c1, next.c1, t),
    c2: mix(current.c2, next.c2, t),
    c3: mix(current.c3, next.c3, t),
    c4: mix(current.c4, next.c4, t),
    c5: mix(current.c5, next.c5, t),
  };
}

export function useTimeGradient() {
  useEffect(() => {
    const apply = () => {
      const sky = smoothedSky();
      const root = document.documentElement;
      root.style.setProperty("--grad-c1", sky.c1);
      root.style.setProperty("--grad-c2", sky.c2);
      root.style.setProperty("--grad-c3", sky.c3);
      root.style.setProperty("--grad-c4", sky.c4);
      root.style.setProperty("--grad-c5", sky.c5);
    };
    apply();
    const timer = window.setInterval(apply, 60_000);
    return () => window.clearInterval(timer);
  }, []);
}
