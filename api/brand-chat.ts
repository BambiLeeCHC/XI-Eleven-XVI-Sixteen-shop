/**
 * XI · XVI Style Concierge + admin AI helpers.
 *
 * Modes:
 *   (default)        customer Style Concierge chat
 *   landing_edit     admin landing-page section rewrite
 *   blog_generate    admin journal post + LinkedIn/IG package (+ optional auto-post)
 *
 * blog_generate lives here (not a separate route) so we stay under the
 * Vercel Hobby plan 12 serverless-function limit.
 */

import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  fail,
  HttpError,
  supabaseAdmin,
} from "./_lib/server.js";
import { generateWithGroq, generateWithGroqChat, type GroqFailure } from "./_lib/groq.js";

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

const BLOG_SYSTEM = `You are the editorial voice of XI · XVI (xixvi.shop). Write journal posts that feel intimate, precise, and elevated.

Return STRICT JSON only, no markdown fences:
{
  "title": string,
  "excerpt": string,
  "category": one of Manifesto|Sustainability|Ritual|Numerology|Style|Drops,
  "tags": string[],
  "contentHtml": string,
  "linkedinPost": string,
  "instagramCaption": string,
  "instagramAltText": string
}`;

const FALLBACK =
  "I'm having trouble reaching the concierge right now — but I'd still love to help. Email support@xixvi.shop and a human will come straight back to you, usually the same day.";

async function handleBlogGenerate(req: ApiRequest, res: ApiResponse) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Sign in required");

  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new HttpError(403, "Admin only");

  const { topic, angle, category, imageUrl } = (req.body ?? {}) as {
    topic?: string;
    angle?: string;
    category?: string;
    imageUrl?: string;
  };
  if (!topic?.trim()) throw new HttpError(400, "A topic is required");

  const userPrompt = `Topic: ${topic.trim()}\n${angle?.trim() ? `Angle: ${angle.trim()}\n` : ""}Preferred category: ${category || "Style"}\nWrite a complete journal entry and social package.`;

  const result = await generateWithGroq(BLOG_SYSTEM, userPrompt, 4000);
  if (!result.success) {
    const failure = result as GroqFailure;
    return res.status(200).json({
      success: false,
      error:
        failure.reason === "no_key"
          ? "GROQ_API_KEY missing on the server."
          : failure.detail || "Generation failed.",
    });
  }

  let parsed: any = null;
  try {
    const raw = result.text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
    parsed = JSON.parse(raw);
  } catch {
    return res.status(200).json({
      success: false,
      error: "Model returned non-JSON. Try again.",
    });
  }

  const packageOut = {
    title: String(parsed.title || topic),
    excerpt: String(parsed.excerpt || ""),
    category: String(parsed.category || category || "Style"),
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
    content: String(parsed.contentHtml || parsed.content || ""),
    linkedinPost: String(parsed.linkedinPost || ""),
    instagramCaption: String(parsed.instagramCaption || ""),
    instagramAltText: String(parsed.instagramAltText || ""),
  };

  const social: Record<string, any> = { linkedin: null, instagram: null };
  const liToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const liAuthor = process.env.LINKEDIN_AUTHOR_URN;
  if (liToken && liAuthor && packageOut.linkedinPost) {
    try {
      const liRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${liToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: liAuthor,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: packageOut.linkedinPost.replace(
                  "{{POST_URL}}",
                  "https://xixvi.shop/journal",
                ),
              },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        }),
      });
      social.linkedin = { ok: liRes.ok, status: liRes.status };
    } catch (e: any) {
      social.linkedin = { ok: false, error: e?.message };
    }
  }

  const igToken = process.env.META_PAGE_ACCESS_TOKEN;
  const igUser = process.env.META_IG_USER_ID;
  if (igToken && igUser && imageUrl && packageOut.instagramCaption) {
    try {
      const create = await fetch(`https://graph.facebook.com/v19.0/${igUser}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: packageOut.instagramCaption,
          access_token: igToken,
        }),
      });
      const created = await create.json();
      if (created?.id) {
        const pub = await fetch(`https://graph.facebook.com/v19.0/${igUser}/media_publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: created.id,
            access_token: igToken,
          }),
        });
        social.instagram = { ok: pub.ok, creationId: created.id };
      } else {
        social.instagram = { ok: false, body: created };
      }
    } catch (e: any) {
      social.instagram = { ok: false, error: e?.message };
    }
  }

  return res.status(200).json({
    success: true,
    draft: packageOut,
    social,
    note:
      !liToken && !igToken
        ? "Social credentials not configured — copy captions manually. Add LINKEDIN_ACCESS_TOKEN / META_* env vars to enable auto-post."
        : undefined,
  });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = (req.body ?? {}) as {
      message?: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
      mode?: string;
      section?: string;
      current?: Record<string, any>;
      instruction?: string;
      topic?: string;
      angle?: string;
      category?: string;
      imageUrl?: string;
    };

    // Admin: AI journal post + social package
    if (body.mode === "blog_generate") {
      return await handleBlogGenerate(req, res);
    }

    // Landing-page AI assist (admin site editor)
    if (body.mode === "landing_edit") {
      const instruction = body.instruction?.trim();
      if (!instruction) throw new HttpError(400, "instruction is required");
      const system = `You edit storefront landing-page section copy for XI · XVI (xixvi.shop).
Return STRICT JSON only: { "patch": { ...fields to overwrite on the section } }.
Only include fields that should change. Keep voice premium, concise, and on-brand.
Section key: ${body.section || "unknown"}
Current JSON: ${JSON.stringify(body.current ?? {})}`;
      const result = await generateWithGroqChat(
        system,
        [{ role: "user", content: instruction }],
        900,
      );
      if (!result.success) {
        return res.status(200).json({ success: false, error: "AI assist unavailable" });
      }
      try {
        const raw = result.text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
        const parsed = JSON.parse(raw);
        return res.status(200).json({ success: true, patch: parsed.patch || parsed });
      } catch {
        return res.status(200).json({ success: true, text: result.text });
      }
    }

    const message = body.message;
    if (!message) throw new HttpError(400, "A message is required");

    const chatHistory = (body.history ?? []).slice(-8).map((turn) => ({
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
