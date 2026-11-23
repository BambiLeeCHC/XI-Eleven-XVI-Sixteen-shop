import { Link, useLocation } from "react-router-dom";
import { PlanetIcon, SignIcon } from "../../components/icons/AstroIcons";
import { resolveTrueNorthView } from "../../lib/northSocial";
import { api, useQuery } from "../../lib/backend";

// TEMP minimal restore - full shared will follow
export type NatalChartResult = any;
export type NumerologyResult = any;

export const TRUE_NORTH_PAGES = [
  { id: "feed", path: "/chart", label: "Feed", glyph: "", blurb: "The community feed — notes, pulls, and group posts." },
  { id: "sky", path: "/chart#profile", label: "Profile", glyph: "", blurb: "How your profile looks: chart, constellation, and posts." },
  { id: "readings", path: "/chart#readings", label: "Readings", glyph: "", blurb: "Tri-Sky and group or tandem reads." },
] as const;

export function TrueNorthNav() {
  const location = useLocation();
  const view = resolveTrueNorthView(location.pathname, location.hash);
  return (
    <nav className="tn-rail" aria-label="True North">
      {TRUE_NORTH_PAGES.map(p => {
        const active = p.id === view.destination;
        return (
          <Link key={p.id} to={p.path} aria-current={active ? "page" : undefined} className={`tn-rail__item ${active ? "is-active" : ""}`}>
            <span className="tn-rail__label">{p.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function useSunSign(_user: unknown): string | undefined {
  return undefined;
}

export function BoldParagraphs({ text }: { text: string }) {
  return <p>{text}</p>;
}

export function HouseDressing({ children }: { children?: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SectionHeading({ children }: { children?: React.ReactNode }) {
  return <h2>{children}</h2>;
}

export function TrueNorthHero({ sunSign }: { sunSign?: string }) {
  return (
    <header className="tn-hero">
      <h1 className="clash">True North</h1>
    </header>
  );
}

export function TrueNorthSignedOutTeaser() {
  return <div className="tn-card">Sign in to continue.</div>;
}
