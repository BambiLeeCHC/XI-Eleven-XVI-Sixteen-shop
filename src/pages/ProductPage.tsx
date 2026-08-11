import { useQuery, useMutation } from "../lib/backend";
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/backend";
import { useSessionId } from "../hooks/useSessionId";
import { SEO, buildProductJsonLd, buildBreadcrumbJsonLd } from "../components/SEO";
import { getProductSEO } from "../data/seoMeta";
import { CompleteTheLook } from "../components/CompleteTheLook";
import { ProductFitGuide } from "../components/ProductFitGuide";
import { getProductRotation } from "../data/productRotations";

/** Extract just the size label from a variant name like "D-SLIP DRESS [BLACK] / XS" → "XS" */
function cleanSizeLabel(size: string): string {
  const parts = size.split("/");
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return size;
}

/** Split a product description into narrative copy vs. fabric/care details.
 *  Descriptions are written with fabric composition/care called out at the end
 *  (e.g. "Fabric composition: 100% polyester chiffon. Machine-washable."). We
 *  pull that out so it can live in its own "Fabric & Care" accordion section. */
function splitDescription(description?: string): { body: string; fabric: string | null } {
  if (!description) return { body: "", fabric: null };
  const match = description.match(/(Fabric composition:[\s\S]*)/i);
  if (!match || match.index === undefined) {
    return { body: description.trim(), fabric: null };
  }
  return {
    body: description.slice(0, match.index).trim(),
    fabric: match[1].trim(),
  };
}

