import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";

/* ─── Numerology & Brand Story ────────────────────────────────────────── */

export function AboutPage() {
  return (
    <>
      <SEO
        title="About — XI Eleven XVI Sixteen"
        description="Discover the vision behind XI Eleven XVI Sixteen — luxury fashion made exclusively for you, rooted in numerology, sustainability, and uncompromising quality."
        url="/about"
      />
      <div className="min-h-screen">
        {/* ── Hero ── */}
        <section className="relative py-28 md:py-36 px-6 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(200,140,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255,180,170,0.04) 0%, transparent 45%), #0e0a0f",
            }}
          />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <p
              className="text-[10px] tracking-[0.5em] uppercase mb-5 font-medium"
              style={{ color: "rgba(200,160,220,0.65)" }}
            >
              OUR STORY
            </p>
            <h1
              className="text-4xl md:text-6xl text-white mb-6 font-light leading-[1.1]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Crafted with{" "}
              <span
                className="italic"
                style={{
                  background:
                    "linear-gradient(90deg, #e0c0ff, #fff0e6, #ffc0d0, #c0e8ff)",
                  backgroundSize: "200% 100%",
                  animation: "gradient-loop 6s ease-in-out infinite",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Purpose.
              </span>
            </h1>
            <p
              className="text-[14px] md:text-[16px] leading-relaxed max-w-xl mx-auto"
              style={{ color: "rgba(245,230,220,0.55)" }}
            >
              XI Eleven XVI Sixteen is a luxury fashion house built on a radical
              idea: every piece should be made exclusively for you. No mass
              production. No overstock. No waste. Just intentional design,
              crafted on demand.
            </p>
          </div>
        </section>

        {/* ── Made for You ── */}
        <section
          className="py-20 px-6"
          style={{
            background:
              "linear-gradient(#0e0a0f, #140e18 40%, #0e0a0f 100%)",
            borderTop: "1px solid rgba(240,210,190,0.06)",
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-6"
                style={{
                  background: "rgba(200,140,255,0.05)",
                  border: "1px solid rgba(200,140,255,0.12)",
                  borderRadius: "10px",
                }}
              >
                <span style={{ color: "#c48dff" }}>✦</span>
                <span
                  className="text-[10px] tracking-[0.3em] uppercase font-medium"
                  style={{ color: "rgba(200,160,220,0.65)" }}
                >
                  COUTURE, REDEFINED
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl text-white mb-4 font-light"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Made Exclusively for You
              </h2>
              <p
                className="text-[14px] max-w-2xl mx-auto leading-relaxed"
                style={{ color: "rgba(245,230,220,0.42)" }}
              >
                When you place an order with XI · XVI, something extraordinary
                happens. Your piece doesn't exist yet — it comes to life the
                moment you choose it. That's not fast fashion. That's couture for
                the modern age.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "You Choose",
                  desc: "Browse our curated collection and select the piece that speaks to you. Every detail — from the fabric composition to the fit — has been obsessed over.",
                },
                {
                  step: "02",
                  title: "We Craft",
                  desc: "Your order triggers production. A single piece, made just for you, with premium materials and precision printing. No warehouse shelf. No mass run.",
                },
                {
                  step: "03",
                  title: "You Receive",
                  desc: "Your one-of-a-kind piece arrives at your door — exactly as designed, crafted with intention, and yours alone. That's the XI · XVI promise.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-6"
                  style={{
                    background: "rgba(255,240,230,0.02)",
                    border: "1px solid rgba(240,210,190,0.06)",
                    borderRadius: "16px",
                  }}
                >
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase font-bold"
                    style={{ color: "rgba(200,140,255,0.55)" }}
                  >
                    STEP {item.step}
                  </span>
                  <h3
                    className="text-lg text-white mt-2 mb-3 font-medium"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-[12px] leading-relaxed"
                    style={{ color: "rgba(245,230,220,0.38)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sustainability ── */}
        <section
          className="py-20 px-6"
          style={{ borderTop: "1px solid rgba(240,210,190,0.06)" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <p
              className="text-[10px] tracking-[0.5em] uppercase mb-5 font-medium"
              style={{ color: "rgba(200,160,220,0.55)" }}
            >
              SUSTAINABILITY
            </p>
            <h2
              className="text-3xl md:text-4xl text-white mb-6 font-light"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Zero Waste by Design
            </h2>
            <p
              className="text-[14px] leading-relaxed mb-10"
              style={{ color: "rgba(245,230,220,0.42)" }}
            >
              The fashion industry produces over 92 million tons of textile waste
              per year. We believe luxury and responsibility aren't at odds —
              they're inseparable. Our made-to-order model means nothing is
              produced until it's already yours. Zero unsold inventory. Zero
              landfill waste. Every piece has a purpose from the moment it's
              created.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { number: "0", label: "Unsold inventory" },
                { number: "0", label: "Textile waste" },
                { number: "100%", label: "On-demand production" },
                { number: "∞", label: "Intentional design" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    className="text-3xl font-light text-white mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      background:
                        "linear-gradient(135deg, #c48dff, #ff9eb8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stat.number}
                  </p>
                  <p
                    className="text-[10px] tracking-[0.1em] uppercase"
                    style={{ color: "rgba(245,230,220,0.35)" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Numerology: 11 & 16 ── */}
        <section
          className="py-20 px-6"
          style={{
            background:
              "linear-gradient(#0e0a0f, #140e18 40%, #0e0a0f 100%)",
            borderTop: "1px solid rgba(240,210,190,0.06)",
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p
                className="text-[10px] tracking-[0.5em] uppercase mb-5 font-medium"
                style={{ color: "rgba(245,200,170,0.55)" }}
              >
                THE MEANING BEHIND THE NAME
              </p>
              <h2
                className="text-3xl md:text-4xl text-white mb-4 font-light"
                style={{ fontFamily: "var(--font-display)" }}
              >
                XI · XVI
              </h2>
              <p
                className="text-[14px] max-w-xl mx-auto leading-relaxed"
                style={{ color: "rgba(245,230,220,0.42)" }}
              >
                Our name is a cipher — rooted in numerology, encoded with
                intention. The numbers 11 and 16 carry deep spiritual and
                creative significance that shapes every facet of this brand.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 11 */}
              <div
                className="p-8"
                style={{
                  background: "rgba(200,140,255,0.03)",
                  border: "1px solid rgba(200,140,255,0.08)",
                  borderRadius: "20px",
                }}
              >
                <h3
                  className="text-5xl font-light text-white mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    background:
                      "linear-gradient(135deg, #c48dff, #e0c0ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  11
                </h3>
                <p
                  className="text-[10px] tracking-[0.3em] uppercase mb-4 font-semibold"
                  style={{ color: "rgba(200,160,220,0.6)" }}
                >
                  THE MASTER NUMBER
                </p>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "rgba(245,230,220,0.45)" }}
                >
                  In numerology, 11 is a{" "}
                  <em style={{ color: "rgba(245,230,220,0.65)" }}>
                    Master Number
                  </em>{" "}
                  — the symbol of spiritual awakening, heightened intuition, and
                  visionary creativity. It represents the bridge between the
                  conscious and the divine, the ability to see beyond surface
                  appearance and perceive the extraordinary in the everyday.
                  Eleven embodies illumination, inspiration, and the courage to
                  lead through authenticity rather than conformity.
                </p>
              </div>

              {/* 16 */}
              <div
                className="p-8"
                style={{
                  background: "rgba(255,180,170,0.03)",
                  border: "1px solid rgba(255,180,170,0.08)",
                  borderRadius: "20px",
                }}
              >
                <h3
                  className="text-5xl font-light text-white mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    background:
                      "linear-gradient(135deg, #ff9eb8, #f5c97a)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  16
                </h3>
                <p
                  className="text-[10px] tracking-[0.3em] uppercase mb-4 font-semibold"
                  style={{ color: "rgba(255,180,170,0.6)" }}
                >
                  THE TOWER — TRANSFORMATION
                </p>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "rgba(245,230,220,0.45)" }}
                >
                  The number 16 carries the vibration of{" "}
                  <em style={{ color: "rgba(245,230,220,0.65)" }}>
                    transformation and rebirth
                  </em>
                  . In numerological tradition, 16 (1 + 6 = 7) channels the
                  energy of introspection, wisdom, and spiritual depth. It
                  represents the shattering of the old to make way for what's
                  truly authentic — tearing down convention and building
                  something real from the foundation up. Sixteen is the
                  architect of reinvention.
                </p>
              </div>
            </div>

            <div
              className="mt-10 p-8 text-center"
              style={{
                background: "rgba(255,240,230,0.02)",
                border: "1px solid rgba(240,210,190,0.06)",
                borderRadius: "20px",
              }}
            >
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-4 font-semibold"
                style={{ color: "rgba(245,200,170,0.5)" }}
              >
                TOGETHER: 11 + 16 = 27 → 2 + 7 = 9
              </p>
              <p
                className="text-[14px] leading-relaxed max-w-2xl mx-auto"
                style={{ color: "rgba(245,230,220,0.45)" }}
              >
                The sum of our name reduces to{" "}
                <strong style={{ color: "rgba(245,230,220,0.7)" }}>9</strong> —
                the number of completion, humanitarianism, and universal love. It
                represents the culmination of all cycles, a soul that has
                gathered wisdom from every experience. For us, it means fashion
                that serves a higher purpose: self-expression that uplifts,
                sustainability that protects, and craftsmanship that honors both
                the wearer and the world.
              </p>
            </div>
          </div>
        </section>

        {/* ── Core Values ── */}
        <section
          className="py-20 px-6"
          style={{ borderTop: "1px solid rgba(240,210,190,0.06)" }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p
                className="text-[10px] tracking-[0.5em] uppercase mb-5 font-medium"
                style={{ color: "rgba(200,160,220,0.55)" }}
              >
                WHAT WE STAND FOR
              </p>
              <h2
                className="text-3xl md:text-4xl text-white mb-4 font-light"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Our Values
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "✦",
                  title: "Intentional Design",
                  desc: "Every stitch, every print, every silhouette is deliberate. We don't follow trends — we design with precision and meaning.",
                },
                {
                  icon: "♻",
                  title: "Radical Sustainability",
                  desc: "Made-to-order production eliminates waste before it begins. No overruns. No dead stock. No contribution to the 92M tons of textile waste the industry produces annually.",
                },
                {
                  icon: "🪡",
                  title: "Couture Accessibility",
                  desc: "The couture concept — a piece made exclusively for you — shouldn't be reserved for the ultra-wealthy. We democratize that experience without compromising quality.",
                },
                {
                  icon: "🔮",
                  title: "Spiritual Grounding",
                  desc: "From our numerological foundation to our design philosophy, we believe fashion can be a vehicle for self-expression, transformation, and personal power.",
                },
              ].map((value) => (
                <div
                  key={value.title}
                  className="flex gap-4 p-6"
                  style={{
                    background: "rgba(255,240,230,0.02)",
                    border: "1px solid rgba(240,210,190,0.06)",
                    borderRadius: "16px",
                  }}
                >
                  <span className="text-xl shrink-0">{value.icon}</span>
                  <div>
                    <h3
                      className="text-[14px] text-white font-medium mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {value.title}
                    </h3>
                    <p
                      className="text-[12px] leading-relaxed"
                      style={{ color: "rgba(245,230,220,0.38)" }}
                    >
                      {value.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="py-20 px-6 text-center"
          style={{
            background:
              "linear-gradient(#0e0a0f, #140e18 50%, #0e0a0f 100%)",
            borderTop: "1px solid rgba(240,210,190,0.06)",
          }}
        >
          <p
            className="text-[10px] tracking-[0.5em] uppercase mb-4"
            style={{ color: "rgba(200,160,220,0.5)" }}
          >
            YOUR PIECE AWAITS
          </p>
          <h2
            className="text-3xl md:text-4xl text-white mb-4 font-light"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Experience the Collection
          </h2>
          <p
            className="text-[14px] mb-8 max-w-md mx-auto"
            style={{ color: "rgba(245,230,220,0.38)" }}
          >
            Every piece is made exclusively for you — a modern take on couture
            that's kinder to the planet.
          </p>
          <Link
            to="/shop"
            className="inline-block px-12 py-3.5 text-[11px] tracking-[0.25em] uppercase font-bold text-white transition-all glass-shimmer"
            style={{
              background:
                "linear-gradient(135deg, #c48dff 0%, #ff9eb8 50%, #f5c97a 100%)",
              backgroundSize: "200% 100%",
              animation: "gradient-loop 6s ease-in-out infinite",
              borderRadius: "12px",
            }}
          >
            SHOP NOW
          </Link>
        </section>
      </div>
    </>
  );
}
