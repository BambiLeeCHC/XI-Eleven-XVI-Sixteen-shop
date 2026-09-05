/**
 * SEO meta titles & descriptions for xixvi.shop.
 * Titles are appended with " | XI Eleven XVI Sixteen" unless they already name the brand.
 */

export const PAGE_SEO = {
  home: {
    title: "",
    description:
      "XI Eleven XVI Sixteen clothing, made when you order it. Dresses, bras, leggings, jerseys, shorts. Written tarot is a separate $7/week product.",
  },
  shopAll: {
    title: "Shop All",
    description:
      "Browse XI Eleven XVI Sixteen — D-Slip, B-Lift, L-Flow, J-Glitch, S-Glitch. Made on demand. Free shipping from xixvi.shop.",
  },
  shopWomen: {
    title: "Women's Collection",
    description:
      "Women's XI Eleven XVI Sixteen — D-Slip dresses, B-Lift sports bras, L-Flow leggings. Made on demand. Sizes XS–2XL.",
  },
  shopMen: {
    title: "Men's Collection",
    description:
      "Men's XI Eleven XVI Sixteen — J-Glitch jerseys and S-Glitch shorts. Made on demand at xixvi.shop. Sizes 2XS–6XL.",
  },
  about: {
    title: "About",
    description:
      "XI Eleven XVI Sixteen makes clothing to order. The Journal is writing. True North is a $7/week written tarot membership.",
  },
  contact: {
    title: "Contact",
    description:
      "Contact XI Eleven XVI Sixteen at support@xixvi.shop — orders, fit, and the Long Read.",
  },
  journal: {
    title: "The Journal",
    description:
      "The XI Eleven XVI Sixteen Journal — fit guides and how the house cuts clothing. Readings live in True North, not here.",
  },
  chart: {
    title: "True North",
    description:
      "True North is the reading room of XI Eleven XVI Sixteen. Free natal chart with an account. Long Read: written tarot, $7/week.",
  },
  longRead: {
    title: "The Long Read — $7/week",
    description:
      "Three written tarot readings a day, based on what you tell us. $7 a week after a seven-day trial. Cancel anytime.",
  },
  almanac: {
    title: "The Almanac — 11:16",
    description:
      "The XI Eleven XVI Sixteen Almanac lives inside True North — moon, day number, and the 11:16 hour.",
  },
  numbers: {
    title: "Numerology",
    description:
      "Life Path, Expression, Soul Urge under your natal chart. XI Eleven XVI Sixteen True North. $19.99 once.",
  },
  cart: {
    title: "Your Cart",
    description:
      "Your XI Eleven XVI Sixteen cart. Made-on-demand clothing. Free shipping.",
  },
  checkout: {
    title: "Checkout",
    description:
      "Secure checkout for XI Eleven XVI Sixteen. Stripe. Free shipping from xixvi.shop.",
  },
  sizeGuide: {
    title: "Size Guide",
    description:
      "XI Eleven XVI Sixteen size charts — dresses, jerseys, shorts, leggings, sports bras.",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "XI Eleven XVI Sixteen privacy policy — how xixvi.shop collects and protects your information.",
  },
  terms: {
    title: "Terms of Service",
    description:
      "Terms for shopping XI Eleven XVI Sixteen at xixvi.shop.",
  },
  shippingPolicy: {
    title: "Shipping Policy",
    description:
      "XI Eleven XVI Sixteen shipping — made on demand, delivery windows, international orders.",
  },
  returns: {
    title: "Returns & Exchanges",
    description:
      "XI Eleven XVI Sixteen returns — exchanges within 30 days.",
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
  const branded = `${shortDesc} XI Eleven XVI Sixteen. Made on demand.`;
  const metaDesc =
    branded.length <= 160
      ? branded
      : branded.slice(0, 157).replace(/\s+\S*$/, "") + "…";

  return {
    title: `${product.name} — ${priceStr}`,
    description: metaDesc,
  };
}
