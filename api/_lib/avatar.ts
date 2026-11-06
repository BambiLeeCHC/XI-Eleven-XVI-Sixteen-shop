/**
 * Server cartoon avatar. Gemini, OpenAI, and xAI all receive the same
 * XI · XVI cel-shaded brief. With no key, the bespoke SVG character is
 * returned so the studio still has a portrait.
 */
import {
  type AvatarFit,
  type AvatarStyleOptions,
  celestialPortraitSvg,
  outfitForFit,
} from "../../src/lib/celestialAvatar.js";

export const AVATAR_FITS = [
  "obsidian-hoodie",
  "sage-mockneck",
  "astral-varsity",
] as const;

const FIT_COPY: Record<AvatarFit, string> = {
  "obsidian-hoodie":
    "a heavyweight obsidian hooded sweatshirt with drawstrings and an embroidered XI · XVI crest plus a True North compass emblem on the chest",
  "sage-mockneck":
    "a structured pistachio-sage mock-neck jacket in #D8F0C4 with an embroidered XI · XVI crest and True North compass emblem",
  "astral-varsity":
    "a midnight-lilac varsity jacket with a striped collar, an embroidered XI · XVI crest, and a True North compass emblem",
};

export function normalizeFit(value: unknown): AvatarFit {
  if (
    value === "sage-mockneck" ||
    value === "astral-varsity" ||
    value === "obsidian-hoodie"
  ) {
    return value;
  }
  return "obsidian-hoodie";
}

export function cartoonAvatarPrompt(fit: AvatarFit, likeness?: string): string {
  const garment = FIT_COPY[fit];
  const likenessLine = likeness
    ? `Keep a faithful likeness: ${likeness}`
    : "Keep a faithful likeness to the uploaded face: face shape, skin tone, hairstyle, facial hair, and glasses.";
  return [
    "Transform this portrait into a stylized 2D cel-shaded cartoon character avatar.",
    "Bold clean ink linework, layered cel shading, expressive animated comic proportions.",
    likenessLine,
    `The character wears XI · XVI (Eleven Sixteen) luxury streetwear: ${garment}.`,
    "Set the figure inside a dark celestial astral medallion.",
    "Palette: #0D1017 obsidian sky, #D8F0C4 sage, #C7A6FF iris, #F5B971 solar gold.",
    "No photorealism, no text other than the XI · XVI monogram, no extra people.",
  ].join(" ");
}

export function likenessDescriptorPrompt(): string {
  return "Describe only the visible likeness for a cartoon avatar: face shape, skin tone, hairstyle, facial hair, and glasses. Do not guess a name. 60 words.";
}

export function avatarProviderPlan(fit: AvatarFit, likeness?: string) {
  return {
    prompt: cartoonAvatarPrompt(fit, likeness),
    likenessPrompt: likenessDescriptorPrompt(),
    providers: [
      { name: "gemini", model: "gemini-2.5-flash-image" },
      { name: "openai-vision", model: "gpt-4o-mini" },
      { name: "openai-image", model: "gpt-image-1" },
      { name: "openai-image-fallback", model: "dall-e-3" },
      { name: "xai", model: "grok-2-image" },
    ],
  };
}

export type AvatarRequestBody = {
  image?: string;
  fit?: string;
  style?: AvatarStyleOptions;
  seed?: string;
};

type AvatarOk = { ok: true; image: string; provider: string; fit: AvatarFit };
type AvatarErr = { ok: false; error: string };

function svgResult(
  seed: string,
  fit: AvatarFit,
  style?: AvatarStyleOptions,
): AvatarOk {
  const svg = celestialPortraitSvg(seed || "xixvi", {
    ...style,
    fit,
    outfit: style?.outfit ?? outfitForFit(fit),
  });
  return {
    ok: true,
    image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    provider: "svg",
    fit,
  };
}

function splitDataUrl(value: string): { mime: string; base64: string } | null {
  const match =
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=\s]+)$/.exec(value);
  if (!match) return null;
  const mime = match[1];
  const base64 = match[2];
  if (!mime || !base64) return null;
  return { mime, base64: base64.replace(/\s/g, "") };
}

async function readImagePayload(response: Response): Promise<string | null> {
  const payload = (await response.json().catch((): null => null)) as {
    data?: Array<{ b64_json?: string; url?: string }>;
    candidates?: Array<{
      content?: {
        parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>;
      };
    }>;
  } | null;
  if (!payload) return null;
  const openai = payload.data?.[0];
  if (openai?.b64_json) return `data:image/png;base64,${openai.b64_json}`;
  if (openai?.url) return openai.url;
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData;
    if (inline?.data) {
      return `data:${inline.mimeType || "image/png"};base64,${inline.data}`;
    }
  }
  return null;
}

async function geminiCartoon(
  image: string,
  prompt: string,
): Promise<string | null> {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  const parsed = splitDataUrl(image);
  if (!key || !parsed) return null;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: parsed.mime, data: parsed.base64 } },
            ],
          },
        ],
      }),
    },
  );
  if (!response.ok) return null;
  return readImagePayload(response);
}

async function openAiLikeness(image: string): Promise<string | null> {
  const key = (process.env.OPENAI_API_KEY || "").trim();
  if (!key || !splitDataUrl(image)) return null;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: likenessDescriptorPrompt() },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
    }),
  });
  if (!response.ok) return null;
  const payload = (await response.json().catch((): null => null)) as {
    choices?: Array<{ message?: { content?: string } }>;
  } | null;
  const text = payload?.choices?.[0]?.message?.content;
  return text?.trim() || null;
}

async function openAiImage(
  prompt: string,
  model: "gpt-image-1" | "dall-e-3",
): Promise<string | null> {
  const key = (process.env.OPENAI_API_KEY || "").trim();
  if (!key) return null;
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, prompt, size: "1024x1024" }),
  });
  if (!response.ok) return null;
  return readImagePayload(response);
}

async function xaiImage(prompt: string): Promise<string | null> {
  const key = (process.env.XAI_API_KEY || "").trim();
  if (!key) return null;
  const response = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model: "grok-2-image", prompt }),
  });
  if (!response.ok) return null;
  return readImagePayload(response);
}

export async function generateCartoonAvatar(
  input: AvatarRequestBody,
): Promise<AvatarOk | AvatarErr> {
  const fit = normalizeFit(input.fit ?? input.style?.fit);
  const seed = input.seed || "xixvi";
  const uploaded = typeof input.image === "string" ? input.image : "";
  if (uploaded.length > 2_500_000) {
    return {
      ok: false,
      error: "That photo is too large. Try a smaller portrait.",
    };
  }
  if (!uploaded) return svgResult(seed, fit, input.style);

  try {
    const gemini = await geminiCartoon(uploaded, cartoonAvatarPrompt(fit));
    if (gemini) return { ok: true, image: gemini, provider: "gemini", fit };

    const likeness = await openAiLikeness(uploaded);
    const prompt = cartoonAvatarPrompt(fit, likeness ?? undefined);
    const gpt = await openAiImage(prompt, "gpt-image-1");
    if (gpt) return { ok: true, image: gpt, provider: "openai", fit };
    const dalle = await openAiImage(prompt, "dall-e-3");
    if (dalle) return { ok: true, image: dalle, provider: "openai", fit };

    const grok = await xaiImage(prompt);
    if (grok) return { ok: true, image: grok, provider: "xai", fit };
  } catch {
    return svgResult(seed, fit, input.style);
  }

  return svgResult(seed, fit, input.style);
}
