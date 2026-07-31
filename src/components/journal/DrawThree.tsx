import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type DailyDraw,
  dayKey,
  type SpreadCard,
  spreadOfTheDay,
  spreadTypeOfTheDay,
  synthesisOfTheDay,
  undercurrentOfTheDay,
} from "../../lib/ritual";
import { CardArt, CardBack } from "./CardArt";

/* ═══════════════════════════════════════════════════════════════════════
   THE DRAW — three cards from the XI·XVI house deck.

   One spread per calendar day, identical for every visitor on earth, so the
   draw can be quoted, shared and printed. The ritual: shield-backed cards
   sit face down, a tap ignites a light burst out of the card, the card
   turns, and the reading unfolds. Choices persist for the day so a reload
   doesn't reset someone's morning.
   ═══════════════════════════════════════════════════════════════════════ */

const STORE_KEY = "xixvi-draw";

function loadRevealed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { day: string; slots: string[] };
    if (parsed.day !== dayKey()) return new Set();
    return new Set(parsed.slots);
  } catch {
    return new Set();
  }
}

function saveRevealed(slots: Set<string>) {
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ day: dayKey(), slots: [...slots] }),
    );
  } catch {
    /* private mode — the draw simply won't persist */
  }
}

function CardFace({ entry }: { entry: SpreadCard }) {
  const { card, reversed } = entry;
  return (
    <div className="jdeck-face">
      <div className="jdeck-face__plate">
        <CardArt card={card} reversed={reversed} />
      </div>
      <div className="jdeck-face__plaque">
        <span className="jdeck-face__name">{card.name}</span>
        <span className="jdeck-face__sub">{card.subtitle}</span>
      </div>
    </div>
  );
}

function SpreadCardSlot({
  entry,
  revealed,
  onReveal,
  index,
}: {
  entry: SpreadCard;
  revealed: boolean;
  onReveal: () => void;
  index: number;
}) {
  const [igniting, setIgniting] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const handle = () => {
    if (revealed || igniting) return;
    setIgniting(true);
    timer.current = window.setTimeout(() => {
      onReveal();
      setIgniting(false);
    }, 330);
  };

  return (
    <div
      className="jdeck-slot"
      style={{ ["--slot-i" as string]: String(index) }}
    >
      <div className="jdeck-slot__head">
        <span className="jdeck-slot__name">{entry.slotName}</span>
        <span className="jdeck-slot__q">{entry.slotQuestion}</span>
      </div>

      <button
        type="button"
        className={`jdeck-card ${revealed ? "is-open" : ""} ${igniting ? "is-igniting" : ""}`}
        onClick={handle}
        aria-pressed={revealed}
        aria-label={
          revealed
            ? `${entry.slotName}: ${entry.card.name}`
            : `Turn ${entry.slotName}`
        }
      >
        <span className="jdeck-card__burst" aria-hidden="true" />
        <span className="jdeck-card__inner">
          <span className="jdeck-card__side jdeck-card__side--back">
            <CardBack />
          </span>
          <span className="jdeck-card__side jdeck-card__side--front">
            {revealed || igniting ? <CardFace entry={entry} /> : null}
          </span>
        </span>
        {!revealed && <span className="jdeck-card__tap">Tap to turn</span>}
      </button>
    </div>
  );
}

function Reading({ entry, slotName }: { entry: DailyDraw; slotName: string }) {
  const { card, reversed } = entry;
  return (
    <div className="jdeck-read">
      <div className="jdeck-read__head">
        <span className="jdeck-read__slot">{slotName}</span>
        <span className="jdeck-read__card">
          {card.roman} · {card.name}
          {reversed ? " · reversed" : ""}
        </span>
      </div>
      <div className="jdeck-read__keys">
        {card.keywords.map(k => (
          <span key={k}>{k}</span>
        ))}
      </div>
      <p className="jdeck-read__meaning">{card.meaning}</p>
      <p className="jdeck-read__body">
        {reversed ? card.reversed : card.upright}
      </p>
      <div className="jdeck-read__ritual">
        <span>Do this today</span>
        <ol className="jdeck-read__actions">
          {card.actions.map(a => (
            <li key={a}>{a}</li>
          ))}
        </ol>
      </div>
      <p className="jdeck-read__material">◈ {card.material}</p>
    </div>
  );
}

