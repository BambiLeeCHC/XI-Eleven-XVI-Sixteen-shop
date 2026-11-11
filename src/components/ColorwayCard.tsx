import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { swatchFocus } from "../lib/swatchFocus";
import { hiResProductImage } from "../lib/productImage";

export function ColorwayGallery({
  images,
  label,
}: {
  images: string[];
  label: string;
}) {
  const photos = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const count = Math.max(photos.length, 1);
  const current = photos[index] || photos[0];

  const go = (next: number) => {
    if (photos.length < 2) return;
    setIndex((next + photos.length) % photos.length);
  };

  return (
    <div
      className="look-card__stage"
      onPointerDown={event => {
        startX.current = event.clientX;
      }}
      onPointerUp={event => {
        const dx = event.clientX - startX.current;
        if (dx > 28) go(index - 1);
        if (dx < -28) go(index + 1);
      }}
      onMouseMove={event => {
        if (photos.length < 2 || event.buttons) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientX - rect.left) / rect.width;
        const next = Math.min(
          photos.length - 1,
          Math.max(0, Math.floor(ratio * photos.length)),
        );
        if (next !== index) setIndex(next);
      }}
    >
      {current ? (
        <img
          src={hiResProductImage(current, 900)}
          alt={label}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span aria-hidden="true">✦</span>
      )}
      {photos.length > 1 ? (
        <>
          <button
            type="button"
            className="look-card__arrow look-card__arrow--prev"
            aria-label="Previous image"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              go(index - 1);
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="look-card__arrow look-card__arrow--next"
            aria-label="Next image"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              go(index + 1);
            }}
          >
            ›
          </button>
          <span className="look-card__dots" aria-hidden="true">
            {photos.map((src, dot) => (
              <i key={src} className={dot === index ? "is-on" : ""} />
            ))}
          </span>
          <span className="sr-only">
            Image {index + 1} of {count}
          </span>
        </>
      ) : null}
    </div>
  );
}

export function ColorwayCard({
  href,
  name,
  price,
  images,
}: {
  href: string;
  name: string;
  price?: string;
  images: string[];
}) {
  return (
    <article className="look-card">
      <Link to={href}>
        <ColorwayGallery images={images} label={name} />
        <span className="look-card__meta">
          <span className="look-card__name">{name}</span>
          {price ? <span className="look-card__price">{price}</span> : null}
        </span>
      </Link>
    </article>
  );
}

export function MockupChip({
  href,
  label,
  image,
  glow,
}: {
  href: string;
  label: string;
  image?: string;
  glow: string;
}) {
  const focus = swatchFocus(label);
  return (
    <Link
      to={href}
      aria-label={label}
      className="snap look-chip"
      style={{
        backgroundColor: glow,
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: image ? `${focus.zoom * 100}%` : undefined,
        backgroundPosition: image
          ? `${focus.x * 100}% ${focus.y * 100}%`
          : undefined,
        boxShadow: `0 0 10px ${glow}`,
        ["--glow" as string]: glow,
      }}
    />
  );
}
