import { Link, useLocation } from "react-router-dom";
import { RegisterForm } from "../../components/RegisterForm";
import { SignIcon } from "../../components/journal/SkyGlyphs";
import {
  explainHouseFull,
  explainPlacement,
  explainSignInHouse,
} from "../../lib/astrologyMeanings";
import { api, useQuery } from "../../lib/backend";
import { NUMEROLOGY_CALC_EXPLAIN } from "../../lib/numerology";

/* ═══════════════════════════════════════════════════════════════════════
   TRUE NORTH — shared types, copy, styling and small components used
   across the four True North pages (Chart, Numbers, Almanac, Long Read).
   Each destination now lives on its own route instead of one long scroll,
   but they share one hero/nav shell and the same visual vocabulary.
   ═══════════════════════════════════════════════════════════════════════ */

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
  upstream_error:
    "Our reading service is briefly at capacity — please try again in a minute.",
  empty:
    "Couldn't write your numerology narrative just now — try again shortly.",
};

export const PROFILE_ERROR_COPY: Record<string, string> = {
  no_key:
    "Your personality profile is temporarily unavailable — our team has been notified.",
  upstream_error:
    "Our reading service is briefly at capacity — please try again in a minute.",
  empty:
    "Couldn't write your personality profile just now — try again shortly.",
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
  padding: "18px",
  textAlign: "center",
  background: "#D8F0C4",
  color: "#142010",
  border: 0,
  boxShadow: "6px 6px 0 #E4D4F4",
  fontSize: "13px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontWeight: 800,
  cursor: "pointer",
};

export const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

/** The four True North destinations — now separate routes instead of
 * anchors in one long scroll. */
export const TRUE_NORTH_PAGES = [
  { path: "/chart", label: "Chart", glyph: "✦" },
  { path: "/chart/numbers", label: "Numbers", glyph: "◆" },
  { path: "/chart/almanac", label: "Almanac", glyph: "☾" },
  { path: "/chart/long-read", label: "Long Read", glyph: "♠" },
] as const;

/** Fetches just the natal chart, for the sun-sign line in the hero — every
 * True North page shows it for continuity even though only the Chart page
 * shows the rest of the chart. */
export function useSunSign(user: unknown): string | undefined {
  const chartResult = useQuery<NatalChartResult>(
    api.natalChart.get,
    user ? {} : "skip",
  );
  const chart = chartResult?.success ? (chartResult.chart ?? null) : null;
  return chart?.placements?.find(p => p.body === "Sun")?.sign;
}

export function PlacementRow({
  placement,
  expanded,
  onToggle,
}: {
  placement: NatalPlacement;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { body, sign, house, retrograde } = placement;
  return (
    <div className={`chart-placement-row ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="chart-placement-row__head"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="chart-placement__body">{body}</span>
        <span className="chart-placement-row__head-right">
          <span
            className={`jcol-tag jcol-tag--sm jcol-${retrograde ? "kraft" : "ink"} jcol-type`}
          >
            <SignIcon sign={sign} size={13} /> {sign}
            {house ? ` · H${house}` : ""}
            {retrograde ? " · Rx" : ""}
          </span>
          <span className="chart-placement-row__chevron" aria-hidden="true">
            ▾
          </span>
        </span>
      </button>
      {expanded && (
        <p className="chart-placement-row__explain">
          {explainPlacement(body, sign)}
        </p>
      )}
    </div>
  );
}

export function HouseRow({
  houseCusp,
  expanded,
  onToggle,
}: {
  houseCusp: NatalHouseCusp;
  expanded: boolean;
  onToggle: () => void;
}) {
  const full = explainHouseFull(houseCusp.house);
  return (
    <div className={`chart-placement-row ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="chart-placement-row__head"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="chart-placement__body">
          House {houseCusp.house}
          {full && (
            <span className="chart-house-row__title"> — {full.title}</span>
          )}
        </span>
        <span className="chart-placement-row__head-right">
          <span className="jcol-tag jcol-tag--sm jcol-lilac jcol-type">
            <SignIcon sign={houseCusp.sign} size={13} /> {houseCusp.sign}
          </span>
          <span className="chart-placement-row__chevron" aria-hidden="true">
            ▾
          </span>
        </span>
      </button>
      {expanded && full && (
        <div className="chart-placement-row__explain chart-house-row__explain">
          <p>{full.detail}</p>
          <div className="chart-house-row__keywords">
            {full.keywords.map(k => (
              <span
                key={k}
                className="jcol-tag jcol-tag--sm jcol-kraft jcol-type"
              >
                {k}
              </span>
            ))}
          </div>
          <p className="chart-house-row__sign-heading">
            <SignIcon sign={houseCusp.sign} size={13} /> {houseCusp.sign} on
            this cusp
          </p>
          <p className="chart-house-row__sign-explain">
            {explainSignInHouse(houseCusp.sign, houseCusp.house)}
          </p>
          <p className="chart-house-row__question">{full.question}</p>
        </div>
      )}
    </div>
  );
}

/** Minimal, safe render of sparing **bold** markup, paragraph by paragraph. */
export function BoldParagraphs({ text }: { text: string }) {
  const paragraphs = text.trim().split(/\n{2,}/);
  return (
    <>
      {paragraphs.map((p, i) => {
        const parts = p.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={i} className="chart-profile-section__p">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part,
            )}
          </p>
        );
      })}
    </>
  );
}

