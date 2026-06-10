import { useState, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════
   ProductFitGuide — Flat Overlay Fit Visualization
   
   Places transparent product photos on the pavé diamond mannequins,
   sized via real Printful measurements and anchored to body landmarks.
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

/* ─── Mannequin Landmarks (in 701×875 image coordinate space) ──── */

interface MannequinData {
  imgW: number;
  imgH: number;
  heightInches: number;  // model height
  pxPerInch: number;     // pixels per inch on the mannequin image
  centerX: number;       // body center X
  shoulderY: number;     // top of shoulder line
  waistY: number;        // natural waist line
  headTopY: number;      // top of head for reference
}

const MANNEQUIN: Record<string, MannequinData> = {
  female: {
    imgW: 701, imgH: 875,
    heightInches: 69,   // 5'9"
    pxPerInch: 12.35,
    centerX: 275,
    shoulderY: 175,
    waistY: 340,
    headTopY: 16,
  },
  male: {
    imgW: 701, imgH: 875,
    heightInches: 72,   // 6'0"
    pxPerInch: 11.71,
    centerX: 384,
    shoulderY: 160,
    waistY: 370,
    headTopY: 15,
  },
};

/* ─── Overlay Content Bounds ─────────────────────────────────────
   These describe where the actual garment content sits within each
   flat overlay image (values are fractions of the overlay image size).
   
   topFrac = how far from the top of the image the garment content starts
   centerXFrac = horizontal center of the garment content
   hFrac = how much of the image height the garment content occupies
   wFrac = how much of the image width the garment content occupies
   imgW, imgH = actual overlay image dimensions in pixels
   ─────────────────────────────────────────────────────────────────── */

interface OverlayBounds {
  topFrac: number;
  centerXFrac: number;
  hFrac: number;
  wFrac: number;
  imgW: number;
  imgH: number;
}

const OVERLAY_BOUNDS: Record<string, OverlayBounds> = {
  dress:    { topFrac: 0.030, centerXFrac: 0.503, hFrac: 0.93, wFrac: 0.65, imgW: 400, imgH: 400 },
  jersey:   { topFrac: 0.023, centerXFrac: 0.514, hFrac: 0.94, wFrac: 0.85, imgW: 400, imgH: 400 },
  shorts:   { topFrac: 0.160, centerXFrac: 0.496, hFrac: 0.69, wFrac: 0.80, imgW: 400, imgH: 400 },
  leggings: { topFrac: 0.068, centerXFrac: 0.497, hFrac: 0.85, wFrac: 0.55, imgW: 400, imgH: 600 },
  bra:      { topFrac: 0.070, centerXFrac: 0.500, hFrac: 0.81, wFrac: 0.72, imgW: 400, imgH: 400 },
  tee:      { topFrac: 0.117, centerXFrac: 0.499, hFrac: 0.765, wFrac: 0.978, imgW: 400, imgH: 400 },
};

/* ─── Printful Garment Lengths (inches) ──────────────────────────── */

const GARMENT_LENGTHS: Record<string, Record<string, number>> = {
  dress:    { XS: 35.04, S: 36.61, M: 37.80, L: 38.98, XL: 40.55, "2XL": 42.13 },
  jersey:   { "2XS": 29.1, XS: 29.5, S: 29.9, M: 30.3, L: 31.1, XL: 32.1, "2XL": 33.1, "3XL": 34.1, "4XL": 35.0, "5XL": 36.0, "6XL": 37.0 },
  shorts:   { XS: 11.42, S: 12.20, M: 13.39, L: 14.17, XL: 14.57, "2XL": 14.96, "3XL": 15.35 },
  leggings: { XS: 37.01, S: 37.80, M: 38.58, L: 40.16, XL: 41.73 },
  bra:      { XS: 10.24, S: 11.02, M: 11.81, L: 12.60, XL: 13.39, "2XL": 14.17 },
  tee:      { S: 28.74, M: 29.53, L: 30.31, XL: 31.50, "2XL": 32.48 },
};

/* ─── Anchor type per garment ────────────────────────────────────── */

const GARMENT_ANCHORS: Record<string, "shoulder" | "waist"> = {
  dress: "shoulder",
  jersey: "shoulder",
  shorts: "waist",
  leggings: "waist",
  bra: "shoulder",
  tee: "shoulder",
};

/* ─── Garment Detection ──────────────────────────────────────────── */

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

/* ─── Overlay Map ────────────────────────────────────────────────── */

const OVERLAY_MAP: Record<string, string> = {
  "D-Slip Dress [Black]": "/overlays/d-slip-dress-black.png",
  "D-Slip Dress [Nude]": "/overlays/d-slip-dress-nude.png",
  "D-Slip Dress [Red]": "/overlays/d-slip-dress-red.png",
  "D-Slip Dress [Whisper]": "/overlays/d-slip-dress-whisper.png",
  "D-Slip Dress [Pink Lace]": "/overlays/d-slip-dress-pink-lace.png",
  "D-Slip Dress [Dark Cerulean]": "/overlays/d-slip-dress-dark-cerulean.png",
  "J-Glitch Jersey [Black]": "/overlays/j-glitch-jersey-black.png",
  "J-Glitch Jersey [Volt]": "/overlays/j-glitch-jersey-volt.png",
  "J-Glitch Jersey [White]": "/overlays/j-glitch-jersey-white.png",
  "J-Glitch Jersey [Ice]": "/overlays/j-glitch-jersey-ice.png",
  "J-Glitch Jersey [Pink]": "/overlays/j-glitch-jersey-pink.png",
  "J-Glitch Jersey [Peach]": "/overlays/j-glitch-jersey-peach.png",
  "S-Glitch 2.5\u201d Shorts [Black]": "/overlays/s-glitch-25-shorts-black.png",
  'S-Glitch 2.5" Shorts [Black]': "/overlays/s-glitch-25-shorts-black.png",
  'S-Glitch 2.5" Shorts [White]': "/overlays/s-glitch-25-shorts-white.png",
  'S-Glitch 2.5" Shorts [Volt]': "/overlays/s-glitch-25-shorts-volt.png",
  'S-Glitch 2.5" Shorts [Peach]': "/overlays/s-glitch-25-shorts-peach.png",
  'S-Glitch 2.5" Shorts [Ice]': "/overlays/s-glitch-25-shorts-ice.png",
  'S-Glitch 2.5" Shorts [Pink]': "/overlays/s-glitch-25-shorts-pink.png",
  "L-Flow Leggings [Dash]": "/overlays/l-flow-leggings-dash.png",
  "L-Flow Leggings [Onyx]": "/overlays/l-flow-leggings-onyx.png",
  "L-Flow Leggings [Ivory]": "/overlays/l-flow-leggings-ivory.png",
  "B-Lift Sports Bra [Dash]": "/overlays/b-lift-sports-bra-dash.png",
  "B-Lift Sports Bra [Onyx]": "/overlays/b-lift-sports-bra-onyx.png",
  "B-Lift Sports Bra [Ivory]": "/overlays/b-lift-sports-bra-ivory.png",
  "T-Icon Oversized Tee [Black]": "/overlays/t-icon-oversized-tee-black.png",
  "T-Icon Oversized Tee [French Navy]": "/overlays/t-icon-oversized-tee-french-navy.png",
  "T-Icon Oversized Tee [Heather Grey]": "/overlays/t-icon-oversized-tee-heather-grey.png",
  "T-Icon Oversized Tee [Stone]": "/overlays/t-icon-oversized-tee-stone.png",
  "T-Icon Oversized Tee [White]": "/overlays/t-icon-oversized-tee-white.png",
  "T-Icon Tie-Dye Tee [Milky Way]": "/overlays/t-icon-tie-dye-tee-milky-way.png",
  "T-Icon Tie-Dye Tee [Navy / White]": "/overlays/t-icon-tie-dye-tee-navy-white.png",
  "T-Icon Tie-Dye Tee [Sherbet Rainbow]": "/overlays/t-icon-tie-dye-tee-sherbet-rainbow.png",
  "T-Icon Tie-Dye Tee [Classic Rainbow]": "/overlays/t-icon-tie-dye-tee-classic-rainbow.png",
  "T-Icon Tie-Dye Tee [Black / White]": "/overlays/t-icon-tie-dye-tee-black-white.png",
};

function getOverlayUrl(productName: string): string | null {
  let url = OVERLAY_MAP[productName];
  if (!url) {
    const norm = productName.replace(/[\u201c\u201d\u2018\u2019]/g, '"');
    url = OVERLAY_MAP[norm];
  }
  if (!url) {
    const key = productName.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [k, v] of Object.entries(OVERLAY_MAP)) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === key) {
        url = v;
        break;
      }
    }
  }
  return url || null;
}

