/**
 * Cartoon XI · XVI character avatars.
 * Pure functions only — no DOM — so the API can share the same portraits.
 */

export type HairStyle =
  | "curls"
  | "waves"
  | "locs"
  | "bob"
  | "bangs"
  | "fade"
  | "braids";

export type SkinTone =
  | "porcelain"
  | "sand"
  | "honey"
  | "amber"
  | "bronze"
  | "deep";

export type Outfit = "hoodie" | "mockneck" | "varsity" | "cloak";

export type AvatarFit = "obsidian-hoodie" | "sage-mockneck" | "astral-varsity";

export type AvatarStyleOptions = {
  hairStyle?: HairStyle;
  skinTone?: SkinTone;
  outfit?: Outfit;
  accent?: string;
  glasses?: boolean;
  fit?: AvatarFit;
};

const HAIR: HairStyle[] = [
  "curls",
  "waves",
  "locs",
  "bob",
  "bangs",
  "fade",
  "braids",
];
const SKINS: SkinTone[] = [
  "porcelain",
  "sand",
  "honey",
  "amber",
  "bronze",
  "deep",
];
const OUTFITS: Outfit[] = ["hoodie", "mockneck", "varsity", "cloak"];

const SKIN_PAINT: Record<
  SkinTone,
  { base: string; shadow: string; deep: string }
> = {
  porcelain: { base: "#F6E2C8", shadow: "#E4C4A4", deep: "#C99A78" },
  sand: { base: "#E8B896", shadow: "#C88862", deep: "#A56A48" },
  honey: { base: "#C68642", shadow: "#A66A32", deep: "#7A4A22" },
  amber: { base: "#A56B3C", shadow: "#8A5228", deep: "#623818" },
  bronze: { base: "#8D5524", shadow: "#6E3E18", deep: "#4C2910" },
  deep: { base: "#5C3317", shadow: "#3E2110", deep: "#2A160C" },
};

const HAIR_PAINT = [
  "#1A1420",
  "#2A2118",
  "#4A3428",
  "#141820",
  "#3A2848",
  "#1C2420",
];
const IRIS_PAINT = [
  "#3A2418",
  "#1E3A34",
  "#243044",
  "#4A3060",
  "#6A4020",
  "#142010",
];

export function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(seed: number, list: readonly T[], salt: number): T {
  const index = (seed + salt * 17) % list.length;
  return list[index] ?? list[0];
}

export function outfitForFit(fit?: AvatarFit): Outfit | undefined {
  if (fit === "obsidian-hoodie") return "hoodie";
  if (fit === "sage-mockneck") return "mockneck";
  if (fit === "astral-varsity") return "varsity";
  return undefined;
}

export function resolveAvatarStyle(
  seed: string,
  options: AvatarStyleOptions = {},
) {
  const hashed = hashSeed(seed || "xixvi");
  const outfit =
    options.outfit ?? outfitForFit(options.fit) ?? pick(hashed, OUTFITS, 3);
  const accent =
    options.accent ??
    (options.fit === "sage-mockneck"
      ? "#D8F0C4"
      : options.fit === "obsidian-hoodie"
        ? "#F5B971"
        : options.fit === "astral-varsity"
          ? "#C7A6FF"
          : pick(hashed, ["#F5B971", "#8CE0B1", "#8CCBFF", "#C7A6FF"], 9));
  return {
    hairStyle: options.hairStyle ?? pick(hashed, HAIR, 1),
    skinTone: options.skinTone ?? pick(hashed, SKINS, 2),
    outfit,
    accent,
    glasses: Boolean(options.glasses),
    hair: pick(hashed, HAIR_PAINT, 4),
    iris: pick(hashed, IRIS_PAINT, 5),
  };
}

