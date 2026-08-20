import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { JournalSky } from "../components/journal/JournalSky";
import { CardArt } from "../components/journal/CardArt";
import { SectionBoundary } from "../components/journal/SectionBoundary";
import { SubscriptionTierPicker, type SubscriptionTier } from "../components/SubscriptionTierPicker";
import { api, useAction, useQuery } from "../lib/backend";
import { DEEP_SPREAD, drawDeepSpread, type SpreadCard } from "../lib/ritual";

/**
 * The Long Read — paywalled seven-card deep reading, three times a day.
 *
 * Windows (local time):
 *   morning  00:00–11:59
 *   midday   12:00–16:59
 *   evening  17:00–23:59
 *
 * One independent 7-card reading per window per day (server-enforced).
 * Admins bypass quota and subscription checks.
 */

export type DailyWindow = "morning" | "midday" | "evening";

const WINDOWS: Array<{
  id: DailyWindow;
  label: string;
  hours: string;
  blurb: string;
}> = [
  {
    id: "morning",
    label: "Morning",
    hours: "12:00 AM – 11:59 AM",
    blurb: "Orient the day — where this actually started and what's already in motion.",
  },
  {
    id: "midday",
    label: "Midday",
    hours: "12:00 PM – 4:59 PM",
    blurb: "Align mid-course — the choice in front of you and what you're not seeing yet.",
  },
  {
    id: "evening",
    label: "Evening",
    hours: "5:00 PM – 11:59 PM",
    blurb: "Integrate the day — where this goes if nothing changes, and where your power is.",
  },
];

function activeDailyWindow(now = new Date()): DailyWindow {
  const h = now.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "midday";
  return "evening";
}

function windowIndex(id: DailyWindow): number {
  return WINDOWS.findIndex(w => w.id === id);
}

