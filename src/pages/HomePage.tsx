import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { useRef, useState } from "react";
import { SEO, buildOrganizationJsonLd } from "../components/SEO";
import { ClosetHero } from "../components/ClosetHero";
import { DynamicSkyBar } from "../components/DynamicSkyBar";
import { PAGE_SEO } from "../data/seoMeta";
import { api } from "../../convex/_generated/api";
import { mergeLandingContent, type LandingContent } from "../data/landingContent";

function LedStripDivider() {
  return (
    <div className="sky-ribbon" aria-label="Live local weather sky">
      <DynamicSkyBar />
      <div className="sky-ribbon-glass" />
      <div className="sky-ribbon-label">
        <span>LIVE SKY</span>
        <span>LOCAL TIME · LOCAL WEATHER</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PRODUCT CATEGORY CAROUSEL
   ═══════════════════════════════════════════════════════ */
interface CategoryItem {
  name: string;
  baseName: string;
  gender: string;
  gradient: string;
}

const CATEGORIES: CategoryItem[] = [
  { name: "Dresses", baseName: "D-Slip", gender: "women", gradient: "linear-gradient(135deg, #2a1520 0%, #1a0a12 100%)" },
  { name: "Sports Bras", baseName: "B-Lift", gender: "women", gradient: "linear-gradient(135deg, #1a1528 0%, #0a0818 100%)" },
  { name: "Leggings", baseName: "L-Flow", gender: "women", gradient: "linear-gradient(135deg, #1a1a20 0%, #0a0a12 100%)" },
  { name: "Jerseys", baseName: "J-Glitch", gender: "men", gradient: "linear-gradient(135deg, #0a1528 0%, #050a18 100%)" },
  { name: "2.5\" Shorts", baseName: "S-Glitch 2.5", gender: "men", gradient: "linear-gradient(135deg, #0a1820 0%, #050a12 100%)" },
  { name: "6.3\" Shorts", baseName: "S-Glitch 6.3", gender: "men", gradient: "linear-gradient(135deg, #121820 0%, #080a15 100%)" },
  { name: "Oversized Tees", baseName: "T-Icon Oversized", gender: "men", gradient: "linear-gradient(135deg, #1a1520 0%, #0a0812 100%)" },
  { name: "Tie-Dye Tees", baseName: "T-Icon Tie-Dye", gender: "men", gradient: "linear-gradient(135deg, #18101a 0%, #0a0510 100%)" },
];

function CategoryCarousel({ eyebrow }: { eyebrow: string }) {
  const products = useQuery(api.products.list, {}) ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCategoryImage = (baseName: string) => {
    const product = products.find((p) => p.name.startsWith(baseName));
    return product?.images?.[0] ?? "";
  };

  return (
    <section className="category-lucite-section" style={{ background: "#050508", padding: "48px 0 56px" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-8">
        <div className="flex items-center gap-3">
          <span style={{ color: "rgba(184,148,63,0.5)" }}>✦</span>
          <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "rgba(184,148,63,0.6)" }}>{eyebrow}</span>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-12 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
      >
        {CATEGORIES.map((cat) => {
          const img = getCategoryImage(cat.baseName);
          return (
            <Link
              key={cat.baseName}
              to={`/shop?gender=${cat.gender}`}
              className="shrink-0 group"
              style={{ scrollSnapAlign: "start" }}
            >
              <div
                className="relative w-[200px] h-[260px] rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
                style={{
                  background: cat.gradient,
                  border: "1px solid rgba(184,148,63,0.12)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
              >
                {img && (
                  <img
                    src={img}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-[13px] tracking-[0.15em] uppercase font-semibold text-white">{cat.name}</h3>
                  <span className="text-[10px] tracking-wider uppercase mt-1 block" style={{ color: "rgba(184,148,63,0.7)" }}>
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PRODUCT CAROUSEL — Horizontal scrolling product cards
   ═══════════════════════════════════════════════════════ */
function ProductCarousel({ baseName, accentColor }: { baseName: string; accentColor: string }) {
  const products = useQuery(api.products.list, {}) ?? [];
  const filtered = products.filter((p) => p.name.includes(baseName));

  if (filtered.length === 0) return null;

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4 px-1"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {filtered.map((product) => (
        <Link
          key={product._id}
          to={`/product/${product._id}`}
          className="shrink-0 group"
        >
          <div
            className="w-[220px] rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
            style={{
              background: "#0a0a10",
              border: "1px solid rgba(184,148,63,0.08)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <div className="relative h-[280px] overflow-hidden">
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10] via-transparent to-transparent" />
            </div>
            <div className="p-4">
              <h4 className="text-[11px] tracking-[0.1em] uppercase font-medium text-white/80 truncate">{product.name}</h4>
              <p className="text-[12px] mt-1 font-medium" style={{ color: accentColor }}>${((product.price ?? 0) / 100).toFixed(0)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   B-LIFT SPORTS BRA MOMENT — Feature cards + product busts
   ═══════════════════════════════════════════════════════ */
function BraSpotlight({ content }: { content: LandingContent["bra"] }) {
  return (
    <section className="closet-section closet-section-women relative overflow-hidden" style={{ background: "#050508" }}>
      <div className="closet-section-sign closet-section-sign-women" aria-hidden="true">
        <strong>11</strong>
        <span>{"// ILLUMINATION"}</span>
      </div>
      <style>{`
        @keyframes bra-glow-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(184,148,63,0.06), inset 0 0 60px rgba(184,148,63,0.03); }
          50% { box-shadow: 0 0 80px rgba(184,148,63,0.12), inset 0 0 80px rgba(184,148,63,0.06); }
        }
        @keyframes bra-shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .bra-feature-card {
          background: rgba(184,148,63,0.04);
          border: 1px solid rgba(184,148,63,0.1);
          border-radius: 16px;
          padding: 20px 16px;
          text-align: center;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.4s ease;
          animation: bra-glow-pulse 4s ease-in-out infinite;
        }
        .bra-feature-card:hover {
          border-color: rgba(184,148,63,0.35);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(184,148,63,0.12);
        }
        .bra-divider-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(184,148,63,0.25), transparent);
          animation: bra-shimmer 3s ease-in-out infinite;
        }
      `}</style>

      <div className="bra-divider-line" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-5" style={{ background: "rgba(184,148,63,0.08)", border: "1px solid rgba(184,148,63,0.18)", borderRadius: "40px" }}>
            <span style={{ color: "rgba(184,148,63,0.8)", fontSize: 10 }}>✦</span>
            <span className="text-[10px] tracking-[0.35em] uppercase font-semibold" style={{ color: "rgba(184,148,63,0.8)" }}>{content.eyebrow}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-light mb-4" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
            {content.title} <span className="italic" style={{ background: "linear-gradient(135deg, rgba(184,148,63,1), rgba(220,190,100,0.9))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{content.accent}</span>
          </h2>
          <p className="text-[15px] max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
            {content.description}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: "◎", label: "Removable Cups", desc: "Customize your coverage" },
            { icon: "❋", label: "4-Way Stretch", desc: "Unrestricted movement" },
            { icon: "◈", label: "Moisture-Wicking", desc: "Stay cool under pressure" },
            { icon: "✧", label: "Adjustable Fit", desc: "Your shape, your way" },
          ].map((f) => (
            <div key={f.label} className="bra-feature-card">
              <span className="text-2xl block mb-2" style={{ color: "rgba(184,148,63,0.7)" }}>{f.icon}</span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold block mb-1" style={{ color: "rgba(255,255,255,0.8)" }}>{f.label}</span>
              <span className="text-[11px] block" style={{ color: "rgba(255,255,255,0.35)" }}>{f.desc}</span>
            </div>
          ))}
        </div>

        {/* Product Busts Carousel */}
        <ProductCarousel baseName="B-Lift" accentColor="rgba(184,148,63,0.7)" />

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/shop?gender=women"
            className="inline-block px-10 py-4 text-[11px] tracking-[0.25em] uppercase font-bold transition-all duration-300 hover:translate-y-[-3px]"
            style={{
              background: "linear-gradient(135deg, rgba(184,148,63,0.2), rgba(184,148,63,0.1))",
              border: "1px solid rgba(184,148,63,0.35)",
              borderRadius: "10px",
              color: "rgba(184,148,63,1)",
              boxShadow: "0 4px 24px rgba(184,148,63,0.1)",
            }}
          >
            Shop B-Lift Collection →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   S-GLITCH SHORTS MOMENT — Feature cards + product busts
   ═══════════════════════════════════════════════════════ */
function ShortsSpotlight({ content }: { content: LandingContent["shorts"] }) {
  return (
    <section className="closet-section closet-section-men relative overflow-hidden" style={{ background: "#060610" }}>
      <div className="closet-section-sign closet-section-sign-men" aria-hidden="true">
        <strong>16</strong>
        <span>{"// REINVENTION"}</span>
      </div>
      <style>{`
        @keyframes shorts-glow-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(100,160,255,0.06), inset 0 0 60px rgba(100,160,255,0.03); }
          50% { box-shadow: 0 0 80px rgba(100,160,255,0.12), inset 0 0 80px rgba(100,160,255,0.06); }
        }
        .shorts-feature-card {
          background: rgba(100,160,255,0.04);
          border: 1px solid rgba(100,160,255,0.1);
          border-radius: 16px;
          padding: 20px 16px;
          text-align: center;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.4s ease;
          animation: shorts-glow-pulse 4s ease-in-out infinite;
        }
        .shorts-feature-card:hover {
          border-color: rgba(100,160,255,0.35);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(100,160,255,0.12);
        }
      `}</style>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(100,160,255,0.25), transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-5" style={{ background: "rgba(100,160,255,0.08)", border: "1px solid rgba(100,160,255,0.18)", borderRadius: "40px" }}>
            <span style={{ color: "rgba(100,160,255,0.8)", fontSize: 10 }}>✦</span>
            <span className="text-[10px] tracking-[0.35em] uppercase font-semibold" style={{ color: "rgba(100,160,255,0.8)" }}>{content.eyebrow}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-light mb-4" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
            {content.title} <span className="italic" style={{ background: "linear-gradient(135deg, rgba(100,160,255,1), rgba(140,200,255,0.9))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{content.accent}</span>
          </h2>
          <p className="text-[15px] max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
            {content.description}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: "☀", label: "SPF UV Protection", desc: "Built into the fabric" },
            { icon: "◈", label: "Quick-Dry Fabric", desc: "Stay cool, stay dry" },
            { icon: "⟷", label: "2 Inseam Options", desc: "2.5\" or 6.3\" cut" },
            { icon: "◉", label: "6 Colors", desc: "Match your style" },
          ].map((f) => (
            <div key={f.label} className="shorts-feature-card">
              <span className="text-2xl block mb-2" style={{ color: "rgba(100,160,255,0.7)" }}>{f.icon}</span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold block mb-1" style={{ color: "rgba(255,255,255,0.8)" }}>{f.label}</span>
              <span className="text-[11px] block" style={{ color: "rgba(255,255,255,0.35)" }}>{f.desc}</span>
            </div>
          ))}
        </div>

        {/* Product Carousels by inseam */}
        <div className="mb-8">
          <h3 className="text-[11px] tracking-[0.2em] uppercase font-medium mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>2.5" Inseam</h3>
          <ProductCarousel baseName='S-Glitch 2.5' accentColor="rgba(100,160,255,0.7)" />
        </div>
        <div className="mb-8">
          <h3 className="text-[11px] tracking-[0.2em] uppercase font-medium mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>6.3" Inseam</h3>
          <ProductCarousel baseName="S-Glitch 6.3" accentColor="rgba(100,160,255,0.7)" />
        </div>

        {/* CTA */}
        <div className="text-center mt-6">
          <Link
            to="/shop?gender=men"
            className="inline-block px-10 py-4 text-[11px] tracking-[0.25em] uppercase font-bold transition-all duration-300 hover:translate-y-[-3px]"
            style={{
              background: "linear-gradient(135deg, rgba(100,160,255,0.2), rgba(100,160,255,0.1))",
              border: "1px solid rgba(100,160,255,0.35)",
              borderRadius: "10px",
              color: "rgba(100,160,255,1)",
              boxShadow: "0 4px 24px rgba(100,160,255,0.1)",
            }}
          >
            Shop S-Glitch Collection →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   HOW IT WORKS — Photo-driven steps
   ═══════════════════════════════════════════════════════ */
function HowItWorks({ content }: { content: LandingContent["howItWorks"] }) {
  return (
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: "#fafafa" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6" style={{ background: "rgba(184,148,63,0.04)", border: "1px solid rgba(184,148,63,0.1)", borderRadius: "10px" }}>
            <span style={{ color: "rgba(184,148,63,0.6)" }}>✦</span>
            <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "rgba(184,148,63,0.6)" }}>{content.eyebrow}</span>
          </div>
          <h2 className="text-4xl md:text-5xl mb-5 font-light" style={{ fontFamily: "var(--font-display)", color: "#1a1a2e" }}>
            {content.title} <span className="italic" style={{ color: "rgba(184,148,63,0.8)" }}>{content.accent}</span>
          </h2>
          <p className="text-[15px] max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(26, 26, 46, 0.4)" }}>
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "You Choose",
              desc: "Browse our curated collection — every detail obsessed over.",
              icon: "◇",
              imgStyle: {
                background: "linear-gradient(135deg, #1a1528 0%, #0a0818 60%)",
              },
              visual: (
                <div className="relative h-[180px] rounded-xl overflow-hidden mb-5" style={{ background: "linear-gradient(135deg, #1a1528 0%, #0a0818 60%)" }}>
                  <img src="/store-panoramic.jpg" alt="Browse" className="w-full h-full object-cover opacity-60" style={{ objectPosition: "center 40%" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[28px] font-bold" style={{ color: "rgba(184,148,63,0.3)", fontFamily: "var(--font-display)" }}>01</span>
                  </div>
                </div>
              ),
            },
            {
              step: "02",
              title: "We Craft",
              desc: "Your order triggers production. One piece, made just for you.",
              icon: "✦",
              visual: (
                <div className="relative h-[180px] rounded-xl overflow-hidden mb-5" style={{ background: "linear-gradient(135deg, #1a1a20 0%, #0a0a12 60%)" }}>
                  <img src="/steps-lifestyle.jpg" alt="Crafted" className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[28px] font-bold" style={{ color: "rgba(184,148,63,0.3)", fontFamily: "var(--font-display)" }}>02</span>
                  </div>
                </div>
              ),
            },
            {
              step: "03",
              title: "You Receive",
              desc: "Your one-of-a-kind piece arrives — crafted with intention.",
              icon: "◆",
              visual: (
                <div className="relative h-[180px] rounded-xl overflow-hidden mb-5" style={{ background: "linear-gradient(135deg, #18151a 0%, #0a0812 60%)" }}>
                  <img src="/bra-closet-moment.jpg" alt="Receive" className="w-full h-full object-cover opacity-60" style={{ objectPosition: "center 60%" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[28px] font-bold" style={{ color: "rgba(184,148,63,0.3)", fontFamily: "var(--font-display)" }}>03</span>
                  </div>
                </div>
              ),
            },
          ].map((item) => (
            <div
              key={item.step}
              className="text-center transition-all duration-300 hover:translate-y-[-4px]"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                border: "1px solid rgba(184,148,63,0.08)",
                borderRadius: "16px",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
                overflow: "hidden",
                padding: "8px 8px 24px",
              }}
            >
              {item.visual}
              <h3 className="text-[17px] font-medium mb-3" style={{ fontFamily: "var(--font-display)", color: "#1a1a2e" }}>{item.title}</h3>
              <p className="text-[12px] leading-relaxed px-4" style={{ color: "rgba(26, 26, 46, 0.35)" }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/about" className="text-[11px] tracking-[0.15em] uppercase font-medium transition-colors hover:opacity-80" style={{ color: "rgba(184,148,63,0.7)" }}>
            Read Our Story →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   NEWSLETTER / CRM SECTION
   ═══════════════════════════════════════════════════════ */
function NewsletterSection({ content }: { content: LandingContent["newsletter"] }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await subscribe({ email });
      } catch (_) { /* ignore */ }
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="newsletter-lucite-section relative py-20 px-6 overflow-hidden" style={{ background: "#050508" }}>
      <div className="absolute inset-0 opacity-30">
        <img src="/store-panoramic.jpg" alt="" className="w-full h-full object-cover" style={{ filter: "blur(20px) brightness(0.3)" }} />
      </div>
      <div className="max-w-xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6" style={{ background: "rgba(184,148,63,0.06)", border: "1px solid rgba(184,148,63,0.12)", borderRadius: "10px" }}>
          <span style={{ color: "rgba(184,148,63,0.6)" }}>✦</span>
          <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "rgba(184,148,63,0.6)" }}>{content.eyebrow}</span>
        </div>
        <h2 className="text-3xl md:text-4xl mb-4 font-light" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
          {content.title} <span className="italic" style={{ color: "rgba(184,148,63,0.85)" }}>{content.accent}</span>
        </h2>
        <p className="text-[14px] mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
          {content.description}
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl" style={{ background: "rgba(184,148,63,0.1)", border: "1px solid rgba(184,148,63,0.2)" }}>
            <p className="text-[13px]" style={{ color: "rgba(184,148,63,0.9)" }}>{content.success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-3 text-[13px] rounded-lg outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(184,148,63,0.15)",
                color: "#fff",
              }}
            />
            <button
              type="submit"
              className="px-6 py-3 text-[10px] tracking-[0.2em] uppercase font-semibold rounded-lg transition-all hover:translate-y-[-1px]"
              style={{
                background: "linear-gradient(135deg, rgba(184,148,63,0.3), rgba(184,148,63,0.15))",
                border: "1px solid rgba(184,148,63,0.3)",
                color: "rgba(184,148,63,0.9)",
              }}
            >
              {content.button}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TRUST BADGES
   ═══════════════════════════════════════════════════════ */
function TrustBadges() {
  return (
    <section className="py-16 px-6" style={{ background: "#fafafa" }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { icon: "◇", title: "SECURE", desc: "SSL / Stripe" },
          { icon: "✦", title: "FREE SHIP", desc: "Every order" },
          { icon: "◆", title: "TRACKED", desc: "Full tracking" },
          { icon: "◇", title: "RETURNS", desc: "Easy returns" },
        ].map((badge) => (
          <div key={badge.title} className="text-center">
            <span className="text-xl mb-2 block" style={{ color: "rgba(184,148,63,0.35)" }}>{badge.icon}</span>
            <p className="text-[10px] tracking-[0.25em] uppercase font-semibold" style={{ color: "rgba(184,148,63,0.5)" }}>{badge.title}</p>
            <p className="text-[12px] mt-1" style={{ color: "rgba(26, 26, 46, 0.25)" }}>{badge.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════ */
export function HomePage() {
  // NOTE: landing content is served from static defaults until the site-content
  // store is live on the new backend. Querying an undeployed backend function
  // here white-screened the whole homepage.
  const content = mergeLandingContent(undefined);
  return (
    <>
      <SEO
        description={PAGE_SEO.home.description}
        url="/"
        jsonLd={buildOrganizationJsonLd()}
      />
      <div className="home-lucite">
        {/* ── CLOSET HERO — Split-screen showroom ── */}
        <ClosetHero content={content.hero} />

        {/* ── LED Strip Divider ── */}
        <LedStripDivider />

        {/* ── Product Categories ── */}
        {content.categories.visible && <CategoryCarousel eyebrow={content.categories.eyebrow} />}

        {/* ── B-Lift Sports Bra Moment ── */}
        {content.bra.visible && <BraSpotlight content={content.bra} />}

        {/* ── S-Glitch Shorts Moment ── */}
        {content.shorts.visible && <ShortsSpotlight content={content.shorts} />}

        {/* ── How It Works — Photo-driven ── */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(184,148,63,0.08), transparent)" }} />
        {content.howItWorks.visible && <HowItWorks content={content.howItWorks} />}

        {/* ── Newsletter / CRM ── */}
        {content.newsletter.visible && <NewsletterSection content={content.newsletter} />}

        {/* ── Trust Badges ── */}
        {content.trust.visible && <TrustBadges />}
      </div>
    </>
  );
}
