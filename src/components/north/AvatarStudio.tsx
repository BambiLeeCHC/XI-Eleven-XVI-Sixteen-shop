import { useEffect, useMemo, useRef, useState } from "react";
import {
  celestialPortraitSvg,
  type HairStyle,
  type Outfit,
  resizeImageFile,
  type SkinTone,
  stylizeCelestialPortrait,
} from "../../lib/celestialAvatar";
import type { SpaceProfile } from "../../lib/northSocial";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { SkyAvatar } from "./SkyAvatar";

type Draft = {
  photoUrl: string;
  aiAvatarUrl: string;
  avatarMode: SpaceProfile["avatarMode"];
};

type StudioMode = "character" | "photo";

const FITS: { id: Outfit; label: string; fit: string }[] = [
  { id: "hoodie", label: "Obsidian Hoodie", fit: "obsidian-hoodie" },
  { id: "mockneck", label: "Sage Mock-Neck", fit: "sage-mockneck" },
  { id: "varsity", label: "Astral Varsity", fit: "astral-varsity" },
  { id: "cloak", label: "Celestial Cloak", fit: "cloak" },
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

export function AvatarStudio({
  open,
  onOpenChange,
  space,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: SpaceProfile;
  onSave: (next: Draft) => void;
}) {
  const [photoUrl, setPhotoUrl] = useState(space.photoUrl);
  const [aiAvatarUrl, setAiAvatarUrl] = useState(space.aiAvatarUrl);
  const [avatarMode, setAvatarMode] = useState(space.avatarMode);
  const [mode, setMode] = useState<StudioMode>("character");
  const [outfit, setOutfit] = useState<Outfit>("hoodie");
  const [hairStyle, setHairStyle] = useState<HairStyle>("curls");
  const [skinTone, setSkinTone] = useState<SkinTone>("honey");
  const [glasses, setGlasses] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const spaceRef = useRef(space);
  spaceRef.current = space;

  useEffect(() => {
    if (!open) return;
    const current = spaceRef.current;
    setPhotoUrl(current.photoUrl);
    setAiAvatarUrl(current.aiAvatarUrl);
    setAvatarMode(current.avatarMode);
    setNote("");
  }, [open]);

  const fit = FITS.find(item => item.id === outfit)?.fit ?? "obsidian-hoodie";
  const cartoon = useMemo(
    () =>
      celestialPortraitSvg(space.name || "You", {
        outfit,
        hairStyle,
        skinTone,
        glasses,
      }),
    [space.name, outfit, hairStyle, skinTone, glasses],
  );

  const commit = (next: Draft, message: string) => {
    setPhotoUrl(next.photoUrl);
    setAiAvatarUrl(next.aiAvatarUrl);
    setAvatarMode(next.avatarMode);
    onSave(next);
    setNote(message);
  };

  const saveCharacter = () => {
    commit(
      { photoUrl, aiAvatarUrl: cartoon, avatarMode: "ai" },
      "XI · XVI character saved to My Sky.",
    );
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setNote("Cartoonizing your photo…");
    try {
      const photo = await resizeImageFile(file);
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const picture = new Image();
        picture.onload = () => resolve(picture);
        picture.onerror = () => reject(new Error("Couldn't open that photo."));
        picture.src = photo;
      });
      const painted = await stylizeCelestialPortrait(image, {
        outfit,
        hairStyle,
        skinTone,
        glasses,
      });
      setMode("photo");
      commit(
        { photoUrl: photo, aiAvatarUrl: painted, avatarMode: "ai" },
        "Photo cartoonized in the XI · XVI frame.",
      );
    } catch (error) {
      setNote(
        error instanceof Error ? error.message : "Couldn't use that photo.",
      );
    } finally {
      setBusy(false);
    }
  };

  const generate = async () => {
    if (!photoUrl) {
      setNote("Upload a photo to generate an AI cartoon.");
      return;
    }
    setBusy(true);
    setNote("Drawing your XI · XVI cartoon…");
    try {
      const response = await fetch("/api/avatar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image: photoUrl,
          name: space.name,
          sun: space.sun,
          moon: space.moon,
          rising: space.rising,
          fit,
          style: { hair: hairStyle, skin: skinTone, glasses, outfit },
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        imageDataUrl?: string;
        fallback?: boolean;
      } | null;
      if (data?.success && data.imageDataUrl?.startsWith("data:image/")) {
        commit(
          { photoUrl, aiAvatarUrl: data.imageDataUrl, avatarMode: "ai" },
          "AI cartoon avatar saved.",
        );
      } else {
        commit(
          { photoUrl, aiAvatarUrl: cartoon, avatarMode: "ai" },
          "The house model was quiet, so the XI · XVI character was saved.",
        );
      }
    } catch {
      commit(
        { photoUrl, aiAvatarUrl: cartoon, avatarMode: "ai" },
        "Saved the XI · XVI character instead.",
      );
    } finally {
      setBusy(false);
    }
  };

  const preview =
    mode === "photo" && avatarMode === "original" && photoUrl
      ? photoUrl
      : mode === "photo" && aiAvatarUrl
        ? aiAvatarUrl
        : cartoon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="avatar-studio">
        <DialogHeader>
          <DialogTitle>XI · XVI Avatar</DialogTitle>
          <DialogDescription>
            Draw a house character, or cartoonize a photo into the same crest.
          </DialogDescription>
        </DialogHeader>

        <div
          className="avatar-studio__modes"
          role="tablist"
          aria-label="Avatar studio mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "character"}
            className={mode === "character" ? "is-on" : ""}
            onClick={() => setMode("character")}
          >
            Cartoon Character
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "photo"}
            className={mode === "photo" ? "is-on" : ""}
            onClick={() => setMode("photo")}
          >
            Cartoonize Photo
          </button>
        </div>

        <img
          className="avatar-studio__preview"
          src={preview}
          alt="XI · XVI cartoon avatar preview"
        />

        <div
          className="avatar-studio__fits"
          role="tablist"
          aria-label="XI · XVI brand fit"
        >
          {FITS.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={outfit === item.id}
              className={outfit === item.id ? "is-on" : ""}
              onClick={() => setOutfit(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="avatar-studio__traits">
          <label>
            <span className="tn-label">Hair</span>
            <select
              className="tn-field"
              value={hairStyle}
              onChange={event => setHairStyle(event.target.value as HairStyle)}
            >
              {HAIR.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="tn-label">Skin</span>
            <select
              className="tn-field"
              value={skinTone}
              onChange={event => setSkinTone(event.target.value as SkinTone)}
            >
              {SKIN.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="tn-choice__item">
            <input
              type="checkbox"
              checked={glasses}
              onChange={event => setGlasses(event.target.checked)}
            />
            Glasses
          </label>
        </div>

        {mode === "character" ? (
          <button
            type="button"
            className="cta-pist tn-action"
            onClick={saveCharacter}
          >
            Save XI · XVI Avatar
          </button>
        ) : (
          <>
            <label className="avatar-studio__file">
              Upload photo
              <input
                type="file"
                accept="image/*"
                onChange={event => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  void onFile(file);
                }}
              />
            </label>
            <button
              type="button"
              className="cta-pist tn-action"
              disabled={busy || !photoUrl}
              onClick={() => void generate()}
            >
              {busy ? "Drawing…" : "Generate AI Cartoon Avatar"}
            </button>
            {photoUrl && (
              <div className="avatar-studio__compare">
                <button
                  type="button"
                  className={avatarMode === "ai" ? "is-on" : ""}
                  onClick={() =>
                    commit(
                      {
                        photoUrl,
                        aiAvatarUrl: aiAvatarUrl || cartoon,
                        avatarMode: "ai",
                      },
                      "Showing your cartoon avatar.",
                    )
                  }
                >
                  <SkyAvatar
                    name={space.name}
                    sign={space.sun}
                    src={aiAvatarUrl || cartoon}
                    size={84}
                  />
                  <span>Cartoon Avatar</span>
                </button>
                <button
                  type="button"
                  className={avatarMode === "original" ? "is-on" : ""}
                  onClick={() =>
                    commit(
                      { photoUrl, aiAvatarUrl, avatarMode: "original" },
                      "Showing your original photo.",
                    )
                  }
                >
                  <SkyAvatar
                    name={space.name}
                    sign={space.sun}
                    src={photoUrl}
                    size={84}
                  />
                  <span>Original Photo</span>
                </button>
              </div>
            )}
          </>
        )}

        {note && (
          <p className="avatar-studio__note" role="status">
            {note}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
