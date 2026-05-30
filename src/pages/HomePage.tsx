import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO, buildOrganizationJsonLd } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";

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
      {/* Hero Section */}
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

        {/* Near-invisible tint — just enough to seat the text */}
        <div className="absolute inset-0 z-[1]" style={{ background: "rgba(14, 10, 15, 0.06)" }} />
        <div
          className="absolute inset-0 z-[2]"
          style={{ background: "linear-gradient(rgba(14,10,15,0.12) 0%, transparent 25%, transparent 65%, rgba(14,10,15,0.7) 100%)" }}
        />
        {/* Warm spectrum glow — very subtle */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none animate-hero-spectrum"
          style={{
            background: "radial-gradient(at 30% 20%, rgba(240,200,175,0.03) 0%, transparent 50%), radial-gradient(at 70% 80%, rgba(200,140,255,0.02) 0%, transparent 40%), radial-gradient(at 50% 50%, rgba(255,180,180,0.015) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto flex flex-col items-center justify-center">
          {/* Glass panel — visible but see-through */}
          <div
            className="absolute inset-x-4 inset-y-[-40px] rounded-[32px] pointer-events-none overflow-hidden"
            style={{
              background: "rgba(14, 10, 15, 0.18)",
              backdropFilter: "blur(2px) saturate(1.08)",
              WebkitBackdropFilter: "blur(2px) saturate(1.08)",
              border: "1.5px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "inset 0 0 50px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.18), 0 0 60px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Spectrum shimmer sweep — light catching glass */}
            <div className="hero-glass-shimmer" />
          </div>
          {/* Inner highlight edge — top-left lens reflection */}
          <div
            className="absolute inset-x-4 inset-y-[-40px] rounded-[32px] pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 100%)",
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
              <p className="text-[10px] tracking-[0.5em] uppercase mb-4 font-medium drop-shadow-lg" style={{ color: "rgba(245, 200, 170, 0.85)" }}>
                THE WOMEN'S COLLECTION
              </p>
              <h1 className="text-4xl md:text-6xl text-white mb-3 leading-[1.1] font-light" style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 20px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)" }}>
                Designed for<br />
                <span
                  className="italic"
                  style={{
                    background: "linear-gradient(90deg, #e0c0ff, #fff0e6, #ffc0d0, #c0e8ff)",
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
              <p className="text-[13px] md:text-[15px] mb-6 max-w-md mx-auto leading-relaxed font-light" style={{ color: "rgba(245, 230, 220, 0.75)", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                Slip dresses that drape like a second skin. Flow leggings sculpted for effortless movement. Padded sports bras engineered for support and style — luxury fashion made to move with you.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["D-Slip Dresses", "L-Flow Leggings", "B-Lift Sports Bras"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-[9px] tracking-[0.15em] uppercase"
                    style={{
                      color: "rgba(245, 230, 220, 0.8)",
                      background: "rgba(255, 240, 230, 0.08)",
                      border: "1px solid rgba(240, 210, 190, 0.18)",
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
              <p className="text-[10px] tracking-[0.5em] uppercase mb-4 font-medium drop-shadow-lg" style={{ color: "rgba(245, 200, 170, 0.85)" }}>
                THE MEN'S COLLECTION
              </p>
              <h2 className="text-4xl md:text-6xl text-white mb-3 leading-[1.1] font-light" style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 20px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)" }}>
                Built for<br />
                <span
                  className="italic"
                  style={{
                    background: "linear-gradient(90deg, #e0c0ff, #fff0e6, #ffc0d0, #c0e8ff)",
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
              <p className="text-[13px] md:text-[15px] mb-6 max-w-md mx-auto leading-relaxed font-light" style={{ color: "rgba(245, 230, 220, 0.75)", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                Statement jerseys with all-over glitch prints. Athletic shorts cut for performance. Oversized tees with premium hand-feel — bold design meets unmatched comfort.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["J-Glitch Jerseys", "S-Glitch Shorts", "T-Icon Tees"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-[9px] tracking-[0.15em] uppercase"
                    style={{
                      color: "rgba(245, 230, 220, 0.8)",
                      background: "rgba(255, 240, 230, 0.08)",
                      border: "1px solid rgba(240, 210, 190, 0.18)",
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
                background: "rgba(14, 10, 15, 0.5)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(240, 210, 190, 0.1)",
                borderRadius: "24px",
              }}
            >
              <div
                className="absolute top-1 bottom-1 transition-all duration-400 ease-out"
                style={{
                  left: activeGender === "women" ? "4px" : "calc(50%)",
                  width: "calc(50% - 4px)",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #c48dff 0%, #ff9eb8 50%, #f5c97a 100%)",
                  backgroundSize: "200% 100%",
                  animation: "gradient-loop 4s ease-in-out infinite",
                  boxShadow: "0 0 20px rgba(200,140,255,0.3), 0 0 40px rgba(255,158,184,0.1)",
                }}
              />
              <button
                type="button"
                onClick={() => setActiveGender("women")}
                className={`relative z-10 px-7 py-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors duration-300 cursor-pointer rounded-full ${
                  activeGender === "women" ? "text-white" : "text-white/55 hover:text-white/75"
                }`}
              >
                HER EDIT
              </button>
              <button
                type="button"
                onClick={() => setActiveGender("men")}
                className={`relative z-10 px-7 py-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors duration-300 cursor-pointer rounded-full ${
                  activeGender === "men" ? "text-white" : "text-white/55 hover:text-white/75"
                }`}
              >
                HIS EDIT
              </button>
            </div>

            <Link
              to={`/shop?gender=${activeGender}`}
              className="inline-block px-12 py-3.5 text-[11px] tracking-[0.25em] uppercase font-bold transition-all duration-300 text-white glass-shimmer"
              style={{
                background: "linear-gradient(135deg, rgba(200,140,255,0.12) 0%, rgba(255,190,170,0.08) 50%, rgba(130,220,200,0.06) 100%)",
                border: "1px solid rgba(240, 210, 190, 0.12)",
                borderRadius: "12px",
              }}
            >
              EXPLORE THE COLLECTION →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Made for You Section ── */}
      <section
        className="py-20 px-6"
        style={{
          background: "linear-gradient(#0e0a0f 0%, #140e18 50%, #0e0a0f 100%)",
          borderTop: "1px solid rgba(240,210,190,0.06)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6"
              style={{
                background: "rgba(245,200,170,0.05)",
                border: "1px solid rgba(245,200,170,0.12)",
                borderRadius: "10px",
              }}
            >
              <span style={{ color: "rgba(245,200,170,0.7)" }}>✦</span>
              <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "rgba(245,200,170,0.6)" }}>COUTURE, REDEFINED</span>
            </div>
            <h2 className="text-3xl md:text-4xl text-white mb-4 font-light" style={{ fontFamily: "var(--font-display)" }}>
              Made Exclusively for You
            </h2>
            <p className="text-[14px] max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(245,230,220,0.38)" }}>
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
                className="text-center p-6"
                style={{
                  background: "rgba(255,240,230,0.02)",
                  border: "1px solid rgba(240,210,190,0.06)",
                  borderRadius: "16px",
                }}
              >
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold" style={{ color: "rgba(200,140,255,0.5)" }}>STEP {item.step}</span>
                <h3 className="text-[15px] text-white font-medium mt-1 mb-2" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(245,230,220,0.35)" }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/about" className="text-[11px] tracking-[0.15em] uppercase font-medium transition-colors" style={{ color: "rgba(200,160,220,0.55)" }}>
              Read Our Story →
            </Link>
          </div>
        </div>
      </section>

      {/* Style Assistant Section */}
      <section
        className="py-20 px-6"
        style={{
          background: "linear-gradient(#0e0a0f 0%, #140e18 50%, #0e0a0f 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8"
            style={{
              background: "rgba(200, 140, 255, 0.05)",
              border: "1px solid rgba(200, 140, 255, 0.15)",
              borderRadius: "10px",
            }}
          >
            <span style={{ color: "#c48dff" }}>✦</span>
            <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "rgba(200, 160, 220, 0.7)" }}>STYLE ASSISTANT</span>
          </div>
          <h2 className="text-3xl md:text-5xl text-white mb-4 font-light" style={{ fontFamily: "var(--font-display)" }}>
            Your Personal Style Guide
          </h2>
          <p className="text-[14px] mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(245, 230, 220, 0.38)" }}>
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
                className="flex items-center gap-2 px-4 py-2 glass-panel-sm"
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-[11px]" style={{ color: "rgba(245, 230, 220, 0.5)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-6 border-t" style={{ borderColor: "rgba(240, 210, 190, 0.06)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: "🔒", title: "SECURE", desc: "SSL / Stripe" },
            { icon: "📦", title: "FREE SHIP", desc: "Every order" },
            { icon: "📍", title: "TRACKED", desc: "Full tracking" },
            { icon: "↩️", title: "RETURNS", desc: "Easy returns" },
          ].map((badge) => (
            <div key={badge.title} className="text-center">
              <span className="text-2xl mb-2 block">{badge.icon}</span>
              <p className="text-[10px] tracking-[0.25em] uppercase font-semibold" style={{ color: "rgba(245, 230, 220, 0.45)" }}>{badge.title}</p>
              <p className="text-[12px] mt-1" style={{ color: "rgba(245, 230, 220, 0.25)" }}>{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
