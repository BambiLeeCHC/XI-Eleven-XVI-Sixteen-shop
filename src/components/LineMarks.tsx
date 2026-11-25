/** Hairline marks. One weight, round ends, no fill. */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.35,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SearchMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="11" cy="11" r="5.25" {...stroke} />
      <path d="M15.2 15.2 19 19" {...stroke} />
    </svg>
  );
}

export function HeartMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M12 18.2c-3.6-2.2-6-4.6-6-7.3A3.1 3.1 0 0 1 12 8.2a3.1 3.1 0 0 1 6 2.7c0 2.7-2.4 5.1-6 7.3Z"
        {...stroke}
      />
    </svg>
  );
}

export function SoundMark({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M8 16.2a5.2 5.2 0 0 1 0-8.4" {...stroke} />
      <path d="M12 18.2a8.2 8.2 0 0 0 0-12.4" {...stroke} />
      {on ? null : <path d="M6 18 18 6" {...stroke} />}
    </svg>
  );
}