function hairPath(style: HairStyle): string {
  if (style === "curls") {
    return "M78 108c-8-28 8-58 42-64 28-6 52 8 62 32 8 4 18 2 24-8 10 18 8 40-2 54-6 28-28 48-58 48-34 0-60-22-68-62z";
  }
  if (style === "waves") {
    return "M74 118c2-46 28-72 58-74 34-2 62 18 70 52 4 8 16 10 22 2 2 22-6 40-20 50-8 24-30 40-58 40-36 0-64-24-72-70z";
  }
  if (style === "locs") {
    return "M86 70c8-24 40-36 62-28 16 6 28 20 32 36 10 2 20 14 18 28-2 18-14 28-20 46-8 22-20 36-40 40-28 6-52-8-60-32-8-16-6-28-14-40-6-14 2-36 22-50z";
  }
  if (style === "bob") {
    return "M80 112c0-40 22-68 52-70 36-2 64 22 68 58 2 20-4 36-4 52 0 10-8 16-16 16H98c-12 0-18-8-18-18 0-14-2-24 0-38z";
  }
  if (style === "bangs") {
    return "M76 120c4-48 26-74 56-76 32-2 58 16 68 48 6 6 14 4 20-2 4 16 2 34-8 46-4 28-26 50-58 52-34 2-62-16-70-48-4-8-10-14-8-20z";
  }
  if (style === "fade") {
    return "M96 96c6-30 28-48 52-46 22 2 40 16 46 36 2 8-8 14-8 22 0 16-10 28-28 34-22 8-46 2-58-16-8-12-10-20-4-30z";
  }
  return "M84 104c6-36 32-58 58-56 24 2 44 18 50 40 8-6 22-4 26 8-4 16-16 24-24 36-6 22-24 40-50 42-32 2-58-16-66-42-6-8-4-18 6-28z";
}

function outfitMarkup(outfit: Outfit, accent: string): string {
  const crest = `<g class="xi-crest" transform="translate(108 168)">
    <path d="M12 0 22 6v10c0 8-6 14-10 16C8 30 2 24 2 16V6z" fill="#0D1017" stroke="${accent}" stroke-width="1.4"/>
    <path d="M12 6 14.2 11h5l-4 3.2 1.5 5L12 16.2 7.3 19.2 8.8 14.2 4.8 11h5z" fill="${accent}"/>
    <text x="12" y="28" text-anchor="middle" font-size="3.2" fill="${accent}" font-family="sans-serif">XI·XVI</text>
  </g>`;
  if (outfit === "mockneck") {
    return `<g data-outfit="mockneck" class="xi-outfit xi-outfit--mockneck">
      <path d="M78 168c8 18 18 28 42 30 24 2 40-8 50-28 8 10 14 28 14 42v28H64v-28c0-16 6-32 14-44z" fill="#1C2820" stroke="#0D1017" stroke-width="2.4"/>
      <path d="M96 162h48c6 0 10 6 8 12l-6 16H96l-8-16c-2-6 2-12 8-12z" fill="#D8F0C4" stroke="#0D1017" stroke-width="2"/>
      ${crest}
    </g>`;
  }
  if (outfit === "varsity") {
    return `<g data-outfit="varsity" class="xi-outfit xi-outfit--varsity">
      <path d="M70 176c10 8 22 14 50 14s40-6 50-14c10 12 16 30 16 48v20H54v-20c0-18 6-36 16-48z" fill="#241832" stroke="#0D1017" stroke-width="2.4"/>
      <path d="M86 158h68l-8 22H94z" fill="${accent}" stroke="#0D1017" stroke-width="2"/>
      <path d="M70 176h18l-8 16H62zM152 176h18l8 16h-18z" fill="#F7F4EC" stroke="#0D1017" stroke-width="1.6"/>
      ${crest}
    </g>`;
  }
  if (outfit === "cloak") {
    return `<g data-outfit="cloak" class="xi-outfit xi-outfit--cloak">
      <path d="M70 150c18-16 82-16 100 0 8 28 16 70 16 94H54c0-24 8-66 16-94z" fill="#16141E" stroke="#0D1017" stroke-width="2.4"/>
      <path d="M98 146c8 14 36 14 44 0 2 10-6 18-22 18s-24-8-22-18z" fill="#100E16" stroke="${accent}" stroke-width="1.6"/>
      ${crest}
    </g>`;
  }
  return `<g data-outfit="hoodie" class="xi-outfit xi-outfit--hoodie">
    <path d="M76 132c-16 10-24 36-18 58 4 8 4 20 2 36h120c-2-16-2-28 2-36 6-22-2-48-18-58-14 16-36 22-52 20-10 0-24-6-36-20z" fill="#1A1C24" stroke="#0D1017" stroke-width="2.4"/>
    <path d="M64 188c8 16 24 28 56 28s48-12 56-28v56H64z" fill="#14161C" stroke="#0D1017" stroke-width="2.4"/>
    <path d="M108 150c4 16 20 16 24 0" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M112 164c0 14-2 22-2 22M128 164c0 14 2 22 2 22" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
    ${crest}
  </g>`;
}

