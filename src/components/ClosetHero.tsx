import { useState } from "react";
import { Link } from "react-router-dom";
import { DynamicSkyBar } from "./DynamicSkyBar";
import { VirtualTryOn } from "./HolographicCloset";

type ClosetSide = "women" | "men";

export function ClosetHero() {
  const [activeMirror, setActiveMirror] = useState<ClosetSide | null>(null);

  return (
    <section className="store-hero" aria-label="XI XVI interactive virtual showroom">
      <div className="store-bg" />

      <div className="sky-ceiling" title="Live local sky ceiling">
        <DynamicSkyBar />
        <div className="sky-ceiling-mask" />
      </div>
      <div className="rear-sky-panel rear-sky-left"><DynamicSkyBar /></div>
      <div className="rear-sky-panel rear-sky-right"><DynamicSkyBar /></div>

      <button
        type="button"
        className="showroom-hotspot showroom-hotspot-women"
        onClick={() => setActiveMirror("women")}
        aria-label="Open the women's holographic closet"
      >
        <span>{"11 // ILLUMINATION"}</span>
      </button>
      <button
        type="button"
        className="showroom-hotspot showroom-hotspot-men"
        onClick={() => setActiveMirror("men")}
        aria-label="Open the men's holographic closet"
      >
        <span>{"16 // REINVENTION"}</span>
      </button>

      <div className="store-vignette" />
      <div className="store-stage">
        <Link to="/shop?gender=women" className="showroom-cta showroom-cta-women">SHOP WOMEN</Link>
        <Link to="/shop?gender=men" className="showroom-cta showroom-cta-men">SHOP MEN</Link>
      </div>

      <div className="showroom-instruction">
        <span className="showroom-pulse" />
        TOUCH A HOLOGRAPHIC CLOSET TO ENTER THE LIVE MIRROR
      </div>
      {activeMirror && <VirtualTryOn side={activeMirror} onClose={() => setActiveMirror(null)} />}
    </section>
  );
}
