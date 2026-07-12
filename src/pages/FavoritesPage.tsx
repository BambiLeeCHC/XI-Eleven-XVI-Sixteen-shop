import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";


export default function FavoritesPage() {
  const { isAuthenticated } = useConvexAuth();
  const favorites = useQuery(api.favorites.list) ?? [];
  const toggleFavorite = useMutation(api.favorites.toggle);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#f0e6d3]/20 mb-6">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
        <h2 className="text-lg font-semibold text-[#f0e6d3]/80 mb-2">Sign in to save favorites</h2>
        <p className="text-sm text-[#f0e6d3]/40 mb-6 max-w-sm">Create an account to save your favorite items and access them anytime.</p>
        <Link
          to="/login"
          className="px-8 py-3 text-[11px] tracking-[0.2em] uppercase font-semibold text-[#f0e6d3] rounded-lg transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(201,169,110,0.15), rgba(255,190,170,0.1))",
            border: "1px solid rgba(240, 210, 190, 0.15)",
          }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
      <h1
        className="text-2xl font-light tracking-[0.15em] uppercase mb-2"
        style={{ color: "rgba(240, 230, 211, 0.9)" }}
      >
        My Favorites
      </h1>
      <p className="text-sm text-[#f0e6d3]/30 mb-10">
        {favorites.length === 0
          ? "You haven't favorited any items yet."
          : `${favorites.length} saved item${favorites.length === 1 ? "" : "s"}`}
      </p>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#f0e6d3]/10 mx-auto mb-6">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <p className="text-[#f0e6d3]/30 text-sm mb-6">Browse our collections and tap the heart to save items you love.</p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 text-[11px] tracking-[0.2em] uppercase font-semibold text-[#f0e6d3] rounded-lg transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, rgba(201,169,110,0.15), rgba(255,190,170,0.1))",
              border: "1px solid rgba(240, 210, 190, 0.15)",
            }}
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {favorites.map((fav) => (
            <div
              key={fav._id}
              className="group relative rounded-xl overflow-hidden cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(20,15,25,0.9), rgba(15,12,18,0.95))",
                border: "1px solid rgba(240, 210, 190, 0.06)",
              }}
            >
              {/* Remove favorite button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite({ productId: fav.productId });
                }}
                className="absolute top-3 right-3 z-10 p-2 rounded-full transition-all hover:scale-110"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
                title="Remove from favorites"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,120,150,0.9)" stroke="rgba(255,120,150,0.9)" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>

              {/* Product image */}
              <div
                className="aspect-[3/4] overflow-hidden"
                onClick={() => navigate(`/product/${fav.productId}`)}
              >
                <img
                  src={fav.product.images?.[0]}
                  alt={fav.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Product info */}
              <div className="p-4" onClick={() => navigate(`/product/${fav.productId}`)}>
                <h3 className="text-xs tracking-[0.1em] uppercase font-semibold text-[#f0e6d3]/80 mb-1 truncate">
                  {fav.product.name}
                </h3>
                <p className="text-xs text-[#f0e6d3]/35">
                  ${(fav.product.price / 100).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
