import { useTimeGradient } from "../hooks/useTimeGradient";

const STARS = [
  [8, 12, 2], [18, 22, 1.4], [27, 9, 1], [36, 18, 2.2], [48, 8, 1.2],
  [62, 16, 1.6], [74, 7, 2], [83, 20, 1.2], [91, 12, 1.5], [14, 34, 1],
  [42, 30, 1.8], [68, 28, 1.1], [88, 36, 1.4], [22, 48, 1.2], [55, 44, 2],
] as const;

const ORION = "42,38 45,35 48,32 39,24 50,22 37,48 52,46";
const DIPPER = "72,12 76,10 79,13 78,17 82,18 86,16 89,19";

function points(spec: string, width: number, height: number) {
  return spec
    .split(" ")
    .map(pair => {
      const [x, y] = pair.split(",").map(Number);
      return `${((x ?? 0) / 100) * width},${((y ?? 0) / 100) * height}`;
    })
    .join(" ");
}

/** Looping destiny sky. Pure CSS motion, no network, no novelty craft. */
export function LiveSky() {
  useTimeGradient();
  return (
    <div className="live-sky" aria-hidden="true">
      <div className="live-sky__wash" />
      <svg className="live-sky__constellations" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <polyline points={points(ORION, 1200, 800)} />
        <polyline points={points(DIPPER, 1200, 800)} />
      </svg>
      {STARS.map(([x, y, size], index) => (
        <span
          key={`${x}-${y}`}
          className="live-sky__star"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: size * 2,
            height: size * 2,
            animationDelay: `${index * -0.7}s`,
          }}
        />
      ))}
      <span className="live-sky__moon" />
      <span className="live-sky__orb live-sky__orb--lilac" />
      <span className="live-sky__orb live-sky__orb--pist" />
      <span className="live-sky__mist live-sky__mist--a" />
      <span className="live-sky__mist live-sky__mist--b" />
      <span className="live-sky__arc" />
    </div>
  );
}