function faceMarkup(style: ReturnType<typeof resolveAvatarStyle>): string {
  const skin = SKIN_PAINT[style.skinTone];
  const glasses = style.glasses
    ? `<g class="xi-glasses">
        <rect x="86" y="112" width="26" height="16" rx="6" fill="none" stroke="#F7F4EC" stroke-width="2"/>
        <rect x="128" y="112" width="26" height="16" rx="6" fill="none" stroke="#F7F4EC" stroke-width="2"/>
        <path d="M112 120h16" stroke="#F7F4EC" stroke-width="2"/>
      </g>`
    : "";
  return `<g class="xi-face">
    <ellipse cx="120" cy="118" rx="46" ry="52" fill="${skin.base}" stroke="#141018" stroke-width="2.6"/>
    <path d="M86 132c8 28 18 40 34 44 16-4 28-16 36-44" fill="${skin.shadow}" opacity="0.85"/>
    <path d="M98 146c6 10 14 16 22 16s16-6 22-16" fill="${skin.deep}" opacity="0.35"/>
    <g class="xi-eyes">
      <ellipse cx="100" cy="116" rx="10" ry="7" fill="#F7F4EC" stroke="#141018" stroke-width="1.4"/>
      <ellipse cx="140" cy="116" rx="10" ry="7" fill="#F7F4EC" stroke="#141018" stroke-width="1.4"/>
      <circle cx="102" cy="116" r="4.2" fill="${style.iris}"/>
      <circle cx="142" cy="116" r="4.2" fill="${style.iris}"/>
      <circle cx="103.2" cy="117" r="1.8" fill="#141018"/>
      <circle cx="143.2" cy="117" r="1.8" fill="#141018"/>
      <circle cx="104.4" cy="114.6" r="1.1" fill="#F7F4EC"/>
      <circle cx="144.4" cy="114.6" r="1.1" fill="#F7F4EC"/>
      <path d="M90 108c6-6 14-6 20-2" fill="none" stroke="#141018" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M130 106c6-4 14-4 20 2" fill="none" stroke="#141018" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M90 112c4-5 12-6 18-2" fill="none" stroke="#141018" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M132 110c6-4 12-4 18 0" fill="none" stroke="#141018" stroke-width="1.5" stroke-linecap="round"/>
    </g>
    <path d="M118 124c2 8 4 12 4 12" fill="none" stroke="${skin.deep}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M116 138c4 2 10 2 12-2" fill="none" stroke="${skin.deep}" stroke-width="1.4" stroke-linecap="round"/>
    <path class="xi-smile" d="M104 146c6 8 26 8 32 0" fill="${skin.deep}" stroke="#141018" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M108 146c4 4 16 4 20 0" fill="#C46A78" opacity="0.8"/>
    ${glasses}
  </g>`;
}

const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

