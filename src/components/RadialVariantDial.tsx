import { useEffect, useRef, useState } from "react";
import { swatchFocus } from "../lib/swatchFocus";
import { DialSliceRing } from "./DialSliceRing";

export type DialOption = {
  id: string;
  label: string;
  available: boolean;
  hex?: string;
  /** Flat product mockup used to fill a color slice. */
  mockup?: string;
  focus?: { x: number; y: number; zoom: number; cover?: boolean };
};

type Props = {
  sizes: DialOption[];
  colors: DialOption[];
  sizeId: string;
  colorId: string;
  onSize: (id: string) => void;
  onColor: (id: string) => void;
  /** Fine pointer click or keyboard confirms the color. Touch only previews. */
  onCommit?: (colorId: string) => void;
  /** Size ring, when this product has no color ring. */
  onCommitSize?: (sizeId: string) => void;
  previews?: Record<string, string | undefined>;
  onPreviewId?: (id: string | null) => void;
  titleId?: string;
  /** When set, a tap selects the color the same way a click does. */
  selectOnTap?: boolean;
  /** Ask the dial to show the size ring or the color ring. */
  focus?: "size" | "color";
  /** Shop dial: color ring first, then a separate size step. */
  colorFirst?: boolean;
  /**
   * First tap on a swatch only previews it. A second tap on that swatch,
   * or a tap on the center, confirms.
   */
  confirmTwice?: boolean;
};

function finePointer() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function RadialVariantDial({
  sizes,
  colors,
  sizeId,
  colorId,
  onSize,
  onColor,
  onCommit,
  onCommitSize,
  previews,
  onPreviewId,
  titleId,
  selectOnTap,
  focus,
  colorFirst,
  confirmTwice,
}: Props) {
  const previewCb = useRef(onPreviewId);
  previewCb.current = onPreviewId;
  const [view, setView] = useState<"size" | "color">(
    colorFirst && colors.length > 0
      ? "color"
      : sizeId && colors.length > 0
        ? "color"
        : "size",
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const size = sizes.find(option => option.id === sizeId);
  const colorFocused = view === "color" && colors.length > 0;
  const shownId = hoveredId || colorId || "";
  const shown = colors.find(option => option.id === shownId);
  const previewSrc = shown ? previews?.[shown.id] : undefined;
  const photo = previewSrc && previewSrc !== failedSrc ? previewSrc : "";
  const tint = colorFocused && shown?.hex ? shown.hex : "";
  const colorLead = Boolean(colorFirst) && colors.length > 0;
  const open = colorLead || (Boolean(size) && colors.length > 0);
  const ring = colorFocused ? colors : sizes;

  const hubLabel =
    colorFocused && shown
      ? shown.label
      : size
        ? size.label
        : colorFirst
          ? "Color"
          : "Size";
  const hubKicker =
    colorFocused && shown ? (size?.label ?? "") : size ? "Size" : "";

  useEffect(() => {
    previewCb.current?.(colorFocused ? shownId || null : null);
  }, [colorFocused, shownId]);

  useEffect(() => {
    if (focus) setView(focus);
  }, [focus]);

  const pickSize = (id: string) => {
    onSize(id);
    if (colors.length > 0) {
      setHoveredId(null);
      setView("color");
      return;
    }
    onCommitSize?.(id);
  };

  const showPhoto = colorFocused && Boolean(photo);

  return (
    <div
      className={`radial-dial${open ? " is-open" : ""}${colorFocused ? " is-color" : ""}${showPhoto ? " has-preview" : ""}${tint ? " has-tint" : ""}`}
      style={{ "--dial-tint": tint || "transparent" } as React.CSSProperties}
    >
      <p className="radial-dial__title" id={titleId}>
        {colorFocused ? "Select a color" : "Select a size"}
      </p>
      <div className="radial-dial__fit">
        {colorFocused && !colorFirst ? (
          <button
            type="button"
            className="radial-dial__back"
            aria-label="Back to sizes"
            onClick={() => setView("size")}
          >
            <span aria-hidden="true">←</span>
          </button>
        ) : null}
        <div className="radial-dial__stage" style={{ width: "100%", height: "100%", transform: "none" }}>
          <DialSliceRing
            slices={ring.map(option => ({
              id: option.id,
              label: option.label,
              available: option.available,
              fill: colorFocused ? option.hex : undefined,
              image: colorFocused
                ? option.mockup || previews?.[option.id]
                : undefined,
              focus: colorFocused
                ? option.focus || swatchFocus(option.label)
                : undefined,
            }))}
            activeId={colorFocused ? colorId : sizeId}
            hotId={colorFocused ? hoveredId : null}
            tint={tint || undefined}
            ariaLabel={colorFocused ? "Select a color" : "Select a size"}
            onHot={id => {
              if (colorFocused) setHoveredId(id);
            }}
            onSelect={id => {
              if (!colorFocused) {
                pickSize(id);
                return;
              }
              setHoveredId(id);
              if (confirmTwice) {
                if (id === colorId) onCommit?.(id);
                else onColor(id);
                return;
              }
              onColor(id);
              if (selectOnTap || finePointer()) onCommit?.(id);
            }}
          >
            {showPhoto ? (
              <img
                className="dial-slices__photo"
                src={photo}
                alt=""
                draggable={false}
                onError={() => setFailedSrc(photo)}
              />
            ) : null}
            {confirmTwice && colorId ? (
              <button
                type="button"
                className="radial-dial__hub-go"
                aria-label={`Continue with ${colors.find(option => option.id === colorId)?.label || "this color"}`}
                onClick={() => onCommit?.(colorId)}
              />
            ) : null}
            <span className="radial-dial__hub-copy">
              {hubKicker ? (
                <span className="radial-dial__hub-kicker">{hubKicker}</span>
              ) : null}
              <span className="radial-dial__hub-label">{hubLabel}</span>
            </span>
          </DialSliceRing>
        </div>
      </div>
      <p className="radial-dial__status">
        {colorLead && !size
          ? shown
            ? confirmTwice && shown.id === colorId
              ? `Tap ${shown.label} again to continue.`
              : shown.available
                ? shown.label
                : `${shown.label} is sold out.`
            : colors.some(option => !option.available)
              ? "Choose a color. Lined-through colors are sold out."
              : "Choose a color on the ring."
          : !size
            ? sizes.some(option => !option.available)
              ? "Choose a size. Lined-through sizes are sold out."
              : "Choose a size on the ring."
            : colors.length === 0
              ? size.available
                ? `${size.label} selected.`
                : `${size.label} is sold out.`
              : !shown
                ? `${size.label} selected. Choose a color on the outer ring.`
                : `${size.label} in ${shown.label}.`}
      </p>
    </div>
  );
}
