import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CAMPAIGN_KICKER,
  colorCountLabel,
  colorFromName,
  formatPrice,
  HERO_SUB,
  HERO_TITLE,
  IMPACT_HERO_URL,
  snapHex,
  TRUST_ITEMS,
} from "../lib/brand";

export type HeroColorItem = { _id: string; name: string };

export type HeroFrame = {
  src: string;
  kicker: string;
  title: string;
  sub: string;
  href: string;
  cta: string;
};

export function ImpactHero({
  dslipHref,
  dslipPrice,
  dslipColors = [],
  frames,
}: {
  dslipHref: string;
  dslipPrice?: number;
  dslipColors?: HeroColorItem[];
  showDial?: boolean;
  frames?: HeroFrame[];
}) {
  const colorCount = dslipColors.length;
  const priceLabel = dslipPrice ? formatPrice(dslipPrice) : "$98";
  const reel: HeroFrame[] = frames?.length
    ? frames
    : [{
        src: IMPACT_HERO_URL,
        kicker: CAMPAIGN_KICKER,
        title: HERO_TITLE,
        sub: HERO_SUB,
        href: dslipHref,
        cta: `Shop D-Slip · ${priceLabel}`,
      }];
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState(0);
  const [reduced, setReduced] = useState(false);
  const startX = useRef(0);
  const frame = reel[index % reel.length];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced || reel.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex(current => (current + 1) % reel.length);
      setFlash(value => value + 1);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [reduced, reel.length]);

  const go = (next: number) => {
    setIndex((next + reel.length) % reel.length);
    if (!reduced) setFlash(value => value + 1);
  };

  return (
    <>
      <section
        className="home-hero"
        onTouchStart={event => {
          startX.current = event.changedTouches[0]?.clientX ?? 0;
        }}
        onTouchEnd={event => {
          const dx = (event.changedTouches[0]?.clientX ?? 0) - startX.current;
          if (dx > 48) go(index - 1);
          if (dx < -48) go(index + 1);
        }}
      >
        {reel.map((item, i) => (
          <img
            key={item.src + item.title}
            src={item.src}
            alt=""
            className={`home-hero__photo${i === index % reel.length ? " is-on" : ""}`}
          />
        ))}
        {flash > 0 ? <span key={flash} className="home-hero__flash" aria-hidden="true" /> : null}
        <div className="home-hero__shade" />
        <div className="home-hero__copy">
          <span className="kicker-lock">{frame.kicker}</span>
          <h1 className="hero-title-lock">{frame.title}</h1>
          <p className="hero-sub-lock">{frame.sub}</p>
          <div className="home-hero__actions">
            <Link to={frame.href} className="cta-pist">
              {frame.cta}
            </Link>
            <Link to="/shop" className="cta-ghost">
              All styles
            </Link>
          </div>
        </div>
        {reel.length > 1 ? (
          <div className="home-hero__film" role="tablist" aria-label="Campaign frames">
            {reel.map((item, i) => (
              <button
                key={item.title + i}
                type="button"
                role="tab"
                aria-selected={i === index % reel.length}
                className={i === index % reel.length ? "is-on" : undefined}
                onClick={() => go(i)}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        ) : null}
      </section>
      <section className="home-strip">
        {colorCount > 0 ? (
          <div className="home-strip__colors">
            <span className="label-lock">{colorCountLabel(colorCount)}</span>
            <div className="home-strip__snaps">
              {dslipColors.map(item => {
                const color = colorFromName(item.name) || item.name;
                return (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    aria-label={color}
                    className="snap"
                    style={{ background: snapHex(color) }}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
        <ul className="home-strip__trust">
          {TRUST_ITEMS.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function PistachioTicker() {
  const items = [
    "Clothing · made when you order it",
    "Journal · the cut, the fabric, the week",
    "True North · three written readings a day",
    "Shop D-Slip · made on demand",
    "One order. One piece. No leftover stock.",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="ticker-lock">
      <div className="ticker-lock-track">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="mq">
            {item} <span aria-hidden="true">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProcessSteps({
  titles = ["Select", "Produce", "Receive"],
  copy = [
    "Style, then color, then size.",
    "Made on demand. Two to five business days.",
    "Free shipping. Easy returns.",
  ],
}: {
  titles?: string[];
  copy?: string[];
}) {
  return (
    <section className="lock-steps">
      {titles.map((title, i) => (
        <div className="lock-step" key={title}>
          <p className="num">Step 0{i + 1}</p>
          <h3>{title}</h3>
          <p>{copy[i]}</p>
        </div>
      ))}
    </section>
  );
}

export function JournalTrueNorthRooms() {
  return (
    <section className="home-rooms">
      <article className="site-panel home-room">
        <div>
          <p className="label-lock" style={{ color: "var(--pist)" }}>
            Editorial
          </p>
          <h2
            className="clash mt-3"
            style={{ fontSize: "clamp(48px, 6vw, 84px)" }}
          >
            Journal
          </h2>
          <p className="serif-quiet text-[26px] mt-6 max-w-md leading-snug">
            The cut, the fabric, the week. How the house makes a piece.
          </p>
        </div>
        <div>
          <Link
            to="/journal"
            className="cta-pist inline-block mt-8"
          >
            Read the Journal
          </Link>
        </div>
      </article>
      <article className="site-panel home-room">
        <p className="label-lock" style={{ color: "var(--pist)" }}>
          Tri-Sky
        </p>
        <h2
          className="clash mt-3"
          style={{ fontSize: "clamp(42px, 5.5vw, 76px)" }}
        >
          True North
        </h2>
        <p className="serif-quiet text-[22px] mt-3 max-w-md">
          Tri-Sky · Morning, Tri-Sky · Noon, and Tri-Sky · Night — three
          written readings a day, pulled against the week you are actually in.
        </p>
        <div className="flex flex-wrap gap-3 items-center mt-8">
          <Link to="/chart" className="cta-pist">
            Open True North
          </Link>
        </div>
        <p
          className="serif-quiet mt-4 text-[17px] max-w-md"
          style={{ color: "#D9D0C4" }}
        >
          Chart, numbers, and a written reading. No charge from this room.
        </p>
      </article>
    </section>
  );
}
