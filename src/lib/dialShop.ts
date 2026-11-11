import type { DialOption } from "../components/RadialVariantDial";
import { colorFromName, snapHex, styleKeyFromName } from "./brand";

/**
 * Dial families.
 *
 * Women: B-Lift Sports Bra, L-Flow Leggings, D-Slip Dress.
 * Men: the two S-Glitch short lengths, three T-Icon tees, J-Glitch Jersey.
 * The same keys backfill `product_families` in the store migration. Until that
 * migration is applied, the dial groups the live catalog by these names.
 */

export type DialGender = "women" | "men" | "all";
export type DialStep = "categories" | "families" | "color" | "size";

export type FamilyRecord = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  gender: "women" | "men";
  styleKey: string;
  sortOrder?: number;
};

export type DialCategory = {
  slug: string;
  name: string;
  gender: DialGender;
};

export const FAMILY_DEFS: FamilyRecord[] = [
  {
    slug: "b-lift",
    name: "B-Lift Sports Bra",
    category: "Sports bras",
    gender: "women",
    styleKey: "B-Lift",
    sortOrder: 10,
  },
  {
    slug: "l-flow",
    name: "L-Flow Leggings",
    category: "Leggings",
    gender: "women",
    styleKey: "L-Flow",
    sortOrder: 20,
  },
  {
    slug: "d-slip",
    name: "D-Slip Dress",
    category: "Dresses",
    gender: "women",
    styleKey: "D-Slip",
    sortOrder: 30,
  },
  {
    slug: "s-glitch-2-5",
    name: 'S-Glitch 2.5" Shorts',
    category: "Shorts",
    gender: "men",
    styleKey: "S-Glitch 2.5",
    sortOrder: 40,
  },
  {
    slug: "s-glitch-6-3",
    name: 'S-Glitch 6.3" Shorts',
    category: "Shorts",
    gender: "men",
    styleKey: "S-Glitch 6.3",
    sortOrder: 50,
  },
  {
    slug: "t-icon-oversized",
    name: "T-Icon Oversized Tee",
    category: "T-shirts",
    gender: "men",
    styleKey: "T-Icon Oversized",
    sortOrder: 60,
  },
  {
    slug: "t-icon-tie-dye",
    name: "T-Icon Tie-Dye Tee",
    category: "T-shirts",
    gender: "men",
    styleKey: "T-Icon Tie-Dye",
    sortOrder: 70,
  },
  {
    slug: "t-icon",
    name: "T-Icon Tee",
    category: "T-shirts",
    gender: "men",
    styleKey: "T-Icon",
    sortOrder: 80,
  },
  {
    slug: "j-glitch",
    name: "J-Glitch Jersey",
    category: "Jerseys",
    gender: "men",
    styleKey: "J-Glitch",
    sortOrder: 90,
  },
];

export type DialProduct = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  images?: string[];
  sizes?: string[];
  category?: string;
  gender?: string;
  familyId?: string;
  printfulVariants?: Array<{
    id?: number;
    size?: string;
    name?: string;
    color?: string | null;
    is_ignored?: boolean;
    availability_status?: string;
  }>;
};

export type StockMap = Record<
  string,
  { inStock: boolean; status?: string }
> | null;

export function parseGender(value: string | null): DialGender {
  if (value === "women" || value === "men" || value === "all") return value;
  return "all";
}

export function parseStep(value: string | null): DialStep {
  if (
    value === "categories" ||
    value === "families" ||
    value === "color" ||
    value === "size"
  )
    return value;
  if (value === "pieces") return "families";
  return "categories";
}

export function categorySlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function familySource(remote: FamilyRecord[] | undefined) {
  const rows = remote && remote.length > 0 ? remote : FAMILY_DEFS;
  return rows.map(row => ({
    ...row,
    category:
      row.category ||
      FAMILY_DEFS.find(item => item.styleKey === row.styleKey)?.category ||
      "Other",
  }));
}

export function productGender(product: DialProduct): "women" | "men" | "all" {
  if (product.gender === "women" || product.gender === "men")
    return product.gender;
  const key = styleKeyFromName(product.name);
  return FAMILY_DEFS.find(item => item.styleKey === key)?.gender ?? "all";
}

export function categoriesFor(
  gender: DialGender,
  remote: FamilyRecord[] | undefined,
): DialCategory[] {
  const seen = new Map<string, DialCategory & { sortOrder: number }>();
  for (const family of familySource(remote)) {
    if (gender !== "all" && family.gender !== gender) continue;
    const slug = categorySlug(family.category);
    if (!slug) continue;
    const order = family.sortOrder ?? 0;
    const current = seen.get(slug);
    if (current && current.sortOrder <= order) continue;
    seen.set(slug, {
      slug,
      name: family.category,
      gender: family.gender,
      sortOrder: order,
    });
  }
  const specific = [...seen.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ slug, name, gender: itemGender }) => ({
      slug,
      name,
      gender: itemGender,
    }));
  return [...specific, { slug: "all", name: "All", gender }];
}

