import { Link, useLocation } from "react-router-dom";
import { PlanetIcon, SignIcon } from "../../components/journal/SkyGlyphs";
import {
  explainAspectFull,
  explainHouseFull,
  explainPlacementFull,
  explainSignInHouse,
} from "../../lib/astrologyMeanings";
import { api, useQuery } from "../../lib/backend";
import { NUMEROLOGY_CALC_EXPLAIN } from "../../lib/numerology";
import { moonPhase } from "../../lib/ritual";

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

export const SIGN_ELEMENT: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire",
  Leo: "fire",
  Sagittarius: "fire",
  Taurus: "earth",
  Virgo: "earth",
  Capricorn: "earth",
  Gemini: "air",
  Libra: "air",
  Aquarius: "air",
  Cancer: "water",
  Scorpio: "water",
  Pisces: "water",
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
  { path: "/chart", label: "Chart", glyph: "✦", blurb: "The sky the second you were born." },
  { path: "/chart/numbers", label: "Numbers", glyph: "◆", blurb: "The constants underneath the chart." },
  { path: "/chart/almanac", label: "Almanac", glyph: "☾", blurb: "The day's mood, in one page." },
  { path: "/chart/long-read", label: "Long Read", glyph: "♠", blurb: "Seven cards. Three windows a day." },
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
  const { body, sign, house, retrograde, degree } = placement;
  const degInSign = Math.floor(((degree % 30) + 30) % 30);
  const full = explainPlacementFull(body, sign);
  const element = SIGN_ELEMENT[sign] ?? "air";
  return (
    <div className={`tn-house tn-place tn-house--${element} ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="tn-house__head"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="tn-house__num tn-place__mark" aria-hidden="true">
          <PlanetIcon body={body} size={22} />
        </span>
        <span className="tn-house__copy">
          <span className="label-lock">{full.title}</span>
          <span className="tn-house__sign">
            <SignIcon sign={sign} size={16} /> {body} · {degInSign}° {sign}
            {full.summary ? ` · ${full.summary}` : ""}
          </span>
        </span>
        <span className="tn-house__bodies">
          {house ? <span className={`lock-pill ${retrograde ? "rx" : "mute"}`}>H{house}{retrograde ? " Rx" : ""}</span> : null}
        </span>
        <span className="chart-placement-row__chevron" aria-hidden="true">▾</span>
      </button>
      {expanded && (
        <div className="tn-house__open">
          {house ? (
            <p className="tn-house__residents">Lives in house {house}.</p>
          ) : null}
          <p>{full.detail}</p>
          {full.keywords.length > 0 && (
            <div className="chart-house-row__keywords">
              {full.keywords.map(k => (
                <span key={k} className="lock-pill mute">{k}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌",
  opposition: "☍",
  square: "□",
  trine: "△",
  sextile: "⚹",
  quincunx: "⊼",
};

const ASPECT_TONE: Record<string, "fire" | "earth" | "air" | "water"> = {
  conjunction: "earth",
  sextile: "air",
  square: "fire",
  trine: "earth",
  opposition: "water",
  quincunx: "air",
};

export function AspectRow({
  aspect,
  expanded,
  onToggle,
}: {
  aspect: NatalAspect;
  expanded: boolean;
  onToggle: () => void;
}) {
  const key = aspect.aspect.toLowerCase();
  const full = explainAspectFull(aspect.bodyA, aspect.bodyB, aspect.aspect);
  const tone = ASPECT_TONE[key] ?? "air";
  return (
    <div className={`tn-house tn-aspect tn-house--${tone} ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="tn-house__head"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="tn-house__num" aria-hidden="true">{ASPECT_GLYPH[key] ?? "·"}</span>
        <span className="tn-house__copy">
          <span className="label-lock">{full.title}</span>
          <span className="tn-house__sign">
            <PlanetIcon body={aspect.bodyA} size={15} /> {aspect.bodyA}
            <span aria-hidden="true"> · </span>
            <PlanetIcon body={aspect.bodyB} size={15} /> {aspect.bodyB}
          </span>
        </span>
        <span className="lock-pill mute">{aspect.orb.toFixed(1)}°</span>
        <span className="chart-placement-row__chevron" aria-hidden="true">▾</span>
      </button>
      {expanded && (
        <div className="tn-house__open">
          <p className="tn-house__residents">{full.summary}</p>
          <p>{full.detail}</p>
          {full.keywords.length > 0 && (
            <div className="chart-house-row__keywords">
              {full.keywords.map(k => (
                <span key={k} className="lock-pill mute">{k}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HouseRow({
  houseCusp,
  expanded,
  onToggle,
  occupants = [],
}: {
  houseCusp: NatalHouseCusp;
  expanded: boolean;
  onToggle: () => void;
  occupants?: NatalPlacement[];
}) {
  const full = explainHouseFull(houseCusp.house);
  const element = SIGN_ELEMENT[houseCusp.sign] ?? "air";
  return (
    <div className={`tn-house tn-house--${element} ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="tn-house__head"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="tn-house__num">{String(houseCusp.house).padStart(2, "0")}</span>
        <span className="tn-house__copy">
          <span className="label-lock">{full?.title ?? `House ${houseCusp.house}`}</span>
          <span className="tn-house__sign">
            <SignIcon sign={houseCusp.sign} size={16} /> {houseCusp.sign}
            {full?.summary ? ` · ${full.summary}` : ""}
          </span>
        </span>
        <span className="tn-house__bodies">
          {occupants.map(p => (
            <span key={p.body} className="tn-house__body" title={p.body}>
              <PlanetIcon body={p.body} size={15} />
            </span>
          ))}
        </span>
        <span className="chart-placement-row__chevron" aria-hidden="true">▾</span>
      </button>
      {expanded && full && (
        <div className="tn-house__open">
          {occupants.length > 0 && (
            <p className="tn-house__residents">
              {occupants.map(p => p.body).join(" · ")} {occupants.length === 1 ? "lives" : "live"} here.
            </p>
          )}
          <p>{full.detail}</p>
          <div className="chart-house-row__keywords">
            {full.keywords.map(k => (
              <span key={k} className="lock-pill mute">
                {k}
              </span>
            ))}
          </div>
          <p className="chart-house-row__sign-heading">
            <SignIcon sign={houseCusp.sign} size={13} /> {houseCusp.sign} on this cusp
          </p>
          <p className="chart-house-row__sign-explain">
            {explainSignInHouse(houseCusp.sign, houseCusp.house)}
          </p>
          {full.question ? <p className="chart-house-row__question">{full.question}</p> : null}
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

export function ProfileSection({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="chart-profile-section">
      <p className="label-lock chart-profile-section__title">{title}</p>
      <div className="chart-profile-section__body">
        <BoldParagraphs text={body} />
      </div>
    </div>
  );
}

/** IMPACT section title — kicker + Clash, same voice as the shop. */
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
    <h2 className="chart-section-heading" aria-label={ariaLabel}>
      <span className="label-lock chart-section-heading__kicker">{wordA}</span>
      <span className="clash chart-section-heading__title">{wordB}</span>
    </h2>
  );
}
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

/** Numerology number card — Clash display figure, then the math in quiet type. */
export function NumberRow({
  numKey,
  value,
}: {
  numKey: string;
  value: number;
}) {
  return (
    <div className="tn-number">
      <span className="label-lock tn-number__label">
        {NUMEROLOGY_LABELS[numKey] ?? numKey}
      </span>
      <span className="clash tn-number__value">{value}</span>
      {NUMEROLOGY_CALC_EXPLAIN[numKey] && (
        <p className="tn-number__calc">{NUMEROLOGY_CALC_EXPLAIN[numKey]}</p>
      )}
    </div>
  );
}

/** Real page-to-page nav — four destinations, one observatory. */
export function TrueNorthNav() {
  const location = useLocation();
  return (
    <nav className="tn-rail" aria-label="True North sections">
      {TRUE_NORTH_PAGES.map(p => {
        const active =
          p.path === "/chart"
            ? location.pathname === "/chart"
            : location.pathname.startsWith(p.path);
        return (
          <Link
            key={p.path}
            to={p.path}
            aria-current={active ? "true" : undefined}
            className={`tn-rail__item ${active ? "is-active" : ""}`}
          >
            <span className="tn-rail__glyph" aria-hidden="true">{p.glyph}</span>
            <span className="tn-rail__label">{p.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function TrueNorthSkyline({ sunSign }: { sunSign?: string }) {
  const moon = moonPhase();
  const hour = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <p className="tn-skyline">
      <span>{hour}</span>
      <span aria-hidden="true">·</span>
      <span>
        {moon.glyph} {moon.name}
      </span>
      {sunSign && (
        <>
          <span aria-hidden="true">·</span>
          <span>
            {SIGN_GLYPH[sunSign] ?? ""} {sunSign} sun
          </span>
        </>
      )}
    </p>
  );
}

/** Shared observatory header — identical across Chart, Numbers, Almanac, Long Read. */
export function TrueNorthHero({ sunSign }: { sunSign?: string }) {
  return (
    <header className="tn-hero">
      <div className="tn-hero__mast">
        <div className="tn-hero__copy">
          <span className="kicker-lock">Your own private cosmology</span>
          <h1 className="clash tn-hero__title" aria-label="True North">
            True North
          </h1>
          <p className="serif-quiet tn-hero__lede">
            {sunSign
              ? `The exact sky the second you were born — ${sunSign} sun, decoded in full.`
              : "The exact sky the second you were born, decoded in full."}
          </p>
          <TrueNorthSkyline sunSign={sunSign} />
        </div>
        {sunSign && (
          <div className="tn-hero__orb" aria-hidden="true">
            <span className="tn-hero__orb-glyph">{SIGN_GLYPH[sunSign]}</span>
            <span className="tn-hero__orb-sign">{sunSign}</span>
          </div>
        )}
      </div>
      <TrueNorthNav />
    </header>
  );
}

/** Signed-out marketing teaser, shared by every True North page. */
export function TrueNorthSignedOutTeaser({
  pageTitleTag,
}: {
  pageTitleTag: React.ReactNode;
}) {
  return (
    <header className="tn-hero">
      <div className="tn-hero__mast">
        <div className="tn-hero__copy">
          <span className="kicker-lock">Your own private cosmology</span>
          <h1 className="clash tn-hero__title" aria-label="True North">
            True North
          </h1>
          <p className="serif-quiet tn-hero__lede">
            The exact sky the second you were born — decoded, in full, the moment
            you register at xixvi.shop. Free. No card on file.
          </p>
          <TrueNorthSkyline />
        </div>
      </div>
      <div className="tn-invite">{pageTitleTag}</div>
      <Link to="/signup" className="cta-pist tn-hero__cta">
        See your chart — free
      </Link>
      <ul className="tn-destinations">
        {TRUE_NORTH_PAGES.map(p => (
          <li key={p.path} className="tn-destination">
            <span className="tn-destination__glyph" aria-hidden="true">{p.glyph}</span>
            <span className="label-lock">{p.label}</span>
            <span className="serif-quiet tn-destination__blurb">{p.blurb}</span>
          </li>
        ))}
      </ul>
      <div className="tn-card tn-invite-card">
        <p className="label-lock">XI Eleven XVI Sixteen · True North</p>
        <p className="serif-quiet tn-invite-card__copy">
          True North is the house observatory at xixvi.shop. Create an account and
          get a free natal chart — every placement, house, and a profile written
          for you. The Journal daily draw and the 11:16 Almanac stay free. The Long
          Read is seven cards, three windows a day, written against what's actually
          going on: seven-day trial, then $7/week. Numerology is $19.99, once.
        </p>
      </div>
      <TrueNorthNav />
    </header>
  );
}
