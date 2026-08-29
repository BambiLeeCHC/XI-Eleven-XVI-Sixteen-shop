import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { CardArt } from "../components/journal/CardArt";
import { SectionBoundary } from "../components/journal/SectionBoundary";
import { SubscriptionTierPicker, type SubscriptionTier } from "../components/SubscriptionTierPicker";
import { api, useAction, useAuthStatus, useQuery } from "../lib/backend";
import { DEEP_SPREAD, drawDeepSpread, type SpreadCard } from "../lib/ritual";
import {
  BoldParagraphs,
  SectionHeading,
  TrueNorthHero,
  useSunSign,
} from "./chart/shared";

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
    blurb: "Orient the day — what's already solid under you and what's working in your favor.",
  },
  {
    id: "midday",
    label: "Midday",
    hours: "12:00 PM – 4:59 PM",
    blurb: "Align mid-course — the best move available and the gift you haven't fully claimed yet.",
  },
  {
    id: "evening",
    label: "Evening",
    hours: "5:00 PM – 11:59 PM",
    blurb: "Integrate the day — the best-case path from here and where your real advantage sits.",
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

const LONG_READ_ORIGIN = "/chart/long-read";

const lockCardStyle: CSSProperties = {
  padding: "1.5rem 1.6rem",
  background: "#F4EFE6",
  color: "#0B0B0C",
  boxShadow: "6px 6px 0 #E4D4F4",
};

function fallbackReading(spread: SpreadCard[], situation: string) {
  const sit = situation || "what you are carrying today";
  const cards = spread
    .map(s => {
      const meaning = s.reversed ? s.card.reversed : s.card.upright;
      return `In the ${s.slotName} of this, **${s.card.name}**${s.reversed ? " (reversed)" : ""} speaks to ${sit}. ${meaning}`;
    })
    .join("\n\n");
  return `The Long Read opens on ${sit}.\n\n${cards}\n\nThe throughline is already in your favor. Take one concrete step tonight that matches the Best Move card.`;
}

export default function DeepReadingPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuthStatus();
  const user = useQuery(
    api.auth.currentUser,
    authLoading || !isAuthenticated ? "skip" : {},
  );
  const sunSign = useSunSign(user);
  const subscription = useQuery(
    api.subscription.status,
    authLoading || !isAuthenticated ? "skip" : {},
  );
  const deepReadings = useQuery(
    api.deepReadings.mine,
    authLoading || !isAuthenticated ? "skip" : {},
  ) as SavedDeepReading[] | undefined;
  const adminFlag = useQuery(
    api.users.isAdmin,
    authLoading || !isAuthenticated ? "skip" : {},
  );
  const startTrialAction = useAction(api.subscription.startTrial);
  const drawAction = useAction(api.deepReadings.draw);
  const questionCheckoutAction = useAction(api.readingQuestions.checkout);

  const [now] = useState(() => new Date());
  const active = useMemo(() => activeDailyWindow(now), [now]);
  const [selectedWindow, setSelectedWindow] = useState<DailyWindow>(active);
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

  const isAdmin =
    adminFlag === true ||
    subscription?.isAdmin === true ||
    user?.role === "admin";

  const todayByWindow = useMemo(() => {
    const map: Partial<Record<DailyWindow, SavedDeepReading>> = {};
    if (!deepReadings) return map;
    for (const row of deepReadings) {
      const w = (row.window ?? "") as DailyWindow;
      if (w !== "morning" && w !== "midday" && w !== "evening") continue;
      const created = row.created_at ?? row.createdAt;
      if (!created || !isSameLocalDay(created, now)) continue;
      if (!map[w]) map[w] = row;
    }
    return map;
  }, [deepReadings, now]);

  const selectedSaved = todayByWindow[selectedWindow];
  const selectedLocal = localByWindow[selectedWindow];
  const displaySpread = selectedLocal?.spread ?? selectedSaved?.spread ?? null;
  const displayReading = selectedLocal?.reading ?? selectedSaved?.reading ?? null;
  const hasReading = Boolean(displayReading && displaySpread);

  const stateFor = (id: DailyWindow): WindowState => {
    if (todayByWindow[id] || localByWindow[id]) return "done";
    if (isAdmin) return "open";
    if (windowIndex(id) > windowIndex(active)) return "locked";
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
        successUrl: `${window.location.origin}${LONG_READ_ORIGIN}`,
        cancelUrl: `${window.location.origin}${LONG_READ_ORIGIN}`,
      });
      if (result?.url) window.location.href = result.url;
      else setError(result?.error || "Couldn't start the trial — try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the trial.");
    } finally {
      setSubscribingTier(null);
    }
  };

  const keepLocal = (spread: SpreadCard[], situation: string) => {
    setLocalByWindow(prev => ({
      ...prev,
      [selectedWindow]: { spread, reading: fallbackReading(spread, situation) },
    }));
  };

  const drawTheLongRead = async () => {
    if (selectedState === "locked") return;
    if (hasReading && !isAdmin) return;
    setDrawing(true);
    setError(null);
    const drawn = drawDeepSpread();
    const situationText = situations[selectedWindow].trim();

    if (!isAuthenticated) {
      keepLocal(drawn, situationText);
      setDrawing(false);
      return;
    }

    try {
      const result = await drawAction({
        spread: drawn,
        situation: situationText || undefined,
        window: selectedWindow,
      });
      if (result?.success && result.reading) {
        setLocalByWindow(prev => ({
          ...prev,
          [selectedWindow]: { spread: drawn, reading: result.reading as string },
        }));
      } else {
        keepLocal(drawn, situationText);
      }
    } catch {
      keepLocal(drawn, situationText);
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
        successUrl: `${window.location.origin}${LONG_READ_ORIGIN}`,
        cancelUrl: `${window.location.origin}${LONG_READ_ORIGIN}`,
      });
      if (result?.url) window.location.href = result.url;
      else setError(result?.error || "Couldn't start checkout — try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setAskingQuestion(false);
    }
  };

  useEffect(() => {
    setQuestion("");
    setError(null);
  }, [selectedWindow]);

  const pageTitle = "True North — The Long Read — XI · XVI";

  const tabClass = (id: DailyWindow) => {
    const state = stateFor(id);
    const selected = id === selectedWindow;
    return `chip ${selected ? "on" : ""} ${state === "locked" ? "opacity-50" : ""}`;
  };

  if (authLoading) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack long-read-stack" style={{ maxWidth: "44rem", width: "100%" }}>
          <SEO title={pageTitle} />
          <TrueNorthHero sunSign={sunSign} />
          <p className="serif-quiet text-xl" style={{ color: "#F4EFE6" }}>
            Opening your Long Read…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack long-read-stack" style={{ maxWidth: "44rem", width: "100%" }}>
        <SEO title={pageTitle} />
        <TrueNorthHero sunSign={sunSign} />
        <SectionHeading wordA="The" wordB="Long Read" ariaLabel="The Long Read" />
        <div className="long-read-lock-card" style={lockCardStyle}>
          <p className="serif-quiet text-lg" style={{ margin: 0, color: "#142010" }}>
            {DEEP_SPREAD.intro} Three independent draws a day — Morning, Midday, Evening.
          </p>
        </div>
        {error && (
          <div className="long-read-lock-card" style={{ ...lockCardStyle, boxShadow: "6px 6px 0 #F4C4B0" }}>
            <p className="text-sm" style={{ color: "#8E1D2C", margin: 0 }}>{error}</p>
          </div>
        )}
        {!isAuthenticated && (
          <p className="serif-quiet" style={{ color: "#F4EFE6", margin: 0 }}>
            Draw now. <Link to="/signin" style={{ textDecoration: "underline", color: "#D8F0C4" }}>Sign in</Link> to save the reading to your account.
          </p>
        )}
        <div className="chart-feed">
          <div className="lock-sub long-read-windows" role="tablist" aria-label="Daily Long Read windows">
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
                  className={tabClass(w.id)}
                >
                  {w.label}
                  {isActiveWindow ? " · now" : ""}
                  {state === "done" ? " · drawn" : state === "locked" ? " · later" : ""}
                </button>
              );
            })}
          </div>
          <div className="long-read-lock-card long-read-panel" style={{ ...lockCardStyle, padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.95rem", position: "relative" }}>
            <div className="long-read-panel__header">
              <p className="label-lock" style={{ color: "#142010" }}>{selectedMeta.hours}</p>
              <h2 className="clash" style={{ fontSize: "clamp(36px, 6vw, 56px)", color: "#0B0B0C", margin: "0.35rem 0 0" }}>{selectedMeta.label}</h2>
              <p className="serif-quiet text-xl" style={{ marginTop: "0.45rem", color: "#142010" }}>{selectedMeta.blurb}</p>
            </div>
            {selectedState === "locked" && (
              <p className="serif-quiet" style={{ color: "#142010" }}>
                This window opens later today. You can still review Morning or Midday once you've drawn them.
              </p>
            )}
            {selectedState === "open" && !hasReading && (
              <>
                <label htmlFor="deep-situation" className="label-lock" style={{ color: "#142010" }}>
                  Before you draw — what's actually going on right now?
                </label>
                <textarea
                  id="deep-situation"
                  value={situations[selectedWindow]}
                  onChange={e => setSituations(prev => ({ ...prev, [selectedWindow]: e.target.value }))}
                  rows={2}
                  placeholder={'e.g. "trying to decide whether to leave my job"'}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={{ background: "rgba(255,255,255,.72)", color: "#0B0B0C" }}
                />
                <button type="button" onClick={drawTheLongRead} disabled={drawing} className="cta-pist" style={{ opacity: drawing ? 0.6 : 1, width: "100%", cursor: "pointer" }}>
                  {drawing ? "Drawing…" : `Draw the ${selectedMeta.label} Long Read ✦`}
                </button>
              </>
            )}
            {hasReading && (
              <>
                <SectionBoundary fallbackLabel="Couldn't display your cards just now — the reading below is still yours.">
                  <div className="long-read-spread">
                    {displaySpread?.map(s => (
                      <div key={s.slot} className="long-read-card">
                        <p className="long-read-slot-label label-lock" style={{ color: "#142010" }}>{s.slotName}</p>
                        <CardArt card={s.card} reversed={s.reversed} />
                        <p className="long-read-card-name text-xs font-medium mt-1">
                          {s.card.name}{s.reversed ? " (rev.)" : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionBoundary>
                <SectionBoundary fallbackLabel="Couldn't display the reading text just now — it's saved to your account either way.">
                  <div className="chart-profile-sections" style={{ position: "relative", zIndex: 2, isolation: "isolate" }}>
                    <div className="chart-profile-section">
                      <p className="label-lock" style={{ color: "#142010" }}>Your reading</p>
                      <div className="chart-profile-section__body" style={{ marginTop: "0.85rem" }}>
                        <BoldParagraphs text={displayReading || ""} />
                      </div>
                    </div>
                  </div>
                </SectionBoundary>
                {isAdmin && selectedState === "done" && (
                  <button type="button" onClick={drawTheLongRead} disabled={drawing} className="cta-ghost" style={{ alignSelf: "flex-start", opacity: drawing ? 0.6 : 0.9, cursor: "pointer" }}>
                    {drawing ? "Drawing…" : "Admin · redraw this window"}
                  </button>
                )}
                {isAuthenticated && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.35rem", paddingTop: "1rem", borderTop: "1px solid rgba(11,11,12,0.12)" }}>
                    <p className="label-lock" style={{ color: "#142010", margin: 0 }}>Ask a follow-up — $2.99</p>
                    <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={2} placeholder="What do you want to know more about?" className="w-full rounded-md border px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,.72)", color: "#0B0B0C" }} />
                    <button type="button" onClick={askQuestion} disabled={askingQuestion || !question.trim()} className="cta-pist" style={{ alignSelf: "flex-start", opacity: askingQuestion || !question.trim() ? 0.5 : 1, cursor: askingQuestion || !question.trim() ? "default" : "pointer" }}>
                      {askingQuestion ? "Starting…" : "Ask — $2.99"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <p className="serif-quiet" style={{ textAlign: "center", marginTop: "0.5rem", color: "#F4EFE6" }}>
          Prefer the free five-card draw?{" "}
          <Link to="/journal" style={{ textDecoration: "underline", color: "#D8F0C4" }}>Open The Journal →</Link>
        </p>
      </div>
    </div>
  );
}
