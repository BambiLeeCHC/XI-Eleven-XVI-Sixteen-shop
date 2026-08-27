import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ImpactHero,
  JournalTrueNorthRooms,
  PistachioTicker,
  ProcessSteps,
} from "../components/ImpactHero";
import { buildOrganizationJsonLd, SEO } from "../components/SEO";
import { mergeLandingContent } from "../data/landingContent";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useMutation, useQuery } from "../lib/backend";
import { formatPrice, styleKeyFromName } from "../lib/brand";

export function HomePage() {
  const content = mergeLandingContent(undefined);
  const products = useQuery(api.products.list, {}) ?? [];
  const dslip = products.find((p: any) => String(p.name).startsWith("D-Slip"));
  const styles = Array.from(
    new Set(products.map((p: any) => styleKeyFromName(p.name))),
  );

  return (
    <>
      <SEO
        description={PAGE_SEO.home.description}
        url="/"
        jsonLd={buildOrganizationJsonLd()}
      />
      <ImpactHero
        dslipHref={dslip ? `/product/${dslip._id}` : "/shop"}
        dslipPrice={dslip?.price}
        lookCount={styles.length || 8}
      />
      <PistachioTicker />
      {content.categories.visible && <LookGrid products={products} />}
      <ProcessSteps />
      <JournalTrueNorthRooms />
      {content.newsletter.visible && (
        <NewsletterSection content={content.newsletter} />
      )}
    </>
  );
}

function LookGrid({ products }: { products: any[] }) {
  const featuredKeys = ["B-Lift", "J-Glitch", "T-Icon"];
  const cards = featuredKeys
    .map(key => products.find(p => String(p.name).startsWith(key)))
    .filter(Boolean);

  if (cards.length === 0) return null;

  return (
    <section
      className="px-7 py-14"
      style={{ background: "#F4EFE8", color: "#0B0B0C" }}
    >
      <div className="flex items-end justify-between gap-6">
        <h2 className="clash" style={{ fontSize: "clamp(42px, 6vw, 72px)" }}>
          Complete
          <br />
          the set
        </h2>
        <p className="serif-quiet text-[22px] max-w-sm">
          Three pieces that sit with D-Slip. Same SKUs. No leftover grid.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mt-7">
        {cards.map((product: any) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="relative min-h-[420px] overflow-hidden block bg-neutral-300"
          >
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null}
            <div className="absolute left-4 right-4 bottom-4">
              <p
                className="clash text-[32px] text-white"
                style={{ textShadow: "0 2px 12px #000" }}
              >
                {styleKeyFromName(product.name)}
              </p>
              <span
                className="inline-block mt-1.5 px-2 py-1 text-[12px] font-extrabold"
                style={{ background: "#0B0B0C", color: "var(--pist)" }}
              >
                {formatPrice(product.price)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
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
