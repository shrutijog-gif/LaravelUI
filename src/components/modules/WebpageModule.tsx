import { PageItem, WebPage } from '../../types/page';
import { initialPages, STORAGE_KEY, getBaseOrigin } from '../../data/mockPageData';
import { getActiveTenant } from '../../data/tenantData';

export const LOCAL_STORAGE_KEY = STORAGE_KEY || 'college_cms_pages_v3';

export const getDynamicPageItems = (): PageItem[] => {
  const origin = getBaseOrigin();
  const collegeName = getActiveTenant()?.name || 'Lady Irwin College';

  return initialPages.map(p => {
    const slugName = (p.slug || p.name).toLowerCase().replace(/\s+/g, '-');
    return {
      id: p.id,
      title: p.name,
      name: p.name,
      slug: p.slug,
      customLink: p.customLink || `${origin}/${slugName}.html`,
      url: p.customLink || `${origin}/${slugName}.html`,
      seoTitle: p.seoTitle || `${p.name} | ${collegeName}`,
      description: p.metaDescription || '',
      metaDescription: p.metaDescription || '',
      seoKeywords: p.metaKeywords || '',
      metaKeywords: p.metaKeywords || '',
      seoScore: 100,
      lastModified: p.lastModified,
      type: p.type
    };
  });
};

export const INITIAL_PAGES: PageItem[] = getDynamicPageItems();

export { PageAdmin as WebpageModule, PageAdmin } from './website/pages/PageAdmin';
export type { PageItem, WebPage };
