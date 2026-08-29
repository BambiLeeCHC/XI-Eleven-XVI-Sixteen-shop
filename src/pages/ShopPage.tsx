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
  colorCountLabel,
  colorFromName,
  displayProductName,
  formatPrice,
  itemsForStyle,
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

      <section
        id="women"
        className="grid md:grid-cols-[240px_1fr] min-h-[92vh]"
      >
        <aside
          className="p-7"
          style={{ background: "#111", borderRight: "4px solid var(--pist)" }}
        >
          <p className="label-lock mb-5" style={{ color: "var(--pist)" }}>
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
                  className="flex items-center w-full text-left py-3 uppercase tracking-[0.16em] text-[12px]"
                  style={{
                    color: on ? "var(--cream)" : "#8a8a8a",
                    background: on ? "rgba(216,240,196,0.08)" : "transparent",
                    margin: on ? "0 -18px" : 0,
                    paddingLeft: on ? 18 : 0,
                    paddingRight: on ? 18 : 0,
                  }}
                >
                  <span
                    className="inline-block mr-2.5 rounded-full"
                    style={{
                      width: on ? 10 : 8,
                      height: on ? 10 : 8,
                      background: on ? "var(--pist)" : "#444",
                    }}
                  />
                  <span
                    className="clash mr-2"
                    style={{ fontSize: 22, textTransform: "none" }}
                  >
                    {group.key}
                  </span>
                  {price ? formatPrice(price) : "—"}
                </button>
              );
            })
          )}
          <p
            className="serif-quiet mt-10 text-[15px]"
            style={{ color: "var(--pist)" }}
          >
            {groups.length} styles
          </p>
        </aside>

        <div className="flex flex-col min-h-[92vh]" style={{ background: "var(--cream)" }}>
          <div className="relative flex flex-1 items-center justify-center p-6 product-stage">
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
              className="relative grid gap-4 items-end m-5"
              style={{
                gridTemplateColumns: "1.2fr auto auto",
                background: "#0B0B0C",
                border: "3px solid var(--cream)",
                padding: "16px 18px",
              }}
            >
              <div>
                <p
                  className="label-lock mb-2"
                  style={{ color: "var(--pist)" }}
                >
                  Select a colour
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {current?.items.map((item: any) => {
                    const color = colorFromName(item.name) || item.name;
                    const on = item._id === sku._id;
                    return (
                      <button
                        type="button"
                        key={item._id}
                        aria-label={color}
                        className={`snap ${on ? "on" : ""}`}
                        style={{ background: snapHex(color) }}
                        onClick={() => setSkuId(item._id)}
                      />
                    );
                  })}
                </div>
                <p className="serif-quiet mt-3 text-[15px]">
                  {displayProductName(sku.name)}
                  {current?.items.length > 1
                    ? ` · ${colorCountLabel(current.items.length)}`
                    : ""}
                </p>
              </div>
              <div>
                <p
                  className="label-lock mb-2 text-center"
                  style={{ color: "var(--lilac)" }}
                >
                  Select a size
                </p>
                <div className="size-ring mx-auto">
                  {(sku.sizes || ["XS", "S", "M", "L", "XL"])
                    .slice(0, 6)
                    .map((label: string, i: number) => {
                      const clean =
                        String(label).split("/").pop()?.trim() || label;
                      return (
                        <button
                          type="button"
                          key={label}
                          className={size === label ? "on" : ""}
                          style={{ ["--i" as string]: i }}
                          onClick={() => setSize(label)}
                        >
                          {clean}
                        </button>
                      );
                    })}
                  <div className="core">Size</div>
                </div>
              </div>
              <Link
                to={`/product/${sku._id}`}
                className="cta-pist text-center"
                style={{ boxShadow: "5px 5px 0 var(--blush)" }}
              >
                Add to cart
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
