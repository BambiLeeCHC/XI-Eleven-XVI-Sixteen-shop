/**
 * SEO meta titles & descriptions for every page.
 * Titles are appended with " | XI · XVI" by the SEO component.
 *
 * Guidelines:
 *   • Title: ≤60 chars (before suffix)
 *   • Description: 120–155 chars
 */

export const PAGE_SEO = {
  home: {
    title: "", // Uses default: "XI · XVI — Luxury Fashion, Precision Fit"
    description:
      "Shop XI · XVI luxury streetwear — slip dresses, performance jerseys, glitch shorts, leggings & sports bras. Precision fit, premium materials. Free shipping.",
  },
  shopAll: {
    title: "Shop All",
    description:
      "Browse the full XI · XVI collection — 24 luxury streetwear pieces for women and men. Dresses, jerseys, shorts, leggings, and activewear. Free shipping.",
  },
  shopWomen: {
    title: "Women's Collection",
    description:
      "Shop XI · XVI women's luxury streetwear — silk-feel slip dresses, high-waist leggings, and supportive sports bras. Sizes XS–2XL. Free shipping.",
  },
  shopMen: {
    title: "Men's Collection",
    description:
      "Shop XI · XVI men's performance streetwear — recycled-polyester jerseys and glitch shorts with UPF50+ protection. Sizes 2XS–6XL. Free shipping.",
  },
  cart: {
    title: "Your Cart",
    description:
      "Review your XI · XVI shopping cart. Luxury streetwear with free shipping and easy returns.",
  },
  checkout: {
    title: "Checkout",
    description:
      "Complete your XI · XVI order — secure checkout with Stripe. Free shipping on all orders.",
  },
  sizeGuide: {
    title: "Size Guide",
    description:
      "Find your perfect fit with XI · XVI size charts. Measurement guides for dresses, jerseys, shorts, leggings, and sports bras.",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "XI · XVI privacy policy — how we collect, use, and protect your personal information.",
  },
  terms: {
    title: "Terms of Service",
    description:
      "XI · XVI terms and conditions for shopping at our online store.",
  },
  shippingPolicy: {
    title: "Shipping Policy",
    description:
      "XI · XVI shipping information — delivery times, costs, and international shipping details.",
  },
  returns: {
    title: "Returns & Exchanges",
    description:
      "XI · XVI return and exchange policy — hassle-free returns within 30 days of delivery.",
  },
} as const;

/**
 * Product SEO meta — generated per-product.
 * Returns title (≤60) and description (120–155 chars).
 */
export function getProductSEO(product: {
  name: string;
  category: string;
  price: number;
  description: string;
}) {
  const priceStr = `$${(product.price / 100).toFixed(0)}`;

  // Build a punchy meta description from the full description
  const shortDesc = product.description.split(".").slice(0, 2).join(".") + ".";
  const metaDesc =
    shortDesc.length <= 155
      ? shortDesc
      : product.description.slice(0, 152).replace(/\s+\S*$/, "") + "…";

  return {
    title: `${product.name} — ${priceStr}`,
    description: metaDesc,
  };
}
