import type { ArcanaCard } from "../../data/arcana";

/* ═══════════════════════════════════════════════════════════════════════
   XI·XVI DECK ARTWORK — generated house sigils.

   Every card face carries a piece of brand geometry rather than borrowed
   occult illustration: eleven rays (the signal), sixteen courses (the
   tower), the weave lattice, the bloom, the mirror, the constellation of
   27→9. Art family is chosen from the card number so a card always looks
   the same, and the plates are print-ready vector — the same files can go
   straight onto a licensed physical deck.
   ═══════════════════════════════════════════════════════════════════════ */

type Family = "signal" | "tower" | "weave" | "bloom" | "mirror" | "constellation" | "cycle";

const FAMILIES: Family[] = ["signal", "tower", "weave", "bloom", "mirror", "constellation", "cycle"];

export function artFamily(card: ArcanaCard): Family {
  return FAMILIES[card.number % FAMILIES.length];
}

/** The gold shield emblem, drawn as vector so it stays crisp at any size. */
function ShieldMark({ opacity = 0.9, size = 1 }: { opacity?: number; size?: number }) {
  return (
    <g opacity={opacity} transform={`translate(100 100) scale(${size}) translate(-100 -100)`}>
      <path
        d="M100 62 L128 74 V101 C128 118 115 130 100 138 C85 130 72 118 72 101 V74 Z"
        fill="none"
        stroke="url(#xvGold)"
        strokeWidth="2.2"
      />
      <path
        d="M100 70 L121 79 V100 C121 113 111 123 100 129 C89 123 79 113 79 100 V79 Z"
        fill="rgba(255,255,255,.06)"
        stroke="url(#xvGold)"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <text
        x="100"
        y="97"
        textAnchor="middle"
        fontSize="13"
        letterSpacing="1.4"
        fill="url(#xvGold)"
        fontFamily="'Playfair Display', Georgia, serif"
      >
        XI
      </text>
      <text
        x="100"
        y="115"
        textAnchor="middle"
        fontSize="13"
        letterSpacing="1.4"
        fill="url(#xvGold)"
        fontFamily="'Playfair Display', Georgia, serif"
      >
        XVI
      </text>
    </g>
  );
}

function FamilyArt({ family, seed }: { family: Family; seed: number }) {
  const stroke = "rgba(255,255,255,.62)";
  const faint = "rgba(255,255,255,.26)";

  switch (family) {
    case "signal":
      return (
        <g>
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={i}
              x1="100"
              y1="100"
              x2="100"
              y2={i % 2 ? 22 : 8}
              stroke={i % 2 ? faint : stroke}
              strokeWidth={i % 2 ? 0.8 : 1.4}
              strokeLinecap="round"
              transform={`rotate(${(360 / 11) * i + seed} 100 100)`}
            />
          ))}
          <circle cx="100" cy="100" r="46" fill="none" stroke={faint} strokeWidth="0.8" />
          <circle cx="100" cy="100" r="30" fill="none" stroke={stroke} strokeWidth="1.2" />
        </g>
      );
    case "tower":
      return (
        <g>
          {Array.from({ length: 16 }).map((_, i) => {
            const w = 74 - i * 3.4;
            return (
              <rect
                key={i}
                x={100 - w / 2}
                y={168 - i * 9}
                width={w}
                height={5.4}
                rx="1.6"
                fill="none"
                stroke={i % 4 === 0 ? stroke : faint}
                strokeWidth={i % 4 === 0 ? 1.2 : 0.7}
              />
            );
          })}
          <line x1="100" y1="24" x2="100" y2="8" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );
    case "weave":
      return (
        <g>
          {Array.from({ length: 14 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={30 + i * 10}
              y1="26"
              x2={30 + i * 10}
              y2="174"
              stroke={i % 3 === 0 ? stroke : faint}
              strokeWidth={i % 3 === 0 ? 1.1 : 0.6}
            />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <path
              key={`h${i}`}
              d={`M26 ${30 + i * 10.6} Q100 ${30 + i * 10.6 + (i % 2 ? 8 : -8)} 174 ${30 + i * 10.6}`}
              fill="none"
              stroke={i % 3 === 1 ? stroke : faint}
              strokeWidth={i % 3 === 1 ? 1 : 0.6}
            />
          ))}
        </g>
      );
    case "bloom":
      return (
        <g>
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse
              key={i}
              cx="100"
              cy="72"
              rx="15"
              ry="40"
              fill="none"
              stroke={i % 2 ? faint : stroke}
              strokeWidth={i % 2 ? 0.7 : 1.1}
              transform={`rotate(${(360 / 9) * i + seed} 100 100)`}
            />
          ))}
          <circle cx="100" cy="100" r="7" fill="none" stroke={stroke} strokeWidth="1.3" />
        </g>
      );
    case "mirror":
      return (
        <g>
          <path d="M100 18 L162 100 L100 182 L38 100 Z" fill="none" stroke={stroke} strokeWidth="1.3" />
          <path d="M100 40 L142 100 L100 160 L58 100 Z" fill="none" stroke={faint} strokeWidth="0.8" />
          <line x1="38" y1="100" x2="162" y2="100" stroke={faint} strokeWidth="0.7" />
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={i}
              x1={62 + i * 15}
              y1="100"
              x2={62 + i * 15}
              y2={100 - (i % 2 ? 26 : 40)}
              stroke={faint}
              strokeWidth="0.6"
            />
          ))}
        </g>
      );
    case "constellation":
      return (
        <g>
          {Array.from({ length: 9 }).map((_, i) => {
            const a = (360 / 9) * i + seed;
            const r = i % 3 === 0 ? 66 : i % 3 === 1 ? 44 : 24;
            const x = 100 + r * Math.cos((a * Math.PI) / 180);
            const y = 100 + r * Math.sin((a * Math.PI) / 180);
            const next = (360 / 9) * ((i + 1) % 9) + seed;
            const rn = (i + 1) % 3 === 0 ? 66 : (i + 1) % 3 === 1 ? 44 : 24;
            const nx = 100 + rn * Math.cos((next * Math.PI) / 180);
            const ny = 100 + rn * Math.sin((next * Math.PI) / 180);
            return (
              <g key={i}>
                <line x1={x} y1={y} x2={nx} y2={ny} stroke={faint} strokeWidth="0.7" />
                <circle cx={x} cy={y} r={i % 3 === 0 ? 2.6 : 1.7} fill={stroke} />
              </g>
            );
          })}
        </g>
      );
    case "cycle":
      return (
        <g>
          {[70, 56, 42, 28].map((r, i) => (
            <circle
              key={r}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke={i % 2 ? faint : stroke}
              strokeWidth={i % 2 ? 0.7 : 1.15}
              strokeDasharray={i === 1 ? "4 7" : i === 3 ? "2 5" : undefined}
            />
          ))}
          <line x1="100" y1="30" x2="100" y2="170" stroke={faint} strokeWidth="0.6" />
          <line x1="30" y1="100" x2="170" y2="100" stroke={faint} strokeWidth="0.6" />
        </g>
      );
  }
}

