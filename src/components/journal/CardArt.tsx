import type { ArcanaCard } from "../../data/arcana";

const SHIELD = "/journal/shield-gold.png";
const FIGURE = "/mannequin-women-v37.png";

type Scene =
  | "veil"
  | "figure"
  | "tower"
  | "moon"
  | "sun"
  | "wheel"
  | "stars"
  | "loom"
  | "scales"
  | "path";

const SCENE_BY_NUMBER: Record<number, Scene> = {
  0: "path",
  1: "figure",
  2: "veil",
  3: "figure",
  4: "tower",
  5: "loom",
  6: "path",
  7: "wheel",
  8: "scales",
  9: "stars",
  10: "wheel",
  11: "scales",
  12: "moon",
  13: "veil",
  14: "loom",
  15: "tower",
  16: "tower",
  17: "stars",
  18: "moon",
  19: "sun",
  20: "figure",
  21: "wheel",
};

export function sceneOf(card: ArcanaCard): Scene {
  if (SCENE_BY_NUMBER[card.number] !== undefined) return SCENE_BY_NUMBER[card.number];
  switch (card.element) {
    case "Fire": return "tower";
    case "Water": return "moon";
    case "Earth": return "scales";
    case "Air": return "stars";
    default: return "wheel";
  }
}

const GOLD = "url(#xvGoldPlate)";

function Clouds({ tone }: { tone: string }) {
  return (
    <g fill={tone} opacity="0.5">
      <ellipse cx="46" cy="86" rx="30" ry="10" />
      <ellipse cx="62" cy="80" rx="20" ry="9" />
      <ellipse cx="158" cy="106" rx="34" ry="11" />
      <ellipse cx="140" cy="99" rx="19" ry="8" />
      <ellipse cx="104" cy="64" rx="24" ry="8" opacity="0.7" />
    </g>
  );
}

function Ground() {
  return (
    <g>
      <path d="M0 214 C40 204, 80 210, 100 208 C140 204, 168 212, 200 206 L200 300 L0 300 Z" fill="rgba(10,20,38,.42)" />
      <path d="M0 232 C46 224, 92 230, 200 224 L200 300 L0 300 Z" fill="rgba(8,16,32,.5)" />
    </g>
  );
}

function Figure({ scale = 1, x = 100, y = 226, opacity = 0.95 }: { scale?: number; x?: number; y?: number; opacity?: number }) {
  const w = 96 * scale;
  const h = 144 * scale;
  return (
    <g opacity={opacity}>
      <ellipse cx={x} cy={y + 3} rx={w * 0.34} ry={5} fill="rgba(6,12,26,.45)" />
      <image href={FIGURE} x={x - w / 2} y={y - h} width={w} height={h} preserveAspectRatio="xMidYMax meet" />
    </g>
  );
}

function SceneVeil() {
  return (
    <g>
      <g stroke={GOLD} strokeWidth="1.1" fill="none">
        <path d="M62 96 C74 108, 74 152, 66 196 C62 216, 66 226, 72 232" />
        <path d="M138 96 C126 108, 126 152, 134 196 C138 216, 134 226, 128 232" />
      </g>
      <path d="M62 96 C82 90, 118 90, 138 96 C130 128, 132 176, 128 232 C112 226, 88 226, 72 232 C68 176, 70 128, 62 96 Z" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.42)" strokeWidth="0.8" />
    </g>
  );
}

function SceneFigure({ seed }: { seed: number }) {
  return (
    <g>
      {Array.from({ length: 11 }).map((_, i) => (
        <line key={i} x1="100" y1="150" x2="100" y2="62" stroke="rgba(255,236,186,.5)" strokeWidth={i % 2 ? 0.7 : 1.3} strokeLinecap="round" transform={`rotate(${(360 / 11) * i + seed} 100 150)`} />
      ))}
      <circle cx="100" cy="150" r="42" fill="rgba(255,240,200,.16)" />
      <Ground />
      <Figure scale={0.92} />
    </g>
  );
}

