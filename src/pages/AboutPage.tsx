import { Link } from "react-router-dom";
import { ProcessSteps } from "../components/ImpactHero";
import { SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";
import { CREST_URL } from "../lib/brand";

export function AboutPage() {
  return (
    <>
      <SEO
        title={PAGE_SEO.about.title}
        description={PAGE_SEO.about.description}
        url="/about"
      />

      <section className="text-center relative overflow-hidden px-10 py-[72px]">
        <span className="kicker-lock">XI Eleven XVI Sixteen</span>
        <h1
          className="clash mt-6"
          style={{ fontSize: "clamp(40px, 8vw, 92px)" }}
        >
          A clothing house.
        </h1>
        <p
          className="serif-quiet mx-auto mt-7 max-w-[640px] text-[20px] leading-relaxed"
          style={{ color: "rgba(247,240,230,0.82)" }}
        >
          We cut a garment when you order it. That is the shop. The Journal
          is writing about those garments. True North is a separate product:
          written tarot, seven dollars a week.
        </p>
        <Link to="/shop" className="cta-pist mt-8">
          Shop clothing
        </Link>
      </section>

      <section className="px-10 py-[72px]">
        <p className="label-lock text-center" style={{ color: "var(--pist)" }}>
          What we sell
        </p>
        <h2 className="clash text-center text-5xl mt-4">Three products.</h2>
        <div className="grid md:grid-cols-3 gap-4 max-w-[1100px] mx-auto mt-10">
          <div className="p-8" style={{ border: "2px solid rgba(247,240,230,0.18)" }}>
            <p className="label-lock" style={{ color: "var(--lilac)" }}>
              01 · Clothing
            </p>
            <h3 className="clash text-4xl mt-3">The shop</h3>
            <p className="serif-quiet mt-4 text-lg" style={{ color: "rgba(247,240,230,0.8)" }}>
              Dresses, sports bras, leggings, jerseys, and shorts. You pick
              color and size. We make that piece. Nothing sits in a warehouse
              waiting for a sale.
            </p>
            <Link to="/shop" className="cta-ghost mt-6 inline-flex">
              Shop the collection
            </Link>
          </div>
          <div className="p-8" style={{ border: "2px solid rgba(247,240,230,0.18)" }}>
            <p className="label-lock" style={{ color: "var(--lilac)" }}>
              02 · Journal
            </p>
            <h3 className="clash text-4xl mt-3">The writing</h3>
            <p className="serif-quiet mt-4 text-lg" style={{ color: "rgba(247,240,230,0.8)" }}>
              Fit guides, fabric notes, and how the house works. Essays you
              can read for free. No card draw. No almanac. Those live in
              True North.
            </p>
            <Link to="/journal" className="cta-ghost mt-6 inline-flex">
              Read the Journal
            </Link>
          </div>
          <div className="p-8" style={{ border: "2px solid rgba(247,240,230,0.18)" }}>
            <p className="label-lock" style={{ color: "var(--lilac)" }}>
              03 · True North
            </p>
            <h3 className="clash text-4xl mt-3">Written tarot</h3>
            <p className="serif-quiet mt-4 text-lg" style={{ color: "rgba(247,240,230,0.8)" }}>
              You describe what is going on. We write you three tarot
              readings a day from that. Seven-day trial, then $7 a week.
              Cancel anytime.
            </p>
            <Link to="/chart/long-read" className="cta-ghost mt-6 inline-flex">
              Start written tarot
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-10 py-[72px]">
        <p className="label-lock text-center" style={{ color: "var(--lilac)" }}>
          How a piece is made
        </p>
        <h2 className="clash text-center text-6xl mt-4">Select. Produce. Receive.</h2>
        <p
          className="serif-quiet text-xl text-center max-w-xl mx-auto mt-5"
          style={{ color: "rgba(247,240,230,0.8)" }}
        >
          You pick the color and size. We cut and finish that order. You
          get one garment that did not exist the morning before you
          bought it.
        </p>
        <div className="max-w-[980px] mx-auto mt-10">
          <ProcessSteps />
        </div>
      </section>

      <section
        className="px-10 py-20 text-center"
        style={{ background: "#F7F0E6", color: "#0B0B0C" }}
      >
        <p className="label-lock" style={{ color: "#0B0B0C" }}>
          Why made-on-demand
        </p>
        <h2 className="clash mt-4" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
          No leftover stock.
        </h2>
        <p className="serif-quiet text-xl max-w-2xl mx-auto mt-5">
          Most brands guess how many units will sell, then dump what
          does not. We do not print a run. One order becomes one piece.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[960px] mx-auto mt-10">
          {[
            ["0", "Unsold inventory"],
            ["0", "Speculative waste"],
            ["1", "Order, one piece"],
            ["2–5", "Days to make"],
          ].map(([n, l]) => (
            <div
              key={l}
              className="py-6 px-3"
              style={{ border: "2px solid #0B0B0C" }}
            >
              <p className="clash text-[40px] sm:text-[52px] leading-none">{n}</p>
              <p className="label-lock mt-2" style={{ color: "#0B0B0C" }}>
                {l}
              </p>
            </div>
          ))}
        </div>
        <Link to="/shop" className="cta-pist mt-10">
          Shop clothing
        </Link>
      </section>

      <section className="px-10 py-20">
        <p className="label-lock text-center" style={{ color: "var(--pist)" }}>
          True North
        </p>
        <h2
          className="clash text-center mt-4"
          style={{ fontSize: "clamp(36px, 6vw, 72px)" }}
        >
          Written tarot. Paid separately.
        </h2>
        <p
          className="serif-quiet text-xl text-center max-w-2xl mx-auto mt-5"
          style={{ color: "rgba(247,240,230,0.8)" }}
        >
          Create an account and we calculate your natal chart. That chart
          is free. The Long Read is the paid product: three written
          readings each day for $7 a week after a seven-day trial.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link to="/chart/long-read" className="cta-pist">
            Start written tarot — $7/week
          </Link>
          <Link to="/chart" className="cta-ghost">
            See your natal chart
          </Link>
        </div>
      </section>

      <section className="text-center px-10 py-[72px]">
        <img
          src={CREST_URL}
          alt="XI Eleven XVI Sixteen crest"
          className="h-16 w-auto mx-auto mb-6"
        />
        <h2 className="clash" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
          Wear the work.
        </h2>
        <p className="serif-quiet text-xl mt-5 max-w-md mx-auto">
          Clothing first. Writing second. Readings only when you subscribe.
        </p>
        <Link to="/shop" className="cta-pist mt-8">
          Shop clothing
        </Link>
      </section>
    </>
  );
}