/** Stylized 2D XI · XVI streetwear character. A sign string keeps SkyAvatar compatible. */
export function celestialPortraitSvg(
  seed: string,
  options: AvatarStyleOptions | string = {},
): string {
  const sign = typeof options === "string" ? options : undefined;
  const style = resolveAvatarStyle(sign ? `${seed}|${sign}` : seed, typeof options === "string" ? {} : options);
  const hair = hairPath(style.hairStyle);
  const glyph = SIGN_GLYPH[sign ?? ""] ?? "✦";
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="XI · XVI cartoon avatar" data-outfit="${style.outfit}" data-hair="${style.hairStyle}" data-sign="${sign ?? ""}">
  <defs>
    <radialGradient id="aura" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="${style.accent}" stop-opacity="0.45"/>
      <stop offset="70%" stop-color="#0D1017" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0D1017"/>
    </radialGradient>
    <clipPath id="medallion"><circle cx="120" cy="120" r="112"/></clipPath>
  </defs>
  <circle cx="120" cy="120" r="116" fill="#0D1017" stroke="${style.accent}" stroke-width="4"/>
  <circle cx="120" cy="120" r="108" fill="url(#aura)"/>
  <g clip-path="url(#medallion)" class="xi-character">
    <g class="xi-constellation" fill="${style.accent}" opacity="0.8">
      <circle cx="36" cy="54" r="1.4"/>
      <circle cx="54" cy="40" r="1.1"/>
      <circle cx="188" cy="48" r="1.5"/>
      <circle cx="204" cy="70" r="1.1"/>
      <path d="M36 54 54 40M188 48 204 70" fill="none" stroke="${style.accent}" stroke-width="0.6"/>
    </g>
    ${outfitMarkup(style.outfit, style.accent)}
    <path class="xi-hair" data-hair="${style.hairStyle}" d="${hair}" fill="${style.hair}" stroke="#141018" stroke-width="2.4" stroke-linejoin="round"/>
    ${faceMarkup(style)}
    <path class="xi-hair-front" d="${style.hairStyle === "bangs" ? "M86 104c12-16 28-18 40-8 8-12 28-14 40 0 2 10-8 12-16 8-8 6-16 6-24 0-8 6-18 4-24-6-6 2-12 4-16 6z" : ""}" fill="${style.hair}"/>
  </g>
  <text x="120" y="214" text-anchor="middle" font-size="11" font-family="sans-serif" fill="${style.accent}" letter-spacing="1.5">XI · XVI</text>
  <text x="120" y="230" text-anchor="middle" font-size="10" fill="#f7f4ec">${glyph} ${sign ?? ""}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const AVATAR_STYLES = [
  { id: "astral", label: "Astral Ethereal" },
  { id: "engraving", label: "Tarot Engraving" },
  { id: "glass", label: "Celestial Glass" },
] as const;

export type AvatarStyleId = (typeof AVATAR_STYLES)[number]["id"];

export type AvatarRequest = {
  imageDataUrl: string;
  name?: string;
  sun?: string;
  moon?: string;
  rising?: string;
  altar?: string;
  style?: AvatarStyleId | string;
};

const ELEMENT: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

export const ELEMENT_AURA = {
  fire: "#f0a070",
  earth: "#d8f0c4",
  air: "#e4d4f4",
  water: "#9fd0ea",
} as const;

export function elementForSign(sign: string | undefined): "fire" | "earth" | "air" | "water" {
  return ELEMENT[sign ?? ""] ?? "air";
}

export function styleLabel(style: string | undefined): string {
  return AVATAR_STYLES.find(item => item.id === style)?.label ?? AVATAR_STYLES[0].label;
}

function fitForStyle(style: string | undefined): AvatarFit {
  if (style === "glass") return "sage-mockneck";
  if (style === "astral") return "astral-varsity";
  return "obsidian-hoodie";
}

export function resizeImageFile(file: Blob, size = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that photo."));
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        const scale = Math.max(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        ctx.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.onerror = () => reject(new Error("Couldn't open that photo."));
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

export async function createTrueNorthAvatar(input: AvatarRequest): Promise<{ imageDataUrl: string; source: "api" | "canvas" }> {
  try {
    const response = await fetch("/api/chart?action=avatar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "avatar", ...input, style: input.style ?? "engraving" }),
    });
    const data = (await response.json().catch((): null => null)) as { success?: boolean; imageDataUrl?: string } | null;
    if (data?.success && typeof data.imageDataUrl === "string" && data.imageDataUrl.startsWith("data:image/")) {
      return { imageDataUrl: data.imageDataUrl, source: "api" };
    }
  } catch {
    // Offline and missing keys use the cartoon portrait.
  }
  if (input.imageDataUrl) {
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const picture = new Image();
        picture.onload = () => resolve(picture);
        picture.onerror = () => reject(new Error("photo"));
        picture.src = input.imageDataUrl;
      });
      const imageDataUrl = await stylizeCelestialPortrait(image, { fit: fitForStyle(input.style), accent: ELEMENT_AURA[elementForSign(input.sun)] });
      return { imageDataUrl, source: "canvas" };
    } catch {
      // Fall through to the drawn character.
    }
  }
  return {
    imageDataUrl: celestialPortraitSvg(input.name || "You", input.sun || "Aries"),
    source: "canvas",
  };
}

