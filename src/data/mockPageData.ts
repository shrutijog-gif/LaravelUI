import { WebPage } from '../types/page';

const getBaseOrigin = () => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return 'http://localhost:5173';
};

export const defaultHomePuckData = {
  content: [
    {
      type: 'HeroBanner',
      props: {
        id: 'HeroBanner-home',
        title: "Empowering Generations Through Excellence & Innovation",
        subtitle: "Discover cutting-edge academic curricula, world-class laboratory infrastructure, renowned faculty mentorship, and a thriving campus ecosystem designed for visionary leaders of tomorrow.",
        tagline: "Premier Centre of Higher Learning & Research",
        bgImageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop",
        primaryCtaText: "Explore Academic Programs",
        primaryCtaLink: "#admissions",
        secondaryCtaText: "View Timetables",
        secondaryCtaLink: "#timetables-section",
        admissionTitle: "Apply for Academic Year 2026-27",
        admissionStatus: "Open",
        highlight1: "State-of-the-Art Research Laboratories & Digital Library",
        highlight2: "100% Placement Assistance & Corporate Partnerships",
        highlight3: "Scholarship Grants for Merit & Economically Weaker Students"
      }
    },
    {
      type: 'PrincipalMessage',
      props: {
        id: 'PrincipalMessage-home',
        principalName: "Dr. Ananya Sharma",
        principalTitle: "Principal & Dean",
        leadershipBadge: "25+ Yrs Academic Leadership",
        messageTag: "Message from Leadership",
        messageTitle: '"Fostering Academic Rigor, Character & Global Competence"',
        paragraph1: "Welcome to our esteemed institution. Education is not merely the acquisition of knowledge; it is the empowerment to think critically, innovate fearlessly, and serve society with integrity.",
        paragraph2: "Our faculty members are world-class researchers and mentors who guide students through rigorous curriculum, practical industry projects, and holistic co-curricular growth. We invite you to explore our academic programs and join our vibrant community."
      }
    },
    {
      type: 'DynamicStudioModule',
      props: {
        id: 'DynamicStudioModule-awards',
        moduleSlug: 'awards',
        titleOverride: "Institutional Awards & Recognitions",
        descriptionOverride: "Celebrating national and global academic honors, research patents, and community leadership.",
        headerConfig: {
          title: "Institutional Awards & Recognitions",
          description: "Celebrating national and global academic honors, research patents, and community leadership."
        },
        moduleConfig: {
          moduleSlug: "awards"
        },
        styleConfig: {
          cardStyle: "style-2",
          columns: 3
        },
        advancedConfig: {
          anchorId: "awards-section",
          className: ""
        }
      }
    },
    {
      type: 'TimetableBlock',
      props: {
        id: 'TimetableBlock-home',
        headerConfig: {
          title: "Academic Timetables & Schedules",
          description: "Download the latest course schedules and examination timetables for all departments."
        },
        styleConfig: {
          cardStyle: "style-1",
          columns: 3
        },
        advancedConfig: {
          anchorId: "timetables-section",
          className: ""
        }
      }
    },
    {
      type: 'Careers',
      props: {
        id: 'Careers-home',
        headerConfig: {
          title: "Current Faculty & Staff Openings",
          description: "Join our distinguished academic and administrative community. Explore open roles and apply directly."
        },
        advancedConfig: {
          anchorId: "careers-section",
          className: ""
        }
      }
    }
  ],
  root: {
    props: {
      title: 'Home'
    }
  }
};

export const defaultCareersPuckData = {
  content: [
    {
      type: 'Careers',
      props: {
        id: 'Careers-page-block',
        headerConfig: {
          title: "Career Opportunities & Current Openings",
          description: "Explore rewarding career paths across our university academic departments, research centers, and administrative divisions. Apply directly online."
        },
        advancedConfig: {
          anchorId: 'careers-section',
          className: ''
        }
      }
    }
  ],
  root: {
    props: {
      title: 'Careers'
    }
  }
};

