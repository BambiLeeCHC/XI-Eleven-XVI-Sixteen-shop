import type { ArcanaCard } from "../../data/arcana";

/* ═══════════════════════════════════════════════════════════════════════
   XI·XVI DECK ARTWORK — the real Major Arcana, illustrated fresh in-house.

   Traditional cards, traditional names and meanings (see src/data/arcana.ts)
   — but the plate itself is ours: portrait frame, gold arch, numeral at the
   top, the real XI·XVI shield at the keystone, the house sky mannequin as
   the recurring figure, the brand's clouded sky behind it, borders that
   repeat the monogram. Ten scene types are mapped card by card so the
   picture matches the meaning; several traditional cards share a scene
   type on purpose (the per-card seed keeps the geometry from repeating
   exactly).

   Print-ready: all vector except the shield and the mannequin, both of
   which are supplied at 2x.
   ═══════════════════════════════════════════════════════════════════════ */

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

/** Card number → scene, mapped to the real Major Arcana. Chosen for
 * meaning, not variety — several traditional cards share a scene type
 * (e.g. the lantern in `stars` is a natural fit for both the Hermit and
 * the Star), which is expected and matches how the house deck always
 * worked: the per-card seed keeps the geometry from repeating exactly. */
const SCENE_BY_NUMBER: Record<number, Scene> = {
  0: "path", // The Fool
  1: "figure", // The Magician
  2: "veil", // The High Priestess
  3: "figure", // The Empress
  4: "tower", // The Emperor
  5: "loom", // The Hierophant
  6: "path", // The Lovers
  7: "wheel", // The Chariot
  8: "scales", // Strength
  9: "stars", // The Hermit
  10: "wheel", // The Wheel of Fortune
  11: "scales", // Justice
  12: "moon", // The Hanged Man
  13: "veil", // Death
  14: "loom", // Temperance
  15: "tower", // The Devil
  16: "tower", // The Tower
  17: "stars", // The Star
  18: "moon", // The Moon
  19: "sun", // The Sun
  20: "figure", // Judgement
  21: "wheel", // The World
};

export function sceneOf(card: ArcanaCard): Scene {
  return SCENE_BY_NUMBER[card.number] ?? "wheel";
}

const GOLD = "url(#xvGoldPlate)";

