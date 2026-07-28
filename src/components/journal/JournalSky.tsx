import { useEffect, useMemo, useState } from "react";
import {
  getLuminaryPosition,
  getPageSkyGradient,
  getSkyPhase,
  resolveWeather,
  seededRng,
  type SkyPhase,
  type WeatherCondition,
} from "../../lib/sky";

/* ═══════════════════════════════════════════════════════════════════════
   THE JOURNAL SKY — full-page living backdrop.

   The Journal reads as a stack of glass cards floating in the house sky.
   The sky is real: it follows the visitor's local hour (dawn / day / dusk /
   night) and their live weather, and the cloud field drifts slowly enough
   to be soothing rather than busy (three depth layers, 3–8 minutes per
   traverse). Fully behind content, never interactive, and it stands still
   for anyone who asked their system to reduce motion.
   ═══════════════════════════════════════════════════════════════════════ */

interface Cloud {
  y: number;
  scale: number;
  speed: number;
  delay: number;
  opacity: number;
  layer: "back" | "mid" | "front";
  bob: number;
}

/** One soft cumulus, built from overlapping ellipses. */
function Cumulus({ c, color, highlight }: { c: Cloud; color: string; highlight: string }) {
  return (
    <g
      className="jsky-drifter"
      style={{ animationDuration: `${c.speed}s`, animationDelay: `${c.delay}s` }}
    >
      <g transform={`translate(0, ${c.y})`}>
        <g
          className="jsky-bobber"
          style={{ animationDuration: `${c.bob}s`, animationDelay: `${c.delay / 3}s` }}
        >
          <g transform={`scale(${c.scale})`} opacity={c.opacity}>
            <ellipse cx="0" cy="9" rx="46" ry="9" fill={color} />
            <ellipse cx="-24" cy="1" rx="20" ry="16" fill={color} />
            <ellipse cx="0" cy="-7" rx="26" ry="21" fill={color} />
            <ellipse cx="22" cy="0" rx="19" ry="15" fill={color} />
            <ellipse cx="-10" cy="-15" rx="15" ry="12" fill={color} />
            <ellipse cx="13" cy="-12" rx="13" ry="11" fill={color} />
            {/* sunlit crown */}
            <ellipse cx="-2" cy="-18" rx="18" ry="7" fill={highlight} opacity="0.75" />
          </g>
        </g>
      </g>
    </g>
  );
}

