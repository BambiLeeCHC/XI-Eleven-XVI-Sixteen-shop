import { useState } from "react";
import { Link } from "react-router-dom";
import { buildBreadcrumbJsonLd, buildTrueNorthJsonLd, SEO } from "../../components/SEO";
import { PAGE_SEO } from "../../data/seoMeta";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { api, invalidateQueries, useAuthStatus, useQuery } from "../../lib/backend";
import { ChartSkyPanel } from "./ChartSkyPanel";
import { SectionBoundary } from "../../components/journal/SectionBoundary";
import {
  AspectRow,
  HouseRow,
  PlacementRow,
  PROFILE_ERROR_COPY,
  ProfileSection,
  SectionHeading,
  TrueNorthHero,
  TrueNorthSignedOutTeaser,
  HouseDressing,
  parseProfileSections,
} from "./shared";
import type { NatalChartResult, NatalProfileResult } from "./shared";

export function ChartHomePage() {
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [expandedHouse, setExpandedHouse] = useState<number | null>(null);
  const [expandedAspect, setExpandedAspect] = useState<number | null>(null);

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
  const subscription = useQuery(
    api.subscription.status,
    authLoading || !isAuthenticated ? "skip" : {},
  );
  const showLongReadOffer =
    Boolean(subscription) &&
    subscription?.entitled !== true &&
    subscription?.status !== "active" &&
    subscription?.status !== "trialing" &&
    subscription?.isAdmin !== true;

  const seo = PAGE_SEO.chart;
  const chartJsonLd = [
    buildTrueNorthJsonLd(),
    buildBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "True North", url: "/chart" },
    ]),
  ];

  if (authLoading) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack tn-shell">
          <SEO title={seo.title} description={seo.description} url="/chart" jsonLd={chartJsonLd} />
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
          <SEO title={seo.title} description={seo.description} url="/chart" jsonLd={chartJsonLd} />
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="tn-card tn-invite-card">
                <p className="label-lock">Natal chart with account</p>
                <p className="serif-quiet tn-invite-card__copy">
                  The spec you showed up with — every placement, house, and a profile written for you.
                  The Long Read is the house reading: $7/week.
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
        <SEO title={seo.title} description={seo.description} url="/chart" jsonLd={chartJsonLd} />
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
              <SectionHeading wordA="The" wordB="Placements" ariaLabel="The Placements" />
              <p className="chart-expand-hint">
                Tap a planet. The sign is how that part of you actually moves.
              </p>
              <div className="tn-houses">
                {chart.placements.map((p) => (
                  <PlacementRow
                    key={p.body}
                    placement={p}
                    expanded={selectedBody === p.body}
                    onToggle={() => setSelectedBody(selectedBody === p.body ? null : p.body)}
                  />
                ))}
              </div>
            </div>

            <div className="tn-card chart-feed-card" style={{ ["--i" as any]: 2 }}>
              <SectionHeading wordA="Tightest" wordB="Aspects" ariaLabel="Tightest Aspects" />
              <p className="chart-expand-hint">
                The tighter the orb, the stronger the conversation between two planets.
              </p>
              {chart.aspects.length > 0 ? (
                <div className="tn-houses">
                  {chart.aspects.map((a, i) => (
                    <AspectRow
                      key={`${a.bodyA}-${a.aspect}-${a.bodyB}-${i}`}
                      aspect={a}
                      expanded={expandedAspect === i}
                      onToggle={() => setExpandedAspect((cur) => (cur === i ? null : i))}
                    />
                  ))}
                </div>
              ) : (
                <p className="tn-sky__note">No tight aspects to show yet.</p>
              )}
            </div>

            <div className="tn-card chart-feed-card" style={{ ["--i" as any]: 3 }}>
              <SectionHeading wordA="The" wordB="Houses" ariaLabel="The Houses" />
              <p className="chart-expand-hint">
                Tap a house. The sign on the cusp is how that room of your life actually runs.
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

            {showLongReadOffer && (
              <div className="tn-card tn-paywall chart-feed-card" style={{ ["--i" as any]: 5 }}>
                <p className="label-lock">$7 / week</p>
                <h2 className="clash tn-paywall__title">The Long Read.</h2>
                <p className="serif-quiet tn-lede">
                  The house reading — seven cards, three windows a day, written against
                  what's actually going on. $7 a week.
                </p>
                <Link to="/chart/long-read" className="cta-pist" style={{ textAlign: "center" }}>
                  Get the Long Read — $7/week
                </Link>
                <p className="tn-sky__note">Seven days to try it. Then $7/week. Cancel anytime.</p>
              </div>
            )}

            <HouseDressing />
          </div>
        )}
      </div>
    </div>
  );
}
