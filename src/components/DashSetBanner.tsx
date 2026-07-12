import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

/**
 * GlaMannequin Takeover Banner — Summer Crystal Edition
 * Baccarat crystal panel backgrounds, poignant typewriter manifesto,
 * glitch effects, Y2K energy meets luxury crystal.
 */

/* ── Typewriter text component ── */
function TypewriterText({ onComplete }: { onComplete?: () => void }) {
  const [charIndex, setCharIndex] = useState(0);
  const completedRef = useRef(false);

  // More poignant manifesto
  const segments: { text: string; className: string }[] = [
    { text: "We, the ", className: "glam-text-dark" },
    { text: "GlaMannequins", className: "glam-text-blue" },
    { text: ", will not be ", className: "glam-text-dark" },
    { text: "silenced", className: "glam-text-red" },
    { text: ". We are not decoration. We are ", className: "glam-text-dark" },
    { text: "ICONS.", className: "glam-text-gold" },
  ];

  const fullText = segments.map((s) => s.text).join("");
  const totalChars = fullText.length;

  useEffect(() => {
    if (charIndex < totalChars) {
      const speed = 30 + Math.random() * 20;
      const timer = setTimeout(() => setCharIndex((i) => i + 1), speed);
      return () => clearTimeout(timer);
    } else if (!completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [charIndex, totalChars, onComplete]);

  let consumed = 0;
  const rendered = segments.map((seg, i) => {
    const segStart = consumed;
    consumed += seg.text.length;
    if (charIndex <= segStart) return null;
    const visible = seg.text.slice(0, Math.max(0, charIndex - segStart));
    if (!visible) return null;
    return (
      <span key={i} className={seg.className}>
        {visible}
      </span>
    );
  });

  return (
    <div className="glam-typewriter-container">
      <span className="glam-typewriter-text">
        {rendered}
        <span className="glam-cursor">▌</span>
      </span>
    </div>
  );
}

/* ── Glitch text flash ── */
function GlitchFlash() {
  const [visible, setVisible] = useState(false);
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
      setVisible(true);
      setTimeout(() => setVisible(false), 150 + Math.random() * 200);
    };
    const interval = setInterval(flash, 2000 + Math.random() * 3000);
    setTimeout(flash, 800);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const msg = messages[Math.floor(Math.random() * messages.length)];
  const top = 10 + Math.random() * 70;
  const left = Math.random() > 0.5 ? "auto" : `${5 + Math.random() * 30}%`;
  const right = left === "auto" ? `${5 + Math.random() * 30}%` : "auto";

  return (
    <div
      className="glam-glitch-flash"
      style={{ top: `${top}%`, left, right }}
    >
      {msg}
    </div>
  );
}

export function DashSetBanner() {
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowBanner(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{glamStyles}</style>

      <div className="glam-takeover-wrapper">
        {/* Scanline overlay */}
        <div className="glam-scanlines" />

        {/* Glitch flash messages */}
        <GlitchFlash />
        <GlitchFlash />

        {/* ── Main grid: 3 Baccarat crystal panels ── */}
        <div className={`glam-panels-grid ${showBanner ? "glam-visible" : ""}`}>
          {/* Panel 1: Swirl crystal with mannequin peek */}
          <div className="glam-panel">
            <img
              src="/crystal-swirl.jpg"
              alt=""
              className="glam-panel-bg"
            />
            <div className="glam-panel-overlay" />
            <div className="glam-mannequin-peek">
              <img
                src="/dash-mannequin-promo.jpg"
                alt="GlaMannequin"
                className="glam-mannequin-img"
              />
            </div>
          </div>

          {/* Panel 2: Star crystal with typewriter text */}
          <div className="glam-panel glam-panel-text">
            <img
              src="/crystal-star.jpg"
              alt=""
              className="glam-panel-bg"
              style={{ objectPosition: "center 40%" }}
            />
            <div className="glam-panel-overlay glam-panel-overlay-text" />
            <div className="glam-text-overlay">
              <TypewriterText onComplete={() => setTypewriterDone(true)} />
            </div>
          </div>

          {/* Panel 3: Facet crystal with video */}
          <div className="glam-panel">
            <img
              src="/crystal-facet.jpg"
              alt=""
              className="glam-panel-bg"
              style={{ objectPosition: "center 80%" }}
            />
            <div className="glam-panel-overlay" />
            <div className="glam-video-container">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="/dash-set-promo-poster.jpg"
                className="glam-video"
              >
                <source src="/dash-set-promo.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        {/* ── Bottom bar: "Shop Now" with glitch ── */}
        <div className={`glam-bottom-bar ${typewriterDone ? "glam-visible" : ""}`}>
          <div className="glam-bottom-left">
            <span className="glam-tag">✦ GLAMANNEQUIN TAKEOVER ✦</span>
          </div>
          <Link to="/shop" className="glam-shop-btn">
            SHOP THE COLLECTION →
          </Link>
        </div>
      </div>
    </>
  );
}

/* ── All styles scoped with .glam- prefix ── */
const glamStyles = `
  @import url('https://fonts.googleapis.com/css2?family=VT323&family=Press+Start+2P&display=swap');

  .glam-takeover-wrapper {
    position: relative;
    width: 100%;
    background: #FAF8F3;
    overflow: hidden;
  }

  /* ── Scanlines ── */
  .glam-scanlines {
    position: absolute;
    inset: 0;
    z-index: 20;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
    animation: glam-scanline-move 8s linear infinite;
  }

  @keyframes glam-scanline-move {
    0% { background-position: 0 0; }
    100% { background-position: 0 100px; }
  }

  /* ── Panel grid — always horizontal (3-col), scales down on mobile ── */
  .glam-panels-grid {
    display: grid;
    grid-template-columns: 1fr 1.4fr 1fr;
    gap: 4px;
    padding: 4px;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .glam-panels-grid.glam-visible {
    opacity: 1;
    transform: translateY(0);
  }

  @media (min-width: 768px) {
    .glam-panels-grid {
      gap: 8px;
      padding: 8px;
    }
  }

  /* ── Individual panels ── */
  .glam-panel {
    position: relative;
    overflow: hidden;
    min-height: 120px;
    border: 1px solid rgba(184,148,63,0.1);
    border-radius: 4px;
  }

  @media (min-width: 768px) {
    .glam-panel {
      min-height: 320px;
      border-radius: 8px;
    }
  }

  .glam-panel-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: glam-shimmer 6s ease-in-out infinite alternate;
  }

  @keyframes glam-shimmer {
    0% { filter: brightness(1.0) contrast(1.05); }
    50% { filter: brightness(1.15) contrast(1.1); }
    100% { filter: brightness(1.05) contrast(1.0); }
  }

  .glam-panel-overlay {
    position: absolute;
    inset: 0;
    background: rgba(17,17,24,0.4);
  }

  .glam-panel-overlay-text {
    background: rgba(255,255,255,0.5);
  }

  /* ── Mannequin peek ── */
  .glam-mannequin-peek {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
  }

  .glam-mannequin-img {
    height: 100%;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 20px rgba(184,148,63,0.2));
    animation: glam-mannequin-float 4s ease-in-out infinite alternate;
  }

  @keyframes glam-mannequin-float {
    0% { transform: translateY(2px) scale(1); }
    100% { transform: translateY(-2px) scale(1.01); }
  }

  /* ── Text overlay panel ── */
  .glam-text-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: 6px;
    z-index: 10;
  }

  @media (min-width: 768px) {
    .glam-text-overlay {
      padding: 24px;
    }
  }

  .glam-typewriter-container {
    max-width: 100%;
  }

  .glam-typewriter-text {
    font-family: 'VT323', 'Courier New', monospace;
    font-size: clamp(10px, 2.8vw, 36px);
    line-height: 1.2;
    text-shadow:
      1px 1px 0 rgba(255,255,255,0.9),
      0 0 8px rgba(184,148,63,0.3);
    letter-spacing: 0.02em;
  }

  @media (min-width: 768px) {
    .glam-typewriter-text {
      font-size: clamp(18px, 4vw, 36px);
      line-height: 1.25;
      text-shadow:
        2px 2px 0 rgba(255,255,255,0.9),
        -1px -1px 0 rgba(17,17,24,0.5),
        0 0 12px rgba(184,148,63,0.3);
    }
  }

  /* Color classes */
  .glam-text-dark {
    color: #fff;
  }

  .glam-text-blue {
    color: #b8943f;
    background: rgba(184,148,63,0.25);
    padding: 0 2px;
    text-shadow:
      2px 2px 0 rgba(0,0,0,0.5),
      0 0 20px rgba(184,148,63,0.5);
  }

  .glam-text-red {
    color: #ff4444;
    background: rgba(255,40,40,0.2);
    padding: 0 2px;
    text-shadow:
      2px 2px 0 rgba(0,0,0,0.5),
      0 0 15px rgba(255,40,40,0.4);
  }

  .glam-text-gold {
    color: #ffb800;
    background: rgba(255,180,0,0.2);
    padding: 0 4px;
    text-shadow:
      2px 2px 0 rgba(0,0,0,0.5),
      0 0 20px rgba(255,180,0,0.5);
    font-weight: bold;
  }

  /* Blinking cursor */
  .glam-cursor {
    color: #b8943f;
    animation: glam-blink 0.6s step-end infinite;
    font-size: 0.9em;
  }

  @keyframes glam-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* ── Glitch flash messages ── */
  .glam-glitch-flash {
    position: absolute;
    z-index: 25;
    font-family: 'VT323', monospace;
    font-size: clamp(10px, 1.5vw, 14px);
    color: rgba(184,148,63,0.7);
    text-shadow: 0 0 8px rgba(184,148,63,0.4);
    letter-spacing: 0.15em;
    pointer-events: none;
    animation: glam-flash-in 0.15s ease-out;
    white-space: nowrap;
  }

  @keyframes glam-flash-in {
    0% { opacity: 0; transform: translateX(-5px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  /* ── Video container ── */
  .glam-video-container {
    position: absolute;
    inset: 4px;
    z-index: 5;
    border: 1px solid rgba(184,148,63,0.2);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 0 12px rgba(184,148,63,0.1);
  }

  @media (min-width: 768px) {
    .glam-video-container {
      inset: 12px;
      border-width: 2px;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(184,148,63,0.1);
    }
  }

  .glam-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* ── Bottom bar ── */
  .glam-bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background: rgba(13,13,20,0.95);
    border-top: 1px solid rgba(184,148,63,0.1);
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s;
  }

  @media (min-width: 768px) {
    .glam-bottom-bar {
      padding: 10px 16px;
    }
  }

  .glam-bottom-bar.glam-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .glam-tag {
    font-family: 'VT323', monospace;
    font-size: clamp(7px, 1.5vw, 13px);
    letter-spacing: 0.1em;
    color: rgba(184,148,63,0.6);
    animation: glam-tag-pulse 2s ease-in-out infinite;
    white-space: nowrap;
  }

  @media (min-width: 768px) {
    .glam-tag {
      letter-spacing: 0.25em;
    }
  }

  @keyframes glam-tag-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .glam-shop-btn {
    font-family: 'VT323', monospace;
    font-size: clamp(8px, 1.8vw, 14px);
    letter-spacing: 0.1em;
    color: #b8943f;
    text-decoration: none;
    padding: 4px 8px;
    border: 1px solid rgba(184,148,63,0.2);
    border-radius: 4px;
    background: rgba(184,148,63,0.05);
    transition: all 0.2s ease;
    text-shadow: 0 0 8px rgba(184,148,63,0.2);
    white-space: nowrap;
  }

  @media (min-width: 768px) {
    .glam-shop-btn {
      padding: 6px 16px;
      letter-spacing: 0.2em;
    }
  }

  .glam-shop-btn:hover {
    background: rgba(184,148,63,0.1);
    border-color: rgba(184,148,63,0.4);
    box-shadow: 0 0 16px rgba(184,148,63,0.15);
    transform: scale(1.03);
  }

  /* ── Occasional full-screen glitch bar ── */
  .glam-takeover-wrapper::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(184,148,63,0.3);
    z-index: 30;
    pointer-events: none;
    animation: glam-glitch-bar 4s ease-in-out infinite;
  }

  @keyframes glam-glitch-bar {
    0%, 92%, 100% { top: -5px; opacity: 0; }
    94% { top: 20%; opacity: 1; }
    95% { top: 60%; opacity: 0.6; }
    96% { top: 80%; opacity: 0; }
  }
`;
