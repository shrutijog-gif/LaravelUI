import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Download, 
  Check, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Eye, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  X, 
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { PageItem } from './WebpageModule';
import { SerpPreview } from '../seo/SerpPreview';
import { GoogleSearchPreviewModal } from '../seo/GoogleSearchPreviewModal';
import { calculateSeoScore, exportPagesCsv } from '../../utils/seoEngine';
import { GlobalWebsiteSeo } from '../../types/seo';
import { syncDomHeadSeo } from '../../utils/seoDomInjector';
import { getActiveTenant, getTenantSeoDefaults } from '../../data/tenantData';
import { getStoredWebPages, saveStoredWebPages, getBaseOrigin, PAGES_STORAGE_KEY, extractPageContentText } from '../../data/mockPageData';

const GLOBAL_SEO_KEY = 'college_cms_global_seo';
const LOCAL_STORAGE_KEY = PAGES_STORAGE_KEY;

export const getTargetPageUrl = (page: PageItem, domainUrl?: string): string => {
  const baseDomain = (domainUrl || getBaseOrigin()).replace(/\/+$/, '');
  const pageName = (page.name || page.title || 'page').trim();
  const slug = (page.slug || pageName).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');

  let raw = (page.customLink || page.url || '').trim();
  if (raw) {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }
    if (raw.startsWith('www.') || (raw.includes('.') && !raw.startsWith('/'))) {
      return `https://${raw}`;
    }
    return `${baseDomain}/${raw.replace(/^\/+/, '')}`;
  }

  return `${baseDomain}/${slug}`;
};

