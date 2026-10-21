/**
 * NAAC Document Management System Data Layer
 * ITM Skills University — 5 Schools, 18 Programs, Criteria 1–7
 * 100% Client-Side LocalStorage with Live Sync
 */

export interface NaacSchool {
  id: string;
  name: string;
  shortCode: string;
  deanName: string;
  deanEmail?: string;
  coordinatorName: string;
  programs: NaacProgram[];
}

export interface NaacCriterionSummary {
  id: string;
  code: string;
  name: string;
  weightage: number;
  description?: string;
}

export interface NaacProgram {
  id: string;
  name: string;
  shortCode: string;
  degreeType: 'UG' | 'PG' | 'Diploma';
  coordinatorName: string;
  coordinatorEmail: string;
}

export interface NaacMetric {
  code: string;
  name: string;
  criterionId: string;
  criterionCode: string;
  metricType: 'QnM' | 'QlM';
  description: string;
}

export type NaacWorkflowStatus = 
  | 'draft'
  | 'submitted_to_school'
  | 'changes_requested'
  | 'approved_by_school'
  | 'university_verified';

export interface NaacEvidenceDocument {
  id: string;
  title: string;
  description: string;
  schoolId: string;
  schoolName: string;
  programId: string;
  programName: string;
  academicYear: string;
  criterionId: string;
  criterionCode: string;
  metricCode: string;
  metricName: string;
  metricType: 'QnM' | 'QlM';
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  uploadedBy: string;
  uploadedAt: string;
  status: NaacWorkflowStatus;
  version: string;
  // Department Faculty Metadata (Submissions by staff under Program Coordinator)
  submittedByFacultyId?: string;
  facultyName?: string;
  facultyDesignation?: string;
  coordinatorReviewStatus?: 'pending_review' | 'compiled' | 'changes_requested';
  coordinatorFeedback?: string;
  compiledAt?: string;
  // School review
  schoolReviewNote?: string;
  schoolReviewedBy?: string;
  schoolReviewedAt?: string;
  universityReviewNote?: string;
  universityVerifiedBy?: string;
  universityVerifiedAt?: string;
}

export interface DepartmentFaculty {
  id: string;
  name: string;
  designation: string;
  criterionAssigned: string;
  email: string;
  avatarInitials: string;
}

export const CSE_DEPARTMENT_FACULTY: DepartmentFaculty[] = [
  {
    id: 'fac-1',
    name: 'Dr. Ramesh Gupta',
    designation: 'Associate Professor & Criterion 2 Lead',
    criterionAssigned: 'Criterion 2: Teaching-Learning & Evaluation',
    email: 'r.gupta@itmuniversity.edu',
    avatarInitials: 'RG',
  },
  {
    id: 'fac-2',
    name: 'Prof. Sneha Patel',
    designation: 'Assistant Professor & Lab / Infrastructure In-charge',
    criterionAssigned: 'Criterion 4: Infrastructure & Learning Resources',
    email: 's.patel@itmuniversity.edu',
    avatarInitials: 'SP',
  },
  {
    id: 'fac-3',
    name: 'Dr. Arun Joshi',
    designation: 'Associate Professor & Department Research Lead',
    criterionAssigned: 'Criterion 3: Research, Innovations & Extension',
    email: 'a.joshi@itmuniversity.edu',
    avatarInitials: 'AJ',
  },
  {
    id: 'fac-4',
    name: 'Prof. Vikas Shinde',
    designation: 'Assistant Professor & Student Mentorship Coordinator',
    criterionAssigned: 'Criterion 5: Student Support & Progression',
    email: 'v.shinde@itmuniversity.edu',
    avatarInitials: 'VS',
  },
  {
    id: 'fac-5',
    name: 'Prof. Priyanka Deshmukh',
    designation: 'Assistant Professor & Curriculum Committee Lead',
    criterionAssigned: 'Criterion 1: Curricular Planning',
    email: 'p.deshmukh@itmuniversity.edu',
    avatarInitials: 'PD',
  },
  {
    id: 'fac-6',
    name: 'Prof. Amit Saxena',
    designation: 'Associate Professor & Governance In-charge',
    criterionAssigned: 'Criterion 6: Governance, Leadership & Management',
    email: 'a.saxena@itmuniversity.edu',
    avatarInitials: 'AS',
  },
  {
    id: 'fac-7',
    name: 'Dr. Neha Kulkarni',
    designation: 'Assistant Professor & Institutional Values Lead',
    criterionAssigned: 'Criterion 7: Institutional Values & Best Practices',
    email: 'n.kulkarni@itmuniversity.edu',
    avatarInitials: 'NK',
  },
];

