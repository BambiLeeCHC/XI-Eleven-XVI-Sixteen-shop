import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { User, MapPin, Ruler, ScanLine, Package } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    full_name: '', address_line1: '', address_line2: '',
    city: '', state: '', zip_code: '', country: 'US', phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.address) setAddress(user.address);
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API}/api/profile/address`, address, { withCredentials: true });
      setSaved(true);
      await refreshUser();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save address error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-6 lg:px-12 pb-16" data-testid="profile-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-4xl text-[#F5F5F0] font-light mb-12">
          My <span className="text-[#C5A059]">Profile</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border border-[#2E2E2E] bg-[#0F0F0F] p-6" data-testid="user-info-card">
              <User size={32} strokeWidth={1} className="text-[#C5A059] mb-4" />
              <h3 className="font-heading text-lg text-[#F5F5F0]">{user.name}</h3>
              <p className="text-sm text-[#A3A3A3] mt-1">{user.email}</p>
              <p className="text-xs text-[#C5A059] mt-2 uppercase">{user.role}</p>
            </div>

            {/* Measurements */}
            <div className="border border-[#2E2E2E] bg-[#0F0F0F] p-6" data-testid="measurements-card">
              <div className="flex items-center justify-between mb-4">
                <Ruler size={20} strokeWidth={1} className="text-[#C5A059]" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/scan')}
                  className="text-[#C5A059] text-xs rounded-none"
                >
                  {user.measurements ? 'Rescan' : 'Start Scan'}
                </Button>
              </div>
              {user.measurements ? (
                <div className="space-y-2">
                  {Object.entries(user.measurements).map(([k, v]) => {
                    if (typeof v !== 'number') return null;
                    return (
                      <div key={k} className="flex justify-between text-xs border-b border-[#2E2E2E] pb-1">
                        <span className="text-[#A3A3A3]">{k.replace(/_/g, ' ')}</span>
                        <span className="text-[#F5F5F0]">{v} cm</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#666]">No body scan data yet.</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => navigate('/orders')} variant="outline" className="flex-1 border-[#2E2E2E] text-[#A3A3A3] hover:border-[#C5A059]/30 rounded-none text-xs" data-testid="view-orders-btn">
                <Package size={14} className="mr-1" /> Orders
              </Button>
              <Button onClick={() => navigate('/scan')} variant="outline" className="flex-1 border-[#2E2E2E] text-[#A3A3A3] hover:border-[#C5A059]/30 rounded-none text-xs" data-testid="rescan-btn">
                <ScanLine size={14} className="mr-1" /> Body Scan
              </Button>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="lg:col-span-2">
            <div className="border border-[#2E2E2E] bg-[#0F0F0F] p-6" data-testid="address-form">
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={20} strokeWidth={1} className="text-[#C5A059]" />
                <h3 className="font-heading text-lg text-[#F5F5F0]">Shipping Address</h3>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#A3A3A3] mb-1 uppercase tracking-wide font-body">Full Name</label>
                    <input
                      type="text" value={address.full_name}
                      onChange={e => setAddress(a => ({ ...a, full_name: e.target.value }))}
                      className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-2 text-sm text-[#F5F5F0] font-body"
                      data-testid="address-fullname"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A3A3A3] mb-1 uppercase tracking-wide font-body">Phone</label>
                    <input
                      type="text" value={address.phone}
                      onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                      className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-2 text-sm text-[#F5F5F0] font-body"
                      data-testid="address-phone"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1 uppercase tracking-wide font-body">Address Line 1</label>
                  <input
                    type="text" value={address.address_line1}
                    onChange={e => setAddress(a => ({ ...a, address_line1: e.target.value }))}
                    className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-2 text-sm text-[#F5F5F0] font-body"
                    data-testid="address-line1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1 uppercase tracking-wide font-body">Address Line 2</label>
                  <input
                    type="text" value={address.address_line2}
                    onChange={e => setAddress(a => ({ ...a, address_line2: e.target.value }))}
                    className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-2 text-sm text-[#F5F5F0] font-body"
                    data-testid="address-line2"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-[#A3A3A3] mb-1 uppercase tracking-wide font-body">City</label>
                    <input
                      type="text" value={address.city}
                      onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                      className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-2 text-sm text-[#F5F5F0] font-body"
                      data-testid="address-city"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A3A3A3] mb-1 uppercase tracking-wide font-body">State</label>
                    <input
                      type="text" value={address.state}
                      onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                      className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-2 text-sm text-[#F5F5F0] font-body"
                      data-testid="address-state"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A3A3A3] mb-1 uppercase tracking-wide font-body">ZIP</label>
                    <input
                      type="text" value={address.zip_code}
                      onChange={e => setAddress(a => ({ ...a, zip_code: e.target.value }))}
                      className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-2 text-sm text-[#F5F5F0] font-body"
                      data-testid="address-zip"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A3A3A3] mb-1 uppercase tracking-wide font-body">Country</label>
                    <input
                      type="text" value={address.country}
                      onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
                      className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-2 text-sm text-[#F5F5F0] font-body"
                      data-testid="address-country"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none text-sm px-8 mt-4"
                  data-testid="save-address-btn"
                >
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
