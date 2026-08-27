import { useState } from "react";
import {
  ImpactHero,
  JournalTrueNorthRooms,
  PistachioTicker,
  ProcessSteps,
} from "../components/ImpactHero";
import { ProductHighlight } from "../components/ProductHighlight";
import { buildOrganizationJsonLd, SEO } from "../components/SEO";
import { mergeLandingContent } from "../data/landingContent";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useMutation, useQuery } from "../lib/backend";
import { itemsForStyle } from "../lib/brand";

export function HomePage() {
  const content = mergeLandingContent(undefined);
  const products = useQuery(api.products.list, {}) ?? [];
  const dslipColors = itemsForStyle(products, "D-Slip");
  const dslip = dslipColors[0];

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
        dslipColors={dslipColors}
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
