import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { AlmanacCalendar } from "../../components/journal/Almanac";
import { api, useAuthStatus, useQuery } from "../../lib/backend";
import { PAGE_SEO } from "../../data/seoMeta";
import { SectionHeading, TrueNorthHero, TrueNorthSignedOutTeaser, useSunSign } from "./shared";

export function AlmanacTNPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuthStatus();
  const user = useQuery(
    api.auth.currentUser,
    authLoading || !isAuthenticated ? "skip" : {},
  );
  const sunSign = useSunSign(user);
  const pageTitle = PAGE_SEO.almanac.title;
  const pageDescription = PAGE_SEO.almanac.description;

  if (authLoading) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack tn-shell">
          <SEO title={pageTitle} description={pageDescription} url="/chart/almanac" />
          <TrueNorthHero sunSign={sunSign} />
          <p className="serif-quiet tn-opening">Opening the Almanac…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack tn-shell">
          <SEO title={pageTitle} description={pageDescription} url="/chart/almanac" />
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="tn-card tn-invite-card">
                <p className="label-lock">The Almanac</p>
                <p className="serif-quiet tn-invite-card__copy">
                  The sky's day-to-day moods, laid out like an old-world almanac.
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
        <SEO title={pageTitle} description={pageDescription} url="/chart/almanac" />
        <TrueNorthHero sunSign={sunSign} />
        <div className="tn-card tn-almanac">
          <SectionHeading wordA="The" wordB="Almanac" ariaLabel="The Almanac" />
          <p className="chart-expand-hint">
            The day's mood, the moon, and the 11:16 hour — tap a date to read it.
          </p>
          <AlmanacCalendar />
        </div>
      </div>
    </div>
  );
}
