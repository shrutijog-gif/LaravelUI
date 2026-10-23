import React, { useState, useEffect, useRef } from 'react';
import { Menu, Globe, Building2, ChevronDown, ShieldCheck, Layers, FileText, Wrench, FileSpreadsheet, LogOut, User } from 'lucide-react';
import { collegeTenantsList, getActiveTenant, setActiveTenantId, CollegeTenant } from '../../data/tenantData';
import { logout, getStoredAuthUser } from '../../services/authService';

interface HeaderProps {
  toggleSidebar: () => void;
  onToggleViewMode?: () => void;
  onSelectModule?: (id: string, label: string) => void;
  portalRole?: 'superadmin' | 'collegeadmin';
  onSwitchPortalRole?: (role: 'superadmin' | 'collegeadmin') => void;
  collegeSubRole?: 'tech_configurator' | 'data_entry';
  onSwitchCollegeSubRole?: (role: 'tech_configurator' | 'data_entry') => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  onToggleViewMode,
  onSelectModule,
  portalRole = 'superadmin',
  onSwitchPortalRole,
  collegeSubRole = 'tech_configurator',
  onSwitchCollegeSubRole,
  onLogout,
}) => {
  const [currentTenant, setCurrentTenant] = useState<CollegeTenant>(getActiveTenant());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const currentUser = getStoredAuthUser();
  const isSuperadmin = portalRole === 'superadmin';

  useEffect(() => {
    const handleTenantChange = () => {
      setCurrentTenant(getActiveTenant());
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTenant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveTenantId(e.target.value);
  };

  const portalType = typeof window !== 'undefined' ? localStorage.getItem('college_cms_portal_type') : null;
  const isNaacProgram = portalType === 'naac-program';
  const isNaacSchool = portalType === 'naac-school';
  const isNaacUniversity = portalType === 'naac-university';
  const isNaacPortal = isNaacProgram || isNaacSchool || isNaacUniversity || Boolean(currentUser?.role?.includes('Coordinator'));

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Hamburger Button + Branding Logo */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile & Desktop Hamburger Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-1 mr-0.5 sm:mr-1 hover:bg-gray-100 active:bg-gray-200 rounded-lg text-gray-700 transition-colors cursor-pointer shrink-0"
          title="Toggle Navigation"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Logo with Tooltip */}
        <div 
          className="cursor-default group flex items-center"
          title={isNaacPortal ? 'ITM Skills University — NAAC Portal' : isSuperadmin ? 'WhiteCode Master Console' : `${currentTenant.name} — ${currentTenant.subtitle}`}
        >
          {isNaacProgram ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-emerald-300 flex items-center justify-center font-black text-xs sm:text-sm shadow-md border border-emerald-500/40 shrink-0 group-hover:scale-105 transition-transform">
                📋
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-black text-gray-900 leading-tight">
                  Dept. of Computer Science & Engg
                </span>
                <span className="block text-[10px] font-semibold text-emerald-700">
                  School of Technology • ITM Skills University
                </span>
              </div>
            </div>
          ) : isNaacPortal ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-indigo-300 flex items-center justify-center font-black text-xs sm:text-sm shadow-md border border-indigo-500/30 shrink-0 group-hover:scale-105 transition-transform">
                🏛️
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-black text-gray-900 leading-tight">
                  ITM Skills University
                </span>
                <span className="block text-[10px] font-semibold text-indigo-600">
                  NAAC Accreditation DMS
                </span>
              </div>
            </div>
          ) : isSuperadmin ? (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-900 via-indigo-950 to-slate-900 text-amber-400 flex items-center justify-center font-black text-xs sm:text-sm shadow-md border border-amber-500/30 shrink-0 group-hover:scale-105 transition-transform">
              CMS
            </div>
          ) : (
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center p-1 bg-white shadow-xs transition-all shrink-0 group-hover:scale-105"
              style={{ borderColor: `${currentTenant.primaryColor}40` }}
            >
              {(currentTenant.logoType === 'elite-crest' || currentTenant.logoType === 'lady-irwin') && (
                <div className="w-7 h-7 rounded-full bg-[#0f2748] text-amber-300 flex items-center justify-center font-black text-xs shadow-xs">
                  🎓
                </div>
              )}

              {(currentTenant.logoType === 'elite-tech' || currentTenant.logoType === 'university-crest') && (
                <div className="w-7 h-7 rounded-full bg-slate-900 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
              )}

              {(currentTenant.logoType === 'elite-agri' || currentTenant.logoType === 'kvk-leaf') && (
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold text-xs">
                  🌿
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Portal Switcher Pill Bar (Visible on desktop) */}
      {isNaacProgram ? (
        <div className="hidden xl:flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl shadow-2xs">
          <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Program Coordinator Desk
          </span>
          <span className="text-emerald-300">|</span>
          <span className="text-xs font-bold text-emerald-800">
            Prof. Anita Verma (B.Tech CSE)
          </span>
        </div>
      ) : isNaacPortal ? (
        <div className="hidden xl:flex items-center gap-2 bg-indigo-50/80 border border-indigo-200/70 px-3.5 py-1.5 rounded-xl shadow-2xs">
          <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Accreditation Cycle 1 (2025–2030)
          </span>
          <span className="text-indigo-300">|</span>
          <span className="text-xs font-bold text-indigo-700">
            {currentUser?.role || 'IQAC Coordinator'}
          </span>
        </div>
      ) : (
        <div className="hidden xl:flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-2xs">
          <button
            onClick={() => {
              if (onSwitchPortalRole) onSwitchPortalRole('superadmin');
              if (onSelectModule) onSelectModule('module-studio', 'Module Studio');
            }}
            className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              isSuperadmin
                ? 'bg-[#0f172a] text-amber-400 shadow-sm ring-2 ring-amber-400/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            👑 WhiteCode Master Console
          </button>

          <button
            onClick={() => {
              if (onSwitchPortalRole) onSwitchPortalRole('collegeadmin');
              if (onSelectModule) onSelectModule('dashboard', 'Dashboard');
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              !isSuperadmin
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30 font-black'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-300" />
            🏛️ College Admin Panel
          </button>
        </div>
      )}

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 text-gray-600 shrink-0">
        {/* Multi-Tenant Switcher Dropdown (Only visible in College Admin Mode) */}
        {isNaacProgram ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-950 px-2.5 sm:px-3 py-1 rounded-lg shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="hidden sm:block text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 leading-none">
                Department
              </span>
              <span className="text-xs font-black text-emerald-950 truncate">
                B.Tech CSE
              </span>
            </div>
          </div>
        ) : isNaacPortal ? (
          <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200/80 text-purple-900 px-2.5 sm:px-3 py-1 rounded-lg shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="hidden sm:block text-[9px] font-extrabold uppercase tracking-wider text-purple-500 leading-none">
                Scope
              </span>
              <span className="text-xs font-black text-purple-900 truncate">
                5 Schools • 18 Programs
              </span>
            </div>
          </div>
        ) : isSuperadmin ? (
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-800 px-2.5 py-1 rounded-lg shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Scope:
            </span>
            <span className="text-xs font-black text-amber-900 flex items-center gap-1">
              🌐 All Colleges
            </span>
          </div>
        ) : (
          <div className="relative flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:border-blue-400 px-2 sm:px-3 py-1 rounded-lg transition-all shadow-2xs max-w-[130px] sm:max-w-[200px]">
            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <div className="flex flex-col text-left min-w-0">
              <span className="hidden sm:block text-[9px] font-extrabold uppercase tracking-wider text-gray-400 leading-none">
                College Tenant
              </span>
              <select
                value={currentTenant.id}
                onChange={handleSelectTenant}
                className="bg-transparent text-xs font-extrabold text-gray-800 cursor-pointer outline-none border-none p-0 pr-3 sm:pr-4 focus:ring-0 truncate w-full"
              >
                {collegeTenantsList.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 sm:right-2 top-2.5 sm:top-3 pointer-events-none" />
          </div>
        )}

        {/* Globe icon to visit storefront */}
        <button 
          type="button"
          onClick={onToggleViewMode}
          className="p-1.5 sm:p-2 hover:bg-blue-50 rounded-lg text-gray-700 hover:text-blue-600 transition-colors cursor-pointer relative group"
          title="Visit Website"
        >
          <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Visit Website
          </span>
        </button>

        {/* User Avatar Circle & Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button 
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0f2748] text-white flex items-center justify-center text-xs sm:text-sm font-semibold shadow-xs select-none cursor-pointer hover:ring-2 hover:ring-blue-500/50 hover:opacity-95 transition-all"
            title="Account Menu"
          >
            {currentUser?.name ? (
              currentUser.name.includes('Anita') ? 'AV' :
              currentUser.name.includes('Rajesh') ? 'RS' :
              currentUser.name.includes('Vikram') ? 'VM' : 'SJ'
            ) : 'SJ'}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 sm:w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">{currentUser?.name || 'Shruti Jog'}</p>
                <p className="text-[11px] text-gray-500 font-mono truncate">{currentUser?.email || 'admin@college.edu'}</p>
                <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                  {currentUser?.role || 'Administrator'}
                </span>
              </div>

              {/* Mobile Portal Switcher inside dropdown */}
              <div className="xl:hidden py-1 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onSwitchPortalRole) onSwitchPortalRole('collegeadmin');
                    if (onSelectModule) onSelectModule('dashboard', 'Dashboard');
                  }}
                  className={`w-full px-4 py-2 text-left text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    !isSuperadmin ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>College Admin Panel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onSwitchPortalRole) onSwitchPortalRole('superadmin');
                    if (onSelectModule) onSelectModule('module-studio', 'Module Studio');
                  }}
                  className={`w-full px-4 py-2 text-left text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    isSuperadmin ? 'bg-amber-50 text-amber-800 font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>WhiteCode Master Console</span>
                </button>
              </div>

              <div className="py-1">
                {onToggleViewMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onToggleViewMode();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-gray-500" />
                    <span>Visit Public Website</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    if (onLogout) onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
