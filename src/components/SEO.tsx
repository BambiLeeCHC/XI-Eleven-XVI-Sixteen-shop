import { Helmet } from "react-helmet-async";

const SITE_URL = "https://xixvi.shop";
const BRAND = "XI Eleven XVI Sixteen";
const BRAND_SHORT = "XI · XVI";
const DEFAULT_TITLE = "XI Eleven XVI Sixteen — Made-on-Demand Streetwear";
const DEFAULT_DESCRIPTION =
  "Shop XI Eleven XVI Sixteen (XI · XVI) at xixvi.shop — made-on-demand luxury streetwear. Slip dresses, performance jerseys, glitch shorts, leggings and sports bras. Free natal chart in True North. Free shipping.";
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;
const INSTAGRAM = "https://www.instagram.com/xielevenxvisixteen/";
const LOGO =
  "https://liiyalnrsilwskqidvzw.supabase.co/storage/v1/object/public/site-media/legacy/9f36be32-eae9-430a-ac7e-ab617f632b25.png";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

function withBrand(title?: string) {
  if (!title) return DEFAULT_TITLE;
  if (/XI Eleven XVI Sixteen|XI · XVI/i.test(title)) return title;
  return `${title} | ${BRAND}`;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  jsonLd,
  noindex = false,
}: SEOProps) {
  const fullTitle = withBrand(title);
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const ogType = type === "product" ? "product" : type === "article" ? "article" : "website";

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large"
        }
      />

      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={BRAND} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@xielevenxvisixteen" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

export function buildProductJsonLd(product: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  images: string[];
  sizes: string[];
  category: string;
  _id: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    url: `${SITE_URL}/product/${product._id}`,
    brand: {
      "@type": "Brand",
      name: BRAND,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product._id}`,
      priceCurrency: product.currency || "USD",
      price: (product.price / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: BRAND,
      },
    },
    ...(product.sizes.length > 0 && {
      size: product.sizes,
    }),
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#org`,
    name: BRAND,
    alternateName: [BRAND_SHORT, "XIXVI", "xixvi", "XI XVI"],
    url: SITE_URL,
    logo: LOGO,
    image: DEFAULT_IMAGE,
    email: "support@xixvi.shop",
    sameAs: [INSTAGRAM],
    description:
      "Made-on-demand luxury streetwear and True North — a free natal chart, daily Journal draw, and Long Read tarot. XI Eleven XVI Sixteen L.L.C., Florida.",
    address: {
      "@type": "PostalAddress",
      addressRegion: "FL",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@xixvi.shop",
      availableLanguage: "English",
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BRAND,
    alternateName: [BRAND_SHORT, "xixvi.shop"],
    publisher: { "@id": `${SITE_URL}/#org` },
    inLanguage: "en-US",
  };
}

export function buildTrueNorthJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is True North on xixvi.shop?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "True North is the private observatory of XI Eleven XVI Sixteen. Register for a free natal chart — placements, houses, and a written profile — plus the Journal daily draw and the 11:16 Almanac.",
        },
      },
      {
        "@type": "Question",
        name: "Is the natal chart free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Your natal chart is free the moment you create an account on xixvi.shop. No card on file.",
        },
      },
      {
        "@type": "Question",
        name: "What is the Long Read?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Long Read is a seven-card tarot draw, three times a day, written against what is actually going on for you. Seven-day free trial, then $7 per week. Cancel anytime.",
        },
      },
      {
        "@type": "Question",
        name: "What does 11:16 mean for XI Eleven XVI Sixteen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Eleven is the signal. Sixteen is the reckoning. 11:16 is the brand hour — set intention in the morning, check your work at night. The Almanac keeps that time.",
        },
      },
    ],
  };
}

export default SEO;
