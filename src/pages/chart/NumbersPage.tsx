import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { SectionBoundary } from "../../components/journal/SectionBoundary";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { SEO } from "../../components/SEO";
import { PAGE_SEO } from "../../data/seoMeta";
import { api, useQuery } from "../../lib/backend";
import {
  NUMEROLOGY_ERROR_COPY,
  NumberRow,
  type NumerologyResult,
  ProfileSection,
  parseProfileSections,
  SectionHeading,
  TrueNorthHero,
  TrueNorthSignedOutTeaser,
  useSunSign,
} from "./shared";

type NumbersTab = "core" | "reading";

/** True North — Numerology. Included with every profile. */
export function NumbersPage({ embedded = false }: { embedded?: boolean } = {}) {
  const [tab, setTab] = useState<NumbersTab>("core");
  const user = useQuery(api.auth.currentUser);
  const sunSign = useSunSign(user);
  const numerologyResult = useQuery<NumerologyResult>(
    api.numerology.get,
    user ? {} : "skip",
  );

  const pageTitle = PAGE_SEO.numbers.title;
  const pageDescription = PAGE_SEO.numbers.description;

  if (!user) {
    if (embedded) {
      return (
        <div className="tn-card" id="numbers">
          <SectionHeading wordA="The" wordB="Numbers" ariaLabel="The Numbers" />
          <p className="serif-quiet tn-lede">
            Life Path, Expression, and Soul Urge calculate once you are signed
            in.
          </p>
          <Link to="/login" className="tn-inline">
            Sign in to read your numbers
          </Link>
        </div>
      );
    }
    return (
      <div className="journal-page journal-page--truenorth">
        <TrueNorthAtmosphere />
        <div className="journal-stack tn-shell">
          <SEO
            title={pageTitle}
            description={pageDescription}
            url="/chart/numbers"
          />
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="tn-card tn-invite-card">
                <p className="label-lock">Numerology</p>
                <p className="serif-quiet tn-invite-card__copy">
                  Life Path, Expression, Soul Urge — the numbers that don't
                  move. They live on your profile, with your chart.
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

  const numberEntries = Object.entries(numerologyResult?.numbers ?? {});
  const narrative = numerologyResult?.success
    ? numerologyResult.narrative
    : undefined;
  const numbersBody = (
    <div className="tn-card tn-numbers-wrap" id="numbers">
      <SectionHeading wordA="The" wordB="Numbers" ariaLabel="The Numbers" />
      <div className="tn-subtabs" role="tablist" aria-label="Numbers">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "core"}
          className={tab === "core" ? "is-on" : ""}
          onClick={() => setTab("core")}
        >
          Core Numbers
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "reading"}
          className={tab === "reading" ? "is-on" : ""}
          onClick={() => setTab("reading")}
        >
          Reading
        </button>
      </div>
      {numerologyResult === undefined && (
        <p className="tn-sky__note">Calculating your numbers…</p>
      )}
      {tab === "core" && numberEntries.length > 0 && (
        <div className="chart-numbers-grid tn-numbers">
          {numberEntries.map(([key, value]) => (
            <NumberRow key={key} numKey={key} value={value} />
          ))}
        </div>
      )}
      {tab === "reading" && numerologyResult && !numerologyResult.success && (
        <p className="tn-alert">
          {NUMEROLOGY_ERROR_COPY[numerologyResult.reason ?? ""] ??
            "Couldn't write your numerology narrative just now — try again shortly."}
        </p>
      )}
      {tab === "reading" && narrative && (
        <SectionBoundary fallbackLabel="Couldn't display your numbers just now — try refreshing.">
          <div className="chart-profile-sections tn-letter__body">
            {parseProfileSections(narrative).map((section, index) => (
              <ProfileSection
                key={index}
                title={section.title}
                body={section.body}
              />
            ))}
          </div>
        </SectionBoundary>
      )}
      {tab === "reading" && numerologyResult?.success && !narrative && (
        <p className="tn-sky__note">The reading is still settling.</p>
      )}
    </div>
  );

  if (embedded) return numbersBody;

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <SEO
          title={pageTitle}
          description={pageDescription}
          url="/chart/numbers"
        />
        <TrueNorthHero sunSign={sunSign} />
        {numbersBody}
      </div>
    </div>
  );
}
