/**
 * Starts the Long Read subscription: a 7-day free trial, then $7/week.
 *
 * Requires an authenticated caller (Supabase bearer token) — the Stripe
 * customer is tied to the signed-in user id via metadata/client_reference_id
 * so the webhook can write the right row to `subscriptions` once Stripe
 * confirms it.
 */

import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  fail,
  HttpError,
  stripePost,
} from "./_lib/server.js";

const WEEKLY_PRICE_CENTS = 700;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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
  } catch (error) {
    return fail(res, error);
  }
}
