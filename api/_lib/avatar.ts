/**
 * True North AI Avatar.
 *
 * Tries Gemini image generation, then OpenAI (vision description + image),
 * then xAI. Any miss returns { success: false, fallback: true } so the
 * browser can paint a celestial canvas portrait instead of failing the upload.
 */

import { type ApiRequest, type ApiResponse } from "./server.js";

const MAX_DATA_URL = 1_800_000;
const STYLES = new Set(["astral", "engraving", "glass"]);

export type AvatarInput = {
  imageDataUrl: string;
  name: string;
  sun: string;
  moon: string;
  rising: string;
  altar: string;
  style: "astral" | "engraving" | "glass";
};

export function parseAvatarRequest(body: unknown): { ok: true; value: AvatarInput } | { ok: false; error: string } {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const imageDataUrl = typeof record.imageDataUrl === "string" ? record.imageDataUrl.trim() : "";
  if (!imageDataUrl.startsWith("data:image/")) {
    return { ok: false, error: "Upload a photo first." };
  }
  if (imageDataUrl.length > MAX_DATA_URL) {
    return { ok: false, error: "That photo is too large. Try a smaller image." };
  }
  const comma = imageDataUrl.indexOf(",");
  if (comma < 12 || imageDataUrl.length - comma < 32) {
    return { ok: false, error: "That photo could not be read." };
  }
  const clip = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
  const styleRaw = clip(record.style, 24);
  const style = STYLES.has(styleRaw) ? (styleRaw as AvatarInput["style"]) : "astral";
  return {
    ok: true,
    value: {
      imageDataUrl,
      name: clip(record.name, 80),
      sun: clip(record.sun, 40),
      moon: clip(record.moon, 40),
      rising: clip(record.rising, 40),
      altar: clip(record.altar, 80),
      style,
    },
  };
}

function splitDataUrl(dataUrl: string): { mime: string; data: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match?.[1] || !match[2]) return null;
  return { mime: match[1], data: match[2].replace(/\s/g, "") };
}

function styleName(style: AvatarInput["style"]): string {
  if (style === "engraving") return "Tarot Engraving";
  if (style === "glass") return "Celestial Glass";
  return "Astral Ethereal";
}

function portraitPrompt(input: AvatarInput): string {
  const who = input.name || "the person";
  const garment = input.style === "glass"
    ? "a structured pistachio-sage mock-neck in #D8F0C4"
    : input.style === "astral"
      ? "a midnight-lilac astral varsity jacket"
      : "a heavyweight obsidian hooded sweatshirt";
  return [
    `Transform ${who} into a stylized 2D cel-shaded cartoon character avatar.`,
    "Bold clean ink linework, expressive comic proportions, faithful likeness: face shape, skin tone, hairstyle, facial hair, and glasses.",
    `They wear XI · XVI (Eleven Sixteen) luxury streetwear: ${garment}, with an embroidered XI · XVI crest and True North compass emblem.`,
    "Set the figure inside a dark celestial astral medallion.",
    "Palette: #0D1017 obsidian sky, #D8F0C4 sage, #C7A6FF iris, #F5B971 solar gold.",
    `Sun ${input.sun || "unknown"}, Moon ${input.moon || "unknown"}, Rising ${input.rising || "unknown"}, altar ${input.altar || "The Star"}.`,
    `House look: ${styleName(input.style)}. No photorealism, no extra people.`,
  ].join(" ");
}

async function readJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function geminiPortrait(input: AvatarInput, signal: AbortSignal): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  const image = splitDataUrl(input.imageDataUrl);
  if (!key || !image) return null;
  const models = ["gemini-2.5-flash-image", "gemini-2.0-flash-exp-image-generation"];
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          signal,
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": key,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: portraitPrompt(input) },
                  { inlineData: { mimeType: image.mime, data: image.data } },
                ],
              },
            ],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        },
      );
      if (!response.ok) continue;
      const json = await readJson(response);
      const parts = json?.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        const inline = part?.inlineData || part?.inline_data;
        const b64 = inline?.data;
        if (typeof b64 === "string" && b64.length > 80) {
          const mime = inline.mimeType || inline.mime_type || "image/png";
          return `data:${mime};base64,${b64.replace(/\s/g, "")}`;
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function openAiPortrait(input: AvatarInput, signal: AbortSignal): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  let likeness = "Keep the person's features, hair, expression, and skin tone faithful and respectful.";
  try {
    const vision = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this portrait faithfully and respectfully for an artist: face shape, hair, expression, skin tone, and age range. Two sentences. No identity guesses beyond what is visible.",
              },
              { type: "image_url", image_url: { url: input.imageDataUrl } },
            ],
          },
        ],
        max_tokens: 180,
      }),
    });
    if (vision.ok) {
      const json = await readJson(vision);
      const text = json?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) likeness = text.trim().slice(0, 600);
    }
  } catch {
    /* Continue with the astrological prompt alone. */
  }

  const prompt = `${portraitPrompt(input)} Likeness: ${likeness}`;
  for (const model of ["gpt-image-1", "dall-e-3"]) {
    try {
      const body: Record<string, unknown> = {
        model,
        prompt,
        n: 1,
        size: "1024x1024",
      };
      if (model === "dall-e-3") body.response_format = "b64_json";
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        signal,
        headers: {
          Authorization: `Bearer ${key}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) continue;
      const json = await readJson(response);
      const b64 = json?.data?.[0]?.b64_json;
      if (typeof b64 === "string" && b64.length > 80) {
        return `data:image/png;base64,${b64.replace(/\s/g, "")}`;
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function xaiPortrait(input: AvatarInput, signal: AbortSignal): Promise<string | null> {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;
  try {
    const response = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-2-image",
        prompt: portraitPrompt(input),
        response_format: "b64_json",
        n: 1,
      }),
    });
    if (!response.ok) return null;
    const json = await readJson(response);
    const b64 = json?.data?.[0]?.b64_json;
    if (typeof b64 === "string" && b64.length > 80) {
      return `data:image/png;base64,${b64.replace(/\s/g, "")}`;
    }
  } catch {
    return null;
  }
  return null;
}

export async function handleAvatar(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  const parsed = parseAvatarRequest(req.body);
  if (!parsed.ok) {
    const message = (parsed as { ok: false; error: string }).error;
    return res.status(400).json({ success: false, error: message });
  }
  const input = (parsed as { ok: true; value: AvatarInput }).value;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    const image =
      (await geminiPortrait(input, ctrl.signal)) ||
      (await openAiPortrait(input, ctrl.signal)) ||
      (await xaiPortrait(input, ctrl.signal));
    if (image) return res.status(200).json({ success: true, imageDataUrl: image });
  } catch (error) {
    console.error("True North avatar upstream failed");
  } finally {
    clearTimeout(timer);
  }
  return res.status(200).json({ success: false, fallback: true });
}
