type CraftProps = { className?: string };

export function AstrolabeAirship({ className = "xsky__airship" }: CraftProps) {
  return (
    <svg className={className} viewBox="0 0 240 330" aria-hidden="true">
      <defs>
        <radialGradient id="airship-envelope" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#f7f0e6" stopOpacity="0.96" />
          <stop offset="42%" stopColor="#e4d4f4" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#6a587f" stopOpacity="0.18" />
        </radialGradient>
        <linearGradient id="airship-ribbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e7f6d4" />
          <stop offset="50%" stopColor="#d8f0c4" />
          <stop offset="100%" stopColor="#f3e7c2" />
        </linearGradient>
        <filter id="airship-glow" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <path id="airship-silk" d="M34 292 C78 312, 156 312, 208 288" />
      </defs>
      <ellipse cx="120" cy="112" rx="82" ry="96" fill="url(#airship-envelope)" filter="url(#airship-glow)" />
      <ellipse cx="120" cy="112" rx="82" ry="96" fill="none" stroke="rgba(247,240,230,0.55)" strokeWidth="1.2" />
      <circle cx="120" cy="108" r="58" fill="none" stroke="#d8f0c4" strokeWidth="1.15" />
      <circle cx="120" cy="108" r="40" fill="none" stroke="rgba(247,240,230,0.8)" strokeWidth="0.8" />
      <path d="M120 58 L127 108 L120 100 L113 108 Z" fill="#d8f0c4" />
      <path d="M120 158 L113 108 L120 116 L127 108 Z" fill="#e4d4f4" />
      <path d="M70 108 L120 114 L120 102 Z" fill="rgba(247,240,230,0.85)" />
      <path d="M170 108 L120 102 L120 114 Z" fill="rgba(228,212,244,0.9)" />
      <circle cx="120" cy="108" r="4.5" fill="#f6e7b0" />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
        const inner = index % 3 === 0 ? 46 : 50;
        return (
          <line
            key={index}
            x1={120 + Math.cos(angle) * inner}
            y1={108 + Math.sin(angle) * inner}
            x2={120 + Math.cos(angle) * 56}
            y2={108 + Math.sin(angle) * 56}
            stroke="rgba(247,240,230,0.75)"
            strokeWidth="1"
          />
        );
      })}
      <path d="M62 186 Q92 214 104 240" fill="none" stroke="rgba(247,240,230,0.75)" strokeWidth="1" />
      <path d="M178 186 Q148 214 136 240" fill="none" stroke="rgba(247,240,230,0.75)" strokeWidth="1" />
      <path d="M120 198 L120 238" fill="none" stroke="rgba(216,240,196,0.8)" strokeWidth="1" />
      <rect x="96" y="236" width="48" height="28" rx="5" fill="rgba(16, 22, 18, 0.78)" stroke="#d8f0c4" strokeWidth="1.2" />
      <path d="M102 244 H138 M102 252 H138" stroke="rgba(247,240,230,0.45)" strokeWidth="1" />
      <path d="M22 278 C74 304, 164 306, 220 274 L220 292 C164 322, 74 320, 22 296 Z" fill="url(#airship-ribbon)" />
      <text fill="#142010" fontSize="11" fontWeight="700" letterSpacing="1.4" fontFamily="Satoshi, Inter, sans-serif">
        <textPath href="#airship-silk">XIXVI · TRUE NORTH</textPath>
      </text>
    </svg>
  );
}

