import { SeoMetadata } from './seo';

export interface WebPage {
  id: string;
  name: string;
  customLink?: string;
  slug?: string;
  seoTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schemaType?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showBreadcrumb?: boolean;
  breadcrumbImageUrl?: string;
  lastModified: string;
  type: 'custom' | 'builder';
}

export interface PageItem {
  id: string;
  title: string;
  name?: string;
  slug?: string;
  customLink?: string;
  url?: string;
  template?: string;
  status?: string;
  description?: string;
  seoTitle?: string;
  seoKeywords?: string;
  metaKeywords?: string;
  metaDescription?: string;
  seoScore?: number;
  seoData?: SeoMetadata;
  lastModified?: string;
  type?: 'custom' | 'builder';
}


