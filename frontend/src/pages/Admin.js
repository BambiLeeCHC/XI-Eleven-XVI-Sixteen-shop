import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import {
  Settings, RefreshCw, Package, Users, ShoppingBag, Loader2,
  Key, ChevronDown, ChevronUp, Edit2, Check, X, BarChart3, Sparkles, Save, Image, Trash2
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

  const [newKey, setNewKey] = useState('printful_api_key');
  const [newValue, setNewValue] = useState('');

  // Product editing
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({});

  // AI Ad generator
  const [adProduct, setAdProduct] = useState(null);
  const [adStyle, setAdStyle] = useState('');
  const [adGenerating, setAdGenerating] = useState(false);
  const [adResult, setAdResult] = useState(null);

  const fetchStats = useCallback(async () => { try { const { data } = await axios.get(`${API}/api/admin/stats`, { withCredentials: true }); setStats(data); } catch (err) { if (process.env.NODE_ENV === 'development') console.error('Failed to fetch stats:', err); } }, []);
  const fetchSettings = useCallback(async () => { try { const { data } = await axios.get(`${API}/api/admin/settings`, { withCredentials: true }); setSettings(data.settings || []); } catch (err) { if (process.env.NODE_ENV === 'development') console.error('Failed to fetch settings:', err); } }, []);
  const fetchProducts = useCallback(async () => { setLoading(true); try { const { data } = await axios.get(`${API}/api/admin/products`, { withCredentials: true }); setProducts(data.products || []); } catch (err) { if (process.env.NODE_ENV === 'development') console.error('Failed to fetch products:', err); } finally { setLoading(false); } }, []);
  const fetchOrders = useCallback(async () => { setLoading(true); try { const { data } = await axios.get(`${API}/api/admin/orders`, { withCredentials: true }); setOrders(data.orders || []); } catch (err) { if (process.env.NODE_ENV === 'development') console.error('Failed to fetch orders:', err); } finally { setLoading(false); } }, []);
  const fetchUsers = useCallback(async () => { setLoading(true); try { const { data } = await axios.get(`${API}/api/admin/users`, { withCredentials: true }); setUsers(data.users || []); } catch (err) { if (process.env.NODE_ENV === 'development') console.error('Failed to fetch users:', err); } finally { setLoading(false); } }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchStats(); fetchSettings();
  }, [user, navigate, fetchStats, fetchSettings]);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchProducts, fetchOrders, fetchUsers]);

  const saveSetting = async () => {
    if (!newValue.trim()) return;
    try { await axios.put(`${API}/api/admin/settings`, { key: newKey, value: newValue }, { withCredentials: true }); setNewValue(''); await fetchSettings(); } catch (err) { if (process.env.NODE_ENV === 'development') console.error('Failed to save setting:', err); }
  };

  const syncProducts = async () => {
    setSyncing(true); setSyncResult(null);
    try { const { data } = await axios.post(`${API}/api/admin/sync-products`, {}, { withCredentials: true, timeout: 300000 }); setSyncResult(data); if (!data.error) fetchProducts(); }
    catch (err) { setSyncResult({ error: err.message }); } finally { setSyncing(false); }
  };

  const openEditProduct = (p) => {
    setEditProduct(p);
    setEditForm({ name: p.name || '', category: p.category || 'other', active: p.active !== false, description: p.description || '', sale_price: p.sale_price || '', featured: p.featured || false });
  };

  const saveProduct = async () => {
    if (!editProduct) return;
    try {
      await axios.put(`${API}/api/admin/products/${editProduct.printful_id}`, editForm, { withCredentials: true });
      setEditProduct(null); fetchProducts();
    } catch (err) { console.error(err); }
  };

  const openAdGenerator = (p) => { setAdProduct(p); setAdStyle(''); setAdResult(null); };

  const generateAd = async () => {
    if (!adProduct) return;
    setAdGenerating(true); setAdResult(null);
    try {
      const { data } = await axios.post(`${API}/api/admin/generate-ad`, {
        product_name: adProduct.name,
        product_description: `${adProduct.category} garment from XI XVI Eleven Sixteen luxury collection`,
        style_notes: adStyle,
        printful_id: adProduct.printful_id
      }, { withCredentials: true, timeout: 120000 });
      setAdResult(data);
      fetchProducts(); // Refresh to see new ad image
    } catch (err) { console.error(err); setAdResult({ error: 'Generation failed. Please try again.' }); }
    finally { setAdGenerating(false); }
  };

  const deleteProduct = async (printfulId) => {
    if (!window.confirm('Delete this product from the storefront? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/api/admin/products/${printfulId}`, { withCredentials: true });
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const updateOrderStatus = async (orderId, status) => {
    try { await axios.put(`${API}/api/admin/orders/${orderId}`, { status }, { withCredentials: true }); fetchOrders(); } catch (err) { if (process.env.NODE_ENV === 'development') console.error('Failed to update order status:', err); }
  };

  const updateOrderTracking = async (orderId, tracking) => {
    try { await axios.put(`${API}/api/admin/orders/${orderId}`, { tracking_number: tracking }, { withCredentials: true }); fetchOrders(); } catch (err) { if (process.env.NODE_ENV === 'development') console.error('Failed to update tracking:', err); }
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
        <h1 className="font-heading text-4xl text-[#1A1A1A] font-light mb-8">Admin <span className="text-[#8B6914]">Panel</span></h1>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#E8E4DD] pb-4" data-testid="admin-tabs">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs tracking-wide uppercase font-body border transition-all ${
                activeTab === tab.id ? 'border-[#8B6914] text-[#8B6914] bg-[#8B6914]/5' : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'}`}
              data-testid={`admin-tab-${tab.id}`}><tab.icon size={14} strokeWidth={1.5} />{tab.label}</button>
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
              <div key={stat.label} className="border border-[#E8E4DD] bg-white p-6" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                <stat.icon size={20} strokeWidth={1} className="text-[#8B6914] mb-3" />
                <p className="text-2xl text-[#1A1A1A] font-heading">{stat.value}</p>
                <p className="text-xs text-[#6B6B6B] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6" data-testid="admin-settings">
            <div className="border border-[#E8E4DD] bg-white p-6">
              <div className="flex items-center gap-2 mb-6"><Key size={20} strokeWidth={1} className="text-[#8B6914]" /><h3 className="font-heading text-lg text-[#1A1A1A]">API Configuration</h3></div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-2 uppercase tracking-wide font-body">Setting Key</label>
                  <select value={newKey} onChange={e => setNewKey(e.target.value)}
                    className="w-full bg-white border border-[#E8E4DD] text-[#1A1A1A] text-sm px-3 py-2 focus:border-[#8B6914] outline-none" data-testid="setting-key-select">
                    <option value="printful_api_key">Printful API Key</option>
                    <option value="store_name">Store Name</option>
                    <option value="support_email">Support Email</option>
                    <option value="shipping_note">Shipping Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-2 uppercase tracking-wide font-body">Value</label>
                  <input type={newKey.includes('key') ? 'password' : 'text'} value={newValue} onChange={e => setNewValue(e.target.value)}
                    className="w-full bg-transparent border-b border-[#D4CFC7] focus:border-[#8B6914] outline-none py-2 text-sm text-[#1A1A1A] font-body"
                    placeholder="Enter value..." data-testid="setting-value-input" />
                </div>
                <Button onClick={saveSetting} className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none text-sm" data-testid="save-setting-btn">Save Setting</Button>
              </div>
              {settings.length > 0 && (
                <div className="mt-8 border-t border-[#E8E4DD] pt-6">
                  <h4 className="text-xs text-[#8B6914] mb-4 uppercase tracking-wide">Current Settings</h4>
                  <div className="space-y-2">
                    {settings.map(s => (
                      <div key={s.key} className="flex items-center justify-between border-b border-[#E8E4DD] pb-2 text-xs">
                        <span className="text-[#6B6B6B]">{s.key}</span>
                        <span className="text-[#999] truncate max-w-[200px]">{s.key.includes('key') ? '****' + (s.value || '').slice(-4) : s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="border border-[#E8E4DD] bg-white p-6" data-testid="sync-section">
              <div className="flex items-center gap-2 mb-4"><RefreshCw size={20} strokeWidth={1} className="text-[#8B6914]" /><h3 className="font-heading text-lg text-[#1A1A1A]">Product Sync</h3></div>
              <p className="text-xs text-[#6B6B6B] mb-4">Sync products from your Printful store. Make sure the API key is configured first.</p>
              <Button onClick={syncProducts} disabled={syncing} className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none text-sm" data-testid="sync-products-btn">
                {syncing ? <><Loader2 size={14} className="animate-spin mr-2" /> Syncing...</> : <><RefreshCw size={14} className="mr-2" /> Sync Products</>}
              </Button>
              {syncResult && (
                <div className={`mt-4 text-xs p-3 border ${syncResult.error ? 'border-red-300 bg-red-50 text-red-600' : 'border-[#8B6914]/30 bg-[#8B6914]/5 text-[#8B6914]'}`} data-testid="sync-result">
                  {syncResult.error ? `Error: ${syncResult.error}` : `Synced ${syncResult.synced} products`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products with Edit + AI Ad Gen */}
        {activeTab === 'products' && (
          <div data-testid="admin-products">
            {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#8B6914]" size={24} /></div> :
            products.length === 0 ? (
              <div className="text-center py-12 border border-[#E8E4DD] bg-white"><p className="text-sm text-[#6B6B6B]">No products synced yet. Go to Settings to sync from Printful.</p></div>
            ) : (
              <div className="border border-[#E8E4DD] bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#E8E4DD] bg-[#FAF8F5]">
                      <th className="text-left p-3 text-[#6B6B6B] font-body uppercase tracking-wide">Product</th>
                      <th className="text-left p-3 text-[#6B6B6B] font-body uppercase tracking-wide">Category</th>
                      <th className="text-left p-3 text-[#6B6B6B] font-body uppercase tracking-wide">Variants</th>
                      <th className="text-left p-3 text-[#6B6B6B] font-body uppercase tracking-wide">Status</th>
                      <th className="text-left p-3 text-[#6B6B6B] font-body uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.printful_id} className="border-b border-[#E8E4DD] hover:bg-[#FAF8F5]">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="w-8 h-8 object-cover border border-[#E8E4DD]" />}
                            <span className="text-[#1A1A1A]">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-[#6B6B6B]">{p.category}</td>
                        <td className="p-3 text-[#6B6B6B]">{p.variants?.length || 0}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 text-xs ${p.active ? 'text-green-600' : 'text-red-500'}`}>{p.active ? 'Active' : 'Inactive'}</span></td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditProduct(p)} className="text-[#8B6914] hover:underline flex items-center gap-1" data-testid={`edit-product-${p.printful_id}`}>
                              <Edit2 size={12} /> Edit
                            </button>
                            <button onClick={() => openAdGenerator(p)} className="text-[#8B6914] hover:underline flex items-center gap-1" data-testid={`gen-ad-${p.printful_id}`}>
                              <Sparkles size={12} /> AI Ad
                            </button>
                            <button onClick={() => deleteProduct(p.printful_id)} className="text-red-500 hover:underline flex items-center gap-1" data-testid={`delete-product-${p.printful_id}`}>
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Edit Product Dialog */}
            <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
              <DialogContent className="bg-white border-[#E8E4DD] max-w-lg">
                <DialogHeader><DialogTitle className="font-heading text-[#1A1A1A]">Edit Product</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#6B6B6B] mb-1 uppercase font-body">Name</label>
                    <input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-[#E8E4DD] px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#8B6914] outline-none" data-testid="edit-product-name" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B6B6B] mb-1 uppercase font-body">Category</label>
                    <select value={editForm.category || 'other'} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full border border-[#E8E4DD] px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#8B6914] outline-none" data-testid="edit-product-category">
                      {['tops', 'bottoms', 'outerwear', 'accessories', 'dresses', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B6B6B] mb-1 uppercase font-body">Description</label>
                    <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full border border-[#E8E4DD] px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#8B6914] outline-none h-20 resize-none" data-testid="edit-product-description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#6B6B6B] mb-1 uppercase font-body">Sale Price ($)</label>
                      <input type="number" value={editForm.sale_price || ''} onChange={e => setEditForm(f => ({ ...f, sale_price: e.target.value }))}
                        className="w-full border border-[#E8E4DD] px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#8B6914] outline-none" placeholder="Leave empty for no sale" data-testid="edit-product-sale-price" />
                    </div>
                    <div className="flex items-end gap-3">
                      <label className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                        <input type="checkbox" checked={editForm.active} onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))} className="accent-[#8B6914]" data-testid="edit-product-active" />
                        Active
                      </label>
                      <label className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                        <input type="checkbox" checked={editForm.featured || false} onChange={e => setEditForm(f => ({ ...f, featured: e.target.checked }))} className="accent-[#8B6914]" data-testid="edit-product-featured" />
                        Featured
                      </label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setEditProduct(null)} className="text-[#6B6B6B] rounded-none">Cancel</Button>
                  <Button onClick={saveProduct} className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none" data-testid="save-product-btn">
                    <Save size={14} className="mr-1" /> Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* AI Ad Generator Dialog */}
            <Dialog open={!!adProduct} onOpenChange={(open) => !open && setAdProduct(null)}>
              <DialogContent className="bg-white border-[#E8E4DD] max-w-2xl">
                <DialogHeader><DialogTitle className="font-heading text-[#1A1A1A] flex items-center gap-2"><Sparkles size={18} className="text-[#8B6914]" /> AI Ad Generator</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-[#6B6B6B]">
                    Generate high-end advertising imagery for <strong className="text-[#1A1A1A]">{adProduct?.name}</strong>.
                    Our AI creates professional fashion campaign photos with models wearing your product.
                  </p>
                  <div>
                    <label className="block text-xs text-[#6B6B6B] mb-1 uppercase font-body">Style Notes (optional)</label>
                    <textarea value={adStyle} onChange={e => setAdStyle(e.target.value)} placeholder="e.g., 'Urban setting, male model, evening wear vibes'"
                      className="w-full border border-[#E8E4DD] px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#8B6914] outline-none h-16 resize-none" data-testid="ad-style-input" />
                  </div>
                  <Button onClick={generateAd} disabled={adGenerating} className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none w-full" data-testid="generate-ad-btn">
                    {adGenerating ? <><Loader2 size={14} className="animate-spin mr-2" /> Generating Ad Image...</> : <><Sparkles size={14} className="mr-2" /> Generate Campaign Image</>}
                  </Button>
                  {adResult && !adResult.error && (
                    <div className="border border-[#E8E4DD]" data-testid="ad-result">
                      <img src={`data:image/png;base64,${adResult.image_base64}`} alt="Generated Ad" className="w-full" />
                      <div className="p-3 text-center">
                        <p className="text-xs text-[#8B6914]">AI-generated campaign image saved to product</p>
                      </div>
                    </div>
                  )}
                  {adResult?.error && <div className="text-xs text-red-600 border border-red-300 bg-red-50 p-3">{adResult.error}</div>}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div data-testid="admin-orders">
            {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#8B6914]" size={24} /></div> :
            orders.length === 0 ? <div className="text-center py-12 border border-[#E8E4DD] bg-white"><p className="text-sm text-[#6B6B6B]">No orders yet.</p></div> :
            <div className="space-y-3">
              {orders.map(order => <OrderRow key={order.id} order={order} onStatusChange={updateOrderStatus} onTrackingChange={updateOrderTracking} />)}
            </div>}
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div data-testid="admin-users">
            {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#8B6914]" size={24} /></div> :
            <div className="border border-[#E8E4DD] bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E8E4DD] bg-[#FAF8F5]">
                    <th className="text-left p-3 text-[#6B6B6B] font-body uppercase tracking-wide">Name</th>
                    <th className="text-left p-3 text-[#6B6B6B] font-body uppercase tracking-wide">Email</th>
                    <th className="text-left p-3 text-[#6B6B6B] font-body uppercase tracking-wide">Role</th>
                    <th className="text-left p-3 text-[#6B6B6B] font-body uppercase tracking-wide">Body Scan</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.email} className="border-b border-[#E8E4DD] hover:bg-[#FAF8F5]">
                      <td className="p-3 text-[#1A1A1A]">{u.name || 'N/A'}</td>
                      <td className="p-3 text-[#6B6B6B]">{u.email}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 ${u.role === 'admin' ? 'text-[#8B6914]' : 'text-[#6B6B6B]'}`}>{u.role}</span></td>
                      <td className="p-3 text-[#6B6B6B]">{u.measurements ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
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
    <div className="border border-[#E8E4DD] bg-white">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FAF8F5]" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-4">
          <select value={order.status} onChange={e => { e.stopPropagation(); onStatusChange(order.id, e.target.value); }} onClick={e => e.stopPropagation()}
            className="bg-white border border-[#E8E4DD] text-xs text-[#1A1A1A] px-2 py-1" data-testid={`order-status-${order.id}`}>
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div>
            <p className="text-sm text-[#1A1A1A]">{order.product_name}</p>
            <p className="text-xs text-[#999]">User: {order.user_id} | {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-[#8B6914]">${order.total_price}</p>
          {expanded ? <ChevronUp size={14} className="text-[#999]" /> : <ChevronDown size={14} className="text-[#999]" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-[#E8E4DD] p-4 space-y-3 text-xs">
          <div className="grid grid-cols-4 gap-4">
            <div><p className="text-[#999]">Size</p><p className="text-[#6B6B6B]">{order.size || 'N/A'}</p></div>
            <div><p className="text-[#999]">Qty</p><p className="text-[#6B6B6B]">{order.quantity}</p></div>
            <div><p className="text-[#999]">Order ID</p><p className="text-[#6B6B6B] truncate">{order.id}</p></div>
            <div>
              <p className="text-[#999]">Tracking</p>
              {editTrack ? (
                <div className="flex gap-1 mt-1">
                  <input value={tracking} onChange={e => setTracking(e.target.value)} className="bg-transparent border-b border-[#D4CFC7] text-[#1A1A1A] text-xs py-0.5 w-32 outline-none" />
                  <button onClick={() => { onTrackingChange(order.id, tracking); setEditTrack(false); }}><Check size={12} className="text-[#8B6914]" /></button>
                  <button onClick={() => setEditTrack(false)}><X size={12} className="text-[#999]" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <p className="text-[#6B6B6B]">{order.tracking_number || 'None'}</p>
                  <button onClick={() => setEditTrack(true)}><Edit2 size={10} className="text-[#999]" /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