function SceneTower() {
  return (
    <g>
      <Ground />
      {Array.from({ length: 16 }).map((_, i) => {
        const w = 62 - i * 2.6;
        return (
          <rect key={i} x={100 - w / 2} y={214 - i * 9.4} width={w} height={6.4} rx="1.4" fill={i % 4 === 0 ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.1)"} stroke={i % 4 === 0 ? GOLD : "rgba(255,255,255,.34)"} strokeWidth={i % 4 === 0 ? 1 : 0.6} />
        );
      })}
      <path d="M88 64 L100 46 L112 64 Z" fill="none" stroke={GOLD} strokeWidth="1.2" />
    </g>
  );
}

function SceneMoon() {
  return (
    <g>
      <circle cx="100" cy="106" r="34" fill="rgba(255,252,240,.92)" />
      <circle cx="118" cy="96" r="30" fill="rgba(255,255,255,0)" />
      <path d="M0 218 L200 218 L200 300 L0 300 Z" fill="rgba(10,22,44,.5)" />
      <rect x="34" y="150" width="10" height="70" fill="rgba(255,255,255,.14)" stroke={GOLD} strokeWidth="0.9" />
      <rect x="156" y="150" width="10" height="70" fill="rgba(255,255,255,.14)" stroke={GOLD} strokeWidth="0.9" />
    </g>
  );
}

function SceneSun() {
  return (
    <g>
      {Array.from({ length: 16 }).map((_, i) => (
        <line key={i} x1="100" y1="112" x2="100" y2={i % 2 ? 36 : 20} stroke="rgba(255,238,178,.6)" strokeWidth={i % 2 ? 0.8 : 1.6} strokeLinecap="round" transform={`rotate(${(360 / 16) * i} 100 112)`} />
      ))}
      <circle cx="100" cy="112" r="38" fill="rgba(255,240,190,.34)" />
      <circle cx="100" cy="112" r="27" fill="rgba(255,246,214,.9)" />
      <Ground />
    </g>
  );
}

function SceneWheel({ seed, roman }: { seed: number; roman: string }) {
  return (
    <g>
      {[62, 50, 38, 24].map((r, i) => (
        <circle key={r} cx="100" cy="150" r={r} fill="none" stroke={i % 2 ? "rgba(255,255,255,.3)" : GOLD} strokeWidth={i % 2 ? 0.7 : 1.2} />
      ))}
      <text x="100" y="156" textAnchor="middle" fontSize={roman.length > 2 ? 13 : 19} fill={GOLD} fontFamily="'Playfair Display', Georgia, serif">{roman}</text>
      <Ground />
    </g>
  );
}

function SceneStars({ seed }: { seed: number }) {
  const pts = Array.from({ length: 11 }).map((_, i) => {
    const a = ((360 / 11) * i + seed) * (Math.PI / 180);
    const r = i % 3 === 0 ? 58 : i % 3 === 1 ? 38 : 20;
    return { x: 100 + r * Math.cos(a), y: 132 + r * Math.sin(a) };
  });
  return (
    <g>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i % 3 === 0 ? 2.6 : 1.6} fill="rgba(255,250,228,.95)" />
      ))}
      <Ground />
    </g>
  );
}

function SceneLoom() {
  return (
    <g>
      {Array.from({ length: 13 }).map((_, i) => (
        <line key={i} x1={40 + i * 10} y1="60" x2={40 + i * 10} y2="240" stroke={i % 4 === 0 ? GOLD : "rgba(255,255,255,.3)"} strokeWidth={i % 4 === 0 ? 1 : 0.6} />
      ))}
    </g>
  );
}

function SceneScales({ roman }: { roman: string }) {
  return (
    <g>
      <Ground />
      <line x1="100" y1="70" x2="100" y2="214" stroke={GOLD} strokeWidth="1.3" />
      <line x1="46" y1="104" x2="154" y2="96" stroke={GOLD} strokeWidth="1.3" />
      <text x="100" y="196" textAnchor="middle" fontSize={roman.length > 2 ? 10 : 13} fill={GOLD} fontFamily="'Playfair Display', Georgia, serif">{roman}</text>
    </g>
  );
}

