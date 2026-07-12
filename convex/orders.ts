import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

// ─── Auth guard ─────────────────────────────────────────────────────────

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin") throw new Error("Not authorized");
  return user;
}

// ─── Create order ───────────────────────────────────────────────────────

export const create = mutation({
  args: {
    email: v.string(),
    sessionId: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        size: v.string(),
        quantity: v.number(),
        priceAtPurchase: v.number(),
        image: v.optional(v.string()),
      })
    ),
    subtotal: v.number(),
    tax: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    taxRegion: v.optional(v.string()),
    shipping: v.number(),
    total: v.number(),
    currency: v.string(),
    shippingMethod: v.optional(v.string()),
    shippingAddress: v.optional(
      v.object({
        name: v.string(),
        address1: v.string(),
        address2: v.optional(v.string()),
        city: v.string(),
        stateCode: v.string(),
        countryCode: v.string(),
        zip: v.string(),
        phone: v.optional(v.string()),
      })
    ),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("orders", {
      ...args,
      userId: userId ?? undefined,
      status: "pending",
      fulfillmentStage: "payment_received",
      fulfillmentHistory: [
        {
          stage: "payment_received",
          timestamp: Date.now(),
          note: "Order placed — awaiting payment confirmation",
        },
      ],
    });
  },
});

// ─── List by user ───────────────────────────────────────────────────────

export const listByUser = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ─── List by session ────────────────────────────────────────────────────

export const listBySession = query({
  args: { sessionId: v.string() },
  returns: v.any(),
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .collect();
  },
});

// ─── Update status ──────────────────────────────────────────────────────

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    printfulOrderId: v.optional(v.string()),
    printfulStatus: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    trackingCarrier: v.optional(v.string()),
    fulfillmentStage: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { orderId, ...updates }) => {
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    // Add to fulfillment history if stage changed
    if (updates.fulfillmentStage && updates.fulfillmentStage !== order.fulfillmentStage) {
      const history = order.fulfillmentHistory ?? [];
      history.push({
        stage: updates.fulfillmentStage,
        timestamp: Date.now(),
        note: getFulfillmentNote(updates.fulfillmentStage),
      });
      cleanUpdates.fulfillmentHistory = history;
    }

    await ctx.db.patch(orderId, cleanUpdates);
    return null;
  },
});

function getFulfillmentNote(stage: string): string {
  switch (stage) {
    case "payment_received": return "Payment confirmed";
    case "sent_to_printful": return "Order sent to production partner";
    case "printful_processing": return "Your piece is being crafted — made exclusively for you";
    case "printful_fulfilled": return "Production complete — preparing for shipment";
    case "shipped": return "On its way to you";
    case "delivered": return "Delivered — enjoy your one-of-a-kind piece";
    default: return stage;
  }
}

// ─── Get by Stripe session ──────────────────────────────────────────────

export const getByStripeSession = query({
  args: { stripeCheckoutSessionId: v.string() },
  returns: v.any(),
  handler: async (ctx, { stripeCheckoutSessionId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_stripe_session", (q) => q.eq("stripeCheckoutSessionId", stripeCheckoutSessionId))
      .first();
  },
});

// ─── Admin: list all orders ─────────────────────────────────────────────

export const listAll = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("orders").order("desc").collect();
  },
});

// ─── Internal: update fulfillment stage ─────────────────────────────────

