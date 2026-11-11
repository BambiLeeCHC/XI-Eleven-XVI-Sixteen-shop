import { FLAT_MOCKUP_FILES } from "../data/flatMockupFiles";

export type FlatPick = {
  url: string;
  /** True when the image is a flat or ghost mockup, not a styled photo. */
  flat: boolean;
};

function stem(name: string) {
  return name
    .replace(/[\[\]]/g, " ")
    .replace(/[“”"″']/g, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function score(url: string) {
  const file = decodeURIComponent(url.split("/").pop() || "").toLowerCase();
  let value = 0;
  if (url.includes("/mockups/")) value += 80;
  if (file.includes("-front-") || file.includes("_front")) value += 40;
  if (file.includes("flat")) value += 50;
  if (/_0\.(png|jpe?g|webp)$/.test(file)) value += 30;
  if (file.endsWith(".png")) value += 8;
  if (
    /rear|back|inside|detail|sky|mannequin|model|ai-fashion|legacy/.test(file)
  ) {
    value -= 40;
  }
  if (/\.(jpe?g|webp)$/.test(file)) value -= 12;
  return value;
}

/**
 * Flat-lay or ghost-mannequin mockup for a colorway.
 * Prefers a file in /mockups, then a Printful-style front image in the
 * product gallery. Styled, showroom, and drape shots are last.
 */
export function flatMockup(
  name: string,
  images: Array<string | null | undefined> | null | undefined,
): FlatPick {
  const base = stem(name);
  const lower = name.toLowerCase();
  // Dash flat2 files are phone screenshots. Use the pre-cropped leg print.
  if (lower.includes("l-flow") && lower.includes("dash")) {
    const swatch = lower.includes("white")
      ? "swatches/L-Flow_Leggings_Dash_White.png"
      : "swatches/L-Flow_Leggings_Dash_Black.png";
    return { url: `/mockups/${swatch}`, flat: true };
  }
  const aliases: Record<string, string[]> = {
    B_Lift_Sports_Bra_Dash: ["B-Lift_Sports_Bra_Dash_Black.png"],
    "B-Lift_Sports_Bra_Dash": ["B-Lift_Sports_Bra_Dash_Black.png"],
    "L-Flow_Leggings_Onyx": ["L-Flow_Yoga_Leggings_Onyx_0.png"],
    "L-Flow_Yoga_Leggings_Onyx": ["L-Flow_Yoga_Leggings_Onyx_0.png"],
    "L-Flow_Leggings_Ivory": ["L-Flow_Yoga_Leggings_Ivory_0.png"],
    "L-Flow_Yoga_Leggings_Ivory": ["L-Flow_Yoga_Leggings_Ivory_0.png"],
  };
  const named = [
    ...(aliases[base] ?? []),
    `${base}.png`,
    `${base}_0.png`,
    `${base}_flat2.png`,
    `${base}_flat.png`,
    `${base}_front.png`,
  ];
  for (const file of named) {
    if (FLAT_MOCKUP_FILES.has(file)) {
      return { url: `/mockups/${file}`, flat: true };
    }
  }

  const ranked = (images ?? [])
    .map(src => (src ?? "").trim())
    .filter(Boolean)
    .map(url => ({ url, score: score(url) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked.find(item => item.score >= 20);
  if (best) return { url: best.url, flat: true };
  const plain = ranked.find(item => item.url.toLowerCase().endsWith(".png"));
  if (plain) return { url: plain.url, flat: false };
  if (ranked[0]) return { url: ranked[0].url, flat: false };
  return { url: "", flat: false };
}
