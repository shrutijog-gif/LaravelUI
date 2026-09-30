import { WebPage } from '../types/page';
import { getActiveTenant } from './tenantData';
import { formatOptimalSeoTitle, formatOptimalSeoDescription, formatOptimalSeoKeywords } from '../services/aiAgentService';

export const getBaseOrigin = () => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return 'http://localhost:5173';
};

export const getDynamicInitialPages = (): WebPage[] => {
  const tenant = getActiveTenant();
  const origin = getBaseOrigin();
  const collegeName = tenant?.name || 'Lady Irwin College';
  
  return [
    {
      id: 'p-1',
      name: 'NovaTech Solutions',
      slug: 'novatech',
      customLink: `${origin}/novatech.html`,
      seoTitle: `NovaTech Solutions Academic Portal | ${collegeName}`,
      metaDescription: `Discover official details, syllabus guidelines, faculty directory, and admissions updates for NovaTech Solutions at ${collegeName}.`,
      metaKeywords: `novatech solutions, novatech solutions programs, ${collegeName.toLowerCase()}, academic portal, naac accredited, higher education`,
      lastModified: '08/09/2026 at 10:15 am',
      type: 'builder'
    },
    {
      id: 'p-2',
      name: 'Vision+ Digital Agency',
      slug: 'vision-plus',
      customLink: `${origin}/vision-plus.html`,
      seoTitle: `Vision Digital Agency Academic Portal | ${collegeName}`,
      metaDescription: `Discover official digital innovation programs, syllabus guidelines, faculty directory, and student resources at ${collegeName}.`,
      metaKeywords: `vision plus, digital agency, ${collegeName.toLowerCase()}, academic portal, higher education`,
      lastModified: '04/09/2026 at 12:25 pm',
      type: 'builder'
    },
    {
      id: 'p-3',
      name: 'Mobile Shopping Store',
      slug: 'mobile-shopping',
      customLink: `${origin}/mobile-shopping.html`,
      seoTitle: `Mobile Shopping Store Academic Portal | ${collegeName}`,
      metaDescription: `Discover official campus store, merchandise publications, academic resources, and student supplies online at ${collegeName}.`,
      metaKeywords: `mobile shopping, campus store, ${collegeName.toLowerCase()}, college merchandise, student portal`,
      lastModified: '04/09/2026 at 12:15 pm',
      type: 'builder'
    },
    {
      id: 'p-4',
      name: 'About IQAC_3',
      customLink: `${origin}/about-iqac-3.html`,
      slug: 'about-iqac-3',
      seoTitle: `Internal Quality Assurance Cell | ${collegeName}`,
      metaDescription: `Discover Internal Quality Assurance Cell (IQAC) initiatives, NAAC accreditation rankings, and quality sustenance benchmarks at ${collegeName}.`,
      metaKeywords: `iqac, internal quality assurance, naac accreditation, quality benchmarks, ${collegeName.toLowerCase()}`,
      lastModified: '31/08/2026 at 4:29 pm',
      type: 'builder'
    },
    {
      id: 'p-5',
      name: 'abcd',
      customLink: `${origin}/abcd.html`,
      slug: 'abcd',
      seoTitle: `Department of ABCD Academic Portal | ${collegeName}`,
      metaDescription: `Discover official curriculum details, syllabus guidelines, faculty directory, and academic announcements for ABCD at ${collegeName}.`,
      metaKeywords: `abcd portal, academic programs, college notices, department syllabus, student center, ${collegeName.toLowerCase()}`,
      lastModified: '31/08/2026 at 2:39 pm',
      type: 'builder'
    },
    {
      id: 'p-6',
      name: 'About College',
      customLink: `${origin}/about-college.html`,
      slug: 'about-college',
      seoTitle: `Institutional Legacy & Governance | ${collegeName}`,
      metaDescription: `Discover institutional legacy, NAAC accreditation rankings, academic mission, faculty excellence, and governance at ${collegeName}.`,
      metaKeywords: `about college, ${collegeName.toLowerCase()}, naac accredited, higher education, college history`,
      lastModified: '27/08/2026 at 11:30 am',
      type: 'builder'
    },
    {
      id: 'p-7',
      name: '360% View',
      customLink: `${origin}/360-view.html`,
      slug: '360-view',
      seoTitle: `360 Virtual Campus Tour & Info | ${collegeName}`,
      metaDescription: `Explore immersive 360-degree virtual campus tour, digital library, advanced research laboratories, and facilities at ${collegeName}.`,
      metaKeywords: `360 view, virtual tour, campus tour, ${collegeName.toLowerCase()}, digital campus, college infrastructure`,
      lastModified: '18/08/2026 at 3:45 pm',
      type: 'builder'
    }
  ];
};

