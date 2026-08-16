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

/* ═══════════════════════════════════════════════════════════════════════
   THE FIVE — a real five-card spread from the XI·XVI Major Arcana.

   One spread per person per day (deterministic from a private drawer id +
   the calendar date) — nobody sees anyone else's spread, and reloading
   doesn't reshuffle it. Once every card is turned, the reading itself is
   freshly written for this exact combination of cards, positions and
   orientations by a live call to the reading engine — never assembled
   from a fixed set of pre-written paragraphs. The ritual: shield-backed
   cards sit face down, a tap ignites a light burst out of the card, the
   card turns, and the reading unfolds.
   ═══════════════════════════════════════════════════════════════════════ */

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
    /* private mode — the draw simply won't persist */
  }
}

/** Small stable hash of the drawn combination, used only as a cache key so
 * a reading isn't regenerated on every reload for the same person/day. */
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
    /* private mode — the reading simply regenerates next time */
  }
}

/** Graceful degradation if the reading engine is unavailable — combines
 * each card's own canonical copy instead of a live-written letter. Not the
 * target experience, just a floor so the feature never looks broken. */
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
  situation?: string,
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
    ...(situation ? { situation } : {}),
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
    /* network/engine failure — fall through to the static floor */
  }
  return fallbackReading(spread);
}

/* ── The reading's collage head ──────────────────────────────────────────
   Same cut-paper language as the masthead — a dateline slug, the spread's
   name cut letter by letter, any remaining words as torn tags below — so
   the reveal reads like a page out of the same publication instead of a
   different product bolted on. Built from live data (day-of-month, the
   spread's own name) so it never goes stale if the spread is renamed. */
const COLLAGE_PAPERS = ["ink", "newsprint", "kraft", "gold", "blush", "lilac", "cream"] as const;
const COLLAGE_FACES = ["grotesk", "display", "type"] as const;
const COLLAGE_ROT = [-4, 3, -2, 4, -3, 2, -4.5, 3.5];

function ReadingCollageHead({ spreadName }: { spreadName: string }) {
  const [firstWord, ...restWords] = spreadName.split(" ");
  const letters = firstWord.split("");
  const dayNo = String(new Date().getDate()).padStart(2, "0");

  return (
    <div className="jdeck__collage-head">
      <span className="jcol-patch jcol-patch--a" aria-hidden="true" />
      <span className="jcol-patch jcol-patch--b" aria-hidden="true" />
      <span className="jcol-tape jcol-tape--tl" aria-hidden="true" />
      <span className="jcol-tape jcol-tape--br" aria-hidden="true" />

      <p className="jcol-slug">
        <span>XI · XVI</span>
        <i />
        <span>Reading Of The Day</span>
        <i />
        <span>No. {dayNo}</span>
      </p>

      <h3 className="jdeck__collage-title" aria-label={spreadName}>
        {letters.map((ch, i) => (
          <span
            key={i}
            className={`jcol-cut jcol-cut--lg jcol-${COLLAGE_PAPERS[i % COLLAGE_PAPERS.length]} jcol-${COLLAGE_FACES[i % COLLAGE_FACES.length]}`}
            style={{ transform: `rotate(${COLLAGE_ROT[i % COLLAGE_ROT.length]}deg)` }}
            aria-hidden="true"
          >
            {ch}
          </span>
        ))}
      </h3>

      {restWords.length > 0 && (
        <p className="jdeck__collage-sub" aria-hidden="true">
          {restWords.map((w, i) => (
            <span
              key={i}
              className={`jcol-tag jcol-tag--md jcol-${COLLAGE_PAPERS[(i + 2) % COLLAGE_PAPERS.length]} jcol-${COLLAGE_FACES[(i + 1) % COLLAGE_FACES.length]}`}
              style={{ transform: `rotate(${COLLAGE_ROT[(i + 3) % COLLAGE_ROT.length]}deg)` }}
            >
              {w}
            </span>
          ))}
        </p>
      )}

      <svg className="jcol-pen-rule" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M6 15 C60 6, 108 20, 164 12 C220 4, 268 19, 326 10 C356 6, 378 12, 394 9"
          fill="none"
          stroke="rgba(196,141,255,.55)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Minimal, safe render of the reading's sparing **bold** markup. */
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
  // Asked fresh on every visit — deliberately not persisted, since what's
  // going on changes visit to visit (unlike birth date, which lives on the
  // profile).
  const [situation, setSituation] = useState("");
  const [situationConfirmed, setSituationConfirmed] = useState(false);

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
    if (!allOpen || !situationConfirmed || reading || readingLoading) return;
    setReadingLoading(true);
    fetchReading(
      spread,
      user?.name,
      situation || undefined,
      user?.genderIdentity,
      user?.sexualOrientation,
    ).then(text => {
      saveCachedReading(combo, text);
      setReading(text);
      setReadingLoading(false);
    });
  }, [allOpen, situationConfirmed, situation, reading, readingLoading, spread, combo, user]);

  return (
    <div className="jdeck">
      <p className="jdeck__framework">{spreadType.name}</p>
      <p className="jdeck__intro">
        {spreadType.intro} Drawn for you alone, for{" "}
        {new Date().toLocaleDateString([], { month: "long", day: "numeric" })} —
        yours until midnight.
      </p>

      {!situationConfirmed && (
        <div className="jdeck__intake">
          <label htmlFor="jdeck-situation" className="jdeck__intake-label">
            Before you draw — what's actually going on right now?
          </label>
          <textarea
            id="jdeck-situation"
            value={situation}
            onChange={e => setSituation(e.target.value)}
            rows={2}
            placeholder={'e.g. "trying to decide whether to leave my job"'}
            className="jdeck__intake-input"
          />
          <button
            type="button"
            className="jdeck__all"
            onClick={() => setSituationConfirmed(true)}
          >
            Continue to the draw ✦
          </button>
        </div>
      )}

      {situationConfirmed && (
        <>
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
              Turn all five ✦
            </button>
          )}
        </>
      )}

      {allOpen && situationConfirmed && (
        <div className="jdeck__letter">
          <ReadingCollageHead spreadName={spreadType.name} />
          {readingLoading && !reading && (
            <p className="jdeck__letter-loading">Reading the spread…</p>
          )}
          {reading && (
            <>
              <ReadingText text={reading} />
              <p className="jcol-sign">Yours, until midnight.</p>

              <div className="jdeck__long-read-tease">
                <p className="jdeck__long-read-tease-label">One free draw a day. Want more?</p>
                <p className="jdeck__long-read-tease-copy">
                  The Long Read goes seven cards deep, read against what's actually going on with
                  you — plus your full natal chart and numerology on the Chart page.
                </p>
                <Link to="/journal/deep-reading" className="jdeck__long-read-tease-cta">
                  Go deeper with the Long Read ✦
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
