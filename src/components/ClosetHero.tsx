import { Link } from "react-router-dom";

export function ClosetHero() {
  return (
    <section className="store-hero" aria-label="XI XVI interactive virtual showroom">
      <div className="store-bg" />
      <div className="store-vignette" />
      <div className="store-stage">
        <Link to="/shop?gender=women" className="showroom-cta showroom-cta-women">SHOP WOMEN</Link>
        <Link to="/shop?gender=men" className="showroom-cta showroom-cta-men">SHOP MEN</Link>
      </div>
    </section>
  );
}
