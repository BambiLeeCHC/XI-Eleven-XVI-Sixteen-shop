import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
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
  const [subscribing, setSubscribing] = useState(false);
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

  const startTrial = async () => {
    setSubscribing(true);
    setError(null);
    try {
      const result = await startTrialAction({
        successUrl: `${window.location.origin}/journal/deep-reading`,
        cancelUrl: `${window.location.origin}/journal/deep-reading`,
      });
      if (result?.url) window.location.href = result.url;
      else setError(result?.error || "Couldn't start the trial — try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the trial.");
    } finally {
      setSubscribing(false);
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
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <SEO title={pageTitle} />
        <h1 className="text-2xl font-serif mb-4">The Long Read</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to unlock the in-depth reading built around what's actually going on with you.
        </p>
        <Link to="/login" className="underline">Sign in or create an account →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <SEO title={pageTitle} />
      <p className="uppercase tracking-widest text-xs text-muted-foreground mb-2">The Long Read</p>
      <h1 className="text-3xl font-serif mb-3">{DEEP_SPREAD.name}</h1>
      <p className="text-sm text-muted-foreground mb-8">{DEEP_SPREAD.intro}</p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!entitled && (
        <div className="border rounded-lg p-6 space-y-3">
          <p className="text-sm">
            <span className="font-semibold">7 days free</span>, then <span className="font-semibold">$7/week</span>.
            Cancel anytime.
          </p>
          <p className="text-sm text-muted-foreground">
            Seven cards read directly against what you told us at sign-up — not the daily five, a
            genuinely deeper read, saved to your account.
          </p>
          <button
            onClick={startTrial}
            disabled={subscribing}
            className="w-full rounded-md bg-foreground text-background py-3 text-sm font-medium disabled:opacity-50"
          >
            {subscribing ? "Starting…" : "Start your 7-day free trial"}
          </button>
        </div>
      )}

      {entitled && !reading && (
        <div className="border rounded-lg p-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Drawn fresh, read against what you told us: <span className="italic">"{user.situation || "not specified"}"</span>
          </p>
          <button
            onClick={drawTheLongRead}
            disabled={drawing}
            className="w-full rounded-md bg-foreground text-background py-3 text-sm font-medium disabled:opacity-50"
          >
            {drawing ? "Drawing…" : "Draw the Long Read"}
          </button>
        </div>
      )}

      {entitled && reading && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {spread?.map(s => (
              <div key={s.slot} className="border rounded p-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.slotName}</p>
                <p className="text-xs font-medium">{s.card.name}{s.reversed ? " (rev.)" : ""}</p>
              </div>
            ))}
          </div>

          <div className="prose prose-sm max-w-none whitespace-pre-line">
            {reading}
          </div>

          <div className="border-t pt-6 space-y-3">
            <p className="text-sm font-medium">Ask a follow-up question — $2.99</p>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              rows={2}
              placeholder="What do you want to know more about?"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <button
              onClick={askQuestion}
              disabled={askingQuestion || !question.trim()}
              className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {askingQuestion ? "Starting…" : "Ask — $2.99"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