export const ITM_SCHOOLS: NaacSchool[] = [
  {
    id: 'sch-tech',
    name: 'School of Technology & Computer Engineering',
    shortCode: 'SOT',
    deanName: 'Dr. Alok Nath',
    coordinatorName: 'Dr. Rajesh Sharma',
    programs: [
      { id: 'prog-cse', name: 'B.Tech Computer Science & Engineering', shortCode: 'B.Tech CSE', degreeType: 'UG', coordinatorName: 'Prof. Anita Verma', coordinatorEmail: 'cse.coord@itmuniversity.edu' },
      { id: 'prog-bca', name: 'BCA & Cloud Computing', shortCode: 'BCA', degreeType: 'UG', coordinatorName: 'Prof. Ramesh Kulkarni', coordinatorEmail: 'bca.coord@itmuniversity.edu' },
      { id: 'prog-cyber', name: 'B.Sc Cyber Security & Digital Forensics', shortCode: 'B.Sc Cyber', degreeType: 'UG', coordinatorName: 'Prof. Neha Gupta', coordinatorEmail: 'cyber.coord@itmuniversity.edu' },
      { id: 'prog-ai', name: 'M.Tech Artificial Intelligence & Machine Learning', shortCode: 'M.Tech AI', degreeType: 'PG', coordinatorName: 'Dr. Sanjeev Rao', coordinatorEmail: 'ai.coord@itmuniversity.edu' },
    ],
  },
  {
    id: 'sch-mgmt',
    name: 'School of Management & Business Studies',
    shortCode: 'SOM',
    deanName: 'Dr. Priya Singhania',
    coordinatorName: 'Dr. Manisha Patil',
    programs: [
      { id: 'prog-mba', name: 'MBA Executive & Global Finance', shortCode: 'MBA', degreeType: 'PG', coordinatorName: 'Prof. Deepak Joshi', coordinatorEmail: 'mba.coord@itmuniversity.edu' },
      { id: 'prog-fintech', name: 'BBA Fintech & Quantitative Finance', shortCode: 'BBA Fintech', degreeType: 'UG', coordinatorName: 'Prof. Sneha Iyer', coordinatorEmail: 'fintech.coord@itmuniversity.edu' },
      { id: 'prog-mkt', name: 'BBA Digital Marketing & E-Commerce', shortCode: 'BBA Marketing', degreeType: 'UG', coordinatorName: 'Prof. Rohan Roy', coordinatorEmail: 'mkt.coord@itmuniversity.edu' },
      { id: 'prog-acc', name: 'B.Com International Professional Accounting', shortCode: 'B.Com Accounting', degreeType: 'UG', coordinatorName: 'Prof. Kavita Rao', coordinatorEmail: 'acc.coord@itmuniversity.edu' },
    ],
  },
  {
    id: 'sch-design',
    name: 'School of Design, Media & Visual Arts',
    shortCode: 'SOD',
    deanName: 'Prof. Sudhir Menon',
    coordinatorName: 'Prof. Ananya Sen',
    programs: [
      { id: 'prog-uiux', name: 'B.Des Interactive & UI/UX Product Design', shortCode: 'B.Des UI/UX', degreeType: 'UG', coordinatorName: 'Prof. Tariq Khan', coordinatorEmail: 'uiux.coord@itmuniversity.edu' },
      { id: 'prog-vfx', name: 'B.Sc 3D Animation, Gaming & VFX', shortCode: 'B.Sc VFX', degreeType: 'UG', coordinatorName: 'Prof. Varun Dave', coordinatorEmail: 'vfx.coord@itmuniversity.edu' },
      { id: 'prog-fashion', name: 'B.Des Fashion & Apparel Lifestyle Styling', shortCode: 'B.Des Fashion', degreeType: 'UG', coordinatorName: 'Prof. Simran Kaur', coordinatorEmail: 'fashion.coord@itmuniversity.edu' },
    ],
  },
  {
    id: 'sch-health',
    name: 'School of Health & Life Sciences',
    shortCode: 'SOHS',
    deanName: 'Dr. V. K. Ramaswamy',
    coordinatorName: 'Dr. Sunita Deshmukh',
    programs: [
      { id: 'prog-pharm', name: 'B.Pharm Pharmaceutical Sciences', shortCode: 'B.Pharm', degreeType: 'UG', coordinatorName: 'Dr. Ashok Merchant', coordinatorEmail: 'pharm.coord@itmuniversity.edu' },
      { id: 'prog-biotech', name: 'B.Sc Industrial Biotechnology & Genomics', shortCode: 'B.Sc Biotech', degreeType: 'UG', coordinatorName: 'Dr. Meera Nambiar', coordinatorEmail: 'biotech.coord@itmuniversity.edu' },
      { id: 'prog-clin', name: 'M.Sc Clinical Diagnostics & Pathology', shortCode: 'M.Sc Clinical', degreeType: 'PG', coordinatorName: 'Dr. Harish Patel', coordinatorEmail: 'clin.coord@itmuniversity.edu' },
    ],
  },
  {
    id: 'sch-hospitality',
    name: 'School of Hospitality & Culinary Arts',
    shortCode: 'SOHA',
    deanName: 'Chef Martin Fernandez',
    coordinatorName: 'Prof. Rajiv Kapoor',
    programs: [
      { id: 'prog-hosp', name: 'B.Sc International Hospitality & Resort Studies', shortCode: 'B.Sc Hospitality', degreeType: 'UG', coordinatorName: 'Prof. George Thomas', coordinatorEmail: 'hosp.coord@itmuniversity.edu' },
      { id: 'prog-culinary', name: 'B.A. Bakery, Pastry & Global Culinary Arts', shortCode: 'B.A. Culinary', degreeType: 'UG', coordinatorName: 'Chef Shalini Nair', coordinatorEmail: 'culinary.coord@itmuniversity.edu' },
      { id: 'prog-hotel', name: 'Diploma in Luxury Hotel Operations & Front Office', shortCode: 'Dip. Hotel Ops', degreeType: 'Diploma', coordinatorName: 'Prof. Vivek Saxena', coordinatorEmail: 'hotel.coord@itmuniversity.edu' },
    ],
  },
];

