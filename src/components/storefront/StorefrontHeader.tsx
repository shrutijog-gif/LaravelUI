import React from 'react';
import { ShoppingBag, Search, Phone, Mail, Globe, Leaf, ArrowRight, ShieldCheck } from 'lucide-react';

interface StorefrontHeaderProps {
  cartItemsCount: number;
  cartTotalAmount: number;
  onOpenCart: () => void;
  onGoHome: () => void;
  onViewAdminModule?: () => void;
  onToggleViewMode?: () => void;
  currentView: 'home' | 'checkout' | 'success' | 'admin-orders';
}

export const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({
  cartItemsCount,
  cartTotalAmount,
  onOpenCart,
  onGoHome,
  onViewAdminModule,
  onToggleViewMode,
  currentView,
}) => {
  return (
    <header className="w-full font-sans sticky top-0 z-40 shadow-md">

      {/* Topmost Utility Bar */}
      <div className="bg-[#133e1b] text-white text-xs py-2 border-b border-green-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-6 text-green-100">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#f37021]" />
              <a href="tel:+912402400100" className="hover:underline">+91 240 2400100 / +91 94222 12345</a>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#f37021]" />
              <span>info@msmkvk.org.in</span>
            </span>
            <span className="hidden lg:flex items-center gap-1 text-emerald-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ICAR Approved Agricultural Research Center</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {onToggleViewMode && (
              <button
                onClick={onToggleViewMode}
                className="flex items-center gap-1.5 text-xs text-green-100 hover:text-white transition-colors cursor-pointer bg-emerald-800/60 hover:bg-emerald-800 px-2.5 py-1 rounded-md border border-emerald-600/40 shadow-2xs"
                title="Return to Admin Dashboard"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                <span>Return to <strong>Admin Dashboard</strong></span>
              </button>
            )}
            {onViewAdminModule && (
              <button
                onClick={onViewAdminModule}
                className="bg-[#f37021] hover:bg-[#eb6619] text-white text-xs px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>⚙️ Admin Orders View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="bg-white py-3.5 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between">

          {/* Logo & Institution Name */}
          <div
            onClick={onGoHome}
            className="flex items-center gap-3 sm:gap-4 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-700 to-emerald-900 p-2 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Leaf className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest block">
                Mahatma Gandhi Mission
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#133e1b] leading-tight">
                Krishi Vigyan Kendra
              </h1>
              <p className="text-[11px] text-emerald-800 font-medium hidden sm:block">
                Gandheli, Chhatrapati Sambhajinagar (Aurangabad), Maharashtra
              </p>
            </div>
          </div>

          {/* Right: Search & Cart */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-64 lg:w-80">
              <input
                type="text"
                placeholder="Search Cattle Feed, NPK, Seeds..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e7e34] focus:bg-white text-gray-800 placeholder-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
            </div>

            <button
              onClick={onOpenCart}
              className="relative bg-[#1e7e34] hover:bg-[#1b6d2d] text-white px-3.5 py-2 rounded-xl flex items-center gap-2.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#f37021] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs leading-none">
                <span className="text-emerald-100 text-[10px] font-medium">My Cart</span>
                <span className="font-bold text-white text-xs mt-0.5">
                  ₹{cartTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-[#1e7e34] text-white text-xs sm:text-sm font-semibold border-t border-emerald-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-6 sm:gap-8">
            <button
              onClick={onGoHome}
              className={`hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer ${
                currentView === 'home' ? 'text-amber-300 font-bold underline underline-offset-4' : ''
              }`}
            >
              <span>Home</span>
            </button>

            <a href="#products-section" className="hover:text-amber-300 transition-colors flex items-center gap-1">
              <span>Our Products</span>
              <span className="bg-[#f37021] text-[9px] text-white px-1.5 py-0.5 rounded-full uppercase">Featured</span>
            </a>

            <a href="#agri-blogs" className="hover:text-amber-300 transition-colors">
              Agri Blog &amp; Updates
            </a>

            <a href="#facility-section" className="hover:text-amber-300 transition-colors">
              Facilities &amp; Ecosystem
            </a>

            <a href="#faqs-section" className="hover:text-amber-300 transition-colors">
              FAQs
            </a>

            <a href="#contact-footer" className="hover:text-amber-300 transition-colors">
              Contact Us
            </a>
          </div>

          {/* Quick Help Hotline */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-normal text-emerald-100 bg-emerald-800/40 px-3 py-1 rounded-full border border-emerald-500/30">
            <span>🌾 KVK Farmer Advisory:</span>
            <strong className="text-white">1800 123 4567</strong>
          </div>
        </div>
      </nav>

    </header>
  );
};
