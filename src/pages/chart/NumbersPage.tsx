import { useState } from "react";
import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { SectionBoundary } from "../../components/journal/SectionBoundary";
import { api, useAction, useQuery } from "../../lib/backend";
import { useTrueNorthAuth } from "./session";
import {
  ctaButtonStyle,
  NUMEROLOGY_ERROR_COPY,
  NumberRow,
  ProfileSection,
  TrueNorthHero,
  TrueNorthSignedOutTeaser,
  parseProfileSections,
  useSunSign,
} from "./shared";
import type { NumerologyResult } from "./shared";

/** True North — Numerology. One-time unlock; no longer bundled into a weekly subscription. */
export function NumbersPage() {
  const { user, isAuthenticated, authLoading } = useTrueNorthAuth();
  const sunSign = useSunSign(user);
  const subscription = useQuery(
    api.subscription.status,
    isAuthenticated ? {} : "skip",
  );
  // Admin / one-time unlock / legacy plus-tier subscribers still see numerology.
  const numerologyUnlocked =
    subscription?.numerologyUnlocked === true ||
    (subscription?.entitled === true && subscription?.tier === "long_read_plus_numerology");
  const numerologyResult = useQuery<NumerologyResult>(api.numerology.get, numerologyUnlocked ? {} : "skip");
  const numerologyCheckoutAction = useAction(api.numerology.checkout);
  const [unlocking, setUnlocking] = useState(false);

  const unlockNumerology = async () => {
    setUnlocking(true);
    try {
      const result = await numerologyCheckoutAction({
        successUrl: `${window.location.origin}/chart/numbers`,
        cancelUrl: `${window.location.origin}/chart/numbers`,
      });
      if (result?.url) window.location.href = result.url;
    } catch {
      // surfaced implicitly by the button staying enabled
    } finally {
      setUnlocking(false);
    }
  };

  const pageTitle = "True North — Numerology — XI · XVI";

  if (authLoading) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack" style={{ maxWidth: "42rem" }}>
          <SEO title={pageTitle} />
          <TrueNorthHero sunSign={sunSign} />
          <div className="journal-surface" style={{ padding: "1.75rem" }}>
            <p className="text-sm">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack" style={{ maxWidth: "42rem" }}>
          <SEO title={pageTitle} />
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="journal-surface" style={{ padding: "1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
                <p className="text-sm font-semibold mb-2">Numerology</p>
                <p className="text-sm text-muted-foreground">
                  Your name and birth date reduce to a set of numbers that don't change — your Life Path,
                  your Expression number, your Soul Urge.
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
      <div className="journal-stack" style={{ maxWidth: "44rem" }}>
        <SEO title={pageTitle} />
        <TrueNorthHero sunSign={sunSign} />

        <div className="journal-surface" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          {!numerologyUnlocked && (
            <>
              <p className="text-sm font-semibold">Numerology — the layer underneath the chart</p>
              <p className="text-sm text-muted-foreground">
                Your name and birth date reduce to a set of numbers that stay constant your whole
                life — your Life Path, Expression, Soul Urge, Personality and this year's Personal
                Year number. Where the chart shows what the sky was doing, numerology shows what you
                were built to do with it.
              </p>
              <button
                type="button"
                onClick={unlockNumerology}
                disabled={unlocking}
                style={ctaButtonStyle}
              >
                {unlocking ? "Opening checkout…" : "Unlock numerology — $19.99, once"}
              </button>
              <p className="text-xs text-muted-foreground" style={{ marginTop: "-0.4rem" }}>
                One payment, yours for good.
              </p>
            </>
          )}

          {numerologyUnlocked && numerologyResult === undefined && (
            <p className="text-sm text-muted-foreground">Calculating your numbers…</p>
          )}

          {numerologyUnlocked && numerologyResult && !numerologyResult.success && (
            <>
              {numerologyResult.numbers && (
                <div className="chart-numbers-grid">
                  {Object.entries(numerologyResult.numbers).map(([key, value]) => (
                    <NumberRow key={key} numKey={key} value={value} />
                  ))}
                </div>
              )}
              <p className="text-sm text-red-600">
                {NUMEROLOGY_ERROR_COPY[numerologyResult.reason ?? ""] ??
                  "Couldn't write your numerology narrative just now — try again shortly."}
              </p>
            </>
          )}

          {numerologyUnlocked && numerologyResult?.success && (
            <SectionBoundary fallbackLabel="Couldn't display your numbers just now — try refreshing.">
              <div className="chart-numbers-grid">
                {Object.entries(numerologyResult.numbers ?? {}).map(([key, value]) => (
                  <NumberRow key={key} numKey={key} value={value} />
                ))}
              </div>
              {numerologyResult.narrative && (
                <div className="chart-profile-sections">
                  {parseProfileSections(numerologyResult.narrative).map((s, i) => (
                    <ProfileSection key={i} title={s.title} body={s.body} />
                  ))}
                </div>
              )}
            </SectionBoundary>
          )}
        </div>
      </div>
    </div>
  );
}
