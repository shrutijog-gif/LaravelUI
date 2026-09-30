import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  Globe,
  Activity,
  ChevronDown,
  Download,
  RefreshCw,
  CheckCheck,
  Smartphone,
  Monitor,
  Cpu,
  MoreVertical,
} from 'lucide-react';
import { WebPage } from '../../../../types/page';
import {
  generateSeoWithGroqAgent,
  formatOptimalSeoTitle,
  formatOptimalSeoDescription,
  formatOptimalSeoKeywords,
  generateTitleAlternatives,
  generateDescAlternatives,
  sanitizeSeoText,
  getGroqConfig,
  isValidSeoKeyword
} from '../../../../services/aiAgentService';
import { calculateSeoScore, downloadSeoReportFile } from '../../../../utils/seoEngine';
import { injectSeoIntoDom } from '../../../../utils/seoDomInjector';
import { TitleAlternatives } from '../../../seo/TitleAlternatives';
import { DescAlternatives } from '../../../seo/DescAlternatives';

import { getActiveTenant } from '../../../../data/tenantData';
import { extractPageContentText } from '../../../../data/mockPageData';

interface PageSEODrawerProps {
  isOpen: boolean;
  onClose: () => void;
  page: WebPage | null;
  onSave: (pageId: string, seoData: {
    seoTitle: string;
    metaDescription: string;
    metaKeywords: string;
  }) => void;
}

