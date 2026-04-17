import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ScanLine, Shirt, Ruler } from 'lucide-react';
import { Button } from '../components/ui/button';

const HERO_BG = "https://images.unsplash.com/photo-1558975388-32fa45ea963c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxtZW5zJTIwZmFzaGlvbiUyMGx1eHVyeXxlbnwwfHx8fDE3NzYzODgxNDl8MA&ixlib=rb-4.1.0&q=85";
const CAT_MEN = "https://images.unsplash.com/photo-1744551358280-f1d593754132?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHxtZW5zJTIwZmFzaGlvbiUyMGx1eHVyeXxlbnwwfHx8fDE3NzYzODgxNDl8MA&ixlib=rb-4.1.0&q=85";
const CAT_WOMEN = "https://images.unsplash.com/photo-1649716708340-aa1da90a3c67?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NjM4ODE0OXww&ixlib=rb-4.1.0&q=85";
const PRODUCT_PH = "https://images.unsplash.com/photo-1598795737563-07467e744bac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwY2xvdGhpbmclMjByYWNrfGVufDB8fHx8MTc3NjM4ODE0OXww&ixlib=rb-4.1.0&q=85";

export default function Landing() {
  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Hero */}
      <section className="relative h-[90vh] flex items-end" data-testid="hero-section">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Luxury Fashion" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 w-full">
          <div className="max-w-2xl opacity-0 animate-fade-in-up">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#F5F5F0] font-light tracking-tight leading-tight">
              Your Perfect Fit,<br />
              <span className="text-[#C5A059]">Visualized.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#A3A3A3] mt-6 font-body leading-relaxed max-w-lg">
              AI-powered body scanning meets luxury fashion. See exactly how every piece fits before you buy.
            </p>
            <div className="flex gap-4 mt-8">
              <Link to="/scan" data-testid="hero-cta-scan">
                <Button className="bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none px-8 py-3 text-sm font-medium tracking-wide">
                  Start Body Scan
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/shop" data-testid="hero-cta-shop">
                <Button variant="outline" className="border-[#C5A059]/30 text-[#C5A059] hover:bg-[#C5A059]/10 rounded-none px-8 py-3 text-sm">
                  Browse Collection
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto" data-testid="how-it-works">
        <h2 className="font-heading text-base sm:text-lg text-[#C5A059] mb-16 tracking-wide">HOW IT WORKS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: ScanLine, title: 'AI Body Scan', desc: 'Upload a full-length photo with your height and weight. Our dual-AI system maps your exact proportions.' },
            { icon: Ruler, title: 'Precision Sizing', desc: 'Your measurements are matched against garment specifications to recommend your perfect size every time.' },
            { icon: Shirt, title: 'Virtual Try-On', desc: 'See how each piece fits on your virtual twin before purchasing. No more returns from sizing issues.' }
          ].map((step, i) => (
            <div
              key={step.title}
              className={`opacity-0 animate-fade-in-up stagger-${i + 1}`}
            >
              <step.icon size={32} strokeWidth={1} className="text-[#C5A059] mb-4" />
              <h3 className="font-heading text-xl text-[#F5F5F0] mb-3">{step.title}</h3>
              <p className="text-sm text-[#A3A3A3] font-body leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto" data-testid="categories-section">
        <h2 className="font-heading text-base sm:text-lg text-[#C5A059] mb-12 tracking-wide">COLLECTIONS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/shop?category=tops"
            className="relative h-[400px] group overflow-hidden border border-[#2E2E2E] hover:border-[#C5A059]/50 transition-all duration-300"
            data-testid="category-men"
          >
            <img src={CAT_MEN} alt="Collection" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <h3 className="font-heading text-2xl text-[#F5F5F0]">Tops & Shirts</h3>
              <p className="text-sm text-[#A3A3A3] mt-2">Explore the collection</p>
            </div>
          </Link>
          <Link
            to="/shop?category=bottoms"
            className="relative h-[400px] group overflow-hidden border border-[#2E2E2E] hover:border-[#C5A059]/50 transition-all duration-300"
            data-testid="category-women"
          >
            <img src={CAT_WOMEN} alt="Collection" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <h3 className="font-heading text-2xl text-[#F5F5F0]">Bottoms & More</h3>
              <p className="text-sm text-[#A3A3A3] mt-2">Explore the collection</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto" data-testid="featured-section">
        <div className="relative h-[300px] overflow-hidden border border-[#2E2E2E]">
          <img src={PRODUCT_PH} alt="Featured" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute inset-0 flex items-center px-12">
            <div>
              <p className="text-xs text-[#C5A059] tracking-widest mb-3 font-body">VIRTUAL FITTING ROOM</p>
              <h3 className="font-heading text-3xl text-[#F5F5F0] mb-4">Experience the Future of Fashion</h3>
              <Link to="/scan">
                <Button className="bg-[#C5A059] text-black hover:bg-[#B38D46] rounded-none px-6 text-sm">
                  Get Started
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
