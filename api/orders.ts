/**
 * Create an order.
 *
 * The browser is not allowed to write to `orders` (RLS), so this is the only
 * path in. Prices, tax and shipping are all recomputed here from the database
 * and the request's *quantities only* — a tampered client cannot buy a £98
 * dress for £1.
 */

import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  fail,
  HttpError,
  supabaseAdmin,
} from "./_lib/server.js";

type ProductRow = {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  is_active: boolean;
};

type TaxRow = { region: string; rate: number; enabled: boolean };

type IncomingItem = {
  productId: string;
  size: string;
  color?: string | null;
  quantity: number;
};

const US_STATE_FALLBACK = "US";

function newOrderId() {
  const random =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random()}`;
  return `ord_${random.replace(/-/g, "").slice(0, 24)}`;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body ?? {};
    const {
      email,
      sessionId,
      items,
      shippingCents,
      shippingMethod,
      giftMessage,
      shippingAddress,
    } = body as {
      email?: string;
      sessionId?: string;
      items?: IncomingItem[];
      shippingCents?: number;
      shippingMethod?: string;
      giftMessage?: string;
      shippingAddress?: Record<string, string>;
    };

    if (!email || !sessionId || !Array.isArray(items) || items.length === 0) {
      throw new HttpError(400, "Invalid order request");
    }
    if (!shippingAddress?.countryCode) {
      throw new HttpError(400, "A shipping address is required");
    }

    const admin = supabaseAdmin();
    const user = await currentUser(req);

    // ── Price the order from the database, never from the client ──────────
    const ids = [...new Set(items.map(item => String(item.productId)))];
    const { data: productRows, error: productError } = await admin
      .from("products")
      .select("id, name, price, images, is_active")
      .in("id", ids);
    if (productError) throw productError;

    const products = (productRows ?? []) as ProductRow[];
    const byId = new Map(products.map(p => [p.id, p]));
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = byId.get(String(item.productId));
      if (!product || !product.is_active) {
        throw new HttpError(400, "One of the items is no longer available");
      }
      const quantity = Math.max(
        1,
        Math.min(20, Math.floor(Number(item.quantity) || 1)),
      );
      subtotal += product.price * quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        size: item.size,
        color: item.color || undefined,
        quantity,
        priceAtPurchase: product.price,
        image: product.images?.[0] ?? undefined,
      });
    }

    // ── Tax, from the admin-managed table ─────────────────────────────────
    const countryCode = String(shippingAddress.countryCode).toUpperCase();
    const stateCode = shippingAddress.stateCode
      ? String(shippingAddress.stateCode).toUpperCase()
      : null;

    let taxRate = 0;
    let taxRegion: string | null = null;

    if (countryCode === US_STATE_FALLBACK && stateCode) {
      const { data: taxRow } = await admin
        .from("tax_rates")
        .select("region, rate, enabled")
        .eq("region", stateCode)
        .eq("region_type", "us_state")
        .maybeSingle();
      const data = taxRow as TaxRow | null;
      if (data?.enabled) {
        taxRate = Number(data.rate);
        taxRegion = data.region;
      }
    } else {
      const { data: taxRow } = await admin
        .from("tax_rates")
        .select("region, rate, enabled")
        .eq("region", countryCode)
        .eq("region_type", "country")
        .maybeSingle();
      const data = taxRow as TaxRow | null;
      if (data?.enabled) {
        taxRate = Number(data.rate);
        taxRegion = data.region;
      }
    }

    const tax = Math.round(subtotal * taxRate);
    const shipping = Math.max(0, Math.floor(Number(shippingCents) || 0));
    const total = subtotal + tax + shipping;

    const id = newOrderId();
    const { error: insertError } = await admin.from("orders").insert({
      id,
      user_id: user?.id ?? null,
      email: String(email).toLowerCase(),
      session_id: sessionId,
      items: orderItems,
      subtotal,
      tax,
      tax_rate: taxRate || null,
      tax_region: taxRegion,
      shipping,
      total,
      currency: "USD",
      status: "pending",
      shipping_address: shippingAddress,
      shipping_method: shippingMethod ? { name: shippingMethod } : null,
      gift_message: giftMessage ?? null,
      fulfillment_stage: "awaiting_payment",
      fulfillment_history: [
        {
          stage: "awaiting_payment",
          timestamp: Date.now(),
          note: "Order placed — awaiting payment confirmation",
        },
      ],
    });
    if (insertError) throw insertError;

    return res.status(200).json({
      success: true,
      orderId: id,
      subtotal,
      tax,
      shipping,
      total,
    });
  } catch (error) {
    return fail(res, error);
  }
}
