import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Package, Truck, Clock, Check, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUS_COLORS = {
  pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  processing: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  shipped: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  delivered: 'text-green-400 border-green-400/30 bg-green-400/5',
  cancelled: 'text-red-400 border-red-400/30 bg-red-400/5'
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/api/orders`, { withCredentials: true });
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="font-heading text-4xl text-[#F5F5F0] font-light mb-12">
          My <span className="text-[#C5A059]">Orders</span>
        </h1>

        {loading ? (
          <div className="text-center py-24 text-[#A3A3A3]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 border border-[#2E2E2E] bg-[#0F0F0F]" data-testid="orders-empty">
            <Package size={48} strokeWidth={1} className="text-[#C5A059]/30 mx-auto mb-4" />
            <h3 className="font-heading text-xl text-[#F5F5F0] mb-2">No Orders Yet</h3>
            <p className="text-sm text-[#A3A3A3] mb-6">Start shopping to see your orders here.</p>
            <Button onClick={() => navigate('/shop')} className="bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none" data-testid="shop-now-btn">
              Browse Collection
            </Button>
          </div>
        ) : (
          <div className="space-y-4" data-testid="orders-list">
            {orders.map(order => (
              <div key={order.id} className="border border-[#2E2E2E] bg-[#0F0F0F]" data-testid={`order-${order.id}`}>
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#141414] transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1 text-xs border px-3 py-1 ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                      <StatusIcon status={order.status} />
                      {order.status}
                    </div>
                    <div>
                      <p className="text-sm text-[#F5F5F0]">{order.product_name}</p>
                      <p className="text-xs text-[#666]">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-[#C5A059]">${order.total_price}</p>
                    {expandedOrder === order.id ? <ChevronUp size={16} className="text-[#666]" /> : <ChevronDown size={16} className="text-[#666]" />}
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t border-[#2E2E2E] p-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-[#666]">Order ID</p>
                        <p className="text-[#A3A3A3] truncate">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-[#666]">Size</p>
                        <p className="text-[#A3A3A3]">{order.size || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[#666]">Quantity</p>
                        <p className="text-[#A3A3A3]">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-[#666]">Tracking</p>
                        <p className="text-[#A3A3A3]">{order.tracking_number || 'Awaiting shipment'}</p>
                      </div>
                    </div>
                    {order.shipping_address && (
                      <div className="text-xs border-t border-[#2E2E2E] pt-3">
                        <p className="text-[#666] mb-1">Shipping To</p>
                        <p className="text-[#A3A3A3]">
                          {order.shipping_address.full_name}, {order.shipping_address.address_line1}
                          {order.shipping_address.city && `, ${order.shipping_address.city}`}
                          {order.shipping_address.state && ` ${order.shipping_address.state}`}
                          {order.shipping_address.zip_code && ` ${order.shipping_address.zip_code}`}
                        </p>
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
