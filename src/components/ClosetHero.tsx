import { Link } from "react-router-dom";

export function ClosetHero({ content }: { content: { womenLabel: string; womenLink: string; menLabel: string; menLink: string } }) {
  return (
    <section className="store-hero" aria-label="XI XVI interactive virtual showroom">
      <div className="store-bg" />
      <div className="store-vignette" />
      <div className="store-stage">
        <Link to={content.womenLink} className="showroom-cta showroom-cta-women">{content.womenLabel}</Link>
        <Link to={content.menLink} className="showroom-cta showroom-cta-men">{content.menLabel}</Link>
      </div>
    </section>
  );
}
