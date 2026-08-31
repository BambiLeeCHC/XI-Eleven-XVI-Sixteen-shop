import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { CardArt } from "../components/journal/CardArt";
import { SectionBoundary } from "../components/journal/SectionBoundary";
import { SubscriptionTierPicker, type SubscriptionTier } from "../components/SubscriptionTierPicker";
import { api, useAction, useAuthStatus, useQuery } from "../lib/backend";
import { DEEP_SPREAD, drawDeepSpread, type SpreadCard } from "../lib/ritual";
import { PAGE_SEO } from "../data/seoMeta";
import {
  BoldParagraphs,
  SectionHeading,
  TrueNorthHero,
  TrueNorthSignedOutTeaser,
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

function isPaywallError(message: string) {
  return /subscription/i.test(message) || /sign in/i.test(message) || /402/.test(message);
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
  const [blockedByApi, setBlockedByApi] = useState(false);

  const isAdmin =
    adminFlag === true ||
    subscription?.isAdmin === true ||
    user?.role === "admin";
  const entitled =
    !blockedByApi &&
    (isAdmin ||
      subscription?.entitled === true ||
      subscription?.status === "active" ||
      subscription?.status === "trialing");
  const entitlementLoading = isAuthenticated && !isAdmin && subscription === undefined;

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
    if (!entitled || selectedState === "locked") return;
    if (hasReading && !isAdmin) return;
    setDrawing(true);
    setError(null);
    const drawn = drawDeepSpread();
    const situationText = situations[selectedWindow].trim();
    try {
      const result = await drawAction({
        spread: drawn,
        situation: situationText || undefined,
        window: selectedWindow,
      });
      if (result?.success && result.reading) {
        setBlockedByApi(false);
        setLocalByWindow(prev => ({
          ...prev,
          [selectedWindow]: { spread: drawn, reading: result.reading as string },
        }));
      } else {
        const message = (result as { error?: string })?.error || "";
        if (isPaywallError(message)) {
          setBlockedByApi(true);
          setError(message || "An active subscription is required for the Long Read.");
        } else {
          keepLocal(drawn, situationText);
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      if (isPaywallError(message)) {
        setBlockedByApi(true);
        setError(message);
      } else {
        keepLocal(drawn, situationText);
      }
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

  const pageTitle = PAGE_SEO.longRead.title;
  const pageDescription = PAGE_SEO.longRead.description;
  const pageUrl = "/chart/long-read";

  const tabClass = (id: DailyWindow) => {
    const state = stateFor(id);
    const selected = id === selectedWindow;
    const isNow = id === active;
    return `tn-window${selected ? " is-active" : ""}${state === "locked" ? " is-locked" : ""}${state === "done" ? " is-done" : ""}${isNow ? " is-now" : ""}`;
  };

  if (authLoading || entitlementLoading) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack long-read-stack tn-shell">
          <SEO title={pageTitle} description={pageDescription} url={pageUrl} />
          <TrueNorthHero sunSign={sunSign} />
          <p className="serif-quiet tn-opening">
            Opening your Long Read…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack long-read-stack tn-shell">
          <SEO title={pageTitle} description={pageDescription} url={pageUrl} />
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="tn-card tn-invite-card">
                <p className="label-lock">The Long Read</p>
                <p className="serif-quiet tn-invite-card__copy">
                  Seven cards, three times a day — morning, midday, evening — read against what's
                  actually going on with you. 7-day free trial, then $7/week.
                </p>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack long-read-stack tn-shell">
        <SEO title={pageTitle} description={pageDescription} url={pageUrl} />
        <TrueNorthHero sunSign={sunSign} />
        <SectionHeading wordA="The" wordB="Long Read" ariaLabel="The Long Read" />
        <div className="tn-card tn-lede-card">
          <p className="serif-quiet tn-lede">
            {DEEP_SPREAD.intro} Three independent draws a day — Morning, Midday, Evening.
          </p>
        </div>
        {error && (
          <div className="tn-card tn-card--alert">
            <p className="tn-alert">{error}</p>
          </div>
        )}
        {!entitled && (
          <div className="tn-card tn-paywall">
            <p className="label-lock">Unlock the Long Read</p>
            <h2 className="clash tn-paywall__title">Seven cards. Three windows.</h2>
            <p className="serif-quiet tn-lede">
              Read directly against what's actually going on for you — not the daily five, a genuinely deeper read, saved to your account. 7 days free, then $7/week.
            </p>
            <SubscriptionTierPicker subscribingTier={subscribingTier} onStart={startTrial} />
          </div>
        )}
        {entitled && (
          <div className="chart-feed tn-feed tn-longread">
            <div className="tn-windows" role="tablist" aria-label="Daily Long Read windows">
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
                    <span className="label-lock">{w.hours}</span>
                    <span className="clash tn-window__title">{w.label}</span>
                    <span className="tn-window__meta">
                      {isActiveWindow ? "Now" : state === "done" ? "Drawn" : state === "locked" ? "Later" : "Open"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="tn-card long-read-lock-card long-read-panel tn-salon">
              <div className="long-read-panel__header">
                <p className="label-lock">{selectedMeta.hours}</p>
                <h2 className="clash tn-salon__title">{selectedMeta.label}</h2>
                <p className="serif-quiet tn-lede">{selectedMeta.blurb}</p>
              </div>
              {selectedState === "locked" && (
                <p className="serif-quiet tn-lede">
                  This window opens later today. You can still review Morning or Midday once you've drawn them.
                </p>
              )}
              {selectedState === "open" && !hasReading && (
                <>
                  <label htmlFor="deep-situation" className="label-lock">
                    Before you draw — what's actually going on right now?
                  </label>
                  <textarea
                    id="deep-situation"
                    value={situations[selectedWindow]}
                    onChange={e => setSituations(prev => ({ ...prev, [selectedWindow]: e.target.value }))}
                    rows={4}
                    placeholder={'e.g. "trying to decide whether to leave my job"'}
                    className="tn-field"
                  />
                  <button type="button" onClick={drawTheLongRead} disabled={drawing} className="cta-pist tn-draw" style={{ opacity: drawing ? 0.6 : 1 }}>
                    {drawing ? "Drawing…" : `Draw the ${selectedMeta.label} Long Read ✦`}
                  </button>
                </>
              )}
              {hasReading && (
                <>
                  <SectionBoundary fallbackLabel="Couldn't display your cards just now — the reading below is still yours.">
                    <div className="long-read-spread tn-spread">
                      {displaySpread?.map(s => (
                        <div key={s.slot} className="long-read-card">
                          <p className="long-read-slot-label label-lock">{s.slotName}</p>
                          <CardArt card={s.card} reversed={s.reversed} />
                          <p className="long-read-card-name">
                            {s.card.name}{s.reversed ? " (rev.)" : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </SectionBoundary>
                  <SectionBoundary fallbackLabel="Couldn't display the reading text just now — it's saved to your account either way.">
                    <div className="chart-profile-sections tn-letter__body">
                      <div className="chart-profile-section is-lede">
                        <p className="label-lock">Your reading</p>
                        <div className="chart-profile-section__body">
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
                  <div className="tn-followup">
                    <p className="label-lock">Ask a follow-up — $2.99</p>
                    <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3} placeholder="What do you want to know more about?" className="tn-field" />
                    <button type="button" onClick={askQuestion} disabled={askingQuestion || !question.trim()} className="cta-pist" style={{ alignSelf: "flex-start", opacity: askingQuestion || !question.trim() ? 0.5 : 1, cursor: askingQuestion || !question.trim() ? "default" : "pointer" }}>
                      {askingQuestion ? "Starting…" : "Ask — $2.99"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        <p className="serif-quiet" style={{ textAlign: "center", marginTop: "0.5rem", color: "#F4EFE6" }}>
          Prefer the free five-card draw?{" "}
          <Link to="/journal" style={{ textDecoration: "underline", color: "#D8F0C4" }}>Open The Journal →</Link>
        </p>
      </div>
    </div>
  );
}
