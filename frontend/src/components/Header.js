import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, ShoppingBag, ScanLine, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_4f8469e3-e351-4c6b-84fb-3083ae8d6801/artifacts/kx63xgdp_8BB11A37-BBDF-4142-B3C6-F33EC6722B63.png";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Shop', path: '/shop', icon: ShoppingBag },
    { label: 'Body Scan', path: '/scan', icon: ScanLine },
  ];

  if (user && user.role === 'admin') {
    navItems.push({ label: 'Admin', path: '/admin', icon: LayoutDashboard });
  }

  return (
    <header className="glass-header fixed top-0 left-0 right-0 z-50" data-testid="main-header">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
          <img src={LOGO_URL} alt="XI XVI" className="h-10 w-10 object-contain" />
          <span className="font-heading text-lg tracking-tight text-[#C5A059] font-medium hidden sm:block">
            ELEVEN SIXTEEN
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-body tracking-wide transition-colors duration-300 flex items-center gap-2
                ${isActive(item.path) ? 'text-[#C5A059]' : 'text-[#A3A3A3] hover:text-[#F5F5F0]'}`}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon size={16} strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/profile"
                className="text-sm text-[#A3A3A3] hover:text-[#F5F5F0] transition-colors flex items-center gap-2"
                data-testid="nav-profile"
              >
                <User size={16} strokeWidth={1.5} />
                {user.name || 'Profile'}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { logout(); navigate('/'); }}
                className="text-[#A3A3A3] hover:text-[#F5F5F0] rounded-none"
                data-testid="logout-btn"
              >
                <LogOut size={16} strokeWidth={1.5} />
              </Button>
            </>
          ) : (
            <Link to="/login" data-testid="nav-login">
              <Button className="bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none text-sm px-6">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-[#F5F5F0]"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="mobile-menu-toggle"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0F0F0F] border-t border-[#2E2E2E] px-6 py-4 space-y-3" data-testid="mobile-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-[#A3A3A3] hover:text-[#F5F5F0] py-2"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-sm text-[#A3A3A3] py-2">Profile</Link>
              <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="text-sm text-[#A3A3A3] py-2">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-[#C5A059] py-2">Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}
