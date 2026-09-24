import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  FileText, 
  Award, 
  Users, 
  ChevronRight, 
  Download, 
  ArrowUpRight, 
  Quote, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Sparkles,
  Building2,
  Globe,
  Home,
  ChevronLeft
} from 'lucide-react';
import { getActiveTenant, CollegeTenant, collegeTenantsList, setActiveTenantId } from '../../data/tenantData';
import { TimetableBlock } from './blocks/TimetableBlock';
import { DynamicModuleBlock } from './blocks/DynamicModuleBlock';
import { getStoredWebPages, getStoredPagePuckData } from '../../data/mockPageData';
import { config, getDynamicPuckConfig } from '../../puck.config';
import { Render } from '@measured/puck';

interface CollegeStorefrontProps {
  onToggleViewMode?: () => void;
}

export const CollegeStorefront: React.FC<CollegeStorefrontProps> = ({ onToggleViewMode }) => {
  const [tenant, setTenant] = useState<CollegeTenant>(getActiveTenant());

  useEffect(() => {
    const handleTenantChange = () => {
      setTenant(getActiveTenant());
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, []);

  // Check if a specific page is requested via URL query e.g. ?page=about-college OR direct pathname /about-college
  const urlParams = new URLSearchParams(window.location.search);
  const querySlug = urlParams.get('page');
  const pathSlug = typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/'
    ? window.location.pathname.replace(/^\/+|\/+$/g, '')
    : null;
  const activePageSlug = querySlug || pathSlug;

  const storedPages = getStoredWebPages();
  const isHomePage = !activePageSlug || activePageSlug === 'home' || activePageSlug === 'p-home';
  const activePage = !isHomePage ? storedPages.find(p => 
    p.slug === activePageSlug || 
    p.name.toLowerCase().replace(/\s+/g, '-') === activePageSlug ||
    p.id === activePageSlug
  ) : storedPages.find(p => p.id === 'p-home' || p.slug === 'home');

  const [homePuckData, setHomePuckData] = useState(() => getStoredPagePuckData('p-home', 'Home'));

  useEffect(() => {
    const handleHomePuckUpdate = () => {
      setHomePuckData(getStoredPagePuckData('p-home', 'Home'));
    };
    window.addEventListener('home-puck-updated', handleHomePuckUpdate);
    window.addEventListener('storage', handleHomePuckUpdate);
    return () => {
      window.removeEventListener('home-puck-updated', handleHomePuckUpdate);
      window.removeEventListener('storage', handleHomePuckUpdate);
    };
  }, []);

  const dynamicPuckData = isHomePage 
    ? homePuckData 
    : (activePage ? getStoredPagePuckData(activePage.id, activePage.name) : null);
  const dynamicConfig = getDynamicPuckConfig ? getDynamicPuckConfig() : config;

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col justify-between">
      <div>
        
        {/* 1. Top Utility Header Bar */}
        {(activePage ? activePage.showHeader !== false : true) && (
          <div 
            className="text-white text-xs py-2 px-4 sm:px-8 border-b border-black/10 transition-colors sticky top-0 z-50 shadow-md"
            style={{ backgroundColor: tenant.primaryColor }}
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-6 text-white/90">
                <span className="flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <a href="tel:+911123456789" className="hover:underline">+91 (011) 2345 6789</a>
                </span>
                <span className="hidden md:flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>admissions@{tenant.id}.edu.in</span>
                </span>
                <span className="hidden lg:flex items-center gap-1 text-white/80 font-semibold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>NAAC Accredited Grade A++ Institution</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Live Tenant Switcher */}
                <div className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1 rounded-lg border border-white/20 transition-all">
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
                    className="flex items-center gap-1.5 text-xs text-white hover:text-amber-200 transition-colors cursor-pointer bg-black/25 hover:bg-black/40 px-3 py-1 rounded-lg border border-white/20 shadow-2xs font-semibold"
                    title="Return to Admin Dashboard"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-300" />
                    <span>Return to <strong>Admin Dashboard</strong></span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 2. Main College Branding Navbar */}
        {(activePage ? activePage.showHeader !== false : true) && (
          <nav className="bg-white border-b border-gray-200 sticky top-9 z-40 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
              {/* Logo & Institution Name */}
              <a href="?mode=storefront" className="flex items-center gap-3.5 no-underline">
                <div 
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tenant.badgeGradient} p-2 flex items-center justify-center text-white shadow-md`}
                >
                  {tenant.logoType === 'lady-irwin' && (
                    <GraduationCap className="w-7 h-7 text-white" />
                  )}
                  {tenant.logoType === 'kvk-leaf' && (
                    <Sparkles className="w-7 h-7 text-white" />
                  )}
                  {tenant.logoType === 'university-crest' && (
                    <Building2 className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-gray-900 leading-tight tracking-tight">
                    {tenant.name}
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">
                    {tenant.subtitle}
                  </p>
                </div>
              </a>

              {/* Navigation Links */}
              <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-gray-700">
                <a href="?mode=storefront" className="hover:text-amber-600 transition-colors">Home</a>
                <a href="#timetables-section" className="hover:text-amber-600 transition-colors">Timetables</a>
                <a href="#principal-message" className="hover:text-amber-600 transition-colors">Leadership</a>
                <a href="#alumni-section" className="hover:text-amber-600 transition-colors">Alumni</a>
                <a href="#notices-section" className="hover:text-amber-600 transition-colors">Notices</a>
                <a href="?mode=storefront&page=careers" className="hover:text-amber-600 transition-colors">Careers</a>
                <a 
                  href="#admissions" 
                  className="px-4 py-2 rounded-xl text-white font-extrabold shadow-sm transition-all hover:shadow-md"
                  style={{ backgroundColor: tenant.primaryColor }}
                >
                  Admissions 2026-27
                </a>
              </div>
            </div>
          </nav>
        )}

        {/* Dynamic Specific Web Page View or Home Page */}
        {isHomePage ? (
          <div className="w-full">
            <Render config={dynamicConfig} data={dynamicPuckData || homePuckData} />
          </div>
        ) : activePage ? (
          <div>
            {/* Page Hero Breadcrumb Banner */}
            {(activePage.showBreadcrumb !== false) && (
              <div 
                className="relative py-12 px-4 sm:px-8 text-white overflow-hidden shadow-inner"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-3xs" />
                <div className="relative max-w-7xl mx-auto flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold uppercase tracking-wider">
                    <a href="?mode=storefront" className="hover:underline text-white/80 flex items-center gap-1">
                      <Home className="w-3.5 h-3.5" />
                      <span>Home</span>
                    </a>
                    <span>›</span>
                    <span className="text-amber-300 font-bold">{activePage.name}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {activePage.name}
                  </h1>
                  {activePage.seoTitle && (
                    <p className="text-xs text-white/80 max-w-2xl font-medium">
                      {activePage.seoTitle}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Page Content Body */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8 min-h-[420px] flex items-center justify-center">
              {dynamicPuckData && dynamicPuckData.content && dynamicPuckData.content.length > 0 ? (
                <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8 overflow-hidden">
                  <Render config={dynamicConfig} data={dynamicPuckData} />
                </div>
              ) : (
                <div className="w-full text-center py-20 flex flex-col items-center justify-center">
                  <p className="text-base sm:text-lg font-medium text-gray-700 tracking-normal">
                    Content will be displayed here...
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full">
            <Render config={dynamicConfig} data={homePuckData} />
          </div>
        )}
      </div>

      {/* 7. College Footer */}
      {(activePage ? activePage.showFooter !== false : true) && (
        <footer className="bg-gray-900 text-white pt-12 pb-8 px-4 sm:px-8 mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800 text-xs">
            
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-400">{tenant.name}</h4>
              <p className="text-gray-400 leading-relaxed">{tenant.subtitle}</p>
              <p className="text-gray-400">NAAC Grade A++ Accredited University Campus</p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-gray-200">Quick Links</h5>
              <ul className="space-y-1.5 text-gray-400">
                <li><a href="?mode=storefront#hero" className="hover:text-white">Academic Calendar</a></li>
                <li><a href="?mode=storefront#timetables-section" className="hover:text-white">Timetables &amp; Downloads</a></li>
                <li><a href="?mode=storefront#principal-message" className="hover:text-white">Principal's Message</a></li>
                <li><a href="?mode=storefront&page=careers" className="hover:text-white">Careers &amp; Opportunities</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-gray-200">Academics</h5>
              <ul className="space-y-1.5 text-gray-400">
                <li><span>School of Computer Science &amp; IT</span></li>
                <li><span>School of Home Science &amp; Nutrition</span></li>
                <li><span>School of Agriculture &amp; Agronomy</span></li>
                <li><span>School of Business Management</span></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-gray-200">Campus Contact</h5>
              <p className="text-gray-400">Central Administrative Block</p>
              <p className="text-gray-400">Helpline: 1800 123 4567</p>
              <p className="text-gray-400">Email: registrar@{tenant.id}.edu.in</p>
            </div>

          </div>

          <div className="max-w-7xl mx-auto pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-gray-500">
            <p>© 2026 {tenant.name}. Powered by College CMS SaaS Platform.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-400">Privacy Policy</a>
              {onToggleViewMode && (
                <a href="#" className="hover:text-gray-400 font-bold text-amber-400" onClick={onToggleViewMode}>
                  ⚙️ Admin Dashboard
                </a>
              )}
            </div>
          </div>
        </footer>
      )}

    </div>
  );
};

export default CollegeStorefront;
