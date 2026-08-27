import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { api, invalidateQueries, useQuery } from "../../lib/backend";
import { TrueNorthBirthCard, useTrueNorthAuth } from "./session";
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

/**
 * True North — the free natal chart. First of the four True North
 * destinations (Chart / Numbers / Almanac / Long Read), each now its own
 * page rather than one long scroll.
 */
export function ChartHomePage() {
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [expandedHouse, setExpandedHouse] = useState<number | null>(null);

  const { user, isAuthenticated, authLoading, profileLoading } = useTrueNorthAuth();
  const chartResult = useQuery<NatalChartResult>(
    api.natalChart.get,
    isAuthenticated && user?.birthDate && user?.birthLocation ? {} : "skip",
  );
  const profileResult = useQuery<NatalProfileResult>(
    api.natalProfile.get,
    chartResult?.success ? {} : "skip",
  );

  const hasBirth = Boolean(user?.birthDate && user?.birthLocation);
  const loading = hasBirth && chartResult === undefined;
  const chart = chartResult?.success ? chartResult.chart ?? null : null;
  const chartError = chartResult && !chartResult.success ? chartResult.message ?? "Couldn't generate your chart." : null;
  const sunSign = chart?.placements?.find((p) => p.body === "Sun")?.sign;

  const pageTitle = "True North — Your Natal Chart — XI · XVI";

  if (authLoading || profileLoading) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack" style={{ maxWidth: "42rem" }}>
          <SEO title={pageTitle} />
          <TrueNorthHero />
          <div className="journal-surface" style={{ padding: "1.75rem" }}>
            <p className="text-sm">Loading your chart…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
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

        {isAuthenticated && (!user?.birthDate || !user?.birthLocation) && (
          <TrueNorthBirthCard user={user} />
        )}

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
            <ChartSkyPanel chart={chart} selectedBody={selectedBody} setSelectedBody={setSelectedBody} />

            <div className="journal-surface chart-feed-card" style={{ padding: "1.75rem", ["--i" as any]: 1 }}>
              <SectionHeading wordA="The" wordB="Houses" ariaLabel="The Houses" />
              <p className="chart-expand-hint" style={{ marginTop: "0.25rem" }}>
                Tap any house to open its full meaning, keywords and a reflective question ↓
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
                <SectionBoundary fallbackLabel="Couldn't display your profile just now — try refreshing.">
                  <div className="chart-profile-sections">
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
