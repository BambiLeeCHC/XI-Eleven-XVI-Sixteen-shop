import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CardArt } from "../components/journal/CardArt";
import { SectionBoundary } from "../components/journal/SectionBoundary";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { buildLongReadOfferJsonLd, SEO } from "../components/SEO";
import {
  type SubscriptionTier,
  SubscriptionTierPicker,
} from "../components/SubscriptionTierPicker";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useAction, useAuthStatus, useQuery } from "../lib/backend";
import { TRUE_NORTH_FREE_ACCESS } from "../lib/freeAccess";
import { DEEP_SPREAD, drawDeepSpread, type SpreadCard } from "../lib/ritual";
import {
  BoldParagraphs,
  HouseDressing,
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
    label: "Tri-Sky · Morning",
    hours: "12:00 AM – 11:59 AM",
    blurb:
      "Orient the day — what's already solid under you and what's working in your favor.",
  },
  {
    id: "midday",
    label: "Tri-Sky · Noon",
    hours: "12:00 PM – 4:59 PM",
    blurb:
      "Align mid-course — the best move available and the gift you haven't fully claimed yet.",
  },
  {
    id: "evening",
    label: "Tri-Sky · Night",
    hours: "5:00 PM – 11:59 PM",
    blurb:
      "Integrate the day — the best-case path from here and where your real advantage sits.",
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
  return `Tri-Sky opens on ${sit}.\n\n${cards}\n\nThe throughline is already in your favor. Take one concrete step tonight that matches the Best Move card.`;
}

function isPaywallError(message: string) {
  return (
    /subscription/i.test(message) ||
    /sign in/i.test(message) ||
    /402/.test(message)
  );
}

