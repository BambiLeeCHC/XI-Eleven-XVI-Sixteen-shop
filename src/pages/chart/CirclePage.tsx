import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../../components/SEO";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { TrueNorthSignIcon } from "../../components/journal/TrueNorthGlyphs";
import { api, useAuthStatus, useQuery } from "../../lib/backend";
import { supabase } from "../../lib/supabase";
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

type Row = {
  id: string;
  display_name: string;
  sign: string;
  focus: Focus;
  body: string;
  created_at: string;
};

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

function fromRow(row: Row): Reading {
  return {
    id: row.id,
    name: row.display_name,
    sign: row.sign,
    focus: row.focus,
    text: row.body,
    at: new Date(row.created_at).getTime(),
  };
}

function mergeReading(list: Reading[], next: Reading): Reading[] {
  if (list.some(item => item.id === next.id)) return list;
  return [next, ...list].sort((a, b) => b.at - a.at).slice(0, 80);
}

export function CirclePage() {
  const { isLoading: authLoading, isAuthenticated } = useAuthStatus();
  const user = useQuery(api.auth.currentUser, authLoading || !isAuthenticated ? "skip" : {});
  const sunSign = useSunSign(user);
  const [focus, setFocus] = useState<Focus | "all">("all");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [draft, setDraft] = useState("");
  const [mineFocus, setMineFocus] = useState<Focus>("general");
  const [pair, setPair] = useState<string[]>([]);
  const [live, setLive] = useState<"connecting" | "live" | "offline">("connecting");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let stop = false;

    const pull = async () => {
      const { data, error } = await supabase
        .from("circle_readings")
        .select("id, display_name, sign, focus, body, created_at")
        .order("created_at", { ascending: false })
        .limit(80);
      if (stop) return;
      if (error) {
        setLive("offline");
        setNotice("The shared room is not reachable yet. Readings will appear here once the circle table is live.");
        return;
      }
      setLive("live");
      setNotice("");
      setReadings((data as Row[]).map(fromRow));
    };

    void pull();
    const poll = window.setInterval(() => { void pull(); }, 8000);

    const channel = supabase
      .channel("true-north-circle")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "circle_readings" },
        payload => {
          const row = payload.new as Row;
          if (!row?.id) return;
          setLive("live");
          setReadings(list => mergeReading(list, fromRow(row)));
        },
      )
      .subscribe(status => {
        if (stop) return;
        if (status === "SUBSCRIBED") setLive(current => (current === "offline" ? current : "live"));
      });

    return () => {
      stop = true;
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, []);

  const visible = useMemo(
    () => readings.filter(r => focus === "all" || r.focus === focus),
    [readings, focus],
  );

  const tandem = pair
    .map(id => readings.find(r => r.id === id))
    .filter((r): r is Reading => !!r);

  const displayName = (user?.name as string | undefined)
    || (user?.email ? String(user.email).split("@")[0] : "You");
  const sign = sunSign && SIGNS.includes(sunSign) ? sunSign : "Virgo";

  const share = async () => {
    const text = draft.trim();
    if (!text || !isAuthenticated || saving) return;
    setSaving(true);
    setNotice("");
    const { data: sessionData } = await supabase.auth.getSession();
    const authorId = sessionData.session?.user.id;
    if (!authorId) {
      setNotice("Sign in again, then share.");
      setSaving(false);
      return;
    }
    const { data, error } = await supabase
      .from("circle_readings")
      .insert({
        author_id: authorId,
        display_name: displayName.slice(0, 40),
        sign,
        focus: mineFocus,
        body: text.slice(0, 280),
      })
      .select("id, display_name, sign, focus, body, created_at")
      .single();
    setSaving(false);
    if (error || !data) {
      setNotice(error?.message || "Could not share that note.");
      return;
    }
    setReadings(list => mergeReading(list, fromRow(data as Row)));
    setDraft("");
  };

  const togglePair = (id: string) => {
    setPair(current => {
      if (current.includes(id)) return current.filter(x => x !== id);
      if (current.length >= 2) return [current[1]!, id];
      return [...current, id];
    });
  };

  const liveLabel = live === "live" ? "Live" : live === "offline" ? "Offline" : "Connecting";

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <SEO
          title="Circle — True North"
          description="A shared room. Daily orientations sync live. Read two at once. Career, love, and money — without the oracle voice."
          url="/chart/circle"
        />
        {isAuthenticated ? <TrueNorthHero sunSign={sunSign} /> : (
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="tn-card tn-invite-card">
                <p className="label-lock">The circle</p>
                <p className="serif-quiet tn-invite-card__copy">
                  A shared room. What you write here is visible to everyone in it, as it is written.
                </p>
              </div>
            }
          />
        )}

        <section className="tn-card tn-invite-card">
          <p className="label-lock">Circle · {liveLabel}</p>
          <h2 className="clash" style={{ fontSize: "clamp(32px, 5vw, 52px)", margin: "0.35rem 0 0.4rem" }}>
            Higher self, in company.
          </h2>
          <p className="serif-quiet tn-invite-card__copy">
            One room. Profiles, a daily note, and tandem readings for a friend, a partner, or family.
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
          {notice && <p className="serif-quiet" style={{ marginTop: 12 }}>{notice}</p>}
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
              <button type="button" className="cta-pist" style={{ marginTop: 12 }} onClick={() => { void share(); }} disabled={!draft.trim() || saving || live === "offline"}>
                {saving ? "Sharing…" : "Share with the circle"}
              </button>
            </>
          ) : (
            <p className="serif-quiet tn-invite-card__copy">
              <Link to="/login" className="tn-inline">Sign in</Link> to publish. Anyone can read what is already in the room.
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
          </section>
        )}

        {visible.length === 0 && live === "live" && (
          <p className="serif-quiet tn-opening">The circle is quiet. The first note sets the room.</p>
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
