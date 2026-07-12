import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

declare const process: { env: Record<string, string | undefined> };

// ─── Queries ────────────────────────────────────────────────────────────

export const list = query({
  args: {
    gender: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, { gender, category }) => {
    if (gender) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_gender", (q) => q.eq("gender", gender).eq("isActive", true))
        .collect();
      if (category) {
        return products.filter((p) => p.category === category);
      }
      return products;
    }
    if (category) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", category).eq("isActive", true))
        .collect();
      return products;
    }
    // All active products
    const allProducts = await ctx.db.query("products").collect();
    return allProducts.filter((p) => p.isActive);
  },
});

export const getById = query({
  args: { productId: v.id("products") },
  returns: v.any(),
  handler: async (ctx, { productId }) => {
    return await ctx.db.get(productId);
  },
});

export const getCount = query({
  args: { gender: v.optional(v.string()), category: v.optional(v.string()) },
  returns: v.number(),
  handler: async (ctx, { gender, category }) => {
    let products: Array<{ isActive: boolean; gender: string; category: string }>;
    if (gender) {
      products = await ctx.db
        .query("products")
        .withIndex("by_gender", (q) => q.eq("gender", gender).eq("isActive", true))
        .collect();
    } else {
      products = await ctx.db.query("products").collect();
      products = products.filter((p) => p.isActive);
    }
    if (category) {
      products = products.filter((p) => p.category === category);
    }
    return products.length;
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────

export const upsertFromPrintful = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
    category: v.string(),
    gender: v.string(),
    images: v.array(v.string()),
    sizes: v.array(v.string()),
    printfulProductId: v.string(),
    printfulVariants: v.optional(v.any()),
    stripeProductId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    // Check if product already exists
    const existing = await ctx.db
      .query("products")
      .withIndex("by_printful_id", (q) => q.eq("printfulProductId", args.printfulProductId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        isActive: true,
        sortOrder: args.sortOrder ?? existing.sortOrder,
      });
      return existing._id;
    }

    return await ctx.db.insert("products", {
      ...args,
      isActive: true,
      sortOrder: args.sortOrder ?? 0,
    });
  },
});

export const createManual = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
    category: v.string(),
    gender: v.string(),
    images: v.array(v.string()),
    sizes: v.array(v.string()),
    sortOrder: v.optional(v.number()),
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      isActive: true,
      sortOrder: args.sortOrder ?? 0,
    });
  },
});

// ─── Actions (Printful Sync) ────────────────────────────────────────────

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY!;
const PRINTFUL_BASE = "https://api.printful.com";

async function printfulGet<T>(path: string): Promise<T> {
  const response = await fetch(`${PRINTFUL_BASE}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Printful ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

export const syncFromPrintful = action({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    try {
      // Get store products from Printful
      const result = await printfulGet<{ code: number; result: Array<{ id: number; external_id: string; name: string; variants: number; synced: number; thumbnail_url: string }> }>(
        "/store/products"
      );

      const products = result.result ?? [];
      if (products.length === 0) {
        return "No products found in Printful store. Add products in Printful first.";
      }

      let synced = 0;
      for (const product of products) {
        // Get full product details
        const detail = await printfulGet<{ code: number; result: { sync_product: { id: number; name: string }; sync_variants: Array<{ id: number; name: string; retail_price: string; currency: string; variant_id: number; product: { variant_id: number; product_id: number; image: string; name: string }; files: Array<{ type: string; preview_url: string }> }> } }>(
          `/store/products/${product.id}`
        );

        const syncProduct = detail.result?.sync_product;
        const syncVariants = detail.result?.sync_variants ?? [];

        if (!syncProduct) continue;

        // Extract product info
        const images = syncVariants
          .flatMap((sv: { files: Array<{ type: string; preview_url: string }> }) => sv.files?.filter((f: { type: string }) => f.type === "preview")?.map((f: { preview_url: string }) => f.preview_url) ?? [])
          .filter(Boolean);
        if (images.length === 0 && product.thumbnail_url) {
          images.push(product.thumbnail_url);
        }

        const sizes = [...new Set(syncVariants.map((sv: { name: string }) => {
          const parts = sv.name.split(" - ");
          return parts[parts.length - 1] || "One Size";
        }))];

        const price = syncVariants[0]?.retail_price
          ? Math.round(Number.parseFloat(syncVariants[0].retail_price) * 100)
          : 0;

        // Categorize based on product name
        let category = "Tops";
        let gender = "unisex";
        const nameLower = syncProduct.name.toLowerCase();
        if (nameLower.includes("dress") || nameLower.includes("slip")) { category = "Dresses"; gender = "women"; }
        else if (nameLower.includes("legging") || nameLower.includes("short") || nameLower.includes("bottom")) { category = "Bottoms"; }
        else if (nameLower.includes("bra") || nameLower.includes("sports")) { category = "Activewear"; gender = "women"; }
        else if (nameLower.includes("jersey") || nameLower.includes("tee") || nameLower.includes("shirt")) { category = "Tops"; }

        if (nameLower.includes("women") || nameLower.includes("her")) gender = "women";
        else if (nameLower.includes("men") || nameLower.includes("him") || nameLower.includes("his")) gender = "men";

        await ctx.runMutation("products:upsertFromPrintful" as any, {
          name: syncProduct.name,
          description: `Premium ${syncProduct.name} from the XI · XVI collection.`,
          price,
          currency: syncVariants[0]?.currency || "USD",
          category,
          gender,
          images: images.slice(0, 5),
          sizes: sizes as string[],
          printfulProductId: String(syncProduct.id),
          printfulVariants: syncVariants,
          sortOrder: synced,
        });

        synced++;
      }

      return `Synced ${synced} products from Printful.`;
    } catch (error) {
      return `Printful sync error: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});

export const updateImages = mutation({
  args: {
    productId: v.id("products"),
    images: v.array(v.string()),
  },
  handler: async (ctx, { productId, images }) => {
    await ctx.db.patch(productId, { images });
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    images: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    gender: v.optional(v.string()),
  },
  handler: async (ctx, { productId, ...fields }) => {
    const patch: Record<string, unknown> = {};
    if (fields.images !== undefined) patch.images = fields.images;
    if (fields.description !== undefined) patch.description = fields.description;
    if (fields.name !== undefined) patch.name = fields.name;
    if (fields.price !== undefined) patch.price = fields.price;
    if (fields.gender !== undefined) patch.gender = fields.gender;
    await ctx.db.patch(productId, patch);
  },
});

export const remove = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    await ctx.db.delete(productId);
  },
});
