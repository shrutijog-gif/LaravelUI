import React from 'react';
import { DisplayBlockConfig, ViewMode, CardStylePreset, TableStylePreset } from '../../../../types/moduleStudio';
import { LayoutGrid, Table, Sliders, Sparkles, Check, Search, Filter } from 'lucide-react';

interface StudioLayoutCanvasProps {
  config: DisplayBlockConfig;
  onChange: (updatedConfig: DisplayBlockConfig) => void;
}

export const StudioLayoutCanvas: React.FC<StudioLayoutCanvasProps> = ({ config, onChange }) => {
  const handleUpdate = (updates: Partial<DisplayBlockConfig>) => {
    onChange({ ...config, ...updates });
  };

  const cardStyleOptions: { id: CardStylePreset; name: string; desc: string }[] = [
    { id: 'style-1', name: 'Style 1: Elevated Cards', desc: 'White card with subtle border shadow & blue primary accents.' },
    { id: 'style-2', name: 'Style 2: Minimalist Bordered', desc: 'Flat border with clean tag badges and soft hover transitions.' },
    { id: 'style-3', name: 'Style 3: Gradient Accent', desc: 'Gradient top header banner with highlighted metadata tags.' },
    { id: 'style-4', name: 'Style 4: Compact Grid', desc: 'Dense compact card layout for high-density listing.' },
  ];

  const tableStyleOptions: { id: TableStylePreset; name: string; desc: string }[] = [
    { id: 'table-1', name: 'Table 1: Classic Clean Table', desc: 'Traditional clean light table with soft gray headers.' },
    { id: 'table-2', name: 'Table 2: Bordered Row Cards', desc: 'Separated row card bars with right-aligned action buttons.' },
    { id: 'table-3', name: 'Table 3: Modern Gradient Header', desc: 'Vibrant blue-indigo gradient header bar with bold column labels.' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. View Mode Selection */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <LayoutGrid className="w-4 h-4 text-blue-600" />
          Primary Storefront Display Mode
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => handleUpdate({ defaultView: 'card' })}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              config.defaultView === 'card'
                ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className={`p-2.5 rounded-lg shrink-0 ${config.defaultView === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-sm text-gray-900">Card Grid View</h5>
                {config.defaultView === 'card' && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Renders items as visually rich responsive cards with images, tags, and action buttons.</p>
            </div>
          </div>

          <div
            onClick={() => handleUpdate({ defaultView: 'table' })}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              config.defaultView === 'table'
                ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className={`p-2.5 rounded-lg shrink-0 ${config.defaultView === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Table className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-sm text-gray-900">Data Table View</h5>
                {config.defaultView === 'table' && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Renders items in structured data table rows with high-density column sorting.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Preset Chooser */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600" />
          {config.defaultView === 'card' ? 'Card Style Presets' : 'Table Style Presets'}
        </h4>

        {config.defaultView === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cardStyleOptions.map(style => (
              <div
                key={style.id}
                onClick={() => handleUpdate({ cardStyle: style.id })}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                  config.cardStyle === style.id
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div>
                  <h6 className="font-bold text-xs text-gray-900">{style.name}</h6>
                  <p className="text-[11px] text-gray-500 mt-0.5">{style.desc}</p>
                </div>
                {config.cardStyle === style.id && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tableStyleOptions.map(style => (
              <div
                key={style.id}
                onClick={() => handleUpdate({ tableStyle: style.id })}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                  config.tableStyle === style.id
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div>
                  <h6 className="font-bold text-xs text-gray-900">{style.name}</h6>
                  <p className="text-[11px] text-gray-500 mt-0.5">{style.desc}</p>
                </div>
                {config.tableStyle === style.id && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Controls & Action Options */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-blue-600" />
          Interactive Features & Layout Controls
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer bg-white">
            <input
              type="checkbox"
              checked={config.showSearch}
              onChange={e => handleUpdate({ showSearch: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center gap-1.5">
              <Search className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-800">Search Bar</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer bg-white">
            <input
              type="checkbox"
              checked={config.showCategoryFilter}
              onChange={e => handleUpdate({ showCategoryFilter: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-800">Category Filter</span>
            </div>
          </label>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Action Button Text</label>
            <input
              type="text"
              value={config.primaryActionLabel || 'View Details'}
              onChange={e => handleUpdate({ primaryActionLabel: e.target.value })}
              className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
