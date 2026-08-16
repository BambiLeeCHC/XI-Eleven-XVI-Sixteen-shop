import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SEO } from "../components/SEO";
import { JournalSky } from "../components/journal/JournalSky";
import { AlmanacCalendar } from "../components/journal/Almanac";
import { api, useAction, useQuery } from "../lib/backend";

interface NatalPlacement {
  body: string;
  sign: string;
  degree: number;
  house: number | null;
  retrograde: boolean;
}

interface NatalChart {
  ascendant: string;
  midheaven: string;
  placements: NatalPlacement[];
  houseSystem: string;
  zodiac: string;
  approximateTime: boolean;
}

interface NatalChartResult {
  success: boolean;
  chart?: NatalChart;
  message?: string;
}

interface NumerologyResult {
  success: boolean;
  numbers?: Record<string, number>;
  narrative?: string;
  reason?: string;
}

const NUMEROLOGY_LABELS: Record<string, string> = {
  lifePath: "Life Path",
  expression: "Expression",
  soulUrge: "Soul Urge",
  personality: "Personality",
  birthday: "Birthday",
  personalYear: "Personal Year",
};

/**
 * The Chart — a full destination (like the Journal), not a single page.
 * Four tabs: the free natal chart, the paywalled numerology add-on, the
 * Almanac (moved here from the Journal), and a Long Read promo (moved here
 * from the Journal's tile grid).
 */

const ctaButtonStyle: Record<string, string | number> = {
  width: "100%",
  padding: "0.9rem",
  borderRadius: "12px",
  textAlign: "center",
  background: "linear-gradient(160deg, #1d2f4f, #101c33)",
  color: "#f3e9d2",
  border: "1px solid rgba(214,178,96,.6)",
  fontSize: "0.75rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  fontWeight: 600,
};

