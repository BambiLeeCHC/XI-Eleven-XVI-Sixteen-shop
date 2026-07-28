import { Link } from "react-router-dom";

export function StoreFooter() {
  return (
    <footer className="mt-auto" style={{ borderTop: "1px solid rgba(92,155,205,0.15)" }}>
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
            <Link to="/journal" className="text-[12px] transition-colors" style={{ color: "rgba(21,36,61,0.42)" }}>The Journal</Link>
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
