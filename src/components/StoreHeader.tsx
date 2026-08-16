import { useState, useEffect } from "react";
import { useQuery } from "../lib/backend";
import { useAuthStatus } from "../lib/backend";
import { Link, useLocation } from "react-router-dom";
import { api } from "../lib/backend";
import { useSessionId } from "../hooks/useSessionId";
import { SearchOverlay } from "./SearchOverlay";
import { DynamicSkyBar } from "./DynamicSkyBar";

export function StoreHeader() {
  const location = useLocation();
  const sessionId = useSessionId();
  const cartCount = useQuery(api.cart.getCount, { sessionId }) ?? 0;
  const { isAuthenticated } = useAuthStatus();
  const isAdmin = useQuery(api.users.isAdmin);
  const favCount = useQuery(api.favorites.getCount) ?? 0;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const isPolicyPage = ["/privacy", "/terms", "/shipping-policy", "/returns"].includes(location.pathname);

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
        className="store-announcement w-full py-2 px-4 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(90deg, rgba(255,190,226,.92), rgba(255,255,255,.96) 50%, rgba(177,225,255,.92))",
          borderBottom: "1px solid rgba(255,255,255,.72)",
        }}
      >
        <div className="announcement-pulse absolute inset-0 pointer-events-none" />
        <p className="text-[10px] tracking-[0.3em] uppercase relative z-10" style={{ color: "rgba(48,60,92,.72)" }}>
          ✦ FREE STANDARD SHIPPING ON EVERY ORDER ✦
        </p>
      </div>

      {/* Main Nav — continuous with the visitor's local sky */}
      <header className="relative z-30">
        <div className="store-sky-nav relative" style={{ background: "#78bce8" }}>
          <div className="absolute inset-0 opacity-100 pointer-events-none overflow-hidden" aria-hidden="true">
            <DynamicSkyBar />
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(7,18,42,.56), rgba(255,255,255,.04) 50%, rgba(7,18,42,.56))" }} />
          <div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-[82px] flex items-center justify-between"
            style={{ background: "transparent" }}
          >
            {/* Left: Logo + Category Quick Links */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Link to="/" className="flex items-center gap-3 group shrink-0">
                <img
                  src="/xixvi-gold-shield.png"
                  alt="XI XVI — Eleven Sixteen"
                  className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_0_10px_rgba(220,175,70,0.45)]"
                />
              </Link>

              {/* Category quick links — desktop */}
              <nav className="hidden md:flex items-center gap-0.5 ml-2">
                <span className="w-px h-5 bg-white/[0.08] mx-2" />
                <Link
                  to="/shop?gender=women"
                  className={`px-3 py-2 text-[11px] tracking-[0.18em] uppercase font-semibold transition-all ${
                    location.search.includes("women") ? "text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  Women
                </Link>
                <Link
                  to="/shop?gender=men"
                  className={`px-3 py-2 text-[11px] tracking-[0.18em] uppercase font-semibold transition-all ${
                    location.search.includes("men") && !location.search.includes("women") ? "text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  Men
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-2 text-[11px] tracking-[0.18em] uppercase font-semibold transition-all ${
                    location.pathname.startsWith("/about") ? "text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  About
                </Link>
                <Link
                  to="/journal"
                  className={`nav-blog-flash px-3 py-2 text-[11px] tracking-[0.18em] uppercase font-semibold ${
                    location.pathname.startsWith("/journal") ? "is-active" : ""
                  }`}
                >
                  <span className="nav-blog-flash__label" data-text="Blog">Blog</span>
                </Link>
                <Link
                  to="/chart"
                  className={`px-3 py-2 text-[11px] tracking-[0.18em] uppercase font-semibold transition-all ${
                    location.pathname.startsWith("/chart") ? "text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  Chart
                </Link>

                {/* Policies dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setPoliciesOpen(true)}
                  onMouseLeave={() => setPoliciesOpen(false)}
                >
                  <button
                    type="button"
                    className={`px-3 py-2 text-[11px] tracking-[0.18em] uppercase font-semibold transition-all ${
                      isPolicyPage ? "text-white" : "text-white/50 hover:text-white"
                    }`}
                    onClick={() => setPoliciesOpen((v) => !v)}
                  >
                    Policies
                  </button>
                  {policiesOpen && (
                    <div
                      className="absolute top-full left-0 pt-1 min-w-[190px]"
                      style={{ zIndex: 50 }}
                    >
                      <div
                        className="flex flex-col py-2 rounded-lg overflow-y-auto"
                        style={{
                          background: "#fdfbf9",
                          border: "1px solid rgba(21,36,61,0.1)",
                          boxShadow: "0 8px 24px rgba(21,36,61,0.15)",
                          maxHeight: "calc(100svh - 110px)",
                        }}
                      >
                        <Link to="/privacy" className="px-4 py-2 text-[11px] tracking-[0.08em] uppercase font-semibold hover:bg-black/[0.03]" style={{ color: "#15243d" }}>
                          Privacy Policy
                        </Link>
                        <Link to="/terms" className="px-4 py-2 text-[11px] tracking-[0.08em] uppercase font-semibold hover:bg-black/[0.03]" style={{ color: "#15243d" }}>
                          Terms of Service
                        </Link>
                        <Link to="/shipping-policy" className="px-4 py-2 text-[11px] tracking-[0.08em] uppercase font-semibold hover:bg-black/[0.03]" style={{ color: "#15243d" }}>
                          Shipping Policy
                        </Link>
                        <Link to="/returns" className="px-4 py-2 text-[11px] tracking-[0.08em] uppercase font-semibold hover:bg-black/[0.03]" style={{ color: "#15243d" }}>
                          Returns & Refunds
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/contact"
                  className={`px-3 py-2 text-[11px] tracking-[0.18em] uppercase font-semibold transition-all ${
                    location.pathname.startsWith("/contact") ? "text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  Contact
                </Link>
              </nav>
            </div>

            {/* Right side: search + favorites + cart + account + mobile hamburger */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Search icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="relative p-2 text-white/45 hover:text-white transition-colors group"
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-105 transition-transform">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              {/* Favorites icon */}
              <Link to="/favorites" className="relative p-2 text-white/45 hover:text-white transition-colors group">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-105 transition-transform">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                {favCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[8px] flex items-center justify-center text-white font-bold"
                    style={{ background: "linear-gradient(135deg, #ff6b8a, #ff9eb8)" }}
                  >
                    {favCount}
                  </span>
                )}
              </Link>

              {/* Cart icon */}
              <Link to="/cart" className="relative p-2 text-white/45 hover:text-white transition-colors group">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-105 transition-transform">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[8px] flex items-center justify-center text-white font-bold"
                    style={{ background: "linear-gradient(135deg, #248bd4, #55bfff)" }}
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
                      className="relative px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-semibold text-white overflow-hidden transition-all duration-300 glass-panel-sm hover:border-white/20"
                      style={{
                        background: "linear-gradient(135deg, rgba(36,139,212,0.08), rgba(255,190,170,0.05))",
                        border: "1px solid rgba(92,155,205,0.22)",
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
                    className="relative px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-semibold text-white overflow-hidden transition-all duration-300 glass-panel-sm hover:border-white/20"
                    style={{
                      background: "linear-gradient(135deg, rgba(36,139,212,0.08), rgba(255,190,170,0.05))",
                      border: "1px solid rgba(92,155,205,0.22)",
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

          {/* Category quick links — mobile + landscape strip */}
          <nav className="md:hidden relative z-10 flex items-center justify-center gap-1 px-2 pb-2 -mt-2">
            <Link
              to="/shop?gender=women"
              className={`px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase font-semibold transition-all ${
                location.search.includes("women") ? "text-white" : "text-white/55"
              }`}
            >
              Women
            </Link>
            <span className="w-px h-3 bg-white/[0.14]" />
            <Link
              to="/shop?gender=men"
              className={`px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase font-semibold transition-all ${
                location.search.includes("men") && !location.search.includes("women") ? "text-white" : "text-white/55"
              }`}
            >
              Men
            </Link>
            <span className="w-px h-3 bg-white/[0.14]" />
            <Link
              to="/about"
              className={`px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase font-semibold transition-all ${
                location.pathname.startsWith("/about") ? "text-white" : "text-white/55"
              }`}
            >
              About
            </Link>
            <span className="w-px h-3 bg-white/[0.14]" />
            <Link
              to="/journal"
              className={`nav-blog-flash px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase font-semibold ${
                location.pathname.startsWith("/journal") ? "is-active" : ""
              }`}
            >
              <span className="nav-blog-flash__label" data-text="Blog">Blog</span>
            </Link>
            <span className="w-px h-3 bg-white/[0.14]" />
            <Link
              to="/chart"
              className={`px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase font-semibold transition-all ${
                location.pathname.startsWith("/chart") ? "text-white" : "text-white/55"
              }`}
            >
              Chart
            </Link>
            <span className="w-px h-3 bg-white/[0.14]" />
            <Link
              to="/contact"
              className={`px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase font-semibold transition-all ${
                location.pathname.startsWith("/contact") ? "text-white" : "text-white/55"
              }`}
            >
              Contact
            </Link>
          </nav>
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
            className="store-mobile-menu absolute top-0 right-0 w-[280px] h-full flex flex-col overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(247,251,255,.97), rgba(239,246,255,.97))",
              borderLeft: "1px solid rgba(118,180,235,.28)",
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
            <nav className="flex-1 min-h-0 overflow-y-auto px-6 py-8 space-y-2">
              <MobileNavLink to="/shop?gender=women" label="SHOP WOMEN" />
              <MobileNavLink to="/shop?gender=men" label="SHOP MEN" />
              <MobileNavLink to="/shop" label="SHOP ALL" />

              <div className="my-6 border-t border-white/[0.06]" />

              <MobileNavLink to="/favorites" label="FAVORITES" badge={favCount > 0 ? favCount : undefined} />
              <MobileNavLink to="/cart" label="CART" badge={cartCount > 0 ? cartCount : undefined} />
              <MobileNavLink to="/journal" label="BLOG — THE JOURNAL" />
              <MobileNavLink to="/chart" label="NATAL CHART" />
              <MobileNavLink to="/about" label="ABOUT" />
              <MobileNavLink to="/size-guide" label="SIZE GUIDE" />
              <MobileNavLink to="/contact" label="CONTACT US" />

              <div className="my-6 border-t border-white/[0.06]" />

              <p className="px-1 pb-1 text-[9px] tracking-[0.25em] uppercase text-white/25">Policies</p>
              <MobileNavLink to="/privacy" label="PRIVACY POLICY" />
              <MobileNavLink to="/terms" label="TERMS OF SERVICE" />
              <MobileNavLink to="/shipping-policy" label="SHIPPING POLICY" />
              <MobileNavLink to="/returns" label="RETURNS & REFUNDS" />

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
          style={{ background: "linear-gradient(135deg, #248bd4, #55bfff)" }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
