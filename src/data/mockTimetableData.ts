import { Timetable } from '../types/timetable';
import { getActiveTenant } from './tenantData';

export const SAMPLE_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const getStorageKey = () => {
  const activeTenant = getActiveTenant();
  return `laravel_ui_timetables_list_${activeTenant.id}`;
};

export const getStoredTimetables = (): Timetable[] => {
  try {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 4) {
        return parsed.map((t: Timetable) => ({
          ...t,
          fileUrl: (t.fileUrl && t.fileUrl.trim() !== '' && t.fileUrl !== '#') ? t.fileUrl : SAMPLE_PDF
        }));
      }
    }
  } catch (e) {
    console.error('Error reading timetables from localStorage:', e);
  }

  // Fallback to active tenant sample timetables
  const tenant = getActiveTenant();
  return tenant.sampleTimetables.map(st => ({
    id: st.id,
    name: st.title,
    year: st.academicYear,
    branch: st.branch ? [st.branch] : [],
    semester: st.semester ? [st.semester] : [],
    section: ['A'],
    fileName: st.fileName,
    fileUrl: st.fileUrl || SAMPLE_PDF,
    showOnWebsite: st.showOnWebsite,
    createdAt: new Date().toISOString().split('T')[0]
  }));
};

export const saveStoredTimetables = (timetables: Timetable[]): void => {
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(timetables));
    window.dispatchEvent(new Event('timetable-data-updated'));
  } catch (e) {
    console.error('Error saving timetables to localStorage:', e);
  }
};
