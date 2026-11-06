export type SkyMode = "live" | "night" | "dusk" | "dawn" | "day";

export const SKY_MODES: { id: SkyMode; label: string }[] = [
  { id: "live", label: "Live Sky" },
  { id: "night", label: "Astral Night" },
  { id: "dusk", label: "Golden Dusk" },
  { id: "dawn", label: "Dawn" },
  { id: "day", label: "Clear Day" },
];

export function skyClock(mode: SkyMode, now = new Date()) {
  if (mode === "night") return { hour: 22, isDay: false };
  if (mode === "dusk") return { hour: 19, isDay: false };
  if (mode === "dawn") return { hour: 6, isDay: true };
  if (mode === "day") return { hour: 13, isDay: true };
  const hour = now.getHours();
  return { hour, isDay: hour >= 7 && hour < 19 };
}

export function skyGradient(hour: number, isDay: boolean) {
  if (hour >= 5 && hour < 7) {
    return "linear-gradient(180deg, #08101e 0%, #1a1230 22%, #5a2848 48%, #c07050 74%, #e8a870 100%)";
  }
  if (hour >= 18 && hour < 21) {
    return "linear-gradient(180deg, #0a0e1e 0%, #1a1235 24%, #6b2850 46%, #d4784a 72%, #f0a858 100%)";
  }
  if (!isDay) {
    return "linear-gradient(180deg, #050510 0%, #0a0a1e 28%, #12102a 58%, #080818 100%)";
  }
  return "linear-gradient(180deg, #0e2a5e 0%, #1a4a90 24%, #3a7ac0 52%, #7ab5e5 78%, #c5e4fb 100%)";
}
