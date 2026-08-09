/**
 * XI · XVI Style Concierge.
 *
 * Ported from the old backend, which reached the Viktor Spaces tool API using
 * credentials held in that deployment's environment. If those credentials are
 * not present the widget answers with a graceful hand-off instead of erroring —
 * a broken concierge should never look like a broken shop.
 */

import {
  type ApiRequest,
  type ApiResponse,
  fail,
  HttpError,
} from "./_lib/server.js";

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

Everything is made to order: production takes 2–5 business days before shipping. Standard shipping is free.`;

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

    const apiUrl = process.env.VIKTOR_SPACES_API_URL;
    const projectName = process.env.VIKTOR_SPACES_PROJECT_NAME;
    const projectSecret = process.env.VIKTOR_SPACES_PROJECT_SECRET;

    if (!apiUrl || !projectName || !projectSecret) {
      return res.status(200).json({ success: true, response: FALLBACK });
    }

    const conversation = (history ?? [])
      .slice(-8)
      .map(
        turn =>
          `${turn.role === "user" ? "Customer" : "Concierge"}: ${turn.content}`,
      )
      .join("\n");

    const prompt = `${BRAND_SYSTEM_PROMPT}

CONVERSATION SO FAR:
${conversation || "(New conversation)"}

Customer: ${message}

Respond as the XI · XVI Style Concierge. Be helpful, on-brand, and conversational.`;

    const response = await fetch(`${apiUrl}/api/viktor-spaces/tools/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_name: projectName,
        project_secret: projectSecret,
        role: "ai_structured_output",
        arguments: {
          prompt,
          output_schema: {
            type: "object",
            properties: {
              response: {
                type: "string",
                description: "The concierge response to the customer",
              },
            },
            required: ["response"],
          },
        },
      }),
    });

    if (!response.ok) {
      console.error("Concierge tool call failed", response.status);
      return res.status(200).json({ success: true, response: FALLBACK });
    }

    const json = await response.json();
    const answer = json?.result?.result?.response ?? json?.result?.response;
    return res.status(200).json({
      success: true,
      response: typeof answer === "string" ? answer : FALLBACK,
    });
  } catch (error) {
    return fail(res, error);
  }
}
