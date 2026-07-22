import { Link } from "react-router-dom";
import { DynamicSkyBar } from "./DynamicSkyBar";

/* ═══════════════════════════════════════════════════════════
   CLOSET HERO — Luxury Retail Store V38b

   STATIC LAYOUT: Mannequins stay full-size (620px) always.
   MOBILE: Mannequins reposition to viewport; store BG crops.
   SKY CEILING: Full-width dynamic sky extending from navbar.
   PEDESTALS: Mannequin feet planted ON the pedestals.
   ═══════════════════════════════════════════════════════════ */

export function ClosetHero() {
  return (
    <>
      <style>{`
        /* ── Outer frame ── */
        .store-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          max-height: 920px;
          min-height: 600px;
          overflow: hidden;
          background: #050510;
        }

        /* ── Background: centered fixed-width ── */
        .store-bg {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 1400px;
          height: 100%;
          background-image: url('/store-panoramic.jpg');
          background-size: cover;
          background-position: center 48%;
          background-repeat: no-repeat;
          z-index: 1;
        }

        /* ── Sky Ceiling — FULL WIDTH, seamless from navbar ── */
        .sky-ceiling {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 18%;
          z-index: 2;
          overflow: hidden;
        }
        .sky-ceiling-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 50%;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(5,5,20,0.3) 40%,
            rgba(5,5,20,0.75) 100%
          );
        }
        .sky-ceiling-led {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background-image: radial-gradient(
            circle at center,
            transparent 1.1px,
            rgba(0, 2, 8, 0.68) 1.3px
          );
          background-size: 4px 4px;
        }

        .store-vignette {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background: radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.15) 100%);
        }

        /* ═══ STATIC STAGE — 1400px centered ═══ */
        .store-stage {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 1400px;
          height: 100%;
          z-index: 10;
          pointer-events: none;
        }

        /* ── Mannequin + Pedestal unit ── */
        .mannequin-unit {
          position: absolute;
          bottom: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }

        .mannequin-unit img {
          height: min(620px, 68vh);
          width: auto;
          max-width: 100%;
          object-fit: contain;
          filter: drop-shadow(0 4px 30px rgba(0,0,0,0.5))
                  drop-shadow(0 0 40px rgba(0,0,0,0.25));
        }

        /* ── Pedestal — wide circular platform ── */
        .pedestal {
          width: 200px;
          height: 30px;
          margin-top: -22px;
          border-radius: 50%;
          background: linear-gradient(
            180deg,
            rgba(220,195,130,0.55) 0%,
            rgba(184,148,63,0.65) 25%,
            rgba(120,95,35,0.55) 55%,
            rgba(40,30,10,0.75) 100%
          );
          box-shadow:
            0 3px 18px rgba(184,148,63,0.35),
            0 8px 36px rgba(0,0,0,0.5),
            inset 0 2px 5px rgba(255,220,130,0.35),
            0 0 25px rgba(184,148,63,0.12);
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        /* Women's — ~33% of 1400 = 462 (DESKTOP) */
        .mannequin-women-unit {
          left: 462px;
          transform: translateX(-50%);
        }

        /* Men's — ~62% of 1400 = 868 (DESKTOP) */
        .mannequin-men-unit {
          left: 868px;
          transform: translateX(-50%);
        }

        /* ── CTA Buttons ── */
        .store-cta-wrap {
          position: absolute;
          bottom: 0;
          z-index: 15;
          pointer-events: auto;
          transform: translateX(-50%);
        }
        .store-cta-women-wrap { left: 462px; }
        .store-cta-men-wrap { left: 868px; }

        .store-cta {
          display: inline-block;
          padding: 10px 32px;
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          font-weight: 600;
          color: rgba(255,255,255,0.92);
          background: rgba(5,5,10,0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(184,148,63,0.35);
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.35s ease;
          white-space: nowrap;
          pointer-events: auto;
        }
        .store-cta:hover {
          background: rgba(184,148,63,0.2);
          border-color: rgba(184,148,63,0.6);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 32px rgba(184,148,63,0.2);
        }

        .store-bottom-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3%;
          z-index: 12;
          pointer-events: none;
          background: linear-gradient(transparent, rgba(5,5,8,0.2));
        }

        /* ═══════════════════════════════════════════════════
           MOBILE / PORTRAIT — Fluid, balanced composition.
           ═══════════════════════════════════════════════════ */

        @media (max-width: 768px) {
          .store-hero {
            height: min(820px, calc(100svh - 92px));
            min-height: 620px;
          }

          .sky-ceiling { height: 20%; }

          .store-stage {
            width: 100%;
            left: 0;
            transform: none;
            display: flex;
            justify-content: center;
            align-items: end;
            padding: 0 4px 66px;
            gap: 4px;
          }

          .store-bg {
            width: 100%;
            background-size: auto 100%;
            background-position: center bottom;
          }

          .mannequin-unit {
            position: relative;
            left: auto;
            bottom: auto;
            transform: none;
            min-width: 0;
            flex: 0 0 auto;
          }

          .mannequin-unit img {
            width: auto;
            height: min(56svh, 500px, calc((100vw - 12px) / 1.374));
            max-width: none;
          }

          .mannequin-women-unit,
          .mannequin-men-unit { flex-shrink: 0; }
          .pedestal {
            width: min(150px, 85%);
            height: 22px;
            margin-top: -15px;
          }
          .store-cta-wrap { bottom: 18px; }
          .store-cta-women-wrap { left: 25%; }
          .store-cta-men-wrap { left: 75%; }
          .store-cta {
            padding: 8px 14px;
            font-size: 9px;
            letter-spacing: 0.14em;
          }
        }

        /* ── Small phones (≤430px) ── */
        @media (max-width: 430px) {
          .store-hero {
            height: min(760px, calc(100svh - 92px));
            min-height: 580px;
          }
          .store-cta {
            padding: 7px 11px;
            font-size: 8px;
          }
        }

        /* ── Landscape mobile (short viewport) ── */
        @media (max-height: 500px) {
          .store-hero {
            min-height: 450px;
          }
          .sky-ceiling {
            height: 22%;
          }
        }
      `}</style>

      <div className="store-hero">
        <div className="store-bg" />

        {/* Sky Ceiling — full width, seamless from navbar */}
        <div className="sky-ceiling">
          <DynamicSkyBar />
          <div className="sky-ceiling-led" />
          <div className="sky-ceiling-fade" />
        </div>

        <div className="store-vignette" />

        {/* ═══ STATIC STAGE ═══ */}
        <div className="store-stage">
          {/* Women's mannequin on pedestal */}
          <div className="mannequin-unit mannequin-women-unit">
            <img src="/mannequin-women-v37.png" alt="Women's Collection" />
            <div className="pedestal" />
          </div>

          {/* Men's mannequin on pedestal */}
          <div className="mannequin-unit mannequin-men-unit">
            <img src="/mannequin-men-v31.png" alt="Men's Collection" />
            <div className="pedestal" />
          </div>

          {/* CTAs */}
          <div className="store-cta-wrap store-cta-women-wrap">
            <Link to="/shop?gender=women" className="store-cta">Shop Women</Link>
          </div>
          <div className="store-cta-wrap store-cta-men-wrap">
            <Link to="/shop?gender=men" className="store-cta">Shop Men</Link>
          </div>
        </div>

        <div className="store-bottom-fade" />
      </div>
    </>
  );
}
