import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO, buildOrganizationJsonLd } from "../components/SEO";
import { DashSetBanner } from "../components/DashSetBanner";
import { CategoryCarousel } from "../components/CategoryCarousel";
import { ProductSpotlights } from "../components/ProductSpotlight";
import { PAGE_SEO } from "../data/seoMeta";

/* ═══════════════════════════════════════════════════════
   CRYSTAL CHAIN DIVIDER
   XI XVI's version of TERONA's gold chain.
   A strand of pavé crystals draped across section boundaries.
   ═══════════════════════════════════════════════════════ */
function CrystalChainDivider() {
  return (
    <div className="crystal-chain-container" style={{ height: "80px", position: "relative", zIndex: 30 }}>
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "80px", display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="chainGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(184,148,63,0)" />
            <stop offset="15%" stopColor="rgba(184,148,63,0.6)" />
            <stop offset="50%" stopColor="rgba(232,213,176,0.9)" />
            <stop offset="85%" stopColor="rgba(184,148,63,0.6)" />
            <stop offset="100%" stopColor="rgba(184,148,63,0)" />
          </linearGradient>
          <linearGradient id="chainHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <filter id="chainGlow">
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="sparkle">
            <feGaussianBlur stdDeviation="1.5" result="sparkGlow" />
            <feMerge>
              <feMergeNode in="sparkGlow" />
              <feMergeNode in="sparkGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main chain curve — draped catenary shape */}
        <path
          d="M0,10 Q360,70 720,55 Q1080,40 1440,15"
          fill="none"
          stroke="url(#chainGold)"
          strokeWidth="2.5"
          filter="url(#chainGlow)"
          style={{ animation: "crystal-chain-sway 8s ease-in-out infinite" }}
        />
        {/* Highlight on top of chain */}
        <path
          d="M0,9 Q360,69 720,54 Q1080,39 1440,14"
          fill="none"
          stroke="url(#chainHighlight)"
          strokeWidth="1"
        />

        {/* Crystal diamonds along the chain — larger, visible */}
        {[120, 260, 400, 540, 680, 760, 820, 900, 1040, 1180, 1320].map((x, i) => {
          // Calculate Y position along the catenary
          const t = x / 1440;
          const y = t < 0.5
            ? 10 + (55 - 10) * Math.sin(t * Math.PI)
            : 55 - (55 - 15) * Math.sin((t - 0.5) * Math.PI);

          const size = i === 5 ? 7 : (i % 3 === 0 ? 5 : 4); // Center diamond is biggest
          const sparkleDelay = i * 0.7;

          return (
            <g key={i}>
              {/* Diamond shape */}
              <polygon
                points={`${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`}
                fill={i === 5 ? "#d4b96a" : "#b8943f"}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.5"
                filter="url(#sparkle)"
                style={{
                  animation: `crystal-sparkle-${(i % 2) + 1} ${2 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${sparkleDelay}s`,
                }}
              />
              {/* Sparkle rays on larger diamonds */}
              {size >= 5 && (
                <>
                  <line x1={x} y1={y - size - 4} x2={x} y2={y - size - 1} stroke="rgba(232,213,176,0.4)" strokeWidth="0.5" />
                  <line x1={x} y1={y + size + 1} x2={x} y2={y + size + 4} stroke="rgba(232,213,176,0.4)" strokeWidth="0.5" />
                  <line x1={x - size - 3} y1={y} x2={x - size} y2={y} stroke="rgba(232,213,176,0.3)" strokeWidth="0.5" />
                  <line x1={x + size} y1={y} x2={x + size + 3} y2={y} stroke="rgba(232,213,176,0.3)" strokeWidth="0.5" />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ORGANIC WAVE DIVIDER — More dramatic than V1
   ═══════════════════════════════════════════════════════ */
function WaveDivider({ fromColor, toColor }: { fromColor: string; toColor: string }) {
  return (
    <div style={{ marginTop: "-1px", marginBottom: "-1px", lineHeight: 0 }}>
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
        <path d="M0,0 L1440,0 L1440,30 C1200,90 960,10 720,50 C480,90 240,20 0,60 Z" fill={fromColor} />
        <path d="M0,60 C240,20 480,90 720,50 C960,10 1200,90 1440,30 L1440,100 L0,100 Z" fill={toColor} />
        {/* Gold shimmer on the wave crest */}
        <path
          d="M0,60 C240,20 480,90 720,50 C960,10 1200,90 1440,30"
          fill="none"
          stroke="rgba(184,148,63,0.12)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STATS SECTION — Like TERONA's impressive numbers
   ═══════════════════════════════════════════════════════ */
function StatsSection() {
  const stats = [
    { number: "34", label: "Unique Products" },
    { number: "6", label: "Color Stories" },
    { number: "100%", label: "Made to Order" },
    { number: "0", label: "Waste" },
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-warm-cream">
      <div className="diamond-dust" style={{ opacity: 0.4 }} />
      {/* Gold mist at top */}
      <div className="gold-mist gold-mist-top" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="stat-number">{s.number}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   GOLD ORNAMENTAL ACCENTS — floating decorative elements
   ═══════════════════════════════════════════════════════ */
function GoldOrnament({ style, size = 20 }: { style?: React.CSSProperties; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className="float-slow"
      style={{ position: "absolute", pointerEvents: "none", ...style }}
    >
      <polygon
        points="10,0 13,7 20,10 13,13 10,20 7,13 0,10 7,7"
        fill="none"
        stroke="rgba(184,148,63,0.25)"
        strokeWidth="0.5"
      />
      <polygon
        points="10,4 12,8 16,10 12,12 10,16 8,12 4,10 8,8"
        fill="rgba(184,148,63,0.08)"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   CRYSTAL DIVIDER LINE (enhanced from V1)
   ═══════════════════════════════════════════════════════ */
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
          CRYSTAL CHAIN — draped from carousel into hero
          ═══════════════════════════════════════════════════ */}
      <CrystalChainDivider />

      {/* ═══════════════════════════════════════════════════
          HERO SECTION — Rich textured, not flat
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

        {/* Dark luxury overlay */}
        <div className="absolute inset-0 z-[1]" style={{ background: "rgba(255, 255, 255, 0.4)" }} />
        <div className="absolute inset-0 z-[2]" style={{ background: "linear-gradient(rgba(255,255,255,0.3) 0%, transparent 25%, transparent 55%, rgba(255,255,255,0.85) 100%)" }} />
        <div className="absolute inset-0 z-[3] pointer-events-none animate-hero-spectrum" style={{ background: "radial-gradient(at 30% 20%, rgba(184,148,63,0.04) 0%, transparent 50%), radial-gradient(at 70% 80%, rgba(184,148,63,0.03) 0%, transparent 40%)" }} />
        <div className="diamond-dust z-[4]" />

        {/* Floating gold ornaments — out-of-the-box decorative elements */}
        <GoldOrnament style={{ top: "15%", left: "8%", opacity: 0.6 }} size={24} />
        <GoldOrnament style={{ top: "25%", right: "12%", opacity: 0.4 }} size={16} />
        <GoldOrnament style={{ bottom: "20%", left: "15%", opacity: 0.3 }} size={18} />
        <GoldOrnament style={{ bottom: "30%", right: "6%", opacity: 0.5 }} size={22} />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto flex flex-col items-center justify-center">
          {/* Glass panel */}
          <div
            className="absolute inset-x-4 inset-y-[-40px] rounded-[32px] pointer-events-none overflow-hidden gold-frame"
            style={{
              background: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(12px) saturate(1.1)",
              WebkitBackdropFilter: "blur(12px) saturate(1.1)",
              border: "1px solid rgba(184, 148, 63, 0.08)",
              boxShadow: "inset 0 0 50px rgba(0,0,0,0.2), 0 0 60px rgba(0,0,0,0.3), 0 1px 0 rgba(184, 148, 63, 0.06)",
            }}
          >
            <div className="hero-glass-shimmer" />
          </div>

          <div className="relative w-full" style={{ minHeight: "380px" }}>
            {/* Women's hero */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out"
              style={{
                opacity: activeGender === "women" ? 1 : 0,
                transform: activeGender === "women" ? "translateY(0)" : "translateY(12px)",
                pointerEvents: activeGender === "women" ? "auto" : "none",
              }}
            >
              <p className="text-[10px] tracking-[0.5em] uppercase mb-4 font-medium" style={{ color: "rgba(184, 148, 63, 0.6)" }}>
                ✦ THE WOMEN'S COLLECTION ✦
              </p>
              <h1 className="text-5xl md:text-7xl mb-3 leading-[1.05] font-light" style={{ fontFamily: "var(--font-display)", color: "#1a1a2e", textShadow: "0 4px 40px rgba(0,0,0,0.5)" }}>
                Designed for<br />
                <span className="italic" style={{
                  background: "linear-gradient(90deg, #b8943f, #d4b96a, #b8943f)",
                  backgroundSize: "200% 100%",
                  animation: "gradient-loop 6s ease-in-out infinite",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>Her.</span>
              </h1>
              <p className="text-[14px] md:text-[16px] mb-6 max-w-md mx-auto leading-relaxed font-light" style={{ color: "rgba(26, 26, 46, 0.5)", textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
                Slip dresses that drape like a second skin. Flow leggings sculpted for effortless movement. Padded sports bras engineered for support and style.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["D-Slip Dresses", "L-Flow Leggings", "B-Lift Sports Bras"].map((tag) => (
                  <span key={tag} className="px-3 py-1 text-[9px] tracking-[0.15em] uppercase" style={{ color: "rgba(184, 148, 63, 0.6)", background: "rgba(184, 148, 63, 0.06)", border: "1px solid rgba(184, 148, 63, 0.1)", borderRadius: "8px", backdropFilter: "blur(8px)" }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Men's hero */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out"
              style={{
                opacity: activeGender === "men" ? 1 : 0,
                transform: activeGender === "men" ? "translateY(0)" : "translateY(12px)",
                pointerEvents: activeGender === "men" ? "auto" : "none",
              }}
            >
              <p className="text-[10px] tracking-[0.5em] uppercase mb-4 font-medium" style={{ color: "rgba(184, 148, 63, 0.6)" }}>
                ✦ THE MEN'S COLLECTION ✦
              </p>
              <h2 className="text-5xl md:text-7xl mb-3 leading-[1.05] font-light" style={{ fontFamily: "var(--font-display)", color: "#1a1a2e", textShadow: "0 4px 40px rgba(0,0,0,0.5)" }}>
                Built for<br />
                <span className="italic" style={{
                  background: "linear-gradient(90deg, #b8943f, #d4b96a, #b8943f)",
                  backgroundSize: "200% 100%",
                  animation: "gradient-loop 6s ease-in-out infinite",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>Him.</span>
              </h2>
              <p className="text-[14px] md:text-[16px] mb-6 max-w-md mx-auto leading-relaxed font-light" style={{ color: "rgba(26, 26, 46, 0.5)", textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
                Statement jerseys with all-over glitch prints. Athletic shorts cut for performance. Oversized tees with premium hand-feel.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["J-Glitch Jerseys", "S-Glitch Shorts", "T-Icon Tees"].map((tag) => (
                  <span key={tag} className="px-3 py-1 text-[9px] tracking-[0.15em] uppercase" style={{ color: "rgba(184, 148, 63, 0.6)", background: "rgba(184, 148, 63, 0.06)", border: "1px solid rgba(184, 148, 63, 0.1)", borderRadius: "8px", backdropFilter: "blur(8px)" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle + CTA */}
          <div className="relative z-20 flex flex-col items-center gap-6 mt-2">
            <div className="relative flex items-center p-1" style={{ background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(16px)", border: "1px solid rgba(184, 148, 63, 0.1)", borderRadius: "24px" }}>
              <div className="absolute top-1 bottom-1 transition-all duration-400 ease-out" style={{
                left: activeGender === "women" ? "4px" : "calc(50%)",
                width: "calc(50% - 4px)",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #b8943f 0%, #d4b96a 50%, #b8943f 100%)",
                backgroundSize: "200% 100%",
                animation: "gradient-loop 4s ease-in-out infinite",
                boxShadow: "0 0 20px rgba(184, 148, 63, 0.2)",
              }} />
              <button type="button" onClick={() => setActiveGender("women")} className={`relative z-10 px-7 py-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors duration-300 cursor-pointer rounded-full ${activeGender === "women" ? "text-[#FAF8F3]" : "text-[#1a1a2e]/35 hover:text-[#1a1a2e]/60"}`}>HER EDIT</button>
              <button type="button" onClick={() => setActiveGender("men")} className={`relative z-10 px-7 py-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors duration-300 cursor-pointer rounded-full ${activeGender === "men" ? "text-[#FAF8F3]" : "text-[#1a1a2e]/35 hover:text-[#1a1a2e]/60"}`}>HIS EDIT</button>
            </div>
            <Link
              to={`/shop?gender=${activeGender}`}
              className="inline-block px-12 py-3.5 text-[11px] tracking-[0.25em] uppercase font-bold transition-all duration-300 glass-shimmer"
              style={{ background: "linear-gradient(135deg, #b8943f, #d4b96a)", color: "#FAF8F3", border: "1px solid rgba(184, 148, 63, 0.3)", borderRadius: "12px", boxShadow: "0 4px 30px rgba(184, 148, 63, 0.15)" }}
            >
              EXPLORE THE COLLECTION →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WAVE DIVIDER → STATS
          ═══════════════════════════════════════════════════ */}
      <WaveDivider fromColor="#FAF8F3" toColor="#F8F5EE" />

      {/* ═══════════════════════════════════════════════════
          STATS — Impressive numbers (like TERONA's 3.5k / 49k+ / 98%)
          ═══════════════════════════════════════════════════ */}
      <StatsSection />

      {/* ═══════════════════════════════════════════════════
          CRYSTAL CHAIN — draped from stats into spotlights
          ═══════════════════════════════════════════════════ */}
      <CrystalChainDivider />

      {/* ═══════════════════════════════════════════════════
          PRODUCT SPOTLIGHTS
          ═══════════════════════════════════════════════════ */}
      <ProductSpotlights />

      {/* ═══════════════════════════════════════════════════
          WAVE DIVIDER → BRAND STORY
          ═══════════════════════════════════════════════════ */}
      <WaveDivider fromColor="#F5F0E6" toColor="#F8F5EE" />

      {/* ═══════════════════════════════════════════════════
          BRAND STORY — "Made for You" on dark marble
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden bg-warm-marble">
        <div className="diamond-dust" style={{ opacity: 0.5 }} />

        {/* Floating ornaments */}
        <GoldOrnament style={{ top: "10%", left: "5%", opacity: 0.4 }} size={20} />
        <GoldOrnament style={{ bottom: "15%", right: "8%", opacity: 0.3 }} size={16} />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6" style={{ background: "rgba(184, 148, 63, 0.04)", border: "1px solid rgba(184, 148, 63, 0.08)", borderRadius: "10px" }}>
              <span style={{ color: "#b8943f" }}>✦</span>
              <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "#b8943f" }}>COUTURE, REDEFINED</span>
            </div>
            <h2 className="text-4xl md:text-6xl mb-5 font-light" style={{ fontFamily: "var(--font-display)", color: "#1a1a2e" }}>
              Made Exclusively <span className="italic" style={{ color: "#b8943f" }}>for You</span>
            </h2>
            <p className="text-[15px] max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(26, 26, 46, 0.4)" }}>
              Every piece is crafted the moment you order it — not pulled from a shelf.
              That's not fast fashion. That's couture for the modern age.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "You Choose", desc: "Browse our curated collection — every detail obsessed over.", icon: "◇" },
              { step: "02", title: "We Craft", desc: "Your order triggers production. One piece, made just for you.", icon: "✦" },
              { step: "03", title: "You Receive", desc: "Your one-of-a-kind piece arrives — crafted with intention.", icon: "◆" },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-8 transition-all duration-300 hover:translate-y-[-4px] gold-frame"
                style={{
                  background: "rgba(255, 255, 255, 0.5)",
                  border: "1px solid rgba(184, 148, 63, 0.06)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 40px rgba(0, 0, 0, 0.25)",
                }}
              >
                <span className="text-2xl mb-3 block" style={{ color: "rgba(184, 148, 63, 0.5)" }}>{item.icon}</span>
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold" style={{ color: "#b8943f" }}>STEP {item.step}</span>
                <h3 className="text-[17px] font-medium mt-2 mb-3" style={{ fontFamily: "var(--font-display)", color: "#1a1a2e" }}>{item.title}</h3>
                <p className="text-[12px] leading-relaxed" style={{ color: "rgba(26, 26, 46, 0.35)" }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/about" className="text-[11px] tracking-[0.15em] uppercase font-medium transition-colors hover:text-[#d4b96a]" style={{ color: "#b8943f" }}>
              Read Our Story →
            </Link>
          </div>
        </div>
      </section>

      <CrystalDivider />

      {/* ═══════════════════════════════════════════════════
          STYLE ASSISTANT — on dark silk texture
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden bg-warm-silk">
        <GoldOrnament style={{ top: "20%", right: "10%", opacity: 0.3 }} size={18} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8" style={{ background: "rgba(184, 148, 63, 0.04)", border: "1px solid rgba(184, 148, 63, 0.08)", borderRadius: "10px" }}>
            <span style={{ color: "#b8943f" }}>✦</span>
            <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "#b8943f" }}>STYLE ASSISTANT</span>
          </div>
          <h2 className="text-4xl md:text-5xl mb-4 font-light" style={{ fontFamily: "var(--font-display)", color: "#1a1a2e" }}>
            Your Personal <span className="italic" style={{ color: "#b8943f" }}>Style Guide</span>
          </h2>
          <p className="text-[15px] mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(26, 26, 46, 0.4)" }}>
            Our style assistant finds your perfect size, suggests outfit pairings, and provides fabric details — all through a quick conversation. Look for the ✦ icon.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: "◇", label: "Size Finder" },
              { icon: "✦", label: "Style Match" },
              { icon: "◆", label: "Fabric Oracle" },
              { icon: "◇", label: "Order Tracker" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-5 py-3" style={{ background: "rgba(255, 255, 255, 0.5)", border: "1px solid rgba(184, 148, 63, 0.08)", borderRadius: "14px" }}>
                <span style={{ color: "rgba(184, 148, 63, 0.5)", fontSize: "14px" }}>{item.icon}</span>
                <span className="text-[11px] tracking-wider" style={{ color: "rgba(26, 26, 46, 0.45)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WAVE + CRYSTAL CHAIN → TRUST BADGES
          ═══════════════════════════════════════════════════ */}
      <WaveDivider fromColor="#FAF8F3" toColor="#F5F0E6" />

      <section className="py-16 px-6 bg-warm-cream relative">
        <div className="diamond-dust" style={{ opacity: 0.2 }} />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {[
            { icon: "◇", title: "SECURE", desc: "SSL / Stripe" },
            { icon: "✦", title: "FREE SHIP", desc: "Every order" },
            { icon: "◆", title: "TRACKED", desc: "Full tracking" },
            { icon: "◇", title: "RETURNS", desc: "Easy returns" },
          ].map((badge) => (
            <div key={badge.title} className="text-center">
              <span className="text-xl mb-2 block" style={{ color: "rgba(184, 148, 63, 0.4)" }}>{badge.icon}</span>
              <p className="text-[10px] tracking-[0.25em] uppercase font-semibold" style={{ color: "rgba(184, 148, 63, 0.5)" }}>{badge.title}</p>
              <p className="text-[12px] mt-1" style={{ color: "rgba(26, 26, 46, 0.25)" }}>{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
