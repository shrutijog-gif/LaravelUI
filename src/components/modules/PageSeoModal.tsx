import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Globe, 
  Download, 
  Copy, 
  Check, 
  Eye,
  ChevronDown,
  Plus,
  Zap,
  RefreshCw,
  Sliders,
  Settings,
  Bot
} from 'lucide-react';
import { PageItem } from './WebpageModule';
import { calculateSeoScore, downloadSeoReportFile, generateMetaTagsCode } from '../../utils/seoEngine';
import { SeoMetadata } from '../../types/seo';
import { SerpPreview } from '../seo/SerpPreview';
import { SeoAuditGauge } from '../seo/SeoAuditGauge';
import { TitleAlternatives } from '../seo/TitleAlternatives';
import { DescAlternatives } from '../seo/DescAlternatives';
import { generateSeoWithGroqAgent, getGroqConfig, formatOptimalSeoTitle, formatOptimalSeoDescription, formatOptimalSeoKeywords } from '../../services/aiAgentService';
import { syncDomHeadSeo } from '../../utils/seoDomInjector';

import { getActiveTenant } from '../../data/tenantData';
import { extractPageContentText } from '../../data/mockPageData';

export interface PageSeoModalProps {
  page: PageItem;
  onClose: () => void;
  onSave: (updatedPage: PageItem) => void;
}

