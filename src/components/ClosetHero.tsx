import { useState } from "react";
import { Link } from "react-router-dom";
import { DynamicSkyBar } from "./DynamicSkyBar";
import { HolographicCloset, VirtualTryOn } from "./HolographicCloset";

type ClosetSide = "women" | "men";

function SkyMannequin({ side }: { side: ClosetSide }) {
  const src = side === "women" ? "/mannequin-women-v37.png" : "/mannequin-men-v31.png";
  return (
    <div className={`sky-mannequin sky-mannequin-${side}`}>
      <div
        className="sky-mannequin-finish"
        style={{
          WebkitMaskImage: `url("${src}")`,
          maskImage: `url("${src}")`,
        }}
      >
        <DynamicSkyBar />
      </div>
      <img src={src} alt={`${side}'s XI XVI mannequin wearing an approved product ensemble`} />
    </div>
  );
}

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

      <HolographicCloset side="women" onActivate={() => setActiveMirror("women")} />
      <HolographicCloset side="men" onActivate={() => setActiveMirror("men")} />

      <div className="showroom-brand-wall">
        <img src="/xixvi-gold-shield.png" alt="XI XVI — Eleven Sixteen" />
      </div>

      <div className="store-vignette" />
      <div className="store-stage">
        <SkyMannequin side="women" />
        <SkyMannequin side="men" />
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
