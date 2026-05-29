import { useQuery } from "convex/react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { SEO, buildBreadcrumbJsonLd } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";

const ALL_CATEGORIES = ["All", "Tops", "Bottoms", "Dresses", "Activewear"];
const MEN_CATEGORIES = ["All", "Tops", "Bottoms"];

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const gender = searchParams.get("gender") || undefined;
  const category = searchParams.get("category") || undefined;

  const products = useQuery(api.products.list, {
    gender: gender || undefined,
    category: category === "All" ? undefined : category || undefined,
  });
  const count = products?.length ?? 0;

  const title = gender ? gender.toUpperCase() : category ? category.toUpperCase() : "ALL";

  // Dynamic SEO based on filters
  const seo = gender === "women"
    ? PAGE_SEO.shopWomen
    : gender === "men"
      ? PAGE_SEO.shopMen
      : PAGE_SEO.shopAll;

  const shopUrl = gender ? `/shop?gender=${gender}` : "/shop";
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: gender ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Shop` : "Shop", url: shopUrl },
  ]);

  return (
    <>
    <SEO
      title={seo.title}
      description={seo.description}
      url={shopUrl}
      jsonLd={breadcrumbLd}
    />
    <div className="min-h-[80vh]">
      {/* Page Header */}
      <div className="pt-12 pb-8 px-6 text-center">
        <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "rgba(245, 200, 170, 0.45)" }}>COLLECTION</p>
        <h1 className="text-4xl md:text-6xl font-light text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
        <p className="text-[12px]" style={{ color: "rgba(245, 230, 220, 0.28)" }}>{count} piece{count !== 1 ? "s" : ""}</p>
      </div>

      {/* Category Filters */}
      <div className="flex justify-center gap-2 px-6 mb-12">
        {(gender === "men" ? MEN_CATEGORIES : ALL_CATEGORIES).map((cat) => {
          const isActive = cat === "All" ? !category : category === cat;
          return (
            <button
              type="button"
              key={cat}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (cat === "All") {
                  params.delete("category");
                } else {
                  params.set("category", cat);
                }
                setSearchParams(params);
              }}
              className="px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-semibold transition-all"
              style={{
                color: isActive ? "white" : "rgba(245, 230, 220, 0.4)",
                background: isActive
                  ? "linear-gradient(135deg, rgba(200,140,255,0.12), rgba(255,158,184,0.08))"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(200, 140, 255, 0.25)"
                  : "1px solid rgba(240, 210, 190, 0.1)",
                borderRadius: "10px",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
        {products === undefined ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-white/5 mb-3" style={{ borderRadius: "14px" }} />
                <div className="h-3 bg-white/5 w-3/4 mb-2" style={{ borderRadius: "6px" }} />
                <div className="h-3 bg-white/5 w-1/4" style={{ borderRadius: "6px" }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[14px]" style={{ color: "rgba(245, 230, 220, 0.4)" }}>No products found.</p>
            <p className="text-[12px] mt-2" style={{ color: "rgba(245, 230, 220, 0.22)" }}>Check back soon — new pieces dropping regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="group block spectrum-card-border"
              >
                <div
                  className="aspect-[3/4] overflow-hidden mb-3 relative"
                  style={{
                    background: "linear-gradient(145deg, rgba(255,240,230,0.03), rgba(200,160,220,0.02))",
                    border: "1px solid rgba(240, 210, 190, 0.08)",
                    borderRadius: "14px",
                  }}
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ borderRadius: "13px" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl" style={{ color: "rgba(245, 230, 220, 0.1)" }}>✦</span>
                    </div>
                  )}
                  {/* Glass hover overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(to top, rgba(14,10,15,0.5) 0%, transparent 50%)",
                      borderRadius: "13px",
                    }}
                  />
                </div>
                <h3 className="text-[12px] tracking-[0.1em] uppercase font-medium transition-colors" style={{ color: "rgba(245, 230, 220, 0.65)" }}>
                  {product.name}
                </h3>
                <p className="text-[12px] mt-1" style={{ color: "rgba(245, 230, 220, 0.35)" }}>
                  ${(product.price / 100).toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
