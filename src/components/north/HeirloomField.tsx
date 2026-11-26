import { useEffect, useState } from "react";

const FILMS = [
  "/north/backs/celestial.mp4",
  "/north/backs/pearl.mp4",
  "/north/backs/stained.mp4",
];

/** Card-back fly-throughs behind True North. One back at a time. */
export function HeirloomField() {
  const [index, setIndex] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setStill(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  if (still) {
    return <div className="heirloom-field is-still" aria-hidden="true" />;
  }

  return (
    <div className="heirloom-field" aria-hidden="true">
      <video
        key={FILMS[index]}
        src={FILMS[index]}
        autoPlay
        muted
        playsInline
        onEnded={() => setIndex(current => (current + 1) % FILMS.length)}
      />
      <div className="heirloom-field__veil" />
    </div>
  );
}
