import { useRef } from "react";
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
};

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
  refs.current[option.id]?.focus();
}

export function RadialVariantDial({
  sizes,
  colors,
  sizeId,
  colorId,
  onSize,
  onColor,
}: Props) {
  const sizeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const colorRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const size = sizes.find(option => option.id === sizeId);
  const color = colors.find(option => option.id === colorId);
  const open = Boolean(size) && colors.length > 0;
  const sizeStep = ringStep(sizes.length);
  const colorStep = ringStep(colors.length);

  const hubLabel = color ? color.label : size ? size.label : "Size";
  const hubKicker = color ? size?.label : size ? "Size" : "";

  return (
    <div className={`radial-dial${open ? " is-open" : ""}`}>
      <p className="radial-dial__title">Select a size</p>
      <div
        className="radial-dial__stage"
        style={
          {
            "--size-step": `${sizeStep}deg`,
            "--color-step": `${colorStep}deg`,
          } as React.CSSProperties
        }
      >
        <div className="radial-dial__sheen" aria-hidden="true" />
        <div className="radial-dial__orbit radial-dial__orbit--size" aria-hidden="true" />
        {open ? (
          <div className="radial-dial__color-layer">
            <div className="radial-dial__orbit radial-dial__orbit--color" aria-hidden="true" />
          </div>
        ) : null}

        <div
          className="radial-dial__hub"
          aria-live="polite"
        >
          {hubKicker ? (
            <span className="radial-dial__hub-kicker">{hubKicker}</span>
          ) : null}
          <span className="radial-dial__hub-label">{hubLabel}</span>
          {color?.hex ? (
            <span
              className="radial-dial__hub-swatch"
              style={{ background: color.hex }}
              aria-hidden="true"
            />
          ) : null}
        </div>

        <div role="radiogroup" aria-label="Select a size">
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
                    : `Size ${option.label}, unavailable`
                }
                disabled={!option.available}
                tabIndex={selected || (!sizeId && index === 0) ? 0 : -1}
                className={`radial-dial__tick radial-dial__tick--size${selected ? " is-on" : ""}${option.available ? "" : " is-off"}`}
                style={{ "--i": index } as React.CSSProperties}
                onClick={() => option.available && onSize(option.id)}
                onKeyDown={event =>
                  move(event, sizes, sizeId, onSize, sizeRefs)
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {open ? (
          <div role="radiogroup" aria-label="Select a color">
            {colors.map((option, index) => {
              const selected = option.id === colorId;
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
                      : `Color ${option.label}, unavailable in this size`
                  }
                  disabled={!option.available}
                  tabIndex={selected || (!colorId && index === 0) ? 0 : -1}
                  className={`radial-dial__tick radial-dial__tick--color${selected ? " is-on" : ""}${option.available ? "" : " is-off"}`}
                  style={
                    {
                      "--i": index,
                      "--swatch": option.hex || "#8A847C",
                    } as React.CSSProperties
                  }
                  onClick={() => option.available && onColor(option.id)}
                  onKeyDown={event =>
                    move(event, colors, colorId, onColor, colorRefs)
                  }
                >
                  <span className="radial-dial__swatch" />
                  <span className="radial-dial__color-name">{option.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <p className="radial-dial__status">
        {!size
          ? "Choose a size on the ring."
          : colors.length === 0
            ? `${size.label} selected.`
            : !color
              ? `${size.label} selected. Choose a color on the inner ring.`
              : `${size.label} in ${color.label}.`}
      </p>
    </div>
  );
}
