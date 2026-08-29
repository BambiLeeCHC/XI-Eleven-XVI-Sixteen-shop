import { Link } from "react-router-dom";
import { getProductPairings } from "../data/productPairings";
import { api, useQuery } from "../lib/backend";
import {
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
    <div className="mt-16 px-2 md:px-0">
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
  return (
    <div className={className}>
      <h2 className="label-lock mb-6" style={{ color: "var(--pist)" }}>
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(product => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="group block"
          >
            <div
              className="aspect-[3/4] overflow-hidden mb-3 product-stage transition-transform group-hover:scale-[1.02]"
              style={{ border: "2px solid var(--cream)", background: "var(--cream)" }}
            >
              {product.images[0] && (
                <img
                  src={hiResProductImage(product.images[0], 800)}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              )}
            </div>
            <p className="clash text-[22px] normal-case">
              {styleKeyFromName(product.name)}
            </p>
            <p
              className="serif-quiet text-[15px] mt-1"
              style={{ color: "var(--mute)" }}
            >
              {formatPrice(product.price)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