export default function DeepReadingPage({ embedded = false }: { embedded?: boolean } = {}) {
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
  const [subscribingTier, setSubscribingTier] =
    useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockedByApi, setBlockedByApi] = useState(false);

  const isAdmin =
    adminFlag === true ||
    subscription?.isAdmin === true ||
    user?.role === "admin";
  const freeRemaining =
    typeof subscription?.freeRemaining === "number"
      ? subscription.freeRemaining
      : 3;
  const subscribed =
    subscription?.entitled === true ||
    subscription?.status === "active" ||
    subscription?.status === "trialing";
  const openAccess =
    TRUE_NORTH_FREE_ACCESS || subscription?.openAccess === true;
  const entitled =
    openAccess ||
    (!blockedByApi && (isAdmin || subscribed || freeRemaining > 0));
  const entitlementLoading =
    !TRUE_NORTH_FREE_ACCESS &&
    isAuthenticated &&
    !isAdmin &&
    subscription === undefined;

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
  const displayReading =
    selectedLocal?.reading ?? selectedSaved?.reading ?? null;
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
          [selectedWindow]: {
            spread: drawn,
            reading: result.reading as string,
          },
        }));
      } else {
        const message = (result as { error?: string })?.error || "";
        if (isPaywallError(message)) {
          setBlockedByApi(true);
          setError(
            message || "An active subscription is required for the Long Read.",
          );
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

  useEffect(() => {
    setError(null);
  }, [selectedWindow]);

  const pageTitle = PAGE_SEO.longRead.title;
  const pageDescription = PAGE_SEO.longRead.description;
  const pageUrl = "/chart/long-read";
  const longReadJsonLd = [buildLongReadOfferJsonLd()];

  const tabClass = (id: DailyWindow) => {
    const state = stateFor(id);
    const selected = id === selectedWindow;
    const isNow = id === active;
    return `tn-window${selected ? " is-active" : ""}${state === "locked" ? " is-locked" : ""}${state === "done" ? " is-done" : ""}${isNow ? " is-now" : ""}`;
  };

  if ((authLoading || entitlementLoading) && embedded) {
    return <p className="serif-quiet tn-opening">Opening Tri-Sky…</p>;
  }

  if (!authLoading && !entitlementLoading && !isAuthenticated && embedded) {
    return (
      <div className="tn-longread">
        <div className="tn-windows" role="tablist" aria-label="Tri-Sky windows">
          {WINDOWS.map(w => (
            <div key={w.id} className="tn-window" role="tab" aria-selected={w.id === active}>
              <span className="label-lock">{w.hours}</span>
              <span className="clash tn-window__title">{w.label}</span>
            </div>
          ))}
        </div>
        <div className="tn-card tn-invite-card">
          <p className="label-lock">{openAccess ? "Readings, open" : "Readings · 3 free each week"}</p>
          <p className="serif-quiet tn-invite-card__copy">
            {openAccess
              ? "Sign in to draw Tri-Sky. It is open with your account."
              : "Sign in to draw the seven-card spread."}
          </p>
          <Link to="/login" className="tn-inline">Sign in</Link>
        </div>
      </div>
    );
  }

  if (authLoading || entitlementLoading) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack long-read-stack tn-shell">
          <SEO
            title={pageTitle}
            description={pageDescription}
            url={pageUrl}
            jsonLd={longReadJsonLd}
          />
          <TrueNorthHero sunSign={sunSign} />
          <p className="serif-quiet tn-opening">Opening Tri-Sky…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack long-read-stack tn-shell">
          <SEO
            title={pageTitle}
            description={pageDescription}
            url={pageUrl}
            jsonLd={longReadJsonLd}
          />
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="tn-card tn-invite-card">
                <p className="label-lock">
                  {openAccess
                    ? "Readings, open"
                    : "Readings · 3 free each week"}
                </p>
                <p className="serif-quiet tn-invite-card__copy">
                  {openAccess
                    ? "Sign in to draw Tri-Sky. Morning, noon, and night. It is open with your account."
                    : "Readings live apart from your chart. Three a week are included. Unlimited is $3.99 a week."}
                </p>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "tn-embed tn-reading-embed" : "journal-page journal-page--truenorth"}>
      {!embedded && <TrueNorthAtmosphere />}
      <div className={embedded ? "tn-reading-embed__stack" : "journal-stack long-read-stack tn-shell"}>
        <SEO
          title={pageTitle}
          description={pageDescription}
          url={pageUrl}
          jsonLd={longReadJsonLd}
        />
        {!embedded && <TrueNorthHero sunSign={sunSign} />}
        <SectionHeading
          wordA="Tri-Sky"
          wordB="Daily"
          ariaLabel="Tri-Sky"
        />
        <div className="tn-card tn-lede-card">
          <p className="serif-quiet tn-lede">
            {openAccess
              ? "Tri-Sky is open with your account. Morning, noon, and night, each written for the best case in front of you. No charge is started from this page."
              : "Three readings a week are included with your profile. Unlimited is $3.99 a week."}
          </p>
        </div>
        {error && (
          <div className="tn-card tn-card--alert">
            <p className="tn-alert">{error}</p>
          </div>
        )}
        {!openAccess && subscribed && (
          <p className="tn-sky__note">Unlimited readings. $3.99 a week.</p>
        )}
        {!openAccess && !subscribed && entitled && (
          <p className="tn-sky__note">
            {freeRemaining} of 3 free readings left this week.
          </p>
        )}
        {!openAccess && !entitled && (
          <div className="tn-card tn-paywall">
            <p className="label-lock">$3.99 / week</p>
            <h2 className="clash tn-paywall__title">Unlimited readings.</h2>
            <p className="serif-quiet tn-lede">
              Your three free readings for this week are used. $3.99 a week
              keeps the room open — as many readings as you want.
            </p>
            <SubscriptionTierPicker
              subscribingTier={subscribingTier}
              onStart={startTrial}
            />
          </div>
        )}
        {entitled && (
          <div className="chart-feed tn-feed tn-longread">
            <div
              className="tn-windows"
              role="tablist"
              aria-label="Tri-Sky windows"
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
                    className={tabClass(w.id)}
                  >
                    <span className="label-lock">{w.hours}</span>
                    <span className="clash tn-window__title">{w.label}</span>
                    <span className="tn-window__meta">
                      {isActiveWindow
                        ? "Now"
                        : state === "done"
                          ? "Drawn"
                          : state === "locked"
                            ? "Later"
                            : "Open"}
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
                  This window opens later today. You can still review Tri-Sky · Morning
                  or Tri-Sky · Noon once you've drawn them.
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
                    onChange={e =>
                      setSituations(prev => ({
                        ...prev,
                        [selectedWindow]: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder={
                      'e.g. "trying to decide whether to leave my job"'
                    }
                    className="tn-field"
                  />
                  <button
                    type="button"
                    onClick={drawTheLongRead}
                    disabled={drawing}
                    className="cta-pist tn-draw"
                    style={{ opacity: drawing ? 0.6 : 1 }}
                  >
                    {drawing
                      ? "Drawing…"
                      : `Draw ${selectedMeta.label}`}
                  </button>
                </>
              )}
              {hasReading && (
                <>
                  <SectionBoundary fallbackLabel="Couldn't display your cards just now — the reading below is still yours.">
                    <div className="long-read-spread tn-spread">
                      {displaySpread?.map(s => (
                        <div key={s.slot} className="long-read-card">
                          <p className="long-read-slot-label label-lock">
                            {s.slotName}
                          </p>
                          <CardArt card={s.card} reversed={s.reversed} />
                          <p className="long-read-card-name">
                            {s.card.name}
                            {s.reversed ? " (rev.)" : ""}
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
                    <button
                      type="button"
                      onClick={drawTheLongRead}
                      disabled={drawing}
                      className="cta-ghost"
                      style={{
                        alignSelf: "flex-start",
                        opacity: drawing ? 0.6 : 0.9,
                        cursor: "pointer",
                      }}
                    >
                      {drawing ? "Drawing…" : "Admin · redraw this window"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        <HouseDressing />
        <p
          className="serif-quiet"
          style={{ textAlign: "center", marginTop: "0.5rem", color: "#F4EFE6" }}
        >
          Prefer the free five-card draw?{" "}
          <Link
            to="/journal"
            style={{ textDecoration: "underline", color: "#D8F0C4" }}
          >
            Open The Journal →
          </Link>
          {" · "}
          <Link
            to="/shop"
            style={{ textDecoration: "underline", color: "#D8F0C4" }}
          >
            Shop the house →
          </Link>
        </p>
      </div>
    </div>
  );
}
