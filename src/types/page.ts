export interface WebPage {
  id: string;
  name: string;
  customLink?: string;
  slug?: string;
  seoTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showBreadcrumb?: boolean;
  breadcrumbImageUrl?: string;
  lastModified: string;
  type: 'custom' | 'builder';
}