export function JournalSky() {
  const [phase, setPhase] = useState<SkyPhase>(() => getSkyPhase());
  const [weather, setWeather] = useState<WeatherCondition>("clear");

  useEffect(() => {
    const id = setInterval(() => setPhase(getSkyPhase()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
    void resolveWeather().then((w) => {
      if (alive && w) setWeather(w);
    });
    return () => {
      alive = false;
    };
  }, []);

  const isNight = phase === "night";
  const isDawn = phase === "dawn";
  const isDusk = phase === "dusk";
  const wet = weather === "rain" || weather === "storm";
  const lum = getLuminaryPosition(phase);

  const cloudColor = isNight
    ? "rgba(150,178,214,0.34)"
    : isDusk
      ? "rgba(236,186,190,0.5)"
      : isDawn
        ? "rgba(255,222,186,0.55)"
        : wet
          ? "rgba(168,178,192,0.6)"
          : "rgba(255,255,255,0.66)";

  const cloudHighlight = isNight
    ? "rgba(196,215,240,0.3)"
    : isDusk
      ? "rgba(255,214,190,0.5)"
      : isDawn
        ? "rgba(255,246,214,0.55)"
        : "rgba(255,255,255,0.85)";

  /* Three depth layers, 26 clouds, deterministic. */
  const clouds = useMemo<Cloud[]>(() => {
    const rng = seededRng(1116);
    const out: Cloud[] = [];
    for (let i = 0; i < 22; i++) {
      const layer: Cloud["layer"] = i < 9 ? "back" : i < 16 ? "mid" : "front";
      const scale =
        layer === "back" ? 0.42 + rng() * 0.26 : layer === "mid" ? 0.66 + rng() * 0.34 : 0.95 + rng() * 0.5;
      /* Slow on purpose: 8 min for far clouds, ~3.5 min for the near ones. */
      const speed =
        layer === "back" ? 420 + rng() * 120 : layer === "mid" ? 300 + rng() * 90 : 210 + rng() * 70;
      const base =
        layer === "back" ? 0.34 + rng() * 0.18 : layer === "mid" ? 0.46 + rng() * 0.2 : 0.6 + rng() * 0.22;
      out.push({
        y: 24 + rng() * 620,
        scale,
        speed,
        delay: -(rng() * speed),
        opacity: weather === "cloudy" ? Math.min(base + 0.22, 0.96) : base,
        layer,
        bob: 15 + rng() * 13,
      });
    }
    return out;
  }, [weather]);

  const rain = useMemo(() => {
    const rng = seededRng(47);
    return Array.from({ length: weather === "storm" ? 90 : 60 }, () => ({
      left: rng() * 100,
      len: 14 + rng() * 26,
      dur: 0.5 + rng() * 0.5,
      delay: rng() * 1.4,
      op: 0.18 + rng() * 0.24,
    }));
  }, [weather]);

  const byLayer = (l: Cloud["layer"]) => clouds.filter((c) => c.layer === l);

  return (
    <div className={`jsky jsky--${phase} jsky--${weather}`} aria-hidden="true">
      <style>{`
        @keyframes jsky-drift {
          from { transform: translateX(1420px); }
          to   { transform: translateX(-280px); }
        }
        @keyframes jsky-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes jsky-breathe {
          0%, 100% { opacity: .55; transform: scale(1); }
          50%      { opacity: .9;  transform: scale(1.05); }
        }
        @keyframes jsky-fall {
          from { transform: translateY(-8vh); opacity: 0; }
          10%  { opacity: 1; }
          to   { transform: translateY(108vh); opacity: 0; }
        }
        @keyframes jsky-flicker {
          0%, 91%, 93%, 95%, 100% { opacity: 0; }
          92% { opacity: .3; }
          94% { opacity: .5; }
        }
        .jsky-drifter { animation-name: jsky-drift; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
        .jsky-luminary { animation: jsky-breathe 11s ease-in-out infinite; }
        .jsky-bobber  { animation-name: jsky-bob; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @media (prefers-reduced-motion: reduce) {
          .jsky-drifter, .jsky-bobber, .jsky-luminary, .jsky-drop, .jsky-flash { animation: none !important; }
          .jsky-drop { display: none; }
        }
      `}</style>

      {/* Sky wash */}
      <div className="jsky__wash" style={{ backgroundImage: getPageSkyGradient(phase, weather) }} />

      {/* Sun or moon */}
      <div className="jsky__lum" style={{ left: `${lum.x}%`, top: `${lum.y}%` }}>
        <div
          className="jsky__lum-halo jsky-luminary"
          style={{
            background: isNight
              ? "radial-gradient(circle, rgba(226,235,255,.42) 0%, rgba(168,196,240,.16) 42%, transparent 72%)"
              : isDawn
                ? "radial-gradient(circle, rgba(255,214,142,.5) 0%, rgba(255,174,96,.2) 42%, transparent 72%)"
                : isDusk
                  ? "radial-gradient(circle, rgba(255,182,132,.5) 0%, rgba(226,122,96,.2) 44%, transparent 74%)"
                  : "radial-gradient(circle, rgba(255,252,224,.6) 0%, rgba(255,232,150,.24) 40%, transparent 72%)",
            opacity: wet ? 0.35 : 1,
          }}
        />
        <div
          className="jsky__lum-core"
          style={{
            background: isNight
              ? "radial-gradient(circle at 38% 34%, #fdfeff 0%, #e6ecfb 55%, #c3cfe6 100%)"
              : isDawn
                ? "radial-gradient(circle, #ffeab4 0%, #ffcd6b 52%, #eda63c 100%)"
                : isDusk
                  ? "radial-gradient(circle, #ffe0bc 0%, #ffab6a 52%, #e2703f 100%)"
                  : "radial-gradient(circle, #fffef4 0%, #fff6c8 44%, #ffe988 100%)",
            boxShadow: isNight
              ? "0 0 26px 8px rgba(214,228,255,.34)"
              : "0 0 34px 12px rgba(255,226,150,.34)",
            opacity: wet ? 0.4 : 1,
          }}
        />
      </div>

      {/* Cloud field */}
      <svg className="jsky__clouds" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="jskyFar" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="jskyMid" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="jskyNear" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
        </defs>
        <g filter="url(#jskyFar)" opacity="0.8">
          {byLayer("back").map((c, i) => (
            <Cumulus key={`b${i}`} c={c} color={cloudColor} highlight={cloudHighlight} />
          ))}
        </g>
        <g filter="url(#jskyMid)" opacity="0.9">
          {byLayer("mid").map((c, i) => (
            <Cumulus key={`m${i}`} c={c} color={cloudColor} highlight={cloudHighlight} />
          ))}
        </g>
        <g filter="url(#jskyNear)">
          {byLayer("front").map((c, i) => (
            <Cumulus key={`f${i}`} c={c} color={cloudColor} highlight={cloudHighlight} />
          ))}
        </g>
      </svg>

      {/* Weather */}
      {wet && (
        <div className="jsky__rain">
          {rain.map((r, i) => (
            <span
              key={i}
              className="jsky-drop"
              style={{
                left: `${r.left}%`,
                height: r.len,
                opacity: r.op,
                animation: `jsky-fall ${r.dur}s linear infinite`,
                animationDelay: `${r.delay}s`,
              }}
            />
          ))}
        </div>
      )}
      {weather === "storm" && <div className="jsky__flash jsky-flash" />}

      {/* Readability veil + horizon lift — keeps glass cards legible in every phase */}
      <div className="jsky__veil" />
      <div className="jsky__grain" />
    </div>
  );
}

export default JournalSky;
