import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

// ─── Direct Stripe API ──────────────────────────────────────────────────

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_BASE = "https://api.stripe.com/v1";

async function stripePost(path: string, body: Record<string, string>): Promise<any> {
  const response = await fetch(`${STRIPE_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(STRIPE_SECRET_KEY + ":")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Stripe ${response.status}: ${JSON.stringify(data.error)}`);
  }
  return data;
}

// ─── Printful direct API ────────────────────────────────────────────────

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY!;
const PRINTFUL_BASE = "https://api.printful.com";

async function printfulPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${PRINTFUL_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Printful ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

// ─── Internal: Resolve cart items → Printful variant IDs ────────────────

export const resolveCartVariants = internalQuery({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        size: v.string(),
        quantity: v.number(),
      })
    ),
  },
  returns: v.any(),
  handler: async (ctx, { items }) => {
    const resolved = [];
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (!product) continue;

      const variants = product.printfulVariants as any[] | undefined;
      let syncVariantId: number | null = null;
      let catalogVariantId: number | null = null;

      // Cart stores size as "Product Name / Size" or just "Size" — extract the pure size
      const rawSize = item.size;
      const pureSize = rawSize.includes(" / ") ? rawSize.split(" / ").pop()! : rawSize;

      if (variants && variants.length > 0) {
        const match = variants.find((v: any) => v.size === pureSize);
        if (match) {
          syncVariantId = Math.round(match.id);
          catalogVariantId = Math.round(match.variant_id);
        }
      }

      resolved.push({
        productId: item.productId,
        productName: product.name,
        size: item.size,
        quantity: item.quantity,
        price: product.price,
        image: product.images?.[0] ?? null,
        syncVariantId,
        catalogVariantId,
      });
    }
    return resolved;
  },
});

// ─── Estimate Shipping Rates (Printful) ─────────────────────────────────

interface PrintfulShippingRate {
  id: string;
  name: string;
  rate: string;
  currency: string;
  minDeliveryDays?: number;
  maxDeliveryDays?: number;
  min_delivery_days?: number;
  max_delivery_days?: number;
  minDeliveryDate?: string;
  maxDeliveryDate?: string;
  min_delivery_date?: string;
  max_delivery_date?: string;
}

interface PrintfulShippingResponse {
  code: number;
  result: PrintfulShippingRate[];
}

interface ResolvedCartItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  image: string | null;
  syncVariantId: number | null;
  catalogVariantId: number | null;
}

