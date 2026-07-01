import { useState, useEffect, useCallback } from "react";
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

const TEE_SIZES: SizeRow[] = [
  { size: "S",   chest: '36–38"',  length: '28"' },
  { size: "M",   chest: '38–41"',  length: '29"' },
  { size: "L",   chest: '41–44"',  length: '30"' },
  { size: "XL",  chest: '44–47"',  length: '31"' },
  { size: "2XL", chest: '47–50"',  length: '32"' },
];

/* ─── Tabs ───────────────────────────────────────────────────────── */

const TABS = [
  { key: "dresses",  label: "Dresses",     data: DRESS_SIZES,    cols: ["Size", "Bust", "Waist", "Hips", "Length"],     fields: ["size", "bust", "waist", "hips", "length"] as const,  note: "95% polyester / 5% elastane. Relaxed slip silhouette — if between sizes, go with the smaller for a sleeker fit.", mannequin: "female" as const, overlayType: "dress" as const },
  { key: "jerseys",  label: "Jerseys",     data: JERSEY_SIZES,   cols: ["Size", "Chest", "Length"],                     fields: ["size", "chest", "length"] as const,                  note: "100% recycled polyester, two-way stretch. Athletic fit — size up for a relaxed look.", mannequin: "male" as const, overlayType: "jersey" as const },
  { key: "shorts",   label: "Shorts",      data: SHORTS_SIZES,   cols: ["Size", "Waist", "Hips", "Inseam"],            fields: ["size", "waist", "hips", "inseam"] as const,          note: '91% recycled polyester / 9% spandex, four-way stretch. 2.5" inseam on all sizes.', mannequin: "male" as const, overlayType: "shorts" as const },
  { key: "leggings", label: "Leggings",    data: LEGGINGS_SIZES, cols: ["Size", "Waist", "Hips", "Inseam"],            fields: ["size", "waist", "hips", "inseam"] as const,          note: "75% recycled polyester / 25% elastane. High-waist, second-skin fit — size up if you prefer less compression.", mannequin: "female" as const, overlayType: "leggings" as const },
  { key: "bras",     label: "Sports Bras",  data: BRA_SIZES,     cols: ["Size", "Bust", "Under-Bust"],                 fields: ["size", "bust", "waist"] as const,                    note: "75% recycled polyester / 25% elastane with removable pads. Medium support — true to size.", mannequin: "female" as const, overlayType: "bra" as const },
  { key: "tees",     label: "Tees",         data: TEE_SIZES,     cols: ["Size", "Chest", "Length"],                     fields: ["size", "chest", "length"] as const,                  note: "100% organic cotton, oversized fit. Runs large — consider sizing down for a standard fit.", mannequin: "male" as const, overlayType: "tee" as const },
] as const;

/* ─── Sparkle Effect ─────────────────────────────────────────────── */

