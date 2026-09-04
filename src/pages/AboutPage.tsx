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
        <span className="kicker-lock">Our story</span>
        <h1
          className="clash mt-6"
          style={{ fontSize: "clamp(56px, 10vw, 108px)" }}
        >
          Crafted with{" "}
          <span
            className="serif-quiet"
            style={{
              textTransform: "none",
              letterSpacing: 0,
              fontSize: "0.72em",
            }}
          >
            Purpose.
          </span>
        </h1>
        <p
          className="serif-quiet mx-auto mt-7 max-w-[640px] text-[18px] leading-relaxed"
          style={{ color: "rgba(247,240,230,0.82)" }}
        >
          XI Eleven XVI Sixteen is a house of clothing. Every piece is made
          exclusively for you — no mass production, no overstock, no waste.
          The name is 11 and 16. True North is those numbers, opened.
        </p>
      </section>

      <section
        className="text-center px-10 py-20"
        style={{ background: "#111" }}
      >
        <p className="label-lock" style={{ color: "var(--powder)" }}>
          Couture, redefined
        </p>
        <h2 className="clash text-6xl mt-4">Made exclusively for you</h2>
        <p
          className="serif-quiet text-2xl mt-5 max-w-2xl mx-auto"
          style={{ color: "rgba(247,240,230,0.8)" }}
        >
          When you place an order with XI · XVI, something extraordinary
          happens. Your piece doesn't exist yet — it comes to life the moment
          you choose it. That's not fast fashion. That's couture for the modern
          age.
        </p>
      </section>

      <ProcessSteps
        titles={["You Choose", "We Craft", "You Receive"]}
        copy={[
          "Browse our curated collection and select the piece that speaks to you. Every detail — from the fabric composition to the fit — has been obsessed over.",
          "Your order triggers production. A single piece, made just for you, with premium materials and precision printing. No warehouse shelf. No mass run.",
          "Your one-of-a-kind piece arrives at your door — exactly as designed, crafted with intention, and yours alone. That's the XI · XVI promise.",
        ]}
      />

      <section
        className="text-center px-10 py-20"
        style={{ background: "var(--cream)", color: "#0B0B0C" }}
      >
        <p className="label-lock" style={{ color: "#0B0B0C" }}>
          Sustainability
        </p>
        <h2
          className="clash mt-4"
          style={{ fontSize: "clamp(42px, 7vw, 84px)" }}
        >
          Zero waste by design
        </h2>
        <p className="serif-quiet text-2xl mt-6 max-w-2xl mx-auto">
          The fashion industry produces over 92 million tons of textile waste
          per year. We believe luxury and responsibility aren't at odds —
          they're inseparable. Our made on demand model means nothing is
          produced until it's already yours. Zero unsold inventory. Zero
          landfill waste. Every piece has a purpose from the moment it's
          created.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[960px] mx-auto mt-10">
          {[
            ["0", "Unsold inventory"],
            ["0", "Textile waste"],
            ["100%", "On-demand production"],
            ["∞", "Intentional design"],
          ].map(([n, l]) => (
            <div
              key={l}
              className="py-6 px-3"
              style={{ border: "2px solid #0B0B0C" }}
            >
              <p className="clash text-[52px] leading-none">{n}</p>
              <p className="label-lock mt-2" style={{ color: "#0B0B0C" }}>
                {l}
              </p>
            </div>
          ))}
        </div>
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
          The meaning behind the name
        </p>
        <h2 className="clash text-center text-7xl mt-4">XI · XVI</h2>
        <p
          className="serif-quiet text-2xl text-center max-w-xl mx-auto mt-5"
          style={{ color: "rgba(247,240,230,0.8)" }}
        >
          Our name is a cipher — rooted in numerology, encoded with intention.
          The numbers 11 and 16 carry deep spiritual and creative significance
          that shapes every facet of this brand.
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
              The master number
            </p>
            <p
              className="mt-4 leading-relaxed"
              style={{ color: "rgba(247,240,230,0.75)" }}
            >
              In numerology, 11 is a Master Number — the symbol of spiritual
              awakening, heightened intuition, and visionary creativity. It
              represents the bridge between the conscious and the divine, the
              ability to see beyond surface appearance and perceive the
              extraordinary in the everyday. Eleven embodies illumination,
              inspiration, and the courage to lead through authenticity rather
              than conformity.
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
              The tower — transformation
            </p>
            <p
              className="mt-4 leading-relaxed"
              style={{ color: "rgba(247,240,230,0.75)" }}
            >
              The number 16 carries the vibration of transformation and rebirth.
              In numerological tradition, 16 (1 + 6 = 7) channels the energy of
              introspection, wisdom, and spiritual depth. It represents the
              shattering of the old to make way for what's truly authentic —
              tearing down convention and building something real from the
              foundation up. Sixteen is the architect of reinvention.
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
            Together: 11 + 16 = 27 → 2 + 7 = 9
          </p>
          <p className="serif-quiet text-xl mt-4 max-w-3xl">
            The sum of our name reduces to 9 — the number of completion,
            humanitarianism, and universal love. It represents the culmination
            of all cycles, a soul that has gathered wisdom from every
            experience. For us, it means fashion that serves a higher purpose:
            self-expression that uplifts, sustainability that protects, and
            craftsmanship that honors both the wearer and the world.
          </p>
        </div>
      </section>

      <section className="px-10 py-20">
        <p className="label-lock text-center" style={{ color: "var(--pist)" }}>
          True North
        </p>
        <h2
          className="clash text-center mt-4"
          style={{ fontSize: "clamp(42px, 7vw, 84px)" }}
        >
          The same numbers, opened.
        </h2>
        <p
          className="serif-quiet text-2xl text-center max-w-2xl mx-auto mt-5"
          style={{ color: "rgba(247,240,230,0.8)" }}
        >
          The clothes are the house. True North is the private room — natal
          chart, Almanac, Long Read. Nothing in that room exists until it's
          yours, same as a piece that isn't cut until you order it. The Long
          Read is the house reading: seven cards, three windows a day, $7/week.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link to="/chart" className="cta-pist">
            Open True North
          </Link>
          <Link to="/chart/long-read" className="cta-ghost">
            The Long Read — $7/week
          </Link>
        </div>
      </section>

      <section
        className="px-10 py-20"
        style={{ background: "var(--cream)", color: "#0B0B0C" }}
      >
        <p className="label-lock text-center" style={{ color: "#0B0B0C" }}>
          What we stand for
        </p>
        <h2 className="clash text-center text-7xl mt-3">Our values</h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-[980px] mx-auto mt-9">
          {[
            [
              "Intentional Design",
              "Every stitch, every print, every silhouette is deliberate. We don't follow trends — we design with precision and meaning.",
              "var(--pist)",
            ],
            [
              "Radical Sustainability",
              "Made on demand production eliminates waste before it begins. No overruns. No dead stock. No contribution to the 92M tons of textile waste the industry produces annually.",
              "var(--powder)",
            ],
            [
              "Couture Accessibility",
              "The couture concept — a piece made exclusively for you — shouldn't be reserved for the ultra-wealthy. We democratize that experience without compromising quality.",
              "var(--blush)",
            ],
            [
              "The house",
              "11 and 16 aren't decoration. They're why a piece is made for one person, and why True North reads you the same way — chart, Almanac, Long Read. Cosmology we actually live in, not a second brand.",
              "var(--lilac)",
            ],
          ].map(([t, b, bg]) => (
            <div
              key={t}
              className="p-7"
              style={{ border: "2px solid #0B0B0C", background: bg }}
            >
              <p className="clash text-3xl">{t}</p>
              <p className="serif-quiet text-xl mt-3">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center px-10 py-[88px]">
        <img
          src={CREST_URL}
          alt="XI · XVI crest"
          className="h-16 w-auto mx-auto mb-6"
        />
        <p className="label-lock" style={{ color: "var(--pist)" }}>
          Your piece awaits
        </p>
        <h2
          className="clash mt-4"
          style={{ fontSize: "clamp(42px, 7vw, 84px)" }}
        >
          Experience the collection
        </h2>
        <p className="serif-quiet text-2xl mt-5 max-w-md mx-auto">
          Every piece is made exclusively for you. True North is the same idea,
          opened.
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
    </>
  );
}
