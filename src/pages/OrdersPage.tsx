import { useQuery } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";

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
            <div key={order._id} className="p-6 border border-white/[0.06] bg-white/[0.02]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-white/40">Order</p>
                  <p className="text-[12px] text-white/60 font-mono">{order._id.slice(-8)}</p>
                </div>
                <span className={`px-3 py-1 text-[9px] tracking-wider uppercase border ${
                  order.status === "paid" ? "text-green-400 border-green-400/30 bg-green-500/10" :
                  order.status === "shipped" ? "text-cyan-400 border-cyan-400/30 bg-cyan-500/10" :
                  order.status === "delivered" ? "text-purple-400 border-purple-400/30 bg-purple-500/10" :
                  "text-white/40 border-white/10"
                }`}>
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
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-[11px] text-purple-400 hover:text-purple-300">
                  Track Package →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
