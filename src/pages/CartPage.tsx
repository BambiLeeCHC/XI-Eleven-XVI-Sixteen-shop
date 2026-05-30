import { useQuery, useMutation } from "convex/react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "../hooks/useSessionId";
import { SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";

export function CartPage() {
  const sessionId = useSessionId();
  const cartItems = useQuery(api.cart.getItems, { sessionId }) ?? [];
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + item.product.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl text-white font-light mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Your cart is empty
        </h2>
        <p className="text-[13px] mb-6" style={{ color: "rgba(245,230,220,0.38)" }}>
          Discover our collection and find your perfect piece.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3 text-[11px] tracking-[0.2em] uppercase font-bold text-white transition-all glass-shimmer"
          style={{
            background: "linear-gradient(135deg, rgba(200,140,255,0.12), rgba(255,190,170,0.08))",
            border: "1px solid rgba(240,210,190,0.12)",
            borderRadius: "12px",
          }}
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <>
    <SEO title={PAGE_SEO.cart.title} description={PAGE_SEO.cart.description} url="/cart" noindex />
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
      <h1 className="text-3xl text-white font-light mb-8" style={{ fontFamily: "var(--font-display)" }}>
        Your Cart
      </h1>

      <div className="space-y-4 mb-8">
        {cartItems.map((item: any) => (
          <div
            key={item._id}
            className="flex gap-4 p-4 lucite-card"
          >
            {/* Image */}
            <div
              className="w-20 h-24 overflow-hidden shrink-0"
              style={{
                background: "rgba(255,240,230,0.03)",
                border: "1px solid rgba(240,210,190,0.08)",
                borderRadius: "10px",
              }}
            >
              {item.product.images?.[0] ? (
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" style={{ borderRadius: "9px" }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span style={{ color: "rgba(245,230,220,0.1)" }}>✦</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.productId}`} className="text-[12px] tracking-[0.1em] uppercase font-medium" style={{ color: "rgba(245,230,220,0.75)" }}>
                {item.product.name}
              </Link>
              <p className="text-[11px] mt-1" style={{ color: "rgba(245,230,220,0.35)" }}>Size: {item.size}</p>
              <p className="text-[13px] mt-2" style={{ color: "rgba(245,230,220,0.65)" }}>${(item.product.price / 100).toFixed(2)}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity({ itemId: item._id, quantity: item.quantity - 1 })}
                className="w-8 h-8 flex items-center justify-center text-sm transition-all"
                style={{
                  border: "1px solid rgba(240,210,190,0.1)",
                  borderRadius: "8px",
                  color: "rgba(245,230,220,0.45)",
                }}
              >
                −
              </button>
              <span className="w-8 text-center text-[12px]" style={{ color: "rgba(245,230,220,0.65)" }}>{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity({ itemId: item._id, quantity: item.quantity + 1 })}
                className="w-8 h-8 flex items-center justify-center text-sm transition-all"
                style={{
                  border: "1px solid rgba(240,210,190,0.1)",
                  borderRadius: "8px",
                  color: "rgba(245,230,220,0.45)",
                }}
              >
                +
              </button>
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={() => removeItem({ itemId: item._id })}
              className="transition-colors self-start"
              style={{ color: "rgba(245,230,220,0.25)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t pt-6" style={{ borderColor: "rgba(240,210,190,0.08)" }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] uppercase tracking-wider" style={{ color: "rgba(245,230,220,0.45)" }}>Subtotal</span>
          <span style={{ color: "rgba(245,230,220,0.75)" }}>${(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] uppercase tracking-wider" style={{ color: "rgba(245,230,220,0.45)" }}>Standard Shipping</span>
          <span className="text-[12px] font-semibold" style={{ color: "rgba(200,220,160,0.85)" }}>FREE</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-[12px] uppercase tracking-wider" style={{ color: "rgba(245,230,220,0.45)" }}>Expedited Options</span>
          <span className="text-[12px]" style={{ color: "rgba(200,160,220,0.55)" }}>Available at checkout</span>
        </div>

        {/* Made for You callout */}
        <div className="flex items-start gap-3 p-4 mb-6" style={{
          background: "rgba(200,140,255,0.04)",
          border: "1px solid rgba(200,140,255,0.08)",
          borderRadius: "12px",
        }}>
          <span className="text-base shrink-0 mt-0.5">✦</span>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(200,160,220,0.7)" }}>Made Exclusively for You</p>
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(245,230,220,0.38)" }}>
              Each piece is crafted on demand — no mass production, no waste. Production takes 2–5 business days before shipping, because your item is being made just for you.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8 pt-4" style={{ borderTop: "1px solid rgba(240,210,190,0.08)" }}>
          <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: "rgba(245,230,220,0.65)" }}>Subtotal</span>
          <span className="text-xl text-white">${(subtotal / 100).toFixed(2)}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/checkout")}
          className="w-full py-4 text-[11px] tracking-[0.25em] uppercase font-bold text-white transition-all duration-300 glass-shimmer"
          style={{
            background: "linear-gradient(135deg, #c48dff 0%, #ff9eb8 50%, #f5c97a 100%)",
            backgroundSize: "200% 100%",
            animation: "gradient-loop 6s ease-in-out infinite",
            borderRadius: "12px",
          }}
        >
          PROCEED TO CHECKOUT
        </button>
        <p className="text-center text-[10px] mt-3" style={{ color: "rgba(245,230,220,0.2)" }}>Secure checkout powered by Stripe</p>
      </div>
    </div>
    </>
  );
}
