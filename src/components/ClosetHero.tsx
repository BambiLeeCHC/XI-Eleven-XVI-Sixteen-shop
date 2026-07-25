import { Link } from "react-router-dom";
import { DynamicSkyBar } from "./DynamicSkyBar";

export function ClosetHero() {
  return (
    <section className="store-hero" aria-label="XI XVI interactive virtual showroom">
      <div className="hero-sky-underlay" aria-hidden="true">
        <DynamicSkyBar />
      </div>
      <div className="store-bg" />
      <div className="hero-mannequin hero-mannequin-women" aria-hidden="true">
        <img src="/mannequin-women-v37-2x.png" alt="" />
      </div>
      <div className="hero-mannequin hero-mannequin-men" aria-hidden="true">
        <img src="/mannequin-men-v31-2x.png" alt="" />
      </div>

      <div className="store-vignette" />
      <div className="store-stage">
        <Link to="/shop?gender=women" className="showroom-cta showroom-cta-women">SHOP WOMEN</Link>
        <Link to="/shop?gender=men" className="showroom-cta showroom-cta-men">SHOP MEN</Link>
      </div>
    </section>
  );
}
