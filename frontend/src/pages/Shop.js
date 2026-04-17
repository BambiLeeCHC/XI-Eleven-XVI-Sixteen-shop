import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;
const PLACEHOLDER = "https://images.unsplash.com/photo-1598795737563-07467e744bac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwY2xvdGhpbmclMjByYWNrfGVufDB8fHx8MTc3NjM4ODE0OXww&ixlib=rb-4.1.0&q=85";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const activeCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (activeCategory !== 'all') params.category = activeCategory;
      if (search) params.search = search;
      const { data } = await axios.get(`${API}/api/products`, { params });
      setProducts(data.products || []);
      setCategories(data.categories || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const setCategory = (cat) => {
    setSearchParams(cat === 'all' ? {} : { category: cat });
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-20 px-6 lg:px-12 pb-16" data-testid="shop-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl text-[#F5F5F0] font-light">
              The <span className="text-[#C5A059]">Collection</span>
            </h1>
            <p className="text-sm text-[#A3A3A3] mt-3 font-body">{total} pieces available</p>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[#0F0F0F] border border-[#2E2E2E] pl-10 pr-4 py-2 text-sm text-[#F5F5F0] font-body w-64 focus:border-[#C5A059] outline-none transition-colors"
                placeholder="Search products..."
                data-testid="shop-search-input"
              />
            </div>
            <Button type="submit" className="bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none text-sm px-4" data-testid="shop-search-btn">
              <Search size={14} />
            </Button>
          </form>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-3 mb-8" data-testid="category-filters">
          <button
            onClick={() => setCategory('all')}
            className={`text-xs tracking-wide uppercase font-body px-4 py-2 border transition-all duration-300 ${
              activeCategory === 'all'
                ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/10'
                : 'border-[#2E2E2E] text-[#A3A3A3] hover:border-[#C5A059]/30'
            }`}
            data-testid="filter-all"
          >
            All
          </button>
          {['tops', 'bottoms', 'outerwear', 'accessories', 'dresses', 'other'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs tracking-wide uppercase font-body px-4 py-2 border transition-all duration-300 ${
                activeCategory === cat
                  ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/10'
                  : 'border-[#2E2E2E] text-[#A3A3A3] hover:border-[#C5A059]/30'
              }`}
              data-testid={`filter-${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24" data-testid="shop-loading">
            <Loader2 className="animate-spin text-[#C5A059]" size={32} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24" data-testid="shop-empty">
            <Filter size={48} strokeWidth={1} className="text-[#C5A059]/30 mx-auto mb-4" />
            <h3 className="font-heading text-xl text-[#F5F5F0] mb-2">No Products Yet</h3>
            <p className="text-sm text-[#A3A3A3] max-w-sm mx-auto">
              Products will appear once the admin syncs inventory from Printful. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="products-grid">
            {products.map((product, i) => (
              <Link
                key={product.printful_id || i}
                to={`/product/${product.printful_id}`}
                className="group border border-[#2E2E2E] hover:border-[#C5A059]/30 transition-all duration-300"
                data-testid={`product-card-${product.printful_id || i}`}
              >
                <div className="aspect-square overflow-hidden bg-[#0A0A0A]">
                  <img
                    src={product.thumbnail_url || (product.variants?.[0]?.image) || PLACEHOLDER}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = PLACEHOLDER; }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm text-[#F5F5F0] font-body truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-[#C5A059]">
                      {product.variants?.[0]?.retail_price
                        ? `$${product.variants[0].retail_price}`
                        : 'Price TBD'}
                    </p>
                    <span className="text-xs text-[#666] uppercase">{product.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
