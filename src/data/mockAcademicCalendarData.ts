import { AcademicCalendar, CalendarEvent } from '../types/academicCalendar';

export const SEED_ACADEMIC_CALENDARS: AcademicCalendar[] = [
  {
    id: 'cal-univ-2026',
    name: 'State University Master Academic Calendar 2026-27',
    calendarType: 'University Calendar',
    academicYear: '2026-2027',
    institutionName: 'State Central Affiliating University',
    startDate: '2026-07-01',
    endDate: '2027-05-31',
    description: 'Mandatory university-wide academic terms, centralized examination windows, convocation, and gazetted holiday schedules for all affiliated autonomous colleges.',
    status: 'Published',
    eventsCount: 6,
    uploadedDocument: {
      fileName: 'University_Master_Calendar_2026_27_Official.pdf',
      fileSize: '2.4 MB',
      fileType: 'pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadDate: '2026-06-15'
    },
    createdAt: '2026-06-15',
    updatedAt: '2026-06-20'
  },
  {
    id: 'cal-coll-2026',
    name: 'College Institutional Academic & Event Calendar 2026-27',
    calendarType: 'College Calendar',
    academicYear: '2026-2027',
    institutionName: 'Elite Autonomous College of Arts, Science and Commerce',
    startDate: '2026-07-06',
    endDate: '2027-05-25',
    description: 'Comprehensive college-level calendar including Continuous Internal Evaluation (CIE), foundation weeks, annual cultural fest, sports meet, and faculty development schedules.',
    status: 'Published',
    eventsCount: 8,
    uploadedDocument: {
      fileName: 'College_Academic_Calendar_2026-27_Approved.pdf',
      fileSize: '3.1 MB',
      fileType: 'pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadDate: '2026-06-28'
    },
    createdAt: '2026-06-28',
    updatedAt: '2026-07-02'
  },
  {
    id: 'cal-dept-cs-2026',
    name: 'Computer Science & Engineering Academic Schedule 2026-27',
    calendarType: 'Department Calendar',
    academicYear: '2026-2027',
    institutionName: 'Department of Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    program: 'B.Tech / M.Tech Computer Science',
    startDate: '2026-07-10',
    endDate: '2027-05-20',
    description: 'Departmental lab reviews, Capstone project milestones, AI & Cloud Computing workshops, Hackathons, and industry guest lectures.',
    status: 'Published',
    eventsCount: 5,
    uploadedDocument: {
      fileName: 'CSE_Department_Activity_Calendar_2026.docx',
      fileSize: '1.2 MB',
      fileType: 'docx',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadDate: '2026-07-05'
    },
    createdAt: '2026-07-05',
    updatedAt: '2026-07-10'
  },
  {
    id: 'cal-sem-odd-2026',
    name: 'Odd Semester Term Schedule (Sem 1, 3, 5, 7)',
    calendarType: 'Semester / Term Calendar',
    academicYear: '2026-2027',
    institutionName: 'Elite Autonomous College of Arts, Science and Commerce',
    semester: 'Odd Semesters (1, 3, 5, 7)',
    startDate: '2026-07-15',
    endDate: '2026-12-15',
    description: 'Instructional days count, CIE Test-1, CIE Test-2, Mid-term reviews, practical exams, and semester end theory evaluation dates.',
    status: 'Published',
    eventsCount: 5,
    uploadedDocument: {
      fileName: 'Odd_Sem_Instructional_Plan_2026.xlsx',
      fileSize: '890 KB',
      fileType: 'xlsx',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadDate: '2026-07-08'
    },
    createdAt: '2026-07-08',
    updatedAt: '2026-07-12'
  },
  {
    id: 'cal-dept-comm-2026',
    name: 'Commerce & Management Academic & Corporate Readiness Plan',
    calendarType: 'Department Calendar',
    academicYear: '2026-2027',
    institutionName: 'Faculty of Commerce and Management',
    department: 'Commerce & Management',
    program: 'B.Com / BBA / MBA',
    startDate: '2026-07-20',
    endDate: '2027-05-15',
    description: 'Industry immersion visits, GST & Taxation seminars, FinTech analytics workshops, and commerce fest.',
    status: 'Under Review',
    eventsCount: 3,
    uploadedDocument: {
      fileName: 'Commerce_Planning_Draft_2026.pdf',
      fileSize: '1.6 MB',
      fileType: 'pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadDate: '2026-07-18'
    },
    createdAt: '2026-07-18',
    updatedAt: '2026-07-20'
  },
  {
    id: 'cal-even-draft-2026',
    name: 'Even Semester Term Schedule (Sem 2, 4, 6, 8) Draft',
    calendarType: 'Semester / Term Calendar',
    academicYear: '2026-2027',
    institutionName: 'Elite Autonomous College of Arts, Science and Commerce',
    semester: 'Even Semesters (2, 4, 6, 8)',
    startDate: '2027-01-04',
    endDate: '2027-05-30',
    description: 'Tentative schedule for spring terms, internal test cycles, and pre-annual examination breaks.',
    status: 'Draft',
    eventsCount: 2,
    createdAt: '2026-07-22',
    updatedAt: '2026-07-22'
  }
];