export function quantizeChannel(value: number, bands = 5): number {
  const steps = Math.max(2, bands);
  const scaled = Math.max(0, Math.min(255, value)) / 255;
  const quantized = Math.round(scaled * (steps - 1)) / (steps - 1);
  return Math.round(quantized * 255);
}

export function sobelMagnitude(
  luma: ArrayLike<number>,
  width: number,
  x: number,
  y: number,
): number {
  const at = (px: number, py: number) => luma[py * width + px] ?? 0;
  const gx =
    -at(x - 1, y - 1) +
    at(x + 1, y - 1) +
    -2 * at(x - 1, y) +
    2 * at(x + 1, y) +
    -at(x - 1, y + 1) +
    at(x + 1, y + 1);
  const gy =
    -at(x - 1, y - 1) -
    2 * at(x, y - 1) -
    at(x + 1, y - 1) +
    at(x - 1, y + 1) +
    2 * at(x, y + 1) +
    at(x + 1, y + 1);
  return Math.hypot(gx, gy);
}

export type Raster = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

function clampByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Cel-shade a portrait raster: smooth, quantize, then ink the Sobel contours. */
export function cartoonizeRaster(source: Raster): Raster {
  const { width, height } = source;
  const src = source.data;
  const blurred = new Uint8ClampedArray(src.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const xx = Math.min(width - 1, Math.max(0, x + dx));
          const yy = Math.min(height - 1, Math.max(0, y + dy));
          const index = (yy * width + xx) * 4;
          red += src[index] ?? 0;
          green += src[index + 1] ?? 0;
          blue += src[index + 2] ?? 0;
          count += 1;
        }
      }
      const offset = (y * width + x) * 4;
      blurred[offset] = red / count;
      blurred[offset + 1] = green / count;
      blurred[offset + 2] = blue / count;
      blurred[offset + 3] = src[offset + 3] ?? 255;
    }
  }

  const quant = new Uint8ClampedArray(blurred.length);
  const luma = new Float32Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;
    const red = quantizeChannel(blurred[offset] ?? 0, 5);
    const green = quantizeChannel(blurred[offset + 1] ?? 0, 5);
    const blue = quantizeChannel(blurred[offset + 2] ?? 0, 5);
    const average = (red + green + blue) / 3;
    const boost = 1.28;
    quant[offset] = clampByte(average + (red - average) * boost);
    quant[offset + 1] = clampByte(average + (green - average) * boost);
    quant[offset + 2] = clampByte(average + (blue - average) * boost);
    quant[offset + 3] = blurred[offset + 3] ?? 255;
    luma[i] =
      0.2126 * (quant[offset] ?? 0) +
      0.7152 * (quant[offset + 1] ?? 0) +
      0.0722 * (quant[offset + 2] ?? 0);
  }

  const out = new Uint8ClampedArray(quant);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const magnitude = sobelMagnitude(luma, width, x, y);
      if (magnitude < 46) continue;
      const ink = magnitude > 92 ? 0.82 : 0.42;
      const offset = (y * width + x) * 4;
      out[offset] = clampByte((quant[offset] ?? 0) * (1 - ink));
      out[offset + 1] = clampByte((quant[offset + 1] ?? 0) * (1 - ink));
      out[offset + 2] = clampByte((quant[offset + 2] ?? 0) * (1 - ink));
    }
  }
  return { width, height, data: out };
}