function ScenePath() {
  return (
    <g>
      <Ground />
      <path d="M100 232 C96 196, 72 160, 40 120" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" />
      <path d="M100 232 C104 196, 130 160, 162 120" fill="none" stroke="rgba(255,255,255,.24)" strokeWidth="2" strokeLinecap="round" />
      <Figure scale={0.6} y={236} opacity={0.9} />
    </g>
  );
}

function SceneBody({ scene, seed, roman }: { scene: Scene; seed: number; roman: string }) {
  switch (scene) {
    case "veil": return <SceneVeil />;
    case "figure": return <SceneFigure seed={seed} />;
    case "tower": return <SceneTower />;
    case "moon": return <SceneMoon />;
    case "sun": return <SceneSun />;
    case "wheel": return <SceneWheel seed={seed} roman={roman} />;
    case "stars": return <SceneStars seed={seed} />;
    case "loom": return <SceneLoom />;
    case "scales": return <SceneScales roman={roman} />;
    case "path": return <ScenePath />;
  }
}

export function CardArt({ card, reversed = false }: { card: ArcanaCard; reversed?: boolean }) {
  const scene = sceneOf(card);
  const seed = (card.number * 17) % 90;
  const id = `c${card.number}`;
  return (
    <svg className="jdeck-art" viewBox="0 0 200 300" role="img" aria-label={`${card.name} plate`}>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={card.colorway[1]} />
          <stop offset="58%" stopColor={card.colorway[0]} />
          <stop offset="100%" stopColor={card.colorway[1]} />
        </linearGradient>
        <linearGradient id="xvGoldPlate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f9e7bb" />
          <stop offset="46%" stopColor="#d3a63c" />
          <stop offset="100%" stopColor="#f6dfa0" />
        </linearGradient>
        <radialGradient id={`vig-${id}`}>
          <stop offset="52%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(6,12,26,.5)" />
        </radialGradient>
        <clipPath id={`arch-${id}`}>
          <path d="M26 300 V88 C26 52, 56 30, 100 30 C144 30, 174 52, 174 88 V300 Z" />
        </clipPath>
      </defs>
      <rect width="200" height="300" fill="#101c33" />
      <g clipPath={`url(#arch-${id})`}>
        <rect width="200" height="300" fill={`url(#sky-${id})`} />
        <g transform={reversed ? "rotate(180 100 165)" : undefined}>
          <Clouds tone="rgba(255,255,255,.7)" />
          <SceneBody scene={scene} seed={seed} roman={card.roman} />
        </g>
        <rect width="200" height="300" fill={`url(#vig-${id})`} />
      </g>
      <path d="M26 300 V88 C26 52, 56 30, 100 30 C144 30, 174 52, 174 88 V300" fill="none" stroke={GOLD} strokeWidth="2" />
      <image href={SHIELD} x="86" y="14" width="28" height="37" preserveAspectRatio="xMidYMid meet" />
      <g>
        <rect x="76" y="272" width="48" height="17" rx="8.5" fill="#0d1830" stroke={GOLD} strokeWidth="0.9" />
        <text x="100" y="284.5" textAnchor="middle" fontSize="10" letterSpacing="1.6" fill={GOLD} fontFamily="'Playfair Display', Georgia, serif">{card.roman}</text>
      </g>
      <rect x="5" y="5" width="190" height="290" rx="10" fill="none" stroke={GOLD} strokeWidth="1.2" />
    </svg>
  );
}

export function CardBack() {
  return (
    <div className="jdeck-back">
      <svg className="jdeck-back-art" viewBox="0 0 200 300" role="img" aria-label="XI·XVI card back">
        <rect width="200" height="300" fill="#0f1b31" />
        <rect x="9" y="9" width="182" height="282" rx="12" fill="none" stroke={GOLD} strokeWidth="1.2" opacity="0.8" />
      </svg>
      <img className="jdeck-back__logo" src={SHIELD} alt="" />
    </div>
  );
}
