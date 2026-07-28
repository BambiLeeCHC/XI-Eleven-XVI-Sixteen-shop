import { useState } from "react";
import { drawOfTheDay, shadowOfTheDay } from "../../lib/ritual";
import type { ArcanaCard } from "../../data/arcana";

function CardFace({ card, reversed }: { card: ArcanaCard; reversed: boolean }) {
  return (
    <div
      className="journal-card"
      style={{
        ["--c1" as any]: card.colorway[0],
        ["--c2" as any]: card.colorway[1],
      }}
    >
      <div className="journal-card__frame">
        <span className="journal-card__roman">{card.roman}</span>
        <span
          className="journal-card__glyph"
          style={{ transform: reversed ? "rotate(180deg)" : "none" }}
          aria-hidden="true"
        >
          {card.glyph}
        </span>
        <span className="journal-card__name">{card.name}</span>
        <span className="journal-card__sub">{card.subtitle}</span>
        <span className="journal-card__meta">
          {card.element} · reduces to {card.reduction}
          {reversed ? " · reversed" : ""}
        </span>
      </div>
    </div>
  );
}

/** THE DAILY DRAW — one XI·XVI Arcana card per day, deterministic worldwide. */
export function DailyDraw() {
  const [revealed, setRevealed] = useState(false);
  const [showShadow, setShowShadow] = useState(false);
  const { card, reversed } = drawOfTheDay();
  const shadow = shadowOfTheDay();

  return (
    <div className="journal-draw">
      {!revealed ? (
        <button className="journal-draw__back" onClick={() => setRevealed(true)}>
          <span className="journal-draw__back-mark">XI<span>·</span>XVI</span>
          <span className="journal-draw__back-hint">Tap to draw today's card</span>
          <span className="journal-draw__back-note">22 cards · one per day · resets at midnight</span>
        </button>
      ) : (
        <>
          <CardFace card={card} reversed={reversed} />

          <div className="journal-draw__keywords">
            {card.keywords.map((k) => (
              <span key={k}>{k}</span>
            ))}
          </div>

          <p className="journal-draw__reading">
            {reversed ? card.reversed : card.upright}
          </p>

          <div className="journal-draw__ritual">
            <span className="journal-draw__ritual-label">Today's practice</span>
            <p>{card.ritual}</p>
          </div>

          <div className="journal-draw__material">
            <span aria-hidden="true">◈</span> {card.material}
          </div>

          {showShadow ? (
            <div className="journal-draw__shadow">
              <span className="journal-draw__ritual-label">Shadow card · {shadow.card.roman} {shadow.card.name}</span>
              <p>{shadow.reversed ? shadow.card.reversed : shadow.card.upright}</p>
            </div>
          ) : (
            <button className="journal-draw__more" onClick={() => setShowShadow(true)}>
              Pull the shadow card →
            </button>
          )}

          <p className="journal-dock__footnote">
            The XI·XVI Arcana™ — 22-card house deck. Physical edition in development.
          </p>
        </>
      )}
    </div>
  );
}
