import { useEffect, useState } from "react";
import { LocationAutocomplete } from "../../components/LocationAutocomplete";
import { useMutation, api } from "../../lib/backend";
import { NORTH_FOCUSES, type NorthFocus } from "../../lib/northProfile";

const FOCUS_LABEL: Record<NorthFocus, string> = {
  general: "General",
  career: "Career",
  love: "Love",
  money: "Money",
};

function clockTime(value: string | undefined) {
  if (!value) return "";
  return value.slice(0, 5);
}

export function ProfileEditor({ user, onSaved }: { user: any; onSaved?: () => void }) {
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
    setFocus(NORTH_FOCUSES.includes(user?.northFocus) ? user.northFocus : "general");
    setNote(user?.northNote ?? "");
    setBirthDate(user?.birthDate ? String(user.birthDate).slice(0, 10) : "");
    setBirthTime(clockTime(user?.birthTime));
    setBirthLocation(user?.birthLocation ?? "");
  }, [user?.name, user?.northFocus, user?.northNote, user?.birthDate, user?.birthTime, user?.birthLocation]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await updateNorth({ name, focus, note, birthDate, birthTime, birthLocation });
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your profile. Please try again.");
    }
    setSaving(false);
  };

  return (
    <form className="tn-profile__editor" onSubmit={handleSave}>
      <p className="serif-quiet tn-lede">
        Your name, focus, and a short note are what a connected person sees. Birth details stay on this account and draw the chart.
      </p>
      <label className="tn-label" htmlFor="tn-name">Name</label>
      <input id="tn-name" className="tn-field" value={name} onChange={e => setName(e.target.value)} autoComplete="name" maxLength={80} required />

      <fieldset className="tn-choice">
        <legend className="tn-label">Current focus</legend>
        <div className="tn-choice__row">
          {NORTH_FOCUSES.map(item => (
            <label key={item} className={`tn-choice__item ${focus === item ? "is-on" : ""}`}>
              <input type="radio" name="north-focus" value={item} checked={focus === item} onChange={() => setFocus(item)} />
              {FOCUS_LABEL[item]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="tn-label" htmlFor="tn-note">Bio note</label>
      <textarea id="tn-note" className="tn-field tn-field--area" value={note} maxLength={280} onChange={e => setNote(e.target.value)} placeholder="A line about what you're walking toward." />
      <p className="tn-meta">{note.length}/280</p>

      <label className="tn-label" htmlFor="tn-date">Birth date</label>
      <input id="tn-date" className="tn-field" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
      <label className="tn-label" htmlFor="tn-time">Birth time, if you know it</label>
      <input id="tn-time" className="tn-field" type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)} />
      <label className="tn-label" htmlFor="tn-place">Birth place</label>
      <LocationAutocomplete id="tn-place" value={birthLocation} onChange={setBirthLocation} inputClassName="tn-field" />

      {error && <p className="tn-alert" role="alert">{error}</p>}
      <p className="tn-meta" role="status">{saved ? "Saved to your account." : "Saved on this account only."}</p>
      <button type="submit" className="cta-pist tn-action" disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved" : "Save profile"}
      </button>
    </form>
  );
}
