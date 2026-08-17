/**
 * A real illustrated moon-phase sliver — an ellipse-over-circle terminator
 * shape, like an old-world almanac prints in its calendar margins — instead
 * of a flat unicode moon glyph. `frac` is 0=new, 0.5=full, 1=new again
 * (matches the synodic fraction ritual.ts already computes).
 */
export function MoonPhaseIcon({ frac, size = 13, className }: { frac: number; size?: number; className?: string }) {
  const waxing = frac < 0.5;
  // Terminator ellipse: its horizontal radius sweeps from +R (new, all dark)
  // through 0 (quarters, straight edge) to -R (full, all lit), independent
  // of waxing/waning; the lit side flips between waxing and waning.
  const half = waxing ? frac * 2 : (1 - frac) * 2; // 0..1 across the half-cycle
  const R = 6;
  const rx = R * (1 - 2 * half);
  const litOnRight = waxing;

  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true" className={className} style={{ display: "inline-block", verticalAlign: "middle" }}>
      <circle cx="7" cy="7" r={R} fill="rgba(29,47,79,.16)" stroke="rgba(29,47,79,.4)" strokeWidth="0.6" />
      <clipPath id={`moon-clip-${litOnRight ? "r" : "l"}-${Math.round(half * 100)}`}>
        <circle cx="7" cy="7" r={R} />
      </clipPath>
      <g clipPath={`url(#moon-clip-${litOnRight ? "r" : "l"}-${Math.round(half * 100)})`}>
        <rect x={litOnRight ? 7 : 0} y="0" width="7" height="14" fill="#f4dfa2" opacity="0.95" />
        <ellipse cx="7" cy="7" rx={Math.abs(rx)} ry={R} fill={rx > 0 === litOnRight ? "rgba(29,47,79,.16)" : "#f4dfa2"} opacity={rx > 0 === litOnRight ? 1 : 0.95} />
      </g>
    </svg>
  );
}
