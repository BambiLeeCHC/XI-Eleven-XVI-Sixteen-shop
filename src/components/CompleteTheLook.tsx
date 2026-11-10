import { useRef } from "react";
import { Link } from "react-router-dom";
import { getProductPairings } from "../data/productPairings";
import { api, useQuery } from "../lib/backend";
import {
  displayProductName,
  formatPrice,
  groupProductsByStyle,
  styleKeyFromName,
} from "../lib/brand";
import { hiResProductImage } from "../lib/productImage";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

export function CompleteTheLook({
  currentProduct,
}: {
  currentProduct: Product;
}) {
  const allProducts = useQuery(api.products.list, {}) as Product[] | undefined;

  if (!allProducts || allProducts.length < 2) return null;

  const currentKey = styleKeyFromName(currentProduct.name);
  const allNames = allProducts.map(p => p.name);
  const { setMatches } = getProductPairings(currentProduct.name, allNames);

  const setByStyle = new Map<string, Product>();
  for (const name of setMatches) {
    const product = allProducts.find(p => p.name === name);
    if (!product || product._id === currentProduct._id) continue;
    const key = styleKeyFromName(product.name);
    if (key === currentKey || setByStyle.has(key)) continue;
    setByStyle.set(key, product);
  }
  const setProducts = [...setByStyle.values()];

  const alsoLike = groupProductsByStyle(allProducts)
    .filter(group => group.key !== currentKey && !setByStyle.has(group.key))
    .map(group => group.items[0])
    .filter((product): product is Product => Boolean(product));

  if (setProducts.length === 0 && alsoLike.length === 0) return null;

  return (
    <div className="pdp-more">
      {setProducts.length > 0 && (
        <Section title="Complete the Set" products={setProducts} />
      )}
      {alsoLike.length > 0 && (
        <Section
          title="You Might Also Like"
          products={alsoLike}
          className={setProducts.length > 0 ? "mt-12" : ""}
        />
      )}
    </div>
  );
}

function Section({
  title,
  products,
  className = "",
}: {
  title: string;
  products: Product[];
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, left: 0, active: false });

  const scrollByCard = (direction: number) => {
    const node = track.current;
    if (!node) return;
    node.scrollBy({
      left: direction * Math.min(280, node.clientWidth * 0.8),
      behavior: "smooth",
    });
  };

  return (
    <section className={`pdp-rail ${className}`.trim()} aria-label={title}>
      <div className="pdp-rail__head">
        <h2>{title}</h2>
        <div className="pdp-rail__arrows">
          <button
            type="button"
            aria-label={`Previous in ${title}`}
            onClick={() => scrollByCard(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={`Next in ${title}`}
            onClick={() => scrollByCard(1)}
          >
            ›
          </button>
        </div>
      </div>
      <div
        className="pdp-rail__track"
        ref={track}
        onPointerDown={event => {
          if (event.pointerType === "touch" || !track.current) return;
          drag.current = {
            x: event.clientX,
            left: track.current.scrollLeft,
            active: true,
          };
          track.current.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => {
          if (!drag.current.active || !track.current) return;
          track.current.scrollLeft =
            drag.current.left - (event.clientX - drag.current.x);
        }}
        onPointerUp={() => {
          drag.current.active = false;
        }}
        onPointerCancel={() => {
          drag.current.active = false;
        }}
      >
        {products.map(product => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="pdp-card"
          >
            <span className="pdp-card__photo">
              {product.images[0] ? (
                <img
                  src={hiResProductImage(product.images[0], 640)}
                  alt=""
                  draggable={false}
                />
              ) : (
                <span aria-hidden="true">✦</span>
              )}
            </span>
            <span className="pdp-card__name">
              {displayProductName(product.name)}
            </span>
            <span className="pdp-card__price">
              {formatPrice(product.price)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