export const initialPages: WebPage[] = [
  {
    id: 'p-home',
    name: 'Home',
    slug: 'home',
    lastModified: '24/09/2026 at 12:15 pm',
    type: 'builder',
    showHeader: true,
    showFooter: true,
    showBreadcrumb: false,
    seoTitle: 'University Home Page - Official Portal',
    metaDescription: 'Welcome to our accredited university campus. Empowering generations through excellence.'
  },
  {
    id: 'p-careers',
    name: 'Careers',
    slug: 'careers',
    lastModified: '24/09/2026 at 11:55 am',
    type: 'builder',
    showHeader: true,
    showFooter: true,
    showBreadcrumb: true,
    seoTitle: 'Careers & Faculty Recruitment - University Portal',
    metaDescription: 'Browse open teaching, administrative, and research positions and submit candidate applications.'
  },
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
  const defaultHomePage: WebPage = {
    id: 'p-home',
    name: 'Home',
    slug: 'home',
    lastModified: '24/09/2026 at 12:15 pm',
    type: 'builder',
    showHeader: true,
    showFooter: true,
    showBreadcrumb: false,
    seoTitle: 'University Home Page - Official Portal',
    metaDescription: 'Welcome to our accredited university campus. Empowering generations through excellence.'
  };

  const defaultCareersPage: WebPage = {
    id: 'p-careers',
    name: 'Careers',
    slug: 'careers',
    lastModified: '24/09/2026 at 11:55 am',
    type: 'builder',
    showHeader: true,
    showFooter: true,
    showBreadcrumb: true,
    seoTitle: 'Careers & Faculty Recruitment - University Portal',
    metaDescription: 'Browse open teaching, administrative, and research positions and submit candidate applications.'
  };

  try {
    const raw = localStorage.getItem(PAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let updated = parsed.map((p: WebPage) => {
          if (p.customLink && (p.customLink.includes('whitecodetech.com') || p.customLink.includes('vpcollege'))) {
            const path = p.customLink.split('.com')[1] || `/${(p.slug || p.name).toLowerCase().replace(/\s+/g, '-')}`;
            return { ...p, customLink: `${origin}${path}` };
          }
          return p;
        });

        // Ensure Home page is always present, at the top, and configured for Page Builder
        const homeIdx = updated.findIndex(p => p.id === 'p-home' || p.name.toLowerCase() === 'home' || p.slug === 'home');
        if (homeIdx === -1) {
          updated = [defaultHomePage, ...updated];
        } else {
          const homeItem: WebPage = {
            ...defaultHomePage,
            ...updated[homeIdx],
            id: 'p-home',
            name: 'Home',
            slug: 'home',
            type: 'builder',
          };
          updated = [homeItem, ...updated.filter((_, idx) => idx !== homeIdx)];
        }

        // Ensure Careers page is always present
        const hasCareers = updated.some(p => p.id === 'p-careers' || p.name.toLowerCase() === 'careers' || p.slug === 'careers');
        if (!hasCareers) {
          updated = [defaultCareersPage, ...updated];
        }

        localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(updated));

        // Ensure Puck data is seeded
        const homePuck = localStorage.getItem('puck_page_p-home') || localStorage.getItem('puck_page_home');
        if (!homePuck || JSON.parse(homePuck)?.content?.length === 0) {
          localStorage.setItem('puck_page_p-home', JSON.stringify(defaultHomePuckData));
          localStorage.setItem('puck_page_home', JSON.stringify(defaultHomePuckData));
        }

        const careersPuck = localStorage.getItem('puck_page_p-careers') || localStorage.getItem('puck_page_careers');
        if (!careersPuck || JSON.parse(careersPuck)?.content?.length === 0) {
          localStorage.setItem('puck_page_p-careers', JSON.stringify(defaultCareersPuckData));
          localStorage.setItem('puck_page_careers', JSON.stringify(defaultCareersPuckData));
        }

        return updated;
      }
    }
  } catch (e) {
    console.error('Failed to load stored web pages:', e);
  }

  try {
    localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(initialPages));
    localStorage.setItem('puck_page_p-home', JSON.stringify(defaultHomePuckData));
    localStorage.setItem('puck_page_home', JSON.stringify(defaultHomePuckData));
    localStorage.setItem('puck_page_p-careers', JSON.stringify(defaultCareersPuckData));
    localStorage.setItem('puck_page_careers', JSON.stringify(defaultCareersPuckData));
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
  const isHomePage = 
    pageId === 'p-home' || 
    pageId === 'home' || 
    pageName?.toLowerCase() === 'home' ||
    (pageName && pageName.toLowerCase().replace(/\s+/g, '-') === 'home');

  const isCareersPage = 
    pageId === 'p-careers' || 
    pageId === 'careers' || 
    pageName?.toLowerCase() === 'careers' || 
    (pageName && pageName.toLowerCase().replace(/\s+/g, '-') === 'careers');

  try {
    // 1. Check page-specific storage by ID
    const pageData = localStorage.getItem(`puck_page_${pageId}`);
    if (pageData) {
      const parsed = JSON.parse(pageData);
      if (parsed && Array.isArray(parsed.content)) {
        if (!isHomePage || parsed.content.length > 0) {
          return parsed;
        }
      }
    }

    // 2. Check by slug if name provided
    if (pageName) {
      const slug = pageName.toLowerCase().replace(/\s+/g, '-');
      const slugData = localStorage.getItem(`puck_page_${slug}`);
      if (slugData) {
        const parsed = JSON.parse(slugData);
        if (parsed && Array.isArray(parsed.content)) {
          if (!isHomePage || parsed.content.length > 0) {
            return parsed;
          }
        }
      }
    }
  } catch (e) {
    console.error(`Failed to load Puck data for page ${pageId}:`, e);
  }

  // Pre-seed Home page with full home sections
  if (isHomePage) {
    try {
      localStorage.setItem(`puck_page_${pageId}`, JSON.stringify(defaultHomePuckData));
      localStorage.setItem('puck_page_p-home', JSON.stringify(defaultHomePuckData));
      localStorage.setItem('puck_page_home', JSON.stringify(defaultHomePuckData));
    } catch (e) {}
    return defaultHomePuckData;
  }

  // Pre-seed Careers page with the Careers component block
  if (isCareersPage) {
    try {
      localStorage.setItem(`puck_page_${pageId}`, JSON.stringify(defaultCareersPuckData));
      localStorage.setItem('puck_page_p-careers', JSON.stringify(defaultCareersPuckData));
      localStorage.setItem('puck_page_careers', JSON.stringify(defaultCareersPuckData));
    } catch (e) {}
    return defaultCareersPuckData;
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

    // If Home page, sync both p-home and home keys and notify storefront
    if (pageId === 'p-home' || pageName?.toLowerCase() === 'home') {
      localStorage.setItem('puck_page_p-home', JSON.stringify(data));
      localStorage.setItem('puck_page_home', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('home-puck-updated', { detail: data }));
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
