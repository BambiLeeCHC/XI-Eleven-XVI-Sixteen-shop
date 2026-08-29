/**
 * Serve clothes as clothes: prefer on-body drapes and local studio mockups
 * over tiny Printful CGI previews, and request a larger render when the
 * source can actually upscale (Supabase).
 */

import { getDrapeCdnUrl } from "../data/drapeCdnUrls";

const MOCKUP_FILES = [
  "B-Lift_Sports_Bra_Dash_Black.png",
  "B-Lift_Sports_Bra_Dash_Black_back.png",
  "B-Lift_Sports_Bra_Dash_Black_front.png",
  "B-Lift_Sports_Bra_Dash_Black_inside.png",
  "B-Lift_Sports_Bra_Dash_White.png",
  "B-Lift_Sports_Bra_Dash_White_back.png",
  "B-Lift_Sports_Bra_Dash_White_front.png",
  "B-Lift_Sports_Bra_Dash_White_front2.png",
  "B-Lift_Sports_Bra_Ivory_0.png",
  "B-Lift_Sports_Bra_Ivory_1.png",
  "B-Lift_Sports_Bra_Onyx_0.png",
  "B-Lift_Sports_Bra_Onyx_1.png",
  "D-Slip_Dress_Black_0.png",
  "D-Slip_Dress_Black_1.png",
  "D-Slip_Dress_Dark_Cerulean_0.png",
  "D-Slip_Dress_Dark_Cerulean_1.png",
  "D-Slip_Dress_Nude_0.png",
  "D-Slip_Dress_Nude_1.png",
  "D-Slip_Dress_Pink_Lace_0.png",
  "D-Slip_Dress_Pink_Lace_1.png",
  "D-Slip_Dress_Red_0.png",
  "D-Slip_Dress_Red_1.png",
  "D-Slip_Dress_Whisper_0.png",
  "D-Slip_Dress_Whisper_1.png",
  "J-Glitch_Jersey_Black_0.png",
  "J-Glitch_Jersey_Black_1.png",
  "J-Glitch_Jersey_Black_2.png",
  "J-Glitch_Jersey_Black_3.png",
  "J-Glitch_Jersey_Ice_0.png",
  "J-Glitch_Jersey_Ice_1.png",
  "J-Glitch_Jersey_Ice_2.png",
  "J-Glitch_Jersey_Ice_3.png",
  "J-Glitch_Jersey_Peach_0.png",
  "J-Glitch_Jersey_Peach_1.png",
  "J-Glitch_Jersey_Peach_2.png",
  "J-Glitch_Jersey_Peach_3.png",
  "J-Glitch_Jersey_Pink_0.png",
  "J-Glitch_Jersey_Pink_1.png",
  "J-Glitch_Jersey_Pink_2.png",
  "J-Glitch_Jersey_Pink_3.png",
  "J-Glitch_Jersey_Volt_0.png",
  "J-Glitch_Jersey_Volt_1.png",
  "J-Glitch_Jersey_Volt_2.png",
  "J-Glitch_Jersey_Volt_3.png",
  "J-Glitch_Jersey_White_0.png",
  "J-Glitch_Jersey_White_1.png",
  "J-Glitch_Jersey_White_2.png",
  "J-Glitch_Jersey_White_3.png",
  "L-Flow_Leggings_Dash_Black.png",
  "L-Flow_Leggings_Dash_Black_flat2.png",
  "L-Flow_Leggings_Dash_White.png",
  "L-Flow_Leggings_Dash_White_detail.png",
  "L-Flow_Leggings_Dash_White_flat2.png",
  "L-Flow_Yoga_Leggings_Ivory_0.png",
  "L-Flow_Yoga_Leggings_Ivory_1.png",
  "L-Flow_Yoga_Leggings_Ivory_2.png",
  "L-Flow_Yoga_Leggings_Onyx_0.png",
  "L-Flow_Yoga_Leggings_Onyx_1.png",
  "L-Flow_Yoga_Leggings_Onyx_2.png",
  "S-Glitch_2.5_Shorts_Black.png",
  "S-Glitch_2.5_Shorts_Black_rear.jpg",
  "S-Glitch_2.5_Shorts_Ice.png",
  "S-Glitch_2.5_Shorts_Ice_rear.jpg",
  "S-Glitch_2.5_Shorts_Peach.png",
  "S-Glitch_2.5_Shorts_Peach_rear.jpg",
  "S-Glitch_2.5_Shorts_Pink.png",
  "S-Glitch_2.5_Shorts_Pink_rear.jpg",
  "S-Glitch_2.5_Shorts_Volt.png",
  "S-Glitch_2.5_Shorts_Volt_rear.jpg",
  "S-Glitch_2.5_Shorts_White.png",
  "S-Glitch_2.5_Shorts_White_rear.jpg",
  "S-Glitch_6.3_Shorts_Black_0.png",
  "S-Glitch_6.3_Shorts_Black_1.png",
  "S-Glitch_6.3_Shorts_Ice_0.png",
  "S-Glitch_6.3_Shorts_Ice_1.png",
  "S-Glitch_6.3_Shorts_Peach_0.png",
  "S-Glitch_6.3_Shorts_Peach_1.png",
  "S-Glitch_6.3_Shorts_Pink_0.png",
  "S-Glitch_6.3_Shorts_Pink_1.png",
  "S-Glitch_6.3_Shorts_Volt_0.png",
  "S-Glitch_6.3_Shorts_Volt_1.png",
  "S-Glitch_6.3_Shorts_White_0.png",
  "S-Glitch_6.3_Shorts_White_1.png",
  "T-Icon_Oversized_Tee_Black.png",
  "T-Icon_Oversized_Tee_French_Navy.png",
  "T-Icon_Oversized_Tee_Heather_Grey.png",
  "T-Icon_Oversized_Tee_Stone.png",
  "T-Icon_Oversized_Tee_White.png",
  "T-Icon_Tie-Dye_Tee_Black.png",
  "T-Icon_Tie-Dye_Tee_Classic_rainbow.png",
  "T-Icon_Tie-Dye_Tee_Milky_way.png",
  "T-Icon_Tie-Dye_Tee_Navy.png",
  "T-Icon_Tie-Dye_Tee_Sherbet_Rainbow_sky_bust.jpg",
  "T-Icon_Tie-Dye_Tee_Sherbet_rainbow.png",
] as const;

