import { memo, useMemo, useState } from "react";
import { PlanetIconG, SignIconG } from "./SkyGlyphs";

interface WheelPlacement {
  body: string;
  sign: string;
  degree: number;
  house: number | null;
  retrograde: boolean;
}

interface WheelHouse {
  house: number;
  sign: string;
  degree: number;
}

interface WheelAspect {
  bodyA: string;
  bodyB: string;
  aspect: string;
  orb: number;
}

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_FILL: Record<string, string> = {
  Aries: "rgba(244,205,216,0.55)",
  Leo: "rgba(244,205,216,0.38)",
  Sagittarius: "rgba(244,205,216,0.22)",
  Taurus: "rgba(216,240,196,0.55)",
  Virgo: "rgba(216,240,196,0.38)",
  Capricorn: "rgba(216,240,196,0.22)",
  Gemini: "rgba(205,228,245,0.55)",
  Libra: "rgba(205,228,245,0.38)",
  Aquarius: "rgba(205,228,245,0.22)",
  Cancer: "rgba(228,212,244,0.55)",
  Scorpio: "rgba(228,212,244,0.38)",
  Pisces: "rgba(228,212,244,0.22)",
};

const ASPECT_COLOR: Record<string, string> = {
  trine: "rgba(20,32,16,0.45)",
  sextile: "rgba(20,32,16,0.28)",
  conjunction: "rgba(11,11,12,0.5)",
  square: "rgba(142,29,44,0.45)",
  opposition: "rgba(142,29,44,0.62)",
  quincunx: "rgba(11,11,12,0.22)",
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

/**
 * Maps an absolute ecliptic degree (0-360) onto a screen angle so the
 * Ascendant always sits at the 9 o'clock point and the wheel reads
 * counter-clockwise from there, matching the standard natal-wheel
 * convention (not a literal astronomical projection, just the layout
 * every astrology app uses).
 */
function screenAngle(degree: number, ascendantDegree: number) {
  const offset = ((degree - ascendantDegree) % 360 + 360) % 360;
  return (180 + offset) % 360;
}

const SIZE = 360;
const CENTER = SIZE / 2;
const SIGN_RING_R = 168;
const HOUSE_LINE_R = 146;
const PLANET_RING_R = 116;

function wedgePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  let delta = (a0 - a1 + 360) % 360;
  if (delta > 180) delta = 360 - delta;
  const large = delta > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 0 ${p1.x} ${p1.y} Z`;
}

export const NatalChartWheel = memo(function NatalChartWheel({
  placements,
  houses,
  aspects,
  ascendantDegree,
  onSelectBody,
  selectedBody,
}: {
  placements: WheelPlacement[];
  houses: WheelHouse[];
  aspects: WheelAspect[];
  ascendantDegree: number;
  onSelectBody: (body: string) => void;
  selectedBody: string | null;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Decluster planets that land within a few degrees of each other so
  // their glyphs don't stack illegibly.
  const positioned = useMemo(() => {
    const sorted = [...placements].sort((a, b) => a.degree - b.degree);
    const bump: Record<string, number> = {};
    sorted.forEach((p, i) => {
      const prev = sorted[i - 1];
      bump[p.body] = prev && Math.abs(p.degree - prev.degree) < 7 ? (bump[prev.body] ?? 0) + 1 : 0;
    });
    return sorted.map((p) => ({
      ...p,
      r: PLANET_RING_R - (bump[p.body] % 2 === 0 ? 0 : 16),
      angle: screenAngle(p.degree, ascendantDegree),
    }));
  }, [placements, ascendantDegree]);

  const byBody = Object.fromEntries(positioned.map((p) => [p.body, p]));

  return (
    <svg
      className="tn-wheel"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      role="img"
      aria-label="Natal chart wheel"
    >
      <circle cx={CENTER} cy={CENTER} r={SIGN_RING_R + 6} fill="#F4EFE6" />

      {SIGNS.map((sign, i) => {
        const startAngle = screenAngle(i * 30, ascendantDegree);
        const endAngle = screenAngle((i + 1) * 30, ascendantDegree);
        const midAngle = screenAngle(i * 30 + 15, ascendantDegree);
        const label = polar(CENTER, CENTER, SIGN_RING_R - 14, midAngle);
        return (
          <g key={sign} color="#0B0B0C">
            <path d={wedgePath(CENTER, CENTER, SIGN_RING_R, startAngle, endAngle)} fill={SIGN_FILL[sign]} />
            <SignIconG sign={sign} x={label.x} y={label.y} size={15} />
          </g>
        );
      })}

      <circle cx={CENTER} cy={CENTER} r={HOUSE_LINE_R - 8} fill="#F4EFE6" />
      <circle cx={CENTER} cy={CENTER} r={SIGN_RING_R} fill="none" stroke="#0B0B0C" strokeWidth={1.4} />
      <circle cx={CENTER} cy={CENTER} r={HOUSE_LINE_R} fill="none" stroke="rgba(11,11,12,0.18)" strokeWidth={1} />

      {houses.map((h) => {
        const angle = screenAngle(h.degree, ascendantDegree);
        const p = polar(CENTER, CENTER, HOUSE_LINE_R, angle);
        const numPos = polar(CENTER, CENTER, HOUSE_LINE_R - 18, angle + 10);
        return (
          <g key={h.house}>
            <line
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="#0B0B0C"
              strokeWidth={h.house === 1 || h.house === 10 ? 1.6 : 0.7}
              opacity={h.house === 1 || h.house === 10 ? 0.85 : 0.28}
            />
            <text x={numPos.x} y={numPos.y} fontSize={9} fontWeight={700} fill="#0B0B0C" textAnchor="middle" opacity={0.55}>
              {h.house}
            </text>
          </g>
        );
      })}

      {aspects.map((a, i) => {
        const from = byBody[a.bodyA];
        const to = byBody[a.bodyB];
        if (!from || !to) return null;
        const p1 = polar(CENTER, CENTER, from.r, from.angle);
        const p2 = polar(CENTER, CENTER, to.r, to.angle);
        const dimmed = selectedBody && selectedBody !== a.bodyA && selectedBody !== a.bodyB;
        return (
          <line
            key={i}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={ASPECT_COLOR[a.aspect] ?? "rgba(11,11,12,0.25)"}
            strokeWidth={dimmed ? 0.6 : 1.2}
            opacity={dimmed ? 0.22 : 1}
          />
        );
      })}

      {(() => {
        const p = polar(CENTER, CENTER, SIGN_RING_R + 18, 180);
        return (
          <text x={p.x} y={p.y} fontSize={10} fontWeight={800} letterSpacing="0.16em" fill="#0B0B0C" textAnchor="middle">
            ASC
          </text>
        );
      })()}

      {positioned.map((p) => {
        const pos = polar(CENTER, CENTER, p.r, p.angle);
        const active = selectedBody === p.body || hovered === p.body;
        return (
          <g
            key={p.body}
            style={{ cursor: "pointer" }}
            onClick={() => onSelectBody(p.body)}
            onMouseEnter={() => setHovered(p.body)}
            onMouseLeave={() => setHovered(null)}
          >
            <circle
              cx={pos.x}
              cy={pos.y}
              r={active ? 13 : 11}
              fill={active ? "#D8F0C4" : "#0B0B0C"}
              stroke="#0B0B0C"
              strokeWidth={1.2}
            />
            <g color={active ? "#142010" : "#F4EFE6"}>
              <PlanetIconG body={p.body} x={pos.x} y={pos.y} size={14} />
            </g>
            {p.retrograde && (
              <text x={pos.x + 11} y={pos.y - 11} fontSize={8} fill="#8E1D2C" fontWeight={700}>℞</text>
            )}
          </g>
        );
      })}
    </svg>
  );
});
