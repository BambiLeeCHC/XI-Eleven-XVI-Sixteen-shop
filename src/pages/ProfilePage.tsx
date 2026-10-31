import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useAuthActions, useMutation, useQuery } from "../lib/backend";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { TrueNorthSignIcon } from "../components/journal/TrueNorthGlyphs";
import { ChartHomePage } from "./chart/ChartHomePage";
import { NumbersPage } from "./chart/NumbersPage";
import { useSunSign } from "./chart/shared";

const fieldInputClass =
  "w-full bg-transparent text-[15px] px-3.5 py-2.5 outline-none rounded-md";

const fieldStyle: React.CSSProperties = {
  border: "1px solid rgba(247,240,230,0.28)",
  color: "inherit",
  colorScheme: "dark",
};

type Panel = "chart" | "numbers" | "details";

function panelFromHash(): Panel | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace("#", "");
  if (hash === "numbers") return "numbers";
  if (hash === "details" || hash === "birth") return "details";
  if (hash === "chart") return "chart";
  return null;
}

function BirthDetailsCard({ user, onSaved }: { user: any; onSaved?: () => void }) {
  const updateBirthDetails = useMutation(api.profile.updateBirthDetails);
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(user?.birthTime ?? "");
  const [birthLocation, setBirthLocation] = useState(user?.birthLocation ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setBirthDate(user?.birthDate ?? "");
    setBirthTime(user?.birthTime ?? "");
    setBirthLocation(user?.birthLocation ?? "");
  }, [user?.birthDate, user?.birthTime, user?.birthLocation]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await updateBirthDetails({ birthDate, birthTime, birthLocation });
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Couldn't save your birth details. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="tn-card tn-invite-card">
      <p className="label-lock">Birth details</p>
      <p className="serif-quiet tn-invite-card__copy">
        Date and place draw the chart. Time sharpens it. This stays on your profile.
      </p>
      <form onSubmit={handleSave} className="space-y-3" style={{ marginTop: 16 }}>
        <div>
          <label className="label-lock" style={{ display: "block", marginBottom: 6 }}>Date</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={fieldInputClass}
            style={fieldStyle}
            required
          />
        </div>
        <div>
          <label className="label-lock" style={{ display: "block", marginBottom: 6 }}>Time, if you know it</label>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className={fieldInputClass}
            style={fieldStyle}
          />
        </div>
        <div>
          <label className="label-lock" style={{ display: "block", marginBottom: 6 }}>Place</label>
          <LocationAutocomplete
            value={birthLocation}
            onChange={setBirthLocation}
            inputClassName={fieldInputClass}
          />
        </div>
        {error && <p className="tn-alert">{error}</p>}
        <button type="submit" disabled={saving} className="cta-pist" style={{ opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : saved ? "Saved" : "Save"}
        </button>
      </form>
    </div>
  );
}

const PANELS: { id: Panel; label: string }[] = [
  { id: "chart", label: "Chart" },
  { id: "numbers", label: "Numbers" },
  { id: "details", label: "Details" },
];

export function ProfilePage() {
  const user = useQuery(api.auth.currentUser);
  const isAdmin = useQuery(api.users.isAdmin);
  const sunSign = useSunSign(user);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<Panel>(() => panelFromHash() ?? "chart");

  useEffect(() => {
    if (!user || panelFromHash()) return;
    if (!user.birthDate) setPanel("details");
  }, [user]);

  const select = (next: Panel) => {
    setPanel(next);
    const hash = next === "chart" ? "chart" : next;
    window.history.replaceState(window.history.state, "", `#${hash}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const name = (user?.name as string | undefined)
    || (user?.email ? String(user.email).split("@")[0] : "Your profile");

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <header className="tn-card tn-invite-card" style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {sunSign && (
              <span style={{ color: "var(--pist)" }}>
                <TrueNorthSignIcon sign={sunSign} size={36} />
              </span>
            )}
            <div>
              <p className="label-lock" style={{ margin: 0 }}>{sunSign || "Profile"}</p>
              <h1 className="clash" style={{ fontSize: "clamp(32px, 5vw, 52px)", margin: "0.15rem 0" }}>{name}</h1>
              <p className="serif-quiet" style={{ margin: 0 }}>{user?.email || "—"}</p>
            </div>
          </div>
          <Link to="/chart/long-read" className="cta-pist">Readings</Link>
        </header>

        <div role="tablist" aria-label="Profile" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {PANELS.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={panel === item.id}
              className={panel === item.id ? "cta-pist" : "cta-ghost"}
              onClick={() => select(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {panel === "chart" && <ChartHomePage embedded />}
        {panel === "numbers" && <NumbersPage embedded />}
        {panel === "details" && <BirthDetailsCard user={user} onSaved={() => select("chart")} />}

        <footer style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <Link to="/orders" className="tn-inline">Orders</Link>
          <Link to="/shop" className="tn-inline">Shop</Link>
          {isAdmin && <Link to="/admin" className="tn-inline">Admin</Link>}
          <button type="button" onClick={handleSignOut} className="cta-ghost">Sign out</button>
        </footer>
      </div>
    </div>
  );
}
