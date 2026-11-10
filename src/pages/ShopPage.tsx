import { useMemo } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { buildBreadcrumbJsonLd, SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useQuery } from "../lib/backend";
import {
  colorFromName,
  displayProductName,
  formatPrice,
  STYLE_ORDER,
  snapHex,
  styleKeyFromName,
} from "../lib/brand";
import { hiResProductImage } from "../lib/productImage";

export function ShopPage() {
  const [searchParams] = useSearchParams();
  const gender = searchParams.get("gender") || undefined;
  const category = searchParams.get("category") || undefined;

  const products = useQuery(api.products.list, {
    gender: gender || undefined,
    category: category === "All" ? undefined : category || undefined,
  });

  const seo =
    gender === "women"
      ? PAGE_SEO.shopWomen
      : gender === "men"
        ? PAGE_SEO.shopMen
        : PAGE_SEO.shopAll;
  const shopUrl = gender ? `/shop?gender=${gender}` : "/shop";
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    {
      name: gender
        ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Shop`
        : "Shop",
      url: shopUrl,
    },
  ]);

  const groups = useMemo(() => {
    const list = products ?? [];
    const map = new Map<string, any[]>();
    for (const product of list) {
      const key = styleKeyFromName(product.name);
      const bucket = map.get(key) ?? [];
      bucket.push(product);
      map.set(key, bucket);
    }
    const ordered: { key: string; items: any[] }[] = STYLE_ORDER.filter(key =>
      map.has(key),
    ).map(key => ({
      key,
      items: map.get(key) ?? [],
    }));
    for (const [key, items] of map.entries()) {
      if (!(STYLE_ORDER as readonly string[]).includes(key))
        ordered.push({ key, items });
    }
    return ordered;
  }, [products]);

  if (gender === "women") return <Navigate to="/women" replace />;
  if (gender === "men") return <Navigate to="/men" replace />;

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={shopUrl}
        jsonLd={breadcrumbLd}
      />
      <section className="shop-catalog">
        <header className="shop-catalog__head">
          <p className="label-lock">The shop</p>
          <h1 className="clash">All cuts.</h1>
          <p className="serif-quiet">Made when you order it. One piece, your size, your color.</p>
        </header>
        {products === undefined ? (
          <p className="serif-quiet">Loading the shop…</p>
        ) : groups.length === 0 ? (
          <p className="serif-quiet">Nothing in this filter.</p>
        ) : (
          <div className="shop-grid">
            {groups.map(group => {
              const hero = group.items[0];
              return (
                <article key={group.key} className="shop-card">
                  <Link to={`/product/${hero._id}`} className="shop-card__photo">
                    {hero.images?.[0] ? (
                      <img src={hiResProductImage(hero.images[0], 900)} alt={group.key} />
                    ) : null}
                  </Link>
                  <div className="shop-card__meta">
                    <Link to={`/product/${hero._id}`}>
                      <p className="clash">{group.key}</p>
                      <p className="serif-quiet">
                        {formatPrice(hero.price)}
                        {group.items.length > 1 ? ` · ${group.items.length} colors` : ""}
                      </p>
                    </Link>
                    <div className="shop-card__colors">
                      {group.items.map((item: any) => {
                        const color = colorFromName(item.name) || displayProductName(item.name);
                        return (
                          <Link
                            key={item._id}
                            to={`/product/${item._id}`}
                            aria-label={color}
                            className="snap"
                            style={{ background: snapHex(color) }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
