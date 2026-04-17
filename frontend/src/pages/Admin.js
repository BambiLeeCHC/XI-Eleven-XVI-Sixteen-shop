import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Settings, RefreshCw, Package, Users, ShoppingBag, Loader2,
  Key, ChevronDown, ChevronUp, Edit2, Check, X, BarChart3
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  // Settings form
  const [newKey, setNewKey] = useState('printful_api_key');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchStats();
    fetchSettings();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/stats`, { withCredentials: true });
      setStats(data);
    } catch (err) { console.error(err); }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/settings`, { withCredentials: true });
      setSettings(data.settings || []);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/admin/products`, { withCredentials: true });
      setProducts(data.products || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/admin/orders`, { withCredentials: true });
      setOrders(data.orders || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/admin/users`, { withCredentials: true });
      setUsers(data.users || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const saveSetting = async () => {
    if (!newValue.trim()) return;
    try {
      await axios.put(`${API}/api/admin/settings`, { key: newKey, value: newValue }, { withCredentials: true });
      setNewValue('');
      await fetchSettings();
    } catch (err) { console.error(err); }
  };

  const syncProducts = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const { data } = await axios.post(`${API}/api/admin/sync-products`, {}, { withCredentials: true, timeout: 300000 });
      setSyncResult(data);
      if (!data.error) fetchProducts();
    } catch (err) {
      setSyncResult({ error: err.message });
    } finally {
      setSyncing(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/api/admin/orders/${orderId}`, { status }, { withCredentials: true });
      fetchOrders();
    } catch (err) { console.error(err); }
  };

  const updateOrderTracking = async (orderId, tracking) => {
    try {
      await axios.put(`${API}/api/admin/orders/${orderId}`, { tracking_number: tracking }, { withCredentials: true });
      fetchOrders();
    } catch (err) { console.error(err); }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen pt-20 px-6 lg:px-12 pb-16" data-testid="admin-page">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-heading text-4xl text-[#F5F5F0] font-light mb-8">
          Admin <span className="text-[#C5A059]">Panel</span>
        </h1>

        {/* Tab Nav */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#2E2E2E] pb-4" data-testid="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs tracking-wide uppercase font-body border transition-all ${
                activeTab === tab.id
                  ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/10'
                  : 'border-transparent text-[#A3A3A3] hover:text-[#F5F5F0]'
              }`}
              data-testid={`admin-tab-${tab.id}`}
            >
              <tab.icon size={14} strokeWidth={1.5} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="admin-stats">
            {[
              { label: 'Total Users', value: stats.total_users, icon: Users },
              { label: 'Active Products', value: stats.total_products, icon: ShoppingBag },
              { label: 'Total Orders', value: stats.total_orders, icon: Package },
              { label: 'Pending Orders', value: stats.pending_orders, icon: RefreshCw },
            ].map(stat => (
              <div key={stat.label} className="border border-[#2E2E2E] bg-[#0F0F0F] p-6" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                <stat.icon size={20} strokeWidth={1} className="text-[#C5A059] mb-3" />
                <p className="text-2xl text-[#F5F5F0] font-heading">{stat.value}</p>
                <p className="text-xs text-[#A3A3A3] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6" data-testid="admin-settings">
            <div className="border border-[#2E2E2E] bg-[#0F0F0F] p-6">
              <div className="flex items-center gap-2 mb-6">
                <Key size={20} strokeWidth={1} className="text-[#C5A059]" />
                <h3 className="font-heading text-lg text-[#F5F5F0]">API Configuration</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-2 uppercase tracking-wide font-body">Setting Key</label>
                  <select
                    value={newKey}
                    onChange={e => setNewKey(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2E2E2E] text-[#F5F5F0] text-sm px-3 py-2 focus:border-[#C5A059] outline-none"
                    data-testid="setting-key-select"
                  >
                    <option value="printful_api_key">Printful API Key</option>
                    <option value="store_name">Store Name</option>
                    <option value="support_email">Support Email</option>
                    <option value="shipping_note">Shipping Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-2 uppercase tracking-wide font-body">Value</label>
                  <input
                    type={newKey.includes('key') || newKey.includes('secret') ? 'password' : 'text'}
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-2 text-sm text-[#F5F5F0] font-body"
                    placeholder="Enter value..."
                    data-testid="setting-value-input"
                  />
                </div>
                <Button onClick={saveSetting} className="bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none text-sm" data-testid="save-setting-btn">
                  Save Setting
                </Button>
              </div>

              {/* Existing settings */}
              {settings.length > 0 && (
                <div className="mt-8 border-t border-[#2E2E2E] pt-6">
                  <h4 className="text-xs text-[#C5A059] mb-4 uppercase tracking-wide">Current Settings</h4>
                  <div className="space-y-2">
                    {settings.map(s => (
                      <div key={s.key} className="flex items-center justify-between border-b border-[#2E2E2E] pb-2 text-xs">
                        <span className="text-[#A3A3A3]">{s.key}</span>
                        <span className="text-[#666] truncate max-w-[200px]">
                          {s.key.includes('key') || s.key.includes('secret') ? '****' + (s.value || '').slice(-4) : s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sync Section */}
            <div className="border border-[#2E2E2E] bg-[#0F0F0F] p-6" data-testid="sync-section">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw size={20} strokeWidth={1} className="text-[#C5A059]" />
                <h3 className="font-heading text-lg text-[#F5F5F0]">Product Sync</h3>
              </div>
              <p className="text-xs text-[#A3A3A3] mb-4">
                Sync products from your Printful store. Make sure the API key is configured first.
              </p>
              <Button
                onClick={syncProducts}
                disabled={syncing}
                className="bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none text-sm"
                data-testid="sync-products-btn"
              >
                {syncing ? <><Loader2 size={14} className="animate-spin mr-2" /> Syncing...</> : <><RefreshCw size={14} className="mr-2" /> Sync Products</>}
              </Button>
              {syncResult && (
                <div className={`mt-4 text-xs p-3 border ${syncResult.error ? 'border-red-500/30 bg-red-500/5 text-red-400' : 'border-[#C5A059]/30 bg-[#C5A059]/5 text-[#C5A059]'}`} data-testid="sync-result">
                  {syncResult.error ? `Error: ${syncResult.error}` : `Synced ${syncResult.synced} products`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div data-testid="admin-products">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#C5A059]" size={24} /></div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 border border-[#2E2E2E] bg-[#0F0F0F]">
                <p className="text-sm text-[#A3A3A3]">No products synced yet. Go to Settings to sync from Printful.</p>
              </div>
            ) : (
              <div className="border border-[#2E2E2E]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#2E2E2E] bg-[#0A0A0A]">
                      <th className="text-left p-3 text-[#A3A3A3] font-body uppercase tracking-wide">Product</th>
                      <th className="text-left p-3 text-[#A3A3A3] font-body uppercase tracking-wide">Category</th>
                      <th className="text-left p-3 text-[#A3A3A3] font-body uppercase tracking-wide">Variants</th>
                      <th className="text-left p-3 text-[#A3A3A3] font-body uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.printful_id} className="border-b border-[#2E2E2E] hover:bg-[#0F0F0F]">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="w-8 h-8 object-cover" />}
                            <span className="text-[#F5F5F0]">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-[#A3A3A3]">{p.category}</td>
                        <td className="p-3 text-[#A3A3A3]">{p.variants?.length || 0}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-xs ${p.active ? 'text-green-400' : 'text-red-400'}`}>
                            {p.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div data-testid="admin-orders">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#C5A059]" size={24} /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 border border-[#2E2E2E] bg-[#0F0F0F]">
                <p className="text-sm text-[#A3A3A3]">No orders yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <OrderRow key={order.id} order={order} onStatusChange={updateOrderStatus} onTrackingChange={updateOrderTracking} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div data-testid="admin-users">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#C5A059]" size={24} /></div>
            ) : (
              <div className="border border-[#2E2E2E]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#2E2E2E] bg-[#0A0A0A]">
                      <th className="text-left p-3 text-[#A3A3A3] font-body uppercase tracking-wide">Name</th>
                      <th className="text-left p-3 text-[#A3A3A3] font-body uppercase tracking-wide">Email</th>
                      <th className="text-left p-3 text-[#A3A3A3] font-body uppercase tracking-wide">Role</th>
                      <th className="text-left p-3 text-[#A3A3A3] font-body uppercase tracking-wide">Body Scan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i} className="border-b border-[#2E2E2E] hover:bg-[#0F0F0F]">
                        <td className="p-3 text-[#F5F5F0]">{u.name || 'N/A'}</td>
                        <td className="p-3 text-[#A3A3A3]">{u.email}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 ${u.role === 'admin' ? 'text-[#C5A059]' : 'text-[#A3A3A3]'}`}>{u.role}</span></td>
                        <td className="p-3 text-[#A3A3A3]">{u.measurements ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderRow({ order, onStatusChange, onTrackingChange }) {
  const [expanded, setExpanded] = useState(false);
  const [editTrack, setEditTrack] = useState(false);
  const [tracking, setTracking] = useState(order.tracking_number || '');

  return (
    <div className="border border-[#2E2E2E] bg-[#0F0F0F]">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#141414]" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-4">
          <select
            value={order.status}
            onChange={e => { e.stopPropagation(); onStatusChange(order.id, e.target.value); }}
            onClick={e => e.stopPropagation()}
            className="bg-[#0A0A0A] border border-[#2E2E2E] text-xs text-[#F5F5F0] px-2 py-1"
            data-testid={`order-status-${order.id}`}
          >
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div>
            <p className="text-sm text-[#F5F5F0]">{order.product_name}</p>
            <p className="text-xs text-[#666]">User: {order.user_id} | {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-[#C5A059]">${order.total_price}</p>
          {expanded ? <ChevronUp size={14} className="text-[#666]" /> : <ChevronDown size={14} className="text-[#666]" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-[#2E2E2E] p-4 space-y-3 text-xs">
          <div className="grid grid-cols-4 gap-4">
            <div><p className="text-[#666]">Size</p><p className="text-[#A3A3A3]">{order.size || 'N/A'}</p></div>
            <div><p className="text-[#666]">Qty</p><p className="text-[#A3A3A3]">{order.quantity}</p></div>
            <div><p className="text-[#666]">Order ID</p><p className="text-[#A3A3A3] truncate">{order.id}</p></div>
            <div>
              <p className="text-[#666]">Tracking</p>
              {editTrack ? (
                <div className="flex gap-1 mt-1">
                  <input value={tracking} onChange={e => setTracking(e.target.value)} className="bg-transparent border-b border-[#2E2E2E] text-[#F5F5F0] text-xs py-0.5 w-32 outline-none" />
                  <button onClick={() => { onTrackingChange(order.id, tracking); setEditTrack(false); }}><Check size={12} className="text-[#C5A059]" /></button>
                  <button onClick={() => setEditTrack(false)}><X size={12} className="text-[#666]" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <p className="text-[#A3A3A3]">{order.tracking_number || 'None'}</p>
                  <button onClick={() => setEditTrack(true)}><Edit2 size={10} className="text-[#666]" /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
