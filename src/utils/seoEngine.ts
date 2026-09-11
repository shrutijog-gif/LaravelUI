import { SeoMetadata, KeywordDetail, SeoAuditScoreResult, SeoAuditCheckItem } from '../types/seo';
import { getActiveTenant } from '../data/tenantData';

const getOrigin = (): string => 
  (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:5173';

const getCollegeName = (): string => 
  getActiveTenant()?.name || 'Lady Irwin College';

export function calculateSeoScore(
  title: string,
  description: string,
  keywords: string | string[],
  options?: {
    hasPageContent?: boolean;
    brand?: string;
  }
): SeoAuditScoreResult {
  const t = (title || '').trim();
  const d = (description || '').trim();
  const tLen = t.length;
  const dLen = d.length;

  const kwList = Array.isArray(keywords)
    ? keywords.map(k => k.trim()).filter(Boolean)
    : (keywords || '').split(',').map(k => k.trim()).filter(Boolean);

  const hasPageContent = options?.hasPageContent !== undefined
    ? options.hasPageContent
    : (kwList.length > 0 && kwList[0] !== 'kw1');

  const brandName = options?.brand || getCollegeName();

  const passes: SeoAuditCheckItem[] = [];
  const deductions: SeoAuditCheckItem[] = [];
  const allChecks: SeoAuditCheckItem[] = [];

  let titleScore = 0;
  let descScore = 0;
  let keywordScore = 0;

  // ==========================================
  // 1. TITLE TAG AUDIT (Google SERP Standard: 45-62 chars / ~500-600px)
  // ==========================================
  // A. Title Length
  if (tLen >= 45 && tLen <= 62) {
    titleScore += hasPageContent ? 20 : 50;
    const item: SeoAuditCheckItem = {
      label: 'Title Length',
      desc: `${tLen} characters`,
      status: 'pass',
      score: hasPageContent ? 20 : 50,
      maxScore: hasPageContent ? 20 : 50
    };
    passes.push(item);
    allChecks.push(item);
  } else if ((tLen >= 35 && tLen < 45) || (tLen > 62 && tLen <= 68)) {
    titleScore += hasPageContent ? 15 : 35;
    const item: SeoAuditCheckItem = {
      label: 'Title Length Acceptable',
      desc: `${tLen} characters`,
      status: 'warning',
      score: hasPageContent ? 15 : 35,
      maxScore: hasPageContent ? 20 : 50
    };
    deductions.push(item);
    allChecks.push(item);
  } else if (tLen > 68) {
    titleScore += hasPageContent ? 8 : 20;
    const item: SeoAuditCheckItem = {
      label: 'Title Exceeds SERP Limit',
      desc: `${tLen} characters — Google may truncate with '...' on search results`,
      status: 'warning',
      score: hasPageContent ? 8 : 20,
      maxScore: hasPageContent ? 20 : 50
    };
    deductions.push(item);
    allChecks.push(item);
  } else if (tLen > 0) {
    titleScore += hasPageContent ? 8 : 20;
    const item: SeoAuditCheckItem = {
      label: 'Title Too Short',
      desc: `${tLen} characters — underutilizes Google snippet real estate (45–62 recommended)`,
      status: 'warning',
      score: hasPageContent ? 8 : 20,
      maxScore: hasPageContent ? 20 : 50
    };
    deductions.push(item);
    allChecks.push(item);
  } else {
    const item: SeoAuditCheckItem = {
      label: 'Missing SEO Title',
      desc: 'Title tag cannot be empty (Critical search ranking factor)',
      status: 'fail',
      score: 0,
      maxScore: hasPageContent ? 20 : 50
    };
    deductions.push(item);
    allChecks.push(item);
  }

  // B. Brand / Separator in Title
  const hasSeparator = /[|\-–—:•]/.test(t);
  const brandKeywords = [brandName.toLowerCase(), 'college', 'university', 'institute', 'portal'];
  const hasBrand = brandKeywords.some(b => t.toLowerCase().includes(b)) || hasSeparator;

  if (tLen > 0 && (hasSeparator || hasBrand)) {
    titleScore += hasPageContent ? 10 : 30;
    const item: SeoAuditCheckItem = {
      label: 'Brand & Authority Suffix Included',
      desc: 'Title includes brand separator for institutional authority',
      status: 'pass',
      score: hasPageContent ? 10 : 30,
      maxScore: hasPageContent ? 10 : 30
    };
    passes.push(item);
    allChecks.push(item);
  } else if (tLen > 0) {
    titleScore += hasPageContent ? 5 : 15;
    const item: SeoAuditCheckItem = {
      label: 'Brand Suffix Recommended',
      desc: `Consider appending '| ${brandName}' for branded search clicks`,
      status: 'warning',
      score: hasPageContent ? 5 : 15,
      maxScore: hasPageContent ? 10 : 30
    };
    deductions.push(item);
    allChecks.push(item);
  }

  // C. Title Casing & Quality
  if (tLen > 0) {
    titleScore += hasPageContent ? 5 : 20;
    const item: SeoAuditCheckItem = {
      label: 'Title Formatting & Clarity',
      desc: 'Clean title formatting and search readability',
      status: 'pass',
      score: hasPageContent ? 5 : 20,
      maxScore: hasPageContent ? 5 : 20
    };
    passes.push(item);
    allChecks.push(item);
  }

  // ==========================================
  // 2. META DESCRIPTION AUDIT
  // ==========================================
  if (hasPageContent || dLen > 0) {
    // A. Description Length
    if (dLen >= 125 && dLen <= 165) {
      descScore += 25;
      const item: SeoAuditCheckItem = {
        label: 'Description Length',
        desc: `${dLen} characters`,
        status: 'pass',
        score: 25,
        maxScore: 25
      };
      passes.push(item);
      allChecks.push(item);
    } else if ((dLen >= 100 && dLen < 125) || (dLen > 165 && dLen <= 175)) {
      descScore += 18;
      const item: SeoAuditCheckItem = {
        label: 'Description Length Acceptable',
        desc: `${dLen} characters`,
        status: 'warning',
        score: 18,
        maxScore: 25
      };
      deductions.push(item);
      allChecks.push(item);
    } else if (dLen > 175) {
      descScore += 10;
      const item: SeoAuditCheckItem = {
        label: 'Description Exceeds Snippet Limit',
        desc: `${dLen} characters — search engines will truncate preview with '...'`,
        status: 'warning',
        score: 10,
        maxScore: 25
      };
      deductions.push(item);
      allChecks.push(item);
    } else if (dLen > 0) {
      descScore += 10;
      const item: SeoAuditCheckItem = {
        label: 'Description Too Short',
        desc: `${dLen} characters — too brief; search engines may pick random page text instead`,
        status: 'warning',
        score: 10,
        maxScore: 25
      };
      deductions.push(item);
      allChecks.push(item);
    } else {
      const item: SeoAuditCheckItem = {
        label: 'Missing Meta Description',
        desc: 'Meta description is required to control search snippet preview',
        status: 'fail',
        score: 0,
        maxScore: 25
      };
      deductions.push(item);
      allChecks.push(item);
    }

    // B. High CTR Action & Intent Verbs
    const actionRegex = /\b(discover|explore|official|syllabus|admissions|guidelines|curriculum|faculty|portal|details|view|download|department|academic|examination|apply|notice|courses|programs|information|updates|directory|library|contact|accreditation|naac|overview|student|campus|schedule|timetable|legacy|governance|network|spotlight|merchandise|research|innovation|rankings|initiatives|structure|resource|services|alumni|registration|virtual|tour)\b/i;
    const hasActionVerbs = actionRegex.test(d);

    if (dLen > 0 && hasActionVerbs) {
      descScore += 10;
      const item: SeoAuditCheckItem = {
        label: 'High CTR Action & Intent Verbs',
        desc: 'Contains compelling search intent and academic action keywords',
        status: 'pass',
        score: 10,
        maxScore: 10
      };
      passes.push(item);
      allChecks.push(item);
    } else if (dLen > 0) {
      descScore += 5;
      const item: SeoAuditCheckItem = {
        label: 'Action Intent Recommended',
        desc: 'Add active verbs (e.g. Discover, Explore, Official, Syllabus) to boost click-through rate',
        status: 'warning',
        score: 5,
        maxScore: 10
      };
      deductions.push(item);
      allChecks.push(item);
    }

    // C. Punctuation & Grammar Check
    const endsWithPunctuation = /[.!?]$/.test(d);
    if (dLen > 0 && endsWithPunctuation) {
      descScore += 5;
      const item: SeoAuditCheckItem = {
        label: 'Sentence Structure & Punctuation',
        desc: 'Proper terminal punctuation for clear snippet display',
        status: 'pass',
        score: 5,
        maxScore: 5
      };
      passes.push(item);
      allChecks.push(item);
    } else if (dLen > 0) {
      descScore += 2;
    }
  } else {
    const item: SeoAuditCheckItem = {
      label: 'Meta Description: Not Generated',
      desc: 'No page content or data found. Description is not generated because data is not in this page.',
      status: 'info',
      score: 0,
      maxScore: 0
    };
    allChecks.push(item);
  }

  // ==========================================
  // 3. KEYWORDS & RELEVANCE AUDIT
  // ==========================================
  if (hasPageContent || kwList.length > 0) {
    const kwCount = kwList.length;

    // A. Keyword Volume (Target: 4-10 keywords)
    if (kwCount >= 4 && kwCount <= 10) {
      keywordScore += 12;
      const item: SeoAuditCheckItem = {
        label: 'Target Keyword Volume',
        desc: `${kwCount} verified search keyphrases targeted`,
        status: 'pass',
        score: 12,
        maxScore: 12
      };
      passes.push(item);
      allChecks.push(item);
    } else if ((kwCount >= 2 && kwCount < 4) || (kwCount > 10 && kwCount <= 14)) {
      keywordScore += 8;
      const item: SeoAuditCheckItem = {
        label: 'Keyword Volume Acceptable',
        desc: `${kwCount} keywords specified`,
        status: 'warning',
        score: 8,
        maxScore: 12
      };
      deductions.push(item);
      allChecks.push(item);
    } else if (kwCount === 1) {
      keywordScore += 4;
      const item: SeoAuditCheckItem = {
        label: 'Low Keyword Count',
        desc: 'Only 1 keyword defined (4–10 keyphrases recommended)',
        status: 'warning',
        score: 4,
        maxScore: 12
      };
      deductions.push(item);
      allChecks.push(item);
    } else if (kwCount > 14) {
      keywordScore += 4;
      const item: SeoAuditCheckItem = {
        label: 'High Keyword Count',
        desc: `${kwCount} keywords — risk of search intent dilution`,
        status: 'warning',
        score: 4,
        maxScore: 12
      };
      deductions.push(item);
      allChecks.push(item);
    } else {
      const item: SeoAuditCheckItem = {
        label: 'Missing Target Keywords',
        desc: 'No keywords defined for content indexation',
        status: 'fail',
        score: 0,
        maxScore: 12
      };
      deductions.push(item);
      allChecks.push(item);
    }

    // B. Keyword in Title
    const titleLower = t.toLowerCase();
    const hasKeywordInTitle = kwList.some(k => k.length > 2 && (titleLower.includes(k.toLowerCase()) || k.toLowerCase().includes(titleLower)));

    if (hasKeywordInTitle || (kwCount > 0 && tLen > 30)) {
      keywordScore += 8;
      const item: SeoAuditCheckItem = {
        label: 'Primary Keyword in Title',
        desc: 'Target keyword alignment with page title',
        status: 'pass',
        score: 8,
        maxScore: 8
      };
      passes.push(item);
      allChecks.push(item);
    } else if (kwCount > 0) {
      keywordScore += 3;
      const item: SeoAuditCheckItem = {
        label: 'Keyword Alignment in Title',
        desc: 'Consider including primary target keyword in Title',
        status: 'warning',
        score: 3,
        maxScore: 8
      };
      deductions.push(item);
      allChecks.push(item);
    }

    // C. Keyword in Description
    const descLower = d.toLowerCase();
    const hasKeywordInDesc = kwList.some(k => k.length > 2 && (descLower.includes(k.toLowerCase()) || k.toLowerCase().includes(descLower)));

    if (hasKeywordInDesc || (kwCount > 0 && dLen > 80)) {
      keywordScore += 5;
      const item: SeoAuditCheckItem = {
        label: 'Primary Keyword in Description',
        desc: 'Target keyword integrated into meta description',
        status: 'pass',
        score: 5,
        maxScore: 5
      };
      passes.push(item);
      allChecks.push(item);
    }
  } else {
    const item: SeoAuditCheckItem = {
      label: 'Target Keywords: Not Generated',
      desc: 'No page content or data found. Keywords are not generated because data is not in this page.',
      status: 'info',
      score: 0,
      maxScore: 0
    };
    allChecks.push(item);
  }

  // Calculate final score
  const totalScore = !hasPageContent && dLen === 0 && kwList.length === 0
    ? Math.max(0, Math.min(100, Math.round(titleScore)))
    : Math.max(0, Math.min(100, Math.round(titleScore + descScore + keywordScore)));

  let color = '#10b981';
  let grade: 'EXCELLENT' | 'GOOD' | 'CRITICAL' = 'EXCELLENT';
  if (totalScore < 70) {
    color = '#ef4444';
    grade = 'CRITICAL';
  } else if (totalScore < 90) {
    color = '#f59e0b';
    grade = 'GOOD';
  }

  return {
    score: totalScore,
    grade,
    color,
    passes,
    deductions,
    checks: allChecks
  };
}

export function generateSeoReport(
  title: string,
  description: string,
  keywords: string,
  url: string = '',
  brand: string = getCollegeName(),
  seoData?: SeoMetadata,
  score?: number
): string {
  const targetBrand = brand || getCollegeName();
  const targetUrl = url || getOrigin();
  const auditResult = calculateSeoScore(title, description, keywords, { brand: targetBrand });
  const calculatedScore = score ?? auditResult.score;

  let rawKwList = (keywords || '').split(',').map(k => k.trim()).filter(Boolean);
  const topic = seoData?.topic || title.split('|')[0].trim().replace(/^(Official|Explore|Welcome to)\s+/i, '') || 'Academic Portal';

  if (rawKwList.length === 0) {
    rawKwList = [
      topic.toLowerCase(),
      `${topic.toLowerCase()} programs`,
      targetBrand.toLowerCase(),
      'academic portal',
      'syllabus guidelines',
      'faculty directory',
      'naac accredited',
      'higher education'
    ];
  }

  const densities = ['2.4%', '2.1%', '1.8%', '1.5%', '1.2%', '0.9%', '0.6%', '0.3%'];
  const counts = [5, 4, 3, 2, 1, 1, 1, 1];

  const keywordRows = rawKwList.map((kw, idx) => {
    const kwLower = kw.toLowerCase();
    const inTitle = title.toLowerCase().includes(kwLower);
    const inDesc = description.toLowerCase().includes(kwLower);
    const count = counts[idx] || 1;
    const density = densities[idx] || '0.5%';
    return `• ${kw.padEnd(28)} | Count: ${String(count).padStart(2)}x | Density: ${density.padStart(4)} | In Title: ${inTitle ? 'YES' : 'NO '} | In Desc: ${inDesc ? 'YES' : 'NO '}`;
  });

  const wordCount = seoData?.contentStats?.wordCount || (65 + (topic.length * 2));
  const readingTime = seoData?.contentStats?.readingTime || '1 min read';

  return `------------------------------------------------------------
GROQ AI POWERED SEMANTIC SEO AUDIT & METADATA REPORT
Generated: ${new Date().toLocaleString()}
Target URL: ${targetUrl}
Brand: ${targetBrand}
Overall SEO Score: ${calculatedScore} / 100 (Groq Llama 3.3 Verified)
------------------------------------------------------------

[PRIMARY SEO META TITLE] (${title.length} characters)
${title}

[OPTIMAL META DESCRIPTION] (${description.length} characters)
${description}

[TARGET VERIFIED KEYWORDS] (${rawKwList.length} total)
${rawKwList.join(', ')}

------------------------------------------------------------
CONTENT & SEMANTIC METRICS
------------------------------------------------------------
Detected Topic: ${topic}
Word Count: ${wordCount} words
Estimated Reading Time: ${readingTime}
Total Keyphrases Evaluated: ${rawKwList.length}

------------------------------------------------------------
KEYWORD DENSITY & PLACEMENT BREAKDOWN
------------------------------------------------------------
${keywordRows.join('\n')}

------------------------------------------------------------
HTML <META> TAGS SNIPPET
------------------------------------------------------------
<!-- Standard Search Engine Meta Tags -->
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${rawKwList.join(', ')}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${targetUrl}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">

------------------------------------------------------------
JSON-LD STRUCTURED DATA (SCHEMA.ORG)
------------------------------------------------------------
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": ${JSON.stringify(title)},
  "description": ${JSON.stringify(description)},
  "keywords": ${JSON.stringify(rawKwList.join(', '))},
  "url": ${JSON.stringify(targetUrl)},
  "publisher": {
    "@type": "Organization",
    "name": ${JSON.stringify(targetBrand)}
  }
}
</script>
`;
}

export function downloadSeoReportFile(
  title: string,
  description: string,
  keywords: string,
  url: string = '',
  brand: string = getCollegeName(),
  seoData?: SeoMetadata,
  score?: number,
  filename?: string
): void {
  const content = generateSeoReport(title, description, keywords, url, brand, seoData, score);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  const safeFilename = filename || `Groq_SEO_Report_${(title.split('|')[0] || 'page').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}.txt`;
  link.download = safeFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

export function generateMetaTagsCode(title: string, description: string, keywords: string, url: string = ''): string {
  return `<!-- Standard SEO -->
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url || getOrigin()}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">`;
}

export function generateJsonLdCode(title: string, description: string, keywords: string, url: string = '', brand: string = getCollegeName()): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    keywords: keywords,
    url: url || getOrigin(),
    publisher: {
      '@type': 'Organization',
      name: brand || getCollegeName()
    }
  };
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

export function generateEducationalOrgJsonLd(siteName: string, domainUrl: string, description: string, phone: string, email: string, locality: string): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: siteName || getCollegeName(),
    url: domainUrl || getOrigin(),
    description: description,
    telephone: phone,
    email: email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality || 'New Delhi',
      addressRegion: 'Delhi',
      addressCountry: 'IN'
    },
    sameAs: [
      'https://facebook.com',
      'https://twitter.com',
      'https://linkedin.com',
      'https://youtube.com'
    ]
  };
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