export const NAAC_CRITERIA_SUMMARY: NaacCriterionSummary[] = [
  { id: 'crit-1', code: 'Criterion 1', name: 'Curricular Aspects', weightage: 150 },
  { id: 'crit-2', code: 'Criterion 2', name: 'Teaching-Learning and Evaluation', weightage: 200 },
  { id: 'crit-3', code: 'Criterion 3', name: 'Research, Innovations and Extension', weightage: 250 },
  { id: 'crit-4', code: 'Criterion 4', name: 'Infrastructure and Learning Resources', weightage: 100 },
  { id: 'crit-5', code: 'Criterion 5', name: 'Student Support and Progression', weightage: 100 },
  { id: 'crit-6', code: 'Criterion 6', name: 'Governance, Leadership and Management', weightage: 100 },
  { id: 'crit-7', code: 'Criterion 7', name: 'Institutional Values and Best Practices', weightage: 100 },
];

export const NAAC_METRICS_LIST: NaacMetric[] = [
  { code: '1.1.1', name: 'Curriculum Planning & Delivery Implementation System', criterionId: 'crit-1', criterionCode: 'Criterion 1', metricType: 'QlM', description: 'Academic council minutes, lesson plans, course handouts, and timetable alignment.' },
  { code: '1.2.1', name: 'Academic Flexibility & Choice-Based Credit System (CBCS) Courses', criterionId: 'crit-1', criterionCode: 'Criterion 1', metricType: 'QnM', description: 'List of elective and interdisciplinary courses offered across programs.' },
  { code: '1.3.1', name: 'Cross-cutting Issues: Gender, Environment, Sustainability & Professional Ethics', criterionId: 'crit-1', criterionCode: 'Criterion 1', metricType: 'QlM', description: 'Course syllabi integrating sustainability, environmental studies, and human values.' },
  { code: '1.4.1', name: 'Structured Stakeholder Feedback Analysis & Action Taken Report (ATR)', criterionId: 'crit-1', criterionCode: 'Criterion 1', metricType: 'QnM', description: 'Student, teacher, employer, and alumni feedback reports with institutional ATRs.' },
  { code: '2.1.1', name: 'Enrolment Percentage and Sanctioned Intake Allocation', criterionId: 'crit-2', criterionCode: 'Criterion 2', metricType: 'QnM', description: 'Admission register, state quota sanction letters, and final enrolled lists.' },
  { code: '2.3.1', name: 'Student-Centric Learning Methods (Experiential, Participative & Problem-Solving)', criterionId: 'crit-2', criterionCode: 'Criterion 2', metricType: 'QlM', description: 'Industrial visits, case study documentation, capstone projects, and lab manuals.' },
  { code: '2.4.1', name: 'Full-time Teachers and Faculty Quality Credentials (Ph.D. / NET)', criterionId: 'crit-2', criterionCode: 'Criterion 2', metricType: 'QnM', description: 'Faculty appointment orders, doctoral degree certificates, and staff lists.' },
  { code: '2.6.1', name: 'Programme Outcomes (PO) and Course Outcomes (CO) Attainment', criterionId: 'crit-2', criterionCode: 'Criterion 2', metricType: 'QlM', description: 'Outcome-based education (OBE) evaluation matrices and attainment rubrics.' },
  { code: '3.1.1', name: 'Research Grants & Resource Mobilization from Government and Industry', criterionId: 'crit-3', criterionCode: 'Criterion 3', metricType: 'QnM', description: 'Sanction letters for funded research projects, consultancy receipts, and budgets.' },
  { code: '3.2.1', name: 'Innovation Ecosystem & Incubation Center Documentation', criterionId: 'crit-3', criterionCode: 'Criterion 3', metricType: 'QlM', description: 'Startup incubation records, intellectual property filings, and hackathon reports.' },
  { code: '3.4.1', name: 'Extension & Outreach Activities in Community Development (NSS/NCC)', criterionId: 'crit-3', criterionCode: 'Criterion 3', metricType: 'QnM', description: 'Reports of blood donation camps, village adoption programs, and community clinics.' },
  { code: '3.5.1', name: 'Institutional Linkages, Corporate MoUs & Industry Collaborations', criterionId: 'crit-3', criterionCode: 'Criterion 3', metricType: 'QnM', description: 'Signed Memoranda of Understanding (MoU) with corporations and foreign universities.' },
  { code: '4.1.1', name: 'Adequacy of Physical Infrastructure (ICT Classrooms, Labs, Seminar Halls)', criterionId: 'crit-4', criterionCode: 'Criterion 4', metricType: 'QlM', description: 'Geo-tagged photos of smart classrooms, IoT laboratories, and auditorium facilities.' },
  { code: '4.2.1', name: 'Library as a Learning Resource & E-Journals Subscriptions', criterionId: 'crit-4', criterionCode: 'Criterion 4', metricType: 'QnM', description: 'IEEE, Springer, ScienceDirect invoice receipts, ILMS software utilization logs.' },
  { code: '5.1.1', name: 'Scholarships & Institutional Freeships Beneficiary Records', criterionId: 'crit-5', criterionCode: 'Criterion 5', metricType: 'QnM', description: 'Merit scholarship disbursement vouchers and government grant lists.' },
  { code: '5.3.1', name: 'Student Sports, Cultural Competitions & National Awards', criterionId: 'crit-5', criterionCode: 'Criterion 5', metricType: 'QnM', description: 'Merit certificates, event photographs, and university sports representation proofs.' },
  { code: '6.5.1', name: 'Internal Quality Assurance Cell (IQAC) Review & Academic Audit Reports', criterionId: 'crit-6', criterionCode: 'Criterion 6', metricType: 'QlM', description: 'IQAC quarterly meeting minutes, external peer team audits, and action taken matrices.' },
  { code: '7.1.1', name: 'Gender Equity Promotion & Safety Measures', criterionId: 'crit-7', criterionCode: 'Criterion 7', metricType: 'QlM', description: 'Internal Complaints Committee (ICC) notices, CCTV audits, and women counseling records.' },
  { code: '7.2.1', name: 'Institutional Best Practices Case Studies (Best Practice 1 & 2)', criterionId: 'crit-7', criterionCode: 'Criterion 7', metricType: 'QlM', description: 'Detailed case studies with outcome evidence on campus sustainability and industry immersion.' },
];

