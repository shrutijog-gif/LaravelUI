import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Plus, 
  Save, 
  Check, 
  Sparkles, 
  ArrowUpRight, 
  FileText, 
  Award, 
  BookOpen, 
  Layers, 
  Sliders, 
  Eye, 
  RotateCcw,
  CheckCircle2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { CardPresetView } from './CardPresetView';
import { 
  CardSlotConfig, 
  getStoredCardPresets, 
  saveCardPreset, 
  createNewCardPreset 
} from '../../../utils/cardPresets';
import { getActiveTenant } from '../../../data/tenantData';

// Sample datasets representing user's real screenshots
const SAMPLES = {
  affiliation: {
    title: 'UGC Affiliation',
    recipient: 'University Grants Commission',
    year: 'Active',
    category: 'Accreditation',
    logoText: 'UGC',
    pdf_url: 'https://example.com/ugc.pdf',
  },
  results: {
    title: 'Results & Toppers',
    recipient: 'Official Final Results & Batch Toppers',
    year: '2023-24',
    category: 'Academic Results',
    logoText: 'EXAM',
    pdf_url: 'https://example.com/results.pdf',
  },
  reports: {
    title: '93rd Annual Report 2024-25',
    recipient: 'Annual Academic & Financial Report',
    year: '2024-25',
    category: 'Official Report',
    logoText: 'PDF',
    pdf_url: 'https://example.com/report.pdf',
  },
};

