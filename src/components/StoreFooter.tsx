import { Link } from "react-router-dom";
import { CREST_URL } from "../lib/brand";

export function StoreFooter() {
  return (
    <footer className="guest-footer mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-start gap-10 px-7 py-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={CREST_URL} alt="" className="h-10 w-auto" />
            <span className="shop-mark">xixvi.shop</span>
          </div>
          <p
            className="serif-quiet text-[16px]"
            style={{ color: "rgba(247,240,230,0.75)" }}
          >
            XI Eleven XVI Sixteen. A house of clothing — True North is the same
            numbers, opened.
          </p>
          <p
            className="text-[11px] mt-4"
            style={{ color: "rgba(247,240,230,0.4)" }}
          >
            XI Eleven XVI Sixteen L.L.C.
            <br />
            Florida, USA
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
          <div className="flex flex-col gap-2 serif-quiet text-[16px]">
            <Link to="/shop">Shop</Link>
            <Link to="/journal">Journal</Link>
            <Link to="/chart">True North</Link>
            <Link to="/about">About</Link>
          </div>
          <div className="flex flex-col gap-2 serif-quiet text-[16px]">
            <Link to="/size-guide">Size guide</Link>
            <Link to="/contact">Contact</Link>
            <a href="mailto:support@xixvi.shop">support@xixvi.shop</a>
            <a
              href="https://instagram.com/xielevenxvisixteen"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>
          <div className="flex flex-col gap-2 serif-quiet text-[16px]">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/shipping-policy">Shipping</Link>
            <Link to="/returns">Returns</Link>
          </div>
        </div>
      </div>
      <div
        className="flex justify-between items-center px-7 py-5"
        style={{ borderTop: "1px solid rgba(247,240,230,0.12)" }}
      >
        <span className="shop-mark text-[16px]">xixvi.shop</span>
        <span
          className="serif-quiet text-[14px]"
          style={{ color: "rgba(247,240,230,0.55)" }}
        >
          © 2026 XI Eleven XVI Sixteen
        </span>
      </div>
    </footer>
  );
}
