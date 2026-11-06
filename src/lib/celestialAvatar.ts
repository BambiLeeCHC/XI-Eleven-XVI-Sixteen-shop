/**
 * Client-side True North portrait tools.
 * The canvas stylizer always produces an avatar when image APIs are absent.
 */

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

const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const ELEMENT: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

export const ELEMENT_AURA: Record<"fire" | "earth" | "air" | "water", string> = {
  fire: "#f0a070",
  earth: "#d8f0c4",
  air: "#e4d4f4",
  water: "#9fd0ea",
};

export function elementForSign(sign: string | undefined): "fire" | "earth" | "air" | "water" {
  return ELEMENT[sign ?? ""] ?? "air";
}

export function styleLabel(style: string | undefined): string {
  return AVATAR_STYLES.find(item => item.id === style)?.label ?? AVATAR_STYLES[0].label;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Deterministic celestial portrait for starter friends and anyone without a photo. */
export function celestialPortraitSvg(name: string, sign = "Aries"): string {
  const seed = hashString(`${name}|${sign}`);
  const element = elementForSign(sign);
  const aura = ELEMENT_AURA[element];
  const glyph = SIGN_GLYPH[sign] ?? "✦";
  const tilt = (seed % 18) - 9;
  const cheek = 28 + (seed % 10);
  const hair = ["#1c140c", "#3a2416", "#6a4324", "#d8c2a0", "#111318", "#8d4a32"][seed % 6];
  const skin = ["#f3d2b5", "#e0b08a", "#c4845a", "#8d5a3c", "#f6e0cc", "#a56b45"][(seed >>> 3) % 6];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="aura" cx="50%" cy="42%" r="68%">
      <stop offset="0%" stop-color="${aura}" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="#1a1430"/>
      <stop offset="100%" stop-color="#07080d"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#aura)"/>
  <circle cx="256" cy="256" r="214" fill="none" stroke="#e8c67a" stroke-opacity="0.85" stroke-width="3"/>
  <circle cx="256" cy="256" r="188" fill="none" stroke="#e4d4f4" stroke-opacity="0.55" stroke-width="1.5"/>
  <g fill="#f6e7b0" opacity="0.85">
    <circle cx="92" cy="120" r="2.2"/><circle cx="410" cy="96" r="1.6"/><circle cx="430" cy="360" r="2"/>
    <circle cx="70" cy="340" r="1.4"/><circle cx="256" cy="48" r="1.8"/>
  </g>
  <g transform="translate(256 268) rotate(${tilt})">
    <ellipse cx="0" cy="28" rx="108" ry="126" fill="${skin}"/>
    <path d="M-108 10 C-120 -70 -70 -150 0 -156 C70 -150 120 -70 108 10 C78 -20 40 -36 0 -36 C-40 -36 -78 -20 -108 10 Z" fill="${hair}"/>
    <ellipse cx="-36" cy="8" rx="10" ry="6" fill="#1a120c"/>
    <ellipse cx="36" cy="8" rx="10" ry="6" fill="#1a120c"/>
    <path d="M-12 36 Q0 48 12 36" fill="none" stroke="#6a3b32" stroke-width="3" stroke-linecap="round"/>
    <circle cx="-${cheek}" cy="28" r="8" fill="#e4d4f4" opacity="0.35"/>
    <circle cx="${cheek}" cy="28" r="8" fill="${aura}" opacity="0.4"/>
  </g>
  <text x="256" y="468" text-anchor="middle" font-size="42" fill="#f6e7b0" font-family="Georgia, serif">${glyph}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function resizeImageFile(file: Blob, size = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that photo."));
    reader.onload = () => {
      const source = String(reader.result || "");
      const image = new Image();
      image.onload = () => {
        try {
          resolve(drawCoverSquare(image, size, "image/jpeg", 0.86));
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Couldn't crop that photo."));
        }
      };
      image.onerror = () => reject(new Error("Couldn't open that photo."));
      image.src = source;
    };
    reader.readAsDataURL(file);
  });
}

function drawCoverSquare(image: CanvasImageSource & { width: number; height: number }, size: number, type: string, quality: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");
  const scale = Math.max(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  ctx.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
  return canvas.toDataURL(type, quality);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Couldn't draw that portrait."));
    image.src = src;
  });
}

/**
 * Editorial celestial grade: contrast, sun-element aura, gold astrolabe,
 * starlight, and a zodiac crest. Returns a webp data URL when the browser can.
 */