const UNDERCURRENT_SLOT = "undercurrent";

export function DrawThree() {
  const spreadType = useMemo(() => spreadTypeOfTheDay(), []);
  const spread = useMemo(() => spreadOfTheDay(), []);
  const undercurrent = useMemo(() => undercurrentOfTheDay(), []);
  const synthesis = useMemo(() => synthesisOfTheDay(), []);
  const [revealed, setRevealed] = useState<Set<string>>(() => loadRevealed());

  const reveal = useCallback((slot: string) => {
    setRevealed(cur => {
      if (cur.has(slot)) return cur;
      const next = new Set(cur);
      next.add(slot);
      saveRevealed(next);
      return next;
    });
  }, []);

  const turnAll = () => {
    spread.forEach((entry, i) => {
      window.setTimeout(() => reveal(entry.slot), i * 420);
    });
  };

  const openCount = spread.filter(e => revealed.has(e.slot)).length;
  const allOpen = openCount === spread.length;
  const undercurrentSlot: SpreadCard = {
    ...undercurrent,
    slot: UNDERCURRENT_SLOT,
    slotName: "The Undercurrent",
    slotQuestion: "What's moving underneath, unasked",
  };
  const undercurrentOpen = revealed.has(UNDERCURRENT_SLOT);

  return (
    <div className="jdeck">
      <p className="jdeck__framework">{spreadType.name}</p>
      <p className="jdeck__intro">
        {spreadType.intro} Drawn for you alone, for{" "}
        {new Date().toLocaleDateString([], { month: "long", day: "numeric" })} —
        yours until midnight.
      </p>

      <div className="jdeck__row">
        {spread.map((entry, i) => (
          <SpreadCardSlot
            key={entry.slot}
            entry={entry}
            index={i}
            revealed={revealed.has(entry.slot)}
            onReveal={() => reveal(entry.slot)}
          />
        ))}
      </div>

      {!allOpen && (
        <button type="button" className="jdeck__all" onClick={turnAll}>
          Turn all three ✦
        </button>
      )}

      {allOpen && (
        <div className="jdeck__synthesis">
          <span className="jdeck__synthesis-head">{synthesis.headline}</span>
          <p>{synthesis.body}</p>
        </div>
      )}

      {openCount > 0 && (
        <div className="jdeck__readings">
          {spread
            .filter(e => revealed.has(e.slot))
            .map(e => (
              <Reading key={e.slot} entry={e} slotName={e.slotName} />
            ))}
        </div>
      )}

      {allOpen && (
        <div className="jdeck__deeper">
          {!undercurrentOpen && (
            <button
              type="button"
              className="jdeck__all jdeck__all--deeper"
              onClick={() => reveal(UNDERCURRENT_SLOT)}
            >
              Go deeper — draw The Undercurrent ✦
            </button>
          )}
          {undercurrentOpen && (
            <>
              <div className="jdeck__row jdeck__row--single">
                <SpreadCardSlot
                  entry={undercurrentSlot}
                  index={0}
                  revealed
                  onReveal={() => {}}
                />
              </div>
              <div className="jdeck__readings">
                <Reading entry={undercurrent} slotName="The Undercurrent" />
              </div>
            </>
          )}
        </div>
      )}

      <p className="journal-dock__footnote">
        The XI·XVI House Deck™ — 22 illustrated plates, drawn in-house. Physical
        edition in development.
      </p>
    </div>
  );
}

export default DrawThree;
