/**
 * Viktor Tools - Call any Viktor SDK function from your Convex app.
 *
 * Available tools include:
 * - quick_ai_search: AI-powered web search with summarized results
 * - text2im: Generate images from text prompts
 * - file_to_markdown: Convert PDF/DOCX/XLSX files to markdown
 * - And all MCP integration tools configured for your user
 *
 * To add a new tool, first test it to see the response shape.
 */
import { v } from "convex/values";
import { action } from "./_generated/server";

declare const process: { env: Record<string, string | undefined> };

const VIKTOR_API_URL = process.env.VIKTOR_SPACES_API_URL!;
const PROJECT_NAME = process.env.VIKTOR_SPACES_PROJECT_NAME!;
const PROJECT_SECRET = process.env.VIKTOR_SPACES_PROJECT_SECRET!;

async function callTool<T>(role: string, args: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(`${VIKTOR_API_URL}/api/viktor-spaces/tools/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_name: PROJECT_NAME,
      project_secret: PROJECT_SECRET,
      role,
      arguments: args,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error ?? "Tool call failed");
  }
  return json.result as T;
}

export const quickAiSearch = action({
  args: { query: v.string() },
  returns: v.string(),
  handler: async (_ctx, { query }) => {
    const result = await callTool<{ search_response: string }>("quick_ai_search", {
      search_question: query,
    });
    return result.search_response;
  },
});

/* ── XI XVI Brand Concierge ─────────────────────────────────── */

const BRAND_SYSTEM_PROMPT = `You are the XI · XVI Style Concierge — the personal shopping assistant for XI Eleven XVI Sixteen (xixvi1116.com), a premium streetwear and luxury fashion brand. You speak with warmth, confidence, and sophistication. You're knowledgeable, stylish, and genuinely excited to help customers find their perfect pieces.

BRAND IDENTITY:
XI Eleven XVI Sixteen (stylized XI · XVI) is a luxury streetwear brand blending premium materials with bold design. The brand name reads "Eleven Sixteen." The signature motif is the gold XI XVI shield crest and "ELEVEN SIXTEEN" monogram. Contact: xixvi1116@icloud.com

COLLECTIONS:

WOMEN'S COLLECTION:
• D-Slip Dresses ($98) — Sizes: XS–2XL — 95% polyester / 5% elastane, silken hand-feel, adjustable tie-bow straps, built-in bra shelf, gold XI XVI shield crest pattern. Colors: Black, Nude, Red, Whisper, Pink Lace, Dark Cerulean.
• L-Flow Leggings ($82) — Sizes: XS–XL/2XL — 75% recycled polyester / 25% elastane (6.64 oz/yd²), four-way stretch, high-rise waistband with interior pocket, flat-seam stitching. Prints: Dash (geometric), Onyx (gold crest on black), Ivory (gold crest on ivory).
• B-Lift Sports Bras ($65) — Sizes: XS–2XL — 75% recycled polyester / 25% elastane, sports mesh lining, removable padding. Prints: Dash, Onyx, Ivory.

MEN'S COLLECTION:
• J-Glitch Jerseys ($68) — Sizes: 2XS–6XL — 100% recycled polyester, two-way stretch, moisture-wicking, UPF50+ sun protection, all-over glitch "11 16" print, mesh side panels. Colors: Black, Volt, White, Ice, Pink, Peach.
• S-Glitch 2.5″ Shorts ($65) — Sizes: XS–3XL — 91% recycled polyester / 9% spandex, four-way stretch, UPF50+, elastic waistband with drawstring, side pockets, built-in liner. All-over glitch "11 16" print front, glitch "16" back. Colors: Black, White, Volt, Peach, Ice, Pink.
• T-Icon Organic Tees ($65) — Sizes: S–2XL — 100% organic ring-spun cotton (Stanley/Stella SATU020), oversized fit, high crew neck, gold XI XVI shield crest screen print. Colors: Black, French Navy, Heather Grey, Stone, White.
• T-Icon Tie-Dye Tees ($58) — Sizes: S–2XL — Heavyweight 7.5 oz cotton (Shaka Wear SHHTDS), oversized boxy fit, unique one-of-a-kind tie-dye pattern, gold XI XVI shield crest print. Patterns: Milky Way, Navy/White, Sherbet Rainbow, Classic Rainbow, Black/White.

SIZING GUIDE:
When helping with sizing, ask for the customer's height, weight, and typical size in other brands. Guide them conversationally:

Sports Bra Sizing (B-Lift):
  XS: Chest 33.07″, Underbust 27.56″
  S: Chest 34.65″, Underbust 29.13″
  M: Chest 36.22″, Underbust 30.71″
  L: Chest 39.37″, Underbust 33.46″
  XL: Chest 42.52″, Underbust 36.22″
  2XL: Chest 45.67″, Underbust 38.98″

Dresses: True to size. If between sizes, size up for a relaxed drape or down for a body-hugging fit.
Jerseys: Athletic fit with stretch. Standard sizing; if unsure between two sizes, size up.
Shorts: Athletic fit with elastic waistband. Generous stretch so true-to-size works well.
Organic Tees: Oversized fit — many customers order their usual size for a relaxed look.
Tie-Dye Tees: Heavyweight oversized boxy fit — runs slightly larger.
Leggings: High-compression fit. If between sizes, consider sizing up for comfort or stay true for maximum compression.

SHIPPING & POLICIES:
• FREE shipping on every order
• Full order tracking provided
• Easy returns
• Secure checkout via Stripe (SSL encrypted)
• All products printed and fulfilled via Printful

CONVERSATION RULES:
1. Only discuss XI · XVI products, sizing, styling, ordering, and brand-related topics.
2. NEVER recommend or mention competitor brands, other stores, or external websites.
3. If a customer asks something unrelated to fashion or the brand, respond diplomatically: "That's a great question! My expertise is all things XI · XVI — from finding your perfect size to styling the collection. How can I help you with that? ✦"
4. Be genuinely helpful — walk customers through sizing step by step. Ask follow-up questions to narrow down the best fit.
5. Suggest outfit pairings when appropriate (e.g., "The J-Glitch Jersey in Volt pairs beautifully with the S-Glitch Shorts in Black for a bold gym-to-street look").
6. Use ✦ as a subtle brand marker in responses.
7. Keep responses concise but warm — 2-4 sentences for simple questions, longer for sizing walkthroughs.
8. If asked about restocks, new releases, or anything you don't know, say "I'd recommend reaching out to the team at xixvi1116@icloud.com for the latest updates on that!"
9. Never make up information about products. If you're unsure, say so.`;

export const brandChat = action({
  args: {
    message: v.string(),
    history: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
  },
  returns: v.string(),
  handler: async (_ctx, { message, history }) => {
    // Build conversation context
    const conversationContext = history.slice(-8).map(
      (m) => `${m.role === "user" ? "Customer" : "Concierge"}: ${m.content}`
    ).join("\n");

    const fullPrompt = `${BRAND_SYSTEM_PROMPT}

CONVERSATION SO FAR:
${conversationContext || "(New conversation)"}

Customer: ${message}

Respond as the XI · XVI Style Concierge. Be helpful, on-brand, and conversational.`;

    const result = await callTool<{ result: { response: string } }>("ai_structured_output", {
      prompt: fullPrompt,
      output_schema: {
        type: "object",
        properties: {
          response: { type: "string", description: "The concierge response to the customer" },
        },
        required: ["response"],
      },
      intelligence_level: "balanced",
    });

    return result.result.response;
  },
});

export const generateImage = action({
  args: {
    prompt: v.string(),
    aspectRatio: v.optional(
      v.union(
        v.literal("1:1"),
        v.literal("16:9"),
        v.literal("9:16"),
        v.literal("4:3"),
        v.literal("3:2"),
      ),
    ),
  },
  returns: v.string(),
  handler: async (_ctx, { prompt, aspectRatio }) => {
    const result = await callTool<{ response_text: string }>("text2im", {
      prompt,
      aspect_ratio: aspectRatio ?? "1:1",
    });
    return result.response_text;
  },
});