export function categoryBySlug(
  slug: string,
  gender: DialGender,
  remote: FamilyRecord[] | undefined,
) {
  return categoriesFor(gender, remote).find(item => item.slug === slug);
}

export function familiesFor(
  gender: DialGender,
  category: string,
  remote: FamilyRecord[] | undefined,
) {
  return familySource(remote)
    .filter(item => gender === "all" || item.gender === gender)
    .filter(
      item =>
        !category ||
        category === "all" ||
        categorySlug(item.category) === category,
    )
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function colorWord(name: string, word: string) {
  const value = name.toLowerCase();
  if (value.includes("black /") || value.includes("black/")) return false;
  return new RegExp(`(^|[^a-z])${word}([^a-z]|$)`).test(value);
}

export function blackProduct(products: DialProduct[]) {
  const named = (word: string) =>
    products.find(product =>
      colorWord(colorFromName(product.name) || product.name, word),
    );
  return named("black") || named("onyx") || products[0];
}

export function blackOptionIndex(labels: string[]) {
  const black = labels.findIndex(label => colorWord(label, "black"));
  if (black >= 0) return black;
  const onyx = labels.findIndex(label => colorWord(label, "onyx"));
  return onyx >= 0 ? onyx : 0;
}

export function familyBySlug(
  slug: string,
  remote: FamilyRecord[] | undefined,
) {
  return familySource(remote).find(item => item.slug === slug);
}

export function productsInFamily(
  products: DialProduct[],
  gender: DialGender,
  familySlug: string,
  remote: FamilyRecord[] | undefined,
) {
  const family = familyBySlug(familySlug, remote);
  return products.filter(product => {
    if (gender !== "all" && productGender(product) !== gender) return false;
    if (!familySlug || familySlug === "all") return false;
    if (family?.id && product.familyId) return product.familyId === family.id;
    return family ? styleKeyFromName(product.name) === family.styleKey : false;
  });
}

export function cleanSizeLabel(size: string): string {
  const parts = size.split("/");
  return parts.length > 1 ? parts[parts.length - 1].trim() : size;
}

function variantAvailable(
  variant: NonNullable<DialProduct["printfulVariants"]>[number] | undefined,
  stock: StockMap,
) {
  if (!variant?.id || variant.is_ignored === true) return false;
  const live = stock?.[String(variant.id)];
  if (live) return live.inStock;
  const status = String(variant.availability_status || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return (
    status !== "out_of_stock" &&
    status !== "discontinued" &&
    status !== "temporary_out_of_stock"
  );
}

export function colorNames(product: DialProduct): string[] {
  const seen: string[] = [];
  for (const variant of product.printfulVariants || []) {
    const color = variant?.color;
    if (
      color &&
      !seen.some(item => item.toLowerCase() === String(color).toLowerCase())
    ) {
      seen.push(String(color));
    }
  }
  return seen;
}

export function sizeChoices(
  product: DialProduct,
  stock: StockMap,
  color = "",
): DialOption[] {
  const names = colorNames(product);
  const variants = (product.printfulVariants || []).filter(variant => {
    if (!color || names.length <= 1) return true;
    return String(variant.color || "").toLowerCase() === color.toLowerCase();
  });
  return (product.sizes || []).map(raw => {
    const match = variants.find(variant => {
      const variantSize = variant.size || variant.name?.split(" / ").pop();
      return cleanSizeLabel(variantSize || "") === cleanSizeLabel(raw);
    });
    return {
      id: raw,
      label: cleanSizeLabel(raw),
      available: variants.length === 0 ? true : variantAvailable(match, stock),
    };
  });
}

export function colorwayOptions(
  products: DialProduct[],
  stock: StockMap,
): DialOption[] {
  const options: DialOption[] = [];
  for (const product of products) {
    const names = colorNames(product);
    if (names.length > 1) {
      for (const color of names) {
        const sizes = sizeChoices(product, stock, color);
        options.push({
          id: `${product._id}::${color}`,
          label: color,
          hex: snapHex(color),
          available: sizes.some(item => item.available),
        });
      }
      continue;
    }
    const label = colorFromName(product.name) || product.name;
    const sizes = sizeChoices(product, stock);
    options.push({
      id: product._id,
      label,
      hex: snapHex(label),
      available: sizes.length === 0 ? true : sizes.some(item => item.available),
    });
  }
  return options;
}

export function splitColorId(id: string) {
  const mark = id.indexOf("::");
  if (mark === -1) return { productId: id, color: "" };
  return { productId: id.slice(0, mark), color: id.slice(mark + 2) };
}

export const FAVORITE_KEY = "xixvi-dial-favorites";

export function readLocalFavorites(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter(item => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeLocalFavorites(ids: string[]) {
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(ids));
}
