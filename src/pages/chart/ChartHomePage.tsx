import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { SectionBoundary } from "../../components/journal/SectionBoundary";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import {
  buildBreadcrumbJsonLd,
  buildTrueNorthJsonLd,
  SEO,
} from "../../components/SEO";
import { PAGE_SEO } from "../../data/seoMeta";
import {
  api,
  invalidateQueries,
  useAuthStatus,
  useQuery,
} from "../../lib/backend";
import { buildPreviewNatalChart } from "../../lib/chartGeometry";
import { ChartSkyPanel } from "./ChartSkyPanel";
import type {
  NatalChart,
  NatalChartResult,
  NatalProfileResult,
} from "./shared";
import {
  AspectRow,
  HouseDressing,
  HouseRow,
  PlacementRow,
  PROFILE_ERROR_COPY,
  ProfileSection,
  parseProfileSections,
  SectionHeading,
  TrueNorthHero,
  TrueNorthSignedOutTeaser,
} from "./shared";

type ChartTab = "wheel" | "placements" | "houses" | "aspects" | "overview";

const CHART_TABS: { id: ChartTab; label: string }[] = [
  { id: "wheel", label: "Wheel" },
  { id: "placements", label: "Placements" },
  { id: "houses", label: "Houses" },
  { id: "aspects", label: "Aspects" },
  { id: "overview", label: "Overview" },
];

