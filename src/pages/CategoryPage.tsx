import { useMemo } from "react";
import { Link } from "react-router-dom";
import { buildBreadcrumbJsonLd, SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useQuery } from "../lib/backend";
import {
  colorCountLabel,
  colorFromName,
  formatPrice,
  groupProductsByStyle,
  snapHex,
} from "../lib/brand";

type Gender = "women" | "men";

export function CategoryPage({ gender }: { gender: Gender }) {
  const products = useQuery(api.products.list, { gender });
  const seo = gender === "women" ? PAGE_SEO.shopWomen : PAGE_SEO.shopMen;
  const path = gender === "women" ? "/women" : "/men";
  const title = gender === "women" ? "Women" : "Men";
  const accent = gender === "women" ? "var(--pist)" : "var(--powder)";
  const lede = gender === "women"
    ? "D-Slip, B-Lift, L-Flow — made on demand by XI Eleven XVI Sixteen."
    : "J-Glitch, S-Glitch, T-Icon — made on demand by XI Eleven XVI Sixteen.";

  const groups = useMemo(
    () =>
      groupProductsByStyle(
        (products ?? []) as {
          name: string;
          _id: string;
          price: number;
          images: string[];
        }[],
      ),
    [products],
  );

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: `${title}'s Shop`, url: path },
  ]);

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={path}
        jsonLd={breadcrumbLd}
      />

      <section className="px-7 pt-10 pb-8">
        <p className="label-lock" style={{ color: accent }}>
          XI · XVI · Est. 11:16
        </p>
        <h1
          className="clash mt-4"
          style={{ fontSize: "clamp(56px, 12vw, 120px)" }}
        >
          {title}
        </h1>
        <p className="serif-quiet text-2xl mt-5 max-w-xl">{lede}</p>
        {products === undefined ? (
          <p className="label-lock mt-6" style={{ color: "var(--mute)" }}>
            Loading looks…
          </p>
        ) : null}
      </section>

      <section className="px-7 pb-16">
        {products === undefined ? (
          <p className="serif-quiet" style={{ color: "var(--mute)" }}>
            Loading looks…
          </p>
        ) : groups.length === 0 ? (
          <p className="serif-quiet">No looks in this filter.</p>
        ) : (
          <div className="shop-grid">
            {groups.map(group => {
              const hero = group.items[0];
              return (
                <article key={group.key} className="shop-card">
                  <Link to={`/product/${hero._id}`} className="shop-card__photo">
                    {hero.images?.[0] ? (
                      <img
                        src={hero.images[0]}
                        alt={group.key}
                      />
                    ) : null}
                  </Link>
                  <div className="shop-card__meta">
                    <Link to={`/product/${hero._id}`}>
                      <p className="clash">{group.key}</p>
                      <p className="serif-quiet">
                        {formatPrice(hero.price)}
                        {group.items.length > 1
                          ? ` · ${colorCountLabel(group.items.length)}`
                          : ""}
                      </p>
                    </Link>
                    <div className="shop-card__colors">
                      {group.items.map(item => {
                        const color = colorFromName(item.name) || item.name;
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

export default CategoryPage;
