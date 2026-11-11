import { Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSessionId } from "../hooks/useSessionId";
import { api, useAuthStatus, useQuery } from "../lib/backend";
import { CREST_URL, padCount } from "../lib/brand";
import { SearchOverlay } from "./SearchOverlay";

export function StoreHeader() {
  const location = useLocation();
  const sessionId = useSessionId();
  const cartCount = useQuery(api.cart.getCount, { sessionId }) ?? 0;
  const { isAuthenticated } = useAuthStatus();
  const isAdmin = useQuery(api.users.isAdmin);
  const favCount = useQuery(api.favorites.getCount) ?? 0;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const womenOn = location.pathname === "/women";
  const menOn = location.pathname === "/men";
  const aboutOn = location.pathname.startsWith("/about");
  const journalOn = location.pathname.startsWith("/journal");
  const tnOn = location.pathname.startsWith("/chart");

  return (
    <>
      <header className="site-bar">
        <div className="site-bar__inner">
          <Link to="/" className="seal site-seal">
            <img
              src={CREST_URL}
              alt="xixvi.shop"
              className="h-11 sm:h-14 w-auto"
            />
            <span className="shop-mark">xixvi.shop</span>
          </Link>

          <nav className="site-nav" aria-label="Primary">
            <Link to="/women" className={womenOn ? "is-on" : undefined}>
              Women
            </Link>
            <Link to="/men" className={menOn ? "is-on" : undefined}>
              Men
            </Link>
            <Link
              to="/dial"
              className={location.pathname === "/dial" ? "is-on" : undefined}
            >
              Dial
            </Link>
            <Link to="/about" className={aboutOn ? "is-on" : undefined}>
              About
            </Link>
            <Link to="/journal" className={journalOn ? "is-on" : undefined}>
              Journal
            </Link>
            <Link to="/chart" className={tnOn ? "is-on" : undefined}>
              True North
            </Link>
          </nav>

          <div className="site-tools">
            <button
              type="button"
              className="site-icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
            </button>
            <Link
              to="/favorites"
              className="site-icon site-icon--desk"
              aria-label="Favorites"
            >
              <Heart size={16} />
              {favCount > 0 ? <span>{padCount(favCount)}</span> : null}
            </Link>
            {isAuthenticated ? (
              <Link to="/profile" className="site-icon site-icon--desk">
                Account
              </Link>
            ) : (
              <Link to="/login" className="site-icon site-icon--desk">
                Sign in
              </Link>
            )}
            {isAdmin ? (
              <Link to="/admin" className="site-icon site-icon--desk">
                Admin
              </Link>
            ) : null}
            <Link
              to="/cart"
              className="site-cart"
              aria-label={`Cart, ${cartCount} items`}
            >
              Cart {padCount(cartCount)}
            </Link>
            <button
              type="button"
              className="site-icon site-menu"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="site-drawer">
            <div className="site-drawer__head">
              <span className="label-lock">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="site-icon"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>
            <nav className="site-drawer__nav" aria-label="Menu">
              <MobileNavLink to="/women" label="Women" />
              <MobileNavLink to="/men" label="Men" />
              <MobileNavLink to="/shop" label="Shop all" />
              <MobileNavLink to="/dial" label="Dial" />
              <MobileNavLink to="/about" label="About" />
              <MobileNavLink to="/journal" label="Journal" />
              <MobileNavLink to="/chart" label="True North" />
              <MobileNavLink
                to="/favorites"
                label="Favorites"
                badge={favCount}
              />
              <MobileNavLink to="/cart" label="Cart" badge={cartCount} />
              <MobileNavLink to="/size-guide" label="Size guide" />
              <MobileNavLink to="/contact" label="Contact" />
              <MobileNavLink to="/privacy" label="Privacy" />
              <MobileNavLink to="/terms" label="Terms" />
              <MobileNavLink to="/shipping-policy" label="Shipping" />
              <MobileNavLink to="/returns" label="Returns" />
              {isAuthenticated ? (
                <>
                  <MobileNavLink to="/profile" label="Account" />
                  <MobileNavLink to="/orders" label="Orders" />
                  {isAdmin ? <MobileNavLink to="/admin" label="Admin" /> : null}
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" label="Sign in" />
                  <MobileNavLink to="/signup" label="Create account" />
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function MobileNavLink({
  to,
  label,
  badge,
}: {
  to: string;
  label: string;
  badge?: number;
}) {
  return (
    <Link to={to} className="site-drawer__link">
      <span>{label}</span>
      {badge ? (
        <span className="site-count">{String(badge).padStart(2, "0")}</span>
      ) : null}
    </Link>
  );
}
