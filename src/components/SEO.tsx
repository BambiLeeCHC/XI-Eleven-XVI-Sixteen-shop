import { Helmet } from "react-helmet-async";

const SITE_URL = "https://xi-xvi-store-b70b82f5.viktor.space";
const BRAND = "XI · XVI";
const DEFAULT_TITLE = "XI · XVI — Luxury Fashion, Precision Fit";
const DEFAULT_DESCRIPTION =
  "Shop XI Eleven XVI Sixteen — luxury streetwear engineered for precision fit. Slip dresses, performance jerseys, glitch shorts, leggings & sports bras. Free shipping.";
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product";
  /** JSON-LD structured data object — will be injected as <script type="application/ld+json"> */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
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
  const fullTitle = title ? `${title} | ${BRAND}` : DEFAULT_TITLE;
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type === "product" ? "product" : "website"} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="XI · XVI" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

/* ── Helper: build Product JSON-LD ── */
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
  const SITE = "https://xi-xvi-store-b70b82f5.viktor.space";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    url: `${SITE}/product/${product._id}`,
    brand: {
      "@type": "Brand",
      name: "XI Eleven XVI Sixteen",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${SITE}/product/${product._id}`,
      priceCurrency: product.currency || "USD",
      price: (product.price / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "XI Eleven XVI Sixteen",
      },
    },
    ...(product.sizes.length > 0 && {
      size: product.sizes,
    }),
  };
}

/* ── Helper: build breadcrumb JSON-LD ── */
export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  const SITE = "https://xi-xvi-store-b70b82f5.viktor.space";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE}${item.url}`,
    })),
  };
}

/* ── Helper: build Organization JSON-LD (homepage) ── */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "XI Eleven XVI Sixteen",
    alternateName: "XI · XVI",
    url: "https://xi-xvi-store-b70b82f5.viktor.space",
    logo: "https://decisive-cheetah-451.convex.cloud/api/storage/9f36be32-eae9-430a-ac7e-ab617f632b25",
    sameAs: ["https://www.instagram.com/xielevenxvisixteen/"],
    description:
      "Luxury streetwear brand engineered for precision fit. Slip dresses, performance jerseys, glitch shorts, and activewear.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "English",
    },
  };
}

export default SEO;
