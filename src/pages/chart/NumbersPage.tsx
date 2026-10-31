import { SEO } from "../../components/SEO";
import { Navigate } from "react-router-dom";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { SectionBoundary } from "../../components/journal/SectionBoundary";
import { api, useQuery } from "../../lib/backend";
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

/** True North — Numerology. Included with every profile. */
export function NumbersPage({ embedded = false }: { embedded?: boolean } = {}) {
  const user = useQuery(api.auth.currentUser);
  const sunSign = useSunSign(user);
  const numerologyResult = useQuery<NumerologyResult>(api.numerology.get, user ? {} : "skip");

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
                  Life Path, Expression, Soul Urge — the numbers that don't move. They live on your profile, with your chart.
                </p>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  if (user && !embedded) {
    return <Navigate to="/profile#numbers" replace />;
  }

  const numbersBody = (
        <div className="tn-card tn-numbers-wrap" id="numbers">
          <SectionHeading wordA="The" wordB="Numbers" ariaLabel="The Numbers" />
          {numerologyResult === undefined && (
            <p className="tn-sky__note">Calculating your numbers…</p>
          )}

          {numerologyResult && !numerologyResult.success && (
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

          {numerologyResult?.success && (
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
  );

  if (embedded) return numbersBody;

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <SEO title={pageTitle} description={pageDescription} url="/chart/numbers" />
        <TrueNorthHero sunSign={sunSign} />
        {numbersBody}
      </div>
    </div>
  );
}
