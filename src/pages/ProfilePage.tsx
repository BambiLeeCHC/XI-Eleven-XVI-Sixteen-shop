import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";

export function ProfilePage() {
  const user = useQuery(api.auth.currentUser);
  const isAdmin = useQuery(api.users.isAdmin);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-[10px] tracking-[0.3em] uppercase text-purple-400/60 mb-2">ACCOUNT</p>
      <h1 className="text-3xl text-white font-light mb-8" style={{ fontFamily: "var(--font-display)" }}>
        My Profile
      </h1>

      <div className="space-y-6">
        <div className="p-6 border border-white/[0.06] bg-white/[0.02]">
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-1">EMAIL</p>
          <p className="text-white/70">{user?.email || "—"}</p>
        </div>

        <div className="flex gap-4">
          <Link
            to="/orders"
            className="flex-1 p-4 border border-white/[0.06] bg-white/[0.02] text-center hover:border-purple-400/20 transition-all"
          >
            <span className="text-lg mb-1 block">📦</span>
            <span className="text-[11px] tracking-wider uppercase text-white/50">My Orders</span>
          </Link>
          <Link
            to="/shop"
            className="flex-1 p-4 border border-white/[0.06] bg-white/[0.02] text-center hover:border-purple-400/20 transition-all"
          >
            <span className="text-lg mb-1 block">✦</span>
            <span className="text-[11px] tracking-wider uppercase text-white/50">Shop</span>
          </Link>
        </div>

        {/* Admin Dashboard — only visible to admins */}
        {isAdmin && (
          <Link
            to="/admin"
            className="block p-4 border border-amber-500/15 bg-amber-500/[0.04] hover:border-amber-400/30 hover:bg-amber-500/[0.08] transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">⚙️</span>
              <div>
                <p className="text-[11px] tracking-wider uppercase text-amber-400/70 font-semibold">Admin Dashboard</p>
                <p className="text-[10px] text-white/30 mt-0.5">Manage orders, products, tax & shipping</p>
              </div>
              <svg className="w-4 h-4 text-amber-400/30 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </Link>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full py-3 text-[11px] tracking-[0.2em] uppercase text-white/40 border border-white/10 hover:border-white/20 hover:text-white/60 transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
