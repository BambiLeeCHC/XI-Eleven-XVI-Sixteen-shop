import { useMemo, useState } from "react";
import {
  type AvatarFit,
  type AvatarStyleOptions,
  celestialPortraitSvg,
  type HairStyle,
  type Outfit,
  type SkinTone,
  stylizeCelestialPortrait,
} from "../../lib/celestialAvatar";
import { supabase } from "../../lib/supabase";

const FITS: { id: AvatarFit; label: string }[] = [
  { id: "obsidian-hoodie", label: "Obsidian hoodie" },
  { id: "sage-mockneck", label: "Sage mock-neck" },
  { id: "astral-varsity", label: "Astral varsity" },
];

const HAIR: HairStyle[] = [
  "curls",
  "waves",
  "locs",
  "bob",
  "bangs",
  "fade",
  "braids",
];
const SKIN: SkinTone[] = [
  "porcelain",
  "sand",
  "honey",
  "amber",
  "bronze",
  "deep",
];
const OUTFITS: Outfit[] = ["hoodie", "mockneck", "varsity", "cloak"];

export function AvatarStudio({
  seed,
  onClose,
}: {
  seed: string;
  onClose: () => void;
}) {
  const [fit, setFit] = useState<AvatarFit>("obsidian-hoodie");
  const [style, setStyle] = useState<AvatarStyleOptions>({ glasses: false });
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const portrait = useMemo(
    () => celestialPortraitSvg(seed, { ...style, fit }),
    [seed, style, fit],
  );
  const shown =
    photo ?? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(portrait)}`;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = async () => {
      try {
        const next = await stylizeCelestialPortrait(image, { ...style, fit });
        setPhoto(next);
        setNote("Cartoon preview is ready. Generate to try the house model.");
      } catch {
        setNote(
          "Couldn't cartoonize that photo. The XI · XVI character is still here.",
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.src = url;
  };

  const generate = async () => {
    setBusy(true);
    setNote("");
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const response = await fetch("/api/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          image: photo ?? undefined,
          fit,
          style: { ...style, fit },
          seed,
        }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        image?: string;
        error?: string;
      };
      if (payload.image) {
        setPhoto(payload.image);
        setNote("XI · XVI character saved in this preview.");
      } else if ("error" in payload && payload.error) {
        setNote(payload.error);
      }
    } catch {
      setNote("The studio kept your cartoon character.");
    }
    setBusy(false);
  };

  return (
    <section className="tn-card avatar-studio" aria-label="Avatar studio">
      <p className="label-lock">XI · XVI character</p>
      <h2 className="clash north-post__title">Cartoon avatar</h2>
      <img
        className="avatar-studio__preview"
        src={shown}
        alt="Cartoon XI · XVI avatar preview"
      />
      <div className="tn-subtabs" role="tablist" aria-label="House fit">
        {FITS.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={fit === item.id}
            className={fit === item.id ? "is-on" : ""}
            onClick={() => setFit(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="avatar-studio__picks">
        <label className="tn-label" htmlFor="avatar-hair">
          Hair
        </label>
        <select
          id="avatar-hair"
          className="tn-field"
          value={style.hairStyle ?? ""}
          onChange={event =>
            setStyle(current => ({
              ...current,
              hairStyle: (event.target.value || undefined) as
                | HairStyle
                | undefined,
            }))
          }
        >
          <option value="">Seeded</option>
          {HAIR.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <label className="tn-label" htmlFor="avatar-skin">
          Skin
        </label>
        <select
          id="avatar-skin"
          className="tn-field"
          value={style.skinTone ?? ""}
          onChange={event =>
            setStyle(current => ({
              ...current,
              skinTone: (event.target.value || undefined) as
                | SkinTone
                | undefined,
            }))
          }
        >
          <option value="">Seeded</option>
          {SKIN.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <label className="tn-label" htmlFor="avatar-outfit">
          Outfit
        </label>
        <select
          id="avatar-outfit"
          className="tn-field"
          value={style.outfit ?? ""}
          onChange={event =>
            setStyle(current => ({
              ...current,
              outfit: (event.target.value || undefined) as Outfit | undefined,
            }))
          }
        >
          <option value="">Match the fit</option>
          {OUTFITS.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <label className="tn-choice__item">
          <input
            type="checkbox"
            checked={Boolean(style.glasses)}
            onChange={event =>
              setStyle(current => ({
                ...current,
                glasses: event.target.checked,
              }))
            }
          />
          Glasses
        </label>
      </div>
      <label className="tn-label" htmlFor="avatar-photo">
        Photo to cartoonize
      </label>
      <input
        id="avatar-photo"
        className="tn-field"
        type="file"
        accept="image/*"
        onChange={event => onFile(event.target.files?.[0])}
      />
      {note ? <p className="tn-meta">{note}</p> : null}
      <div className="tn-actions">
        <button
          type="button"
          className="cta-pist tn-action"
          onClick={generate}
          disabled={busy}
        >
          {busy ? "Drawing…" : "Generate character"}
        </button>
        <button type="button" className="cta-ghost tn-action" onClick={onClose}>
          Close
        </button>
      </div>
    </section>
  );
}
