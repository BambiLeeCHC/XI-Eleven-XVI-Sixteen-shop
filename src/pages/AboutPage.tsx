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
        <span className="kicker-lock">A house of clothing</span>
        <h1
          className="clash mt-6"
          style={{ fontSize: "clamp(48px, 10vw, 108px)" }}
        >
          Nothing left over.
        </h1>
        <p
          className="serif-quiet mx-auto mt-7 max-w-[640px] text-[20px] leading-relaxed"
          style={{ color: "rgba(247,240,230,0.82)" }}
        >
          XI Eleven XVI Sixteen. Eleven plus sixteen is nine — completion.
          We don't cut a piece until you order it. We don't write a
          reading until you say what's going on. The name is the model.
        </p>
        <Link to="/shop" className="cta-pist mt-8">
          Shop the house
        </Link>
      </section>

      <section className="relative overflow-hidden px-10 py-[88px]">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none clash"
          style={{
            fontSize: "clamp(120px, 22vw, 280px)",
            color: "rgba(247,240,230,0.04)",
          }}
        >
          11 · 16
        </div>
        <p className="label-lock text-center" style={{ color: "var(--lilac)" }}>
          The name is how we make
        </p>
        <h2 className="clash text-center text-7xl mt-4">XI · XVI</h2>
        <p
          className="serif-quiet text-2xl text-center max-w-xl mx-auto mt-5"
          style={{ color: "rgba(247,240,230,0.8)" }}
        >
          Not a motto we printed after the fact. 11, 16, and 9 are why a
          D-Slip doesn't exist until it's yours — and why True North
          waits for you to speak.
        </p>
        <div className="grid md:grid-cols-2 gap-4 max-w-[980px] mx-auto mt-10">
          <div
            className="p-9"
            style={{
              border: "2px solid var(--lilac)",
              background: "rgba(228,212,244,0.08)",
            }}
          >
            <p className="clash text-8xl" style={{ color: "var(--lilac)" }}>
              11
            </p>
            <p className="label-lock mt-3" style={{ color: "var(--lilac)" }}>
              The signal — you choose
            </p>
            <p
              className="mt-4 leading-relaxed"
              style={{ color: "rgba(247,240,230,0.75)" }}
            >
              Eleven is the moment of knowing before the proof. We don't
              guess the season and overcut. You say yes. Then we make it. That
              is the signal: one person, one piece, no speculative pile.
            </p>
          </div>
          <div
            className="p-9"
            style={{
              border: "2px solid var(--blush)",
              background: "rgba(244,205,216,0.08)",
            }}
          >
            <p className="clash text-8xl" style={{ color: "var(--blush)" }}>
              16
            </p>
            <p className="label-lock mt-3" style={{ color: "var(--blush)" }}>
              The tower — the old model falls
            </p>
            <p
              className="mt-4 leading-relaxed"
              style={{ color: "rgba(247,240,230,0.75)" }}
            >
              Sixteen is the necessary collapse. Fashion guesses, dumps,
              discounts, buries. 92 million tons a year, on purpose. 1 + 6 = 7:
              the seeker after the fall. We don't run that warehouse. Your
              order is the only run.
            </p>
          </div>
        </div>
        <div
          className="max-w-[980px] mx-auto mt-4 p-9"
          style={{
            border: "2px solid var(--pist)",
            background: "rgba(216,240,196,0.06)",
          }}
        >
          <p className="clash text-5xl" style={{ color: "var(--pist)" }}>
            9
          </p>
          <p className="label-lock mt-3" style={{ color: "var(--pist)" }}>
            11 + 16 = 27 → 2 + 7 = 9 — nothing left over
          </p>
          <p className="serif-quiet text-xl mt-4 max-w-3xl">
            Nine is completion. Zero unsold inventory is not a sustainability
            badge we bolted on. It is the number in the name, kept. A cycle that
            closes clean — in the cut, and in True North, where a Long Read
            isn't written until you name what's going on.
          </p>
        </div>
      </section>

      <ProcessSteps
        titles={["The signal", "The cut", "The close"]}
        copy={[
          "11 — You choose the piece. Color, size, the one that sits on you. Nothing starts before that yes.",
          "16 — Your order is the only run. No shelf, no overrun, no markdown graveyard. The old model doesn't get a vote.",
          "9 — It arrives made for one person. The cycle closes with nothing left over. That's the house.",
        ]}
      />

      <section
        className="text-center px-10 py-20"
        style={{ background: "var(--cream)", color: "#0B0B0C" }}
      >
        <p className="label-lock" style={{ color: "#0B0B0C" }}>
          What nine looks like
        </p>
        <h2
          className="clash mt-4"
          style={{ fontSize: "clamp(42px, 7vw, 84px)" }}
        >
          Zero, on purpose.
        </h2>
        <p className="serif-quiet text-2xl mt-6 max-w-2xl mx-auto">
          The industry produces 92 million tons of textile waste a year because
          it makes clothes that nobody asked for. We wait. Luxury here is
          precision — a piece that already has an owner.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[960px] mx-auto mt-10">
          {[
            ["0", "Unsold inventory"],
            ["0", "Speculative waste"],
            ["11 · 16", "The name, kept"],
            ["1", "Person per piece"],
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
          Shop the house
        </Link>
      </section>

      <section className="px-10 py-20">
        <p className="label-lock text-center" style={{ color: "var(--pist)" }}>
          True North
        </p>
        <h2
          className="clash text-center mt-4"
          style={{ fontSize: "clamp(42px, 7vw, 84px)" }}
        >
          The same nine, opened.
        </h2>
        <p
          className="serif-quiet text-2xl text-center max-w-2xl mx-auto mt-5"
          style={{ color: "rgba(247,240,230,0.8)" }}
        >
          Chart, Almanac, Long Read — the private room of the house. A natal
          chart is the spec you arrived with. The Long Read is $7/week, written
          against what you type. Same ethic as the cut: nothing generic, nothing
          early.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link to="/shop" className="cta-pist">
            Shop the house
          </Link>
          <Link to="/chart" className="cta-ghost">
            Open True North
          </Link>
        </div>
      </section>

      <section className="text-center px-10 py-[88px]">
        <img
          src={CREST_URL}
          alt="XI · XVI crest"
          className="h-16 w-auto mx-auto mb-6"
        />
        <p className="label-lock" style={{ color: "var(--pist)" }}>
          11:16
        </p>
        <h2
          className="clash mt-4"
          style={{ fontSize: "clamp(42px, 7vw, 84px)" }}
        >
          Wear the number.
        </h2>
        <p className="serif-quiet text-2xl mt-5 max-w-md mx-auto">
          Made on demand. Made for one person. The cosmology is in the
          garment — not a separate thought.
        </p>
        <Link to="/shop" className="cta-pist mt-8">
          Shop the house
        </Link>
      </section>
    </>
  );
}
