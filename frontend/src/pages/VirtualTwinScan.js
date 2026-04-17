import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Upload, ScanLine, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;
const SCAN_BG = "https://images.unsplash.com/photo-1612426196779-58fe13244566?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwzfHxtb2RlbCUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NjM4ODE0OXww&ixlib=rb-4.1.0&q=85";

export default function VirtualTwinScan() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError('');
    }
  };

  const handleScan = async () => {
    if (!file || !heightCm || !weightKg) {
      setError('Please provide a photo, height, and weight.');
      return;
    }
    setScanning(true);
    setError('');
    setScanPhase('Uploading photo...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('height_cm', heightCm);
      formData.append('weight_kg', weightKg);

      setScanPhase('AI analyzing your body dimensions...');

      const { data } = await axios.post(`${API}/api/scan/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });

      setScanPhase('Complete!');
      setResult(data);
      await refreshUser();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-[#F5F5F0] mb-4">Sign In Required</h1>
          <p className="text-[#A3A3A3] mb-6">Please sign in to use the body scanner.</p>
          <Button onClick={() => navigate('/login')} className="bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none" data-testid="scan-login-btn">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-6 lg:px-12 pb-16" data-testid="scan-page">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="font-heading text-4xl sm:text-5xl text-[#F5F5F0] font-light">
            Body <span className="text-[#C5A059]">Scanner</span>
          </h1>
          <p className="text-sm text-[#A3A3A3] mt-3 font-body max-w-lg">
            Upload a full-length photo and our dual AI system will map your exact body dimensions to create your virtual twin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div
              className="relative border border-[#2E2E2E] hover:border-[#C5A059]/30 transition-colors h-[450px] flex items-center justify-center cursor-pointer overflow-hidden group"
              onClick={() => fileRef.current?.click()}
              data-testid="photo-upload-area"
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="h-full w-full object-contain bg-[#0A0A0A]" />
                  {scanning && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <div className="relative w-full h-full">
                        <div className="scan-line absolute left-0 right-0 h-1" />
                      </div>
                      <div className="absolute flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-[#C5A059]" size={32} />
                        <p className="text-sm text-[#C5A059] font-body">{scanPhase}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-8">
                  <div className="relative mx-auto w-48 h-48 mb-6">
                    <img src={SCAN_BG} alt="Scan" className="w-full h-full object-cover opacity-30 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Upload size={40} strokeWidth={1} className="text-[#C5A059]" />
                    </div>
                  </div>
                  <p className="text-[#A3A3A3] text-sm font-body">Click to upload a full-length photo</p>
                  <p className="text-[#666] text-xs mt-2">JPG, PNG or WEBP</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                data-testid="photo-file-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#A3A3A3] mb-2 tracking-wide uppercase font-body">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={e => setHeightCm(e.target.value)}
                  className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-3 text-[#F5F5F0] font-body text-sm"
                  placeholder="175"
                  data-testid="height-input"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A3A3A3] mb-2 tracking-wide uppercase font-body">Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value)}
                  className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-3 text-[#F5F5F0] font-body text-sm"
                  placeholder="75"
                  data-testid="weight-input"
                />
              </div>
            </div>

            {error && (
              <div className="border border-red-500/30 bg-red-500/10 text-red-400 text-sm px-4 py-3" data-testid="scan-error">
                {error}
              </div>
            )}

            <Button
              onClick={handleScan}
              disabled={scanning || !file}
              className="w-full bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none py-3 text-sm font-medium tracking-wide disabled:opacity-40"
              data-testid="start-scan-btn"
            >
              {scanning ? (
                <><Loader2 className="animate-spin mr-2" size={16} /> Scanning...</>
              ) : (
                <><ScanLine size={16} className="mr-2" /> Start AI Body Scan</>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <div className="opacity-0 animate-fade-in-up" data-testid="scan-results">
                <div className="border border-[#C5A059]/30 bg-[#0F0F0F] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Check size={20} className="text-[#C5A059]" />
                    <h3 className="font-heading text-xl text-[#F5F5F0]">Scan Complete</h3>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs text-[#C5A059] tracking-wide uppercase font-body">Your Measurements</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(result.measurements || {}).map(([key, val]) => {
                        if (typeof val !== 'number') return null;
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        return (
                          <div key={key} className="border-b border-[#2E2E2E] pb-2">
                            <p className="text-xs text-[#A3A3A3]">{label}</p>
                            <p className="text-sm text-[#F5F5F0] font-medium">{val} cm</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {result.virtual_twin && (
                    <div className="mt-6 pt-6 border-t border-[#2E2E2E]">
                      <h4 className="text-xs text-[#C5A059] tracking-wide uppercase font-body mb-3">Virtual Twin Profile</h4>
                      <p className="text-sm text-[#A3A3A3] leading-relaxed">
                        {result.virtual_twin.body_profile || 'Profile generated.'}
                      </p>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <p className="text-xs text-[#666]">Build</p>
                          <p className="text-sm text-[#F5F5F0]">{result.virtual_twin.build || result.measurements?.body_type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#666]">Fit Preference</p>
                          <p className="text-sm text-[#F5F5F0]">{result.virtual_twin.fit_preferences || 'Regular'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => navigate('/shop')}
                    className="w-full bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none mt-6 text-sm"
                    data-testid="go-shopping-btn"
                  >
                    Start Shopping
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-[#2E2E2E] bg-[#0F0F0F] p-8 h-full flex flex-col items-center justify-center text-center" data-testid="scan-placeholder">
                <ScanLine size={48} strokeWidth={1} className="text-[#C5A059]/40 mb-4" />
                <h3 className="font-heading text-lg text-[#F5F5F0] mb-2">Ready to Scan</h3>
                <p className="text-sm text-[#A3A3A3] max-w-sm">
                  Upload a full-length photo, enter your height and weight, then hit scan. Our AI will analyze your body dimensions in seconds.
                </p>
                {user.measurements && (
                  <div className="mt-6 pt-6 border-t border-[#2E2E2E] w-full text-left">
                    <p className="text-xs text-[#C5A059] mb-3 tracking-wide uppercase">Previous Scan Results</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(user.measurements).map(([k, v]) => {
                        if (typeof v !== 'number') return null;
                        return (
                          <div key={k} className="text-xs">
                            <span className="text-[#666]">{k.replace(/_/g, ' ')}: </span>
                            <span className="text-[#A3A3A3]">{v}cm</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
