import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get all drape image URLs for a given product slug.
 * Returns a map of key → URL for efficient lookup in the component.
 */
export const getByProduct = query({
  args: { productSlug: v.string() },
  returns: v.any(),
  handler: async (ctx, { productSlug }) => {
    const images = await ctx.db
      .query("drapeImages")
      .withIndex("by_product", (q) => q.eq("productSlug", productSlug))
      .collect();

    const result: Record<string, string> = {};
    for (const img of images) {
      const url = await ctx.storage.getUrl(img.storageId);
      if (url) {
        result[img.key] = url;
      }
    }
    return result;
  },
});

/**
 * Get a single drape image URL by key.
 */
export const getByKey = query({
  args: { key: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { key }) => {
    const img = await ctx.db
      .query("drapeImages")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (!img) return null;
    return await ctx.storage.getUrl(img.storageId);
  },
});

/**
 * Register a drape image after uploading to storage.
 */
export const register = mutation({
  args: {
    key: v.string(),
    storageId: v.id("_storage"),
    imageType: v.string(),
    productSlug: v.string(),
    archetype: v.optional(v.string()),
    size: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  returns: v.id("drapeImages"),
  handler: async (ctx, args) => {
    // Upsert: delete existing with same key first
    const existing = await ctx.db
      .query("drapeImages")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      // Delete old storage blob
      try { await ctx.storage.delete(existing.storageId); } catch {}
      await ctx.db.delete(existing._id);
    }
    return await ctx.db.insert("drapeImages", args);
  },
});

/**
 * Batch register multiple drape images.
 */
export const batchRegister = mutation({
  args: {
    images: v.array(
      v.object({
        key: v.string(),
        storageId: v.id("_storage"),
        imageType: v.string(),
        productSlug: v.string(),
        archetype: v.optional(v.string()),
        size: v.optional(v.string()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
      })
    ),
  },
  returns: v.number(),
  handler: async (ctx, { images }) => {
    let count = 0;
    for (const img of images) {
      const existing = await ctx.db
        .query("drapeImages")
        .withIndex("by_key", (q) => q.eq("key", img.key))
        .unique();
      if (existing) {
        try { await ctx.storage.delete(existing.storageId); } catch {}
        await ctx.db.delete(existing._id);
      }
      await ctx.db.insert("drapeImages", img);
      count++;
    }
    return count;
  },
});
