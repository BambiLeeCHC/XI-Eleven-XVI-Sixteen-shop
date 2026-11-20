import { useEffect, useState } from "react";
import { HEIRLOOM_BACKS } from "../../data/heirloomBacksData";

/**
 * Full carousel of the three True North heirloom card backs.
 * First surface of the North Room.
 */
export function HeirloomBacksCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex(i => (i + 1) % HEIRLOOM_BACKS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [paused]);

  const active = HEIRLOOM_BACKS[index];

  return (
    <section
      className="heirloom-carousel"
      aria-roledescription="carousel"
      aria-label="True North heirloom card backs"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="heirloom-carousel__stage">
        {HEIRLOOM_BACKS.map((back, i) => (
          <figure
            key={back.id}
            className={`heirloom-carousel__slide${i === index ? " is-active" : ""}`}
            aria-hidden={i !== index}
          >
            <img src={back.src} alt={back.label} draggable={false} />
          </figure>
        ))}
        <div className="heirloom-carousel__foil" aria-hidden="true" />
      </div>

      <div className="heirloom-carousel__meta">
        <p className="heirloom-carousel__kicker">True North · Heirloom backs</p>
        <p className="heirloom-carousel__label">{active.short}</p>
      </div>

      <div className="heirloom-carousel__dots" role="tablist" aria-label="Choose a card back">
        {HEIRLOOM_BACKS.map((back, i) => (
          <button
            key={back.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={back.label}
            className={i === index ? "is-on" : ""}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      <button
        type="button"
        className="heirloom-carousel__nav heirloom-carousel__nav--prev"
        aria-label="Previous card back"
        onClick={() => setIndex(i => (i + HEIRLOOM_BACKS.length - 1) % HEIRLOOM_BACKS.length)}
      >
        ‹
      </button>
      <button
        type="button"
        className="heirloom-carousel__nav heirloom-carousel__nav--next"
        aria-label="Next card back"
        onClick={() => setIndex(i => (i + 1) % HEIRLOOM_BACKS.length)}
      >
        ›
      </button>
    </section>
  );
}