export const initialPages: WebPage[] = getDynamicInitialPages();

export const PAGES_STORAGE_KEY = 'stored_web_pages';
export const STORAGE_KEY = PAGES_STORAGE_KEY;
export const LOCAL_STORAGE_KEY = PAGES_STORAGE_KEY;

export const getStoredPagePuckData = (pageId: string, pageName?: string): any => {
  try {
    const keysToCheck: string[] = [];
    if (pageId) {
      keysToCheck.push(`puck_page_${pageId}`);
      keysToCheck.push(`puck_data_${pageId}`);
      keysToCheck.push(`puck_${pageId}`);
    }
    if (pageName) {
      const slug = pageName.toLowerCase().replace(/\s+/g, '-');
      keysToCheck.push(`puck_page_${slug}`);
      keysToCheck.push(`puck_data_${slug}`);
      keysToCheck.push(`puck_${slug}`);
    }

    for (const key of keysToCheck) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.content) && parsed.content.length > 0) {
            return parsed;
          }
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.content)) {
            return parsed;
          }
        } catch {
          // continue
        }
      }
    }
  } catch (e) {
    console.error(`Failed to load Puck data for page ${pageId}:`, e);
  }

  // Each page is strictly isolated. New/empty pages start fresh with no content.
  return {
    content: [],
    root: {},
  };
};

