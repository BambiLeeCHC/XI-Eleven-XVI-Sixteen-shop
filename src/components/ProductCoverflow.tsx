import { useCallback, useEffect, useRef, useState } from "react";
import { hiResProductImage } from "../lib/productImage";

export function ProductCoverflow({
  images,
  rotationImages,
  name,
}: {
  images: string[];
  rotationImages?: string[];
  name: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [is360Mode, setIs360Mode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const gallerySwipe = useRef<{ x: number; y: number } | null>(null);
  const autoRotateInterval = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // A true rotation is an explicit, approved eight-frame sequence. Ordinary
  // gallery images must never be inferred to be a 360° view.
  const angleImages = rotationImages?.length === 8 ? rotationImages : [];
  const has360 = angleImages.length === 8;
  const displayImage = is360Mode
    ? angleImages[currentIndex % angleImages.length]
    : images[currentIndex];

  // Keep rotation frames off the network until the shopper explicitly opens
  // 360° mode, then warm the remaining frames for smooth dragging.
  useEffect(() => {
    if (!is360Mode || !has360) return;
    for (const src of angleImages) {
      const image = new Image();
      image.src = src;
    }
  }, [angleImages, has360, is360Mode]);

  // Auto-rotate logic
  useEffect(() => {
    if (isAutoRotating && is360Mode) {
      autoRotateInterval.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % angleImages.length);
      }, 600);
    }
    return () => {
      if (autoRotateInterval.current) clearInterval(autoRotateInterval.current);
    };
  }, [isAutoRotating, is360Mode, angleImages.length]);

  const handleDragStart = useCallback(
    (clientX: number) => {
      if (!is360Mode) return;
      setIsDragging(true);
      setIsAutoRotating(false);
      dragStartX.current = clientX;
      dragStartIndex.current = currentIndex;
    },
    [is360Mode, currentIndex],
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !is360Mode) return;
      const container = containerRef.current;
      if (!container) return;
      const dx = clientX - dragStartX.current;
      const width = container.offsetWidth;
      const sensitivity = width / angleImages.length;
      const indexDelta = Math.round(dx / sensitivity);
      const newIndex =
        (((dragStartIndex.current - indexDelta) % angleImages.length) +
          angleImages.length) %
        angleImages.length;
      setCurrentIndex(newIndex);
    },
    [isDragging, is360Mode, angleImages.length],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => handleDragEnd();

  const onTouchStart = (e: React.TouchEvent) => {
    if (is360Mode) {
      handleDragStart(e.touches[0].clientX);
      return;
    }
    gallerySwipe.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (is360Mode) handleDragMove(e.touches[0].clientX);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (is360Mode) {
      handleDragEnd();
      return;
    }
    const start = gallerySwipe.current;
    gallerySwipe.current = null;
    if (!start || images.length < 2) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy)) return;
    setCurrentIndex(index =>
      dx < 0
        ? (index + 1) % images.length
        : (index - 1 + images.length) % images.length,
    );
  };

  const enter360 = () => {
    setIs360Mode(true);
    setCurrentIndex(0);
    setIsAutoRotating(true);
  };

  const exit360 = () => {
    setIs360Mode(false);
    setCurrentIndex(0);
    setIsAutoRotating(false);
  };

  const count = images.length;
  const cards =
    count === 0
      ? []
      : images
          .map((src, index) => {
            let offset = index - currentIndex;
            if (count > 1) {
              if (offset > count / 2) offset -= count;
              if (offset < -count / 2) offset += count;
            }
            return { src, index, offset };
          })
          .filter(card => Math.abs(card.offset) <= 2);

  const scrub = (clientX: number, target: EventTarget | null) => {
    if (is360Mode || count < 2) return;
    if (target instanceof Element && target.closest("button")) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    const next = Math.min(count - 1, Math.max(0, Math.floor(ratio * count)));
    setCurrentIndex(next);
  };

  const lean = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (clientX - rect.left) / rect.width - 0.5;
    const py = (clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 16, y: -py * 9 });
  };

  return (
    <div className="pdp-gallery">
      {is360Mode ? (
      <div
        ref={containerRef}
        role="region"
        aria-label={`${name} product gallery with 360 degree view`}
        className="pdp-gallery__stage product-stage"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "none",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {displayImage ? (
          <img
            src={hiResProductImage(displayImage, 1800)}
            srcSet={`${hiResProductImage(displayImage, 900)} 900w, ${hiResProductImage(displayImage, 1800)} 1800w`}
            sizes="(min-width: 880px) 50vw, 100vw"
            alt={`${name}, angle ${currentIndex + 1} of 8`}
            className="pdp-gallery__shot"
            draggable={false}
            decoding="async"
            fetchPriority="high"
          />
        ) : (
          <div className="pdp-gallery__empty">✦</div>
        )}
        <span className="product-stage__grain" aria-hidden="true" />

        <div className="pdp-gallery__360-chip">
          <span>{isAutoRotating ? "AUTO" : "DRAG TO ROTATE"}</span>
        </div>
        <div className="pdp-gallery__360-controls">
          <input
            type="range"
            min="0"
            max={angleImages.length - 1}
            step="1"
            value={currentIndex % angleImages.length}
            aria-label={`Rotate ${name}`}
            onChange={event => {
              setCurrentIndex(Number(event.target.value));
              setIsAutoRotating(false);
            }}
            onPointerDown={event => event.stopPropagation()}
            onMouseDown={event => event.stopPropagation()}
            onTouchStart={event => event.stopPropagation()}
            className="pdp-gallery__dial"
          />
        </div>
        <button
          type="button"
          onClick={exit360}
          className="pdp-gallery__icon pdp-gallery__icon--tr"
          aria-label="Close 360"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setIsAutoRotating(!isAutoRotating);
          }}
          className="pdp-gallery__icon pdp-gallery__icon--tl"
          aria-label={isAutoRotating ? "Pause rotation" : "Play rotation"}
        >
          {isAutoRotating ? "⏸" : "▶"}
        </button>
      </div>
      ) : (
      <div
        ref={containerRef}
        className="pdp-flow"
        role="region"
        aria-label={`${name} photos`}
        onMouseMove={event => {
          lean(event.clientX, event.clientY);
          scrub(event.clientX, event.target);
        }}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="pdp-flow__tilt"
          style={{
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          }}
        >
          <span className="pdp-flow__glow" aria-hidden="true" />
          {cards.length === 0 ? (
            <div className="pdp-gallery__empty">✦</div>
          ) : (
            cards.map(card => (
              <button
                key={card.index}
                type="button"
                className={`pdp-flow__card${card.offset === 0 ? " is-on" : ""}`}
                style={{
                  transform: `translateX(calc(-50% + ${card.offset * 48}%)) translateZ(${card.offset === 0 ? 80 : 16 - Math.abs(card.offset) * 72}px) rotateY(${card.offset * -34}deg)`,
                  zIndex: 8 - Math.abs(card.offset),
                  opacity: card.offset === 0 ? 1 : 0.78,
                }}
                aria-label={
                  card.offset === 0
                    ? `${name}, photo ${card.index + 1} of ${count}`
                    : `Photo ${card.index + 1}`
                }
                aria-current={card.offset === 0 || undefined}
                onClick={() => setCurrentIndex(card.index)}
              >
                <img
                  src={hiResProductImage(card.src, card.offset === 0 ? 1400 : 700)}
                  alt=""
                  draggable={false}
                  decoding="async"
                />
              </button>
            ))
          )}
        </div>
        {count > 1 && (
          <>
            <button
              type="button"
              className="pdp-gallery__nav pdp-gallery__nav--prev"
              aria-label="Previous photo"
              onClick={() =>
                setCurrentIndex(i => (i - 1 + count) % count)
              }
            >
              ‹
            </button>
            <button
              type="button"
              className="pdp-gallery__nav pdp-gallery__nav--next"
              aria-label="Next photo"
              onClick={() => setCurrentIndex(i => (i + 1) % count)}
            >
              ›
            </button>
          </>
        )}
        {has360 && (
          <button type="button" onClick={enter360} className="pdp-gallery__360">
            ↻ 360°
          </button>
        )}
      </div>
      )}

      {!is360Mode && images.length > 1 && (
        <div className="pdp-gallery__dots" role="tablist" aria-label="Photos">
          {images.map((_, i) => (
            <button
              type="button"
              key={i}
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={`Photo ${i + 1}`}
              className={i === currentIndex ? "is-on" : ""}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}

      {!is360Mode && (images.length > 1 || has360) && (
        <div className="pdp-gallery__thumbs">
          {images.map((img, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`pdp-gallery__thumb ${i === currentIndex ? "is-on" : ""}`}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={hiResProductImage(img, 400)} alt="" />
            </button>
          ))}
          {has360 && (
            <button
              type="button"
              onClick={enter360}
              className="pdp-gallery__thumb pdp-gallery__thumb--360"
            >
              ↻<span>360°</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
