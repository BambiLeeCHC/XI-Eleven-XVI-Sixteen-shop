import { v } from "convex/values";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

declare const process: { env: Record<string, string | undefined> };

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.runQuery(internal.crmEmail.getUserInternal, { userId });
  if (user?.role !== "admin") throw new Error("Not authorized");
  return user;
}

export const getUserInternal = internalQuery({
  args: { userId: v.id("users") },
  returns: v.any(),
  handler: async (ctx, { userId }) => await ctx.db.get(userId),
});

export const listForCustomer = query({
  args: { customerId: v.id("users") },
  returns: v.any(),
  handler: async (ctx, { customerId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Not authorized");
    return await ctx.db.query("crmEmails")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .order("desc")
      .collect();
  },
});

export const recordEmail = internalMutation({
  args: {
    customerId: v.id("users"), adminId: v.id("users"), to: v.string(),
    subject: v.string(), body: v.string(), status: v.string(),
    providerId: v.optional(v.string()), error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("crmEmails", {
      ...args,
      from: "XI · XVI Support <support@xixvi.shop>",
      sentAt: Date.now(),
    });
    return null;
  },
});

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character] || character);

export const send = action({
  args: {
    customerId: v.id("users"),
    to: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("CRM email is not connected yet: RESEND_API_KEY is missing.");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "XI · XVI Support <support@xixvi.shop>",
        reply_to: "support@xixvi.shop",
        to: [args.to],
        subject: args.subject,
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#171717;line-height:1.6"><div style="font-size:12px;letter-spacing:.18em;color:#9a7b2f;margin-bottom:24px">XI · XVI SUPPORT</div><div>${escapeHtml(args.body).replace(/\n/g, "<br>")}</div><hr style="border:0;border-top:1px solid #eee;margin:32px 0"><p style="font-size:12px;color:#777">Reply directly to this email to reach support@xixvi.shop.</p></div>`,
        text: args.body,
      }),
    });
    const result = await response.json().catch(() => ({})) as any;
    if (!response.ok) {
      const error = result?.message || `Email provider returned ${response.status}`;
      await ctx.runMutation(internal.crmEmail.recordEmail, { ...args, adminId: admin._id, status: "failed", error });
      throw new Error(error);
    }
    await ctx.runMutation(internal.crmEmail.recordEmail, { ...args, adminId: admin._id, status: "sent", providerId: result.id });
    return { success: true, id: result.id };
  },
});
