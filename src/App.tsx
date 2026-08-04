import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import PublicStoreApp from './components/storefront/PublicStoreApp';

export function App() {
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Preview Mode Switcher */}
      <div className="bg-gray-900 text-white text-xs py-2 px-6 flex items-center justify-between z-50 sticky top-0 border-b border-gray-800 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-gray-200">
            Preview Mode: <strong className="text-amber-400">{viewMode === 'storefront' ? '🌐 Public Storefront (Customer Flow)' : '⚙️ Admin Dashboard'}</strong>
          </span>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'storefront' ? 'admin' : 'storefront')}
          className="bg-[#f37021] hover:bg-orange-600 text-white text-xs font-extrabold px-3.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span>Switch to {viewMode === 'storefront' ? '⚙️ Admin Dashboard' : '🌐 Public Storefront'}</span>
        </button>
      </div>

      <div className="flex-1">
        {viewMode === 'storefront' ? <PublicStoreApp /> : <Layout />}
      </div>
    </div>
  );
}

export default App;

