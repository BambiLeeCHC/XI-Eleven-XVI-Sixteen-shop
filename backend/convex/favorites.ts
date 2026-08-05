import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const favs = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    // Return full product data
    const results = [];
    for (const fav of favs) {
      const product = await ctx.db.get(fav.productId);
      if (product && product.isActive) {
        results.push({ ...fav, product });
      }
    }
    return results;
  },
});

export const getIds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const favs = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return favs.map((f) => f.productId);
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const favs = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return favs.length;
  },
});

export const toggle = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in to favorite items");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", productId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { action: "removed" as const };
    } else {
      await ctx.db.insert("favorites", {
        userId,
        productId,
        addedAt: Date.now(),
      });
      return { action: "added" as const };
    }
  },
});
