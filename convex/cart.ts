import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getItems = query({
  args: { sessionId: v.string() },
  returns: v.any(),
  handler: async (ctx, { sessionId }) => {
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();

    // Enrich with product data
    const enriched = [];
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (product && product.isActive) {
        enriched.push({
          ...item,
          product,
        });
      }
    }
    return enriched;
  },
});

export const getCount = query({
  args: { sessionId: v.string() },
  returns: v.number(),
  handler: async (ctx, { sessionId }) => {
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
});

export const addItem = mutation({
  args: {
    sessionId: v.string(),
    productId: v.id("products"),
    size: v.string(),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { sessionId, productId, size, quantity }) => {
    // Check if item already exists with same size
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_session_product_size", (q) =>
        q.eq("sessionId", sessionId).eq("productId", productId).eq("size", size)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + quantity,
      });
    } else {
      await ctx.db.insert("cartItems", {
        sessionId,
        productId,
        size,
        quantity,
      });
    }
    return null;
  },
});

export const updateQuantity = mutation({
  args: {
    itemId: v.id("cartItems"),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { itemId, quantity }) => {
    if (quantity <= 0) {
      await ctx.db.delete(itemId);
    } else {
      await ctx.db.patch(itemId, { quantity });
    }
    return null;
  },
});

export const removeItem = mutation({
  args: { itemId: v.id("cartItems") },
  returns: v.null(),
  handler: async (ctx, { itemId }) => {
    await ctx.db.delete(itemId);
    return null;
  },
});

export const clearCart = mutation({
  args: { sessionId: v.string() },
  returns: v.null(),
  handler: async (ctx, { sessionId }) => {
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    return null;
  },
});
