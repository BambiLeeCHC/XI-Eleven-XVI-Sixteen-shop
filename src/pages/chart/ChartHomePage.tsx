import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { api, invalidateQueries, useAuthStatus, useQuery } from "../../lib/backend";
import { ChartSkyPanel } from "./ChartSkyPanel";
import { SectionBoundary } from "../../components/journal/SectionBoundary";
import {
  HouseRow,
  PROFILE_ERROR_COPY,
  ProfileSection,
  SectionHeading,
  TrueNorthHero,
  TrueNorthSignedOutTeaser,
  parseProfileSections,
} from "./shared";
import type { NatalChartResult, NatalProfileResult } from "./shared";

export function ChartHomePage() {
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [expandedHouse, setExpandedHouse] = useState<number | null>(null);

  const { isLoading: authLoading, isAuthenticated } = useAuthStatus();
  const user = useQuery(
    api.auth.currentUser,
    authLoading || !isAuthenticated ? "skip" : {},
  );
  const chartResult = useQuery<NatalChartResult>(
    api.natalChart.get,
    isAuthenticated ? {} : "skip",
  );
  const profileResult = useQuery<NatalProfileResult>(
    api.natalProfile.get,
    chartResult?.success ? {} : "skip",
  );

  const loading = isAuthenticated && chartResult === undefined;
  const chart = chartResult?.success ? chartResult.chart ?? null : null;
  const chartError = chartResult && !chartResult.success ? chartResult.message ?? "Couldn't generate your chart." : null;
  const sunSign = chart?.placements?.find((p) => p.body === "Sun")?.sign;

  const pageTitle = "True North — Your Natal Chart — XI · XVI";

  if (authLoading) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack tn-shell">
          <SEO title={pageTitle} />
          <TrueNorthHero />
          <p className="serif-quiet tn-opening">
            Opening your chart…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack tn-shell">
          <SEO title={pageTitle} />
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="tn-card tn-invite-card">
                <p className="label-lock">Your natal chart</p>
                <p className="serif-quiet tn-invite-card__copy">
                  The exact sky the second you were born — placements, houses, and a profile written for you. Free the moment you register.
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
      <div className="journal-stack tn-shell">
        <SEO title={pageTitle} />
        <TrueNorthHero sunSign={sunSign} />

        {loading && (
          <div className="tn-card">
            <p className="tn-sky__note">Calculating your chart…</p>
          </div>
        )}

        {!loading && chartError && (
          <div className="tn-card tn-card--alert">
            <p className="tn-alert">{chartError}</p>
            <Link to="/profile" className="tn-inline">Complete your birth details on your account →</Link>
          </div>
        )}

        {!loading && chart && (
          <div className="chart-feed tn-feed">
            <ChartSkyPanel chart={chart} selectedBody={selectedBody} setSelectedBody={setSelectedBody} />

            <div className="tn-card chart-feed-card" style={{ ["--i" as any]: 1 }}>
              <SectionHeading wordA="The" wordB="Houses" ariaLabel="The Houses" />
              <p className="chart-expand-hint">
                Placidus houses — tap a room to see who lives there.
              </p>
              <div className="tn-houses">
                {chart.houses.map((h) => (
                  <HouseRow
                    key={h.house}
                    houseCusp={h}
                    occupants={chart.placements.filter((p) => p.house === h.house)}
                    expanded={expandedHouse === h.house}
                    onToggle={() => setExpandedHouse((cur) => (cur === h.house ? null : h.house))}
                  />
                ))}
              </div>
            </div>

            <div className="tn-card tn-letter chart-feed-card chart-feed-card--wide" style={{ position: "relative", ["--i" as any]: 4 }}>
              <SectionHeading wordA="Your" wordB="Profile" ariaLabel="Your Personality Profile" />
              {profileResult === undefined && (
                <p className="tn-sky__note">Writing your profile…</p>
              )}
              {profileResult && !profileResult.success && (
                <div className="tn-card--alert" style={{ display: "flex", flexDirection: "column", gap: "0.65rem", alignItems: "flex-start" }}>
                  <p className="tn-alert">
                    {PROFILE_ERROR_COPY[profileResult.reason ?? ""] ??
                      "Couldn't write your personality profile just now — try again shortly."}
                  </p>
                  <button
                    type="button"
                    onClick={() => invalidateQueries()}
                    className="tn-inline"
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    Try again →
                  </button>
                </div>
              )}
              {profileResult?.success && profileResult.narrative && (
                <SectionBoundary fallbackLabel="Couldn't display your profile just now — try refreshing." >
                  <div className="chart-profile-sections tn-letter__body">
                    {parseProfileSections(profileResult.narrative).map((s, i) => (
                      <ProfileSection key={i} title={s.title} body={s.body} />
                    ))}
                  </div>
                </SectionBoundary>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
