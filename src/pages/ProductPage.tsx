import { useEffect, useState } from "react";
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
import { ProductCoverflow } from "../components/ProductCoverflow";

/** Extract just the size label from a variant name like "D-SLIP DRESS [BLACK] / XS" → "XS" */
function cleanSizeLabel(size: string): string {
  const parts = size.split("/");
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return size;
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
            <ProductCoverflow
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