const INITIAL_NAAC_DOCUMENTS: NaacEvidenceDocument[] = [
  // B.Tech CSE Department Faculty Submissions (Under Program Coordinator Prof. Anita Verma)
  {
    id: 'naac-cse-fac-1',
    title: 'Outcome-Based Education (OBE) Course Attainment Matrix 2025-26',
    description: 'Direct & indirect PO/CO attainment rubrics, Bloom taxonomy mapping, and sample evaluated answer sheets for 8 semesters.',
    schoolId: 'sch-tech',
    schoolName: 'School of Technology & Computer Engineering',
    programId: 'prog-cse',
    programName: 'B.Tech Computer Science & Engineering',
    academicYear: '2025-2026',
    criterionId: 'crit-2',
    criterionCode: 'Criterion 2',
    metricCode: '2.6.1',
    metricName: 'Programme Outcomes (PO) and Course Outcomes (CO) Attainment',
    metricType: 'QlM',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'CSE_OBE_Attainment_Report_2025_26.pdf',
    fileSize: '3.4 MB',
    uploadedBy: 'Dr. Ramesh Gupta',
    uploadedAt: '2026-10-14T09:30:00Z',
    status: 'draft',
    version: 'v1.0',
    submittedByFacultyId: 'fac-1',
    facultyName: 'Dr. Ramesh Gupta',
    facultyDesignation: 'Associate Professor & Criterion 2 Lead',
    coordinatorReviewStatus: 'pending_review',
  },
  {
    id: 'naac-cse-fac-2',
    title: 'High-Performance GPU AI Server Cluster & Cloud Lab Invoices with Geo-tagged Photos',
    description: 'Hardware procurement invoices, vendor calibration certificates, and geo-tagged photographs of NVIDIA A100 AI lab workstations.',
    schoolId: 'sch-tech',
    schoolName: 'School of Technology & Computer Engineering',
    programId: 'prog-cse',
    programName: 'B.Tech Computer Science & Engineering',
    academicYear: '2025-2026',
    criterionId: 'crit-4',
    criterionCode: 'Criterion 4',
    metricCode: '4.1.1',
    metricName: 'Adequacy of Physical Infrastructure (ICT Classrooms, Labs, Seminar Halls)',
    metricType: 'QlM',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'CSE_AI_Server_Cluster_Procurement_GeoPhotos.pdf',
    fileSize: '5.6 MB',
    uploadedBy: 'Prof. Sneha Patel',
    uploadedAt: '2026-10-12T14:15:00Z',
    status: 'draft',
    version: 'v1.0',
    submittedByFacultyId: 'fac-2',
    facultyName: 'Prof. Sneha Patel',
    facultyDesignation: 'Assistant Professor & Lab / Infrastructure In-charge',
    coordinatorReviewStatus: 'compiled',
    compiledAt: '2026-10-15T11:20:00Z',
  },
  {
    id: 'naac-cse-fac-3',
    title: 'DST-SERB & Industry AI Research Grants Sanction Orders with Scopus Publications',
    description: 'Sanction letter for Rs. 38.5 Lakhs research grant from DST SERB, research consultancy invoices, and first-author Scopus indexed papers.',
    schoolId: 'sch-tech',
    schoolName: 'School of Technology & Computer Engineering',
    programId: 'prog-cse',
    programName: 'B.Tech Computer Science & Engineering',
    academicYear: '2025-2026',
    criterionId: 'crit-3',
    criterionCode: 'Criterion 3',
    metricCode: '3.1.1',
    metricName: 'Research Grants & Resource Mobilization from Government and Industry',
    metricType: 'QnM',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'CSE_DST_SERB_Research_Sanction_Papers.pdf',
    fileSize: '4.2 MB',
    uploadedBy: 'Dr. Arun Joshi',
    uploadedAt: '2026-10-15T16:45:00Z',
    status: 'draft',
    version: 'v1.0',
    submittedByFacultyId: 'fac-3',
    facultyName: 'Dr. Arun Joshi',
    facultyDesignation: 'Associate Professor & Department Research Lead',
    coordinatorReviewStatus: 'pending_review',
  },
  {
    id: 'naac-cse-fac-4',
    title: 'Student Mentorship Logs, Remedial Class Vouchers & Campus Placement Records',
    description: 'Faculty-student mentoring session logs, remedial coaching for slow learners, and campus placement appointment letters.',
    schoolId: 'sch-tech',
    schoolName: 'School of Technology & Computer Engineering',
    programId: 'prog-cse',
    programName: 'B.Tech Computer Science & Engineering',
    academicYear: '2025-2026',
    criterionId: 'crit-5',
    criterionCode: 'Criterion 5',
    metricCode: '5.1.1',
    metricName: 'Scholarships & Institutional Freeships Beneficiary Records',
    metricType: 'QnM',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'CSE_Mentorship_Placement_Records_2025.pdf',
    fileSize: '2.8 MB',
    uploadedBy: 'Prof. Vikas Shinde',
    uploadedAt: '2026-10-10T10:00:00Z',
    status: 'draft',
    version: 'v1.0',
    submittedByFacultyId: 'fac-4',
    facultyName: 'Prof. Vikas Shinde',
    facultyDesignation: 'Assistant Professor & Student Mentorship Coordinator',
    coordinatorReviewStatus: 'changes_requested',
    coordinatorFeedback: 'Please attach the official offer letters from Google, Microsoft, and Infosys for the top 10 placed students to satisfy QnM verification.',
  },
  {
    id: 'naac-cse-fac-5',
    title: 'Board of Studies (BoS) Minutes on CBCS Electives Restructuring & AI Curriculum Alignment',
    description: 'Signed minutes of meeting of Department Academic Board approving 4 new industry electives (LLMs, GenAI, Cloud Security) with stakeholder ATR.',
    schoolId: 'sch-tech',
    schoolName: 'School of Technology & Computer Engineering',
    programId: 'prog-cse',
    programName: 'B.Tech Computer Science & Engineering',
    academicYear: '2025-2026',
    criterionId: 'crit-1',
    criterionCode: 'Criterion 1',
    metricCode: '1.1.1',
    metricName: 'Curriculum Planning & Delivery Implementation System',
    metricType: 'QlM',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'CSE_BoS_Minutes_CBCS_Electives_Restructuring.pdf',
    fileSize: '3.1 MB',
    uploadedBy: 'Prof. Priyanka Deshmukh',
    uploadedAt: '2026-10-08T11:30:00Z',
    status: 'draft',
    version: 'v1.0',
    submittedByFacultyId: 'fac-5',
    facultyName: 'Prof. Priyanka Deshmukh',
    facultyDesignation: 'Assistant Professor & Curriculum Committee Lead',
    coordinatorReviewStatus: 'compiled',
    compiledAt: '2026-10-11T15:00:00Z',
  },
  {
    id: 'naac-cse-fac-5-b',
    title: 'Academic Council Resolution & Approved Syllabus Matrix 2025-26',
    description: 'Certified resolution of the University Academic Council approving credit redistribution and AI electives.',
    schoolId: 'sch-tech',
    schoolName: 'School of Technology & Computer Engineering',
    programId: 'prog-cse',
    programName: 'B.Tech Computer Science & Engineering',
    academicYear: '2025-2026',
    criterionId: 'crit-1',
    criterionCode: 'Criterion 1',
    metricCode: '1.1.1',
    metricName: 'Curriculum Planning & Delivery Implementation System',
    metricType: 'QlM',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Academic_Council_Approved_Syllabus_Structure_2025_26.pdf',
    fileSize: '2.4 MB',
    uploadedBy: 'Dr. Ramesh Gupta',
    uploadedAt: '2026-10-09T14:20:00Z',
    status: 'draft',
    version: 'v1.0',
    submittedByFacultyId: 'fac-1',
    facultyName: 'Dr. Ramesh Gupta',
    facultyDesignation: 'Associate Professor & Criterion 1 Co-Lead',
    coordinatorReviewStatus: 'compiled',
    compiledAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'naac-cse-fac-5-c',
    title: 'Lesson Plans, Course Files & Continuous Internal Evaluation (CIE) Audit Report',
    description: "Signed Dean's quality compliance certificate verifying lesson plan adherence and LMS course delivery records.",
    schoolId: 'sch-tech',
    schoolName: 'School of Technology & Computer Engineering',
    programId: 'prog-cse',
    programName: 'B.Tech Computer Science & Engineering',
    academicYear: '2025-2026',
    criterionId: 'crit-1',
    criterionCode: 'Criterion 1',
    metricCode: '1.1.1',
    metricName: 'Curriculum Planning & Delivery Implementation System',
    metricType: 'QlM',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Lesson_Plans_Course_Files_Audit_Report_Sem1_Sem2.pdf',
    fileSize: '4.1 MB',
    uploadedBy: 'Prof. Anita Verma',
    uploadedAt: '2026-10-12T16:00:00Z',
    status: 'draft',
    version: 'v1.0',
    submittedByFacultyId: 'fac-coord',
    facultyName: 'Prof. Anita Verma',
    facultyDesignation: 'Associate Professor & Program Coordinator',
    coordinatorReviewStatus: 'compiled',
    compiledAt: '2026-10-13T12:00:00Z',
  },
  // Other school items for cross-tier demonstration
  {
    id: 'naac-doc-2',
    title: 'Cloud Computing Capstone Experiential Projects & Lab Manuals',
    description: 'Documentation of AWS student cloud credits, hands-on lab experiments, and live project deliverables.',
    schoolId: 'sch-tech',
    schoolName: 'School of Technology & Computer Engineering',
    programId: 'prog-bca',
    programName: 'BCA & Cloud Computing',
    academicYear: '2025-2026',
    criterionId: 'crit-2',
    criterionCode: 'Criterion 2',
    metricCode: '2.3.1',
    metricName: 'Student-Centric Learning Methods (Experiential, Participative & Problem-Solving)',
    metricType: 'QlM',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'BCA_Cloud_Capstone_Manuals.pdf',
    fileSize: '4.8 MB',
    uploadedBy: 'Prof. Ramesh Kulkarni',
    uploadedAt: '2026-09-08T14:15:00Z',
    status: 'approved_by_school',
    version: 'v1.1',
    schoolReviewNote: 'Excellent documentation of industrial cloud labs. Verified and forwarded to university.',
    schoolReviewedBy: 'Dr. Rajesh Sharma',
    schoolReviewedAt: '2026-09-15T11:00:00Z',
  },
  {
    id: 'naac-doc-3',
    title: 'Fintech Industry Immersion & NSE Academy Guest Lecture Series',
    description: 'Attendance sheets, syllabus alignment notes, and certificates of completion for 120 BBA students.',
    schoolId: 'sch-mgmt',
    schoolName: 'School of Management & Business Studies',
    programId: 'prog-fintech',
    programName: 'BBA Fintech & Quantitative Finance',
    academicYear: '2025-2026',
    criterionId: 'crit-1',
    criterionCode: 'Criterion 1',
    metricCode: '1.2.1',
    metricName: 'Academic Flexibility & Choice-Based Credit System (CBCS) Courses',
    metricType: 'QnM',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'BBA_Fintech_NSE_Certification_Proof.pdf',
    fileSize: '1.8 MB',
    uploadedBy: 'Prof. Sneha Iyer',
    uploadedAt: '2026-08-20T09:40:00Z',
    status: 'changes_requested',
    version: 'v1.0',
    schoolReviewNote: 'Please attach the official MoU copy with NSE along with the student attendance rosters.',
    schoolReviewedBy: 'Dr. Manisha Patil',
    schoolReviewedAt: '2026-08-25T16:20:00Z',
  },
  {
    id: 'naac-doc-4',
    title: 'B.Pharm Drug Discovery Lab Equipment Calibration & GLP Certification',
    description: 'Annual third-party validation reports for HPLC machines, spectrophotometers, and laminar airflows.',
    schoolId: 'sch-health',
    schoolName: 'School of Health & Life Sciences',
    programId: 'prog-pharm',
    programName: 'B.Pharm Pharmaceutical Sciences',
    academicYear: '2025-2026',
    criterionId: 'crit-4',
    criterionCode: 'Criterion 4',
    metricCode: '4.1.1',
    metricName: 'Adequacy of Physical Infrastructure (ICT Classrooms, Labs, Seminar Halls)',
    metricType: 'QlM',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Pharm_Equipment_Calibration_GLP_2025.pdf',
    fileSize: '5.2 MB',
    uploadedBy: 'Dr. Ashok Merchant',
    uploadedAt: '2026-07-14T11:00:00Z',
    status: 'university_verified',
    version: 'v2.0',
    schoolReviewNote: 'Verified against Pharmacy Council of India guidelines.',
    schoolReviewedBy: 'Dr. Sunita Deshmukh',
    schoolReviewedAt: '2026-07-20T10:00:00Z',
    universityReviewNote: 'Master verified. Complies 100% with NAAC Criteria 4 physical infrastructure metrics.',
    universityVerifiedBy: 'Dr. Vikram Malhotra',
    universityVerifiedAt: '2026-08-01T15:30:00Z',
  },
];

