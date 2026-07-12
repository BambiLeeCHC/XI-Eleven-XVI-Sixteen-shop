import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ─── Auth guard helper ──────────────────────────────────────────────────

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin") throw new Error("Not authorized");
  return user;
}

// ─── Orders ─────────────────────────────────────────────────────────────

export const listOrders = query({
  args: {
    status: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);
    let orders;
    if (status) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_status", (q: any) => q.eq("status", status))
        .order("desc")
        .collect();
    } else {
      orders = await ctx.db.query("orders").order("desc").collect();
    }
    return orders;
  },
});

export const getOrder = query({
  args: { orderId: v.id("orders") },
  returns: v.any(),
  handler: async (ctx, { orderId }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(orderId);
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
    trackingUrl: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { orderId, status, trackingUrl, trackingNumber }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = { status };
    if (trackingUrl !== undefined) patch.trackingUrl = trackingUrl;
    if (trackingNumber !== undefined) patch.trackingNumber = trackingNumber;
    await ctx.db.patch(orderId, patch);
    return null;
  },
});

// ─── Products (admin) ───────────────────────────────────────────────────

export const listAllProducts = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("products").collect();
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    sizes: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    category: v.optional(v.string()),
    gender: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { productId, ...fields }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(productId, patch);
    }
    return null;
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  returns: v.null(),
  handler: async (ctx, { productId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(productId);
    return null;
  },
});

// ─── Customers / Users ──────────────────────────────────────────────────

export const listCustomers = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    // For each user, get order count
    const enriched = [];
    for (const user of users) {
      const orders = await ctx.db
        .query("orders")
        .withIndex("by_user", (q: any) => q.eq("userId", user._id))
        .collect();
      const totalSpent = orders.reduce(
        (sum: number, o: any) => sum + (o.total || 0),
        0
      );
      enriched.push({
        ...user,
        orderCount: orders.length,
        totalSpent,
        lastOrderDate: orders.length > 0 ? orders[0]._creationTime : null,
      });
    }
    return enriched;
  },
});

export const setUserRole = mutation({
  args: { userId: v.id("users"), role: v.string() },
  returns: v.null(),
  handler: async (ctx, { userId, role }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(userId, { role });
    return null;
  },
});

// ─── Newsletter ─────────────────────────────────────────────────────────

export const listSubscribers = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("newsletter").order("desc").collect();
  },
});

export const removeSubscriber = mutation({
  args: { subscriberId: v.id("newsletter") },
  returns: v.null(),
  handler: async (ctx, { subscriberId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(subscriberId);
    return null;
  },
});

// ─── CRM: Notes & Interactions ──────────────────────────────────────────

export const listCrmNotes = query({
  args: { customerId: v.id("users") },
  returns: v.any(),
  handler: async (ctx, { customerId }) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("crmNotes")
      .withIndex("by_customer", (q: any) => q.eq("customerId", customerId))
      .order("desc")
      .collect();
  },
});

export const addCrmNote = mutation({
  args: {
    customerId: v.id("users"),
    note: v.string(),
    type: v.string(), // "note", "call", "email", "issue", "follow_up"
  },
  returns: v.id("crmNotes"),
  handler: async (ctx, { customerId, note, type }) => {
    const admin = await requireAdmin(ctx);
    return await ctx.db.insert("crmNotes", {
      customerId,
      adminId: admin._id,
      adminName: admin.name || admin.email || "Admin",
      note,
      type,
      createdAt: Date.now(),
    });
  },
});

export const deleteCrmNote = mutation({
  args: { noteId: v.id("crmNotes") },
  returns: v.null(),
  handler: async (ctx, { noteId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(noteId);
    return null;
  },
});

// ─── CRM: Customer Tags ────────────────────────────────────────────────

export const updateCustomerTags = mutation({
  args: {
    customerId: v.id("users"),
    tags: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { customerId, tags }) => {
    await requireAdmin(ctx);
    // Store tags in crmProfiles table
    const existing = await ctx.db
      .query("crmProfiles")
      .withIndex("by_customer", (q: any) => q.eq("customerId", customerId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { tags });
    } else {
      await ctx.db.insert("crmProfiles", { customerId, tags });
    }
    return null;
  },
});

export const getCrmProfile = query({
  args: { customerId: v.id("users") },
  returns: v.any(),
  handler: async (ctx, { customerId }) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("crmProfiles")
      .withIndex("by_customer", (q: any) => q.eq("customerId", customerId))
      .first();
  },
});

// ─── Dashboard Stats ────────────────────────────────────────────────────

export const dashboardStats = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const orders = await ctx.db.query("orders").collect();
    const products = await ctx.db.query("products").collect();
    const users = await ctx.db.query("users").collect();
    const newsletter = await ctx.db.query("newsletter").collect();

    const paidOrders = orders.filter(
      (o: any) => o.status !== "pending" && o.status !== "cancelled"
    );
    const totalRevenue = paidOrders.reduce(
      (sum: number, o: any) => sum + (o.total || 0),
      0
    );
    const avgOrderValue =
      paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    for (const o of orders) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    }

    // Revenue by day (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const revenueByDay: Record<string, number> = {};
    for (const o of paidOrders) {
      if (o._creationTime >= thirtyDaysAgo) {
        const day = new Date(o._creationTime).toISOString().slice(0, 10);
        revenueByDay[day] = (revenueByDay[day] || 0) + (o.total || 0);
      }
    }

    // Top products by revenue
    const productRevenue: Record<string, { name: string; revenue: number; units: number }> = {};
    for (const o of paidOrders) {
      for (const item of o.items || []) {
        const key = item.productId;
        if (!productRevenue[key]) {
          productRevenue[key] = { name: item.productName, revenue: 0, units: 0 };
        }
        productRevenue[key].revenue += (item.priceAtPurchase || 0) * (item.quantity || 1);
        productRevenue[key].units += item.quantity || 1;
      }
    }
    const topProducts = Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Revenue by category
    const categoryRevenue: Record<string, number> = {};
    const productMap: Record<string, any> = {};
    for (const p of products) productMap[p._id] = p;
    for (const o of paidOrders) {
      for (const item of o.items || []) {
        const product = productMap[item.productId];
        const cat = product?.category || "Unknown";
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.priceAtPurchase || 0) * (item.quantity || 1);
      }
    }

    return {
      totalRevenue,
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      avgOrderValue,
      ordersByStatus,
      revenueByDay,
      topProducts,
      categoryRevenue,
      totalProducts: products.length,
      activeProducts: products.filter((p: any) => p.isActive).length,
      totalCustomers: users.length,
      newsletterSubscribers: newsletter.length,
    };
  },
});
