import { useState } from "react";
import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { SectionBoundary } from "../../components/journal/SectionBoundary";
import { api, useAction, useQuery } from "../../lib/backend";
import {
  NUMEROLOGY_ERROR_COPY,
  NumberRow,
  ProfileSection,
  SectionHeading,
  TrueNorthHero,
  TrueNorthSignedOutTeaser,
  parseProfileSections,
  useSunSign,
} from "./shared";
import { PAGE_SEO } from "../../data/seoMeta";

/** True North — Numerology. One-time unlock; no longer bundled into a weekly subscription. */
export function NumbersPage() {
  const user = useQuery(api.auth.currentUser);
  const sunSign = useSunSign(user);
  const subscription = useQuery(api.subscription.status, user ? {} : "skip");
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

  const pageTitle = PAGE_SEO.numbers.title;
  const pageDescription = PAGE_SEO.numbers.description;

  if (!user) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack tn-shell">
          <SEO title={pageTitle} description={pageDescription} url="/chart/numbers" />
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="tn-card tn-invite-card">
                <p className="label-lock">Numerology</p>
                <p className="serif-quiet tn-invite-card__copy">
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
      <div className="journal-stack tn-shell">
        <SEO title={pageTitle} description={pageDescription} url="/chart/numbers" />
        <TrueNorthHero sunSign={sunSign} />

        <div className="tn-card tn-numbers-wrap">
          <SectionHeading wordA="The" wordB="Numbers" ariaLabel="The Numbers" />
          {!numerologyUnlocked && (
            <>
              <p className="label-lock">Numerology — the layer underneath the chart</p>
              <h2 className="clash tn-paywall__title">The numbers that don't move</h2>
              <p className="serif-quiet tn-lede">
                Your name and birth date reduce to a set of numbers that stay constant your whole
                life — your Life Path, Expression, Soul Urge, Personality and this year's Personal
                Year number. Where the chart shows what the sky was doing, numerology shows what you
                were built to do with it.
              </p>
              <button
                type="button"
                onClick={unlockNumerology}
                disabled={unlocking}
                className="cta-pist tn-draw"
                style={{ opacity: unlocking ? 0.6 : 1 }}
              >
                {unlocking ? "Opening checkout…" : "Unlock numerology — $19.99, once"}
              </button>
              <p className="tn-sky__note">One payment, yours for good.</p>
            </>
          )}

          {numerologyUnlocked && numerologyResult === undefined && (
            <p className="tn-sky__note">Calculating your numbers…</p>
          )}

          {numerologyUnlocked && numerologyResult && !numerologyResult.success && (
            <>
              {numerologyResult.numbers && (
                <div className="chart-numbers-grid tn-numbers">
                  {Object.entries(numerologyResult.numbers).map(([key, value]) => (
                    <NumberRow key={key} numKey={key} value={value} />
                  ))}
                </div>
              )}
              <p className="tn-alert">
                {NUMEROLOGY_ERROR_COPY[numerologyResult.reason ?? ""] ??
                  "Couldn't write your numerology narrative just now — try again shortly."}
              </p>
            </>
          )}

          {numerologyUnlocked && numerologyResult?.success && (
            <SectionBoundary fallbackLabel="Couldn't display your numbers just now — try refreshing.">
              <div className="chart-numbers-grid tn-numbers">
                {Object.entries(numerologyResult.numbers ?? {}).map(([key, value]) => (
                  <NumberRow key={key} numKey={key} value={value} />
                ))}
              </div>
              {numerologyResult.narrative && (
                <div className="chart-profile-sections tn-letter__body">
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
