import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

/**
 * GlaMannequin Takeover — TERONA-level hero presence.
 * Full-viewport Baccarat crystal scene with bold manifesto typography,
 * integrated mannequin imagery, gold chain accents, glitch overlays,
 * and dramatic organic wave exit.
 */

/* ── Typewriter — bigger, bolder manifesto ── */
function TypewriterManifesto({ onComplete }: { onComplete?: () => void }) {
  const [charIndex, setCharIndex] = useState(0);
  const completedRef = useRef(false);

  const segments: { text: string; cls: string }[] = [
    { text: "We, the ", cls: "gt-text-light" },
    { text: "GlaMannequins", cls: "gt-text-accent" },
    { text: ", will not be ", cls: "gt-text-light" },
    { text: "silenced", cls: "gt-text-red" },
    { text: ".\n", cls: "gt-text-light" },
    { text: "We are not decoration.\n", cls: "gt-text-light" },
    { text: "We are ", cls: "gt-text-light" },
    { text: "ICONS.", cls: "gt-text-gold" },
  ];

  const fullText = segments.map((s) => s.text).join("");
  const totalChars = fullText.length;

  useEffect(() => {
    if (charIndex < totalChars) {
      const ch = fullText[charIndex];
      const speed = ch === "\n" ? 400 : ch === "." ? 200 : 35 + Math.random() * 25;
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
    // Convert \n to <br/>
    const parts = visible.split("\n");
    return (
      <span key={i} className={seg.cls}>
        {parts.map((p, j) => (
          <span key={j}>
            {p}
            {j < parts.length - 1 && <br />}
          </span>
        ))}
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

/* ── Glitch flash messages ── */
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
      const top = 10 + Math.random() * 70;
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

/* ── Floating diamond sparkle accents ── */
function FloatingDiamond({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        animation: `gt-diamond-float 5s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.4,
      }}
    >
      <polygon
        points="10,0 13,7 20,10 13,13 10,20 7,13 0,10 7,7"
        fill="none"
        stroke="rgba(232,213,176,0.5)"
        strokeWidth="0.5"
      />
      <polygon
        points="10,4 12,8 16,10 12,12 10,16 8,12 4,10 8,8"
        fill="rgba(232,213,176,0.15)"
      />
    </svg>
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

      <section className="gt-hero-section">
        {/* ── Full-bleed crystal background ── */}
        <div className="gt-bg-layer">
          <img
            src="/crystal-star.jpg"
            alt=""
            className="gt-bg-img gt-bg-main"
          />
          {/* Secondary crystal texture blended on right */}
          <img
            src="/crystal-facet.jpg"
            alt=""
            className="gt-bg-img gt-bg-accent"
          />
          {/* Light overlay for depth */}
          <div className="gt-bg-gradient" />
        </div>

        {/* ── Scanlines ── */}
        <div className="gt-scanlines" />

        {/* ── Glitch flashes ── */}
        <GlitchFlash />
        <GlitchFlash />

        {/* ── Floating diamond accents ── */}
        <FloatingDiamond delay={0} x="8%" y="15%" size={22} />
        <FloatingDiamond delay={1.2} x="85%" y="20%" size={16} />
        <FloatingDiamond delay={2.5} x="75%" y="65%" size={20} />
        <FloatingDiamond delay={0.8} x="12%" y="70%" size={14} />
        <FloatingDiamond delay={3} x="50%" y="12%" size={18} />

        {/* ── Gold chain draped across (like TERONA) ── */}
        <svg className="gt-gold-chain" viewBox="0 0 1440 900" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gtChainGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(184,148,63,0)" />
              <stop offset="20%" stopColor="rgba(232,213,176,0.6)" />
              <stop offset="50%" stopColor="rgba(255,235,180,0.8)" />
              <stop offset="80%" stopColor="rgba(232,213,176,0.6)" />
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
          {/* Draped chain path — top-right to bottom-left */}
          <path
            d="M1440,50 C1200,120 1000,200 900,350 C800,500 750,600 500,650 C300,690 100,700 0,720"
            fill="none"
            stroke="url(#gtChainGold)"
            strokeWidth="2.5"
            filter="url(#gtChainGlow)"
            className="gt-chain-path"
          />
          {/* Highlight */}
          <path
            d="M1440,48 C1200,118 1000,198 900,348 C800,498 750,598 500,648 C300,688 100,698 0,718"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          {/* Diamond nodes along chain */}
          {[
            { x: 1300, y: 80 }, { x: 1100, y: 155 }, { x: 950, y: 290 },
            { x: 870, y: 400 }, { x: 750, y: 570 }, { x: 550, y: 640 },
            { x: 350, y: 680 }, { x: 150, y: 705 },
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

        {/* ── Content grid ── */}
        <div className={`gt-content ${entered ? "gt-entered" : ""}`}>
          {/* Left: Bold manifesto */}
          <div className="gt-text-side">
            {/* Kicker */}
            <div className="gt-kicker">
              <span className="gt-kicker-line" />
              <span className="gt-kicker-text">GLAMANNEQUIN TAKEOVER</span>
              <span className="gt-kicker-line" />
            </div>

            {/* Typewriter manifesto — big, bold */}
            <TypewriterManifesto onComplete={() => setTypewriterDone(true)} />

            {/* CTA row */}
            <div className={`gt-cta-row ${typewriterDone ? "gt-cta-visible" : ""}`}>
              <Link to="/shop" className="gt-cta-primary">
                SHOP THE COLLECTION
                <span className="gt-cta-arrow">→</span>
              </Link>
              <span className="gt-cta-divider" />
              <span className="gt-cta-sub">34 Products · 6 Colorways</span>
            </div>
          </div>

          {/* Right: Mannequin hero + video inset */}
          <div className="gt-visual-side">
            {/* Main mannequin image */}
            <div className="gt-mannequin-hero">
              <img
                src="/dash-mannequin-promo.jpg"
                alt="GlaMannequin — We are ICONS"
                className="gt-mannequin-img"
              />
              {/* Gold border frame */}
              <div className="gt-mannequin-frame" />
            </div>

            {/* Floating video inset */}
            <div className="gt-video-inset">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="/dash-set-promo-poster.jpg"
                className="gt-video"
              >
                <source src="/dash-set-promo.mp4" type="video/mp4" />
              </video>
              <div className="gt-video-label">
                <span className="gt-video-dot" />
                LIVE
              </div>
            </div>
          </div>
        </div>

        {/* ── Dramatic organic wave exit ── */}
        <div className="gt-wave-exit">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,0 L1440,0 L1440,40 C1200,110 960,20 720,60 C480,100 240,30 0,80 Z" fill="rgba(0,0,0,0.3)" />
            <path d="M0,80 C240,30 480,100 720,60 C960,20 1200,110 1440,40 L1440,120 L0,120 Z" fill="#FAF8F3" />
            <path
              d="M0,80 C240,30 480,100 720,60 C960,20 1200,110 1440,40"
              fill="none"
              stroke="rgba(184,148,63,0.2)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   STYLES — TERONA-level dramatic hero
   ═══════════════════════════════════════════════════════════ */
const glamStyles = `
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

  /* ── Full-viewport hero ── */
  .gt-hero-section {
    position: relative;
    width: 100%;
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  @media (max-width: 767px) {
    .gt-hero-section {
      min-height: 90vh;
    }
  }

  /* ── Background ── */
  .gt-bg-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .gt-bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .gt-bg-main {
    z-index: 1;
    animation: gt-bg-breathe 10s ease-in-out infinite alternate;
  }

  .gt-bg-accent {
    z-index: 2;
    opacity: 0.3;
    mix-blend-mode: overlay;
    animation: gt-bg-breathe 12s ease-in-out infinite alternate-reverse;
  }

  @keyframes gt-bg-breathe {
    0% { transform: scale(1); filter: brightness(1.0) contrast(1.05); }
    100% { transform: scale(1.03); filter: brightness(1.1) contrast(1.1); }
  }

  .gt-bg-gradient {
    position: absolute;
    inset: 0;
    z-index: 3;
    background:
      linear-gradient(135deg, rgba(0,0,0,0.25) 0%, transparent 40%),
      linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.3) 100%),
      radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.2) 0%, transparent 60%);
  }

  /* ── Scanlines ── */
  .gt-scanlines {
    position: absolute;
    inset: 0;
    z-index: 15;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(0,0,0,0.02) 3px,
      rgba(0,0,0,0.02) 6px
    );
    animation: gt-scanline-move 10s linear infinite;
  }

  @keyframes gt-scanline-move {
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

  /* ── Gold chain SVG ── */
  .gt-gold-chain {
    position: absolute;
    inset: 0;
    z-index: 8;
    pointer-events: none;
    opacity: 0.7;
  }

  .gt-chain-path {
    animation: gt-chain-sway 8s ease-in-out infinite;
  }

  @keyframes gt-chain-sway {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(6px); }
  }

  .gt-chain-diamond {
    animation: gt-sparkle 3s ease-in-out infinite;
  }

  @keyframes gt-sparkle {
    0%, 100% { opacity: 0.6; filter: brightness(1); }
    50% { opacity: 1; filter: brightness(1.5); }
  }

  /* ── Floating diamonds ── */
  @keyframes gt-diamond-float {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
    50% { transform: translateY(-12px) rotate(180deg); opacity: 0.6; }
  }

  /* ── Content grid ── */
  .gt-content {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 80px 40px 120px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s;
  }

  .gt-content.gt-entered {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 767px) {
    .gt-content {
      grid-template-columns: 1fr;
      gap: 32px;
      padding: 100px 20px 80px;
    }
  }

  /* ── Left: Text side ── */
  .gt-text-side {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* Kicker */
  .gt-kicker {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .gt-kicker-line {
    flex: 0 0 40px;
    height: 1px;
    background: linear-gradient(90deg, rgba(184,148,63,0.5), transparent);
  }

  .gt-kicker-line:last-child {
    background: linear-gradient(270deg, rgba(184,148,63,0.5), transparent);
    flex: 1;
  }

  .gt-kicker-text {
    font-family: 'VT323', monospace;
    font-size: clamp(10px, 1.5vw, 14px);
    letter-spacing: 0.35em;
    color: rgba(232,213,176,0.7);
    white-space: nowrap;
    animation: gt-kicker-pulse 3s ease-in-out infinite;
  }

  @keyframes gt-kicker-pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  /* Manifesto text */
  .gt-manifesto {
    font-family: 'VT323', 'Courier New', monospace;
    font-size: clamp(28px, 5vw, 56px);
    line-height: 1.15;
    letter-spacing: 0.02em;
  }

  @media (max-width: 767px) {
    .gt-manifesto {
      font-size: clamp(22px, 7vw, 36px);
    }
  }

  .gt-text-light {
    color: rgba(255,255,255,0.95);
    text-shadow:
      2px 2px 0 rgba(0,0,0,0.5),
      0 0 30px rgba(0,0,0,0.3);
  }

  .gt-text-accent {
    color: #d4b96a;
    text-shadow:
      2px 2px 0 rgba(0,0,0,0.6),
      0 0 30px rgba(184,148,63,0.4);
    background: rgba(184,148,63,0.15);
    padding: 0 6px;
    border-radius: 4px;
  }

  .gt-text-red {
    color: #ff4444;
    text-shadow:
      2px 2px 0 rgba(0,0,0,0.6),
      0 0 20px rgba(255,40,40,0.4);
    background: rgba(255,40,40,0.15);
    padding: 0 6px;
    border-radius: 4px;
  }

  .gt-text-gold {
    color: #ffcc00;
    text-shadow:
      2px 2px 0 rgba(0,0,0,0.6),
      0 0 30px rgba(255,200,0,0.5);
    background: rgba(255,200,0,0.15);
    padding: 0 8px;
    border-radius: 4px;
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

  /* CTA row */
  .gt-cta-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .gt-cta-row.gt-cta-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .gt-cta-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 32px;
    font-family: 'VT323', monospace;
    font-size: clamp(13px, 2vw, 17px);
    letter-spacing: 0.2em;
    color: #0a0a12;
    background: linear-gradient(135deg, #d4b96a 0%, #e8d5a0 40%, #d4b96a 100%);
    background-size: 200% 100%;
    animation: gt-btn-shimmer 4s ease-in-out infinite;
    border: 1px solid rgba(232,213,176,0.4);
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 24px rgba(184,148,63,0.25), 0 0 40px rgba(184,148,63,0.1);
  }

  @keyframes gt-btn-shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .gt-cta-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 36px rgba(184,148,63,0.35), 0 0 60px rgba(184,148,63,0.15);
  }

  .gt-cta-arrow {
    font-size: 1.2em;
    transition: transform 0.3s ease;
  }

  .gt-cta-primary:hover .gt-cta-arrow {
    transform: translateX(4px);
  }

  .gt-cta-divider {
    width: 1px;
    height: 20px;
    background: rgba(232,213,176,0.3);
  }

  .gt-cta-sub {
    font-family: 'VT323', monospace;
    font-size: clamp(11px, 1.4vw, 14px);
    color: rgba(232,213,176,0.5);
    letter-spacing: 0.1em;
  }

  @media (max-width: 767px) {
    .gt-cta-divider { display: none; }
    .gt-cta-sub { display: none; }
    .gt-cta-primary {
      padding: 12px 24px;
      width: 100%;
      justify-content: center;
    }
  }

  /* ── Right: Visual side ── */
  .gt-visual-side {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  @media (max-width: 767px) {
    .gt-visual-side {
      min-height: 280px;
    }
  }

  /* Mannequin hero */
  .gt-mannequin-hero {
    position: relative;
    width: 80%;
    max-width: 400px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 20px 80px rgba(0,0,0,0.4),
      0 0 40px rgba(184,148,63,0.1);
    animation: gt-mannequin-float 6s ease-in-out infinite;
  }

  @keyframes gt-mannequin-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .gt-mannequin-img {
    width: 100%;
    height: auto;
    display: block;
    filter: drop-shadow(0 0 30px rgba(184,148,63,0.15));
  }

  .gt-mannequin-frame {
    position: absolute;
    inset: 0;
    border: 2px solid rgba(184,148,63,0.2);
    border-radius: 16px;
    pointer-events: none;
  }

  .gt-mannequin-frame::before,
  .gt-mannequin-frame::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
  }

  .gt-mannequin-frame::before {
    top: 8px;
    left: 8px;
    border-top: 2px solid rgba(232,213,176,0.5);
    border-left: 2px solid rgba(232,213,176,0.5);
  }

  .gt-mannequin-frame::after {
    bottom: 8px;
    right: 8px;
    border-bottom: 2px solid rgba(232,213,176,0.5);
    border-right: 2px solid rgba(232,213,176,0.5);
  }

  /* Video inset — floating overlay */
  .gt-video-inset {
    position: absolute;
    bottom: -10px;
    right: -20px;
    width: 55%;
    max-width: 220px;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid rgba(184,148,63,0.3);
    box-shadow:
      0 12px 48px rgba(0,0,0,0.4),
      0 0 20px rgba(184,148,63,0.1);
    z-index: 5;
    animation: gt-video-bob 5s ease-in-out infinite;
    animation-delay: 1.5s;
  }

  @keyframes gt-video-bob {
    0%, 100% { transform: translateY(0) rotate(-1deg); }
    50% { transform: translateY(-6px) rotate(0deg); }
  }

  @media (max-width: 767px) {
    .gt-video-inset {
      width: 45%;
      max-width: 160px;
      right: -10px;
      bottom: -5px;
    }
  }

  .gt-video {
    width: 100%;
    height: auto;
    display: block;
  }

  .gt-video-label {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'VT323', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.9);
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(8px);
    padding: 3px 10px;
    border-radius: 20px;
  }

  .gt-video-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ff4444;
    animation: gt-dot-pulse 1.5s ease-in-out infinite;
  }

  @keyframes gt-dot-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
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
    .gt-wave-exit svg {
      height: 120px;
    }
  }

  /* ── Occasional glitch bar ── */
  .gt-hero-section::after {
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