export const CardBuilderStudio: React.FC = () => {
  const activeTenant = getActiveTenant();
  const [presets, setPresets] = useState<CardSlotConfig[]>(getStoredCardPresets);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('style-1');
  const [activeSample, setActiveSample] = useState<'affiliation' | 'results' | 'reports'>('affiliation');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activePreset = presets.find(p => p.id === selectedPresetId) || presets[0];
  const sampleData = SAMPLES[activeSample];

  useEffect(() => {
    const handleUpdate = () => {
      setPresets(getStoredCardPresets());
    };
    window.addEventListener('card-presets-updated', handleUpdate);
    return () => window.removeEventListener('card-presets-updated', handleUpdate);
  }, []);

  const handleUpdatePreset = (updates: Partial<CardSlotConfig>) => {
    const updated = { ...activePreset, ...updates };
    const newList = presets.map(p => p.id === updated.id ? updated : p);
    setPresets(newList);
  };

  const handleSave = () => {
    saveCardPreset(activePreset);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateNew = () => {
    const newPreset = createNewCardPreset();
    saveCardPreset(newPreset);
    setPresets(getStoredCardPresets());
    setSelectedPresetId(newPreset.id);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 bg-white rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider flex items-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5" /> Developers Area
            </span>
            <span className="text-gray-500 text-xs">• Active Tenant: <strong className="text-gray-900">{activeTenant.name}</strong></span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Visual Card Builder & Slot Mapper</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure card layouts (Affiliation Cards, Results, Annual Reports), map field variables, and create custom card presets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNew}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 border border-gray-300 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-blue-600" /> New Card Style
          </button>
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 ${
              savedSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" /> Saved System-wide!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Preset
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Preset Selector List (3 cols) */}
        <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <Layers className="w-4 h-4 text-blue-600" /> Card Style Presets
          </h3>

          <div className="space-y-2 pt-1">
            {presets.map(preset => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {preset.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Live Interactive Card Canvas (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/80 p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Live Card Canvas</h3>
            </div>
            
            {/* Sample Data Switcher */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200 text-[11px] font-semibold">
              <button
                onClick={() => setActiveSample('affiliation')}
                className={`px-2 py-1 rounded ${activeSample === 'affiliation' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Affiliation
              </button>
              <button
                onClick={() => setActiveSample('results')}
                className={`px-2 py-1 rounded ${activeSample === 'results' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Results
              </button>
              <button
                onClick={() => setActiveSample('reports')}
                className={`px-2 py-1 rounded ${activeSample === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Reports
              </button>
            </div>
          </div>

          {/* Interactive Live Card Render */}
          <div className="flex-1 flex items-center justify-center p-4">
            <CardPresetView preset={activePreset} sampleData={sampleData} />
          </div>
        </div>

        {/* Right Column: Slot Mapper & Controls (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4 max-h-[750px] overflow-y-auto">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <Sliders className="w-4 h-4 text-blue-600" /> Slot Mapper & Visual Controls
          </h3>

          <div className="space-y-4 text-xs">
            {/* 1. Preset Name */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Preset Title</label>
              <input
                type="text"
                value={activePreset.name}
                onChange={(e) => handleUpdatePreset({ name: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-medium focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* 2. Accent Position & Style */}
            <div className="border border-gray-100 p-3 rounded-xl bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-gray-800">Accent</label>
                <input
                  type="checkbox"
                  checked={activePreset.showTopAccent}
                  onChange={(e) => handleUpdatePreset({ showTopAccent: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>
              {activePreset.showTopAccent && (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="text-[11px] text-gray-500 font-semibold mb-1 block">Accent Sides</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { key: 'top', label: 'Top' },
                        { key: 'bottom', label: 'Bottom' },
                        { key: 'left', label: 'Left' },
                        { key: 'right', label: 'Right' },
                      ].map((side) => {
                        const currentSides = activePreset.accentSides || {
                          top: activePreset.accentPosition === 'top' || activePreset.accentPosition === 'all' || Boolean(activePreset.showTopAccent),
                          bottom: activePreset.accentPosition === 'bottom' || activePreset.accentPosition === 'all',
                          left: activePreset.accentPosition === 'left' || activePreset.accentPosition === 'all',
                          right: activePreset.accentPosition === 'right' || activePreset.accentPosition === 'all',
                        };
                        const isActive = currentSides[side.key as keyof typeof currentSides];

                        const toggleSide = () => {
                          const updatedSides = { ...currentSides, [side.key]: !isActive };
                          handleUpdatePreset({ accentSides: updatedSides });
                        };

                        return (
                          <button
                            key={side.key}
                            type="button"
                            onClick={toggleSide}
                            className={`py-1 px-1 text-[11px] font-semibold rounded border transition-all text-center ${
                              isActive
                                ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {side.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-500 font-semibold mb-1 block">Accent Thickness</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[2, 4, 6].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => handleUpdatePreset({ accentWidth: w })}
                          className={`py-1 px-1 text-[11px] font-semibold rounded border transition-all text-center ${
                            (activePreset.accentWidth || 4) === w
                              ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {w}px
                        </button>
                      ))}
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={![2, 4, 6].includes(activePreset.accentWidth) ? activePreset.accentWidth : ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              handleUpdatePreset({ accentWidth: val });
                            } else if (e.target.value === '') {
                              handleUpdatePreset({ accentWidth: 4 });
                            }
                          }}
                          className={`w-full py-1 pl-1.5 pr-4 text-[11px] font-semibold rounded border text-center outline-none transition-all placeholder:text-gray-400 ${
                            ![2, 4, 6].includes(activePreset.accentWidth)
                              ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                          placeholder="Custom"
                          title="Custom border thickness in pixels"
                        />
                        {![2, 4, 6].includes(activePreset.accentWidth) && (
                          <span className="absolute right-1 text-[9px] font-mono text-white/80 pointer-events-none">px</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={activePreset.accentColor}
                      onChange={(e) => handleUpdatePreset({ accentColor: e.target.value })}
                      className="w-7 h-7 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activePreset.accentColor}
                      onChange={(e) => handleUpdatePreset({ accentColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Top Badge Slot */}
            <div className="border border-gray-100 p-3 rounded-xl bg-gray-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-gray-800">Top Badge Slot</label>
                <input
                  type="checkbox"
                  checked={activePreset.badgeSlot.enabled}
                  onChange={(e) => handleUpdatePreset({
                    badgeSlot: { ...activePreset.badgeSlot, enabled: e.target.checked }
                  })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>
              {activePreset.badgeSlot.enabled && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[11px] text-gray-500">Mapped Field Variable</label>
                    <input
                      type="text"
                      value={activePreset.badgeSlot.fieldVar}
                      onChange={(e) => handleUpdatePreset({
                        badgeSlot: { ...activePreset.badgeSlot, fieldVar: e.target.value }
                      })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                      placeholder="{year} or {status}"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Media Box Slot */}
            <div className="border border-gray-100 p-3 rounded-xl bg-gray-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-gray-800">Media / Logo Box Slot</label>
                <input
                  type="checkbox"
                  checked={activePreset.mediaSlot.enabled}
                  onChange={(e) => handleUpdatePreset({
                    mediaSlot: { ...activePreset.mediaSlot, enabled: e.target.checked }
                  })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>
              {activePreset.mediaSlot.enabled && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[11px] text-gray-500">Media Box Content Type</label>
                    <select
                      value={activePreset.mediaSlot.type}
                      onChange={(e) => handleUpdatePreset({
                        mediaSlot: { ...activePreset.mediaSlot, type: e.target.value as any }
                      })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="logo">Logo Text Box (e.g. UGC, DU)</option>
                      <option value="icon">Award / Document Icon</option>
                      <option value="image">Full Image Preview</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Footer Action Slot */}
            <div className="border border-gray-100 p-3 rounded-xl bg-gray-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-gray-800">Footer Action Link Slot</label>
                <input
                  type="checkbox"
                  checked={activePreset.footerRightSlot.enabled}
                  onChange={(e) => handleUpdatePreset({
                    footerRightSlot: { ...activePreset.footerRightSlot, enabled: e.target.checked }
                  })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>
              {activePreset.footerRightSlot.enabled && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[11px] text-gray-500">Action Label Text</label>
                    <input
                      type="text"
                      value={activePreset.footerRightSlot.label}
                      onChange={(e) => handleUpdatePreset({
                        footerRightSlot: { ...activePreset.footerRightSlot, label: e.target.value }
                      })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      placeholder="Open PDF or View Result"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
