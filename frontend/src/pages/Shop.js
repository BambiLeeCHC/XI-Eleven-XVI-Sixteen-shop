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

  useEffect(() => { fetchProducts(); }, [activeCategory, page]); // eslint-disable-line

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (activeCategory !== 'all') params.category = activeCategory;
      if (search) params.search = search;
      const { data } = await axios.get(`${API}/api/products`, { params });
      setProducts(data.products || []); setCategories(data.categories || []); setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProducts(); };
  const setCategory = (cat) => { setSearchParams(cat === 'all' ? {} : { category: cat }); setPage(1); };

  return (
    <div className="min-h-screen pt-20 px-6 lg:px-12 pb-16" data-testid="shop-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl text-[#1A1A1A] font-light">The <span className="text-[#8B6914]">Collection</span></h1>
            <p className="text-sm text-[#6B6B6B] mt-3 font-body">{total} pieces available</p>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                className="bg-white border border-[#E8E4DD] pl-10 pr-4 py-2 text-sm text-[#1A1A1A] font-body w-64 focus:border-[#8B6914] outline-none transition-colors"
                placeholder="Search products..." data-testid="shop-search-input" />
            </div>
            <Button type="submit" className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none text-sm px-4" data-testid="shop-search-btn"><Search size={14} /></Button>
          </form>
        </div>

        <div className="flex flex-wrap gap-3 mb-8" data-testid="category-filters">
          {['all', 'tops', 'bottoms', 'outerwear', 'accessories', 'dresses', 'other'].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`text-xs tracking-wide uppercase font-body px-4 py-2 border transition-all duration-300 ${
                activeCategory === cat ? 'border-[#8B6914] text-[#8B6914] bg-[#8B6914]/5' : 'border-[#E8E4DD] text-[#6B6B6B] hover:border-[#8B6914]/30'
              }`} data-testid={`filter-${cat}`}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24" data-testid="shop-loading"><Loader2 className="animate-spin text-[#8B6914]" size={32} /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-24" data-testid="shop-empty">
            <Filter size={48} strokeWidth={1} className="text-[#8B6914]/30 mx-auto mb-4" />
            <h3 className="font-heading text-xl text-[#1A1A1A] mb-2">No Products Yet</h3>
            <p className="text-sm text-[#6B6B6B] max-w-sm mx-auto">Products will appear once the admin syncs inventory from Printful.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="products-grid">
            {products.map((product, i) => (
              <Link key={product.printful_id || i} to={`/product/${product.printful_id}`}
                className="group border border-[#E8E4DD] hover:border-[#8B6914]/30 transition-all duration-300 bg-white"
                data-testid={`product-card-${product.printful_id || i}`}>
                <div className="aspect-square overflow-hidden bg-[#F5F2ED]">
                  <img src={product.thumbnail_url || product.variants?.[0]?.image || PLACEHOLDER} alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = PLACEHOLDER; }} />
                </div>
                <div className="p-4">
                  <h3 className="text-sm text-[#1A1A1A] font-body truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-[#8B6914]">{product.variants?.[0]?.retail_price ? `$${product.variants[0].retail_price}` : 'Price TBD'}</p>
                    <span className="text-xs text-[#999] uppercase">{product.category}</span>
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
