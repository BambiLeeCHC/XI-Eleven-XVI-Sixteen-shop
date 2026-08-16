/**
 * A small SVG analog clock face — used for "Local Time" (live) and
 * "Next 11:16" (pinned to 11:16, purely decorative/graphic) so those two
 * strip cells read as an instrument rather than plain digits.
 */
export function AnalogClock({
  hours,
  minutes,
  seconds,
  showSecondHand = true,
  accent = false,
}: {
  hours: number;
  minutes: number;
  seconds: number;
  showSecondHand?: boolean;
  accent?: boolean;
}) {
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minDeg = minutes * 6 + seconds * 0.1;
  const secDeg = seconds * 6;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`analog-clock ${accent ? "analog-clock--accent" : ""}`}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" className="analog-clock__face" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="7"
          x2="50"
          y2={i % 3 === 0 ? "14" : "11"}
          className="analog-clock__tick"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <line
        x1="50" y1="50" x2="50" y2="28"
        className="analog-clock__hand analog-clock__hand--hour"
        transform={`rotate(${hourDeg} 50 50)`}
      />
      <line
        x1="50" y1="50" x2="50" y2="18"
        className="analog-clock__hand analog-clock__hand--minute"
        transform={`rotate(${minDeg} 50 50)`}
      />
      {showSecondHand && (
        <line
          x1="50" y1="56" x2="50" y2="13"
          className="analog-clock__hand analog-clock__hand--second"
          transform={`rotate(${secDeg} 50 50)`}
        />
      )}
      <circle cx="50" cy="50" r="3" className="analog-clock__pin" />
    </svg>
  );
}
