export interface CollegeTenant {
  id: string;
  name: string;
  subtitle: string;
  logoType: 'elite-crest' | 'elite-tech' | 'elite-agri' | 'lady-irwin' | 'kvk-leaf' | 'university-crest';
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
    id: 'elite-autonomous',
    name: 'Elite College of Arts, Science and Commerce (Autonomous)',
    subtitle: 'Elite Multi-College Educational Society',
    logoType: 'elite-crest',
    primaryColor: '#0f2748', // Royal Navy Blue
    secondaryColor: '#2563eb', // Royal Blue
    badgeGradient: 'from-blue-700 via-indigo-900 to-slate-900',
    sampleTimetables: [
      {
        id: 'tt-ea-01',
        title: 'B.Sc Computer Science & Data Analytics End Sem Schedule',
        academicYear: '2026-2027',
        branch: 'Computer Science',
        semester: '5',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'BSc_CS_EndSem_2026.pdf',
        fileSize: '1.4 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-ea-02',
        title: 'B.Com Honors & Financial Markets Final Examinations',
        academicYear: '2026-2027',
        branch: 'Commerce & Finance',
        semester: '4',
        section: 'B',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'BCom_Hons_Exam_2026.pdf',
        fileSize: '1.1 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-ea-03',
        title: 'M.Sc Applied Physics & Autonomous Laboratory Rotations',
        academicYear: '2026-2027',
        branch: 'Physical Sciences',
        semester: '2',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'MSc_Physics_Lab_Schedule.pdf',
        fileSize: '980 KB',
        showOnWebsite: true,
      },
      {
        id: 'tt-ea-04',
        title: 'B.A. Economics, Psychology & Media Studies Timetable',
        academicYear: '2026-2027',
        branch: 'Humanities & Social Sciences',
        semester: '1',
        section: 'C',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'BA_Economics_Sem1_2026.pdf',
        fileSize: '820 KB',
        showOnWebsite: true,
      },
    ],
  },
  {
    id: 'elite-tech',
    name: 'Elite Institute of Technology & Engineering',
    subtitle: 'Elite Multi-College Educational Society',
    logoType: 'elite-tech',
    primaryColor: '#0f172a', // Deep Slate
    secondaryColor: '#0284c7', // Ocean Blue
    badgeGradient: 'from-cyan-700 via-blue-900 to-slate-950',
    sampleTimetables: [
      {
        id: 'tt-et-01',
        title: 'B.Tech AI & Data Science End Semester Examination',
        academicYear: '2026-2027',
        branch: 'Artificial Intelligence',
        semester: '6',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'BTech_AI_DS_EndSem_2026.pdf',
        fileSize: '1.8 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-et-02',
        title: 'B.Tech Computer Science & Cyber Security Lab Grid',
        academicYear: '2026-2027',
        branch: 'Cyber Security',
        semester: '4',
        section: 'B',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'CyberSec_Lab_Schedule_2026.pdf',
        fileSize: '1.3 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-et-03',
        title: 'M.Tech VLSI & Embedded Systems Seminar Schedule',
        academicYear: '2026-2027',
        branch: 'Electronics & Communication',
        semester: '2',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'MTech_VLSI_Timetable.pdf',
        fileSize: '950 KB',
        showOnWebsite: true,
      },
      {
        id: 'tt-et-04',
        title: 'B.Tech Mechanical & Mechatronics Capstone Evaluations',
        academicYear: '2026-2027',
        branch: 'Mechanical Engineering',
        semester: '8',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Capstone_Project_Review_2026.pdf',
        fileSize: '1.2 MB',
        showOnWebsite: true,
      },
    ],
  },
  {
    id: 'elite-agri',
    name: 'Elite Institute of Agricultural & Environmental Sciences',
    subtitle: 'Elite Multi-College Educational Society',
    logoType: 'elite-agri',
    primaryColor: '#133e1b', // Forest Green
    secondaryColor: '#16a34a', // Emerald Green
    badgeGradient: 'from-green-700 via-emerald-900 to-slate-950',
    sampleTimetables: [
      {
        id: 'tt-eag-01',
        title: 'B.Sc Agriculture & Precision Farming Field Training',
        academicYear: '2026-2027',
        branch: 'Agronomy & Crop Science',
        semester: '3',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Agri_Precision_Farming_2026.pdf',
        fileSize: '1.5 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-eag-02',
        title: 'Soil Health Testing & Fertilizer Analytics Workshop',
        academicYear: '2026-2027',
        branch: 'Soil Science',
        semester: '1',
        section: 'B',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Soil_Health_Workshop_Schedule.pdf',
        fileSize: '1.1 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-eag-03',
        title: 'Horticulture, Floriculture & Hydroponics Lab Grid',
        academicYear: '2026-2027',
        branch: 'Horticulture',
        semester: '4',
        section: 'A',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Hydroponics_Lab_Schedule_2026.pdf',
        fileSize: '1.2 MB',
        showOnWebsite: true,
      },
      {
        id: 'tt-eag-04',
        title: 'Agricultural Biotechnology & Tissue Culture Masterclass',
        academicYear: '2026-2027',
        branch: 'Agri-Biotech',
        semester: '5',
        section: 'C',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'AgriBiotech_Lecture_Grid_2026.pdf',
        fileSize: '1.6 MB',
        showOnWebsite: true,
      },
    ],
  },
];

export const getStoredTenantId = (): string => {
  const stored = localStorage.getItem('active_tenant_id');
  if (!stored || stored === 'lady-irwin' || stored === 'mgm-kvk' || stored === 'st-xaviers' || !collegeTenantsList.some(t => t.id === stored)) {
    return 'elite-autonomous';
  }
  return stored;
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