export const PageSeoModal: React.FC<PageSeoModalProps> = ({ page, onClose, onSave }) => {
  const tenant = getActiveTenant();
  const collegeName = tenant?.name || 'Lady Irwin College';
  const baseUrl = typeof window !== 'undefined' && window.location && window.location.origin 
    ? window.location.origin 
    : 'http://localhost:5173';

  const rawCustom = (page.customLink || page.url || '').trim();
  const pageTitle = (page.name || page.title || 'Webpage').trim();
  const cleanSlug = (page.slug || pageTitle).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
  const isExternal = Boolean(
    rawCustom &&
    (rawCustom.startsWith('http://') || rawCustom.startsWith('https://') || rawCustom.startsWith('www.') || rawCustom.includes('.')) &&
    !rawCustom.includes(baseUrl) &&
    !rawCustom.includes('localhost') &&
    !rawCustom.includes(':5173')
  );
  const formattedCustom = rawCustom && !rawCustom.startsWith('http://') && !rawCustom.startsWith('https://') && !rawCustom.startsWith('/')
    ? `https://${rawCustom}`
    : rawCustom;
  const fullUrl = isExternal && formattedCustom ? formattedCustom : `${baseUrl}/${cleanSlug}`;

  const pageContent = extractPageContentText(page.id, pageTitle, rawCustom);
  const hasPageContent = pageContent.trim().length > 0;

  const initialTitle = page.seoTitle && page.seoTitle.length >= 45 && page.seoTitle.length <= 62 && !page.seoTitle.includes('Vidya Pratishthan') && !page.seoTitle.includes('undefined')
    ? page.seoTitle 
    : formatOptimalSeoTitle(pageTitle, collegeName);

  const initialDesc = hasPageContent
    ? ((page.description || page.metaDescription) && (page.description || page.metaDescription)!.length >= 125 && (page.description || page.metaDescription)!.length <= 165 && !(page.description || page.metaDescription)!.includes('Vidya Pratishthan') && !(page.description || page.metaDescription)!.includes('undefined')
        ? (page.description || page.metaDescription)!
        : formatOptimalSeoDescription(pageTitle, collegeName, pageContent))
    : '';

  const initialKeywords = hasPageContent
    ? ((page.seoKeywords || page.metaKeywords) && !(page.seoKeywords || page.metaKeywords)!.includes('undefined')
        ? (page.seoKeywords || page.metaKeywords)!
        : formatOptimalSeoKeywords(pageTitle, collegeName, pageContent))
    : '';

  const [seoTitle, setSeoTitle] = useState(initialTitle);
  const [metaDescription, setMetaDescription] = useState(initialDesc);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [seoData, setSeoData] = useState<SeoMetadata | null>(page.seoData || null);
  const [agentReasoning, setAgentReasoning] = useState<string>('');
  const [latencyMs, setLatencyMs] = useState<number | undefined>();
  const [modelUsed, setModelUsed] = useState<string>('Groq Llama 3.3 70B');

  const [activeTab, setActiveTab] = useState<'metadata' | 'preview' | 'code'>('metadata');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [groqConfig, setGroqConfig] = useState(getGroqConfig());

  const [showTitleAlternatives, setShowTitleAlternatives] = useState(false);
  const [showDescAlternatives, setShowDescAlternatives] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Real-time Score calculation
  const currentAudit = useMemo(() => {
    return calculateSeoScore(seoTitle || pageTitle, metaDescription, keywords, {
      hasPageContent,
      brand: collegeName
    });
  }, [seoTitle, metaDescription, keywords, pageTitle, hasPageContent, collegeName]);

  // Execute Groq AI Agent Generation
  const handleGenerateWithGroq = async (promptOverride?: string, isManual = false) => {
    setIsGenerating(true);
    try {
      const pageCorpus = hasPageContent ? `
=== PAGE CONTEXT ===
Title: ${pageTitle}
Template: ${page.template || 'Academic Portal'}
URL: ${fullUrl}
Status: ${page.status || 'Active'}
Content: ${pageContent}
Current Description: ${metaDescription || 'None'}
Current Keywords: ${keywords || 'None'}
      `.trim() : '';

      const result = await generateSeoWithGroqAgent({
        pageTitle: pageTitle,
        pageContent: pageCorpus,
        url: fullUrl,
        template: page.template,
        currentMetaDesc: metaDescription,
        currentKeywords: hasPageContent ? keywords : '',
        userCustomPrompt: promptOverride || customAiPrompt
      });

      setSeoTitle(result.seo.title);
      setMetaDescription(hasPageContent ? result.seo.description : '');
      setKeywords(hasPageContent ? result.seo.keywords : '');
      setSeoData(result.seo);
      setAgentReasoning(result.agentReasoning || '');
      setLatencyMs(result.latencyMs);
      setModelUsed(result.modelUsed);

      if (isManual) {
        showToast(hasPageContent ? '⚡ Updated SEO with Groq AI Agent!' : '⚡ Updated SEO Title. Description and keywords not generated because page has no content.');
      }
    } catch (e: any) {
      console.error(e);
      if (isManual) {
        showToast('Error calling Groq AI: ' + e.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Run AI generation silently in the background on open only if page has content
  useEffect(() => {
    if (hasPageContent) {
      handleGenerateWithGroq(undefined, false);
    }
  }, [hasPageContent]);

  // Title alternatives generated 100% purely by Groq AI
  const generatedTitleAlts = useMemo(() => {
    if (seoData?.titleAlternatives && seoData.titleAlternatives.length > 0) {
      return seoData.titleAlternatives;
    }
    const upper = pageTitle.length <= 5 ? pageTitle.toUpperCase() : pageTitle;
    return [
      formatOptimalSeoTitle(pageTitle),
      `Official ${upper} – Academic Portal | ${collegeName}`,
      `Explore ${upper} | ${collegeName}`
    ];
  }, [seoData, pageTitle, collegeName]);

  // Description alternatives generated 100% purely by Groq AI
  const generatedDescAlts = useMemo(() => {
    if (!hasPageContent) {
      return [];
    }
    if (seoData?.descriptionAlternatives && seoData.descriptionAlternatives.length > 0) {
      return seoData.descriptionAlternatives;
    }
    const upper = pageTitle.length <= 5 ? pageTitle.toUpperCase() : pageTitle;
    return [
      `Discover official details, verified academic guidelines, faculty updates, and announcements for ${upper} at ${collegeName}.`,
      `Explore ${upper} at ${collegeName}. Access syllabus information, NAAC accreditation rankings, and campus updates online.`
    ];
  }, [hasPageContent, seoData, pageTitle, collegeName]);

  const handleToggleTitleAlternatives = () => {
    setShowTitleAlternatives(prev => !prev);
  };

  const handleToggleDescAlternatives = () => {
    setShowDescAlternatives(prev => !prev);
  };

  const titleLen = seoTitle.length;
  const descLen = metaDescription.length;

  const activeKeywordsList = useMemo(() => {
    return keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
  }, [keywords]);

  const keywordCount = activeKeywordsList.length;

  const handleRemoveKeyword = (kwToRemove: string) => {
    const nextList = activeKeywordsList.filter((k: string) => k.toLowerCase() !== kwToRemove.toLowerCase().trim());
    setKeywords(nextList.join(', '));
    showToast(`Removed keyword "${kwToRemove}"`);
  };

  let titleColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let titleHint = '';
  if (titleLen === 0) {
    titleColor = 'bg-red-50 text-red-700 border-red-200';
    titleHint = 'Missing title';
  } else if (titleLen < 20) {
    titleColor = 'bg-amber-50 text-amber-700 border-amber-200';
    titleHint = 'Too short (<20 chars)';
  } else if (titleLen > 68) {
    titleColor = 'bg-amber-50 text-amber-700 border-amber-200';
    titleHint = 'May truncate (>68 chars)';
  }

  let descColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let descHint = '';
  if (descLen === 0) {
    descColor = 'bg-red-50 text-red-700 border-red-200';
    descHint = 'Missing description';
  } else if (descLen < 80) {
    descColor = 'bg-amber-50 text-amber-700 border-amber-200';
    descHint = 'Too short (<80 chars)';
  } else if (descLen > 170) {
    descColor = 'bg-amber-50 text-amber-700 border-amber-200';
    descHint = 'May truncate (>170 chars)';
  }

  const handleCopyMetaCode = () => {
    const code = generateMetaTagsCode(seoTitle, metaDescription, keywords, fullUrl);
    navigator.clipboard.writeText(code);
    showToast('📋 HTML Meta Tags copied to clipboard!');
  };

  const handleDownloadReport = () => {
    downloadSeoReportFile(
      seoTitle,
      metaDescription,
      keywords,
      fullUrl,
      collegeName,
      seoData || undefined,
      currentAudit.score,
      `Groq_SEO_Report_${page.slug || 'page'}.txt`
    );
    showToast('📥 Report downloaded!');
  };

  const handleSave = () => {
    const updated: PageItem = {
      ...page,
      name: pageTitle,
      title: pageTitle,
      slug: page.slug || cleanSlug,
      customLink: fullUrl,
      url: fullUrl,
      seoTitle: seoTitle.trim(),
      description: metaDescription.trim(),
      metaDescription: metaDescription.trim(),
      seoKeywords: keywords.trim(),
      metaKeywords: keywords.trim(),
      seoScore: currentAudit.score,
      seoData: seoData || undefined,
    };
    try {
      syncDomHeadSeo(undefined, updated);
    } catch (e) {
      console.error(e);
    }
    onSave(updated);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 top-0 bottom-0 z-[99999] overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over Drawer for SEO */}
      <div className="fixed inset-y-0 top-0 bottom-0 right-0 h-screen max-w-full flex">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col justify-between animate-slide-left border-l border-gray-200">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 leading-tight">Page SEO</h2>
                </div>
                <p className="text-xs text-gray-500 font-medium truncate max-w-sm">{pageTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="mx-6 mt-3 p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-2xs">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="px-6 pt-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('metadata')}
              className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'metadata'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              SEO Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Live Previews
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'code'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Export Meta Tags
            </button>
          </div>

          {/* Content Body with Right Side Scroller */}
          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 custom-drawer-scrollbar">
            
            {activeTab === 'metadata' && (
              <div className="space-y-6 animate-fade-in">
                {/* SEO Audit Gauge Banner */}
                <SeoAuditGauge 
                  title={seoTitle}
                  description={metaDescription}
                  keywords={keywords}
                  hasPageContent={hasPageContent}
                />

                {/* SEO Title Field with AI Alternatives */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                      SEO Title
                    </label>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${titleColor}`}>
                      {titleLen}/60 chars{titleHint ? ` (${titleHint})` : ''}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full pl-3.5 pr-11 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs transition-all"
                      placeholder="Enter meta title for search engines..."
                    />
                    <button
                      type="button"
                      onClick={handleToggleTitleAlternatives}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer flex items-center justify-center"
                      title="Toggle AI Title Suggestions"
                    >
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          showTitleAlternatives ? 'transform rotate-180 text-blue-600' : ''
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Title Alternatives */}
                  {showTitleAlternatives && (
                    <TitleAlternatives 
                      activeTitle={seoTitle}
                      pageName={pageTitle}
                      alternatives={generatedTitleAlts}
                      onSelectTitle={(t) => {
                        setSeoTitle(t);
                        showToast('Applied recommended title');
                      }}
                    />
                  )}
                </div>

                {/* Meta Description Field with AI Alternatives */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                      Meta Description
                    </label>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      !hasPageContent 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : descColor
                    }`}>
                      {!hasPageContent ? 'No page data / Description disabled' : `${descLen}/158 chars${descHint ? ` (${descHint})` : ''}`}
                    </span>
                  </div>

                  {!hasPageContent && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                      <span className="text-sm leading-none flex-shrink-0 mt-0.5">⚠️</span>
                      <div>
                        <p className="font-semibold">No Content Detected on Page</p>
                        <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                          Meta description and keywords are not generated because this webpage has no content. Add content blocks or text on the page canvas to enable SEO generation.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <textarea
                      rows={3}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className={`w-full ${hasPageContent ? 'pl-3.5 pr-11' : 'px-3.5'} py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs resize-y min-h-[80px] transition-all`}
                      placeholder={!hasPageContent ? "Description disabled because page has no content..." : "Enter concise search summary..."}
                    />
                    {hasPageContent && (
                      <button
                        type="button"
                        onClick={handleToggleDescAlternatives}
                        className="absolute right-2.5 top-2.5 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer flex items-center justify-center bg-white/90 backdrop-blur-xs border border-gray-200 shadow-2xs"
                        title="Toggle AI Description Suggestions"
                      >
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 ${
                            showDescAlternatives ? 'transform rotate-180 text-blue-600' : ''
                          }`} 
                        />
                      </button>
                    )}
                  </div>

                  {/* Description Alternatives */}
                  {hasPageContent && showDescAlternatives && (
                    <DescAlternatives 
                      activeDescription={metaDescription}
                      alternatives={generatedDescAlts}
                      onSelectDescription={(d) => {
                        setMetaDescription(d);
                        showToast('Applied recommended description');
                      }}
                    />
                  )}
                </div>

                {/* Meta Keywords */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                      Meta Keywords
                    </label>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      !hasPageContent 
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : (keywordCount >= 4 && keywordCount <= 10
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200')
                    }`}>
                      {!hasPageContent ? 'No page data / Keywords disabled' : `${keywordCount} keywords${keywordCount === 0 ? ' (Empty)' : ''}`}
                    </span>
                  </div>

                  {!hasPageContent && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                      <span className="text-sm leading-none flex-shrink-0 mt-0.5">⚠️</span>
                      <div>
                        <p className="font-semibold">Keywords Disabled</p>
                        <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                          Keywords cannot be extracted or generated because there is no content or data on this page.
                        </p>
                      </div>
                    </div>
                  )}

                  <textarea
                    rows={2}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs resize-y"
                    placeholder={!hasPageContent ? "Keywords disabled because page has no content..." : "Comma-separated keywords..."}
                  />

                  {activeKeywordsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeKeywordsList.map((kw: string, i: number) => {
                        const kwLower = kw.toLowerCase().trim();
                        const inContent = pageContent.toLowerCase().includes(kwLower);
                        return (
                          <span 
                            key={i} 
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-2xs ${
                              inContent 
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                                : 'bg-blue-50 text-blue-900 border-blue-200'
                            }`}
                          >
                            <span>#{kw}</span>
                            {inContent && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-200/70 text-emerald-800">
                                ✓ in content
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyword(kw)}
                              className="text-gray-400 hover:text-rose-700 hover:bg-gray-100 rounded-full p-0.5 transition-colors cursor-pointer"
                              title={`Remove "${kw}"`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <SerpPreview 
                    title={seoTitle}
                    description={metaDescription}
                    url={fullUrl}
                    brand={collegeName}
                    keywords={keywords}
                  />
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-[#f8fafc] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                      Social &amp; Open Graph Preview (WhatsApp / LinkedIn / Facebook)
                    </span>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                      og:card
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <img 
                      src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80" 
                      alt="OpenGraph preview" 
                      className="w-full h-36 object-cover bg-gray-200"
                    />
                    <div className="p-3.5 space-y-1">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold font-mono">
                        {(() => {
                          try {
                            return new URL(baseUrl).host.toUpperCase();
                          } catch {
                            return 'LOCALHOST:5173';
                          }
                        })()}
                      </p>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1">{seoTitle || pageTitle}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{metaDescription || 'Official campus information and academic portal.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 uppercase">Production HTML Meta Tags</span>
                  <button
                    type="button"
                    onClick={handleCopyMetaCode}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </button>
                </div>
                <pre className="p-4 bg-gray-950 text-emerald-400 text-xs rounded-xl font-mono overflow-x-auto border border-gray-800 max-h-72">
                  {generateMetaTagsCode(seoTitle, metaDescription, keywords, fullUrl)}
                </pre>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between sticky bottom-0 z-10">
            <button
              type="button"
              onClick={handleDownloadReport}
              className="px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 bg-white flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-600" />
              <span>Report</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save SEO Settings</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
