import React, { useState, useEffect } from 'react';
import { Menu, Globe, Building2, ChevronDown } from 'lucide-react';
import { collegeTenantsList, getActiveTenant, setActiveTenantId, CollegeTenant } from '../../data/tenantData';

interface HeaderProps {
  toggleSidebar: () => void;
  onToggleViewMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, onToggleViewMode }) => {
  const [currentTenant, setCurrentTenant] = useState<CollegeTenant>(getActiveTenant());

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
      {/* Left: College Emblem / Logo (Adapts dynamically to Tenant) */}
      <div className="flex items-center gap-3">
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

        <div>
          <h1 className="text-sm font-extrabold text-gray-900 leading-tight flex items-center gap-2">
            {currentTenant.name}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              SaaS Tenant
            </span>
          </h1>
          <p className="text-[11px] text-gray-500 font-medium">{currentTenant.subtitle}</p>
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-4 text-gray-600">
        {/* Multi-Tenant Switcher Dropdown */}
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
          title="Visit Website"
        >
          <Globe className="w-5 h-5" />
          <span className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Visit Website
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
