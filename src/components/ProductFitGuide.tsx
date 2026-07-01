import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { getDrapeCdnUrl } from "../data/drapeCdnUrls";

/* ═══════════════════════════════════════════════════════════════════
   ProductFitGuide V9 — Size Guide Only (Body Type removed)
   
   Clean size-guide with CDN-hosted drapes at 600×900 q80.
   Each size shows a unique AI-generated drape on the pavé mannequin.
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Types ──────────────────────────────────────────────────────── */

interface ProductInfo {
  name: string;
  category?: string;
  sizes: string[];
  images?: string[];
}

interface Props {
  product: ProductInfo;
  externalSize?: string;
  onSizeSelect?: (size: string) => void;
  lightMode?: boolean;
}

/* ─── Drape Map (M-size base / static fallback) ──────────────────── */

const DRAPE_MAP: Record<string, string> = {
  "D-Slip Dress [Black]": "/drapes/draped_d-slip-dress-black.webp",
  "D-Slip Dress [Nude]": "/drapes/draped_d-slip-dress-nude.webp",
  "D-Slip Dress [Red]": "/drapes/draped_d-slip-dress-red.webp",
  "D-Slip Dress [Whisper]": "/drapes/draped_d-slip-dress-whisper.webp",
  "D-Slip Dress [Pink Lace]": "/drapes/draped_d-slip-dress-pink-lace.webp",
  "D-Slip Dress [Dark Cerulean]": "/drapes/draped_d-slip-dress-dark-cerulean.webp",
  "J-Glitch Jersey [Black]": "/drapes/draped_j-glitch-jersey-black.webp",
  "J-Glitch Jersey [Volt]": "/drapes/draped_j-glitch-jersey-volt.webp",
  "J-Glitch Jersey [White]": "/drapes/draped_j-glitch-jersey-white.webp",
  "J-Glitch Jersey [Ice]": "/drapes/draped_j-glitch-jersey-ice.webp",
  "J-Glitch Jersey [Pink]": "/drapes/draped_j-glitch-jersey-pink.webp",
  "J-Glitch Jersey [Peach]": "/drapes/draped_j-glitch-jersey-peach.webp",
  'S-Glitch 2.5\u201d Shorts [Black]': "/drapes/draped_s-glitch-2-5-shorts-black.webp",
  'S-Glitch 2.5" Shorts [Black]': "/drapes/draped_s-glitch-2-5-shorts-black.webp",
  'S-Glitch 2.5" Shorts [White]': "/drapes/draped_s-glitch-2-5-shorts-white.webp",
  'S-Glitch 2.5" Shorts [Volt]': "/drapes/draped_s-glitch-2-5-shorts-volt.webp",
  'S-Glitch 2.5" Shorts [Peach]': "/drapes/draped_s-glitch-2-5-shorts-peach.webp",
  'S-Glitch 2.5" Shorts [Ice]': "/drapes/draped_s-glitch-2-5-shorts-ice.webp",
  'S-Glitch 2.5" Shorts [Pink]': "/drapes/draped_s-glitch-2-5-shorts-pink.webp",
  "L-Flow Leggings [Dash]": "/drapes/draped_l-flow-leggings-dash.webp",
  "L-Flow Leggings [Onyx]": "/drapes/draped_l-flow-leggings-onyx.webp",
  "L-Flow Leggings [Ivory]": "/drapes/draped_l-flow-leggings-ivory.webp",
  "B-Lift Sports Bra [Dash]": "/drapes/draped_b-lift-sports-bra-dash.webp",
  "B-Lift Sports Bra [Onyx]": "/drapes/draped_b-lift-sports-bra-onyx.webp",
  "B-Lift Sports Bra [Ivory]": "/drapes/draped_b-lift-sports-bra-ivory.webp",
  "T-Icon Oversized Tee [Black]": "/drapes/draped_t-icon-oversized-tee-black.webp",
  "T-Icon Oversized Tee [French Navy]": "/drapes/draped_t-icon-oversized-tee-french-navy.webp",
  "T-Icon Oversized Tee [Heather Grey]": "/drapes/draped_t-icon-oversized-tee-heather-grey.webp",
  "T-Icon Oversized Tee [Stone]": "/drapes/draped_t-icon-oversized-tee-stone.webp",
  "T-Icon Oversized Tee [White]": "/drapes/draped_t-icon-oversized-tee-white.webp",
  "T-Icon Tie-Dye Tee [Milky Way]": "/drapes/draped_t-icon-tie-dye-tee-milky-way.webp",
  "T-Icon Tie-Dye Tee [Navy / White]": "/drapes/draped_t-icon-tie-dye-tee-navy-white.webp",
  "T-Icon Tie-Dye Tee [Sherbet Rainbow]": "/drapes/draped_t-icon-tie-dye-tee-sherbet-rainbow.webp",
  "T-Icon Tie-Dye Tee [Classic Rainbow]": "/drapes/draped_t-icon-tie-dye-tee-classic-rainbow.webp",
  "T-Icon Tie-Dye Tee [Black / White]": "/drapes/draped_t-icon-tie-dye-tee-black-white.webp",
};

