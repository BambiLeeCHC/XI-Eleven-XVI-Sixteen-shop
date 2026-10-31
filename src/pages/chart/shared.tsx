import { Link, useLocation } from "react-router-dom";
import { PlanetIcon, SignIcon } from "../../components/journal/SkyGlyphs";
import { TrueNorthSignIcon } from "../../components/journal/TrueNorthGlyphs";
import {
  explainAspectFull,
  explainHouseFull,
  explainPlacementFull,
  explainSignInHouse,
} from "../../lib/astrologyMeanings";
import { api, useQuery } from "../../lib/backend";
import { HOUSE_HINGE, HOUSE_LINE } from "../../lib/brand";
import { NUMEROLOGY_CALC_EXPLAIN } from "../../lib/numerology";
import { moonPhase } from "../../lib/ritual";

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
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

export const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

export const TRUE_NORTH_PAGES = [
  { path: "/chart", label: "Chart", glyph: "✦", blurb: "The sky the second you were born." },
  { path: "/chart/numbers", label: "Numbers", glyph: "◆", blurb: "The constants underneath the chart." },
  { path: "/chart/almanac", label: "Almanac", glyph: "☾", blurb: "The day's mood, in one page." },
  { path: "/chart/circle", label: "Circle", glyph: "◎", blurb: "Daily notes, shared. Tandem when you want company." },
  { path: "/chart/long-read", label: "Long Read", glyph: "♠", blurb: "Seven cards. Three windows. $7/week." },
] as const;

export const TRUE_NORTH_FEATURES = [
  { title: "Clarity", body: "Complex charts, simplified without losing the point.", glyph: "✦" },
  { title: "Security", body: "Birth data stays with you. Never sold. Never shared.", glyph: "◆" },
  { title: "Craft", body: "Astrology treated as art, written to be read.", glyph: "☾" },
  { title: "Privacy", body: "Your chart is a private room. The door stays closed.", glyph: "♠" },
] as const;

export function useSunSign(user: unknown): string | undefined {
  const chartResult = useQuery<NatalChartResult>(api.natalChart.get, user ? {} : "skip");
  const chart = chartResult?.success ? (chartResult.chart ?? null) : null;
  return chart?.placements?.find(p => p.body === "Sun")?.sign;
}

export function PlacementRow({ placement, expanded, onToggle }: { placement: NatalPlacement; expanded: boolean; onToggle: () => void }) {
  const { body, sign, house, retrograde, degree } = placement;
  const degInSign = Math.floor(((degree % 30) + 30) % 30);
  const full = explainPlacementFull(body, sign);
  const element = SIGN_ELEMENT[sign] ?? "air";
  return (
    <div className={`tn-house tn-place tn-house--${element} ${expanded ? "is-expanded" : ""}`}>
      <button type="button" className="tn-house__head" onClick={onToggle} aria-expanded={expanded}>
        <span className="tn-house__num tn-place__mark" aria-hidden="true"><PlanetIcon body={body} size={22} /></span>
        <span className="tn-house__copy">
          <span className="label-lock">{full.title}</span>
          <span className="tn-house__sign"><SignIcon sign={sign} size={16} /> {body} · {degInSign}° {sign}{full.summary ? ` · ${full.summary}` : ""}</span>
        </span>
        <span className="tn-house__bodies">{house ? <span className={`lock-pill ${retrograde ? "rx" : "mute"}`}>H{house}{retrograde ? " Rx" : ""}</span> : null}</span>
        <span className="chart-placement-row__chevron" aria-hidden="true">▾</span>
      </button>
      {expanded && (
        <div className="tn-house__open">
          {house ? <p className="tn-house__residents">Lives in house {house}.</p> : null}
          <p>{full.detail}</p>
          {full.keywords.length > 0 && <div className="chart-house-row__keywords">{full.keywords.map(k => <span key={k} className="lock-pill mute">{k}</span>)}</div>}
        </div>
      )}
    </div>
  );
}

