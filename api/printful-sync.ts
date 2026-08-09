/**
 * Pull the Printful catalogue into `products` (admin only).
 *
 * The storefront is the source of truth for everything a human curated —
 * price, name, description, imagery, merchandising. Printful only owns
 * fulfillment data: which sizes exist and which sync variant each maps to.
 * Anything else would be silently undone on every sync.
 */

import {
  type ApiRequest,
  type ApiResponse,
  fail,
  printfulRequest,
  requireAdmin,
  supabaseAdmin,
} from "./_lib/server";
import { colorwayProductId } from "./_lib/variantMatch";

/**
 * The six S-Glitch 2.5" shorts colourways were deleted and re-created in
 * Printful, so the old ids 404. Verified against the store 2026-08-03.
 * Idempotent: rows already carrying the new id are left alone.
 */
const PRINTFUL_ID_REMAP: Array<{ from: string; to: string; color: string }> = [
  { from: "429126732", to: "448077622", color: "Black" },
  { from: "429126729", to: "448076773", color: "White" },
  { from: "429126728", to: "448079876", color: "Volt" },
  { from: "429126727", to: "448079476", color: "Peach" },
  { from: "429126724", to: "448080273", color: "Ice" },
  { from: "429126351", to: "448079072", color: "Pink" },
];

type SyncVariant = {
  id: number;
  name: string;
  retail_price: string;
  currency: string;
  variant_id: number;
  product?: { name?: string };
  files?: Array<{ type: string; preview_url: string }>;
};

function parseOptions(
  variant: SyncVariant,
  productName: string,
): { size: string; color: string | null } | null {
  // Sync variant names are "<product> / [<colour> / ]<size>"; colours can
  // themselves contain " / " (e.g. "Navy / White"), so size is the LAST segment.
  const fullName = (variant.name ?? "").trim();
  const prefix = productName.trim();
  const rest = fullName.startsWith(prefix)
    ? fullName
        .slice(prefix.length)
        .replace(/^\s*\/\s*/, "")
        .trim()
    : fullName;

  if (rest && rest !== fullName) {
    const parts = rest
      .split(" / ")
      .map(p => p.trim())
      .filter(Boolean);
    const size = parts.pop();
    if (size)
      return { size, color: parts.length > 0 ? parts.join(" / ") : null };
  }

  // The catalog name is a size fallback only — its colour is the blank garment
  // colour, not the XIXVI colourway, so it must never drive matching.
  const catalog = variant.product?.name ?? "";
  if (catalog.includes("(") && catalog.includes(")")) {
    const inner = catalog.slice(
      catalog.lastIndexOf("(") + 1,
      catalog.lastIndexOf(")"),
    );
    const parts = inner
      .split(" / ")
      .map(p => p.trim())
      .filter(Boolean);
    const size = parts.pop();
    if (size) return { size, color: null };
  }

  return fullName ? { size: "One Size", color: null } : null;
}

