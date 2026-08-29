import { useLayoutEffect, useRef, useState } from "react";
import { NatalChartWheel } from "../../components/journal/NatalChartWheel";
import { SignIcon } from "../../components/journal/SkyGlyphs";
import { explainAspectPair } from "../../lib/astrologyMeanings";
import { PlacementRow, SectionHeading, type NatalChart } from "./shared";

/**
 * "Your Sky" — the wheel and Ascendant/Midheaven stay fixed at the top; the
 * Placements list and Tightest Aspects live in one sliding two-pane view
 * underneath, switched with a small pill toggle (or a swipe). Replaces what
 * used to be three separate stacked cards — the wheel, the placements list,
 * and the aspects list — with one consolidated card, per the brief: "you
 * have the zodiac/planet thing, then underneath your placements, then you
 * slide your placements over and you have the tightest aspects."
 */
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

  // The two panes sit side by side (for the slide transform) inside one
  // flex row, which by default sizes the whole viewport to the *taller*
  // of the two — leaving dead space under the shorter one. Measure the
  // active pane's real content height instead and size the viewport to
  // just that, with the height itself transitioning like the slide does.
  const placementsPaneRef = useRef<HTMLDivElement>(null);
  const aspectsPaneRef = useRef<HTMLDivElement>(null);
  const [vpHeight, setVpHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const activeEl = pane === "placements" ? placementsPaneRef.current : aspectsPaneRef.current;
    if (!activeEl) return;
    const measure = () => setVpHeight(activeEl.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(activeEl);
    return () => observer.disconnect();
  }, [pane, selectedBody, chart.placements, chart.aspects]);

  return (
    <div className="journal-surface chart-feed-card chart-feed-card--wheel chart-sky-panel" style={{ padding: "1.5rem", ["--i" as any]: 0 }}>
      <SectionHeading wordA="Your" wordB="Sky" ariaLabel="Your Sky" />
      <NatalChartWheel
        placements={chart.placements}
        houses={chart.houses}
        aspects={chart.aspects}
        ascendantDegree={chart.ascendantDegree}
        onSelectBody={(b) => setSelectedBody(selectedBody === b ? null : b)}
        selectedBody={selectedBody}
      />
      <p className="text-[11px] text-muted-foreground text-center mt-2 mb-4">
        Tap a planet to read what it means for you. Gold lines are easy aspects, rust lines are
        tense ones.
      </p>

      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "1.25rem", textAlign: "center" }}>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Ascendant</p>
          <span className="lock-pill">
            <SignIcon sign={chart.ascendant} size={13} /> {chart.ascendant}
          </span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Midheaven</p>
          <span className="lock-pill blush">
            <SignIcon sign={chart.midheaven} size={13} /> {chart.midheaven}
          </span>
        </div>
      </div>
      {chart.approximateTime && (
        <p className="text-[12px] text-muted-foreground italic mb-3">
          No birth time on file — this chart uses local noon, so your Ascendant, houses and Moon
          placement may shift once you add your exact birth time to your account.
        </p>
      )}

      {/* the slide-over: Placements <-> Tightest Aspects */}
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

      <div className="chart-slide-viewport" style={vpHeight !== undefined ? { height: vpHeight } : undefined}>
        <div className={`chart-slide-track ${pane === "aspects" ? "is-aspects" : ""}`}>
          <div className="chart-slide-pane" ref={placementsPaneRef}>
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
            <p className="text-[11px] text-muted-foreground mt-3">
              {chart.zodiac} zodiac · {chart.houseSystem} houses
            </p>
          </div>

          <div className="chart-slide-pane" ref={aspectsPaneRef}>
            {hasAspects ? (
              <>
                <p className="text-[12px] text-muted-foreground mb-3">
                  The angles between your planets — the tighter the orb, the stronger the effect.
                  Gold-toned aspects tend to feel easy; rust-toned ones create the friction that
                  actually drives growth.
                </p>
                <div className="flex flex-col gap-2">
                  {chart.aspects.slice(0, 8).map((a, i) => (
                    <div key={i} className="chart-aspect-row">
                      <div className="chart-aspect-row__head">
                        <span className="chart-aspect-row__label">
                          {a.bodyA} <span className="chart-aspect-row__type">{a.aspect}</span> {a.bodyB}
                        </span>
                        <span className="chart-aspect-row__orb">{a.orb.toFixed(1)}° orb</span>
                      </div>
                      <p className="chart-aspect-row__explain">{explainAspectPair(a.bodyA, a.bodyB, a.aspect)}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No tight aspects to show yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
