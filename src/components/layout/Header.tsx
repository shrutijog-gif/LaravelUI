import React from 'react';
import { Menu, Globe } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: College Emblem / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border border-blue-900/30 flex items-center justify-center p-1 bg-white shadow-xs">
          {/* Emblem representation seal matching Lady Irwin College logo */}
          <svg className="w-8 h-8 text-blue-900" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <path d="M50 20 L60 40 L40 40 Z" fill="currentColor" />
            <circle cx="50" cy="55" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
            <path d="M35 75 C45 68 55 68 65 75" fill="none" stroke="currentColor" strokeWidth="3" />
            <text x="50" y="92" fontSize="9" textAnchor="middle" fontWeight="bold" fill="currentColor">LADY IRWIN</text>
          </svg>
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-5 text-gray-600">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-gray-100 rounded-md text-gray-700 transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button 
          className="p-1.5 hover:bg-gray-100 rounded-md text-gray-700 transition-colors cursor-pointer"
          title="Language Selector"
        >
          <Globe className="w-5 h-5" />
        </button>

        {/* User Avatar Circle "SJ" */}
        <div className="w-9 h-9 rounded-full bg-[#0f2748] text-white flex items-center justify-center text-sm font-semibold shadow-xs select-none cursor-pointer hover:opacity-95 transition-opacity">
          SJ
        </div>
      </div>
    </header>
  );
};
