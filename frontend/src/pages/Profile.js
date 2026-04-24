import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { User, MapPin, Ruler, ScanLine, Package } from 'lucide-react';
import { formatMeasurement, formatHeight, formatWeight, MEASUREMENT_LABELS } from '../utils/units';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isMetric, setIsMetric] = useState(false);
  const [address, setAddress] = useState({
    full_name: '', address_line1: '', address_line2: '', city: '', state: '', zip_code: '', country: 'US', phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (user?.address) setAddress(user.address); }, [user]);

  if (!user) { navigate('/login'); return null; }

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API}/api/profile/address`, address, { withCredentials: true });
      setSaved(true); await refreshUser();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to save address:', err);
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen pt-20 px-6 lg:px-12 pb-16" data-testid="profile-page">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <h1 className="font-heading text-4xl text-[#1A1A1A] font-light">My <span className="text-[#8B6914]">Profile</span></h1>
          <div className="flex items-center gap-2" data-testid="profile-unit-toggle">
            <span className={`text-xs font-body ${!isMetric ? 'text-[#8B6914]' : 'text-[#6B6B6B]'}`}>Imperial</span>
            <Switch checked={isMetric} onCheckedChange={setIsMetric} className="data-[state=checked]:bg-[#8B6914]" />
            <span className={`text-xs font-body ${isMetric ? 'text-[#8B6914]' : 'text-[#6B6B6B]'}`}>Metric</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="border border-[#E8E4DD] bg-white p-6" data-testid="user-info-card">
              <User size={32} strokeWidth={1} className="text-[#8B6914] mb-4" />
              <h3 className="font-heading text-lg text-[#1A1A1A]">{user.name}</h3>
              <p className="text-sm text-[#6B6B6B] mt-1">{user.email}</p>
              <p className="text-xs text-[#8B6914] mt-2 uppercase">{user.role}</p>
            </div>

            <div className="border border-[#E8E4DD] bg-white p-6" data-testid="measurements-card">
              <div className="flex items-center justify-between mb-4">
                <Ruler size={20} strokeWidth={1} className="text-[#8B6914]" />
                <Button variant="ghost" size="sm" onClick={() => navigate('/scan')} className="text-[#8B6914] text-xs rounded-none">
                  {user.measurements ? 'Rescan' : 'Start Scan'}
                </Button>
              </div>
              {user.measurements ? (
                <div className="space-y-2">
                  {Object.entries(user.measurements).map(([k, v]) => {
                    if (typeof v !== 'number') return null;
                    const label = MEASUREMENT_LABELS[k] || k.replace(/_/g, ' ');
                    const display = k === 'height_cm' ? formatHeight(v, isMetric) :
                                   k === 'weight_kg' ? formatWeight(v, isMetric) :
                                   formatMeasurement(v, isMetric);
                    return (
                      <div key={k} className="flex justify-between text-xs border-b border-[#E8E4DD] pb-1">
                        <span className="text-[#6B6B6B]">{label}</span>
                        <span className="text-[#1A1A1A]">{display}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-xs text-[#999]">No body scan data yet.</p>}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => navigate('/orders')} variant="outline" className="flex-1 border-[#E8E4DD] text-[#6B6B6B] hover:border-[#8B6914]/30 rounded-none text-xs" data-testid="view-orders-btn">
                <Package size={14} className="mr-1" /> Orders
              </Button>
              <Button onClick={() => navigate('/scan')} variant="outline" className="flex-1 border-[#E8E4DD] text-[#6B6B6B] hover:border-[#8B6914]/30 rounded-none text-xs" data-testid="rescan-btn">
                <ScanLine size={14} className="mr-1" /> Body Scan
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="border border-[#E8E4DD] bg-white p-6" data-testid="address-form">
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={20} strokeWidth={1} className="text-[#8B6914]" />
                <h3 className="font-heading text-lg text-[#1A1A1A]">Shipping Address</h3>
              </div>
              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6B6B6B] mb-1 uppercase tracking-wide font-body">Full Name</label>
                    <input type="text" value={address.full_name} onChange={e => setAddress(a => ({ ...a, full_name: e.target.value }))}
                      className="w-full bg-transparent border-b border-[#D4CFC7] focus:border-[#8B6914] outline-none py-2 text-sm text-[#1A1A1A] font-body" data-testid="address-fullname" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B6B6B] mb-1 uppercase tracking-wide font-body">Phone</label>
                    <input type="text" value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                      className="w-full bg-transparent border-b border-[#D4CFC7] focus:border-[#8B6914] outline-none py-2 text-sm text-[#1A1A1A] font-body" data-testid="address-phone" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-1 uppercase tracking-wide font-body">Address Line 1</label>
                  <input type="text" value={address.address_line1} onChange={e => setAddress(a => ({ ...a, address_line1: e.target.value }))}
                    className="w-full bg-transparent border-b border-[#D4CFC7] focus:border-[#8B6914] outline-none py-2 text-sm text-[#1A1A1A] font-body" data-testid="address-line1" />
                </div>
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-1 uppercase tracking-wide font-body">Address Line 2</label>
                  <input type="text" value={address.address_line2} onChange={e => setAddress(a => ({ ...a, address_line2: e.target.value }))}
                    className="w-full bg-transparent border-b border-[#D4CFC7] focus:border-[#8B6914] outline-none py-2 text-sm text-[#1A1A1A] font-body" data-testid="address-line2" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'city', label: 'City' }, { key: 'state', label: 'State' },
                    { key: 'zip_code', label: 'ZIP' }, { key: 'country', label: 'Country' }
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-[#6B6B6B] mb-1 uppercase tracking-wide font-body">{f.label}</label>
                      <input type="text" value={address[f.key]} onChange={e => setAddress(a => ({ ...a, [f.key]: e.target.value }))}
                        className="w-full bg-transparent border-b border-[#D4CFC7] focus:border-[#8B6914] outline-none py-2 text-sm text-[#1A1A1A] font-body" data-testid={`address-${f.key.replace('_', '-')}`} />
                    </div>
                  ))}
                </div>
                <Button type="submit" disabled={saving} className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none text-sm px-8 mt-4" data-testid="save-address-btn">
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Address'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
