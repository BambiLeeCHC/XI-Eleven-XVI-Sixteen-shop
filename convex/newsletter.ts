import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const subscribe = mutation({
  args: { email: v.string() },
  returns: v.string(),
  handler: async (ctx, { email }) => {
    const existing = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();

    if (existing) {
      return "already_subscribed";
    }

    await ctx.db.insert("newsletter", {
      email: email.toLowerCase(),
      subscribedAt: Date.now(),
    });
    return "subscribed";
  },
});

export const list = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await ctx.db.query("newsletter").order("desc").collect();
  },
});
