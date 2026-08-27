/** Locked IMPACT visual system — URLs, grouping, and snap colours. */

export const CREST_URL =
  "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/projects/ce987dab-503d-4ae5-b4c4-bd584c4baf19/brand-assets/brand-xi-xvi-crest/xi-xvi-crest-logo.png?v=gold-shield";

export const IMPACT_HERO_URL =
  "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/projects/ce987dab-503d-4ae5-b4c4-bd584c4baf19/content-assets/content-unbothered-hero/hero-locked-impact.jpg";

export const STYLE_ORDER = [
  "D-Slip",
  "B-Lift",
  "L-Flow",
  "J-Glitch",
  "S-Glitch 2.5",
  "S-Glitch 6.3",
  "T-Icon Oversized",
  "T-Icon Tie-Dye",
  "T-Icon",
] as const;

export function styleKeyFromName(name: string): string {
  const ordered = [...STYLE_ORDER].sort((a, b) => b.length - a.length);
  for (const key of ordered) {
    if (name.startsWith(key)) return key;
  }
  return name.split("[")[0]?.trim() || name;
}

export function colorFromName(name: string): string {
  const match = name.match(/\[([^\]]+)\]/);
  return match?.[1] ?? "";
}

export function snapHex(color: string): string {
  const value = color.toLowerCase();
  if (value.includes("volt")) return "#C6F25A";
  if (value.includes("ice")) return "#CDE4F5";
  if (value.includes("peach")) return "#F4C4B0";
  if (value.includes("pink")) return "#D9A8B8";
  if (
    value.includes("whisper") ||
    value.includes("ivory") ||
    value.includes("white")
  )
    return "#EDE6D9";
  if (value.includes("nude")) return "#C9A07A";
  if (value.includes("red")) return "#8E1D2C";
  if (value.includes("cerulean") || value.includes("navy")) return "#16425B";
  if (
    value.includes("black") ||
    value.includes("onyx") ||
    value.includes("dash")
  )
    return "#0D0D0D";
  return "#8A847C";
}

export function formatPrice(cents: number | undefined | null): string {
  const value = typeof cents === "number" ? cents : 0;
  return `$${(value / 100).toFixed(0)}`;
}

export function padCount(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

export const TRUST_ITEMS = [
  "Made on demand",
  "Easy returns",
  "Free shipping",
  "Secure checkout",
] as const;

export const CAMPAIGN_KICKER = "Unbothered in XI Eleven XVI Sixteen";
export const HERO_TITLE = "The world is ending,";
export const HERO_SUB = "we love that for them...";
