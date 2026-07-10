import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const allProducts = useQuery(api.products.list, {}) ?? [];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const filtered = query.trim().length > 0
    ? allProducts.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.gender.toLowerCase().includes(q)
        );
      })
    : [];

  const handleSelect = (productId: string) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search panel */}
      <div
        className="absolute top-0 left-0 right-0 max-h-[80vh] overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(180deg, #0e0a0f 0%, #0c080e 100%)",
          borderBottom: "1px solid rgba(240, 210, 190, 0.08)",
        }}
      >
        {/* Search input row */}
        <div className="flex items-center gap-4 px-6 lg:px-12 py-5 border-b border-white/[0.06]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30 shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm tracking-wide outline-none placeholder-white/25"
          />
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[60vh] px-6 lg:px-12 py-4">
          {query.trim().length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[11px] tracking-[0.2em] uppercase text-white/20">
                Start typing to search
              </p>
              <div className="flex justify-center gap-3 mt-6">
                {["Dresses", "Jerseys", "Leggings", "Sports Bras"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 text-[10px] tracking-[0.15em] uppercase text-white/40 rounded-full transition-colors hover:text-white/60"
                    style={{
                      border: "1px solid rgba(240, 210, 190, 0.08)",
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-white/30">No products found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/20 mb-3">
                {filtered.length} result{filtered.length === 1 ? "" : "s"}
              </p>
              {filtered.slice(0, 12).map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleSelect(product._id)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-white/[0.03] group text-left"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-black/30">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs tracking-[0.08em] uppercase font-semibold text-white/70 group-hover:text-white/90 truncate transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {product.category} · {product.gender === "women" ? "Women" : "Men"} · ${(product.price / 100).toFixed(2)}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15 group-hover:text-white/40 transition-colors shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
