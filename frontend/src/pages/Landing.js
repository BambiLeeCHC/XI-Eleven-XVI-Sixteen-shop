import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ScanLine, Shirt, Ruler, Shield, Star, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';

const PRODUCT_IMG = "https://customer-assets.emergentagent.com/job_ai-fitting-room-14/artifacts/3w248fb9_IMG_1629.webp";
const PRODUCT_IMG2 = "https://customer-assets.emergentagent.com/job_ai-fitting-room-14/artifacts/vlhys2e8_IMG_1629.webp";
const LOGO_URL = "https://customer-assets.emergentagent.com/job_4f8469e3-e351-4c6b-84fb-3083ae8d6801/artifacts/kx63xgdp_8BB11A37-BBDF-4142-B3C6-F33EC6722B63.png";

export default function Landing() {
  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Hero */}
      <section className="relative h-[90vh] flex items-end" data-testid="hero-section">
        <div className="absolute inset-0">
          <img src={PRODUCT_IMG} alt="XI XVI Collection" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 w-full">
          <div className="max-w-2xl opacity-0 animate-fade-in-up">
            <p className="text-xs text-[#D4AF37] tracking-[0.3em] uppercase mb-4 font-body">Luxury Redefined</p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white font-light tracking-tight leading-tight">
              Your Perfect Fit,<br />
              <span className="text-[#D4AF37]">Visualized.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/70 mt-6 font-body leading-relaxed max-w-lg">
              AI-powered body scanning meets luxury fashion. See exactly how every piece fits before you buy.
            </p>
            <div className="flex gap-4 mt-8">
              <Link to="/scan" data-testid="hero-cta-scan">
                <Button className="bg-white text-[#1A1A1A] hover:bg-white/90 rounded-none px-8 py-3 text-sm font-medium tracking-wide">
                  Start Your Experience
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/shop" data-testid="hero-cta-shop">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-none px-8 py-3 text-sm">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Inspirational Statement */}
      <section className="py-20 px-6 text-center bg-[#1A1A1A]">
        <div className="max-w-3xl mx-auto">
          <img src={LOGO_URL} alt="XI XVI" className="h-16 w-16 mx-auto mb-8 opacity-60" />
          <p className="font-heading text-2xl sm:text-3xl text-white/90 font-light italic leading-relaxed">
            "Where technology meets craftsmanship, and every garment tells your story."
          </p>
          <p className="text-xs text-[#D4AF37] tracking-[0.3em] uppercase mt-6 font-body">XI XVI &mdash; Eleven Sixteen</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto" data-testid="how-it-works">
        <div className="text-center mb-16">
          <h2 className="font-heading text-base sm:text-lg text-[#8B6914] tracking-wide">THE EXPERIENCE</h2>
          <p className="font-heading text-3xl text-[#1A1A1A] mt-2 font-light">Tailored to You, Powered by AI</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: ScanLine, title: 'AI Body Scan', desc: 'Upload a full-length photo with your height and weight. Our dual-AI system maps your exact proportions in seconds.', cta: 'Scan Now' },
            { icon: Ruler, title: 'Precision Sizing', desc: 'Your measurements are matched against every garment to recommend your perfect size. No more guesswork, no more returns.', cta: 'Learn More' },
            { icon: Shirt, title: 'Virtual Try-On', desc: 'See AI-rendered visualizations of how each piece fits on your body before you buy. Confidence in every purchase.', cta: 'Try It' }
          ].map((step, i) => (
            <div key={step.title} className={`opacity-0 animate-fade-in-up stagger-${i + 1} text-center`}>
              <div className="w-16 h-16 mx-auto mb-6 border border-[#8B6914]/20 flex items-center justify-center">
                <step.icon size={28} strokeWidth={1} className="text-[#8B6914]" />
              </div>
              <h3 className="font-heading text-xl text-[#1A1A1A] mb-3">{step.title}</h3>
              <p className="text-sm text-[#6B6B6B] font-body leading-relaxed mb-4">{step.desc}</p>
              <Link to="/scan" className="text-xs text-[#8B6914] hover:underline tracking-wide uppercase font-body">{step.cta} &rarr;</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Product Showcase with CTA */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto" data-testid="categories-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/shop" className="relative h-[500px] group overflow-hidden border border-[#E8E4DD] hover:border-[#8B6914]/50 transition-all duration-300" data-testid="category-shop">
            <img src={PRODUCT_IMG} alt="XI XVI Collection" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <p className="text-xs text-[#D4AF37] tracking-widest uppercase mb-2 font-body">New Arrivals</p>
              <h3 className="font-heading text-3xl text-white mb-2">The Collection</h3>
              <p className="text-sm text-white/60 mb-4">Curated pieces designed for the modern individual.</p>
              <span className="text-xs text-white border-b border-white/30 pb-1 group-hover:border-[#D4AF37] transition-colors">Shop Now &rarr;</span>
            </div>
          </Link>
          <div className="flex flex-col gap-4">
            <Link to="/scan" className="relative h-[244px] group overflow-hidden border border-[#E8E4DD] hover:border-[#8B6914]/50 transition-all duration-300">
              <img src={PRODUCT_IMG2} alt="Virtual Fitting" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <p className="text-xs text-[#D4AF37] tracking-widest uppercase mb-1 font-body">Revolutionary</p>
                <h3 className="font-heading text-xl text-white">Virtual Fitting Room</h3>
                <p className="text-xs text-white/50 mt-1">See how it fits before you buy.</p>
              </div>
            </Link>
            <div className="h-[244px] border border-[#E8E4DD] bg-[#1A1A1A] flex items-center justify-center p-8 text-center">
              <div>
                <Shield size={32} strokeWidth={1} className="text-[#D4AF37] mx-auto mb-4" />
                <h3 className="font-heading text-xl text-white mb-2">Zero Guesswork</h3>
                <p className="text-xs text-white/50 leading-relaxed max-w-xs">Every recommendation backed by AI analysis of your exact body dimensions. The right size, every time.</p>
                <Link to="/register" className="inline-block mt-4 text-xs text-[#D4AF37] hover:underline tracking-wide uppercase">Get Started &rarr;</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-6 bg-[#F5F2ED]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Zap, title: 'Instant AI Analysis', desc: 'Body dimensions mapped in under 60 seconds' },
            { icon: Star, title: 'Perfect Fit Guarantee', desc: 'AI-powered sizing with 95% accuracy' },
            { icon: Shield, title: 'Secure Checkout', desc: 'Stripe-powered payments, fully encrypted' }
          ].map(badge => (
            <div key={badge.title} className="flex flex-col items-center">
              <badge.icon size={24} strokeWidth={1.5} className="text-[#8B6914] mb-3" />
              <h4 className="text-sm text-[#1A1A1A] font-medium font-body">{badge.title}</h4>
              <p className="text-xs text-[#6B6B6B] mt-1">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl text-[#1A1A1A] font-light mb-4">Ready to Find Your Perfect Fit?</h2>
          <p className="text-sm text-[#6B6B6B] mb-8 font-body">Join thousands who have discovered the future of personalized fashion.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none px-8 py-3 text-sm">
                Create Free Account
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A]/5 rounded-none px-8 py-3 text-sm">
                Browse Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
