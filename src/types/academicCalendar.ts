// ============================================================================
// Types: Academic Calendar & Academic Planning Module
// ============================================================================

export type CalendarType =
  | 'University Calendar'
  | 'College Calendar'
  | 'Department Calendar'
  | 'Semester / Term Calendar';

export type CalendarStatus =
  | 'Draft'
  | 'Under Review'
  | 'Published'
  | 'Archived';

export type CalendarEventCategory =
  | 'University Examination'
  | 'College Examination'
  | 'Holiday'
  | 'Vacation'
  | 'Workshop'
  | 'Seminar'
  | 'Cultural Activity'
  | 'Sports Activity'
  | 'Admission Activity'
  | 'Academic Activity'
  | 'Department Event'
  | 'Other';

export type ApplicabilityScope =
  | 'Entire College'
  | 'Selected Department'
  | 'Selected Program'
  | 'Selected Semester'
  | 'Specific Subject';

export interface EventApplicability {
  type: ApplicabilityScope;
  department?: string;
  program?: string;
  semester?: string;
  subject?: string;
}

export interface UploadedCalendarDocument {
  fileName: string;
  fileSize: string;
  fileType: string; // 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx'
  fileUrl: string;
  uploadDate: string;
}

export interface AcademicCalendar {
  id: string;
  name: string;
  calendarType: CalendarType;
  academicYear: string; // e.g. '2026-2027', '2025-2026'
  institutionName: string; // University or College name
  department?: string;
  program?: string;
  semester?: string;
  startDate: string; // ISO date 'YYYY-MM-DD'
  endDate: string; // ISO date 'YYYY-MM-DD'
  description?: string;
  status: CalendarStatus;
  uploadedDocument?: UploadedCalendarDocument;
  eventsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type EventStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Postponed'
  | 'Cancelled';

export type VerificationStatus =
  | 'Verified'
  | 'Pending Review'
  | 'Needs Correction'
  | 'Rejected';

export interface CalendarEvent {
  id: string;
  calendarId: string; // ID of the parent AcademicCalendar, or 'manual'
  calendarName: string; // Source calendar name
  name: string;
  category: CalendarEventCategory;
  startDate: string;
  endDate: string;
  description: string;
  applicability: EventApplicability;
  status: EventStatus;
  verificationStatus?: VerificationStatus;
  isExtracted?: boolean;
  createdAt: string;
}

export interface ExtractedEventDraft {
  id: string;
  calendarId: string;
  name: string;
  category: CalendarEventCategory;
  startDate: string;
  endDate: string;
  applicableDepartment: string;
  applicableProgram: string;
  applicableSemester: string;
  description: string;
  verificationStatus: VerificationStatus;
  confidenceScore?: number;
  sourceSnippet?: string;
}

export const CALENDAR_TYPES: CalendarType[] = [
  'University Calendar',
  'College Calendar',
  'Department Calendar',
  'Semester / Term Calendar'
];

export const CALENDAR_STATUSES: CalendarStatus[] = [
  'Draft',
  'Under Review',
  'Published',
  'Archived'
];

export const CALENDAR_EVENT_CATEGORIES: CalendarEventCategory[] = [
  'University Examination',
  'College Examination',
  'Holiday',
  'Vacation',
  'Workshop',
  'Seminar',
  'Cultural Activity',
  'Sports Activity',
  'Admission Activity',
  'Academic Activity',
  'Department Event',
  'Other'
];

export const APPLICABILITY_SCOPES: ApplicabilityScope[] = [
  'Entire College',
  'Selected Department',
  'Selected Program',
  'Selected Semester',
  'Specific Subject'
];

export const ACADEMIC_YEARS = [
  '2026-2027',
  '2025-2026',
  '2024-2025',
  '2023-2024'
];

export const COLLEGE_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Commerce & Management',
  'Physical & Applied Sciences',
  'Humanities & Social Sciences'
];
