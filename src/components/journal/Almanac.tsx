import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ALMANAC_DAY_VOICE,
  MONTH_NAMES,
  dateNumber,
  formatCountdown,
  isMarkedDay,
  monthGrid,
  moonPhase,
  nextElevenSixteen,
} from "../../lib/ritual";
import { AnalogClock } from "./AnalogClock";
import { MoonPhaseIcon } from "./MoonPhaseIcon";

/** The day-voice line is keyed 1-9; the day number itself can land on a
 * kept master (11/22), so reduce further just for this lookup. */
function toSingleDigit(n: number): number {
  let v = n;
  while (v > 9) v = String(v).split("").reduce((a, c) => a + Number(c), 0);
  return v;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** THE 11:16 STRIP — docked at the top of the Journal. Time as brand surface. */
export function ElevenSixteenStrip({ showAlmanacLink = true }: { showAlmanacLink?: boolean }) {
  const now = useNow();
  const es = nextElevenSixteen(now);
  const moon = moonPhase(now);
  const num = dateNumber(now);

  return (
    <div className={`journal-strip ${es.isNow ? "is-hour" : ""}`}>
      <div className="journal-strip__scan" aria-hidden="true" />
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-3">
        <div className="journal-strip__cell">
          <span className="journal-strip__label">Local Time</span>
          <AnalogClock hours={now.getHours()} minutes={now.getMinutes()} seconds={now.getSeconds()} />
        </div>
        <span className="journal-strip__rule" aria-hidden="true" />
        <div className="journal-strip__cell">
          <span className="journal-strip__label">
            {es.isNow ? "The Hour Is Now" : `Next ${es.nextLabel}`}
          </span>
          <AnalogClock hours={11} minutes={16} seconds={0} showSecondHand={false} accent />
          <span className="journal-strip__value journal-strip__value--accent tabular-nums">
            {es.isNow ? "set your intention" : formatCountdown(es.msUntilNext)}
          </span>
        </div>
        <span className="journal-strip__rule" aria-hidden="true" />
        <div className="journal-strip__cell">
          <span className="journal-strip__label">Moon</span>
          <span className="journal-strip__value">
            <span className="mr-1.5" aria-hidden="true">{moon.glyph}</span>
            {moon.name} · {Math.round(moon.illumination * 100)}%
          </span>
        </div>
        <span className="journal-strip__rule" aria-hidden="true" />
        <div className="journal-strip__cell">
          <span className="journal-strip__label">Day Number</span>
          <span className="journal-strip__value journal-strip__value--gold">{num}</span>
        </div>
        {showAlmanacLink && (
          <Link to="/chart/almanac" className="journal-strip__cta">
            Open the Almanac ✦
          </Link>
        )}
      </div>
    </div>
  );
}

/** THE ALMANAC — branded calendar + time experience. Licensable as a print calendar. */
export function AlmanacCalendar() {
  const now = useNow(1000);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState<Date>(() => new Date());

  const weeks = useMemo(() => monthGrid(cursor.y, cursor.m), [cursor]);
  const es = nextElevenSixteen(now);
  const selMoon = moonPhase(selected);
  const selNum = dateNumber(selected);
  const todayKey = new Date().toDateString();

  const shift = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div className="journal-almanac">
      {/* Dual 11:16 clock */}
      <div className="journal-almanac__clock">
        <div className="journal-almanac__clock-face">
          <span className="journal-almanac__clock-num">11:16</span>
          <span className="journal-almanac__clock-sub">AM · set intention</span>
        </div>
        <div className="journal-almanac__clock-divider" aria-hidden="true" />
        <div className="journal-almanac__clock-face">
          <span className="journal-almanac__clock-num">11:16</span>
          <span className="journal-almanac__clock-sub">PM · check your work</span>
        </div>
      </div>
      <p className="journal-almanac__count tabular-nums">
        {es.isNow ? "The hour is now." : `${formatCountdown(es.msUntilNext)} until ${es.nextLabel}`}
      </p>

      {/* Month header */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <button className="journal-almanac__nav" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
        <div className="text-center">
          <p className="journal-almanac__month">{MONTH_NAMES[cursor.m]}</p>
          <p className="journal-almanac__year">{cursor.y}</p>
        </div>
        <button className="journal-almanac__nav" onClick={() => shift(1)} aria-label="Next month">›</button>
      </div>

      {/* Grid */}
      <div className="journal-almanac__dow">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="journal-almanac__grid">
        {weeks.flat().map((d, i) =>
          d === null ? (
            <span key={i} className="journal-almanac__cell is-empty" />
          ) : (
            <button
              key={i}
              onClick={() => setSelected(d)}
              className={[
                "journal-almanac__cell",
                d.toDateString() === todayKey ? "is-today" : "",
                d.toDateString() === selected.toDateString() ? "is-selected" : "",
                isMarkedDay(d) === "signal" ? "is-signal" : "",
                isMarkedDay(d) === "tower" ? "is-tower" : "",
              ].join(" ")}
            >
              <span className="journal-almanac__cell-num">{d.getDate()}</span>
              <MoonPhaseIcon frac={moonPhase(d).frac} size={9} className="journal-almanac__cell-moon" />
            </button>
          )
        )}
      </div>

      {/* Legend */}
      <div className="journal-almanac__legend">
        <span><i className="dot dot--signal" /> 11 · The Signal</span>
        <span><i className="dot dot--tower" /> 16 · The Tower</span>
        <span><MoonPhaseIcon frac={0.5} size={11} /> the moon that day</span>
      </div>

      {/* Selected day readout */}
      <div className="journal-almanac__readout">
        <p className="journal-almanac__readout-date">
          {selected.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <p className="journal-almanac__readout-voice">
          {ALMANAC_DAY_VOICE[toSingleDigit(selNum)]}
        </p>
        <div className="journal-almanac__readout-rows">
          <span>Day number</span><strong>{selNum}</strong>
          <span>Moon</span><strong><MoonPhaseIcon frac={selMoon.frac} size={13} /> {selMoon.name}</strong>
          <span>Illumination</span><strong>{Math.round(selMoon.illumination * 100)}%</strong>
        </div>
      </div>

      <p className="journal-dock__footnote">
        The XI·XVI Almanac™ — house calendar system. Print edition in development.
      </p>
    </div>
  );
}
