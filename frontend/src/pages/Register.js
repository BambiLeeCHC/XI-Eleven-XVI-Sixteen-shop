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

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/scan');
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20" data-testid="register-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl text-[#F5F5F0] font-light">Create Account</h1>
          <p className="text-sm text-[#A3A3A3] mt-3 font-body">Join XI XVI for a personalized experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="register-form">
          {error && (
            <div className="border border-red-500/30 bg-red-500/10 text-red-400 text-sm px-4 py-3" data-testid="register-error">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-[#A3A3A3] mb-2 tracking-wide uppercase font-body">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-3 text-[#F5F5F0] font-body text-sm transition-colors"
              placeholder="Your full name"
              required
              data-testid="register-name-input"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A3A3A3] mb-2 tracking-wide uppercase font-body">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-3 text-[#F5F5F0] font-body text-sm transition-colors"
              placeholder="your@email.com"
              required
              data-testid="register-email-input"
            />
          </div>

          <div className="relative">
            <label className="block text-xs text-[#A3A3A3] mb-2 tracking-wide uppercase font-body">Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-[#2E2E2E] focus:border-[#C5A059] outline-none py-3 text-[#F5F5F0] font-body text-sm transition-colors pr-10"
              placeholder="Min 6 characters"
              required
              data-testid="register-password-input"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-0 bottom-3 text-[#A3A3A3] hover:text-[#F5F5F0]"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none py-3 text-sm font-medium tracking-wide mt-8"
            data-testid="register-submit-btn"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#A3A3A3] mt-8 font-body">
          Already have an account?{' '}
          <Link to="/login" className="text-[#C5A059] hover:underline" data-testid="login-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
