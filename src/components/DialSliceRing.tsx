import { type CSSProperties, type KeyboardEvent, type ReactNode, useId, useRef } from "react";
import { nextEnabledIndex } from "../lib/radialDial";

export type DialSlice = {
  id: string;
  label: string;
  available?: boolean;
  /** Glow color. */
  fill?: string;
  /** Product mockup. The slice shows a zoomed crop of the print. */
  image?: string;
  /** Focal point in the mockup, 0–1, and how far to zoom. */
  focus?: { x: number; y: number; zoom: number; cover?: boolean };
};

function mockupWindow(focus?: { x: number; y: number; zoom: number; cover?: boolean }) {
  const zoom = focus?.zoom ?? 3.4;
  const x = focus?.x ?? 0.5;
  const y = focus?.y ?? 0.52;
  const size = 100 / zoom;
  const vx = Math.min(100 - size, Math.max(0, x * 100 - size / 2));
  const vy = Math.min(100 - size, Math.max(0, y * 100 - size / 2));
  return `${vx} ${vy} ${size} ${size}`;
}

const CX = 100;
const CY = 100;
const OUTER = 94;
const INNER = 58;

function point(radius: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function sector(start: number, end: number, outer: number) {
  const large = end - start > 180 ? 1 : 0;
  const [x1, y1] = point(outer, start);
  const [x2, y2] = point(outer, end);
  const [x3, y3] = point(INNER, end);
  const [x4, y4] = point(INNER, start);
  return `M ${x1} ${y1} A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${INNER} ${INNER} 0 ${large} 0 ${x4} ${y4} Z`;
}

function ink(fill: string | undefined, hot: boolean) {
  if (!fill) return hot ? "#142010" : "#f7f0e6";
  const hex = fill.replace("#", "");
  if (hex.length < 6) return "#f7f0e6";
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.64 ? "#141414" : "#f7f0e6";
}

/**
 * Equal slices of the ring only. The center stays open.
 * One slice per option, 360/N degrees, with a thin gap between them.
 */
export function DialSliceRing({
  slices,
  activeId,
  hotId,
  onHot,
  onSelect,
  ariaLabel,
  tint,
  children,
}: {
  slices: DialSlice[];
  activeId?: string;
  hotId?: string | null;
  onHot?: (id: string) => void;
  onSelect: (id: string) => void;
  ariaLabel: string;
  tint?: string;
  children?: ReactNode;
}) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const patternId = `slice-sold-${rawId}`;
  const refs = useRef<Record<string, SVGPathElement | null>>({});
  const count = slices.length;
  const full = count ? 360 / count : 360;
  const gap = Math.min(2.8, full * 0.1);

  const move = (event: KeyboardEvent<SVGPathElement>, id: string) => {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!delta) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const slice = slices.find(item => item.id === id);
        if (slice && slice.available !== false) onSelect(id);
      }
      return;
    }
    event.preventDefault();
    const start = Math.max(
      0,
      slices.findIndex(item => item.id === id),
    );
    const next = nextEnabledIndex(
      start,
      delta,
      slices.map(item => item.available !== false),
    );
    const option = slices[next];
    if (!option) return;
    onHot?.(option.id);
    refs.current[option.id]?.focus({ preventScroll: true });
  };

  return (
    <div
      className="dial-slices"
      style={{ "--dial-tint": tint || "transparent" } as CSSProperties}
    >
      <svg viewBox="0 0 200 200" role="radiogroup" aria-label={ariaLabel}>
        <defs>
          <pattern
            id={patternId}
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(40)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="5"
              stroke="rgba(8,10,14,0.72)"
              strokeWidth="2.2"
            />
          </pattern>
          {slices.map(slice =>
            slice.image ? (
              <pattern
                key={slice.id}
                id={`mock-${rawId}-${slice.id.replace(/[^a-zA-Z0-9]/g, "")}`}
                patternUnits="objectBoundingBox"
                width="1"
                height="1"
                viewBox={mockupWindow(slice.focus)}
                preserveAspectRatio={
                  slice.focus?.cover ? "xMidYMid slice" : undefined
                }
              >
                <image
                  href={slice.image}
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid slice"
                />
              </pattern>
            ) : null,
          )}
        </defs>
        {tint ? (
          <circle
            className="dial-slices__aura"
            cx={CX}
            cy={CY}
            r={OUTER + 1}
            fill="none"
            stroke={tint}
            strokeWidth="7"
          />
        ) : null}
        {slices.map((slice, index) => {
          const start = index * full + gap / 2;
          const end = (index + 1) * full - gap / 2;
          const span = Math.max(end - start, 0.5);
          const mid = start + span / 2;
          const hot = hotId === slice.id;
          const active = activeId === slice.id;
          const sold = slice.available === false;
          const outer = hot || active ? OUTER + 3.5 : OUTER;
          const [lx, ly] = point((INNER + outer) / 2, mid);
          const flip = mid > 90 && mid < 270;
          const rot = flip ? mid + 180 : mid;
          const font = Math.min(
            full > 70 ? 6.4 : full > 40 ? 5 : 3.8,
            Math.max(3.1, 46 / Math.max(slice.label.length, 1)),
          );
          return (
            <g key={slice.id} className={sold ? "is-off" : undefined}>
              <path
                ref={node => {
                  refs.current[slice.id] = node;
                }}
                d={sector(start, end, outer)}
                className={`dial-slice${hot ? " is-hot" : ""}${active ? " is-on" : ""}${sold ? " is-off" : ""}${slice.fill ? " is-color" : ""}${slice.image ? " has-photo" : ""}`}
                style={{ "--slice": slice.fill || "#d8f0c4" } as CSSProperties}
                fill={
                  slice.image
                    ? `url(#mock-${rawId}-${slice.id.replace(/[^a-zA-Z0-9]/g, "")})`
                    : slice.fill || "rgba(247,240,230,0.16)"
                }
                tabIndex={sold ? -1 : active || (!activeId && index === 0) ? 0 : -1}
                role="radio"
                aria-checked={active}
                aria-disabled={sold || undefined}
                aria-label={
                  sold ? `${slice.label}, sold out` : slice.label
                }
                onPointerEnter={() => {
                  if (!sold) onHot?.(slice.id);
                }}
                onFocus={() => {
                  if (!sold) onHot?.(slice.id);
                }}
                onClick={() => {
                  if (!sold) onSelect(slice.id);
                }}
                onKeyDown={event => move(event, slice.id)}
              />
              {sold ? (
                <path
                  d={sector(start, end, outer)}
                  fill={`url(#${patternId})`}
                  pointerEvents="none"
                />
              ) : null}
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${rot} ${lx} ${ly})`}
                fontSize={font}
                fill={ink(slice.fill, hot || active)}
                className="dial-slice__label"
                pointerEvents="none"
              >
                {slice.label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="dial-slices__hub">{children}</div>
    </div>
  );
}