export const extractPageContentText = (
  pageId: string, 
  pageName?: string, 
  customLink?: string
): string => {
  // 1. Check Puck canvas content in localStorage
  if (pageId) {
    const puckData = getStoredPagePuckData(pageId, pageName);
    if (puckData && Array.isArray(puckData.content) && puckData.content.length > 0) {
      const collected: string[] = [];

      const ignoredPropKeys = new Set([
        'height', 'width', 'mode', 'theme', 'className', 'style', 'id', 'key', 'type', 
        'format', 'color', 'background', 'padding', 'margin', 'borderRadius', 'border', 
        'fontSize', 'lineHeight', 'textAlign', 'codeType', 'editorType', 'name'
      ]);

      const sanitizeRawText = (raw: string): string => {
        return raw
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/https?:\/\/\S+/gi, ' ')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&amp;/gi, '&')
          .replace(/&quot;/gi, '"')
          .replace(/&#39;/gi, "'")
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          // Strip CSS measurements like 500px, 100vh, 20rem, 100%
          .replace(/\b\d+\s*(px|rem|em|pt|vh|vw|%|deg|ms|s)\b/gi, ' ')
          // Strip hex colors and hash codes like #76778e00 or 76778e00
          .replace(/#[0-9a-fA-F]{3,8}\b/g, ' ')
          .replace(/\b[0-9a-fA-F]{6,12}\b/g, ' ')
          // Strip technical code-editor words
          .replace(/\b(codeeditor|code\s*editor|default|props|classname|style)\b/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      };

      const extractFromObject = (obj: any, keyName?: string) => {
        if (!obj) return;
        if (keyName && ignoredPropKeys.has(keyName.toLowerCase())) {
          return;
        }

        if (typeof obj === 'string') {
          const clean = sanitizeRawText(obj);
          if (clean && !clean.startsWith('data:image') && !clean.startsWith('data:application/pdf')) {
            collected.push(clean);
          }
        } else if (Array.isArray(obj)) {
          obj.forEach(item => extractFromObject(item));
        } else if (typeof obj === 'object') {
          for (const [k, v] of Object.entries(obj)) {
            extractFromObject(v, k);
          }
        }
      };

      puckData.content.forEach((block: any) => {
        if (block && block.props) {
          // If this is a CodeEditor block, extract text from HTML code cleanly
          if (block.type === 'CodeEditor' && typeof block.props.code === 'string') {
            const htmlText = parseHtmlMainBodyText(block.props.code);
            const cleaned = sanitizeRawText(htmlText);
            if (cleaned) collected.push(cleaned);
          } else {
            extractFromObject(block.props);
          }
        }
      });

      const canvasText = collected.join(' ').replace(/\s+/g, ' ').trim();
      if (canvasText.length > 0) {
        return canvasText;
      }
    }
  }

  // 2. Only check custom link if it is a genuine EXTERNAL URL (not an internal builder page on localhost / origin)
  const rawLink = (customLink || '').trim();
  const origin = getBaseOrigin();
  const isExternalCustom = Boolean(
    rawLink &&
    rawLink !== '#' &&
    rawLink !== '/' &&
    !rawLink.startsWith('/') &&
    !rawLink.includes('localhost') &&
    !rawLink.includes(':5173') &&
    !rawLink.includes(origin) &&
    (rawLink.startsWith('http://') || rawLink.startsWith('https://'))
  );

  if (isExternalCustom) {
    const urlTokens = rawLink
      .replace(/^https?:\/\//i, '')
      .replace(/\.(html|htm|php|aspx|pdf|jsp)$/i, '')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim();

    const segments: string[] = [];
    if (pageName && pageName.trim()) {
      segments.push(pageName.trim());
    }
    if (urlTokens) {
      segments.push(urlTokens);
    }
    return segments.join(' - ').replace(/\s+/g, ' ').trim();
  }

  // If no canvas content and not an external custom link, this page has NO main content data!
  return '';
};

/**
 * Cleanly parse and extract the main content body part from HTML text,
 * stripping out navigation, headers, footers, scripts, and styles.
 */
export function parseHtmlMainBodyText(html: string): string {
  try {
    if (typeof window === 'undefined') return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove noise elements
    const unwanted = doc.querySelectorAll('script, style, noscript, svg, iframe, header, nav, footer, .footer, .header, .navbar, .nav, .sidebar, .menu');
    unwanted.forEach(el => el.remove());

    // Target the primary main content body part
    const mainElement = 
      doc.querySelector('main') || 
      doc.querySelector('article') || 
      doc.querySelector('[role="main"]') || 
      doc.querySelector('#content') || 
      doc.querySelector('.content') || 
      doc.querySelector('.main-content') || 
      doc.querySelector('#main') || 
      doc.body;

    if (!mainElement) return '';

    const text = mainElement.textContent || '';
    return text
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 4500);
  } catch (e) {
    console.warn('Error parsing HTML body content:', e);
    return '';
  }
}

/**
 * Fetch and extract the main content body part directly from an external webpage URL.
 */
export async function fetchAndExtractWebpageBodyContent(url: string): Promise<string> {
  if (!url || !url.startsWith('http')) return '';

  // 1. Try direct fetch
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const html = await res.text();
      const bodyText = parseHtmlMainBodyText(html);
      if (bodyText && bodyText.length > 25) {
        return bodyText;
      }
    }
  } catch {
    // Direct fetch might be blocked by CORS or network, proceed to proxy fallback
  }

  // 2. Try CORS proxy fallback for external webpage URLs
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const html = await res.text();
      const bodyText = parseHtmlMainBodyText(html);
      if (bodyText && bodyText.length > 25) {
        return bodyText;
      }
    }
  } catch {
    // Proxy fetch failed
  }

  return '';
}

/**
 * Analyze the entire URL of a webpage and extract its main content body part.
 * - For internal pages: analyzes Puck canvas blocks in localStorage.
 * - For external pages: fetches and parses the actual HTML main body part.
 */
export async function extractWebpageBodyContentFromEntireUrl(
  url: string, 
  pageTitle?: string, 
  pageId?: string
): Promise<string> {
  if (!url) return '';
  const cleanUrl = url.trim();

  // 1. Check if URL points to an internal webpage
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:5173';
  const isInternal = cleanUrl.startsWith('/') || cleanUrl.includes('localhost') || cleanUrl.includes(':5173') || cleanUrl.includes(origin);

  if (isInternal || pageId) {
    let slug = '';
    try {
      const parsed = new URL(cleanUrl, origin);
      slug = parsed.searchParams.get('page') || parsed.pathname.replace(/^\/+|\.(html|htm|php)$/gi, '').trim();
    } catch {
      slug = cleanUrl.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+|\.(html|htm|php)$/gi, '').trim();
    }

    const pages = getStoredWebPages();
    const matched = pages.find(p => 
      (pageId && p.id === pageId) || 
      (slug && (p.slug === slug || p.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() || p.id === slug)) ||
      (pageTitle && p.name.toLowerCase() === pageTitle.toLowerCase()) ||
      p.customLink === cleanUrl
    );

    const resolvedId = matched?.id || pageId || slug;
    const resolvedName = matched?.name || pageTitle || slug;
    
    // Extract Puck canvas body content
    const canvasContent = extractPageContentText(resolvedId, resolvedName, cleanUrl);
    if (canvasContent && canvasContent.trim().length > 0) {
      return canvasContent.trim();
    }

    // If internal page has no canvas content (like t2), return empty
    return '';
  }

  // 2. If it is an external URL, fetch and extract the actual main content body part
  const fetchedBody = await fetchAndExtractWebpageBodyContent(cleanUrl);
  if (fetchedBody && fetchedBody.trim().length > 0) {
    return fetchedBody.trim();
  }

  // 3. Fallback: extract topic tokens from URL
  return extractPageContentText('', pageTitle, cleanUrl);
}

