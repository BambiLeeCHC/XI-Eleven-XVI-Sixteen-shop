import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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
    });
  },
});

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

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    printfulOrderId: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { orderId, ...updates }) => {
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    await ctx.db.patch(orderId, cleanUpdates);
    return null;
  },
});

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
