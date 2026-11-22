import { CardArt, FlipCard } from "../journal/CardArt";
import type { SpreadCard } from "../../lib/ritual";

type Props = {
  spread: SpreadCard[];
  openSlots: string[];
  spreadOpen: boolean;
  onRevealAll: () => void;
};

export function TriSkyFan({ spread, openSlots, spreadOpen, onRevealAll }: Props) {
  return (
    <>
      <div
        className={`long-read-spread tn-spread tn-fan${spreadOpen ? " is-open" : " is-closed"}`}
        role="button"
        tabIndex={0}
        aria-label={spreadOpen ? "Cards revealed" : "Turn the cards"}
        onClick={() => {
          if (!spreadOpen) onRevealAll();
        }}
        onKeyDown={event => {
          if (!spreadOpen && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onRevealAll();
          }
        }}
      >
        {spread.map((s, index) => {
          const open = openSlots.includes(s.slot);
          const total = spread.length;
          return (
            <div
              key={s.slot}
              className="long-read-card tn-fan__card"
              style={{
                ["--fan-i" as string]: index,
                ["--fan-n" as string]: total,
              }}
            >
              <p className="long-read-slot-label label-lock">{s.slotName}</p>
              <FlipCard index={index} open={open} onOpen={onRevealAll} label={s.slotName}>
                <CardArt card={s.card} reversed={s.reversed} />
              </FlipCard>
              <p className="long-read-card-name">
                {open ? `${s.card.name}${s.reversed ? " (rev.)" : ""}` : "Face down"}
              </p>
            </div>
          );
        })}
      </div>
      {!spreadOpen ? (
        <button type="button" className="cta-pist tn-turn" onClick={onRevealAll}>
          Flip the spread
        </button>
      ) : null}
    </>
  );
}
