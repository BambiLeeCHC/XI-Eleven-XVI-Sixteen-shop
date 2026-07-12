import { useQuery, useMutation } from "convex/react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "../hooks/useSessionId";
import type { Id } from "../../convex/_generated/dataModel";
import { SEO, buildProductJsonLd, buildBreadcrumbJsonLd } from "../components/SEO";
import { getProductSEO } from "../data/seoMeta";
import { CompleteTheLook } from "../components/CompleteTheLook";
import { ProductFitGuide } from "../components/ProductFitGuide";

/** Extract just the size label from a variant name like "D-SLIP DRESS [BLACK] / XS" → "XS" */
function cleanSizeLabel(size: string): string {
  const parts = size.split("/");
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return size;
}

/* ─── Image View Labels ──────────────────────────────────────────── */
const IMAGE_LABELS: Record<number, string> = {
  0: "Front View",
  1: "Back View",
  2: "Detail",
  3: "Detail",
};

function getImageLabel(index: number, total: number): string {
  if (total === 1) return "Product View";
  if (total === 2) return index === 0 ? "Front View" : "Back View";
  return IMAGE_LABELS[index] || "Detail";
}

/* ─── 360° Product Viewer ────────────────────────────────────────── */
function Product360Viewer({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [is360Mode, setIs360Mode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Skip first image (luxury hero) for 360° rotation — use mockup angles only
  const angleImages = images.length > 3 ? images.slice(1) : images;
  const has360 = angleImages.length >= 3;
  const displayImage = is360Mode ? angleImages[currentIndex % angleImages.length] : images[currentIndex];

  // Auto-rotate logic
  useEffect(() => {
    if (isAutoRotating && is360Mode) {
      autoRotateInterval.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % angleImages.length);
      }, 600);
    }
    return () => {
      if (autoRotateInterval.current) clearInterval(autoRotateInterval.current);
    };
  }, [isAutoRotating, is360Mode, angleImages.length]);

  const handleDragStart = useCallback(
    (clientX: number) => {
      if (!is360Mode) return;
      setIsDragging(true);
      setIsAutoRotating(false);
      dragStartX.current = clientX;
      dragStartIndex.current = currentIndex;
    },
    [is360Mode, currentIndex]
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !is360Mode) return;
      const container = containerRef.current;
      if (!container) return;
      const dx = clientX - dragStartX.current;
      const width = container.offsetWidth;
      const sensitivity = width / angleImages.length;
      const indexDelta = Math.round(dx / sensitivity);
      const newIndex = ((dragStartIndex.current - indexDelta) % angleImages.length + angleImages.length) % angleImages.length;
      setCurrentIndex(newIndex);
    },
    [isDragging, is360Mode, angleImages.length]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => handleDragEnd();

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  const enter360 = () => {
    setIs360Mode(true);
    setCurrentIndex(0);
    setIsAutoRotating(true);
  };

  const exit360 = () => {
    setIs360Mode(false);
    setCurrentIndex(0);
    setIsAutoRotating(false);
  };

  return (
    <div>
      {/* Main Image */}
      <div
        ref={containerRef}
        className="aspect-[3/4] overflow-hidden mb-4 relative group"
        style={{
          background: "linear-gradient(145deg, rgba(201,169,110,0.03), rgba(201,169,110,0.02))",
          border: "1px solid rgba(240, 210, 190, 0.08)",
          borderRadius: "16px",
          cursor: is360Mode ? (isDragging ? "grabbing" : "grab") : "default",
          userSelect: "none",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover pointer-events-none"
            style={{ borderRadius: "15px" }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ color: "rgba(240,230,211,0.1)" }} className="text-6xl">
              ✦
            </span>
          </div>
        )}

        {/* 360° Mode Overlay */}
        {is360Mode && (
          <>
            {/* Rotation indicator */}
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2"
              style={{
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(12px)",
                borderRadius: "20px",
                border: "1px solid rgba(201,169,110,0.2)",
              }}
            >
              <span className="text-[18px]" style={{ animation: isAutoRotating ? "spin360 2s linear infinite" : "none" }}>
                ↻
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#f0e6d3]/70">
                {isAutoRotating ? "AUTO" : "DRAG TO ROTATE"}
              </span>
            </div>

            {/* Angle indicator dots */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(8px)",
                borderRadius: "12px",
                padding: "6px 10px",
              }}
            >
              {angleImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                    setIsAutoRotating(false);
                  }}
                  className="transition-all duration-200"
                  style={{
                    width: i === currentIndex % angleImages.length ? "16px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    background:
                      i === currentIndex % angleImages.length
                        ? "linear-gradient(135deg, #c9a96e, #e8d5b0)"
                        : "rgba(255,255,255,0.3)",
                  }}
                />
              ))}
            </div>

            {/* Close 360 button */}
            <button
              type="button"
              onClick={exit360}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-all"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                fontSize: "14px",
              }}
            >
              ✕
            </button>

            {/* Play / Pause */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoRotating(!isAutoRotating);
              }}
              className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center transition-all"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                fontSize: "12px",
              }}
            >
              {isAutoRotating ? "⏸" : "▶"}
            </button>
          </>
        )}

        {/* Image View Label (shown when NOT in 360 mode) */}
        {!is360Mode && (
          <div
            className="absolute bottom-4 left-4 px-3 py-1.5"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(10px)",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span
              className="text-[9px] tracking-[0.18em] uppercase font-medium"
              style={{ color: "rgba(17,17,24,0.7)" }}
            >
              {getImageLabel(currentIndex, images.length)}
            </span>
          </div>
        )}

        {/* 360° Enter Button (shown when NOT in 360 mode, product has enough images) */}
        {!is360Mode && has360 && (
          <button
            type="button"
            onClick={enter360}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 transition-all opacity-0 group-hover:opacity-100"
            style={{
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(12px)",
              borderRadius: "20px",
              border: "1px solid rgba(201,169,110,0.25)",
              color: "white",
            }}
          >
            <span style={{ fontSize: "16px" }}>↻</span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-semibold">360° VIEW</span>
          </button>
        )}
      </div>

      {/* Thumbnail Strip (hidden in 360 mode) */}
      {!is360Mode && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setCurrentIndex(i)}
                className="w-16 h-20 overflow-hidden transition-all"
                style={{
                  border:
                    i === currentIndex
                      ? "2px solid rgba(201,169,110,0.4)"
                      : "1px solid rgba(201,169,110,0.1)",
                  borderRadius: "10px",
                  background: "rgba(201,169,110,0.02)",
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" style={{ borderRadius: "8px" }} />
              </button>
              <span
                className="text-[7px] tracking-[0.15em] uppercase"
                style={{
                  color: i === currentIndex ? "rgba(201,169,110,0.7)" : "rgba(240,230,211,0.3)",
                  fontWeight: i === currentIndex ? 600 : 400,
                }}
              >
                {getImageLabel(i, images.length).replace(" View", "")}
              </span>
            </div>
          ))}

          {/* 360 quick-enter thumbnail */}
          {has360 && (
            <button
              type="button"
              onClick={enter360}
              className="w-16 h-20 flex-shrink-0 flex flex-col items-center justify-center gap-1 transition-all"
              style={{
                border: "1px solid rgba(201,169,110,0.2)",
                borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(201,169,110,0.06), rgba(255,158,184,0.04))",
              }}
            >
              <span style={{ fontSize: "18px", color: "rgba(201,169,110,0.6)" }}>↻</span>
              <span className="text-[8px] tracking-wider uppercase" style={{ color: "rgba(201,169,110,0.5)" }}>
                360°
              </span>
            </button>
          )}
        </div>
      )}

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin360 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ─── Product Page ────────────────────────────────────────────────── */
// ── Fabric Composition Data (from Printful catalog) ──
const FABRIC_DATA: Record<string, { composition: string; weight: string; features: string[]; certifications?: string[]; care?: string[] }> = {
  "D-Slip Dress": {
    composition: "100% Heavy Polyester Chiffon",
    weight: "5.9 oz./yd.² (200 g/m²)",
    features: ["Lightweight & breathable", "Fluid drape", "Relaxed fit", "Built-in bra"],
    care: ["Machine wash cold, gentle cycle", "Do not bleach", "Tumble dry low", "Cool iron if needed"],
  },
  "J-Glitch Jersey": {
    composition: "100% Recycled Polyester",
    weight: "4.42–5.61 oz./yd.² (150–190 g/m²)",
    features: ["Two-way stretch", "Moisture-wicking", "UPF50+ protection", "Regular fit"],
    certifications: ["OEKO-TEX 100 Standard", "Global Recycled Standard (GRS)"],
    care: ["Machine wash cold", "Do not bleach", "Hang dry recommended", "Do not iron decoration"],
  },
  'S-Glitch 2.5"': {
    composition: "91% Recycled Polyester, 9% Spandex",
    weight: "5.13 oz./yd.² (174 g/m²)",
    features: ["Four-way stretch", "Moisture-wicking microfiber", "Breathable & fast-drying", "UPF50+ protection", "2.5\" (6.3 cm) inseam", "Elastic waistband with drawstring", "Side pockets", "Built-in liner"],
    care: ["Machine wash cold", "Do not bleach", "Tumble dry low", "Do not iron decoration"],
  },
  'S-Glitch 6.3"': {
    composition: "91% Recycled Polyester, 9% Spandex",
    weight: "5.13 oz./yd.² (174 g/m²)",
    features: ["Four-way stretch", "Moisture-wicking microfiber", "Breathable & fast-drying", "UPF50+ protection", "6.3\" (16 cm) inseam", "Elastic waistband with flat white drawstring", "Mesh side pockets", "No inner lining"],
    care: ["Machine wash cold", "Do not bleach", "Tumble dry low", "Do not iron decoration"],
  },
  "S-Glitch": {
    composition: "91% Recycled Polyester, 9% Spandex",
    weight: "5.13 oz./yd.² (174 g/m²)",
    features: ["Four-way stretch", "Moisture-wicking microfiber", "Breathable & fast-drying", "UPF50+ protection", "Elastic waistband with drawstring", "Side pockets"],
    care: ["Machine wash cold", "Do not bleach", "Tumble dry low", "Do not iron decoration"],
  },
  "L-Flow Leggings": {
    composition: "75% Recycled Polyester, 25% Elastane",
    weight: "6.64 oz./yd.² (225 g/m²)",
    features: ["Four-way stretch", "Smooth microfiber yarn", "Raised waistband", "Precision-cut & hand-sewn"],
    care: ["Machine wash cold, inside out", "Do not bleach", "Hang dry", "Avoid rough surfaces"],
  },
  "B-Lift Sports Bra": {
    composition: "75% Recycled Polyester, 25% Elastane",
    weight: "6.64 oz./yd.² (225 g/m²)",
    features: ["Four-way stretch", "Moisture-wicking", "Removable padding", "Scoop neck & racerback", "Wide elastic under-band", "Flat seams — no rubbing", "Best for A–C cups"],
    certifications: ["Sports mesh lining: 92% Polyester, 8% Spandex"],
    care: ["Hand wash or machine wash cold, gentle", "Do not bleach", "Lay flat to dry", "Do not iron"],
  },
  "T-Icon Oversized Tee": {
    composition: "100% Organic Combed Ring-Spun Cotton",
    weight: "5.9 oz./yd.² (200 g/m²)",
    features: ["Oversized fit", "Dropped shoulders", "1×1 rib collar", "Heavyweight feel"],
    certifications: ["GOTS (Global Organic Textile Standard)", "OCS (Organic Content Standard)"],
    care: ["Machine wash cold", "Do not bleach", "Tumble dry low", "Do not iron decoration"],
  },
  "T-Icon Tie-Dye Tee": {
    composition: "100% US Grown Cotton",
    weight: "7.5 oz./yd.² (254 g/m²)",
    features: ["Heavyweight material", "Oversized fit", "Ribbed neck", "Unique tie-dye pattern — each piece is one-of-a-kind"],
    care: ["Machine wash cold separately", "Do not bleach", "Tumble dry low", "Colors may vary slightly"],
  },
};

