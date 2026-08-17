/* ═══════════════════════════════════════════════════════════════════════
   SKY GLYPHS — hand-drawn line-art planet and zodiac icons.

   Replaces plain unicode astrological characters (☉ ☽ ♂ ♈ …), which render
   as flat system-font glyphs — on some devices even as colorful emoji —
   with real vector icons drawn in the brand's own line weight and gold/ink
   palette. Same read at a glance, but they now look illustrated, not typed.
   ═══════════════════════════════════════════════════════════════════════ */

type GlyphProps = { size?: number; className?: string };

function Glyph({ size = 16, className, children }: GlyphProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const PLANET_PATHS: Record<string, React.ReactNode> = {
  Sun: (
    <>
      <circle cx="12" cy="12" r="4.4" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.3" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (Math.PI / 4) * i;
        const r1 = 8, r2 = 10.6;
        const x1 = 12 + r1 * Math.cos(a), y1 = 12 + r1 * Math.sin(a);
        const x2 = 12 + r2 * Math.cos(a), y2 = 12 + r2 * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />;
      })}
    </>
  ),
  Moon: (
    <path
      d="M14.5 4.2c-4.6.9-7.7 5.1-7 9.7.8 4.6 5.1 7.7 9.7 6.9-2.9-1.9-4.9-5.2-4.9-8.9 0-3.6 1.9-6.9 4.9-8.8Z"
      fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
    />
  ),
  Mercury: (
    <>
      <path d="M8.6 4.2a3.4 3.4 0 1 0 6.8 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="9.4" r="4" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.3" />
      <line x1="12" y1="13.4" x2="12" y2="19.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  Venus: (
    <>
      <circle cx="12" cy="9.4" r="5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.3" />
      <line x1="12" y1="14.4" x2="12" y2="20.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="8.8" y1="17.6" x2="15.2" y2="17.6" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  Mars: (
    <>
      <circle cx="10.4" cy="13.6" r="5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.3" />
      <line x1="14" y1="10" x2="19.2" y2="4.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M14.6 4.8h4.6v4.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  Jupiter: (
    <>
      <path d="M5 8.6c2.6 0 4.4 1.5 4.4 3.7 0 2-1.5 3.3-3.7 3.3H5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <line x1="16.4" y1="4.5" x2="16.4" y2="19.5" stroke="currentColor" strokeWidth="1.3" />
      <line x1="9.6" y1="12.4" x2="19.5" y2="12.4" stroke="currentColor" strokeWidth="1.1" />
    </>
  ),
  Saturn: (
    <>
      <line x1="8.5" y1="4.5" x2="8.5" y2="19.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="5.8" y1="7.4" x2="11.2" y2="7.4" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8.5 12c3-.2 5.6 1.2 5.6 3.9a3.7 3.7 0 0 1-3.7 3.6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),
  Uranus: (
    <>
      <line x1="6.4" y1="5" x2="6.4" y2="14" stroke="currentColor" strokeWidth="1.2" />
      <line x1="17.6" y1="5" x2="17.6" y2="14" stroke="currentColor" strokeWidth="1.2" />
      <line x1="6.4" y1="10.4" x2="17.6" y2="10.4" stroke="currentColor" strokeWidth="1.2" />
      <line x1="12" y1="10.4" x2="12" y2="17.6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="19.6" r="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.1" />
    </>
  ),
  Neptune: (
    <>
      <path d="M6.6 6.4c1.2 3.6 4.4 5.8 5.4 5.8s4.2-2.2 5.4-5.8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <line x1="12" y1="8.2" x2="12" y2="20" stroke="currentColor" strokeWidth="1.2" />
      <line x1="9" y1="16.5" x2="15" y2="16.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="6.6" y1="6.4" x2="6.6" y2="4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="17.4" y1="6.4" x2="17.4" y2="4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  Pluto: (
    <>
      <path d="M8 6.6a4 4 0 1 0 8 0" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="12.6" r="3.4" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.2" />
      <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  Ascendant: (
    <>
      <path d="M4.5 18 12 4.5 19.5 18" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <line x1="7.6" y1="12.6" x2="16.4" y2="12.6" stroke="currentColor" strokeWidth="1.1" />
    </>
  ),
  Midheaven: (
    <>
      <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 4h5.2M12.8 4H18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7 20 12 15l5 5" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

const SIGN_PATHS: Record<string, React.ReactNode> = {
  Aries: (
    <path d="M7 15c0-5.4 2-9 5-9s5 3.6 5 9M12 6v14" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  ),
  Taurus: (
    <>
      <circle cx="12" cy="14.4" r="4.4" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.4 5.4a5.6 5.6 0 0 0 11.2 0" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),
  Gemini: (
    <>
      <line x1="8" y1="4.4" x2="8" y2="19.6" stroke="currentColor" strokeWidth="1.2" />
      <line x1="16" y1="4.4" x2="16" y2="19.6" stroke="currentColor" strokeWidth="1.2" />
      <line x1="5.4" y1="4.4" x2="18.6" y2="4.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="5.4" y1="19.6" x2="18.6" y2="19.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  Cancer: (
    <>
      <circle cx="7.6" cy="8" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16.4" cy="16" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7.6 10.6c0 5 5 6.6 8.8 3M16.4 13.4c0-5-5-6.6-8.8-3" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </>
  ),
  Leo: (
    <>
      <circle cx="15.6" cy="15.6" r="3.4" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13 15c-3.8 0-7-2.7-6.2-6.8.5-2.6 2.7-4 4.7-3.2 2.3 1 2 3.6 1 4.8-1 1.3-.4 3 1 3" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </>
  ),
  Virgo: (
    <path d="M5.6 5v9.6a3 3 0 0 0 3 3M8.6 5v9.6M11.6 5v9.6a3 3 0 0 0 3 3c1.4 0 2.4-.8 2.8-2M17 12v6.4M15 16.6c1.4-1.2 3.4-1 3.9.7" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" />
  ),
  Libra: (
    <>
      <line x1="5" y1="16.6" x2="19" y2="16.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="19.4" x2="19" y2="19.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M6.6 13.6c0-3.6 2.4-6.2 5.4-6.2s5.4 2.6 5.4 6.2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),
  Scorpio: (
    <path d="M5.6 5v9.6a3 3 0 0 0 3 3M8.6 5v9.6M11.6 5v9.6a3 3 0 0 0 3 3M17.4 12.6l3.6 3.4-1.4 1.6M17.4 12.6v6.4" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  Sagittarius: (
    <>
      <line x1="6" y1="18" x2="18.6" y2="5.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12.4 5.4h6.2v6.2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9.6" y1="11.4" x2="12.8" y2="14.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  Capricorn: (
    <path d="M5.6 6c1.6-.6 3 .4 3 2.4v9.2M8.6 8.2c1-1.6 3-1.4 3.4.6.6 3-2.4 4-1 6.6.8 1.6 3 1.8 4-.2a2.6 2.6 0 0 0-3.6-3.4" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" />
  ),
  Aquarius: (
    <>
      <path d="M4.2 9.4c1.4-1.4 2.8-1.4 4.2 0s2.8 1.4 4.2 0 2.8-1.4 4.2 0 2.8 1.4 4.2 0" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M4.2 15.4c1.4-1.4 2.8-1.4 4.2 0s2.8 1.4 4.2 0 2.8-1.4 4.2 0 2.8 1.4 4.2 0" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),
  Pisces: (
    <>
      <path d="M9 4.4c-2.4 2.4-2.4 12.8 0 15.2M15 4.4c2.4 2.4 2.4 12.8 0 15.2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.1" />
    </>
  ),
};

/** Illustrated planet/point icon — swaps in for the old plain-text glyph
 * (☉ ☽ ♂ …), which some devices render as colorful system emoji. */
export function PlanetIcon({ body, size = 16, className }: { body: string } & GlyphProps) {
  return <Glyph size={size} className={className}>{PLANET_PATHS[body] ?? <circle cx="12" cy="12" r="3" fill="currentColor" />}</Glyph>;
}

/** Illustrated zodiac sign icon, same treatment as PlanetIcon. */
export function SignIcon({ sign, size = 16, className }: { sign: string } & GlyphProps) {
  return <Glyph size={size} className={className}>{SIGN_PATHS[sign] ?? <circle cx="12" cy="12" r="3" fill="currentColor" />}</Glyph>;
}

export const HAS_PLANET_ICON = (body: string) => body in PLANET_PATHS;
export const HAS_SIGN_ICON = (sign: string) => sign in SIGN_PATHS;

/** Positioned icon for embedding directly inside another <svg> (e.g. the
 * chart wheel) via a translated+scaled <g>, rather than nesting a whole
 * second <svg> element. `x`/`y` is the icon's center point. */
export function PlanetIconG({ body, x, y, size = 14 }: { body: string; x: number; y: number; size?: number }) {
  const scale = size / 24;
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${scale})`}>
      {PLANET_PATHS[body] ?? <circle cx="12" cy="12" r="3" fill="currentColor" />}
    </g>
  );
}

export function SignIconG({ sign, x, y, size = 14 }: { sign: string; x: number; y: number; size?: number }) {
  const scale = size / 24;
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${scale})`}>
      {SIGN_PATHS[sign] ?? <circle cx="12" cy="12" r="3" fill="currentColor" />}
    </g>
  );
}
