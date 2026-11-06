export type SkyPhase = "astral" | "dawn" | "day" | "dusk" | "twilight";

export type CloudGrade = {
  opacity: number;
  filter: string;
  blendMode: "screen" | "soft-light";
  veil: string;
};

export type SkyPalette = {
  hour: number;
  phase: SkyPhase;
  isDay: boolean;
  showStars: boolean;
  starOpacity: number;
  moonOpacity: number;
  moonFilter: string;
  gradient: string;
  cloud: CloudGrade;
};

type WashStop = { hour: number; colors: [string, string, string, string] };

const WASH: WashStop[] = [
  { hour: 0, colors: ["#04040f", "#07071a", "#120e2c", "#060612"] },
  { hour: 4, colors: ["#050510", "#0a0a1e", "#12102a", "#080818"] },
  { hour: 5.2, colors: ["#08101e", "#1a1230", "#5a2848", "#c07050"] },
  { hour: 6.6, colors: ["#2a1840", "#6d4a72", "#e7b0c4", "#f7e4dc"] },
  { hour: 8.2, colors: ["#12325f", "#1d4e96", "#4d88c8", "#b7daf4"] },
  { hour: 13, colors: ["#0e2a5e", "#1a4a90", "#3a7ac0", "#c5e4fb"] },
  { hour: 16.4, colors: ["#16325f", "#3d5688", "#c4846a", "#f0c090"] },
  { hour: 18.2, colors: ["#0a0e1e", "#1a1235", "#6b2850", "#f0a858"] },
  { hour: 20.2, colors: ["#070814", "#1a1030", "#3a2048", "#14101c"] },
  { hour: 22, colors: ["#050510", "#09091c", "#16122e", "#070714"] },
  { hour: 24, colors: ["#04040f", "#07071a", "#120e2c", "#060612"] },
];

const CLOUD: Record<SkyPhase, CloudGrade> = {
  astral: {
    opacity: 0.4,
    filter:
      "sepia(0.7) hue-rotate(205deg) saturate(0.55) brightness(0.5) contrast(0.94) blur(0.6px)",
    blendMode: "screen",
    veil: "radial-gradient(ellipse at 50% 42%, rgba(78, 86, 150, 0.55), rgba(18, 14, 42, 0.05) 72%)",
  },
  dawn: {
    opacity: 0.48,
    filter:
      "sepia(0.45) hue-rotate(305deg) saturate(0.8) brightness(0.96) contrast(0.96) blur(0.35px)",
    blendMode: "soft-light",
    veil: "radial-gradient(ellipse at 50% 48%, rgba(232, 176, 196, 0.55), rgba(247, 228, 220, 0.05) 70%)",
  },
  day: {
    opacity: 0.5,
    filter:
      "sepia(0.22) hue-rotate(188deg) saturate(0.48) brightness(1.04) contrast(0.94) blur(0.25px)",
    blendMode: "soft-light",
    veil: "radial-gradient(ellipse at 50% 40%, rgba(150, 196, 232, 0.4), rgba(197, 228, 251, 0.02) 72%)",
  },
  dusk: {
    opacity: 0.52,
    filter:
      "sepia(0.85) hue-rotate(338deg) saturate(1.45) brightness(0.8) contrast(0.98) blur(0.4px)",
    blendMode: "soft-light",
    veil: "radial-gradient(ellipse at 50% 55%, rgba(214, 112, 64, 0.5), rgba(90, 32, 58, 0.12) 74%)",
  },
  twilight: {
    opacity: 0.38,
    filter:
      "sepia(0.5) hue-rotate(248deg) saturate(0.65) brightness(0.56) contrast(0.96) blur(0.5px)",
    blendMode: "screen",
    veil: "radial-gradient(ellipse at 50% 40%, rgba(92, 52, 120, 0.48), rgba(12, 10, 24, 0.04) 72%)",
  },
};

const MOON_FILTER: Record<SkyPhase, string> = {
  astral: "saturate(0.55) brightness(0.95) drop-shadow(0 0 28px rgba(176, 186, 230, 0.45))",
  dawn: "sepia(0.35) hue-rotate(300deg) saturate(0.85) brightness(1)",
  day: "saturate(0.25) brightness(1.12)",
  dusk: "sepia(0.55) hue-rotate(345deg) saturate(1.15) brightness(0.95)",
  twilight: "sepia(0.3) hue-rotate(250deg) saturate(0.7) brightness(0.86)",
};

export function normalizeHour(hour: number): number {
  if (!Number.isFinite(hour)) return 0;
  const wrapped = hour % 24;
  return wrapped < 0 ? wrapped + 24 : wrapped;
}

/** Fractional hour in the viewer's local timezone. */
export function localHour(now = new Date()): number {
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}

export function skyPhase(hour: number): SkyPhase {
  const h = normalizeHour(hour);
  if (h >= 5 && h < 8) return "dawn";
  if (h >= 8 && h < 16.5) return "day";
  if (h >= 16.5 && h < 19.5) return "dusk";
  if (h >= 19.5 && h < 21.5) return "twilight";
  return "astral";
}

function mixChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function mixHex(a: string, b: string, t: number): string {
  const from = hexToRgb(a);
  const to = hexToRgb(b);
  const channel = (index: number) =>
    mixChannel(from[index] ?? 0, to[index] ?? 0, t)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

export function skyGradient(hour: number): string {
  const h = normalizeHour(hour);
  let index = 0;
  for (let i = 0; i < WASH.length - 1; i += 1) {
    const current = WASH[i];
    const next = WASH[i + 1];
    if (!current || !next) continue;
    if (h >= current.hour && h <= next.hour) {
      index = i;
      break;
    }
  }
  const from = WASH[index] ?? WASH[0];
  const to = WASH[index + 1] ?? from;
  if (!from || !to) {
    return "linear-gradient(180deg, #050510 0%, #080818 100%)";
  }
  const span = to.hour - from.hour;
  const t = span <= 0 ? 0 : (h - from.hour) / span;
  const colors = from.colors.map((color, colorIndex) =>
    mixHex(color, to.colors[colorIndex] ?? color, t),
  );
  return `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 32%, ${colors[2]} 64%, ${colors[3]} 100%)`;
}

export function paletteForHour(hour: number): SkyPalette {
  const normalized = normalizeHour(hour);
  const phase = skyPhase(normalized);
  const cloud = CLOUD[phase];
  return {
    hour: normalized,
    phase,
    isDay: phase === "day",
    showStars: phase !== "day",
    starOpacity:
      phase === "astral" ? 1 : phase === "twilight" ? 0.72 : phase === "dusk" ? 0.42 : phase === "dawn" ? 0.34 : 0,
    moonOpacity:
      phase === "astral" ? 0.92 : phase === "twilight" ? 0.64 : phase === "dawn" ? 0.42 : phase === "dusk" ? 0.34 : 0.12,
    moonFilter: MOON_FILTER[phase],
    gradient: skyGradient(normalized),
    cloud,
  };
}

export function skyAt(now = new Date()): SkyPalette {
  return paletteForHour(localHour(now));
}
