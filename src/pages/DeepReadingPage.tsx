import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { JournalSky } from "../components/journal/JournalSky";
import { CardArt } from "../components/journal/CardArt";
import { SubscriptionTierPicker } from "../components/SubscriptionTierPicker";
import { api, useAction, useQuery } from "../lib/backend";
import { DEEP_SPREAD, drawDeepSpread, type SpreadCard } from "../lib/ritual";

/**
 * The Long Read — the paywalled seven-card deep reading.
 *
 * States:
 *  1. Signed out                 → sign-in prompt
 *  2. Signed in, not subscribed  → trial/subscribe paywall card
 *  3. Signed in, subscribed, no draw yet → "Draw the Long Read" CTA
 *  4. Signed in, subscribed, drawn → the reading + a follow-up question box
 *
 * FIRST DRAFT — the seven position names/copy ("The Long Read") are a new
 * creative decision that hasn't been shown to Tre yet. Flag for review.
 */

export function DeepReadingPage() {
  const user = useQuery(api.auth.currentUser);
  const subscription = useQuery(api.subscription.status);
  const deepReadings = useQuery(api.deepReadings.mine);
  const startTrialAction = useAction(api.subscription.startTrial);
  const drawAction = useAction(api.deepReadings.draw);
  const questionCheckoutAction = useAction(api.readingQuestions.checkout);

  const [spread, setSpread] = useState<SpreadCard[] | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  // Asked fresh every time, right before drawing — not stored on the
  // profile, since what's going on changes visit to visit.
  const [situation, setSituation] = useState("");
  const [subscribingTier, setSubscribingTier] = useState<
    "long_read" | "long_read_plus_numerology" | null
  >(null);
  const [question, setQuestion] = useState("");
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestSaved = deepReadings?.[0];
  useEffect(() => {
    if (!reading && latestSaved) {
      setReading(latestSaved.reading);
      setSpread(latestSaved.spread);
    }
  }, [latestSaved, reading]);

  const entitled = subscription?.entitled === true;

  const startTrial = async (tier: "long_read" | "long_read_plus_numerology") => {
    setSubscribingTier(tier);
    setError(null);
    try {
      const result = await startTrialAction({
        tier,
        successUrl: `${window.location.origin}/journal/deep-reading`,
        cancelUrl: `${window.location.origin}/journal/deep-reading`,
      });
      if (result?.url) window.location.href = result.url;
      else setError(result?.error || "Couldn't start the trial — try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the trial.");
    } finally {
      setSubscribingTier(null);
    }
  };

  const drawTheLongRead = async () => {
    setDrawing(true);
    setError(null);
    try {
      const drawn = drawDeepSpread();
      setSpread(drawn);
      const result = await drawAction({
        spread: drawn.map(s => ({
          position: s.slotName,
          positionMeaning: s.slotQuestion,
          name: s.card.name,
          reversed: s.reversed,
          keywords: s.card.keywords,
          meaning: s.reversed ? s.card.reversed : s.card.upright,
        })),
        situation: situation.trim() || undefined,
      });
      if (result?.success) setReading(result.reading);
      else setError("The reading couldn't be written just now — try again in a moment.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setDrawing(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setAskingQuestion(true);
    setError(null);
    try {
      const result = await questionCheckoutAction({
        question: question.trim(),
        readingContext: { spread, reading },
        successUrl: `${window.location.origin}/journal/deep-reading`,
        cancelUrl: `${window.location.origin}/journal/deep-reading`,
      });
      if (result?.url) window.location.href = result.url;
      else setError(result?.error || "Couldn't start checkout — try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setAskingQuestion(false);
    }
  };

  const pageTitle = "The Long Read — XI · XVI Journal";

  if (!user) {
    return (
      <div className="journal-page">
        <JournalSky />
        <div className="journal-stack">
          <SEO title={pageTitle} />
          <div className="journal-surface journal-hero" style={{ textAlign: "center" }}>
            <p className="uppercase tracking-widest text-xs text-muted-foreground mb-2">The Long Read</p>
            <h1 className="text-3xl font-serif mb-3">{DEEP_SPREAD.name}</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in to unlock the in-depth reading built around what's actually going on with you.
            </p>
            <Link to="/login" className="underline">Sign in or create an account →</Link>
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
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-2">The Long Read</p>
          <h1 className="text-3xl font-serif mb-3">{DEEP_SPREAD.name}</h1>
          <p className="text-sm text-muted-foreground">{DEEP_SPREAD.intro}</p>
        </div>

        {error && (
          <div className="journal-surface" style={{ padding: "1rem 1.25rem" }}>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!entitled && (
          <div className="journal-surface" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <p className="text-sm text-muted-foreground">
              Seven cards read directly against what's actually going on for you right now — not the
              daily five, a genuinely deeper read, saved to your account. Pick the tier that's right
              for you — Numerology is only available bundled here, not on its own.
            </p>
            <SubscriptionTierPicker subscribingTier={subscribingTier} onStart={startTrial} highlight="long_read" />
          </div>
        )}

        {entitled && !reading && (
          <div className="journal-surface" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <label htmlFor="deep-situation" className="text-sm italic text-muted-foreground block">
              Before you draw — what's actually going on right now?
            </label>
            <textarea
              id="deep-situation"
              value={situation}
              onChange={e => setSituation(e.target.value)}
              rows={2}
              placeholder={'e.g. "trying to decide whether to leave my job"'}
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{ background: "rgba(255,255,255,.7)" }}
            />
            <button
              onClick={drawTheLongRead}
              disabled={drawing}
              style={{
                width: "100%", padding: "0.9rem", borderRadius: "12px", textAlign: "center",
                background: "linear-gradient(160deg, #1d2f4f, #101c33)", color: "#f3e9d2",
                border: "1px solid rgba(214,178,96,.6)", fontSize: "0.75rem", letterSpacing: "0.15em",
                textTransform: "uppercase", fontWeight: 600, opacity: drawing ? 0.6 : 1,
              }}
            >
              {drawing ? "Drawing…" : "Draw the Long Read ✦"}
            </button>
          </div>
        )}

        {entitled && reading && (
          <>
            <div className="journal-surface" style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "0.75rem" }}>
                {spread?.map(s => (
                  <div key={s.slot} style={{ textAlign: "center" }}>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{s.slotName}</p>
                    <CardArt card={s.card} reversed={s.reversed} />
                    <p className="text-xs font-medium mt-1">{s.card.name}{s.reversed ? " (rev.)" : ""}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="journal-surface" style={{ padding: "1.75rem" }}>
              <div className="prose prose-sm max-w-none whitespace-pre-line">
                {reading}
              </div>
            </div>

            <div className="journal-surface" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p className="text-sm font-medium">Ask a follow-up question — $2.99</p>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                rows={2}
                placeholder="What do you want to know more about?"
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ background: "rgba(255,255,255,.7)" }}
              />
              <button
                onClick={askQuestion}
                disabled={askingQuestion || !question.trim()}
                style={{
                  alignSelf: "flex-start", padding: "0.7rem 1.4rem", borderRadius: "10px",
                  border: "1px solid rgba(214,178,96,.6)", fontSize: "0.7rem", letterSpacing: "0.12em",
                  textTransform: "uppercase", fontWeight: 600,
                  background: "rgba(255,255,255,.72)", opacity: askingQuestion || !question.trim() ? 0.5 : 1,
                }}
              >
                {askingQuestion ? "Starting…" : "Ask — $2.99"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
