import { Timetable } from '../../types/timetable';

export const initialTimetables: Timetable[] = [
  {
    id: 'tt-1',
    name: 'B.Tech First Year (Sem 1) - 2024',
    semester: ['I', 'II'],
    branch: ['Computer Science'],
    section: ['A', 'B'],
    fileName: 'btech_1st_sem1.pdf',
    fileUrl: '#',
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
    fileUrl: '#',
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
    fileUrl: '#',
    year: '2023-24',
    showOnWebsite: false,
    createdAt: '2023-08-15'
  }
];
