import { useEffect, useId, useRef, useState } from "react";

export type RimSlide = {
  id: string;
  label: string;
  image?: string;
  tint?: string;
  available?: boolean;
};

/**
 * One product at a time, inside the dial.
 * Arrows, swipe, and arrow keys change the preview.
 * The first tap marks that preview. The second tap on the same preview confirms it.
 */
export function DialRimCarousel({
  slides,
  index,
  onIndex,
  onConfirm,
  label,
}: {
  slides: RimSlide[];
  index: number;
  onIndex: (index: number) => void;
  onConfirm: (slide: RimSlide) => void;
  label: string;
}) {
  const rawId = useId();
  const pathId = `rim-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [primed, setPrimed] = useState(false);
  const startX = useRef(0);
  const dragged = useRef(false);
  const count = slides.length;
  const slide = slides[index] || slides[0];

  useEffect(() => {
    setPrimed(false);
  }, [slide?.id]);

  if (!slide || count === 0) return null;

  const step = (delta: number) => {
    if (count < 2) return;
    onIndex((index + delta + count) % count);
  };

  const activate = () => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (!primed) {
      setPrimed(true);
      return;
    }
    if (slide.available === false) return;
    onConfirm(slide);
  };

  const name = slide.label.toUpperCase();
  const soldOut = slide.available === false;

  return (
    <div
      className={`dial-rim${primed ? " is-armed" : ""}${soldOut ? " is-off" : ""}`}
      style={{ "--tint": slide.tint || "#e4d4f4" } as React.CSSProperties}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={event => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          step(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          step(-1);
        }
      }}
      onPointerDown={event => {
        startX.current = event.clientX;
      }}
      onPointerUp={event => {
        const dx = event.clientX - startX.current;
        if (Math.abs(dx) > 36) {
          dragged.current = true;
          step(dx > 0 ? -1 : 1);
        }
      }}
    >
      <div className="dial-rim__ring" aria-hidden="true" />
      <button
        type="button"
        className="dial-rim__photo"
        aria-label={
          soldOut
            ? `${slide.label}, sold out`
            : primed
              ? `${slide.label}. Tap again to continue`
              : slide.label
        }
        onClick={activate}
      >
        {slide.image ? (
          <img src={slide.image} alt="" draggable={false} />
        ) : (
          <span aria-hidden="true">✦</span>
        )}
      </button>
      <button
        type="button"
        className="dial-rim__arrow dial-rim__arrow--prev"
        aria-label="Previous"
        onClick={event => {
          event.stopPropagation();
          step(-1);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M14 5 L7 12 L14 19"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>
      <button
        type="button"
        className="dial-rim__arrow dial-rim__arrow--next"
        aria-label="Next"
        onClick={event => {
          event.stopPropagation();
          step(1);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M10 5 L17 12 L10 19"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>
      <svg className="dial-rim__name" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <path
            id={pathId}
            d="M 28,158 A 90,90 0 0 0 172,158"
            fill="none"
          />
        </defs>
        <text fontSize={name.length > 22 ? 5 : name.length > 16 ? 5.6 : 6.8}>
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {soldOut ? `${name} · SOLD OUT` : name}
          </textPath>
        </text>
      </svg>
      <p className="dial-rim__hint" aria-live="polite">
        {soldOut ? "Sold out" : primed ? "Tap again" : ""}
      </p>
    </div>
  );
}
