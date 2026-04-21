import React from 'react';
import { Link } from 'react-router-dom';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_4f8469e3-e351-4c6b-84fb-3083ae8d6801/artifacts/kx63xgdp_8BB11A37-BBDF-4142-B3C6-F33EC6722B63.png";

export default function Footer() {
  return (
    <footer className="border-t border-[#E8E4DD] bg-[#F5F2ED] mt-auto" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <img src={LOGO_URL} alt="XI XVI" className="h-12 w-12 mb-4" />
            <p className="text-sm text-[#6B6B6B] font-body leading-relaxed">
              Luxury fashion, precision fit.<br />Your virtual fitting room.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-sm text-[#8B6914] mb-4 tracking-wide">SHOP</h4>
            <div className="space-y-2">
              <Link to="/shop?category=tops" className="block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Tops</Link>
              <Link to="/shop?category=bottoms" className="block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Bottoms</Link>
              <Link to="/shop?category=outerwear" className="block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Outerwear</Link>
              <Link to="/shop?category=accessories" className="block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Accessories</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading text-sm text-[#8B6914] mb-4 tracking-wide">EXPERIENCE</h4>
            <div className="space-y-2">
              <Link to="/scan" className="block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Body Scan</Link>
              <Link to="/profile" className="block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">My Profile</Link>
              <Link to="/orders" className="block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Orders</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading text-sm text-[#8B6914] mb-4 tracking-wide">CONNECT</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Instagram</a>
              <a href="#" className="block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Twitter</a>
              <a href="#" className="block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#E8E4DD] mt-8 pt-6 text-center">
          <p className="text-xs text-[#6B6B6B]">&copy; 2026 XI XVI Eleven Sixteen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
