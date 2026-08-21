import { Link, useLocation } from "react-router-dom";
import { api, useQuery } from "../../lib/backend";
import { explainHouseFull, explainPlacement, explainSignInHouse } from "../../lib/astrologyMeanings";
import { NUMEROLOGY_CALC_EXPLAIN } from "../../lib/numerology";
import { SignIcon } from "../../components/journal/SkyGlyphs";

export interface NatalPlacement {
  body: string;
  sign: string;
  degree: number;
  house: number | null;
  retrograde: boolean;
}

export interface NatalHouseCusp {
  house: number;
  sign: string;
  degree: number;
}

export interface NatalAspect {
  bodyA: string;
  bodyB: string;
  aspect: string;
  orb: number;
}

export interface NatalChart {
  ascendant: string;
  ascendantDegree: number;
  midheaven: string;
  midheavenDegree: number;
  placements: NatalPlacement[];
  houses: NatalHouseCusp[];
  aspects: NatalAspect[];
  houseSystem: string;
  zodiac: string;
  approximateTime: boolean;
}

export interface NatalChartResult {
  success: boolean;
  chart?: NatalChart;
  message?: string;
}

export interface NatalProfileResult {
  success: boolean;
  narrative?: string;
  reason?: string;
}

export interface NumerologyResult {
  success: boolean;
  numbers?: Record<string, number>;
  narrative?: string;
  reason?: string;
}

export const NUMEROLOGY_ERROR_COPY: Record<string, string> = {
  no_key: "Numerology is temporarily unavailable — our team has been notified.",
  upstream_error: "Our reading service is briefly at capacity — please try again in a minute.",
  empty: "Couldn't write your numerology narrative just now — try again shortly.",
};

export const PROFILE_ERROR_COPY: Record<string, string> = {
  no_key: "Your personality profile is temporarily unavailable — our team has been notified.",
  upstream_error: "Our reading service is briefly at capacity — please try again in a minute.",
  empty: "Couldn't write your personality profile just now — try again shortly.",
};

export const NUMEROLOGY_LABELS: Record<string, string> = {
  lifePath: "Life Path",
  expression: "Expression",
  soulUrge: "Soul Urge",
  personality: "Personality",
  birthday: "Birthday",
  personalYear: "Personal Year",
};

export const ctaButtonStyle: Record<string, string | number> = {
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

export const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

export const TRUE_NORTH_PAGES = [
  { path: "/chart", label: "Chart", glyph: "✦" },
  { path: "/chart/numbers", label: "Numbers", glyph: "◆" },
  { path: "/chart/almanac", label: "Almanac", glyph: "☾" },
  { path: "/chart/long-read", label: "Long Read", glyph: "♠" },
] as const;

export function useSunSign(user: unknown): string | undefined {
  const chartResult = useQuery<NatalChartResult>(api.natalChart.get, user ? {} : "skip");
  const chart = chartResult?.success ? chartResult.chart ?? null : null;
  return chart?.placements?.find((p) => p.body === "Sun")?.sign;
}

export function TrueNorthNav() {
  const location = useLocation();
  return (
    <nav className="chart-quicknav chart-quicknav--sticky" aria-label="True North sections">
      <div className="chart-quicknav__track">
        {TRUE_NORTH_PAGES.map((p) => {
          const active = p.path === "/chart" ? location.pathname === "/chart" : location.pathname.startsWith(p.path);
          return (
            <Link
              key={p.path}
              to={p.path}
              aria-current={active}
              className={`chart-quicknav__item ${active ? "is-active" : ""}`}
            >
              <span className="chart-quicknav__glyph" aria-hidden="true">{p.glyph}</span>
              <span className="chart-quicknav__label">{p.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TrueNorthHero({ sunSign }: { sunSign?: string }) {
  return (
    <div className="journal-surface journal-hero tn-hero" style={{ position: "relative" }}>
      <span className="tn-hero-glow" aria-hidden="true" />
      <span className="jcol-patch jcol-patch--a" aria-hidden="true" />
      <span className="jcol-tape jcol-tape--tl" aria-hidden="true" />
      <p className="tn-hero-kicker">Four doors. One private sky.</p>
      <h1 className="tn-hero-title" aria-label="True North">
        <span className="jcol-tag jcol-gold jcol-display" style={{ transform: "rotate(-2deg)" }}>True</span>
        <span className="jcol-tag jcol-ink jcol-grotesk" style={{ transform: "rotate(1.5deg)" }}>North</span>
      </h1>
      {sunSign ? (
        <p className="tn-hero-line">
          {SIGN_GLYPH[sunSign] ?? ""} {sunSign} sun — the chart is already yours. Open Chart, Numbers,
          Almanac, or the Long Read whenever you want another layer.
        </p>
      ) : (
        <p className="tn-hero-line">
          Your natal chart, numbers, daily sky, and the Long Read — each one a door into the same
          private cosmology.
        </p>
      )}
      <TrueNorthNav />
    </div>
  );
}

export function TrueNorthSignedOutTeaser({ pageTitleTag }: { pageTitleTag: React.ReactNode }) {
  const doors = [
    { glyph: "✦", title: "Chart", line: "The sky the second you arrived — placements, houses, the full map." },
    { glyph: "◆", title: "Numbers", line: "Life Path, Expression, Soul Urge — the numbers that don't change." },
    { glyph: "☾", title: "Almanac", line: "What the day is asking of you, in plain language." },
    { glyph: "♠", title: "Long Read", line: "Seven cards, three times a day — hope-forward, personal, saved." },
  ];
  return (
    <div className="journal-surface journal-hero tn-hero" style={{ textAlign: "center", position: "relative" }}>
      <span className="tn-hero-glow" aria-hidden="true" />
      <span className="jcol-patch jcol-patch--a" aria-hidden="true" />
      <span className="jcol-tape jcol-tape--tl" aria-hidden="true" />
      <p className="tn-hero-kicker" style={{ textAlign: "center" }}>Four doors. One private sky.</p>
      <h1 className="tn-hero-title tn-hero-title--center" aria-label="True North">
        <span className="jcol-tag jcol-gold jcol-display" style={{ transform: "rotate(-2deg)" }}>True</span>
        <span className="jcol-tag jcol-ink jcol-grotesk" style={{ transform: "rotate(1.5deg)" }}>North</span>
      </h1>
      <p className="tn-hero-line" style={{ marginLeft: "auto", marginRight: "auto" }}>
        Free natal chart the moment you create an account. Numbers, Almanac, and the Long Read open
        from the same place — email only, no social logins.
      </p>
      <div
        className="tn-doors"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "0.75rem",
          textAlign: "left",
          margin: "1.25rem 0 1.5rem",
        }}
      >
        {doors.map((d) => (
          <div
            key={d.title}
            className="journal-surface"
            style={{ padding: "0.9rem 1rem", border: "1px solid rgba(214,178,96,.28)" }}
          >
            <p className="text-sm font-semibold" style={{ margin: "0 0 0.35rem" }}>
              <span aria-hidden="true">{d.glyph}</span> {d.title}
            </p>
            <p className="text-sm text-muted-foreground" style={{ margin: 0 }}>{d.line}</p>
          </div>
        ))}
      </div>
      {pageTitleTag}
      <Link to="/signup">
        <button style={ctaButtonStyle}>Start with email →</button>
      </Link>
      <p className="text-sm text-muted-foreground" style={{ marginTop: "0.85rem" }}>
        Already have an account? <Link to="/signin" className="underline">Sign in</Link>
      </p>
    </div>
  );
}
