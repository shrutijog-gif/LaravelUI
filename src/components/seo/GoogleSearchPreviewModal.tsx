import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, Monitor, Smartphone, ExternalLink, MoreVertical } from 'lucide-react';
import { PageItem } from '../../types/page';
import { getActiveTenant } from '../../data/tenantData';

export interface GoogleSearchPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  page?: PageItem | null;
  brandName?: string;
  domainUrl?: string;
  title?: string;
  description?: string;
  url?: string;
  pageName?: string;
}

export const GoogleSearchPreviewModal: React.FC<GoogleSearchPreviewModalProps> = ({
  isOpen,
  onClose,
  page,
  brandName,
  domainUrl,
  title: propTitle,
  description: propDesc,
  url: propUrl,
  pageName: propPageName,
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const currentCollege = getActiveTenant()?.name || 'Lady Irwin College';
  const effectiveBrand = brandName || currentCollege;
  const pageTitle = page?.title || page?.name || propTitle || propPageName || 'Webpage';
  const displayTitle = propTitle || page?.seoTitle || `${pageTitle} | ${effectiveBrand}`;
  const displayDesc = propDesc || page?.description || page?.metaDescription || `Discover official details, syllabus guidelines, faculty directory, and admissions updates for ${pageTitle} at ${effectiveBrand}.`;

  const origin = typeof window !== 'undefined' && window.location && window.location.origin 
    ? window.location.origin 
    : 'http://localhost:5173';
  const baseDomain = (domainUrl || origin).replace(/\/+$/, '');
  const cleanSlug = (page?.slug || pageTitle).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
  const targetUrl = propUrl || page?.url || page?.customLink || `${baseDomain}/${cleanSlug.endsWith('.html') ? cleanSlug : `${cleanSlug}.html`}`;

  let displayHost = 'localhost:5173';
  let displayPath = `› ${cleanSlug}`;
  try {
    const parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `http://${targetUrl}`);
    displayHost = parsed.host;
    displayPath = parsed.pathname ? `› ${parsed.pathname.replace(/^\//, '').replace(/-/g, ' ')}` : `› ${cleanSlug}`;
  } catch {}

  return createPortal(
    <div className="fixed inset-0 z-[10002] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-2xl max-w-xl md:max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header (Matching Screenshot) */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Google Search Preview
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-mono">
              <span className="text-gray-500 font-sans font-medium">Target URL:</span>
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-blue-600 flex items-center gap-1 max-w-md truncate"
                title={`Open ${targetUrl}`}
              >
                <span>{targetUrl}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" />
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Matching Screenshot) */}
        <div className="p-6 space-y-4">
          
          {/* Section Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>GOOGLE SEARCH SERP LIVE PREVIEW</span>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  device === 'desktop'
                    ? 'bg-white shadow-2xs font-bold text-gray-900'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  device === 'mobile'
                    ? 'bg-white shadow-2xs font-bold text-gray-900'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Google SERP Snippet Box (Matching Screenshot) */}
          <div className={`p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs ${device === 'mobile' ? 'max-w-md mx-auto' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-[#1e40af] text-white flex items-center justify-center text-[10px] font-bold">
                  {(effectiveBrand || 'L').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 leading-tight">{effectiveBrand}</p>
                  <p className="text-[11px] text-gray-400 leading-tight truncate max-w-xs md:max-w-sm">
                    {displayHost} {displayPath}
                  </p>
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </div>

            <h3 className="text-[#1a0dab] hover:underline text-[16px] md:text-[17px] font-medium cursor-pointer leading-snug pt-0.5">
              {displayTitle}
            </h3>

            <p className="text-xs md:text-[13px] text-[#4d5156] mt-1.5 leading-relaxed">
              {displayDesc}
            </p>
          </div>

        </div>

        {/* Footer (Matching Screenshot) */}
        <div className="px-6 py-3.5 bg-gray-50/80 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
