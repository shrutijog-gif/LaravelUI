export interface KeywordDetail {
  keyword: string;
  count: number;
  density: string;
  raw?: string;
  inTitle?: boolean;
  inDesc?: boolean;
  inContent?: boolean;
}

export interface ContentStats {
  wordCount: number;
  characterCount: number;
  readingTime: string;
}

export interface SeoMetadata {
  title: string;
  titleAlternatives: string[];
  description: string;
  descriptionAlternatives: string[];
  keywords: string;
  keywordDetails: KeywordDetail[];
  brand: string;
  topic: string;
  contentStats: ContentStats;
  score?: number;
}

export interface SeoAuditCheckItem {
  label: string;
  desc: string;
  status?: 'pass' | 'warning' | 'fail' | 'info';
  score?: number;
  maxScore?: number;
}

export interface SeoAuditScoreResult {
  score: number;
  grade: 'EXCELLENT' | 'GOOD' | 'CRITICAL';
  color: string;
  passes: SeoAuditCheckItem[];
  deductions: SeoAuditCheckItem[];
  checks?: SeoAuditCheckItem[];
}

export interface GlobalWebsiteSeo {
  siteName: string;
  domainUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  brandName: string;
  canonicalDomain: string;
  ogImageUrl: string;
  twitterHandle: string;
  robotsIndexing: 'index, follow' | 'noindex, nofollow' | 'index, nofollow';
  schemaType: 'EducationalOrganization' | 'CollegeOrUniversity' | 'Organization';
  contactEmail: string;
  contactPhone: string;
  addressLocality: string;
  googleVerificationToken?: string;
}

export interface InnerPageSeoItem {
  id: string;
  title: string;
  slug: string;
  url: string;
  status: 'published' | 'draft';
  lastModified: string;
  template?: string;
  seoTitle: string;
  description: string;
  seoKeywords: string;
  seoScore: number;
  indexable: boolean;
  sectionsCount?: number;
  seoData?: SeoMetadata;
}

export interface WebsiteSeoAuditSummary {
  overallScore: number;
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  highScorePages: number;
  lowScorePages: number;
  validTitlesCount: number;
  validDescCount: number;
  sitemapStatus: 'healthy' | 'warning' | 'error';
  robotsStatus: 'active' | 'inactive';
}
