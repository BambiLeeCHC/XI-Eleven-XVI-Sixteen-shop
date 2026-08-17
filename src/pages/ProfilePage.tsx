import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useAuthActions, useMutation, useQuery } from "../lib/backend";
import { LocationAutocomplete } from "../components/LocationAutocomplete";

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

  const initial = (user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p
        className="text-[10px] tracking-[0.3em] uppercase font-semibold"
        style={{ color: "var(--showroom-gold)" }}
      >
        Account
      </p>
      <h1
        className="text-3xl font-light mt-2 mb-10"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--showroom-ink)",
        }}
      >
        My Profile
      </h1>

      <div className="space-y-6">
        {/* Identity card */}
        <div className="flex items-center gap-4 p-6 rounded-2xl border border-[rgba(92,155,205,0.18)] bg-white/80 shadow-sm">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold shrink-0"
            style={{
              background: "rgba(185,149,69,0.14)",
              color: "var(--showroom-gold)",
            }}
          >
            {initial}
          </div>
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-slate-400 mb-1">
              Signed in as
            </p>
            <p className="text-[15px]" style={{ color: "var(--showroom-ink)" }}>
              {user?.email || "—"}
            </p>
          </div>
        </div>

        {/* Birth details — powers the natal chart */}
        <BirthDetailsCard user={user} />

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-4">
          <Link
            to="/chart"
            className="p-5 rounded-2xl border border-[rgba(92,155,205,0.18)] bg-white/80 text-center shadow-sm transition-all hover:border-[rgba(185,149,69,0.45)] hover:shadow-md"
          >
            <span className="text-xl mb-2 block">🔮</span>
            <span className="text-[11px] tracking-wider uppercase text-slate-500">
              My True North
            </span>
          </Link>
          <Link
            to="/orders"
            className="p-5 rounded-2xl border border-[rgba(92,155,205,0.18)] bg-white/80 text-center shadow-sm transition-all hover:border-[rgba(185,149,69,0.45)] hover:shadow-md"
          >
            <span className="text-xl mb-2 block">📦</span>
            <span className="text-[11px] tracking-wider uppercase text-slate-500">
              My Orders
            </span>
          </Link>
          <Link
            to="/shop"
            className="p-5 rounded-2xl border border-[rgba(92,155,205,0.18)] bg-white/80 text-center shadow-sm transition-all hover:border-[rgba(185,149,69,0.45)] hover:shadow-md"
          >
            <span className="text-xl mb-2 block">✦</span>
            <span className="text-[11px] tracking-wider uppercase text-slate-500">
              Shop
            </span>
          </Link>
        </div>

        {/* Admin Dashboard — only visible to admins */}
        {isAdmin && (
          <Link
            to="/admin"
            className="block p-5 rounded-2xl border border-[rgba(185,149,69,0.3)] bg-[rgba(185,149,69,0.06)] shadow-sm transition-all hover:border-[rgba(185,149,69,0.5)] hover:bg-[rgba(185,149,69,0.1)]"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">⚙️</span>
              <div>
                <p
                  className="text-[11px] tracking-wider uppercase font-semibold"
                  style={{ color: "var(--showroom-gold)" }}
                >
                  Admin Dashboard
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage orders, products, tax & shipping
                </p>
              </div>
              <svg
                className="w-4 h-4 ml-auto"
                style={{ color: "var(--showroom-gold)" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </Link>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full py-3 rounded-full text-[11px] tracking-[0.2em] uppercase text-slate-500 border border-[rgba(92,155,205,0.22)] bg-white/60 transition-all hover:border-[rgba(185,149,69,0.4)] hover:text-slate-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