/** Rim light, zodiac halo, and the XI · XVI compass seal, painted into pixels. */
export function stampBrandFrame(source: Raster, accent = "#C7A6FF"): Raster {
  const { width, height, data } = source;
  const out = new Uint8ClampedArray(data);
  const accentRgb = hexRgb(accent);
  const gold = hexRgb("#F5B971");
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const radius = Math.min(cx, cy);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      const offset = (y * width + x) * 4;
      if (dist > radius) {
        out[offset] = 13;
        out[offset + 1] = 16;
        out[offset + 2] = 23;
        out[offset + 3] = 255;
        continue;
      }
      const rim = radius - dist;
      if (rim < Math.max(2, radius * 0.035)) {
        out[offset] = accentRgb[0];
        out[offset + 1] = accentRgb[1];
        out[offset + 2] = accentRgb[2];
      } else if (rim < radius * 0.08) {
        out[offset] = clampByte(
          (out[offset] ?? 0) * 0.82 + accentRgb[0] * 0.18,
        );
        out[offset + 1] = clampByte(
          (out[offset + 1] ?? 0) * 0.82 + accentRgb[1] * 0.18,
        );
        out[offset + 2] = clampByte(
          (out[offset + 2] ?? 0) * 0.82 + accentRgb[2] * 0.18,
        );
      }
    }
  }
  const seal = { x: Math.round(cx), y: Math.round(cy + radius * 0.62) };
  for (let arm = 0; arm < 8; arm += 1) {
    const angle = (Math.PI / 4) * arm;
    for (let step = 0; step < 5; step += 1) {
      const x = seal.x + Math.round(Math.cos(angle) * step);
      const y = seal.y + Math.round(Math.sin(angle) * step);
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const offset = (y * width + x) * 4;
      out[offset] = gold[0];
      out[offset + 1] = gold[1];
      out[offset + 2] = gold[2];
    }
  }
  return { width, height, data: out };
}

export function cartoonizePortrait(source: Raster, accent?: string): Raster {
  return stampBrandFrame(cartoonizeRaster(source), accent);
}

function hexRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "");
  const value =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map(char => char + char)
          .join("")
      : cleaned;
  const parsed = Number.parseInt(value.slice(0, 6), 16);
  if (!Number.isFinite(parsed)) return [199, 166, 255];
  return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
}

type CanvasHost = {
  document?: {
    createElement: (tag: string) => {
      width: number;
      height: number;
      getContext: (kind: string) => {
        drawImage: (...args: unknown[]) => void;
        getImageData: (x: number, y: number, w: number, h: number) => Raster;
        putImageData: (data: Raster, x: number, y: number) => void;
      } | null;
      toDataURL: (type?: string) => string;
    };
  };
  Image?: new () => {
    onload: (() => void) | null;
    onerror: (() => void) | null;
    src: string;
  };
  URL?: {
    createObjectURL: (blob: object) => string;
    revokeObjectURL: (url: string) => void;
  };
  Blob?: new (parts: string[], options: { type: string }) => object;
};

/**
 * Photo cartoonizer. Smooths noise, paints cel bands, inks contours,
 * then composites the XI · XVI medallion. Returns a PNG data URL.
 */
export async function stylizeCelestialPortrait(
  source: unknown,
  options: AvatarStyleOptions = {},
): Promise<string> {
  const host = globalThis as unknown as CanvasHost;
  const doc = host.document;
  if (!doc) throw new Error("Canvas unavailable");
  const size = 512;
  const canvas = doc.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(source, 0, 0, size, size);
  const painted = cartoonizePortrait(
    context.getImageData(0, 0, size, size),
    options.accent,
  );
  context.putImageData(painted, 0, 0);
  const accent = options.accent ?? "#C7A6FF";
  const frame = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="256" cy="256" r="248" fill="none" stroke="${accent}" stroke-width="10"/>
    <text x="256" y="470" text-anchor="middle" font-size="28" fill="${accent}" font-family="sans-serif">XI · XVI</text>
  </svg>`;
  if (host.Blob && host.URL && host.Image) {
    const blob = new host.Blob([frame], { type: "image/svg+xml" });
    const url = host.URL.createObjectURL(blob);
    await new Promise<void>((resolve, reject) => {
      const ImageCtor = host.Image;
      if (!ImageCtor) {
        reject(new Error("Image unavailable"));
        return;
      }
      const image = new ImageCtor();
      image.onload = () => {
        context.drawImage(image, 0, 0, size, size);
        host.URL?.revokeObjectURL(url);
        resolve();
      };
      image.onerror = () => {
        host.URL?.revokeObjectURL(url);
        reject(new Error("Brand frame failed"));
      };
      image.src = url;
    });
  }
  return canvas.toDataURL("image/png");
}
