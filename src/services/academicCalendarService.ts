import { 
  AcademicCalendar, 
  CalendarEvent, 
  ExtractedEventDraft, 
  CalendarStatus,
  CalendarType,
  UploadedCalendarDocument 
} from '../types/academicCalendar';
import { SEED_ACADEMIC_CALENDARS, SEED_CALENDAR_EVENTS } from '../data/mockAcademicCalendarData';

const CALENDARS_STORAGE_KEY = 'college_erp_academic_calendars_v1';
const EVENTS_STORAGE_KEY = 'college_erp_calendar_events_v1';

// ---------------------------------------------------------------------------
// Calendars Storage & Helpers
// ---------------------------------------------------------------------------

export const getStoredCalendars = (): AcademicCalendar[] => {
  if (typeof window === 'undefined') return SEED_ACADEMIC_CALENDARS;
  try {
    const raw = localStorage.getItem(CALENDARS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CALENDARS_STORAGE_KEY, JSON.stringify(SEED_ACADEMIC_CALENDARS));
      return SEED_ACADEMIC_CALENDARS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored calendars:', err);
    return SEED_ACADEMIC_CALENDARS;
  }
};

export const saveStoredCalendars = (calendars: AcademicCalendar[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CALENDARS_STORAGE_KEY, JSON.stringify(calendars));
    window.dispatchEvent(new CustomEvent('academic-calendar-updated'));
  } catch (err) {
    console.error('Failed to save calendars to storage:', err);
  }
};

// ---------------------------------------------------------------------------
// Events Storage & Helpers
// ---------------------------------------------------------------------------

export const getStoredEvents = (): CalendarEvent[] => {
  if (typeof window === 'undefined') return SEED_CALENDAR_EVENTS;
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(SEED_CALENDAR_EVENTS));
      return SEED_CALENDAR_EVENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored calendar events:', err);
    return SEED_CALENDAR_EVENTS;
  }
};

export const saveStoredEvents = (events: CalendarEvent[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent('calendar-events-updated'));
  } catch (err) {
    console.error('Failed to save calendar events to storage:', err);
  }
};

// ---------------------------------------------------------------------------
// Calendar Operations
// ---------------------------------------------------------------------------

export const addAcademicCalendar = (calendarData: Omit<AcademicCalendar, 'id' | 'createdAt' | 'updatedAt' | 'eventsCount'>): AcademicCalendar => {
  const calendars = getStoredCalendars();
  const newCalendar: AcademicCalendar = {
    ...calendarData,
    id: `cal-${Date.now()}`,
    eventsCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };
  const updated = [newCalendar, ...calendars];
  saveStoredCalendars(updated);
  return newCalendar;
};

export const updateAcademicCalendar = (id: string, updates: Partial<AcademicCalendar>): AcademicCalendar | null => {
  const calendars = getStoredCalendars();
  let updatedItem: AcademicCalendar | null = null;
  const updated = calendars.map(cal => {
    if (cal.id === id) {
      updatedItem = {
        ...cal,
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      return updatedItem;
    }
    return cal;
  });
  if (updatedItem) {
    saveStoredCalendars(updated);
  }
  return updatedItem;
};

export const deleteAcademicCalendar = (id: string): void => {
  const calendars = getStoredCalendars();
  const updatedCalendars = calendars.filter(c => c.id !== id);
  saveStoredCalendars(updatedCalendars);

  // Also remove or unlink associated events
  const events = getStoredEvents();
  const updatedEvents = events.filter(e => e.calendarId !== id);
  saveStoredEvents(updatedEvents);
};

export const setCalendarStatus = (id: string, status: CalendarStatus): void => {
  updateAcademicCalendar(id, { status });
};

export const attachDocumentToCalendar = (id: string, doc: UploadedCalendarDocument): void => {
  updateAcademicCalendar(id, { uploadedDocument: doc });
};

// ---------------------------------------------------------------------------
// Calendar Events Operations
// ---------------------------------------------------------------------------

export const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>): CalendarEvent => {
  const events = getStoredEvents();
  const newEvent: CalendarEvent = {
    ...eventData,
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  const updatedEvents = [newEvent, ...events];
  saveStoredEvents(updatedEvents);

  // Update calendar event counter if linked to a calendar
  if (eventData.calendarId && eventData.calendarId !== 'manual') {
    const calendars = getStoredCalendars();
    const count = updatedEvents.filter(e => e.calendarId === eventData.calendarId).length;
    updateAcademicCalendar(eventData.calendarId, { eventsCount: count });
  }

  return newEvent;
};

export const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>): CalendarEvent | null => {
  const events = getStoredEvents();
  let updatedItem: CalendarEvent | null = null;
  const updated = events.map(evt => {
    if (evt.id === id) {
      updatedItem = { ...evt, ...updates };
      return updatedItem;
    }
    return evt;
  });
  if (updatedItem) {
    saveStoredEvents(updated);
  }
  return updatedItem;
};

