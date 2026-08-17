import { memo, useMemo, useState } from "react";

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

const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const BODY_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃",
  Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

// Harmonious aspects read as warm/gold, tense ones as a soft rust, neutral
// (conjunction) as ink — a quick-glance read before you click into detail.
const ASPECT_COLOR: Record<string, string> = {
  trine: "rgba(185,149,69,0.65)",
  sextile: "rgba(185,149,69,0.45)",
  conjunction: "rgba(60,50,40,0.4)",
  square: "rgba(178,84,66,0.55)",
  opposition: "rgba(178,84,66,0.7)",
  quincunx: "rgba(120,120,120,0.4)",
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

const SIZE = 320;
const CENTER = SIZE / 2;
const SIGN_RING_R = 148;
const HOUSE_LINE_R = 130;
const PLANET_RING_R = 104;

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
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" style={{ maxWidth: 360, display: "block", margin: "0 auto" }} role="img" aria-label="Natal chart wheel">
      {/* Sign ring */}
      <circle cx={CENTER} cy={CENTER} r={SIGN_RING_R} fill="none" stroke="rgba(29,47,79,0.15)" strokeWidth={1} />
      <circle cx={CENTER} cy={CENTER} r={HOUSE_LINE_R} fill="none" stroke="rgba(29,47,79,0.1)" strokeWidth={1} />

      {SIGNS.map((sign, i) => {
        // Fixed 30°-wide bands starting from Aries 0°, rotated the same way.
        const startAngle = screenAngle(i * 30, ascendantDegree);
        const midAngle = screenAngle(i * 30 + 15, ascendantDegree);
        const p1 = polar(CENTER, CENTER, SIGN_RING_R, startAngle);
        const label = polar(CENTER, CENTER, SIGN_RING_R + 14, midAngle);
        return (
          <g key={sign}>
            <line x1={CENTER} y1={CENTER} x2={p1.x} y2={p1.y} stroke="rgba(29,47,79,0.08)" strokeWidth={1} />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="rgba(29,47,79,0.55)">
              {SIGN_GLYPH[sign]}
            </text>
          </g>
        );
      })}

      {/* House cusp lines */}
      {houses.map((h) => {
        const angle = screenAngle(h.degree, ascendantDegree);
        const p = polar(CENTER, CENTER, HOUSE_LINE_R, angle);
        const numPos = polar(CENTER, CENTER, HOUSE_LINE_R - 16, angle + 8);
        return (
          <g key={h.house}>
            <line x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke="rgba(29,47,79,0.18)" strokeWidth={h.house === 1 || h.house === 10 ? 1.5 : 0.75} />
            <text x={numPos.x} y={numPos.y} fontSize={8} fill="rgba(29,47,79,0.4)" textAnchor="middle">
              {h.house}
            </text>
          </g>
        );
      })}

      {/* Aspect lines between planets */}
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
            stroke={ASPECT_COLOR[a.aspect] ?? "rgba(120,120,120,0.3)"}
            strokeWidth={dimmed ? 0.5 : 1}
            opacity={dimmed ? 0.25 : 1}
          />
        );
      })}

      {/* Ascendant / Midheaven marker */}
      {(() => {
        const p = polar(CENTER, CENTER, SIGN_RING_R + 26, 180);
        return (
          <text x={p.x} y={p.y} fontSize={9} fontWeight={700} fill="rgba(185,149,69,0.9)" textAnchor="middle">
            ASC
          </text>
        );
      })()}

      {/* Planets */}
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
            <circle cx={pos.x} cy={pos.y} r={active ? 12 : 10} fill={active ? "#1d2f4f" : "#fff"} stroke="rgba(29,47,79,0.5)" strokeWidth={1} />
            <text x={pos.x} y={pos.y} fontSize={11} textAnchor="middle" dominantBaseline="central" fill={active ? "#f3e9d2" : "#1d2f4f"}>
              {BODY_GLYPH[p.body] ?? p.body[0]}
            </text>
            {p.retrograde && (
              <text x={pos.x + 10} y={pos.y - 10} fontSize={8} fill="rgba(178,84,66,0.8)">℞</text>
            )}
          </g>
        );
      })}
    </svg>
  );
});
