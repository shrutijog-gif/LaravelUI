import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Save, 
  ArrowLeft, 
  Code2, 
  Check, 
  Sparkles, 
  HardDrive, 
  ChevronDown, 
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { getActiveTenant, CollegeTenant } from '../../../data/tenantData';
import { 
  getTenantTemplateData, 
  saveTenantTemplateData, 
  TenantTemplateData,
  DEFAULT_VAZE_FOOTER_HTML 
} from '../../../data/tenantTemplateStorage';

interface FooterEditorViewProps {
  onBack?: () => void;
  onOpenImporter?: () => void;
  onOpenFileManager?: () => void;
}

export const FooterEditorView: React.FC<FooterEditorViewProps> = ({ 
  onBack,
  onOpenImporter,
  onOpenFileManager 
}) => {
  const [tenant, setTenant] = useState<CollegeTenant>(getActiveTenant());
  const [templateData, setTemplateData] = useState<TenantTemplateData>(() => getTenantTemplateData());
  const [footerCode, setFooterCode] = useState(templateData.footerHtml);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const active = getActiveTenant();
      setTenant(active);
      const data = getTenantTemplateData(active.id);
      setTemplateData(data);
      setFooterCode(data.footerHtml);
    };
    window.addEventListener('tenant-template-updated', handleUpdate);
    window.addEventListener('tenant-changed', handleUpdate);
    return () => {
      window.removeEventListener('tenant-template-updated', handleUpdate);
      window.removeEventListener('tenant-changed', handleUpdate);
    };
  }, []);

  const handleSaveChanges = () => {
    const updated = saveTenantTemplateData({ footerHtml: footerCode }, tenant.id);
    setTemplateData(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToDesignerDefault = () => {
    const updated = saveTenantTemplateData({ footerHtml: DEFAULT_VAZE_FOOTER_HTML }, tenant.id);
    setTemplateData(updated);
    setFooterCode(DEFAULT_VAZE_FOOTER_HTML);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Top Bar matching screenshot footer.png: 'Footer 4', 'Save Changes', 'Back' */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Footer 4</h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            {tenant.name}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenImporter && (
            <button
              onClick={onOpenImporter}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-xs"
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
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>View Website</span>
          </a>

          <button
            onClick={handleSaveChanges}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Footer HTML saved successfully! Storefront live website updated.
          </span>
          <a href="?mode=storefront" target="_blank" className="underline text-emerald-900 font-bold">
            View storefront →
          </a>
        </div>
      )}

      {/* Split View matching screenshot footer.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Preview */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-700">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              Live Footer Preview
            </span>
            <button
              onClick={handleResetToDesignerDefault}
              className="text-[11px] text-blue-600 hover:underline font-bold"
            >
              Reset to Authentic Designer Layout
            </button>
          </div>

          <div className="p-4 bg-gray-100/50 min-h-[480px] overflow-x-auto flex flex-col justify-start">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
              <div dangerouslySetInnerHTML={{ __html: footerCode }} />
            </div>
          </div>
        </div>

        {/* Right: RichText / Source Editor matching footer.png */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          {/* Section Header: 'Footer Settings - RichText' */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-800">
            <span>Footer Settings &bull; RichText</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>

          {/* Editor Toolbar matching WYSIWYG in screenshot */}
          <div className="border-b border-gray-200 bg-white p-2 flex flex-wrap items-center gap-1 text-xs text-gray-600">
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200 text-gray-400">
              <button className="px-1.5 py-1 hover:bg-gray-100 rounded text-gray-700">Edit</button>
              <button className="px-1.5 py-1 hover:bg-gray-100 rounded text-gray-700">View</button>
              <button className="px-1.5 py-1 hover:bg-gray-100 rounded text-gray-700">Insert</button>
              <button className="px-1.5 py-1 hover:bg-gray-100 rounded text-gray-700">Format</button>
              <button className="px-1.5 py-1 hover:bg-gray-100 rounded text-gray-700">Help</button>
            </div>

            <div className="flex items-center gap-1 pl-2">
              <button 
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800"
                title="Source Mode"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Source</span>
              </button>

              {onOpenFileManager && (
                <button 
                  onClick={onOpenFileManager}
                  className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 text-gray-700 rounded text-xs"
                  title="Insert Asset from File Manager"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Insert Image</span>
                </button>
              )}
            </div>
          </div>

          {/* Source HTML Editor Textarea */}
          <div className="p-3 bg-[#fafafa]">
            <textarea
              value={footerCode}
              onChange={(e) => setFooterCode(e.target.value)}
              className="w-full h-[520px] p-3 font-mono text-xs leading-relaxed bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto resize-none"
              spellCheck={false}
            />
          </div>

          {/* Footer bar */}
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>Campus Map: <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">/website-assets/vaze_campus_map.png</code></span>
            <button
              onClick={handleSaveChanges}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