const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const TABS = [
  { id: "chart", label: "Natal Chart" },
  { id: "numerology", label: "Numerology" },
  { id: "almanac", label: "Almanac" },
  { id: "long-read", label: "The Long Read" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function PlacementChip({ body, sign, house, retrograde }: { body: string; sign: string; house: number | null; retrograde: boolean }) {
  return (
    <div className="chart-placement">
      <span className="chart-placement__body">{body}</span>
      <span className={`jcol-tag jcol-tag--sm jcol-${retrograde ? "kraft" : "ink"} jcol-type`}>
        {SIGN_GLYPH[sign] ?? ""} {sign}
        {house ? ` · H${house}` : ""}
        {retrograde ? " · Rx" : ""}
      </span>
    </div>
  );
}

function ChartTabs({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <div className="chart-tabs" role="tablist">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`chart-tab ${active === t.id ? "is-active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function ChartPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab") as TabId | null;
  const [tab, setTab] = useState<TabId>(requestedTab && TABS.some((t) => t.id === requestedTab) ? requestedTab : "chart");

  const setActiveTab = (t: TabId) => {
    setTab(t);
    setSearchParams(t === "chart" ? {} : { tab: t }, { replace: true });
  };

  const user = useQuery(api.auth.currentUser);
  const chartResult = useQuery<NatalChartResult>(
    api.natalChart.get,
    user ? {} : "skip",
  );
  const subscription = useQuery(api.subscription.status, user ? {} : "skip");
  const numerologyUnlocked =
    subscription?.entitled === true && subscription?.tier === "long_read_plus_numerology";
  const numerologyResult = useQuery<NumerologyResult>(
    api.numerology.get,
    numerologyUnlocked ? {} : "skip",
  );
  const startTrialAction = useAction(api.subscription.startTrial);
  const [subscribing, setSubscribing] = useState(false);

  const startNumerologyTrial = async () => {
    setSubscribing(true);
    try {
      const result = await startTrialAction({
        tier: "long_read_plus_numerology",
        successUrl: `${window.location.origin}/chart?tab=numerology`,
        cancelUrl: `${window.location.origin}/chart?tab=numerology`,
      });
      if (result?.url) window.location.href = result.url;
    } catch {
      // surfaced implicitly by the button staying enabled
    } finally {
      setSubscribing(false);
    }
  };

  const loading = !!user && chartResult === undefined;
  const chart = chartResult?.success ? chartResult.chart ?? null : null;
  const chartError = chartResult && !chartResult.success ? chartResult.message ?? "Couldn't generate your chart." : null;
  const sunSign = chart?.placements?.find((p) => p.body === "Sun")?.sign;

  const pageTitle = "The Chart — Natal Chart, Numerology & Almanac — XI · XVI";

  // Signed-out: marketing teaser for the whole destination.
  if (!user) {
    return (
      <div className="journal-page">
        <JournalSky />
        <div className="journal-stack" style={{ maxWidth: "42rem" }}>
          <SEO title={pageTitle} />
          <div className="journal-surface journal-hero" style={{ textAlign: "center", position: "relative" }}>
            <span className="jcol-patch jcol-patch--a" aria-hidden="true" />
            <span className="jcol-tape jcol-tape--tl" aria-hidden="true" />
            <h1 className="journal-article__title--collage" aria-label="Your Chart">
              <span className="jcol-tag jcol-gold jcol-display" style={{ transform: "rotate(-2deg)" }}>Your</span>
              <span className="jcol-tag jcol-ink jcol-grotesk" style={{ transform: "rotate(1.5deg)" }}>Chart</span>
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              The exact sky at the moment you were born — free, in full, the moment you register.
              Numerology, the Almanac and the Long Read all live here too.
            </p>
            <div className="journal-surface" style={{ padding: "1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
              <p className="text-sm font-semibold mb-2">Then, if you want to go deeper — Numerology</p>
              <p className="text-sm text-muted-foreground">
                Your name and birth date reduce to a set of numbers that don't change — your Life Path,
                your Expression number, your Soul Urge. Numerology is part of our higher subscription tier.
              </p>
            </div>
            <Link to="/signup">
              <button style={ctaButtonStyle}>Create your account →</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-page">
      <JournalSky />
      <div className="journal-stack" style={{ maxWidth: "44rem" }}>
        <SEO title={pageTitle} />

        <div className="journal-surface journal-hero" style={{ position: "relative" }}>
          <span className="jcol-patch jcol-patch--a" aria-hidden="true" />
          <span className="jcol-tape jcol-tape--tl" aria-hidden="true" />
          <h1 className="journal-article__title--collage" aria-label="The Chart">
            <span className="jcol-tag jcol-gold jcol-display" style={{ transform: "rotate(-2deg)" }}>The</span>
            <span className="jcol-tag jcol-ink jcol-grotesk" style={{ transform: "rotate(1.5deg)" }}>Chart</span>
          </h1>
          {sunSign && (
            <p className="text-sm text-muted-foreground mb-4">
              {SIGN_GLYPH[sunSign] ?? ""} {sunSign} sun · natal chart, numerology, the almanac and the
              long read — all in one place.
            </p>
          )}
          <ChartTabs active={tab} onChange={setActiveTab} />
        </div>

        {tab === "chart" && (
          <>
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
              <div className="journal-surface" style={{ padding: "1.75rem" }}>
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
                <div className="chart-placements">
                  {chart.placements.map((p) => (
                    <PlacementChip key={p.body} {...p} />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  {chart.zodiac} zodiac · {chart.houseSystem} houses
                </p>
              </div>
            )}
          </>
        )}

        {tab === "numerology" && (
          <div className="journal-surface" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            {!numerologyUnlocked && (
              <>
                <p className="text-sm font-semibold">Numerology — the layer underneath the chart</p>
                <p className="text-sm text-muted-foreground">
                  Your name and birth date reduce to a set of numbers that stay constant your whole
                  life — your Life Path, Expression, Soul Urge, Personality and this year's Personal
                  Year number. Where the chart shows what the sky was doing, numerology shows what you
                  were built to do with it.
                </p>
                <p className="text-sm">
                  <span className="font-semibold">7 days free</span>, then{" "}
                  <span className="font-semibold">$12/week</span> — Long Read + Numerology.
                </p>
                <button
                  onClick={startNumerologyTrial}
                  disabled={subscribing}
                  style={{ ...ctaButtonStyle, opacity: subscribing ? 0.6 : 1 }}
                >
                  {subscribing ? "Starting…" : "Start free trial ✦"}
                </button>
              </>
            )}

            {numerologyUnlocked && numerologyResult === undefined && (
              <p className="text-sm text-muted-foreground">Calculating your numbers…</p>
            )}

            {numerologyUnlocked && numerologyResult && !numerologyResult.success && (
              <p className="text-sm text-red-600">
                {numerologyResult.reason ?? "Couldn't write your numerology narrative just now — try again shortly."}
              </p>
            )}

            {numerologyUnlocked && numerologyResult?.success && (
              <>
                <div className="chart-placements">
                  {Object.entries(numerologyResult.numbers ?? {}).map(([key, value]) => (
                    <div key={key} className="chart-placement">
                      <span className="chart-placement__body">{NUMEROLOGY_LABELS[key] ?? key}</span>
                      <span className="jcol-tag jcol-tag--sm jcol-gold jcol-type">{value}</span>
                    </div>
                  ))}
                </div>
                {numerologyResult.narrative && (
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {numerologyResult.narrative}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === "almanac" && (
          <div className="journal-surface" style={{ padding: "1.5rem" }}>
            <AlmanacCalendar />
          </div>
        )}

        {tab === "long-read" && (
          <div className="journal-surface" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.9rem", textAlign: "center" }}>
            <span className="journal-tile__deck" aria-hidden="true" style={{ margin: "0 auto" }}>
              <i /><i /><i />
            </span>
            <p className="text-sm font-semibold">The Long Read</p>
            <p className="text-sm text-muted-foreground">
              Seven cards, read against what you told us — the in-depth reading, plus a follow-up
              question ($2.99) once you've drawn it. 7 days free, then $7/week (or $12/week with
              Numerology unlocked too).
            </p>
            <Link to="/journal/deep-reading">
              <button style={ctaButtonStyle}>Go deeper ✦</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
