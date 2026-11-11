import { useState } from "react";
import {
  TAROT_FACE_HEIGHT,
  TAROT_FACE_WIDTH,
  tarotFaceFileFromName,
  tarotFaceSources,
} from "../../lib/tarotFace";

const SUIT: Record<string, string> = {
  Wands: "Fire",
  Cups: "Water",
  Swords: "Air",
  Pentacles: "Earth",
};

function PlateFallback({
  name,
  roman,
  reversed,
}: {
  name: string;
  roman: string;
  reversed: boolean;
}) {
  const suit = Object.keys(SUIT).find(key => name.includes(key)) ?? "Major";
  const tone = SUIT[suit] ?? "Aether";
  return (
    <article className={`tarot-plate${reversed ? " is-reversed" : ""}`} aria-label={`${name}${reversed ? ", reversed" : ""}`}>
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

export function TarotCardArt({
  name,
  roman = "",
  reversed = false,
}: {
  name: string;
  roman?: string;
  reversed?: boolean;
}) {
  const file = tarotFaceFileFromName(name);
  const [plate, setPlate] = useState(!file);
  if (!file || plate) return <PlateFallback name={name} roman={roman} reversed={reversed} />;
  const sources = tarotFaceSources(file);
  return (
    <figure className="tarot-plate tarot-plate--photo">
      <img
        className={reversed ? "is-reversed" : undefined}
        src={sources.thumb}
        srcSet={`${sources.thumb} 480w, ${sources.full} 904w`}
        sizes="120px"
        width={TAROT_FACE_WIDTH}
        height={TAROT_FACE_HEIGHT}
        alt={name}
        loading="lazy"
        decoding="async"
        onError={() => setPlate(true)}
      />
    </figure>
  );
}