export const PageSEODrawer: React.FC<PageSEODrawerProps> = ({
  isOpen,
  onClose,
  page,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'previews' | 'export'>('details');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Form fields
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');

  // AI & UI State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showTitleAlts, setShowTitleAlts] = useState(false);
  const [showDescAlts, setShowDescAlts] = useState(false);
  const [titleAlternatives, setTitleAlternatives] = useState<string[]>([]);
  const [descAlternatives, setDescAlternatives] = useState<string[]>([]);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);


  // Groq AI Auto-Generation for SEO
  const handleAiAutoGenerate = async (silent = false) => {
    if (!page) return;
    setIsAiGenerating(true);
    if (!silent) setAiNotice(null);

    const tenant = getActiveTenant();
    const collegeName = tenant?.name || 'Lady Irwin College';
    const pageName = page.name || 'Webpage';

    const rawPageContent = extractPageContentText(page.id, page.name, page.customLink);
    const hasWebpageContent = rawPageContent.trim().length > 0;

    // Check all webpage content before Groq AI SEO generation:
    // If there is no content or data in main webpage, description and keywords must NOT be generated
    if (!hasWebpageContent) {
      const optimalTitle = formatOptimalSeoTitle(pageName, collegeName);
      setSeoTitle(optimalTitle);
      setMetaDescription('');
      setMetaKeywords('');
      setTitleAlternatives(generateTitleAlternatives(pageName, collegeName));
      setDescAlternatives([]);
      if (!silent) {
        setAiNotice('ℹ️ Webpage has no main content or blocks yet. SEO Title generated; Description and Keywords require webpage content.');
        setTimeout(() => setAiNotice(null), 5000);
      }
      setIsAiGenerating(false);
      return;
    }

    try {
      const baseOrigin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:5173';
      const cleanSlug = (page.slug || page.name).toLowerCase().replace(/\s+/g, '-');
      const targetUrl = page.customLink && page.customLink.trim() !== '' ? page.customLink : `${baseOrigin}/${cleanSlug}.html`;

      const result = await generateSeoWithGroqAgent({
        pageTitle: pageName,
        pageContent: rawPageContent,
        url: targetUrl,
        currentMetaDesc: '',
        currentKeywords: '',
      });

      if (result && result.seo) {
        setSeoTitle(result.seo.title || formatOptimalSeoTitle(pageName, collegeName));
        setMetaDescription(result.seo.description || formatOptimalSeoDescription(pageName, collegeName, rawPageContent));
        setMetaKeywords(result.seo.keywords || formatOptimalSeoKeywords(pageName, collegeName, rawPageContent));
        if (result.seo.titleAlternatives && result.seo.titleAlternatives.length > 0) {
          setTitleAlternatives(result.seo.titleAlternatives);
        }
        if (result.seo.descriptionAlternatives && result.seo.descriptionAlternatives.length > 0) {
          setDescAlternatives(result.seo.descriptionAlternatives);
        }
        if (!silent) {
          setAiNotice(`⚡ Auto-generated optimal SERP metadata from page content in ${result.latencyMs}ms!`);
          setTimeout(() => setAiNotice(null), 5000);
        }
      } else {
        const fallbackTitle = formatOptimalSeoTitle(page.name, collegeName);
        const fallbackDesc = formatOptimalSeoDescription(page.name, collegeName, rawPageContent);
        const fallbackKws = formatOptimalSeoKeywords(page.name, collegeName, rawPageContent);
        setSeoTitle(fallbackTitle);
        setMetaDescription(fallbackDesc);
        setMetaKeywords(fallbackKws);
        setTitleAlternatives(generateTitleAlternatives(page.name, collegeName));
        setDescAlternatives(generateDescAlternatives(page.name, collegeName, rawPageContent));
        if (!silent) {
          setAiNotice('✨ Generated compliant SEO metadata from page content.');
          setTimeout(() => setAiNotice(null), 4000);
        }
      }
    } catch (err: any) {
      console.warn('AI Generation fallback:', err);
      const fallbackTitle = formatOptimalSeoTitle(page.name, collegeName);
      const fallbackDesc = formatOptimalSeoDescription(page.name, collegeName, rawPageContent);
      const fallbackKws = formatOptimalSeoKeywords(page.name, collegeName, rawPageContent);
      setSeoTitle(fallbackTitle);
      setMetaDescription(fallbackDesc);
      setMetaKeywords(fallbackKws);
      setTitleAlternatives(generateTitleAlternatives(page.name, collegeName));
      setDescAlternatives(generateDescAlternatives(page.name, collegeName, rawPageContent));
    } finally {
      setIsAiGenerating(false);
    }
  };

  // When clicking the SEO button and drawer opens, automatically trigger Groq AI to see results
  useEffect(() => {
    if (isOpen && page) {
      // Set initial values if page already has them
      setSeoTitle(page.seoTitle || '');
      setMetaDescription(page.metaDescription || '');
      const sanitizedInitialKw = (page.metaKeywords || '')
        .split(',')
        .map(k => k.trim())
        .filter(isValidSeoKeyword)
        .join(', ');
      setMetaKeywords(sanitizedInitialKw);
      setTitleAlternatives([]);
      setDescAlternatives([]);
      setActiveTab('details');
      setShowTitleAlts(false);
      setShowDescAlts(false);
      setShowReportModal(false);
      setAiNotice(null);

      // Automatically generate with Groq AI after clicking SEO button
      handleAiAutoGenerate(false);
    }
  }, [isOpen, page?.id]);

  // Keyword list parsed from comma-separated string, strictly validated
  const keywordList = useMemo(() => {
    return metaKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0 && isValidSeoKeyword(k));
  }, [metaKeywords]);

  // Remove a keyword chip
  const handleRemoveKeyword = (keywordToRemove: string) => {
    const updated = keywordList.filter(k => k.toLowerCase() !== keywordToRemove.toLowerCase());
    setMetaKeywords(updated.join(', '));
  };

  // Add a new keyword chip
  const handleAddKeyword = () => {
    if (!newKeywordInput.trim()) return;
    const clean = sanitizeSeoText(newKeywordInput.trim().replace(/^#/, ''));
    if (isValidSeoKeyword(clean) && !keywordList.some(k => k.toLowerCase() === clean.toLowerCase())) {
      const updated = [...keywordList, clean];
      setMetaKeywords(updated.join(', '));
    }
    setNewKeywordInput('');
  };

  // Real-time SERP Standards Audit calculations via seoEngine
  const auditAnalysis = useMemo(() => {
    const hasContent = Boolean(page && extractPageContentText(page.id, page.name, page.customLink).trim().length > 0);
    return calculateSeoScore(
      seoTitle,
      metaDescription,
      keywordList,
      {
        hasPageContent: hasContent,
        brand: getActiveTenant()?.name || 'Lady Irwin College'
      }
    );
  }, [seoTitle, metaDescription, keywordList, page]);

  const titleLen = seoTitle.trim().length;
  const descLen = metaDescription.trim().length;
  const kwCount = keywordList.length;
  const isTitleOptimal = titleLen >= 45 && titleLen <= 62;
  const isDescOptimal = descLen >= 125 && descLen <= 165;
  const isKeywordOptimal = kwCount >= 4 && kwCount <= 10;

  const handleSave = () => {
    if (!page) return;

    const baseOrigin = typeof window !== 'undefined' && window.location && window.location.origin
      ? window.location.origin
      : 'http://localhost:5173';

    // 1. Live DOM Injection
    injectSeoIntoDom({
      title: seoTitle,
      description: metaDescription,
      keywords: metaKeywords,
      canonicalUrl: `${baseOrigin}/${pageSlug}.html`,
      institutionName: page.name,
    });

    // 2. Persist state and localStorage
    onSave(page.id, {
      seoTitle,
      metaDescription,
      metaKeywords,
    });
    onClose();
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadReport = () => {
    if (!page) return;
    const tenant = getActiveTenant();
    const collegeName = tenant?.name || 'Lady Irwin College';
    const cleanName = (page.name || 'page').toLowerCase().replace(/\s+/g, '_');
    
    downloadSeoReportFile(
      seoTitle,
      metaDescription,
      metaKeywords,
      pageUrl,
      collegeName,
      undefined,
      auditAnalysis.score,
      `SEO_Report_${cleanName}.txt`
    );
    setAiNotice(`📥 SEO Audit Report for "${page.name}" downloaded!`);
    setTimeout(() => setAiNotice(null), 4000);
  };

  if (!isOpen || !page) return null;

  const baseOrigin = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : 'http://localhost:5173';

  const isCustomPage = Boolean(
    page.customLink && 
    page.customLink.trim() !== '' &&
    (page.customLink.startsWith('http://') || page.customLink.startsWith('https://')) &&
    !page.customLink.includes(baseOrigin) && 
    !page.customLink.includes('localhost') && 
    !page.customLink.includes(':5173')
  );
  const pageSlug = (page.slug || page.name).toLowerCase().replace(/\s+/g, '-');
  const pageUrl = isCustomPage && page.customLink
    ? page.customLink
    : `${baseOrigin}/${pageSlug}.html`;

  // HTML Export Snippet exactly matching Screenshot 3
  const htmlExportCode = `<!-- Standard SEO -->
<title>${seoTitle}</title>
<meta name="description" content="${metaDescription}">
<meta name="keywords" content="${metaKeywords}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${pageUrl}">
<meta property="og:title" content="${seoTitle}">
<meta property="og:description" content="${metaDescription}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${seoTitle}">
<meta name="twitter:description" content="${metaDescription}">`;

  // Circular gauge calculations
  const circumference = 238.76;
  const strokeDashoffset = circumference - (circumference * auditAnalysis.score) / 100;
  const scoreColor = auditAnalysis.score >= 90 ? '#10b981' : auditAnalysis.score >= 70 ? '#f59e0b' : '#ef4444';

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel - Full Height Flush with Top Edge */}
      <div className="fixed top-0 bottom-0 inset-y-0 right-0 z-[99999] h-screen w-full max-w-2xl lg:max-w-3xl bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 tracking-tight">
                  Page SEO
                </h2>
              </div>
              <p className="text-xs text-gray-500 font-medium">{page.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Matching Screenshot 1, 2, 3) */}
        <div className="px-6 border-b border-gray-200 bg-white flex items-center gap-8 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 transition-colors relative cursor-pointer ${
              activeTab === 'details'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            SEO Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('previews')}
            className={`py-3 transition-colors relative cursor-pointer ${
              activeTab === 'previews'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Live Previews
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-3 transition-colors relative cursor-pointer ${
              activeTab === 'export'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Export Meta Tags
          </button>
        </div>

        {/* Scrollable Main Content with Right Side Scroller */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 custom-drawer-scrollbar">

          {/* AI Generating Banner */}
          {isAiGenerating && (
            <div className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center justify-between animate-pulse shadow-2xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <span>⚡ Analyzing page content and generating 100% compliant SERP metadata...</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 bg-blue-600 text-white font-bold rounded-full uppercase tracking-wider">
                Ultra-Fast
              </span>
            </div>
          )}

          {/* Action Notice Banner */}
          {!isAiGenerating && aiNotice && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{aiNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setAiNotice(null)}
                className="text-blue-400 hover:text-blue-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: SEO DETAILS */}
          {activeTab === 'details' && (
            <>
              {/* 1. SEO TITLE */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    SEO TITLE
                  </label>
                  {isAiGenerating ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-blue-50 text-blue-700 border-blue-200 animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      <span>Generating with AI...</span>
                    </span>
                  ) : (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      titleLen >= 45 && titleLen <= 62
                        ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
                        : titleLen === 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : (titleLen >= 35 && titleLen < 45) || (titleLen > 62 && titleLen <= 68)
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {titleLen}/60 chars{titleLen === 0 ? ' (Empty)' : titleLen > 68 ? ' (Too Long)' : titleLen < 35 ? ' (Short)' : ''}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={isAiGenerating ? "⚡ Generating optimal SEO Title..." : `${page?.name || 'Page'} | ${getActiveTenant()?.name || 'Lady Irwin College'}`}
                    className={`w-full bg-white border ${isAiGenerating ? 'border-blue-300 ring-1 ring-blue-100 bg-blue-50/20' : 'border-gray-300'} rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10`}
                  />
                  {titleAlternatives.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowTitleAlts(!showTitleAlts)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                      title="View Suggested Titles"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showTitleAlts ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {titleAlternatives.length > 0 && (
                  <TitleAlternatives
                    isOpen={showTitleAlts}
                    alternatives={titleAlternatives}
                    currentTitle={seoTitle}
                    pageName={page?.name}
                    onSelectTitle={(t) => setSeoTitle(t)}
                    onClose={() => setShowTitleAlts(false)}
                  />
                )}
              </div>

              {/* 2. META DESCRIPTION */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    META DESCRIPTION
                  </label>
                  {isAiGenerating ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-blue-50 text-blue-700 border-blue-200 animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      <span>Generating with AI...</span>
                    </span>
                  ) : (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      descLen >= 125 && descLen <= 165
                        ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
                        : descLen === 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : (descLen >= 100 && descLen < 125) || (descLen > 165 && descLen <= 175)
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {descLen}/158 chars{descLen === 0 ? ' (Empty)' : descLen > 175 ? ' (Too Long)' : descLen < 100 ? ' (Short)' : ''}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={isAiGenerating ? "⚡ Generating 125-165 char meta description..." : `Discover official details, syllabus guidelines, faculty directory, and admissions updates for ${page?.name || 'Page'} at ${getActiveTenant()?.name || 'Lady Irwin College'}.`}
                    className={`w-full bg-white border ${isAiGenerating ? 'border-blue-300 ring-1 ring-blue-100 bg-blue-50/20' : 'border-gray-300'} rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none pr-10`}
                  />
                  {descAlternatives.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowDescAlts(!showDescAlts)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                      title="View Suggested Descriptions"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showDescAlts ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                <DescAlternatives
                  isOpen={showDescAlts}
                  alternatives={descAlternatives}
                  currentDesc={metaDescription}
                  onSelectDesc={(d) => setMetaDescription(d)}
                  onClose={() => setShowDescAlts(false)}
                />
              </div>

              {/* 3. META KEYWORDS */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    META KEYWORDS
                  </label>
                  {isAiGenerating ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-blue-50 text-blue-700 border-blue-200 animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      <span>Extracting keywords...</span>
                    </span>
                  ) : (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      kwCount >= 4 && kwCount <= 10
                        ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
                        : kwCount === 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {kwCount} keywords{kwCount === 0 ? ' (Empty)' : ''}
                    </span>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder={isAiGenerating ? "⚡ Extracting genuine in-content keywords..." : "e.g. syllabus, timetable, faculty, research, admissions (comma-separated)"}
                  className={`w-full bg-white border ${isAiGenerating ? 'border-blue-300 ring-1 ring-blue-100 bg-blue-50/20' : 'border-gray-300'} rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none`}
                />

                {/* Tag Pills Container */}
                {keywordList.length > 0 && !isAiGenerating && (
                  <div className="flex flex-wrap gap-2 pt-1 max-h-40 overflow-y-auto">
                    {keywordList.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]"
                      >
                        <span>#{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="text-gray-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer rounded"
                          title="Remove keyword"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. SEO HEALTH & GOOGLE COMPLIANCE Card */}
              <div className="bg-white border border-blue-100/80 rounded-2xl p-5 shadow-xs">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        SEO HEALTH &amp; GOOGLE COMPLIANCE
                      </h3>
                    </div>
                  </div>

                  {isAiGenerating ? (
                    <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 border-blue-200 text-blue-600 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border"
                      style={{
                        backgroundColor: auditAnalysis.score >= 90 ? '#ecfdf5' : auditAnalysis.score >= 70 ? '#fffbeb' : '#fef2f2',
                        borderColor: auditAnalysis.score >= 90 ? '#a7f3d0' : auditAnalysis.score >= 70 ? '#fde68a' : '#fecaca',
                        color: auditAnalysis.score >= 90 ? '#059669' : auditAnalysis.score >= 70 ? '#b45309' : '#dc2626'
                      }}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{auditAnalysis.grade}</span>
                    </div>
                  )}
                </div>

                {/* Score & Checklist Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">

                  {/* Circular Score Gauge */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-3">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                        <circle
                          cx="45"
                          cy="45"
                          r="38"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="7"
                        />
                        <circle
                          cx="45"
                          cy="45"
                          r="38"
                          fill="none"
                          stroke={isAiGenerating ? '#3b82f6' : scoreColor}
                          strokeWidth="7"
                          strokeDasharray={circumference}
                          strokeDashoffset={isAiGenerating ? circumference * 0.4 : strokeDashoffset}
                          strokeLinecap="round"
                          className={isAiGenerating ? "animate-spin origin-center" : "transition-all duration-700 ease-out"}
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        {isAiGenerating ? (
                          <>
                            <Sparkles className="w-5 h-5 text-blue-600 animate-spin mb-0.5" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                              Scoring...
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl font-bold leading-none" style={{ color: scoreColor }}>
                              {auditAnalysis.score}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                              / 100 PTS
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Checklist */}
                  <div className="md:col-span-8 space-y-2 max-h-52 overflow-y-auto pr-1">
                    {(auditAnalysis.checks || []).map((item, idx) => {
                      if (item.status === 'pass') {
                        return (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border border-[#dcfce7] bg-[#f0fdf4] text-[#065f46] flex items-start gap-2.5 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold leading-tight">{item.label}</p>
                              <p className="text-[11px] text-gray-500 font-normal mt-0.5">{item.desc}</p>
                            </div>
                            {item.score !== undefined && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded shrink-0">
                                +{item.score} pts
                              </span>
                            )}
                          </div>
                        );
                      }
                      if (item.status === 'warning') {
                        return (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 flex items-start gap-2.5 transition-all"
                          >
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold leading-tight text-amber-900">{item.label}</p>
                              <p className="text-[11px] text-amber-700 font-normal mt-0.5">{item.desc}</p>
                            </div>
                            {item.score !== undefined && item.maxScore !== undefined && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded shrink-0">
                                {item.score}/{item.maxScore} pts
                              </span>
                            )}
                          </div>
                        );
                      }
                      if (item.status === 'fail') {
                        return (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 flex items-start gap-2.5 transition-all"
                          >
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold leading-tight text-rose-900">{item.label}</p>
                              <p className="text-[11px] text-rose-700 font-normal mt-0.5">{item.desc}</p>
                            </div>
                            {item.maxScore !== undefined && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded shrink-0">
                                0/{item.maxScore} pts
                              </span>
                            )}
                          </div>
                        );
                      }
                      // info (e.g. empty canvas)
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 text-blue-800 flex items-start gap-2.5 transition-all"
                        >
                          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold leading-tight text-blue-900">{item.label}</p>
                            <p className="text-[11px] text-blue-700 font-normal mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            </>
          )}

          {/* TAB 2: LIVE PREVIEWS (Matching Screenshot 2) */}
          {activeTab === 'previews' && (
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* 1. Google Search SERP Live Preview */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>GOOGLE SEARCH SERP LIVE PREVIEW</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${previewDevice === 'desktop' ? 'bg-gray-100 font-bold text-gray-900 shadow-2xs' : 'text-gray-500'
                        }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${previewDevice === 'mobile' ? 'bg-gray-100 font-bold text-gray-900 shadow-2xs' : 'text-gray-500'
                        }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>

                {/* Google Snippet Card (Matching Screenshot 2) */}
                <div className={`p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs ${previewDevice === 'mobile' ? 'max-w-md mx-auto' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#1e40af] text-white flex items-center justify-center text-[10px] font-bold">
                        {(getActiveTenant()?.name || 'L').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900 leading-tight">{getActiveTenant()?.name || 'Lady Irwin College'}</p>
                        <p className="text-[11px] text-gray-400 leading-tight truncate max-w-xs md:max-w-sm">
                          {isCustomPage && page.customLink ? page.customLink : `${pageSlug}.html`}
                        </p>
                      </div>
                    </div>
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </div>

                  <h3 className="text-[#1a0dab] hover:underline text-[16px] md:text-[17px] font-medium cursor-pointer leading-snug">
                    {isAiGenerating ? (
                      <span className="inline-block w-3/4 h-5 bg-blue-100 animate-pulse rounded"></span>
                    ) : (
                      seoTitle || `${page.name} | ${getActiveTenant()?.name || 'Lady Irwin College'}`
                    )}
                  </h3>

                  <p className="text-xs md:text-[13px] text-[#4d5156] mt-1 leading-relaxed">
                    {isAiGenerating ? (
                      <span className="inline-block w-full h-8 bg-gray-100 animate-pulse rounded"></span>
                    ) : (
                      metaDescription || `Discover official details, syllabus guidelines, faculty directory, and admissions updates for ${page.name} at ${getActiveTenant()?.name || 'Lady Irwin College'}.`
                    )}
                  </p>
                </div>
              </div>

              {/* 2. Social & Open Graph Preview (Matching Screenshot 2) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    SOCIAL &amp; OPEN GRAPH PREVIEW (WHATSAPP / LINKEDIN / FACEBOOK)
                  </span>
                  <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-mono font-bold">
                    og:card
                  </span>
                </div>

                {/* Social Card (Matching Screenshot 2) */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="h-44 bg-[#e5e7eb] flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80"
                      alt="OG preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4 bg-[#f3f4f6] border-t border-gray-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono">
                      {(() => {
                        try {
                          const urlToParse = isCustomPage && page.customLink ? page.customLink : baseOrigin;
                          return new URL(urlToParse.startsWith('http') ? urlToParse : `http://${urlToParse}`).host.toUpperCase();
                        } catch {
                          return 'LOCALHOST:5173';
                        }
                      })()}
                    </p>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1 mt-0.5">
                      {seoTitle}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {metaDescription}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: EXPORT META TAGS (Matching Screenshot 3) */}
          {activeTab === 'export' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  PRODUCTION HTML META TAGS
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(htmlExportCode, 'html')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  {copiedSection === 'html' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Box exactly matching Screenshot 3 */}
              <div className="rounded-2xl bg-[#030712] border border-gray-800 p-5 overflow-x-auto shadow-inner">
                <pre className="font-mono text-[12px] text-[#34d399] leading-relaxed whitespace-pre">
                  {htmlExportCode}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions (Matching Screenshot 1, 2, 3) */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={handleDownloadReport}
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
            title="Download SEO Audit Report"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Report</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save SEO Settings</span>
            </button>
          </div>
        </div>

      </div>

      {/* SEO Audit Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">SEO Audit &amp; Compliance Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-800">Overall SERP Quality Score</p>
                <p className="text-2xl font-black text-emerald-700">{auditAnalysis.score} / 100 PTS</p>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold">
                {auditAnalysis.grade}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-gray-700 uppercase tracking-wide">Audit Breakdown:</p>
              {auditAnalysis.passes.map((it, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <span className="font-medium text-gray-700">{it.label}</span>
                  <span className="font-semibold text-emerald-600">{it.desc}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Download PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export { PageSEODrawer as PageSeoModal };
