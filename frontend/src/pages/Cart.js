import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { ShoppingBag, Trash2, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/cart`, { withCredentials: true });
      setCart(data);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to fetch cart:', err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCart();
  }, [user, navigate, fetchCart]);

  const removeItem = async (itemId) => {
    try {
      const { data } = await axios.delete(`${API}/api/cart/${itemId}`, { withCredentials: true });
      setCart(data);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to remove item:', err);
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await axios.delete(`${API}/api/cart`, { withCredentials: true });
      setCart(data);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to clear cart:', err);
    }
  };

  const handleCheckout = async () => {
    setChecking(true);
    try {
      const origin = window.location.origin;
      const { data } = await axios.post(`${API}/api/checkout/create`, { origin_url: origin }, { withCredentials: true });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Checkout error:', err);
      alert(err.response?.data?.detail || 'Checkout failed');
    } finally { setChecking(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin text-[#8B6914]" size={32} /></div>;

  return (
    <div className="min-h-screen pt-20 px-6 lg:px-12 pb-16" data-testid="cart-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-4xl text-[#1A1A1A] font-light mb-12">
          Shopping <span className="text-[#8B6914]">Cart</span>
        </h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-24 border border-[#E8E4DD] bg-white" data-testid="cart-empty">
            <ShoppingBag size={48} strokeWidth={1} className="text-[#8B6914]/30 mx-auto mb-4" />
            <h3 className="font-heading text-xl text-[#1A1A1A] mb-2">Your Cart is Empty</h3>
            <p className="text-sm text-[#6B6B6B] mb-6">Add items from our collection to get started.</p>
            <Link to="/shop">
              <Button className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none" data-testid="continue-shopping-btn">
                Browse Collection
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3" data-testid="cart-items">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4 border border-[#E8E4DD] bg-white p-4" data-testid={`cart-item-${item.id}`}>
                  <div className="w-20 h-20 bg-[#F5F2ED] flex-shrink-0 overflow-hidden">
                    {(item.image || item.thumbnail_url) && (
                      <img src={item.image || item.thumbnail_url} alt={item.product_name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link to={`/product/${item.product_printful_id}`} className="text-sm text-[#1A1A1A] hover:text-[#8B6914] font-body">
                      {item.product_name}
                    </Link>
                    <div className="flex gap-3 text-xs text-[#6B6B6B] mt-1">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <p className="text-sm text-[#8B6914] mt-2">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-[#999] hover:text-red-500 transition-colors" data-testid={`remove-item-${item.id}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <button onClick={clearCart} className="text-xs text-[#999] hover:text-red-500" data-testid="clear-cart-btn">Clear Cart</button>
                <Link to="/shop" className="text-xs text-[#8B6914] hover:underline">Continue Shopping</Link>
              </div>
            </div>

            {/* Summary */}
            <div className="border border-[#E8E4DD] bg-white p-6 h-fit" data-testid="cart-summary">
              <h3 className="font-heading text-lg text-[#1A1A1A] mb-6">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>${cart.total?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Shipping</span>
                  <span className="text-[#8B6914]">Calculated at checkout</span>
                </div>
                <div className="border-t border-[#E8E4DD] pt-3 flex justify-between text-[#1A1A1A] font-medium">
                  <span>Total</span>
                  <span className="text-[#8B6914] text-lg">${cart.total?.toFixed(2)}</span>
                </div>
              </div>
              <Button onClick={handleCheckout} disabled={checking}
                className="w-full bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none mt-6 py-3 text-sm"
                data-testid="checkout-btn">
                {checking ? <><Loader2 size={16} className="animate-spin mr-2" /> Processing...</> :
                  <>Proceed to Checkout <ArrowRight size={16} className="ml-2" /></>}
              </Button>
              <p className="text-xs text-[#999] text-center mt-3">Secure checkout powered by Stripe</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