export function CrescentGondola({ className = "xsky__gondola" }: CraftProps) {
  return (
    <svg className={className} viewBox="0 0 230 120" aria-hidden="true">
      <defs>
        <linearGradient id="gondola-hull" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7f0e6" />
          <stop offset="48%" stopColor="#e7d4f4" />
          <stop offset="100%" stopColor="#d8f0c4" />
        </linearGradient>
        <filter id="gondola-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M48 62c0-24 20-42 44-42 9 0 18 3 24 8-16 3-28 18-28 36s12 33 28 36c-6 5-15 8-24 8-24 0-44-20-44-46z"
        fill="url(#gondola-hull)"
        opacity="0.92"
        filter="url(#gondola-glow)"
      />
      <path d="M46 64c0-22 18-38 40-38" fill="none" stroke="rgba(247,240,230,0.8)" strokeWidth="1" />
      <path d="M28 78 C78 104, 150 102, 204 70" fill="none" stroke="#f6e7b0" strokeWidth="1.6" />
      <path d="M36 86 C84 108, 154 104, 198 76" fill="none" stroke="rgba(216,240,196,0.75)" strokeWidth="1" />
      <path d="M120 74 C146 64, 176 66, 188 78 C168 92, 140 94, 120 82 Z" fill="rgba(247,240,230,0.88)" stroke="#d8f0c4" strokeWidth="1.1" />
      <circle cx="158" cy="46" r="6" fill="#f6e7b0" />
      <circle cx="158" cy="46" r="11" fill="#f6e7b0" opacity="0.28" />
      <path d="M158 52 L158 62" stroke="#f7f0e6" strokeWidth="1" />
      <circle cx="34" cy="28" r="1.3" fill="#f7f0e6" />
      <circle cx="196" cy="34" r="1.2" fill="#d8f0c4" />
      <circle cx="210" cy="58" r="1" fill="#e4d4f4" />
    </svg>
  );
}

export function CelestialMoth({ className = "xsky__moth" }: CraftProps) {
  return (
    <svg className={className} viewBox="0 0 180 120" aria-hidden="true">
      <defs>
        <linearGradient id="moth-wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7f0e6" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#e4d4f4" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#d8f0c4" stopOpacity="0.55" />
        </linearGradient>
        <filter id="moth-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="58" cy="58" rx="40" ry="26" transform="rotate(-28 58 58)" fill="url(#moth-wing)" stroke="rgba(247,240,230,0.85)" strokeWidth="1.1" filter="url(#moth-glow)" />
      <ellipse cx="122" cy="58" rx="40" ry="26" transform="rotate(28 122 58)" fill="url(#moth-wing)" stroke="rgba(247,240,230,0.85)" strokeWidth="1.1" />
      <ellipse cx="64" cy="78" rx="22" ry="14" transform="rotate(-18 64 78)" fill="rgba(216,240,196,0.7)" stroke="rgba(247,240,230,0.85)" />
      <ellipse cx="116" cy="78" rx="22" ry="14" transform="rotate(18 116 78)" fill="rgba(228,212,244,0.7)" stroke="rgba(247,240,230,0.85)" />
      <path d="M90 40 C92 62, 92 78, 90 98" stroke="#f7f0e6" strokeWidth="2.4" fill="none" />
      <circle cx="90" cy="40" r="3.2" fill="#142010" />
      <path d="M84 36 Q74 24 70 22" fill="none" stroke="#f7f0e6" strokeWidth="1" />
      <path d="M96 36 Q106 24 110 22" fill="none" stroke="#f7f0e6" strokeWidth="1" />
      <circle cx="70" cy="21" r="1.5" fill="#f6e7b0" />
      <circle cx="110" cy="21" r="1.5" fill="#f6e7b0" />
      <path d="M90 96 L96 112 L90 108 L84 112 Z" fill="#f6e7b0" stroke="#d8f0c4" />
      <circle cx="90" cy="70" r="5" fill="none" stroke="#f7f0e6" strokeWidth="1" />
      <path d="M90 66 L93 70 L90 74 L87 70 Z" fill="#d8f0c4" />
    </svg>
  );
}

export function CometTrail({
  id,
  className = "xsky__comet",
}: {
  id: string;
  className?: string;
}) {
  const tail = `${id}-tail`;
  return (
    <svg className={className} viewBox="0 0 300 70" aria-hidden="true">
      <defs>
        <linearGradient id={tail} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f7f0e6" stopOpacity="0" />
          <stop offset="62%" stopColor="#e4d4f4" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#f6e7b0" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path d="M6 46 C90 40, 170 30, 248 18" stroke={`url(#${tail})`} strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="252" cy="16" r="11" fill="#f6e7b0" opacity="0.28" />
      <circle cx="252" cy="16" r="4.5" fill="#f7f0e6" />
      <circle cx="190" cy="32" r="1.5" fill="#d8f0c4" />
      <circle cx="140" cy="38" r="1.2" fill="#f7f0e6" />
      <circle cx="86" cy="44" r="1.1" fill="#e4d4f4" />
      <circle cx="48" cy="48" r="1" fill="#f6e7b0" />
    </svg>
  );
}
