// ─────────────────────────────────────────────
// Department Data Models & Local Storage
// ─────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  stream: DepartmentStream;
  faculty?: string;
  code?: string;
  hod?: string;
  description?: string;
}

export type DepartmentStream =
  | 'Arts'
  | 'Science'
  | 'Commerce';

export const DEPARTMENT_STREAMS: DepartmentStream[] = [
  'Arts',
  'Science',
  'Commerce',
];

export type DepartmentTabType = 'static' | 'staff' | 'dynamic';
export type StaffCategory = 'teaching' | 'non-teaching' | 'alumnae';

export interface DepartmentTab {
  id: string;
  label: string;
  type: DepartmentTabType;
  staffCategory?: StaffCategory;
  visible: boolean;
  content: string;
}

export interface DepartmentStaffMember {
  id: string;
  departmentId: string;
  name: string;
  designation: string;
  qualification: string;
  specialization?: string;
  experience?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  category: StaffCategory;
  order: number;
}

// 21 Predefined Tabs matching requirement (No "Members" tab)
export const INITIAL_DEPARTMENT_TABS: DepartmentTab[] = [
  {
    id: 'tab-overview',
    label: 'Overview',
    type: 'static',
    visible: true,
    content: `The Department was established with an objective to impart quality higher education and foster innovative thinking. With modern laboratory infrastructure, dedicated faculty, and an industry-oriented curriculum, the department prepares students for cutting-edge technical challenges and research pursuits worldwide.`,
  },
  {
    id: 'tab-vision',
    label: 'Vision',
    type: 'static',
    visible: true,
    content: `To be a globally recognized center of excellence in education and research, fostering ethically committed and technically competent professionals capable of addressing societal and industrial needs.`,
  },
  {
    id: 'tab-mission',
    label: 'Mission',
    type: 'static',
    visible: true,
    content: `• M1: Impart high-quality undergraduate and postgraduate education through modern pedagogical methods.\n• M2: Foster state-of-the-art research and development through active industry-academia collaborations.\n• M3: Inculcate professional ethics, leadership qualities, and an entrepreneurial mindset among students.`,
  },
  {
    id: 'tab-objectives',
    label: 'Objectives',
    type: 'static',
    visible: true,
    content: `1. Ensure a minimum 90% graduation and placement rate for undergraduate and postgraduate students.\n2. Encourage interdisciplinary research and publications in indexed international journals.\n3. Organize international conferences, seminars, and faculty development programs regularly.\n4. Facilitate continuous professional upskilling and industrial internship opportunities.`,
  },
  {
    id: 'tab-courses-offered',
    label: 'Courses Offered',
    type: 'static',
    visible: true,
    content: `• B.Sc. (Honours) - 3 Years\n• M.Sc. - 2 Years\n• Ph.D. Program - Full Time / Part Time`,
  },
  {
    id: 'tab-teaching-staff',
    label: 'Teaching Staff',
    type: 'staff',
    staffCategory: 'teaching',
    visible: true,
    content: '',
  },
  {
    id: 'tab-non-teaching-staff',
    label: 'Non Teaching Staff',
    type: 'staff',
    staffCategory: 'non-teaching',
    visible: true,
    content: '',
  },
  {
    id: 'tab-distinguished-alumnae',
    label: 'Distinguished Alumnae',
    type: 'staff',
    staffCategory: 'alumnae',
    visible: true,
    content: '',
  },
  {
    id: 'tab-time-table',
    label: 'Time Table',
    type: 'static',
    visible: true,
    content: `Department Class Timetables for Academic Year 2025–2026 (Odd & Even Semesters).\n\n• Odd Semester (Sem I, III, V): Mon – Fri, 9:00 AM – 4:30 PM\n• Even Semester (Sem II, IV, VI): Mon – Fri, 9:00 AM – 4:30 PM\n• Weekly Tutorial & Mentorship Session: Friday 3:30 PM – 4:30 PM`,
  },
  {
    id: 'tab-placements-internships',
    label: 'Placements & Internships',
    type: 'static',
    visible: true,
    content: `The Department maintains an outstanding placement track record with eligible students placed in premier research organizations and industries.`,
  },
  {
    id: 'tab-annual-calendar',
    label: 'Annual Calendar',
    type: 'static',
    visible: true,
    content: `• July: Academic Session Commences & Orientation Program\n• August: Departmental Seminar Series\n• September: Mid-Term Internal Assessments & Industry Visit\n• October: Department Festival & Competitions\n• November: End-Semester Practical & Theory Examinations\n• January: Even Semester Resumption & National Conference`,
  },
  {
    id: 'tab-departmental-activities',
    label: 'Departmental Activities',
    type: 'static',
    visible: true,
    content: `• Annual Department Symposium\n• Guest Lecture Series with Eminent Scholars\n• Community Outreach and Hands-on Science Exhibits`,
  },
  {
    id: 'tab-research-publication',
    label: 'Research & Publication',
    type: 'static',
    visible: true,
    content: `Active research groups across core disciplines with regular publications in peer-reviewed national and international journals.`,
  },
  {
    id: 'tab-awards-honors',
    label: 'Awards, Honors & Recognitions',
    type: 'static',
    visible: true,
    content: `• Department Faculty conferred with State Academic Excellence Award\n• Student achievements in inter-college research conventions`,
  },
  {
    id: 'tab-value-added-courses',
    label: 'Value Added Courses',
    type: 'static',
    visible: true,
    content: `• VAC-101: Advanced Scientific Computing & Data Analysis (30 Hours)\n• VAC-102: Laboratory Instrumentation and Safety Protocols (30 Hours)`,
  },
  {
    id: 'tab-capability-enhancement',
    label: 'Capability Enhancement Programs',
    type: 'static',
    visible: true,
    content: `• Analytical Thinking & Research Methodology Seminars\n• Language Lab & Scientific Writing Mentorship`,
  },
  {
    id: 'tab-skill-development',
    label: 'Skill Development Courses',
    type: 'static',
    visible: true,
    content: `• Certificate in Applied Data Science\n• Technical Software and Computational Simulation Tools`,
  },
  {
    id: 'tab-photo-gallery',
    label: 'Photo Gallery',
    type: 'dynamic',
    visible: true,
    content: '',
  },
  {
    id: 'tab-research-publications',
    label: 'Research Publications',
    type: 'static',
    visible: true,
    content: `Selected published papers in indexed journals and proceedings.`,
  },
  {
    id: 'tab-study-material',
    label: 'Study Material',
    type: 'static',
    visible: true,
    content: `Lecture notes, course syllabi, reference question sets, and laboratory manuals.`,
  },
  {
    id: 'tab-students-achievement',
    label: 'Students Achievement',
    type: 'static',
    visible: true,
    content: `Recognizing University rank holders, academic scholars, and competition winners.`,
  },
];

