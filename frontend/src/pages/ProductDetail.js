import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../components/ui/carousel';
import { Loader2, Ruler, ShoppingBag, ScanLine, Check, Image, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMeasurement, MEASUREMENT_LABELS } from '../utils/units';
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
  const [isMetric, setIsMetric] = useState(false);

  // Try-on state
  const [tryonMode, setTryonMode] = useState('analysis'); // 'analysis' or 'render'
  const [tryonResult, setTryonResult] = useState(null);
  const [tryonImage, setTryonImage] = useState(null);
  const [loadingTryon, setLoadingTryon] = useState(false);

  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Image gallery
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => { fetchProduct(); }, [id]); // eslint-disable-line

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
    } catch { setProduct(null); }
    finally { setLoading(false); }
  };

  const getAllImages = () => {
    if (!product) return [];
    const images = [];
    if (product.thumbnail_url) images.push(product.thumbnail_url);
    (product.variants || []).forEach(v => {
      if (v.image && !images.includes(v.image)) images.push(v.image);
    });
    (product.ad_images || []).forEach(ad => {
      if (ad.path) images.push(`ad:${ad.path}`);
    });
    return images.length > 0 ? images : [];
  };

  const getSizeRecommendation = async () => {
    if (!user?.measurements) return;
    setLoadingRec(true);
    try {
      const { data } = await axios.post(`${API}/api/size-recommend`, { category: product?.category || 'tops' }, { withCredentials: true });
      setSizeRec(data);
      if (data.recommended_size) setSelectedSize(data.recommended_size);
    } catch (err) { console.error(err); }
    finally { setLoadingRec(false); }
  };

  const handleTryOn = async () => {
    if (!user?.photo_path) return;
    setLoadingTryon(true);
    setTryonResult(null);
    setTryonImage(null);
    try {
      if (tryonMode === 'render') {
        const { data } = await axios.post(`${API}/api/tryon/render`, {
          product_name: product?.name,
          product_description: `${product?.category} garment, ${selectedColor || ''} ${selectedSize || ''}`
        }, { withCredentials: true, timeout: 120000 });
        setTryonImage(data.image_base64);
      } else {
        const { data } = await axios.post(`${API}/api/tryon`, {
          product_name: product?.name,
          product_image: product?.thumbnail_url || product?.variants?.[0]?.image || ''
        }, { withCredentials: true, timeout: 120000 });
        setTryonResult(data);
      }
    } catch (err) { console.error('Try-on error:', err); }
    finally { setLoadingTryon(false); }
  };

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    setOrdering(true);
    try {
      const variantIndex = product.variants?.findIndex(v => v.size === selectedSize && (!selectedColor || v.color === selectedColor)) ?? 0;
      await axios.post(`${API}/api/orders`, {
        product_id: String(product.printful_id), variant_index: Math.max(variantIndex, 0), quantity: 1, size: selectedSize
      }, { withCredentials: true });
      setOrderSuccess(true);
    } catch (err) { console.error(err); }
    finally { setOrdering(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin text-[#8B6914]" size={32} /></div>;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center pt-20"><div className="text-center">
      <h1 className="font-heading text-2xl text-[#1A1A1A]">Product not found</h1>
      <Button onClick={() => navigate('/shop')} className="mt-4 bg-[#1A1A1A] text-white rounded-none">Back to Shop</Button>
    </div></div>
  );

  const sizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean) || [])];
  const colors = [...new Set(product.variants?.map(v => v.color).filter(Boolean) || [])];
  const currentVariant = product.variants?.find(v => v.size === selectedSize && (!selectedColor || v.color === selectedColor)) || product.variants?.[0];
  const allImages = getAllImages();

  return (
    <div className="min-h-screen pt-20 px-6 lg:px-12 pb-16" data-testid="product-detail-page">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/shop')} className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] mb-6 flex items-center gap-1">
          <ChevronLeft size={14} /> Back to shop
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Carousel */}
          <div data-testid="product-image">
            {allImages.length > 1 ? (
              <div className="space-y-3">
                <div className="border border-[#E8E4DD] bg-white aspect-square flex items-center justify-center overflow-hidden">
                  <img src={allImages[activeImageIdx]?.startsWith('ad:') ? '' : allImages[activeImageIdx]} alt={product.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => setActiveImageIdx(i)}
                      className={`w-16 h-16 border flex-shrink-0 overflow-hidden ${activeImageIdx === i ? 'border-[#8B6914]' : 'border-[#E8E4DD]'}`}>
                      <img src={img.startsWith('ad:') ? '' : img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-[#E8E4DD] bg-white aspect-square flex items-center justify-center overflow-hidden">
                {allImages[0] ? (
                  <img src={allImages[0]} alt={product.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-[#999] text-center"><ShoppingBag size={64} strokeWidth={1} /><p className="text-sm mt-4">No image available</p></div>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-xs text-[#8B6914] tracking-widest uppercase mb-2 font-body">{product.category}</p>
              <h1 className="font-heading text-3xl text-[#1A1A1A] font-light" data-testid="product-name">{product.name}</h1>
              <p className="text-2xl text-[#8B6914] mt-3 font-body" data-testid="product-price">
                {currentVariant?.retail_price ? `$${currentVariant.retail_price}` : 'Price TBD'}
              </p>
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div>
                <p className="text-xs text-[#6B6B6B] mb-3 tracking-wide uppercase font-body">Color</p>
                <div className="flex flex-wrap gap-2" data-testid="color-selector">
                  {colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 text-xs border transition-all ${selectedColor === c ? 'border-[#8B6914] text-[#8B6914] bg-[#8B6914]/5' : 'border-[#E8E4DD] text-[#6B6B6B] hover:border-[#8B6914]/30'}`}>
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
                  <p className="text-xs text-[#6B6B6B] tracking-wide uppercase font-body">Size</p>
                  {user?.measurements && (
                    <button onClick={getSizeRecommendation} disabled={loadingRec} className="text-xs text-[#8B6914] hover:underline flex items-center gap-1" data-testid="get-size-rec-btn">
                      {loadingRec ? <Loader2 size={12} className="animate-spin" /> : <Ruler size={12} />} Get AI Size Recommendation
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2" data-testid="size-selector">
                  {sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 text-xs border transition-all relative ${selectedSize === s ? 'border-[#8B6914] text-[#8B6914] bg-[#8B6914]/5' : 'border-[#E8E4DD] text-[#6B6B6B] hover:border-[#8B6914]/30'}`}>
                      {s}
                      {sizeRec?.recommended_size === s && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#8B6914] flex items-center justify-center"><Check size={8} className="text-white" /></span>}
                    </button>
                  ))}
                </div>
                {sizeRec && (
                  <div className="mt-3 border border-[#8B6914]/20 bg-[#8B6914]/5 px-4 py-3" data-testid="size-recommendation">
                    <p className="text-xs text-[#8B6914]">Recommended: <strong>{sizeRec.recommended_size}</strong> ({sizeRec.confidence}% confidence)</p>
                  </div>
                )}
              </div>
            )}

            {/* Virtual Try-On */}
            {user?.photo_path && (
              <div className="border-t border-[#E8E4DD] pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[#6B6B6B] tracking-wide uppercase font-body">Virtual Try-On</p>
                  <div className="flex items-center gap-2" data-testid="tryon-mode-toggle">
                    <FileText size={14} className={tryonMode === 'analysis' ? 'text-[#8B6914]' : 'text-[#999]'} />
                    <Switch checked={tryonMode === 'render'} onCheckedChange={(v) => setTryonMode(v ? 'render' : 'analysis')} className="data-[state=checked]:bg-[#8B6914]" />
                    <Image size={14} className={tryonMode === 'render' ? 'text-[#8B6914]' : 'text-[#999]'} />
                    <span className="text-xs text-[#6B6B6B]">{tryonMode === 'render' ? 'Visual Render' : 'Fit Analysis'}</span>
                  </div>
                </div>
                <Button onClick={handleTryOn} disabled={loadingTryon} variant="outline"
                  className="w-full border-[#8B6914]/30 text-[#8B6914] hover:bg-[#8B6914]/5 rounded-none text-sm"
                  data-testid="try-on-btn">
                  {loadingTryon ? <><Loader2 size={16} className="animate-spin mr-2" /> {tryonMode === 'render' ? 'Rendering...' : 'Analyzing...'}</> :
                    <><ScanLine size={16} className="mr-2" /> {tryonMode === 'render' ? 'Generate Virtual Render' : 'Analyze Fit'}</>}
                </Button>

                {/* Render result */}
                {tryonImage && (
                  <div className="mt-4 border border-[#E8E4DD] bg-white" data-testid="tryon-render">
                    <img src={`data:image/png;base64,${tryonImage}`} alt="Virtual Try-On" className="w-full" />
                    <p className="text-xs text-[#6B6B6B] p-3 text-center">AI-generated visualization of {product.name}</p>
                  </div>
                )}

                {/* Analysis result */}
                {tryonResult && (
                  <div className="mt-4 border border-[#E8E4DD] bg-white p-4 space-y-3" data-testid="tryon-result">
                    <h4 className="text-xs text-[#8B6914] tracking-wide uppercase">Fit Analysis</h4>
                    <p className="text-sm text-[#6B6B6B] leading-relaxed">{tryonResult.fit_analysis}</p>
                    {tryonResult.size_notes && <p className="text-xs text-[#999]">{tryonResult.size_notes}</p>}
                    <div className="flex items-center gap-4">
                      <div><p className="text-xs text-[#999]">Style Rating</p><p className="text-sm text-[#8B6914]">{tryonResult.style_rating}/10</p></div>
                      <div><p className="text-xs text-[#999]">Overall</p><p className="text-xs text-[#6B6B6B]">{tryonResult.overall_look}</p></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order */}
            {orderSuccess ? (
              <div className="border border-[#8B6914]/30 bg-[#8B6914]/5 p-4 text-center" data-testid="order-success">
                <Check size={24} className="text-[#8B6914] mx-auto mb-2" />
                <p className="text-sm text-[#8B6914]">Order placed successfully!</p>
                <Button onClick={() => navigate('/orders')} variant="ghost" className="text-[#8B6914] mt-2 text-xs">View Orders</Button>
              </div>
            ) : (
              <Button onClick={handleOrder} disabled={ordering}
                className="w-full bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none py-3 text-sm font-medium tracking-wide"
                data-testid="add-to-order-btn">
                {ordering ? <><Loader2 size={16} className="animate-spin mr-2" /> Placing Order...</> : 'Place Order'}
              </Button>
            )}

            {!user?.measurements && (
              <p className="text-xs text-[#999] text-center">
                <button onClick={() => navigate('/scan')} className="text-[#8B6914] hover:underline">Complete a body scan</button> to get personalized size recommendations and virtual try-on.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
