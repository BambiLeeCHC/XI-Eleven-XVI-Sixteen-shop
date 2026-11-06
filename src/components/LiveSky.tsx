import { useEffect, useMemo, useRef, useState } from "react";
import { skyClock, skyGradient, SKY_MODES, type SkyMode } from "../lib/skyMode";

const WEATHER =
  "https://api.open-meteo.com/v1/forecast?latitude=25.7617&longitude=-80.1918&current=weather_code,cloud_cover,is_day&timezone=America/New_York";

const CLOUDS = [
  { src: "/cloud-real-1.webp", speed: 160, top: "4%", size: "34vw", opacity: 0.72, z: 4, dir: "right" as const, delay: -20 },
  { src: "/davinci-cloud-1.webp", speed: 210, top: "8%", size: "26vw", opacity: 0.5, z: 2, dir: "right" as const, delay: -40 },
  { src: "/cloud-real-3.webp", speed: 180, top: "14%", size: "30vw", opacity: 0.66, z: 3, dir: "left" as const, delay: -70, flip: true },
  { src: "/cloud-real-5.webp", speed: 200, top: "22%", size: "28vw", opacity: 0.58, z: 3, dir: "right" as const, delay: -15 },
  { src: "/davinci-cloud-3.webp", speed: 240, top: "30%", size: "32vw", opacity: 0.42, z: 2, dir: "left" as const, delay: -90, flip: true },
  { src: "/cloud-real-2.webp", speed: 170, top: "38%", size: "24vw", opacity: 0.62, z: 5, dir: "left" as const, delay: -50 },
  { src: "/cloud-real-4.webp", speed: 190, top: "48%", size: "36vw", opacity: 0.5, z: 4, dir: "right" as const, delay: -110, blur: 1 },
  { src: "/davinci-cloud-2.webp", speed: 220, top: "56%", size: "22vw", opacity: 0.55, z: 3, dir: "right" as const, delay: -30 },
  { src: "/cloud-real-1.webp", speed: 150, top: "64%", size: "40vw", opacity: 0.4, z: 6, dir: "left" as const, delay: -80, blur: 1.4, flip: true },
  { src: "/davinci-cloud-4.webp", speed: 175, top: "18%", size: "20vw", opacity: 0.48, z: 5, dir: "left" as const, delay: -60 },
];

const CONSTELLATIONS = [
  { name: "Orion", stars: [[0.42, 0.38], [0.45, 0.35], [0.48, 0.32], [0.39, 0.24], [0.5, 0.22], [0.37, 0.48], [0.52, 0.46]], lines: [[0, 1], [1, 2], [3, 0], [2, 4], [3, 5], [4, 6]] },
  { name: "BigDipper", stars: [[0.72, 0.12], [0.76, 0.1], [0.79, 0.13], [0.78, 0.17], [0.82, 0.18], [0.86, 0.16], [0.89, 0.19]], lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]] },
  { name: "Scorpius", stars: [[0.15, 0.55], [0.18, 0.52], [0.2, 0.54], [0.22, 0.57], [0.24, 0.61], [0.23, 0.66], [0.2, 0.7], [0.17, 0.72]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]] },
  { name: "Cassiopeia", stars: [[0.58, 0.08], [0.61, 0.05], [0.64, 0.07], [0.67, 0.04], [0.7, 0.06]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  { name: "Leo", stars: [[0.3, 0.18], [0.33, 0.15], [0.36, 0.16], [0.35, 0.2], [0.32, 0.22], [0.28, 0.24]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]] },
  { name: "UrsaMinor", stars: [[0.8, 0.28], [0.83, 0.26], [0.85, 0.29], [0.84, 0.32], [0.81, 0.33], [0.86, 0.24]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5]] },
];

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function StarCanvas({ show, reduced }: { show: boolean; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    const rng = mulberry32(777);
    const stars = Array.from({ length: 250 }, () => {
      const br = rng();
      return {
        x: rng(),
        y: rng() * 0.72,
        size: br > 0.92 ? 2.2 : br > 0.7 ? 1.3 : 0.7,
        brightness: 0.35 + br * 0.65,
        temp: rng(),
        phase: rng() * Math.PI * 2,
        spike: br > 0.88,
      };
    });
    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (show) {
        ctx.strokeStyle = "rgba(170,190,230,0.28)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        for (const group of CONSTELLATIONS) {
          for (const [a, b] of group.lines) {
            const sa = group.stars[a];
            const sb = group.stars[b];
            if (!sa || !sb) continue;
            ctx.beginPath();
            ctx.moveTo(sa[0] * w, sa[1] * h);
            ctx.lineTo(sb[0] * w, sb[1] * h);
            ctx.stroke();
          }
          for (const star of group.stars) {
            ctx.fillStyle = "rgba(230,236,255,0.9)";
            ctx.beginPath();
            ctx.arc(star[0] * w, star[1] * h, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.setLineDash([]);
        for (const star of stars) {
          const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * 0.001 + star.phase);
          const alpha = star.brightness * tw;
          const x = star.x * w;
          const y = star.y * h;
          const glow = ctx.createRadialGradient(x, y, 0, x, y, star.size * 5);
          glow.addColorStop(0, `rgba(255,255,255,${alpha})`);
          glow.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, star.size * 5, 0, Math.PI * 2);
          ctx.fill();
          if (star.spike) {
            ctx.strokeStyle = `rgba(230,236,255,${alpha * 0.45})`;
            ctx.beginPath();
            ctx.moveTo(x - 10, y);
            ctx.lineTo(x + 10, y);
            ctx.moveTo(x, y - 10);
            ctx.lineTo(x, y + 10);
            ctx.stroke();
          }
        }
      }
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [reduced, show]);
  return <canvas ref={ref} className="xsky__stars" />;
}

