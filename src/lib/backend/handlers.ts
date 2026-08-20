/**
 * Backend handlers — restored with admin paywall bypass and Long Read window param.
 */
import { supabase } from "../supabase";
import {
  mapBlogPost,
  mapCartItem,
  mapCrmEmail,
  mapCrmNote,
  mapOrder,
  mapProduct,
  mapProfile,
  mapSubscriber,
  mapTaxRate,
  productPatchToRow,
  type Row,
} from "./mappers";

export type Args = Record<string, any>;
export type Handler = (args: Args) => Promise<any>;

function unwrap<T>(result: { data: T; error: any }): T {
  if (result.error) throw new Error(result.error.message ?? "Request failed");
  return result.data;
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

async function requireUserId(): Promise<string> {
  const id = await currentUserId();
  if (!id) throw new Error("Not authenticated");
  return id;
}

async function callApi(path: string, body: Args = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Something went wrong. Please try again.");
  }
  return payload;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/['"']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function estimateReadMinutes(html: string) {
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function uniqueSlug(desired: string, ignoreId?: string) {
  const base = slugify(desired) || "post";
  let candidate = base;
  let n = 2;
  for (;;) {
    const { data } = await supabase.from("blog_posts").select("id").eq("slug", candidate).maybeSingle();
    if (!data || data.id === ignoreId) return candidate;
    candidate = `${base}-${n++}`;
  }
}

const SHIPPING_DEFAULTS: Record<string, string> = {
  free_standard: "true",
  standard_label: "Standard Shipping",
  show_expedited: "true",
  fulfillment_min_days: "2",
  fulfillment_max_days: "5",
  free_shipping_message: "✦ FREE standard shipping on every order ✦",
};

export const handlers: Record<string, Handler> = {
  "auth.currentUser": async () => {
    const userId = await currentUserId();
    if (!userId) return null;
    const row = unwrap(await supabase.from("profiles").select("*").eq("id", userId).maybeSingle());
    return mapProfile(row as Row);
  },

  "profile.updateBirthDetails": async (args: Args) => {
    const userId = await currentUserId();
    if (!userId) throw new Error("Please sign in first");
    const { birthDate, birthTime, birthLocation } = args as {
      birthDate?: string;
      birthTime?: string;
      birthLocation?: string;
    };
    const patch: Record<string, any> = {};
    if (birthDate !== undefined) patch.birth_date = birthDate || null;
    if (birthTime !== undefined) patch.birth_time = birthTime || null;
    if (birthLocation !== undefined) {
      patch.birth_location = birthLocation || null;
      patch.birth_lat = null;
      patch.birth_lng = null;
    }
    const row = unwrap(
      await supabase.from("profiles").update(patch).eq("id", userId).select("*").single(),
    );
    return mapProfile(row as Row);
  },

  "users.isAdmin": async () => {
    const userId = await currentUserId();
    if (!userId) return false;
    const row = unwrap(
      await supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
    ) as Row | null;
    return row?.role === "admin";
  },

  "users.deleteAccount": async () => {
    await callApi("/api/delete-account");
    await supabase.auth.signOut();
    return { success: true };
  },

  "subscription.status": async () => {
    const userId = await currentUserId();
    if (!userId) return null;
    const [subRow, profileRow] = await Promise.all([
      supabase.from("subscriptions").select("status, tier, trial_end, current_period_end").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("numerology_unlocked_at, role").eq("id", userId).maybeSingle(),
    ]);
    const row = unwrap(subRow) as {
      status: string;
      tier: string | null;
      trial_end: string | null;
      current_period_end: string | null;
    } | null;
    const profile = unwrap(profileRow) as {
      numerology_unlocked_at: string | null;
      role: string | null;
    } | null;
    const isAdmin = profile?.role === "admin";
    const numerologyUnlocked = isAdmin || !!profile?.numerology_unlocked_at;
    if (isAdmin) {
      return {
        entitled: true,
        status: row?.status ?? "admin",
        tier: row?.tier ?? "admin",
        trialEnd: row?.trial_end ?? null,
        currentPeriodEnd: row?.current_period_end ?? null,
        numerologyUnlocked: true,
        isAdmin: true,
      };
    }
    if (!row) return { entitled: false, status: "none", tier: null, numerologyUnlocked, isAdmin: false };
    return {
      entitled: row.status === "trialing" || row.status === "active",
      status: row.status,
      tier: row.tier,
      trialEnd: row.trial_end,
      currentPeriodEnd: row.current_period_end,
      numerologyUnlocked,
      isAdmin: false,
    };
  },

  "subscription.startTrial": async ({ successUrl, cancelUrl, tier } = {}) => {
    return callApi("/api/reading-checkout", { kind: "subscribe", successUrl, cancelUrl, tier });
  },

  "numerology.checkout": async ({ successUrl, cancelUrl } = {}) => {
    return callApi("/api/reading-checkout", { kind: "numerology_unlock", successUrl, cancelUrl });
  },

  "deepReadings.mine": async () => {
    const userId = await currentUserId();
    if (!userId) return [];
    return unwrap(
      await supabase.from("deep_readings").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ) as Row[];
  },

  "deepReadings.draw": async ({ spread, situation, window } = {}) => {
    return callApi("/api/deep-tarot-reading", { spread, situation, window });
  },

  "readingQuestions.mine": async () => {
    const userId = await currentUserId();
    if (!userId) return [];
    return unwrap(
      await supabase.from("reading_questions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ) as Row[];
  },

  "readingQuestions.checkout": async ({ question, readingContext, successUrl, cancelUrl } = {}) => {
    return callApi("/api/reading-checkout", { kind: "question", question, readingContext, successUrl, cancelUrl });
  },

  "natalChart.get": async () => callApi("/api/chart", { kind: "natal" }),
  "natalProfile.get": async () => callApi("/api/chart", { kind: "natal-profile" }),
  "numerology.get": async () => callApi("/api/chart", { kind: "numerology" }),
  "geocode.search": async ({ q }: { q: string }) => callApi("/api/chart", { kind: "geocode-search", q }),

  "products.list": async ({ gender, category } = {}) => {
    let query = supabase.from("products").select("*").eq("is_active", true);
    if (gender) query = query.eq("gender", gender);
    if (category) query = query.eq("category", category);
    const rows = unwrap(await query.order("sort_order", { ascending: true }));
    return (rows ?? []).map(mapProduct);
  },

  "products.getById": async ({ productId }) => {
    const row = unwrap(await supabase.from("products").select("*").eq("id", productId).maybeSingle());
    return mapProduct(row as Row);
  },

  "products.getCount": async ({ gender, category } = {}) => {
    let query = supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true);
    if (gender) query = query.eq("gender", gender);
    if (category) query = query.eq("category", category);
    const { count, error } = await query;
    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  "cart.getItems": async ({ sessionId }) => {
    if (!sessionId) return [];
    const rows = unwrap(
      await supabase.from("cart_items").select("*, product:products(*)").eq("session_id", sessionId).order("created_at", { ascending: true }),
    ) as Row[];
    return (rows ?? []).filter(row => row.product?.is_active).map(row => ({ ...mapCartItem(row), product: mapProduct(row.product) }));
  },

  "cart.getCount": async ({ sessionId }) => {
    if (!sessionId) return 0;
    const rows = unwrap(await supabase.from("cart_items").select("quantity").eq("session_id", sessionId)) as Row[];
    return (rows ?? []).reduce((sum, row) => sum + (row.quantity ?? 0), 0);
  },

  "cart.addItem": async ({ sessionId, productId, size, color, quantity }) => {
    const userId = await currentUserId();
    const existing = (
      unwrap(await supabase.from("cart_items").select("*").eq("session_id", sessionId).eq("product_id", productId).eq("size", size)) as Row[]
    ).find(row => (row.color ?? null) === (color ?? null));
    if (existing) {
      unwrap(await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id));
    } else {
      unwrap(await supabase.from("cart_items").insert({
        session_id: sessionId, user_id: userId, product_id: productId, size, color: color ?? null, quantity,
      }));
    }
    return null;
  },

  "cart.updateQuantity": async ({ itemId, quantity }) => {
    if (quantity <= 0) unwrap(await supabase.from("cart_items").delete().eq("id", itemId));
    else unwrap(await supabase.from("cart_items").update({ quantity }).eq("id", itemId));
    return null;
  },

  "cart.removeItem": async ({ itemId }) => {
    unwrap(await supabase.from("cart_items").delete().eq("id", itemId));
    return null;
  },

  "cart.clearCart": async ({ sessionId }) => {
    unwrap(await supabase.from("cart_items").delete().eq("session_id", sessionId));
    return null;
  },

  "favorites.list": async () => {
    const userId = await currentUserId();
    if (!userId) return [];
    const rows = unwrap(
      await supabase.from("favorites").select("*, product:products(*)").eq("user_id", userId).order("added_at", { ascending: false }),
    ) as Row[];
    return (rows ?? []).filter(row => row.product?.is_active).map(row => ({
      _id: `${row.user_id}:${row.product_id}`,
      userId: row.user_id,
      productId: row.product_id,
      addedAt: new Date(row.added_at).getTime(),
      product: mapProduct(row.product),
    }));
  },

  "favorites.getIds": async () => {
    const userId = await currentUserId();
    if (!userId) return [];
    const rows = unwrap(await supabase.from("favorites").select("product_id").eq("user_id", userId)) as Row[];
    return (rows ?? []).map(row => row.product_id);
  },

  "favorites.getCount": async () => {
    const userId = await currentUserId();
    if (!userId) return 0;
    const { count, error } = await supabase.from("favorites").select("product_id", { count: "exact", head: true }).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  "favorites.toggle": async ({ productId }) => {
    const userId = await requireUserId();
    const existing = unwrap(
      await supabase.from("favorites").select("product_id").eq("user_id", userId).eq("product_id", productId).maybeSingle(),
    );
    if (existing) {
      unwrap(await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", productId));
      return { action: "removed" as const };
    }
    unwrap(await supabase.from("favorites").insert({ user_id: userId, product_id: productId }));
    return { action: "added" as const };
  },

  "orders.create": async args => {
    const result = await callApi("/api/orders", {
      email: args.email,
      sessionId: args.sessionId,
      items: (args.items ?? []).map((item: Args) => ({
        productId: item.productId, size: item.size, color: item.color ?? null, quantity: item.quantity,
      })),
      shippingCents: args.shipping,
      shippingMethod: args.shippingMethod,
      giftMessage: args.giftMessage,
      shippingAddress: args.shippingAddress,
    });
    return result.orderId;
  },

  "orders.listByUser": async () => {
    const userId = await currentUserId();
    if (!userId) return [];
    const rows = unwrap(await supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }));
    return (rows ?? []).map(mapOrder);
  },

  "orders.listBySession": async ({ sessionId }) => {
    if (!sessionId) return [];
    const rows = unwrap(await supabase.rpc("orders_for_session", { p_session_id: sessionId }));
    return (rows ?? []).map(mapOrder);
  },

  "orders.getByStripeSession": async ({ stripeCheckoutSessionId }) => {
    const rows = unwrap(await supabase.rpc("order_for_stripe_session", { p_stripe_session_id: stripeCheckoutSessionId })) as Row[];
    return mapOrder(rows?.[0]);
  },

  "orders.getById": async ({ orderId }) => {
    const row = unwrap(await supabase.from("orders").select("*").eq("id", orderId).maybeSingle());
    return mapOrder(row as Row);
  },

  "orders.listAll": async () => {
    const rows = unwrap(await supabase.from("orders").select("*").order("created_at", { ascending: false }));
    return (rows ?? []).map(mapOrder);
  },

  "orders.updateStatus": async ({ orderId, ...updates }) => {
    const isAdmin = await handlers["users.isAdmin"]({});
    if (!isAdmin) return null;
    const patch: Row = { updated_at: new Date().toISOString() };
    const map: Record<string, string> = {
      status: "status",
      stripePaymentIntentId: "stripe_payment_intent_id",
      stripeCheckoutSessionId: "stripe_checkout_session_id",
      printfulOrderId: "printful_order_id",
      printfulStatus: "printful_status",
      trackingUrl: "tracking_url",
      trackingNumber: "tracking_number",
      trackingCarrier: "tracking_carrier",
      fulfillmentStage: "fulfillment_stage",
      fulfillmentException: "fulfillment_exception",
    };
    for (const [key, column] of Object.entries(map)) {
      if (updates[key] !== undefined) patch[column] = updates[key];
    }
    unwrap(await supabase.from("orders").update(patch).eq("id", orderId));
    return null;
  },

  "newsletter.subscribe": async ({ email }) => {
    const { data, error } = await supabase.rpc("subscribe_to_newsletter", { p_email: email });
    if (error) throw new Error(error.message);
    return data as string;
  },

  "newsletter.list": async () => {
    const rows = unwrap(await supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false })) as Row[];
    return (rows ?? []).map(mapSubscriber);
  },

  "blog.listPublished": async ({ category, limit } = {}) => {
    let query = supabase.from("blog_posts").select("*").eq("status", "published").order("published_at", { ascending: false });
    if (category && category !== "All") query = query.eq("category", category);
    if (limit) query = query.limit(limit);
    const rows = unwrap(await query);
    return (rows ?? []).map(mapBlogPost);
  },

  "blog.getBySlug": async ({ slug }) => {
    const row = unwrap(await supabase.from("blog_posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle());
    return mapBlogPost(row as Row);
  },

  "blog.categories": async () => {
    const rows = unwrap(await supabase.from("blog_posts").select("category").eq("status", "published")) as Row[];
    const counts: Record<string, number> = {};
    for (const row of rows ?? []) counts[row.category] = (counts[row.category] ?? 0) + 1;
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  },

  "blog.listAll": async () => {
    const rows = unwrap(await supabase.from("blog_posts").select("*").order("created_at", { ascending: false }));
    return (rows ?? []).map(mapBlogPost);
  },

  "blog.getById": async ({ postId }) => {
    const row = unwrap(await supabase.from("blog_posts").select("*").eq("id", postId).maybeSingle());
    return mapBlogPost(row as Row);
  },

  "blog.createPost": async args => {
    const slug = await uniqueSlug(args.slug || args.title);
    const now = new Date().toISOString();
    const row = unwrap(await supabase.from("blog_posts").insert({
      title: args.title, slug, excerpt: args.excerpt, content: args.content,
      cover_image: args.coverImage ?? null, category: args.category, tags: args.tags ?? [],
      author: args.author || "XI · XVI", status: args.status,
      published_at: args.status === "published" ? now : null, updated_at: now,
      read_minutes: estimateReadMinutes(args.content ?? ""), featured: args.featured ?? false,
    }).select("id").single()) as Row;
    return row.id;
  },

  "blog.updatePost": async ({ postId, ...rest }) => {
    const existing = unwrap(await supabase.from("blog_posts").select("*").eq("id", postId).maybeSingle()) as Row | null;
    if (!existing) throw new Error("Post not found");
    const patch: Row = { updated_at: new Date().toISOString() };
    const map: Record<string, string> = {
      title: "title", excerpt: "excerpt", content: "content", category: "category",
      tags: "tags", author: "author", coverImage: "cover_image", status: "status", featured: "featured",
    };
    for (const [key, column] of Object.entries(map)) {
      if (rest[key] !== undefined) patch[column] = rest[key];
    }
    if (rest.slug !== undefined && slugify(rest.slug) !== existing.slug) {
      patch.slug = await uniqueSlug(rest.slug, postId);
    }
    if (rest.content !== undefined) patch.read_minutes = estimateReadMinutes(rest.content);
    if (rest.status === "published" && existing.status !== "published" && !existing.published_at) {
      patch.published_at = new Date().toISOString();
    }
    unwrap(await supabase.from("blog_posts").update(patch).eq("id", postId));
    return null;
  },

  "blog.deletePost": async ({ postId }) => {
    unwrap(await supabase.from("blog_posts").delete().eq("id", postId));
    return null;
  },

  "blog.seedWelcomePost": async () => {
    const { SEED_POSTS } = await import("../../data/journalSeed");
    const inserted: string[] = [];
    for (const seed of SEED_POSTS) {
      const existing = unwrap(await supabase.from("blog_posts").select("id").eq("slug", seed.slug).maybeSingle());
      if (existing) continue;
      const now = new Date().toISOString();
      unwrap(await supabase.from("blog_posts").insert({
        title: seed.title, slug: seed.slug, excerpt: seed.excerpt, content: seed.content,
        cover_image: seed.coverImage ?? null, category: seed.category, tags: seed.tags,
        author: seed.author, status: "published", published_at: now, updated_at: now,
        read_minutes: seed.readMinutes, featured: seed.featured,
      }));
      inserted.push(seed.slug);
    }
    return { inserted };
  },

  "siteContent.getLanding": async () => {
    const row = unwrap(await supabase.from("site_content").select("*").eq("key", "landing").maybeSingle()) as Row | null;
    return row ? { key: row.key, value: row.value } : null;
  },

  "siteContent.saveLanding": async ({ value }) => {
    unwrap(await supabase.from("site_content").upsert({ key: "landing", value, updated_at: new Date().toISOString() }));
    return null;
  },

  "shipping.getAll": async () => {
    const rows = unwrap(await supabase.from("shipping_settings").select("*")) as Row[];
    const result: Record<string, string> = { ...SHIPPING_DEFAULTS };
    for (const row of rows ?? []) result[row.key] = String(row.value);
    return result;
  },

  "shipping.getSetting": async ({ key }) => {
    const row = unwrap(await supabase.from("shipping_settings").select("value").eq("key", key).maybeSingle()) as Row | null;
    return row ? String(row.value) : (SHIPPING_DEFAULTS[key] ?? null);
  },

  "shipping.listSettings": async () => handlers["shipping.getAll"]({}),

  "shipping.upsertSetting": async ({ key, value }) => {
    unwrap(await supabase.from("shipping_settings").upsert({ key, value, updated_at: new Date().toISOString() }));
    return null;
  },

  "tax.calculateTax": async ({ countryCode, stateCode, subtotalCents }) => {
    if (!countryCode) return { rate: 0, ratePercent: "0.00", taxCents: 0, label: "No tax", region: "" };
    const query =
      countryCode === "US" && stateCode
        ? supabase.from("tax_rates").select("*").eq("region", stateCode).eq("region_type", "us_state")
        : supabase.from("tax_rates").select("*").eq("region", countryCode).eq("region_type", "country");
    const row = unwrap(await query.maybeSingle()) as Row | null;
    const rate = row?.enabled ? Number(row.rate) : 0;
    return {
      rate,
      ratePercent: (rate * 100).toFixed(2),
      taxCents: Math.round((subtotalCents ?? 0) * rate),
      label: rate > 0 ? row!.label : "No tax",
      region: rate > 0 ? row!.region : "",
    };
  },

  "tax.listSettings": async () => {
    const rows = unwrap(await supabase.from("tax_rates").select("*").order("region", { ascending: true })) as Row[];
    return (rows ?? []).map(mapTaxRate);
  },

  "tax.upsertRate": async ({ region, regionType, label, rate, enabled }) => {
    unwrap(await supabase.from("tax_rates").upsert(
      { region, region_type: regionType, label, rate, enabled, updated_at: new Date().toISOString() },
      { onConflict: "region,region_type" },
    ));
    return null;
  },

  "tax.deleteRate": async ({ settingId }) => {
    unwrap(await supabase.from("tax_rates").delete().eq("id", settingId));
    return null;
  },

  "tax.seedDefaults": async () => {
    const rows = unwrap(await supabase.from("tax_rates").select("id")) as Row[];
    return rows?.length ?? 0;
  },

  "storage.uploadFile": async ({ file, bucket = "product-media" }) => {
    const { uploadImage } = await import("../media");
    return uploadImage(file as File, bucket as string);
  },

  "checkout.estimateShipping": async ({ address, items }) =>
    callApi("/api/shipping-estimate", { address, items }),

  "crmEmail.send": async ({ customerId, to, subject, body }) =>
    callApi("/api/crm-email", { customerId, to, subject, body }),

  "crmEmail.listForCustomer": async ({ customerId }) => {
    const rows = unwrap(
      await supabase.from("crm_emails").select("*").eq("customer_id", customerId).order("sent_at", { ascending: false }),
    ) as Row[];
    return (rows ?? []).map(mapCrmEmail);
  },

  "viktorTools.brandChat": async ({ message, history }) => {
    const result = await callApi("/api/brand-chat", { message, history });
    return result.response as string;
  },

  "admin.syncPrintful": async () => callApi("/api/printful-sync"),

  "admin.listOrders": async ({ status } = {}) => {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const rows = unwrap(await query);
    return (rows ?? []).map(mapOrder);
  },

  "admin.getOrder": async ({ orderId }) => handlers["orders.getById"]({ orderId }),

  "admin.updateOrderStatus": async ({ orderId, status, trackingUrl, trackingNumber }) => {
    const patch: Row = { status, updated_at: new Date().toISOString() };
    if (trackingUrl !== undefined) patch.tracking_url = trackingUrl;
    if (trackingNumber !== undefined) patch.tracking_number = trackingNumber;
    unwrap(await supabase.from("orders").update(patch).eq("id", orderId));
    return null;
  },

  "admin.listAllProducts": async () => {
    const rows = unwrap(await supabase.from("products").select("*").order("sort_order", { ascending: true }));
    return (rows ?? []).map(mapProduct);
  },

  "admin.updateProduct": async ({ productId, ...fields }) => {
    if (fields.rotationImages !== undefined && fields.rotationImages.length !== 0 && fields.rotationImages.length !== 8) {
      throw new Error("A product rotation must contain exactly eight ordered frames.");
    }
    const patch = productPatchToRow(fields);
    if (Object.keys(patch).length === 0) return null;
    patch.updated_at = new Date().toISOString();
    unwrap(await supabase.from("products").update(patch).eq("id", productId));
    return null;
  },

  "admin.deleteProduct": async ({ productId }) => {
    unwrap(await supabase.from("products").delete().eq("id", productId));
    return null;
  },

  "admin.listCustomers": async () => {
    const profiles = unwrap(await supabase.from("profiles").select("*").order("created_at", { ascending: false })) as Row[];
    const orders = unwrap(await supabase.from("orders").select("user_id, total, created_at")) as Row[];
    return (profiles ?? []).map(profile => {
      const own = (orders ?? []).filter(order => order.user_id === profile.id);
      return {
        ...mapProfile(profile),
        orderCount: own.length,
        totalSpent: own.reduce((sum, order) => sum + (order.total ?? 0), 0),
        lastOrderDate: own.length > 0 ? new Date(own[0].created_at).getTime() : null,
      };
    });
  },

  "admin.setUserRole": async ({ userId, role }) => {
    unwrap(await supabase.from("profiles").update({ role }).eq("id", userId));
    return null;
  },

  "admin.listSubscribers": async () => handlers["newsletter.list"]({}),

  "admin.removeSubscriber": async ({ subscriberId }) => {
    unwrap(await supabase.from("newsletter_subscribers").delete().eq("id", subscriberId));
    return null;
  },

  "admin.listCrmNotes": async ({ customerId }) => {
    const rows = unwrap(
      await supabase.from("crm_notes").select("*").eq("customer_id", customerId).order("created_at", { ascending: false }),
    ) as Row[];
    return (rows ?? []).map(mapCrmNote);
  },

  "admin.addCrmNote": async ({ customerId, note, type }) => {
    const userId = await requireUserId();
    const admin = unwrap(await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()) as Row | null;
    const row = unwrap(await supabase.from("crm_notes").insert({
      customer_id: customerId, admin_id: userId,
      admin_name: admin?.name || admin?.email || "Admin", note, type,
    }).select("id").single()) as Row;
    return row.id;
  },

  "admin.deleteCrmNote": async ({ noteId }) => {
    unwrap(await supabase.from("crm_notes").delete().eq("id", noteId));
    return null;
  },

  "admin.updateCustomerTags": async ({ customerId, tags }) => {
    unwrap(await supabase.from("crm_profiles").upsert({
      customer_id: customerId, tags, updated_at: new Date().toISOString(),
    }));
    return null;
  },

  "admin.getCrmProfile": async ({ customerId }) => {
    const row = unwrap(await supabase.from("crm_profiles").select("*").eq("customer_id", customerId).maybeSingle()) as Row | null;
    return row ? { _id: row.customer_id, customerId: row.customer_id, tags: row.tags ?? [] } : null;
  },

  "admin.dashboardStats": async () => {
    const orders = ((unwrap(await supabase.from("orders").select("*")) as Row[]) ?? []).map(mapOrder) as any[];
    const products = ((unwrap(await supabase.from("products").select("*")) as Row[]) ?? []).map(mapProduct) as any[];
    const { count: customerCount } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    const { count: subscriberCount } = await supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true });
    const paidOrders = orders.filter(order => order.status !== "pending" && order.status !== "cancelled");
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const ordersByStatus: Record<string, number> = {};
    for (const order of orders) ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const revenueByDay: Record<string, number> = {};
    for (const order of paidOrders) {
      if (order._creationTime >= thirtyDaysAgo) {
        const day = new Date(order._creationTime).toISOString().slice(0, 10);
        revenueByDay[day] = (revenueByDay[day] || 0) + (order.total || 0);
      }
    }
    const productRevenue: Record<string, { name: string; revenue: number; units: number }> = {};
    const categoryRevenue: Record<string, number> = {};
    const productMap = new Map(products.map(product => [product._id, product]));
    for (const order of paidOrders) {
      for (const item of order.items || []) {
        const key = item.productId;
        if (!productRevenue[key]) productRevenue[key] = { name: item.productName, revenue: 0, units: 0 };
        const value = (item.priceAtPurchase || 0) * (item.quantity || 1);
        productRevenue[key].revenue += value;
        productRevenue[key].units += item.quantity || 1;
        const category = productMap.get(key)?.category || "Unknown";
        categoryRevenue[category] = (categoryRevenue[category] || 0) + value;
      }
    }
    return {
      totalRevenue, totalOrders: orders.length, paidOrders: paidOrders.length,
      avgOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
      ordersByStatus, revenueByDay,
      topProducts: Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
      categoryRevenue, totalProducts: products.length,
      activeProducts: products.filter(product => product.isActive).length,
      totalCustomers: customerCount ?? 0, newsletterSubscribers: subscriberCount ?? 0,
    };
  },
};

export default handlers;