function isSameLocalDay(iso: string, now = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

type WindowState = "locked" | "open" | "done";

interface SavedDeepReading {
  id?: string;
  reading?: string;
  spread?: SpreadCard[];
  window?: string | null;
  created_at?: string;
  createdAt?: string;
}

export function DeepReadingPage() {
  const user = useQuery(api.auth.currentUser);
  const subscription = useQuery(api.subscription.status);
  const deepReadings = useQuery(api.deepReadings.mine) as SavedDeepReading[] | undefined;
  const startTrialAction = useAction(api.subscription.startTrial);
  const drawAction = useAction(api.deepReadings.draw);
  const questionCheckoutAction = useAction(api.readingQuestions.checkout);

  const [now] = useState(() => new Date());
  const active = useMemo(() => activeDailyWindow(now), [now]);
  const [selectedWindow, setSelectedWindow] = useState<DailyWindow>(active);

  // Per-window local draft state so switching tabs doesn't wipe situation text
  // or a just-drawn reading that hasn't been reconciled from the query yet.
  const [situations, setSituations] = useState<Record<DailyWindow, string>>({
    morning: "",
    midday: "",
    evening: "",
  });
  const [localByWindow, setLocalByWindow] = useState<
    Partial<Record<DailyWindow, { spread: SpreadCard[]; reading: string }>>
  >({});
  const [drawing, setDrawing] = useState(false);
  const [subscribingTier, setSubscribingTier] = useState<SubscriptionTier | null>(null);
  const [question, setQuestion] = useState("");
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entitled = subscription?.entitled === true;
  const isAdmin = subscription?.isAdmin === true;

  // Today's saved readings keyed by window (server may use snake_case created_at).
  const todayByWindow = useMemo(() => {
    const map: Partial<Record<DailyWindow, SavedDeepReading>> = {};
    if (!deepReadings) return map;
    for (const row of deepReadings) {
      const w = (row.window ?? "") as DailyWindow;
      if (w !== "morning" && w !== "midday" && w !== "evening") continue;
      const created = row.created_at ?? row.createdAt;
      if (!created || !isSameLocalDay(created, now)) continue;
      // First match wins — list is ordered newest first.
      if (!map[w]) map[w] = row;
    }
    return map;
  }, [deepReadings, now]);

  // Prefer freshly drawn local state, else today's saved row for the selected window.
  const selectedSaved = todayByWindow[selectedWindow];
  const selectedLocal = localByWindow[selectedWindow];
  const displaySpread = selectedLocal?.spread ?? selectedSaved?.spread ?? null;
  const displayReading = selectedLocal?.reading ?? selectedSaved?.reading ?? null;
  const hasReading = Boolean(displayReading && displaySpread);

  const stateFor = (id: DailyWindow): WindowState => {
    if (todayByWindow[id] || localByWindow[id]) return "done";
    if (isAdmin) return "open";
    if (windowIndex(id) > windowIndex(active)) return "locked";
    // Current and earlier windows that weren't drawn stay open so the reader
    // can still take a missed midday in the evening, etc. Server enforces
    // one-per-window; time-gating only locks *future* slots.
    return "open";
  };

  const selectedState = stateFor(selectedWindow);
  const selectedMeta = WINDOWS.find(w => w.id === selectedWindow)!;

  const startTrial = async (tier: SubscriptionTier) => {
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
    if (selectedState === "locked") return;
    if (hasReading && !isAdmin) return;
    setDrawing(true);
    setError(null);
    try {
      const drawn = drawDeepSpread();
      const result = await drawAction({
        spread: drawn,
        situation: situations[selectedWindow].trim() || undefined,
        window: selectedWindow,
      });
      if (result?.success && result.reading) {
        setLocalByWindow(prev => ({
          ...prev,
          [selectedWindow]: { spread: drawn, reading: result.reading as string },
        }));
      } else {
        setError(
          (result as { error?: string })?.error ||
            "The reading couldn't be written just now — try again in a moment.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setDrawing(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim() || !displayReading) return;
    setAskingQuestion(true);
    setError(null);
    try {
      const result = await questionCheckoutAction({
        question: question.trim(),
        readingContext: {
          spread: displaySpread,
          reading: displayReading,
          window: selectedWindow,
        },
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

  // Clear follow-up draft when switching windows.
  useEffect(() => {
    setQuestion("");
    setError(null);
  }, [selectedWindow]);

  const pageTitle = "The Long Read — XI · XVI Journal";

  const tabStyle = (id: DailyWindow): React.CSSProperties => {
    const state = stateFor(id);
    const selected = id === selectedWindow;
    const base: React.CSSProperties = {
      flex: 1,
      padding: "0.75rem 0.5rem",
      borderRadius: "10px",
      textAlign: "center",
      border: selected
        ? "1px solid rgba(214,178,96,.7)"
        : "1px solid rgba(0,0,0,0.08)",
      background: selected
        ? "linear-gradient(160deg, rgba(29,47,79,.08), rgba(16,28,51,.04))"
        : "rgba(255,255,255,.55)",
      cursor: "pointer",
      opacity: state === "locked" ? 0.55 : 1,
    };
    return base;
  };

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
              Sign in to unlock three in-depth readings a day — morning, midday, and evening —
              built around what's actually going on with you.
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
          <p className="text-xs text-muted-foreground mt-3">
            Three readings a day — Morning, Midday, Evening. One draw per window.
          </p>
        </div>

        {error && (
          <div className="journal-surface" style={{ padding: "1rem 1.25rem" }}>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!entitled && (
          <div className="journal-surface" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <p className="text-sm text-muted-foreground">
              Seven cards, three times a day, read directly against what's actually going on for you —
              not the daily five, a genuinely deeper read, saved to your account. 7 days free, then $7/week.
            </p>
            <SubscriptionTierPicker subscribingTier={subscribingTier} onStart={startTrial} />
          </div>
        )}

        {entitled && (
          <>
            {/* Window tabs */}
            <div
              className="journal-surface"
              style={{ padding: "0.75rem", display: "flex", gap: "0.5rem" }}
              role="tablist"
              aria-label="Daily Long Read windows"
            >
              {WINDOWS.map(w => {
                const state = stateFor(w.id);
                const isActiveWindow = w.id === active;
                return (
                  <button
                    key={w.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedWindow === w.id}
                    onClick={() => setSelectedWindow(w.id)}
                    style={tabStyle(w.id)}
                  >
                    <p className="text-sm font-semibold" style={{ margin: 0 }}>
                      {w.label}
                      {isActiveWindow ? " · now" : ""}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground" style={{ margin: "0.2rem 0 0" }}>
                      {state === "done" ? "Drawn" : state === "locked" ? "Later" : "Open"}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected window body */}
            <div className="journal-surface" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <p className="text-sm font-semibold">{selectedMeta.label} · {selectedMeta.hours}</p>
                <p className="text-sm text-muted-foreground">{selectedMeta.blurb}</p>
              </div>

              {selectedState === "locked" && (
                <p className="text-sm text-muted-foreground">
                  This window opens later today. You can still review Morning or Midday once you've drawn them.
                </p>
              )}

              {selectedState === "open" && !hasReading && (
                <>
                  <label htmlFor="deep-situation" className="text-sm italic text-muted-foreground block">
                    Before you draw — what's actually going on right now?
                  </label>
                  <textarea
                    id="deep-situation"
                    value={situations[selectedWindow]}
                    onChange={e =>
                      setSituations(prev => ({ ...prev, [selectedWindow]: e.target.value }))
                    }
                    rows={2}
                    placeholder={'e.g. "trying to decide whether to leave my job"'}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{ background: "rgba(255,255,255,.7)" }}
                  />
                  <button
                    onClick={drawTheLongRead}
                    disabled={drawing}
                    style={{
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
                      opacity: drawing ? 0.6 : 1,
                    }}
                  >
                    {drawing ? "Drawing…" : `Draw the ${selectedMeta.label} Long Read ✦`}
                  </button>
                </>
              )}

              {hasReading && (
                <>
                  <SectionBoundary fallbackLabel="Couldn't display your cards just now — the reading below is still yours.">
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
                        gap: "0.75rem",
                      }}
                    >
                      {displaySpread?.map(s => (
                        <div key={s.slot} style={{ textAlign: "center" }}>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                            {s.slotName}
                          </p>
                          <CardArt card={s.card} reversed={s.reversed} />
                          <p className="text-xs font-medium mt-1">
                            {s.card.name}{s.reversed ? " (rev.)" : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </SectionBoundary>

                  <SectionBoundary fallbackLabel="Couldn't display the reading text just now — it's saved to your account either way.">
                    <div className="prose prose-sm max-w-none whitespace-pre-line">
                      {displayReading}
                    </div>
                  </SectionBoundary>

                  {isAdmin && selectedState === "done" && (
                    <button
                      type="button"
                      onClick={drawTheLongRead}
                      disabled={drawing}
                      style={{
                        alignSelf: "flex-start",
                        padding: "0.55rem 1rem",
                        borderRadius: "8px",
                        border: "1px dashed rgba(214,178,96,.5)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        opacity: drawing ? 0.6 : 0.85,
                      }}
                    >
                      {drawing ? "Drawing…" : "Admin · redraw this window"}
                    </button>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
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
                        alignSelf: "flex-start",
                        padding: "0.7rem 1.4rem",
                        borderRadius: "10px",
                        border: "1px solid rgba(214,178,96,.6)",
                        fontSize: "0.7rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        background: "rgba(255,255,255,.72)",
                        opacity: askingQuestion || !question.trim() ? 0.5 : 1,
                      }}
                    >
                      {askingQuestion ? "Starting…" : "Ask — $2.99"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