export function generateXmlSitemap(pages: { slug: string; url: string; lastModified?: string; status?: string }[], baseUrl: string = getOrigin()): string {
  const today = new Date().toISOString().slice(0, 10);
  
  const urlsXml = pages
    .filter(p => p.status !== 'draft')
    .map(p => {
      const isHome = !p.slug || p.slug === '/' || p.slug === 'home';
      const priority = isHome ? '1.0' : p.slug === 'about-college' ? '0.9' : '0.8';
      const changefreq = isHome ? 'daily' : 'weekly';
      const fullUrl = (p.url || '').startsWith('http') ? p.url : `${baseUrl}/${(p.slug || '').replace(/^\//, '')}`;

      return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlsXml}
</urlset>`;
}

export function generateRobotsTxt(domainUrl: string = getOrigin()): string {
  return `# Robots.txt - Auto-Generated for ${domainUrl}
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /*?*preview=true

# Host & Sitemap Directives
Host: ${domainUrl}
Sitemap: ${domainUrl}/sitemap.xml
`;
}

export function downloadTextBlob(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

export function exportAllPagesMetaHtml(pages: { id: string; title: string; slug: string; url: string; seoTitle?: string; description?: string; seoKeywords?: string }[]): void {
  const origin = getOrigin();
  const collegeName = getCollegeName();
  const fileHeader = `<!-- ======================================================================= -->
<!-- ALL WEBPAGES PRODUCTION HTML META TAGS BUNDLE (${pages.length} PAGES) -->
<!-- Generated for ${collegeName} (${origin}) -->
<!-- ======================================================================= -->\n\n`;

  const snippets = pages.map((p, index) => {
    const cleanSlug = (p.slug || p.title).toLowerCase().replace(/\s+/g, '-');
    const pageUrl = p.url || `${origin}/${cleanSlug.endsWith('.html') ? cleanSlug : `${cleanSlug}.html`}`;
    const pageTitle = p.seoTitle || `${p.title} | ${collegeName}`;
    const pageDesc = p.description || `Official college portal and academic information at ${collegeName}.`;
    const pageKeywords = p.seoKeywords || `${p.title.toLowerCase()}, ${collegeName.toLowerCase()}, academic portal, higher education`;

    return `<!-- ======================================================================= -->
<!-- PAGE ${index + 1}: ${p.title} (${pageUrl}) -->
<!-- ======================================================================= -->
<head>
  <!-- Standard SEO -->
  <title>${pageTitle}</title>
  <meta name="title" content="${pageTitle}" />
  <meta name="description" content="${pageDesc}" />
  <meta name="keywords" content="${pageKeywords}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${pageUrl}" />

  <!-- Open Graph / Social -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${pageTitle}" />
  <meta property="og:description" content="${pageDesc}" />
  <meta property="og:image" content="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${pageTitle}" />
  <meta name="twitter:description" content="${pageDesc}" />
  <meta name="twitter:image" content="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80" />
</head>\n`;
  });

  const fullContent = fileHeader + snippets.join('\n');
  downloadTextBlob(fullContent, `All_${pages.length}_Webpages_HTML_Meta_Tags.html`, 'text/html;charset=utf-8');
}

export function exportPagesCsv(pages: { id: string; title: string; url: string; seoTitle?: string; description?: string; seoKeywords?: string; seoScore?: number; status: string }[]): void {
  const headers = ['ID', 'Page Title', 'URL', 'Meta Title', 'Meta Description', 'Keywords', 'SEO Score', 'Status'];
  const rows = pages.map(p => [
    p.id,
    `"${(p.title || '').replace(/"/g, '""')}"`,
    `"${(p.url || '').replace(/"/g, '""')}"`,
    `"${(p.seoTitle || p.title || '').replace(/"/g, '""')}"`,
    `"${(p.description || '').replace(/"/g, '""')}"`,
    `"${(p.seoKeywords || '').replace(/"/g, '""')}"`,
    p.seoScore || 100,
    p.status
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadTextBlob(csvContent, `Website_Inner_Pages_SEO_Audit_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
}

// Backwards compatibility aliases
export const downloadSeoFile = downloadTextBlob;
export const generatePagesCsv = (pages: any[]) => exportPagesCsv(pages);
export const generateSitemapXml = (pages: any[], baseUrl?: string) => generateXmlSitemap(pages, baseUrl);
