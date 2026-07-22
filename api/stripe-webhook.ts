import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

type Request = { method?: string; body: any };
type Response = {
  setHeader(name: string, value: string): void;
  status(code: number): Response;
  send(body: string): void;
};

const CONVEX_URL = "https://calculating-octopus-439.convex.cloud";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const eventId = req.body?.id;
  if (!stripeKey || !eventId) return res.status(400).send("Invalid event");

  // Retrieve the event directly from Stripe. This proves the payload is a real
  // Stripe event without relying on a separately managed signing secret.
  const stripeResponse = await fetch(`https://api.stripe.com/v1/events/${eventId}`, {
    headers: { Authorization: `Bearer ${stripeKey}` },
  });
  if (!stripeResponse.ok) return res.status(401).send("Unverified event");
  const event = await stripeResponse.json();

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const convex = new ConvexHttpClient(CONVEX_URL);
    const order = await convex.query(anyApi.orders.getByStripeSession, {
      stripeCheckoutSessionId: session.id,
    });
    if (order) {
      await convex.mutation(anyApi.orders.updateStatus, {
        orderId: order._id,
        status: "paid",
        stripePaymentIntentId: session.payment_intent || undefined,
        fulfillmentStage: "payment_received",
      });
      await convex.action(anyApi.orders.fulfillWithPrintful, { orderId: order._id });
    }
  }

  return res.status(200).send("OK");
}
