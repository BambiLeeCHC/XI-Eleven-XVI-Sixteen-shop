import { TROPICAL_SIGNS } from "../../lib/chartGeometry";

type Placement = { body: string; degree: number };
type Aspect = { bodyA: string; bodyB: string; aspect: string };
type House = { house: number; sign: string; degree: number };

const ELEMENT: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire",
  Leo: "fire",
  Sagittarius: "fire",
  Taurus: "earth",
  Virgo: "earth",
  Capricorn: "earth",
  Gemini: "air",
  Libra: "air",
  Aquarius: "air",
  Cancer: "water",
  Scorpio: "water",
  Pisces: "water",
};

const ACCENT = {
  fire: "#F5B971",
  earth: "#8CE0B1",
  air: "#8CCBFF",
  water: "#C7A6FF",
};

const ASPECT_COLOR: Record<string, string> = {
  conjunction: "#8CE0B1",
  trine: "#8CE0B1",
  sextile: "#8CCBFF",
  square: "#F5B971",
  opposition: "#F5B971",
  quincunx: "#C7A6FF",
};

function point(degree: number, radius: number) {
  const angle = ((degree - 90) * Math.PI) / 180;
  return [160 + Math.cos(angle) * radius, 160 + Math.sin(angle) * radius];
}

function wedge(start: number, end: number, radius: number) {
  const norm = (degree: number) => ((degree % 360) + 360) % 360;
  const from = norm(start);
  let delta = (norm(end) - from + 360) % 360;
  if (delta === 0) delta = 360;
  const [x1, y1] = point(from, radius);
  const [x2, y2] = point(from + delta, radius);
  const large = delta > 180 ? 1 : 0;
  return `M 160 160 L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
}

export function NatalWheelSvg({
  placements,
  aspects,
  houses,
  active,
  onPick,
}: {
  placements: Placement[];
  aspects: Aspect[];
  houses?: House[];
  active?: string | null;
  onPick?: (body: string) => void;
}) {
  const byName = Object.fromEntries(placements.map(item => [item.body, item]));
  const sectors =
    houses && houses.length === 12
      ? houses.map((house, index) => ({
          key: `house-${house.house}`,
          sign: house.sign,
          start: house.degree,
          end: houses[(index + 1) % houses.length]?.degree ?? house.degree + 30,
        }))
      : TROPICAL_SIGNS.map((sign, index) => ({
          key: sign,
          sign,
          start: index * 30,
          end: (index + 1) * 30,
        }));
  return (
    <svg
      className="natal-wheel"
      viewBox="0 0 320 320"
      role="img"
      aria-label="Natal chart wheel"
    >
      <circle
        cx="160"
        cy="160"
        r="150"
        fill="#100E16"
        stroke="rgba(199,166,255,0.7)"
      />
      {sectors.map(sector => {
        const accent = ACCENT[ELEMENT[sector.sign] ?? "air"];
        return (
          <path
            key={sector.key}
            d={wedge(sector.start, sector.end, 148)}
            fill={accent}
            fillOpacity={0.18}
            stroke={accent}
            strokeOpacity={0.35}
          />
        );
      })}
      <circle
        cx="160"
        cy="160"
        r="108"
        fill="none"
        stroke="rgba(140,224,177,0.45)"
      />
      {sectors.map(sector => {
        const accent = ACCENT[ELEMENT[sector.sign] ?? "air"];
        const [x1, y1] = point(sector.start, 142);
        const [x2, y2] = point(sector.start, 152);
        return (
          <line
            key={`tick-${sector.key}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={accent}
            strokeWidth={2}
          />
        );
      })}
      {TROPICAL_SIGNS.map((sign, index) => {
        const [x, y] = point(index * 30 + 15, 132);
        return (
          <text
            key={sign}
            x={x}
            y={y}
            textAnchor="middle"
            className="natal-wheel__sign"
            fill={ACCENT[ELEMENT[sign] ?? "air"]}
          >
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
          <g
            key={body.body}
            role="button"
            tabIndex={0}
            aria-label={body.body}
            onClick={() => onPick?.(body.body)}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onPick?.(body.body);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <circle cx={x} cy={y} r={hot ? 8 : 5} fill={hot ? "#F5B971" : "#f7f4ec"} />
            <text x={x} y={y - 10} textAnchor="middle" className="natal-wheel__body">
              {body.body.slice(0, 2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
