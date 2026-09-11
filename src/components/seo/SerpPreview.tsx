import React, { useState } from 'react';
import { Eye, Monitor, Smartphone, Globe, MoreVertical, Sparkles } from 'lucide-react';
import { getActiveTenant } from '../../data/tenantData';

export interface SerpPreviewProps {
  title: string;
  description: string;
  url?: string;
  brand?: string;
  keywords?: string;
  cleanHeader?: boolean;
}

export const SerpPreview: React.FC<SerpPreviewProps> = ({
  title,
  description,
  url,
  brand,
  keywords = '',
  cleanHeader = true
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const tenant = getActiveTenant();
  const collegeName = brand || tenant?.name || 'Lady Irwin College';
  const defaultOrigin = typeof window !== 'undefined' && window.location && window.location.origin 
    ? window.location.origin 
    : 'http://localhost:5173';

  // Format URL and breadcrumb
  let displayUrl = url || defaultOrigin;
  let host = 'localhost:5173';
  let path = '';
  try {
    const u = new URL(displayUrl.startsWith('http') ? displayUrl : 'https://' + displayUrl);
    displayUrl = u.href;
    host = u.host;
    path = u.pathname.replace(/\/+$/, '');
  } catch {
    displayUrl = url || defaultOrigin;
  }

  const breadcrumbs = path
    ? `${host} › ${path.split('/').filter(Boolean).join(' › ')}`
    : host;

  const displayTitle = title || `${collegeName} | Official Portal`;
  const displayDesc =
    description ||
    `Official academic portal of ${collegeName}, ${tenant?.subtitle || 'University of Delhi'}. Access verified programs, syllabus, faculty directory, and campus updates.`;

  // Keyword list for bold highlighting
  const kwList = (keywords || '')
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 2);

  // Helper to render text with bold keywords like real Google SERP snippets
  const renderSnippetWithBoldKeywords = (text: string) => {
    if (!text || kwList.length === 0) return text;

    // Create a regex to match any of the keywords
    const escaped = kwList.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!escaped) return text;

    try {
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) => {
        if (kwList.includes(part.toLowerCase())) {
          return <strong key={i} className="font-bold text-gray-900">{part}</strong>;
        }
        return part;
      });
    } catch {
      return text;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {cleanHeader ? (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                GOOGLE SEARCH SERP LIVE PREVIEW
              </h3>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>Google Search SERP Preview</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Live
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500">Live search engine result representation</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop / Mobile Switcher */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === 'desktop'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Google Result Card */}
      <div
        className={`p-4 rounded-xl border border-gray-200 bg-[#fbfcfd] transition-all ${
          viewMode === 'mobile' ? 'max-w-sm mx-auto shadow-sm' : 'w-full'
        }`}
      >
        {/* Favicon & Breadcrumb Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs flex-shrink-0">
              {collegeName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden leading-none">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {collegeName}
              </p>
              <span className="text-[11px] text-gray-500 font-normal truncate hover:underline block pt-0.5">
                {breadcrumbs}
              </span>
            </div>
          </div>
          <MoreVertical className="w-4 h-4 text-gray-400 flex-shrink-0 cursor-pointer" />
        </div>

        {/* Title Link (Google Blue #1a0dab) */}
        <a
          href={displayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug tracking-tight block"
          title={`Open ${displayUrl} in new tab`}
        >
          {displayTitle}
        </a>

        {/* Snippet Description (Google Grey #4d5156) */}
        <p className="text-[13px] text-[#4d5156] mt-1 leading-relaxed font-normal">
          {renderSnippetWithBoldKeywords(displayDesc)}
        </p>
      </div>
    </div>
  );
};
