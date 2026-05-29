import { useState } from "react";
import { SEO, buildBreadcrumbJsonLd } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";

/* ─── Size Data ──────────────────────────────────────────────────── */

interface SizeRow {
  size: string;
  bust?: string;
  waist?: string;
  hips?: string;
  chest?: string;
  length?: string;
  inseam?: string;
}

const DRESS_SIZES: SizeRow[] = [
  { size: "XS",  bust: '31–33"',  waist: '24–26"',  hips: '34–36"',  length: '35"' },
  { size: "S",   bust: '33–35"',  waist: '26–28"',  hips: '36–38"',  length: '35.5"' },
  { size: "M",   bust: '35–37"',  waist: '28–30"',  hips: '38–40"',  length: '36"' },
  { size: "L",   bust: '37–40"',  waist: '30–33"',  hips: '40–43"',  length: '36.5"' },
  { size: "XL",  bust: '40–43"',  waist: '33–36"',  hips: '43–46"',  length: '37"' },
  { size: "2XL", bust: '43–46"',  waist: '36–39"',  hips: '46–49"',  length: '37.5"' },
];

const JERSEY_SIZES: SizeRow[] = [
  { size: "2XS", chest: '31–33"',  length: '26"' },
  { size: "XS",  chest: '33–35"',  length: '27"' },
  { size: "S",   chest: '35–37"',  length: '28"' },
  { size: "M",   chest: '37–40"',  length: '29"' },
  { size: "L",   chest: '40–43"',  length: '30"' },
  { size: "XL",  chest: '43–46"',  length: '31"' },
  { size: "2XL", chest: '46–49"',  length: '32"' },
  { size: "3XL", chest: '49–52"',  length: '33"' },
  { size: "4XL", chest: '52–55"',  length: '33.5"' },
  { size: "5XL", chest: '55–58"',  length: '34"' },
  { size: "6XL", chest: '58–62"',  length: '34.5"' },
];

const SHORTS_SIZES: SizeRow[] = [
  { size: "XS",  waist: '26–28"',  hips: '34–36"',  inseam: '2.5"' },
  { size: "S",   waist: '28–30"',  hips: '36–38"',  inseam: '2.5"' },
  { size: "M",   waist: '30–32"',  hips: '38–40"',  inseam: '2.5"' },
  { size: "L",   waist: '32–35"',  hips: '40–43"',  inseam: '2.5"' },
  { size: "XL",  waist: '35–38"',  hips: '43–46"',  inseam: '2.5"' },
  { size: "2XL", waist: '38–41"',  hips: '46–49"',  inseam: '2.5"' },
  { size: "3XL", waist: '41–44"',  hips: '49–52"',  inseam: '2.5"' },
];

const LEGGINGS_SIZES: SizeRow[] = [
  { size: "XS",  waist: '24–26"',  hips: '34–36"',  inseam: '27"' },
  { size: "S",   waist: '26–28"',  hips: '36–38"',  inseam: '27.5"' },
  { size: "M",   waist: '28–30"',  hips: '38–40"',  inseam: '28"' },
  { size: "L",   waist: '30–33"',  hips: '40–43"',  inseam: '28.5"' },
  { size: "XL",  waist: '33–36"',  hips: '43–46"',  inseam: '29"' },
  { size: "2XL", waist: '36–39"',  hips: '46–49"',  inseam: '29"' },
];

const BRA_SIZES: SizeRow[] = [
  { size: "XS",  bust: '30–32"',  waist: '24–26"' },
  { size: "S",   bust: '32–34"',  waist: '26–28"' },
  { size: "M",   bust: '34–36"',  waist: '28–30"' },
  { size: "L",   bust: '36–38"',  waist: '30–33"' },
  { size: "XL",  bust: '38–41"',  waist: '33–36"' },
  { size: "2XL", bust: '41–44"',  waist: '36–39"' },
];

/* ─── Tabs ───────────────────────────────────────────────────────── */

const TABS = [
  { key: "dresses",  label: "Dresses",    data: DRESS_SIZES,    cols: ["Size", "Bust", "Waist", "Hips", "Length"],          fields: ["size", "bust", "waist", "hips", "length"] as const,    note: "95% polyester / 5% elastane. Relaxed slip silhouette — if between sizes, go with the smaller for a sleeker fit." },
  { key: "jerseys",  label: "Jerseys",    data: JERSEY_SIZES,   cols: ["Size", "Chest", "Length"],                          fields: ["size", "chest", "length"] as const,                    note: "100% recycled polyester, two-way stretch. Athletic fit — size up for a relaxed look." },
  { key: "shorts",   label: "Shorts",     data: SHORTS_SIZES,   cols: ["Size", "Waist", "Hips", "Inseam"],                 fields: ["size", "waist", "hips", "inseam"] as const,            note: '91% recycled polyester / 9% spandex, four-way stretch. 2.5" inseam on all sizes.' },
  { key: "leggings", label: "Leggings",   data: LEGGINGS_SIZES, cols: ["Size", "Waist", "Hips", "Inseam"],                 fields: ["size", "waist", "hips", "inseam"] as const,            note: "75% recycled polyester / 25% elastane. High-waist, second-skin fit — size up if you prefer less compression." },
  { key: "bras",     label: "Sports Bras", data: BRA_SIZES,     cols: ["Size", "Bust", "Under-Bust"],                      fields: ["size", "bust", "waist"] as const,                      note: "75% recycled polyester / 25% elastane with removable pads. Medium support — true to size." },
] as const;

