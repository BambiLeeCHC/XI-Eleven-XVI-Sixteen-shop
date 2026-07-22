type VercelRequest = {
  method?: string;
  body: unknown;
};

type VercelResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(body: unknown): void;
};

const STRIPE_BASE = "https://api.stripe.com/v1";

type CheckoutItem = {
  productName: string;
  priceInCents: number;
  quantity: number;
  imageUrl?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const encodedKey =
    process.env.STRIPE_KEY_ENCODED_V2 ||
    process.env.STRIPE_KEY_ENCODED ||
    process.env.STRIPE_KEY_B64;
  const secretKey = encodedKey
    ? Buffer.from(encodedKey, "base64").toString("utf8")
    : process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Payment service is not configured" });
  }

  try {
    const normalizedSecretKey = secretKey
      .replace(/^['"]|['"]$/g, "")
      .replace(/[^\x20-\x7E]/g, "")
      .trim();
    const {
      items,
      shippingRateInCents,
      shippingMethodName,
      taxAmountCents,
      taxLabel,
      customerEmail,
      successUrl,
      cancelUrl,
      orderId,
    } = req.body as {
      items: CheckoutItem[];
      shippingRateInCents?: number;
      shippingMethodName?: string;
      taxAmountCents?: number;
      taxLabel?: string;
      customerEmail?: string;
      successUrl: string;
      cancelUrl: string;
      orderId: string;
    };

    if (!Array.isArray(items) || items.length === 0 || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: "Invalid checkout request" });
    }

    const params: Record<string, string> = {
      mode: "payment",
      customer_creation: "always",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      "phone_number_collection[enabled]": "true",
      "allow_promotion_codes": "true",
      client_reference_id: orderId,
      "metadata[order_id]": orderId,
      "payment_intent_data[metadata][order_id]": orderId,
      "payment_intent_data[receipt_email]": customerEmail || "",
    };

    if (customerEmail) params.customer_email = customerEmail;

    let index = 0;
    for (const item of items) {
      if (
        !item.productName ||
        !Number.isInteger(item.priceInCents) ||
        item.priceInCents < 1 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({ error: "Invalid checkout item" });
      }
      params[`line_items[${index}][price_data][currency]`] = "usd";
      params[`line_items[${index}][price_data][product_data][name]`] = item.productName;
      if (item.imageUrl) {
        params[`line_items[${index}][price_data][product_data][images][0]`] = item.imageUrl;
      }
      params[`line_items[${index}][price_data][unit_amount]`] = String(item.priceInCents);
      params[`line_items[${index}][quantity]`] = String(item.quantity);
      index += 1;
    }

    if (taxAmountCents && taxAmountCents > 0) {
      params[`line_items[${index}][price_data][currency]`] = "usd";
      params[`line_items[${index}][price_data][product_data][name]`] =
        taxLabel || "Sales Tax";
      params[`line_items[${index}][price_data][unit_amount]`] = String(taxAmountCents);
      params[`line_items[${index}][quantity]`] = "1";
      index += 1;
    }

    if (shippingRateInCents && shippingRateInCents > 0) {
      params[`line_items[${index}][price_data][currency]`] = "usd";
      params[`line_items[${index}][price_data][product_data][name]`] =
        shippingMethodName || "Shipping";
      params[`line_items[${index}][price_data][unit_amount]`] = String(
        shippingRateInCents,
      );
      params[`line_items[${index}][quantity]`] = "1";
    }

    const stripeResponse = await fetch(`${STRIPE_BASE}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${normalizedSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params).toString(),
    });
    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error("Stripe checkout error", session?.error?.type);
      return res.status(502).json({ error: "Unable to create secure checkout" });
    }

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Checkout API error", error);
    return res.status(500).json({ error: "Unable to create secure checkout" });
  }
}
