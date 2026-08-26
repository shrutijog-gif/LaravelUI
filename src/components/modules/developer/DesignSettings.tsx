import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Layers, 
  Code2, 
  Save, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Type, 
  Square, 
  Sliders, 
  Copy, 
  ExternalLink,
  ShieldAlert,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { DesignTokens, getDesignTokens, saveDesignTokens, DEFAULT_DESIGN_TOKENS } from '../../../utils/themeTokens';
import { getActiveTenant } from '../../../data/tenantData';

export const DesignSettings: React.FC = () => {
  const activeTenant = getActiveTenant();
  const [tokens, setTokens] = useState<DesignTokens>(getDesignTokens);
  const [activeTab, setActiveTab] = useState<'tokens' | 'primitives' | 'custom-css'>('tokens');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedClass, setCopiedClass] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTokens(getDesignTokens());
    };
    window.addEventListener('design-tokens-updated', handleUpdate);
    return () => window.removeEventListener('design-tokens-updated', handleUpdate);
  }, []);

  const handleSave = () => {
    saveDesignTokens(tokens);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset design system tokens to default values?')) {
      setTokens(DEFAULT_DESIGN_TOKENS);
      saveDesignTokens(DEFAULT_DESIGN_TOKENS);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClass(text);
    setTimeout(() => setCopiedClass(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Header Controls with Tabs & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 bg-white rounded-xl p-2 shadow-2xs">
        {/* Main Tab Navigation */}
        <div className="flex-1 flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex-1 py-2.5 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'tokens'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <Palette className="w-4 h-4" /> 1. Brand & Design Tokens
          </button>
          <button
            onClick={() => setActiveTab('primitives')}
            className={`flex-1 py-2.5 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'primitives'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <Layers className="w-4 h-4" /> 2. Component Primitives
          </button>
          <button
            onClick={() => setActiveTab('custom-css')}
            className={`flex-1 py-2.5 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'custom-css'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <Code2 className="w-4 h-4" /> 3. Custom Utility CSS
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 border border-gray-300 transition-all flex items-center gap-1.5"
            title="Reset to default tokens"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              savedSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Tokens
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Brand & Design Tokens */}
      {activeTab === 'tokens' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colors Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Color Palette Tokens</h3>
                <p className="text-xs text-gray-500">Configure your website's primary theme and brand colors</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Primary Brand Color</label>
                <p className="text-[11px] text-gray-500 mb-1.5">Used for major elements like website headers, primary buttons, and card title accents.</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={tokens.primaryColor}
                    onChange={(e) => setTokens({ ...tokens, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={tokens.primaryColor}
                    onChange={(e) => setTokens({ ...tokens, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-semibold"
                  />
                  <button
                    onClick={() => setTokens({ ...tokens, primaryColor: activeTenant.primaryColor })}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-[11px] font-semibold text-gray-700"
                    title="Sync with active tenant primary color"
                  >
                    Match Tenant
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Secondary Brand Color</label>
                <p className="text-[11px] text-gray-500 mb-1.5">Used for table headers, sub-menus, and secondary buttons.</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={tokens.secondaryColor}
                    onChange={(e) => setTokens({ ...tokens, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={tokens.secondaryColor}
                    onChange={(e) => setTokens({ ...tokens, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-semibold"
                  />
                  <button
                    onClick={() => setTokens({ ...tokens, secondaryColor: activeTenant.secondaryColor })}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-[11px] font-semibold text-gray-700"
                    title="Sync with active tenant secondary color"
                  >
                    Match Tenant
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Accent / Highlight Color</label>
                <p className="text-[11px] text-gray-500 mb-1.5">Used for badges, notification pills, and highlighted links.</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={tokens.accentColor}
                    onChange={(e) => setTokens({ ...tokens, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={tokens.accentColor}
                    onChange={(e) => setTokens({ ...tokens, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Background Neutral Surface</label>
                <p className="text-[11px] text-gray-500 mb-1.5">Used for section background colors behind cards and modules.</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={tokens.neutralBg}
                    onChange={(e) => setTokens({ ...tokens, neutralBg: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={tokens.neutralBg}
                    onChange={(e) => setTokens({ ...tokens, neutralBg: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Geometry Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Typography & Structural Tokens</h3>
                <p className="text-xs text-gray-500">Border-radius, typography scale, and button shapes</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Font Family</label>
                <select
                  value={tokens.fontFamily}
                  onChange={(e) => setTokens({ ...tokens, fontFamily: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Inter">Inter (Clean Modern Sans-Serif)</option>
                  <option value="Roboto">Roboto (Google Standard)</option>
                  <option value="Outfit">Outfit (Geometric & Elegant)</option>
                  <option value="Playfair Display">Playfair Display (Academic Serif)</option>
                  <option value="system-ui">System UI Native</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Corner Radius Preset (`--ds-border-radius`)</label>
                <div className="grid grid-cols-6 gap-2">
                  {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTokens({ ...tokens, borderRadius: r })}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        tokens.borderRadius === r
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Box Shadow Level</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTokens({ ...tokens, boxShadow: s })}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        tokens.boxShadow === s
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Button Shape Variant</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'rounded', label: 'Rounded (8px)' },
                    { id: 'pill', label: 'Pill (Full Round)' },
                    { id: 'sharp', label: 'Sharp (Square)' },
                  ].map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setTokens({ ...tokens, buttonStyle: variant.id as any })}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                        tokens.buttonStyle === variant.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {variant.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Component Primitives Specimen Gallery */}
      {activeTab === 'primitives' && (
        <div className="space-y-6">
          {/* Buttons Specimen */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> Button Primitives Driven by Active Tokens
            </h3>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                style={{
                  backgroundColor: tokens.primaryColor,
                  borderRadius: tokens.borderRadius === 'full' ? '9999px' : tokens.borderRadius === 'sharp' ? '0' : '0.5rem',
                }}
                className="px-5 py-2.5 text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity"
              >
                Primary Button
              </button>
              <button
                style={{
                  backgroundColor: tokens.secondaryColor,
                  borderRadius: tokens.borderRadius === 'full' ? '9999px' : tokens.borderRadius === 'sharp' ? '0' : '0.5rem',
                }}
                className="px-5 py-2.5 text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity"
              >
                Secondary Button
              </button>
              <button
                style={{
                  borderColor: tokens.primaryColor,
                  color: tokens.primaryColor,
                  borderRadius: tokens.borderRadius === 'full' ? '9999px' : tokens.borderRadius === 'sharp' ? '0' : '0.5rem',
                }}
                className="px-5 py-2.5 border-2 font-semibold text-sm hover:bg-blue-50 transition-colors"
              >
                Outline Button
              </button>
              <button
                style={{
                  backgroundColor: tokens.accentColor,
                  borderRadius: tokens.borderRadius === 'full' ? '9999px' : tokens.borderRadius === 'sharp' ? '0' : '0.5rem',
                }}
                className="px-5 py-2.5 text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
              >
                Accent Action
              </button>
            </div>
          </div>

          {/* Cards & Tables Layout Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Style Preview */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                Card Primitive Preview (Style 1 Classic)
              </h3>
              <div 
                style={{ borderRadius: tokens.borderRadius === 'full' ? '1.5rem' : '0.75rem' }}
                className="border border-gray-200 bg-white p-5 space-y-3 shadow-md transition-all hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span 
                    style={{ backgroundColor: tokens.primaryColor }}
                    className="text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                  >
                    Category Badge
                  </span>
                  <span className="text-xs text-gray-400 font-mono">2026-27</span>
                </div>
                <h4 style={{ color: tokens.textColor }} className="font-bold text-base">
                  Sample Dynamic Card Title
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2">
                  This card dynamically inherits the primary token color, corner radius scale, and font families configured in the Design Settings.
                </p>
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <span style={{ color: tokens.primaryColor }} className="text-xs font-bold flex items-center gap-1">
                    View Details →
                  </span>
                </div>
              </div>
            </div>

            {/* Table Style Preview */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                Table Primitive Preview (Table Style 1)
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead style={{ backgroundColor: tokens.secondaryColor }} className="text-white uppercase font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Title</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-800">Academic Schedule v1</td>
                      <td className="px-4 py-3 text-gray-600">Timetable</td>
                      <td className="px-4 py-3 text-right">
                        <span style={{ color: tokens.primaryColor }} className="font-bold cursor-pointer">Download</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-800">Green Campus Award</td>
                      <td className="px-4 py-3 text-gray-600">Achievement</td>
                      <td className="px-4 py-3 text-right">
                        <span style={{ color: tokens.primaryColor }} className="font-bold cursor-pointer">View</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Custom Utility CSS & Classes */}
      {activeTab === 'custom-css' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600" /> Custom Global Utility CSS Editor
              </h3>
              <p className="text-xs text-gray-500">
                Write global CSS classes here. Styles defined below are automatically injected into the app DOM and made available in Puck Builder!
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <textarea
              rows={12}
              value={tokens.customCss}
              onChange={(e) => setTokens({ ...tokens, customCss: e.target.value })}
              className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-inner leading-relaxed"
              placeholder="/* Add custom CSS rules here */"
            />

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-950 space-y-1">
                <p className="font-bold">Tip for Developers:</p>
                <p>
                  Any CSS class defined above (e.g. <code className="bg-white border border-blue-200 px-1.5 py-0.5 rounded font-mono text-blue-700">.glass-glow-card</code> or <code className="bg-white border border-blue-200 px-1.5 py-0.5 rounded font-mono text-blue-700">.gradient-text-accent</code>) can be entered directly into the <strong>custom-class</strong> property input of any Puck block or Module Studio card.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
