import { useRef } from "react";
import { nextEnabledIndex } from "../lib/radialDial";

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
  const start = Math.max(0, options.findIndex(option => option.id === currentId));
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

  return (
    <div className="variant-pick">
      <fieldset>
        <legend>Size</legend>
        <div role="radiogroup" aria-label="Select a size">
          {sizes.map(option => {
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
                disabled={!option.available}
                className={selected ? "is-on" : undefined}
                onClick={() => onSize(option.id)}
                onKeyDown={event => move(event, sizes, sizeId, onSize, sizeRefs)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      {colors.length > 0 ? (
        <fieldset>
          <legend>Color</legend>
          <div role="radiogroup" aria-label="Select a color">
            {colors.map(option => {
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
                  disabled={!option.available}
                  className={`variant-pick__color${selected ? " is-on" : ""}`}
                  aria-label={option.label}
                  onClick={() => onColor(option.id)}
                  onKeyDown={event => move(event, colors, colorId, onColor, colorRefs)}
                >
                  <i style={{ background: option.hex || "#8A847C" }} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
