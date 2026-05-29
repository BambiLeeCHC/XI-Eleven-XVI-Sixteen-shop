import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "../hooks/useSessionId";

export function StoreHeader() {
  const location = useLocation();
  const sessionId = useSessionId();
  const cartCount = useQuery(api.cart.getCount, { sessionId }) ?? 0;
  const { isAuthenticated } = useConvexAuth();
  const isAdmin = useQuery(api.users.isAdmin);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Announcement Bar */}
      <div
        className="w-full py-2 px-4 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #0e0a0f 0%, #16111a 50%, #0e0a0f 100%)",
          borderBottom: "1px solid rgba(240, 210, 190, 0.08)",
        }}
      >
        <div className="announcement-pulse absolute inset-0 pointer-events-none" />
        <p className="text-[10px] tracking-[0.3em] uppercase relative z-10" style={{ color: "rgba(245, 200, 170, 0.7)" }}>
          ✦ FREE STANDARD SHIPPING ON EVERY ORDER ✦
        </p>
      </div>

      {/* Marquee */}
      <div
        className="w-full overflow-hidden py-2"
        style={{
          background: "#0c080e",
          borderBottom: "1px solid rgba(240, 210, 190, 0.06)",
        }}
      >
        <div className="animate-marquee whitespace-nowrap inline-flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="inline-flex items-center">
              {["FREE STANDARD SHIPPING ON EVERY ORDER", "PERSONAL STYLE ASSISTANT", "LUXURY REDEFINED"].map((text) => (
                <span key={text} className="inline-flex items-center">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "rgba(245, 230, 220, 0.45)" }}>{text}</span>
                  <span className="mx-6 w-1 h-1 rounded-full inline-block" style={{ background: "rgba(200, 140, 255, 0.35)" }} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Main Nav — Gradient Loop */}
      <header className="relative z-30">
        <div className="gradient-loop-nav relative">
          <div
            className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 h-[82px] flex items-center justify-between"
            style={{ background: "transparent" }}
          >
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <img
                src="https://decisive-cheetah-451.convex.cloud/api/storage/9f36be32-eae9-430a-ac7e-ab617f632b25"
                alt="XI XVI — Eleven Sixteen"
                className="h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(200,170,100,0.3)]"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/shop?gender=women"
                className={`px-4 py-2 text-[11px] tracking-[0.2em] uppercase font-semibold transition-all ${
                  location.search.includes("women") ? "text-white" : "text-white/55 hover:text-white"
                }`}
              >
                SHOP WOMEN
              </Link>
              <Link
                to="/shop?gender=men"
                className={`px-4 py-2 text-[11px] tracking-[0.2em] uppercase font-semibold transition-all ${
                  location.search.includes("men") && !location.search.includes("women") ? "text-white" : "text-white/55 hover:text-white"
                }`}
              >
                SHOP MEN
              </Link>
            </nav>

            {/* Right side: cart + sign-in + mobile hamburger */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Cart icon — always visible */}
              <Link to="/cart" className="relative p-2 text-white/55 hover:text-white transition-colors group">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-105 transition-transform">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] flex items-center justify-center text-white font-bold"
                    style={{ background: "linear-gradient(135deg, #c48dff, #ff9eb8)" }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Sign-in / Account — desktop only */}
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="hidden md:block" title="Admin Dashboard">
                      <button
                        type="button"
                        className="relative p-2 text-amber-400/50 hover:text-amber-400 transition-all duration-300"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </Link>
                  )}
                  <Link to="/profile" className="hidden md:block">
                    <button
                      type="button"
                      className="relative px-5 py-2 text-[10px] tracking-[0.25em] uppercase font-semibold text-white overflow-hidden transition-all duration-300 glass-panel-sm hover:border-white/20"
                      style={{
                        background: "linear-gradient(135deg, rgba(200,140,255,0.08), rgba(255,190,170,0.05))",
                        border: "1px solid rgba(240, 210, 190, 0.12)",
                        borderRadius: "8px",
                      }}
                    >
                      ACCOUNT
                    </button>
                  </Link>
                </>
              ) : (
                <Link to="/login" className="hidden md:block">
                  <button
                    type="button"
                    className="relative px-5 py-2 text-[10px] tracking-[0.25em] uppercase font-semibold text-white overflow-hidden transition-all duration-300 glass-panel-sm hover:border-white/20"
                    style={{
                      background: "linear-gradient(135deg, rgba(200,140,255,0.08), rgba(255,190,170,0.05))",
                      border: "1px solid rgba(240, 210, 190, 0.12)",
                      borderRadius: "8px",
                    }}
                  >
                    SIGN IN
                  </button>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden text-white/55 hover:text-white p-2 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-in panel */}
          <div
            className="absolute top-0 right-0 w-[280px] h-full flex flex-col"
            style={{
              background: "linear-gradient(180deg, #0e0a0f 0%, #0a0a0a 100%)",
              borderLeft: "1px solid rgba(240, 210, 190, 0.08)",
            }}
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-6 h-[82px] border-b border-white/[0.06]">
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">MENU</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-white/40 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-6 py-8 space-y-2">
              <MobileNavLink to="/shop?gender=women" label="SHOP WOMEN" />
              <MobileNavLink to="/shop?gender=men" label="SHOP MEN" />
              <MobileNavLink to="/shop" label="SHOP ALL" />

              <div className="my-6 border-t border-white/[0.06]" />

              <MobileNavLink to="/cart" label="CART" badge={cartCount > 0 ? cartCount : undefined} />
              <MobileNavLink to="/size-guide" label="SIZE GUIDE" />

              <div className="my-6 border-t border-white/[0.06]" />

              {isAuthenticated ? (
                <>
                  <MobileNavLink to="/profile" label="MY ACCOUNT" />
                  <MobileNavLink to="/orders" label="MY ORDERS" />
                  {isAdmin && (
                    <>
                      <div className="my-4 border-t border-amber-500/[0.12]" />
                      <Link
                        to="/admin"
                        className="flex items-center justify-between py-3 px-1 text-[11px] tracking-[0.2em] uppercase font-semibold text-amber-400/70 hover:text-amber-300 transition-colors"
                      >
                        <span>⚙️ ADMIN DASHBOARD</span>
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" label="SIGN IN" highlight />
                  <MobileNavLink to="/signup" label="CREATE ACCOUNT" />
                </>
              )}
            </nav>

            {/* Footer */}
            <div className="px-6 py-6 border-t border-white/[0.06]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-white/15">
                XI ELEVEN XVI SIXTEEN
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Mobile Nav Link Component ── */
function MobileNavLink({
  to,
  label,
  badge,
  highlight,
}: {
  to: string;
  label: string;
  badge?: number;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-between py-3 px-1 text-[11px] tracking-[0.2em] uppercase font-semibold transition-colors ${
        highlight
          ? "text-purple-300/90 hover:text-purple-200"
          : "text-white/55 hover:text-white"
      }`}
    >
      <span>{label}</span>
      {badge !== undefined && (
        <span
          className="min-w-[20px] h-[20px] px-1.5 rounded-full text-[9px] flex items-center justify-center text-white font-bold"
          style={{ background: "linear-gradient(135deg, #c48dff, #ff9eb8)" }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