export const deleteCalendarEvent = (id: string): void => {
  const events = getStoredEvents();
  const target = events.find(e => e.id === id);
  const updated = events.filter(e => e.id !== id);
  saveStoredEvents(updated);

  if (target && target.calendarId && target.calendarId !== 'manual') {
    const count = updated.filter(e => e.calendarId === target.calendarId).length;
    updateAcademicCalendar(target.calendarId, { eventsCount: count });
  }
};

// ---------------------------------------------------------------------------
// Document Analysis & Event Extraction Service Placeholder
// ---------------------------------------------------------------------------

/**
 * Extracts structured academic events from an uploaded calendar document.
 * 
 * Note: When a live AI backend service (OCR / LLM parser) is integrated,
 * this function can send the file payload or binary stream to the backend endpoint.
 * In the current prototype, it performs realistic extraction modeling based on the
 * document metadata, calendar type, and academic year to return editable draft items.
 */
export const simulateDocumentExtraction = async (
  calendar: AcademicCalendar,
  doc: UploadedCalendarDocument
): Promise<ExtractedEventDraft[]> => {
  // Simulate network/OCR parsing latency
  await new Promise(resolve => setTimeout(resolve, 800));

  const yearStart = calendar.academicYear ? calendar.academicYear.split('-')[0] : '2026';
  const yearEnd = calendar.academicYear ? calendar.academicYear.split('-')[1] : '2027';
  const fullYearEnd = yearEnd.length === 2 ? `20${yearEnd}` : yearEnd;

  const dept = calendar.department || 'Entire College';
  const isCse = dept.toLowerCase().includes('computer');
  const isCommerce = dept.toLowerCase().includes('commerce');

  const drafts: ExtractedEventDraft[] = [
    {
      id: `draft-${Date.now()}-1`,
      calendarId: calendar.id,
      name: 'Commencement of Academic Term Instruction',
      category: 'Academic Activity',
      startDate: `${yearStart}-07-15`,
      endDate: `${yearStart}-07-15`,
      applicableDepartment: dept,
      applicableProgram: calendar.program || 'All Programs',
      applicableSemester: calendar.semester || 'All Semesters',
      description: 'First instructional teaching day as specified in Section 2.1 of uploaded document.',
      verificationStatus: 'Verified',
      confidenceScore: 98,
      sourceSnippet: `Page 1, Para 2: "All academic instructional sessions shall commence on July 15, ${yearStart} without exception."`
    },
    {
      id: `draft-${Date.now()}-2`,
      calendarId: calendar.id,
      name: 'Independence Day Institutional Observance',
      category: 'Cultural Activity',
      startDate: `${yearStart}-08-15`,
      endDate: `${yearStart}-08-15`,
      applicableDepartment: 'Entire College',
      applicableProgram: 'All Programs',
      applicableSemester: 'All Semesters',
      description: 'National flag hoisting, ceremonial parade, and student cultural assembly.',
      verificationStatus: 'Verified',
      confidenceScore: 99,
      sourceSnippet: `Page 2: "15th August ${yearStart} - Independence Day (Mandatory Attendance for Staff & Students)"`
    },
    {
      id: `draft-${Date.now()}-3`,
      calendarId: calendar.id,
      name: 'Continuous Internal Evaluation (CIE Test Series 1)',
      category: 'College Examination',
      startDate: `${yearStart}-09-14`,
      endDate: `${yearStart}-09-19`,
      applicableDepartment: dept,
      applicableProgram: calendar.program || 'All Programs',
      applicableSemester: calendar.semester || 'Odd Semesters',
      description: 'First internal evaluation cycle covering 40% syllabus completion.',
      verificationStatus: 'Needs Correction',
      confidenceScore: 91,
      sourceSnippet: `Table 3: "Internal Assessment 1 (IA-1) scheduled window September 14 to September 19."`
    },
    {
      id: `draft-${Date.now()}-4`,
      calendarId: calendar.id,
      name: 'Mahatma Gandhi Jayanti Holiday',
      category: 'Holiday',
      startDate: `${yearStart}-10-02`,
      endDate: `${yearStart}-10-02`,
      applicableDepartment: 'Entire College',
      applicableProgram: 'All Programs',
      applicableSemester: 'All Semesters',
      description: 'Public gazetted holiday.',
      verificationStatus: 'Verified',
      confidenceScore: 99,
      sourceSnippet: `Gazetted Holidays: "2nd October - Mahatma Gandhi Jayanti (Declared Holiday)"`
    },
    {
      id: `draft-${Date.now()}-5`,
      calendarId: calendar.id,
      name: 'Mid-Semester Festival & Diwali Break',
      category: 'Vacation',
      startDate: `${yearStart}-10-28`,
      endDate: `${yearStart}-11-06`,
      applicableDepartment: 'Entire College',
      applicableProgram: 'All Programs',
      applicableSemester: 'All Semesters',
      description: 'Mid-term break for students and teaching faculty.',
      verificationStatus: 'Verified',
      confidenceScore: 95,
      sourceSnippet: `Section 4: "Autumn & Diwali Recess commences on Oct 28 and ends on Nov 6."`
    },
    {
      id: `draft-${Date.now()}-6`,
      calendarId: calendar.id,
      name: isCse 
        ? 'Annual Smart Hackathon & Technical Fest' 
        : isCommerce 
        ? 'National Corporate Conclave & Entrepreneurship Summit' 
        : 'Departmental Symposium & Guest Lecture Series',
      category: isCse ? 'Department Event' : 'Seminar',
      startDate: `${yearStart}-11-20`,
      endDate: `${yearStart}-11-21`,
      applicableDepartment: dept,
      applicableProgram: calendar.program || 'All Programs',
      applicableSemester: calendar.semester || 'All Semesters',
      description: 'Flagship departmental development and industry-academic interaction event.',
      verificationStatus: 'Needs Correction',
      confidenceScore: 84,
      sourceSnippet: `Page 4, Note 3: "Department technical convention to be hosted in late November."`
    },
    {
      id: `draft-${Date.now()}-7`,
      calendarId: calendar.id,
      name: 'Continuous Internal Evaluation (CIE Test Series 2)',
      category: 'College Examination',
      startDate: `${yearStart}-11-23`,
      endDate: `${yearStart}-11-28`,
      applicableDepartment: dept,
      applicableProgram: calendar.program || 'All Programs',
      applicableSemester: calendar.semester || 'Odd Semesters',
      description: 'Second internal test and practical examination submission deadline.',
      verificationStatus: 'Verified',
      confidenceScore: 93,
      sourceSnippet: `Table 3: "Internal Assessment 2 (IA-2) November 23-28, followed by lab exams."`
    },
    {
      id: `draft-${Date.now()}-8`,
      calendarId: calendar.id,
      name: 'End Semester University Theory & Practical Examinations',
      category: 'University Examination',
      startDate: `${yearStart}-12-07`,
      endDate: `${yearStart}-12-23`,
      applicableDepartment: dept,
      applicableProgram: calendar.program || 'All Programs',
      applicableSemester: calendar.semester || 'Odd Semesters',
      description: 'Affiliating university centralized semester-end examination schedule.',
      verificationStatus: 'Verified',
      confidenceScore: 97,
      sourceSnippet: `University Annexure A: "Theory Examinations start Dec 7 and conclude by Dec 23."`
    }
  ];

  return drafts;
};

