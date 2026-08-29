import { useState } from "react";
import { NatalChartWheel } from "../../components/journal/NatalChartWheel";
import { PlanetIcon, SignIcon } from "../../components/journal/SkyGlyphs";
import { explainAspectPair } from "../../lib/astrologyMeanings";
import { PlacementRow, SectionHeading, type NatalChart } from "./shared";

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌",
  opposition: "☍",
  square: "□",
  trine: "△",
  sextile: "⚹",
  quincunx: "⊼",
};

export function ChartSkyPanel({
  chart,
  selectedBody,
  setSelectedBody,
}: {
  chart: NatalChart;
  selectedBody: string | null;
  setSelectedBody: (b: string | null) => void;
}) {
  const [pane, setPane] = useState<"placements" | "aspects">("placements");
  const hasAspects = chart.aspects.length > 0;

  return (
    <div className="tn-card tn-sky chart-feed-card chart-feed-card--wheel chart-sky-panel">
      <div className="tn-sky__stage">
        <SectionHeading wordA="Your" wordB="Sky" ariaLabel="Your Sky" />
        <NatalChartWheel
          placements={chart.placements}
          houses={chart.houses}
          aspects={chart.aspects}
          ascendantDegree={chart.ascendantDegree}
          onSelectBody={(b) => setSelectedBody(selectedBody === b ? null : b)}
          selectedBody={selectedBody}
        />
        <p className="tn-sky__hint">
          Tap a planet. Easy aspects read quiet; tense ones read rust.
        </p>
        <div className="tn-sky__angles">
          <div>
            <p className="label-lock">Ascendant</p>
            <span className="lock-pill">
              <SignIcon sign={chart.ascendant} size={13} /> {chart.ascendant}
            </span>
          </div>
          <div>
            <p className="label-lock">Midheaven</p>
            <span className="lock-pill blush">
              <SignIcon sign={chart.midheaven} size={13} /> {chart.midheaven}
            </span>
          </div>
        </div>
        {chart.approximateTime && (
          <p className="tn-sky__note">
            No birth time on file — this chart uses local noon, so your Ascendant, houses and Moon
            may shift once you add the exact time.
          </p>
        )}
      </div>

      <div className="tn-sky__index">
        <div className="chart-slide-toggle" role="tablist" aria-label="Placements or Tightest Aspects">
          <button
            type="button"
            role="tab"
            aria-selected={pane === "placements"}
            className={`chart-slide-toggle__btn ${pane === "placements" ? "is-active" : ""}`}
            onClick={() => setPane("placements")}
          >
            Placements
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pane === "aspects"}
            className={`chart-slide-toggle__btn ${pane === "aspects" ? "is-active" : ""}`}
            onClick={() => setPane("aspects")}
            disabled={!hasAspects}
          >
            Tightest Aspects
          </button>
          <span className={`chart-slide-toggle__indicator ${pane === "aspects" ? "is-right" : ""}`} aria-hidden="true" />
        </div>

        {pane === "placements" ? (
          <div className="tn-index-pane">
            <p className="chart-expand-hint">Tap any placement to read what it means</p>
            <div className="chart-placements-list">
              {chart.placements.map((p) => (
                <PlacementRow
                  key={p.body}
                  placement={p}
                  expanded={selectedBody === p.body}
                  onToggle={() => setSelectedBody(selectedBody === p.body ? null : p.body)}
                />
              ))}
            </div>
            <p className="tn-sky__note" style={{ marginTop: "0.85rem" }}>
              {chart.zodiac} zodiac · {chart.houseSystem} houses
            </p>
          </div>
        ) : hasAspects ? (
          <div className="tn-index-pane">
            <p className="chart-expand-hint">The tighter the orb, the stronger it lands.</p>
            <div className="tn-aspects">
              {chart.aspects.map((a, i) => {
                const key = a.aspect.toLowerCase();
                const strength = Math.max(8, Math.min(100, Math.round((1 - a.orb / 8) * 100)));
                return (
                  <div key={i} className={`chart-aspect-row tn-aspect tn-aspect--${key}`}>
                    <div className="chart-aspect-row__head">
                      <span className="tn-aspect__who">
                        <span className="tn-place__glyph">
                          <PlanetIcon body={a.bodyA} size={16} />
                        </span>
                        <span className="tn-aspect__glyph" title={a.aspect} aria-hidden="true">
                          {ASPECT_GLYPH[key] ?? "·"}
                        </span>
                        <span className="tn-place__glyph">
                          <PlanetIcon body={a.bodyB} size={16} />
                        </span>
                      </span>
                      <span className="chart-aspect-row__orb">{a.orb.toFixed(1)}°</span>
                    </div>
                    <p className="chart-aspect-row__label">
                      {a.bodyA} <span className="chart-aspect-row__type">{a.aspect}</span> {a.bodyB}
                    </p>
                    <div className="tn-aspect__orb-track" aria-hidden="true">
                      <span style={{ width: `${strength}%` }} />
                    </div>
                    <p className="chart-aspect-row__explain">{explainAspectPair(a.bodyA, a.bodyB, a.aspect)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="tn-sky__note">No tight aspects to show yet.</p>
        )}
      </div>
    </div>
  );
}
