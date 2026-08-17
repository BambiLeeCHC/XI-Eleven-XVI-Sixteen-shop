import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { useEffect, useRef, useState } from "react";

/* ─── CSS Keyframes (injected once) ──────────────────────────────────── */
const styleId = "about-page-animations";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @keyframes about-float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(1deg); }
    }
    @keyframes about-pulse-glow {
      0%, 100% { opacity: 0.45; filter: blur(50px); transform: scale(1); }
      50% { opacity: 0.85; filter: blur(80px); transform: scale(1.25); }
    }
    @keyframes about-entrance {
      0% { opacity: 0; transform: translateY(46px) scale(0.92); filter: blur(10px); }
      60% { filter: blur(0px); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
    }
    @keyframes about-entrance-side-l {
      0% { opacity: 0; transform: translateX(-60px) scale(0.9); filter: blur(8px); }
      100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
    }
    @keyframes about-entrance-side-r {
      0% { opacity: 0; transform: translateX(60px) scale(0.9); filter: blur(8px); }
      100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
    }
    @keyframes about-grain-drift {
      0%, 100% { transform: translate(0,0); }
      50% { transform: translate(-2%, -1%); }
    }
    @keyframes about-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes about-flash {
      0%, 85%, 100% { opacity: 1; text-shadow: none; }
      88% { opacity: 0.85; text-shadow: 0 0 28px rgba(176,38,255,0.95), 0 0 56px rgba(176,38,255,0.55); }
      92% { opacity: 1; text-shadow: 0 0 42px rgba(255,46,107,0.95), 0 0 84px rgba(255,46,107,0.45); }
      96% { opacity: 0.92; text-shadow: 0 0 22px rgba(255,184,51,0.8); }
    }
    @keyframes about-flash-alt {
      0%, 80%, 100% { opacity: 1; text-shadow: none; }
      84% { opacity: 0.75; text-shadow: 0 0 32px rgba(255,46,107,1), 0 0 64px rgba(255,46,107,0.55); }
      89% { opacity: 1; text-shadow: 0 0 28px rgba(176,38,255,0.9); }
      94% { opacity: 0.9; text-shadow: 0 0 46px rgba(255,184,51,0.95), 0 0 92px rgba(255,184,51,0.4); }
    }
    @keyframes about-glow-breathe {
      0%, 100% { box-shadow: 0 0 44px rgba(176,38,255,0.18), inset 0 0 44px rgba(176,38,255,0.07); }
      50% { box-shadow: 0 0 80px rgba(176,38,255,0.24), inset 0 0 80px rgba(176,38,255,0.14); }
    }
    @keyframes about-sparkle {
      0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
      50% { opacity: 1; transform: scale(1) rotate(180deg); }
    }
    @keyframes about-line-expand {
      0% { width: 0; opacity: 0; }
      100% { width: 100%; opacity: 1; }
    }
    @keyframes about-count-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes about-orbit {
      0% { transform: rotate(0deg) translateX(180px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
    }
    @keyframes about-orbit-2 {
      0% { transform: rotate(120deg) translateX(135px) rotate(-120deg); }
      100% { transform: rotate(480deg) translateX(135px) rotate(-480deg); }
    }
    @keyframes about-orbit-3 {
      0% { transform: rotate(240deg) translateX(225px) rotate(-240deg); }
      100% { transform: rotate(600deg) translateX(225px) rotate(-600deg); }
    }
    @keyframes about-orbit-4 {
      0% { transform: rotate(60deg) translateX(280px) rotate(-60deg); }
      100% { transform: rotate(-300deg) translateX(280px) rotate(300deg); }
    }
    @keyframes about-reveal {
      0% { opacity: 0; transform: translateY(30px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes about-logo-glow {
      0%, 100% { filter: drop-shadow(0 0 15px rgba(176,38,255,0.15)) drop-shadow(0 0 30px rgba(255,184,51,0.176)); }
      50% { filter: drop-shadow(0 0 25px rgba(176,38,255,0.3)) drop-shadow(0 0 50px rgba(255,184,51,0.15)); }
    }
  `;
  document.head.appendChild(style);
}

/* ─── Flash Text Component ───────────────────────────────────────────── */
function FlashText({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "alt" | "gold";
  className?: string;
}) {
  const gradients = {
    primary: "linear-gradient(90deg, #b026ff, #d896ff, #fff, #d896ff, #b026ff)",
    alt: "linear-gradient(90deg, #ff2e6b, #ff7fa3, #fff, #ff7fa3, #ff2e6b)",
    gold: "linear-gradient(90deg, #ffb833, #ffd166, #fff, #ffd166, #ffb833)",
  };
  const animations = {
    primary: "about-flash 4s ease-in-out infinite",
    alt: "about-flash-alt 5s ease-in-out infinite 1s",
    gold: "about-flash 6s ease-in-out infinite 2s",
  };
  return (
    <span
      className={className}
      style={{
        background: gradients[variant],
        backgroundSize: "200% 100%",
        animation: `${animations[variant]}, about-shimmer 3s linear infinite`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

/* ─── Scroll Reveal Hook ─────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({ children, className = "", style = {} }: any) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Floating Sparkles ──────────────────────────────────────────────── */
function Sparkles() {
  const sparkles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${5 + Math.random() * 90}%`,
    top: `${5 + Math.random() * 90}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${1.6 + Math.random() * 3}s`,
    size: 3 + Math.random() * 7,
  }));
  return (
    <>
      {sparkles.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "rgba(255,184,51,0.8)",
            animation: `about-sparkle ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export function AboutPage() {
  return (
    <>
      <SEO
        title="About — XI Eleven XVI Sixteen"
        description="Discover the vision behind XI Eleven XVI Sixteen — luxury fashion made exclusively for you, rooted in numerology, sustainability, and uncompromising quality."
        url="/about"
      />
      <div className="min-h-screen">
        {/* ── Hero with Logo ── */}
        <section className="relative py-24 md:py-32 px-6 overflow-hidden">
          {/* Ambient background orbs */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(36,139,212,0.176) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255,180,170,0.11) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(255,184,51,0.066) 0%, transparent 40%), #0e0a0f",
            }}
          />
          {/* Orbiting decorative elements */}
          <div className="absolute inset-0 pointer-events-none" style={{ overflow: "hidden" }}>
            <div
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "rgba(176,38,255,0.5)",
                animation: "about-orbit 20s linear infinite",
              }}
            />
            <div
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "rgba(255,46,107,0.4)",
                animation: "about-orbit-2 15s linear infinite",
              }}
            />
            <div
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                width: 2,
                height: 2,
                borderRadius: "50%",
                background: "rgba(255,184,51,0.5)",
                animation: "about-orbit-3 25s linear infinite",
              }}
            />
            <div
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "rgba(176,38,255,0.35)",
                animation: "about-orbit-4 32s linear infinite",
              }}
            />
          </div>
          <Sparkles />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Brand Logo */}
            <div
              className="mx-auto mb-8"
              style={{
                width: 100,
                height: 138,
                animation:
                  "about-entrance 1s cubic-bezier(0.16,1,0.3,1) both, about-float 6s ease-in-out infinite 1s, about-logo-glow 4s ease-in-out infinite",
              }}
            >
              <img
                src="/brand-logo.png"
                alt="XI XVI Eleven Sixteen"
                className="w-full h-full object-contain"
              />
            </div>

            <p
              className="text-[10px] tracking-[0.5em] uppercase mb-5 font-medium"
              style={{ color: "rgba(200,160,220,0.65)", animation: "about-entrance 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}
            >
              OUR STORY
            </p>
            <h1
              className="text-4xl md:text-6xl text-white mb-6 font-light leading-[1.1]"
              style={{ fontFamily: "var(--font-display)", animation: "about-entrance 1s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}
            >
              Crafted with{" "}
              <FlashText variant="primary">
                <span className="italic text-4xl md:text-6xl" style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}>
                  Purpose.
                </span>
              </FlashText>
            </h1>
            <p
              className="text-[14px] md:text-[16px] leading-relaxed max-w-xl mx-auto"
              style={{ color: "rgba(222,216,235,0.7)", animation: "about-entrance 1s cubic-bezier(0.16,1,0.3,1) 0.45s both" }}
            >
              XI Eleven XVI Sixteen is a{" "}
              <FlashText variant="gold">luxury fashion house</FlashText>{" "}
              built on a radical idea: every piece should be made{" "}
              <FlashText variant="alt">exclusively for you</FlashText>.
              No mass production. No overstock. No waste. Just{" "}
              <FlashText variant="primary">intentional design</FlashText>,
              crafted on demand.
            </p>

            {/* Decorative divider */}
            <div
              className="flex items-center justify-center gap-3 mt-10"
              style={{ animation: "about-entrance 0.9s cubic-bezier(0.16,1,0.3,1) 0.6s both" }}
            >
              <div style={{ width: 40, height: 1, background: "linear-gradient(90deg, transparent, rgba(176,38,255,0.4))" }} />
              <span style={{ color: "rgba(176,38,255,0.5)", fontSize: 10 }}>✦</span>
              <div style={{ width: 40, height: 1, background: "linear-gradient(90deg, rgba(176,38,255,0.4), transparent)" }} />
            </div>
          </div>
        </section>

        {/* ── Made for You ── */}
        <section
          className="py-20 px-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(#0e0a0f, #140e18 40%, #0e0a0f 100%)",
            borderTop: "1px solid rgba(92,155,205,0.15)",
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute"
            style={{
              top: "30%",
              left: "20%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(176,38,255,0.088)",
              animation: "about-pulse-glow 8s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <RevealSection className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-6"
                style={{
                  background: "rgba(36,139,212,0.11)",
                  border: "1px solid rgba(36,139,212,0.12)",
                  borderRadius: "10px",
                }}
              >
                <span style={{ color: "#248bd4" }}>✦</span>
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
                Made <FlashText variant="alt">Exclusively</FlashText> for You
              </h2>
              <p
                className="text-[14px] max-w-2xl mx-auto leading-relaxed"
                style={{ color: "rgba(222,216,235,0.58)" }}
              >
                When you place an order with XI · XVI, something{" "}
                <FlashText variant="gold">extraordinary</FlashText>{" "}
                happens. Your piece doesn't exist yet — it comes to life the
                moment you choose it. That's not fast fashion. That's{" "}
                <FlashText variant="primary">couture for the modern age</FlashText>.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "You Choose",
                  icon: "🔍",
                  desc: "Browse our curated collection and select the piece that speaks to you. Every detail — from the fabric composition to the fit — has been obsessed over.",
                  delay: "0s",
                },
                {
                  step: "02",
                  title: "We Craft",
                  icon: "✂️",
                  desc: "Your order triggers production. A single piece, made just for you, with premium materials and precision printing. No warehouse shelf. No mass run.",
                  delay: "0.15s",
                },
                {
                  step: "03",
                  title: "You Receive",
                  icon: "📦",
                  desc: "Your one-of-a-kind piece arrives at your door — exactly as designed, crafted with intention, and yours alone. That's the XI · XVI promise.",
                  delay: "0.3s",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-6 text-center group"
                  style={{
                    background: "rgba(255,240,230,0.044)",
                    border: "1px solid rgba(92,155,205,0.15)",
                    borderRadius: "16px",
                    animation: `about-entrance 0.8s cubic-bezier(0.16,1,0.3,1) ${item.delay} both, about-glow-breathe 6s ease-in-out infinite ${item.delay}`,
                    transition: "border-color 0.4s, background 0.4s, transform 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(176,38,255,0.2)";
                    e.currentTarget.style.background = "rgba(36,139,212,0.088)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(92,155,205,0.15)";
                    e.currentTarget.style.background = "rgba(255,240,230,0.044)";
                  }}
                >
                  <span className="text-2xl block mb-3">{item.icon}</span>
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase font-bold"
                    style={{ color: "rgba(36,139,212,0.65)" }}
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
                    style={{ color: "rgba(222,216,235,0.52)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </RevealSection>
        </section>

        {/* ── Sustainability ── */}
        <section
          className="py-20 px-6 relative overflow-hidden"
          style={{
            background: "#0e0a0f",
            borderTop: "1px solid rgba(92,155,205,0.15)",
          }}
        >
          <div
            className="absolute"
            style={{
              top: "20%",
              right: "10%",
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: "rgba(100,220,180,0.066)",
              animation: "about-pulse-glow 10s ease-in-out infinite 2s",
              pointerEvents: "none",
            }}
          />
          <RevealSection className="max-w-3xl mx-auto text-center relative z-10">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div style={{ width: 30, height: 1, background: "linear-gradient(90deg, transparent, rgba(100,220,180,0.3))" }} />
              <span style={{ fontSize: 16 }}>♻️</span>
              <div style={{ width: 30, height: 1, background: "linear-gradient(90deg, rgba(100,220,180,0.3), transparent)" }} />
            </div>
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
              <FlashText variant="primary">Zero Waste</FlashText> by Design
            </h2>
            <p
              className="text-[14px] leading-relaxed mb-10"
              style={{ color: "rgba(222,216,235,0.58)" }}
            >
              The fashion industry produces over{" "}
              <FlashText variant="alt">92 million tons</FlashText>{" "}
              of textile waste per year. We believe luxury and responsibility aren't at odds —
              they're <FlashText variant="gold">inseparable</FlashText>.
              Our made-to-order model means nothing is produced until it's already yours.
              Zero unsold inventory. Zero landfill waste. Every piece has a{" "}
              <FlashText variant="primary">purpose</FlashText>{" "}
              from the moment it's created.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { number: "0", label: "Unsold inventory" },
                { number: "0", label: "Textile waste" },
                { number: "100%", label: "On-demand production" },
                { number: "∞", label: "Intentional design" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{ animation: `about-count-pulse 3s ease-in-out infinite ${i * 0.5}s` }}
                >
                  <p
                    className="text-3xl font-light text-white mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      background: "linear-gradient(135deg, #248bd4, #55bfff)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stat.number}
                  </p>
                  <p
                    className="text-[10px] tracking-[0.1em] uppercase"
                    style={{ color: "rgba(222,216,235,0.5)" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </RevealSection>
        </section>

        {/* ── Numerology: 11 & 16 ── */}
        <section
          className="py-20 px-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(#0e0a0f, #140e18 40%, #0e0a0f 100%)",
            borderTop: "1px solid rgba(92,155,205,0.15)",
          }}
        >
          <Sparkles />
          {/* Large ambient "11 16" watermark */}
          <div
            className="absolute pointer-events-none select-none"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "clamp(120px, 25vw, 300px)",
              fontFamily: "var(--font-display)",
              fontWeight: 200,
              letterSpacing: "0.1em",
              color: "rgba(200,140,255,0.033)",
              whiteSpace: "nowrap",
            }}
          >
            11 · 16
          </div>

          <RevealSection className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <p
                className="text-[10px] tracking-[0.5em] uppercase mb-5 font-medium"
                style={{ color: "rgba(245,200,170,0.55)" }}
              >
                THE MEANING BEHIND THE NAME
              </p>
              <h2
                className="text-3xl md:text-5xl text-white mb-4 font-light"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <FlashText variant="primary">XI</FlashText>
                <span style={{ color: "rgba(222,216,235,0.32)", margin: "0 12px" }}>·</span>
                <FlashText variant="alt">XVI</FlashText>
              </h2>
              <p
                className="text-[14px] max-w-xl mx-auto leading-relaxed"
                style={{ color: "rgba(222,216,235,0.58)" }}
              >
                Our name is a cipher — rooted in{" "}
                <FlashText variant="gold">numerology</FlashText>,
                encoded with intention. The numbers 11 and 16 carry deep{" "}
                <FlashText variant="primary">spiritual</FlashText> and{" "}
                <FlashText variant="alt">creative</FlashText>{" "}
                significance that shapes every facet of this brand.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 11 */}
              <div
                className="p-8 relative overflow-hidden"
                style={{
                  background: "rgba(36,139,212,0.066)",
                  border: "1px solid rgba(36,139,212,0.176)",
                  borderRadius: "20px",
                  animation: "about-glow-breathe 6s ease-in-out infinite",
                }}
              >
                {/* Corner accent */}
                <div
                  className="absolute top-0 right-0"
                  style={{
                    width: 80,
                    height: 80,
                    background: "radial-gradient(circle at top right, rgba(176,38,255,0.176), transparent 70%)",
                  }}
                />
                <h3
                  className="text-5xl font-light text-white mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "linear-gradient(135deg, #b026ff, #d896ff)",
                    backgroundSize: "200% 100%",
                    animation: "about-shimmer 4s linear infinite",
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
                  style={{ color: "rgba(222,216,235,0.6)" }}
                >
                  In numerology, 11 is a{" "}
                  <FlashText variant="primary">Master Number</FlashText>{" "}
                  — the symbol of{" "}
                  <FlashText variant="gold">spiritual awakening</FlashText>,
                  heightened intuition, and visionary creativity. It represents the bridge between the
                  conscious and the divine, the ability to see beyond surface
                  appearance and perceive the{" "}
                  <FlashText variant="alt">extraordinary</FlashText>{" "}
                  in the everyday.
                  Eleven embodies illumination, inspiration, and the courage to
                  lead through{" "}
                  <FlashText variant="primary">authenticity</FlashText>{" "}
                  rather than conformity.
                </p>
              </div>

              {/* 16 */}
              <div
                className="p-8 relative overflow-hidden"
                style={{
                  background: "rgba(255,180,170,0.066)",
                  border: "1px solid rgba(255,180,170,0.176)",
                  borderRadius: "20px",
                  animation: "about-glow-breathe 6s ease-in-out infinite 3s",
                }}
              >
                <div
                  className="absolute top-0 right-0"
                  style={{
                    width: 80,
                    height: 80,
                    background: "radial-gradient(circle at top right, rgba(85,191,255,0.176), transparent 70%)",
                  }}
                />
                <h3
                  className="text-5xl font-light text-white mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "linear-gradient(135deg, #ff2e6b, #ffb833)",
                    backgroundSize: "200% 100%",
                    animation: "about-shimmer 4s linear infinite 1s",
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
                  style={{ color: "rgba(222,216,235,0.6)" }}
                >
                  The number 16 carries the vibration of{" "}
                  <FlashText variant="alt">transformation</FlashText> and{" "}
                  <FlashText variant="gold">rebirth</FlashText>.
                  In numerological tradition, 16 (1 + 6 = 7) channels the
                  energy of introspection, wisdom, and{" "}
                  <FlashText variant="primary">spiritual depth</FlashText>.
                  It represents the shattering of the old to make way for what's
                  truly authentic — tearing down convention and building
                  something real from the foundation up. Sixteen is the{" "}
                  <FlashText variant="alt">architect of reinvention</FlashText>.
                </p>
              </div>
            </div>

            {/* Together = 9 */}
            <div
              className="mt-10 p-8 text-center relative overflow-hidden"
              style={{
                background: "rgba(255,240,230,0.044)",
                border: "1px solid rgba(92,155,205,0.15)",
                borderRadius: "20px",
              }}
            >
              {/* Decorative lines */}
              <div className="flex items-center justify-center gap-4 mb-5">
                <div style={{ width: 50, height: 1, background: "linear-gradient(90deg, transparent, rgba(176,38,255,0.3))" }} />
                <span
                  className="text-2xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "linear-gradient(135deg, #b026ff, #ff2e6b, #ffb833)",
                    backgroundSize: "200% 100%",
                    animation: "about-shimmer 3s linear infinite",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: 300,
                  }}
                >
                  9
                </span>
                <div style={{ width: 50, height: 1, background: "linear-gradient(90deg, rgba(255,46,107,0.3), transparent)" }} />
              </div>
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-4 font-semibold"
                style={{ color: "rgba(245,200,170,0.5)" }}
              >
                TOGETHER: 11 + 16 = 27 → 2 + 7 = 9
              </p>
              <p
                className="text-[14px] leading-relaxed max-w-2xl mx-auto"
                style={{ color: "rgba(222,216,235,0.6)" }}
              >
                The sum of our name reduces to{" "}
                <FlashText variant="gold">9</FlashText> —
                the number of{" "}
                <FlashText variant="primary">completion</FlashText>,
                humanitarianism, and{" "}
                <FlashText variant="alt">universal love</FlashText>.
                It represents the culmination of all cycles, a soul that has
                gathered wisdom from every experience. For us, it means fashion
                that serves a{" "}
                <FlashText variant="gold">higher purpose</FlashText>:
                self-expression that uplifts, sustainability that protects, and
                craftsmanship that honors both the wearer and the world.
              </p>
            </div>
          </RevealSection>
        </section>

        {/* ── Core Values ── */}
        <section
          className="py-20 px-6 relative"
          style={{
            background: "#0e0a0f",
            borderTop: "1px solid rgba(92,155,205,0.15)",
          }}
        >
          <RevealSection className="max-w-4xl mx-auto">
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
                Our <FlashText variant="gold">Values</FlashText>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "✦",
                  title: "Intentional Design",
                  flashWord: "Intentional",
                  variant: "primary" as const,
                  desc: "Every stitch, every print, every silhouette is deliberate. We don't follow trends — we design with precision and meaning.",
                },
                {
                  icon: "♻️",
                  title: "Radical Sustainability",
                  flashWord: "Radical",
                  variant: "alt" as const,
                  desc: "Made-to-order production eliminates waste before it begins. No overruns. No dead stock. No contribution to the 92M tons of textile waste the industry produces annually.",
                },
                {
                  icon: "🪡",
                  title: "Couture Accessibility",
                  flashWord: "Couture",
                  variant: "gold" as const,
                  desc: "The couture concept — a piece made exclusively for you — shouldn't be reserved for the ultra-wealthy. We democratize that experience without compromising quality.",
                },
                {
                  icon: "🔮",
                  title: "Spiritual Grounding",
                  flashWord: "Spiritual",
                  variant: "primary" as const,
                  desc: "From our numerological foundation to our design philosophy, we believe fashion can be a vehicle for self-expression, transformation, and personal power.",
                },
              ].map((value, _i) => (
                <div
                  key={value.title}
                  className="flex gap-4 p-6 group"
                  style={{
                    background: "rgba(255,240,230,0.044)",
                    border: "1px solid rgba(92,155,205,0.15)",
                    borderRadius: "16px",
                    animation: `about-entrance 0.8s cubic-bezier(0.16,1,0.3,1) ${_i * 0.12}s both`,
                    transition: "border-color 0.4s, background 0.4s, transform 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(176,38,255,0.15)";
                    e.currentTarget.style.background = "rgba(36,139,212,0.066)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(92,155,205,0.15)";
                    e.currentTarget.style.background = "rgba(255,240,230,0.044)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span className="text-xl shrink-0">{value.icon}</span>
                  <div>
                    <h3
                      className="text-[14px] text-white font-medium mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      <FlashText variant={value.variant}>{value.flashWord}</FlashText>{" "}
                      {value.title.replace(value.flashWord + " ", "")}
                    </h3>
                    <p
                      className="text-[12px] leading-relaxed"
                      style={{ color: "rgba(222,216,235,0.52)" }}
                    >
                      {value.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>
        </section>

        {/* ── CTA ── */}
        <section
          className="py-24 px-6 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(#0e0a0f, #140e18 50%, #0e0a0f 100%)",
            borderTop: "1px solid rgba(92,155,205,0.15)",
          }}
        >
          <Sparkles />
          <div
            className="absolute"
            style={{
              bottom: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 400,
              height: 200,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(176,38,255,0.132), transparent 70%)",
              animation: "about-pulse-glow 8s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <RevealSection className="relative z-10">
            {/* Mini logo */}
            <div
              className="mx-auto mb-6"
              style={{
                width: 50,
                height: 69,
                animation: "about-float 5s ease-in-out infinite, about-logo-glow 4s ease-in-out infinite",
              }}
            >
              <img
                src="/brand-logo.png"
                alt="XI XVI"
                className="w-full h-full object-contain"
                style={{ opacity: 0.7 }}
              />
            </div>
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
              Experience the <FlashText variant="gold">Collection</FlashText>
            </h2>
            <p
              className="text-[14px] mb-8 max-w-md mx-auto"
              style={{ color: "rgba(222,216,235,0.52)" }}
            >
              Every piece is made <FlashText variant="alt">exclusively for you</FlashText> — a modern take on couture
              that's kinder to the planet.
            </p>
            <Link
              to="/shop"
              className="inline-block px-12 py-3.5 text-[11px] tracking-[0.25em] uppercase font-bold text-white transition-all glass-shimmer"
              style={{
                background:
                  "linear-gradient(135deg, #b026ff 0%, #ff2e6b 50%, #ffb833 100%)",
                backgroundSize: "200% 100%",
                animation: "gradient-loop 6s ease-in-out infinite",
                borderRadius: "12px",
                boxShadow: "0 4px 25px rgba(176,38,255,0.2), 0 2px 10px rgba(255,46,107,0.15)",
              }}
            >
              SHOP NOW
            </Link>
          </RevealSection>
        </section>
      </div>
    </>
  );
}
