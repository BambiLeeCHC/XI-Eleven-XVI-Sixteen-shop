/**
 * Stripe → order state.
 *
 * The event is re-fetched from Stripe by id before it is trusted, so a forged
 * POST to this URL cannot mark an order paid.
 *
 * Note: this route previously read `STRIPE_SECRET_KEY`, which is empty on
 * Vercel — every payment webhook failed verification and no paid order was ever
 * forwarded to production. It now resolves the key the same way checkout does.
 */

import { submitOrderToPrintful } from "./_lib/fulfill";
import {
  type ApiRequest,
  type ApiResponse,
  stripeSecret,
  supabaseAdmin,
  updateOrder,
} from "./_lib/server";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }

  const eventId = req.body?.id;
  if (!eventId) return res.status(400).send("Invalid event");

  let event: any;
  try {
    const response = await fetch(
      `https://api.stripe.com/v1/events/${eventId}`,
      {
        headers: { Authorization: `Bearer ${stripeSecret()}` },
      },
    );
    if (!response.ok) return res.status(401).send("Unverified event");
    event = await response.json();
  } catch (error) {
    console.error("Stripe verification failed", error);
    return res.status(500).send("Verification failed");
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data?.object;
      const admin = supabaseAdmin();

      const orderId =
        session?.metadata?.order_id ||
        session?.client_reference_id ||
        (
          await admin
            .from("orders")
            .select("id")
            .eq("stripe_checkout_session_id", session?.id)
            .maybeSingle()
        ).data?.id;

      if (orderId) {
        await updateOrder(
          orderId,
          {
            status: "paid",
            stripe_payment_intent_id: session.payment_intent || null,
          },
          { stage: "payment_received" },
        );
        // Fulfillment failures must not fail the webhook: Stripe would retry the
        // payment event and the order would be double-submitted to production.
        try {
          await submitOrderToPrintful(orderId);
        } catch (error) {
          console.error("Printful submission failed", error);
        }
      }
    }
  } catch (error) {
    console.error("Stripe webhook handling failed", error);
    return res.status(500).send("Handling failed");
  }

  return res.status(200).send("OK");
}