const ASPECT_GLYPH: Record<string, string> = { conjunction: "☌", opposition: "☍", square: "□", trine: "△", sextile: "⚹", quincunx: "⊼" };
const ASPECT_TONE: Record<string, "fire" | "earth" | "air" | "water"> = { conjunction: "earth", sextile: "air", square: "fire", trine: "earth", opposition: "water", quincunx: "air" };

export function AspectRow({ aspect, expanded, onToggle }: { aspect: NatalAspect; expanded: boolean; onToggle: () => void }) {
  const key = aspect.aspect.toLowerCase();
  const full = explainAspectFull(aspect.bodyA, aspect.bodyB, aspect.aspect);
  const tone = ASPECT_TONE[key] ?? "air";
  return (
    <div className={`tn-house tn-aspect tn-house--${tone} ${expanded ? "is-expanded" : ""}`}>
      <button type="button" className="tn-house__head" onClick={onToggle} aria-expanded={expanded}>
        <span className="tn-house__num" aria-hidden="true">{ASPECT_GLYPH[key] ?? "·"}</span>
        <span className="tn-house__copy">
          <span className="label-lock">{full.title}</span>
          <span className="tn-house__sign"><PlanetIcon body={aspect.bodyA} size={15} /> {aspect.bodyA}<span aria-hidden="true"> · </span><PlanetIcon body={aspect.bodyB} size={15} /> {aspect.bodyB}</span>
        </span>
        <span className="lock-pill mute">{aspect.orb.toFixed(1)}°</span>
        <span className="chart-placement-row__chevron" aria-hidden="true">▾</span>
      </button>
      {expanded && (
        <div className="tn-house__open">
          <p className="tn-house__residents">{full.summary}</p>
          <p>{full.detail}</p>
          {full.keywords.length > 0 && <div className="chart-house-row__keywords">{full.keywords.map(k => <span key={k} className="lock-pill mute">{k}</span>)}</div>}
        </div>
      )}
    </div>
  );
}

export function HouseRow({ houseCusp, expanded, onToggle, occupants = [] }: { houseCusp: NatalHouseCusp; expanded: boolean; onToggle: () => void; occupants?: NatalPlacement[] }) {
  const full = explainHouseFull(houseCusp.house);
  const element = SIGN_ELEMENT[houseCusp.sign] ?? "air";
  return (
    <div className={`tn-house tn-house--${element} ${expanded ? "is-expanded" : ""}`}>
      <button type="button" className="tn-house__head" onClick={onToggle} aria-expanded={expanded}>
        <span className="tn-house__num">{String(houseCusp.house).padStart(2, "0")}</span>
        <span className="tn-house__copy">
          <span className="label-lock">{full?.title ?? `House ${houseCusp.house}`}</span>
          <span className="tn-house__sign"><SignIcon sign={houseCusp.sign} size={16} /> {houseCusp.sign}{full?.summary ? ` · ${full.summary}` : ""}</span>
        </span>
        <span className="tn-house__bodies">{occupants.map(p => <span key={p.body} className="tn-house__body" title={p.body}><PlanetIcon body={p.body} size={15} /></span>)}</span>
        <span className="chart-placement-row__chevron" aria-hidden="true">▾</span>
      </button>
      {expanded && full && (
        <div className="tn-house__open">
          {occupants.length > 0 && <p className="tn-house__residents">{occupants.map(p => p.body).join(" · ")} {occupants.length === 1 ? "lives" : "live"} here.</p>}
          <p>{full.detail}</p>
          <div className="chart-house-row__keywords">{full.keywords.map(k => <span key={k} className="lock-pill mute">{k}</span>)}</div>
          <p className="chart-house-row__sign-heading"><SignIcon sign={houseCusp.sign} size={13} /> {houseCusp.sign} on this cusp</p>
          <p className="chart-house-row__sign-explain">{explainSignInHouse(houseCusp.sign, houseCusp.house)}</p>
          {full.question ? <p className="chart-house-row__question">{full.question}</p> : null}
        </div>
      )}
    </div>
  );
}

