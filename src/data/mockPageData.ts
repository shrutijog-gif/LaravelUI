import { WebPage } from '../types/page';

const getBaseOrigin = () => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return 'http://localhost:5173';
};

export const initialPages: WebPage[] = [
  {
    id: 'p-1',
    name: 'Alumni Registration',
    customLink: `${getBaseOrigin()}/alumni-registration`,
    lastModified: '23/06/2026 at 12:39 pm',
    type: 'custom'
  },
  {
    id: 'p-2',
    name: 'test',
    lastModified: '23/06/2026 at 10:46 am',
    type: 'builder'
  },
  {
    id: 'p-3',
    name: 'Home_2',
    lastModified: '22/06/2026 at 10:23 am',
    type: 'builder'
  },
  {
    id: 'p-4',
    name: 'Student Center_2',
    lastModified: '08/06/2026 at 6:29 pm',
    type: 'builder'
  },
  {
    id: 'p-5',
    name: 'SSR',
    customLink: `${getBaseOrigin()}/ssr`,
    lastModified: '05/06/2026 at 11:45 am',
    type: 'custom'
  }
];

const PAGES_STORAGE_KEY = 'stored_web_pages';

export const getStoredWebPages = (): WebPage[] => {
  const origin = getBaseOrigin();
  try {
    const raw = localStorage.getItem(PAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Upgrade any previous hardcoded external URLs to current localhost/origin
        const updated = parsed.map((p: WebPage) => {
          if (p.customLink && (p.customLink.includes('whitecodetech.com') || p.customLink.includes('vpcollege'))) {
            const path = p.customLink.split('.com')[1] || `/${(p.slug || p.name).toLowerCase().replace(/\s+/g, '-')}`;
            return { ...p, customLink: `${origin}${path}` };
          }
          return p;
        });
        return updated;
      }
    }
  } catch (e) {
    console.error('Failed to load stored web pages:', e);
  }
  // Initialize storage with initialPages
  try {
    localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(initialPages));
  } catch (e) {
    // Ignore error
  }
  return initialPages;
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
  const isCustom = pageData.customLink && pageData.customLink.trim() !== '';
  const nowTimestamp = new Date().toLocaleDateString('en-GB') + ' at ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  
  const updated = current.map(p => {
    if (p.id === pageId) {
      return {
        ...p,
        ...pageData,
        name: pageData.name,
        customLink: pageData.customLink,
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

export const getStoredPagePuckData = (pageId: string, pageName?: string): any => {
  try {
    // 1. Check page-specific storage by ID
    const pageData = localStorage.getItem(`puck_page_${pageId}`);
    if (pageData) {
      const parsed = JSON.parse(pageData);
      if (parsed && Array.isArray(parsed.content)) {
        return parsed;
      }
    }

    // 2. Check by slug if name provided
    if (pageName) {
      const slug = pageName.toLowerCase().replace(/\s+/g, '-');
      const slugData = localStorage.getItem(`puck_page_${slug}`);
      if (slugData) {
        const parsed = JSON.parse(slugData);
        if (parsed && Array.isArray(parsed.content)) {
          return parsed;
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
