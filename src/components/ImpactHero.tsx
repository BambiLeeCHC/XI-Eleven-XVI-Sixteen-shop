import { Link } from "react-router-dom";
import {
  CAMPAIGN_KICKER,
  colorCountLabel,
  colorFromName,
  formatPrice,
  HERO_SUB,
  HERO_TITLE,
  IMPACT_HERO_URL,
  padCount,
  snapHex,
  TRUST_ITEMS,
} from "../lib/brand";

export type HeroColorItem = { _id: string; name: string };

export function ImpactHero({
  dslipHref,
  dslipPrice,
  dslipColors = [],
  showDial = true,
}: {
  dslipHref: string;
  dslipPrice?: number;
  dslipColors?: HeroColorItem[];
  showDial?: boolean;
}) {
  const colorCount = dslipColors.length;
  const priceLabel = dslipPrice ? formatPrice(dslipPrice) : "$98";

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-black">
      <img
        src={IMPACT_HERO_URL}
        alt="UNBOTHERED — The Impact"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 46%" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,11,12,0.18) 0%, rgba(11,11,12,0) 22%, rgba(11,11,12,0) 62%, rgba(11,11,12,0.55) 88%, rgba(11,11,12,0.78) 100%)",
        }}
      />
      <div
        className="absolute left-[-6%] right-[-6%] top-[108px] h-[6px] pointer-events-none z-[3]"
        style={{
          background: "var(--pist)",
          transform: "rotate(-1.1deg)",
          opacity: 0.7,
        }}
      />
      <div
        className="absolute left-0 right-0 bottom-0 z-[4] px-7 py-6"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(11,11,12,0.28) 55%, rgba(11,11,12,0.62) 100%)",
        }}
      >
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <span className="kicker-lock">{CAMPAIGN_KICKER}</span>
            <div className="mt-2">
              <h1 className="hero-title-lock">{HERO_TITLE}</h1>
              <p className="hero-sub-lock">{HERO_SUB}</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Link to={dslipHref} className="cta-pist">
                Shop D-Slip · {priceLabel}
              </Link>
              {colorCount > 0 ? (
                <Link to={dslipHref} className="cta-cream">
                  {colorCountLabel(colorCount)}
                </Link>
              ) : null}
              {colorCount > 0 ? (
                <div className="flex gap-2.5 items-center flex-wrap">
                  {dslipColors.map(item => {
                    const color = colorFromName(item.name) || item.name;
                    return (
                      <Link
                        key={item._id}
                        to={`/product/${item._id}`}
                        aria-label={color}
                        className="snap snap--hero"
                        style={{ background: snapHex(color) }}
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {TRUST_ITEMS.map(item => (
                <span key={item} className="trust-chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
          {showDial && colorCount > 0 ? (
            <div className="dial-lock">
              <span className="n">01</span>
              <span className="serif-quiet text-[13px] mt-0.5">
                of {padCount(colorCount)} colors
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function PistachioTicker() {
  const items = [
    "Explore the Journal for brand updates",
    "True North subscription tarot · $7/week",
    "Shop D-Slip",
    "Made on demand",
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
  titles = ["Shop", "Crafted for you", "Receive"],
  copy = [
    "Find your piece.",
    "Made when you order — just for you.",
    "It arrives ready for you. Free shipping. Easy returns.",
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
    <section className="landing-rooms">
      <article className="landing-room landing-room--journal">
        <div>
          <p className="label-lock landing-room__label">Editorial</p>
          <h2 className="clash landing-room__title">Journal</h2>
          <p className="serif-quiet landing-room__body">
            Brand updates, drops, and what's next — open the Journal.
          </p>
        </div>
        <div>
          <Link to="/journal" className="landing-room__cta landing-room__cta--ink">
            Explore the Journal
          </Link>
        </div>
      </article>
      <article className="landing-room landing-room--truenorth">
        <p className="label-lock landing-room__label landing-room__label--pist">
          Subscription tarot
        </p>
        <h2 className="clash landing-room__title landing-room__title--tn">True North</h2>
        <p className="serif-quiet landing-room__body landing-room__body--tn">
          A branded tarot experience for the week you are in.
        </p>
        <p className="clash landing-room__price">
          $7
          <span className="landing-room__price-unit"> / WEEK</span>
        </p>
        <div className="landing-room__spread" aria-hidden="true">
          <div className="tarot-card c1">
            <span className="serif-quiet">I · Morning</span>
            <span className="clash text-[22px]">Draw 01</span>
            <span className="serif-quiet">first pull</span>
          </div>
          <div className="tarot-card c2">
            <span className="serif-quiet">II · Midday</span>
            <span className="clash text-[22px]">Draw 02</span>
            <span className="serif-quiet">second pull</span>
          </div>
          <div className="tarot-card c3">
            <span className="serif-quiet">III · Night</span>
            <span className="clash text-[22px]">Draw 03</span>
            <span className="serif-quiet">third pull</span>
          </div>
        </div>
        <div className="landing-room__actions">
          <Link to="/chart/long-read" className="cta-pist">
            Start free — 7 days
          </Link>
          <Link to="/chart/long-read" className="landing-room__cancel">
            Cancel
          </Link>
        </div>
        <p className="serif-quiet landing-room__trial">
          7-day free trial. Then $7/week. Cancel whenever.
        </p>
      </article>
    </section>
  );
}