// Clean seed departments matching the system's clean look
export const SEED_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Physics', stream: 'Science', faculty: 'Science' },
  { id: 'dept-2', name: 'Chemistry', stream: 'Science', faculty: 'Science' },
  { id: 'dept-3', name: 'Mathematics', stream: 'Science', faculty: 'Science' },
  { id: 'dept-4', name: 'Computer Science', stream: 'Science', faculty: 'Science' },
  { id: 'dept-5', name: 'English', stream: 'Arts', faculty: 'Arts' },
  { id: 'dept-6', name: 'Commerce', stream: 'Commerce', faculty: 'Commerce' },
];

// Seed Staff
export const SEED_STAFF_MEMBERS: DepartmentStaffMember[] = [
  // Teaching Staff
  {
    id: 'st-t1',
    departmentId: 'dept-1',
    name: 'Dr. Anand Joshi',
    designation: 'Professor & HOD',
    qualification: 'Ph.D., M.Sc.',
    specialization: 'Quantum Mechanics & Optics',
    experience: '20 Years',
    email: 'anand.joshi@college.edu',
    imageUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
    category: 'teaching',
    order: 1,
  },
  {
    id: 'st-t2',
    departmentId: 'dept-1',
    name: 'Dr. Sunita Rao',
    designation: 'Associate Professor',
    qualification: 'Ph.D.',
    specialization: 'Solid State Physics',
    experience: '15 Years',
    email: 'sunita.rao@college.edu',
    imageUrl: 'https://randomuser.me/api/portraits/women/41.jpg',
    category: 'teaching',
    order: 2,
  },
  {
    id: 'st-t3',
    departmentId: 'dept-1',
    name: 'Mr. Vikram Singh',
    designation: 'Assistant Professor',
    qualification: 'M.Sc., NET',
    specialization: 'Nuclear Physics',
    experience: '8 Years',
    email: 'vikram.singh@college.edu',
    imageUrl: 'https://randomuser.me/api/portraits/men/33.jpg',
    category: 'teaching',
    order: 3,
  },

  // Non-Teaching Staff
  {
    id: 'st-nt1',
    departmentId: 'dept-1',
    name: 'Mr. Suresh Kadam',
    designation: 'Lab Assistant',
    qualification: 'B.Sc.',
    specialization: 'Optics Lab',
    experience: '12 Years',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    category: 'non-teaching',
    order: 1,
  },
  {
    id: 'st-nt2',
    departmentId: 'dept-1',
    name: 'Ms. Meena Patil',
    designation: 'Senior Clerk',
    qualification: 'B.Com',
    specialization: 'Academic Records',
    experience: '10 Years',
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    category: 'non-teaching',
    order: 2,
  },

  // Distinguished Alumnae
  {
    id: 'st-al1',
    departmentId: 'dept-1',
    name: 'Dr. Priya Nambiar',
    designation: 'Senior Scientist at National Research Lab (Batch 2010)',
    qualification: 'Ph.D., B.Sc.',
    specialization: 'Astrophysics',
    experience: 'Alumna Batch 2010',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    category: 'alumnae',
    order: 1,
  },
];