export type GalleryKind = "worn" | "studio";

export type GalleryShot = {
  src: string;
  kind: GalleryKind;
  label: string;
};

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\u201c\u201d\u2018\u2019"']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mockupKey(name: string): string {
  return name
    .replace(/[\u201c\u201d\u2018\u2019"']/g, "")
    .replace(/\s*\[([^\]]+)\]\s*$/g, "_$1")
    .replace(/[^\w.]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function mockupRank(file: string): number {
  const n = file.toLowerCase();
  if (n.includes("sky_bust") || n.includes("_bust")) return 0;
  if (n.includes("_front")) return 1;
  if (/_0\.\w+$/.test(n)) return 2;
  if (n.includes("_rear") || n.includes("_back")) return 5;
  if (n.includes("_inside")) return 6;
  if (n.includes("_detail") || n.includes("_flat")) return 7;
  if (/_[123]\.\w+$/.test(n)) return 4;
  return 3;
}

function localMockupsFor(name: string): string[] {
  const key = mockupKey(name).toLowerCase();
  if (!key) return [];
  const hits = MOCKUP_FILES.filter((file) => {
    const stem = file.replace(/\.(png|jpe?g|webp)$/i, "").toLowerCase();
    return stem === key || stem.startsWith(`${key}_`);
  });
  return [...hits]
    .sort((a, b) => mockupRank(a) - mockupRank(b) || a.localeCompare(b))
    .map((file) => `/mockups/${file}`);
}

function wornDrapeFor(name: string): string | null {
  const slug = slugFromName(name);
  const tries = [
    slug,
    slug.replace("yoga-", ""),
    slug.replace(/-dash-(black|white)$/, "-dash"),
  ];
  for (const key of tries) {
    const url = getDrapeCdnUrl(key);
    if (url) return url;
  }
  return null;
}

export function hiResProductImage(src: string | undefined | null, width = 1600): string {
  if (!src) return "";
  try {
    const url = new URL(src, typeof window === "undefined" ? "https://xixvi.shop" : window.location.origin);

    if (url.hostname.includes("supabase.co") && url.pathname.includes("/storage/v1/object/public/")) {
      url.pathname = url.pathname.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
      url.searchParams.set("width", String(width));
      url.searchParams.set("quality", "90");
      url.searchParams.set("resize", "contain");
      return url.toString();
    }

    if (url.hostname.includes("printful") || url.hostname.includes("pf-cdn")) {
      url.searchParams.set("w", String(width));
    }

    return url.toString();
  } catch {
    return src;
  }
}

export function productGallery(name: string, images: string[] | undefined | null): GalleryShot[] {
  const shots: GalleryShot[] = [];
  const seen = new Set<string>();
  const push = (src: string, kind: GalleryKind, label: string) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    shots.push({ src, kind, label });
  };

  const worn = wornDrapeFor(name);
  if (worn) push(worn, "worn", "On form");

  for (const src of localMockupsFor(name)) {
    push(src, "studio", "Studio");
  }

  for (const src of images ?? []) {
    if (!src) continue;
    if (/printful|pf-cdn|showroom-catalog/i.test(src) && shots.length > 0) continue;
    push(src, "studio", "Studio");
  }

  return shots;
}

export function heroShot(name: string, images?: string[] | null): GalleryShot | null {
  return productGallery(name, images)[0] ?? (images?.[0] ? { src: images[0], kind: "studio", label: "Studio" } : null);
}

export function heroImage(name: string, images?: string[] | null): string {
  return heroShot(name, images)?.src ?? "";
}
