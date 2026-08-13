import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Phone, Mail, Globe, Leaf, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import { getActiveTenant, collegeTenantsList, setActiveTenantId, CollegeTenant } from '../../data/tenantData';

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
  const [tenant, setTenant] = useState<CollegeTenant>(getActiveTenant());

  useEffect(() => {
    const handleTenantChange = () => {
      setTenant(getActiveTenant());
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, []);

  return (
    <header className="w-full font-sans sticky top-0 z-40 shadow-md">

      {/* Topmost Utility Bar (Dynamic Tenant Brand Background) */}
      <div 
        className="text-white text-xs py-2 border-b border-black/10 transition-colors"
        style={{ backgroundColor: tenant.primaryColor }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-6 text-white/90">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <a href="tel:+912402400100" className="hover:underline">+91 240 2400100 / +91 94222 12345</a>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>info@{tenant.id}.edu.in</span>
            </span>
            <span className="hidden lg:flex items-center gap-1 text-white/80 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>UGC &amp; Government Approved Institution</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Tenant Switcher in Storefront */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <select
                value={tenant.id}
                onChange={(e) => setActiveTenantId(e.target.value)}
                className="bg-transparent text-xs font-bold text-white cursor-pointer outline-none border-none p-0 pr-2"
              >
                {collegeTenantsList.map(t => (
                  <option key={t.id} value={t.id} className="text-gray-900 font-semibold">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {onToggleViewMode && (
              <button
                onClick={onToggleViewMode}
                className="flex items-center gap-1.5 text-xs text-white hover:text-amber-200 transition-colors cursor-pointer bg-black/20 hover:bg-black/40 px-2.5 py-1 rounded-md border border-white/20 shadow-2xs"
                title="Return to Admin Dashboard"
              >
                <Globe className="w-3.5 h-3.5 text-amber-300" />
                <span>Return to <strong>Admin Dashboard</strong></span>
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
            <div 
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${tenant.badgeGradient} p-2 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
            >
              {tenant.logoType === 'lady-irwin' && (
                <span className="font-extrabold text-base">LI</span>
              )}
              {tenant.logoType === 'kvk-leaf' && (
                <Leaf className="w-7 h-7 text-emerald-200" />
              )}
              {tenant.logoType === 'university-crest' && (
                <span className="font-extrabold text-base">SX</span>
              )}
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest block">
                Higher Education SaaS Portal
              </span>
              <h1 
                className="text-lg sm:text-xl font-extrabold leading-tight transition-colors"
                style={{ color: tenant.primaryColor }}
              >
                {tenant.name}
              </h1>
              <p className="text-[11px] text-gray-600 font-medium hidden sm:block">
                {tenant.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Search & Cart */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-64 lg:w-80">
              <input
                type="text"
                placeholder="Search Timetables, Circulars, Courses..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:bg-white text-gray-800 placeholder-gray-400"
                style={{ focusRingColor: tenant.primaryColor }}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
            </div>

            <button
              onClick={onOpenCart}
              className="relative text-white px-3.5 py-2 rounded-xl flex items-center gap-2.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
              style={{ backgroundColor: tenant.secondaryColor }}
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
                <span className="text-white/80 text-[10px] font-medium">My Cart</span>
                <span className="font-bold text-white text-xs mt-0.5">
                  ₹{cartTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav 
        className="text-white text-xs sm:text-sm font-semibold border-t border-black/10 transition-colors"
        style={{ backgroundColor: tenant.secondaryColor }}
      >
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

            <a href="#timetables-section" className="hover:text-amber-300 transition-colors flex items-center gap-1">
              <span>Timetables &amp; Schedules</span>
              <span className="bg-[#f37021] text-[9px] text-white px-1.5 py-0.5 rounded-full uppercase">Live</span>
            </a>

            <a href="#aqar-section" className="hover:text-amber-300 transition-colors">
              AQAR Reports
            </a>

            <a href="#syllabus-section" className="hover:text-amber-300 transition-colors">
              Syllabus &amp; Scheme
            </a>

            <a href="#circulars-section" className="hover:text-amber-300 transition-colors">
              Notices &amp; Circulars
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-normal text-white/90 bg-black/20 px-3 py-1 rounded-full border border-white/20">
            <span>🎓 Student Helpdesk:</span>
            <strong className="text-white">1800 123 4567</strong>
          </div>
        </div>
      </nav>

    </header>
  );
};
