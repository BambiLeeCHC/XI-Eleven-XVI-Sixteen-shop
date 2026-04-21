import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Upload, ScanLine, Check, Loader2 } from 'lucide-react';
import { formatMeasurement, formatHeight, formatWeight, MEASUREMENT_LABELS, lbsToKg, inchesToCm } from '../utils/units';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;
const SCAN_BG = "https://images.unsplash.com/photo-1612426196779-58fe13244566?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwzfHxtb2RlbCUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NjM4ODE0OXww&ixlib=rb-4.1.0&q=85";

export default function VirtualTwinScan() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [heightVal, setHeightVal] = useState('');
  const [weightVal, setWeightVal] = useState('');
  const [isMetric, setIsMetric] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setError(''); }
  };

  const handleScan = async () => {
    if (!file || !heightVal || !weightVal) { setError('Please provide a photo, height, and weight.'); return; }
    setScanning(true); setError(''); setScanPhase('Uploading photo...');

    // Convert to metric for API
    const heightCm = isMetric ? parseFloat(heightVal) : inchesToCm(parseFloat(heightVal));
    const weightKg = isMetric ? parseFloat(weightVal) : lbsToKg(parseFloat(weightVal));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('height_cm', heightCm);
      formData.append('weight_kg', weightKg);
      setScanPhase('AI analyzing your body dimensions...');
      const { data } = await axios.post(`${API}/api/scan/upload`, formData, {
        withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000
      });
      setScanPhase('Complete!');
      setResult(data);
      await refreshUser();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Scan failed. Please try again.');
    } finally { setScanning(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-[#1A1A1A] mb-4">Sign In Required</h1>
          <p className="text-[#6B6B6B] mb-6">Please sign in to use the body scanner.</p>
          <Button onClick={() => navigate('/login')} className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none" data-testid="scan-login-btn">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-6 lg:px-12 pb-16" data-testid="scan-page">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl text-[#1A1A1A] font-light">
              Body <span className="text-[#8B6914]">Scanner</span>
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-3 font-body max-w-lg">
              Upload a full-length photo and our dual AI system will map your exact body dimensions.
            </p>
          </div>
          <div className="flex items-center gap-2" data-testid="unit-toggle">
            <span className={`text-xs font-body ${!isMetric ? 'text-[#8B6914] font-medium' : 'text-[#6B6B6B]'}`}>Imperial</span>
            <Switch checked={isMetric} onCheckedChange={setIsMetric} className="data-[state=checked]:bg-[#8B6914]" />
            <span className={`text-xs font-body ${isMetric ? 'text-[#8B6914] font-medium' : 'text-[#6B6B6B]'}`}>Metric</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="relative border border-[#E8E4DD] hover:border-[#8B6914]/30 transition-colors h-[450px] flex items-center justify-center cursor-pointer overflow-hidden group bg-white"
              onClick={() => fileRef.current?.click()} data-testid="photo-upload-area">
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="h-full w-full object-contain" />
                  {scanning && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                      <div className="relative w-full h-full"><div className="scan-line absolute left-0 right-0 h-1" /></div>
                      <div className="absolute flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-[#8B6914]" size={32} />
                        <p className="text-sm text-[#8B6914] font-body">{scanPhase}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-8">
                  <div className="relative mx-auto w-48 h-48 mb-6">
                    <img src={SCAN_BG} alt="Scan" className="w-full h-full object-cover opacity-20 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Upload size={40} strokeWidth={1} className="text-[#8B6914]" />
                    </div>
                  </div>
                  <p className="text-[#6B6B6B] text-sm font-body">Click to upload a full-length photo</p>
                  <p className="text-[#999] text-xs mt-2">JPG, PNG or WEBP</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" data-testid="photo-file-input" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2 tracking-wide uppercase font-body">
                  Height ({isMetric ? 'cm' : 'inches'})
                </label>
                <input type="number" value={heightVal} onChange={e => setHeightVal(e.target.value)}
                  className="w-full bg-transparent border-b border-[#D4CFC7] focus:border-[#8B6914] outline-none py-3 text-[#1A1A1A] font-body text-sm"
                  placeholder={isMetric ? '175' : '69'} data-testid="height-input" />
              </div>
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2 tracking-wide uppercase font-body">
                  Weight ({isMetric ? 'kg' : 'lbs'})
                </label>
                <input type="number" value={weightVal} onChange={e => setWeightVal(e.target.value)}
                  className="w-full bg-transparent border-b border-[#D4CFC7] focus:border-[#8B6914] outline-none py-3 text-[#1A1A1A] font-body text-sm"
                  placeholder={isMetric ? '75' : '165'} data-testid="weight-input" />
              </div>
            </div>

            {error && <div className="border border-red-300 bg-red-50 text-red-600 text-sm px-4 py-3" data-testid="scan-error">{error}</div>}

            <Button onClick={handleScan} disabled={scanning || !file}
              className="w-full bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none py-3 text-sm font-medium tracking-wide disabled:opacity-40"
              data-testid="start-scan-btn">
              {scanning ? <><Loader2 className="animate-spin mr-2" size={16} /> Scanning...</> : <><ScanLine size={16} className="mr-2" /> Start AI Body Scan</>}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <div className="opacity-0 animate-fade-in-up" data-testid="scan-results">
                <div className="border border-[#8B6914]/30 bg-white p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Check size={20} className="text-[#8B6914]" />
                    <h3 className="font-heading text-xl text-[#1A1A1A]">Scan Complete</h3>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs text-[#8B6914] tracking-wide uppercase font-body">Your Measurements</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(result.measurements || {}).map(([key, val]) => {
                        if (typeof val !== 'number') return null;
                        const label = MEASUREMENT_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        const display = key === 'height_cm' ? formatHeight(val, isMetric) :
                                       key === 'weight_kg' ? formatWeight(val, isMetric) :
                                       formatMeasurement(val, isMetric);
                        return (
                          <div key={key} className="border-b border-[#E8E4DD] pb-2">
                            <p className="text-xs text-[#6B6B6B]">{label}</p>
                            <p className="text-sm text-[#1A1A1A] font-medium">{display}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {result.virtual_twin && (
                    <div className="mt-6 pt-6 border-t border-[#E8E4DD]">
                      <h4 className="text-xs text-[#8B6914] tracking-wide uppercase font-body mb-3">Virtual Twin Profile</h4>
                      <p className="text-sm text-[#6B6B6B] leading-relaxed">{result.virtual_twin.body_profile || 'Profile generated.'}</p>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div><p className="text-xs text-[#999]">Build</p><p className="text-sm text-[#1A1A1A]">{result.virtual_twin.build || result.measurements?.body_type}</p></div>
                        <div><p className="text-xs text-[#999]">Fit Preference</p><p className="text-sm text-[#1A1A1A]">{result.virtual_twin.fit_preferences || 'Regular'}</p></div>
                      </div>
                    </div>
                  )}
                  <Button onClick={() => navigate('/shop')}
                    className="w-full bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none mt-6 text-sm"
                    data-testid="go-shopping-btn">Start Shopping</Button>
                </div>
              </div>
            ) : (
              <div className="border border-[#E8E4DD] bg-white p-8 h-full flex flex-col items-center justify-center text-center" data-testid="scan-placeholder">
                <ScanLine size={48} strokeWidth={1} className="text-[#8B6914]/40 mb-4" />
                <h3 className="font-heading text-lg text-[#1A1A1A] mb-2">Ready to Scan</h3>
                <p className="text-sm text-[#6B6B6B] max-w-sm">
                  Upload a full-length photo, enter your height and weight, then hit scan.
                </p>
                {user.measurements && (
                  <div className="mt-6 pt-6 border-t border-[#E8E4DD] w-full text-left">
                    <p className="text-xs text-[#8B6914] mb-3 tracking-wide uppercase">Previous Scan Results</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(user.measurements).map(([k, v]) => {
                        if (typeof v !== 'number') return null;
                        const display = k === 'height_cm' ? formatHeight(v, isMetric) :
                                       k === 'weight_kg' ? formatWeight(v, isMetric) :
                                       formatMeasurement(v, isMetric);
                        return (
                          <div key={k} className="text-xs">
                            <span className="text-[#999]">{(MEASUREMENT_LABELS[k] || k.replace(/_/g, ' '))}: </span>
                            <span className="text-[#6B6B6B]">{display}</span>
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