function SparkleParticle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="sparkle-particle"
      style={{
        position: "absolute",
        width: "3px",
        height: "3px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(200,200,220,0.6) 40%, transparent 70%)",
        boxShadow: "0 0 6px 2px rgba(255,255,255,0.5), 0 0 12px 4px rgba(200,180,255,0.2)",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

function SparkleField() {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number; size: number }>>([]);

  useEffect(() => {
    const newSparkles = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 5 + Math.random() * 85,
      delay: Math.random() * 4,
      duration: 1.5 + Math.random() * 2.5,
      size: 2 + Math.random() * 3,
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <>
      {sparkles.map((s) => (
        <SparkleParticle
          key={s.id}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </>
  );
}

/* ─── Clothing Overlay SVGs ──────────────────────────────────────── */

interface OverlayProps {
  selectedSize: string | null;
}

function DressOverlay({ selectedSize }: OverlayProps) {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ opacity: selectedSize ? 0.45 : 0.2 }}>
      {/* Dress silhouette on female mannequin */}
      <path
        d="M 38 18 Q 36 17 35 18 L 33 20 Q 30 22 30 26 L 30 30 Q 30 32 32 33 L 33 33 Q 32 36 31 40 L 28 65 Q 27 68 28 70 L 30 72 Q 38 75 50 75 Q 62 75 70 72 L 72 70 Q 73 68 72 65 L 69 40 Q 68 36 67 33 L 68 33 Q 70 32 70 30 L 70 26 Q 70 22 67 20 L 65 18 Q 64 17 62 18 L 58 20 Q 55 18 50 18 Q 45 18 42 20 Z"
        fill="url(#dressGradient)"
        stroke="rgba(200,140,255,0.5)"
        strokeWidth="0.3"
        className="overlay-path"
      />
      {/* Straps */}
      <line x1="40" y1="14" x2="38" y2="18" stroke="rgba(200,140,255,0.4)" strokeWidth="0.5" />
      <line x1="60" y1="14" x2="62" y2="18" stroke="rgba(200,140,255,0.4)" strokeWidth="0.5" />
      <defs>
        <linearGradient id="dressGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(200,140,255,0.15)" />
          <stop offset="50%" stopColor="rgba(255,158,184,0.12)" />
          <stop offset="100%" stopColor="rgba(200,140,255,0.08)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function JerseyOverlay({ selectedSize }: OverlayProps) {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ opacity: selectedSize ? 0.45 : 0.2 }}>
      {/* Jersey on male mannequin */}
      <path
        d="M 35 20 Q 28 21 25 24 L 20 30 Q 18 32 20 34 L 25 33 Q 27 32 28 31 L 28 50 Q 28 52 30 52 L 70 52 Q 72 52 72 50 L 72 31 Q 73 32 75 33 L 80 34 Q 82 32 80 30 L 75 24 Q 72 21 65 20 Q 60 19 55 18 L 52 17 Q 50 17 48 17 L 45 18 Q 40 19 35 20 Z"
        fill="url(#jerseyGradient)"
        stroke="rgba(200,140,255,0.5)"
        strokeWidth="0.3"
        className="overlay-path"
      />
      <defs>
        <linearGradient id="jerseyGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(100,180,255,0.15)" />
          <stop offset="100%" stopColor="rgba(200,140,255,0.12)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ShortsOverlay({ selectedSize }: OverlayProps) {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ opacity: selectedSize ? 0.45 : 0.2 }}>
      {/* Shorts on male mannequin */}
      <path
        d="M 30 48 L 30 52 Q 30 54 30 56 L 32 62 Q 33 64 36 64 L 46 63 Q 48 63 48 61 L 49 56 Q 50 55 51 56 L 52 61 Q 52 63 54 63 L 64 64 Q 67 64 68 62 L 70 56 Q 70 54 70 52 L 70 48 Q 70 46 68 46 L 32 46 Q 30 46 30 48 Z"
        fill="url(#shortsGradient)"
        stroke="rgba(200,140,255,0.5)"
        strokeWidth="0.3"
        className="overlay-path"
      />
      <defs>
        <linearGradient id="shortsGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(140,200,255,0.15)" />
          <stop offset="100%" stopColor="rgba(200,140,255,0.10)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LeggingsOverlay({ selectedSize }: OverlayProps) {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ opacity: selectedSize ? 0.45 : 0.2 }}>
      {/* Leggings on female mannequin */}
      <path
        d="M 34 38 L 34 42 Q 33 50 33 58 L 32 70 Q 31 78 32 84 Q 32 86 34 86 L 42 86 Q 44 86 44 84 L 46 70 Q 47 62 48 56 Q 49 54 50 54 Q 51 54 52 56 Q 53 62 54 70 L 56 84 Q 56 86 58 86 L 66 86 Q 68 86 68 84 Q 69 78 68 70 L 67 58 Q 67 50 66 42 L 66 38 Q 66 36 64 36 L 36 36 Q 34 36 34 38 Z"
        fill="url(#leggingsGradient)"
        stroke="rgba(200,140,255,0.5)"
        strokeWidth="0.3"
        className="overlay-path"
      />
      <defs>
        <linearGradient id="leggingsGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(200,140,255,0.15)" />
          <stop offset="50%" stopColor="rgba(255,158,184,0.10)" />
          <stop offset="100%" stopColor="rgba(200,140,255,0.06)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BraOverlay({ selectedSize }: OverlayProps) {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ opacity: selectedSize ? 0.45 : 0.2 }}>
      {/* Sports bra on female mannequin */}
      <path
        d="M 32 22 Q 30 23 30 26 L 30 32 Q 30 34 32 35 L 36 36 Q 42 37 50 37 Q 58 37 64 36 L 68 35 Q 70 34 70 32 L 70 26 Q 70 23 68 22 L 65 20 Q 62 19 58 19 L 55 18 Q 52 17 50 17 Q 48 17 45 18 L 42 19 Q 38 19 35 20 Z"
        fill="url(#braGradient)"
        stroke="rgba(255,158,184,0.5)"
        strokeWidth="0.3"
        className="overlay-path"
      />
      {/* Straps */}
      <line x1="40" y1="14" x2="38" y2="19" stroke="rgba(255,158,184,0.4)" strokeWidth="0.6" />
      <line x1="60" y1="14" x2="62" y2="19" stroke="rgba(255,158,184,0.4)" strokeWidth="0.6" />
      <defs>
        <linearGradient id="braGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,158,184,0.18)" />
          <stop offset="100%" stopColor="rgba(200,140,255,0.12)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TeeOverlay({ selectedSize }: OverlayProps) {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ opacity: selectedSize ? 0.45 : 0.2 }}>
      {/* Oversized tee on male mannequin */}
      <path
        d="M 33 18 Q 26 20 22 24 L 16 32 Q 14 34 16 36 L 22 35 Q 25 34 26 32 L 26 55 Q 26 57 28 57 L 72 57 Q 74 57 74 55 L 74 32 Q 75 34 78 35 L 84 36 Q 86 34 84 32 L 78 24 Q 74 20 67 18 Q 62 17 57 16 L 53 15 Q 50 15 47 15 L 43 16 Q 38 17 33 18 Z"
        fill="url(#teeGradient)"
        stroke="rgba(200,140,255,0.5)"
        strokeWidth="0.3"
        className="overlay-path"
      />
      <defs>
        <linearGradient id="teeGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(245,200,120,0.12)" />
          <stop offset="100%" stopColor="rgba(200,140,255,0.10)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const OVERLAY_MAP: Record<string, React.FC<OverlayProps>> = {
  dress: DressOverlay,
  jersey: JerseyOverlay,
  shorts: ShortsOverlay,
  leggings: LeggingsOverlay,
  bra: BraOverlay,
  tee: TeeOverlay,
};

/* ─── Measurement Lines ──────────────────────────────────────────── */

interface MeasurementConfig {
  label: string;
  x1: number; y1: number;
  x2: number; y2: number;
  labelX: number; labelY: number;
  side: "left" | "right";
}

const MEASUREMENT_LINES: Record<string, MeasurementConfig[]> = {
  dress: [
    { label: "Bust", x1: 18, y1: 25, x2: 30, y2: 25, labelX: 8, labelY: 25, side: "left" },
    { label: "Waist", x1: 18, y1: 35, x2: 32, y2: 35, labelX: 8, labelY: 35, side: "left" },
    { label: "Hips", x1: 18, y1: 45, x2: 32, y2: 45, labelX: 8, labelY: 45, side: "left" },
    { label: "Length", x1: 75, y1: 20, x2: 75, y2: 72, labelX: 80, labelY: 46, side: "right" },
  ],
  jersey: [
    { label: "Chest", x1: 15, y1: 30, x2: 28, y2: 30, labelX: 5, labelY: 30, side: "left" },
    { label: "Length", x1: 77, y1: 20, x2: 77, y2: 52, labelX: 82, labelY: 36, side: "right" },
  ],
  shorts: [
    { label: "Waist", x1: 18, y1: 47, x2: 30, y2: 47, labelX: 8, labelY: 47, side: "left" },
    { label: "Hips", x1: 18, y1: 53, x2: 30, y2: 53, labelX: 8, labelY: 53, side: "left" },
    { label: "Inseam", x1: 77, y1: 56, x2: 77, y2: 64, labelX: 82, labelY: 60, side: "right" },
  ],
  leggings: [
    { label: "Waist", x1: 18, y1: 38, x2: 32, y2: 38, labelX: 8, labelY: 38, side: "left" },
    { label: "Hips", x1: 18, y1: 45, x2: 32, y2: 45, labelX: 8, labelY: 45, side: "left" },
    { label: "Inseam", x1: 77, y1: 55, x2: 77, y2: 84, labelX: 82, labelY: 70, side: "right" },
  ],
  bra: [
    { label: "Bust", x1: 18, y1: 26, x2: 30, y2: 26, labelX: 8, labelY: 26, side: "left" },
    { label: "Under-Bust", x1: 18, y1: 34, x2: 30, y2: 34, labelX: 2, labelY: 34, side: "left" },
  ],
  tee: [
    { label: "Chest", x1: 15, y1: 32, x2: 26, y2: 32, labelX: 5, labelY: 32, side: "left" },
    { label: "Length", x1: 79, y1: 18, x2: 79, y2: 56, labelX: 84, labelY: 37, side: "right" },
  ],
};

function MeasurementOverlay({ overlayType, selectedSize, sizeData }: { overlayType: string; selectedSize: string | null; sizeData: SizeRow | null }) {
  const lines = MEASUREMENT_LINES[overlayType] || [];
  if (!selectedSize) return null;

  const getValue = (label: string): string => {
    if (!sizeData) return "";
    const key = label.toLowerCase().replace("-", "").replace(" ", "") as string;
    // Map label to field
    const fieldMap: Record<string, string> = {
      "bust": sizeData.bust || "",
      "waist": sizeData.waist || "",
      "hips": sizeData.hips || "",
      "length": sizeData.length || "",
      "inseam": sizeData.inseam || "",
      "chest": sizeData.chest || "",
      "underbust": sizeData.waist || "", // under-bust uses waist field for bras
    };
    return fieldMap[key] || "";
  };

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full measurement-lines" style={{ zIndex: 3 }}>
      {lines.map((line, i) => {
        const value = getValue(line.label);
        const isVertical = line.x1 === line.x2;
        return (
          <g key={i} className="measurement-group" style={{ animationDelay: `${i * 0.15}s` }}>
            {/* Line */}
            <line
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.3"
              strokeDasharray="1,0.8"
              className="measurement-line"
            />
            {/* End caps */}
            {isVertical ? (
              <>
                <line x1={line.x1 - 1.5} y1={line.y1} x2={line.x1 + 1.5} y2={line.y1} stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" />
                <line x1={line.x2 - 1.5} y1={line.y2} x2={line.x2 + 1.5} y2={line.y2} stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" />
              </>
            ) : (
              <>
                <line x1={line.x1} y1={line.y1 - 1.5} x2={line.x1} y2={line.y1 + 1.5} stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" />
                <line x1={line.x2} y1={line.y2 - 1.5} x2={line.x2} y2={line.y2 + 1.5} stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" />
              </>
            )}
            {/* Label background */}
            <rect
              x={line.labelX - 1}
              y={line.labelY - 2.5}
              width={value ? 16 : 10}
              height="5"
              rx="1.5"
              fill="rgba(0,0,0,0.75)"
              stroke="rgba(200,140,255,0.25)"
              strokeWidth="0.2"
            />
            {/* Label text */}
            <text
              x={line.labelX}
              y={line.labelY + 0.8}
              fill="rgba(200,180,255,0.9)"
              fontSize="2.2"
              fontFamily="system-ui, sans-serif"
              fontWeight="600"
              letterSpacing="0.05em"
            >
              {line.label}
              {value && (
                <tspan fill="rgba(255,255,255,0.85)" fontWeight="400"> {value}</tspan>
              )}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Mannequin Viewer ───────────────────────────────────────────── */

function MannequinViewer({ gender, overlayType, selectedSize, sizeData }: {
  gender: "male" | "female";
  overlayType: string;
  selectedSize: string | null;
  sizeData: SizeRow | null;
}) {
  const OverlayComponent = OVERLAY_MAP[overlayType];

  return (
    <div
      className="relative w-full max-w-[320px] mx-auto mannequin-container"
      style={{
        aspectRatio: "701/875",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid rgba(240,210,190,0.08)",
        background: "linear-gradient(145deg, rgba(15,12,18,1), rgba(8,6,10,1))",
      }}
    >
      {/* Mannequin Image */}
      <img
        src={gender === "male" ? "/mannequin-male.png" : "/mannequin-female.png"}
        alt={`${gender} mannequin`}
        className="w-full h-full object-cover"
        style={{ filter: "brightness(1.05) contrast(1.08)" }}
      />

      {/* Sparkle particles */}
      <SparkleField />

      {/* Clothing overlay */}
      {OverlayComponent && (
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          <OverlayComponent selectedSize={selectedSize} />
        </div>
      )}

      {/* Measurement lines */}
      <MeasurementOverlay overlayType={overlayType} selectedSize={selectedSize} sizeData={sizeData} />

      {/* Diamond texture shimmer overlay */}
      <div
        className="absolute inset-0 pointer-events-none diamond-shimmer"
        style={{
          background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.03) 45%, transparent 55%, rgba(255,255,255,0.02) 70%, transparent 80%)",
          backgroundSize: "200% 200%",
          zIndex: 4,
        }}
      />

      {/* Corner label */}
      <div
        className="absolute top-3 left-3 px-3 py-1.5"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(12px)",
          borderRadius: "8px",
          border: "1px solid rgba(200,140,255,0.15)",
          zIndex: 5,
        }}
      >
        <span className="text-[9px] tracking-[0.2em] uppercase font-semibold" style={{ color: "rgba(200,180,255,0.8)" }}>
          {gender === "male" ? "HIS" : "HER"} FIT
        </span>
      </div>

      {/* Size indicator */}
      {selectedSize && (
        <div
          className="absolute top-3 right-3 px-3 py-1.5 size-badge"
          style={{
            background: "linear-gradient(135deg, rgba(200,140,255,0.2), rgba(255,158,184,0.15))",
            backdropFilter: "blur(12px)",
            borderRadius: "8px",
            border: "1px solid rgba(200,140,255,0.3)",
            zIndex: 5,
          }}
        >
          <span className="text-[11px] tracking-[0.15em] uppercase font-bold text-white">
            {selectedSize}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────────── */

export function SizeGuidePage() {
  const [active, setActive] = useState("dresses");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const tab = TABS.find((t) => t.key === active)!;

  const sizeData = selectedSize ? tab.data.find((r) => r.size === selectedSize) || null : null;

  const handleTabChange = useCallback((key: string) => {
    setActive(key);
    setSelectedSize(null);
  }, []);

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

      {/* Sparkle + shimmer CSS animations */}
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes sparkleFlash {
          0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
          15% { opacity: 1; transform: scale(1.5) rotate(45deg); }
          30% { opacity: 0.3; transform: scale(0.8) rotate(90deg); }
          50% { opacity: 0.9; transform: scale(1.3) rotate(135deg); }
          70% { opacity: 0; transform: scale(0.5) rotate(180deg); }
        }
        @keyframes shimmerMove {
          0% { background-position: -200% -200%; }
          100% { background-position: 200% 200%; }
        }
        @keyframes measureFadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 8px rgba(200,140,255,0.2); }
          50% { box-shadow: 0 0 16px rgba(200,140,255,0.4), 0 0 32px rgba(200,140,255,0.1); }
        }
        .sparkle-particle {
          animation: sparkleFlash var(--duration, 2.5s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
          z-index: 5;
        }
        .sparkle-particle:nth-child(odd) {
          animation-name: sparkle;
        }
        .diamond-shimmer {
          animation: shimmerMove 8s ease-in-out infinite;
        }
        .measurement-group {
          animation: measureFadeIn 0.4s ease-out both;
        }
        .measurement-line {
          stroke-dashoffset: 20;
          animation: dashDraw 0.6s ease-out forwards;
        }
        @keyframes dashDraw {
          to { stroke-dashoffset: 0; }
        }
        .size-badge {
          animation: badgePulse 2s ease-in-out infinite;
        }
        .overlay-path {
          transition: opacity 0.4s ease;
        }
        .mannequin-container {
          box-shadow: 0 0 60px rgba(200,140,255,0.05), 0 0 120px rgba(0,0,0,0.3);
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16">
        {/* Header */}
        <h1
          className="text-3xl md:text-4xl text-white font-light mb-3 text-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Size Guide
        </h1>
        <p
          className="text-center text-[13px] mb-10"
          style={{ color: "rgba(245,230,220,0.4)" }}
        >
          All measurements in inches. Select a size to see how it fits.
        </p>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => handleTabChange(t.key)}
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

        {/* Main Content: Mannequin + Table side by side */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Left: Mannequin with overlay */}
          <div className="flex flex-col items-center">
            <MannequinViewer
              gender={tab.mannequin}
              overlayType={tab.overlayType}
              selectedSize={selectedSize}
              sizeData={sizeData}
            />
            <p className="text-[11px] mt-4 text-center" style={{ color: "rgba(245,230,220,0.3)" }}>
              {selectedSize
                ? `Showing ${tab.label.toLowerCase()} fit for size ${selectedSize}`
                : "Select a size below to see the fit overlay"}
            </p>
          </div>

          {/* Right: Size table + selectors */}
          <div>
            {/* Quick size selector row */}
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.2em] uppercase font-semibold mb-3" style={{ color: "rgba(200,140,255,0.55)" }}>
                SELECT YOUR SIZE
              </p>
              <div className="flex flex-wrap gap-2">
                {tab.data.map((row) => (
                  <button
                    type="button"
                    key={row.size}
                    onClick={() => setSelectedSize(selectedSize === row.size ? null : row.size)}
                    className="px-4 py-2.5 text-[12px] tracking-wider uppercase font-medium transition-all"
                    style={{
                      color: selectedSize === row.size ? "white" : "rgba(245,230,220,0.45)",
                      background:
                        selectedSize === row.size
                          ? "linear-gradient(135deg, rgba(200,140,255,0.2), rgba(255,158,184,0.12))"
                          : "transparent",
                      border:
                        selectedSize === row.size
                          ? "1px solid rgba(200,140,255,0.4)"
                          : "1px solid rgba(240,210,190,0.1)",
                      borderRadius: "10px",
                      boxShadow:
                        selectedSize === row.size
                          ? "0 0 12px rgba(200,140,255,0.15)"
                          : "none",
                    }}
                  >
                    {row.size}
                  </button>
                ))}
              </div>
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
                        className="px-4 py-3.5 text-left text-[10px] tracking-[0.2em] uppercase font-semibold"
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
                  {tab.data.map((row, i) => {
                    const isSelected = selectedSize === row.size;
                    return (
                      <tr
                        key={row.size}
                        onClick={() => setSelectedSize(isSelected ? null : row.size)}
                        className="cursor-pointer transition-all"
                        style={{
                          background: isSelected
                            ? "rgba(200,140,255,0.08)"
                            : "transparent",
                        }}
                      >
                        {tab.fields.map((field) => (
                          <td
                            key={field}
                            className="px-4 py-3"
                            style={{
                              color:
                                field === "size"
                                  ? isSelected ? "white" : "rgba(245,230,220,0.7)"
                                  : isSelected ? "rgba(245,230,220,0.8)" : "rgba(245,230,220,0.45)",
                              fontWeight: field === "size" ? 600 : 400,
                              borderBottom:
                                i < tab.data.length - 1
                                  ? "1px solid rgba(240,210,190,0.05)"
                                  : "none",
                            }}
                          >
                            {(row as unknown as Record<string, string | undefined>)[field] || "—"}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Fit Note */}
            <p
              className="mt-4 text-[12px] italic"
              style={{ color: "rgba(245,230,220,0.3)" }}
            >
              {tab.note}
            </p>
          </div>
        </div>

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

        {/* General Tips */}
        <div
          className="p-6"
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
