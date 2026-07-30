import React from 'react';
import { Home } from 'lucide-react';

interface ModulePlaceholderProps {
  moduleId: string;
  moduleLabel: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  moduleLabel
}) => {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Home className="w-3.5 h-3.5 text-gray-600" />
        <span>/</span>
        <span className="text-gray-800 font-semibold">{moduleLabel}</span>
      </div>

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{moduleLabel}</h1>
      </div>

      {/* Main Content Box for Module */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xs min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold">🛠️</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{moduleLabel} Module Shell Ready</h3>
        <p className="text-sm text-gray-500 max-w-md">
          This container is ready for building your new custom module. Tell me what features, fields, or functionality you need here!
        </p>
      </div>
    </div>
  );
};
