import { useQuery } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { getProductPairings } from "../data/productPairings";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

export function CompleteTheLook({ currentProduct }: { currentProduct: Product }) {
  const allProducts = useQuery(api.products.list, {}) as Product[] | undefined;

  if (!allProducts || allProducts.length < 2) return null;

  const allNames = allProducts.map((p) => p.name);
  const { setMatches, colorAlternatives } = getProductPairings(
    currentProduct.name,
    allNames
  );

  // Resolve names to product objects
  const resolveProducts = (names: string[]) =>
    names
      .map((n) => allProducts.find((p) => p.name === n))
      .filter((p): p is Product => !!p && p._id !== currentProduct._id);

  const setProducts = resolveProducts(setMatches);
  const altProducts = resolveProducts(colorAlternatives);

  if (setProducts.length === 0 && altProducts.length === 0) return null;

  return (
    <div className="mt-16">
      {/* Complete the Set */}
      {setProducts.length > 0 && (
        <Section title="Complete the Set" products={setProducts} />
      )}

      {/* You Might Also Like */}
      {altProducts.length > 0 && (
        <Section
          title="You Might Also Like"
          products={altProducts}
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
  return (
    <div className={className}>
      <h2
        className="text-[11px] tracking-[0.25em] uppercase font-semibold mb-6"
        style={{ color: "rgba(200,140,255,0.55)" }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="group block"
          >
            <div
              className="aspect-[3/4] overflow-hidden mb-3 transition-all group-hover:scale-[1.02]"
              style={{
                borderRadius: "12px",
                border: "1px solid rgba(240,210,190,0.08)",
                background: "rgba(255,240,230,0.02)",
              }}
            >
              {product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  style={{ borderRadius: "11px" }}
                />
              )}
            </div>
            <p
              className="text-[12px] font-medium truncate"
              style={{ color: "rgba(245,230,220,0.6)" }}
            >
              {product.name}
            </p>
            <p
              className="text-[12px]"
              style={{ color: "rgba(245,230,220,0.35)" }}
            >
              ${(product.price / 100).toFixed(2)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
