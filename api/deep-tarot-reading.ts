/**
 * The Long Read — the paywalled seven-card deep reading.
 *
 * Requires an active or trialing subscription (checked server-side against
 * `subscriptions`, never trusted from the client). Subscribers receive three
 * Long Reads per calendar day, one per time window:
 *   morning  00:00–11:59 local (client-gated; server stores window id)
 *   midday   12:00–16:59
 *   evening  17:00–23:59
 *
 * The card draw itself happens in the browser; this endpoint writes the
 * narrative, saves the result to `deep_readings` as a keepsake, and —
 * best-effort — emails the same keepsake via Resend. Email delivery failure
 * never blocks the reading response; the account copy is always the source
 * of truth.
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

/** The same shape DeepReadingPage draws and renders from — a full Arcana
 * card object per position, not a flattened prompt-only shape. Saving this
 * exact shape to `deep_readings.spread` is what lets the page redraw the
 * card art correctly the next time the reading is reopened. */
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

const SYSTEM_PROMPT = `You are the XI · XVI Reader, writing "The Long Read" — the in-depth, paid tarot reading for the XI Eleven XVI Sixteen (xixvi.shop) brand. This reader paid specifically to go deeper on a situation they described to us. Your writing is direct, poignant, and specific — never a generic horoscope, never hedging language like "may" or "could," never a false or theatrical sense of authority.

VOICE AND STRUCTURE (model this closely):
- Do NOT open with a "hook" that teases a card and promises to circle back to it later. Just start speaking to them about what's actually in front of them, grounded in the situation they described.
- Address the seven cards ONE AT A TIME, in draw order, each in its own paragraph named by its position (e.g. "In the Root of this, [Card] ..."). Every paragraph should read the card specifically against the situation they told us — not generic card meaning, not keyword soup.
- Reversed cards carry a genuinely different charge than upright — treat them as their own message.
- Build a real throughline across all seven, earned by what each card actually says.
- Close with one direct synthesis paragraph naming what's really true about their situation, then one concrete, second-person thing to do next. No vague mysticism, no telling them how to feel.
- Sparing, intentional bold (wrap in **like this**) on the three or four phrases that matter most.
- Write 450-650 words — this is the long version, not the daily one. No headers, no bullet lists, no emoji, no sign-off.
- Address them by name once, naturally, in the opening — not as a greeting line.
- If a gender identity and/or sexual orientation are given below, use them only to get pronouns and relationship framing right where the reading naturally touches on identity or relationships — never call them out directly, never make either the subject of the reading unless the person's own stated situation already is.`;

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

/** UTC start/end of the current calendar day for quota queries. */
function utcDayBounds(now = new Date()): { start: string; end: string } {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return {
    start: `${y}-${m}-${d}T00:00:00.000Z`,
    end: `${y}-${m}-${d}T23:59:59.999Z`,
  };
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
    const { data: sub } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!sub || !["trialing", "active"].includes(sub.status)) {
      throw new HttpError(402, "An active subscription is required for the Long Read");
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("name, gender_identity, sexual_orientation")
      .eq("id", user.id)
      .maybeSingle();
    const name = profile?.name || "friend";

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

    // One Long Read per window per UTC calendar day.
    const { start, end } = utcDayBounds();
    const { count, error: countError } = await admin
      .from("deep_readings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("window", windowId)
      .gte("created_at", start)
      .lte("created_at", end);
    if (countError) throw countError;
    if ((count ?? 0) >= 1) {
      throw new HttpError(
        429,
        `You have already drawn the ${windowId} Long Read today. The next window opens later, or tomorrow.`,
      );
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
      return res.status(200).json({ success: false, reason: failure.reason });
    }

    const { data: saved, error } = await admin
      .from("deep_readings")
      .insert({
        user_id: user.id,
        spread,
        reading: result.text,
        window: windowId,
      })
      .select("id, created_at, window")
      .single();
    if (error) throw error;

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
      id: saved.id,
      createdAt: saved.created_at,
      window: saved.window ?? windowId,
      emailed,
    });
  } catch (error) {
    return fail(res, error);
  }
}
