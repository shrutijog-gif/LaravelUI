// ============================================================================
// Types: University Calendar Analysis Module
// ============================================================================

export type UniversityDocumentType =
  | 'University Academic Calendar'
  | 'University Circular'
  | 'Semester Calendar'
  | 'Other Academic Schedule';

export type UniversityFacultyStream =
  | 'Arts'
  | 'Commerce'
  | 'Science'
  | 'Science & Technology'
  | 'Engineering'
  | 'Pharmacy'
  | 'Medical'
  | 'Management'
  | 'Other'
  | 'All Faculties';

export type ExtractionStatus =
  | 'Uploaded'
  | 'Processing'
  | 'Extraction Completed'
  | 'Failed';

export type VerificationStatus =
  | 'Needs Review'
  | 'Verified'
  | 'Processing'
  | 'Failed';

export type AcademicEventCategory =
  | 'Teaching & Instruction'
  | 'Examination'
  | 'Continuous Internal Assessment'
  | 'Vacation & Break'
  | 'Holiday'
  | 'Admission & Registration'
  | 'Term Schedule'
  | 'Other';

export type DateType = 'Confirmed' | 'Tentative' | 'Derived';

export type EventValidationStatus =
  | 'Valid'
  | 'Needs Review'
  | 'Duplicate Warning'
  | 'Missing End Date'
  | 'Derived Date'
  | 'Verified';

export type DetectedCalendarFormat =
  | 'Format A: Program-wise / Course-wise Calendar'
  | 'Format B: Weekly Academic Calendar'
  | 'Format C: Key Academic Dates';

export interface UploadedFileReference {
  fileName: string;
  fileSize: string;
  fileType: string; // 'pdf' | 'xls' | 'xlsx' | 'doc' | 'docx'
  fileUrl: string;
  uploadDate: string;
}

export interface UniversityCalendarDocument {
  id: string;
  universityName: string;
  calendarTitle: string;
  circularNumber?: string;
  academicYear: string; // e.g. '2026-27'
  documentType: UniversityDocumentType;
  applicableFaculties: UniversityFacultyStream[];
  programsIdentified: string[]; // e.g. ['B.Pharm-I', 'M.Pharm-I', 'Pharm.D-I']
  uploadedDate: string; // YYYY-MM-DD
  file: UploadedFileReference;
  extractionStatus: ExtractionStatus;
  verificationStatus: VerificationStatus;
  formatDetected?: DetectedCalendarFormat;
  
  // Validation and extraction metrics (Section 9)
  totalSourceRowsIdentified: number;
  successfullyExtractedCount: number;
  recordsRequiringReviewCount: number;
  possibleDuplicatesCount: number;
  missingUnprocessedRowsCount: number;
  dateValidationIssuesCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface ExtractedAcademicEvent {
  id: string;
  documentId: string;
  eventName: string;
  category: AcademicEventCategory;
  faculty: string;
  program: string;
  year: string; // e.g., 'F.Y.', 'S.Y.', 'T.Y.', 'Final Year', 'All Years', 'Not Specified'
  semester: string; // e.g., 'Sem 1', 'Sem 2', 'Odd Semesters', 'Even Semesters', 'Not Specified'
  pattern?: string; // e.g., 'CBCS 2019 Pattern', 'Semester Pattern'
  startDate: string; // Format DD-MM-YYYY
  endDate: string; // Format DD-MM-YYYY
  dateType: DateType; // Confirmed | Tentative | Derived
  month?: string;
  weekNumber?: number;
  description?: string;
  sourceReference: string; // e.g., 'Page 1, Table 2, Row 3' or 'Sheet: B.Pharm, Cell: C8'
  sourcePageNumber?: number;
  sourceSheetName?: string;
  sourceSnippet?: string; // Exact text snippet from document
  validationStatus: EventValidationStatus;
  isDuplicate: boolean;
  duplicateReason?: string;
  isApproved: boolean;
  approvedAt?: string;
}

export interface SourceDocumentSheetPage {
  id: string;
  label: string; // e.g., 'Page 1: Terms Schedule' or 'Sheet: B.Pharm'
  type: 'pdf-page' | 'excel-sheet';
  pageNumber?: number;
  sheetName?: string;
  rawTextPreview: string;
  tabularRows?: Array<{
    rowNumber: number;
    cells: string[];
    isHighlighted?: boolean;
    hasFlaggedIssue?: boolean;
  }>;
}

export const UNIVERSITY_DOCUMENT_TYPES: UniversityDocumentType[] = [
  'University Academic Calendar',
  'University Circular',
  'Semester Calendar',
  'Other Academic Schedule'
];

export const UNIVERSITY_FACULTIES: UniversityFacultyStream[] = [
  'All Faculties',
  'Science & Technology',
  'Engineering',
  'Pharmacy',
  'Science',
  'Commerce',
  'Management',
  'Arts',
  'Medical',
  'Other'
];

export const ACADEMIC_EVENT_CATEGORIES: AcademicEventCategory[] = [
  'Teaching & Instruction',
  'Examination',
  'Continuous Internal Assessment',
  'Vacation & Break',
  'Holiday',
  'Admission & Registration',
  'Term Schedule',
  'Other'
];

export const SAMPLE_UNIVERSITIES = [
  'Savitribai Phule Pune University (SPPU)',
  'University of Mumbai (MU)',
  'Dr. Babasaheb Ambedkar Marathwada University (BAMU)',
  'Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU)',
  'Shivaji University, Kolhapur',
  'Rajiv Gandhi Technical University (RGPV)',
  'Delhi University (DU)',
  'Other University / Autonomous Board'
];
