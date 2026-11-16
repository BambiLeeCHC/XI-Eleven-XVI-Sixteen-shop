import { useEffect, useState } from "react";

const SUIT: Record<string, string> = {
  Wands: "Fire",
  Cups: "Water",
  Swords: "Air",
  Pentacles: "Earth",
};

export function TarotCardArt({
  name,
  roman = "",
  reversed = false,
  flash = true,
}: {
  name: string;
  roman?: string;
  reversed?: boolean;
  /** Play the signature foil flash on mount. Default true. */
  flash?: boolean;
}) {
  const suit = Object.keys(SUIT).find(key => name.includes(key)) ?? "Major";
  const tone = SUIT[suit] ?? "Aether";
  const [shimmer, setShimmer] = useState(flash);

  useEffect(() => {
    if (!flash) return;
    setShimmer(true);
    const id = window.setTimeout(() => setShimmer(false), 900);
    return () => window.clearTimeout(id);
  }, [flash, name]);

  return (
    <article
      className={`tarot-plate${reversed ? " is-reversed" : ""}${shimmer ? " is-foil-flash" : ""}`}
      aria-label={`${name}${reversed ? ", reversed" : ""}`}
    >
      <div className="tarot-plate__foil" aria-hidden="true" />
      <div className="tarot-plate__face">
        <p>{roman || suit}</p>
        <strong>{name}</strong>
        <span>{tone}</span>
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="18" fill="none" stroke="currentColor" />
          <path d="M40 14 L44 36 L40 32 L36 36 Z" fill="currentColor" />
          <path d="M40 66 L36 44 L40 48 L44 44 Z" fill="currentColor" />
        </svg>
      </div>
    </article>
  );
}