export function BoldParagraphs({ text }: { text: string }) {
  const paragraphs = text.trim().split(/\n{2,}/);
  return (<>{paragraphs.map((p, i) => { const parts = p.split(/\*\*(.+?)\*\*/g); return <p key={i} className="chart-profile-section__p">{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>; })}</>);
}

export function ProfileSection({ title, body }: { title: string; body: string }) {
  return (<div className="chart-profile-section"><p className="label-lock chart-profile-section__title">{title}</p><div className="chart-profile-section__body"><BoldParagraphs text={body} /></div></div>);
}

export function SectionHeading({ wordA, wordB, ariaLabel }: { wordA: string; wordB: string; ariaLabel: string }) {
  return (<h2 className="chart-section-heading" aria-label={ariaLabel}><span className="label-lock chart-section-heading__kicker">{wordA}</span><span className="clash chart-section-heading__title">{wordB}</span></h2>);
}

export function parseProfileSections(narrative: string): { title: string; body: string }[] {
  const matches = [...narrative.matchAll(/^##\s+(.+)$/gm)];
  if (matches.length === 0) return [{ title: "Your Personality Profile", body: narrative }];
  const sections: { title: string; body: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = (matches[i].index ?? 0) + matches[i][0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? narrative.length) : narrative.length;
    sections.push({ title: matches[i][1].trim(), body: narrative.slice(start, end).trim() });
  }
  return sections;
}

export function NumberRow({ numKey, value }: { numKey: string; value: number }) {
  return (<div className="tn-number"><span className="label-lock tn-number__label">{NUMEROLOGY_LABELS[numKey] ?? numKey}</span><span className="clash tn-number__value">{value}</span>{NUMEROLOGY_CALC_EXPLAIN[numKey] && <p className="tn-number__calc">{NUMEROLOGY_CALC_EXPLAIN[numKey]}</p>}</div>);
}

export function TrueNorthNav() {
  const location = useLocation();
  return (
    <nav className="tn-rail" aria-label="True North sections">
      {TRUE_NORTH_PAGES.map(p => {
        const active = p.path === "/chart" ? location.pathname === "/chart" : location.pathname.startsWith(p.path);
        return (<Link key={p.path} to={p.path} aria-current={active ? "true" : undefined} className={`tn-rail__item ${active ? "is-active" : ""}`}><span className="tn-rail__glyph" aria-hidden="true">{p.glyph}</span><span className="tn-rail__label">{p.label}</span></Link>);
      })}
    </nav>
  );
}

function TrueNorthSkyline({ sunSign }: { sunSign?: string }) {
  const moon = moonPhase();
  const hour = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (<p className="tn-skyline"><span>{hour}</span><span aria-hidden="true">·</span><span>{moon.glyph} {moon.name}</span>{sunSign && (<><span aria-hidden="true">·</span><span className="tn-skyline__sign"><TrueNorthSignIcon sign={sunSign} size={14} /> {sunSign} sun</span></>)}</p>);
}

export function TrueNorthHero({ sunSign }: { sunSign?: string }) {
  return (
    <header className="tn-hero">
      <div className="tn-hero__mast">
        <div className="tn-hero__copy">
          <span className="kicker-lock">The house reading</span>
          <h1 className="clash tn-hero__title" aria-label="True North">True North</h1>
          <p className="serif-quiet tn-hero__lede">{sunSign ? `The exact sky the second you were born — ${sunSign} sun, decoded in full.` : "The exact sky the second you were born, decoded in full."}</p>
          <TrueNorthSkyline sunSign={sunSign} />
        </div>
        {sunSign && (
          <div className="tn-hero__orb" aria-hidden="true">
            <span className="tn-hero__orb-glyph">
              <TrueNorthSignIcon sign={sunSign} size={36} />
            </span>
            <span className="tn-hero__orb-sign">{sunSign}</span>
          </div>
        )}
      </div>
      <TrueNorthNav />
    </header>
  );
}

const ZODIAC_RING = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"] as const;
const ZODIAC_LABELS = ["ARI", "TAU", "GEM", "CAN", "LEO", "VIR", "LIB", "SCO", "SAG", "CAP", "AQU", "PIS"] as const;

function LandingZodiacWheel() {
  return (
    <div className="tn-glass-wheel" aria-hidden="true">
      <div className="tn-glass-wheel__frame">
        <div className="tn-glass-wheel__meta">
          <span className="tn-glass-wheel__meta-label">Natal chart</span>
          <span className="tn-glass-wheel__meta-sub">Sample · precision snapshot</span>
        </div>
        <div className="tn-glass-wheel__compass">✦</div>
        <div className="tn-glass-wheel__ring">
          {ZODIAC_RING.map((g, idx) => {
            const angle = (idx / 12) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const r = 42;
            const x = 50 + r * Math.cos(rad);
            const y = 50 + r * Math.sin(rad);
            return (<span key={ZODIAC_LABELS[idx]} className="tn-glass-wheel__sign" style={{ left: `${x}%`, top: `${y}%` }}>{g}</span>);
          })}
          <div className="tn-glass-wheel__core"><span className="tn-glass-wheel__star">✦</span></div>
          <div className="tn-glass-wheel__orbit" />
          <div className="tn-glass-wheel__orbit tn-glass-wheel__orbit--inner" />
        </div>
      </div>
    </div>
  );
}

export function TrueNorthSignedOutTeaser({ pageTitleTag }: { pageTitleTag: React.ReactNode }) {
  return (
    <header className="tn-hero tn-hero--landing tn-hero--cosmic">
      <div className="tn-cosmic">
        <div className="tn-cosmic__copy">
          <h1 className="tn-cosmic__title" aria-label="True North">True<br />North</h1>
          <span className="tn-cosmic__pill">Astrology · Alignment · Purpose</span>
          <p className="tn-cosmic__lede">Your chart is not a prediction, it's a compass. Discover the wisdom written in your stars.</p>
          <div className="tn-cosmic__dots" aria-hidden="true"><span /><span /><span /><span /><span /></div>
        </div>
        <LandingZodiacWheel />
      </div>

      <div className="tn-cosmic__ctas">
        <Link to="/signup" className="tn-cosmic__cta tn-cosmic__cta--primary">Explore your chart <span aria-hidden="true">✦</span></Link>
        <Link to="/login" className="tn-cosmic__cta tn-cosmic__cta--ghost">View sample chart <span aria-hidden="true">→</span></Link>
      </div>

      <ul className="tn-cosmic__features">
        {TRUE_NORTH_FEATURES.map(f => (
          <li key={f.title} className="tn-cosmic__feature">
            <span className="tn-cosmic__feature-glyph" aria-hidden="true">{f.glyph}</span>
            <span className="tn-cosmic__feature-title">{f.title}</span>
            <span className="tn-cosmic__feature-body">{f.body}</span>
          </li>
        ))}
      </ul>

      <div className="tn-cosmic__bar">
        <span>Align with your stars. Live your True North.</span>
        <span className="tn-cosmic__bar-mid">True North</span>
        <span>Available exclusively at xixvi.shop</span>
      </div>

      <div className="tn-cosmic__hidden-slot" hidden>{pageTitleTag}</div>
      <TrueNorthNav />
    </header>
  );
}

export function HouseDressing() {
  return (
    <div className="tn-card tn-invite-card">
      <p className="label-lock">The house on a body</p>
      <p className="serif-quiet tn-invite-card__copy">{HOUSE_LINE} The clothes are made for one person. Same as this room.</p>
      <Link to="/shop" className="cta-pist" style={{ marginTop: "1rem", textAlign: "center" }}>Shop the house</Link>
    </div>
  );
}
