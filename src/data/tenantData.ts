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
        title: 'B.Sc Home Science (Sem I & II)',
        academicYear: '2026-27',
        branch: 'Food Technology',
        semester: 'Sem 1',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Home_Science_Sem1_2026.pdf',
        fileSize: '1.2 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-lic-02',
        title: 'M.Sc Nutrition & Dietetics',
        academicYear: '2026-27',
        branch: 'Clinical Nutrition',
        semester: 'Sem 3',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'MSc_Nutrition_Timetable_2026.pdf',
        fileSize: '950 KB',
        showOnWebsite: true,
      },
      {
        id: 'tt-lic-03',
        title: 'B.Ed Special Education Schedule',
        academicYear: '2025-26',
        branch: 'Pedagogy',
        semester: 'Sem 2',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'BEd_Special_Ed_Schedule.pdf',
        fileSize: '820 KB',
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
        title: 'Organic Farming Training Schedule',
        academicYear: '2026-27',
        branch: 'Agronomy',
        semester: 'Batch A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Organic_Farming_BatchA_2026.pdf',
        fileSize: '1.4 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-kvk-02',
        title: 'Soil Health & Fertilizer Workshop',
        academicYear: '2026-27',
        branch: 'Soil Science',
        semester: 'Monsoon 2026',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Soil_Health_Workshop_Schedule.pdf',
        fileSize: '1.1 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-kvk-03',
        title: 'Dairy Management & Animal Husbandry',
        academicYear: '2025-26',
        branch: 'Veterinary',
        semester: 'Batch B',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Dairy_Management_Timetable.pdf',
        fileSize: '1.6 MB',
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
        title: 'B.A. Mass Communication & Journalism',
        academicYear: '2026-27',
        branch: 'Media Studies',
        semester: 'Sem 1',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'MassComm_Sem1_Timetable_2026.pdf',
        fileSize: '1.3 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-sx-02',
        title: 'MBA Executive Weekend Schedule',
        academicYear: '2026-27',
        branch: 'Finance & HR',
        semester: 'Trimester 2',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'MBA_Executive_Weekend_2026.pdf',
        fileSize: '1.8 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-sx-03',
        title: 'B.Com Honors Morning & Evening Batch',
        academicYear: '2025-26',
        branch: 'Commerce',
        semester: 'Sem 4',
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
