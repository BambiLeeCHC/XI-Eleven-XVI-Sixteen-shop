import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { TrueNorthSignIcon } from "../components/journal/TrueNorthGlyphs";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { api, useAuthActions, useMutation, useQuery } from "../lib/backend";
import { NORTH_FOCUSES, type NorthFocus } from "../lib/northProfile";
import { ChartHomePage } from "./chart/ChartHomePage";
import { NumbersPage } from "./chart/NumbersPage";
import { TrueNorthNav, useSunSign } from "./chart/shared";

type Panel = "chart" | "numbers" | "details";

const FOCUS_LABEL: Record<NorthFocus, string> = {
  general: "General",
  career: "Career",
  love: "Love",
  money: "Money",
};

function panelFromHash(): Panel | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace("#", "");
  if (hash === "numbers") return "numbers";
  if (hash === "details" || hash === "birth" || hash === "profile")
    return "details";
  if (hash === "chart") return "chart";
  return null;
}

function clockTime(value: string | undefined) {
  if (!value) return "";
  return value.slice(0, 5);
}

function ProfileEditor({ user, onSaved }: { user: any; onSaved?: () => void }) {
  const updateNorth = useMutation(api.profile.updateNorth);
  const [name, setName] = useState(user?.name ?? "");
  const [focus, setFocus] = useState<NorthFocus>(
    NORTH_FOCUSES.includes(user?.northFocus) ? user.northFocus : "general",
  );
  const [note, setNote] = useState(user?.northNote ?? "");
  const [birthDate, setBirthDate] = useState(
    user?.birthDate ? String(user.birthDate).slice(0, 10) : "",
  );
  const [birthTime, setBirthTime] = useState(clockTime(user?.birthTime));
  const [birthLocation, setBirthLocation] = useState(user?.birthLocation ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setFocus(
      NORTH_FOCUSES.includes(user?.northFocus) ? user.northFocus : "general",
    );
    setNote(user?.northNote ?? "");
    setBirthDate(user?.birthDate ? String(user.birthDate).slice(0, 10) : "");
    setBirthTime(clockTime(user?.birthTime));
    setBirthLocation(user?.birthLocation ?? "");
  }, [
    user?.name,
    user?.northFocus,
    user?.northNote,
    user?.birthDate,
    user?.birthTime,
    user?.birthLocation,
  ]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await updateNorth({
        name,
        focus,
        note,
        birthDate,
        birthTime,
        birthLocation,
      });
      setSaved(true);
      onSaved?.();
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't save your profile. Please try again.",
      );
    }
    setSaving(false);
  };

  const welcoming = !user?.northOnboardedAt;

  return (
    <form className="tn-card tn-profile__editor" onSubmit={handleSave}>
      <p className="label-lock">{welcoming ? "Welcome in" : "Your profile"}</p>
      <h2 className="clash tn-profile__editor-title">
        {welcoming ? "Make this room yours." : "Edit what people can see."}
      </h2>
      <p className="serif-quiet tn-lede">
        Your name, focus, and a short note are what a connected person sees.
        Birth details stay on this account and draw the chart. Nothing here is
        emailed.
      </p>

      <label className="tn-label" htmlFor="tn-name">
        Name
      </label>
      <input
        id="tn-name"
        className="tn-field"
        value={name}
        onChange={e => setName(e.target.value)}
        autoComplete="name"
        maxLength={80}
        required
      />

      <fieldset className="tn-choice">
        <legend className="tn-label">Current focus</legend>
        <div className="tn-choice__row">
          {NORTH_FOCUSES.map(item => (
            <label
              key={item}
              className={`tn-choice__item ${focus === item ? "is-on" : ""}`}
            >
              <input
                type="radio"
                name="north-focus"
                value={item}
                checked={focus === item}
                onChange={() => setFocus(item)}
              />
              {FOCUS_LABEL[item]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="tn-label" htmlFor="tn-note">
        Note
      </label>
      <textarea
        id="tn-note"
        className="tn-field tn-field--area"
        value={note}
        maxLength={280}
        onChange={e => setNote(e.target.value)}
        placeholder="A line about what you're walking toward."
      />
      <p className="tn-meta">{note.length}/280</p>

      <label className="tn-label" htmlFor="tn-date">
        Birth date
      </label>
      <input
        id="tn-date"
        className="tn-field"
        type="date"
        value={birthDate}
        onChange={e => setBirthDate(e.target.value)}
      />

      <label className="tn-label" htmlFor="tn-time">
        Birth time, if you know it
      </label>
      <input
        id="tn-time"
        className="tn-field"
        type="time"
        value={birthTime}
        onChange={e => setBirthTime(e.target.value)}
      />

      <label className="tn-label" htmlFor="tn-place">
        Birth place
      </label>
      <LocationAutocomplete
        id="tn-place"
        value={birthLocation}
        onChange={setBirthLocation}
        inputClassName="tn-field"
      />

      {error && (
        <p className="tn-alert" role="alert">
          {error}
        </p>
      )}
      <p className="tn-meta" role="status">
        {saved ? "Saved to your account." : "Saved on this account only."}
      </p>
      <button type="submit" className="cta-pist tn-action" disabled={saving}>
        {saving
          ? "Saving…"
          : saved
            ? "Saved"
            : welcoming
              ? "Save and continue"
              : "Save profile"}
      </button>
    </form>
  );
}

const PANELS: { id: Panel; label: string }[] = [
  { id: "chart", label: "Chart" },
  { id: "numbers", label: "Numbers" },
  { id: "details", label: "Profile" },
];

export function ProfilePage() {
  const user = useQuery(api.auth.currentUser);
  const isAdmin = useQuery(api.users.isAdmin);
  const sunSign = useSunSign(user);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<Panel>(() => panelFromHash() ?? "details");

  useEffect(() => {
    if (!user || panelFromHash()) return;
    if (!user.northOnboardedAt || !user.birthDate) setPanel("details");
    else setPanel("chart");
  }, [user]);

  useEffect(() => {
    const onHash = () => {
      const next = panelFromHash();
      if (next) setPanel(next);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const select = (next: Panel) => {
    setPanel(next);
    const hash = next === "details" ? "profile" : next;
    window.history.replaceState(window.history.state, "", `#${hash}`);
  };

  const name =
    (user?.name as string | undefined) ||
    (user?.email ? String(user.email).split("@")[0] : "Your profile");
  const focus = NORTH_FOCUSES.includes(user?.northFocus)
    ? FOCUS_LABEL[user.northFocus as NorthFocus]
    : "General";

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell tn-profile">
        {user === undefined ? (
          <p className="serif-quiet tn-opening" role="status">
            Opening your profile…
          </p>
        ) : (
          <>
            <header className="tn-card tn-profile__head">
              <div className="tn-profile__identity">
                <span className="tn-profile__mark" aria-hidden="true">
                  <TrueNorthSignIcon sign={sunSign || "Virgo"} size={36} />
                </span>
                <div className="tn-profile__who">
                  <p className="label-lock">
                    {sunSign ? `${sunSign} sun` : "True North"}
                  </p>
                  <h1 className="clash tn-profile__name">{name}</h1>
                  <p className="tn-profile__mail">
                    {user?.email || "Signed in"}
                  </p>
                  <p className="tn-profile__focus">
                    {focus}
                    {user?.northNote ? ` · ${user.northNote}` : ""}
                  </p>
                </div>
              </div>
              <Link to="/chart/long-read" className="cta-pist tn-action">
                Open a reading
              </Link>
            </header>

            <TrueNorthNav />

            <div
              className="tn-profile__tabs"
              role="tablist"
              aria-label="Profile"
            >
              {PANELS.map(item => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={panel === item.id}
                  aria-controls={`panel-${item.id}`}
                  className={`tn-profile__tab ${panel === item.id ? "is-on" : ""}`}
                  onClick={() => select(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              role="tabpanel"
              id={`panel-${panel}`}
              aria-labelledby={`tab-${panel}`}
              className="tn-profile__panel"
            >
              {panel === "chart" && <ChartHomePage embedded />}
              {panel === "numbers" && <NumbersPage embedded />}
              {panel === "details" && (
                <ProfileEditor user={user} onSaved={() => select("chart")} />
              )}
            </div>
          </>
        )}

        <footer className="tn-profile__foot">
          <Link to="/orders" className="tn-inline">
            Orders
          </Link>
          <Link to="/shop" className="tn-inline">
            Shop
          </Link>
          <Link to="/chart/circle" className="tn-inline">
            Tandem
          </Link>
          {isAdmin && (
            <Link to="/admin" className="tn-inline">
              Admin
            </Link>
          )}
          <button
            type="button"
            className="cta-ghost tn-action"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
          >
            Sign out
          </button>
        </footer>
      </div>
    </div>
  );
}
