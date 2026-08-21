import { useMemo } from "react";
import { seededRng } from "../../lib/sky";

/* ═══════════════════════════════════════════════════════════════════════
   TRUE NORTH ATMOSPHERE — the destination's own distinct mood.

   Where the Journal reads as a bright living sky, True North reads as
   walking into a fortune-teller's room: dark jewel tones, candlelight,
   drifting incense smoke, small hopeful glints of gold in the dark. Same
   brand grammar (collage titles, gold/ink/lilac tags) — its own realm.
   Deterministic (seeded), fully behind content, stands still for anyone
   who asked their system to reduce motion.
   ═══════════════════════════════════════════════════════════════════════ */

interface Wisp {
  left: number;
  delay: number;
  dur: number;
  scale: number;
  opacity: number;
  drift: number;
}

interface Mote {
  left: number;
  top: number;
  delay: number;
  dur: number;
  size: number;
  opacity: number;
}

export function TrueNorthAtmosphere() {
  const isNarrow =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 640px)").matches;

  const wisps = useMemo<Wisp[]>(() => {
    const rng = seededRng(1116);
    const n = isNarrow ? 3 : 6;
    return Array.from({ length: n }, () => ({
      left: 6 + rng() * 88,
      delay: -(rng() * 34),
      dur: 24 + rng() * 16,
      scale: 0.6 + rng() * 0.9,
      opacity: 0.1 + rng() * 0.14,
      drift: rng() > 0.5 ? 1 : -1,
    }));
  }, [isNarrow]);

  const motes = useMemo<Mote[]>(() => {
    const rng = seededRng(4477);
    const n = isNarrow ? 12 : 22;
    return Array.from({ length: n }, () => ({
      left: rng() * 100,
      top: 10 + rng() * 90,
      delay: -(rng() * 16),
      dur: 8 + rng() * 9,
      size: 1 + rng() * 2.2,
      opacity: 0.28 + rng() * 0.42,
    }));
  }, [isNarrow]);

  return (
    <div className="tn-atmo" aria-hidden="true">
      <style>{`
        @keyframes tn-atmo-rise {
          0%   { transform: translateY(14vh) translateX(0) scale(0.9); opacity: 0; }
          12%  { opacity: 1; }
          50%  { transform: translateY(-40vh) translateX(calc(var(--tn-drift, 1) * 24px)) scale(1.15); }
          88%  { opacity: 0; }
          100% { transform: translateY(-104vh) translateX(calc(var(--tn-drift, 1) * 46px)) scale(1.3); opacity: 0; }
        }
        @keyframes tn-atmo-flicker {
          0%, 100% { opacity: .7; transform: scale(1); }
          38% { opacity: .95; transform: scale(1.05); }
          52% { opacity: .62; transform: scale(0.97); }
          74% { opacity: .88; transform: scale(1.03); }
        }
        @keyframes tn-atmo-twinkle {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.6); }
          45% { opacity: 1; transform: translateY(-6px) scale(1); }
          70% { opacity: 0; transform: translateY(-14px) scale(0.8); }
        }
        .tn-atmo-wisp { animation-name: tn-atmo-rise; animation-timing-function: ease-in-out; animation-iteration-count: infinite; will-change: transform, opacity; }
        .tn-atmo-candle { animation: tn-atmo-flicker 6.5s ease-in-out infinite; }
        .tn-atmo-mote { animation-name: tn-atmo-twinkle; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @media (prefers-reduced-motion: reduce) {
          .tn-atmo-wisp, .tn-atmo-candle, .tn-atmo-mote { animation: none !important; opacity: .4; }
        }
      `}</style>

      <div className="tn-atmo__wash" />

      <div className="tn-atmo__candle tn-atmo-candle" style={{ left: "14%", top: "22%", animationDelay: "-1.2s" }} />
      <div className="tn-atmo__candle tn-atmo-candle" style={{ left: "82%", top: "12%", animationDelay: "-3.4s" }} />
      <div className="tn-atmo__candle tn-atmo-candle" style={{ left: "68%", top: "68%", animationDelay: "-0.6s" }} />
      <div className="tn-atmo__candle tn-atmo-candle" style={{ left: "22%", top: "78%", animationDelay: "-4.8s" }} />

      {wisps.map((w, i) => (
        <div
          key={i}
          className="tn-atmo__wisp tn-atmo-wisp"
          style={{
            left: `${w.left}%`,
            opacity: w.opacity,
            animationDuration: `${w.dur}s`,
            animationDelay: `${w.delay}s`,
            ["--tn-drift" as string]: w.drift,
            transform: `scale(${w.scale})`,
          }}
        />
      ))}

      <div className="tn-atmo__motes">
        {motes.map((m, i) => (
          <span
            key={i}
            className="tn-atmo__mote tn-atmo-mote"
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: m.size,
              height: m.size,
              opacity: m.opacity,
              animationDuration: `${m.dur}s`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="tn-atmo__vignette" />
      <div className="tn-atmo__grain" />
    </div>
  );
}

export default TrueNorthAtmosphere;
