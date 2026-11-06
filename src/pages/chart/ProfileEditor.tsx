import { useEffect, useState, type FormEvent } from "react";
import { LocationAutocomplete } from "../../components/LocationAutocomplete";
import { api, useMutation } from "../../lib/backend";
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

export type ProfileAccount = {
  name?: string | null;
  northFocus?: string | null;
  northNote?: string | null;
  birthDate?: string | null;
  birthTime?: string | null;
  birthLocation?: string | null;
  northOnboardedAt?: string | null;
};

export function ProfileEditor({
  user,
  onSaved,
}: {
  user: ProfileAccount;
  onSaved?: () => void;
}) {
  const updateNorth = useMutation(api.profile.updateNorth);
  const [name, setName] = useState(user?.name ?? "");
  const [focus, setFocus] = useState<NorthFocus>(
    NORTH_FOCUSES.includes(user?.northFocus as NorthFocus) ? (user.northFocus as NorthFocus) : "general",
  );
  const [note, setNote] = useState(user?.northNote ?? "");
  const [birthDate, setBirthDate] = useState(
    user?.birthDate ? String(user.birthDate).slice(0, 10) : "",
  );
  const [birthTime, setBirthTime] = useState(clockTime(user?.birthTime ?? undefined));
  const [birthLocation, setBirthLocation] = useState(user?.birthLocation ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setFocus(
      NORTH_FOCUSES.includes(user?.northFocus as NorthFocus) ? (user.northFocus as NorthFocus) : "general",
    );
    setNote(user?.northNote ?? "");
    setBirthDate(user?.birthDate ? String(user.birthDate).slice(0, 10) : "");
    setBirthTime(clockTime(user?.birthTime ?? undefined));
    setBirthLocation(user?.birthLocation ?? "");
  }, [
    user?.name,
    user?.northFocus,
    user?.northNote,
    user?.birthDate,
    user?.birthTime,
    user?.birthLocation,
  ]);

  const handleSave = async (event: FormEvent) => {
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
    <form className="tn-card tn-profile__editor" id="details" onSubmit={handleSave}>
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
        onChange={event => setName(event.target.value)}
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
        onChange={event => setNote(event.target.value)}
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
        onChange={event => setBirthDate(event.target.value)}
      />

      <label className="tn-label" htmlFor="tn-time">
        Birth time, if you know it
      </label>
      <input
        id="tn-time"
        className="tn-field"
        type="time"
        value={birthTime}
        onChange={event => setBirthTime(event.target.value)}
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
        {saving ? "Saving…" : saved ? "Saved" : welcoming ? "Save and continue" : "Save profile"}
      </button>
    </form>
  );
}
