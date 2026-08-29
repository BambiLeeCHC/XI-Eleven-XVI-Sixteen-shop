/**
 * Serve product photos at display size instead of the tiny Printful /
 * catalog thumbs, and keep a single photographic treatment for every stage.
 */

export function hiResProductImage(src: string | undefined | null, width = 1600): string {
  if (!src) return "";
  try {
    const url = new URL(src, typeof window === "undefined" ? "https://xixvi.shop" : window.location.origin);

    if (url.hostname.includes("supabase.co") && url.pathname.includes("/storage/v1/object/public/")) {
      url.pathname = url.pathname.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
      url.searchParams.set("width", String(width));
      url.searchParams.set("quality", "85");
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