/* ─── URL Helpers ────────────────────────────────────────────────── */

function getSlugFromPath(path: string): string {
  const match = path.match(/draped_(.+)\.webp$/);
  return match ? match[1] : "";
}

function getDrapeUrl(productName: string): string | null {
  let url = DRAPE_MAP[productName];
  if (!url) {
    const norm = productName.replace(/[\u201c\u201d\u2018\u2019]/g, '"');
    url = DRAPE_MAP[norm];
  }
  if (!url) {
    const key = productName.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [k, v] of Object.entries(DRAPE_MAP)) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === key) {
        url = v;
        break;
      }
    }
  }
  return url || null;
}

function getSizeDrapeUrl(baseDrapeUrl: string, size: string): string {
  const slug = getSlugFromPath(baseDrapeUrl);
  if (!slug) return baseDrapeUrl;
  const sizeSlug = size.toLowerCase().replace(/\s+/g, "");
  return `/drapes/sizes/draped_${slug}_${sizeSlug}.webp`;
}

/* ─── Garment / Gender Detection ─────────────────────────────────── */

function detectGarmentType(name: string): string {
  const n = name.toUpperCase();
  if (n.includes("DRESS") || n.includes("D-SLIP")) return "dress";
  if (n.includes("JERSEY") || n.includes("J-GLITCH")) return "jersey";
  if (n.includes("SHORTS") || n.includes("S-GLITCH")) return "shorts";
  if (n.includes("LEGGING") || n.includes("L-FLOW")) return "leggings";
  if (n.includes("BRA") || n.includes("B-LIFT")) return "bra";
  if (n.includes("TEE") || n.includes("T-ICON")) return "tee";
  return "tee";
}

function detectGender(name: string, category?: string): "female" | "male" {
  const n = (name + " " + (category || "")).toUpperCase();
  if (n.includes("DRESS") || n.includes("D-SLIP")) return "female";
  if (n.includes("LEGGING") || n.includes("L-FLOW")) return "female";
  if (n.includes("BRA") || n.includes("B-LIFT")) return "female";
  if (n.includes("JERSEY") || n.includes("J-GLITCH")) return "male";
  if (n.includes("SHORTS") || n.includes("S-GLITCH")) return "male";
  if (n.includes("TEE") || n.includes("T-ICON")) return "male";
  if (n.includes("WOMEN") || n.includes("FEMALE")) return "female";
  return "male";
}

/* ─── Size Chart Data ────────────────────────────────────────────── */

interface SizeChartEntry {
  label: string;
  unit: string;
  sizes: Record<string, string>;
}

