import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin") throw new Error("Not authorized");
}

export const getLanding = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", "landing"))
      .unique();
  },
});

export const saveLanding = mutation({
  args: { value: v.any() },
  returns: v.null(),
  handler: async (ctx, { value }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", "landing"))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("siteContent", {
        key: "landing",
        value,
        updatedAt: Date.now(),
      });
    }
    return null;
  },
});
