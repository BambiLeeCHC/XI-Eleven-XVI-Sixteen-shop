import { Link } from "react-router-dom";
import {
  CAMPAIGN_KICKER,
  formatPrice,
  HERO_SUB,
  HERO_TITLE,
  IMPACT_HERO_URL,
  TRUST_ITEMS,
} from "../lib/brand";

export function ImpactHero({
  dslipHref,
  dslipPrice,
  lookCount,
  showDial = true,
}: {
  dslipHref: string;
  dslipPrice?: number;
  lookCount?: number;
  showDial?: boolean;
}) {
  const looks = lookCount && lookCount > 0 ? lookCount : 8;
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
              <Link to="/shop?gender=women" className="cta-ghost">
                {looks} looks
              </Link>
            </div>
            <div className="flex flex-wrap gap-3.5 mt-4">
              {TRUST_ITEMS.map(item => (
                <span
                  key={item}
                  className="text-[10px] tracking-[0.2em] uppercase font-bold px-2.5 py-1.5"
                  style={{ border: "1px solid rgba(247,240,230,0.35)" }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          {showDial ? (
            <div className="dial-lock">
              <span className="n">01</span>
              <span className="serif-quiet text-[13px] mt-0.5">
                of {String(looks).padStart(2, "0")} looks
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
    "True North · 3 draws a day · 7-day free trial",
    "Journal · editorial from XI · XVI",
    "The Draw · Almanac · Daily Code",
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
  titles = ["Select", "Produce", "Receive"],
  copy = [
    "Style, then color (the live SKU), then size.",
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
    <section className="grid md:grid-cols-2 min-h-[520px]">
      <article
        className="flex flex-col justify-between p-10 md:p-14"
        style={{ background: "#F7F0E6", color: "#0B0B0C" }}
      >
        <div>
          <p className="label-lock" style={{ color: "#6b6358" }}>
            Editorial
          </p>
          <h2
            className="clash mt-3"
            style={{ fontSize: "clamp(48px, 6vw, 84px)" }}
          >
            Journal
          </h2>
          <p className="serif-quiet text-[26px] mt-6 max-w-md leading-snug">
            Stories from XI · XVI. The cut, the campaign, the week.
          </p>
        </div>
        <div>
          <Link
            to="/journal"
            className="inline-block mt-8 px-6 py-4 text-[12px] tracking-[0.18em] uppercase font-extrabold"
            style={{ background: "#0B0B0C", color: "#F7F0E6" }}
          >
            Read the Journal
          </Link>
        </div>
      </article>
      <article
        className="relative overflow-hidden p-10 md:p-14"
        style={{ background: "#0E0C12", color: "#F7F0E6" }}
      >
        <p className="label-lock" style={{ color: "var(--lilac)" }}>
          Daily tarot · 3 draws
        </p>
        <h2
          className="clash mt-3"
          style={{ fontSize: "clamp(42px, 5.5vw, 76px)" }}
        >
          True North
        </h2>
        <p className="serif-quiet text-[22px] mt-3 max-w-md">
          Three draws a day. Morning, midday, night.
        </p>
        <div className="relative h-[280px] mt-7 mb-9">
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
        <Link
          to="/chart/long-read"
          className="inline-block px-6 py-4 text-[13px] tracking-[0.16em] uppercase font-extrabold"
          style={{ background: "var(--lilac)", color: "#1A1020" }}
        >
          Start free trial ✦
        </Link>
        <p
          className="serif-quiet mt-3 text-[17px] max-w-md"
          style={{ color: "#D9D0C4" }}
        >
          7-day free trial, then $7/week. Cancel anytime. Three draws a day,
          every day. Natal chart unlocks after birth date and location.
          Numerology is $19.99, once.
        </p>
      </article>
    </section>
  );
}
