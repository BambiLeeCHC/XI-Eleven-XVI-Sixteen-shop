/**
 * Send a paid order to Printful for production.
 *
 * Deliberately all-or-nothing: if any line cannot be resolved to a Printful
 * sync variant the order is left flagged for a human instead of being shipped
 * half-complete or in the wrong colourway.
 */

import {
  HttpError,
  printfulRequest,
  supabaseAdmin,
  updateOrder,
} from "./server.js";
import { matchVariant, type PrintfulVariant } from "./variantMatch.js";

export async function submitOrderToPrintful(orderId: string) {
  const admin = supabaseAdmin();

  const { data: order, error } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  if (!order) throw new HttpError(404, "Order not found");
  if (order.printful_order_id) {
    return { success: false, error: "Already sent to Printful" };
  }

  const address = order.shipping_address as Record<string, string> | null;
  if (!address) return { success: false, error: "No shipping address" };

  const items = (order.items ?? []) as Array<{
    productId: string;
    productName: string;
    size: string;
    color?: string | null;
    quantity: number;
  }>;

  const ids = [...new Set(items.map(item => item.productId))];
  const { data: products } = await admin
    .from("products")
    .select("id, printful_variants")
    .in("id", ids);
  const variantsById = new Map(
    (products ?? []).map(p => [
      p.id,
      p.printful_variants as PrintfulVariant[] | null,
    ]),
  );

  const printfulItems: Array<{ sync_variant_id: number; quantity: number }> =
    [];
  const unresolved: string[] = [];

  for (const item of items) {
    const match = matchVariant(
      variantsById.get(item.productId) ?? null,
      item.size,
      item.color,
    );
    if (match) {
      printfulItems.push({
        sync_variant_id: Math.round(match.id),
        quantity: item.quantity,
      });
    } else {
      unresolved.push(
        `${item.productName} (${[item.color, item.size].filter(Boolean).join(" / ")})`,
      );
    }
  }

  if (unresolved.length > 0 || printfulItems.length === 0) {
    const reason =
      unresolved.length > 0
        ? `No Printful variant for: ${unresolved.join(", ")}`
        : "No Printful variants found for order items";
    await updateOrder(orderId, { fulfillment_exception: reason.slice(0, 300) });
    return { success: false, error: reason };
  }

  await updateOrder(
    orderId,
    {},
    { stage: "sent_to_printful", note: "Submitting order to production" },
  );

  try {
    const data = await printfulRequest<{
      result: { id: number; status: string };
    }>("/orders", {
      method: "POST",
      body: {
        external_id: String(orderId),
        confirm: true,
        recipient: {
          name: address.name,
          address1: address.address1,
          address2: address.address2 || undefined,
          city: address.city,
          state_code: address.stateCode,
          country_code: address.countryCode,
          zip: address.zip,
          email: order.email,
          phone: address.phone || undefined,
        },
        items: printfulItems,
        packing_slip: {
          email: "support@xixvi.shop",
          message:
            order.gift_message || "Made exclusively for you by XI · XVI.",
          logo_url: "https://xixvi.shop/icon-512.png",
          store_name: "XI · XVI",
          custom_order_id: String(orderId).slice(-8).toUpperCase(),
        },
      },
    });

    const printfulOrder = data.result;
    await updateOrder(
      orderId,
      {
        printful_order_id: String(printfulOrder.id),
        printful_status: printfulOrder.status,
        status: "fulfilled",
      },
      {
        stage: "printful_processing",
        note: `Printful order #${printfulOrder.id} created — production started`,
      },
    );

    return {
      success: true,
      printfulOrderId: printfulOrder.id,
      status: printfulOrder.status,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateOrder(
      orderId,
      { fulfillment_exception: message.slice(0, 300) },
      {
        stage: "payment_received",
        note: `Printful order failed: ${message.slice(0, 200)}`,
      },
    );
    return { success: false, error: message };
  }
}
