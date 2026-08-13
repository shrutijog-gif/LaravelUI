import React, { useState } from 'react';
import { Puck, Render, usePuck } from '@measured/puck';
import '@measured/puck/puck.css';
import { config } from '../../puck.config';
import { History, ChevronDown, X, Eye, CheckCircle } from 'lucide-react';

const STORAGE_KEY = 'puck_saved_page_data';

const getSavedPuckData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading saved Puck data:', e);
  }
  return {
    content: [],
    root: {},
  };
};

interface PuckEditorProps {
  onBack?: () => void;
  pageName?: string;
}

// Inner Header Actions component that accesses live Puck state
const HeaderActions: React.FC<{
  onBack?: () => void;
  onViewPage: (data: any) => void;
}> = ({ onBack, onViewPage }) => {
  const { appState } = usePuck();
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  const handleViewPage = () => {
    onViewPage(appState.data);
  };

  return (
    <div className="flex items-center gap-3 text-sm ml-auto whitespace-nowrap relative">
      {showToast && (
        <div className="absolute -bottom-10 right-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 z-50">
          <CheckCircle className="w-4 h-4" /> Page Saved Successfully!
        </div>
      )}

      <button onClick={onBack} className="text-gray-700 hover:text-black font-medium transition-colors mr-2 cursor-pointer">
        Back
      </button>

      <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-1.5 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
        <span className="text-gray-500 text-xs">Breadcrumb:</span>
        <span className="text-xs font-medium text-gray-700">Title Top</span>
        <ChevronDown className="w-3 h-3 text-gray-500"/>
      </div>

      <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors bg-white">
        <History className="w-4 h-4"/> History
      </button>

      <button 
        type="button"
        onClick={handleViewPage} 
        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1a56db] text-white rounded hover:bg-blue-700 font-medium shadow-sm transition-colors cursor-pointer"
      >
        <Eye className="w-4 h-4" /> View Page
      </button>

      <button 
        type="button"
        onClick={handleSave} 
        className="px-5 py-1.5 bg-[#1a56db] text-white rounded hover:bg-blue-700 font-medium shadow-sm transition-colors cursor-pointer"
      >
        Save
      </button>
    </div>
  );
};

export const PuckEditor: React.FC<PuckEditorProps> = ({ onBack, pageName = 'Page' }) => {
  const [initialData] = useState(() => getSavedPuckData());
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = (data: any) => {
    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  return (
    <div className="h-screen w-full relative">
      <Puck 
        config={config} 
        data={initialData} 
        overrides={{
          headerActions: () => (
            <HeaderActions onBack={onBack} onViewPage={handleOpenPreview} />
          )
        }}
        onPublish={async (data) => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          handleOpenPreview(data);
        }} 
      />

      {/* Live Storefront Public Website View Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[999999] bg-gray-100 flex flex-col overflow-hidden">
          {/* Top Live Preview Header Bar */}
          <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between border-b border-gray-800 shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="font-bold text-sm text-white">🌐 Live Public Website View</span>
                <span className="text-xs text-gray-400 ml-2.5">({pageName} • Interactive view with active links & downloads)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-gray-700 cursor-pointer"
            >
              <X className="w-4 h-4" /> Close Preview
            </button>
          </div>

          {/* Render Actual Live Website Page */}
          <div className="flex-1 overflow-y-auto bg-gray-50 py-8 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-h-[650px] p-6 sm:p-10">
              <Render config={config} data={previewData || initialData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
