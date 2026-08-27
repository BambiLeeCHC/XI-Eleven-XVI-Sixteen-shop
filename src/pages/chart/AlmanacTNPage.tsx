import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { AlmanacCalendar } from "../../components/journal/Almanac";
import { SectionHeading, TrueNorthHero, TrueNorthSignedOutTeaser, useSunSign } from "./shared";
import { useTrueNorthAuth } from "./session";

/** True North — The Almanac. Moved here from the Journal's tile grid. */
export function AlmanacTNPage() {
  const { user, isAuthenticated, authLoading } = useTrueNorthAuth();
  const sunSign = useSunSign(user);
  const pageTitle = "True North — The Almanac — XI · XVI";

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