/* ── Scene layers ─────────────────────────────────────────────────────── */

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
  /* The house mannequin, dropped in as the card's figure. */
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
      {/* an uncut bolt of cloth, hanging */}
      <g stroke={GOLD} strokeWidth="1.1" fill="none">
        <path d="M62 96 C74 108, 74 152, 66 196 C62 216, 66 226, 72 232" />
        <path d="M138 96 C126 108, 126 152, 134 196 C138 216, 134 226, 128 232" />
      </g>
      <path
        d="M62 96 C82 90, 118 90, 138 96 C130 128, 132 176, 128 232 C112 226, 88 226, 72 232 C68 176, 70 128, 62 96 Z"
        fill="rgba(255,255,255,.2)"
        stroke="rgba(255,255,255,.42)"
        strokeWidth="0.8"
      />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${76 + i * 15} 100 C${72 + i * 15} 140, ${80 + i * 15} 190, ${76 + i * 15} 228`}
          stroke="rgba(255,255,255,.3)"
          strokeWidth="0.8"
          fill="none"
        />
      ))}
      {/* the scissors that have not been used */}
      <g stroke={GOLD} strokeWidth="1.4" fill="none" opacity="0.9">
        <path d="M92 250 L112 268 M108 250 L88 268" />
        <circle cx="86" cy="272" r="4" />
        <circle cx="114" cy="272" r="4" />
      </g>
    </g>
  );
}

function SceneFigure({ seed }: { seed: number }) {
  return (
    <g>
      {/* halo of eleven rays behind the figure */}
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={i}
          x1="100"
          y1="150"
          x2="100"
          y2="62"
          stroke="rgba(255,236,186,.5)"
          strokeWidth={i % 2 ? 0.7 : 1.3}
          strokeLinecap="round"
          transform={`rotate(${(360 / 11) * i + seed} 100 150)`}
        />
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
      {/* sixteen courses, narrowing */}
      {Array.from({ length: 16 }).map((_, i) => {
        const w = 62 - i * 2.6;
        return (
          <rect
            key={i}
            x={100 - w / 2}
            y={214 - i * 9.4}
            width={w}
            height={6.4}
            rx="1.4"
            fill={i % 4 === 0 ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.1)"}
            stroke={i % 4 === 0 ? GOLD : "rgba(255,255,255,.34)"}
            strokeWidth={i % 4 === 0 ? 1 : 0.6}
          />
        );
      })}
      {/* crown + the strike that takes it */}
      <path d="M88 64 L100 46 L112 64 Z" fill="none" stroke={GOLD} strokeWidth="1.2" />
      <path
        d="M132 52 L118 84 L130 84 L112 122"
        fill="none"
        stroke="rgba(255,242,196,.9)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* falling stones */}
      <rect x="60" y="150" width="9" height="6" rx="1.4" fill="rgba(255,255,255,.24)" transform="rotate(-24 64 153)" />
      <rect x="136" y="176" width="8" height="5.4" rx="1.4" fill="rgba(255,255,255,.2)" transform="rotate(32 140 178)" />
    </g>
  );
}

function SceneMoon() {
  return (
    <g>
      {/* moon with the bite out of it */}
      <g>
        <circle cx="100" cy="106" r="34" fill="rgba(255,252,240,.92)" />
        <circle cx="118" cy="96" r="30" fill="rgba(255,255,255,0)" />
        <path d="M100 72 A34 34 0 1 0 100 140 A27 27 0 1 1 100 72 Z" fill="rgba(255,250,236,.95)" />
        <circle cx="100" cy="106" r="42" fill="none" stroke="rgba(255,248,220,.34)" strokeWidth="1.2" />
      </g>
      {/* still water with the reflection path */}
      <path d="M0 218 L200 218 L200 300 L0 300 Z" fill="rgba(10,22,44,.5)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={100 - (26 - i * 4) / 2}
          y={230 + i * 13}
          width={26 - i * 4}
          height={3}
          rx="1.5"
          fill="rgba(255,250,232,.4)"
        />
      ))}
      {/* two pillars, the classic gate */}
      <rect x="34" y="150" width="10" height="70" fill="rgba(255,255,255,.14)" stroke={GOLD} strokeWidth="0.9" />
      <rect x="156" y="150" width="10" height="70" fill="rgba(255,255,255,.14)" stroke={GOLD} strokeWidth="0.9" />
    </g>
  );
}

function SceneSun() {
  return (
    <g>
      {Array.from({ length: 16 }).map((_, i) => (
        <line
          key={i}
          x1="100"
          y1="112"
          x2="100"
          y2={i % 2 ? 36 : 20}
          stroke="rgba(255,238,178,.6)"
          strokeWidth={i % 2 ? 0.8 : 1.6}
          strokeLinecap="round"
          transform={`rotate(${(360 / 16) * i} 100 112)`}
        />
      ))}
      <circle cx="100" cy="112" r="38" fill="rgba(255,240,190,.34)" />
      <circle cx="100" cy="112" r="27" fill="rgba(255,246,214,.9)" />
      <Ground />
      {/* two figures of cloth on the ground line — the wearers */}
      <path d="M66 232 C70 208, 78 200, 84 232 Z" fill="rgba(255,255,255,.28)" stroke={GOLD} strokeWidth="0.7" />
      <path d="M118 232 C124 204, 132 200, 138 232 Z" fill="rgba(255,255,255,.24)" stroke={GOLD} strokeWidth="0.7" />
    </g>
  );
}

function SceneWheel({ seed, roman }: { seed: number; roman: string }) {
  return (
    <g>
      {[62, 50, 38, 24].map((r, i) => (
        <circle
          key={r}
          cx="100"
          cy="150"
          r={r}
          fill="none"
          stroke={i % 2 ? "rgba(255,255,255,.3)" : GOLD}
          strokeWidth={i % 2 ? 0.7 : 1.2}
          strokeDasharray={i === 1 ? "5 8" : undefined}
        />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line
          key={i}
          x1="100"
          y1="88"
          x2="100"
          y2="112"
          stroke={GOLD}
          strokeWidth="1"
          transform={`rotate(${(360 / 9) * i + seed} 100 150)`}
        />
      ))}
      <text x="100" y="156" textAnchor="middle" fontSize={roman.length > 2 ? 13 : 19} fill={GOLD} fontFamily="'Playfair Display', Georgia, serif">
        {roman}
      </text>
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
      {pts.map((p, i) => {
        const n = pts[(i + 1) % pts.length];
        return <line key={`l${i}`} x1={p.x} y1={p.y} x2={n.x} y2={n.y} stroke="rgba(255,246,214,.28)" strokeWidth="0.7" />;
      })}
      {pts.map((p, i) => (
        <g key={`s${i}`}>
          <circle cx={p.x} cy={p.y} r={i % 3 === 0 ? 2.6 : 1.6} fill="rgba(255,250,228,.95)" />
          {i % 3 === 0 && (
            <path
              d={`M${p.x - 6} ${p.y} H${p.x + 6} M${p.x} ${p.y - 6} V${p.y + 6}`}
              stroke="rgba(255,250,228,.5)"
              strokeWidth="0.7"
            />
          )}
        </g>
      ))}
      <Ground />
      {/* the lantern on the ground */}
      <g stroke={GOLD} strokeWidth="1" fill="rgba(255,240,190,.34)">
        <rect x="92" y="212" width="16" height="18" rx="2" />
        <path d="M96 212 L100 204 L104 212" fill="none" />
      </g>
    </g>
  );
}

function SceneLoom() {
  return (
    <g>
      {/* warp */}
      {Array.from({ length: 13 }).map((_, i) => (
        <line
          key={`w${i}`}
          x1={40 + i * 10}
          y1="60"
          x2={40 + i * 10}
          y2="240"
          stroke={i % 4 === 0 ? GOLD : "rgba(255,255,255,.3)"}
          strokeWidth={i % 4 === 0 ? 1 : 0.6}
        />
      ))}
      {/* weft, woven over and under */}
      {Array.from({ length: 15 }).map((_, i) => (
        <path
          key={`f${i}`}
          d={`M36 ${68 + i * 12} Q100 ${68 + i * 12 + (i % 2 ? 9 : -9)} 164 ${68 + i * 12}`}
          fill="none"
          stroke={i % 5 === 2 ? "rgba(255,236,186,.65)" : "rgba(255,255,255,.24)"}
          strokeWidth={i % 5 === 2 ? 1.1 : 0.7}
        />
      ))}
      {/* the shuttle, mid-pass */}
      <g transform="translate(0 4)">
        <path d="M78 176 L122 176 L114 184 L86 184 Z" fill="rgba(255,240,200,.85)" stroke={GOLD} strokeWidth="0.8" />
      </g>
      {/* measure */}
      <g stroke={GOLD} strokeWidth="0.9">
        <line x1="34" y1="252" x2="166" y2="252" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={34 + i * 12} y1="252" x2={34 + i * 12} y2={i % 4 === 0 ? 244 : 248} />
        ))}
      </g>
    </g>
  );
}

function SceneScales({ roman }: { roman: string }) {
  return (
    <g>
      <Ground />
      <line x1="100" y1="70" x2="100" y2="214" stroke={GOLD} strokeWidth="1.3" />
      <line x1="46" y1="104" x2="154" y2="96" stroke={GOLD} strokeWidth="1.3" />
      {/* two pans, slightly out of balance — the reckoning is not settled */}
      <g stroke={GOLD} strokeWidth="1" fill="rgba(255,255,255,.16)">
        <path d="M32 104 L60 104 L52 122 L40 122 Z" />
        <line x1="46" y1="104" x2="46" y2="98" />
        <path d="M140 96 L168 96 L160 116 L148 116 Z" />
        <line x1="154" y1="96" x2="154" y2="90" />
      </g>
      <circle cx="100" cy="70" r="4.4" fill="none" stroke={GOLD} strokeWidth="1.2" />
      <text x="100" y="196" textAnchor="middle" fontSize={roman.length > 2 ? 10 : 13} fill={GOLD} fontFamily="'Playfair Display', Georgia, serif">
        {roman}
      </text>
    </g>
  );
}

function ScenePath() {
  return (
    <g>
      <Ground />
      {/* two roads out of one */}
      <path d="M100 232 C96 196, 72 160, 40 120" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" />
      <path d="M100 232 C104 196, 130 160, 162 120" fill="none" stroke="rgba(255,255,255,.24)" strokeWidth="2" strokeLinecap="round" />
      <path d="M100 232 L100 168" stroke={GOLD} strokeWidth="1.2" strokeDasharray="4 5" />
      <Figure scale={0.6} y={236} opacity={0.9} />
      {/* the two doors */}
      <rect x="26" y="86" width="26" height="40" rx="12" fill="rgba(255,255,255,.16)" stroke={GOLD} strokeWidth="0.9" />
      <rect x="148" y="86" width="26" height="40" rx="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.4)" strokeWidth="0.9" />
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

/* ── The plate ────────────────────────────────────────────────────────── */

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
        {/* The arch: everything in the scene is clipped to it. */}
        <clipPath id={`arch-${id}`}>
          <path d="M26 300 V88 C26 52, 56 30, 100 30 C144 30, 174 52, 174 88 V300 Z" />
        </clipPath>
        <pattern id={`mono-${id}`} width="18" height="18" patternUnits="userSpaceOnUse">
          <text x="9" y="12" textAnchor="middle" fontSize="7" fill="rgba(214,178,96,.35)" fontFamily="'Playfair Display', Georgia, serif">
            XI
          </text>
        </pattern>
      </defs>

      {/* card stock */}
      <rect width="200" height="300" fill="#101c33" />
      <rect width="200" height="300" fill={`url(#mono-${id})`} opacity="0.5" />

      <g>
        {/* The picture window. Only the scene turns when a card is reversed —
           the arch, the shield and the numeral stay the right way up, the way
           a printed plate would. */}
        <g clipPath={`url(#arch-${id})`}>
          <rect width="200" height="300" fill={`url(#sky-${id})`} />
          <g transform={reversed ? "rotate(180 100 165)" : undefined}>
            <Clouds tone="rgba(255,255,255,.7)" />
            <SceneBody scene={scene} seed={seed} roman={card.roman} />
          </g>
          <rect width="200" height="300" fill={`url(#vig-${id})`} />
        </g>
        {/* arch moulding */}
        <path
          d="M26 300 V88 C26 52, 56 30, 100 30 C144 30, 174 52, 174 88 V300"
          fill="none"
          stroke={GOLD}
          strokeWidth="2"
        />
        <path
          d="M32 300 V89 C32 56, 60 36, 100 36 C140 36, 168 56, 168 89 V300"
          fill="none"
          stroke="rgba(214,178,96,.45)"
          strokeWidth="0.7"
        />
        {/* the keystone: the real shield */}
        <image href={SHIELD} x="86" y="14" width="28" height="37" preserveAspectRatio="xMidYMid meet" />
      </g>

      {/* numeral cartouche */}
      <g>
        <rect x="76" y="272" width="48" height="17" rx="8.5" fill="#0d1830" stroke={GOLD} strokeWidth="0.9" />
        <text x="100" y="284.5" textAnchor="middle" fontSize="10" letterSpacing="1.6" fill={GOLD} fontFamily="'Playfair Display', Georgia, serif">
          {card.roman}
        </text>
      </g>

      {/* outer border */}
      <rect x="5" y="5" width="190" height="290" rx="10" fill="none" stroke={GOLD} strokeWidth="1.2" />
      <rect x="10" y="10" width="180" height="280" rx="7" fill="none" stroke="rgba(214,178,96,.3)" strokeWidth="0.6" />
    </svg>
  );
}

