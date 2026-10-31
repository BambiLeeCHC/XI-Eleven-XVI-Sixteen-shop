import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useAuthActions, useMutation, useQuery } from "../lib/backend";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { ChartHomePage } from "./chart/ChartHomePage";
import { NumbersPage } from "./chart/NumbersPage";

const fieldInputClass =
  "w-full bg-white border border-[rgba(92,155,205,0.25)] text-[14px] placeholder-slate-400 px-3.5 py-2.5 outline-none focus:border-[rgba(185,149,69,0.55)] transition-colors rounded-md";

function BirthDetailsCard({ user }: { user: any }) {
  const updateBirthDetails = useMutation(api.profile.updateBirthDetails);
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(user?.birthTime ?? "");
  const [birthLocation, setBirthLocation] = useState(user?.birthLocation ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Keep the form in sync if the profile loads/refreshes after mount.
  useEffect(() => {
    setBirthDate(user?.birthDate ?? "");
    setBirthTime(user?.birthTime ?? "");
    setBirthLocation(user?.birthLocation ?? "");
  }, [user?.birthDate, user?.birthTime, user?.birthLocation]);

  const hasChart = !!user?.birthDate && !!user?.birthLocation;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await updateBirthDetails({ birthDate, birthTime, birthLocation });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Couldn't save your birth details. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 rounded-2xl border border-[rgba(92,155,205,0.18)] bg-white/80 shadow-sm">
      <p className="text-[10px] tracking-[0.25em] uppercase text-slate-400 mb-1">
        Birth Details
      </p>
      <p className="text-[12px] text-slate-500 mb-4">
        {hasChart
          ? "Powers your free natal chart on the True North page."
          : "Add these to unlock your free natal chart — it's blocked until birth date and location are set."}
      </p>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-slate-500 font-semibold mb-1.5">
            Birth Date
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={fieldInputClass}
            required
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-slate-500 font-semibold mb-1.5">
            Birth Time <span className="normal-case text-slate-400">(optional)</span>
          </label>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className={fieldInputClass}
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-slate-500 font-semibold mb-1.5">
            Birth Location
          </label>
          <LocationAutocomplete
            value={birthLocation}
            onChange={setBirthLocation}
            inputClassName={fieldInputClass}
          />
        </div>

        {error && <p className="text-[12px] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 text-[11px] tracking-[0.2em] uppercase font-bold text-white transition-all disabled:opacity-50 rounded-md"
          style={{ background: "linear-gradient(135deg, var(--showroom-gold), #8f6f2e)" }}
        >
          {saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE BIRTH DETAILS"}
        </button>
      </form>
    </div>
  );
}

export function ProfilePage() {
  const user = useQuery(api.auth.currentUser);
  const isAdmin = useQuery(api.users.isAdmin);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <p className="label-lock">Profile</p>
        <h1 className="clash" style={{ fontSize: "clamp(40px, 6vw, 72px)", margin: "0.2rem 0 1.2rem" }}>
          Your chart. Your numbers.
        </h1>

        <div className="tn-card tn-invite-card">
          <p className="label-lock">Signed in as</p>
          <p className="serif-quiet" style={{ margin: "0.4rem 0 0" }}>{user?.email || "—"}</p>
        </div>

        <BirthDetailsCard user={user} />

        <ChartHomePage embedded />
        <NumbersPage embedded />

        <div className="tn-card tn-invite-card">
          <p className="label-lock">Readings are separate</p>
          <p className="serif-quiet tn-invite-card__copy">
            Three readings a week are included. Unlimited is $3.99 a week.
          </p>
          <Link to="/chart/long-read" className="cta-pist" style={{ display: "inline-block", marginTop: 12 }}>
            Open readings
          </Link>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/orders" className="cta-ghost">Orders</Link>
          <Link to="/shop" className="cta-ghost">Shop</Link>
          {isAdmin && <Link to="/admin" className="cta-ghost">Admin</Link>}
        </div>

        <button type="button" onClick={handleSignOut} className="cta-ghost" style={{ marginTop: 8 }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
