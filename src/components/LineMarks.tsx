/** Geometric marks. One weight, round ends, readable at 16px. */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SearchMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" {...stroke} />
      <path d="M14.8 14.8 19 19" {...stroke} />
    </svg>
  );
}

export function HeartMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 18.5c-4-2.4-6.5-5-6.5-8A3.4 3.4 0 0 1 12 7.6 3.4 3.4 0 0 1 18.5 10.5c0 3-2.5 5.6-6.5 8Z"
        {...stroke}
      />
    </svg>
  );
}

/** A stem and one arc. Off state adds a single cut. */
export function SoundMark({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M8 15.5V8.5L13 6v12L8 15.5Z" {...stroke} />
      <path d="M15.5 9.2a4 4 0 0 1 0 5.6" {...stroke} />
      {on ? null : <path d="M5.5 18.5 18.5 5.5" {...stroke} />}
    </svg>
  );
}
