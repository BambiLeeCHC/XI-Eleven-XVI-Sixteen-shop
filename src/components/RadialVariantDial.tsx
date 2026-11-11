import { useEffect, useRef, useState } from "react";
import { nextEnabledIndex, ringStep } from "../lib/radialDial";

export type DialOption = {
  id: string;
  label: string;
  available: boolean;
  hex?: string;
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
};

function finePointer() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function move(
  event: React.KeyboardEvent,
  options: DialOption[],
  currentId: string,
  onPick: (id: string) => void,
  refs: { current: Record<string, HTMLButtonElement | null> },
) {
  const delta =
    event.key === "ArrowRight" || event.key === "ArrowDown"
      ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? -1
        : 0;
  if (!delta) return;
  event.preventDefault();
  const enabled = options.map(option => option.available);
  const start = Math.max(
    0,
    options.findIndex(option => option.id === currentId),
  );
  const next = nextEnabledIndex(start, delta, enabled);
  if (next < 0) return;
  const option = options[next];
  if (!option) return;
  onPick(option.id);
  refs.current[option.id]?.focus({ preventScroll: true });
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
}: Props) {
  const sizeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const colorRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const fitRef = useRef<HTMLDivElement>(null);
  const previewCb = useRef(onPreviewId);
  previewCb.current = onPreviewId;
  const [scale, setScale] = useState(1);
  const [view, setView] = useState<"size" | "color">(
    colorFirst && colors.length > 0
      ? "color"
      : sizeId && colors.length > 0
        ? "color"
        : "size",
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    const node = fitRef.current;
    if (!node) return;
    const measure = () => {
      const width = node.getBoundingClientRect().width;
      setScale(width > 0 ? Math.min(1, width / 320) : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const size = sizes.find(option => option.id === sizeId);
  const colorFocused = view === "color" && colors.length > 0;
  const shownId = hoveredId || colorId || "";
  const shown = colors.find(option => option.id === shownId);
  const previewSrc = shown ? previews?.[shown.id] : undefined;
  const photo = previewSrc && previewSrc !== failedSrc ? previewSrc : "";
  const tint = colorFocused && shown?.hex ? shown.hex : "";
  const colorLead = Boolean(colorFirst) && colors.length > 0;
  const open = colorLead || (Boolean(size) && colors.length > 0);
  const sizeStep = ringStep(sizes.length);
  const colorStep = ringStep(colors.length);

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

  // Hover updates shownId and must not pull focus back onto the ring.
  // biome-ignore lint/correctness/useExhaustiveDependencies: view change only
  useEffect(() => {
    const id = colorFocused
      ? shownId || colors.find(option => option.available)?.id
      : sizeId || sizes.find(option => option.available)?.id;
    if (!id) return;
    const node = (colorFocused ? colorRefs : sizeRefs).current[id];
    node?.focus({ preventScroll: true });
  }, [colorFocused]);

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
      <div className="radial-dial__fit" ref={fitRef}>
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
        <div
          className="radial-dial__stage"
          style={
            {
              "--size-step": `${sizeStep}deg`,
              "--color-step": `${colorStep}deg`,
              "--dial-scale": scale,
            } as React.CSSProperties
          }
        >
          <div className="radial-dial__sheen" aria-hidden="true" />
          <div
            className="radial-dial__orbit radial-dial__orbit--size"
            aria-hidden="true"
          />
          {open ? (
            <div className="radial-dial__color-layer">
              <div
                className="radial-dial__orbit radial-dial__orbit--color"
                aria-hidden="true"
              />
            </div>
          ) : null}

          <div className="radial-dial__hub" aria-live="polite">
            {showPhoto ? (
              <img
                className="radial-dial__hub-photo"
                src={photo}
                alt=""
                draggable={false}
                onError={() => setFailedSrc(photo)}
              />
            ) : null}
            <span className="radial-dial__hub-copy">
              {hubKicker ? (
                <span className="radial-dial__hub-kicker">{hubKicker}</span>
              ) : null}
              <span className="radial-dial__hub-label">{hubLabel}</span>
            </span>
          </div>

          <div
            role="radiogroup"
            aria-label="Select a size"
            aria-hidden={colorFocused || undefined}
          >
            {sizes.map((option, index) => {
              const selected = option.id === sizeId;
              return (
                <button
                  key={option.id}
                  ref={node => {
                    sizeRefs.current[option.id] = node;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={
                    option.available
                      ? `Size ${option.label}`
                      : `Size ${option.label}, sold out`
                  }
                  disabled={!option.available}
                  tabIndex={
                    colorFocused
                      ? -1
                      : selected || (!sizeId && index === 0)
                        ? 0
                        : -1
                  }
                  className={`radial-dial__tick radial-dial__tick--size${selected ? " is-on" : ""}${option.available ? "" : " is-off"}`}
                  style={{ "--i": index } as React.CSSProperties}
                  onClick={() => option.available && pickSize(option.id)}
                  onKeyDown={event =>
                    move(event, sizes, sizeId, pickSize, sizeRefs)
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {open ? (
            <div
              role="radiogroup"
              aria-label="Select a color"
              aria-hidden={!colorFocused || undefined}
            >
              {colors.map((option, index) => {
                const selected = option.id === colorId;
                const hot = option.id === shownId;
                return (
                  <button
                    key={option.id}
                    ref={node => {
                      colorRefs.current[option.id] = node;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={
                      option.available
                        ? `Color ${option.label}`
                        : `Color ${option.label}, sold out`
                    }
                    disabled={!option.available}
                    tabIndex={
                      !colorFocused
                        ? -1
                        : selected || (!colorId && index === 0)
                          ? 0
                          : -1
                    }
                    className={`radial-dial__tick radial-dial__tick--color${selected ? " is-on" : ""}${hot ? " is-hot" : ""}${option.available ? "" : " is-off"}`}
                    style={
                      {
                        "--i": index,
                        "--swatch": option.hex || "#8A847C",
                      } as React.CSSProperties
                    }
                    onPointerEnter={() => {
                      if (!option.available) return;
                      setHoveredId(option.id);
                    }}
                    onFocus={() => {
                      if (!option.available) return;
                      setHoveredId(option.id);
                    }}
                    onClick={event => {
                      if (!option.available) return;
                      setHoveredId(option.id);
                      onColor(option.id);
                      const keyboard = event.detail === 0;
                      if (selectOnTap || keyboard || finePointer())
                        onCommit?.(option.id);
                    }}
                    onKeyDown={event =>
                      move(
                        event,
                        colors,
                        shownId || colorId,
                        id => {
                          setHoveredId(id);
                          onColor(id);
                        },
                        colorRefs,
                      )
                    }
                  >
                    <span className="radial-dial__swatch" />
                    <span className="radial-dial__color-name">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
      <p className="radial-dial__status">
        {colorLead && !size
          ? shown
            ? shown.available
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