/**
 * Commits verified extracted drafts into active structured CalendarEvent items.
 */
export const commitVerifiedDraftsToEvents = (
  calendar: AcademicCalendar,
  verifiedDrafts: ExtractedEventDraft[],
  publishCalendar: boolean = false
): CalendarEvent[] => {
  const existingEvents = getStoredEvents();
  const newEvents: CalendarEvent[] = verifiedDrafts.map(draft => ({
    id: `evt-ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    calendarId: calendar.id,
    calendarName: calendar.name,
    name: draft.name,
    category: draft.category,
    startDate: draft.startDate,
    endDate: draft.endDate,
    description: draft.description,
    applicability: {
      type: draft.applicableDepartment === 'Entire College' ? 'Entire College' : 'Selected Department',
      department: draft.applicableDepartment !== 'Entire College' ? draft.applicableDepartment : undefined,
      program: draft.applicableProgram !== 'All Programs' ? draft.applicableProgram : undefined,
      semester: draft.applicableSemester !== 'All Semesters' ? draft.applicableSemester : undefined,
    },
    status: 'Scheduled',
    verificationStatus: 'Verified',
    isExtracted: true,
    createdAt: new Date().toISOString().split('T')[0]
  }));

  const updatedEvents = [...newEvents, ...existingEvents];
  saveStoredEvents(updatedEvents);

  // Update calendar event counter and status
  const totalCount = updatedEvents.filter(e => e.calendarId === calendar.id).length;
  updateAcademicCalendar(calendar.id, {
    eventsCount: totalCount,
    status: publishCalendar ? 'Published' : calendar.status
  });

  return newEvents;
};