const NAAC_STORAGE_KEY = 'itm_naac_dms_documents';

export const getStoredNaacDocuments = (): NaacEvidenceDocument[] => {
  try {
    const raw = localStorage.getItem(NAAC_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NAAC_STORAGE_KEY, JSON.stringify(INITIAL_NAAC_DOCUMENTS));
      return INITIAL_NAAC_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Ensure all standard initial documents are present so newly added samples show up
      let updated = false;
      const parsedIds = new Set(parsed.map(d => d.id));
      const merged = [...parsed];
      INITIAL_NAAC_DOCUMENTS.forEach(initDoc => {
        if (!parsedIds.has(initDoc.id)) {
          merged.push(initDoc);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(NAAC_STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
    return INITIAL_NAAC_DOCUMENTS;
  } catch {
    return INITIAL_NAAC_DOCUMENTS;
  }
};

export const saveAllNaacDocuments = (docs: NaacEvidenceDocument[]): void => {
  try {
    localStorage.setItem(NAAC_STORAGE_KEY, JSON.stringify(docs));
    window.dispatchEvent(new Event('naac-dms-updated'));
  } catch (err) {
    console.error('Failed to save NAAC documents', err);
  }
};

export const addOrUpdateNaacDocument = (doc: Partial<NaacEvidenceDocument>): NaacEvidenceDocument => {
  const current = getStoredNaacDocuments();
  const existingIdx = current.findIndex(d => d.id === doc.id);

  let updatedDoc: NaacEvidenceDocument;

  if (existingIdx >= 0) {
    updatedDoc = {
      ...current[existingIdx],
      ...doc,
      uploadedAt: doc.uploadedAt || new Date().toISOString(),
    } as NaacEvidenceDocument;
    current[existingIdx] = updatedDoc;
  } else {
    updatedDoc = {
      id: doc.id || `naac-doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: doc.title || 'Untitled Evidence Document',
      description: doc.description || '',
      schoolId: doc.schoolId || 'sch-tech',
      schoolName: doc.schoolName || 'School of Technology & Computer Engineering',
      programId: doc.programId || 'prog-cse',
      programName: doc.programName || 'B.Tech Computer Science & Engineering',
      academicYear: doc.academicYear || '2025-2026',
      criterionId: doc.criterionId || 'crit-1',
      criterionCode: doc.criterionCode || 'Criterion 1',
      metricCode: doc.metricCode || '1.1.1',
      metricName: doc.metricName || 'Curricular Planning & Implementation',
      metricType: doc.metricType || 'QnM',
      fileUrl: doc.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: doc.fileName || 'evidence_attachment.pdf',
      fileSize: doc.fileSize || '1.5 MB',
      uploadedBy: doc.uploadedBy || 'Program Coordinator',
      uploadedAt: new Date().toISOString(),
      status: doc.status || 'draft',
      version: 'v1.0',
      submittedByFacultyId: doc.submittedByFacultyId,
      facultyName: doc.facultyName,
      facultyDesignation: doc.facultyDesignation,
      coordinatorReviewStatus: doc.coordinatorReviewStatus || 'pending_review',
      coordinatorFeedback: doc.coordinatorFeedback,
      compiledAt: doc.compiledAt,
    };
    current.unshift(updatedDoc);
  }

  saveAllNaacDocuments(current);
  return updatedDoc;
};

/**
 * Program Coordinator Action: Compile an individual faculty document into Department Dossier
 */
export const compileDocumentIntoDossier = (docId: string, coordinatorNotes?: string): void => {
  const current = getStoredNaacDocuments();
  const doc = current.find(d => d.id === docId);
  if (doc) {
    doc.coordinatorReviewStatus = 'compiled';
    doc.compiledAt = new Date().toISOString();
    if (coordinatorNotes) {
      doc.coordinatorFeedback = coordinatorNotes;
    }
    if (doc.status === 'changes_requested') {
      doc.status = 'draft';
    }
    saveAllNaacDocuments(current);
  }
};

/**
 * Program Coordinator Action: Request revision from faculty member with feedback
 */
export const requestRevisionFromFaculty = (docId: string, feedback: string): void => {
  const current = getStoredNaacDocuments();
  const doc = current.find(d => d.id === docId);
  if (doc) {
    doc.coordinatorReviewStatus = 'changes_requested';
    doc.coordinatorFeedback = feedback;
    saveAllNaacDocuments(current);
  }
};

/**
 * Program Coordinator Action: Dispatch entire compiled department dossier to School Coordinator
 */
export const dispatchDepartmentDossierToSchool = (programId: string = 'prog-cse'): number => {
  const current = getStoredNaacDocuments();
  let count = 0;
  current.forEach(doc => {
    if (doc.programId === programId && (doc.coordinatorReviewStatus === 'compiled' || doc.status === 'draft')) {
      doc.status = 'submitted_to_school';
      doc.uploadedAt = new Date().toISOString();
      count++;
    }
  });
  if (count > 0) {
    saveAllNaacDocuments(current);
  }
  return count;
};

/**
 * Program Coordinator Action: Recall submitted dossier back to department draft compilation
 */
export const recallDepartmentDossierFromSchool = (programId: string = 'prog-cse'): number => {
  const current = getStoredNaacDocuments();
  let count = 0;
  current.forEach(doc => {
    if (doc.programId === programId && doc.status === 'submitted_to_school') {
      doc.status = 'draft';
      count++;
    }
  });
  if (count > 0) {
    saveAllNaacDocuments(current);
  }
  return count;
};

export const submitDocumentToSchool = (docId: string): void => {
  const current = getStoredNaacDocuments();
  const doc = current.find(d => d.id === docId);
  if (doc) {
    doc.status = 'submitted_to_school';
    doc.coordinatorReviewStatus = 'compiled';
    doc.uploadedAt = new Date().toISOString();
    saveAllNaacDocuments(current);
  }
};

export const reviewSchoolDocument = (docId: string, approved: boolean, note: string, reviewerName: string = 'Dr. Rajesh Sharma'): void => {
  const current = getStoredNaacDocuments();
  const doc = current.find(d => d.id === docId);
  if (doc) {
    doc.status = approved ? 'approved_by_school' : 'changes_requested';
    doc.schoolReviewNote = note;
    doc.schoolReviewedBy = reviewerName;
    doc.schoolReviewedAt = new Date().toISOString();
    saveAllNaacDocuments(current);
  }
};

export const verifyUniversityDocument = (docId: string, verified: boolean, note: string, reviewerName: string = 'Dr. Vikram Malhotra'): void => {
  const current = getStoredNaacDocuments();
  const doc = current.find(d => d.id === docId);
  if (doc) {
    doc.status = verified ? 'university_verified' : 'changes_requested';
    doc.universityReviewNote = note;
    doc.universityVerifiedBy = reviewerName;
    doc.universityVerifiedAt = new Date().toISOString();
    saveAllNaacDocuments(current);
  }
};

export const deleteNaacDocument = (docId: string): void => {
  const current = getStoredNaacDocuments();
  const filtered = current.filter(d => d.id !== docId);
  saveAllNaacDocuments(filtered);
};

