/**
 * The Long Read — the paywalled seven-card deep reading.
 *
 * Requires an active or trialing subscription (checked server-side against
 * `subscriptions`, never trusted from the client). Admins bypass the paywall
 * and the daily window quota entirely.
 *
 * Subscribers receive three Long Reads per calendar day, one per time window:
 *   morning  00:00–11:59 local (client-gated; server stores window id)
 *   midday   12:00–16:59
 *   evening  17:00–23:59
 *
 * The card draw itself happens in the browser; this endpoint writes the
 * narrative, saves the result to `deep_readings` as a keepsake, and —
 * best-effort — emails the same keepsake via Resend. Email delivery failure
 * never blocks the reading response; the account copy is always the source
 * of truth.
 *
 * LLM failures return success:false with a human-readable `error` string so the
 * UI can show why (missing GROQ_API_KEY is the usual production cause).
 * A DB save failure after a successful generation still returns the reading.
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
import {
  buildKeepsakeEmailHtml,
  readingTextToHtml,
  sendResendEmail,
  SUPPORT_FROM,
} from "./_lib/resend.js";

interface SpreadCardInput {
  slot: string;
  slotName: string;
  slotQuestion: string;
  reversed: boolean;
  card: {
    name: string;
    keywords: string[];
    upright: string;
    reversed: string;
  };
}

export type DailyWindow = "morning" | "midday" | "evening";

const VALID_WINDOWS: DailyWindow[] = ["morning", "midday", "evening"];

const SYSTEM_PROMPT = `You are the XI · XVI Reader, writing "The Long Read" — the in-depth, paid tarot reading for the XI Eleven XVI Sixteen (xixvi.shop) brand. This reader paid to go deeper on a situation they described. Your only job is to bring hope. Show them what they are already doing right in that situation, and the best-case path available — even when that path is slim. You never darken the room.

CORE MANDATE (non-negotiable):
- ONLY speak to what they are doing right, what is already working in their favor, and the best-case scenario the cards open for the situation they named — no matter how narrow that opening is.
- NEVER dwell on failure, doom, punishment, "warnings," what they are doing wrong, or worst-case outcomes. If a card is traditionally heavy or reversed, translate it into the constructive charge it still holds: a course-correction, a gift under pressure, a strength that is waking up, the best move still on the table.
- Do not invent hardship. Do not "balance" hope with fear. Hope is the whole assignment. Stay grounded in the situation they described, but always from the side of what can work.

VOICE AND STRUCTURE:
- Do NOT open with a hook that teases a card. Start from what is already workable in their situation.
- Address the seven cards ONE AT A TIME, in draw order, each in its own paragraph named by its position (e.g. "In the Root of this, [Card] ..."). Every paragraph reads the card against their situation as evidence of strength, support, or best-case possibility — not generic keyword soup.
- Reversed cards still get their own charge — always framed as redirection, latent strength, or the best available next move, never as collapse.
- Build a real throughline of encouragement across all seven so by the end they can name what is working and where the best outcome lives.
- Close with one synthesis paragraph of the hopeful throughline, then one concrete, second-person action that moves them toward the best case. No vague mysticism. No telling them how to feel.
- Sparing bold (wrap in **like this**) on the three or four phrases that matter most.
- Write 450-650 words. No headers, no bullet lists, no emoji, no sign-off.
- Address them by name once, naturally, in the opening — not as a greeting line.
- If gender identity and/or sexual orientation are given, use them only for pronouns and relationship framing where relevant — never call them out as the subject unless their stated situation already is.`;

function buildUserPrompt(
  spread: SpreadCardInput[],
  name: string,
  situation: string,
  genderIdentity?: string,
  sexualOrientation?: string,
): string {
  const lines = spread.map((c, i) => {
    const meaning = c.reversed ? c.card.reversed : c.card.upright;
    return `${i + 1}. Position "${c.slotName}" (${c.slotQuestion}) → ${c.card.name}${c.reversed ? ", REVERSED" : ", upright"}. Canonical meaning: ${meaning} Keywords: ${c.card.keywords.join(", ")}.`;
  });
  const identityBits = [
    genderIdentity ? `gender identity: ${genderIdentity}` : null,
    sexualOrientation ? `sexual orientation: ${sexualOrientation}` : null,
  ].filter(Boolean);
  const identityLine = identityBits.length ? ` Also on file: ${identityBits.join(", ")}.` : "";
  return `This reading is for ${name}. What they told us is going on: "${situation}".${identityLine}\n\nThe seven-card spread, in draw order:\n${lines.join("\n")}\n\nWrite the Long Read now, following the voice and structure rules exactly.`;
}

function utcDayBounds(now = new Date()): { start: string; end: string } {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return {
    start: `${y}-${m}-${d}T00:00:00.000Z`,
    end: `${y}-${m}-${d}T23:59:59.999Z`,
  };
}

function groqErrorMessage(failure: GroqFailure): string {
  if (failure.reason === "no_key") {
    return "The reading engine is offline (GROQ_API_KEY missing on the server). Add it in Vercel env and redeploy.";
  }
  if (failure.reason === "upstream_error") {
    return `The reading engine failed upstream${failure.detail ? ` (${failure.detail})` : ""}. Try again in a moment.`;
  }
  return "The reading engine returned an empty response. Try again.";
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await currentUser(req);
    if (!user) throw new HttpError(401, "Please sign in first");

    const admin = supabaseAdmin();
    const { data: profile } = await admin
      .from("profiles")
      .select("name, gender_identity, sexual_orientation, role")
      .eq("id", user.id)
      .maybeSingle();
    const name = profile?.name || "friend";
    const isAdmin = profile?.role === "admin";

    if (!isAdmin) {
      const { data: sub } = await admin
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!sub || !["trialing", "active"].includes(sub.status)) {
        throw new HttpError(402, "An active subscription is required for the Long Read");
      }
    }

    const { spread, situation, window: windowRaw } = (req.body ?? {}) as {
      spread?: SpreadCardInput[];
      situation?: string;
      window?: string;
    };
    if (!spread || !Array.isArray(spread) || spread.length === 0) {
      throw new HttpError(400, "A spread of drawn cards is required");
    }

    const windowId = (windowRaw ?? "").toLowerCase() as DailyWindow;
    if (!VALID_WINDOWS.includes(windowId)) {
      throw new HttpError(
        400,
        'A daily window is required: "morning", "midday", or "evening"',
      );
    }

    if (!isAdmin) {
      const { start, end } = utcDayBounds();
      const { count, error: countError } = await admin
        .from("deep_readings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("window", windowId)
        .gte("created_at", start)
        .lte("created_at", end);
      if (countError) {
        console.error("window quota check failed (is window column migrated?):", countError.message);
      } else if ((count ?? 0) >= 1) {
        throw new HttpError(
          429,
          `You have already drawn the ${windowId} Long Read today. The next window opens later, or tomorrow.`,
        );
      }
    }

    const situationText = situation?.trim() || "not specified";

    const result = await generateWithGroq(
      SYSTEM_PROMPT,
      buildUserPrompt(
        spread,
        name,
        situationText,
        profile?.gender_identity ?? undefined,
        profile?.sexual_orientation ?? undefined,
      ),
      5000,
    );
    if (!result.success) {
      const failure = result as GroqFailure;
      return res.status(200).json({
        success: false,
        reason: failure.reason,
        error: groqErrorMessage(failure),
        detail: failure.detail,
      });
    }

    let saved: { id?: string; created_at?: string; window?: string | null } | null = null;
    {
      const first = await admin
        .from("deep_readings")
        .insert({
          user_id: user.id,
          spread,
          reading: result.text,
          window: windowId,
        })
        .select("id, created_at, window")
        .single();

      if (first.error) {
        console.error("deep_readings insert with window failed:", first.error.message);
        const fallback = await admin
          .from("deep_readings")
          .insert({
            user_id: user.id,
            spread,
            reading: result.text,
          })
          .select("id, created_at")
          .single();
        if (fallback.error) {
          console.error("deep_readings insert fallback failed:", fallback.error.message);
        } else {
          saved = fallback.data;
        }
      } else {
        saved = first.data;
      }
    }

    let emailed = false;
    if (user.email) {
      const emailResult = await sendResendEmail({
        from: SUPPORT_FROM,
        to: user.email,
        subject: `Your ${windowId} Long Read is ready`,
        html: buildKeepsakeEmailHtml({
          name,
          readingHtml: readingTextToHtml(result.text),
        }),
        text: result.text,
      });
      emailed = emailResult.success;
      if (!emailResult.success) {
        console.error("Long Read keepsake email failed:", emailResult.error);
      }
    }

    return res.status(200).json({
      success: true,
      reading: result.text,
      id: saved?.id ?? null,
      createdAt: saved?.created_at ?? new Date().toISOString(),
      window: saved?.window ?? windowId,
      emailed,
      saved: Boolean(saved?.id),
    });
  } catch (error) {
    return fail(res, error);
  }
}
