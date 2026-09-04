import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  dayKey,
  drawerId,
  type SpreadCard,
  spreadOfTheDay,
  spreadTypeOfTheDay,
} from "../../lib/ritual";
import { CardArt, CardBack } from "./CardArt";
import { api, useQuery } from "../../lib/backend";

const STORE_KEY = "xixvi-draw";
const READING_STORE_KEY = "xixvi-reading";

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
    /* private mode */
  }
}

function comboKey(spread: SpreadCard[]): string {
  return spread.map(s => `${s.card.number}${s.reversed ? "R" : "U"}`).join("-");
}

interface ReadingCache {
  day: string;
  combo: string;
  text: string;
}

function loadCachedReading(combo: string): string | null {
  try {
    const raw = localStorage.getItem(READING_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReadingCache;
    if (parsed.day !== dayKey() || parsed.combo !== combo) return null;
    return parsed.text;
  } catch {
    return null;
  }
}

function saveCachedReading(combo: string, text: string) {
  try {
    localStorage.setItem(
      READING_STORE_KEY,
      JSON.stringify({ day: dayKey(), combo, text }),
    );
  } catch {
    /* private mode */
  }
}

function fallbackReading(spread: SpreadCard[]): string {
  return spread
    .map(
      s =>
        `**${s.slotName}** — ${s.card.name}${s.reversed ? ", reversed" : ""}. ${
          s.reversed ? s.card.reversed : s.card.upright
        }`,
    )
    .join("\n\n");
}

async function fetchReading(
  spread: SpreadCard[],
  name?: string,
  genderIdentity?: string,
  sexualOrientation?: string,
): Promise<string> {
  const body = {
    spread: spread.map(s => ({
      position: s.slotName,
      positionMeaning: s.slotQuestion,
      name: s.card.name,
      reversed: s.reversed,
      keywords: s.card.keywords,
      meaning: s.reversed ? s.card.reversed : s.card.upright,
    })),
    ...(name ? { name } : {}),
    ...(genderIdentity ? { genderIdentity } : {}),
    ...(sexualOrientation ? { sexualOrientation } : {}),
  };
  try {
    const res = await fetch("/api/tarot-reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json?.success && typeof json.reading === "string") return json.reading;
  } catch {
    /* fall through */
  }
  return fallbackReading(spread);
}

function ReadingHead({ spreadName }: { spreadName: string }) {
  const dayNo = String(new Date().getDate()).padStart(2, "0");

  return (
    <div className="jdeck__lock-head">
      <p className="label-lock" style={{ color: "#142010" }}>
        XI · XVI · Reading of the day · No. {dayNo}
      </p>
      <h3
        className="clash mt-3"
        style={{ fontSize: "clamp(32px, 6vw, 56px)", color: "#0B0B0C" }}
      >
        {spreadName}
      </h3>
    </div>
  );
}

function splitSynopsis(text: string): [string, string | null] {
  const match = text.match(/\n{1,2}SYNOPSIS:\s*([\s\S]+)$/i);
  if (!match) return [text, null];
  const narrative = text.slice(0, match.index).trim();
  return [narrative, match[1].trim()];
}

function ReadingText({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <>
      {paragraphs.map((p, i) => {
        const parts = p.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={i} className="jdeck-letter__p">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part,
            )}
          </p>
        );
      })}
    </>
  );
}

function CardFace({ entry }: { entry: SpreadCard }) {
  const { card, reversed } = entry;
  return (
    <div className="jdeck-face">
      <div className="jdeck-face__plate">
        <CardArt card={card} reversed={reversed} />
      </div>
      <div className="jdeck-face__plaque">
        <span className="jdeck-face__name">
          {card.roman} · {card.name}
          {reversed ? " · reversed" : ""}
        </span>
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

export function DrawThree() {
  const user = useQuery(api.auth.currentUser);
  const spreadType = useMemo(() => spreadTypeOfTheDay(), []);
  const who = useMemo(() => drawerId(), []);
  const spread = useMemo(() => spreadOfTheDay(undefined, who), [who]);
  const combo = useMemo(() => comboKey(spread), [spread]);
  const [revealed, setRevealed] = useState<Set<string>>(() => loadRevealed());
  const [reading, setReading] = useState<string | null>(() =>
    loadCachedReading(combo),
  );
  const [readingLoading, setReadingLoading] = useState(false);

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
      window.setTimeout(() => reveal(entry.slot), i * 380);
    });
  };

  const openCount = spread.filter(e => revealed.has(e.slot)).length;
  const allOpen = openCount === spread.length;

  useEffect(() => {
    if (!allOpen || reading || readingLoading) return;
    setReadingLoading(true);
    fetchReading(
      spread,
      user?.name,
      user?.genderIdentity,
      user?.sexualOrientation,
    ).then(text => {
      saveCachedReading(combo, text);
      setReading(text);
      setReadingLoading(false);
    });
  }, [allOpen, reading, readingLoading, spread, combo, user]);

  return (
    <div className="jdeck">
      <p className="jdeck__framework label-lock">{spreadType.name}</p>
      <p className="jdeck__intro serif-quiet">
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
        <button type="button" className="cta-pist jdeck__all" onClick={turnAll}>
          Turn all five ✦
        </button>
      )}

      {allOpen && (
        <div className="jdeck__letter">
          <ReadingHead spreadName={spreadType.name} />
          {readingLoading && !reading && (
            <p className="jdeck__letter-loading">Reading the spread…</p>
          )}
          {reading && (
            <>
              {(() => {
                const [narrative, synopsis] = splitSynopsis(reading);
                return (
                  <>
                    <ReadingText text={narrative} />
                    {synopsis && (
                      <div className="jdeck__synthesis">
                        <span className="jdeck__synthesis-head">In short</span>
                        <p>{synopsis}</p>
                      </div>
                    )}
                  </>
                );
              })()}
              <p className="serif-quiet jdeck__signoff">Yours, until midnight.</p>

              <div className="jdeck__long-read-tease">
                <p className="label-lock jdeck__long-read-tease-label">The house reading is $7/week</p>
                <p className="serif-quiet jdeck__long-read-tease-copy">
                  You just had the free daily five. The Long Read is seven cards, three times a
                  day, written against what's actually going on — same house as the clothes.
                </p>
                <Link to="/chart/long-read" className="cta-pist jdeck__long-read-tease-cta">
                  Get the Long Read — $7/week
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      <p className="journal-dock__footnote">
        The XI·XVI Major Arcana — 22 illustrated plates, drawn in-house.
        Physical edition in development.
      </p>
    </div>
  );
}

export default DrawThree;
