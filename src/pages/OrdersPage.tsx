import { useQuery } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";

/* ─── Fulfillment stage metadata ─────────────────────────────────────── */

const STAGES = [
  { key: "payment_received", label: "Payment Confirmed", icon: "💳" },
  { key: "sent_to_printful", label: "Sent to Production", icon: "📋" },
  { key: "printful_processing", label: "Being Crafted", icon: "🪡" },
  { key: "printful_fulfilled", label: "Production Complete", icon: "✅" },
  { key: "shipped", label: "Shipped", icon: "📦" },
  { key: "delivered", label: "Delivered", icon: "🏠" },
];

function FulfillmentTracker({ stage, history }: { stage?: string; history?: Array<{ stage: string; timestamp: number; note?: string }> }) {
  if (!stage) return null;
  const currentIdx = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(200,140,255,0.08)" }}>
      <p className="text-[10px] tracking-[0.15em] uppercase font-semibold mb-3" style={{ color: "rgba(200,160,220,0.5)" }}>
        Fulfillment Progress
      </p>
      <div className="flex items-center gap-1 mb-3 overflow-x-auto">
        {STAGES.map((s, i) => {
          const isComplete = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={s.key} className="flex items-center gap-1 shrink-0">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-[11px] transition-all"
                style={{
                  background: isComplete
                    ? "linear-gradient(135deg, rgba(200,140,255,0.25), rgba(255,158,184,0.2))"
                    : "rgba(255,240,230,0.04)",
                  border: isCurrent
                    ? "2px solid rgba(200,140,255,0.5)"
                    : isComplete
                      ? "1px solid rgba(200,140,255,0.15)"
                      : "1px solid rgba(240,210,190,0.06)",
                  boxShadow: isCurrent ? "0 0 10px rgba(200,140,255,0.2)" : "none",
                }}
                title={s.label}
              >
                {s.icon}
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className="w-3 h-[2px]"
                  style={{
                    background: i < currentIdx
                      ? "linear-gradient(90deg, rgba(200,140,255,0.3), rgba(255,158,184,0.25))"
                      : "rgba(240,210,190,0.06)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Current stage label */}
      {currentIdx >= 0 && (
        <p className="text-[11px]" style={{ color: "rgba(200,160,220,0.6)" }}>
          {STAGES[currentIdx].icon} {STAGES[currentIdx].label}
          {stage === "printful_processing" && (
            <span style={{ color: "rgba(245,230,220,0.35)" }}> — Your piece is being crafted exclusively for you</span>
          )}
        </p>
      )}
      {/* History entries */}
      {history && history.length > 0 && (
        <div className="mt-3 space-y-1">
          {history.slice().reverse().slice(0, 3).map((h, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[9px] shrink-0 mt-0.5" style={{ color: "rgba(245,230,220,0.2)" }}>
                {new Date(h.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="text-[10px]" style={{ color: "rgba(245,230,220,0.3)" }}>
                {h.note}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrdersPage() {
  const orders = useQuery(api.orders.listByUser) ?? [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="text-[10px] tracking-[0.3em] uppercase text-purple-400/60 mb-2">ACCOUNT</p>
      <h1 className="text-3xl text-white font-light mb-8" style={{ fontFamily: "var(--font-display)" }}>
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/40 text-[14px] mb-4">No orders yet.</p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 text-[11px] tracking-[0.2em] uppercase font-bold text-white border border-white/20 hover:border-purple-400/50 transition-all"
            style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(100,200,255,0.08))" }}
          >
            START SHOPPING
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div
              key={order._id}
              className="p-6"
              style={{
                background: "rgba(255,240,230,0.02)",
                border: "1px solid rgba(240,210,190,0.06)",
                borderRadius: "16px",
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-white/40">Order</p>
                  <p className="text-[12px] text-white/60 font-mono">{order._id.slice(-8)}</p>
                  <p className="text-[10px] mt-1" style={{ color: "rgba(245,230,220,0.25)" }}>
                    {new Date(order._creationTime).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 text-[9px] tracking-wider uppercase rounded-full ${
                  order.status === "paid" ? "text-green-400 border-green-400/30 bg-green-500/10" :
                  order.status === "fulfilled" ? "text-blue-400 border-blue-400/30 bg-blue-500/10" :
                  order.status === "shipped" ? "text-cyan-400 border-cyan-400/30 bg-cyan-500/10" :
                  order.status === "delivered" ? "text-purple-400 border-purple-400/30 bg-purple-500/10" :
                  "text-white/40 border-white/10"
                }`} style={{ border: "1px solid" }}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-2">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-[12px]">
                    <span className="text-white/50">{item.productName} × {item.quantity} — {item.size}</span>
                    <span className="text-white/60">${(item.priceAtPurchase * item.quantity / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 flex justify-between" style={{ borderTop: "1px solid rgba(168,85,247,0.08)" }}>
                <span className="text-[11px] text-white/40 uppercase tracking-wider">Total</span>
                <span className="text-white/80">${(order.total / 100).toFixed(2)}</span>
              </div>

              {/* Shipping method */}
              {order.shippingMethod && (
                <p className="text-[10px] mt-2" style={{ color: "rgba(245,230,220,0.3)" }}>
                  Shipping: {order.shippingMethod}
                </p>
              )}

              {/* Fulfillment tracker */}
              <FulfillmentTracker
                stage={order.fulfillmentStage}
                history={order.fulfillmentHistory}
              />

              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-[11px] text-purple-400 hover:text-purple-300 transition-colors">
                  📦 Track Package →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
