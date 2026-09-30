import { GlobalWebsiteSeo } from '../types/seo';
import { PageItem } from '../components/modules/WebpageModule';
import { getActiveTenant, getTenantSeoDefaults } from '../data/tenantData';

const setOrUpdateMetaTag = (selector: string, attrName: string, attrValue: string, contentValue: string) => {
  if (typeof document === 'undefined') return;
  let meta = document.querySelector(selector) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attrName, attrValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', contentValue);
};

const setOrUpdateCanonical = (url: string) => {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

/**
 * Injects and synchronizes the active Global SEO & Webpage metadata directly into the document <head>.
 */
export const syncDomHeadSeo = (globalSeo?: Partial<GlobalWebsiteSeo>, activePage?: Partial<PageItem>) => {
  if (typeof document === 'undefined') return;

  const tenantDefaults = getTenantSeoDefaults(getActiveTenant());
  const defaultTitle = tenantDefaults.defaultTitle;
  const defaultDesc = tenantDefaults.defaultDescription;
  const defaultKeywords = tenantDefaults.defaultKeywords;
  const defaultUrl = tenantDefaults.domainUrl;
  const defaultOgImage = tenantDefaults.ogImageUrl;

  // Determine Title, Description, Keywords, URL, and OG Image
  const title = activePage?.seoTitle || activePage?.title || globalSeo?.defaultTitle || defaultTitle;
  const description = activePage?.description || (activePage as any)?.metaDescription || globalSeo?.defaultDescription || defaultDesc;
  const keywords = activePage?.seoKeywords || (activePage as any)?.metaKeywords || globalSeo?.defaultKeywords || defaultKeywords;
  const url = activePage?.url || (activePage as any)?.customLink || globalSeo?.canonicalDomain || globalSeo?.domainUrl || defaultUrl;
  const ogImage = globalSeo?.ogImageUrl || defaultOgImage;
  const gscToken = globalSeo?.googleVerificationToken || "ytG8KCRaBpMv8sS9T25XvxCoYIAAlII8iiSs3AAHEsc";

  // 1. Update Document Title
  document.title = title;

  // 2. Update Standard SEO Meta Tags
  setOrUpdateMetaTag('meta[name="description"]', 'name', 'description', description);
  setOrUpdateMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
  setOrUpdateMetaTag('meta[name="title"]', 'name', 'title', title);
  setOrUpdateMetaTag('meta[name="robots"]', 'name', 'robots', globalSeo?.robotsIndexing || 'index, follow');
  setOrUpdateMetaTag('meta[name="google-site-verification"]', 'name', 'google-site-verification', gscToken);

  // 3. Update Canonical Link
  setOrUpdateCanonical(url);

  // 4. Update OpenGraph / Social Meta Tags
  setOrUpdateMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
  setOrUpdateMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
  setOrUpdateMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
  setOrUpdateMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  setOrUpdateMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
  setOrUpdateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', globalSeo?.siteName || tenantDefaults.siteName);

  // 5. Update Twitter Cards
  setOrUpdateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setOrUpdateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setOrUpdateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setOrUpdateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
  setOrUpdateMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', url);

  // 6. Update / Inject JSON-LD Schema
  let script = document.querySelector('script#dynamic-seo-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'dynamic-seo-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    keywords: keywords,
    url: url,
    publisher: {
      '@type': 'EducationalOrganization',
      name: globalSeo?.siteName || getActiveTenant()?.name || "Lady Irwin College",
      url: globalSeo?.domainUrl || (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : "http://localhost:5173"),
      logo: ogImage
    }
  };
  script.textContent = JSON.stringify(schema, null, 2);
};

/**
 * Automatically synchronizes any selected page's SEO metadata into the document <head>.
 */
export const syncPageDomHead = (page: PageItem, globalSeo?: Partial<GlobalWebsiteSeo>) => {
  syncDomHeadSeo(globalSeo, page);
};

/**
 * Backwards compatibility helper for component callers using injectSeoIntoDom.
 */
export const injectSeoIntoDom = (data: {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
  institutionName?: string;
}) => {
  syncDomHeadSeo(
    { siteName: data.institutionName, canonicalDomain: data.canonicalUrl },
    { seoTitle: data.title, description: data.description, seoKeywords: data.keywords, url: data.canonicalUrl }
  );
};
