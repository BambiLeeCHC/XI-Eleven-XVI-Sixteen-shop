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

export function ImpactHero({
  dslipHref,
  dslipPrice,
  dslipColors = [],
}: {
  dslipHref: string;
  dslipPrice?: number;
  dslipColors?: HeroColorItem[];
  showDial?: boolean;
}) {
  const colorCount = dslipColors.length;
  const priceLabel = dslipPrice ? formatPrice(dslipPrice) : "$98";

  return (
    <>
      <section className="home-hero">
        <img
          src={IMPACT_HERO_URL}
          alt="UNBOTHERED — The Impact"
          className="home-hero__photo"
        />
        <div className="home-hero__shade" />
        <div className="home-hero__copy">
          <span className="kicker-lock">{CAMPAIGN_KICKER}</span>
          <h1 className="hero-title-lock">{HERO_TITLE}</h1>
          <p className="hero-sub-lock">{HERO_SUB}</p>
          <div className="home-hero__actions">
            <Link to={dslipHref} className="cta-pist">
              Shop D-Slip · {priceLabel}
            </Link>
            <Link to="/shop" className="cta-ghost">
              All styles
            </Link>
          </div>
        </div>
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
          The Long Read
        </p>
        <h2
          className="clash mt-3"
          style={{ fontSize: "clamp(42px, 5.5vw, 76px)" }}
        >
          True North
        </h2>
        <p className="serif-quiet text-[22px] mt-3 max-w-md">
          Three written readings a day — morning, midday, night — pulled
          against the week you are actually in.
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
