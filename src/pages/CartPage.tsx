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
        <p className="text-[13px] mb-6" style={{ color: "rgba(21,36,61,0.52)" }}>
          Discover our collection and find your perfect piece.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3 text-[11px] tracking-[0.2em] uppercase font-bold text-white transition-all glass-shimmer"
          style={{
            background: "linear-gradient(135deg, rgba(36,139,212,0.12), rgba(255,190,170,0.08))",
            border: "1px solid rgba(92,155,205,0.22)",
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
                border: "1px solid rgba(92,155,205,0.18)",
                borderRadius: "10px",
              }}
            >
              {item.product.images?.[0] ? (
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" style={{ borderRadius: "9px" }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span style={{ color: "rgba(21,36,61,0.08)" }}>✦</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.productId}`} className="text-[12px] tracking-[0.1em] uppercase font-medium" style={{ color: "rgba(21,36,61,0.88)" }}>
                {item.product.name}
              </Link>
              <p className="text-[11px] mt-1" style={{ color: "rgba(21,36,61,0.5)" }}>{item.color ? `${item.color} · ` : ""}Size: {item.size}</p>
              <p className="text-[13px] mt-2" style={{ color: "rgba(21,36,61,0.78)" }}>${(item.product.price / 100).toFixed(2)}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity({ itemId: item._id, quantity: item.quantity - 1 })}
                className="w-8 h-8 flex items-center justify-center text-sm transition-all"
                style={{
                  border: "1px solid rgba(92,155,205,0.2)",
                  borderRadius: "8px",
                  color: "rgba(21,36,61,0.6)",
                }}
              >
                −
              </button>
              <span className="w-8 text-center text-[12px]" style={{ color: "rgba(21,36,61,0.78)" }}>{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity({ itemId: item._id, quantity: item.quantity + 1 })}
                className="w-8 h-8 flex items-center justify-center text-sm transition-all"
                style={{
                  border: "1px solid rgba(92,155,205,0.2)",
                  borderRadius: "8px",
                  color: "rgba(21,36,61,0.6)",
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
              style={{ color: "rgba(21,36,61,0.32)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t pt-6" style={{ borderColor: "rgba(92,155,205,0.18)" }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] uppercase tracking-wider" style={{ color: "rgba(21,36,61,0.6)" }}>Subtotal</span>
          <span style={{ color: "rgba(21,36,61,0.88)" }}>${(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] uppercase tracking-wider" style={{ color: "rgba(21,36,61,0.6)" }}>Standard Shipping</span>
          <span className="text-[12px] font-semibold" style={{ color: "rgba(200,220,160,0.85)" }}>FREE</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-[12px] uppercase tracking-wider" style={{ color: "rgba(21,36,61,0.6)" }}>Expedited Options</span>
          <span className="text-[12px]" style={{ color: "rgba(200,160,220,0.55)" }}>Available at checkout</span>
        </div>

        {/* Made for You callout */}
        <div className="flex items-start gap-3 p-4 mb-6" style={{
          background: "rgba(36,139,212,0.04)",
          border: "1px solid rgba(36,139,212,0.08)",
          borderRadius: "12px",
        }}>
          <span className="text-base shrink-0 mt-0.5">✦</span>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(36,139,212,0.85)" }}>Made Exclusively for You</p>
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(21,36,61,0.52)" }}>
              Each piece is crafted on demand — no mass production, no waste. Production takes 2–5 business days before shipping, because your item is being made just for you.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8 pt-4" style={{ borderTop: "1px solid rgba(92,155,205,0.18)" }}>
          <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: "rgba(21,36,61,0.78)" }}>Subtotal</span>
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
        <p className="text-center text-[10px] mt-3" style={{ color: "rgba(21,36,61,0.25)" }}>Secure checkout powered by Stripe</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
          {["🔒 SSL Encrypted", "✦ Free Standard Shipping", "📦 Tracked Delivery", "🪡 Made to Order"].map((badge) => (
            <span key={badge} className="text-[9px] tracking-[0.08em] uppercase" style={{ color: "rgba(21,36,61,0.44)" }}>{badge}</span>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
