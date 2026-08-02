import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

// NOTE: this file previously also exported `listAll` (query) and
// `setRoleAction` (action) with no auth check at all — meaning anyone who
// knew the Convex deployment URL could list every user's email/role, or
// grant themselves admin, via the public HTTP API. Both were dead code
// (unused by the frontend, which already uses the properly admin-gated
// `admin.listCustomers` / `admin.setUserRole` for this), so they were
// removed rather than patched. If a "list/manage users" admin helper is
// needed again, use `admin.ts`'s `requireAdmin()` guard pattern.

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    return user?.role === "admin";
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const authAccounts = await ctx.db
      .query("authAccounts")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
    for (const account of authAccounts) {
      await ctx.db.delete(account._id);
    }

    const authSessions = await ctx.db
      .query("authSessions")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
    for (const session of authSessions) {
      await ctx.db.delete(session._id);
    }

    await ctx.db.delete(userId);

    return { success: true };
  },
});
