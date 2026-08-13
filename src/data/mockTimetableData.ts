import { Timetable } from '../types/timetable';

export const SAMPLE_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

export const initialTimetables: Timetable[] = [
  {
    id: 'tt-1',
    name: 'B.Tech First Year (Sem 1) - 2024',
    semester: ['I', 'II'],
    branch: ['Computer Science'],
    section: ['A', 'B'],
    fileName: 'btech_1st_sem1.pdf',
    fileUrl: SAMPLE_PDF,
    year: '2024-25',
    showOnWebsite: true,
    createdAt: '2024-03-01'
  },
  {
    id: 'tt-2',
    name: 'BCA Third Year (Sem 5) - 2024',
    semester: ['V', 'VI'],
    branch: ['BCA'],
    section: ['A'],
    fileName: 'bca_3rd_sem5.pdf',
    fileUrl: SAMPLE_PDF,
    year: '2024-25',
    showOnWebsite: true,
    createdAt: '2024-03-05'
  },
  {
    id: 'tt-3',
    name: 'MBA Second Year (Sem 3) - 2023',
    semester: ['III'],
    branch: ['MBA'],
    section: ['A', 'B', 'C'],
    fileName: 'mba_2nd_sem3_2023.pdf',
    fileUrl: SAMPLE_PDF,
    year: '2023-24',
    showOnWebsite: true,
    createdAt: '2023-08-15'
  }
];

const STORAGE_KEY = 'laravel_ui_timetables_list';

export const getStoredTimetables = (): Timetable[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t: Timetable) => ({
          ...t,
          fileUrl: (t.fileUrl && t.fileUrl.trim() !== '' && t.fileUrl !== '#') ? t.fileUrl : SAMPLE_PDF
        }));
      }
    }
  } catch (e) {
    console.error('Error reading timetables from localStorage:', e);
  }
  return initialTimetables;
};

export const saveStoredTimetables = (timetables: Timetable[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timetables));
    window.dispatchEvent(new Event('timetable-data-updated'));
  } catch (e) {
    console.error('Error saving timetables to localStorage:', e);
  }
};