export const PROFILE_SECTION_STYLE: Record<
  string,
  { tone: string; rotate: string; face: string }
> = {
  "Who You Are": { tone: "jcol-gold", rotate: "-1.5deg", face: "jcol-display" },
  "The Texture": { tone: "jcol-ink", rotate: "1deg", face: "jcol-grotesk" },
  "The Highest Use of Your Chart": {
    tone: "jcol-lilac",
    rotate: "-1deg",
    face: "jcol-display",
  },
  "Life Path": { tone: "jcol-gold", rotate: "-1.5deg", face: "jcol-display" },
  Expression: { tone: "jcol-ink", rotate: "1deg", face: "jcol-grotesk" },
  "Soul Urge": { tone: "jcol-blush", rotate: "-1deg", face: "jcol-display" },
  Personality: { tone: "jcol-lilac", rotate: "1.5deg", face: "jcol-grotesk" },
  Birthday: { tone: "jcol-kraft", rotate: "-1deg", face: "jcol-display" },
  "Personal Year": { tone: "jcol-gold", rotate: "1deg", face: "jcol-grotesk" },
  "The Throughline": {
    tone: "jcol-ink",
    rotate: "-1.5deg",
    face: "jcol-display",
  },
};

/** Splits the profile narrative on "## Section Title" markers into
 * {title, body} sections so each can carry the same collage-tag visual
 * treatment as the page header, rather than rendering as one text block. */
