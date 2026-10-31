import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { TrueNorthSignIcon } from "../../components/journal/TrueNorthGlyphs";
import { api, useAuthStatus, useQuery } from "../../lib/backend";
import { TrueNorthHero, TrueNorthSignedOutTeaser, useSunSign } from "./shared";

type Focus = "general" | "career" | "love" | "money";

type Reading = {
  id: string;
  name: string;
  sign: string;
  focus: Focus;
  text: string;
  at: number;
};

const STORAGE_KEY = "xi-tn-circle-v1";
const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const FOCUS: { id: Focus; label: string }[] = [
  { id: "general", label: "General" },
  { id: "career", label: "Career" },
  { id: "love", label: "Love" },
  { id: "money", label: "Money" },
];

const FILTERS: { id: Focus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...FOCUS,
];

const STARTER: Reading[] = [
  {
    id: "seed-mira",
    name: "Mira",
    sign: "Libra",
    focus: "love",
    text: "Today is for the conversation you have been rehearsing. Say the clear version, then stop.",
    at: Date.UTC(2026, 9, 28, 14, 0),
  },
  {
    id: "seed-julian",
    name: "Julian",
    sign: "Capricorn",
    focus: "career",
    text: "One unfinished piece of work is louder than the whole list. Finish that, then look up.",
    at: Date.UTC(2026, 9, 28, 15, 10),
  },
  {
    id: "seed-ada",
    name: "Ada",
    sign: "Aquarius",
    focus: "money",
    text: "A number you have been avoiding is smaller than the story around it. Look at it once, plainly.",
    at: Date.UTC(2026, 9, 29, 11, 20),
  },
];

function loadReadings(): Reading[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return STARTER;
    const parsed = JSON.parse(raw) as Reading[];
    return Array.isArray(parsed) && parsed.length ? parsed : STARTER;
  } catch {
    return STARTER;
  }
}

export function CirclePage() {
  const { isLoading: authLoading, isAuthenticated } = useAuthStatus();
  const user = useQuery(api.auth.currentUser, authLoading || !isAuthenticated ? "skip" : {});
  const sunSign = useSunSign(user);
  const [focus, setFocus] = useState<Focus | "all">("all");
  const [readings, setReadings] = useState<Reading[]>(STARTER);
  const [draft, setDraft] = useState("");
  const [mineFocus, setMineFocus] = useState<Focus>("general");
  const [pair, setPair] = useState<string[]>([]);

  useEffect(() => {
    setReadings(loadReadings());
  }, []);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  }, [readings]);

  const visible = useMemo(
    () => readings
      .filter(r => focus === "all" || r.focus === focus)
      .slice()
      .sort((a, b) => b.at - a.at),
    [readings, focus],
  );

  const tandem = pair
    .map(id => readings.find(r => r.id === id))
    .filter((r): r is Reading => !!r);

  const displayName = (user?.name as string | undefined)
    || (user?.email ? String(user.email).split("@")[0] : "You");
  const sign = sunSign && SIGNS.includes(sunSign) ? sunSign : "Virgo";

  const share = () => {
    const text = draft.trim();
    if (!text || !isAuthenticated) return;
    const next: Reading = {
      id: `me-${Date.now()}`,
      name: displayName,
      sign,
      focus: mineFocus,
      text,
      at: Date.now(),
    };
    setReadings(list => [next, ...list]);
    setDraft("");
  };

  const togglePair = (id: string) => {
    setPair(current => {
      if (current.includes(id)) return current.filter(x => x !== id);
      if (current.length >= 2) return [current[1]!, id];
      return [...current, id];
    });
  };

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <SEO
          title="Circle — True North"
          description="Share a daily orientation. Read with someone you trust. Career, love, and money — without the oracle voice."
          url="/chart/circle"
        />
        {isAuthenticated ? <TrueNorthHero sunSign={sunSign} /> : (
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="tn-card tn-invite-card">
                <p className="label-lock">The circle</p>
                <p className="serif-quiet tn-invite-card__copy">
                  A room for daily orientation — yours, and the people you read beside.
                </p>
              </div>
            }
          />
        )}

        <section className="tn-card tn-invite-card">
          <p className="label-lock">Circle</p>
          <h2 className="clash" style={{ fontSize: "clamp(32px, 5vw, 52px)", margin: "0.35rem 0 0.4rem" }}>
            Higher self, in company.
          </h2>
          <p className="serif-quiet tn-invite-card__copy">
            Profiles, a daily note you can share, and tandem readings for a friend, a partner, or family.
            Career, love, and money are lenses — not fortunes.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {FILTERS.map(item => (
              <button
                key={item.id}
                type="button"
                className={focus === item.id ? "cta-pist" : "cta-ghost"}
                onClick={() => setFocus(item.id)}
                style={{ padding: "10px 14px" }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="tn-card tn-invite-card">
          <p className="label-lock">Your profile</p>
          {isAuthenticated ? (
            <>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 12 }}>
                <span style={{ color: "var(--pist)" }}><TrueNorthSignIcon sign={sign} size={36} /></span>
                <div>
                  <p className="clash" style={{ margin: 0, fontSize: 28 }}>{displayName}</p>
                  <p className="serif-quiet" style={{ margin: 0 }}>{sign} · orientation, not prediction</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                {FOCUS.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className={mineFocus === item.id ? "cta-pist" : "cta-ghost"}
                    onClick={() => setMineFocus(item.id)}
                    style={{ padding: "8px 12px" }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                maxLength={280}
                placeholder="Today's orientation, in a few lines."
                style={{
                  width: "100%",
                  marginTop: 12,
                  minHeight: 96,
                  background: "transparent",
                  color: "inherit",
                  border: "1px solid rgba(247,240,230,0.25)",
                  padding: 12,
                  fontFamily: "inherit",
                }}
              />
              <button type="button" className="cta-pist" style={{ marginTop: 12 }} onClick={share} disabled={!draft.trim()}>
                Share today's reading
              </button>
            </>
          ) : (
            <p className="serif-quiet tn-invite-card__copy">
              <Link to="/login" className="tn-inline">Sign in</Link> to publish your own note. You can still read the circle.
            </p>
          )}
        </section>

        {tandem.length === 2 && (
          <section className="tn-card tn-invite-card">
            <p className="label-lock">Tandem</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
              {tandem.map(r => (
                <article key={r.id}>
                  <TrueNorthSignIcon sign={r.sign} size={28} />
                  <p className="label-lock" style={{ marginTop: 8 }}>{r.name} · {r.focus}</p>
                  <p className="serif-quiet">{r.text}</p>
                </article>
              ))}
            </div>
            <p className="serif-quiet" style={{ marginTop: 8 }}>
              Two orientations, held next to each other. Neither one is the answer for the other.
            </p>
          </section>
        )}

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {visible.map(r => {
            const selected = pair.includes(r.id);
            return (
              <li key={r.id} className="tn-card tn-invite-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <TrueNorthSignIcon sign={r.sign} size={26} />
                    <div>
                      <p className="label-lock" style={{ margin: 0 }}>{r.name}</p>
                      <p className="serif-quiet" style={{ margin: 0 }}>{r.sign} · {r.focus}</p>
                    </div>
                  </div>
                  <button type="button" className={selected ? "cta-pist" : "cta-ghost"} onClick={() => togglePair(r.id)}>
                    {selected ? "In tandem" : "Read with"}
                  </button>
                </div>
                <p className="serif-quiet tn-invite-card__copy" style={{ marginTop: 10 }}>{r.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
