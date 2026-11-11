import { type ReactNode, useEffect, useRef, useState } from "react";
import { setSoundEnabled, soundEnabled } from "../lib/dialSound";

const SPARKS = 36;

export function DialAtmosphere({
  cue,
  burst,
  children,
}: {
  cue: string;
  burst?: boolean;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [flare, setFlare] = useState(false);
  const [shock, setShock] = useState(false);
  const [sound, setSound] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSound(soundEnabled());
  }, []);

  useEffect(() => {
    if (reduced.current) return;
    setFlare(true);
    const timer = window.setTimeout(() => setFlare(false), 700);
    return () => window.clearTimeout(timer);
  }, [cue]);

  useEffect(() => {
    if (!burst || reduced.current) return;
    setShock(true);
    const timer = window.setTimeout(() => setShock(false), 700);
    return () => window.clearTimeout(timer);
  }, [burst, cue]);

  useEffect(() => {
    const node = canvas.current;
    if (!node || reduced.current) return;
    const context = node.getContext("2d");
    if (!context) return;
    const sparks = Array.from({ length: SPARKS }, (_, i) => ({
      angle: (i / SPARKS) * Math.PI * 2,
      radius: 0.38 + (i % 5) * 0.018,
      speed: 0.004 + (i % 7) * 0.0006,
      size: i % 4 === 0 ? 2.2 : 1.2,
    }));
    let frame = 0;
    let alive = true;

    const draw = () => {
      if (!alive) return;
      frame = requestAnimationFrame(draw);
      if (document.hidden) return;
      const rect = node.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      if (node.width !== Math.floor(width * dpr)) {
        node.width = Math.floor(width * dpr);
        node.height = Math.floor(height * dpr);
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const reach = Math.min(width, height) * 0.46;
      for (const spark of sparks) {
        spark.angle += spark.speed;
        const x = cx + Math.cos(spark.angle) * reach * spark.radius * 2;
        const y = cy + Math.sin(spark.angle) * reach * spark.radius * 2;
        context.fillStyle = spark.size > 2 ? "rgba(17,17,17,0.85)" : "rgba(17,17,17,0.35)";
        context.beginPath();
        context.arc(x, y, spark.size, 0, Math.PI * 2);
        context.fill();
      }
    };
    frame = requestAnimationFrame(draw);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, []);

  const lean = (clientX: number, clientY: number) => {
    if (reduced.current) return;
    const node = root.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -7, y: x * 9 });
  };

  return (
    <div
      ref={root}
      className={`dial-holo${flare ? " is-flare" : ""}${shock ? " is-shock" : ""}`}
      onPointerMove={event => {
        if (event.pointerType === "mouse") lean(event.clientX, event.clientY);
      }}
      onPointerDown={event => {
        if (event.pointerType !== "mouse") lean(event.clientX, event.clientY);
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <canvas ref={canvas} className="dial-holo__sparks" aria-hidden="true" />
      <div className="dial-holo__sweep" aria-hidden="true" />
      <div className="dial-holo__shock" aria-hidden="true" />
      <div
        className="dial-holo__tilt"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div className="dial-holo__depth" aria-hidden="true" />
        {children}
      </div>
      <button
        type="button"
        className={`dial-sound${sound ? " is-on" : ""}`}
        aria-pressed={sound}
        aria-label={sound ? "Mute dial sounds" : "Play dial sounds"}
        onClick={() => {
          const next = !sound;
          setSound(next);
          setSoundEnabled(next);
        }}
      >
        {sound ? "♪" : "♪̸"}
      </button>
    </div>
  );
}
