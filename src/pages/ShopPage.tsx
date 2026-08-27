import { useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  ImpactHero,
  JournalTrueNorthRooms,
  PistachioTicker,
  ProcessSteps,
} from "../components/ImpactHero";
import { buildBreadcrumbJsonLd, SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useQuery } from "../lib/backend";
import {
  colorFromName,
  formatPrice,
  STYLE_ORDER,
  snapHex,
  styleKeyFromName,
} from "../lib/brand";

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
    const ordered = STYLE_ORDER.filter(key => map.has(key)).map(key => ({
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

  const dslip = (products ?? []).find((p: any) =>
    String(p.name).startsWith("D-Slip"),
  );

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
        lookCount={groups.length || 8}
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
            {groups.length} styles · SKUs intact
          </p>
        </aside>

        <div className="relative min-h-[92vh] overflow-hidden bg-black">
          {sku?.images?.[0] ? (
            <img
              src={sku.images[0]}
              alt={sku.name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 18%" }}
            />
          ) : null}

          {sku ? (
            <>
              <div className="bib absolute left-6 top-7 z-[3]">
                <div className="holes">
                  <i />
                  <i />
                  <i />
                </div>
                <p
                  className="serif-quiet text-[14px]"
                  style={{ textTransform: "none", letterSpacing: 0 }}
                >
                  Live SKU
                </p>
                <p className="num">
                  {String(
                    groups.findIndex(g => g.key === current?.key) + 1 || 1,
                  ).padStart(2, "0")}
                </p>
                <p className="text-[11px] tracking-[0.2em] uppercase font-extrabold">
                  {sku.name}
                </p>
              </div>
              <div className="price-tag absolute right-7 top-9 z-[3]">
                <p className="serif-quiet">Hang</p>
                <p className="p">{formatPrice(sku.price)}</p>
              </div>
              <div
                className="absolute left-5 right-5 bottom-5 z-[3] grid gap-4 items-end"
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
                    {sku.name} · {current?.items.length} live SKUs
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
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center serif-quiet">
              No looks in this filter.
            </div>
          )}
        </div>
      </section>

      <section
        id="men"
        className="px-7 py-14"
        style={{ background: "#F4EFE8", color: "#0B0B0C" }}
      >
        <div className="flex items-end justify-between gap-6">
          <h2 className="clash" style={{ fontSize: "clamp(42px, 6vw, 72px)" }}>
            Complete
            <br />
            the set
          </h2>
          <p className="serif-quiet text-[22px] max-w-sm">
            Three pieces that sit with D-Slip. Same SKUs. No leftover grid.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-7">
          {["B-Lift", "J-Glitch", "T-Icon"].map(key => {
            const item = (products ?? []).find((p: any) =>
              String(p.name).startsWith(key),
            );
            if (!item) return null;
            return (
              <Link
                key={key}
                to={`/product/${item._id}`}
                className="relative min-h-[420px] overflow-hidden block bg-neutral-300"
              >
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : null}
                <div className="absolute left-4 right-4 bottom-4">
                  <p
                    className="clash text-[32px] text-white"
                    style={{ textShadow: "0 2px 12px #000" }}
                  >
                    {key}
                  </p>
                  <span
                    className="inline-block mt-1.5 px-2 py-1 text-[12px] font-extrabold"
                    style={{ background: "#0B0B0C", color: "var(--pist)" }}
                  >
                    {formatPrice(item.price)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <ProcessSteps />
      <JournalTrueNorthRooms />
    </>
  );
}