/** Full card plate: colorway wash + house sigil + shield watermark. */
export function CardArt({ card, reversed = false }: { card: ArcanaCard; reversed?: boolean }) {
  const family = artFamily(card);
  const seed = (card.number * 13) % 90;
  return (
    <svg className="jdeck-art" viewBox="0 0 200 200" role="img" aria-label={`${card.name} plate`}>
      <defs>
        <linearGradient id={`wash-${card.number}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={card.colorway[0]} />
          <stop offset="100%" stopColor={card.colorway[1]} />
        </linearGradient>
        <linearGradient id="xvGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7e0a8" />
          <stop offset="45%" stopColor="#d8a83f" />
          <stop offset="100%" stopColor="#f3d894" />
        </linearGradient>
        <radialGradient id={`vig-${card.number}`}>
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(8,14,28,.42)" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#wash-${card.number})`} />
      <rect width="200" height="200" fill={`url(#vig-${card.number})`} />
      <g transform={reversed ? "rotate(180 100 100)" : undefined}>
        <FamilyArt family={family} seed={seed} />
        <ShieldMark opacity={0.46} size={0.66} />
      </g>
      <rect
        x="7"
        y="7"
        width="186"
        height="186"
        rx="9"
        fill="none"
        stroke="url(#xvGold)"
        strokeWidth="1.1"
        opacity="0.85"
      />
    </svg>
  );
}

/** The card back — the house shield on ink, identical on every card. */
export function CardBack() {
  return (
    <svg className="jdeck-back-art" viewBox="0 0 200 300" role="img" aria-label="XI·XVI card back">
      <defs>
        <linearGradient id="backInk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b2c4a" />
          <stop offset="52%" stopColor="#101c33" />
          <stop offset="100%" stopColor="#1e2f52" />
        </linearGradient>
        <linearGradient id="xvGoldBack" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f9e6b6" />
          <stop offset="45%" stopColor="#d3a338" />
          <stop offset="100%" stopColor="#f5dc9c" />
        </linearGradient>
        <pattern id="guilloche" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 7 Q3.5 0 7 7 T14 7" fill="none" stroke="rgba(214,178,96,.16)" strokeWidth="0.6" />
          <path d="M7 0 Q14 3.5 7 7 T7 14" fill="none" stroke="rgba(160,196,240,.1)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="200" height="300" fill="url(#backInk)" />
      <rect width="200" height="300" fill="url(#guilloche)" />
      <rect x="9" y="9" width="182" height="282" rx="12" fill="none" stroke="url(#xvGoldBack)" strokeWidth="1.2" opacity="0.75" />
      <rect x="16" y="16" width="168" height="268" rx="9" fill="none" stroke="rgba(214,178,96,.28)" strokeWidth="0.6" />

      {/* Shield, large and centred */}
      <g transform="translate(100 150)">
        <path
          d="M0 -62 L44 -44 V4 C44 32 24 54 0 68 C-24 54 -44 32 -44 4 V-44 Z"
          fill="rgba(255,255,255,.035)"
          stroke="url(#xvGoldBack)"
          strokeWidth="2"
        />
        <path
          d="M0 -51 L34 -37 V2 C34 24 18 42 0 53 C-18 42 -34 24 -34 2 V-37 Z"
          fill="none"
          stroke="rgba(214,178,96,.42)"
          strokeWidth="0.8"
        />
        <text x="0" y="-6" textAnchor="middle" fontSize="21" letterSpacing="2.5" fill="url(#xvGoldBack)" fontFamily="'Playfair Display', Georgia, serif">XI</text>
        <text x="0" y="22" textAnchor="middle" fontSize="21" letterSpacing="2.5" fill="url(#xvGoldBack)" fontFamily="'Playfair Display', Georgia, serif">XVI</text>
        <line x1="-20" y1="4" x2="20" y2="4" stroke="rgba(214,178,96,.55)" strokeWidth="0.8" />
      </g>
      <text x="100" y="44" textAnchor="middle" fontSize="8" letterSpacing="4" fill="rgba(226,214,186,.55)">ELEVEN · SIXTEEN</text>
      <text x="100" y="266" textAnchor="middle" fontSize="7" letterSpacing="3.4" fill="rgba(226,214,186,.42)">THE HOUSE DECK</text>
    </svg>
  );
}
