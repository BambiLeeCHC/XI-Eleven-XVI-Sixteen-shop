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
      {/* Deck-faithful arched gold frame */}
      <svg className="tarot-plate__arch" viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="arch-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8D5A3" />
            <stop offset="50%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#A88B3A" />
          </linearGradient>
        </defs>
        <path
          d="M8 28 C8 12 20 6 50 6 C80 6 92 12 92 28 L92 148 C92 154 86 156 50 156 C14 156 8 154 8 148 Z"
          fill="none"
          stroke="url(#arch-gold)"
          strokeWidth="2.2"
        />
      </svg>

      {/* Crest badge at top */}
      <div className="tarot-plate__crest" aria-hidden="true">
        <span>XI</span>
        <span>XVI</span>
      </div>

      <div className="tarot-plate__foil" aria-hidden="true" />

      <div className="tarot-plate__face">
        <p className="tarot-plate__roman">{roman || suit}</p>
        <strong className="tarot-plate__name">{name}</strong>
        <span className="tarot-plate__tone">{tone}</span>
      </div>
    </article>
  );
}
