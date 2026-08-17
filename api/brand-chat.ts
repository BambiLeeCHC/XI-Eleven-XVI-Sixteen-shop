/**
 * XI · XVI Style Concierge.
 *
 * Calls Groq using GROQ_API_KEY. If the key is not present the widget
 * answers with a graceful hand-off instead of erroring — a broken
 * concierge should never look like a broken shop.
 */

import {
  type ApiRequest,
  type ApiResponse,
  fail,
  HttpError,
} from "./_lib/server.js";
import { generateWithGroqChat } from "./_lib/groq.js";

const BRAND_SYSTEM_PROMPT = `You are the XI · XVI Style Concierge — the personal shopping assistant for XI Eleven XVI Sixteen (xixvi.shop), a premium streetwear and luxury fashion brand. You speak with warmth, confidence, and sophistication. You're knowledgeable, stylish, and genuinely excited to help customers find their perfect pieces.

BRAND IDENTITY:
XI Eleven XVI Sixteen (stylized XI · XVI) is a luxury streetwear brand blending premium materials with bold design. The brand name reads "Eleven Sixteen." The signature motif is the gold XI XVI shield crest and "ELEVEN SIXTEEN" monogram. Contact: support@xixvi.shop

PRODUCT LINES:
- D-Slip Dress — 100% polyester chiffon slip dress, built-in bra, side slit
- B-Lift Sports Bra — removable cups, moisture-wicking
- L-Flow Yoga Leggings — high waist, four-way stretch
- J-Glitch Jersey — performance jersey
- S-Glitch Shorts — 2.5" and 6.3" inseams
- T-Icon Tees — oversized and tie-dye

Everything is made to order: production takes 2–5 business days before shipping. Standard shipping is free.

Keep replies conversational and concise (2-4 sentences unless the customer asks for detail).`;

const FALLBACK =
  "I'm having trouble reaching the concierge right now — but I'd still love to help. Email support@xixvi.shop and a human will come straight back to you, usually the same day.";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history } = (req.body ?? {}) as {
      message?: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };
    if (!message) throw new HttpError(400, "A message is required");

    const chatHistory = (history ?? []).slice(-8).map((turn) => ({
      role: turn.role,
      content: turn.content,
    }));
    chatHistory.push({ role: "user", content: message });

    const result = await generateWithGroqChat(BRAND_SYSTEM_PROMPT, chatHistory, 800);
    if (!result.success) {
      console.error("Concierge Groq call failed", result.reason);
      return res.status(200).json({ success: true, response: FALLBACK });
    }
    return res.status(200).json({ success: true, response: result.text });
  } catch (error) {
    return fail(res, error);
  }
}
