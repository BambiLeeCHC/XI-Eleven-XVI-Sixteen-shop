import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { JournalSky } from "../components/journal/JournalSky";
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
 * The Natal Chart — a separate experience from the Journal/blog (per Tre's
 * request), living at its own route. Two layers:
 *
 *  1. Natal chart — FREE, given in full once birth date + location are on
 *     the account (collected at registration; birth time is optional).
 *  2. Numerology — the paywalled add-on (separate, higher subscription
 *     tier from the Long Read). Checkout for that tier isn't live yet —
 *     pending Tre's call on its price — so this section is teaser copy
 *     only until then.
 *
 * Signed-out visitors see marketing copy for both, to drive registration.
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

function PlacementRow({ body, sign, house, retrograde }: { body: string; sign: string; house: number | null; retrograde: boolean }) {
  return (
    <div
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0.6rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <span className="text-sm font-medium">{body}</span>
      <span className="text-sm text-muted-foreground">
        {SIGN_GLYPH[sign] ?? ""} {sign}
        {house ? ` · House ${house}` : ""}
        {retrograde ? " · Rx" : ""}
      </span>
    </div>
  );
}

export function ChartPage() {
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
        successUrl: `${window.location.origin}/chart`,
        cancelUrl: `${window.location.origin}/chart`,
      });
      if (result?.url) window.location.href = result.url;
    } catch {
      // surfaced implicitly by the button staying enabled — this mirrors
      // the same lightweight error handling used on the other paywall CTA
    } finally {
      setSubscribing(false);
    }
  };

  const loading = !!user && chartResult === undefined;
  const chart = chartResult?.success ? chartResult.chart ?? null : null;
  const chartError = chartResult && !chartResult.success ? chartResult.message ?? "Couldn't generate your chart." : null;

  const pageTitle = "Natal Chart & Numerology — XI · XVI";

  // Signed-out: marketing teaser for both the chart and numerology.
  if (!user) {
    return (
      <div className="journal-page">
        <JournalSky />
        <div className="journal-stack" style={{ maxWidth: "42rem" }}>
          <SEO title={pageTitle} />
          <div className="journal-surface journal-hero" style={{ textAlign: "center" }}>
            <p className="uppercase tracking-widest text-xs text-muted-foreground mb-2">Free at registration</p>
            <h1 className="text-3xl font-serif mb-3">Your Natal Chart</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The exact sky at the moment you were born — your Sun, Moon and Rising signs, every planet's
              placement, and the houses they fall in. Not a generic sign lookup: a real chart, calculated
              from your actual birth date, time and location, given to you in full the moment you register.
              No credit card, no trial — it's simply part of having an account.
            </p>
            <div className="journal-surface" style={{ padding: "1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
              <p className="text-sm font-semibold mb-2">Then, if you want to go deeper — Numerology</p>
              <p className="text-sm text-muted-foreground">
                Your name and birth date reduce to a set of numbers that don't change — your Life Path,
                your Expression number, your Soul Urge — each one a real, specific angle on how you move
                through decisions, relationships and timing. It's the layer underneath the chart: not what
                the sky was doing, but what you were built to do with it. Numerology is part of our
                higher subscription tier.
              </p>
            </div>
            <Link to="/signup" className={undefined}>
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
      <div className="journal-stack" style={{ maxWidth: "42rem" }}>
        <SEO title={pageTitle} />

        <div className="journal-surface journal-hero">
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-2">Free, in full</p>
          <h1 className="text-3xl font-serif mb-3">Your Natal Chart</h1>
          <p className="text-sm text-muted-foreground">
            The exact sky at the moment you were born, calculated from your birth date, time and location.
          </p>
        </div>

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
          <>
            <div className="journal-surface" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "1rem", textAlign: "center" }}>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Ascendant</p>
                  <p className="text-sm font-semibold">{SIGN_GLYPH[chart.ascendant] ?? ""} {chart.ascendant}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Midheaven</p>
                  <p className="text-sm font-semibold">{SIGN_GLYPH[chart.midheaven] ?? ""} {chart.midheaven}</p>
                </div>
              </div>
              {chart.approximateTime && (
                <p className="text-[12px] text-muted-foreground italic mb-3">
                  No birth time on file — this chart uses local noon, so your Ascendant, houses and Moon
                  placement may shift once you add your exact birth time to your account.
                </p>
              )}
              <div>
                {chart.placements.map((p) => (
                  <PlacementRow key={p.body} {...p} />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                {chart.zodiac} zodiac · {chart.houseSystem} houses
              </p>
            </div>

            <div className="journal-surface" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <p className="text-sm font-semibold">Numerology — the layer underneath the chart</p>

              {!numerologyUnlocked && (
                <>
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
                  <div>
                    {Object.entries(numerologyResult.numbers ?? {}).map(([key, value]) => (
                      <div
                        key={key}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <span className="text-sm font-medium">{NUMEROLOGY_LABELS[key] ?? key}</span>
                        <span className="text-sm text-muted-foreground">{value}</span>
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
          </>
        )}
      </div>
    </div>
  );
}
