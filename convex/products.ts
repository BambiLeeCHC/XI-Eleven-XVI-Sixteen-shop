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
      // Storefront prices are the source of truth and are set deliberately — a Printful
      // sync must never overwrite them. Printful's retail_price is still kept per variant
      // inside printfulVariants for margin reporting.
      const { price: _incomingPrice, currency: _incomingCurrency, ...syncable } = args;
      await ctx.db.patch(existing._id, {
        ...syncable,
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

        // Derive a clean size (and colour, where there is one) for every variant, and drop
        // variants we can't resolve so checkout can never pick an orphan (orders.ts matches
        // on `size`, which is missing on the raw sync_variants stored today).
        // Sync variant names are "<sync product name> / [<colour> / ]<size>", e.g.
        //   "J-Glitch Jersey [Black] / XL"                  -> size XL, no colour axis
        //   "T-Icon Oversized Tee / French Navy / XL"       -> colour French Navy, size XL
        //   "T-Icon Tie-Dye Tee / Navy / White / XL"        -> colour "Navy / White" (!), size XL
        // So the size is the LAST segment after stripping the product-name prefix, and the
        // colour is everything in between — colours can themselves contain " / ".
        // The catalog name ("... (Colour / Size)") is only a size fallback: its colour is the
        // blank garment colour, not the XIXVI colourway, so it must never drive matching.
        const parseOptions = (sv: { name: string; product?: { name?: string } }): { size: string; color: string | null } | null => {
          const fullName = (sv.name ?? "").trim();
          const prefix = syncProduct.name.trim();
          const rest = fullName.startsWith(prefix)
            ? fullName.slice(prefix.length).replace(/^\s*\/\s*/, "").trim()
            : fullName;

          if (rest && rest !== fullName) {
            const parts = rest.split(" / ").map((x) => x.trim()).filter(Boolean);
            const size = parts.pop();
            if (size) return { size, color: parts.length > 0 ? parts.join(" / ") : null };
          }

          const catalog = sv.product?.name ?? "";
          if (catalog.includes("(") && catalog.includes(")")) {
            const inner = catalog.slice(catalog.lastIndexOf("(") + 1, catalog.lastIndexOf(")"));
            const catalogParts = inner.split(" / ").map((x) => x.trim()).filter(Boolean);
            const size = catalogParts.pop();
            if (size) return { size, color: null };
          }

          // Single-size products legitimately have no size segment.
          return fullName ? { size: "One Size", color: null } : null;
        };

        const normalizedVariants = syncVariants
          .map((sv) => {
            const options = parseOptions(sv);
            if (!options) return null;
            return {
              id: sv.id,                    // Printful sync_variant id used at order time
              size: options.size,
              color: options.color,         // multi-colour products (e.g. the tees) need this too
              variant_id: sv.variant_id,    // catalog variant id
              retail_price: sv.retail_price,
              currency: sv.currency || "USD",
            };
          })
          .filter((v): v is NonNullable<typeof v> => v !== null);

        if (normalizedVariants.length === 0) {
          // Nothing fulfillable — don't overwrite a good record with a broken one.
          continue;
        }

        const sizes = [...new Set(normalizedVariants.map((v) => v.size))];

        // Only used when a product is brand new to the storefront; existing products keep
        // their curated price (see upsertFromPrintful). Cheapest variant, not variant #1,
        // because Printful's variant ordering is not stable.
        const price = Math.min(
          ...normalizedVariants.map((v) => Math.round(Number.parseFloat(v.retail_price) * 100)),
        );

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
          currency: normalizedVariants[0]?.currency || "USD",
          category,
          gender,
          images: images.slice(0, 5),
          sizes: sizes as string[],
          printfulProductId: String(syncProduct.id),
          printfulVariants: normalizedVariants,
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
