import { useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  ImpactHero,
  JournalTrueNorthRooms,
  PistachioTicker,
  ProcessSteps,
} from "../components/ImpactHero";
import { ProductHighlight } from "../components/ProductHighlight";
import { buildBreadcrumbJsonLd, SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useQuery } from "../lib/backend";
import {
  colorFromName,
  displayProductName,
  formatPrice,
  itemsForStyle,
  STYLE_ORDER,
  snapHex,
  styleKeyFromName,
} from "../lib/brand";
import { hiResProductImage } from "../lib/productImage";
import { RadialVariantDial } from "../components/RadialVariantDial";

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

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const current =
    groups.find(g => g.key === (activeKey ?? groups[0]?.key)) ?? groups[0];
  const [skuId, setSkuId] = useState<string | null>(null);
  const sku = current?.items.find(p => p._id === skuId) ?? current?.items[0];
  const [size, setSize] = useState<string>("");

  const dslipColors = itemsForStyle(products ?? [], "D-Slip");
  const dslip = dslipColors[0];

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
      <ImpactHero
        dslipHref={dslip ? `/product/${dslip._id}` : "/shop"}
        dslipPrice={dslip?.price}
        dslipColors={dslipColors}
      />
      <PistachioTicker />

      <section id="women" className="style-index">
        <aside
          className="style-index__rail"
          style={{ background: "#111", borderRight: "4px solid var(--pist)" }}
        >
          <p
            className="label-lock style-index__label"
            style={{ color: "var(--pist)" }}
          >
            Style index
          </p>
          {products === undefined ? (
            <p className="serif-quiet text-sm" style={{ color: "var(--mute)" }}>
              Loading looks…
            </p>
          ) : (
            groups.map(group => {
              const on = group.key === current?.key;
              const price = group.items[0]?.price;
              return (
                <button
                  type="button"
                  key={group.key}
                  onClick={() => {
                    setActiveKey(group.key);
                    setSkuId(group.items[0]?._id ?? null);
                    setSize("");
                  }}
                  className={`style-index__item ${on ? "is-on" : ""}`}
                  style={{
                    color: on ? "var(--cream)" : "#8a8a8a",
                    background: on ? "rgba(216,240,196,0.08)" : "transparent",
                  }}
                >
                  <span
                    className="style-index__dot"
                    style={{ background: on ? "var(--pist)" : "#444" }}
                  />
                  <span className="clash style-index__name">{group.key}</span>
                  <span className="style-index__price">
                    {price ? formatPrice(price) : "—"}
                  </span>
                </button>
              );
            })
          )}
          <p
            className="serif-quiet style-index__count"
            style={{ color: "var(--pist)" }}
          >
            {groups.length} styles
          </p>
        </aside>

        <div className="style-index__frame" style={{ background: "var(--cream)" }}>
          <div className="style-index__stage product-stage">
            {sku?.images?.[0] ? (
              <img
                src={hiResProductImage(sku.images[0], 1800)}
                alt={sku.name}
                className="product-stage__shot"
                decoding="async"
                fetchPriority="high"
              />
            ) : null}
            <span className="product-stage__grain" aria-hidden="true" />

            {sku ? (
              <>
                <div className="bib absolute left-6 top-7 z-[3]">
                  <div className="holes">
                    <i />
                    <i />
                    <i />
                  </div>
                  <p className="text-[11px] tracking-[0.2em] uppercase font-extrabold">
                    {displayProductName(sku.name)}
                  </p>
                </div>
                <div className="price-tag absolute right-7 top-9 z-[3]">
                  <p className="serif-quiet">Hang</p>
                  <p className="p">{formatPrice(sku.price)}</p>
                </div>
              </>
            ) : (
              <div className="serif-quiet">No looks in this filter.</div>
            )}
          </div>

          {sku ? (
            <div
              className="style-index__controls relative"
              style={{
                background: "#0B0B0C",
                border: "3px solid var(--cream)",
                padding: "16px 18px",
              }}
            >
              <RadialVariantDial
                sizes={(() => {
                  const labels = new Map<string, string>();
                  for (const item of current?.items || []) {
                    for (const raw of item.sizes || []) {
                      const label = String(raw).split("/").pop()?.trim() || raw;
                      if (!labels.has(label)) labels.set(label, raw);
                    }
                  }
                  if (labels.size === 0) {
                    for (const label of ["XS", "S", "M", "L", "XL", "2XL"]) {
                      labels.set(label, label);
                    }
                  }
                  return [...labels.entries()].map(([label, id]) => ({
                    id,
                    label,
                    available: (current?.items || []).some((item: any) =>
                      (item.sizes || ["XS", "S", "M", "L", "XL"]).some(
                        (raw: string) =>
                          (String(raw).split("/").pop()?.trim() || raw) === label,
                      ),
                    ),
                  }));
                })()}
                colors={(current?.items || []).map((item: any) => {
                  const label = colorFromName(item.name) || displayProductName(item.name);
                  const wanted = size
                    ? String(size).split("/").pop()?.trim() || size
                    : "";
                  const available = !wanted
                    ? true
                    : (item.sizes || ["XS", "S", "M", "L", "XL"]).some(
                        (raw: string) =>
                          (String(raw).split("/").pop()?.trim() || raw) === wanted,
                      );
                  return {
                    id: item._id as string,
                    label,
                    hex: snapHex(label),
                    available,
                  };
                })}
                sizeId={size}
                colorId={sku._id}
                onSize={setSize}
                onColor={next => {
                  setSkuId(next);
                  const item = current?.items.find((entry: any) => entry._id === next);
                  const wanted = size
                    ? String(size).split("/").pop()?.trim() || size
                    : "";
                  if (
                    wanted &&
                    item &&
                    !(item.sizes || []).some(
                      (raw: string) =>
                        (String(raw).split("/").pop()?.trim() || raw) === wanted,
                    )
                  ) {
                    setSize("");
                  }
                }}
              />
              <Link
                to={`/product/${sku._id}${size ? `?size=${encodeURIComponent(String(size).split("/").pop()?.trim() || size)}` : ""}`}
                className="cta-pist text-center"
              >
                {size ? "Add to cart" : "Select a size"}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <ProductHighlight products={products ?? []} />

      <ProcessSteps />
      <JournalTrueNorthRooms />
    </>
  );
}
