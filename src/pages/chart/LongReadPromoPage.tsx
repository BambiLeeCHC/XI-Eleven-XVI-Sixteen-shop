import { Link } from "react-router-dom";
import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { api, useQuery } from "../../lib/backend";
import { SectionHeading, TrueNorthHero, TrueNorthSignedOutTeaser, ctaButtonStyle, useSunSign } from "./shared";

/** True North — Long Read promo. The actual seven-card reading lives at
 * /journal/deep-reading; this is the teaser card that lives inside the
 * True North destination alongside Chart/Numbers/Almanac. */
export function LongReadPromoPage() {
  const user = useQuery(api.auth.currentUser);
  const sunSign = useSunSign(user);
  const pageTitle = "True North — The Long Read — XI · XVI";

  if (!user) {
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack" style={{ maxWidth: "42rem" }}>
          <SEO title={pageTitle} />
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="journal-surface" style={{ padding: "1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
                <p className="text-sm font-semibold mb-2">The Long Read</p>
                <p className="text-sm text-muted-foreground">
                  Seven cards, three times a day — morning, midday, evening — read against what's
                  actually going on with you.
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
        <SectionHeading wordA="The" wordB="Long Read" ariaLabel="The Long Read" />
        <div
          className="journal-surface"
          style={{
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
            textAlign: "center",
          }}
        >
          <span className="journal-tile__deck" aria-hidden="true" style={{ margin: "0 auto" }}>
            <i />
            <i />
            <i />
          </span>
          <p className="text-sm font-semibold">The Long Read</p>
          <p className="text-sm text-muted-foreground">
            Seven cards, three times a day — Morning, Midday, Evening — each read against what you
            told us. Follow-up question $2.99. 7 days free, then $7/week.
          </p>
          <Link to="/journal/deep-reading">
            <button style={ctaButtonStyle}>Go deeper ✦</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
