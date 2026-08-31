/**
 * SEO meta titles & descriptions for xixvi.shop.
 * Titles are appended with " | XI Eleven XVI Sixteen" unless they already name the brand.
 *
 * Guidelines:
 *   • Title: ≤60 chars (before suffix)
 *   • Description: 120–155 chars
 *   • Always spell XI Eleven XVI Sixteen once in the description.
 */

export const PAGE_SEO = {
  home: {
    title: "",
    description:
      "Shop XI Eleven XVI Sixteen (XI · XVI) at xixvi.shop — made-on-demand luxury streetwear. Slip dresses, jerseys, glitch shorts, leggings. Free natal chart in True North.",
  },
  shopAll: {
    title: "Shop All",
    description:
      "Browse XI Eleven XVI Sixteen at xixvi.shop — D-Slip, B-Lift, L-Flow, J-Glitch, S-Glitch, T-Icon. Made on demand. Free shipping.",
  },
  shopWomen: {
    title: "Women's Collection",
    description:
      "Women's XI Eleven XVI Sixteen — silk-feel D-Slip dresses, B-Lift sports bras, L-Flow leggings. Made on demand at xixvi.shop. Sizes XS–2XL.",
  },
  shopMen: {
    title: "Men's Collection",
    description:
      "Men's XI Eleven XVI Sixteen — J-Glitch jerseys and S-Glitch shorts with UPF50+. Made on demand at xixvi.shop. Sizes 2XS–6XL.",
  },
  about: {
    title: "About",
    description:
      "XI Eleven XVI Sixteen is made-on-demand luxury streetwear from Florida. No overstock. Numerology in the cut — True North, the Journal, 11:16.",
  },
  contact: {
    title: "Contact",
    description:
      "Contact XI Eleven XVI Sixteen at support@xixvi.shop — orders, fit, True North, and the Journal.",
  },
  journal: {
    title: "The Journal",
    description:
      "The XI Eleven XVI Sixteen Journal at xixvi.shop — 11:16 Almanac, daily code, and a free house-deck draw. Editorial from the brand.",
  },
  chart: {
    title: "True North — Free Natal Chart",
    description:
      "Free natal chart from XI Eleven XVI Sixteen at xixvi.shop. Placements, houses, written profile. Long Read tarot: 7-day trial, then $7/week.",
  },
  longRead: {
    title: "The Long Read — Daily Tarot",
    description:
      "The Long Read on xixvi.shop: seven cards, three times a day, read against what's actually going on. XI Eleven XVI Sixteen. 7 days free, then $7/week.",
  },
  almanac: {
    title: "The Almanac — 11:16",
    description:
      "The XI Eleven XVI Sixteen Almanac — the day's moon, day number, and the 11:16 hour. True North on xixvi.shop.",
  },
  numbers: {
    title: "Numerology",
    description:
      "Life Path, Expression, Soul Urge — numerology underneath your natal chart. XI Eleven XVI Sixteen True North on xixvi.shop. $19.99 once.",
  },
  cart: {
    title: "Your Cart",
    description:
      "Your XI Eleven XVI Sixteen cart at xixvi.shop. Made-on-demand streetwear. Free shipping.",
  },
  checkout: {
    title: "Checkout",
    description:
      "Secure checkout for XI Eleven XVI Sixteen — Stripe. Free shipping from xixvi.shop.",
  },
  sizeGuide: {
    title: "Size Guide",
    description:
      "XI Eleven XVI Sixteen size charts — D-Slip, jerseys, shorts, leggings, sports bras. Find your fit at xixvi.shop.",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "XI Eleven XVI Sixteen privacy policy — how xixvi.shop collects, uses, and protects your information.",
  },
  terms: {
    title: "Terms of Service",
    description:
      "Terms for shopping XI Eleven XVI Sixteen at xixvi.shop.",
  },
  shippingPolicy: {
    title: "Shipping Policy",
    description:
      "XI Eleven XVI Sixteen shipping — made on demand, delivery windows, and international orders from xixvi.shop.",
  },
  returns: {
    title: "Returns & Exchanges",
    description:
      "XI Eleven XVI Sixteen returns — hassle-free exchanges within 30 days. xixvi.shop.",
  },
} as const;

export function getProductSEO(product: {
  name: string;
  category: string;
  price: number;
  description: string;
}) {
  const priceStr = `$${(product.price / 100).toFixed(0)}`;
  const shortDesc = product.description.split(".").slice(0, 2).join(".") + ".";
  const branded = `${shortDesc} XI Eleven XVI Sixteen. Made on demand at xixvi.shop.`;
  const metaDesc =
    branded.length <= 160
      ? branded
      : branded.slice(0, 157).replace(/\s+\S*$/, "") + "…";

  return {
    title: `${product.name} — ${priceStr}`,
    description: metaDesc,
  };
}
