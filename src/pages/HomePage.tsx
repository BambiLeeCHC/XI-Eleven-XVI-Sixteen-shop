import { useMemo, useState } from "react";
import {
  ImpactHero,
  JournalTrueNorthRooms,
  PistachioTicker,
  ProcessSteps,
  type HeroFrame,
} from "../components/ImpactHero";
import { ProductHighlight } from "../components/ProductHighlight";
import { buildOrganizationJsonLd, buildWebSiteJsonLd, SEO } from "../components/SEO";
import { mergeLandingContent } from "../data/landingContent";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useMutation, useQuery } from "../lib/backend";
import {
  colorFromName,
  formatPrice,
  groupProductsByStyle,
  HERO_SUB,
  HERO_TITLE,
  IMPACT_HERO_URL,
  itemsForStyle,
} from "../lib/brand";
import { hiResProductImage } from "../lib/productImage";

const CUT_NAME: Record<string, string> = {
  "D-Slip": "Slip dress",
  "B-Lift": "Sports bra",
  "L-Flow": "Legging",
  "J-Glitch": "Jersey",
  "S-Glitch 2.5": "2.5\" short",
  "S-Glitch 6.3": "6.3\" short",
  "T-Icon Oversized": "Oversized tee",
  "T-Icon Tie-Dye": "Tie-dye tee",
  "T-Icon": "Tee",
};

export function HomePage() {
  const content = mergeLandingContent(undefined);
  const products = useQuery(api.products.list, {}) ?? [];
  const dslipColors = itemsForStyle(products, "D-Slip");
  const dslip = dslipColors[0];
  const frames = useMemo(() => {
    const campaign: HeroFrame = {
      src: IMPACT_HERO_URL,
      kicker: "XI · XVI",
      title: HERO_TITLE,
      sub: HERO_SUB,
      href: dslip ? `/product/${dslip._id}` : "/shop",
      cta: `Shop D-Slip · ${dslip ? formatPrice(dslip.price) : "$98"}`,
    };
    const cuts = groupProductsByStyle(products)
      .slice(0, 6)
      .map(group => {
        const item = group.items[0];
        const src = item?.images?.[0];
        if (!item || !src) return null;
        const color = colorFromName(item.name);
        return {
          src: hiResProductImage(src, 1600),
          kicker: color || "XI · XVI",
          title: CUT_NAME[group.key] ?? group.key,
          sub: formatPrice(item.price),
          href: `/product/${item._id}`,
          cta: `Shop ${CUT_NAME[group.key] ?? group.key}`,
        } satisfies HeroFrame;
      })
      .filter((frame): frame is HeroFrame => frame !== null);
    return [campaign, ...cuts];
  }, [products, dslip]);

  return (
    <>
      <SEO
        description={PAGE_SEO.home.description}
        url="/"
        jsonLd={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]}
      />
      <ImpactHero
        dslipHref={dslip ? `/product/${dslip._id}` : "/shop"}
        dslipPrice={dslip?.price}
        dslipColors={dslipColors}
        frames={frames}
      />
      <PistachioTicker />
      {content.categories.visible && <ProductHighlight products={products} />}
      <ProcessSteps />
      <JournalTrueNorthRooms />
      {content.newsletter.visible && (
        <NewsletterSection content={content.newsletter} />
      )}
    </>
  );
}

function NewsletterSection({
  content,
}: {
  content: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    button: string;
    success: string;
  };
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await subscribe({ email });
      } catch {
        /* ignore */
      }
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section
      className="px-7 py-16 text-center"
      style={{ background: "#0B0B0C" }}
    >
      <p className="label-lock" style={{ color: "var(--pist)" }}>
        {content.eyebrow}
      </p>
      <h2 className="clash text-5xl mt-3">
        {content.title}{" "}
        <span className="serif-quiet" style={{ textTransform: "none" }}>
          {content.accent}
        </span>
      </h2>
      <p
        className="serif-quiet text-xl mt-4 max-w-md mx-auto"
        style={{ color: "rgba(247,240,230,0.75)" }}
      >
        {content.description}
      </p>
      {submitted ? (
        <p className="serif-quiet mt-8" style={{ color: "var(--pist)" }}>
          {content.success}
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-8"
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="fld-lock flex-1"
          />
          <button type="submit" className="cta-pist">
            {content.button}
          </button>
        </form>
      )}
    </section>
  );
}
