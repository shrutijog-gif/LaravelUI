import React from 'react';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  FileCheck2,
  School,
  FileText,
  Users
} from 'lucide-react';

export type PortalType = 
  | 'society' 
  | 'college' 
  | 'superadmin' 
  | 'naac-university' 
  | 'naac-school' 
  | 'naac-program';

interface PortalLandingPageProps {
  onSelectPortal: (portal: PortalType) => void;
}

export const PortalLandingPage: React.FC<PortalLandingPageProps> = ({
  onSelectPortal,
}) => {
  const existingPortals = [
    {
      id: 'society' as PortalType,
      title: 'Elite Multi-College Educational Society',
      badge: 'Society / Trust',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: Building2,
      iconBg: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
      description: 'Central educational trust governing multi-campus policies, group circulars, and institutional oversight.',
      buttonText: 'Access Society Portal',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs',
    },
    {
      id: 'college' as PortalType,
      title: 'Elite College of Arts, Science & Commerce',
      badge: 'Autonomous College',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
      icon: GraduationCap,
      iconBg: 'bg-blue-50 text-blue-700 border border-blue-100',
      description: 'Campus operations, examination timetables, department programs, NAAC compliance, and faculty management.',
      buttonText: 'Access College Portal',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs',
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
      buttonBg: 'bg-[#0f172a] hover:bg-slate-800 text-amber-400 border border-amber-500/30 shadow-xs',
    },
  ];

  const naacTiers = [
    {
      id: 'naac-university' as PortalType,
      levelBadge: 'University Level',
      levelBadgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      role: 'University Coordinator',
      roleDescription: 'Monitors all 5 schools, verifies cross-school completeness, and prepares master university SSR/AQAR documentation.',
      icon: Building2,
      iconBg: 'bg-purple-600 text-white',
      buttonText: 'University Portal Login',
      buttonBg: 'bg-purple-700 hover:bg-purple-800 text-white shadow-sm',
    },
    {
      id: 'naac-school' as PortalType,
      levelBadge: 'School Level',
      levelBadgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      role: 'School Coordinator',
      roleDescription: 'Reviews, verifies, and consolidates departmental submissions across the 3–4 programs in their school.',
      icon: School,
      iconBg: 'bg-blue-600 text-white',
      buttonText: 'School Portal Login',
      buttonBg: 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm',
    },
    {
      id: 'naac-program' as PortalType,
      levelBadge: 'Program / Dept Level',
      levelBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      role: 'Program Coordinator',
      roleDescription: 'Compiles and uploads evidence proofs tagged to Criteria 1–7 and submits them to the school coordinator.',
      icon: FileCheck2,
      iconBg: 'bg-emerald-600 text-white',
      buttonText: 'Program Portal Login',
      buttonBg: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm',
    },
  ];

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-cover bg-center bg-no-repeat font-sans selection:bg-blue-500 selection:text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.72)), url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop')`,
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
                Live Demos & Portals
              </span>
            </span>
            <p className="text-xs text-gray-200 font-medium hidden sm:block drop-shadow-xs">
              Integrated Accreditation Management, Governance & Institutional CMS
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto my-6 z-10 space-y-6">
        {/* Title & Tagline */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold mb-2.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Institutional Solutions & Live Demos</span>
          </div>
          <h1 className="text-2xl sm:text-3.5xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-md">
            Live Demos & Administrative Portals
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed drop-shadow-xs max-w-2xl mx-auto">
            Select a specialized accreditation workflow, multi-campus governance trust, or autonomous college portal to explore.
          </p>
        </div>

        {/* 🏆 FEATURED BIG HERO BOX: ITM Skills University NAAC DMS */}
        <section className="bg-black/20 backdrop-blur-sm rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-white/15">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 border border-white/20">
                🎓
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight drop-shadow-sm">
                    ITM Skills University — NAAC Document Management System
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Featured Demo
                  </span>
                </div>
                <p className="text-xs text-gray-200 font-medium leading-relaxed">
                  Centralized 3-tier evidence collection, departmental review, and master consolidation across <strong className="text-white">5 Schools</strong> and <strong className="text-white">18 Academic Programs</strong>.
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-gray-200 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/20 shrink-0">
              <div className="flex items-center gap-1.5 text-white">
                <School className="w-3.5 h-3.5 text-indigo-300" />
                <span>5 Schools</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1.5 text-white">
                <Users className="w-3.5 h-3.5 text-blue-300" />
                <span>18 Programs</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1.5 text-white">
                <FileText className="w-3.5 h-3.5 text-emerald-300" />
                <span>Criteria 1–7</span>
              </div>
            </div>
          </div>

          {/* 3 Tier Portals Inside the Big Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {naacTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.id}
                  onClick={() => onSelectPortal(tier.id)}
                  className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-white/80 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-2xl group cursor-pointer"
                >
                  <div>
                    {/* Level Badge + Icon */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${tier.levelBadgeClass}`}>
                        {tier.levelBadge}
                      </span>
                      <div className={`w-8 h-8 rounded-lg ${tier.iconBg} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Role Title */}
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1.5">
                      {tier.role}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed mb-4">
                      {tier.roleDescription}
                    </p>
                  </div>

                  {/* Portal Button */}
                  <button
                    type="button"
                    className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${tier.buttonBg}`}
                  >
                    <span>{tier.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 🏛️ COMPACT SECONDARY SECTION: Other Portals */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
              Multi-Campus Trust Governance & Autonomous CMS Portals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
            {existingPortals.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPortal(p.id)}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-xl border border-white/20 group cursor-pointer"
                >
                  <div>
                    {/* Top: Icon + Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`w-9 h-9 rounded-xl ${p.iconBg} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${p.badgeClass}`}>
                        {p.badge}
                      </span>
                    </div>

                    {/* Institution Title */}
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug mb-1.5 group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-[11px] text-gray-600 leading-relaxed font-normal mb-3 line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  {/* Button */}
                  <button
                    type="button"
                    className={`w-full py-2 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${p.buttonBg}`}
                  >
                    <span>{p.buttonText}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full text-center text-xs text-gray-400 pt-4 pb-2 border-t border-white/10 z-10 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 WhiteCode Technologies. All Rights Reserved.</p>
        <p className="text-gray-400 font-medium">
          ITM Skills University • Multi-Campus Educational Trust Cloud
        </p>
      </footer>
    </div>
  );
};
