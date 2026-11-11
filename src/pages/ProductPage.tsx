import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { CompleteTheLook } from "../components/CompleteTheLook";
import { ProductFitGuide } from "../components/ProductFitGuide";
import type { DialOption } from "../components/RadialVariantDial";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  SEO,
} from "../components/SEO";
import {
  type HoloChoice,
  VariantHologram,
} from "../components/VariantHologram";
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
import { namedColorway, resolveColorwayArt } from "../lib/colorwayImage";
import { flatMockup } from "../lib/flatMockup";
import { swatchFocus } from "../lib/swatchFocus";
import { hiResProductImage } from "../lib/productImage";

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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const gallerySwipe = useRef<{ x: number; y: number } | null>(null);
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

  const onTouchStart = (e: React.TouchEvent) => {
    if (is360Mode) {
      handleDragStart(e.touches[0].clientX);
      return;
    }
    gallerySwipe.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (is360Mode) handleDragMove(e.touches[0].clientX);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (is360Mode) {
      handleDragEnd();
      return;
    }
    const start = gallerySwipe.current;
    gallerySwipe.current = null;
    if (!start || images.length < 2) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy)) return;
    setCurrentIndex(index =>
      dx < 0
        ? (index + 1) % images.length
        : (index - 1 + images.length) % images.length,
    );
  };

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

  const count = images.length;
  const cards =
    count === 0
      ? []
      : images
          .map((src, index) => {
            let offset = index - currentIndex;
            if (count > 1) {
              if (offset > count / 2) offset -= count;
              if (offset < -count / 2) offset += count;
            }
            return { src, index, offset };
          })
          .filter(card => Math.abs(card.offset) <= 2);

  const scrub = (clientX: number, target: EventTarget | null) => {
    if (is360Mode || count < 2) return;
    if (target instanceof Element && target.closest("button")) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    const next = Math.min(count - 1, Math.max(0, Math.floor(ratio * count)));
    setCurrentIndex(next);
  };

  const lean = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (clientX - rect.left) / rect.width - 0.5;
    const py = (clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 16, y: -py * 9 });
  };

  return (
    <div className="pdp-gallery">
      {is360Mode ? (
      <div
        ref={containerRef}
        role="region"
        aria-label={`${name} product gallery with 360 degree view`}
        className="pdp-gallery__stage product-stage"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "none",
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
            alt={`${name}, angle ${currentIndex + 1} of 8`}
            className="pdp-gallery__shot"
            draggable={false}
            decoding="async"
            fetchPriority="high"
          />
        ) : (
          <div className="pdp-gallery__empty">✦</div>
        )}
        <span className="product-stage__grain" aria-hidden="true" />

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
        <button
          type="button"
          onClick={exit360}
          className="pdp-gallery__icon pdp-gallery__icon--tr"
          aria-label="Close 360"
        >
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
      </div>
      ) : (
      <div
        ref={containerRef}
        className="pdp-flow"
        role="region"
        aria-label={`${name} photos`}
        onMouseMove={event => {
          lean(event.clientX, event.clientY);
          scrub(event.clientX, event.target);
        }}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="pdp-flow__tilt"
          style={{
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          }}
        >
          <span className="pdp-flow__glow" aria-hidden="true" />
          {cards.length === 0 ? (
            <div className="pdp-gallery__empty">✦</div>
          ) : (
            cards.map(card => (
              <button
                key={card.index}
                type="button"
                className={`pdp-flow__card${card.offset === 0 ? " is-on" : ""}`}
                style={{
                  transform: `translateX(calc(-50% + ${card.offset * 48}%)) translateZ(${card.offset === 0 ? 80 : 16 - Math.abs(card.offset) * 72}px) rotateY(${card.offset * -34}deg)`,
                  zIndex: 8 - Math.abs(card.offset),
                  opacity: card.offset === 0 ? 1 : 0.78,
                }}
                aria-label={
                  card.offset === 0
                    ? `${name}, photo ${card.index + 1} of ${count}`
                    : `Photo ${card.index + 1}`
                }
                aria-current={card.offset === 0 || undefined}
                onClick={() => setCurrentIndex(card.index)}
              >
                <img
                  src={hiResProductImage(card.src, card.offset === 0 ? 1400 : 700)}
                  alt=""
                  draggable={false}
                  decoding="async"
                />
              </button>
            ))
          )}
        </div>
        {count > 1 && (
          <>
            <button
              type="button"
              className="pdp-gallery__nav pdp-gallery__nav--prev"
              aria-label="Previous photo"
              onClick={() =>
                setCurrentIndex(i => (i - 1 + count) % count)
              }
            >
              ‹
            </button>
            <button
              type="button"
              className="pdp-gallery__nav pdp-gallery__nav--next"
              aria-label="Next photo"
              onClick={() => setCurrentIndex(i => (i + 1) % count)}
            >
              ›
            </button>
          </>
        )}
        {has360 && (
          <button type="button" onClick={enter360} className="pdp-gallery__360">
            ↻ 360°
          </button>
        )}
      </div>
      )}

      {!is360Mode && images.length > 1 && (
        <div className="pdp-gallery__dots" role="tablist" aria-label="Photos">
          {images.map((_, i) => (
            <button
              type="button"
              key={i}
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={`Photo ${i + 1}`}
              className={i === currentIndex ? "is-on" : ""}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}

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
            <button
              type="button"
              onClick={enter360}
              className="pdp-gallery__thumb pdp-gallery__thumb--360"
            >
              ↻<span>360°</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Product Page ────────────────────────────────────────────────── */

type Variant = {
  id?: number;
  size?: string;
  name?: string;
  color?: string | null;
  is_ignored?: boolean;
  availability_status?: string;
};

type CatalogProduct = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  images?: string[];
  rotationImages?: string[];
  sizes?: string[];
  category?: string;
  printfulVariants?: Variant[];
};

function variantInStock(variant: Variant | undefined) {
  return Boolean(
    variant?.id &&
      variant.is_ignored !== true &&
      variant.availability_status !== "out_of_stock" &&
      variant.availability_status !== "discontinued",
  );
}

function variantFor(
  variants: Variant[],
  size: string,
  color: string | undefined,
  hasColorAxis: boolean,
) {
  return variants.find(variant => {
    const variantSize = variant.size || variant.name?.split(" / ").pop();
    if (cleanSizeLabel(variantSize || "") !== cleanSizeLabel(size))
      return false;
    if (!hasColorAxis) return true;
    if (!color) return true;
    return String(variant.color || "").toLowerCase() === color.toLowerCase();
  });
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const product = useQuery(
    api.products.getById,
    id ? { productId: id as string } : "skip",
  ) as CatalogProduct | null | undefined;
  const addToCart = useMutation(api.cart.addItem);
  const sessionId = useSessionId();
  const catalog = (useQuery(api.products.list, {}) ?? []) as CatalogProduct[];
  const [selectedSize, setSelectedSize] = useState<string>(
    () => searchParams.get("size") || "",
  );
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const productId = product?._id;
  useEffect(() => {
    if (!productId) return;
    setSelectedColor("");
    setAdded(false);
  }, [productId]);

  useEffect(() => {
    if (!product?.sizes) return;
    const sizes = product.sizes;
    const wanted = searchParams.get("size");
    if (wanted) {
      const match = sizes.find(
        size => cleanSizeLabel(size) === wanted || size === wanted,
      );
      if (match) {
        setSelectedSize(match);
        return;
      }
    }
    setSelectedSize(prev => (sizes.includes(prev) ? prev : ""));
  }, [product, searchParams]);

  if (product === undefined) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div
          className="animate-pulse"
          style={{ color: "#111" }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center flex-col gap-4">
        <p style={{ color: "#111" }}>Product not found.</p>
        <Link to="/shop" className="text-[12px] tracking-wider uppercase">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const variants = product.printfulVariants || [];
  const colorNames: string[] = [];
  for (const variant of variants) {
    const color = variant?.color;
    if (
      color &&
      !colorNames.some(
        item => item.toLowerCase() === String(color).toLowerCase(),
      )
    ) {
      colorNames.push(String(color));
    }
  }
  const hasColorAxis = colorNames.length > 1;
  const style = styleKeyFromName(product.name);
  const siblings = catalog.filter(
    item => styleKeyFromName(item.name) === style,
  );
  const pageColor = hasColorAxis ? selectedColor : colorFromName(product.name);
  const pageTint = pageColor ? snapHex(pageColor) : "#D8F0C4";

  const colorsForSize = (size: string): DialOption[] => {
    if (hasColorAxis) {
      return colorNames.map(color => ({
        id: color,
        label: color,
        hex: snapHex(color),
        mockup: flatMockup(product.name, product.images).url,
        focus: swatchFocus(product.name),
        available: size
          ? variantInStock(variantFor(variants, size, color, true))
          : true,
      }));
    }
    if (siblings.length <= 1) return [];
    return siblings.map(item => {
      const label = colorFromName(item.name) || displayProductName(item.name);
      return {
        id: item._id,
        label,
        hex: snapHex(label),
        mockup: flatMockup(item.name, item.images).url,
        focus: swatchFocus(item.name),
        available: !size
          ? true
          : (item.sizes || []).some(
              entry => cleanSizeLabel(entry) === cleanSizeLabel(size),
            ),
      };
    });
  };

  const artFor = (colorId: string) => {
    if (hasColorAxis) {
      const named = namedColorway(product.name, colorId);
      const match = catalog.find(
        item => item.name.toLowerCase() === named.toLowerCase(),
      );
      return resolveColorwayArt({
        images: match?.images,
        name: named,
        fallback: product.images,
      });
    }
    const sibling =
      catalog.find(item => item._id === colorId) ||
      (colorId === product._id ? product : undefined);
    return resolveColorwayArt({
      images: sibling?.images?.length
        ? sibling.images
        : colorId === product._id
          ? product.images
          : [],
      name: sibling?.name || namedColorway(product.name, colorId),
      fallback: product.images,
    });
  };

  const galleryArt =
    hasColorAxis && selectedColor
      ? artFor(selectedColor)
      : resolveColorwayArt({
          images: product.images,
          name: product.name,
          fallback: product.images,
        });
  const galleryImages = galleryArt.images;

  const sizeOptions: DialOption[] = (product.sizes || []).map(raw => ({
    id: raw,
    label: cleanSizeLabel(raw),
    available: variantInStock(
      variantFor(
        variants,
        raw,
        hasColorAxis ? selectedColor : undefined,
        hasColorAxis,
      ),
    ),
  }));

  const sizeLabel = selectedSize ? cleanSizeLabel(selectedSize) : "";
  const valueLabel =
    sizeLabel && pageColor
      ? `${sizeLabel} · ${pageColor}`
      : pageColor
        ? `Size · ${pageColor}`
        : sizeLabel
          ? `${sizeLabel} · Color`
          : "Choose";

  const commit = (choice: HoloChoice) => {
    const picked = colorsForSize(choice.sizeId).find(
      color => color.id === choice.colorId,
    );
    const colorLabel =
      picked?.label || (hasColorAxis ? choice.colorId : pageColor);
    const nextSize = choice.sizeId ? cleanSizeLabel(choice.sizeId) : "";
    if (nextSize || colorLabel) {
      setAnnouncement(
        colorLabel ? `${nextSize || "Size"} in ${colorLabel}` : nextSize,
      );
    }
    if (hasColorAxis) {
      setSelectedSize(choice.sizeId);
      if (choice.colorId) setSelectedColor(choice.colorId);
      return;
    }
    if (choice.colorId && choice.colorId !== product._id) {
      const query = nextSize ? `?size=${encodeURIComponent(nextSize)}` : "";
      navigate(`/product/${choice.colorId}${query}`);
      return;
    }
    setSelectedSize(choice.sizeId);
  };

  const handleAddToCart = async () => {
    if (!selectedSize && (product.sizes?.length || 0) > 0) return;
    if (hasColorAxis && !selectedColor) return;
    await addToCart({
      sessionId,
      productId: product._id,
      size: selectedSize || "One Size",
      color: hasColorAxis ? selectedColor : undefined,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const deliveryStart = new Date();
  deliveryStart.setDate(deliveryStart.getDate() + 6);
  const deliveryEnd = new Date();
  deliveryEnd.setDate(deliveryEnd.getDate() + 12);
  const deliveryWindow = `${deliveryStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${deliveryEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  const seoProduct = {
    _id: product._id,
    name: product.name,
    description: product.description || "",
    price: product.price || 0,
    category: product.category || "",
    images: product.images || [],
    sizes: product.sizes || [],
  };
  const productSeo = getProductSEO(seoProduct);
  const needsSize = (product.sizes?.length || 0) > 0 && !selectedSize;
  const needsColor = hasColorAxis && !selectedColor;

  return (
    <>
      <SEO
        title={productSeo.title}
        description={productSeo.description}
        image={galleryImages[0] || product.images?.[0]}
        url={`/product/${product._id}`}
        type="product"
        jsonLd={[
          buildProductJsonLd(seoProduct),
          buildBreadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Shop", url: "/shop" },
            { name: product.name, url: `/product/${product._id}` },
          ]),
        ]}
      />
      <article
        className="pdp"
        style={{ "--pdp-tint": pageTint } as React.CSSProperties}
      >
        <p className="pdp-sr" aria-live="polite">
          {announcement}
        </p>
        <nav className="pdp-crumb">
          <Link to="/shop">← Collection</Link>
        </nav>
        <div className="pdp-layout">
          <div className="pdp-gallery-wrap">
            <Product360Viewer
              key={`${product._id}:${selectedColor}:${galleryImages[0] ?? ""}`}
              images={galleryImages}
              rotationImages={
                product.rotationImages?.length === 8
                  ? product.rotationImages
                  : getProductRotation(product.name)
              }
              name={displayProductName(product.name)}
            />
          </div>
          <div className="pdp-copy">
            <p className="pdp-kicker">{style}</p>
            <h1 className="pdp-title">{displayProductName(product.name)}</h1>
            <p className="pdp-price">{formatPrice(product.price)}</p>
            <p className="pdp-desc pdp-desc--desk">
              {product.description?.trim() ||
                "Cut and finished when you order it, in the colorway on this page."}{" "}
              <Link to="/chart">True North is the same numbers, opened.</Link>
            </p>
            <div className="pdp-buy">
              {sizeOptions.length > 0 ? (
                <VariantHologram
                  sizes={sizeOptions}
                  colorsForSize={colorsForSize}
                  committedSize={selectedSize}
                  committedColor={hasColorAxis ? selectedColor : product._id}
                  previewFor={colorId => artFor(colorId).images[0]}
                  tint={pageTint}
                  valueLabel={valueLabel}
                  onCommit={commit}
                />
              ) : null}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={needsSize || needsColor}
                className="cta-pist pdp-cart"
              >
                {added
                  ? "Added to cart"
                  : needsColor
                    ? "Select a colour"
                    : needsSize
                      ? "Select a size"
                      : "Add to cart"}
              </button>
              <p className="pdp-note">
                Estimated delivery {deliveryWindow}. Tracked shipping at
                checkout.
              </p>
            </div>
            <details className="pdp-fit">
              <summary>Fit guide</summary>
              <div className="pdp-fit-card">
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
                  onSizeSelect={label => {
                    const match = product.sizes?.find(
                      size => cleanSizeLabel(size) === label,
                    );
                    if (match) setSelectedSize(match);
                  }}
                  lightMode
                />
              </div>
            </details>
          </div>
        </div>
        <CompleteTheLook
          currentProduct={{
            _id: product._id,
            name: product.name,
            price: product.price || 0,
            images: product.images || [],
            category: product.category || "",
          }}
        />
      </article>
    </>
  );
}