const SIZE_CHARTS: Record<string, SizeChartEntry[]> = {
  dress: [
    { label: "Chest", unit: "in", sizes: { XS: "33.1", S: "34.7", M: "36.2", L: "39.4", XL: "42.5", "2XL": "45.7" } },
    { label: "Waist", unit: "in", sizes: { XS: "25.2", S: "26.8", M: "28.4", L: "31.5", XL: "34.7", "2XL": "37.8" } },
    { label: "Hips", unit: "in", sizes: { XS: "35.4", S: "37.0", M: "38.6", L: "41.7", XL: "44.9", "2XL": "48.0" } },
    { label: "Length", unit: "in", sizes: { XS: "35.0", S: "36.6", M: "37.8", L: "39.0", XL: "40.6", "2XL": "42.1" } },
  ],
  jersey: [
    { label: "Chest", unit: "in", sizes: { "2XS": "34.6", XS: "36.2", S: "37.8", M: "39.4", L: "42.5", XL: "45.7", "2XL": "48.8", "3XL": "52.0", "4XL": "55.1", "5XL": "58.3", "6XL": "61.4" } },
    { label: "Width", unit: "in", sizes: { "2XS": "20.5", XS: "21.3", S: "22.0", M: "22.8", L: "24.4", XL: "26.0", "2XL": "27.6", "3XL": "29.1", "4XL": "30.7", "5XL": "32.3", "6XL": "33.9" } },
    { label: "Length", unit: "in", sizes: { "2XS": "29.1", XS: "29.5", S: "29.9", M: "30.3", L: "31.1", XL: "32.1", "2XL": "33.1", "3XL": "34.1", "4XL": "35.0", "5XL": "36.0", "6XL": "37.0" } },
  ],
  shorts: [
    { label: "Waist", unit: "in", sizes: { XS: "29.9", S: "31.5", M: "33.1", L: "36.2", XL: "39.4", "2XL": "42.5", "3XL": "45.7" } },
    { label: "Hips", unit: "in", sizes: { XS: "37.0", S: "38.6", M: "40.2", L: "43.3", XL: "46.5", "2XL": "49.6", "3XL": "52.8" } },
    { label: "Outseam", unit: "in", sizes: { XS: "11.4", S: "12.2", M: "13.4", L: "14.2", XL: "14.6", "2XL": "15.0", "3XL": "15.4" } },
    { label: "Inseam", unit: "in", sizes: { XS: "2.6", S: "2.6", M: "2.6", L: "2.6", XL: "2.6", "2XL": "2.6", "3XL": "2.6" } },
  ],
  leggings: [
    { label: "Waist", unit: "in", sizes: { XS: "25.2", S: "26.8", M: "28.4", L: "31.5", XL: "34.7" } },
    { label: "Hips", unit: "in", sizes: { XS: "35.4", S: "37.0", M: "38.6", L: "41.7", XL: "44.9" } },
    { label: "Inseam", unit: "in", sizes: { XS: "27.2", S: "27.6", M: "28.0", L: "28.7", XL: "29.5" } },
    { label: "Rise", unit: "in", sizes: { XS: "9.8", S: "10.2", M: "10.6", L: "11.4", XL: "12.2" } },
  ],
  bra: [
    { label: "Chest", unit: "in", sizes: { XS: "33.1", S: "34.7", M: "36.2", L: "39.4", XL: "42.5", "2XL": "45.7" } },
    { label: "Underbust", unit: "in", sizes: { XS: "27.6", S: "29.1", M: "30.7", L: "33.5", XL: "36.2", "2XL": "39.0" } },
    { label: "Length", unit: "in", sizes: { XS: "10.2", S: "11.0", M: "11.8", L: "12.6", XL: "13.4", "2XL": "14.2" } },
  ],
  tee: [
    { label: "Chest", unit: "in", sizes: { S: "39", M: "43", L: "47", XL: "51", "2XL": "55" } },
    { label: "Length", unit: "in", sizes: { S: "28.7", M: "29.5", L: "30.3", XL: "31.5", "2XL": "32.5" } },
    { label: "Width", unit: "in", sizes: { S: "24.8", M: "26.4", L: "28.0", XL: "29.9", "2XL": "31.9" } },
  ],
};

/* ─── Fit Description ────────────────────────────────────────────── */

function getFitDescription(_garmentType: string, size: string, sizes: string[]): string {
  const idx = sizes.indexOf(size);
  if (idx < 0) return "";
  const ratio = sizes.length > 1 ? idx / (sizes.length - 1) : 0.5;
  if (ratio <= 0.15) return "Compressive, body-hugging fit";
  if (ratio <= 0.35) return "Snug, fitted silhouette";
  if (ratio <= 0.55) return "True-to-size fit";
  if (ratio <= 0.75) return "Relaxed, comfortable fit";
  return "Oversized, loose drape";
}

/* ─── Image Preloader ────────────────────────────────────────────── */

const preloadedUrls = new Set<string>();

function preloadImage(url: string) {
  if (preloadedUrls.has(url)) return;
  preloadedUrls.add(url);
  const img = new Image();
  img.src = url;
}

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

