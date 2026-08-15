/**
 * Checkout for reading-related paid flows — combined into one serverless
 * function. Split as two separate files (question-checkout.ts,
 * subscribe-checkout.ts) initially, but the Hobby-plan Vercel project is
 * capped at 12 Serverless Functions per deployment — merged here,
 * dispatched by `{ kind: "question" | "subscribe" }` in the POST body, to
 * stay under that limit. Logic for each kind is otherwise unchanged from
 * the original standalone files.
 *
 * "question": one-time $2.99 checkout for a single follow-up question on a
 * reading. The question text and the reading context it's attached to are
 * written to `reading_questions` (status "pending") *before* checkout, so
 * the row exists for the webhook to find and answer once Stripe confirms
 * payment. Nothing is answered until payment completes.
 *
 * "subscribe": starts the Long Read subscription — a 7-day free trial,
 * then $7/week. Requires an authenticated caller (Supabase bearer token) —
 * the Stripe customer is tied to the signed-in user id via
 * metadata/client_reference_id so the webhook can write the right row to
 * `subscriptions` once Stripe confirms it.
 */

import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  fail,
  HttpError,
  stripePost,
  supabaseAdmin,
} from "./_lib/server.js";

const QUESTION_PRICE_CENTS = 299;
const WEEKLY_PRICE_CENTS = 700;

async function handleQuestionCheckout(req: ApiRequest, res: ApiResponse) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Please sign in first");

  const { question, readingContext, successUrl, cancelUrl } =
    (req.body ?? {}) as {
      question?: string;
      readingContext?: unknown;
      successUrl?: string;
      cancelUrl?: string;
    };
  if (!question?.trim()) throw new HttpError(400, "A question is required");
  if (!successUrl || !cancelUrl) {
    throw new HttpError(400, "Invalid checkout request");
  }

  const admin = supabaseAdmin();
  const { data: row, error } = await admin
    .from("reading_questions")
    .insert({
      user_id: user.id,
      question: question.trim(),
      reading_context: readingContext ?? null,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw error;

  const params: Record<string, string> = {
    mode: "payment",
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    client_reference_id: row.id,
    "metadata[reading_question_id]": row.id,
    "payment_intent_data[metadata][reading_question_id]": row.id,
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": "Follow-up question",
    "line_items[0][price_data][unit_amount]": String(QUESTION_PRICE_CENTS),
    "line_items[0][quantity]": "1",
  };
  if (user.email) params.customer_email = user.email;

  const session = await stripePost("/checkout/sessions", params);

  const { error: attachError } = await admin
    .from("reading_questions")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", row.id);
  if (attachError) throw attachError;

  return res.status(200).json({ success: true, url: session.url });
}

async function handleSubscribeCheckout(req: ApiRequest, res: ApiResponse) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Please sign in first");

  const { successUrl, cancelUrl } = (req.body ?? {}) as {
    successUrl?: string;
    cancelUrl?: string;
  };
  if (!successUrl || !cancelUrl) {
    throw new HttpError(400, "Invalid checkout request");
  }

  const params: Record<string, string> = {
    mode: "subscription",
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    client_reference_id: user.id,
    "metadata[user_id]": user.id,
    "subscription_data[trial_period_days]": "7",
    "subscription_data[metadata][user_id]": user.id,
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": "The Long Read — weekly",
    "line_items[0][price_data][recurring][interval]": "week",
    "line_items[0][price_data][unit_amount]": String(WEEKLY_PRICE_CENTS),
    "line_items[0][quantity]": "1",
    allow_promotion_codes: "true",
  };
  if (user.email) params.customer_email = user.email;

  const session = await stripePost("/checkout/sessions", params);

  return res.status(200).json({ success: true, url: session.url });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { kind } = (req.body ?? {}) as { kind?: string };
    if (kind === "question") return await handleQuestionCheckout(req, res);
    if (kind === "subscribe") return await handleSubscribeCheckout(req, res);
    throw new HttpError(400, "Unknown checkout kind requested");
  } catch (error) {
    return fail(res, error);
  }
}
