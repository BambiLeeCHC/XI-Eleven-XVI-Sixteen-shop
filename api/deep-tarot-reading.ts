/**
 * The Long Read — seven-card reading.
 * TRUE_NORTH_FREE_ACCESS skips the weekly quota without writing subscription rows.
 */

import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  fail,
  HttpError,
  supabaseAdmin,
} from "./_lib/server.js";
import { TRUE_NORTH_FREE_ACCESS } from "../src/lib/freeAccess.js";
import { generateWithGroq, type GroqFailure } from "./_lib/groq.js";
import {
  buildKeepsakeEmailHtml,
  readingTextToHtml,
  sendResendEmail,
  SUPPORT_FROM,
} from "./_lib/resend.js";
import { assertTrueNorthOpen } from "./_lib/trueNorthGate.js";
import {
  buildLongReadPrompt,
  fallbackLongRead,
  LONG_READ_SYSTEM_PROMPT,
  type LongReadCard,
} from "../src/lib/longRead.js";

export type DailyWindow = "morning" | "midday" | "evening";

const VALID_WINDOWS: DailyWindow[] = ["morning", "midday", "evening"];

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
    await assertTrueNorthOpen(req);
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

    if (!isAdmin && !TRUE_NORTH_FREE_ACCESS) {
      const { data: sub } = await admin
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      const subscribed = !!sub && ["trialing", "active"].includes(sub.status);
      if (!subscribed) {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count, error: weekError } = await admin
          .from("deep_readings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", since);
        if (weekError) {
          console.error("weekly reading quota check failed:", weekError.message);
        } else if ((count ?? 0) >= 3) {
          throw new HttpError(402, "You've used your 3 free readings this week. Readings are $3.99 a week after that.");
        }
      }
    }

    const { spread, situation, window: windowRaw } = (req.body ?? {}) as {
      spread?: LongReadCard[];
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


    const situationText = situation?.trim() || "not specified";

    const result = await generateWithGroq(
      LONG_READ_SYSTEM_PROMPT,
      buildLongReadPrompt(
        spread,
        name,
        situationText,
        profile?.gender_identity ?? undefined,
        profile?.sexual_orientation ?? undefined,
      ),
      5000,
    );
    let readingText: string;
    let usedFallback = false;
    if (!result.success) {
      const failure = result as GroqFailure;
      console.error("Long Read Groq failed, using card-native fallback:", groqErrorMessage(failure));
      readingText = fallbackLongRead(name, situationText, spread);
      usedFallback = true;
    } else {
      readingText = result.text;
    }

    let saved: { id?: string; created_at?: string; window?: string | null } | null = null;
    {
      const first = await admin
        .from("deep_readings")
        .insert({
          user_id: user.id,
          spread,
          reading: readingText,
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
            reading: readingText,
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
          readingHtml: readingTextToHtml(readingText),
        }),
        text: readingText,
      });
      emailed = emailResult.success;
      if (!emailResult.success) {
        console.error("Long Read keepsake email failed:", (emailResult as { success: false; error: string }).error);
      }
    }

    return res.status(200).json({
      success: true,
      reading: readingText,
      id: saved?.id ?? null,
      createdAt: saved?.created_at ?? new Date().toISOString(),
      window: saved?.window ?? windowId,
      emailed,
      saved: Boolean(saved?.id),
      fallback: usedFallback,
    });
  } catch (error) {
    return fail(res, error);
  }
}
