import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Code2, 
  FileCode, 
  Save, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Settings, 
  Globe, 
  HardDrive,
  Copy
} from 'lucide-react';
import { getActiveTenant, CollegeTenant } from '../../../data/tenantData';
import { 
  getTenantTemplateData, 
  saveTenantTemplateData, 
  TenantTemplateData 
} from '../../../data/tenantTemplateStorage';

interface WebsiteAppearanceViewProps {
  onOpenImporter?: () => void;
  onOpenFileManager?: () => void;
}

export const WebsiteAppearanceView: React.FC<WebsiteAppearanceViewProps> = ({ 
  onOpenImporter,
  onOpenFileManager
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'css' | 'js' | 'analytics' | 'cdn' | 'design'>('css');
  const [tenant, setTenant] = useState<CollegeTenant>(getActiveTenant());
  const [templateData, setTemplateData] = useState<TenantTemplateData>(() => getTenantTemplateData());
  const [cssCode, setCssCode] = useState(templateData.customCss);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const active = getActiveTenant();
      setTenant(active);
      const data = getTenantTemplateData(active.id);
      setTemplateData(data);
      setCssCode(data.customCss);
    };
    window.addEventListener('tenant-template-updated', handleUpdate);
    window.addEventListener('tenant-changed', handleUpdate);
    return () => {
      window.removeEventListener('tenant-template-updated', handleUpdate);
      window.removeEventListener('tenant-changed', handleUpdate);
    };
  }, []);

  const handleSaveCss = () => {
    const updated = saveTenantTemplateData({ customCss: cssCode }, tenant.id);
    setTemplateData(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const cssLines = cssCode.split('\n');

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Appearance</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage global theme styling, CSS tokens, branding variables, and scripts for <span className="font-semibold text-blue-600">{tenant.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenImporter && (
            <button
              onClick={onOpenImporter}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Convert Design (AI)</span>
            </button>
          )}

          {onOpenFileManager && (
            <button
              onClick={onOpenFileManager}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold border border-gray-300"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              <span>Website Assets</span>
            </button>
          )}

          <a
            href="?mode=storefront"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold border border-gray-300"
          >
            <span>View Website</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Main Appearance Layout with Left Sub-Tabs (matching css.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-Navigation Tabs */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
            <button
              onClick={() => setActiveSubTab('basic')}
              className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                activeSubTab === 'basic' 
                  ? 'bg-blue-50/70 text-blue-700 border-l-4 border-blue-600 font-semibold' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>Basic Settings</span>
            </button>

            <button
              onClick={() => setActiveSubTab('css')}
              className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                activeSubTab === 'css' 
                  ? 'bg-blue-50/70 text-blue-700 border-l-4 border-blue-600 font-semibold' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>Global Css</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            <button
              onClick={() => setActiveSubTab('js')}
              className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                activeSubTab === 'js' 
                  ? 'bg-blue-50/70 text-blue-700 border-l-4 border-blue-600 font-semibold' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>Custom Javascript</span>
            </button>

            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                activeSubTab === 'analytics' 
                  ? 'bg-blue-50/70 text-blue-700 border-l-4 border-blue-600 font-semibold' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>Google Analytics</span>
            </button>

            <button
              onClick={() => setActiveSubTab('cdn')}
              className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                activeSubTab === 'cdn' 
                  ? 'bg-blue-50/70 text-blue-700 border-l-4 border-blue-600 font-semibold' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>CDN Links</span>
            </button>

            <button
              onClick={() => setActiveSubTab('design')}
              className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                activeSubTab === 'design' 
                  ? 'bg-blue-50/70 text-blue-700 border-l-4 border-blue-600 font-semibold' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>Design Settings</span>
            </button>
          </div>
        </div>

        {/* Right Content Editor Card */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-gray-200 shadow-xs p-6">
          {activeSubTab === 'css' ? (
            <div className="space-y-4">
              {/* Header row with 'You are editing' badge and Save button */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-gray-900">Global CSS Editor</h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✏️ You are editing
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Global CSS changes apply to the entire website storefront and components.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {saveSuccess && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Changes Applied Live!
                    </span>
                  )}
                  <button
                    onClick={handleSaveCss}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>

              {/* Line-numbered Code Editor matching screenshot css.png */}
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-[#fafafa] flex font-mono text-[13px] leading-relaxed">
                {/* Line Numbers Gutter */}
                <div className="bg-gray-100/80 text-gray-400 select-none py-3 px-3 border-r border-gray-200 text-right min-w-[44px]">
                  {cssLines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Textarea Editor */}
                <div className="flex-1 relative">
                  <textarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    className="w-full h-[520px] p-3 bg-transparent text-gray-800 focus:outline-none resize-none font-mono text-[13px] leading-relaxed overflow-auto"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="text-[11px] text-gray-400 flex items-center justify-between pt-2">
                <span>Variables: <code className="text-blue-600">--color-primary</code>, <code className="text-teal-600">--color-secondary</code>, <code className="text-amber-600">--font-primary</code></span>
                <span>{cssLines.length} lines • CSS3 Engine</span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <Settings className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800 text-base">
                {activeSubTab.toUpperCase()} Configuration
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Configure your {activeSubTab} parameters, scripts, or token overrides for this tenant.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