/** A single collapsible row used for Description / Fit / Fabric & Care. */
function AccordionRow({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderTop: "1px solid rgba(21,36,61,0.12)" }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <span
          className="text-[11px] tracking-[0.2em] uppercase font-semibold"
          style={{ color: "#15243d" }}
        >
          {label}
        </span>
        <span
          style={{
            color: "rgba(21,36,61,0.5)",
            fontSize: "13px",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▾
        </span>
      </button>
      {isOpen && <div className="pb-5">{children}</div>}
    </div>
  );
}

/* ─── 360° Product Viewer ────────────────────────────────────────── */
function Product360Viewer({
  images,
  rotationImages,
  name,
}: {
  images: string[];
  rotationImages?: string[];
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

  // A true rotation is an explicit, approved eight-frame sequence. Ordinary
  // gallery images must never be inferred to be a 360° view.
  const angleImages = rotationImages?.length === 8 ? rotationImages : [];
  const has360 = angleImages.length === 8;
  const displayImage = is360Mode ? angleImages[currentIndex % angleImages.length] : images[currentIndex];

  // Keep rotation frames off the network until the shopper explicitly opens
  // 360° mode, then warm the remaining frames for smooth dragging.
  useEffect(() => {
    if (!is360Mode || !has360) return;
    for (const src of angleImages) {
      const image = new Image();
      image.src = src;
    }
  }, [angleImages, has360, is360Mode]);

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
        role="region"
        aria-label={`${name} product gallery${has360 ? " with 360 degree view" : ""}`}
        className="aspect-[3/4] overflow-hidden mb-4 relative group"
        style={{
          background: "linear-gradient(145deg, #f7f5f1, #efece6)",
          border: "1px solid rgba(21,36,61,0.10)",
          borderRadius: "16px",
          cursor: is360Mode ? (isDragging ? "grabbing" : "grab") : "default",
          userSelect: "none",
          touchAction: is360Mode ? "none" : "pan-y",
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
            alt={is360Mode ? `${name}, angle ${currentIndex + 1} of 8` : name}
            className={`w-full h-full pointer-events-none ${
              is360Mode ? "object-contain" : "object-cover"
            }`}
            style={{ borderRadius: "15px" }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ color: "rgba(21,36,61,0.08)" }} className="text-6xl">
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
                border: "1px solid rgba(185,149,69,0.35)",
              }}
            >
              <span className="text-[18px]" style={{ animation: isAutoRotating ? "spin360 2s linear infinite" : "none" }}>
                ↻
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/70">
                {isAutoRotating ? "AUTO" : "DRAG TO ROTATE"}
              </span>
            </div>

            {/* Angle indicator dots */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(8px)",
                borderRadius: "12px",
                padding: "6px 10px",
              }}
            >
              <input
                type="range"
                min="0"
                max={angleImages.length - 1}
                step="1"
                value={currentIndex % angleImages.length}
                aria-label={`Rotate ${name}`}
                onChange={(event) => {
                  setCurrentIndex(Number(event.target.value));
                  setIsAutoRotating(false);
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                className="w-40 accent-[#b99545]"
              />
              <div className="flex gap-1.5" aria-hidden="true">
                {angleImages.map((_, i) => (
                  <span
                    key={i}
                    className="transition-all duration-200"
                    style={{
                      width: i === currentIndex % angleImages.length ? "16px" : "6px",
                      height: "6px",
                      borderRadius: "3px",
                      background:
                        i === currentIndex % angleImages.length
                          ? "linear-gradient(135deg, #b99545, #d9b876)"
                          : "rgba(255,255,255,0.3)",
                    }}
                  />
                ))}
              </div>
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

        {/* 360° Enter Button — icon-only, appears on hover to stay out of the way */}
        {!is360Mode && has360 && (
          <button
            type="button"
            onClick={enter360}
            title="View in 360°"
            aria-label="View in 360°"
            className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: "rgba(21,36,61,0.72)",
              backdropFilter: "blur(10px)",
              borderRadius: "50%",
              border: "1px solid rgba(185,149,69,0.4)",
              color: "white",
              fontSize: "15px",
            }}
          >
            ↻
          </button>
        )}
      </div>

      {/* Image grid — every shot shown at full size, no filmstrip clutter */}
      {!is360Mode && images.length > 1 && (
        <div className="grid grid-cols-2 gap-3">
          {images
            .map((img, i) => ({ img, i }))
            .filter(({ i }) => i !== currentIndex)
            .map(({ img, i }) => (
              <button
                type="button"
                key={i}
                onClick={() => setCurrentIndex(i)}
                className="aspect-[3/4] overflow-hidden transition-opacity hover:opacity-90"
                style={{
                  borderRadius: "14px",
                  border: "1px solid rgba(21,36,61,0.08)",
                  background: "linear-gradient(145deg, #f7f5f1, #efece6)",
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
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
export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = useQuery(
    api.products.getById,
    id ? { productId: id as string } : "skip"
  );
  const addToCart = useMutation(api.cart.addItem);
  const sessionId = useSessionId();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState<"description" | "fit" | "fabric" | null>("description");

  if (product === undefined) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-pulse" style={{ color: "rgba(21,36,61,0.42)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center flex-col gap-4">
        <p style={{ color: "rgba(21,36,61,0.65)" }}>Product not found.</p>
        <Link to="/shop" className="text-[12px] tracking-wider uppercase" style={{ color: "rgba(21,36,61,0.75)" }}>
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedSize && product.sizes.length > 0) return;
    // Products that carry several colourways in one listing (the tees) must not fall
    // back to "whichever variant matched the size first" — that shipped the wrong colour.
    if (colorOptions.length > 1 && !selectedColor) return;
    await addToCart({
      sessionId,
      productId: product._id,
      size: selectedSize || "One Size",
      color: colorOptions.length > 1 ? selectedColor : undefined,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Some products (both T-Icon tees) hold every colourway in a single listing.
  const colorOptions: string[] = (() => {
    const seen: string[] = [];
    for (const variant of (product.printfulVariants || []) as any[]) {
      const color = variant?.color;
      if (color && !seen.some((c) => c.toLowerCase() === String(color).toLowerCase())) {
        seen.push(String(color));
      }
    }
    return seen;
  })();
  const hasColorAxis = colorOptions.length > 1;
  const { body: descriptionBody, fabric: fabricDetails } = splitDescription(product.description);

  const variantForSize = (size: string, color?: string) =>
    (product.printfulVariants || []).find((variant: any) => {
      const variantSize = variant.size || variant.name?.split(" / ").pop();
      const sizeMatches = cleanSizeLabel(variantSize || "") === cleanSizeLabel(size);
      if (!sizeMatches) return false;
      if (!hasColorAxis) return true;
      const wanted = color ?? selectedColor;
      if (!wanted) return true;
      return String(variant.color || "").toLowerCase() === wanted.toLowerCase();
    });
  const isSizeAvailable = (size: string) => {
    const variant = variantForSize(size);
    return Boolean(
      variant?.id &&
      variant?.is_ignored !== true &&
      variant?.availability_status !== "out_of_stock" &&
      variant?.availability_status !== "discontinued",
    );
  };
  const deliveryStart = new Date();
  deliveryStart.setDate(deliveryStart.getDate() + 6);
  const deliveryEnd = new Date();
  deliveryEnd.setDate(deliveryEnd.getDate() + 12);
  const deliveryWindow = `${deliveryStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${deliveryEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

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
          style={{ color: "rgba(21,36,61,0.52)" }}
        >
          ← Back to Collection
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* 360° Image Viewer */}
        <Product360Viewer
          images={product.images || []}
          rotationImages={
            product.rotationImages?.length === 8
              ? product.rotationImages
              : getProductRotation(product.name)
          }
          name={product.name}
        />

        {/* Product Info */}
        <div className="flex flex-col">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "rgba(21,36,61,0.55)" }}>
            {product.category}
          </p>
          <h1
            className="text-3xl md:text-4xl font-light mb-4"
            style={{ fontFamily: "var(--font-display)", color: "#15243d" }}
          >
            {product.name}
          </h1>
          <p className="text-2xl mb-6" style={{ color: "rgba(21,36,61,0.88)" }}>
            ${(product.price / 100).toFixed(2)}
          </p>

          {/* Description / Fit / Fabric & Care — expandable rows, no card chrome */}
          <div className="mb-6" style={{ borderBottom: "1px solid rgba(21,36,61,0.12)" }}>
            <AccordionRow
              label="Description"
              isOpen={openSection === "description"}
              onToggle={() => setOpenSection(openSection === "description" ? null : "description")}
            >
              <p className="text-[14px] leading-relaxed whitespace-pre-line" style={{ color: "rgba(21,36,61,0.6)" }}>
                {descriptionBody}
              </p>
            </AccordionRow>

            <AccordionRow
              label="Fit & Size Guide"
              isOpen={openSection === "fit"}
              onToggle={() => setOpenSection(openSection === "fit" ? null : "fit")}
            >
              <ProductFitGuide
                product={{ name: product.name, category: product.category, sizes: product.sizes || [], images: product.images || [] }}
                externalSize={selectedSize ? cleanSizeLabel(selectedSize) : undefined}
                onSizeSelect={(size) => {
                  const match = product.sizes?.find((s: string) => cleanSizeLabel(s) === size);
                  if (match) setSelectedSize(match);
                }}
                lightMode={true}
              />
            </AccordionRow>

            {fabricDetails && (
              <AccordionRow
                label="Fabric & Care"
                isOpen={openSection === "fabric"}
                onToggle={() => setOpenSection(openSection === "fabric" ? null : "fabric")}
              >
                <p className="text-[14px] leading-relaxed whitespace-pre-line" style={{ color: "rgba(21,36,61,0.6)" }}>
                  {fabricDetails}
                </p>
              </AccordionRow>
            )}
          </div>

          {/* Colour Selector — only for listings with more than one colourway */}
          {hasColorAxis && (
            <div className="mb-8">
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-3"
                style={{ color: "rgba(21,36,61,0.6)" }}
              >
                COLOUR{selectedColor ? ` — ${selectedColor}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color: string) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="px-4 py-2 text-[11px] tracking-wider uppercase transition-all"
                    style={{
                      color: selectedColor === color ? "#ffffff" : "rgba(21,36,61,0.65)",
                      background: selectedColor === color ? "#15243d" : "transparent",
                      border:
                        selectedColor === color
                          ? "1px solid #15243d"
                          : "1px solid rgba(21,36,61,0.16)",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                    title={`Select ${color}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div className="mb-8">
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-3"
                style={{ color: "rgba(21,36,61,0.6)" }}
              >
                SIZE
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => {
                  const available = isSizeAvailable(size);
                  return (
                  <button
                    type="button"
                    key={size}
                    onClick={() => available && setSelectedSize(size)}
                    disabled={!available}
                    className="px-4 py-2 text-[11px] tracking-wider uppercase transition-all"
                    style={{
                      color: selectedSize === size ? "#ffffff" : "rgba(21,36,61,0.65)",
                      background: selectedSize === size ? "#15243d" : "transparent",
                      border:
                        selectedSize === size
                          ? "1px solid #15243d"
                          : "1px solid rgba(21,36,61,0.16)",
                      borderRadius: "10px",
                      opacity: available ? 1 : 0.32,
                      textDecoration: available ? "none" : "line-through",
                      cursor: available ? "pointer" : "not-allowed",
                    }}
                    title={available ? `Select ${cleanSizeLabel(size)}` : "Currently unavailable"}
                  >
                    {cleanSizeLabel(size)}
                  </button>
                  );
                })}
              </div>
              <p className="text-[9px] mt-2" style={{ color: "rgba(21,36,61,0.4)" }}>
                Unavailable variants cannot be added to cart.
              </p>
            </div>
          )}

          <p className="text-[11px] mb-5" style={{ color: "rgba(21,36,61,0.5)" }}>
            Estimated delivery <span style={{ color: "rgba(21,36,61,0.75)", fontWeight: 600 }}>{deliveryWindow}</span> · Made to order, just for you
          </p>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={(product.sizes?.length > 0 && !selectedSize) || (hasColorAxis && !selectedColor)}
            className="w-full py-4 text-[12px] tracking-[0.25em] uppercase font-bold text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: added
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #15243d 0%, #2a3d5c 100%)",
              backgroundSize: "200% 100%",
              border: "none",
              borderRadius: "12px",
              boxShadow: added
                ? "0 4px 20px rgba(16,185,129,0.3)"
                : "0 6px 24px rgba(21,36,61,0.22)",
              letterSpacing: "0.25em",
            }}
          >
            {added
              ? "✓ ADDED TO CART"
              : hasColorAxis && !selectedColor
                ? "SELECT A COLOUR"
                : product.sizes?.length > 0 && !selectedSize
                  ? "SELECT A SIZE"
                  : "ADD TO CART"}
          </button>

          {/* Trust signals */}
          <div className="flex gap-6 mt-6 pt-5" style={{ borderTop: "1px solid rgba(21,36,61,0.12)" }}>
            <div className="flex items-center gap-2">
              <span className="text-sm">📦</span>
              <span className="text-[10px]" style={{ color: "rgba(21,36,61,0.52)" }}>
                Free Shipping
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">🪡</span>
              <span className="text-[10px]" style={{ color: "rgba(21,36,61,0.52)" }}>
                Made to Order
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">🔒</span>
              <span className="text-[10px]" style={{ color: "rgba(21,36,61,0.52)" }}>
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