export const getStoredWebPages = (): WebPage[] => {
  const origin = getBaseOrigin();
  const tenant = getActiveTenant();
  const currentCollegeName = tenant?.name || 'Lady Irwin College';

  try {
    const raw = localStorage.getItem(PAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const updated = parsed.map((p: any) => {
          const pageName = (p.name || p.title || 'Page').trim();
          const cleanSlug = (p.slug || pageName).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');

          let customLink = (p.customLink || p.url || '').trim();

          let seoTitle = (p.seoTitle || p.metaTitle || '').trim();
          if (seoTitle.includes('undefined') || !seoTitle || seoTitle.length < 45 || seoTitle.length > 62 || !/[|\-–—:]/.test(seoTitle)) {
            seoTitle = formatOptimalSeoTitle(pageName, currentCollegeName);
          }
          if (seoTitle.includes('Vidya Pratishthan')) {
            seoTitle = seoTitle.replace(/Vidya Pratishthan's ASC College Baramati|Vidya Pratishthan's College Baramati|Vidya Pratishthan Baramati|Vidya Pratishthan/g, currentCollegeName);
          }

          const pageContent = extractPageContentText(p.id, pageName, customLink);
          const hasContent = pageContent.trim().length > 0;

          let metaDesc = (p.metaDescription || p.description || '').trim();
          const hasInvalidDescFormat = !metaDesc || metaDesc.includes('undefined') || metaDesc.length < 125 || metaDesc.length > 165 || !/[.!?]$/.test(metaDesc) || /[<>{}]|style\s*=|width\s*:|px|<\/th>|<\/td>|<\/tr>|https?:\/\//i.test(metaDesc);
          if (!hasContent) {
            // If any content or data is not in that page, description will not be generated because data is not there
            metaDesc = '';
          } else if (hasInvalidDescFormat) {
            metaDesc = formatOptimalSeoDescription(pageName, currentCollegeName, pageContent);
          }
          if (metaDesc.includes('Vidya Pratishthan')) {
            metaDesc = metaDesc.replace(/Vidya Pratishthan Arts, Science and Commerce College Baramati|Vidya Pratishthan College Baramati|Vidya Pratishthan/g, currentCollegeName);
          }

          let metaKeywords = (p.metaKeywords || p.seoKeywords || '').trim();
          const hasInvalidKwFormat = !metaKeywords || metaKeywords.includes('undefined') || metaKeywords.split(',').length < 4 || /[<>{}]|style\s*=|width\s*:|px|https?:\/\//i.test(metaKeywords);
          if (!hasContent) {
            // If any content or data is not in that page, keywords will not be generated because data is not there
            metaKeywords = '';
          } else if (hasInvalidKwFormat) {
            metaKeywords = formatOptimalSeoKeywords(pageName, currentCollegeName, pageContent);
          }

          const isExplicitExternalCustom = Boolean(
            p.type === 'custom' || (
              customLink && 
              customLink !== '' &&
              !customLink.startsWith('/') && 
              !customLink.includes(origin) && 
              !customLink.includes('localhost') && 
              !customLink.includes(':5173')
            )
          );
          const resolvedType: 'custom' | 'builder' = isExplicitExternalCustom ? 'custom' : 'builder';

          return { 
            ...p, 
            id: p.id || `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: pageName,
            slug: p.slug || cleanSlug,
            customLink: isExplicitExternalCustom && customLink ? customLink : `${origin}/${cleanSlug}`,
            seoTitle: seoTitle,
            metaDescription: metaDesc,
            metaKeywords: metaKeywords,
            lastModified: p.lastModified || 'Just now',
            type: resolvedType
          };
        });
        try {
          localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      }
    }
  } catch (e) {
    console.error('Failed to load stored web pages:', e);
  }
  
  const freshPages = getDynamicInitialPages().map(p => {
    const pageContent = extractPageContentText(p.id, p.name, p.customLink);
    const hasContent = pageContent.trim().length > 0;
    return {
      ...p,
      metaDescription: hasContent ? p.metaDescription : '',
      metaKeywords: hasContent ? p.metaKeywords : '',
    };
  });
  try {
    localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(freshPages));
  } catch (e) {
    // Ignore error
  }
  return freshPages;
};

export const saveStoredWebPages = (pages: WebPage[]): void => {
  try {
    localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(pages));
    window.dispatchEvent(new CustomEvent('web-pages-updated', { detail: pages }));
  } catch (e) {
    console.error('Failed to save web pages:', e);
  }
};

export const updateStoredWebPage = (pageId: string, pageData: Partial<WebPage> & { name: string; customLink?: string }): WebPage[] => {
  const current = getStoredWebPages();
  const nowTimestamp = new Date().toLocaleDateString('en-GB') + ' at ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  const origin = getBaseOrigin();

  const updated = current.map(p => {
    if (p.id === pageId) {
      const customLink = pageData.customLink !== undefined ? pageData.customLink.trim() : (p.customLink || '').trim();
      const isCustom = Boolean(
        pageData.type === 'custom' || (
          customLink &&
          customLink !== '' &&
          !customLink.startsWith('/') &&
          !customLink.includes(origin) &&
          !customLink.includes('localhost') &&
          !customLink.includes(':5173')
        )
      );
      return {
        ...p,
        ...pageData,
        name: pageData.name,
        customLink: isCustom && customLink ? customLink : `${origin}/${pageData.slug || p.slug || pageData.name.toLowerCase().trim().replace(/\s+/g, '-')}`,
        type: (isCustom ? 'custom' : 'builder') as 'custom' | 'builder',
        lastModified: nowTimestamp,
      };
    }
    return p;
  });

  saveStoredWebPages(updated);
  return updated;
};

export const duplicateStoredWebPage = (pageId: string): WebPage | null => {
  const current = getStoredWebPages();
  const original = current.find(p => p.id === pageId);
  if (!original) return null;

  const newId = `p-${Date.now()}`;
  const newName = `${original.name} (Copy)`;
  const nowTimestamp = new Date().toLocaleDateString('en-GB') + ' at ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

  const newPage: WebPage = {
    ...original,
    id: newId,
    name: newName,
    lastModified: nowTimestamp,
  };

  // Duplicate the underlying Puck data as well
  try {
    const existingPuckData = localStorage.getItem(`puck_page_${pageId}`);
    if (existingPuckData) {
      localStorage.setItem(`puck_page_${newId}`, existingPuckData);
    }
  } catch (e) {
    console.error('Failed to duplicate Puck data:', e);
  }

  const updatedPages = [newPage, ...current];
  saveStoredWebPages(updatedPages);
  return newPage;
};

export const deleteStoredWebPage = (pageId: string): WebPage[] => {
  const current = getStoredWebPages();
  const updated = current.filter(p => p.id !== pageId);
  saveStoredWebPages(updated);
  try {
    localStorage.removeItem(`puck_page_${pageId}`);
  } catch (e) {
    // Ignore error
  }
  return updated;
};

export const saveStoredPagePuckData = (pageId: string, data: any, pageName?: string): void => {
  try {
    // 1. Save page-specific data ONLY to this page's ID key
    localStorage.setItem(`puck_page_${pageId}`, JSON.stringify(data));

    // 2. Save by slug if name provided
    if (pageName) {
      const slug = pageName.toLowerCase().replace(/\s+/g, '-');
      localStorage.setItem(`puck_page_${slug}`, JSON.stringify(data));
    }

    // 3. Update the page's lastModified timestamp in the pages list
    const currentPages = getStoredWebPages();
    const nowTimestamp = new Date().toLocaleDateString('en-GB') + ' at ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    const updated = currentPages.map(p => {
      if (p.id === pageId) {
        return { ...p, lastModified: nowTimestamp };
      }
      return p;
    });
    saveStoredWebPages(updated);
  } catch (e) {
    console.error(`Failed to save Puck data for page ${pageId}:`, e);
  }
};

