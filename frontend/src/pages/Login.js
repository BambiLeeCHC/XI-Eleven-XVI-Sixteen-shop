import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

function formatApiError(detail) {
  if (detail == null) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(" ");
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(data.role === 'admin' ? '/admin' : '/shop');
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20" data-testid="login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl text-[#1A1A1A] font-light">Welcome Back</h1>
          <p className="text-sm text-[#6B6B6B] mt-3 font-body">Sign in to your XI XVI account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
          {error && (
            <div className="border border-red-300 bg-red-50 text-red-600 text-sm px-4 py-3" data-testid="login-error">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-[#6B6B6B] mb-2 tracking-wide uppercase font-body">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-[#D4CFC7] focus:border-[#8B6914] outline-none py-3 text-[#1A1A1A] font-body text-sm transition-colors"
              placeholder="your@email.com" required data-testid="login-email-input"
            />
          </div>

          <div className="relative">
            <label className="block text-xs text-[#6B6B6B] mb-2 tracking-wide uppercase font-body">Password</label>
            <input
              type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-[#D4CFC7] focus:border-[#8B6914] outline-none py-3 text-[#1A1A1A] font-body text-sm transition-colors pr-10"
              placeholder="Enter password" required data-testid="login-password-input"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-0 bottom-3 text-[#6B6B6B] hover:text-[#1A1A1A]">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" disabled={loading}
            className="w-full bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none py-3 text-sm font-medium tracking-wide mt-8"
            data-testid="login-submit-btn"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#6B6B6B] mt-8 font-body">
          New to XI XVI?{' '}
          <Link to="/register" className="text-[#8B6914] hover:underline" data-testid="register-link">Create account</Link>
        </p>
      </div>
    </div>
  );
}
