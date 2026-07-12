import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * "The Dash Set" — a dedicated hero spotlight for the Dachshund-print
 * B-Lift Sports Bra + L-Flow Leggings pairing.
 */
export function DashSetSpotlight() {
  const products = useQuery(api.products.list, { gender: "women" });

  const dashBra = (products ?? []).find(
    (p: { name: string }) => p.name === "B-Lift Sports Bra [Dash]"
  );
  const dashLeggings = (products ?? []).find(
    (p: { name: string }) => p.name === "L-Flow Leggings [Dash]"
  );

  if (!dashBra || !dashLeggings) return null;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FAF8F3 0%, #1a0f20 40%, #FAF8F3 100%)",
        borderTop: "1px solid rgba(184,148,63,0.06)",
        borderBottom: "1px solid rgba(184,148,63,0.06)",
      }}
    >
      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(184,148,63,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(255,180,200,0.04) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
          {/* Image side */}
          <div className="flex-1 flex justify-center">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                maxWidth: "480px",
                width: "100%",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(184,148,63,0.08)",
                border: "1px solid rgba(200,160,255,0.1)",
              }}
            >
              <img
                src="/dash-set-hero.jpg"
                alt="The Dash Set — pavé mannequin and model wearing the Dachshund-print sports bra and leggings"
                className="w-full h-auto block"
                loading="lazy"
              />
              {/* Bottom gradient fade */}
              <div
                className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(transparent, rgba(250,251,254,0.6))",
                }}
              />
            </div>
          </div>

          {/* Text side */}
          <div className="flex-1 text-center md:text-left">
            <p
              className="text-[9px] tracking-[0.4em] uppercase font-medium mb-3"
              style={{ color: "rgba(184,148,63,0.5)" }}
            >
              ✦ FEATURED SET
            </p>

            <h3
              className="text-3xl md:text-5xl font-light mb-2 leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "white",
                textShadow: "0 2px 20px rgba(0,0,0,0.4)",
              }}
            >
              The Dash Set
            </h3>

            <p
              className="text-[15px] md:text-[17px] italic mb-6"
              style={{
                color: "rgba(184,148,63,0.65)",
                fontFamily: "var(--font-display)",
              }}
            >
              Because it's a Dachshund
            </p>

            <p
              className="text-[12px] md:text-[13px] leading-relaxed mb-8 max-w-sm mx-auto md:mx-0"
              style={{ color: "rgba(26,26,46,0.38)" }}
            >
              Our signature all-over Dachshund print across the B-Lift Sports
              Bra and L-Flow Leggings — a matching set designed for those who
              love bold prints and don't take themselves too seriously.
            </p>

            {/* Product cards */}
            <div className="flex gap-4 mb-8 justify-center md:justify-start">
              {[
                { product: dashBra, label: "Sports Bra" },
                { product: dashLeggings, label: "Leggings" },
              ].map(({ product, label }) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="group block"
                  style={{ width: "130px" }}
                >
                  <div
                    className="rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.03]"
                    style={{
                      background: "rgba(18,14,22,0.9)",
                      border: "1px solid rgba(200,160,255,0.1)",
                      boxShadow:
                        "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
                    }}
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{ height: "150px", background: "#F5F0E6" }}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2.5">
                      <p
                        className="text-[10px] font-bold tracking-[0.06em] uppercase mb-0.5"
                        style={{ color: "rgba(26,26,46,0.65)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "rgba(26,26,46,0.3)" }}
                      >
                        ${(product.price / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              to="/shop?gender=women"
              className="inline-block px-8 py-3 text-[11px] tracking-[0.2em] uppercase font-bold transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(184,148,63,0.85) 0%, rgba(255,158,184,0.85) 100%)",
                color: "white",
                borderRadius: "10px",
                boxShadow:
                  "0 4px 20px rgba(184,148,63,0.25), 0 0 40px rgba(255,158,184,0.1)",
              }}
            >
              SHOP THE SET
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
