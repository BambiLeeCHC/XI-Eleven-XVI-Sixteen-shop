/**
 * AI Journal post generator + social advertising package.
 * Generates a full blog post plus LinkedIn and Instagram captions.
 * Auto-post when LINKEDIN_* / META_* env vars are set.
 */

import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  fail,
  HttpError,
  supabaseAdmin,
} from "./_lib/server.js";
import { generateWithGroq, type GroqFailure } from "./_lib/groq.js";

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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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
        const create = await fetch(
          `https://graph.facebook.com/v19.0/${igUser}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_url: imageUrl,
              caption: packageOut.instagramCaption,
              access_token: igToken,
            }),
          },
        );
        const created = await create.json();
        if (created?.id) {
          const pub = await fetch(
            `https://graph.facebook.com/v19.0/${igUser}/media_publish`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                creation_id: created.id,
                access_token: igToken,
              }),
            },
          );
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
  } catch (error) {
    return fail(res, error);
  }
}
