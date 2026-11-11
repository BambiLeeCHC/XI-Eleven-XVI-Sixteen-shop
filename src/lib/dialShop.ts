import type { DialOption } from "../components/RadialVariantDial";
import { colorFromName, snapHex, styleKeyFromName } from "./brand";

/**
 * Dial shop categories.
 *
 * The catalog stores a coarse category (Dresses, Tops, Bottoms, Activewear)
 * and a gender. The dial uses the garment the shopper actually names, derived
 * from the style key in the product name:
 *   B-Lift → Sports bra, L-Flow → Leggings, D-Slip → Slip dress (women)
 *   S-Glitch → Shorts, T-Icon → T-shirts, J-Glitch → Jerseys (men)
 * Anything else falls into "All" only.
 */

export type DialGender = "women" | "men" | "all";
export type DialStep = "categories" | "pieces" | "size" | "color";

export type DialCategory = {
  id: string;
  label: string;
  gender: "women" | "men";
  matches: (name: string) => boolean;
};

export const DIAL_CATEGORIES: DialCategory[] = [
  {
    id: "sports-bra",
    label: "Sports bra",
    gender: "women",
    matches: name => styleKeyFromName(name) === "B-Lift",
  },
  {
    id: "leggings",
    label: "Leggings",
    gender: "women",
    matches: name => styleKeyFromName(name).startsWith("L-Flow"),
  },
  {
    id: "slip-dress",
    label: "Slip dress",
    gender: "women",
    matches: name => styleKeyFromName(name) === "D-Slip",
  },
  {
    id: "shorts",
    label: "Shorts",
    gender: "men",
    matches: name => styleKeyFromName(name).startsWith("S-Glitch"),
  },
  {
    id: "tees",
    label: "T-shirts",
    gender: "men",
    matches: name => styleKeyFromName(name).startsWith("T-Icon"),
  },
  {
    id: "jerseys",
    label: "Jerseys",
    gender: "men",
    matches: name => styleKeyFromName(name) === "J-Glitch",
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
  printfulVariants?: Array<{
    id?: number;
    size?: string;
    name?: string;
    color?: string | null;
    is_ignored?: boolean;
    availability_status?: string;
  }>;
};

export function parseGender(value: string | null): DialGender {
  if (value === "women" || value === "men" || value === "all") return value;
  return "all";
}

export function parseStep(value: string | null): DialStep {
  if (
    value === "categories" ||
    value === "pieces" ||
    value === "size" ||
    value === "color"
  )
    return value;
  return "categories";
}

export function categoryById(id: string) {
  return DIAL_CATEGORIES.find(item => item.id === id);
}

export function productGender(product: DialProduct): "women" | "men" | "all" {
  if (product.gender === "women" || product.gender === "men")
    return product.gender;
  const hit = DIAL_CATEGORIES.find(item => item.matches(product.name));
  return hit?.gender ?? "all";
}

export function categoriesFor(
  gender: DialGender,
): Array<DialCategory | { id: "all"; label: "All"; gender: DialGender }> {
  const specific =
    gender === "all"
      ? DIAL_CATEGORIES
      : DIAL_CATEGORIES.filter(item => item.gender === gender);
  return [...specific, { id: "all", label: "All", gender }];
}

export function productsFor(
  products: DialProduct[],
  gender: DialGender,
  categoryId: string,
) {
  return products.filter(product => {
    if (gender !== "all" && productGender(product) !== gender) return false;
    if (!categoryId || categoryId === "all") return true;
    const category = categoryById(categoryId);
    return category ? category.matches(product.name) : true;
  });
}

export function cleanSizeLabel(size: string): string {
  const parts = size.split("/");
  return parts.length > 1 ? parts[parts.length - 1].trim() : size;
}

function inStock(
  variant: NonNullable<DialProduct["printfulVariants"]>[number] | undefined,
) {
  return Boolean(
    variant?.id &&
      variant.is_ignored !== true &&
      variant.availability_status !== "out_of_stock" &&
      variant.availability_status !== "discontinued",
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

export function sizeChoices(product: DialProduct): DialOption[] {
  const variants = product.printfulVariants || [];
  return (product.sizes || []).map(raw => {
    const match = variants.find(variant => {
      const variantSize = variant.size || variant.name?.split(" / ").pop();
      return cleanSizeLabel(variantSize || "") === cleanSizeLabel(raw);
    });
    return {
      id: raw,
      label: cleanSizeLabel(raw),
      available: variants.length === 0 ? true : inStock(match),
    };
  });
}

export function siblingColors(
  product: DialProduct,
  catalog: DialProduct[],
  sizeId: string,
): DialOption[] {
  const names = colorNames(product);
  if (names.length > 1) {
    const variants = product.printfulVariants || [];
    return names.map(color => {
      const match = variants.find(variant => {
        const variantSize = variant.size || variant.name?.split(" / ").pop();
        return (
          cleanSizeLabel(variantSize || "") === cleanSizeLabel(sizeId) &&
          String(variant.color || "").toLowerCase() === color.toLowerCase()
        );
      });
      return {
        id: color,
        label: color,
        hex: snapHex(color),
        available: sizeId ? inStock(match) : true,
      };
    });
  }
  const style = styleKeyFromName(product.name);
  const siblings = catalog.filter(
    item => styleKeyFromName(item.name) === style,
  );
  if (siblings.length <= 1) return [];
  return siblings.map(item => {
    const label = colorFromName(item.name) || item.name;
    return {
      id: item._id,
      label,
      hex: snapHex(label),
      available: !sizeId
        ? true
        : (item.sizes || []).some(
            entry => cleanSizeLabel(entry) === cleanSizeLabel(sizeId),
          ),
    };
  });
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