function getFabricForProduct(productName: string) {
  for (const [key, data] of Object.entries(FABRIC_DATA)) {
    if (productName.startsWith(key)) return data;
  }
  return null;
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = useQuery(
    api.products.getById,
    id ? { productId: id as Id<"products"> } : "skip"
  );
  const addToCart = useMutation(api.cart.addItem);
  const sessionId = useSessionId();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "fit" | "fabric">("details");

  if (product === undefined) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-pulse" style={{ color: "rgba(240,230,211,0.3)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center flex-col gap-4">
        <p style={{ color: "rgba(240,230,211,0.5)" }}>Product not found.</p>
        <Link to="/shop" className="text-[12px] tracking-wider uppercase" style={{ color: "#c9a96e" }}>
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedSize && product.sizes.length > 0) return;
    await addToCart({
      sessionId,
      productId: product._id,
      size: selectedSize || "One Size",
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const productSeo = getProductSEO(product);
  const productJsonLd = buildProductJsonLd(product);
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: product.name, url: `/product/${product._id}` },
  ]);

  return (
    <>
    <SEO
      title={productSeo.title}
      description={productSeo.description}
      image={product.images?.[0]}
      url={`/product/${product._id}`}
      type="product"
      jsonLd={[productJsonLd, breadcrumbLd]}
    />
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          to="/shop"
          className="text-[11px] tracking-[0.15em] uppercase transition-colors"
          style={{ color: "rgba(240,230,211,0.38)" }}
        >
          ← Back to Collection
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* 360° Image Viewer */}
        <Product360Viewer images={product.images || []} name={product.name} />

        {/* Product Info */}
        <div className="flex flex-col">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "rgba(201,169,110,0.55)" }}>
            {product.category}
          </p>
          <h1
            className="text-3xl md:text-4xl text-[#f0e6d3] font-light mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {product.name}
          </h1>
          <p className="text-2xl mb-6" style={{ color: "rgba(240,230,211,0.75)" }}>
            ${(product.price / 100).toFixed(2)}
          </p>

          {/* ── Details / Fit Guide / Fabric Section ── */}
          <div
            style={{
              background: activeTab === "details"
                ? "linear-gradient(165deg, rgba(245,238,230,0.06), rgba(235,228,220,0.03))"
                : "linear-gradient(165deg, rgba(245,238,230,0.97), rgba(235,228,220,0.95))",
              borderRadius: "16px",
              border: activeTab === "details"
                ? "1px solid rgba(201,169,110,0.08)"
                : "1px solid rgba(200,180,160,0.3)",
              padding: "0",
              marginBottom: "24px",
              transition: "all 0.35s ease",
              boxShadow: activeTab !== "details"
                ? "0 8px 40px rgba(201,169,110,0.08), 0 2px 12px rgba(0,0,0,0.1)"
                : "none",
              overflow: "hidden",
            }}
          >
            {/* Tab buttons */}
            <div className="flex gap-0" style={{ borderBottom: activeTab !== "details" ? "1px solid rgba(180,160,140,0.15)" : "1px solid rgba(201,169,110,0.06)" }}>
              {(["details", "fit", "fabric"] as const).map((tab) => {
                const isActive = activeTab === tab;
                const isLight = activeTab !== "details";
                const label = tab === "details" ? "Details" : tab === "fit" ? "Fit Guide" : "Fabric & Care";
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-3.5 text-[11px] tracking-[0.2em] uppercase font-bold transition-all relative flex items-center justify-center gap-1.5"
                    style={{
                      color: isActive
                        ? (isLight ? "rgba(30,25,20,0.9)" : "white")
                        : (isLight ? "rgba(30,25,20,0.35)" : "rgba(240,230,211,0.35)"),
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <span>{label}</span>
                    {tab !== "details" && (
                      <span className="text-[9px]" style={{ color: isActive ? "rgba(160,100,220,0.7)" : "rgba(201,169,110,0.4)" }}>✦</span>
                    )}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2.5px]"
                        style={{ background: "linear-gradient(90deg, #c9a96e, #e8d5b0)", borderRadius: "2px" }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div style={{ padding: activeTab === "details" ? "16px 16px" : "20px 16px" }}>
              {activeTab === "details" ? (
                <p className="text-[14px] leading-relaxed whitespace-pre-line" style={{ color: "rgba(240,230,211,0.4)" }}>
                  {product.description}
                </p>
              ) : activeTab === "fit" ? (
                <ProductFitGuide
                  product={{ name: product.name, category: product.category, sizes: product.sizes || [], images: product.images || [] }}
                  externalSize={selectedSize ? cleanSizeLabel(selectedSize) : undefined}
                  onSizeSelect={(size) => {
                    const match = product.sizes?.find((s: string) => cleanSizeLabel(s) === size);
                    if (match) setSelectedSize(match);
                  }}
                  lightMode={true}
                />
              ) : (() => {
                const fabric = getFabricForProduct(product.name);
                if (!fabric) return <p style={{ color: "rgba(30,25,20,0.4)", fontSize: 14 }}>Fabric details coming soon.</p>;
                return (
                  <div className="space-y-5">
                    {/* Composition */}
                    <div>
                      <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold mb-2" style={{ color: "rgba(30,25,20,0.45)" }}>Composition</h4>
                      <p className="text-[15px] font-semibold" style={{ color: "rgba(30,25,20,0.85)" }}>{fabric.composition}</p>
                      <p className="text-[12px] mt-1" style={{ color: "rgba(30,25,20,0.5)" }}>Weight: {fabric.weight}</p>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold mb-2" style={{ color: "rgba(30,25,20,0.45)" }}>Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {fabric.features.map((f, i) => (
                          <span key={i} className="text-[11px] px-3 py-1.5" style={{
                            background: "rgba(201,169,110,0.08)",
                            border: "1px solid rgba(201,169,110,0.15)",
                            borderRadius: "20px",
                            color: "rgba(30,25,20,0.7)",
                          }}>{f}</span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    {fabric.certifications && fabric.certifications.length > 0 && (
                      <div>
                        <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold mb-2" style={{ color: "rgba(30,25,20,0.45)" }}>Certifications</h4>
                        <ul className="space-y-1">
                          {fabric.certifications.map((c, i) => (
                            <li key={i} className="text-[12px] flex items-center gap-2" style={{ color: "rgba(30,25,20,0.65)" }}>
                              <span style={{ color: "rgba(16,185,129,0.8)" }}>✓</span> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Care Instructions */}
                    {fabric.care && fabric.care.length > 0 && (
                      <div>
                        <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold mb-2" style={{ color: "rgba(30,25,20,0.45)" }}>Care Instructions</h4>
                        <ul className="space-y-1.5">
                          {fabric.care.map((c, i) => (
                            <li key={i} className="text-[12px] flex items-center gap-2" style={{ color: "rgba(30,25,20,0.6)" }}>
                              <span className="text-[10px]">◆</span> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div className="mb-8">
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-3"
                style={{ color: "rgba(240,230,211,0.45)" }}
              >
                SIZE
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="px-4 py-2 text-[11px] tracking-wider uppercase transition-all"
                    style={{
                      color: selectedSize === size ? "white" : "rgba(240,230,211,0.45)",
                      background:
                        selectedSize === size
                          ? "linear-gradient(135deg, rgba(201,169,110,0.15), rgba(255,158,184,0.08))"
                          : "transparent",
                      border:
                        selectedSize === size
                          ? "1px solid rgba(201,169,110,0.3)"
                          : "1px solid rgba(201,169,110,0.1)",
                      borderRadius: "10px",
                    }}
                  >
                    {cleanSizeLabel(size)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.sizes?.length > 0 && !selectedSize}
            className="w-full py-4 text-[12px] tracking-[0.25em] uppercase font-bold text-[#f0e6d3] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: added
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #c9a96e 0%, #e8d5b0 50%, #f5c97a 100%)",
              backgroundSize: "200% 100%",
              border: "none",
              borderRadius: "12px",
              boxShadow: added
                ? "0 4px 20px rgba(16,185,129,0.3)"
                : "0 4px 24px rgba(201,169,110,0.25), 0 1px 3px rgba(0,0,0,0.2)",
              letterSpacing: "0.25em",
            }}
          >
            {added ? "✓ ADDED TO CART" : "ADD TO CART"}
          </button>

          {/* Trust signals */}
          {/* Made for You callout */}
          <div className="flex items-start gap-3 mt-6 p-4" style={{
            background: "rgba(201,169,110,0.04)",
            border: "1px solid rgba(201,169,110,0.08)",
            borderRadius: "12px",
          }}>
            <span className="text-base shrink-0 mt-0.5">✦</span>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(201,169,110,0.7)" }}>Made Exclusively for You</p>
              <p className="text-[10px] leading-relaxed" style={{ color: "rgba(240,230,211,0.35)" }}>
                This piece is crafted on demand — produced the moment you order, just for you. No mass production, no waste. Production takes 2–5 business days.
              </p>
            </div>
          </div>

          <div className="flex gap-6 mt-6 pt-5" style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}>
            <div className="flex items-center gap-2">
              <span className="text-sm">📦</span>
              <span className="text-[10px]" style={{ color: "rgba(240,230,211,0.38)" }}>
                Free Shipping
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">🪡</span>
              <span className="text-[10px]" style={{ color: "rgba(240,230,211,0.38)" }}>
                Made to Order
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">🔒</span>
              <span className="text-[10px]" style={{ color: "rgba(240,230,211,0.38)" }}>
                Secure Checkout
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete the Look */}
      <CompleteTheLook currentProduct={product} />
    </div>
    </>
  );
}
