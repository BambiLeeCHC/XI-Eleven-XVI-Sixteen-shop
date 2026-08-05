import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ─── Auth guard ─────────────────────────────────────────────────────────

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin") throw new Error("Not authorized");
  return user;
}

// ─── Default shipping config ────────────────────────────────────────────

const DEFAULTS: Record<string, string> = {
  free_standard: "true",
  standard_label: "Standard Shipping",
  show_expedited: "true",
  fulfillment_min_days: "2",
  fulfillment_max_days: "5",
  free_shipping_message: "✦ FREE standard shipping on every order ✦",
};

// ─── Get a shipping setting (public) ────────────────────────────────────

export const getSetting = query({
  args: { key: v.string() },
  returns: v.any(),
  handler: async (ctx, { key }) => {
    const setting = await ctx.db
      .query("shippingSettings")
      .withIndex("by_key", (q: any) => q.eq("key", key))
      .first();
    return setting?.value ?? DEFAULTS[key] ?? null;
  },
});

// ─── Get all shipping settings (public for checkout display) ────────────

export const getAll = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const settings = await ctx.db.query("shippingSettings").collect();
    const result: Record<string, string> = { ...DEFAULTS };
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  },
});

// ─── Admin: list all settings ───────────────────────────────────────────

export const listSettings = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const settings = await ctx.db.query("shippingSettings").collect();
    const result: Record<string, string> = { ...DEFAULTS };
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  },
});

// ─── Admin: upsert a setting ────────────────────────────────────────────

export const upsertSetting = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { key, value }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("shippingSettings")
      .withIndex("by_key", (q: any) => q.eq("key", key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("shippingSettings", { key, value, updatedAt: Date.now() });
    }
    return null;
  },
});
