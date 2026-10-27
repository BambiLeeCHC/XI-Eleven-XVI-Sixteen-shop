/* ═══════════════════════════════════════════════════════════════════════
   TRUE NORTH GLYPHS — modern geometric reimagining of the zodiac.

   Parallel to SkyGlyphs. These marks follow the True North aesthetic:
   clean geometry, higher-self orientation, accessible at small sizes,
   and free of traditional divinatory ornament. Intended for progressive
   use in True North profiles, daily cards, tandem shares, and selected
   chart surfaces.
   ═══════════════════════════════════════════════════════════════════════ */

type GlyphProps = { size?: number; className?: string };

function Glyph({ size = 20, className, children }: GlyphProps & { children: React.ReactNode }) {
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

/** Stroke helpers for consistent line weight across the set */
const S = {
  stroke: "currentColor",
  strokeWidth: 1.35,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none" as const,
};

const SIGN_PATHS: Record<string, React.ReactNode> = {
  /* Forward-pointing chevron / ascending arc with clean apex */
  Aries: (
    <path
      d="M6 17.5c0-4.5 2.8-8.5 6-8.5s6 4 6 8.5"
      {...S}
    />
  ),

  /* Stable horizontal base with soft upward curve */
  Taurus: (
    <>
      <path d="M7 15.5a5 5 0 0 1 10 0" {...S} />
      <line x1="5" y1="18" x2="19" y2="18" {...S} />
    </>
  ),

  /* Two parallel verticals joined by a light bridge */
  Gemini: (
    <>
      <line x1="8.5" y1="5" x2="8.5" y2="19" {...S} />
      <line x1="15.5" y1="5" x2="15.5" y2="19" {...S} />
      <path d="M8.5 12h7" {...S} />
    </>
  ),

  /* Soft open crescent / protective spiral */
  Cancer: (
    <path
      d="M16.5 8.5c-1.2-2.2-3.5-3.5-6-3.2-3.2.4-5.4 3.2-5 6.4.3 2.6 2.4 4.6 5 5"
      {...S}
    />
  ),

  /* Radiating central point with restrained rays */
  Leo: (
    <>
      <circle cx="12" cy="12" r="3.2" {...S} />
      <line x1="12" y1="4.5" x2="12" y2="6.8" {...S} />
      <line x1="12" y1="17.2" x2="12" y2="19.5" {...S} />
      <line x1="4.5" y1="12" x2="6.8" y2="12" {...S} />
      <line x1="17.2" y1="12" x2="19.5" y2="12" {...S} />
      <line x1="6.8" y1="6.8" x2="8.4" y2="8.4" {...S} />
      <line x1="15.6" y1="15.6" x2="17.2" y2="17.2" {...S} />
      <line x1="17.2" y1="6.8" x2="15.6" y2="8.4" {...S} />
      <line x1="8.4" y1="15.6" x2="6.8" y2="17.2" {...S} />
    </>
  ),

  /* Precise vertical with refined loop */
  Virgo: (
    <path
      d="M9 5v10.5a2.5 2.5 0 0 0 2.5 2.5c1.2 0 2.1-.7 2.4-1.7M12 5v10M15 5v7.5"
      {...S}
    />
  ),

  /* Balanced horizontal beam with subtle fulcrum */
  Libra: (
    <>
      <line x1="5" y1="16" x2="19" y2="16" {...S} />
      <path d="M7.5 13c0-2.8 2-4.8 4.5-4.8s4.5 2 4.5 4.8" {...S} />
      <line x1="12" y1="8.2" x2="12" y2="6" {...S} />
    </>
  ),

  /* Focused upward arrow / controlled vertical curve */
  Scorpio: (
    <path
      d="M12 19.5V7.5M9 10.5l3-3 3 3M12 19.5c2.2 0 3.5-1.2 3.5-2.8"
      {...S}
    />
  ),

  /* Open diagonal trajectory referencing a horizon */
  Sagittarius: (
    <>
      <line x1="6" y1="18" x2="18" y2="6" {...S} />
      <path d="M12 6h6v6" {...S} />
      <line x1="5" y1="14" x2="9" y2="14" {...S} />
    </>
  ),

  /* Structured ascending steps / progressive form */
  Capricorn: (
    <path
      d="M6 18V9.5c0-1.5 1-2.5 2.5-2.5S11 8 11 9.5v5M11 14.5c1.2-1.8 3.5-1.5 4.2.6.5 1.5-.2 2.9-1.6 3.4"
      {...S}
    />
  ),

  /* Flowing parallel waves / interconnected nodes */
  Aquarius: (
    <>
      <path d="M5 10c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0" {...S} />
      <path d="M5 15c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0" {...S} />
    </>
  ),

  /* Two soft opposing curves that meet or dissolve */
  Pisces: (
    <>
      <path d="M9 5.5c-2.2 2.5-2.2 10.5 0 13" {...S} />
      <path d="M15 5.5c2.2 2.5 2.2 10.5 0 13" {...S} />
      <line x1="9" y1="12" x2="15" y2="12" {...S} />
    </>
  ),
};

/** Modern geometric zodiac mark for True North contexts. */
export function TrueNorthSignIcon({
  sign,
  size = 20,
  className,
}: { sign: string } & GlyphProps) {
  return (
    <Glyph size={size} className={className}>
      {SIGN_PATHS[sign] ?? <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.35" />}
    </Glyph>
  );
}

export const HAS_TRUE_NORTH_SIGN = (sign: string) => sign in SIGN_PATHS;

/** Positioned version for embedding inside another <svg> (e.g. chart wheel). */
export function TrueNorthSignIconG({
  sign,
  x,
  y,
  size = 16,
}: {
  sign: string;
  x: number;
  y: number;
  size?: number;
}) {
  const scale = size / 24;
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${scale})`}>
      {SIGN_PATHS[sign] ?? <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.35" />}
    </g>
  );
}

export default TrueNorthSignIcon;
