import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type DialOption, RadialVariantDial } from "./RadialVariantDial";

type Phase = "closed" | "rising" | "open" | "falling";

export type HoloChoice = { sizeId: string; colorId: string };

type Box = { top: number; left: number; size: number; height: number };

type Props = {
  sizes: DialOption[];
  colorsForSize: (sizeId: string) => DialOption[];
  committedSize: string;
  committedColor: string;
  previewFor: (colorId: string) => string | undefined;
  tint: string;
  valueLabel: string;
  onCommit: (choice: HoloChoice) => void;
};

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function readBox(node: HTMLElement): Box {
  const rect = node.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const header = 84;
  const chrome = 112;
  const room = Math.max(150, rect.top - header - 12);
  const size = Math.min(
    320,
    Math.max(188, vw - 20),
    Math.max(188, room - chrome),
  );
  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - size / 2, 8),
    Math.max(8, vw - size - 8),
  );
  const top = Math.max(header, rect.top - size - chrome);
  const height = Math.max(48, rect.top - top + 2);
  return { top, left, size, height };
}

export function VariantHologram({
  sizes,
  colorsForSize,
  committedSize,
  committedColor,
  previewFor,
  tint,
  valueLabel,
  onCommit,
}: Props) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [draftSize, setDraftSize] = useState(committedSize);
  const [draftColor, setDraftColor] = useState(committedColor);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [hint, setHint] = useState("Hover a color to preview");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  const draftSizeRef = useRef(draftSize);
  const pending = useRef<HoloChoice | null>(null);
  const settled = useRef(false);
  const titleId = useId();
  phaseRef.current = phase;
  draftSizeRef.current = draftSize;

  const colors = colorsForSize(draftSize);
  const previews: Record<string, string | undefined> = {};
  for (const color of colors) previews[color.id] = previewFor(color.id);

  const live = colors.find(color => color.id === (previewId || draftColor));
  const beamTint = live?.hex || tint;
  const visible = phase !== "closed";
  const sizeLabel = sizes.find(size => size.id === draftSize)?.label;
  const canConfirm =
    Boolean(draftSize) &&
    (colors.length === 0 || Boolean(previewId || draftColor));

  const applyClose = () => {
    if (settled.current) return;
    settled.current = true;
    const choice = pending.current;
    pending.current = null;
    setPhase("closed");
    if (choice?.sizeId) onCommit(choice);
    buttonRef.current?.focus({ preventScroll: true });
  };
  const applyRef = useRef(applyClose);
  applyRef.current = applyClose;

  const beginClose = (choice: HoloChoice | null) => {
    if (phaseRef.current === "closed" || phaseRef.current === "falling") return;
    pending.current = choice;
    if (reducedMotion()) {
      applyRef.current();
      return;
    }
    settled.current = false;
    setPhase("falling");
  };
  const closeRef = useRef(beginClose);
  closeRef.current = beginClose;

  const place = useCallback(() => {
    const node = buttonRef.current;
    if (!node) return;
    setBox(readBox(node));
  }, []);

  const open = () => {
    if (phaseRef.current !== "closed") {
      beginClose(null);
      return;
    }
    settled.current = false;
    pending.current = null;
    setDraftSize(committedSize);
    setDraftColor(committedColor);
    setPreviewId(committedColor || null);
    const fine =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setHint(fine ? "Hover a color to preview" : "Tap a color to preview");
    place();
    setPhase(reducedMotion() ? "open" : "rising");
  };

  useEffect(() => {
    if (!visible) return;
    place();
    const onLayout = () => place();
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [visible, place]);

  useEffect(() => {
    if (phase !== "rising" && phase !== "falling") return;
    const ms = phase === "rising" ? 1200 : 900;
    const timer = window.setTimeout(() => {
      if (phaseRef.current === "rising") setPhase("open");
      if (phaseRef.current === "falling") applyRef.current();
    }, ms);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current(null);
        return;
      }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const items = [
        ...root.querySelectorAll<HTMLElement>(
          "button, [href], input, [tabindex]",
        ),
      ].filter(
        element => !element.hasAttribute("disabled") && element.tabIndex !== -1,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && (active === first || !root.contains(active))) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !root.contains(active))
      ) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  const previewKey = Object.values(previews)
    .filter((src): src is string => Boolean(src))
    .join("|");
  useEffect(() => {
    if (!visible || !previewKey) return;
    for (const src of previewKey.split("|")) {
      const image = new Image();
      image.src = src;
    }
  }, [visible, previewKey]);

  const confirm = () => {
    const sizeId = draftSizeRef.current;
    const colorId = previewId || draftColor || "";
    if (!sizeId) return;
    if (colors.length > 0 && !colorId) return;
    beginClose({ sizeId, colorId });
  };

  const sizeText = sizeLabel || "Size";
  const colorText = live?.label || "Color";
  const confirmLabel =
    colors.length === 0
      ? `Confirm ${sizeText}`
      : `Confirm ${sizeText} in ${colorText}`;

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className={`pdp-summon${visible ? " is-casting" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={visible}
        aria-controls={visible ? titleId : undefined}
        onClick={open}
      >
        <span className="pdp-summon__copy">
          <span className="pdp-summon__kicker">Select size / color</span>
          <span className="pdp-summon__value">{valueLabel}</span>
        </span>
        <span
          className="pdp-summon__swatch"
          style={{ background: tint }}
          aria-hidden="true"
        />
      </button>
      {visible && box
        ? createPortal(
            <div
              className={`holo holo--${phase}`}
              style={{ "--holo-tint": beamTint } as React.CSSProperties}
            >
              <button
                type="button"
                className="holo-scrim"
                aria-label="Dismiss size and color"
                onClick={() => beginClose(null)}
              />
              <div
                ref={dialogRef}
                className="holo-column"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                style={{
                  top: box.top,
                  left: box.left,
                  width: box.size,
                  height: box.height,
                }}
              >
                <div
                  className="holo-beam"
                  aria-hidden="true"
                  onAnimationEnd={event => {
                    if (event.target !== event.currentTarget) return;
                    if (
                      event.animationName === "holo-beam-up" &&
                      phaseRef.current === "rising"
                    )
                      setPhase("open");
                    if (
                      event.animationName === "holo-beam-down" &&
                      phaseRef.current === "falling"
                    )
                      applyRef.current();
                  }}
                />
                <div className="holo-projection">
                  <div className="holo-glow" aria-hidden="true" />
                  <RadialVariantDial
                    sizes={sizes}
                    colors={colors}
                    sizeId={draftSize}
                    colorId={draftColor}
                    previews={previews}
                    titleId={titleId}
                    onPreviewId={setPreviewId}
                    onSize={id => {
                      setDraftSize(id);
                      const next = colorsForSize(id);
                      const still = next.find(color => color.id === draftColor);
                      if (draftColor && !still?.available) setDraftColor("");
                    }}
                    onColor={id => setDraftColor(id)}
                    onCommit={colorId => {
                      const sizeId = draftSizeRef.current;
                      if (!sizeId || !colorId) return;
                      beginClose({ sizeId, colorId });
                    }}
                    onCommitSize={sizeId => beginClose({ sizeId, colorId: "" })}
                  />
                  {colors.length > 0 ? (
                    <p className="holo-hint">{hint}</p>
                  ) : null}
                  <button
                    type="button"
                    className="holo-confirm"
                    disabled={!canConfirm}
                    onClick={confirm}
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
