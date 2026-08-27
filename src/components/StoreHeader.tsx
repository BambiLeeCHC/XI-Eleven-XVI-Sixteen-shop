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
      <header className="guest-header relative z-30">
        <div className="flex items-start justify-between gap-4 px-[22px] py-[18px]">
          <Link to="/" className="seal shrink-0">
            <img
              src={CREST_URL}
              alt="xixvi.shop"
              className="h-12 sm:h-16 w-auto"
            />
            <span className="shop-mark hidden sm:inline">xixvi.shop</span>
          </Link>

          <div className="flex flex-wrap gap-2 justify-end max-w-[720px]">
            <Link
              to="/women"
              className={`chip pist ${womenOn ? "on" : ""}`}
              style={{ ["--r" as string]: "-2deg" }}
            >
              Women
            </Link>
            <Link
              to="/men"
              className={`chip powder ${menOn ? "on" : ""}`}
              style={{ ["--r" as string]: "1.5deg" }}
            >
              Men
            </Link>
            <Link
              to="/about"
              className={`chip ${aboutOn ? "on" : ""}`}
              style={{ ["--r" as string]: "-1deg" }}
            >
              About
            </Link>
            <Link
              to="/journal"
              className={`chip blush ${journalOn ? "on" : ""}`}
              style={{ ["--r" as string]: "2deg" }}
            >
              Journal
            </Link>
            <Link
              to="/chart"
              className={`chip lilac ${tnOn ? "on" : ""}`}
              style={{ ["--r" as string]: "-0.5deg" }}
            >
              True North
            </Link>
            <button
              type="button"
              className="chip"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={14} />
            </button>
            <Link to="/favorites" className="chip" aria-label="Favorites">
              <Heart size={14} />
              {favCount > 0 ? <span>{padCount(favCount)}</span> : null}
            </Link>
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="chip"
                style={{ ["--r" as string]: "1deg" }}
              >
                Account
              </Link>
            ) : (
              <Link
                to="/login"
                className="chip"
                style={{ ["--r" as string]: "1deg" }}
              >
                Sign in
              </Link>
            )}
            {isAdmin ? (
              <Link to="/admin" className="chip" aria-label="Admin">
                Admin
              </Link>
            ) : null}
            <Link to="/cart" className="hangtag">
              Cart {padCount(cartCount)}
            </Link>
            <button
              type="button"
              className="chip md:hidden"
              aria-label="More menu"
              onClick={() => setMobileOpen(!mobileOpen)}
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
          <div
            className="absolute top-0 right-0 w-[280px] h-full flex flex-col overflow-hidden"
            style={{ background: "#0B0B0C", borderLeft: "2px solid #D8F0C4" }}
          >
            <div
              className="flex items-center justify-between px-6 h-[72px]"
              style={{ borderBottom: "1px solid rgba(247,240,230,0.12)" }}
            >
              <span className="label-lock">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="chip"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-3">
              <MobileNavLink to="/women" label="Women" />
              <MobileNavLink to="/men" label="Men" />
              <MobileNavLink to="/shop" label="Shop all" />
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
    <Link
      to={to}
      className="flex items-center justify-between py-2 text-[12px] tracking-[0.18em] uppercase"
      style={{ color: "#F7F0E6" }}
    >
      <span>{label}</span>
      {badge ? (
        <span className="chip on">{String(badge).padStart(2, "0")}</span>
      ) : null}
    </Link>
  );
}
