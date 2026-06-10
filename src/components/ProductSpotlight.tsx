import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface SpotlightConfig {
  baseName: string;
  title: string;
  subtitle: string;
  colorLine: string;
  gender: "women" | "men";
  gradient: string;
  btnColor: string;
}

const SPOTLIGHTS: SpotlightConfig[] = [
  {
    baseName: "D-Slip Dress",
    title: "THE D-SLIP DRESS",
    subtitle: "Six shades of effortless elegance",
    colorLine: "Available in 6 colors that drape like a dream — from classic Black to bold Red to delicate Pink Lace.",
    gender: "women",
    gradient: "linear-gradient(135deg, rgba(200,140,255,0.15) 0%, rgba(255,158,184,0.12) 50%, rgba(245,200,170,0.08) 100%)",
    btnColor: "rgba(200,140,255,0.9)",
  },
  {
    baseName: "J-Glitch Jersey",
    title: "THE J-GLITCH JERSEY",
    subtitle: "Six bold colors. Zero compromises.",
    colorLine: "Available in 6 statement colors — from stealth Black to electric Volt to icy cool.",
    gender: "men",
    gradient: "linear-gradient(135deg, rgba(100,180,255,0.15) 0%, rgba(140,255,200,0.08) 50%, rgba(200,140,255,0.06) 100%)",
    btnColor: "rgba(120,180,255,0.9)",
  },
];

const CARD_WIDTH = 180;
const GAP = 16;
const ITEM_WIDTH = CARD_WIDTH + GAP;
const SPEED = 0.4; // px per frame

function VariantCard({ product }: { product: { _id: string; name: string; images: string[]; price: number } }) {
  const color = product.name.includes("[")
    ? product.name.split("[")[1].split("]")[0]
    : "";

  return (
    <Link
      to={`/product/${product._id}`}
      className="flex-shrink-0 block group"
      style={{ width: `${CARD_WIDTH}px` }}
    >
      <div
        className="rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
        style={{
          background: "rgba(18,14,22,0.95)",
          border: "1px solid rgba(200,160,255,0.08)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div className="relative" style={{ height: "200px", overflow: "hidden", background: "#0a0810" }}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
            style={{ background: "linear-gradient(transparent, rgba(18,14,22,0.7))" }}
          />
        </div>
        <div className="p-3">
          <p
            className="text-[10px] font-bold tracking-[0.08em] uppercase mb-0.5"
            style={{ color: "rgba(245,230,220,0.65)" }}
          >
            {color || product.name}
          </p>
          <p
            className="text-[11px] font-medium"
            style={{ color: "rgba(245,230,220,0.3)" }}
          >
            ${(product.price / 100).toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function VariantCarousel({ variants }: { variants: { _id: string; name: string; images: string[]; price: number }[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);

  const setWidth = variants.length * ITEM_WIDTH;

  useEffect(() => {
    if (variants.length === 0) return;
    let lastTime = 0;

    const animate = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && trackRef.current) {
        offsetRef.current += SPEED * (delta / 16.67);
        if (offsetRef.current >= setWidth) {
          offsetRef.current -= setWidth;
        }
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused, setWidth, variants.length]);

  if (variants.length === 0) return null;

  // Render 3 copies for seamless loop
  const allCards = [...variants, ...variants, ...variants];

  return (
    <div
      className="relative py-6 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(14,10,15,0.95), #0e0a0f)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => { setTimeout(() => setIsPaused(false), 4000); }}
    >
      <div className="max-w-7xl mx-auto px-6 mb-3">
        <span
          className="text-[10px] tracking-[0.3em] uppercase font-semibold"
          style={{ color: "rgba(245,230,220,0.35)" }}
        >
          All Colors
        </span>
      </div>
      <div className="overflow-hidden px-6">
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ gap: `${GAP}px` }}
        >
          {allCards.map((v, idx) => (
            <VariantCard key={`${v._id}-${idx}`} product={v} />
          ))}
        </div>
      </div>
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none z-10"
        style={{ background: "linear-gradient(90deg, #0e0a0f, transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none z-10"
        style={{ background: "linear-gradient(270deg, #0e0a0f, transparent)" }}
      />
    </div>
  );
}

function Spotlight({ config }: { config: SpotlightConfig }) {
  const products = useQuery(api.products.list, { gender: config.gender });

  const variants = (products ?? []).filter((p: { name: string }) =>
    p.name.startsWith(config.baseName)
  );

  const heroProduct = variants[0];
  const heroImg = heroProduct?.images?.[1] ?? heroProduct?.images?.[0];

  if (!heroProduct) return null;

  return (
    <div className="mb-4">
      {/* Hero banner */}
      <div
        className="relative overflow-hidden"
        style={{ minHeight: "420px", background: "#0a0810" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: heroImg ? `url(${heroImg})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            filter: "blur(40px) brightness(0.4) saturate(1.5)",
            transform: "scale(1.3)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `${config.gradient}, linear-gradient(180deg, rgba(14,10,15,0.3) 0%, rgba(14,10,15,0.7) 100%)`,
          }}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 max-w-6xl mx-auto px-6 py-12">
          <div className="flex-1 flex items-center justify-center gap-4">
            {variants.slice(0, 2).map((v: { _id: string; images: string[]; name: string }, i: number) => (
              <div
                key={v._id}
                className="relative"
                style={{
                  width: i === 0 ? "200px" : "160px",
                  transform: i === 0 ? "rotate(-2deg)" : "rotate(3deg) translateY(10px)",
                }}
              >
                <img
                  src={v.images[0]}
                  alt={v.name}
                  className="w-full rounded-lg"
                  style={{
                    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                    border: "2px solid rgba(255,255,255,0.08)",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex-1 text-center md:text-left">
            <p
              className="text-[9px] tracking-[0.4em] uppercase font-medium mb-3"
              style={{ color: "rgba(245,230,220,0.4)" }}
            >
              ✦ {config.gender === "women" ? "WOMEN'S COLLECTION" : "MEN'S COLLECTION"}
            </p>
            <h3
              className="text-3xl md:text-4xl font-light mb-3"
              style={{
                fontFamily: "var(--font-display)",
                color: "white",
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
              }}
            >
              {config.title}
            </h3>
            <p
              className="text-[15px] font-light mb-2"
              style={{ color: "rgba(245,230,220,0.65)" }}
            >
              {config.subtitle}
            </p>
            <p
              className="text-[12px] leading-relaxed mb-6 max-w-sm"
              style={{ color: "rgba(245,230,220,0.35)" }}
            >
              {config.colorLine}
            </p>
            <Link
              to={`/shop?gender=${config.gender}`}
              className="inline-block px-8 py-3 text-[11px] tracking-[0.2em] uppercase font-bold transition-all duration-300"
              style={{
                background: config.btnColor,
                color: "white",
                borderRadius: "10px",
                boxShadow: `0 4px 20px ${config.btnColor}40`,
              }}
            >
              SHOP NOW
            </Link>
          </div>
        </div>
      </div>

      {/* Color variants — continuous scroll */}
      <VariantCarousel variants={variants} />
    </div>
  );
}

export function ProductSpotlights() {
  return (
    <section>
      {SPOTLIGHTS.map((config) => (
        <Spotlight key={config.baseName} config={config} />
      ))}
    </section>
  );
}