export function ProductFitGuide({ product, externalSize, onSizeSelect, lightMode = false }: Props) {
  const [selectedSize, setSelectedSize] = useState<string>("");

  // Crossfade layers
  const [layerA, setLayerA] = useState<string>("");
  const [layerB, setLayerB] = useState<string>("");
  const [activeLayer, setActiveLayer] = useState<"A" | "B">("A");
  const [_layerAReady, setLayerAReady] = useState(false);
  const [_layerBReady, setLayerBReady] = useState(false);
  const pendingUrlRef = useRef<string>("");

  /* ─── Theme colors ─────────────────────────────────────────────── */

  const c = lightMode ? {
    text: "rgba(30,25,20,0.75)", textMuted: "rgba(30,25,20,0.4)", textFaint: "rgba(30,25,20,0.25)",
    accent: "rgba(140,80,200,0.75)", accentFaint: "rgba(140,80,200,0.12)", accentBorder: "rgba(140,80,200,0.25)",
    border: "rgba(30,25,20,0.08)", cardBg: "rgba(30,25,20,0.03)", activeBg: "rgba(140,80,200,0.08)",
    btnActive: "linear-gradient(135deg, rgba(140,80,200,0.12), rgba(220,120,160,0.08))",
    btnBorder: "1px solid rgba(140,80,200,0.25)", btnInactive: "1px solid rgba(30,25,20,0.1)",
    sizeActive: "rgba(30,25,20,0.85)", sizeInactive: "rgba(30,25,20,0.35)",
    highlight: "rgba(30,25,20,0.7)", colHighlight: "rgba(140,80,200,0.06)",
    fitNote: "rgba(140,80,200,0.06)", fitNoteBorder: "rgba(140,80,200,0.12)",
    fitNoteText: "rgba(30,25,20,0.35)", badgeBg: "rgba(255,255,255,0.85)",
    badgeText: "rgba(140,80,200,0.7)", modelText: "rgba(255,255,255,0.6)",
  } : {
    text: "rgba(245,230,220,0.8)", textMuted: "rgba(245,230,220,0.4)", textFaint: "rgba(245,230,220,0.25)",
    accent: "rgba(200,140,255,0.7)", accentFaint: "rgba(200,140,255,0.08)", accentBorder: "rgba(200,140,255,0.2)",
    border: "rgba(240,210,190,0.06)", cardBg: "rgba(255,240,230,0.02)", activeBg: "rgba(200,140,255,0.05)",
    btnActive: "linear-gradient(135deg, rgba(200,140,255,0.15), rgba(255,158,184,0.08))",
    btnBorder: "1px solid rgba(200,140,255,0.3)", btnInactive: "1px solid rgba(240,210,190,0.1)",
    sizeActive: "white", sizeInactive: "rgba(245,230,220,0.45)",
    highlight: "rgba(245,230,220,0.8)", colHighlight: "rgba(200,140,255,0.05)",
    fitNote: "rgba(200,140,255,0.03)", fitNoteBorder: "rgba(200,140,255,0.06)",
    fitNoteText: "rgba(245,230,220,0.32)", badgeBg: "rgba(0,0,0,0.7)",
    badgeText: "rgba(200,140,255,0.7)", modelText: "rgba(245,230,220,0.3)",
  };

  useEffect(() => {
    if (externalSize) setSelectedSize(externalSize);
  }, [externalSize]);

  const garmentType = detectGarmentType(product.name);
  const gender = detectGender(product.name, product.category);
  const baseDrapeUrl = useMemo(() => getDrapeUrl(product.name), [product.name]);

  const uniqueSizes = useMemo(() => {
    const clean = product.sizes.map((s) => {
      const parts = s.split("/");
      return parts[parts.length - 1].trim();
    });
    return [...new Set(clean)];
  }, [product.sizes]);

  const currentSize = selectedSize || uniqueSizes[Math.floor(uniqueSizes.length / 2)] || "M";
  const sizeChart = SIZE_CHARTS[garmentType] || [];

  /* ─── URL Resolution: CDN first, static fallback ────────────────── */

  const productSlug = useMemo(() => getSlugFromPath(baseDrapeUrl || ""), [baseDrapeUrl]);

  const targetUrl = useMemo(() => {
    if (!baseDrapeUrl) return "";
    const sizeSlug = currentSize.toLowerCase().replace(/\s+/g, "");
    return getDrapeCdnUrl(productSlug, sizeSlug) || getSizeDrapeUrl(baseDrapeUrl, currentSize);
  }, [baseDrapeUrl, currentSize, productSlug]);

  /* ─── Crossfade Engine ─────────────────────────────────────────── */

  useEffect(() => {
    if (targetUrl && !layerA && !layerB) {
      setLayerA(targetUrl);
      setActiveLayer("A");
    }
  }, [targetUrl, layerA, layerB]);

  useEffect(() => {
    if (!targetUrl) return;
    const currentActive = activeLayer === "A" ? layerA : layerB;
    if (targetUrl === currentActive) return;

    pendingUrlRef.current = targetUrl;

    if (activeLayer === "A") {
      setLayerBReady(false);
      setLayerB(targetUrl);
    } else {
      setLayerAReady(false);
      setLayerA(targetUrl);
    }
  }, [targetUrl]);

  const handleLayerALoad = useCallback(() => {
    setLayerAReady(true);
    if (activeLayer === "B" && layerA === pendingUrlRef.current) {
      setActiveLayer("A");
    }
  }, [activeLayer, layerA]);

  const handleLayerBLoad = useCallback(() => {
    setLayerBReady(true);
    if (activeLayer === "A" && layerB === pendingUrlRef.current) {
      setActiveLayer("B");
    }
  }, [activeLayer, layerB]);

  const handleImageError = useCallback((layer: "A" | "B") => {
    if (baseDrapeUrl) {
      if (layer === "A") { setLayerA(baseDrapeUrl); }
      else { setLayerB(baseDrapeUrl); }
    }
  }, [baseDrapeUrl]);

  /* ─── Preload adjacent sizes ───────────────────────────────────── */

  useEffect(() => {
    if (!baseDrapeUrl) return;
    const idx = uniqueSizes.indexOf(currentSize);
    for (let i = Math.max(0, idx - 2); i <= Math.min(uniqueSizes.length - 1, idx + 2); i++) {
      const sizeSlug = uniqueSizes[i].toLowerCase().replace(/\s+/g, "");
      const cdnUrl = getDrapeCdnUrl(productSlug, sizeSlug);
      if (cdnUrl) preloadImage(cdnUrl);
      else preloadImage(getSizeDrapeUrl(baseDrapeUrl, uniqueSizes[i]));
    }
  }, [currentSize, baseDrapeUrl, uniqueSizes, productSlug]);

  /* ─── Event Handlers ───────────────────────────────────────────── */

  const handleSizeClick = (size: string) => {
    if (size === currentSize) return;
    setSelectedSize(size);
    onSizeSelect?.(size);
  };

  const fitDesc = getFitDescription(garmentType, currentSize, uniqueSizes);
  const modelLabel = gender === "female" ? "5'9\" model" : "6'0\" model";

  const imgStyle = (visible: boolean): React.CSSProperties => ({
    position: "absolute",
    top: 0, left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    pointerEvents: "none",
  });

  /* ═══════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════ */

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── AI Drape Visualization ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "340px",
          margin: "0 auto",
          background: "radial-gradient(ellipse at center, rgba(30,25,35,0.9), rgba(0,0,0,0.95))",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(200,140,255,0.08)",
          aspectRatio: "2 / 3",
        }}
      >
        {baseDrapeUrl ? (
          <>
            {layerA && (
              <img
                key={`A-${layerA}`}
                src={layerA}
                alt={`${product.name} drape`}
                style={imgStyle(activeLayer === "A")}
                onLoad={handleLayerALoad}
                onError={() => handleImageError("A")}
                draggable={false}
              />
            )}
            {layerB && (
              <img
                key={`B-${layerB}`}
                src={layerB}
                alt={`${product.name} drape`}
                style={imgStyle(activeLayer === "B")}
                onLoad={handleLayerBLoad}
                onError={() => handleImageError("B")}
                draggable={false}
              />
            )}
          </>
        ) : (
          <img
            src={gender === "female" ? "/mannequin-female.png" : "/mannequin-male.png"}
            alt="mannequin"
            style={{ width: "100%", display: "block", opacity: 0.95 }}
            draggable={false}
          />
        )}

        {/* Size Badge */}
        <div
          style={{
            position: "absolute", bottom: "12px", right: "12px", zIndex: 10,
            background: c.badgeBg, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            borderRadius: "10px", padding: "5px 12px",
            border: `1px solid ${c.accentBorder}`,
            display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          <span style={{ fontSize: "8px", color: c.accent }}>✦</span>
          <span style={{
            fontSize: "10px", letterSpacing: "0.2em", color: c.badgeText,
            textTransform: "uppercase", fontWeight: 600,
          }}>
            Size {currentSize}
          </span>
        </div>

        {/* Model info */}
        <div style={{
          position: "absolute", bottom: "12px", left: "12px", zIndex: 10,
          background: "rgba(0,0,0,0.5)", borderRadius: "8px", padding: "4px 10px",
        }}>
          <span style={{ fontSize: "9px", color: c.modelText, letterSpacing: "0.1em" }}>
            {modelLabel}
          </span>
        </div>

        {/* Fit description */}
        {fitDesc && (
          <div style={{
            position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)",
            zIndex: 10, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
            borderRadius: "8px", padding: "4px 12px",
            transition: "opacity 0.3s",
          }}>
            <span style={{ fontSize: "9px", color: "rgba(200,140,255,0.7)", letterSpacing: "0.05em" }}>
              {fitDesc}
            </span>
          </div>
        )}
      </div>

      {/* ── Size Selector ── */}
      <div>
        <p style={{
          fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase",
          color: c.textMuted, marginBottom: "8px", fontWeight: 600,
        }}>
          Select Size
        </p>
        <div style={{
          display: "flex", gap: "4px", flexWrap: "wrap",
          background: c.cardBg, border: `1px solid ${c.border}`,
          borderRadius: "12px", padding: "4px",
        }}>
          {uniqueSizes.map((size) => {
            const isActive = currentSize === size;
            return (
              <button
                key={size} type="button"
                onClick={() => handleSizeClick(size)}
                style={{
                  padding: "8px 14px", fontSize: "11px", letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  flex: uniqueSizes.length <= 7 ? "1" : undefined,
                  minWidth: "40px",
                  color: isActive ? c.sizeActive : c.sizeInactive,
                  background: isActive ? c.btnActive : "transparent",
                  border: isActive ? c.btnBorder : "1px solid transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Size Chart Table ── */}
      {sizeChart.length > 0 && (
        <div style={{
          background: c.cardBg, border: `1px solid ${c.border}`,
          borderRadius: "12px", overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${c.border}` }}>
            <span style={{
              fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase",
              color: c.textMuted, fontWeight: 600,
            }}>
              Size Chart
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr>
                  <th style={{
                    textAlign: "left", padding: "8px 12px", color: c.textFaint,
                    fontWeight: 500, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    Measure
                  </th>
                  {uniqueSizes.map((size) => (
                    <th key={size} style={{
                      textAlign: "center", padding: "8px 8px",
                      color: currentSize === size ? c.accent : c.textFaint,
                      fontWeight: currentSize === size ? 700 : 500,
                      fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
                      transition: "color 0.25s",
                    }}>
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row, i) => (
                  <tr key={row.label} style={{
                    borderTop: `1px solid ${c.border}`,
                    background: i % 2 === 0 ? "transparent" : c.cardBg,
                  }}>
                    <td style={{
                      padding: "8px 12px", color: c.textMuted, fontWeight: 500, whiteSpace: "nowrap",
                    }}>
                      {row.label}{" "}
                      <span style={{ color: c.textFaint, fontSize: "9px" }}>({row.unit})</span>
                    </td>
                    {uniqueSizes.map((size) => (
                      <td key={size} style={{
                        textAlign: "center", padding: "8px 8px",
                        color: currentSize === size ? c.highlight : c.textFaint,
                        fontWeight: currentSize === size ? 600 : 400,
                        transition: "all 0.25s",
                        background: currentSize === size ? c.colHighlight : "transparent",
                      }}>
                        {row.sizes[size] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Fit Note ── */}
      <div style={{
        padding: "12px 16px", background: c.fitNote,
        border: `1px solid ${c.fitNoteBorder}`, borderRadius: "12px",
      }}>
        <p style={{ fontSize: "10px", lineHeight: 1.7, color: c.fitNoteText, margin: 0 }}>
          ✦ Each size has its own AI-generated drape rendered on a {gender === "female" ? "5'9\"" : "6'0\""} pavé black diamond mannequin. The mannequin stays the same — the garment changes to show how each size fits, drapes, and falls on the body using real Printful measurements.
        </p>
      </div>
    </div>
  );
}
