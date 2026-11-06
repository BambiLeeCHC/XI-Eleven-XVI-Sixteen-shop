import { TROPICAL_SIGNS } from "../../lib/chartGeometry";

type Placement = { body: string; degree: number };
type Aspect = { bodyA: string; bodyB: string; aspect: string };

const ASPECT_COLOR: Record<string, string> = {
  conjunction: "#d8f0c4",
  trine: "#cde4f5",
  sextile: "#e4d4f4",
  square: "#f4c4b0",
  opposition: "#f4cdd8",
};

function point(degree: number, radius: number) {
  const angle = ((degree - 90) * Math.PI) / 180;
  return [160 + Math.cos(angle) * radius, 160 + Math.sin(angle) * radius];
}

export function NatalWheelSvg({
  placements,
  aspects,
  active,
  onPick,
}: {
  placements: Placement[];
  aspects: Aspect[];
  active?: string | null;
  onPick?: (body: string) => void;
}) {
  const byName = Object.fromEntries(placements.map(item => [item.body, item]));
  return (
    <svg className="natal-wheel" viewBox="0 0 320 320" role="img" aria-label="Natal chart wheel">
      <circle cx="160" cy="160" r="150" fill="rgba(8,10,14,0.72)" stroke="rgba(228,212,244,0.8)" />
      <circle cx="160" cy="160" r="108" fill="none" stroke="rgba(216,240,196,0.45)" />
      {TROPICAL_SIGNS.map((sign, index) => {
        const [x, y] = point(index * 30 + 15, 132);
        return (
          <text key={sign} x={x} y={y} textAnchor="middle" className="natal-wheel__sign">
            {sign.slice(0, 3)}
          </text>
        );
      })}
      {aspects.map(aspect => {
        const a = byName[aspect.bodyA];
        const b = byName[aspect.bodyB];
        if (!a || !b) return null;
        const [x1, y1] = point(a.degree, 96);
        const [x2, y2] = point(b.degree, 96);
        const hot = active === aspect.bodyA || active === aspect.bodyB;
        return (
          <line
            key={`${aspect.bodyA}-${aspect.bodyB}-${aspect.aspect}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={ASPECT_COLOR[aspect.aspect] ?? "#f6f1e8"}
            strokeWidth={hot ? 2.4 : 1}
            opacity={hot ? 1 : 0.55}
          />
        );
      })}
      {placements.map(body => {
        const [x, y] = point(body.degree, 96);
        const hot = active === body.body;
        return (
          <g key={body.body} onClick={() => onPick?.(body.body)} style={{ cursor: "pointer" }}>
            <circle cx={x} cy={y} r={hot ? 8 : 5} fill={hot ? "#d8f0c4" : "#f6f1e8"} />
            <text x={x} y={y - 10} textAnchor="middle" className="natal-wheel__body">
              {body.body.slice(0, 2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
