/**
 * Turn a stored order into a Stripe Checkout session.
 *
 * Everything billed is read back from the `orders` row the server wrote, not
 * from the request body: the browser can only say *which* order to pay for.
 * The Stripe session id is attached here, so the confirmation page and the
 * payment webhook can both find the order again.
 */

import {
  type ApiRequest,
  type ApiResponse,
  fail,
  HttpError,
  stripePost,
  supabaseAdmin,
} from "./_lib/server.js";

type OrderItem = {
  productName: string;
  size?: string;
  color?: string | null;
  quantity: number;
  priceAtPurchase: number;
  image?: string;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, successUrl, cancelUrl } = (req.body ?? {}) as {
      orderId?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    if (!orderId || !successUrl || !cancelUrl) {
      throw new HttpError(400, "Invalid checkout request");
    }

    const admin = supabaseAdmin();
    const { data: order, error } = await admin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();
    if (error) throw error;
    if (!order) throw new HttpError(404, "Order not found");
    if (order.status !== "pending") {
      throw new HttpError(409, "This order has already been paid");
    }

    const params: Record<string, string> = {
      mode: "payment",
      customer_creation: "always",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      "phone_number_collection[enabled]": "true",
      allow_promotion_codes: "true",
      client_reference_id: order.id,
      "metadata[order_id]": order.id,
      "payment_intent_data[metadata][order_id]": order.id,
    };
    if (order.email) {
      params.customer_email = order.email;
      params["payment_intent_data[receipt_email]"] = order.email;
    }

    let index = 0;
    const addLine = (
      name: string,
      unitAmount: number,
      quantity: number,
      image?: string,
    ) => {
      params[`line_items[${index}][price_data][currency]`] = "usd";
      params[`line_items[${index}][price_data][product_data][name]`] =
        name.slice(0, 250);
      if (image?.startsWith("http")) {
        params[`line_items[${index}][price_data][product_data][images][0]`] =
          image;
      }
      params[`line_items[${index}][price_data][unit_amount]`] =
        String(unitAmount);
      params[`line_items[${index}][quantity]`] = String(quantity);
      index += 1;
    };

    const items = (order.items ?? []) as OrderItem[];
    if (items.length === 0) throw new HttpError(400, "This order has no items");

    for (const item of items) {
      const variant = [item.color, item.size].filter(Boolean).join(" / ");
      addLine(
        variant ? `${item.productName} — ${variant}` : item.productName,
        item.priceAtPurchase,
        item.quantity,
        item.image,
      );
    }

    if (order.tax > 0) {
      addLine(
        order.tax_region ? `Sales Tax (${order.tax_region})` : "Sales Tax",
        order.tax,
        1,
      );
    }
    if (order.shipping > 0) {
      const method = (order.shipping_method as { name?: string } | null)?.name;
      addLine(method || "Shipping", order.shipping, 1);
    }

    const session = await stripePost("/checkout/sessions", params);

    const { error: attachError } = await admin
      .from("orders")
      .update({
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);
    if (attachError) throw attachError;

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return fail(res, error);
  }
}
