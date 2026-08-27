import { useEffect, useState } from "react";
import { LocationAutocomplete } from "../../components/LocationAutocomplete";
import { api, useAuthStatus, useMutation, useQuery } from "../../lib/backend";

/** Session-aware True North identity. Never treat a live session as a guest. */
export function useTrueNorthAuth() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const user = useQuery(
    api.auth.currentUser,
    authLoading || !isAuthenticated ? "skip" : {},
  );
  return {
    user,
    isAuthenticated,
    authLoading,
    profileLoading: Boolean(isAuthenticated && user === undefined),
  };
}

const inputClass = "fld-lock light";
const labelClass = "label-lock block mb-2";

/** Logged-in natal-chart gate: birth date + location required, time optional. */
export function TrueNorthBirthCard({ user }: { user: any }) {
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
    if (!birthDate.trim() || !birthLocation.trim()) {
      setError("Birth date and location are required for your natal chart.");
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      await updateBirthDetails({ birthDate, birthTime, birthLocation });
      setSaved(true);
    } catch {
      setError("Couldn't save your birth details. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div
      className="tn-register-card"
      style={{
        padding: "1.75rem",
        border: "2px solid #0B0B0C",
        background: "#F7F0E6",
        color: "#0B0B0C",
      }}
    >
      <p className="label-lock mb-2" style={{ color: "#0B0B0C" }}>
        Birth details
      </p>
      <p className="serif-quiet text-base mb-4" style={{ color: "#0B0B0C" }}>
        Your natal chart needs a birth date and location. Time is optional —
        noon is used if you leave it blank.
      </p>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className={labelClass}>BIRTH DATE</label>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>BIRTH TIME (optional)</label>
          <input
            type="time"
            value={birthTime}
            onChange={e => setBirthTime(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>BIRTH LOCATION</label>
          <LocationAutocomplete
            value={birthLocation}
            onChange={setBirthLocation}
            inputClassName={inputClass}
            required
          />
        </div>
        {error && <p className="text-[12px] text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="cta-pist-block"
          style={{ boxShadow: "6px 6px 0 #0B0B0C", color: "#142010" }}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save birth details"}
        </button>
      </form>
    </div>
  );
}