function categorize(name: string): { category: string; gender: string } {
  const lower = name.toLowerCase();
  let category = "Tops";
  let gender = "unisex";
  if (lower.includes("dress") || lower.includes("slip")) {
    category = "Dresses";
    gender = "women";
  } else if (
    lower.includes("legging") ||
    lower.includes("short") ||
    lower.includes("bottom")
  ) {
    category = "Bottoms";
  } else if (lower.includes("bra") || lower.includes("sports")) {
    category = "Activewear";
    gender = "women";
  }
  if (lower.includes("women") || lower.includes("her")) gender = "women";
  else if (
    lower.includes("men") ||
    lower.includes("him") ||
    lower.includes("his")
  )
    gender = "men";
  return { category, gender };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await requireAdmin(req);
    const admin = supabaseAdmin();
    const report: string[] = [];

    // ── Remap re-created Printful products before syncing ────────────────
    for (const entry of PRINTFUL_ID_REMAP) {
      const { data: row } = await admin
        .from("products")
        .select("id, name")
        .eq("printful_product_id", entry.from)
        .maybeSingle();
      if (!row) continue;
      if (!row.name.toLowerCase().includes(entry.color.toLowerCase())) {
        report.push(
          `SKIP ${entry.from}: "${row.name}" does not look like ${entry.color}`,
        );
        continue;
      }
      const { data: clash } = await admin
        .from("products")
        .select("id")
        .eq("printful_product_id", entry.to)
        .maybeSingle();
      if (clash) continue;
      await admin
        .from("products")
        .update({ printful_product_id: entry.to })
        .eq("id", row.id);
      report.push(`remapped "${row.name}" ${entry.from} → ${entry.to}`);
    }

    const store = await printfulRequest<{
      result: Array<{ id: number; thumbnail_url: string }>;
    }>("/store/products");

    let synced = 0;

    for (const summary of store.result ?? []) {
      const detail = await printfulRequest<{
        result: {
          sync_product: { id: number; name: string };
          sync_variants: SyncVariant[];
        };
      }>(`/store/products/${summary.id}`);

      const syncProduct = detail.result?.sync_product;
      const syncVariants = detail.result?.sync_variants ?? [];
      if (!syncProduct) continue;

      const previewsByVariant = new Map<number, string[]>();
      for (const variant of syncVariants) {
        previewsByVariant.set(
          variant.id,
          (variant.files ?? [])
            .filter(f => f.type === "preview")
            .map(f => f.preview_url)
            .filter(Boolean),
        );
      }

      const normalized = syncVariants
        .map(variant => {
          const options = parseOptions(variant, syncProduct.name);
          if (!options) return null;
          return {
            id: variant.id,
            size: options.size,
            color: options.color,
            variant_id: variant.variant_id,
            retail_price: variant.retail_price,
            currency: variant.currency || "USD",
          };
        })
        .filter((v): v is NonNullable<typeof v> => v !== null);

      if (normalized.length === 0) continue;

      // Printful bundles every colourway of the tees into one sync product; the
      // storefront sells one page per colourway keyed `<id>-<colour-slug>`.
      const colors = [
        ...new Set(
          normalized.map(v => v.color).filter((c): c is string => !!c),
        ),
      ];
      const groups =
        colors.length > 1
          ? colors.map(color => ({
              printfulProductId: colorwayProductId(syncProduct.id, color),
              name: `${syncProduct.name} [${color}]`,
              variants: normalized.filter(v => v.color === color),
            }))
          : [
              {
                printfulProductId: String(syncProduct.id),
                name: syncProduct.name,
                variants: normalized,
              },
            ];

      const { category, gender } = categorize(syncProduct.name);

      for (const group of groups) {
        const sizes = [...new Set(group.variants.map(v => v.size))];
        const images = [
          ...new Set(
            group.variants.flatMap(v => previewsByVariant.get(v.id) ?? []),
          ),
        ].slice(0, 5);
        if (images.length === 0 && summary.thumbnail_url)
          images.push(summary.thumbnail_url);

        const { data: existing } = await admin
          .from("products")
          .select("id, name, description, images, sort_order")
          .eq("printful_product_id", group.printfulProductId)
          .maybeSingle();

        if (existing) {
          const patch: Record<string, unknown> = {
            sizes,
            printful_variants: group.variants,
            is_active: true,
            updated_at: new Date().toISOString(),
          };
          // Fill genuine gaps only; never overwrite a curated value.
          if ((existing.images?.length ?? 0) === 0 && images.length > 0)
            patch.images = images;
          if (!existing.description?.trim()) {
            patch.description = `Premium ${group.name} from the XI · XVI collection.`;
          }
          if (!existing.name?.trim()) patch.name = group.name;
          await admin.from("products").update(patch).eq("id", existing.id);
        } else {
          // Cheapest variant, not variant #1 — Printful's ordering is not stable.
          const price = Math.min(
            ...group.variants.map(v =>
              Math.round(Number.parseFloat(v.retail_price) * 100),
            ),
          );
          await admin.from("products").insert({
            id: group.printfulProductId,
            name: group.name,
            description: `Premium ${group.name} from the XI · XVI collection.`,
            price,
            currency: group.variants[0]?.currency || "USD",
            category,
            gender,
            images,
            sizes,
            printful_product_id: group.printfulProductId,
            printful_variants: group.variants,
            is_active: true,
            sort_order: synced,
          });
        }
        synced += 1;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Synced ${synced} products from Printful (${report.length} ids remapped).`,
      report,
    });
  } catch (error) {
    return fail(res, error);
  }
}
