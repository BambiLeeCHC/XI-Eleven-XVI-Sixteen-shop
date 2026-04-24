import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Package, Truck, Clock, Check, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;
const STATUS_COLORS = {
  pending: 'text-amber-600 border-amber-300 bg-amber-50',
  processing: 'text-blue-600 border-blue-300 bg-blue-50',
  shipped: 'text-purple-600 border-purple-300 bg-purple-50',
  delivered: 'text-green-600 border-green-300 bg-green-50',
  cancelled: 'text-red-600 border-red-300 bg-red-50'
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/api/orders`, { withCredentials: true }); setOrders(data.orders || []); }
    catch (err) { if (process.env.NODE_ENV === 'development') console.error('Failed to fetch orders:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrders();
  }, [user, navigate, fetchOrders]);

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'processing': return <Package size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'delivered': return <Check size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="min-h-screen pt-20 px-6 lg:px-12 pb-16" data-testid="orders-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-4xl text-[#1A1A1A] font-light mb-12">My <span className="text-[#8B6914]">Orders</span></h1>
        {loading ? <div className="text-center py-24 text-[#6B6B6B]">Loading orders...</div> :
        orders.length === 0 ? (
          <div className="text-center py-24 border border-[#E8E4DD] bg-white" data-testid="orders-empty">
            <Package size={48} strokeWidth={1} className="text-[#8B6914]/30 mx-auto mb-4" />
            <h3 className="font-heading text-xl text-[#1A1A1A] mb-2">No Orders Yet</h3>
            <p className="text-sm text-[#6B6B6B] mb-6">Start shopping to see your orders here.</p>
            <Button onClick={() => navigate('/shop')} className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none" data-testid="shop-now-btn">Browse Collection</Button>
          </div>
        ) : (
          <div className="space-y-4" data-testid="orders-list">
            {orders.map(order => (
              <div key={order.id} className="border border-[#E8E4DD] bg-white" data-testid={`order-${order.id}`}>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FAF8F5] transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1 text-xs border px-3 py-1 ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                      <StatusIcon status={order.status} />{order.status}
                    </div>
                    <div>
                      <p className="text-sm text-[#1A1A1A]">{order.product_name}</p>
                      <p className="text-xs text-[#999]">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-[#8B6914]">${order.total_price}</p>
                    {expandedOrder === order.id ? <ChevronUp size={16} className="text-[#999]" /> : <ChevronDown size={16} className="text-[#999]" />}
                  </div>
                </div>
                {expandedOrder === order.id && (
                  <div className="border-t border-[#E8E4DD] p-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div><p className="text-[#999]">Order ID</p><p className="text-[#6B6B6B] truncate">{order.id}</p></div>
                      <div><p className="text-[#999]">Size</p><p className="text-[#6B6B6B]">{order.size || 'N/A'}</p></div>
                      <div><p className="text-[#999]">Quantity</p><p className="text-[#6B6B6B]">{order.quantity}</p></div>
                      <div><p className="text-[#999]">Tracking</p><p className="text-[#6B6B6B]">{order.tracking_number || 'Awaiting shipment'}</p></div>
                    </div>
                    {order.shipping_address && (
                      <div className="text-xs border-t border-[#E8E4DD] pt-3">
                        <p className="text-[#999] mb-1">Shipping To</p>
                        <p className="text-[#6B6B6B]">{order.shipping_address.full_name}, {order.shipping_address.address_line1}{order.shipping_address.city && `, ${order.shipping_address.city}`}{order.shipping_address.state && ` ${order.shipping_address.state}`}{order.shipping_address.zip_code && ` ${order.shipping_address.zip_code}`}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
