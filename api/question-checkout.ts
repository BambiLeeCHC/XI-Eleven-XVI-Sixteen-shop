/**
 * One-time $2.99 checkout for a single follow-up question on a reading.
 *
 * The question text and the reading context it's attached to are written to
 * `reading_questions` (status "pending") *before* checkout, so the row exists
 * for the webhook to find and answer once Stripe confirms payment. Nothing is
 * answered until payment completes.
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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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
  } catch (error) {
    return fail(res, error);
  }
}
