import { useQuery } from "convex/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { DynamicSkyBar } from "./DynamicSkyBar";
import { HolographicCloset, VirtualTryOn } from "./HolographicCloset";

type StoreProduct = {
  _id: string;
  name: string;
  gender: string;
  images?: string[];
  price?: number;
};

// Current Printful storefront thumbnails provide a resilient first-paint
// fallback while Convex loads. The live query replaces these immediately.
const PRINTFUL_FALLBACK: StoreProduct[] = [
  { _id: "printful-d-slip-black", name: "D-Slip Dress [Black]", gender: "women", images: ["https://files.cdn.printful.com/files/643/643fe98a15860efe432874d55096fcb4_preview.png"] },
  { _id: "printful-b-lift-ivory", name: "B-Lift Sports Bra [Ivory]", gender: "women", images: ["https://files.cdn.printful.com/files/336/336ad99d58f0773b9d808759e5bbfba3_preview.png"] },
  { _id: "printful-l-flow-onyx", name: "L-Flow Yoga Leggings [Onyx]", gender: "women", images: ["https://files.cdn.printful.com/files/c15/c15470469965f47041126eee252e1b51_preview.png"] },
  { _id: "printful-d-slip-pink", name: "D-Slip Dress [Pink Lace]", gender: "women", images: ["https://files.cdn.printful.com/files/20b/20b6927a956db2aeb5e15f1a5c0afa00_preview.png"] },
  { _id: "printful-b-lift-dash", name: "B-Lift Sports Bra [Dash Black]", gender: "women", images: ["https://files.cdn.printful.com/files/c68/c68beea948bc52fe97edfc2d0c232516_preview.png"] },
  { _id: "printful-j-glitch-black", name: "J-Glitch Jersey [Black]", gender: "men", images: ["https://files.cdn.printful.com/files/d3e/d3eafe96e16d5a3d6770d74ce93c7033_preview.png"] },
  { _id: "printful-s-glitch-ice", name: "S-Glitch 2.5” Shorts [Ice]", gender: "men", images: ["https://files.cdn.printful.com/files/429/429fb7477665914edfeec995b9949254_preview.png"] },
  { _id: "printful-j-glitch-volt", name: "J-Glitch Jersey [Volt]", gender: "men", images: ["https://files.cdn.printful.com/files/e78/e788e9e146a5a79bcf7fa0feda5ce992_preview.png"] },
  { _id: "printful-s-glitch-black", name: "S-Glitch 6.3” Shorts [Black]", gender: "men", images: ["https://files.cdn.printful.com/files/3ba/3bab909a91cf850af641465b79f6377f_preview.png"] },
  { _id: "printful-t-icon", name: "T-Icon Oversized Tee", gender: "men", images: ["https://files.cdn.printful.com/files/229/229bc6690aeddc92647f2fb6bb83e122_preview.png"] },
];

export function ClosetHero() {
  const liveProducts = useQuery(api.products.list, {}) as StoreProduct[] | undefined;
  const products = liveProducts?.length ? liveProducts : PRINTFUL_FALLBACK;
  const [tryOnProduct, setTryOnProduct] = useState<StoreProduct | null>(null);
  const women = products.filter((product) => product.gender === "women");
  const men = products.filter((product) => product.gender === "men");

  return (
    <section className="store-hero" aria-label="XI XVI interactive virtual showroom">
      <div className="store-bg" />

      <div className="sky-ceiling" title="Live local sky ceiling">
        <DynamicSkyBar />
        <div className="sky-ceiling-mask" />
      </div>

      <div className="rear-sky-panel rear-sky-left"><DynamicSkyBar /></div>
      <div className="rear-sky-panel rear-sky-right"><DynamicSkyBar /></div>

      <HolographicCloset side="women" products={women} onTryOn={setTryOnProduct} />
      <HolographicCloset side="men" products={men} onTryOn={setTryOnProduct} />

      <div className="store-vignette" />
      <div className="store-stage">
        <div className="mannequin-unit mannequin-women-unit">
          <img src="/mannequin-women-v37.png" alt="Women's collection mannequin" />
          <div className="podium" />
        </div>
        <div className="mannequin-unit mannequin-men-unit">
          <img src="/mannequin-men-v31.png" alt="Men's collection mannequin" />
          <div className="podium" />
        </div>
        <Link to="/shop?gender=women" className="showroom-cta showroom-cta-women">SHOP WOMEN</Link>
        <Link to="/shop?gender=men" className="showroom-cta showroom-cta-men">SHOP MEN</Link>
      </div>

      <div className="showroom-instruction">
        <span className="showroom-pulse" />
        TOUCH A HOLOGRAPHIC CLOSET TO ENTER THE LIVE MIRROR
      </div>
      {tryOnProduct && <VirtualTryOn product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
    </section>
  );
}
