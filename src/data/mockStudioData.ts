import { StudioTemplate, ModuleSchema, DynamicEntityItem } from '../types/moduleStudio';
import { getActiveTenant } from './tenantData';
import { getStoredTimetables } from './mockTimetableData';

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
            { label: 'Semester 1 (Odd)', value: 'Sem 1' },
            { label: 'Semester 2 (Even)', value: 'Sem 2' },
            { label: 'Semester 3 (Odd)', value: 'Sem 3' },
            { label: 'Semester 4 (Even)', value: 'Sem 4' },
            { label: 'Semester 5 (Odd)', value: 'Sem 5' },
            { label: 'Semester 6 (Even)', value: 'Sem 6' },
            { label: 'Semester 7 (Odd)', value: 'Sem 7' },
            { label: 'Semester 8 (Even)', value: 'Sem 8' },
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
            { label: 'Section A', value: 'Section A' },
            { label: 'Section B', value: 'Section B' },
            { label: 'Section C', value: 'Section C' },
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
          title: 'MSc Nutrition & Food Technology - Odd Sem 2026',
          year: '2026-2027',
          branch: ['MSc Nutrition', 'Food Tech'],
          semester: [1, 3],
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
          title: 'B.Tech Computer Science End Sem Exam Schedule',
          year: '2026-2027',
          branch: ['Computer Science', 'Information Tech'],
          semester: [5, 7],
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        createdAt: '2026-08-05T00:00:00Z',
        updatedAt: '2026-08-05T00:00:00Z',
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
];

// Helper functions for template persistence
export const getStoredStudioTemplates = (): StudioTemplate[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (raw) {
      return JSON.parse(raw);
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

// Helper functions for entity items persistence
export const getStoredEntitiesBySlug = (slug: string, tenantId?: string): DynamicEntityItem[] => {
  const activeTenant = getActiveTenant();
  const targetTenantId = tenantId || activeTenant.id;
  const key = `${STORAGE_KEY_ENTITIES_PREFIX}${slug}_${targetTenantId}`;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(`Error reading entity items for ${slug}:`, e);
  }

  // Also check without tenant suffix in case items were saved globally
  try {
    const globalRaw = localStorage.getItem(`${STORAGE_KEY_ENTITIES_PREFIX}${slug}`);
    if (globalRaw) {
      const parsedGlobal = JSON.parse(globalRaw);
      if (Array.isArray(parsedGlobal) && parsedGlobal.length > 0) {
        return parsedGlobal;
      }
    }
  } catch (e) {}

  // If timetables slug, bridge with timetables dataset
  if (slug === 'timetables' || slug.includes('timetable') || slug.includes('time_table')) {
    try {
      const timetables = getStoredTimetables();
      if (timetables && timetables.length > 0) {
        return timetables.map(t => ({
          id: t.id,
          tenantId: targetTenantId,
          moduleSlug: slug,
          showOnWebsite: t.showOnWebsite !== false,
          data: {
            title: t.name,
            year: t.year,
            branch: t.branch,
            semester: t.semester,
            section: t.section,
            fileUrl: t.fileUrl,
            choose_file_filename: t.fileName,
            file_pdf_filename: t.fileName,
          },
          createdAt: t.createdAt,
          updatedAt: t.createdAt,
        }));
      }
    } catch (e) {
      console.error('Error bridging timetables in getStoredEntitiesBySlug:', e);
    }
  }

  // Fallback to sample items in initial template definition
  const template = getStoredStudioTemplates().find(t => t.schema.slug === slug);
  if (template && template.sampleItems) {
    const tenantFiltered = template.sampleItems.filter(item => !item.tenantId || item.tenantId === targetTenantId);
    if (tenantFiltered.length > 0) return tenantFiltered;
    return template.sampleItems;
  }
  return [];
};

export const saveStoredEntitiesBySlug = (slug: string, items: DynamicEntityItem[], tenantId?: string): void => {
  const activeTenant = getActiveTenant();
  const targetTenantId = tenantId || activeTenant.id;
  const key = `${STORAGE_KEY_ENTITIES_PREFIX}${slug}_${targetTenantId}`;

  try {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new Event(`studio-entities-updated-${slug}`));
    window.dispatchEvent(new Event('studio-data-updated'));
  } catch (e) {
    console.error(`Error saving entity items for ${slug}:`, e);
  }
};