export const updateFulfillmentStage = internalMutation({
  args: {
    orderId: v.id("orders"),
    stage: v.string(),
    note: v.optional(v.string()),
    printfulOrderId: v.optional(v.string()),
    printfulStatus: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    trackingCarrier: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const history = order.fulfillmentHistory ?? [];
    history.push({
      stage: args.stage,
      timestamp: Date.now(),
      note: args.note ?? getFulfillmentNote(args.stage),
    });

    const updates: Record<string, unknown> = {
      fulfillmentStage: args.stage,
      fulfillmentHistory: history,
    };

    // Map stage to order status
    if (args.stage === "shipped") updates.status = "shipped";
    else if (args.stage === "delivered") updates.status = "delivered";
    else if (args.stage === "printful_processing" || args.stage === "sent_to_printful") updates.status = "fulfilled";

    if (args.printfulOrderId) updates.printfulOrderId = args.printfulOrderId;
    if (args.printfulStatus) updates.printfulStatus = args.printfulStatus;
    if (args.trackingUrl) updates.trackingUrl = args.trackingUrl;
    if (args.trackingNumber) updates.trackingNumber = args.trackingNumber;
    if (args.trackingCarrier) updates.trackingCarrier = args.trackingCarrier;

    await ctx.db.patch(args.orderId, updates);
    return null;
  },
});

// ─── Fulfill order via Printful (triggered after payment) ───────────────

export const fulfillWithPrintful = action({
  args: { orderId: v.id("orders") },
  returns: v.any(),
  handler: async (ctx, { orderId }) => {
    // Get order details
    const order: any = await ctx.runQuery(api.orders.getById as any, { orderId });
    if (!order) return { success: false, error: "Order not found" };
    if (order.printfulOrderId) return { success: false, error: "Already sent to Printful" };

    const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY!;
    const addr = order.shippingAddress;
    if (!addr) return { success: false, error: "No shipping address" };

    // Build Printful order items from cart items (need sync_variant_ids)
    const printfulItems: Array<{ sync_variant_id: number; quantity: number }> = [];
    for (const item of order.items) {
      // Look up product for variant info
      const product: any = await ctx.runQuery(api.orders.getProduct as any, { productId: item.productId });
      if (!product?.printfulVariants) continue;

      const pureSize = item.size.includes(" / ") ? item.size.split(" / ").pop()! : item.size;
      const variant = (product.printfulVariants as any[]).find((v: any) => v.size === pureSize);
      if (variant) {
        printfulItems.push({
          sync_variant_id: Math.round(variant.id),
          quantity: item.quantity,
        });
      }
    }

    if (printfulItems.length === 0) {
      return { success: false, error: "No Printful variants found for order items" };
    }

    try {
      // Update stage: sent_to_printful
      await ctx.runMutation(internal.orders.updateFulfillmentStage, {
        orderId,
        stage: "sent_to_printful",
        note: "Submitting order to production",
      });

      // Create Printful order
      const response = await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PRINTFUL_API_KEY}`,
          "Content-Type": "application/json",
          "X-PF-Store-Id": "17855930",
        },
        body: JSON.stringify({
          recipient: {
            name: addr.name,
            address1: addr.address1,
            address2: addr.address2 || undefined,
            city: addr.city,
            state_code: addr.stateCode,
            country_code: addr.countryCode,
            zip: addr.zip,
            email: order.email,
            phone: addr.phone || undefined,
          },
          items: printfulItems,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        await ctx.runMutation(internal.orders.updateFulfillmentStage, {
          orderId,
          stage: "payment_received",
          note: `Printful order failed: ${errText.substring(0, 200)}`,
        });
        return { success: false, error: `Printful error: ${errText}` };
      }

      const data = await response.json();
      const pfOrder = data.result;

      // Update stage: printful_processing
      await ctx.runMutation(internal.orders.updateFulfillmentStage, {
        orderId,
        stage: "printful_processing",
        printfulOrderId: String(pfOrder.id),
        printfulStatus: pfOrder.status,
        note: `Printful order #${pfOrder.id} created — production started`,
      });

      return { success: true, printfulOrderId: pfOrder.id, status: pfOrder.status };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: msg };
    }
  },
});

// ─── Internal queries for fulfillment action ────────────────────────────

export const getById = query({
  args: { orderId: v.id("orders") },
  returns: v.any(),
  handler: async (ctx, { orderId }) => {
    return await ctx.db.get(orderId);
  },
});

export const getProduct = query({
  args: { productId: v.id("products") },
  returns: v.any(),
  handler: async (ctx, { productId }) => {
    return await ctx.db.get(productId);
  },
});