export const SEED_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-01',
    calendarId: 'cal-univ-2026',
    calendarName: 'State University Master Academic Calendar 2026-27',
    name: 'Commencement of Odd Semester Academic Instruction',
    category: 'Academic Activity',
    startDate: '2026-07-15',
    endDate: '2026-07-15',
    description: 'University-wide formal start of instructional classes for all undergraduate and postgraduate programs.',
    applicability: {
      type: 'Entire College'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-06-20'
  },
  {
    id: 'evt-02',
    calendarId: 'cal-coll-2026',
    calendarName: 'College Institutional Academic & Event Calendar 2026-27',
    name: 'Student Orientation & Induction Program (Deeksharambh)',
    category: 'Academic Activity',
    startDate: '2026-07-16',
    endDate: '2026-07-21',
    description: 'One-week mandatory induction program for first-year undergraduate and postgraduate students as per UGC norms.',
    applicability: {
      type: 'Selected Semester',
      semester: 'Semester 1'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-07-02'
  },
  {
    id: 'evt-03',
    calendarId: 'cal-coll-2026',
    calendarName: 'College Institutional Academic & Event Calendar 2026-27',
    name: 'Independence Day Celebrations & Flag Hoisting',
    category: 'Cultural Activity',
    startDate: '2026-08-15',
    endDate: '2026-08-15',
    description: 'Institutional celebration with NCC parade, patriotic performances, and tree plantation drive.',
    applicability: {
      type: 'Entire College'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-07-02'
  },
  {
    id: 'evt-04',
    calendarId: 'cal-sem-odd-2026',
    calendarName: 'Odd Semester Term Schedule (Sem 1, 3, 5, 7)',
    name: 'Continuous Internal Evaluation (CIE Test 1)',
    category: 'College Examination',
    startDate: '2026-09-07',
    endDate: '2026-09-12',
    description: 'First centralized internal assessment covering Units 1 & 2 across all UG and PG streams.',
    applicability: {
      type: 'Entire College'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-07-12'
  },
  {
    id: 'evt-05',
    calendarId: 'cal-dept-cs-2026',
    calendarName: 'Computer Science & Engineering Academic Schedule 2026-27',
    name: 'National Workshop on Next-Gen Generative AI & Cloud Architecture',
    category: 'Workshop',
    startDate: '2026-09-24',
    endDate: '2026-09-25',
    description: 'Two-day hands-on workshop in collaboration with IEEE Student Branch and Google Developer Groups.',
    applicability: {
      type: 'Selected Department',
      department: 'Computer Science & Engineering',
      program: 'B.Tech / M.Tech Computer Science'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-07-10'
  },
  {
    id: 'evt-06',
    calendarId: 'cal-univ-2026',
    calendarName: 'State University Master Academic Calendar 2026-27',
    name: 'Mahatma Gandhi Jayanti (National Holiday)',
    category: 'Holiday',
    startDate: '2026-10-02',
    endDate: '2026-10-02',
    description: 'National holiday in commemoration of Mahatma Gandhi.',
    applicability: {
      type: 'Entire College'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-06-20'
  },
  {
    id: 'evt-07',
    calendarId: 'cal-univ-2026',
    calendarName: 'State University Master Academic Calendar 2026-27',
    name: 'Diwali & Mid-Term Festival Vacation',
    category: 'Vacation',
    startDate: '2026-10-26',
    endDate: '2026-11-04',
    description: 'Official festival recess for faculty and students as approved by University Academic Council.',
    applicability: {
      type: 'Entire College'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-06-20'
  },
  {
    id: 'evt-08',
    calendarId: 'cal-sem-odd-2026',
    calendarName: 'Odd Semester Term Schedule (Sem 1, 3, 5, 7)',
    name: 'Continuous Internal Evaluation (CIE Test 2)',
    category: 'College Examination',
    startDate: '2026-11-16',
    endDate: '2026-11-21',
    description: 'Second internal evaluation test covering Units 3, 4 & 5 before university semester practicals.',
    applicability: {
      type: 'Entire College'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-07-12'
  },
  {
    id: 'evt-09',
    calendarId: 'cal-dept-cs-2026',
    calendarName: 'Computer Science & Engineering Academic Schedule 2026-27',
    name: '24-Hour Smart Campus Hackathon & Project Demo Day',
    category: 'Department Event',
    startDate: '2026-11-27',
    endDate: '2026-11-28',
    description: 'Annual departmental student coding hackathon with industry juries and innovation seed awards.',
    applicability: {
      type: 'Selected Department',
      department: 'Computer Science & Engineering'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-07-10'
  },
  {
    id: 'evt-10',
    calendarId: 'cal-univ-2026',
    calendarName: 'State University Master Academic Calendar 2026-27',
    name: 'End Semester Theory & Practical University Examinations',
    category: 'University Examination',
    startDate: '2026-12-01',
    endDate: '2026-12-24',
    description: 'Centralized semester-end theory and practical examination window conducted by State University Board of Examinations.',
    applicability: {
      type: 'Entire College'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-06-20'
  },
  {
    id: 'evt-11',
    calendarId: 'cal-coll-2026',
    calendarName: 'College Institutional Academic & Event Calendar 2026-27',
    name: 'Annual Inter-Collegiate Sports Olympiad & Athletics Meet',
    category: 'Sports Activity',
    startDate: '2027-01-18',
    endDate: '2027-01-20',
    description: 'Inter-departmental and inter-collegiate tournament for cricket, basketball, volleyball, athletics and chess.',
    applicability: {
      type: 'Entire College'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-07-02'
  },
  {
    id: 'evt-12',
    calendarId: 'cal-dept-comm-2026',
    calendarName: 'Commerce & Management Academic & Corporate Readiness Plan',
    name: 'International Conference on FinTech and Digital Governance',
    category: 'Seminar',
    startDate: '2027-02-12',
    endDate: '2027-02-13',
    description: 'Research symposium with keynote addresses by SEBI officers and industry leaders.',
    applicability: {
      type: 'Selected Department',
      department: 'Commerce & Management',
      program: 'B.Com / BBA / MBA'
    },
    status: 'Scheduled',
    verificationStatus: 'Pending Review',
    createdAt: '2026-07-20'
  },
  {
    id: 'evt-13',
    calendarId: 'cal-coll-2026',
    calendarName: 'College Institutional Academic & Event Calendar 2026-27',
    name: 'TARANG - Annual National Cultural & Arts Festival',
    category: 'Cultural Activity',
    startDate: '2027-02-25',
    endDate: '2027-02-27',
    description: 'Three-day flagship national youth cultural extravaganza featuring drama, music, dance and literary events.',
    applicability: {
      type: 'Entire College'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-07-02'
  },
  {
    id: 'evt-14',
    calendarId: 'cal-coll-2026',
    calendarName: 'College Institutional Academic & Event Calendar 2026-27',
    name: 'Annual Convocation & Degree Conferment Ceremony',
    category: 'Academic Activity',
    startDate: '2027-03-20',
    endDate: '2027-03-20',
    description: 'Formal convocation for graduating batch with honorable Vice Chancellor and Chief Guest.',
    applicability: {
      type: 'Entire College'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-07-02'
  },
  {
    id: 'evt-15',
    calendarId: 'cal-univ-2026',
    calendarName: 'State University Master Academic Calendar 2026-27',
    name: 'Even Semester Final University Examinations',
    category: 'University Examination',
    startDate: '2027-05-02',
    endDate: '2027-05-24',
    description: 'Final university theory examinations for even semesters across all undergraduate and postgraduate departments.',
    applicability: {
      type: 'Entire College'
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    createdAt: '2026-06-20'
  }
];
