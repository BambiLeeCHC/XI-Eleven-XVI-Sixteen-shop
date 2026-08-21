import { Link } from "react-router-dom";

/**
 * Homepage hero — dual showroom panels featuring real product photography
 * from the live catalog (B-Lift / J-Glitch), keeping the XI·XVI gold + sky brand.
 */
export function ClosetHero({
  content,
}: {
  content: {
    womenLabel: string;
    womenLink: string;
    menLabel: string;
    menLink: string;
    womenImage?: string;
    menImage?: string;
    eyebrow?: string;
    headline?: string;
    subhead?: string;
  };
}) {
  const womenImg =
    content.womenImage || "/mockups/B-Lift_Sports_Bra_Dash_Black_front.png";
  const menImg =
    content.menImage || "/mockups/J-Glitch_Jersey_Black_0.png";
  const eyebrow = content.eyebrow || "XI · XVI SHOWROOM";
  const headline = content.headline || "Precision Fit. Made to Order.";
  const subhead =
    content.subhead ||
    "Engineered pieces for movement — less waste, more intention.";

  return (
    <section
      className="store-hero store-hero--products"
      aria-label="XI XVI product showroom"
    >
      <div className="store-hero-ambient" aria-hidden="true" />

      <div className="store-hero-copy">
        <p className="store-hero-eyebrow">{eyebrow}</p>
        <h1 className="store-hero-title">{headline}</h1>
        <p className="store-hero-sub">{subhead}</p>
      </div>

      <div className="store-hero-panels">
        <Link
          to={content.womenLink}
          className="store-hero-panel store-hero-panel--women"
        >
          <div className="store-hero-panel-media">
            <img src={womenImg} alt="Shop women" loading="eager" />
            <div className="store-hero-panel-veil store-hero-panel-veil--women" />
          </div>
          <div className="store-hero-panel-meta">
            <span className="store-hero-panel-kicker">Women · 11</span>
            <span className="store-hero-panel-cta">{content.womenLabel}</span>
          </div>
        </Link>

        <Link
          to={content.menLink}
          className="store-hero-panel store-hero-panel--men"
        >
          <div className="store-hero-panel-media">
            <img src={menImg} alt="Shop men" loading="eager" />
            <div className="store-hero-panel-veil store-hero-panel-veil--men" />
          </div>
          <div className="store-hero-panel-meta">
            <span className="store-hero-panel-kicker">Men · 16</span>
            <span className="store-hero-panel-cta">{content.menLabel}</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
