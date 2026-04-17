import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Loader2, Ruler, ShoppingBag, ScanLine, Check } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeRec, setSizeRec] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [tryonResult, setTryonResult] = useState(null);
  const [loadingTryon, setLoadingTryon] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/products/${id}`);
      setProduct(data);
      if (data.variants?.length > 0) {
        const sizes = [...new Set(data.variants.map(v => v.size).filter(Boolean))];
        const colors = [...new Set(data.variants.map(v => v.color).filter(Boolean))];
        if (sizes.length) setSelectedSize(sizes[0]);
        if (colors.length) setSelectedColor(colors[0]);
      }
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const getSizeRecommendation = async () => {
    if (!user?.measurements) return;
    setLoadingRec(true);
    try {
      const { data } = await axios.post(`${API}/api/size-recommend`, {
        category: product?.category || 'tops'
      }, { withCredentials: true });
      setSizeRec(data);
      if (data.recommended_size) setSelectedSize(data.recommended_size);
    } catch (err) {
      console.error('Size rec error:', err);
    } finally {
      setLoadingRec(false);
    }
  };

  const handleTryOn = async () => {
    if (!user?.photo_path) return;
    setLoadingTryon(true);
    try {
      const { data } = await axios.post(`${API}/api/tryon`, {
        product_name: product?.name,
        product_image: product?.thumbnail_url || product?.variants?.[0]?.image || ''
      }, { withCredentials: true, timeout: 120000 });
      setTryonResult(data);
    } catch (err) {
      console.error('Try-on error:', err);
    } finally {
      setLoadingTryon(false);
    }
  };

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    setOrdering(true);
    try {
      const variantIndex = product.variants?.findIndex(v =>
        v.size === selectedSize && (!selectedColor || v.color === selectedColor)
      ) ?? 0;
      await axios.post(`${API}/api/orders`, {
        product_id: String(product.printful_id),
        variant_index: Math.max(variantIndex, 0),
        quantity: 1,
        size: selectedSize
      }, { withCredentials: true });
      setOrderSuccess(true);
    } catch (err) {
      console.error('Order error:', err);
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="animate-spin text-[#C5A059]" size={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-[#F5F5F0]">Product not found</h1>
          <Button onClick={() => navigate('/shop')} className="mt-4 bg-[#C5A059] text-black rounded-none">Back to Shop</Button>
        </div>
      </div>
    );
  }

  const sizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean) || [])];
  const colors = [...new Set(product.variants?.map(v => v.color).filter(Boolean) || [])];
  const currentVariant = product.variants?.find(v => v.size === selectedSize && (!selectedColor || v.color === selectedColor)) || product.variants?.[0];
  const imageUrl = currentVariant?.image || product.thumbnail_url;

  return (
    <div className="min-h-screen pt-20 px-6 lg:px-12 pb-16" data-testid="product-detail-page">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="border border-[#2E2E2E] bg-[#0A0A0A] aspect-square flex items-center justify-center overflow-hidden" data-testid="product-image">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <div className="text-[#666] text-center">
                <ShoppingBag size={64} strokeWidth={1} />
                <p className="text-sm mt-4">No image available</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-xs text-[#C5A059] tracking-widest uppercase mb-2 font-body">{product.category}</p>
              <h1 className="font-heading text-3xl text-[#F5F5F0] font-light" data-testid="product-name">{product.name}</h1>
              <p className="text-2xl text-[#C5A059] mt-3 font-body" data-testid="product-price">
                {currentVariant?.retail_price ? `$${currentVariant.retail_price}` : 'Price TBD'}
              </p>
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div>
                <p className="text-xs text-[#A3A3A3] mb-3 tracking-wide uppercase font-body">Color</p>
                <div className="flex flex-wrap gap-2" data-testid="color-selector">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 text-xs border transition-all ${
                        selectedColor === c
                          ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/10'
                          : 'border-[#2E2E2E] text-[#A3A3A3] hover:border-[#C5A059]/30'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[#A3A3A3] tracking-wide uppercase font-body">Size</p>
                  {user?.measurements && (
                    <button
                      onClick={getSizeRecommendation}
                      disabled={loadingRec}
                      className="text-xs text-[#C5A059] hover:underline flex items-center gap-1"
                      data-testid="get-size-rec-btn"
                    >
                      {loadingRec ? <Loader2 size={12} className="animate-spin" /> : <Ruler size={12} />}
                      Get AI Size Recommendation
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2" data-testid="size-selector">
                  {sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 text-xs border transition-all relative ${
                        selectedSize === s
                          ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/10'
                          : 'border-[#2E2E2E] text-[#A3A3A3] hover:border-[#C5A059]/30'
                      }`}
                    >
                      {s}
                      {sizeRec?.recommended_size === s && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#C5A059] flex items-center justify-center">
                          <Check size={8} className="text-black" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {sizeRec && (
                  <div className="mt-3 border border-[#C5A059]/20 bg-[#C5A059]/5 px-4 py-3" data-testid="size-recommendation">
                    <p className="text-xs text-[#C5A059]">
                      Recommended: <strong>{sizeRec.recommended_size}</strong> ({sizeRec.confidence}% confidence)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Virtual Try-On */}
            {user?.photo_path && (
              <div className="border-t border-[#2E2E2E] pt-6">
                <Button
                  onClick={handleTryOn}
                  disabled={loadingTryon}
                  variant="outline"
                  className="w-full border-[#C5A059]/30 text-[#C5A059] hover:bg-[#C5A059]/10 rounded-none text-sm"
                  data-testid="try-on-btn"
                >
                  {loadingTryon ? (
                    <><Loader2 size={16} className="animate-spin mr-2" /> Generating Try-On...</>
                  ) : (
                    <><ScanLine size={16} className="mr-2" /> Virtual Try-On</>
                  )}
                </Button>
                {tryonResult && (
                  <div className="mt-4 border border-[#2E2E2E] bg-[#0F0F0F] p-4 space-y-3" data-testid="tryon-result">
                    <h4 className="text-xs text-[#C5A059] tracking-wide uppercase">Fit Analysis</h4>
                    <p className="text-sm text-[#A3A3A3] leading-relaxed">{tryonResult.fit_analysis}</p>
                    {tryonResult.size_notes && (
                      <p className="text-xs text-[#666]">{tryonResult.size_notes}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-[#666]">Style Rating</p>
                        <p className="text-sm text-[#C5A059]">{tryonResult.style_rating}/10</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#666]">Overall</p>
                        <p className="text-xs text-[#A3A3A3]">{tryonResult.overall_look}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order */}
            {orderSuccess ? (
              <div className="border border-[#C5A059]/30 bg-[#C5A059]/5 p-4 text-center" data-testid="order-success">
                <Check size={24} className="text-[#C5A059] mx-auto mb-2" />
                <p className="text-sm text-[#C5A059]">Order placed successfully!</p>
                <Button onClick={() => navigate('/orders')} variant="ghost" className="text-[#C5A059] mt-2 text-xs">View Orders</Button>
              </div>
            ) : (
              <Button
                onClick={handleOrder}
                disabled={ordering}
                className="w-full bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none py-3 text-sm font-medium tracking-wide"
                data-testid="add-to-order-btn"
              >
                {ordering ? <><Loader2 size={16} className="animate-spin mr-2" /> Placing Order...</> : 'Place Order'}
              </Button>
            )}

            {!user?.measurements && (
              <p className="text-xs text-[#666] text-center">
                <button onClick={() => navigate('/scan')} className="text-[#C5A059] hover:underline">Complete a body scan</button>
                {' '}to get personalized size recommendations and virtual try-on.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