export const normalizePageToItem = (p: any, tenantName: string = getActiveTenant().name, domainUrl?: string): PageItem => {
  const origin = (domainUrl || getBaseOrigin()).replace(/\/+$/, '');
  const pageName = (p.name || p.title || 'Page').trim();
  const cleanSlug = (p.slug || pageName).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');

  let rawUrl = (p.customLink || p.url || '').trim();
  if (!rawUrl) {
    rawUrl = `${origin}/${cleanSlug}`;
  } else if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://') && (rawUrl.startsWith('www.') || (rawUrl.includes('.') && !rawUrl.startsWith('/')))) {
    rawUrl = `https://${rawUrl}`;
  }

  let title = (p.seoTitle || p.metaTitle || '').trim();
  if (!title || title.includes('undefined')) {
    title = `${pageName} | ${tenantName}`;
  }
  if (title.includes('Vidya Pratishthan')) {
    title = title.replace(/Vidya Pratishthan's ASC College Baramati|Vidya Pratishthan's College Baramati|Vidya Pratishthan Baramati|Vidya Pratishthan/g, tenantName);
  }

  const pageContent = extractPageContentText(p.id, pageName, rawUrl);
  const hasContent = pageContent.trim().length > 0;

  let desc = (p.description || p.metaDescription || '').trim();
  if (!hasContent) {
    // If no content in webpage, description must not be generated
    desc = '';
  } else if (!desc || desc.includes('undefined')) {
    desc = `Discover official details, syllabus guidelines, and faculty directory for ${pageName} at ${tenantName}.`;
  }
  if (desc.includes('Vidya Pratishthan')) {
    desc = desc.replace(/Vidya Pratishthan Arts, Science and Commerce College Baramati|Vidya Pratishthan College Baramati|Vidya Pratishthan/g, tenantName);
  }

  let kw = (p.seoKeywords || p.metaKeywords || '').trim();
  if (!hasContent) {
    // If no content in webpage, keywords must not be generated
    kw = '';
  } else if (!kw || kw.includes('undefined')) {
    kw = `${pageName.toLowerCase()}, ${tenantName.toLowerCase()}, academic portal, higher education`;
  }

  const pageAudit = calculateSeoScore(title, desc, kw, { brand: tenantName });

  return {
    id: p.id || `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: pageName,
    title: pageName,
    slug: p.slug || cleanSlug,
    customLink: rawUrl,
    url: rawUrl,
    seoTitle: title,
    description: desc,
    metaDescription: desc,
    seoKeywords: kw,
    metaKeywords: kw,
    seoScore: pageAudit.score,
    lastModified: p.lastModified || 'Just now',
    type: p.type || 'builder'
  };
};

export const loadActivePages = (): PageItem[] => {
  const tenant = getActiveTenant();
  const rawList = getStoredWebPages();
  return rawList.map(p => normalizePageToItem(p, tenant.name));
};

export const FullWebsiteSeoModule: React.FC = () => {
  const [currentTenant, setCurrentTenant] = useState(() => getActiveTenant());

  const [globalSeo, setGlobalSeo] = useState<GlobalWebsiteSeo>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_SEO_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.domainUrl || parsed.domainUrl.includes('vpcollege') || parsed.siteName?.includes('Vidya Pratishthan')) {
          const defaults = getTenantSeoDefaults(getActiveTenant());
          return { ...parsed, ...defaults };
        }
        return parsed;
      }
    } catch {}
    return getTenantSeoDefaults(getActiveTenant());
  });

  const [pages, setPages] = useState<PageItem[]>(() => loadActivePages());

  const [isGlobalSeoOpen, setIsGlobalSeoOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPage, setPreviewPage] = useState<PageItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Listen to tenant-changed & web-pages-updated events
  useEffect(() => {
    const handleTenantChange = () => {
      const tenant = getActiveTenant();
      setCurrentTenant(tenant);
      const defaults = getTenantSeoDefaults(tenant);
      setGlobalSeo(defaults);
      try {
        localStorage.setItem(GLOBAL_SEO_KEY, JSON.stringify(defaults));
        syncDomHeadSeo(defaults);
      } catch (e) {}

      // Update pages with new tenant branding
      setPages(loadActivePages());
    };

    const handleWebPagesUpdate = () => {
      setPages(loadActivePages());
    };

    window.addEventListener('tenant-changed', handleTenantChange);
    window.addEventListener('web-pages-updated', handleWebPagesUpdate);
    window.addEventListener('storage', handleWebPagesUpdate);

    return () => {
      window.removeEventListener('tenant-changed', handleTenantChange);
      window.removeEventListener('web-pages-updated', handleWebPagesUpdate);
      window.removeEventListener('storage', handleWebPagesUpdate);
    };
  }, []);

  const updatePages = (updater: PageItem[] | ((prev: PageItem[]) => PageItem[])) => {
    setPages(prev => {
      const nextPages = typeof updater === 'function' ? updater(prev) : updater;
      const webPages = nextPages.map(p => ({
        id: p.id,
        name: p.title || p.name || 'Page',
        slug: p.slug,
        customLink: p.customLink || p.url,
        seoTitle: p.seoTitle,
        metaDescription: p.description || p.metaDescription,
        metaKeywords: p.seoKeywords || p.metaKeywords,
        lastModified: p.lastModified || 'Just now',
        type: p.type || 'builder'
      }));
      saveStoredWebPages(webPages as any);
      return nextPages;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveGlobalSeo = () => {
    try {
      localStorage.setItem(GLOBAL_SEO_KEY, JSON.stringify(globalSeo));
      syncDomHeadSeo(globalSeo);
      showToast('✨ Global Website SEO Settings Saved Successfully!');
    } catch (e) {
      console.error(e);
      showToast('Error saving Global SEO');
    }
  };

  const filteredPages = useMemo(() => {
    return pages.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.title.toLowerCase().includes(q) || 
        (p.slug && p.slug.toLowerCase().includes(q)) || 
        (p.seoTitle && p.seoTitle.toLowerCase().includes(q)) || 
        (p.seoKeywords && p.seoKeywords.toLowerCase().includes(q));

      return matchesSearch;
    });
  }, [pages, searchQuery]);

  const globalKeywordList = useMemo(() => {
    return (globalSeo.defaultKeywords || '')
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);
  }, [globalSeo.defaultKeywords]);

  const displayHost = useMemo(() => {
    try {
      return new URL(globalSeo.domainUrl).host.toUpperCase();
    } catch {
      return 'LOCALHOST:5173';
    }
  }, [globalSeo.domainUrl]);

  // Real-time Overall Site SEO & Compliance Engine
  const siteSeoMetrics = useMemo(() => {
    if (!pages || pages.length === 0) {
      return {
        overallScore: 100,
        overallGrade: 'EXCELLENT' as const,
        overallStatus: 'Google SERP Ready',
        titleCompliance: 100,
        descCompliance: 100,
        titleCompliantCount: 0,
        descCompliantCount: 0,
        optimizedCount: 0,
        pageAudits: new Map<string, ReturnType<typeof calculateSeoScore>>()
      };
    }

    const brand = globalSeo.brandName || currentTenant.name;
    let totalScore = 0;
    let titleCompliantCount = 0;
    let descCompliantCount = 0;
    let optimizedCount = 0;
    const pageAudits = new Map<string, ReturnType<typeof calculateSeoScore>>();

    pages.forEach(p => {
      const pageTitle = (p.seoTitle || p.title || p.name || '').trim();
      const pageDesc = (p.description || p.metaDescription || '').trim();
      const pageKw = (p.seoKeywords || p.metaKeywords || '').trim();

      const audit = calculateSeoScore(pageTitle, pageDesc, pageKw, { brand });
      pageAudits.set(p.id, audit);
      totalScore += audit.score;

      if (audit.score >= 85) {
        optimizedCount++;
      }

      // Title compliance: optimal Google SERP title length is 40-65 chars
      const tLen = pageTitle.length;
      if (tLen >= 40 && tLen <= 65) {
        titleCompliantCount++;
      }

      // Description compliance: optimal Google SERP description length is 120-165 chars
      const dLen = pageDesc.length;
      if (dLen >= 120 && dLen <= 165) {
        descCompliantCount++;
      }
    });

    const overallScore = Math.round(totalScore / pages.length);
    const titleCompliance = Math.round((titleCompliantCount / pages.length) * 100);
    const descCompliance = Math.round((descCompliantCount / pages.length) * 100);

    let overallGrade: 'EXCELLENT' | 'GOOD' | 'CRITICAL' = 'EXCELLENT';
    let overallStatus = 'Google SERP Ready';

    if (overallScore < 70) {
      overallGrade = 'CRITICAL';
      overallStatus = 'Needs Immediate Attention';
    } else if (overallScore < 90) {
      overallGrade = 'GOOD';
      overallStatus = 'Minor Adjustments Recommended';
    }

    return {
      overallScore,
      overallGrade,
      overallStatus,
      titleCompliance,
      descCompliance,
      titleCompliantCount,
      descCompliantCount,
      optimizedCount,
      pageAudits
    };
  }, [pages, globalSeo.brandName, currentTenant.name]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#0f2748] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-blue-400/40 flex items-center gap-3 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 4 TOP KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Site SEO */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">OVERALL SITE SEO</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {siteSeoMetrics.overallScore}%
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                siteSeoMetrics.overallGrade === 'EXCELLENT'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : siteSeoMetrics.overallGrade === 'GOOD'
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}>
                {siteSeoMetrics.overallGrade}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{siteSeoMetrics.overallStatus}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-2xs ${
            siteSeoMetrics.overallGrade === 'EXCELLENT'
              ? 'bg-emerald-50 text-emerald-600'
              : siteSeoMetrics.overallGrade === 'GOOD'
              ? 'bg-amber-50 text-amber-600'
              : 'bg-rose-50 text-rose-600'
          }`}>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total Inner Pages */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">TOTAL INNER PAGES</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{pages.length}</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {siteSeoMetrics.optimizedCount}/{pages.length} Optimized
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">All inner pages active</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Title Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">TITLE COMPLIANCE</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {siteSeoMetrics.titleCompliance}%
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                siteSeoMetrics.titleCompliance >= 80
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : siteSeoMetrics.titleCompliance >= 50
                  ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}>
                {siteSeoMetrics.titleCompliantCount}/{pages.length} Optimal
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Optimal 45–62 chars for SERP</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-2xs ${
            siteSeoMetrics.titleCompliance >= 80
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-indigo-50 text-indigo-600'
          }`}>
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Desc Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">DESC COMPLIANCE</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {siteSeoMetrics.descCompliance}%
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                siteSeoMetrics.descCompliance >= 80
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : siteSeoMetrics.descCompliance >= 50
                  ? 'text-purple-700 bg-purple-50 border-purple-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}>
                {siteSeoMetrics.descCompliantCount}/{pages.length} Optimal
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Full 125–165 char snippet</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-2xs ${
            siteSeoMetrics.descCompliance >= 80
              ? 'bg-emerald-50 text-emerald-600'
              : siteSeoMetrics.descCompliance >= 50
              ? 'bg-purple-50 text-purple-600'
              : 'bg-amber-50 text-amber-600'
          }`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 1ST: FULL WEBSITE GLOBAL SEO SECTION */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div 
          onClick={() => setIsGlobalSeoOpen(!isGlobalSeoOpen)}
          className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 cursor-pointer select-none hover:bg-gray-50/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Full Website Global SEO
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600">
              {isGlobalSeoOpen ? 'Hide Section' : 'Show Section'}
            </span>
            <div className="text-gray-400">
              {isGlobalSeoOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {isGlobalSeoOpen && (
          <div className="p-6 space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase mb-1">SITE / INSTITUTION NAME</label>
                    <input
                      type="text"
                      value={globalSeo.siteName}
                      onChange={(e) => setGlobalSeo({ ...globalSeo, siteName: e.target.value, brandName: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase mb-1">CANONICAL ROOT DOMAIN</label>
                    <input
                      type="text"
                      value={globalSeo.domainUrl}
                      onChange={(e) => setGlobalSeo({ ...globalSeo, domainUrl: e.target.value, canonicalDomain: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-800 uppercase">DEFAULT META TITLE TAG</label>
                    <span className="text-[11px] font-bold text-gray-500">
                      {globalSeo.defaultTitle.length} / 60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={globalSeo.defaultTitle}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, defaultTitle: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-800 uppercase">DEFAULT META DESCRIPTION TAG</label>
                    <span className="text-[11px] font-bold text-gray-500">
                      {globalSeo.defaultDescription.length} / 155 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={globalSeo.defaultDescription}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, defaultDescription: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">PRIMARY INSTITUTIONAL KEYWORDS</label>
                  <textarea
                    rows={2}
                    value={globalSeo.defaultKeywords}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, defaultKeywords: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                  />
                  {globalKeywordList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {globalKeywordList.map((kw, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md text-[11px] font-medium border border-blue-200">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase mb-1">OG SOCIAL SHARE IMAGE URL</label>
                    <input
                      type="text"
                      value={globalSeo.ogImageUrl}
                      onChange={(e) => setGlobalSeo({ ...globalSeo, ogImageUrl: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase mb-1">TWITTER / X HANDLE</label>
                    <input
                      type="text"
                      value={globalSeo.twitterHandle}
                      onChange={(e) => setGlobalSeo({ ...globalSeo, twitterHandle: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Google Search Console Verification Card */}
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                  <label className="block text-[11px] font-bold text-amber-900 uppercase">
                    GOOGLE SEARCH CONSOLE VERIFICATION TAG / CODE
                  </label>
                  <input
                    type="text"
                    value={globalSeo.googleVerificationToken}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, googleVerificationToken: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-amber-500 shadow-2xs font-mono"
                  />
                  <p className="text-[10px] text-amber-700">
                    Automatically injects &lt;meta name="google-site-verification" content="{globalSeo.googleVerificationToken}" /&gt; into website head.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveGlobalSeo}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Global Website SEO Settings</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Previews */}
              <div className="lg:col-span-5 space-y-5">
                <SerpPreview
                  title={globalSeo.defaultTitle}
                  description={globalSeo.defaultDescription}
                  url={globalSeo.domainUrl}
                  brand={globalSeo.brandName || currentTenant.name}
                  keywords={globalSeo.defaultKeywords}
                />

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>SOCIAL MEDIA OPENGRAPH CARD</span>
                  </div>
                  
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-gray-50">
                    <img 
                      src={globalSeo.ogImageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80"} 
                      alt="OG Preview" 
                      className="w-full h-36 object-cover bg-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('unsplash')) {
                          target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80';
                        }
                      }}
                    />
                    <div className="p-3 bg-white space-y-1">
                      <span className="text-[10px] text-gray-400 font-mono uppercase block">{displayHost}</span>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{globalSeo.defaultTitle}</h4>
                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">{globalSeo.defaultDescription}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 2ND: ALL INNER PAGES SEO TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-100 bg-white px-6 py-4 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>All Inner Pages SEO</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                  {pages.length}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[260px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search inner page SEO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs font-normal"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={() => exportPagesCsv(pages.map(p => {
                const audit = siteSeoMetrics.pageAudits.get(p.id);
                return {
                  id: p.id,
                  title: p.title,
                  url: getTargetPageUrl(p, globalSeo.domainUrl),
                  seoTitle: p.seoTitle,
                  description: p.description,
                  seoKeywords: p.seoKeywords,
                  seoScore: audit ? audit.score : (p.seoScore || 100),
                  status: (p.status as any) || 'published'
                };
              }))}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Inner Pages SEO Table */}
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-gray-200 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-6 w-60">INNER PAGE &amp; URL</th>
                  <th className="py-3 px-6">SEO META TITLE &amp; SNIPPET</th>
                  <th className="py-3 px-6 w-52">PRIMARY KEYWORDS</th>
                  <th className="py-3 px-6 text-center w-28">SEO SCORE</th>
                  <th className="py-3 px-6 text-center w-20">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredPages.map((page) => {
                  const kwList = (page.seoKeywords || '')
                    .split(',')
                    .map(k => k.trim())
                    .filter(Boolean);

                  const pageName = page.title || page.name || 'Webpage';
                  const titleLength = (page.seoTitle || pageName).length;
                  const descLength = (page.description || page.metaDescription || '').length;
                  const targetUrl = getTargetPageUrl(page, globalSeo.domainUrl);

                  let displaySlug = targetUrl;
                  try {
                    const parsed = new URL(targetUrl);
                    displaySlug = `${parsed.host}${parsed.pathname}`;
                  } catch {
                    displaySlug = targetUrl;
                  }

                  return (
                    <tr key={page.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-4 px-6 align-top">
                        <p className="font-bold text-gray-900">{pageName}</p>
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-mono mt-0.5 inline-flex items-center gap-1 group max-w-[220px] transition-colors"
                          title={`Open ${targetUrl} in new tab`}
                        >
                          <span className="truncate">{displaySlug}</span>
                          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                        </a>
                      </td>
                      <td className="py-4 px-6 align-top space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-mono text-[10px] uppercase font-semibold">TITLE:</span>
                          <span className="font-medium text-gray-900">{page.seoTitle || `${pageName} | ${currentTenant.name}`}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex-shrink-0">
                            {titleLength}/60
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="text-gray-400 font-mono text-[10px] uppercase font-semibold">DESC:</span>
                          <span className="text-gray-600 text-[11px] line-clamp-1">
                            {page.description || page.metaDescription || (
                              <span className="text-gray-400 italic">No description (empty page)</span>
                            )}
                          </span>
                          <span className="text-gray-400 text-[10px] whitespace-nowrap">{descLength}/155 characters</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 align-top">
                        {kwList.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[260px]">
                            {kwList.slice(0, 3).map((kw, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setSearchQuery(kw)}
                                className="inline-flex items-center px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 rounded text-[10px] font-medium border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                                title={`Click to search pages targeting "${kw}"`}
                              >
                                {kw}
                              </button>
                            ))}
                            {kwList.length > 3 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                                +{kwList.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No keywords</span>
                        )}
                      </td>
                      {/* SEO Score Column */}
                      <td className="py-4 px-6 text-center align-top">
                        {(() => {
                          const audit = siteSeoMetrics.pageAudits.get(page.id) || calculateSeoScore(
                            page.seoTitle || page.title || page.name || '',
                            page.description || page.metaDescription || '',
                            page.seoKeywords || page.metaKeywords || '',
                            { brand: globalSeo.brandName || currentTenant.name }
                          );
                          const isExcellent = audit.score >= 90;
                          const isGood = audit.score >= 70;
                          return (
                            <div className="inline-flex flex-col items-center">
                              <span className={`inline-flex items-center gap-1 font-extrabold text-xs px-2.5 py-0.5 rounded-full border ${
                                isExcellent
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                  : isGood
                                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                                  : 'text-rose-700 bg-rose-50 border-rose-200'
                              }`}>
                                {audit.score}%
                              </span>
                              <span className={`text-[9px] font-bold mt-1 tracking-wider uppercase ${
                                isExcellent
                                  ? 'text-emerald-600'
                                  : isGood
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}>
                                {audit.grade}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-6 text-center align-top">
                        <button
                          onClick={() => setPreviewPage(page)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Preview Google Search SERP"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Google Search Live Preview Popup Modal */}
      {previewPage && (
        <GoogleSearchPreviewModal
          page={previewPage}
          isOpen={Boolean(previewPage)}
          onClose={() => setPreviewPage(null)}
          brandName={globalSeo.brandName || currentTenant.name}
          domainUrl={globalSeo.domainUrl}
        />
      )}
    </div>
  );
};
