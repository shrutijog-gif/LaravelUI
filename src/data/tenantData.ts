export interface CollegeTenant {
  id: string;
  name: string;
  subtitle: string;
  logoType: 'lady-irwin' | 'kvk-leaf' | 'university-crest';
  primaryColor: string;
  secondaryColor: string;
  badgeGradient: string;
  sampleTimetables: Array<{
    id: string;
    title: string;
    academicYear: string;
    branch?: string;
    semester?: string;
    section?: string;
    fileUrl: string;
    fileName: string;
    fileSize: string;
    showOnWebsite: boolean;
  }>;
}

export const collegeTenantsList: CollegeTenant[] = [
  {
    id: 'lady-irwin',
    name: 'Lady Irwin College',
    subtitle: 'University of Delhi, New Delhi',
    logoType: 'lady-irwin',
    primaryColor: '#0f2748', // Royal Navy Blue
    secondaryColor: '#2563eb', // Royal Blue
    badgeGradient: 'from-blue-600 to-indigo-800',
    sampleTimetables: [
      {
        id: 'tt-lic-01',
        title: 'B.Sc Home Science & Food Technology Schedule',
        academicYear: '2026-2027',
        branch: 'Food Technology',
        semester: '1',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Home_Science_Sem1_2026.pdf',
        fileSize: '1.2 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-lic-02',
        title: 'M.Sc Clinical Nutrition & Dietetics Exam Schedule',
        academicYear: '2026-2027',
        branch: 'Clinical Nutrition',
        semester: '3',
        section: 'B',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'MSc_Nutrition_Timetable_2026.pdf',
        fileSize: '950 KB',
        showOnWebsite: true,
      },
      {
        id: 'tt-lic-03',
        title: 'B.Ed Special Education & Disability Studies',
        academicYear: '2026-2027',
        branch: 'Pedagogy & Child Dev',
        semester: '2',
        section: 'C',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'BEd_Special_Ed_Schedule.pdf',
        fileSize: '820 KB',
        showOnWebsite: true,
      },
      {
        id: 'tt-lic-04',
        title: 'Ph.D Coursework & Research Methodology Lectures',
        academicYear: '2026-2027',
        branch: 'Resource Management',
        semester: '1',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'PhD_Coursework_Timetable_2026.pdf',
        fileSize: '1.5 MB',
        showOnWebsite: true,
      },
    ],
  },
  {
    id: 'mgm-kvk',
    name: 'MGM Krishi Vigyan Kendra',
    subtitle: 'Gandheli, Chhatrapati Sambhajinagar, Maharashtra',
    logoType: 'kvk-leaf',
    primaryColor: '#133e1b', // Forest Green
    secondaryColor: '#1e7e34', // Emerald Green
    badgeGradient: 'from-green-700 to-emerald-900',
    sampleTimetables: [
      {
        id: 'tt-kvk-01',
        title: 'Organic Farming & Sustainable Agriculture Training',
        academicYear: '2026-2027',
        branch: 'Agronomy',
        semester: '1',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Organic_Farming_BatchA_2026.pdf',
        fileSize: '1.4 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-kvk-02',
        title: 'Soil Health Testing & Fertilizer Application Workshop',
        academicYear: '2026-2027',
        branch: 'Soil Science',
        semester: '2',
        section: 'B',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Soil_Health_Workshop_Schedule.pdf',
        fileSize: '1.1 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-kvk-03',
        title: 'Dairy Management & Livestock Healthcare Program',
        academicYear: '2026-2027',
        branch: 'Veterinary Science',
        semester: '3',
        section: 'C',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Dairy_Management_Timetable.pdf',
        fileSize: '1.6 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-kvk-04',
        title: 'Drip Irrigation Systems & Micro-Hydro Masterclass',
        academicYear: '2026-2027',
        branch: 'Agricultural Engineering',
        semester: '4',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Drip_Irrigation_Schedule_2026.pdf',
        fileSize: '1.2 MB',
        showOnWebsite: true,
      },
    ],
  },
  {
    id: 'st-xaviers',
    name: "St. Xavier's University",
    subtitle: 'Kolkata, West Bengal',
    logoType: 'university-crest',
    primaryColor: '#881337', // Deep Crimson Red
    secondaryColor: '#b91c1c', // Ruby Red
    badgeGradient: 'from-red-700 to-rose-900',
    sampleTimetables: [
      {
        id: 'tt-sx-01',
        title: 'B.Tech Computer Science & AI End Sem Examination',
        academicYear: '2026-2027',
        branch: 'Computer Science',
        semester: '5',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'BTech_CSE_EndSem_Exam_2026.pdf',
        fileSize: '1.8 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-sx-02',
        title: 'B.A. Mass Communication & Digital Media Schedule',
        academicYear: '2026-2027',
        branch: 'Media Studies',
        semester: '1',
        section: 'B',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'MassComm_Sem1_Timetable_2026.pdf',
        fileSize: '1.3 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-sx-03',
        title: 'MBA Executive Weekend Program Lecture Grid',
        academicYear: '2026-2027',
        branch: 'Finance & HR',
        semester: '2',
        section: 'C',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'MBA_Executive_Weekend_2026.pdf',
        fileSize: '1.6 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-sx-04',
        title: 'B.Com Honors Morning & Evening Lecture Schedule',
        academicYear: '2026-2027',
        branch: 'Commerce & Finance',
        semester: '4',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'BCom_Hons_Schedule_2026.pdf',
        fileSize: '1.0 MB',
        showOnWebsite: true,
      },
    ],
  },
];

export const getStoredTenantId = (): string => {
  return localStorage.getItem('active_tenant_id') || 'lady-irwin';
};

export const getActiveTenant = (): CollegeTenant => {
  const storedId = getStoredTenantId();
  return collegeTenantsList.find(t => t.id === storedId) || collegeTenantsList[0];
};

export const setActiveTenantId = (tenantId: string) => {
  localStorage.setItem('active_tenant_id', tenantId);
  window.dispatchEvent(new Event('tenant-changed'));
};

export const getAllTenants = (): CollegeTenant[] => {
  return collegeTenantsList;
};

export const getTenantSeoDefaults = (tenant?: CollegeTenant) => {
  const t = tenant || getActiveTenant();
  const origin = typeof window !== 'undefined' && window.location && window.location.origin 
    ? window.location.origin 
    : 'http://localhost:5173';
    
  return {
    siteName: t.name,
    domainUrl: origin,
    defaultTitle: `${t.name} | ${t.subtitle} Official Portal`,
    defaultDescription: `Official academic and campus portal of ${t.name}, ${t.subtitle}. Explore verified academic programs, syllabus guidelines, faculty directory, and admissions updates.`,
    defaultKeywords: `${t.name.toLowerCase()}, ${t.name.toLowerCase()} admissions, ${t.subtitle.toLowerCase()}, academic programs, higher education, college portal`,
    brandName: t.name,
    canonicalDomain: origin,
    ogImageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    twitterHandle: `@${t.name.replace(/[^a-zA-Z0-9]/g, '')}`,
    robotsIndexing: "index, follow" as const,
    schemaType: "EducationalOrganization" as const,
    contactEmail: `principal@${t.id}.edu.in`,
    contactPhone: "+91 11 2371 8031",
    addressLocality: t.subtitle,
    googleVerificationToken: "ytG8KCRaBpMv8sS9T25XvxCoYIAAlII8iiSs3AAHEsc"
  };
};
