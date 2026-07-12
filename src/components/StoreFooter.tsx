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
    <footer className="mt-auto" style={{ borderTop: "1px solid rgba(0,40,80,0.06)" }}>
      {/* Newsletter */}
      <div
        className="py-16 text-center"
        style={{ background: "linear-gradient(180deg, #eef3fa 0%, #f5f8fd 50%, #eef3fa 100%)" }}
      >
        <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "#4a8fd9" }}>INNER CIRCLE</p>
        <h3 className="text-xl mb-2" style={{ fontFamily: "var(--font-display)", color: "#1a1a2e" }}>
          Be the First to Know
        </h3>
        <p className="text-[13px] mb-6 max-w-md mx-auto" style={{ color: "rgba(26,26,46,0.5)" }}>
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
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(0,40,80,0.1)",
              color: "#1a1a2e",
              borderRadius: "10px",
              padding: "12px 16px",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 text-[11px] tracking-[0.15em] uppercase font-bold text-white hover:opacity-90 transition-colors"
            style={{
              background: "linear-gradient(135deg, #4a8fd9, #5ba8e6)",
              borderRadius: "10px",
            }}
          >
            {status === "success" ? "✓" : status === "loading" ? "..." : "JOIN"}
          </button>
        </form>
        {status === "success" && (
          <p className="text-xs mt-3" style={{ color: "#4a8fd9" }}>Welcome to the Inner Circle ✦</p>
        )}
      </div>

      {/* Links */}
      <div
        className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-8"
        style={{ background: "#FAFBFE" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold tracking-wider" style={{ fontFamily: "var(--font-display)", color: "#1a1a2e" }}>
              XI · XVI
            </span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "rgba(26,26,46,0.4)" }}>
            Luxury fashion, made exclusively for you. Zero waste. Zero compromise. Every piece crafted on demand.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a
              href="https://instagram.com/xielevenxvisixteen"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(74,143,217,0.06)",
                border: "1px solid rgba(74,143,217,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
              }}
              title="Follow us on Instagram"
            >
              📸
            </a>
            <a
              href="mailto:xixvi1116@icloud.com"
              className="transition-opacity hover:opacity-80"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(74,143,217,0.06)",
                border: "1px solid rgba(74,143,217,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
              }}
              title="Email us"
            >
              ✉
            </a>
          </div>
          <p className="text-[10px] mt-3" style={{ color: "rgba(26,26,46,0.2)" }}>
            XI Eleven XVI Sixteen L.L.C.<br />
            Florida, USA
          </p>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-4" style={{ color: "rgba(26,26,46,0.5)" }}>SHOP</h4>
          <div className="flex flex-col gap-2">
            <Link to="/shop?category=Tops" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Tops</Link>
            <Link to="/shop?category=Bottoms" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Bottoms</Link>
            <Link to="/shop?category=Dresses" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Dresses</Link>
            <Link to="/shop?category=Activewear" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Activewear</Link>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-4" style={{ color: "rgba(26,26,46,0.5)" }}>HELP</h4>
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Our Story</Link>
            <Link to="/contact" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Contact Us</Link>
            <Link to="/size-guide" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Size Guide</Link>
            <Link to="/profile" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>My Profile</Link>
            <Link to="/orders" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Orders</Link>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-4" style={{ color: "rgba(26,26,46,0.5)" }}>LEGAL</h4>
          <div className="flex flex-col gap-2">
            <Link to="/privacy" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Privacy Policy</Link>
            <Link to="/terms" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Terms of Service</Link>
            <Link to="/shipping-policy" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Shipping Policy</Link>
            <Link to="/returns" className="text-[12px] transition-colors hover:text-[#4a8fd9]" style={{ color: "rgba(26,26,46,0.4)" }}>Returns & Refunds</Link>
          </div>
        </div>
      </div>

      <div className="py-6 text-center" style={{ borderTop: "1px solid rgba(0,40,80,0.06)", background: "#FAFBFE" }}>
        <span className="text-[10px]" style={{ color: "rgba(26,26,46,0.2)" }}>© 2026 XI Eleven XVI Sixteen L.L.C. All rights reserved.</span>
      </div>
    </footer>
  );
}