/* ─── Component ──────────────────────────────────────────────────── */

export function SizeGuidePage() {
  const [active, setActive] = useState("dresses");
  const tab = TABS.find((t) => t.key === active)!;

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Size Guide", url: "/size-guide" },
  ]);

  return (
    <>
      <SEO
        title={PAGE_SEO.sizeGuide.title}
        description={PAGE_SEO.sizeGuide.description}
        url="/size-guide"
        jsonLd={breadcrumbLd}
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
        {/* Header */}
        <h1
          className="text-3xl md:text-4xl text-white font-light mb-3 text-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Size Guide
        </h1>
        <p
          className="text-center text-[13px] mb-12"
          style={{ color: "rgba(245,230,220,0.4)" }}
        >
          All measurements in inches. Measure yourself and compare to the chart below.
        </p>

        {/* How to Measure */}
        <div
          className="mb-12 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(200,140,255,0.04), rgba(255,158,184,0.02))",
            border: "1px solid rgba(240,210,190,0.08)",
            borderRadius: "16px",
          }}
        >
          <h2
            className="text-[11px] tracking-[0.25em] uppercase font-semibold mb-4"
            style={{ color: "rgba(200,140,255,0.6)" }}
          >
            How to Measure
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Bust / Chest", desc: "Measure around the fullest part of your chest, keeping the tape level." },
              { label: "Waist / Under-Bust", desc: "Measure at your natural waistline, the narrowest point of your torso." },
              { label: "Hips", desc: "Stand with feet together and measure around the widest part of your hips." },
              { label: "Length / Inseam", desc: "For tops: shoulder to hem. For bottoms: crotch seam to leg opening." },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[12px] font-semibold text-white/70 mb-1">{item.label}</p>
                <p className="text-[12px]" style={{ color: "rgba(245,230,220,0.35)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className="px-5 py-2.5 text-[11px] tracking-[0.15em] uppercase transition-all"
              style={{
                color: active === t.key ? "white" : "rgba(245,230,220,0.4)",
                background:
                  active === t.key
                    ? "linear-gradient(135deg, rgba(200,140,255,0.15), rgba(255,158,184,0.08))"
                    : "transparent",
                border:
                  active === t.key
                    ? "1px solid rgba(200,140,255,0.3)"
                    : "1px solid rgba(240,210,190,0.08)",
                borderRadius: "12px",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Size Table */}
        <div
          className="overflow-x-auto"
          style={{
            border: "1px solid rgba(240,210,190,0.08)",
            borderRadius: "16px",
          }}
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr>
                {tab.cols.map((col) => (
                  <th
                    key={col}
                    className="px-5 py-4 text-left text-[10px] tracking-[0.2em] uppercase font-semibold"
                    style={{
                      color: "rgba(200,140,255,0.55)",
                      borderBottom: "1px solid rgba(240,210,190,0.08)",
                      background: "rgba(200,140,255,0.03)",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tab.data.map((row, i) => (
                <tr key={row.size}>
                  {tab.fields.map((field) => (
                    <td
                      key={field}
                      className="px-5 py-3.5"
                      style={{
                        color:
                          field === "size"
                            ? "rgba(245,230,220,0.7)"
                            : "rgba(245,230,220,0.45)",
                        fontWeight: field === "size" ? 600 : 400,
                        borderBottom:
                          i < tab.data.length - 1
                            ? "1px solid rgba(240,210,190,0.05)"
                            : "none",
                      }}
                    >
                      {(row as Record<string, string | undefined>)[field] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fit Note */}
        <p
          className="mt-6 text-[12px] text-center italic"
          style={{ color: "rgba(245,230,220,0.3)" }}
        >
          {tab.note}
        </p>

        {/* General Tips */}
        <div
          className="mt-12 p-6"
          style={{
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(240,210,190,0.06)",
            borderRadius: "16px",
          }}
        >
          <h2
            className="text-[11px] tracking-[0.25em] uppercase font-semibold mb-4"
            style={{ color: "rgba(245,230,220,0.5)" }}
          >
            General Tips
          </h2>
          <ul className="space-y-2 text-[12px]" style={{ color: "rgba(245,230,220,0.35)" }}>
            <li>• If you're between sizes, size up for a relaxed fit or down for compression.</li>
            <li>• All activewear (leggings, sports bras) uses four-way stretch fabric that molds to your shape.</li>
            <li>• Jersey and shorts fabrics have UPF50+ sun protection — great for outdoor training.</li>
            <li>• Dresses feature a built-in bra with adjustable tie-bow straps for customizable support.</li>
            <li>• Machine wash cold, tumble dry low. Recycled polyester holds color wash after wash.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