export const estimateShipping = action({
  args: {
    address: v.object({
      address1: v.string(),
      city: v.string(),
      stateCode: v.string(),
      countryCode: v.string(),
      zip: v.string(),
    }),
    items: v.array(
      v.object({
        productId: v.id("products"),
        size: v.string(),
        quantity: v.number(),
      })
    ),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    try {
      const { address, items } = args;

      // Resolve cart items to Printful variant IDs
      const resolvedRaw: ResolvedCartItem[] = await ctx.runQuery(
        internal.checkout.resolveCartVariants,
        { items }
      );

      // Build Printful shipping items — /shipping/rates requires catalog variant_id (NOT sync_variant_id)
      const printfulItems: Array<{ variant_id: number; quantity: number }> = [];
      for (const r of resolvedRaw) {
        if (r.catalogVariantId) {
          printfulItems.push({ variant_id: r.catalogVariantId, quantity: r.quantity });
        }
      }

      if (printfulItems.length === 0) {
        return {
          success: false,
          error: "Could not resolve Printful variants for your cart items.",
        };
      }

      // Call Printful shipping rates endpoint
      const apiResult: PrintfulShippingResponse = await printfulPost(
        "/shipping/rates",
        {
          recipient: {
            address1: address.address1,
            city: address.city,
            state_code: address.stateCode,
            country_code: address.countryCode,
            zip: address.zip,
          },
          items: printfulItems,
        }
      );

      // Normalize + add fulfillment estimate
      // Printful all-over-print fulfillment: 2–5 business days
      const FULFILLMENT_MIN = 2;
      const FULFILLMENT_MAX = 5;

      const rates = apiResult.result.map((rate: PrintfulShippingRate) => {
        const minTransit: number | null =
          rate.minDeliveryDays ?? rate.min_delivery_days ?? null;
        const maxTransit: number | null =
          rate.maxDeliveryDays ?? rate.max_delivery_days ?? null;

        // Standard shipping is FREE — check if this is a standard/flat rate
        const isStandard = rate.id === "STANDARD" ||
          rate.name.toLowerCase().includes("standard") ||
          rate.name.toLowerCase().includes("flat");
        const originalRateCents = Math.round(parseFloat(rate.rate) * 100);

        return {
          id: rate.id,
          name: isStandard ? `${rate.name} — FREE` : rate.name,
          rate: isStandard ? "0.00" : rate.rate,
          rateInCents: isStandard ? 0 : originalRateCents,
          originalRateCents,
          isFreeShipping: isStandard,
          currency: rate.currency || "USD",
          transitMinDays: minTransit,
          transitMaxDays: maxTransit,
          fulfillmentMinDays: FULFILLMENT_MIN,
          fulfillmentMaxDays: FULFILLMENT_MAX,
          totalMinDays:
            minTransit !== null ? FULFILLMENT_MIN + minTransit : null,
          totalMaxDays:
            maxTransit !== null ? FULFILLMENT_MAX + maxTransit : null,
        };
      });

      return { success: true, rates, resolvedItems: resolvedRaw };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

// ─── Create Stripe Checkout Session ─────────────────────────────────────

export const createCheckoutSession = action({
  args: {
    items: v.array(
      v.object({
        productName: v.string(),
        priceInCents: v.number(),
        quantity: v.number(),
        imageUrl: v.optional(v.string()),
      })
    ),
    shippingRateInCents: v.optional(v.number()),
    shippingMethodName: v.optional(v.string()),
    taxAmountCents: v.optional(v.number()),
    taxLabel: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  returns: v.any(),
  handler: async (_ctx, args) => {
    try {
      const params: Record<string, string> = {
        mode: "payment",
        "success_url": args.successUrl + "?session_id={CHECKOUT_SESSION_ID}",
        "cancel_url": args.cancelUrl,
        "phone_number_collection[enabled]": "true",
        "allow_promotion_codes": "true",
      };

      // Pre-fill customer email if provided
      if (args.customerEmail) {
        params["customer_email"] = args.customerEmail;
      }

      // If we don't already have shipping, let Stripe collect it (worldwide)
      if (!args.shippingRateInCents && args.shippingRateInCents !== 0) {
        const countries = [
          "US","CA","GB","AU","DE","FR","IT","ES","NL","SE","NO","DK","FI","IE",
          "AT","BE","CH","PT","JP","KR","SG","NZ","MX","BR","IN","PL","CZ","HU",
          "RO","HR","BG","GR","LT","LV","EE","SK","SI","LU","MT","CY","IS",
        ];
        countries.forEach((c, i) => {
          params[`shipping_address_collection[allowed_countries][${i}]`] = c;
        });
      }

      // Add product line items
      let idx = 0;
      for (const item of args.items) {
        params[`line_items[${idx}][price_data][currency]`] = "usd";
        params[`line_items[${idx}][price_data][product_data][name]`] =
          item.productName;
        if (item.imageUrl) {
          params[`line_items[${idx}][price_data][product_data][images][0]`] =
            item.imageUrl;
        }
        params[`line_items[${idx}][price_data][unit_amount]`] =
          item.priceInCents.toString();
        params[`line_items[${idx}][quantity]`] = item.quantity.toString();
        idx++;
      }

      // Add tax as a line item if provided
      if (
        args.taxAmountCents !== undefined &&
        args.taxAmountCents > 0
      ) {
        const taxName = args.taxLabel || "Sales Tax";
        params[`line_items[${idx}][price_data][currency]`] = "usd";
        params[`line_items[${idx}][price_data][product_data][name]`] = taxName;
        params[`line_items[${idx}][price_data][unit_amount]`] =
          args.taxAmountCents.toString();
        params[`line_items[${idx}][quantity]`] = "1";
        idx++;
      }

      // Add shipping as a line item if provided
      if (
        args.shippingRateInCents !== undefined &&
        args.shippingRateInCents > 0
      ) {
        const shippingName = args.shippingMethodName || "Shipping";
        params[`line_items[${idx}][price_data][currency]`] = "usd";
        params[`line_items[${idx}][price_data][product_data][name]`] =
          shippingName;
        params[`line_items[${idx}][price_data][unit_amount]`] =
          args.shippingRateInCents.toString();
        params[`line_items[${idx}][quantity]`] = "1";
      }

      // Use Checkout Session for better tracking
      console.log("Stripe params:", JSON.stringify(Object.keys(params)));
      const session = await stripePost("/checkout/sessions", params);
      console.log("Stripe session created:", session.id, "url:", session.url?.substring(0, 50));

      return { success: true, url: session.url, sessionId: session.id };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("createCheckoutSession error:", msg);
      return {
        success: false,
        error: msg,
      };
    }
  },
});

// ─── Legacy: keep old action name for backwards compat ──────────────────

export const createPaymentLink = action({
  args: {
    productName: v.string(),
    priceInCents: v.number(),
    quantity: v.number(),
    imageUrl: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, { productName, priceInCents, quantity, imageUrl }) => {
    return await ctx.runAction(
      // @ts-ignore
      "checkout:createCheckoutSession" as any,
      {
        items: [{ productName, priceInCents, quantity, imageUrl }],
        successUrl:
          (process.env.SITE_URL ??
            "https://preview-xi-xvi-store-b70b82f5.viktor.space") + "/orders",
        cancelUrl:
          (process.env.SITE_URL ??
            "https://preview-xi-xvi-store-b70b82f5.viktor.space") + "/cart",
      }
    );
  },
});

// ─── Printful Order Fulfillment ─────────────────────────────────────────

export const createPrintfulOrder = action({
  args: {
    recipientName: v.string(),
    address1: v.string(),
    city: v.string(),
    stateCode: v.string(),
    countryCode: v.string(),
    zip: v.string(),
    items: v.array(
      v.object({
        variantId: v.number(),
        quantity: v.number(),
      })
    ),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (_ctx, args) => {
    try {
      const orderPayload = {
        recipient: {
          name: args.recipientName,
          address1: args.address1,
          city: args.city,
          state_code: args.stateCode,
          country_code: args.countryCode,
          zip: args.zip,
          email: args.email,
          phone: args.phone,
        },
        items: args.items.map((item) => ({
          sync_variant_id: item.variantId,
          quantity: item.quantity,
        })),
      };

      const result = await printfulPost<{
        code: number;
        result: { id: number; status: string };
      }>("/orders", orderPayload);

      return { success: true, order: result.result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

// ─── Printful Shipping Rates (legacy direct) ────────────────────────────

export const calculateShipping = action({
  args: {
    address1: v.string(),
    city: v.string(),
    stateCode: v.string(),
    countryCode: v.string(),
    zip: v.string(),
    items: v.array(
      v.object({
        variantId: v.number(),
        quantity: v.number(),
      })
    ),
  },
  returns: v.any(),
  handler: async (_ctx, args) => {
    try {
      const shippingPayload = {
        recipient: {
          address1: args.address1,
          city: args.city,
          state_code: args.stateCode,
          country_code: args.countryCode,
          zip: args.zip,
        },
        items: args.items.map((item) => ({
          sync_variant_id: item.variantId,
          quantity: item.quantity,
        })),
      };

      const result = await printfulPost<{
        code: number;
        result: Array<{
          id: string;
          name: string;
          rate: string;
          currency: string;
          minDeliveryDays: number;
          maxDeliveryDays: number;
        }>;
      }>("/shipping/rates", shippingPayload);

      return { success: true, rates: result.result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

