import React, { useState, useEffect } from 'react';
import { Menu, Globe, Building2, ChevronDown, ShieldCheck, Layers, FileText, Wrench, FileSpreadsheet } from 'lucide-react';
import { collegeTenantsList, getActiveTenant, setActiveTenantId, CollegeTenant } from '../../data/tenantData';

interface HeaderProps {
  toggleSidebar: () => void;
  onToggleViewMode?: () => void;
  onSelectModule?: (id: string, label: string) => void;
  portalRole?: 'superadmin' | 'collegeadmin';
  onSwitchPortalRole?: (role: 'superadmin' | 'collegeadmin') => void;
  collegeSubRole?: 'tech_configurator' | 'data_entry';
  onSwitchCollegeSubRole?: (role: 'tech_configurator' | 'data_entry') => void;
}

export const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  onToggleViewMode,
  onSelectModule,
  portalRole = 'superadmin',
  onSwitchPortalRole,
  collegeSubRole = 'tech_configurator',
  onSwitchCollegeSubRole,
}) => {
  const [currentTenant, setCurrentTenant] = useState<CollegeTenant>(getActiveTenant());
  const isSuperadmin = portalRole === 'superadmin';

  useEffect(() => {
    const handleTenantChange = () => {
      setCurrentTenant(getActiveTenant());
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, []);

  const handleSelectTenant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveTenantId(e.target.value);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Branding Logo & Title (Adapts dynamically to Role: CMS vs College) */}
      <div className="flex items-center gap-3">
        {isSuperadmin ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 via-indigo-950 to-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-md border border-amber-500/30">
            CMS
          </div>
        ) : (
          <div 
            className="w-10 h-10 rounded-full border flex items-center justify-center p-1 bg-white shadow-xs transition-colors"
            style={{ borderColor: `${currentTenant.primaryColor}40` }}
          >
            {currentTenant.logoType === 'lady-irwin' && (
              <svg className="w-8 h-8" style={{ color: currentTenant.primaryColor }} viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
                <path d="M50 20 L60 40 L40 40 Z" fill="currentColor" />
                <circle cx="50" cy="55" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                <path d="M35 75 C45 68 55 68 65 75" fill="none" stroke="currentColor" strokeWidth="3" />
                <text x="50" y="92" fontSize="9" textAnchor="middle" fontWeight="bold" fill="currentColor">LADY IRWIN</text>
              </svg>
            )}

            {currentTenant.logoType === 'kvk-leaf' && (
              <div className="w-7 h-7 rounded-full bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold text-xs">
                🌾
              </div>
            )}

            {currentTenant.logoType === 'university-crest' && (
              <div className="w-7 h-7 rounded-full bg-rose-900 text-rose-100 flex items-center justify-center font-bold text-xs">
                🏛️
              </div>
            )}
          </div>
        )}

        <div>
          <h1 className="text-sm font-extrabold text-gray-900 leading-tight flex items-center gap-2">
            {isSuperadmin ? 'CMS Platform' : currentTenant.name}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isSuperadmin ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {isSuperadmin ? 'Superadmin Mode' : 'College Tenant'}
            </span>
          </h1>
          {!isSuperadmin && (
            <p className="text-[11px] text-gray-500 font-medium">
              {currentTenant.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center Portal Switcher Pill Bar */}
      <div className="hidden lg:flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-2xs">
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
          👑 Superadmin Portal
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

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-4 text-gray-600">
        {/* Multi-Tenant Switcher Dropdown (Only visible in College Admin Mode) */}
        {isSuperadmin ? (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-800 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Scope:
            </span>
            <span className="text-xs font-black text-amber-900 flex items-center gap-1">
              🌐 All Colleges (Global)
            </span>
          </div>
        ) : (
          <div className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 hover:border-blue-400 px-3 py-1 rounded-lg transition-all shadow-2xs">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 leading-none">
                College Tenant
              </span>
              <select
                value={currentTenant.id}
                onChange={handleSelectTenant}
                className="bg-transparent text-xs font-extrabold text-gray-800 cursor-pointer outline-none border-none p-0 pr-4 focus:ring-0"
              >
                {collegeTenantsList.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-3 pointer-events-none" />
          </div>
        )}

        <button 
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-gray-100 rounded-md text-gray-700 transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button 
          type="button"
          onClick={onToggleViewMode}
          className="p-1.5 hover:bg-blue-50 rounded-md text-gray-700 hover:text-blue-600 transition-colors cursor-pointer relative group"
          title="Visit Storefront"
        >
          <Globe className="w-5 h-5" />
          <span className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Visit Storefront
          </span>
        </button>

        {/* User Avatar Circle */}
        <div 
          className="w-9 h-9 rounded-full bg-[#0f2748] text-white flex items-center justify-center text-sm font-semibold shadow-xs select-none cursor-pointer hover:opacity-95 transition-opacity"
        >
          SJ
        </div>
      </div>
    </header>
  );
};