/* ─── Position Calculator ────────────────────────────────────────── */

function calculateOverlayPosition(
  garmentType: string,
  size: string,
  gender: "female" | "male",
): { topPct: number; leftPct: number; widthPct: number; heightPct: number } {
  const m = MANNEQUIN[gender];
  const o = OVERLAY_BOUNDS[garmentType] || OVERLAY_BOUNDS.tee;
  const lengths = GARMENT_LENGTHS[garmentType] || GARMENT_LENGTHS.tee;

  // Get garment length for this size (fallback to middle size)
  let lengthInches = lengths[size];
  if (lengthInches === undefined) {
    const available = Object.keys(lengths);
    lengthInches = lengths[available[Math.floor(available.length / 2)]];
  }

  // Convert garment length to pixels on the mannequin image
  const garmentLengthPx = lengthInches * m.pxPerInch;

  // The overlay image height that corresponds to this garment length
  // garmentLengthPx = overlayHeightPx * hFrac
  // So: overlayHeightPx = garmentLengthPx / hFrac
  const overlayHeightPx = garmentLengthPx / o.hFrac;

  // Overlay width from aspect ratio
  const imgAspect = o.imgW / o.imgH;
  const overlayWidthPx = overlayHeightPx * imgAspect;

  // Determine anchor Y position
  const anchor = GARMENT_ANCHORS[garmentType] || "shoulder";
  const anchorY = anchor === "shoulder" ? m.shoulderY : m.waistY;

  // The garment content starts at topFrac from the top of the overlay image.
  // We want that content start to align with the anchor point.
  // overlayTopPx + topFrac * overlayHeightPx = anchorY
  // overlayTopPx = anchorY - topFrac * overlayHeightPx
  const overlayTopPx = anchorY - (o.topFrac * overlayHeightPx);

  // Center the overlay horizontally on the mannequin body center
  // The garment content center is at centerXFrac within the overlay
  // So: overlayLeftPx + centerXFrac * overlayWidthPx = m.centerX
  const overlayLeftPx = m.centerX - (o.centerXFrac * overlayWidthPx);

  // Convert to percentages of mannequin image dimensions
  return {
    topPct: (overlayTopPx / m.imgH) * 100,
    leftPct: (overlayLeftPx / m.imgW) * 100,
    widthPct: (overlayWidthPx / m.imgW) * 100,
    heightPct: (overlayHeightPx / m.imgH) * 100,
  };
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

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

export function ProductFitGuide({ product, externalSize, onSizeSelect, lightMode = false }: Props) {
  const [selectedSize, setSelectedSize] = useState<string>("");

  /* ── Light/dark adaptive colors ── */
  const c = lightMode ? {
    text:        "rgba(30,25,20,0.75)",
    textMuted:   "rgba(30,25,20,0.4)",
    textFaint:   "rgba(30,25,20,0.25)",
    accent:      "rgba(140,80,200,0.75)",
    accentFaint: "rgba(140,80,200,0.12)",
    accentBorder:"rgba(140,80,200,0.25)",
    border:      "rgba(30,25,20,0.08)",
    cardBg:      "rgba(30,25,20,0.03)",
    activeBg:    "rgba(140,80,200,0.08)",
    btnActive:   "linear-gradient(135deg, rgba(140,80,200,0.12), rgba(220,120,160,0.08))",
    btnBorder:   "1px solid rgba(140,80,200,0.25)",
    btnInactive: "1px solid rgba(30,25,20,0.1)",
    sizeActive:  "rgba(30,25,20,0.85)",
    sizeInactive:"rgba(30,25,20,0.35)",
    highlight:   "rgba(30,25,20,0.7)",
    colHighlight:"rgba(140,80,200,0.06)",
    fitNote:     "rgba(140,80,200,0.06)",
    fitNoteBorder: "rgba(140,80,200,0.12)",
    fitNoteText: "rgba(30,25,20,0.35)",
    badgeBg:     "rgba(255,255,255,0.85)",
    badgeText:   "rgba(140,80,200,0.7)",
    modelText:   "rgba(255,255,255,0.6)",
  } : {
    text:        "rgba(245,230,220,0.8)",
    textMuted:   "rgba(245,230,220,0.4)",
    textFaint:   "rgba(245,230,220,0.25)",
    accent:      "rgba(200,140,255,0.7)",
    accentFaint: "rgba(200,140,255,0.08)",
    accentBorder:"rgba(200,140,255,0.2)",
    border:      "rgba(240,210,190,0.06)",
    cardBg:      "rgba(255,240,230,0.02)",
    activeBg:    "rgba(200,140,255,0.05)",
    btnActive:   "linear-gradient(135deg, rgba(200,140,255,0.15), rgba(255,158,184,0.08))",
    btnBorder:   "1px solid rgba(200,140,255,0.3)",
    btnInactive: "1px solid rgba(240,210,190,0.1)",
    sizeActive:  "white",
    sizeInactive:"rgba(245,230,220,0.45)",
    highlight:   "rgba(245,230,220,0.8)",
    colHighlight:"rgba(200,140,255,0.05)",
    fitNote:     "rgba(200,140,255,0.03)",
    fitNoteBorder: "rgba(200,140,255,0.06)",
    fitNoteText: "rgba(245,230,220,0.32)",
    badgeBg:     "rgba(0,0,0,0.7)",
    badgeText:   "rgba(200,140,255,0.7)",
    modelText:   "rgba(245,230,220,0.3)",
  };

  useEffect(() => {
    if (externalSize) setSelectedSize(externalSize);
  }, [externalSize]);

  const garmentType = detectGarmentType(product.name);
  const gender = detectGender(product.name, product.category);
  const mannequinUrl = gender === "female" ? "/mannequin-female.png" : "/mannequin-male.png";
  const overlayUrl = useMemo(() => getOverlayUrl(product.name), [product.name]);

  const uniqueSizes = useMemo(() => {
    const clean = product.sizes.map((s) => {
      const parts = s.split("/");
      return parts[parts.length - 1].trim();
    });
    return [...new Set(clean)];
  }, [product.sizes]);

  const currentSize = selectedSize || uniqueSizes[Math.floor(uniqueSizes.length / 2)] || "M";
  const sizeChart = SIZE_CHARTS[garmentType] || [];

  // Calculate overlay position for current size
  const pos = useMemo(
    () => calculateOverlayPosition(garmentType, currentSize, gender),
    [garmentType, currentSize, gender],
  );

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    onSizeSelect?.(size);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ── Mannequin + Flat Overlay ── */}
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
        }}
      >
        {/* Mannequin base image */}
        <img
          src={mannequinUrl}
          alt={`${gender === "female" ? '5\'9"' : '6\'0"'} ${gender} mannequin`}
          style={{ width: "100%", display: "block", opacity: 0.95 }}
          draggable={false}
        />

        {/* Flat product overlay */}
        {overlayUrl && (
          <img
            key={`${overlayUrl}-${currentSize}`}
            src={overlayUrl}
            alt={`${product.name} fit preview`}
            style={{
              position: "absolute",
              top: `${pos.topPct}%`,
              left: `${pos.leftPct}%`,
              width: `${pos.widthPct}%`,
              height: `${pos.heightPct}%`,
              objectFit: "contain",
              pointerEvents: "none",
              opacity: 0.92,
              transition: "all 0.3s ease",
              filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.4))",
            }}
            draggable={false}
          />
        )}

        {/* Size badge */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            background: c.badgeBg,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "10px",
            padding: "5px 12px",
            border: `1px solid ${c.accentBorder}`,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "8px", color: c.accent }}>✦</span>
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: c.badgeText,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Size {currentSize}
          </span>
        </div>

        {/* Model height label */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "8px",
            padding: "4px 10px",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              color: c.modelText,
              letterSpacing: "0.1em",
            }}
          >
            {gender === "female" ? "5'9\" model" : "6'0\" model"}
          </span>
        </div>
      </div>

      {/* ── Size Selector ── */}
      <div>
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: c.textMuted,
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          Select Size to Preview Fit
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {uniqueSizes.map((size) => {
            const isActive = currentSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeClick(size)}
                style={{
                  padding: "6px 14px",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: isActive ? c.sizeActive : c.sizeInactive,
                  background: isActive ? c.btnActive : "transparent",
                  border: isActive ? c.btnBorder : c.btnInactive,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
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
        <div
          style={{
            background: c.cardBg,
            border: `1px solid ${c.border}`,
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderBottom: `1px solid ${c.border}`,
            }}
          >
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: c.textMuted,
                fontWeight: 600,
              }}
            >
              Size Chart
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      color: c.textFaint,
                      fontWeight: 500,
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Measure
                  </th>
                  {uniqueSizes.map((size) => (
                    <th
                      key={size}
                      style={{
                        textAlign: "center",
                        padding: "8px 8px",
                        color: currentSize === size ? c.accent : c.textFaint,
                        fontWeight: currentSize === size ? 700 : 500,
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        transition: "color 0.2s",
                      }}
                    >
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row, i) => (
                  <tr
                    key={row.label}
                    style={{
                      borderTop: `1px solid ${c.border}`,
                      background: i % 2 === 0 ? "transparent" : c.cardBg,
                    }}
                  >
                    <td
                      style={{
                        padding: "8px 12px",
                        color: c.textMuted,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.label}{" "}
                      <span style={{ color: c.textFaint, fontSize: "9px" }}>({row.unit})</span>
                    </td>
                    {uniqueSizes.map((size) => (
                      <td
                        key={size}
                        style={{
                          textAlign: "center",
                          padding: "8px 8px",
                          color: currentSize === size ? c.highlight : c.textFaint,
                          fontWeight: currentSize === size ? 600 : 400,
                          transition: "all 0.2s",
                          background: currentSize === size ? c.colHighlight : "transparent",
                        }}
                      >
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
      <div
        style={{
          padding: "12px 16px",
          background: c.fitNote,
          border: `1px solid ${c.fitNoteBorder}`,
          borderRadius: "12px",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            lineHeight: 1.7,
            color: c.fitNoteText,
            margin: 0,
          }}
        >
          ✦ Shown on a {gender === "female" ? "5'9\"" : "6'0\""} pavé black diamond
          mannequin. Garment is sized using actual Printful measurements — 
          select different sizes to see how the proportions change on the form.
        </p>
      </div>
    </div>
  );
}
