import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AVATAR_STYLES,
  type AvatarStyleId,
  createTrueNorthAvatar,
  resizeImageFile,
} from "../../lib/celestialAvatar";
import { activeAvatarUrl, type SpaceProfile } from "../../lib/northSocial";
import { SkyAvatar } from "./SkyAvatar";

type Draft = {
  photoUrl: string;
  aiAvatarUrl: string;
  avatarMode: SpaceProfile["avatarMode"];
};

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
  const [style, setStyle] = useState<AvatarStyleId>("astral");
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

  const commit = (next: Draft, message: string) => {
    setPhotoUrl(next.photoUrl);
    setAiAvatarUrl(next.aiAvatarUrl);
    setAvatarMode(next.avatarMode);
    onSave(next);
    setNote(message);
  };

  const generate = async (photo: string, nextStyle = style) => {
    setBusy(true);
    setNote("Creating your True North AI Avatar…");
    try {
      const result = await createTrueNorthAvatar({
        imageDataUrl: photo,
        name: space.name,
        sun: space.sun,
        moon: space.moon,
        rising: space.rising,
        altar: space.altar,
        style: nextStyle,
      });
      commit(
        { photoUrl: photo, aiAvatarUrl: result.imageDataUrl, avatarMode: "ai" },
        result.source === "api"
          ? "True North AI Avatar saved."
          : "True North celestial portrait saved.",
      );
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Couldn't create that portrait.");
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setNote("");
    try {
      const photo = await resizeImageFile(file);
      setPhotoUrl(photo);
      await generate(photo);
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Couldn't use that photo.");
      setBusy(false);
    }
  };

  const shown = activeAvatarUrl({ photoUrl, aiAvatarUrl, avatarMode });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="avatar-studio">
        <DialogHeader>
          <DialogTitle>True North AI Avatar</DialogTitle>
          <DialogDescription>
            Upload a photo. We keep your likeness and wrap it in your chart's light.
          </DialogDescription>
        </DialogHeader>

        <div className="avatar-studio__hero">
          <SkyAvatar name={space.name} sign={space.sun} src={shown} size={148} />
        </div>

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

        <div className="avatar-studio__styles" role="radiogroup" aria-label="Celestial style">
          {AVATAR_STYLES.map(item => (
            <label key={item.id} className={style === item.id ? "is-on" : ""}>
              <input
                type="radio"
                name="avatar-style"
                value={item.id}
                checked={style === item.id}
                onChange={() => setStyle(item.id)}
              />
              {item.label}
            </label>
          ))}
        </div>

        <button
          type="button"
          className="cta-pist tn-action"
          disabled={busy || !photoUrl}
          onClick={() => void generate(photoUrl)}
        >
          {busy ? "Creating…" : "Create True North AI Avatar"}
        </button>

        {(photoUrl || aiAvatarUrl) && (
          <div className="avatar-studio__compare">
            <button
              type="button"
              className={avatarMode === "ai" ? "is-on" : ""}
              onClick={() => commit({ photoUrl, aiAvatarUrl, avatarMode: "ai" }, "Showing your True North AI Avatar.")}
            >
              <SkyAvatar name={space.name} sign={space.sun} src={aiAvatarUrl || photoUrl} size={96} />
              <span>True North AI Avatar</span>
            </button>
            <button
              type="button"
              className={avatarMode === "original" ? "is-on" : ""}
              disabled={!photoUrl}
              onClick={() => commit({ photoUrl, aiAvatarUrl, avatarMode: "original" }, "Showing your original photo.")}
            >
              <SkyAvatar name={space.name} sign={space.sun} src={photoUrl} size={96} />
              <span>Original Photo</span>
            </button>
          </div>
        )}

        {note && <p className="avatar-studio__note" role="status">{note}</p>}
      </DialogContent>
    </Dialog>
  );
}
