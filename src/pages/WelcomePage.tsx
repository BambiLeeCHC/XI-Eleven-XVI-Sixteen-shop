import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { JournalSky } from "../components/journal/JournalSky";
import { api, useQuery } from "../lib/backend";

/**
 * The Welcome page — where the confirmation-email link lands.
 *
 * Flow: register → "check your email" → click the link in the email →
 * Supabase confirms the account and signs the browser in → lands here.
 *
 * Collage-style personalized heading (name + sun sign, once the chart
 * resolves), a plain-language rundown of what's free vs. paywalled, and a
 * playful "loading the sky" animation while the natal chart computes (a
 * few hundred ms to a couple seconds — long enough to want *something*
 * on screen instead of a blank beat).
 */

const LOADING_LINES = [
  "Locating the sky the moment you were born…",
  "Placing the planets…",
  "Finding your rising sign…",
  "Reading the houses…",
  "Almost there…",
];

const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const TITLE_PAPERS = ["gold", "ink", "kraft"] as const;
const TITLE_FACES = ["display", "grotesk", "slab"] as const;
const TITLE_ROT = [-2, 1.5, -1.5, 2];

function CollageWords({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <h1 className="journal-article__title--collage" aria-label={text} style={{ marginBottom: "0.75rem" }}>
      {words.map((w, i) => (
        <span
          key={i}
          className={`jcol-tag jcol-${TITLE_PAPERS[i % TITLE_PAPERS.length]} jcol-${TITLE_FACES[i % TITLE_FACES.length]}`}
          style={{ transform: `rotate(${TITLE_ROT[i % TITLE_ROT.length]}deg)` }}
        >
          {w}
        </span>
      ))}
    </h1>
  );
}

function ChartLoadingFlash() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % LOADING_LINES.length), 1300);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="welcome-loading" role="status" aria-live="polite">
      <span className="welcome-loading__orbit" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <p className="welcome-loading__line">{LOADING_LINES[i]}</p>
    </div>
  );
}

export function WelcomePage() {
  const user = useQuery(api.auth.currentUser);
  const [settling, setSettling] = useState(true);

  // Right after clicking the confirmation link, Supabase needs a brief
  // moment to exchange the URL token for a session before `currentUser`
  // resolves. Give it a couple seconds before falling back to a sign-in
  // prompt, instead of flashing "please sign in" first.
  useEffect(() => {
    const t = setTimeout(() => setSettling(false), 2500);
    return () => clearTimeout(t);
  }, []);
  const chartResult = useQuery<{ success: boolean; chart?: { placements: { body: string; sign: string }[] } }>(
    api.natalChart.get,
    user ? {} : "skip",
  );

  const loading = !!user && chartResult === undefined;
  const chart = chartResult?.success ? chartResult.chart : null;
  const sunSign = chart?.placements?.find((p) => p.body === "Sun")?.sign;
  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  if (!user && !settling) {
    return (
      <div className="journal-page">
        <JournalSky />
        <SEO title="Welcome" url="/welcome" noindex />
        <div className="journal-stack" style={{ maxWidth: "32rem" }}>
          <div className="journal-surface journal-hero" style={{ textAlign: "center" }}>
            <p className="text-sm text-muted-foreground mb-4">
              That confirmation link didn't sign you in — it may have expired.
            </p>
            <Link to="/login">
              <button
                style={{
                  padding: "0.9rem 1.5rem", borderRadius: "12px",
                  background: "linear-gradient(160deg, #1d2f4f, #101c33)",
                  color: "#f3e9d2", border: "1px solid rgba(214,178,96,.6)",
                  fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600,
                }}
              >
                Sign in →
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-page">
      <JournalSky />
      <SEO title="Welcome" url="/welcome" noindex />
      <div className="journal-stack" style={{ maxWidth: "42rem" }}>
        <div className="journal-surface journal-hero" style={{ textAlign: "center", position: "relative" }}>
          <span className="jcol-patch jcol-patch--a" aria-hidden="true" />
          <span className="jcol-tape jcol-tape--tl" aria-hidden="true" />
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3">
            Account confirmed
          </p>
          <CollageWords text={`Welcome, ${firstName}`} />

          {sunSign && (
            <p className="text-sm text-muted-foreground mt-1">
              {SIGN_GLYPH[sunSign] ?? ""} You're a <span className="font-semibold">{sunSign}</span> sun —
              your full chart is ready below.
            </p>
          )}
          {loading && (
            <p className="text-sm text-muted-foreground mt-1">
              Your account is live. Calculating your natal chart now.
            </p>
          )}
        </div>

        {loading && (
          <div className="journal-surface" style={{ padding: "2rem 1.5rem" }}>
            <ChartLoadingFlash />
          </div>
        )}

        {!loading && (
          <div className="journal-surface" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p className="text-sm font-semibold">The house — and this room</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div className="welcome-line">
                <span className="jcol-tag jcol-tag--sm jcol-ink jcol-type">With account</span>
                <span className="text-sm text-muted-foreground">
                  Your natal chart, in full — every placement, house and sign. Already calculated.
                </span>
              </div>
              <div className="welcome-line">
                <span className="jcol-tag jcol-tag--sm jcol-gold jcol-type">Daily</span>
                <span className="text-sm text-muted-foreground">
                  The Journal's five-card draw — one spread a day, on the house.
                </span>
              </div>
              <div className="welcome-line">
                <span className="jcol-tag jcol-tag--sm jcol-kraft jcol-type">$7/week</span>
                <span className="text-sm text-muted-foreground">
                  The Long Read — seven cards, three windows a day, written against what's
                  actually going on. Seven days to try it, then it bills. Cancel anytime.
                </span>
              </div>
              <div className="welcome-line">
                <span className="jcol-tag jcol-tag--sm jcol-ink jcol-type">$19.99</span>
                <span className="text-sm text-muted-foreground">
                  Numerology, once. Follow-up questions on a reading are $2.99 each.
                </span>
              </div>
            </div>

            <Link to="/chart/long-read" className="cta-pist" style={{ textAlign: "center" }}>
              Get the Long Read — $7/week
            </Link>
            <Link to="/chart" className="cta-ghost" style={{ textAlign: "center", color: "#0B0B0C", borderColor: "#0B0B0C" }}>
              Open your natal chart
            </Link>
            <Link to="/shop" className="tn-inline" style={{ textAlign: "center" }}>
              Shop the house →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
