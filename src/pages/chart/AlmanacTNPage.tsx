import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { AlmanacCalendar } from "../../components/journal/Almanac";
import { api, useAuthStatus, useQuery } from "../../lib/backend";
import { SectionHeading, TrueNorthHero, TrueNorthSignedOutTeaser, useSunSign } from "./shared";

export function AlmanacTNPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuthStatus();
  const user = useQuery(
    api.auth.currentUser,
    authLoading || !isAuthenticated ? "skip" : {},
  );
  const sunSign = useSunSign(user);
  const pageTitle = "True North — The Almanac — XI · XVI";

  if (authLoading) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack" style={{ maxWidth: "42rem" }}>
          <SEO title={pageTitle} />
          <TrueNorthHero sunSign={sunSign} />
          <p className="serif-quiet text-xl" style={{ color: "#F4EFE6" }}>Opening the Almanac…</p>
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
                <p className="text-sm font-semibold mb-2">The Almanac</p>
                <p className="text-sm text-muted-foreground">
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
      <div className="journal-stack" style={{ maxWidth: "44rem" }}>
        <SEO title={pageTitle} />
        <TrueNorthHero sunSign={sunSign} />
        <SectionHeading wordA="The" wordB="Almanac" ariaLabel="The Almanac" />
        <div className="journal-surface" style={{ padding: "1.5rem" }}>
          <AlmanacCalendar />
        </div>
      </div>
    </div>
  );
}
