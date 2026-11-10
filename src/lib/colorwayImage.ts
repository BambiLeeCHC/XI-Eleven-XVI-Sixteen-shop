import { getDrapeCdnUrl } from "../data/drapeCdnUrls";
import { SHOWROOM_CATALOG } from "../data/showroomCatalog";
import { styleKeyFromName } from "./brand";

export type ColorwayArt = {
  images: string[];
  source: "catalog" | "showroom" | "drape" | "fallback";
};

function usable(
  images: Array<string | null | undefined> | null | undefined,
): string[] {
  return (images ?? []).map(src => (src ?? "").trim()).filter(Boolean);
}

/** "D-Slip Dress [Pink Lace]" → "d-slip-dress-pink-lace". */
export function colorwaySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\u201c\u201d\u2018\u2019\u2033"]/g, "")
    .replace(/\[|\]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function compactName(name: string): string {
  return colorwaySlug(name)
    .replace(/-yoga-/g, "-")
    .replace(/-/g, "");
}

function showroomSrc(name: string): string | null {
  const wanted = compactName(name);
  if (!wanted) return null;
  const hit = SHOWROOM_CATALOG.find(item => compactName(item.name) === wanted);
  return hit?.src || null;
}

/** Build "T-Icon Oversized Tee [French Navy]" from the listing name plus a color label. */
export function namedColorway(productName: string, colorLabel: string): string {
  const label = colorLabel.trim();
  if (!label) return productName;
  const style = styleKeyFromName(productName);
  const tail = productName
    .slice(style.length)
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${style}${tail ? ` ${tail}` : ""} [${label}]`;
}

/**
 * Photos for one colorway.
 * Real catalog images win. Showroom stills and drape photos fill gaps.
 * The fallback list is the current product gallery, so a missing color
 * never becomes a broken image.
 */
export function resolveColorwayArt(input: {
  images?: Array<string | null | undefined> | null;
  name: string;
  fallback?: Array<string | null | undefined> | null;
}): ColorwayArt {
  const direct = usable(input.images);
  if (direct.length) return { images: direct, source: "catalog" };

  const showroom = showroomSrc(input.name);
  if (showroom) return { images: [showroom], source: "showroom" };

  const slug = colorwaySlug(input.name);
  const drape = slug ? getDrapeCdnUrl(slug) : null;
  if (drape) return { images: [drape], source: "drape" };

  const loose = slug.replace(/-yoga-/g, "-");
  if (loose && loose !== slug) {
    const alt = getDrapeCdnUrl(loose);
    if (alt) return { images: [alt], source: "drape" };
  }

  return { images: usable(input.fallback), source: "fallback" };
}