export function parseProfileSections(
  narrative: string,
): { title: string; body: string }[] {
  const matches = [...narrative.matchAll(/^##\s+(.+)$/gm)];
  if (matches.length === 0)
    return [{ title: "Your Personality Profile", body: narrative }];
  const sections: { title: string; body: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = (matches[i].index ?? 0) + matches[i][0].length;
    const end =
      i + 1 < matches.length
        ? (matches[i + 1].index ?? narrative.length)
        : narrative.length;
    sections.push({
      title: matches[i][1].trim(),
      body: narrative.slice(start, end).trim(),
    });
  }
  return sections;
}

/** Numerology number card — leads with the plain-language "how we got this"
 * line before the number itself, so the math isn't a black box. */
export function NumberRow({
  numKey,
  value,
}: {
  numKey: string;
  value: number;
}) {
  return (
    <div className="chart-number-row">
      <div className="chart-number-row__head">
        <span className="chart-placement__body">
          {NUMEROLOGY_LABELS[numKey] ?? numKey}
        </span>
        <span className="jcol-tag jcol-tag--sm jcol-gold jcol-type">
          {value}
        </span>
      </div>
      {NUMEROLOGY_CALC_EXPLAIN[numKey] && (
        <p className="chart-number-row__calc">
          {NUMEROLOGY_CALC_EXPLAIN[numKey]}
        </p>
      )}
    </div>
  );
}

export function ProfileSection({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const style = PROFILE_SECTION_STYLE[title] ?? {
    tone: "jcol-kraft",
    rotate: "0deg",
    face: "jcol-display",
  };
  return (
    <div className="chart-profile-section">
      <span
        className={`jcol-tag jcol-tag--md ${style.tone} ${style.face} chart-profile-section__title`}
        style={{ transform: `rotate(${style.rotate})` }}
      >
        {title}
      </span>
      <div className="chart-profile-section__body">
        <BoldParagraphs text={body} />
      </div>
    </div>
  );
}

/** Same two-tag collage heading used in the page hero — applied to every
 * section card so every True North page reads as one voice. */
export function SectionHeading({
  wordA,
  wordB,
  ariaLabel,
}: {
  wordA: string;
  wordB: string;
  ariaLabel: string;
}) {
  return (
    <h2
      className="journal-article__title--collage chart-section-heading"
      aria-label={ariaLabel}
    >
      <span
        className="jcol-tag jcol-gold jcol-display"
        style={{ transform: "rotate(-2deg)" }}
      >
        {wordA}
      </span>
      <span
        className="jcol-tag jcol-ink jcol-grotesk"
        style={{ transform: "rotate(1.5deg)" }}
      >
        {wordB}
      </span>
    </h2>
  );
}

/** Real page-to-page nav (was a scroll-spy dock over one long page) — each
 * destination now loads on its own, so switching is an actual navigation,
 * not a jump within a single heavy scroll. */
export function TrueNorthNav() {
  const location = useLocation();
  const tone = ["", "powder", "blush", "lilac"];
  return (
    <nav className="chart-quicknav lock-sub" aria-label="True North sections">
      {TRUE_NORTH_PAGES.map((p, i) => {
        const active =
          p.path === "/chart"
            ? location.pathname === "/chart"
            : location.pathname.startsWith(p.path);
        return (
          <Link
            key={p.path}
            to={p.path}
            aria-current={active ? "true" : undefined}
            className={`chip ${tone[i] || ""} ${active ? "on" : ""}`}
          >
            {p.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** The shared hero every True North page opens with — title, sun-sign line,
 * and the page nav. Kept identical across pages so switching between them
 * feels like one destination, not four different apps. */
export function TrueNorthHero({ sunSign }: { sunSign?: string }) {
  return (
    <div className="tn-hero-lock" style={{ position: "relative" }}>
      <span className="kicker-lock">Your own private cosmology</span>
      <h1
        className="clash mt-6"
        style={{ fontSize: "clamp(56px, 10vw, 120px)" }}
        aria-label="True North"
      >
        True North
      </h1>
      {sunSign && (
        <p className="serif-quiet text-2xl mt-4 max-w-2xl">
          {SIGN_GLYPH[sunSign] ?? ""} {sunSign} sun — the exact sky the second
          you were born.
        </p>
      )}
      <div className="mt-6">
        <TrueNorthNav />
      </div>
    </div>
  );
}

/** Signed-out marketing teaser, shared by every True North page. */
export function TrueNorthSignedOutTeaser({
  pageTitleTag,
}: {
  pageTitleTag: React.ReactNode;
}) {
  return (
    <div className="tn-hero-lock" style={{ position: "relative" }}>
      <span className="kicker-lock">Your own private cosmology</span>
      <h1
        className="clash mt-6"
        style={{ fontSize: "clamp(56px, 10vw, 120px)" }}
        aria-label="True North"
      >
        True North
      </h1>
      <p className="serif-quiet text-2xl mt-5 max-w-2xl">
        The exact sky the second you were born — decoded, in full, free the
        moment you register. What's underneath it — your numbers, your days, the
        long version of the story — is waiting too.
      </p>
      <div className="mt-6">{pageTitleTag}</div>
      <div
        className="tn-register-card mt-6"
        style={{
          padding: "1.75rem",
          border: "2px solid #0B0B0C",
          background: "#F7F0E6",
          color: "#0B0B0C",
        }}
      >
        <p className="label-lock mb-3" style={{ color: "#0B0B0C" }}>
          Create an account
        </p>
        <p className="serif-quiet text-base mb-4" style={{ color: "#0B0B0C" }}>
          Birth date and location unlock your free natal chart. Birth time is
          optional.
        </p>
        <RegisterForm redirectTo="/chart" showSignInLink />
      </div>
      <div className="mt-6">
        <TrueNorthNav />
      </div>
    </div>
  );
}
