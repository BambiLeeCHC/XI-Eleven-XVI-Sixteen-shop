import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "../hooks/useSessionId";
import { SearchOverlay } from "./SearchOverlay";

export function StoreHeader() {
  const location = useLocation();
  const sessionId = useSessionId();
  const cartCount = useQuery(api.cart.getCount, { sessionId }) ?? 0;
  const { isAuthenticated } = useConvexAuth();
  const isAdmin = useQuery(api.users.isAdmin);
  const favCount = useQuery(api.favorites.getCount) ?? 0;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
      {/* Announcement Bar — Gold Luxury */}
      <div
        className="w-full py-2 px-4 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #0d0d14 0%, #16161f 50%, #0d0d14 100%)",
          borderBottom: "1px solid rgba(201, 169, 110, 0.08)",
        }}
      >
        <p className="text-[10px] tracking-[0.3em] uppercase relative z-10 font-medium" style={{ color: "rgba(201, 169, 110, 0.6)" }}>
          ✦ FREE STANDARD SHIPPING ON EVERY ORDER ✦
        </p>
      </div>

      {/* Main Nav — Dark Luxury */}
      <header className="relative z-30">
        <div
          className="relative"
          style={{
            background: "rgba(9, 9, 15, 0.97)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(201, 169, 110, 0.06)",
            boxShadow: "0 1px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-[82px] flex items-center justify-between"
          >
            {/* Left: Logo + Category Quick Links */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Link to="/" className="flex items-center gap-3 group shrink-0">
                <img
                  src="https://decisive-cheetah-451.convex.cloud/api/storage/9f36be32-eae9-430a-ac7e-ab617f632b25"
                  alt="XI XVI — Eleven Sixteen"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </Link>

              {/* Category quick links — desktop */}
              <nav className="hidden md:flex items-center gap-0.5 ml-2">
                <span className="w-px h-5 mx-2" style={{ background: "rgba(201, 169, 110, 0.12)" }} />
                <Link
                  to="/shop?gender=women"
                  className={`px-3 py-2 text-[11px] tracking-[0.18em] uppercase font-semibold transition-all ${
                    location.search.includes("women") ? "text-[#c9a96e]" : "text-[#f0e6d3]/40 hover:text-[#c9a96e]"
                  }`}
                >
                  Women
                </Link>
                <Link
                  to="/shop?gender=men"
                  className={`px-3 py-2 text-[11px] tracking-[0.18em] uppercase font-semibold transition-all ${
                    location.search.includes("men") && !location.search.includes("women") ? "text-[#c9a96e]" : "text-[#f0e6d3]/40 hover:text-[#c9a96e]"
                  }`}
                >
                  Men
                </Link>
              </nav>
            </div>

            {/* Right side: search + favorites + cart + account + mobile hamburger */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Search icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="relative p-2 text-[#f0e6d3]/30 hover:text-[#c9a96e] transition-colors group"
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-105 transition-transform">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              {/* Favorites icon */}
              <Link to="/favorites" className="relative p-2 text-[#f0e6d3]/30 hover:text-[#c9a96e] transition-colors group">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-105 transition-transform">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                {favCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[8px] flex items-center justify-center text-[#09090f] font-bold"
                    style={{ background: "linear-gradient(135deg, #c9a96e, #e8d5b0)" }}
                  >
                    {favCount}
                  </span>
                )}
              </Link>

              {/* Cart icon */}
              <Link to="/cart" className="relative p-2 text-[#f0e6d3]/30 hover:text-[#c9a96e] transition-colors group">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-105 transition-transform">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[8px] flex items-center justify-center text-[#09090f] font-bold"
                    style={{ background: "linear-gradient(135deg, #c9a96e, #e8d5b0)" }}
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
                        className="relative p-2 text-amber-500/40 hover:text-amber-500 transition-all duration-300"
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
                      className="relative px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-semibold overflow-hidden transition-all duration-300"
                      style={{
                        color: "#c9a96e",
                        background: "rgba(201, 169, 110, 0.06)",
                        border: "1px solid rgba(201, 169, 110, 0.15)",
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
                    className="relative px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-semibold overflow-hidden transition-all duration-300"
                    style={{
                      color: "#c9a96e",
                      background: "rgba(201, 169, 110, 0.06)",
                      border: "1px solid rgba(201, 169, 110, 0.15)",
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
                className="md:hidden text-[#f0e6d3]/40 hover:text-[#c9a96e] p-2 transition-colors"
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

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

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
              background: "rgba(13, 13, 20, 0.98)",
              borderLeft: "1px solid rgba(201, 169, 110, 0.08)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
            }}
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-6 h-[82px]" style={{ borderBottom: "1px solid rgba(201, 169, 110, 0.06)" }}>
              <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(201, 169, 110, 0.3)" }}>MENU</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 transition-colors"
                style={{ color: "rgba(240, 230, 211, 0.3)" }}
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

              <div className="my-6" style={{ borderTop: "1px solid rgba(201, 169, 110, 0.06)" }} />

              <MobileNavLink to="/favorites" label="FAVORITES" badge={favCount > 0 ? favCount : undefined} />
              <MobileNavLink to="/cart" label="CART" badge={cartCount > 0 ? cartCount : undefined} />
              <MobileNavLink to="/about" label="ABOUT" />
              <MobileNavLink to="/size-guide" label="SIZE GUIDE" />

              <div className="my-6" style={{ borderTop: "1px solid rgba(201, 169, 110, 0.06)" }} />

              {isAuthenticated ? (
                <>
                  <MobileNavLink to="/profile" label="MY ACCOUNT" />
                  <MobileNavLink to="/orders" label="MY ORDERS" />
                  {isAdmin && (
                    <>
                      <div className="my-4" style={{ borderTop: "1px solid rgba(245,158,11,0.1)" }} />
                      <Link
                        to="/admin"
                        className="flex items-center justify-between py-3 px-1 text-[11px] tracking-[0.2em] uppercase font-semibold text-amber-500/60 hover:text-amber-500 transition-colors"
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
            <div className="px-6 py-6" style={{ borderTop: "1px solid rgba(201, 169, 110, 0.06)" }}>
              <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "rgba(201, 169, 110, 0.2)" }}>
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
          ? "text-[#c9a96e] hover:text-[#e8d5b0]"
          : "text-[#f0e6d3]/40 hover:text-[#f0e6d3]"
      }`}
    >
      <span>{label}</span>
      {badge !== undefined && (
        <span
          className="min-w-[20px] h-[20px] px-1.5 rounded-full text-[9px] flex items-center justify-center text-[#09090f] font-bold"
          style={{ background: "linear-gradient(135deg, #c9a96e, #e8d5b0)" }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
