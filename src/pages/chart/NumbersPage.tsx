import { Navigate } from "react-router-dom";
import { SectionBoundary } from "../../components/journal/SectionBoundary";
import { api, useQuery } from "../../lib/backend";
import {
  NUMEROLOGY_ERROR_COPY,
  NumberRow,
  ProfileSection,
  SectionHeading,
  parseProfileSections,
  type NumerologyResult,
} from "./shared";

/** True North — Numerology. Included with every profile. */
export function NumbersPage({ embedded = false }: { embedded?: boolean } = {}) {
  const user = useQuery(api.auth.currentUser);
  const numerologyResult = useQuery<NumerologyResult>(api.numerology.get, user ? {} : "skip");

  if (!embedded) {
    return <Navigate to="/chart#numbers" replace />;
  }

  if (!user) {
    return (
      <div id="numbers" className="tn-embed">
        <p className="tn-sky__note">Opening your numbers…</p>
      </div>
    );
  }

  return (
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
              {parseProfileSections(numerologyResult.narrative).map((section, index) => (
                <ProfileSection key={index} title={section.title} body={section.body} />
              ))}
            </div>
          )}
        </SectionBoundary>
      )}
    </div>
  );
}
