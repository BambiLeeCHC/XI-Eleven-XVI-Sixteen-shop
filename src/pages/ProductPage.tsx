import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CompleteTheLook } from "../components/CompleteTheLook";
import { ProductFitGuide } from "../components/ProductFitGuide";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  SEO,
} from "../components/SEO";
import { getProductRotation } from "../data/productRotations";
import { getProductSEO } from "../data/seoMeta";
import { useSessionId } from "../hooks/useSessionId";
import { api, useMutation, useQuery } from "../lib/backend";
import {
  colorFromName,
  displayProductName,
  formatPrice,
  snapHex,
  styleKeyFromName,
} from "../lib/brand";
import { hiResProductImage } from "../lib/productImage";
import { RadialVariantDial } from "../components/RadialVariantDial";

/** Extract just the size label from a variant name like "D-SLIP DRESS [BLACK] / XS" → "XS" */
function cleanSizeLabel(size: string): string {
  const parts = size.split("/");
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return size;
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
  const autoRotateInterval = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // A true rotation is an explicit, approved eight-frame sequence. Ordinary
  // gallery images must never be inferred to be a 360° view.
  const angleImages = rotationImages?.length === 8 ? rotationImages : [];
  const has360 = angleImages.length === 8;
  const displayImage = is360Mode
    ? angleImages[currentIndex % angleImages.length]
    : images[currentIndex];

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
        setCurrentIndex(prev => (prev + 1) % angleImages.length);
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
    [is360Mode, currentIndex],
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
      const newIndex =
        (((dragStartIndex.current - indexDelta) % angleImages.length) +
          angleImages.length) %
        angleImages.length;
      setCurrentIndex(newIndex);
    },
    [isDragging, is360Mode, angleImages.length],
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
  const onTouchStart = (e: React.TouchEvent) =>
    handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) =>
    handleDragMove(e.touches[0].clientX);
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
    <div className="pdp-gallery">
      <div
        ref={containerRef}
        role="region"
        aria-label={`${name} product gallery${has360 ? " with 360 degree view" : ""}`}
        className="pdp-gallery__stage product-stage"
        style={{
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
            src={hiResProductImage(displayImage, 1800)}
            srcSet={`${hiResProductImage(displayImage, 900)} 900w, ${hiResProductImage(displayImage, 1800)} 1800w`}
            sizes="(min-width: 880px) 50vw, 100vw"
            alt={is360Mode ? `${name}, angle ${currentIndex + 1} of 8` : name}
            className="pdp-gallery__shot"
            draggable={false}
            decoding="async"
            fetchPriority="high"
          />
        ) : (
          <div className="pdp-gallery__empty">✦</div>
        )}
        <span className="product-stage__grain" aria-hidden="true" />

        {!is360Mode && images.length > 1 && (
          <>
            <button
              type="button"
              className="pdp-gallery__nav pdp-gallery__nav--prev"
              aria-label="Previous photo"
              onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
            >
              ‹
            </button>
            <button
              type="button"
              className="pdp-gallery__nav pdp-gallery__nav--next"
              aria-label="Next photo"
              onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
            >
              ›
            </button>
          </>
        )}

        {is360Mode && (
          <>
            <div className="pdp-gallery__360-chip">
              <span>{isAutoRotating ? "AUTO" : "DRAG TO ROTATE"}</span>
            </div>
            <div className="pdp-gallery__360-controls">
              <input
                type="range"
                min="0"
                max={angleImages.length - 1}
                step="1"
                value={currentIndex % angleImages.length}
                aria-label={`Rotate ${name}`}
                onChange={event => {
                  setCurrentIndex(Number(event.target.value));
                  setIsAutoRotating(false);
                }}
                onPointerDown={event => event.stopPropagation()}
                onMouseDown={event => event.stopPropagation()}
                onTouchStart={event => event.stopPropagation()}
                className="pdp-gallery__dial"
              />
            </div>
            <button type="button" onClick={exit360} className="pdp-gallery__icon pdp-gallery__icon--tr" aria-label="Close 360">
              ✕
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setIsAutoRotating(!isAutoRotating);
              }}
              className="pdp-gallery__icon pdp-gallery__icon--tl"
              aria-label={isAutoRotating ? "Pause rotation" : "Play rotation"}
            >
              {isAutoRotating ? "⏸" : "▶"}
            </button>
          </>
        )}

        {!is360Mode && has360 && (
          <button type="button" onClick={enter360} className="pdp-gallery__360">
            ↻ 360°
          </button>
        )}
      </div>

      {!is360Mode && (images.length > 1 || has360) && (
        <div className="pdp-gallery__thumbs">
          {images.map((img, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`pdp-gallery__thumb ${i === currentIndex ? "is-on" : ""}`}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={hiResProductImage(img, 400)} alt="" />
            </button>
          ))}
          {has360 && (
            <button type="button" onClick={enter360} className="pdp-gallery__thumb pdp-gallery__thumb--360">
              ↻
              <span>360°</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Product Page ────────────────────────────────────────────────── */
export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const product = useQuery(
    api.products.getById,
    id ? { productId: id as string } : "skip",
  );
  const addToCart = useMutation(api.cart.addItem);
  const sessionId = useSessionId();
  const allProducts = useQuery(api.products.list, {}) ?? [];
  const [selectedSize, setSelectedSize] = useState<string>(
    () => searchParams.get("size") || "",
  );
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "fit">("details");

  useEffect(() => {
    const wanted = searchParams.get("size");
    if (!wanted || !product?.sizes) return;
    const match = (product.sizes as string[]).find(
      size => cleanSizeLabel(size) === wanted || size === wanted,
    );
    if (match) setSelectedSize(match);
  }, [product, searchParams]);

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
        <Link
          to="/shop"
          className="text-[12px] tracking-wider uppercase"
          style={{ color: "rgba(21,36,61,0.75)" }}
        >
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
      if (
        color &&
        !seen.some(c => c.toLowerCase() === String(color).toLowerCase())
      ) {
        seen.push(String(color));
      }
    }
    return seen;
  })();
  const hasColorAxis = colorOptions.length > 1;

  const variantForSize = (size: string, color?: string) =>
    (product.printfulVariants || []).find((variant: any) => {
      const variantSize = variant.size || variant.name?.split(" / ").pop();
      const sizeMatches =
        cleanSizeLabel(variantSize || "") === cleanSizeLabel(size);
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
      <div className="pdp">
        <Link to="/shop" className="pdp-back">Shop</Link>
        <div className="pdp-grid">
          <div className="pdp-stage">
            <Product360Viewer
              images={product.images || []}
              rotationImages={
                product.rotationImages?.length === 8
                  ? product.rotationImages
                  : getProductRotation(product.name)
              }
              name={product.name}
            />
          </div>

          <div className="pdp-buy">
            <p className="label-lock">{displayProductName(product.name)}</p>
            <p className="clash pdp-title">{styleKeyFromName(product.name)}</p>
            <p className="serif-quiet text-xl mt-2">Made on demand. Made for one person.</p>
            <p className="label-lock mt-3" style={{ color: "var(--pist)" }}>
              11:16
            </p>
            <p className="serif-quiet text-[15px] mt-1" style={{ color: "rgba(247,240,230,0.72)" }}>
              Same numbers as the name.{" "}
              <Link to="/chart" style={{ textDecoration: "underline", color: "var(--pist)" }}>
                True North is that cipher, opened.
              </Link>
            </p>
            <p className="clash pdp-price">{formatPrice(product.price)}</p>

            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <RadialVariantDial
                  sizes={(product.sizes as string[]).map(raw => ({
                    id: raw,
                    label: cleanSizeLabel(raw),
                    available: isSizeAvailable(raw),
                  }))}
                  colors={(() => {
                    const style = styleKeyFromName(product.name);
                    const siblings = allProducts.filter(
                      (item: any) => styleKeyFromName(item.name) === style,
                    );
                    const inStock = (variant: any) =>
                      Boolean(
                        variant?.id &&
                          variant?.is_ignored !== true &&
                          variant?.availability_status !== "out_of_stock" &&
                          variant?.availability_status !== "discontinued",
                      );
                    if (hasColorAxis) {
                      return colorOptions.map(color => ({
                        id: color,
                        label: color,
                        hex: snapHex(color),
                        available: selectedSize
                          ? inStock(variantForSize(selectedSize, color))
                          : true,
                      }));
                    }
                    if (siblings.length > 1) {
                      return siblings.map((item: any) => {
                        const label =
                          colorFromName(item.name) || displayProductName(item.name);
                        return {
                          id: item._id as string,
                          label,
                          hex: snapHex(label),
                          available: !selectedSize
                            ? true
                            : (item.sizes || []).some(
                                (size: string) =>
                                  cleanSizeLabel(size) === cleanSizeLabel(selectedSize),
                              ),
                        };
                      });
                    }
                    return [];
                  })()}
                  sizeId={selectedSize}
                  colorId={hasColorAxis ? selectedColor : product._id}
                  onSize={raw => {
                    setSelectedSize(raw);
                    if (!hasColorAxis || !selectedColor) return;
                    const variant = variantForSize(raw, selectedColor);
                    const stillThere = Boolean(
                      variant?.id &&
                        variant?.is_ignored !== true &&
                        variant?.availability_status !== "out_of_stock" &&
                        variant?.availability_status !== "discontinued",
                    );
                    if (!stillThere) setSelectedColor("");
                  }}
                  onColor={next => {
                    if (hasColorAxis) {
                      setSelectedColor(next);
                      return;
                    }
                    if (next === product._id) return;
                    const sizeLabel = selectedSize ? cleanSizeLabel(selectedSize) : "";
                    navigate(
                      `/product/${next}${sizeLabel ? `?size=${encodeURIComponent(sizeLabel)}` : ""}`,
                    );
                  }}
                />
              </div>
            )}

            <div className="pdp-notes">
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  className={`chip ${activeTab === "details" ? "on" : ""}`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
                <button
                  type="button"
                  className={`chip pist ${activeTab === "fit" ? "on" : ""}`}
                  onClick={() => setActiveTab("fit")}
                >
                  Fit guide
                </button>
              </div>
              {activeTab === "details" ? (
                <p
                  className="text-[14px] leading-relaxed whitespace-pre-line"
                  style={{ color: "rgba(247,240,230,0.7)" }}
                >
                  {product.description}
                </p>
              ) : (
                <ProductFitGuide
                  product={{
                    name: product.name,
                    category: product.category,
                    sizes: product.sizes || [],
                    images: product.images || [],
                  }}
                  externalSize={
                    selectedSize ? cleanSizeLabel(selectedSize) : undefined
                  }
                  onSizeSelect={s => {
                    const match = product.sizes?.find(
                      (x: string) => cleanSizeLabel(x) === s,
                    );
                    if (match) setSelectedSize(match);
                  }}
                  lightMode={false}
                />
              )}
            </div>

            <p
              className="text-[10px] tracking-[0.13em] uppercase font-semibold"
              style={{ color: "var(--pist)" }}
            >
              Estimated delivery {deliveryWindow}
            </p>
            <p
              className="text-[10px] mt-1 mb-4"
              style={{ color: "rgba(247,240,230,0.48)" }}
            >
              Includes 2–5 business days to make your piece plus standard
              tracked shipping. Final options are calculated for your address at
              checkout.
            </p>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={
                (product.sizes?.length > 0 && !selectedSize) ||
                (hasColorAxis && !selectedColor)
              }
              className="cta-pist w-full text-center"
            >
              {added
                ? "Added to cart"
                : hasColorAxis && !selectedColor
                  ? "Select a colour"
                  : product.sizes?.length > 0 && !selectedSize
                    ? "Select a size"
                    : "Add to cart"}
            </button>
            <p className="serif-quiet mt-4 text-[15px] opacity-80">
              Made on demand · Free shipping · Easy returns
            </p>
          </div>
        </div>

        {/* Complete the Look */}
        <CompleteTheLook currentProduct={product} />
      </div>
    </>
  );
}
