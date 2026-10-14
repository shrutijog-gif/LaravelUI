import React from 'react';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';

export type PortalType = 'society' | 'college' | 'superadmin';

interface PortalLandingPageProps {
  onSelectPortal: (portal: PortalType) => void;
}

export const PortalLandingPage: React.FC<PortalLandingPageProps> = ({
  onSelectPortal,
}) => {
  const portals = [
    {
      id: 'society' as PortalType,
      title: 'Elite Multi-College Educational Society',
      badge: 'Society / Trust',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: Building2,
      iconBg: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
      description: 'Central educational trust governing multi-campus policies, group circulars, and institutional oversight.',
      buttonText: 'Access Society Portal',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20',
    },
    {
      id: 'college' as PortalType,
      title: 'Elite College of Arts, Science and Commerce (Autonomous)',
      badge: 'College',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
      icon: GraduationCap,
      iconBg: 'bg-blue-50 text-blue-700 border border-blue-100',
      description: 'Campus operations, examination timetables, department programs, NAAC compliance, and faculty management.',
      buttonText: 'Access College Portal',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20',
      isDefault: true,
    },
    {
      id: 'superadmin' as PortalType,
      title: 'WhiteCode Master Console',
      badge: 'Platform Superadmin',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      icon: ShieldCheck,
      iconBg: 'bg-amber-50 text-amber-800 border border-amber-200',
      description: 'Global SaaS infrastructure, dynamic Module Studio, tenant provisioning, and platform configuration.',
      buttonText: 'Launch Master Console',
      buttonBg: 'bg-[#0f172a] hover:bg-slate-800 text-amber-400 border border-amber-500/30 shadow-md',
    },
  ];

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-cover bg-center bg-no-repeat font-sans selection:bg-blue-500 selection:text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop')`,
      }}
    >
      {/* Top Header Bar */}
      <header className="w-full flex items-center justify-between z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
            🏛️
          </div>
          <div>
            <span className="text-white font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2 drop-shadow-sm">
              WhiteCode Higher Education Cloud
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Multi-Tenant CMS
              </span>
            </span>
            <p className="text-xs text-gray-200 font-medium hidden sm:block drop-shadow-xs">
              Integrated Governance & Institutional Web Management
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto my-auto py-6 sm:py-8 z-10">
        {/* Title & Tagline */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Institutional Portals Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2.5 drop-shadow-md">
            Select Your Administrative Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed drop-shadow-xs">
            Sign in to access your administrative tools for campus operations, trust governance, or SaaS platform control.
          </p>
        </div>

        {/* 3 Clean White Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 items-stretch">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPortal(p.id)}
                className="bg-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 shadow-2xl hover:shadow-3xl border border-gray-100 group cursor-pointer"
              >
                <div>
                  {/* Top: Icon + Badge */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-2xl ${p.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${p.badgeClass}`}>
                      {p.badge}
                    </span>
                  </div>

                  {/* Institution Title */}
                  <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug tracking-tight mb-2.5 group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </h2>

                  {/* Clean Short Writeup */}
                  <p className="text-xs text-gray-600 leading-relaxed font-normal mb-6">
                    {p.description}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <button
                  type="button"
                  className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${p.buttonBg}`}
                >
                  <span>{p.buttonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full text-center text-xs text-gray-400 pt-6 pb-2 border-t border-white/10 z-10 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 WhiteCode Technologies. All Rights Reserved.</p>
        <p className="text-gray-400 font-medium">
          Multi-Campus Educational Trust & Autonomous Colleges Cloud
        </p>
      </footer>
    </div>
  );
};