export function LiveSky() {
  const [mode, setMode] = useState<SkyMode>("live");
  const [remote, setRemote] = useState<{ hour: number; isDay: boolean } | null>(null);
  const [reduced, setReduced] = useState(false);
  const [shoot, setShoot] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    let stop = false;
    fetch(WEATHER)
      .then(response => response.json())
      .then(data => {
        if (stop) return;
        const hour = Number(String(data.current?.time ?? "").split("T")[1]?.slice(0, 2));
        setRemote({
          hour: Number.isFinite(hour) ? hour : new Date().getHours(),
          isDay: data.current?.is_day === 1,
        });
      })
      .catch(() => setRemote(null));
    return () => {
      stop = true;
    };
  }, []);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setShoot(value => value + 1), 14000);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const clock = skyClock(mode);
  const hour = mode === "live" && remote ? remote.hour : clock.hour;
  const isDay = mode === "live" && remote ? remote.isDay : clock.isDay;
  const showStars = !isDay || hour < 7 || hour >= 18;
  const cloudBoost = isDay ? 1 : 0.78;
  const craft = useMemo(() => !reduced, [reduced]);

  return (
    <>
      <div className={`xsky${reduced ? " is-still" : ""}`} aria-hidden="true">
        <div className="xsky__wash" style={{ background: skyGradient(hour, isDay) }} />
        <StarCanvas show={showStars} reduced={reduced} />
        <img src="/moon-hd.webp" alt="" className="xsky__moon" style={{ opacity: showStars ? 0.95 : 0.2 }} />
        {CLOUDS.map(cloud => (
          <img
            key={`${cloud.src}-${cloud.top}-${cloud.delay}`}
            src={cloud.src}
            alt=""
            className={`xsky__cloud xsky__cloud--${cloud.dir}${cloud.flip ? " is-flip" : ""}`}
            style={{
              top: cloud.top,
              width: cloud.size,
              opacity: cloud.opacity * cloudBoost,
              zIndex: cloud.z,
              animationDuration: `${cloud.speed}s`,
              animationDelay: `${cloud.delay}s`,
              filter: cloud.blur ? `blur(${cloud.blur}px) drop-shadow(0 0 12px rgba(180,200,230,0.35))` : "drop-shadow(0 0 12px rgba(180,200,230,0.28))",
            }}
          />
        ))}
        {craft && (
          <>
            <img src="/willow-jet.webp" alt="" className="xsky__jet" />
            <span className="xsky__banner">XIXVI · TRUE NORTH</span>
            <img src="/willow-blimp.webp" alt="" className="xsky__blimp" />
            <img src="/willow-rocket.webp" alt="" className="xsky__rocket" />
            <img src="/willow-ufo.webp" alt="" className="xsky__ufo" />
            <span key={shoot} className="xsky__shoot" />
          </>
        )}
      </div>
      <div className="xsky-pill" role="group" aria-label="Sky mode">
        {SKY_MODES.map(item => (
          <button
            key={item.id}
            type="button"
            className={mode === item.id ? "is-on" : ""}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
