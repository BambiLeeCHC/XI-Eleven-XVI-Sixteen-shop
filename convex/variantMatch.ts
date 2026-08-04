/**
 * Single source of truth for turning a customer's selection (size + optional colour)
 * into a Printful sync variant.
 *
 * This used to be duplicated in checkout.ts and orders.ts, and both matched on size
 * alone. That is wrong for products that carry every colourway in one storefront
 * product (both T-Icon tees): a size-only match silently returns the FIRST colour,
 * so every tee order shipped French Navy regardless of what the customer picked.
 */

export interface PrintfulVariant {
  id: number;
  size: string;
  color?: string | null;
  variant_id: number;
  retail_price?: string;
  currency?: string;
}

/** Normalize for comparison: trim, collapse whitespace, case-insensitive. */
function norm(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Legacy carts stored size as "Product Name / Size" rather than just "Size".
 * Take the last segment so old cart rows still resolve.
 */
export function pureSize(rawSize: string): string {
  const parts = (rawSize ?? "").split(" / ").map((p) => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : (rawSize ?? "");
}

/** True when this product actually has a colour axis the customer must choose from. */
export function colorOptions(variants: PrintfulVariant[] | undefined | null): string[] {
  if (!variants) return [];
  const seen: string[] = [];
  for (const variant of variants) {
    const color = variant?.color;
    if (color && !seen.some((c) => norm(c) === norm(color))) seen.push(color);
  }
  return seen;
}

/**
 * Storefront ID convention for a colourway page.
 *
 * XIXVI merchandises one product page per colourway, but Printful sometimes bundles
 * every colourway into a single sync product (both T-Icon tees). Those storefront pages
 * are therefore keyed `<printfulProductId>-<colour-slug>`, e.g. `429126344-french-navy`
 * and `429126341-navy-white`. The sync builds the same key so it updates the existing
 * page instead of inserting a duplicate bundled product.
 */
export function colorSlug(color: string): string {
  return (color ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function colorwayProductId(printfulProductId: string | number, color?: string | null): string {
  const base = String(printfulProductId);
  const slug = color ? colorSlug(color) : "";
  return slug ? `${base}-${slug}` : base;
}

/**
 * Resolve a variant, or null when the selection is not fulfillable.
 *
 * Deliberately strict: if a product has a colour axis and no colour was chosen, we
 * return null rather than guessing. Shipping the wrong colour is worse than a clear
 * error at checkout.
 */
export function matchVariant(
  variants: PrintfulVariant[] | undefined | null,
  rawSize: string,
  color?: string | null,
): PrintfulVariant | null {
  if (!variants || variants.length === 0) return null;

  const wantedSize = norm(pureSize(rawSize));
  const bySize = variants.filter((v) => norm(v.size) === wantedSize);
  if (bySize.length === 0) return null;
  if (bySize.length === 1 && !color) return bySize[0];

  const hasColorAxis = colorOptions(variants).length > 1;
  if (!hasColorAxis) return bySize[0];

  if (!color) return null; // ambiguous — never guess a colour
  return bySize.find((v) => norm(v.color) === norm(color)) ?? null;
}
