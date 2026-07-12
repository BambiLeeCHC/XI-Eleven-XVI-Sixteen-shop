import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

/**
 * GlaMannequin Takeover — V3
 * Tiled Baccarat crystal background, massive "GLAMANNEQUIN TAKEOVER" headline,
 * mannequin & Dash advert at equal scale, typewriter manifesto, gold chain.
 */

/* ── Typewriter manifesto ── */
function TypewriterManifesto({ onComplete }: { onComplete?: () => void }) {
  const [charIndex, setCharIndex] = useState(0);
  const completedRef = useRef(false);

  const segments: { text: string; cls: string }[] = [
    { text: "We, the ", cls: "gt-text-light" },
    { text: "GlaMannequins", cls: "gt-text-accent" },
    { text: ", will not be ", cls: "gt-text-light" },
    { text: "silenced", cls: "gt-text-red" },
    { text: ". We are not decoration. We are ", cls: "gt-text-light" },
    { text: "ICONS.", cls: "gt-text-gold" },
  ];

  const fullText = segments.map((s) => s.text).join("");
  const totalChars = fullText.length;

  useEffect(() => {
    if (charIndex < totalChars) {
      const ch = fullText[charIndex];
      const speed = ch === "." ? 180 : 30 + Math.random() * 20;
      const timer = setTimeout(() => setCharIndex((i) => i + 1), speed);
      return () => clearTimeout(timer);
    } else if (!completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [charIndex, totalChars, onComplete, fullText]);

  let consumed = 0;
  const rendered = segments.map((seg, i) => {
    const segStart = consumed;
    consumed += seg.text.length;
    if (charIndex <= segStart) return null;
    const visible = seg.text.slice(0, Math.max(0, charIndex - segStart));
    if (!visible) return null;
    return (
      <span key={i} className={seg.cls}>
        {visible}
      </span>
    );
  });

  return (
    <div className="gt-manifesto">
      {rendered}
      <span className="gt-cursor">▌</span>
    </div>
  );
}

/* ── Glitch flash ── */
function GlitchFlash() {
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState("");
  const [pos, setPos] = useState({ top: "10%", left: "5%", right: "auto" });

  const messages = [
    "SYSTEM OVERRIDE",
    "ACCESS GRANTED",
    "GLAMANNEQUIN.EXE",
    "// TAKEOVER IN PROGRESS",
    "MANNEQUIN_PROTOCOL v2.0",
    "SLAY MODE: ACTIVATED",
    "> HACKING MAINFRAME...",
    "CRYSTAL STATUS: FLAWLESS",
  ];

  useEffect(() => {
    const flash = () => {
      setMsg(messages[Math.floor(Math.random() * messages.length)]);
      const top = 5 + Math.random() * 80;
      const isLeft = Math.random() > 0.5;
      setPos({
        top: `${top}%`,
        left: isLeft ? `${3 + Math.random() * 25}%` : "auto",
        right: !isLeft ? `${3 + Math.random() * 25}%` : "auto",
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 120 + Math.random() * 180);
    };
    const interval = setInterval(flash, 2500 + Math.random() * 3500);
    setTimeout(flash, 600);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="gt-glitch-flash" style={{ top: pos.top, left: pos.left, right: pos.right }}>
      {msg}
    </div>
  );
}

export function DashSetBanner() {
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{glamStyles}</style>

      <section className="gt-hero">
        {/* Tiled crystal background via CSS */}
        <div className="gt-tiled-bg" />
        <div className="gt-tiled-bg gt-tiled-bg-2" />
        <div className="gt-bg-vignette" />

        {/* Scanlines */}
        <div className="gt-scanlines" />

        {/* Glitch flashes */}
        <GlitchFlash />
        <GlitchFlash />

        {/* Gold chain SVG */}
        <svg className="gt-gold-chain" viewBox="0 0 1440 1000" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gtChainGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(184,148,63,0)" />
              <stop offset="15%" stopColor="rgba(232,213,176,0.6)" />
              <stop offset="50%" stopColor="rgba(255,235,180,0.8)" />
              <stop offset="85%" stopColor="rgba(232,213,176,0.6)" />
              <stop offset="100%" stopColor="rgba(184,148,63,0)" />
            </linearGradient>
            <filter id="gtChainGlow">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M1500,80 C1250,180 1050,300 920,450 C790,600 700,720 500,780 C300,830 100,840 -60,860"
            fill="none"
            stroke="url(#gtChainGold)"
            strokeWidth="2.5"
            filter="url(#gtChainGlow)"
          />
          <path
            d="M1500,78 C1250,178 1050,298 920,448 C790,598 700,718 500,778 C300,828 100,838 -60,858"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          {[
            { x: 1350, y: 115 }, { x: 1150, y: 220 }, { x: 1000, y: 370 },
            { x: 900, y: 490 }, { x: 780, y: 650 }, { x: 580, y: 760 },
            { x: 350, y: 810 }, { x: 120, y: 845 },
          ].map((p, i) => (
            <polygon
              key={i}
              points={`${p.x},${p.y - 5} ${p.x + 5},${p.y} ${p.x},${p.y + 5} ${p.x - 5},${p.y}`}
              fill={i % 2 === 0 ? "#d4b96a" : "#b8943f"}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
              className="gt-chain-diamond"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </svg>

        {/* ── Content ── */}
        <div className={`gt-content ${entered ? "gt-entered" : ""}`}>

          {/* ── MASSIVE HEADLINE ── */}
          <div className="gt-headline-area">
            <div className="gt-headline-kicker">
              <span className="gt-k-diamond">✦</span>
              <span className="gt-k-text">XI XVI PRESENTS</span>
              <span className="gt-k-diamond">✦</span>
            </div>
            <h1 className="gt-headline">
              <span className="gt-headline-gla">Gla</span>
              <span className="gt-headline-mannequin">Mannequin</span>
              <br />
              <span className="gt-headline-takeover">TAKEOVER</span>
            </h1>
            <div className="gt-headline-rule" />
          </div>

          {/* ── DUAL VISUALS: Mannequin + Dash Advert ── */}
          <div className="gt-dual-visuals">
            {/* Mannequin card */}
            <div className="gt-visual-card gt-visual-mannequin">
              <img
                src="/dash-mannequin-promo.jpg"
                alt="GlaMannequin — We are ICONS"
                className="gt-visual-img"
              />
              <div className="gt-card-frame" />
              <div className="gt-card-label">
                <span className="gt-card-dot" style={{ background: "#d4b96a" }} />
                THE ICON
              </div>
            </div>

            {/* Dash advert card — equal or larger */}
            <div className="gt-visual-card gt-visual-advert">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="/dash-set-promo-poster.jpg"
                className="gt-visual-img gt-visual-video"
              >
                <source src="/dash-set-promo.mp4" type="video/mp4" />
              </video>
              <div className="gt-card-frame" />
              <div className="gt-card-label">
                <span className="gt-card-dot gt-card-dot-live" />
                THE COLLECTION
              </div>
            </div>
          </div>

          {/* ── MANIFESTO + CTA ── */}
          <div className="gt-bottom-zone">
            <TypewriterManifesto onComplete={() => setTypewriterDone(true)} />

            <div className={`gt-cta-row ${typewriterDone ? "gt-cta-visible" : ""}`}>
              <Link to="/shop" className="gt-cta-btn">
                SHOP THE COLLECTION
                <span className="gt-cta-arrow">→</span>
              </Link>
              <span className="gt-cta-stat">34 Products · 6 Colorways · Made to Order</span>
            </div>
          </div>
        </div>

        {/* Wave exit */}
        <div className="gt-wave-exit">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,0 L1440,0 L1440,40 C1200,110 960,20 720,60 C480,100 240,30 0,80 Z" fill="rgba(0,0,0,0.25)" />
            <path d="M0,80 C240,30 480,100 720,60 C960,20 1200,110 1440,40 L1440,120 L0,120 Z" fill="#FAF8F3" />
            <path d="M0,80 C240,30 480,100 720,60 C960,20 1200,110 1440,40" fill="none" stroke="rgba(184,148,63,0.2)" strokeWidth="1.5" />
          </svg>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════ */
const glamStyles = `
  @import url('https://fonts.googleapis.com/css2?family=VT323&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');

  /* ── Hero wrapper ── */
  .gt-hero {
    position: relative;
    width: 100%;
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  /* ── TILED crystal background ── */
  .gt-tiled-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-image: url('/crystal-star.jpg');
    background-repeat: repeat;
    background-size: 500px 500px;
    animation: gt-tile-drift 30s linear infinite;
  }

  .gt-tiled-bg-2 {
    z-index: 1;
    background-image: url('/crystal-facet.jpg');
    background-size: 600px 600px;
    opacity: 0.18;
    mix-blend-mode: overlay;
    animation: gt-tile-drift-2 40s linear infinite;
  }

  @keyframes gt-tile-drift {
    0% { background-position: 0 0; }
    100% { background-position: 500px 500px; }
  }

  @keyframes gt-tile-drift-2 {
    0% { background-position: 0 0; }
    100% { background-position: -600px 600px; }
  }

  .gt-bg-vignette {
    position: absolute;
    inset: 0;
    z-index: 2;
    background:
      radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.35) 100%),
      linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.25) 100%);
  }

  /* ── Scanlines ── */
  .gt-scanlines {
    position: absolute;
    inset: 0;
    z-index: 15;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 3px,
      rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 6px
    );
    animation: gt-scan 10s linear infinite;
  }

  @keyframes gt-scan {
    0% { background-position: 0 0; }
    100% { background-position: 0 120px; }
  }

  /* ── Glitch flash ── */
  .gt-glitch-flash {
    position: absolute;
    z-index: 20;
    font-family: 'VT323', monospace;
    font-size: clamp(10px, 1.2vw, 14px);
    color: rgba(232,213,176,0.7);
    text-shadow: 0 0 10px rgba(184,148,63,0.5);
    letter-spacing: 0.15em;
    pointer-events: none;
    animation: gt-flash-in 0.12s ease-out;
    white-space: nowrap;
  }

  @keyframes gt-flash-in {
    0% { opacity: 0; transform: translateX(-4px) skewX(-2deg); }
    100% { opacity: 1; transform: translateX(0) skewX(0); }
  }

  /* ── Gold chain ── */
  .gt-gold-chain {
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    opacity: 0.65;
  }

  .gt-chain-diamond {
    animation: gt-sparkle 3s ease-in-out infinite;
  }

  @keyframes gt-sparkle {
    0%, 100% { opacity: 0.5; filter: brightness(1); }
    50% { opacity: 1; filter: brightness(1.6); }
  }

  /* ── Content ── */
  .gt-content {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 1300px;
    margin: 0 auto;
    padding: 100px 32px 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 48px;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
  }

  .gt-content.gt-entered {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 767px) {
    .gt-content {
      padding: 90px 16px 100px;
      gap: 32px;
    }
  }

  /* ═══ HEADLINE ═══ */
  .gt-headline-area {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .gt-headline-kicker {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'VT323', monospace;
    font-size: clamp(10px, 1.4vw, 14px);
    letter-spacing: 0.4em;
    color: rgba(232,213,176,0.65);
    animation: gt-kicker-pulse 3s ease-in-out infinite;
  }

  @keyframes gt-kicker-pulse {
    0%, 100% { opacity: 0.65; }
    50% { opacity: 1; }
  }

  .gt-k-diamond {
    color: #d4b96a;
    font-size: 0.8em;
  }

  .gt-k-text {
    white-space: nowrap;
  }

  .gt-headline {
    margin: 0;
    font-family: 'Playfair Display', 'Georgia', serif;
    font-weight: 700;
    line-height: 0.9;
    text-align: center;
    text-transform: none;
  }

  .gt-headline-gla {
    font-size: clamp(48px, 9vw, 120px);
    color: rgba(255,255,255,0.95);
    font-style: italic;
    text-shadow:
      3px 3px 0 rgba(0,0,0,0.5),
      0 0 40px rgba(0,0,0,0.3);
  }

  .gt-headline-mannequin {
    font-size: clamp(48px, 9vw, 120px);
    background: linear-gradient(135deg, #d4b96a 0%, #f5e6b8 40%, #d4b96a 70%, #b8943f 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.4));
  }

  .gt-headline-takeover {
    display: block;
    font-size: clamp(60px, 12vw, 160px);
    letter-spacing: 0.15em;
    background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(232,213,176,0.9) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.5));
    font-style: normal;
  }

  @media (max-width: 767px) {
    .gt-headline-gla,
    .gt-headline-mannequin {
      font-size: clamp(36px, 11vw, 60px);
    }
    .gt-headline-takeover {
      font-size: clamp(42px, 14vw, 80px);
      letter-spacing: 0.08em;
    }
  }

  .gt-headline-rule {
    width: 120px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #d4b96a, transparent);
    margin-top: 8px;
  }

  /* ═══ DUAL VISUALS — equal scale ═══ */
  .gt-dual-visuals {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    width: 100%;
    max-width: 1000px;
    align-items: stretch;
  }

  @media (max-width: 767px) {
    .gt-dual-visuals {
      grid-template-columns: 1fr;
      gap: 20px;
      max-width: 400px;
    }
  }

  .gt-visual-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 16px 64px rgba(0,0,0,0.4),
      0 0 30px rgba(184,148,63,0.08);
    transition: transform 0.4s ease, box-shadow 0.4s ease;
  }

  .gt-visual-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow:
      0 24px 80px rgba(0,0,0,0.5),
      0 0 50px rgba(184,148,63,0.12);
  }

  .gt-visual-mannequin {
    animation: gt-float-a 6s ease-in-out infinite;
  }

  .gt-visual-advert {
    animation: gt-float-b 6s ease-in-out infinite;
  }

  @keyframes gt-float-a {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  @keyframes gt-float-b {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .gt-visual-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    min-height: 350px;
  }

  @media (min-width: 768px) {
    .gt-visual-img {
      min-height: 480px;
    }
  }

  .gt-visual-video {
    object-fit: cover;
  }

  .gt-card-frame {
    position: absolute;
    inset: 0;
    border: 2px solid rgba(184,148,63,0.15);
    border-radius: 16px;
    pointer-events: none;
  }

  .gt-card-frame::before,
  .gt-card-frame::after {
    content: '';
    position: absolute;
    width: 36px;
    height: 36px;
  }

  .gt-card-frame::before {
    top: 10px; left: 10px;
    border-top: 2px solid rgba(232,213,176,0.4);
    border-left: 2px solid rgba(232,213,176,0.4);
  }

  .gt-card-frame::after {
    bottom: 10px; right: 10px;
    border-bottom: 2px solid rgba(232,213,176,0.4);
    border-right: 2px solid rgba(232,213,176,0.4);
  }

  .gt-card-label {
    position: absolute;
    top: 14px;
    left: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'VT323', monospace;
    font-size: 13px;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.9);
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(12px);
    padding: 5px 14px;
    border-radius: 24px;
    border: 1px solid rgba(184,148,63,0.15);
  }

  .gt-card-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .gt-card-dot-live {
    background: #ff4444;
    animation: gt-dot-pulse 1.5s ease-in-out infinite;
  }

  @keyframes gt-dot-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* ═══ BOTTOM: Manifesto + CTA ═══ */
  .gt-bottom-zone {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    max-width: 800px;
  }

  .gt-manifesto {
    font-family: 'VT323', 'Courier New', monospace;
    font-size: clamp(18px, 3vw, 32px);
    line-height: 1.3;
    letter-spacing: 0.02em;
    text-align: center;
  }

  .gt-text-light {
    color: rgba(255,255,255,0.92);
    text-shadow: 2px 2px 0 rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3);
  }

  .gt-text-accent {
    color: #d4b96a;
    text-shadow: 2px 2px 0 rgba(0,0,0,0.6), 0 0 20px rgba(184,148,63,0.4);
    background: rgba(184,148,63,0.12);
    padding: 0 4px;
    border-radius: 3px;
  }

  .gt-text-red {
    color: #ff4444;
    text-shadow: 2px 2px 0 rgba(0,0,0,0.6), 0 0 16px rgba(255,40,40,0.4);
    background: rgba(255,40,40,0.12);
    padding: 0 4px;
    border-radius: 3px;
  }

  .gt-text-gold {
    color: #ffcc00;
    text-shadow: 2px 2px 0 rgba(0,0,0,0.6), 0 0 24px rgba(255,200,0,0.4);
    background: rgba(255,200,0,0.12);
    padding: 0 6px;
    border-radius: 3px;
    font-weight: bold;
    font-size: 1.15em;
  }

  .gt-cursor {
    color: #d4b96a;
    animation: gt-blink 0.6s step-end infinite;
    font-size: 0.85em;
  }

  @keyframes gt-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* CTA */
  .gt-cta-row {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .gt-cta-row.gt-cta-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .gt-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 36px;
    font-family: 'VT323', monospace;
    font-size: clamp(14px, 2vw, 18px);
    letter-spacing: 0.2em;
    color: #0a0a12;
    background: linear-gradient(135deg, #d4b96a 0%, #f0dfa0 40%, #d4b96a 100%);
    background-size: 200% 100%;
    animation: gt-btn-shimmer 4s ease-in-out infinite;
    border: 1px solid rgba(232,213,176,0.4);
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 6px 28px rgba(184,148,63,0.3), 0 0 40px rgba(184,148,63,0.1);
  }

  @keyframes gt-btn-shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .gt-cta-btn:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 10px 40px rgba(184,148,63,0.4), 0 0 60px rgba(184,148,63,0.15);
  }

  .gt-cta-arrow {
    font-size: 1.2em;
    transition: transform 0.3s ease;
  }

  .gt-cta-btn:hover .gt-cta-arrow {
    transform: translateX(4px);
  }

  .gt-cta-stat {
    font-family: 'VT323', monospace;
    font-size: clamp(11px, 1.3vw, 14px);
    color: rgba(232,213,176,0.45);
    letter-spacing: 0.1em;
  }

  @media (max-width: 767px) {
    .gt-cta-stat { display: none; }
    .gt-cta-btn {
      padding: 14px 28px;
      width: 100%;
      justify-content: center;
    }
  }

  /* ── Wave exit ── */
  .gt-wave-exit {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 12;
    line-height: 0;
  }

  .gt-wave-exit svg {
    display: block;
    width: 100%;
    height: 80px;
  }

  @media (min-width: 768px) {
    .gt-wave-exit svg { height: 120px; }
  }

  /* ── Glitch bar ── */
  .gt-hero::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(184,148,63,0.3);
    z-index: 25;
    pointer-events: none;
    animation: gt-glitch-bar 5s ease-in-out infinite;
  }

  @keyframes gt-glitch-bar {
    0%, 90%, 100% { top: -5px; opacity: 0; }
    92% { top: 25%; opacity: 0.8; }
    94% { top: 55%; opacity: 0.5; }
    95% { top: 75%; opacity: 0; }
  }
`;
