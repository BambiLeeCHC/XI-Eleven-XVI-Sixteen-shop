import { useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { ColorwayCard } from "../components/ColorwayCard";
import { buildBreadcrumbJsonLd, SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useQuery } from "../lib/backend";
import {
  colorFromName,
  formatPrice,
  groupProductsByStyle,
} from "../lib/brand";

export function ShopPage() {
  const [searchParams] = useSearchParams();
  const gender = searchParams.get("gender") || undefined;
  const products = useQuery(api.products.list, {});
  const seo = PAGE_SEO.shopAll;
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Shop all", url: "/shop" },
  ]);

  const cards = useMemo(
    () =>
      groupProductsByStyle(
        (products ?? []) as {
          name: string;
          _id: string;
          price: number;
          images: string[];
        }[],
      ).flatMap(group =>
        group.items.map(item => {
          const color = colorFromName(item.name);
          return {
            id: item._id,
            name: `${group.key}${color ? ` · ${color}` : ""}`,
            price: formatPrice(item.price),
            images: item.images || [],
          };
        }),
      ),
    [products],
  );

  if (gender === "women") return <Navigate to="/women" replace />;
  if (gender === "men") return <Navigate to="/men" replace />;

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url="/shop"
        jsonLd={breadcrumbLd}
      />
      <section className="shop-all">
        <p className="shop-all__kicker">Inventory</p>
        <h1>Shop all</h1>
        <p className="shop-all__lede">
          Every colorway. Open a card for the piece.
        </p>
        {products === undefined ? (
          <p className="shop-all__status">Loading looks…</p>
        ) : cards.length === 0 ? (
          <p className="shop-all__status">Nothing is listed yet.</p>
        ) : (
          <div className="look-grid">
            {cards.map(item => (
              <ColorwayCard
                key={item.id}
                href={`/product/${item.id}`}
                name={item.name}
                price={item.price}
                images={item.images}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