export function ChartHomePage({
  embedded = false,
  allowPreview = false,
  previewSigns,
}: {
  embedded?: boolean;
  allowPreview?: boolean;
  previewSigns?: { sun: string; moon: string; rising: string };
} = {}) {
  const [tab, setTab] = useState<ChartTab>("wheel");
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [expandedHouse, setExpandedHouse] = useState<number | null>(null);
  const [expandedAspect, setExpandedAspect] = useState<number | null>(null);

  const { isLoading: authLoading, isAuthenticated } = useAuthStatus();
  const chartResult = useQuery<NatalChartResult>(
    api.natalChart.get,
    isAuthenticated ? {} : "skip",
  );
  const profileResult = useQuery<NatalProfileResult>(
    api.natalProfile.get,
    chartResult?.success ? {} : "skip",
  );

  const preview = useMemo(
    () =>
      buildPreviewNatalChart(
        previewSigns ?? { sun: "Aries", moon: "Cancer", rising: "Libra" },
      ),
    [previewSigns],
  );

  const loading = isAuthenticated && chartResult === undefined;
  const serverChart = chartResult?.success ? (chartResult.chart ?? null) : null;
  const chartError =
    chartResult && !chartResult.success
      ? (chartResult.message ?? "Couldn't generate your chart.")
      : null;
  const chart: NatalChart | null =
    serverChart ??
    (!loading && (allowPreview || !isAuthenticated) ? preview : null);
  const usingPreview = Boolean(chart && !serverChart);
  const sunSign = chart?.placements?.find(p => p.body === "Sun")?.sign;
  const selected = chart?.placements.find(item => item.body === selectedBody);

  const seo = PAGE_SEO.chart;
  const chartJsonLd = [
    buildTrueNorthJsonLd(),
    buildBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "True North", url: "/chart" },
    ]),
  ];

  const openPlacement = (body: string) => {
    setSelectedBody(body);
    setTab("placements");
  };

  const openHouse = (house: number | null) => {
    if (!house) return;
    setExpandedHouse(house);
    setTab("houses");
  };

  if (authLoading && !allowPreview) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack tn-shell">
          <SEO
            title={seo.title}
            description={seo.description}
            url="/chart"
            jsonLd={chartJsonLd}
          />
          <TrueNorthHero />
          <p className="serif-quiet tn-opening">Opening your chart…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !allowPreview) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack tn-shell">
          <SEO
            title={seo.title}
            description={seo.description}
            url="/chart"
            jsonLd={chartJsonLd}
          />
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="tn-card tn-invite-card">
                <p className="label-lock">Natal chart with account</p>
                <p className="serif-quiet tn-invite-card__copy">
                  The spec you showed up with — every placement, house, and the
                  numbers underneath. They live on your profile. Readings are
                  separate.
                </p>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  if (!embedded && isAuthenticated) {
    return <Navigate to="/profile#chart" replace />;
  }

  const saveHref = isAuthenticated ? "/profile#profile" : "/login";
  const saveLabel = isAuthenticated
    ? "Save your exact birth time"
    : "Sign in to save your exact birth time";

  return (
    <div id="chart" className="tn-embed">
      {loading && (
        <div className="tn-card">
          <p className="tn-sky__note">Calculating your chart…</p>
        </div>
      )}

      {!loading && chartError && !chart && (
        <div className="tn-card tn-card--alert">
          <p className="tn-alert">{chartError}</p>
          <Link to="/profile#profile" className="tn-inline">
            Add birth details in Profile →
          </Link>
        </div>
      )}

      {!loading && chart && (
        <div className="chart-feed tn-feed">
          <div className="tn-subtabs" role="tablist" aria-label="Chart">
            {CHART_TABS.map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`chart-tab-${item.id}`}
                aria-selected={tab === item.id}
                aria-controls={`chart-panel-${item.id}`}
                className={tab === item.id ? "is-on" : ""}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "wheel" && (
            <div
              role="tabpanel"
              id="chart-panel-wheel"
              aria-labelledby="chart-tab-wheel"
            >
              <ChartSkyPanel
                chart={chart}
                selectedBody={selectedBody}
                setSelectedBody={setSelectedBody}
              />
              {usingPreview && (
                <p className="tn-sky__note chart-preview-note">
                  Local preview from{" "}
                  {preview.placements.find(item => item.body === "Sun")?.sign ??
                    "your"}{" "}
                  sun, moon, and rising.{" "}
                  <Link to={saveHref} className="tn-inline">
                    {saveLabel}
                  </Link>
                </p>
              )}
              {selected && (
                <div className="chart-jump">
                  <span className="lock-pill">
                    {selected.body} · {selected.sign} · House{" "}
                    {selected.house ?? "—"}
                  </span>
                  <button
                    type="button"
                    className="cta-ghost tn-action"
                    onClick={() => openPlacement(selected.body)}
                  >
                    Open placement
                  </button>
                  <button
                    type="button"
                    className="cta-ghost tn-action"
                    onClick={() => openHouse(selected.house)}
                  >
                    Open house
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "placements" && (
            <div
              role="tabpanel"
              id="chart-panel-placements"
              aria-labelledby="chart-tab-placements"
              className="tn-card chart-feed-card"
            >
              <SectionHeading
                wordA="The"
                wordB="Placements"
                ariaLabel="The Placements"
              />
              <p className="chart-expand-hint">
                Each planet rules one part of you. Its sign shows how it
                operates; its house shows where it shows up in daily life.
              </p>
              <div className="tn-houses">
                {chart.placements.map(placement => (
                  <PlacementRow
                    key={placement.body}
                    placement={placement}
                    houses={chart.houses}
                    placements={chart.placements}
                    expanded={selectedBody === placement.body}
                    onToggle={() =>
                      setSelectedBody(
                        selectedBody === placement.body ? null : placement.body,
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {tab === "houses" && (
            <div
              role="tabpanel"
              id="chart-panel-houses"
              aria-labelledby="chart-tab-houses"
              className="tn-card chart-feed-card"
            >
              <SectionHeading
                wordA="The"
                wordB="Houses"
                ariaLabel="The Houses"
              />
              <p className="chart-expand-hint">
                Tap a house. The sign on the cusp is how that room of your life
                actually runs.
              </p>
              <div className="tn-houses">
                {chart.houses.map(house => (
                  <HouseRow
                    key={house.house}
                    houseCusp={house}
                    houses={chart.houses}
                    placements={chart.placements}
                    occupants={chart.placements.filter(
                      item => item.house === house.house,
                    )}
                    expanded={expandedHouse === house.house}
                    onToggle={() =>
                      setExpandedHouse(current =>
                        current === house.house ? null : house.house,
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {tab === "aspects" && (
            <div
              role="tabpanel"
              id="chart-panel-aspects"
              aria-labelledby="chart-tab-aspects"
              className="tn-card chart-feed-card"
            >
              <SectionHeading
                wordA="Tightest"
                wordB="Aspects"
                ariaLabel="Tightest Aspects"
              />
              <p className="chart-expand-hint">
                Aspects are angles between two planets showing whether those
                parts of you work smoothly together or create friction. Smaller
                orbs (closer to 0°) mean a stronger effect.
              </p>
              {chart.aspects.length > 0 ? (
                <div className="tn-houses">
                  {chart.aspects.map((aspect, index) => (
                    <AspectRow
                      key={`${aspect.bodyA}-${aspect.aspect}-${aspect.bodyB}-${index}`}
                      aspect={aspect}
                      houses={chart.houses}
                      placements={chart.placements}
                      expanded={expandedAspect === index}
                      onToggle={() =>
                        setExpandedAspect(current =>
                          current === index ? null : index,
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="tn-sky__note">No tight aspects to show yet.</p>
              )}
            </div>
          )}

          {tab === "overview" && (
            <div
              role="tabpanel"
              id="chart-panel-overview"
              aria-labelledby="chart-tab-overview"
              className="tn-stack"
            >
              <div className="tn-card tn-letter chart-feed-card chart-feed-card--wide">
                <SectionHeading
                  wordA="Your"
                  wordB="Profile"
                  ariaLabel="Your Personality Profile"
                />
                {usingPreview && (
                  <p className="serif-quiet tn-lede">
                    {sunSign ? `${sunSign} sun` : "This sky"} is a local
                    preview. The written profile arrives once the birth time is
                    saved.
                  </p>
                )}
                {isAuthenticated &&
                  serverChart &&
                  profileResult === undefined && (
                    <p className="tn-sky__note">Writing your profile…</p>
                  )}
                {isAuthenticated && profileResult && !profileResult.success && (
                  <div
                    className="tn-card--alert"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.65rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <p className="tn-alert">
                      {PROFILE_ERROR_COPY[profileResult.reason ?? ""] ??
                        "Couldn't write your personality profile just now — try again shortly."}
                    </p>
                    <button
                      type="button"
                      onClick={() => invalidateQueries()}
                      className="tn-inline"
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      Try again →
                    </button>
                  </div>
                )}
                {isAuthenticated &&
                  profileResult?.success &&
                  profileResult.narrative && (
                    <SectionBoundary fallbackLabel="Couldn't display your profile just now — try refreshing.">
                      <div className="chart-profile-sections tn-letter__body">
                        {parseProfileSections(profileResult.narrative).map(
                          (section, index) => (
                            <ProfileSection
                              key={index}
                              title={section.title}
                              body={section.body}
                            />
                          ),
                        )}
                      </div>
                    </SectionBoundary>
                  )}
                {usingPreview && (
                  <p className="tn-sky__note">
                    <Link to={saveHref} className="tn-inline">
                      {saveLabel}
                    </Link>
                  </p>
                )}
              </div>
              <HouseDressing />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
