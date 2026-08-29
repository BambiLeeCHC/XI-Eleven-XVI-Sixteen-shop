import { useState } from "react";
import { codeOfTheDay, dateNumber } from "../../lib/ritual";

/** THE DAILY CODE — one brand-authored line on sustainability / self-empowerment. */
export function DailyCode({ compact = false }: { compact?: boolean }) {
  const code = codeOfTheDay();
  const num = dateNumber();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`"${code.quote}" — XI · XVI (${code.code})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (compact) {
    return (
      <p className="journal-code__compact">
        <span aria-hidden="true">✦</span> {code.quote}
      </p>
    );
  }

  return (
    <div className="journal-code">
      <div className="journal-code__head">
        <span className="label-lock journal-code__serial">{code.code}</span>
        <span className="label-lock journal-code__theme">{code.theme}</span>
      </div>
      <blockquote className="journal-code__quote serif-quiet">{code.quote}</blockquote>
      <p className="serif-quiet journal-code__attr">— XI · XVI</p>
      <div className="journal-code__practice">
        <span className="journal-draw__ritual-label">Do this today</span>
        <p>{code.practice}</p>
      </div>
      <div className="journal-code__foot">
        <span>Day number {num}</span>
        <button onClick={copy}>{copied ? "Copied ✓" : "Copy line"}</button>
      </div>
      <p className="journal-dock__footnote">
        The Daily Code™ — 33-line house set. Card + print editions in development.
      </p>
    </div>
  );
}
