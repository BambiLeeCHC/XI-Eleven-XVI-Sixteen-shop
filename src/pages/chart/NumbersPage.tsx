import { useState } from "react";
import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { SubscriptionTierPicker, type SubscriptionTier } from "../../components/SubscriptionTierPicker";
import { SectionBoundary } from "../../components/journal/SectionBoundary";
import { api, useAction, useQuery } from "../../lib/backend";
import {
  NUMEROLOGY_ERROR_COPY,
  NumberRow,
  ProfileSection,
  TrueNorthHero,
  TrueNorthSignedOutTeaser,
  parseProfileSections,
  useSunSign,
} from "./shared";
import type { NumerologyResult } from "./shared";

/** True North — Numerology. The paid add-on layer underneath the free
 * natal chart, bundled with the Long Read subscription. */
export function NumbersPage() {
  const user = useQuery(api.auth.currentUser);
  const sunSign = useSunSign(user);
  const subscription = useQuery(api.subscription.status, user ? {} : "skip");
  const numerologyUnlocked =
    subscription?.entitled === true && subscription?.tier === "long_read_plus_numerology";
  const numerologyResult = useQuery<NumerologyResult>(api.numerology.get, numerologyUnlocked ? {} : "skip");
  const startTrialAction = useAction(api.subscription.startTrial);
  const [subscribingTier, setSubscribingTier] = useState<SubscriptionTier | null>(null);

  const startTrial = async (tier: SubscriptionTier) => {
    setSubscribingTier(tier);
    try {
      const result = await startTrialAction({
        tier,
        successUrl: `${window.location.origin}/chart/numbers`,
        cancelUrl: `${window.location.origin}/chart/numbers`,
      });
      if (result?.url) window.location.href = result.url;
    } catch {
      // surfaced implicitly by the button staying enabled
    } finally {
      setSubscribingTier(null);
    }
  };

  const pageTitle = "True North — Numerology — XI · XVI";

  if (!user) {
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
              <SubscriptionTierPicker
                subscribingTier={subscribingTier}
                onStart={startTrial}
                highlight="long_read_plus_numerology"
              />
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
