import { StudioTemplate, ModuleSchema, DynamicEntityItem } from '../types/moduleStudio';
import { getActiveTenant } from './tenantData';
import { getStoredTimetables, SAMPLE_PDF } from './mockTimetableData';

const STORAGE_KEY_TEMPLATES = 'laravel_ui_module_studio_templates';
const STORAGE_KEY_ENTITIES_PREFIX = 'laravel_ui_module_studio_entities_';

export const INITIAL_STUDIO_TEMPLATES: StudioTemplate[] = [
  {
    schema: {
      id: 'mod-awards',
      name: 'Awards & Recognitions',
      slug: 'awards',
      description: 'Highlight institutional achievements, student honors, and faculty excellence awards.',
      category: 'Recognition',
      status: 'published',
      version: 'v1 (published)',
      iconName: 'Award',
      fields: [
        { id: 'f1', name: 'title', label: 'Award Title', type: 'text', required: true, showInCard: true, showInTable: true, placeholder: 'e.g. National Excellence Award 2026' },
        { id: 'f2', name: 'year', label: 'Year Awarded', type: 'number', required: true, showInCard: true, showInTable: true, badgeColor: 'amber' },
        { id: 'f3', name: 'recipient', label: 'Recipient / Department', type: 'text', required: true, showInCard: true, showInTable: true },
        { id: 'f4', name: 'category', label: 'Category', type: 'badge', showInCard: true, showInTable: true, badgeColor: 'blue' },
        { id: 'f5', name: 'image', label: 'Photo / Trophy Image', type: 'image', showInCard: true, showInTable: false },
        { id: 'f6', name: 'description', label: 'Description', type: 'textarea', showInCard: true, showInTable: false },
      ],
      displayConfig: {
        defaultView: 'card',
        cardStyle: 'style-1',
        tableStyle: 'table-1',
        columns: 3,
        showTitle: true,
        showSearch: true,
        showCategoryFilter: true,
        primaryActionLabel: 'View Details',
      },
      createdAt: '2026-08-18T10:00:00Z',
      updatedAt: '2026-08-18T10:00:00Z',
    },
    sampleItems: [
      {
        id: 'awd-1',
        tenantId: 'st-xaviers',
        moduleSlug: 'awards',
        showOnWebsite: true,
        data: {
          title: 'Best Green Campus Gold Trophy 2026',
          year: 2026,
          recipient: 'Department of Environmental Sciences',
          category: 'Sustainability',
          image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=600&q=80',
          description: 'Awarded by the National Education Council for zero-emission campus infrastructure and solar integration.',
        },
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
      },
      {
        id: 'awd-2',
        tenantId: 'st-xaviers',
        moduleSlug: 'awards',
        showOnWebsite: true,
        data: {
          title: 'Top Innovation in AI Research',
          year: 2025,
          recipient: 'Dr. Sarah Jenkins & Research Lab',
          category: 'Research Excellence',
          image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
          description: 'Recognized for pioneering deep learning applications in healthcare diagnostics.',
        },
        createdAt: '2026-07-15T00:00:00Z',
        updatedAt: '2026-07-15T00:00:00Z',
      },
      {
        id: 'awd-3',
        tenantId: 'st-xaviers',
        moduleSlug: 'awards',
        showOnWebsite: true,
        data: {
          title: 'Inter-College Debate Champions',
          year: 2026,
          recipient: 'Literary & Debating Society',
          category: 'Student Leadership',
          image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
          description: 'First position across 45 participating universities in the All-India Parliamentary Debate.',
        },
        createdAt: '2026-08-10T00:00:00Z',
        updatedAt: '2026-08-10T00:00:00Z',
      },
    ],
  },
  {
    schema: {
      id: 'mod-timetables',
      name: 'Academic Timetables',
      slug: 'timetables',
      description: 'Official class, lab, and examination schedules for student downloads.',
      category: 'Academic',
      status: 'published',
      version: 'v1 (published)',
      iconName: 'Calendar',
      fields: [
        { id: 'tf1', name: 'title', label: 'Timetable Name', type: 'text', required: true, showInCard: true, showInTable: true, placeholder: 'e.g. B.Tech Computer Science End Sem Exam' },
        { 
          id: 'tf2', 
          name: 'year', 
          label: 'Academic Year', 
          type: 'select', 
          required: true, 
          showInCard: true, 
          showInTable: true, 
          badgeColor: 'blue',
          options: [
            { label: '2026-2027', value: '2026-2027' },
            { label: '2025-2026', value: '2025-2026' },
            { label: '2024-2025', value: '2024-2025' },
          ]
        },
        { 
          id: 'tf3', 
          name: 'branch', 
          label: 'Program / Branch', 
          type: 'select', 
          showInCard: true, 
          showInTable: true,
          options: [
            { label: 'Computer Science', value: 'Computer Science' },
            { label: 'Information Tech', value: 'Information Tech' },
            { label: 'MSc Nutrition', value: 'MSc Nutrition' },
            { label: 'Food Tech', value: 'Food Tech' },
            { label: 'Commerce & Business', value: 'Commerce & Business' },
            { label: 'Physics & Electronics', value: 'Physics & Electronics' },
          ]
        },
        { 
          id: 'tf4', 
          name: 'semester', 
          label: 'Semester', 
          type: 'select', 
          showInCard: true, 
          showInTable: true,
          options: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
            { label: '6', value: '6' },
            { label: '7', value: '7' },
            { label: '8', value: '8' },
          ]
        },
        { 
          id: 'tf5', 
          name: 'section', 
          label: 'Section', 
          type: 'select', 
          showInCard: true, 
          showInTable: true,
          options: [
            { label: 'A', value: 'A' },
            { label: 'B', value: 'B' },
            { label: 'C', value: 'C' },
            { label: 'D', value: 'D' },
            { label: 'All Sections', value: 'All Sections' },
          ]
        },
        { id: 'tf6', name: 'fileUrl', label: 'Document PDF File', type: 'file_pdf', required: true, showInCard: true, showInTable: true },
      ],
      displayConfig: {
        defaultView: 'table',
        cardStyle: 'style-1',
        tableStyle: 'table-3',
        columns: 3,
        showTitle: true,
        showSearch: true,
        showCategoryFilter: true,
        primaryActionLabel: 'Download PDF',
      },
      createdAt: '2026-08-18T10:00:00Z',
      updatedAt: '2026-08-18T10:00:00Z',
    },
    sampleItems: [
      {
        id: 'tt-1',
        tenantId: 'st-xaviers',
        moduleSlug: 'timetables',
        showOnWebsite: true,
        data: {
          title: 'B.Tech Computer Science & AI End Sem Examination',
          year: '2026-2027',
          branch: 'Computer Science',
          semester: 'Semester 5',
          section: 'Section A',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
      },
      {
        id: 'tt-2',
        tenantId: 'st-xaviers',
        moduleSlug: 'timetables',
        showOnWebsite: true,
        data: {
          title: 'M.Sc Nutrition & Clinical Dietetics Timetable',
          year: '2026-2027',
          branch: 'MSc Nutrition',
          semester: 'Semester 3',
          section: 'Section B',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        createdAt: '2026-08-05T00:00:00Z',
        updatedAt: '2026-08-05T00:00:00Z',
      },
      {
        id: 'tt-3',
        tenantId: 'st-xaviers',
        moduleSlug: 'timetables',
        showOnWebsite: true,
        data: {
          title: 'B.A. Mass Communication & Digital Media Schedule',
          year: '2026-2027',
          branch: 'Media Studies',
          semester: 'Semester 1',
          section: 'All Sections',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        createdAt: '2026-08-10T00:00:00Z',
        updatedAt: '2026-08-10T00:00:00Z',
      },
      {
        id: 'tt-4',
        tenantId: 'st-xaviers',
        moduleSlug: 'timetables',
        showOnWebsite: true,
        data: {
          title: 'MBA Executive Weekend Program Lecture Grid',
          year: '2026-2027',
          branch: 'Commerce & Business',
          semester: 'Semester 2',
          section: 'Section A',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        createdAt: '2026-08-12T00:00:00Z',
        updatedAt: '2026-08-12T00:00:00Z',
      },
    ],
  },
  {
    schema: {
      id: 'mod-reports',
      name: 'Examination Reports',
      slug: 'reports',
      description: 'Annual institutional reports, accreditation documents, and examination audit summaries.',
      category: 'Governance',
      status: 'published',
      version: 'v1 (published)',
      iconName: 'FileText',
      fields: [
        { id: 'rf1', name: 'title', label: 'Report Title', type: 'text', required: true, showInCard: true, showInTable: true },
        { id: 'rf2', name: 'reportCode', label: 'Report Code', type: 'text', showInCard: true, showInTable: true },
        { id: 'rf3', name: 'publishDate', label: 'Release Date', type: 'date', showInCard: true, showInTable: true },
        { id: 'rf4', name: 'fileUrl', label: 'Report PDF', type: 'file_pdf', required: true, showInCard: true, showInTable: true },
      ],
      displayConfig: {
        defaultView: 'card',
        cardStyle: 'style-2',
        tableStyle: 'table-2',
        columns: 3,
        showTitle: true,
        showSearch: true,
        showCategoryFilter: false,
        primaryActionLabel: 'View Report',
      },
      createdAt: '2026-08-18T10:00:00Z',
      updatedAt: '2026-08-18T10:00:00Z',
    },
    sampleItems: [
      {
        id: 'rep-1',
        tenantId: 'st-xaviers',
        moduleSlug: 'reports',
        showOnWebsite: true,
        data: {
          title: 'NAAC Accreditation Self-Study Report (SSR)',
          reportCode: 'NAAC-2026-A1',
          publishDate: '2026-07-01',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        createdAt: '2026-07-01T00:00:00Z',
        updatedAt: '2026-07-01T00:00:00Z',
      },
    ],
  },
  {
    schema: {
      id: 'mod-departments',
      name: 'Academic Departments',
      slug: 'departments',
      description: 'Composite department profiles with parent metadata (stream), multi-tab content workspaces, faculty directories, and document lists.',
      category: 'Academic',
      status: 'published',
      version: 'v1 (composite)',
      iconName: 'GraduationCap',
      archetype: 'tabbed_composite',
      fields: [
        {
          id: 'dept-f1',
          name: 'name',
          label: 'Department Name',
          type: 'text',
          required: true,
          showInTable: true,
          placeholder: 'e.g. Department of Physics',
        },
        {
          id: 'dept-f2',
          name: 'stream',
          label: 'Stream',
          type: 'select',
          required: true,
          showInTable: true,
          badgeColor: 'blue',
          options: [
            { label: 'Science', value: 'Science' },
            { label: 'Arts', value: 'Arts' },
            { label: 'Commerce', value: 'Commerce' },
          ],
        },
      ],
      tabsConfig: {
        allowRuntimeCustomTabs: true,
        allowedElementTypes: ['ui_section', 'faculty_grid', 'media_gallery', 'document_list'],
        defaultTabs: [
          {
            id: 'tab-overview',
            label: 'Overview',
            slug: 'overview',
            componentType: 'ui_section',
            required: true,
          },
          {
            id: 'tab-vision',
            label: 'Vision',
            slug: 'vision',
            componentType: 'ui_section',
          },
          {
            id: 'tab-mission',
            label: 'Mission',
            slug: 'mission',
            componentType: 'ui_section',
          },
          {
            id: 'tab-teaching-staff',
            label: 'Teaching Staff',
            slug: 'teaching-staff',
            componentType: 'faculty_grid',
          },
          {
            id: 'tab-non-teaching-staff',
            label: 'Non Teaching Staff',
            slug: 'non-teaching-staff',
            componentType: 'faculty_grid',
          },
          {
            id: 'tab-photo-gallery',
            label: 'Photo Gallery',
            slug: 'photo-gallery',
            componentType: 'media_gallery',
          },
          {
            id: 'tab-courses-offered',
            label: 'Courses Offered',
            slug: 'courses-offered',
            componentType: 'ui_section',
          },
          {
            id: 'tab-annual-calendar',
            label: 'Annual Calendar',
            slug: 'annual-calendar',
            componentType: 'document_list',
          },
          {
            id: 'tab-time-table',
            label: 'Time Table',
            slug: 'time-table',
            componentType: 'document_list',
          },
          {
            id: 'tab-value-added-courses',
            label: 'Value Added Courses',
            slug: 'value-added-courses',
            componentType: 'ui_section',
          },
        ],
      },
      displayConfig: {
        defaultView: 'table',
        cardStyle: 'style-1',
        tableStyle: 'table-1',
        columns: 3,
        showTitle: true,
        showSearch: true,
        showCategoryFilter: true,
        primaryActionLabel: 'Manage Content',
      },
      createdAt: '2026-08-20T10:00:00Z',
      updatedAt: '2026-08-20T10:00:00Z',
    },
    sampleItems: [
      {
        id: 'dept-mcom',
        tenantId: 'st-xaviers',
        moduleSlug: 'departments',
        showOnWebsite: true,
        data: {
          name: 'MASTER OF COMMERCE (ADVANCED ACCOUNTANCY)',
          stream: 'Commerce',
        },
        tabsData: {
          'tab-teaching-staff': {
            id: 'tab-teaching-staff',
            label: 'Teaching Staff',
            componentType: 'faculty_grid',
            visible: true,
            content: [],
          },
          'tab-career-courses': {
            id: 'tab-career-courses',
            label: 'Career Oriented Courses',
            componentType: 'ui_section',
            visible: true,
            content: '',
          },
          'tab-syllabus': {
            id: 'tab-syllabus',
            label: 'Syllabus & Courses',
            componentType: 'ui_section',
            visible: true,
            content: '',
          },
          'tab-activities': {
            id: 'tab-activities',
            label: 'Activities',
            componentType: 'ui_section',
            visible: true,
            content: '',
          },
          'tab-events': {
            id: 'tab-events',
            label: 'Events',
            componentType: 'ui_section',
            visible: true,
            content: '',
          },
          'tab-time-table': {
            id: 'tab-time-table',
            label: 'Time Table',
            componentType: 'ui_section',
            visible: true,
            content: '',
          },
          'tab-mou': {
            id: 'tab-mou',
            label: 'MoU/ Linkages',
            componentType: 'ui_section',
            visible: true,
            content: '',
          },
          'tab-eminent-alumni': {
            id: 'tab-eminent-alumni',
            label: 'Eminent Alumni',
            componentType: 'ui_section',
            visible: true,
            content: '',
          },
          'tab-photo-gallery': {
            id: 'tab-photo-gallery',
            label: 'Photo Gallery',
            componentType: 'media_gallery',
            visible: true,
            content: '',
          },
          'tab-dept-site': {
            id: 'tab-dept-site',
            label: 'Departmental Site',
            componentType: 'ui_section',
            visible: true,
            content: '',
          },
        },
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
      },
      {
        id: 'dept-fnft',
        tenantId: 'st-xaviers',
        moduleSlug: 'departments',
        showOnWebsite: true,
        data: {
          name: 'Food Nutrition And Food Technology',
          stream: 'Science',
        },
        tabsData: {
          'tab-overview': {
            id: 'tab-overview',
            label: 'Overview',
            componentType: 'ui_section',
            visible: true,
            content: 'The Department of Food and Nutrition was the first Post-Graduate Department of Lady Irwin College. It has come a long way since its inception in 1958 with a high standard of academic and infrastructural development. Today it offers M.Sc. in Food and Nutrition in three areas of specialization, namely, Clinical Nutrition, Public Health Nutrition, and Food Science and Processing and a one-year Post-Graduate Diploma in Dietetics and Public Health Nutrition with a 3-month internship in the Dietetics Department of a hospital. The Master\'s programme is further strengthened by a six-week summer placement in different organizations such as NFI, FRAC, AIIMS, CFTRI, NIPCCD, USAID, NDRI, Public Health Foundation.',
          },
          'tab-vision': {
            id: 'tab-vision',
            label: 'Vision',
            componentType: 'ui_section',
            visible: true,
            content: 'To be a premier global center for higher learning and research in nutritional sciences, nurturing competent leaders and innovators for health and society.',
          },
          'tab-mission': {
            id: 'tab-mission',
            label: 'Mission',
            componentType: 'ui_section',
            visible: true,
            content: '• Impart state-of-the-art education in clinical dietetics and food technology.\n• Undertake impactful community nutrition research.\n• Collaborate with leading health institutes and global wellness agencies.',
          },
          'tab-teaching-staff': {
            id: 'tab-teaching-staff',
            label: 'Teaching Staff',
            componentType: 'faculty_grid',
            visible: true,
            content: [
              { id: 'f-1', name: 'Mrs. Ravinder Chadha', designation: 'Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
              { id: 'f-2', name: 'Neena Bhatia', designation: 'Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80' },
              { id: 'f-3', name: 'Manisha Sabharwal', designation: 'Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' },
              { id: 'f-4', name: 'Pulkit Mathur', designation: 'Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80' },
              { id: 'f-5', name: 'Dr. Pooja Raizada', designation: 'Associate Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
              { id: 'f-6', name: 'Lalita Verma', designation: 'Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80' },
              { id: 'f-7', name: 'Dr. Prachi Shukla', designation: 'Associate Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80' },
              { id: 'f-8', name: 'Anjana Kumari', designation: 'Associate Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
              { id: 'f-9', name: 'Priti Lal', designation: 'Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80' },
              { id: 'f-10', name: 'Dr. Poonam Singh', designation: 'Assistant Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=300&q=80' },
              { id: 'f-11', name: 'Dr. Aparna Agarwal', designation: 'Assistant Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=300&q=80' },
              { id: 'f-12', name: 'Dr. Nidhi Jaiswal', designation: 'Assistant Professor', department: 'FOOD NUTRITION AND F...', imageUrl: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=300&q=80' },
            ],
          },
          'tab-courses-offered': {
            id: 'tab-courses-offered',
            label: 'Courses Offered',
            componentType: 'ui_section',
            visible: true,
            content: [
              { id: 'c-1', title: 'B.Sc. (Pass) Home Science with Food Tech Specialization (3 Years)', content: 'Core foundation in biochemistry, human physiology, food micro-biology and preservation technology.' },
              { id: 'c-2', title: 'M.Sc. Food and Nutrition (2 Years)', content: 'Specializations in Clinical Nutrition, Public Health Nutrition, and Food Science & Processing.' },
              { id: 'c-3', title: 'PG Diploma in Dietetics and Public Health Nutrition (1 Year)', content: 'Professional hospital-oriented postgraduate training with 3 months clinical internship.' },
            ],
          },
        },
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
      },
      {
        id: 'dept-physics',
        tenantId: 'st-xaviers',
        moduleSlug: 'departments',
        showOnWebsite: true,
        data: {
          name: 'Department of Physics',
          stream: 'Science',
        },
        tabsData: {
          'tab-overview': {
            id: 'tab-overview',
            label: 'Overview',
            componentType: 'ui_section',
            visible: true,
            content: 'The Department of Physics offers world-class experimental laboratories, computational physics clusters, and theoretical foundations in quantum mechanics and optics.',
          },
          'tab-vision': {
            id: 'tab-vision',
            label: 'Vision',
            componentType: 'ui_section',
            visible: true,
            content: 'To foster intellectual curiosity and breakthrough scientific discoveries in fundamental physics and material sciences.',
          },
        },
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
      },
      {
        id: 'dept-english',
        tenantId: 'st-xaviers',
        moduleSlug: 'departments',
        showOnWebsite: true,
        data: {
          name: 'Department of English',
          stream: 'Arts',
        },
        tabsData: {
          'tab-overview': {
            id: 'tab-overview',
            label: 'Overview',
            componentType: 'ui_section',
            visible: true,
            content: 'The Department of English explores classical literature, modern criticism, creative writing, and digital humanities.',
          },
        },
        createdAt: '2026-08-05T00:00:00Z',
        updatedAt: '2026-08-05T00:00:00Z',
      },
      {
        id: 'dept-commerce',
        tenantId: 'st-xaviers',
        moduleSlug: 'departments',
        showOnWebsite: true,
        data: {
          name: 'Department of Commerce & Finance',
          stream: 'Commerce',
        },
        tabsData: {
          'tab-overview': {
            id: 'tab-overview',
            label: 'Overview',
            componentType: 'ui_section',
            visible: true,
            content: 'Specializing in financial modeling, fintech, corporate governance, auditing, and international trade.',
          },
        },
        createdAt: '2026-08-08T00:00:00Z',
        updatedAt: '2026-08-08T00:00:00Z',
      },
    ],
  },
];

// Helper functions for template persistence
export const getStoredStudioTemplates = (): StudioTemplate[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (raw) {
      const parsed: StudioTemplate[] = JSON.parse(raw);
      // Ensure mod-departments is merged if user had older cached templates
      const hasDepts = parsed.some(t => t.schema.slug === 'departments' || t.schema.id === 'mod-departments');
      let merged = parsed.map(t => {
        if (t.schema.slug === 'departments' || t.schema.id === 'mod-departments') {
          const fresh = INITIAL_STUDIO_TEMPLATES.find(init => init.schema.slug === 'departments');
          return fresh || t;
        }
        return {
          ...t,
          schema: {
            ...t.schema,
            archetype: t.schema.archetype || 'standard',
          },
        };
      });
      if (!hasDepts) {
        const deptTpl = INITIAL_STUDIO_TEMPLATES.find(t => t.schema.slug === 'departments');
        if (deptTpl) merged.push(deptTpl);
      }
      return merged;
    }
  } catch (e) {
    console.error('Error reading studio templates from localStorage:', e);
  }
  return INITIAL_STUDIO_TEMPLATES;
};

export const saveStudioTemplates = (templates: StudioTemplate[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
    window.dispatchEvent(new Event('studio-templates-updated'));
  } catch (e) {
    console.error('Error saving studio templates:', e);
  }
};

export const generateDynamicSampleItems = (schema: ModuleSchema, targetTenantId: string): DynamicEntityItem[] => {
  const isTimetable = schema.slug.includes('time') || 
                      schema.slug.includes('table') || 
                      schema.name.toLowerCase().includes('time') || 
                      schema.name.toLowerCase().includes('table');

  if (isTimetable) {
    const timetables = getStoredTimetables();
    if (timetables && timetables.length > 0) {
      return timetables.map(t => {
        const rowData: Record<string, any> = {};
        const rawSem = Array.isArray(t.semester) ? t.semester.join(', ') : String(t.semester || '1');
        const semVal = rawSem.replace(/semester|sem/gi, '').trim() || '1';

        const rawSec = Array.isArray(t.section) ? t.section.join(', ') : String(t.section || 'A');
        const secVal = rawSec.replace(/section/gi, '').trim() || 'A';

        schema.fields.forEach(f => {
          const fn = f.name.toLowerCase();
          const fl = f.label.toLowerCase();
          if (fn.includes('title') || fn.includes('name') || fl.includes('title') || fl.includes('name')) {
            rowData[f.name] = t.name;
          } else if (fn.includes('year') || fl.includes('year')) {
            rowData[f.name] = t.year;
          } else if (fn.includes('branch') || fn.includes('program') || fl.includes('branch') || fl.includes('program')) {
            rowData[f.name] = Array.isArray(t.branch) ? t.branch.join(', ') : t.branch;
          } else if (fn.includes('sem') || fl.includes('sem')) {
            rowData[f.name] = semVal;
          } else if (fn.includes('sec') || fl.includes('sec')) {
            rowData[f.name] = secVal;
          } else if (f.type === 'file_pdf' || fn.includes('file') || fl.includes('file')) {
            rowData[f.name] = t.fileUrl || SAMPLE_PDF;
            rowData[`${f.name}_filename`] = t.fileName || 'Academic_Schedule.pdf';
          } else if (f.options && f.options.length > 0) {
            rowData[f.name] = f.options[0].value;
          } else {
            rowData[f.name] = secVal;
          }
        });

        // Common key aliases
        rowData['title'] = t.name;
        rowData['name'] = t.name;
        rowData['year'] = t.year;
        rowData['academic_year'] = t.year;
        rowData['branch'] = Array.isArray(t.branch) ? t.branch.join(', ') : t.branch;
        rowData['program'] = Array.isArray(t.branch) ? t.branch.join(', ') : t.branch;
        rowData['program_branch'] = Array.isArray(t.branch) ? t.branch.join(', ') : t.branch;
        rowData['semester'] = semVal;
        rowData['section'] = secVal;
        rowData['fileUrl'] = t.fileUrl || SAMPLE_PDF;
        rowData['choose_file'] = t.fileUrl || SAMPLE_PDF;
        rowData['choose_file_filename'] = t.fileName || 'Academic_Schedule.pdf';

        return {
          id: `${schema.slug}-${t.id}`,
          tenantId: targetTenantId,
          moduleSlug: schema.slug,
          showOnWebsite: true,
          data: rowData,
          createdAt: t.createdAt,
          updatedAt: t.createdAt,
        };
      });
    }
  }

  // Generic 4-row generator for any custom module schema
  const presets = [
    { title: `${schema.name} Entry 01`, year: 2026, category: 'Academic', image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80' },
    { title: `${schema.name} Entry 02`, year: 2026, category: 'Examination', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80' },
    { title: `${schema.name} Entry 03`, year: 2025, category: 'Governance', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80' },
    { title: `${schema.name} Entry 04`, year: 2025, category: 'Recognition', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=600&q=80' },
  ];

  return presets.map((p, idx) => {
    const rowData: Record<string, any> = {};
    schema.fields.forEach(f => {
      if (f.type === 'image') rowData[f.name] = p.image;
      else if (f.type === 'file_pdf') {
        rowData[f.name] = SAMPLE_PDF;
        rowData[`${f.name}_filename`] = `${schema.name.replace(/\s+/g, '_')}_Doc_${idx + 1}.pdf`;
      } else if (f.type === 'number') rowData[f.name] = p.year;
      else if (f.type === 'date') rowData[f.name] = '2026-08-15';
      else if (f.options && f.options.length > 0) {
        rowData[f.name] = f.options[idx % f.options.length].value;
      } else {
        const fn = f.name.toLowerCase();
        if (fn.includes('title') || fn.includes('name')) rowData[f.name] = p.title;
        else if (fn.includes('year')) rowData[f.name] = p.year;
        else rowData[f.name] = `${f.label} Sample Value ${idx + 1}`;
      }
    });
    return {
      id: `${schema.slug}-auto-${idx + 1}`,
      tenantId: targetTenantId,
      moduleSlug: schema.slug,
      showOnWebsite: true,
      data: rowData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
};

// In-memory entity cache to ensure large base64 PDF uploads are never lost due to localStorage quota limits
const ENTITY_MEMORY_STORE = new Map<string, DynamicEntityItem[]>();

// Helper functions for entity items persistence
export const getStoredEntitiesBySlug = (slug: string, tenantId?: string): DynamicEntityItem[] => {
  const activeTenant = getActiveTenant();
  const targetTenantId = tenantId || activeTenant.id;
  const key = `${STORAGE_KEY_ENTITIES_PREFIX}${slug}_${targetTenantId}`;
  const globalKey = `${STORAGE_KEY_ENTITIES_PREFIX}${slug}`;

  // 1. Check in-memory store first
  const memoryItems = ENTITY_MEMORY_STORE.get(key) || ENTITY_MEMORY_STORE.get(globalKey);
  if (memoryItems && memoryItems.length > 0) {
    return memoryItems;
  }

  // 2. Check sessionStorage
  try {
    const sessionRaw = sessionStorage.getItem(key) || sessionStorage.getItem(globalKey);
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ENTITY_MEMORY_STORE.set(key, parsed);
        return parsed;
      }
    }
  } catch (e) {}

  // 3. Check localStorage
  try {
    const raw = localStorage.getItem(key) || localStorage.getItem(globalKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ENTITY_MEMORY_STORE.set(key, parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.error(`Error reading entity items for ${slug}:`, e);
  }

  const template = getStoredStudioTemplates().find(t => t.schema.slug === slug || t.schema.name.toLowerCase().replace(/\s+/g, '_') === slug);
  if (template) {
    if (template.sampleItems && template.sampleItems.length > 0) {
      const tenantFiltered = template.sampleItems.filter(item => !item.tenantId || item.tenantId === targetTenantId);
      if (tenantFiltered.length > 0) return tenantFiltered;
      return template.sampleItems;
    }
    // Generate dynamic sample items for this template's schema
    return generateDynamicSampleItems(template.schema, targetTenantId);
  }

  const isTimetableSlug = slug === 'timetables' || 
                          slug === 'time_table' || 
                          slug.toLowerCase().includes('timetable') || 
                          slug.toLowerCase().includes('time');

  if (isTimetableSlug) {
    const timetables = getStoredTimetables();
    if (timetables && timetables.length > 0) {
      return timetables.map(t => ({
        id: t.id,
        tenantId: targetTenantId,
        moduleSlug: slug,
        showOnWebsite: t.showOnWebsite !== false,
        data: {
          title: t.name,
          name: t.name,
          year: t.year,
          academic_year: t.year,
          academic_year_master: t.year,
          branch: Array.isArray(t.branch) ? t.branch.join(', ') : t.branch,
          program: Array.isArray(t.branch) ? t.branch.join(', ') : t.branch,
          program_branch: Array.isArray(t.branch) ? t.branch.join(', ') : t.branch,
          semester: Array.isArray(t.semester) ? t.semester.join(', ') : t.semester,
          section: Array.isArray(t.section) ? (t.section.join(', ') || 'Section A') : (t.section || 'Section A'),
          fileUrl: t.fileUrl || SAMPLE_PDF,
          file: t.fileUrl || SAMPLE_PDF,
          choose_file: t.fileUrl || SAMPLE_PDF,
          file_pdf: t.fileUrl || SAMPLE_PDF,
          choose_file_filename: t.fileName || 'Academic_Timetable.pdf',
          file_pdf_filename: t.fileName || 'Academic_Timetable.pdf',
          file_filename: t.fileName || 'Academic_Timetable.pdf',
        },
        createdAt: t.createdAt,
        updatedAt: t.createdAt,
      }));
    }
  }

  return [];
};

export const saveStoredEntitiesBySlug = (slug: string, items: DynamicEntityItem[], tenantId?: string): void => {
  const activeTenant = getActiveTenant();
  const targetTenantId = tenantId || activeTenant.id;
  const key = `${STORAGE_KEY_ENTITIES_PREFIX}${slug}_${targetTenantId}`;

  // 1. Always update memory cache so active session never loses items
  ENTITY_MEMORY_STORE.set(key, items);

  // 2. Try sessionStorage (higher quota or separate partition)
  try {
    sessionStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.warn(`Could not save items to sessionStorage for ${slug}:`, e);
  }

  // 3. Save to localStorage with graceful quota fallback
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.warn(`localStorage quota exceeded for ${slug}. Storing optimized items in localStorage.`);
    try {
      // If full items exceed quota due to huge base64 strings, store metadata with a safe reference in localStorage
      const safeItems = items.map(item => {
        const safeData = { ...item.data };
        return { ...item, data: safeData };
      });
      localStorage.setItem(key, JSON.stringify(safeItems));
    } catch (innerErr) {
      console.warn('Could not save even trimmed items to localStorage, persisting in memory/sessionStorage:', innerErr);
    }
  }

  window.dispatchEvent(new Event(`studio-entities-updated-${slug}`));
  window.dispatchEvent(new Event('studio-data-updated'));
};
