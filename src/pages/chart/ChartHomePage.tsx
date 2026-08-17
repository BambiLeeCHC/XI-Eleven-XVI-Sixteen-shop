import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { NatalChartWheel } from "../../components/journal/NatalChartWheel";
import { api, invalidateQueries, useQuery } from "../../lib/backend";
import { explainAspectPair } from "../../lib/astrologyMeanings";
import {
  HouseRow,
  PROFILE_ERROR_COPY,
  PlacementRow,
  ProfileSection,
  SIGN_GLYPH,
  SectionHeading,
  TrueNorthHero,
  TrueNorthSignedOutTeaser,
  parseProfileSections,
} from "./shared";
import type { NatalChartResult, NatalProfileResult } from "./shared";

/**
 * True North — the free natal chart. First of the four True North
 * destinations (Chart / Numbers / Almanac / Long Read), each now its own
 * page rather than one long scroll.
 */
export function ChartHomePage() {
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [expandedHouse, setExpandedHouse] = useState<number | null>(null);

  const handleSelectBody = useCallback(
    (b: string) => setSelectedBody((cur) => (cur === b ? null : b)),
    [],
  );

  const user = useQuery(api.auth.currentUser);
  const chartResult = useQuery<NatalChartResult>(api.natalChart.get, user ? {} : "skip");
  const profileResult = useQuery<NatalProfileResult>(
    api.natalProfile.get,
    chartResult?.success ? {} : "skip",
  );

  const loading = !!user && chartResult === undefined;
  const chart = chartResult?.success ? chartResult.chart ?? null : null;
  const chartError = chartResult && !chartResult.success ? chartResult.message ?? "Couldn't generate your chart." : null;
  const sunSign = chart?.placements?.find((p) => p.body === "Sun")?.sign;

  const pageTitle = "True North — Your Natal Chart — XI · XVI";

  if (!user) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack" style={{ maxWidth: "42rem" }}>
          <SEO title={pageTitle} />
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="journal-surface" style={{ padding: "1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
                <p className="text-sm font-semibold mb-2">Then, if you want to go deeper — Numerology</p>
                <p className="text-sm text-muted-foreground">
                  Your name and birth date reduce to a set of numbers that don't change — your Life Path,
                  your Expression number, your Soul Urge.
                </p>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack" style={{ maxWidth: "44rem" }}>
        <SEO title={pageTitle} />
        <TrueNorthHero sunSign={sunSign} />

        {loading && (
          <div className="journal-surface" style={{ padding: "1.75rem" }}>
            <p className="text-sm text-muted-foreground">Calculating your chart…</p>
          </div>
        )}

        {!loading && chartError && (
          <div className="journal-surface" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <p className="text-sm text-red-600">{chartError}</p>
            <Link to="/profile" className="underline text-sm">Complete your birth details on your account →</Link>
          </div>
        )}

        {!loading && chart && (
          <div className="chart-feed">
            <div className="journal-surface chart-feed-card chart-feed-card--wheel" style={{ padding: "1.5rem", ["--i" as any]: 0 }}>
              <SectionHeading wordA="Your" wordB="Sky" ariaLabel="Your Sky" />
              <NatalChartWheel
                placements={chart.placements}
                houses={chart.houses}
                aspects={chart.aspects}
                ascendantDegree={chart.ascendantDegree}
                onSelectBody={handleSelectBody}
                selectedBody={selectedBody}
              />
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Tap a planet to read what it means for you. Gold lines are easy aspects, rust lines are
                tense ones.
              </p>
            </div>

            <div className="journal-surface chart-feed-card" style={{ padding: "1.75rem", ["--i" as any]: 1 }}>
              <SectionHeading wordA="Your" wordB="Placements" ariaLabel="Your Placements" />
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "1.25rem", textAlign: "center" }}>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Ascendant</p>
                  <span className="jcol-tag jcol-tag--sm jcol-lilac jcol-type">
                    {SIGN_GLYPH[chart.ascendant] ?? ""} {chart.ascendant}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Midheaven</p>
                  <span className="jcol-tag jcol-tag--sm jcol-blush jcol-type">
                    {SIGN_GLYPH[chart.midheaven] ?? ""} {chart.midheaven}
                  </span>
                </div>
              </div>
              {chart.approximateTime && (
                <p className="text-[12px] text-muted-foreground italic mb-3">
                  No birth time on file — this chart uses local noon, so your Ascendant, houses and Moon
                  placement may shift once you add your exact birth time to your account.
                </p>
              )}
              <div className="chart-placements-list">
                {chart.placements.map((p) => (
                  <PlacementRow
                    key={p.body}
                    placement={p}
                    expanded={selectedBody === p.body}
                    onToggle={() => setSelectedBody((cur) => (cur === p.body ? null : p.body))}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                {chart.zodiac} zodiac · {chart.houseSystem} houses
              </p>
            </div>

            {chart.aspects.length > 0 && (
              <div className="journal-surface chart-feed-card" style={{ padding: "1.75rem", ["--i" as any]: 2 }}>
                <SectionHeading wordA="Tightest" wordB="Aspects" ariaLabel="Your Tightest Aspects" />
                <p className="text-[12px] text-muted-foreground mb-3">
                  The angles between your planets — the tighter the orb, the stronger the effect. Gold-toned
                  aspects tend to feel easy; rust-toned ones create the friction that actually drives growth.
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
              </div>
            )}

            <div className="journal-surface chart-feed-card" style={{ padding: "1.75rem", ["--i" as any]: 3 }}>
              <SectionHeading wordA="The" wordB="Houses" ariaLabel="The Houses" />
              <p className="text-[11px] text-muted-foreground mt-1 mb-3">
                Tap any house for its full meaning, keywords and a reflective question.
              </p>
              <div className="chart-placements-list chart-houses-grid">
                {chart.houses.map((h) => (
                  <HouseRow
                    key={h.house}
                    houseCusp={h}
                    expanded={expandedHouse === h.house}
                    onToggle={() => setExpandedHouse((cur) => (cur === h.house ? null : h.house))}
                  />
                ))}
              </div>
            </div>

            <div className="journal-surface chart-profile-card chart-feed-card chart-feed-card--wide" style={{ padding: "1.75rem", position: "relative", ["--i" as any]: 4 }}>
              <span className="jcol-patch jcol-patch--b" aria-hidden="true" />
              <h2 className="journal-article__title--collage chart-profile-card__heading" aria-label="Your Personality Profile">
                <span className="jcol-tag jcol-gold jcol-display" style={{ transform: "rotate(-2deg)" }}>Your</span>
                <span className="jcol-tag jcol-ink jcol-grotesk" style={{ transform: "rotate(1.5deg)" }}>Profile</span>
              </h2>
              {profileResult === undefined && (
                <p className="text-sm text-muted-foreground">Writing your profile…</p>
              )}
              {profileResult && !profileResult.success && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", alignItems: "flex-start" }}>
                  <p className="text-sm text-red-600">
                    {PROFILE_ERROR_COPY[profileResult.reason ?? ""] ??
                      "Couldn't write your personality profile just now — try again shortly."}
                  </p>
                  <button
                    type="button"
                    onClick={() => invalidateQueries()}
                    className="underline text-sm"
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    Try again →
                  </button>
                </div>
              )}
              {profileResult?.success && profileResult.narrative && (
                <div className="chart-profile-sections">
                  {parseProfileSections(profileResult.narrative).map((s, i) => (
                    <ProfileSection key={i} title={s.title} body={s.body} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