export async function stylizeCelestialPortrait(input: AvatarRequest, size = 512): Promise<string> {
  if (typeof document === "undefined") {
    throw new Error("The celestial stylizer needs a browser canvas.");
  }
  const image = await loadImage(input.imageDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");

  const scale = Math.max(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  ctx.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);

  const style = input.style === "engraving" || input.style === "glass" ? input.style : "astral";
  const frame = ctx.getImageData(0, 0, size, size);
  const px = frame.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i] ?? 0;
    const g = px[i + 1] ?? 0;
    const b = px[i + 2] ?? 0;
    const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const contrast = style === "engraving" ? 1.35 : style === "glass" ? 1.05 : 1.18;
    const lifted = (luma - 0.5) * contrast + 0.5;
    const shadow = 1 - Math.min(1, Math.max(0, lifted));
    const highlight = Math.min(1, Math.max(0, lifted));
    const mix = style === "engraving" ? 0.55 : 1;
    px[i] = clampByte(r * (0.78 + 0.4 * highlight) * mix + shadow * 22 + highlight * 28);
    px[i + 1] = clampByte(g * (0.74 + 0.32 * highlight) * mix + shadow * 16 + highlight * 18);
    px[i + 2] = clampByte(b * (0.92 + 0.28 * highlight) + shadow * (style === "glass" ? 28 : 54));
  }
  ctx.putImageData(frame, 0, 0);

  const aura = ELEMENT_AURA[elementForSign(input.sun)];
  const glow = ctx.createRadialGradient(size * 0.5, size * 0.42, size * 0.18, size * 0.5, size * 0.5, size * 0.72);
  glow.addColorStop(0, "rgba(0,0,0,0)");
  glow.addColorStop(0.62, style === "glass" ? "rgba(228,212,244,0.16)" : "rgba(8,10,20,0.18)");
  glow.addColorStop(1, "rgba(5,6,12,0.55)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  const halo = ctx.createRadialGradient(size * 0.5, size * 0.38, size * 0.08, size * 0.5, size * 0.4, size * 0.48);
  halo.addColorStop(0, `${aura}55`);
  halo.addColorStop(0.45, "#e4d4f433");
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "source-over";

  ctx.strokeStyle = "rgba(232, 198, 122, 0.92)";
  ctx.lineWidth = style === "engraving" ? 3 : 2;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(228, 212, 244, 0.7)";
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.strokeStyle = "rgba(246, 231, 176, 0.8)";
  ctx.lineWidth = 1;
  for (let tick = 0; tick < 12; tick += 1) {
    ctx.rotate(Math.PI / 6);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.4);
    ctx.lineTo(0, -size * (tick % 3 === 0 ? 0.455 : 0.432));
    ctx.stroke();
  }
  ctx.restore();

  const seed = hashString(`${input.name ?? ""}|${input.sun ?? ""}|${input.altar ?? ""}`);
  ctx.fillStyle = "rgba(246, 231, 176, 0.85)";
  for (let star = 0; star < 28; star += 1) {
    const n = hashString(`${seed}:${star}`);
    const x = n % size;
    const y = Math.floor(n / size) % size;
    const dist = Math.hypot(x - size / 2, y - size / 2);
    if (dist < size * 0.28 || dist > size * 0.48) continue;
    ctx.globalAlpha = 0.35 + (n % 50) / 100;
    ctx.beginPath();
    ctx.arc(x, y, (n % 3) + 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const glyph = SIGN_GLYPH[input.sun ?? ""] ?? "✦";
  ctx.fillStyle = "#f6e7b0";
  ctx.font = "600 42px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, size / 2, size * 0.9);
  ctx.font = "600 13px Georgia, serif";
  ctx.fillStyle = "rgba(216, 240, 196, 0.92)";
  ctx.fillText(styleLabel(style), size / 2, size * 0.075);

  const webp = canvas.toDataURL("image/webp", 0.86);
  if (webp.startsWith("data:image/webp")) return webp;
  return canvas.toDataURL("image/png");
}

export async function createTrueNorthAvatar(input: AvatarRequest): Promise<{ imageDataUrl: string; source: "api" | "canvas" }> {
  try {
    const response = await fetch("/api/chart?action=avatar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "avatar",
        imageDataUrl: input.imageDataUrl,
        name: input.name ?? "",
        sun: input.sun ?? "",
        moon: input.moon ?? "",
        rising: input.rising ?? "",
        altar: input.altar ?? "",
        style: input.style ?? "astral",
      }),
    });
    const data = await response.json().catch(() => null) as { success?: boolean; imageDataUrl?: string } | null;
    if (data?.success && typeof data.imageDataUrl === "string" && data.imageDataUrl.startsWith("data:image/")) {
      return { imageDataUrl: data.imageDataUrl, source: "api" };
    }
  } catch {
    /* Local dev and offline sessions use the canvas stylizer. */
  }
  const imageDataUrl = await stylizeCelestialPortrait(input);
  return { imageDataUrl, source: "canvas" };
}
