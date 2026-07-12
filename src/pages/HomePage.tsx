import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO, buildOrganizationJsonLd } from "../components/SEO";
import { DashSetBanner } from "../components/DashSetBanner";
import { CategoryCarousel } from "../components/CategoryCarousel";
import { ProductSpotlights } from "../components/ProductSpotlight";
import { PAGE_SEO } from "../data/seoMeta";

/* ── Curved Section Separator (organic, like TERONA's wavy edges) ── */
function CurveSeparator({ flip, fromColor, toColor }: { flip?: boolean; fromColor: string; toColor: string }) {
  return (
    <div className="curve-separator" style={{ marginTop: "-1px", marginBottom: "-1px" }}>
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "60px", transform: flip ? "scaleY(-1)" : undefined }}
      >
        <path
          d="M0,0 C360,80 1080,0 1440,60 L1440,80 L0,80 Z"
          fill={toColor}
        />
        <path
          d="M0,0 L1440,0 L1440,60 C1080,0 360,80 0,0 Z"
          fill={fromColor}
        />
      </svg>
    </div>
  );
}

/* ── Crystal Divider Line ── */
function CrystalDivider() {
  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="divider-crystal" />
    </div>
  );
}

export function HomePage() {
  const [activeGender, setActiveGender] = useState<"women" | "men">("women");

  return (
    <>
      <SEO
        description={PAGE_SEO.home.description}
        url="/"
        jsonLd={buildOrganizationJsonLd()}
      />
    <div>
      {/* ── Dash Set Promo Banner ── */}
      <DashSetBanner />

      {/* ── Category Carousel ── */}
      <CategoryCarousel />

      {/* ═══════════════════════════════════════════════════
          HERO SECTION — Dark luxury with depth
          ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Video Backgrounds */}
        <video
          key="hero-her"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700"
          style={{ opacity: activeGender === "women" ? 1 : 0 }}
          src="https://decisive-cheetah-451.convex.cloud/api/storage/b3d7af91-f54c-48f4-b616-aa02d642684d"
        />
        <video
          key="hero-him"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700"
          style={{ opacity: activeGender === "men" ? 1 : 0 }}
          src="https://decisive-cheetah-451.convex.cloud/api/storage/e63c3dc5-14a3-4f3d-843b-f8d3525315cf"
        />

        {/* Dark luxury overlay — depth layers */}
        <div className="absolute inset-0 z-[1]" style={{ background: "rgba(9, 9, 15, 0.45)" }} />
        <div
          className="absolute inset-0 z-[2]"
          style={{ background: "linear-gradient(rgba(9,9,15,0.3) 0%, transparent 25%, transparent 55%, rgba(9,9,15,0.85) 100%)" }}
        />
        {/* Warm gold glow — depth */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none animate-hero-spectrum"
          style={{
            background: "radial-gradient(at 30% 20%, rgba(201,169,110,0.04) 0%, transparent 50%), radial-gradient(at 70% 80%, rgba(201,169,110,0.03) 0%, transparent 40%)",
          }}
        />
        {/* Diamond dust particles */}
        <div className="diamond-dust z-[4]" />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto flex flex-col items-center justify-center">
          {/* Glass panel — dark frosted */}
          <div
            className="absolute inset-x-4 inset-y-[-40px] rounded-[32px] pointer-events-none overflow-hidden"
            style={{
              background: "rgba(9, 9, 15, 0.4)",
              backdropFilter: "blur(12px) saturate(1.1)",
              WebkitBackdropFilter: "blur(12px) saturate(1.1)",
              border: "1px solid rgba(201, 169, 110, 0.08)",
              boxShadow: "inset 0 0 50px rgba(0,0,0,0.2), 0 0 60px rgba(0,0,0,0.3), 0 1px 0 rgba(201, 169, 110, 0.06)",
            }}
          >
            <div className="hero-glass-shimmer" />
          </div>
          <div
            className="absolute inset-x-4 inset-y-[-40px] rounded-[32px] pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(201,169,110,0.04) 0%, transparent 25%, transparent 75%, rgba(201,169,110,0.02) 100%)",
            }}
          />

          <div className="relative w-full" style={{ minHeight: "380px" }}>
            {/* Women's */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out"
              style={{
                opacity: activeGender === "women" ? 1 : 0,
                transform: activeGender === "women" ? "translateY(0)" : "translateY(12px)",
                pointerEvents: activeGender === "women" ? "auto" : "none",
              }}
            >
              <p className="text-[10px] tracking-[0.5em] uppercase mb-4 font-medium" style={{ color: "rgba(201, 169, 110, 0.6)" }}>
                THE WOMEN'S COLLECTION
              </p>
              <h1 className="text-4xl md:text-6xl mb-3 leading-[1.1] font-light" style={{ fontFamily: "var(--font-display)", color: "#f0e6d3", textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}>
                Designed for<br />
                <span
                  className="italic"
                  style={{
                    background: "linear-gradient(90deg, #c9a96e, #e8d5b0, #c9a96e)",
                    backgroundSize: "200% 100%",
                    animation: "gradient-loop 6s ease-in-out infinite",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Her.
                </span>
              </h1>
              <p className="text-[13px] md:text-[15px] mb-6 max-w-md mx-auto leading-relaxed font-light" style={{ color: "rgba(240, 230, 211, 0.5)", textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
                Slip dresses that drape like a second skin. Flow leggings sculpted for effortless movement. Padded sports bras engineered for support and style — luxury fashion made to move with you.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["D-Slip Dresses", "L-Flow Leggings", "B-Lift Sports Bras"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-[9px] tracking-[0.15em] uppercase"
                    style={{
                      color: "rgba(201, 169, 110, 0.6)",
                      background: "rgba(201, 169, 110, 0.06)",
                      border: "1px solid rgba(201, 169, 110, 0.1)",
                      borderRadius: "8px",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Men's */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out"
              style={{
                opacity: activeGender === "men" ? 1 : 0,
                transform: activeGender === "men" ? "translateY(0)" : "translateY(12px)",
                pointerEvents: activeGender === "men" ? "auto" : "none",
              }}
            >
              <p className="text-[10px] tracking-[0.5em] uppercase mb-4 font-medium" style={{ color: "rgba(201, 169, 110, 0.6)" }}>
                THE MEN'S COLLECTION
              </p>
              <h2 className="text-4xl md:text-6xl mb-3 leading-[1.1] font-light" style={{ fontFamily: "var(--font-display)", color: "#f0e6d3", textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}>
                Built for<br />
                <span
                  className="italic"
                  style={{
                    background: "linear-gradient(90deg, #c9a96e, #e8d5b0, #c9a96e)",
                    backgroundSize: "200% 100%",
                    animation: "gradient-loop 6s ease-in-out infinite",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Him.
                </span>
              </h2>
              <p className="text-[13px] md:text-[15px] mb-6 max-w-md mx-auto leading-relaxed font-light" style={{ color: "rgba(240, 230, 211, 0.5)", textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
                Statement jerseys with all-over glitch prints. Athletic shorts cut for performance. Oversized tees with premium hand-feel — bold design meets unmatched comfort.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["J-Glitch Jerseys", "S-Glitch Shorts", "T-Icon Tees"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-[9px] tracking-[0.15em] uppercase"
                    style={{
                      color: "rgba(201, 169, 110, 0.6)",
                      background: "rgba(201, 169, 110, 0.06)",
                      border: "1px solid rgba(201, 169, 110, 0.1)",
                      borderRadius: "8px",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle + CTA */}
          <div className="relative z-20 flex flex-col items-center gap-6 mt-2">
            <div
              className="relative flex items-center p-1"
              style={{
                background: "rgba(9, 9, 15, 0.6)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(201, 169, 110, 0.1)",
                borderRadius: "24px",
              }}
            >
              <div
                className="absolute top-1 bottom-1 transition-all duration-400 ease-out"
                style={{
                  left: activeGender === "women" ? "4px" : "calc(50%)",
                  width: "calc(50% - 4px)",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #c9a96e 0%, #e8d5b0 50%, #c9a96e 100%)",
                  backgroundSize: "200% 100%",
                  animation: "gradient-loop 4s ease-in-out infinite",
                  boxShadow: "0 0 20px rgba(201, 169, 110, 0.2)",
                }}
              />
              <button
                type="button"
                onClick={() => setActiveGender("women")}
                className={`relative z-10 px-7 py-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors duration-300 cursor-pointer rounded-full ${
                  activeGender === "women" ? "text-[#09090f]" : "text-[#f0e6d3]/35 hover:text-[#f0e6d3]/60"
                }`}
              >
                HER EDIT
              </button>
              <button
                type="button"
                onClick={() => setActiveGender("men")}
                className={`relative z-10 px-7 py-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors duration-300 cursor-pointer rounded-full ${
                  activeGender === "men" ? "text-[#09090f]" : "text-[#f0e6d3]/35 hover:text-[#f0e6d3]/60"
                }`}
              >
                HIS EDIT
              </button>
            </div>

            <Link
              to={`/shop?gender=${activeGender}`}
              className="inline-block px-12 py-3.5 text-[11px] tracking-[0.25em] uppercase font-bold transition-all duration-300 glass-shimmer"
              style={{
                background: "linear-gradient(135deg, #c9a96e, #e8d5b0)",
                color: "#09090f",
                border: "1px solid rgba(201, 169, 110, 0.3)",
                borderRadius: "12px",
                boxShadow: "0 4px 30px rgba(201, 169, 110, 0.15)",
              }}
            >
              EXPLORE THE COLLECTION →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Curve separator: hero → spotlights ── */}
      <CurveSeparator fromColor="#09090f" toColor="#0d0d14" />

      {/* ── Product Spotlights — below the hero ── */}
      <ProductSpotlights />

      {/* ── Curve separator: spotlights → brand story ── */}
      <CurveSeparator fromColor="#0d0d14" toColor="#111118" />

      {/* ═══════════════════════════════════════════════════
          BRAND STORY — "Made for You" with depth
          ═══════════════════════════════════════════════════ */}
      <section
        className="relative py-24 px-6 overflow-hidden"
        style={{
          background: "#111118",
        }}
      >
        {/* Subtle texture background */}
        <div className="diamond-dust" style={{ opacity: 0.3 }} />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6"
              style={{
                background: "rgba(201, 169, 110, 0.04)",
                border: "1px solid rgba(201, 169, 110, 0.08)",
                borderRadius: "10px",
              }}
            >
              <span style={{ color: "#c9a96e" }}>✦</span>
              <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "#c9a96e" }}>COUTURE, REDEFINED</span>
            </div>
            <h2 className="text-3xl md:text-5xl mb-5 font-light" style={{ fontFamily: "var(--font-display)", color: "#f0e6d3" }}>
              Made Exclusively <span className="italic" style={{ color: "#c9a96e" }}>for You</span>
            </h2>
            <p className="text-[14px] max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(240, 230, 211, 0.4)" }}>
              Every piece is crafted the moment you order it — not pulled from a shelf. That's not fast fashion. That's couture for the modern age. Zero waste. Zero compromise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: "01", title: "You Choose", desc: "Browse our curated collection — every detail obsessed over.", icon: "🔍" },
              { step: "02", title: "We Craft", desc: "Your order triggers production. One piece, made just for you.", icon: "🪡" },
              { step: "03", title: "You Receive", desc: "Your one-of-a-kind piece arrives — crafted with intention.", icon: "📦" },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-6 transition-all duration-300 hover:translate-y-[-4px]"
                style={{
                  background: "rgba(22, 22, 31, 0.6)",
                  border: "1px solid rgba(201, 169, 110, 0.06)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
                }}
              >
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold" style={{ color: "#c9a96e" }}>STEP {item.step}</span>
                <h3 className="text-[15px] font-medium mt-1 mb-2" style={{ fontFamily: "var(--font-display)", color: "#f0e6d3" }}>{item.title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(240, 230, 211, 0.35)" }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/about" className="text-[11px] tracking-[0.15em] uppercase font-medium transition-colors hover:text-[#e8d5b0]" style={{ color: "#c9a96e" }}>
              Read Our Story →
            </Link>
          </div>
        </div>
      </section>

      <CrystalDivider />

      {/* ═══════════════════════════════════════════════════
          STYLE ASSISTANT
          ═══════════════════════════════════════════════════ */}
      <section
        className="py-20 px-6"
        style={{
          background: "#09090f",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8"
            style={{
              background: "rgba(201, 169, 110, 0.04)",
              border: "1px solid rgba(201, 169, 110, 0.08)",
              borderRadius: "10px",
            }}
          >
            <span style={{ color: "#c9a96e" }}>✦</span>
            <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "#c9a96e" }}>STYLE ASSISTANT</span>
          </div>
          <h2 className="text-3xl md:text-5xl mb-4 font-light" style={{ fontFamily: "var(--font-display)", color: "#f0e6d3" }}>
            Your Personal <span className="italic" style={{ color: "#c9a96e" }}>Style Guide</span>
          </h2>
          <p className="text-[14px] mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(240, 230, 211, 0.4)" }}>
            Our style assistant finds your perfect size, suggests outfit pairings, and provides fabric details — all through a quick conversation. Look for the ✦ icon.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: "🎯", label: "Size Finder" },
              { icon: "👗", label: "Style Match" },
              { icon: "🧵", label: "Fabric Oracle" },
              { icon: "📦", label: "Order Tracker" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-4 py-2"
                style={{
                  background: "rgba(22, 22, 31, 0.5)",
                  border: "1px solid rgba(201, 169, 110, 0.06)",
                  borderRadius: "12px",
                }}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-[11px]" style={{ color: "rgba(240, 230, 211, 0.45)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curve separator: → trust badges ── */}
      <CurveSeparator fromColor="#09090f" toColor="#0d0d14" />

      {/* ═══════════════════════════════════════════════════
          TRUST BADGES
          ═══════════════════════════════════════════════════ */}
      <section className="py-16 px-6" style={{ background: "#0d0d14" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: "🔒", title: "SECURE", desc: "SSL / Stripe" },
            { icon: "📦", title: "FREE SHIP", desc: "Every order" },
            { icon: "📍", title: "TRACKED", desc: "Full tracking" },
            { icon: "↩️", title: "RETURNS", desc: "Easy returns" },
          ].map((badge) => (
            <div key={badge.title} className="text-center">
              <span className="text-2xl mb-2 block">{badge.icon}</span>
              <p className="text-[10px] tracking-[0.25em] uppercase font-semibold" style={{ color: "rgba(201, 169, 110, 0.5)" }}>{badge.title}</p>
              <p className="text-[12px] mt-1" style={{ color: "rgba(240, 230, 211, 0.25)" }}>{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
