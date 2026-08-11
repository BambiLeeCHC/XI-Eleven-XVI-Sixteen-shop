import { Link } from "react-router-dom";

export function StoreFooter() {
  return (
    <footer className="mt-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
      {/* Links */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/xixvi-footer-shield.png"
              alt="XI XVI — Eleven Sixteen"
              className="w-auto"
              style={{ height: 84 }}
            />
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "rgba(238,248,255,0.55)" }}>
            Luxury fashion, made exclusively for you. Zero waste. Zero compromise. Every piece crafted on demand.
          </p>
          <p className="text-[10px] mt-4" style={{ color: "rgba(238,248,255,0.32)" }}>
            XI Eleven XVI Sixteen L.L.C.<br />
            Florida, USA
          </p>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-4" style={{ color: "rgba(238,248,255,0.75)" }}>SHOP</h4>
          <div className="flex flex-col gap-2">
            <Link to="/shop?category=Tops" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Tops</Link>
            <Link to="/shop?category=Bottoms" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Bottoms</Link>
            <Link to="/shop?category=Dresses" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Dresses</Link>
            <Link to="/shop?category=Activewear" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Activewear</Link>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-4" style={{ color: "rgba(238,248,255,0.75)" }}>HELP</h4>
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Our Story</Link>
            <Link to="/journal" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>The Journal</Link>
            <Link to="/size-guide" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Size Guide</Link>
            <Link to="/profile" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>My Profile</Link>
            <Link to="/orders" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Orders</Link>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-4" style={{ color: "rgba(238,248,255,0.75)" }}>POLICIES</h4>
          <div className="flex flex-col gap-2">
            <Link to="/privacy" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Privacy Policy</Link>
            <Link to="/terms" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Terms of Service</Link>
            <Link to="/shipping-policy" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Shipping Policy</Link>
            <Link to="/returns" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Returns & Refunds</Link>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-4" style={{ color: "rgba(238,248,255,0.75)" }}>CONTACT</h4>
          <div className="flex flex-col gap-2">
            <Link to="/contact" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>Contact Us</Link>
            <a href="mailto:support@xixvi.shop" className="text-[12px] transition-colors" style={{ color: "rgba(238,248,255,0.55)" }}>support@xixvi.shop</a>
            <a
              href="https://instagram.com/xielevenxvisixteen"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] transition-colors"
              style={{ color: "rgba(238,248,255,0.55)" }}
            >
              @xielevenxvisixteen
            </a>
          </div>
        </div>
      </div>

      <div className="py-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <span className="text-[10px]" style={{ color: "rgba(238,248,255,0.32)" }}>© 2026 XI Eleven XVI Sixteen L.L.C. All rights reserved.</span>
      </div>
    </footer>
  );
}