/** The card back — the real house logo on ink, identical on every card. */
export function CardBack() {
  return (
    <div className="jdeck-back">
      <svg className="jdeck-back-art" viewBox="0 0 200 300" role="img" aria-label="XI·XVI card back">
        <defs>
          <linearGradient id="backInk" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1c2e4d" />
            <stop offset="52%" stopColor="#0f1b31" />
            <stop offset="100%" stopColor="#1f3054" />
          </linearGradient>
          <linearGradient id="xvGoldBack" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f9e6b6" />
            <stop offset="45%" stopColor="#d3a338" />
            <stop offset="100%" stopColor="#f5dc9c" />
          </linearGradient>
          <pattern id="guilloche" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 8 Q4 0 8 8 T16 8" fill="none" stroke="rgba(214,178,96,.18)" strokeWidth="0.6" />
            <path d="M8 0 Q16 4 8 8 T8 16" fill="none" stroke="rgba(160,196,240,.11)" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="200" height="300" fill="url(#backInk)" />
        <rect width="200" height="300" fill="url(#guilloche)" />
        <rect x="9" y="9" width="182" height="282" rx="12" fill="none" stroke="url(#xvGoldBack)" strokeWidth="1.2" opacity="0.8" />
        <rect x="16" y="16" width="168" height="268" rx="9" fill="none" stroke="rgba(214,178,96,.28)" strokeWidth="0.6" />
        <text x="100" y="42" textAnchor="middle" fontSize="7.5" letterSpacing="4" fill="rgba(226,214,186,.6)">
          ELEVEN · SIXTEEN
        </text>
        <text x="100" y="268" textAnchor="middle" fontSize="6.5" letterSpacing="3.4" fill="rgba(226,214,186,.45)">
          THE MAJOR ARCANA
        </text>
      </svg>
      {/* the actual logo file, not a redraw */}
      <img className="jdeck-back__logo" src={SHIELD} alt="" />
    </div>
  );
}
