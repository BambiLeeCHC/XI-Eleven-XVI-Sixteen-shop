import { useMemo } from "react";
import { ColorwayCard, MockupChip } from "../components/ColorwayCard";
import { buildBreadcrumbJsonLd, SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useQuery } from "../lib/backend";
import {
  colorFromName,
  formatPrice,
  groupProductsByStyle,
  snapHex,
} from "../lib/brand";
import { flatMockup } from "../lib/flatMockup";

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
          <>
          <div className="look-grid">
            {groups.flatMap(group =>
              group.items.map(item => {
                const color = colorFromName(item.name) || item.name;
                return (
                  <ColorwayCard
                    key={item._id}
                    href={`/product/${item._id}`}
                    name={`${group.key}${color ? ` · ${color}` : ""}`}
                    price={formatPrice(item.price)}
                    images={item.images || []}
                  />
                );
              }),
            )}
          </div>
          <div className="look-chip-row">
            {groups.flatMap(group =>
              group.items.map(item => {
                const color = colorFromName(item.name) || item.name;
                return (
                  <MockupChip
                    key={item._id}
                    href={`/product/${item._id}`}
                    label={color}
                    image={flatMockup(item.name, item.images).url || item.images?.[0]}
                    glow={snapHex(color)}
                  />
                );
              }),
            )}
          </div>
          </>
        )}
      </section>
    </>
  );
}

export default CategoryPage;
