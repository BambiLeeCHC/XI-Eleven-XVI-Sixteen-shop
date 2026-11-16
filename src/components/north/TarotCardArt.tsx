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
    const id = window.setTimeout(() => setShimmer(false), 1100);
    return () => window.clearTimeout(id);
  }, [flash, name]);

  return (
    <article
      className={`tarot-plate${reversed ? " is-reversed" : ""}${shimmer ? " is-foil-flash" : ""}`}
      aria-label={`${name}${reversed ? ", reversed" : ""}`}
      onMouseEnter={() => setShimmer(true)}
      onMouseLeave={() => {
        window.setTimeout(() => setShimmer(false), 900);
      }}
      onFocus={() => setShimmer(true)}
    >
      {/* Deck-faithful arched gold frame */}
      <svg className="tarot-plate__arch" viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="arch-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0E0B0" />
            <stop offset="40%" stopColor="#D4AF55" />
            <stop offset="100%" stopColor="#A88B3A" />
          </linearGradient>
        </defs>
        <path
          d="M6 30 C6 12 22 5 50 5 C78 5 94 12 94 30 L94 150 C94 156 86 158 50 158 C14 158 6 156 6 150 Z"
          fill="none"
          stroke="url(#arch-gold)"
          strokeWidth="2.6"
        />
        <path
          d="M10 32 C10 16 24 10 50 10 C76 10 90 16 90 32 L90 148 C90 152 84 154 50 154 C16 154 10 152 10 148 Z"
          fill="none"
          stroke="url(#arch-gold)"
          strokeWidth="0.7"
          opacity="0.45"
        />
      </svg>

      {/* Crest badge at top */}
      <div className="tarot-plate__crest" aria-hidden="true">
        <span>XI</span>
        <span>XVI</span>
      </div>

      <div className="tarot-plate__foil" aria-hidden="true" />
      <div className="tarot-plate__pearl" aria-hidden="true" />

      <div className="tarot-plate__face">
        <p className="tarot-plate__roman">{roman || suit}</p>
        <strong className="tarot-plate__name">{name}</strong>
        <span className="tarot-plate__tone">{tone}</span>
      </div>
    </article>
  );
}
