import { useState, useEffect, useMemo, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   DYNAMIC SKY LED BAR — V2
   • Richer sky gradients with more blue depth
   • Detailed multi-layered cumulus clouds
   • Sun with glow + radiating rays (daytime)
   • Moon + stars (night)
   • Weather-reactive (Open-Meteo API, no key needed)
   • LED pixel marquee grid overlay
   ═══════════════════════════════════════════════════════════ */

type SkyPhase = "night" | "dawn" | "day" | "dusk";
type WeatherCondition = "clear" | "cloudy" | "rain" | "storm";

function getSkyPhase(): SkyPhase {
  const h = new Date().getHours();
  if (h >= 5 && h < 7) return "dawn";
  if (h >= 7 && h < 18) return "day";
  if (h >= 18 && h < 20) return "dusk";
  return "night";
}

function getSkyGradient(phase: SkyPhase, weather: WeatherCondition): string {
  if (weather === "rain" || weather === "storm") {
    switch (phase) {
      case "day":   return "linear-gradient(180deg, #2a3545 0%, #3d4d5e 20%, #4a5a6a 40%, #556270 60%, #6d7a88 80%, #8a939e 100%)";
      case "dawn":  return "linear-gradient(180deg, #1a1530 0%, #3a2545 20%, #5a3858 40%, #7a5060 70%, #9a7878 100%)";
      case "dusk":  return "linear-gradient(180deg, #0f0f20 0%, #1e1835 20%, #352848 40%, #504060 70%, #6a6070 100%)";
      case "night": return "linear-gradient(180deg, #061126 0%, #0a1c38 24%, #102b50 48%, #173c69 72%, #1e4e7e 100%)";
    }
  }
  if (weather === "cloudy") {
    switch (phase) {
      case "day":   return "linear-gradient(180deg, #3a5575 0%, #4a6888 20%, #5e7ea0 40%, #7898b5 60%, #8eacc5 80%, #a5c0d5 100%)";
      case "dawn":  return "linear-gradient(180deg, #1a1540 0%, #3d2850 20%, #6a4558 40%, #a06858 70%, #c89870 100%)";
      case "dusk":  return "linear-gradient(180deg, #0f0f28 0%, #252040 20%, #3a2850 40%, #6a4868 70%, #8a6878 100%)";
      case "night": return "linear-gradient(180deg, #071329 0%, #0c2140 22%, #153258 48%, #244a72 74%, #315f87 100%)";
    }
  }
  /* Clear sky — rich blue depth */
  switch (phase) {
    case "day":   return "linear-gradient(180deg, #0a1e4a 0%, #0e2a60 12%, #154080 25%, #1e58a0 38%, #2870b8 50%, #3a88cc 62%, #55a0dd 75%, #78bce8 88%, #a0d4f2 100%)";
    case "dawn":  return "linear-gradient(180deg, #0e0828 0%, #2a1040 15%, #5a1e48 30%, #9a4040 45%, #cc7048 60%, #e89858 75%, #f5be72 90%, #fad888 100%)";
    case "dusk":  return "linear-gradient(180deg, #060810 0%, #0e0e20 12%, #1a1235 25%, #3a1848 38%, #6b2850 50%, #a84848 62%, #d4784a 75%, #f0a858 90%, #f5c070 100%)";
    case "night": return "linear-gradient(180deg, #040b1b 0%, #07162f 15%, #0b2244 30%, #11325a 48%, #184473 66%, #245a8e 84%, #3472a3 100%)";
  }
}

function weatherCodeToCondition(code: number): WeatherCondition {
  if (code >= 95) return "storm";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([2, 3, 45, 48].includes(code)) return "cloudy";
  return "clear";
}

/* Seeded PRNG for deterministic positions */
function seededRng(seed: number) {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/* ─── Cloud Shape Component ─── */
function CloudShape({
  x,
  y,
  scale,
  opacity,
  speed,
  delay,
  color,
}: {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  speed: number;
  delay: number;
  color: string;
}) {
  /* Each cloud = overlapping ellipses forming a cumulus shape */
  return (
    <g
      style={{
        animation: `dsky-drift ${speed}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
        {/* Bottom flat base */}
        <ellipse cx="0" cy="8" rx="35" ry="8" fill={color} />
        {/* Left puff */}
        <ellipse cx="-18" cy="0" rx="16" ry="14" fill={color} />
        {/* Center puff (tallest) */}
        <ellipse cx="0" cy="-6" rx="20" ry="18" fill={color} />
        {/* Right puff */}
        <ellipse cx="16" cy="-1" rx="15" ry="13" fill={color} />
        {/* Extra top detail */}
        <ellipse cx="-8" cy="-12" rx="12" ry="10" fill={color} />
        <ellipse cx="10" cy="-10" rx="10" ry="9" fill={color} />
        {/* Highlight layer — subtle bright edge on top */}
        <ellipse cx="-2" cy="-14" rx="14" ry="6" fill={color} opacity="0.6" />
      </g>
    </g>
  );
}

export function DynamicSkyBar() {
  const [phase, setPhase] = useState<SkyPhase>(getSkyPhase());
  const [weather, setWeather] = useState<WeatherCondition>("clear");
  const containerRef = useRef<HTMLDivElement>(null);

  /* Update phase every 30 seconds for smoother transitions */
  useEffect(() => {
    const t = setInterval(() => setPhase(getSkyPhase()), 30_000);
    return () => clearInterval(t);
  }, []);

  /* Fetch weather */
  useEffect(() => {
    const fetchWeather = async (lat: number, lng: number) => {
      try {
        const r = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
        );
        const d = await r.json();
        const code = d?.current_weather?.weathercode ?? 0;
        setWeather(weatherCodeToCondition(code));
      } catch {}
    };

    const locateByNetwork = async () => {
      try {
        const cached = sessionStorage.getItem("xixvi-weather-location");
        if (cached) {
          const { latitude, longitude } = JSON.parse(cached);
          await fetchWeather(latitude, longitude);
          return;
        }
        const response = await fetch("https://ipwho.is/");
        const location = await response.json();
        if (typeof location?.latitude === "number" && typeof location?.longitude === "number") {
          sessionStorage.setItem("xixvi-weather-location", JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
          }));
          await fetchWeather(location.latitude, location.longitude);
        }
      } catch {}
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => void locateByNetwork(),
        { timeout: 4000, maximumAge: 600000 }
      );
    } else void locateByNetwork();
  }, []);

  const isNight = phase === "night";
  const isDusk = phase === "dusk";
  const isDawn = phase === "dawn";
  const isDay = phase === "day";
  const showStars = isNight || isDusk;  /* No twinkle during day or dawn */
  const showSun = isDay || isDawn;
  // Moon removed per request
  const isRaining = weather === "rain" || weather === "storm";

  /* Cloud color by phase — richer, more visible */
  const cloudColor = useMemo(() => {
    if (isNight) return "rgba(130,160,200,0.45)";
    if (isDusk) return "rgba(220,160,170,0.6)";
    if (isDawn) return "rgba(255,210,160,0.65)";
    if (isRaining) return "rgba(155,165,180,0.7)";
    return "rgba(255,255,255,0.75)";
  }, [phase, isNight, isDusk, isDawn, isRaining]);

  /* Bright highlight color for cloud tops — more vivid */
  const cloudHighlight = useMemo(() => {
    if (isNight) return "rgba(70,85,120,0.4)";
    if (isDusk) return "rgba(255,195,165,0.5)";
    if (isDawn) return "rgba(255,240,195,0.55)";
    return "rgba(255,255,255,0.6)";
  }, [phase, isNight, isDusk, isDawn]);

  /* Deterministic star positions — dense starfield for night sky */
  const stars = useMemo(() => {
    const rng = seededRng(42);
    const result = [];
    /* 120 stars: mix of tiny background stars + medium + a few bright ones */
    for (let i = 0; i < 120; i++) {
      const r = rng();
      const isBright = r > 0.92;      /* ~8% bright stars */
      const isMedium = r > 0.65;      /* ~27% medium */
      /* rest are tiny background stars */
      const tint = rng();
      result.push({
        left: rng() * 100,
        top: rng() * 100,
        size: isBright ? 2.5 + rng() * 1.5 : isMedium ? 1.5 + rng() * 0.8 : 0.6 + rng() * 0.6,
        delay: rng() * 6,
        dur: isBright ? 3 + rng() * 3 : 2 + rng() * 4,
        brightness: isBright ? 0.85 + rng() * 0.15 : isMedium ? 0.5 + rng() * 0.4 : 0.25 + rng() * 0.35,
        /* Some stars have a subtle color tint */
        color: isBright
          ? (tint > 0.7 ? "rgba(180,200,255,1)" : tint > 0.4 ? "rgba(255,230,200,1)" : "#fff")
          : "#fff",
      });
    }
    return result;
  }, []);

  /* Shooting stars — occasional streaks across the sky */
  const shootingStars = useMemo(() => {
    const rng = seededRng(314);
    const result = [];
    for (let i = 0; i < 4; i++) {
      result.push({
        startX: 10 + rng() * 80,
        startY: 5 + rng() * 40,
        angle: 15 + rng() * 30,
        delay: 5 + rng() * 25,    /* stagger across 30 seconds */
        dur: 0.6 + rng() * 0.8,
        length: 40 + rng() * 60,
      });
    }
    return result;
  }, []);

  /* Deterministic rain */
  const raindrops = useMemo(() => {
    const rng = seededRng(99);
    const result = [];
    for (let i = 0; i < 60; i++) {
      result.push({
        left: rng() * 100,
        height: 8 + rng() * 18,
        dur: 0.2 + rng() * 0.3,
        delay: rng() * 0.6,
      });
    }
    return result;
  }, []);

  /* Cloud definitions — varied sizes and layers */
  const cloudDefs = useMemo(() => {
    const rng = seededRng(77);
    const result = [];
    /* 22 clouds across 3 depth layers — bolder, more visible drift */
    for (let i = 0; i < 22; i++) {
      const layer = i < 7 ? "back" : i < 14 ? "mid" : "front";
      const baseScale = layer === "back" ? 0.7 + rng() * 0.5 : layer === "mid" ? 1.0 + rng() * 0.7 : 1.3 + rng() * 0.9;
      const baseSpeed = layer === "back" ? 90 + rng() * 40 : layer === "mid" ? 60 + rng() * 30 : 40 + rng() * 20;
      const baseOpacity = layer === "back" ? 0.35 + rng() * 0.25 : layer === "mid" ? 0.5 + rng() * 0.3 : 0.65 + rng() * 0.25;
      result.push({
        y: 10 + rng() * 60,
        scale: baseScale,
        speed: baseSpeed,
        delay: -(rng() * baseSpeed),
        opacity: weather === "cloudy" ? Math.min(baseOpacity + 0.2, 0.95) : baseOpacity,
        layer,
      });
    }
    return result;
  }, [weather]);

  /* Sun position */
  const sunPos = useMemo(() => {
    if (isDawn) return { x: 88, y: 70 }; /* Low on horizon */
    return { x: 90, y: 18 }; /* Upper right for daytime */
  }, [isDawn]);

  return (
    <>
      <style>{`
        .dsky-bar {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .dsky-sky {
          position: absolute;
          inset: 0;
          transition: background-image 3s ease, filter 3s ease;
        }

        /* Cloud drift animation — continuous horizontal flow */
        @keyframes dsky-drift {
          0%   { transform: translateX(750px); }
          100% { transform: translateX(-250px); }
        }

        /* Subtle vertical bob for organic feel */
        @keyframes dsky-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        /* Star twinkle */
        .dsky-star {
          position: absolute;
          border-radius: 50%;
          background: #fff;
          will-change: opacity;
        }
        @keyframes dsky-twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 1; }
        }

        /* Rain */
        .dsky-rain {
          position: absolute;
          top: -20px;
          width: 1.5px;
          border-radius: 1px;
          will-change: transform;
        }
        @keyframes dsky-fall {
          0%   { transform: translateY(-20px); opacity: 0.8; }
          100% { transform: translateY(120px); opacity: 0; }
        }

        /* ── LED Pixel Grid ── */
        .dsky-led {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background-image: radial-gradient(
            circle at center,
            transparent 1.1px,
            rgba(0, 2, 8, 0.68) 1.3px
          );
          background-size: 4px 4px;
          transition: opacity 3s ease;
        }
        /* Reduce LED overlay at night so stars pop */
        .dsky-night .dsky-led {
          opacity: 0.6;
        }

        /* Horizontal shimmer — smooth marquee flow */
        .dsky-marquee {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.025) 20%,
            rgba(255,255,255,0.05) 50%,
            rgba(255,255,255,0.025) 80%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: dsky-marquee-flow 4s ease-in-out infinite;
        }
        @keyframes dsky-marquee-flow {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* CRT scanlines */
        .dsky-scanlines {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 3px,
            rgba(0,0,0,0.035) 3px,
            rgba(0,0,0,0.035) 4px
          );
        }

        /* Power hum */
        .dsky-hum {
          animation: dsky-hum-pulse 3s ease-in-out infinite;
        }
        @keyframes dsky-hum-pulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(0.97); }
        }

        /* Sun glow pulse */
        @keyframes dsky-sun-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        /* Sun ray rotation */
        @keyframes dsky-ray-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Lightning flash for storms */
        .dsky-lightning {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          animation: dsky-lightning-flash 6s ease-in-out infinite;
        }
        @keyframes dsky-lightning-flash {
          0%, 92%, 94%, 96%, 100% { background: rgba(255,255,255,0); }
          93% { background: rgba(200,220,255,0.15); }
          95% { background: rgba(200,220,255,0.25); }
        }

        /* Moon glow */
        @keyframes dsky-moon-glow {
          0%, 100% { box-shadow: 0 0 12px 4px rgba(200,210,240,0.3), 0 0 30px 8px rgba(160,180,220,0.15); }
          50% { box-shadow: 0 0 16px 6px rgba(200,210,240,0.4), 0 0 40px 12px rgba(160,180,220,0.2); }
        }

        /* Shooting star streak */
        @keyframes dsky-shoot {
          0%   { opacity: 0; transform: translateX(0) rotate(var(--angle, 25deg)); }
          8%   { opacity: 1; }
          25%  { opacity: 0.6; }
          40%  { opacity: 0; transform: translateX(80px) rotate(var(--angle, 25deg)); }
          100% { opacity: 0; }
        }
      `}</style>

      <div className={`dsky-bar dsky-${phase} dsky-weather-${weather}`} ref={containerRef}>
        {/* Sky gradient */}
        <div
          className="dsky-sky dsky-hum"
          style={{
            backgroundImage: `${getSkyGradient(phase, weather)}, url("/dynamic-sky-clouds.jpg")`,
            backgroundBlendMode:
              weather === "rain" || weather === "storm"
                ? "multiply"
                : phase === "night"
                  ? "multiply"
                  : "soft-light",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >

          {/* ── Sun (day + dawn) ── */}
          {showSun && weather !== "rain" && weather !== "storm" && (
            <div
              className="dsky-sun-wrap"
              style={{
                position: "absolute",
                right: `${100 - sunPos.x}%`,
                top: `${sunPos.y}%`,
                zIndex: 1,
              }}
            >
              {/* Outer glow halo */}
              <div
                style={{
                  position: "absolute",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: isDawn
                    ? "radial-gradient(circle, rgba(255,200,100,0.4) 0%, rgba(255,160,60,0.15) 40%, transparent 70%)"
                    : "radial-gradient(circle, rgba(255,250,200,0.5) 0%, rgba(255,220,100,0.2) 40%, transparent 70%)",
                  transform: "translate(-50%, -50%)",
                  animation: "dsky-sun-pulse 4s ease-in-out infinite",
                }}
              />
              {/* Sun rays — rotating lines */}
              <svg
                width="70"
                height="70"
                viewBox="-35 -35 70 70"
                style={{
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                  animation: "dsky-ray-spin 30s linear infinite",
                  opacity: isDawn ? 0.3 : 0.2,
                }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1="-14"
                    x2="0"
                    y2={i % 2 === 0 ? "-30" : "-24"}
                    stroke={isDawn ? "#ffcc66" : "#fff8dd"}
                    strokeWidth={i % 2 === 0 ? "1.5" : "1"}
                    strokeLinecap="round"
                    transform={`rotate(${i * 30})`}
                    opacity={i % 2 === 0 ? 0.8 : 0.5}
                  />
                ))}
              </svg>
              {/* Sun core */}
              <div
                style={{
                  position: "absolute",
                  width: isDawn ? 16 : 14,
                  height: isDawn ? 16 : 14,
                  borderRadius: "50%",
                  background: isDawn
                    ? "radial-gradient(circle, #ffe8a0 0%, #ffcc55 50%, #e8a030 100%)"
                    : "radial-gradient(circle, #fffef0 0%, #fff5c0 40%, #ffe880 100%)",
                  boxShadow: isDawn
                    ? "0 0 12px 4px rgba(255,180,60,0.5), 0 0 25px 8px rgba(255,160,40,0.2)"
                    : "0 0 10px 3px rgba(255,250,180,0.5), 0 0 22px 6px rgba(255,240,120,0.2)",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          )}

          {/* Moon removed per request */}

          {/* ── Cloud layers (SVG for detailed shapes) ── */}
          <svg
            className="dsky-clouds"
            viewBox="0 0 500 100"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              overflow: "visible",
              opacity: 0.55,
            }}
          >
            <defs>
              <filter id="cloudBlur">
                <feGaussianBlur stdDeviation="2" />
              </filter>
              <filter id="cloudBlurFar">
                <feGaussianBlur stdDeviation="3.5" />
              </filter>
            </defs>
            {/* Back layer — distant, smaller, more blurred */}
            {cloudDefs
              .filter((c) => c.layer === "back")
              .map((c, i) => (
                <g key={`b${i}`} filter="url(#cloudBlurFar)">
                  <CloudShape
                    x={250}
                    y={c.y}
                    scale={c.scale}
                    opacity={c.opacity}
                    speed={c.speed}
                    delay={c.delay}
                    color={cloudColor}
                  />
                </g>
              ))}
            {/* Mid layer */}
            {cloudDefs
              .filter((c) => c.layer === "mid")
              .map((c, i) => (
                <g key={`m${i}`} filter="url(#cloudBlur)">
                  <CloudShape
                    x={250}
                    y={c.y}
                    scale={c.scale}
                    opacity={c.opacity}
                    speed={c.speed}
                    delay={c.delay}
                    color={cloudColor}
                  />
                </g>
              ))}
            {/* Front layer — closest, largest, most visible */}
            {cloudDefs
              .filter((c) => c.layer === "front")
              .map((c, i) => (
                <g key={`f${i}`} filter="url(#cloudBlur)">
                  <CloudShape
                    x={250}
                    y={c.y}
                    scale={c.scale}
                    opacity={c.opacity}
                    speed={c.speed}
                    delay={c.delay}
                    color={cloudHighlight}
                  />
                  {/* Bottom shadow for depth */}
                  <g style={{
                    animation: `dsky-drift ${c.speed}s linear infinite`,
                    animationDelay: `${c.delay}s`,
                  }}>
                    <ellipse
                      cx={250}
                      cy={c.y + 12 * c.scale}
                      rx={30 * c.scale}
                      ry={5 * c.scale}
                      fill="rgba(0,0,0,0.05)"
                      filter="url(#cloudBlurFar)"
                    />
                  </g>
                </g>
              ))}
          </svg>
        </div>

        {/* Stars — night & dusk */}
        {showStars && (
          <div className="dsky-stars-wrap" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            {stars.map((s, i) => (
              <div
                key={`s${i}`}
                className="dsky-star"
                style={{
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: s.size,
                  height: s.size,
                  opacity: isDusk ? 0.15 : s.brightness,
                  background: s.color,
                  boxShadow:
                    s.size > 2
                      ? `0 0 ${s.size * 3}px rgba(180,200,255,0.6), 0 0 ${s.size * 6}px rgba(140,170,255,0.25)`
                      : s.size > 1.2
                        ? `0 0 ${s.size * 2}px rgba(200,215,255,0.35)`
                        : "none",
                  animation: `dsky-twinkle ${s.dur}s ease-in-out infinite`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
            {/* Shooting stars — brief streaks */}
            {isNight && weather !== "rain" && weather !== "storm" && shootingStars.map((ss, i) => (
              <div
                key={`ss${i}`}
                className="dsky-shooting-star"
                style={{
                  position: "absolute",
                  left: `${ss.startX}%`,
                  top: `${ss.startY}%`,
                  width: ss.length,
                  height: 1.5,
                  background: "linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(180,200,255,0.4) 40%, transparent 100%)",
                  borderRadius: "1px",
                  transform: `rotate(${ss.angle}deg)`,
                  animation: `dsky-shoot ${ss.dur}s ease-out infinite`,
                  animationDelay: `${ss.delay}s`,
                  opacity: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Rain */}
        {isRaining && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            {raindrops.map((r, i) => (
              <div
                key={`r${i}`}
                className="dsky-rain"
                style={{
                  left: `${r.left}%`,
                  height: r.height,
                  background: "linear-gradient(180deg, transparent, rgba(170,200,255,0.7))",
                  animation: `dsky-fall ${r.dur}s linear infinite`,
                  animationDelay: `${r.delay}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Storm lightning */}
        {weather === "storm" && <div className="dsky-lightning" />}

        {/* LED, marquee, scanlines removed — clean sky only */}
      </div>
    </>
  );
}
