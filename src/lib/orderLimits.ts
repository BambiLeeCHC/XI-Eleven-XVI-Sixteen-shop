/**
 * Anti-reseller defaults. Change the numbers here.
 * Cart checks and the order API both read this module.
 */

export const ORDER_LIMITS = {
  /** Same product, color, and size. */
  maxPerVariant: 2,
  /** Distinct sizes of one product and color. Blocks a full size run. */
  maxSizesPerColor: 3,
  /** Pieces in a single order. */
  maxItemsPerOrder: 8,
  /** How far back to look for the same person or address. */
  lookbackDays: 30,
  /** Pieces to the same email, account, or address inside the window. */
  maxItemsPerWindow: 12,
};

export type LimitLine = {
  productId: string;
  productName?: string;
  color?: string | null;
  size?: string | null;
  quantity: number;
};

export type LimitHit = {
  code: "variant" | "sizes" | "order" | "window-variant" | "window-sizes" | "window-order";
  message: string;
};

const keyPart = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase();

export function variantKey(line: LimitLine) {
  return `${line.productId}|${keyPart(line.color)}|${keyPart(line.size)}`;
}

export function colorKey(line: LimitLine) {
  return `${line.productId}|${keyPart(line.color)}`;
}

function totals(lines: LimitLine[]) {
  const variants = new Map<string, number>();
  const sizes = new Map<string, Set<string>>();
  let pieces = 0;
  for (const line of lines) {
    const quantity = Math.max(0, Math.floor(Number(line.quantity) || 0));
    pieces += quantity;
    variants.set(variantKey(line), (variants.get(variantKey(line)) ?? 0) + quantity);
    const sizesForColor = sizes.get(colorKey(line)) ?? new Set<string>();
    if (keyPart(line.size)) sizesForColor.add(keyPart(line.size));
    sizes.set(colorKey(line), sizesForColor);
  }
  return { variants, sizes, pieces };
}

/** Limits for the cart in front of the shopper. */
export function cartLimitHit(lines: LimitLine[]): LimitHit | null {
  const { variants, sizes, pieces } = totals(lines);
  if (pieces > ORDER_LIMITS.maxItemsPerOrder) {
    return {
      code: "order",
      message: `Limit ${ORDER_LIMITS.maxItemsPerOrder} items per order`,
    };
  }
  for (const quantity of variants.values()) {
    if (quantity > ORDER_LIMITS.maxPerVariant) {
      return {
        code: "variant",
        message: `Limit ${ORDER_LIMITS.maxPerVariant} per size`,
      };
    }
  }
  for (const set of sizes.values()) {
    if (set.size > ORDER_LIMITS.maxSizesPerColor) {
      return {
        code: "sizes",
        message: `Limit ${ORDER_LIMITS.maxSizesPerColor} sizes per style`,
      };
    }
  }
  return null;
}

/** Same rules across recent orders, with a higher piece cap. */
export function windowLimitHit(lines: LimitLine[]): LimitHit | null {
  const { variants, sizes, pieces } = totals(lines);
  if (pieces > ORDER_LIMITS.maxItemsPerWindow) {
    return {
      code: "window-order",
      message: "We can only send a few pieces to the same address. Write us if this is for a group.",
    };
  }
  for (const quantity of variants.values()) {
    if (quantity > ORDER_LIMITS.maxPerVariant) {
      return {
        code: "window-variant",
        message: `Limit ${ORDER_LIMITS.maxPerVariant} per size`,
      };
    }
  }
  for (const set of sizes.values()) {
    if (set.size > ORDER_LIMITS.maxSizesPerColor) {
      return {
        code: "window-sizes",
        message: `Limit ${ORDER_LIMITS.maxSizesPerColor} sizes per style`,
      };
    }
  }
  return null;
}

export function normalizeEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase();
}

export function normalizeAddress(address: Record<string, unknown> | null | undefined) {
  if (!address) return "";
  const parts = [
    address.address1,
    address.line1,
    address.street,
    address.address2,
    address.line2,
    address.city,
    address.stateCode,
    address.state,
    address.zip,
    address.postalCode,
    address.postal_code,
    address.countryCode,
    address.country,
  ];
  return parts
    .map(part => String(part ?? ""))
    .join(" ")
    .toLowerCase()
    .replace(/\b(apartment|apt|unit|suite|ste|floor|fl|bldg|building)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function addressHash(normalized: string) {
  let hash = 5381;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = ((hash << 5) + hash + normalized.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
