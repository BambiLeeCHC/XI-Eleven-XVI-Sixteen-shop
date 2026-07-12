import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CategoryDef {
  label: string;
  shopLabel: string;
  filter: { gender?: string; category?: string };
  accent: string;
}

const CATEGORIES: CategoryDef[] = [
  { label: "Shop Women", shopLabel: "SHOP WOMEN", filter: { gender: "women" }, accent: "linear-gradient(135deg, #5ba8e6, #4a8fd9)" },
  { label: "Shop Men", shopLabel: "SHOP MEN", filter: { gender: "men" }, accent: "linear-gradient(135deg, #4a8fd9, #3a7fc9)" },
  { label: "Shop Dresses", shopLabel: "SHOP DRESSES", filter: { category: "Dresses" }, accent: "linear-gradient(135deg, #e88da8, #d67d98)" },
  { label: "Shop Tops", shopLabel: "SHOP TOPS", filter: { category: "Tops" }, accent: "linear-gradient(135deg, #67b8d4, #57a8c4)" },
  { label: "Shop Bottoms", shopLabel: "SHOP BOTTOMS", filter: { category: "Bottoms" }, accent: "linear-gradient(135deg, #e8b07a, #d8a06a)" },
  { label: "Shop Activewear", shopLabel: "SHOP ACTIVEWEAR", filter: { category: "Activewear" }, accent: "linear-gradient(135deg, #6dd4a8, #5dc498)" },
];

const CARD_WIDTH = 200;
const GAP = 16;
const ITEM_WIDTH = CARD_WIDTH + GAP;
const SPEED = 0.5; // px per frame (~30px/sec at 60fps)

function CategoryCard({ cat }: { cat: CategoryDef }) {
  const products = useQuery(api.products.list, {
    gender: cat.filter.gender,
    category: cat.filter.category,
  });

  const img = products?.[0]?.images?.[0];
  const shopUrl = cat.filter.gender
    ? `/shop?gender=${cat.filter.gender}`
    : `/shop?category=${cat.filter.category}`;

  return (
    <div
      className="flex-shrink-0"
      style={{ width: `${CARD_WIDTH}px` }}
    >
      <Link to={shopUrl} className="block group">
        <div
          className="rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,40,80,0.06)",
            boxShadow: "0 2px 16px rgba(0,40,80,0.06), 0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="relative" style={{ height: "220px", overflow: "hidden", background: "#f5f8fd" }}>
            {img ? (
              <img
                src={img}
                alt={cat.label}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: "rgba(74,143,217,0.03)" }}
              >
                <span style={{ color: "rgba(26,26,46,0.2)", fontSize: "12px" }}>Loading...</span>
              </div>
            )}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{ background: "linear-gradient(transparent, rgba(255,255,255,0.6))" }}
            />
          </div>

          <div className="px-3 py-3 flex items-center justify-between">
            <span
              className="text-[11px] font-bold tracking-[0.06em] uppercase"
              style={{ color: "#1a1a2e" }}
            >
              {cat.shopLabel}
            </span>
            <span
              className="text-[10px] font-semibold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full"
              style={{
                color: "#4a8fd9",
                background: "rgba(74,143,217,0.06)",
                border: "1px solid rgba(74,143,217,0.12)",
              }}
            >
              SHOP
            </span>
          </div>
          <div className="px-3 pb-3 -mt-1">
            <div
              className="h-[2px] rounded-full"
              style={{ background: cat.accent, width: "24px", opacity: 0.7 }}
            />
          </div>
        </div>
      </Link>
    </div>
  );
}

export function CategoryCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Total width of one complete set of cards
  const setWidth = CATEGORIES.length * ITEM_WIDTH;

  useEffect(() => {
    let lastTime = 0;

    const animate = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && trackRef.current) {
        // Move at constant speed
        offsetRef.current += SPEED * (delta / 16.67);
        // Reset when one full set has scrolled past
        if (offsetRef.current >= setWidth) {
          offsetRef.current -= setWidth;
        }
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused, setWidth]);

  // Render 3 copies for seamless loop
  const allCards = [...CATEGORIES, ...CATEGORIES, ...CATEGORIES];

  return (
    <section
      className="relative py-6 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FAFBFE 0%, #f0f4f8 100%)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => { setTimeout(() => setIsPaused(false), 4000); }}
    >
      {/* Section title */}
      <div className="max-w-7xl mx-auto px-6 mb-4">
        <span
          className="text-[10px] tracking-[0.35em] uppercase font-semibold"
          style={{ color: "rgba(26,26,46,0.4)" }}
        >
          Browse Collections
        </span>
      </div>

      {/* Continuous scrolling track */}
      <div className="overflow-hidden px-6">
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ gap: `${GAP}px` }}
        >
          {allCards.map((cat, idx) => (
            <CategoryCard key={`${cat.label}-${idx}`} cat={cat} />
          ))}
        </div>
      </div>

      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10"
        style={{ background: "linear-gradient(90deg, #FAFBFE, transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10"
        style={{ background: "linear-gradient(270deg, #f0f4f8, transparent)" }}
      />
    </section>
  );
}
