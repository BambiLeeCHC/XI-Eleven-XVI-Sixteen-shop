import { useMutation } from "convex/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";

export function StoreFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await subscribe({ email });
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <footer className="mt-auto" style={{ borderTop: "1px solid rgba(92,155,205,0.15)" }}>
      {/* Newsletter */}
      <div
        className="py-16 text-center"
        style={{ background: "linear-gradient(#0c080e 0%, #140e18 50%, #0c080e 100%)" }}
      >
        <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(36,139,212,0.65)" }}>INNER CIRCLE</p>
        <h3 className="text-xl text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Be the First to Know
        </h3>
        <p className="text-[13px] mb-6 max-w-md mx-auto" style={{ color: "rgba(21,36,61,0.55)" }}>
          Early access, exclusive drops, and members-only pricing.
        </p>
        <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm mx-auto px-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 text-sm outline-none transition-colors"
            style={{
              background: "rgba(255,240,230,0.04)",
              border: "1px solid rgba(92,155,205,0.2)",
              color: "rgba(21,36,61,0.88)",
              borderRadius: "10px",
              padding: "12px 16px",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 text-[11px] tracking-[0.15em] uppercase font-bold text-white hover:opacity-90 transition-colors"
            style={{
              background: "linear-gradient(135deg, #248bd4, #55bfff)",
              borderRadius: "10px",
            }}
          >
            {status === "success" ? "✓" : status === "loading" ? "..." : "JOIN"}
          </button>
        </form>
        {status === "success" && (
          <p className="text-xs mt-3" style={{ color: "rgba(200,160,220,0.65)" }}>Welcome to the Inner Circle ✦</p>
        )}
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/xixvi-footer-shield.png"
              alt="XI XVI — Eleven Sixteen"
              className="w-auto"
              style={{ height: 84 }}
            />
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "rgba(21,36,61,0.42)" }}>
            Luxury fashion, made exclusively for you. Zero waste. Zero compromise. Every piece crafted on demand.
          </p>
          <p className="text-[10px] mt-4" style={{ color: "rgba(21,36,61,0.22)" }}>
            XI Eleven XVI Sixteen L.L.C.<br />
            Florida, USA
          </p>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-4" style={{ color: "rgba(21,36,61,0.6)" }}>SHOP</h4>
          <div className="flex flex-col gap-2">
            <Link to="/shop?category=Tops" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>Tops</Link>
            <Link to="/shop?category=Bottoms" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>Bottoms</Link>
            <Link to="/shop?category=Dresses" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>Dresses</Link>
            <Link to="/shop?category=Activewear" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>Activewear</Link>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-4" style={{ color: "rgba(21,36,61,0.6)" }}>HELP</h4>
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>Our Story</Link>
            <Link to="/size-guide" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>Size Guide</Link>
            <Link to="/profile" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>My Profile</Link>
            <Link to="/orders" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>Orders</Link>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-4" style={{ color: "rgba(21,36,61,0.6)" }}>LEGAL</h4>
          <div className="flex flex-col gap-2">
            <Link to="/privacy" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>Privacy Policy</Link>
            <Link to="/terms" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>Terms of Service</Link>
            <Link to="/shipping-policy" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>Shipping Policy</Link>
            <Link to="/returns" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>Returns & Refunds</Link>
          </div>
        </div>
      </div>

      <div className="py-6 text-center" style={{ borderTop: "1px solid rgba(92,155,205,0.15)" }}>
        <span className="text-[10px]" style={{ color: "rgba(21,36,61,0.22)" }}>© 2026 XI Eleven XVI Sixteen L.L.C. All rights reserved.</span>
      </div>
    </footer>
  );
}
