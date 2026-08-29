import { NatalChartWheel } from "../../components/journal/NatalChartWheel";
import { SignIcon } from "../../components/journal/SkyGlyphs";
import { SectionHeading, type NatalChart } from "./shared";

export function ChartSkyPanel({
  chart,
  selectedBody,
  setSelectedBody,
}: {
  chart: NatalChart;
  selectedBody: string | null;
  setSelectedBody: (b: string | null) => void;
}) {
  return (
    <div className="tn-card tn-sky chart-feed-card chart-feed-card--wheel chart-sky-panel">
      <SectionHeading wordA="Your" wordB="Sky" ariaLabel="Your Sky" />
      <div className="tn-sky__stage">
        <NatalChartWheel
          placements={chart.placements}
          houses={chart.houses}
          aspects={chart.aspects}
          ascendantDegree={chart.ascendantDegree}
          onSelectBody={(b) => setSelectedBody(selectedBody === b ? null : b)}
          selectedBody={selectedBody}
        />
        <p className="tn-sky__hint">
          Tap a planet. The sign is how that part of you actually moves.
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
        <p className="tn-sky__note">
          {chart.zodiac} zodiac · {chart.houseSystem} houses
        </p>
      </div>
    </div>
  );
}