// ─────────────────────────────────────────────
// Local Storage Persistence Helpers
// ─────────────────────────────────────────────

const DEPT_KEY = 'college_departments_data_v2';
const DEPT_TABS_PREFIX = 'college_dept_tabs_';
const DEPT_STAFF_PREFIX = 'college_dept_staff_';

export const getStoredDepartments = (): Department[] => {
  try {
    localStorage.removeItem('college_departments_data_v1');
    const raw = localStorage.getItem(DEPT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(p => p.stream)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading departments from localStorage', e);
  }
  return SEED_DEPARTMENTS;
};

export const saveStoredDepartments = (departments: Department[]): void => {
  try {
    localStorage.setItem(DEPT_KEY, JSON.stringify(departments));
    window.dispatchEvent(new CustomEvent('departments-updated'));
  } catch (e) {
    console.error('Error saving departments to localStorage', e);
  }
};

export const getDepartmentTabs = (deptId: string): DepartmentTab[] => {
  try {
    const raw = localStorage.getItem(`${DEPT_TABS_PREFIX}${deptId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading department tabs from localStorage', e);
  }
  return JSON.parse(JSON.stringify(INITIAL_DEPARTMENT_TABS));
};

export const saveDepartmentTabs = (deptId: string, tabs: DepartmentTab[]): void => {
  try {
    localStorage.setItem(`${DEPT_TABS_PREFIX}${deptId}`, JSON.stringify(tabs));
  } catch (e) {
    console.error('Error saving department tabs to localStorage', e);
  }
};

export const syncDepartmentTabsToAll = (sourceTabs: DepartmentTab[]): number => {
  try {
    const allDepts = getStoredDepartments();
    allDepts.forEach(dept => {
      const existingTabs = getDepartmentTabs(dept.id);
      // Retain existing department-specific content while updating tab structure/order/visibility
      const mergedTabs: DepartmentTab[] = sourceTabs.map(srcTab => {
        const match = existingTabs.find(t => t.id === srcTab.id);
        return {
          ...srcTab,
          content: match && match.content ? match.content : srcTab.content,
        };
      });
      saveDepartmentTabs(dept.id, mergedTabs);
    });
    window.dispatchEvent(new CustomEvent('department-tabs-synced'));
    return allDepts.length;
  } catch (e) {
    console.error('Error syncing tabs across all departments', e);
    return 0;
  }
};

export const getDepartmentStaff = (deptId: string): DepartmentStaffMember[] => {
  try {
    const raw = localStorage.getItem(`${DEPT_STAFF_PREFIX}${deptId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading department staff from localStorage', e);
  }
  const seed = SEED_STAFF_MEMBERS.filter(s => s.departmentId === deptId);
  return seed.length > 0 ? seed : SEED_STAFF_MEMBERS.map(s => ({ ...s, departmentId: deptId }));
};

export const saveDepartmentStaff = (deptId: string, staff: DepartmentStaffMember[]): void => {
  try {
    localStorage.setItem(`${DEPT_STAFF_PREFIX}${deptId}`, JSON.stringify(staff));
    window.dispatchEvent(new CustomEvent('department-staff-updated', { detail: { deptId } }));
  } catch (e) {
    console.error('Error saving department staff to localStorage', e);
  }
};
