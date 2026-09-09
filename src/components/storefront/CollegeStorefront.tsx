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
  const activePage = activePageSlug ? storedPages.find(p => 
    p.slug === activePageSlug || 
    p.name.toLowerCase().replace(/\s+/g, '-') === activePageSlug ||
    p.id === activePageSlug
  ) : null;

  const dynamicPuckData = activePage ? getStoredPagePuckData(activePage.id, activePage.name) : null;
  const dynamicConfig = getDynamicPuckConfig ? getDynamicPuckConfig() : config;

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col justify-between">
      <div>
        {/* Dynamic Storefront Section for Studio Modules (only on homepage) */}
        {!activePage && (
          <div className="bg-amber-50/40 border-b border-amber-100 py-12 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
              <DynamicModuleBlock moduleSlug="awards" titleOverride={`Institutional Awards & Honors (${tenant.name})`} />
            </div>
          </div>
        )}
        
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

        {/* Dynamic Specific Web Page View */}
        {activePage ? (
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
          /* Standard College Storefront Homepage */
          <>
            {/* 3. Hero Campus Banner */}
            <section id="hero" className="relative text-white overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop')`,
                }}
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to right, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.52), rgba(0, 0, 0, 0.72))',
                }}
              />

              <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-8 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Premier Centre of Higher Learning &amp; Research</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white drop-shadow-md">
                    Empowering Generations Through <span className="text-amber-400">Excellence</span> &amp; Innovation
                  </h2>

                  <p className="text-sm sm:text-base text-gray-100 max-w-2xl leading-relaxed drop-shadow">
                    Discover cutting-edge academic curricula, world-class laboratory infrastructure, renowned faculty mentorship, and a thriving campus ecosystem designed for visionary leaders of tomorrow.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <a
                      href="#admissions"
                      className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <span>Explore Academic Programs</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>

                    <a
                      href="#timetables-section"
                      className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md border border-white/30 transition-all hover:-translate-y-0.5"
                    >
                      View Timetables
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/15 pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Admission Enquiries</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Open</span>
                  </div>

                  <h3 className="text-xl font-black text-white">
                    Apply for Academic Year 2026-27
                  </h3>
                  <ul className="space-y-3 text-xs text-gray-200">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>State-of-the-Art Research Laboratories &amp; Digital Library</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>100% Placement Assistance &amp; Corporate Partnerships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>Scholarship Grants for Merit &amp; Economically Weaker Students</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Principal's Message Section */}
            <section id="principal-message" className="py-16 sm:py-20 px-4 sm:px-8 bg-white border-b border-gray-100">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-4 flex justify-center">
                  <div className="relative group">
                    <div 
                      className="w-64 h-72 sm:w-72 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-gray-100 flex items-center justify-center text-white"
                      style={{ backgroundColor: tenant.primaryColor }}
                    >
                      <div className="text-center p-6 space-y-3">
                        <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/40 mx-auto flex items-center justify-center text-4xl font-bold">
                          🎓
                        </div>
                        <h4 className="text-lg font-extrabold text-white">Dr. Ananya Sharma</h4>
                        <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Principal &amp; Dean</p>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-amber-500 text-gray-900 font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                      <Quote className="w-4 h-4" /> 25+ Yrs Academic Leadership
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <Quote className="w-3.5 h-3.5" /> Message from Leadership
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                    "Fostering Academic Rigor, Character &amp; Global Competence"
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    Welcome to <strong>{tenant.name}</strong>. Education is not merely the acquisition of knowledge; it is the empowerment to think critically, innovate fearlessly, and serve society with integrity.
                  </p>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    Our faculty members are world-class researchers and mentors who guide students through rigorous curriculum, practical industry projects, and holistic co-curricular growth. We invite you to explore our academic programs and join our vibrant community.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Timetables Section */}
            <section id="timetables-section" className="py-16 px-4 sm:px-8 bg-gray-50 border-b border-gray-100">
              <div className="max-w-7xl mx-auto space-y-8">
                <TimetableBlock
                  title="Academic Timetables & Schedules"
                  description="Download the latest course schedules and examination timetables."
                />
              </div>
            </section>
          </>
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
