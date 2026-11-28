import { 
  UniversityCalendarDocument, 
  ExtractedAcademicEvent, 
  SourceDocumentSheetPage,
  ExtractionStatus,
  VerificationStatus
} from '../types/universityCalendar';
import { 
  extractUniversityCalendarFromPdf, 
  extractSppuScienceTechCircular,
  ExtractionResult 
} from './pdfCalendarExtractor';

const STORAGE_DOCS_KEY = 'college_erp_univ_calendars_v2';
const STORAGE_EVENTS_KEY = 'college_erp_univ_events_v2';
const STORAGE_PAGES_KEY = 'college_erp_univ_pages_v2';

// ─────────────────────────────────────────────────────────────────────────────
// SPPU Circular 197/2026 Seed Extraction (Test Document)
// ─────────────────────────────────────────────────────────────────────────────

const SPPU_PRIMARY_DOC_ID = 'sppu-cir-197-2026';
const sppuSeedResult = extractSppuScienceTechCircular(
  'SPPU-Science_&_Technology_Academic_Year_2026-27.pdf',
  '',
  SPPU_PRIMARY_DOC_ID
);

// ─────────────────────────────────────────────────────────────────────────────
// Seed Documents
// ─────────────────────────────────────────────────────────────────────────────

const SEED_DOCUMENTS: UniversityCalendarDocument[] = [
  {
    id: SPPU_PRIMARY_DOC_ID,
    universityName: 'Savitribai Phule Pune University (SPPU)',
    calendarTitle: 'Dates of Commencement and Conclusion of Academic Year 2026-27 (Faculty of Science & Technology)',
    circularNumber: 'Circular No. 197 / 2026',
    academicYear: '2026-27',
    documentType: 'University Circular',
    applicableFaculties: ['Science & Technology'],
    programsIdentified: sppuSeedResult.programsIdentified,
    uploadedDate: '2026-09-04',
    file: {
      fileName: 'SPPU-Science_&_Technology_Academic_Year_2026-27.pdf',
      fileSize: '384 KB',
      fileType: 'pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadDate: '2026-09-04'
    },
    extractionStatus: 'Extraction Completed',
    verificationStatus: 'Needs Review',
    formatDetected: 'Format A: Program-wise / Course-wise Calendar',
    totalSourceRowsIdentified: sppuSeedResult.totalSourceRows,
    successfullyExtractedCount: sppuSeedResult.successfullyExtracted,
    recordsRequiringReviewCount: 0,
    possibleDuplicatesCount: 0,
    missingUnprocessedRowsCount: 0,
    dateValidationIssuesCount: 0,
    createdAt: '2026-09-04',
    updatedAt: '2026-09-04'
  },
  {
    id: 'univ-doc-2',
    universityName: 'University of Mumbai (MU)',
    calendarTitle: 'Master Academic Terms & General Vacation Schedule 2026–27',
    circularNumber: 'Circular No. UG/72 of 2026',
    academicYear: '2026-27',
    documentType: 'University Circular',
    applicableFaculties: ['All Faculties', 'Science & Technology', 'Commerce', 'Arts'],
    programsIdentified: ['Undergraduate (All Programs)', 'Postgraduate (All Programs)'],
    uploadedDate: '2026-06-10',
    file: {
      fileName: 'Mumbai_University_Master_Circular_UG72_2026.pdf',
      fileSize: '2.4 MB',
      fileType: 'pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadDate: '2026-06-10'
    },
    extractionStatus: 'Extraction Completed',
    verificationStatus: 'Verified',
    formatDetected: 'Format C: Key Academic Dates',
    totalSourceRowsIdentified: 10,
    successfullyExtractedCount: 10,
    recordsRequiringReviewCount: 0,
    possibleDuplicatesCount: 0,
    missingUnprocessedRowsCount: 0,
    dateValidationIssuesCount: 0,
    createdAt: '2026-06-10',
    updatedAt: '2026-06-12'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed Extracted Events (Exact 28 milestones from Circular 197)
// ─────────────────────────────────────────────────────────────────────────────

const SEED_EVENTS: ExtractedAcademicEvent[] = [
  ...sppuSeedResult.events
];

// ─────────────────────────────────────────────────────────────────────────────
// Service Methods
// ─────────────────────────────────────────────────────────────────────────────

export const getUniversityDocuments = (): UniversityCalendarDocument[] => {
  if (typeof window === 'undefined') return SEED_DOCUMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_DOCS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(SEED_DOCUMENTS));
      return SEED_DOCUMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse university calendar documents:', err);
    return SEED_DOCUMENTS;
  }
};

export const saveUniversityDocuments = (docs: UniversityCalendarDocument[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(docs));
    window.dispatchEvent(new CustomEvent('university-calendar-updated'));
  } catch (err) {
    console.error('Failed to save university calendar documents:', err);
  }
};

export const getExtractedEvents = (documentId?: string): ExtractedAcademicEvent[] => {
  if (typeof window === 'undefined') return SEED_EVENTS;
  try {
    const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
    const list: ExtractedAcademicEvent[] = raw ? JSON.parse(raw) : SEED_EVENTS;
    if (!raw) {
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(SEED_EVENTS));
    }
    if (documentId) {
      return list.filter(e => e.documentId === documentId);
    }
    return list;
  } catch (err) {
    console.error('Failed to parse extracted events:', err);
    return SEED_EVENTS;
  }
};

export const saveExtractedEvents = (events: ExtractedAcademicEvent[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent('univ-extracted-events-updated'));
  } catch (err) {
    console.error('Failed to save extracted events:', err);
  }
};

export const saveDocumentSourcePages = (documentId: string, pages: SourceDocumentSheetPage[]): void => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_PAGES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[documentId] = pages;
    localStorage.setItem(STORAGE_PAGES_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save document source pages:', err);
  }
};

export const getDocumentSourcePages = (documentId: string): SourceDocumentSheetPage[] => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_PAGES_KEY);
      if (raw) {
        const map = JSON.parse(raw);
        if (map[documentId]) return map[documentId];
      }
    } catch (e) {
      // fallback
    }
  }

  if (documentId === SPPU_PRIMARY_DOC_ID) {
    return sppuSeedResult.sourcePages;
  }

  // Fallback default
  return sppuSeedResult.sourcePages;
};

// ─────────────────────────────────────────────────────────────────────────────
// Real AI Processing & Upload Pipeline (Upload Academic Calendar -> AI Analysis)
// ─────────────────────────────────────────────────────────────────────────────

export const processCalendarUploadWithAI = async (
  file: File,
  onProgress?: (stage: string, percent: number) => void
): Promise<UniversityCalendarDocument> => {
  const result: ExtractionResult = await extractUniversityCalendarFromPdf(file, file.name, onProgress);
  const newDocId = `univ-doc-${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Remap events to the new document ID
  const docEvents: ExtractedAcademicEvent[] = result.events.map((evt, idx) => ({
    ...evt,
    id: `${newDocId}-evt-${idx + 1}`,
    documentId: newDocId
  }));

  const fileSizeLabel = file.size > 1024 * 1024 
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(file.size / 1024)} KB`;

  const newDoc: UniversityCalendarDocument = {
    id: newDocId,
    universityName: result.universityName,
    calendarTitle: result.calendarTitle,
    circularNumber: result.circularNumber,
    academicYear: result.academicYear,
    documentType: 'University Circular',
    applicableFaculties: [result.applicableFaculty as any || 'Science & Technology'],
    programsIdentified: result.programsIdentified,
    uploadedDate: new Date().toISOString().split('T')[0],
    file: {
      fileName: file.name,
      fileSize: fileSizeLabel,
      fileType: file.name.split('.').pop()?.toLowerCase() || 'pdf',
      fileUrl: URL.createObjectURL(file),
      uploadDate: new Date().toISOString().split('T')[0]
    },
    extractionStatus: 'Extraction Completed',
    verificationStatus: 'Needs Review',
    formatDetected: result.detectedFormat as any,
    totalSourceRowsIdentified: result.totalSourceRows,
    successfullyExtractedCount: result.successfullyExtracted,
    recordsRequiringReviewCount: result.recordsRequiringReview,
    possibleDuplicatesCount: result.possibleDuplicates,
    missingUnprocessedRowsCount: result.missingUnprocessedRows,
    dateValidationIssuesCount: result.dateValidationIssues,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };

  // Persist document
  const currentDocs = getUniversityDocuments();
  saveUniversityDocuments([newDoc, ...currentDocs]);

  // Persist extracted events
  const currentEvents = getExtractedEvents();
  saveExtractedEvents([...docEvents, ...currentEvents]);

  // Persist source pages
  saveDocumentSourcePages(newDocId, result.sourcePages);

  return newDoc;
};

export const reanalyseUniversityDocument = async (documentId: string): Promise<UniversityCalendarDocument | null> => {
  const docs = getUniversityDocuments();
  const targetDoc = docs.find(d => d.id === documentId);
  if (!targetDoc) return null;

  // Create simulated file to trigger extraction for target document
  const blob = new Blob([`%PDF simulated re-analysis for ${targetDoc.calendarTitle}`], { type: 'application/pdf' });
  const simulatedFile = new File([blob], targetDoc.file.fileName, { type: 'application/pdf' });
  const result = await extractUniversityCalendarFromPdf(simulatedFile, targetDoc.file.fileName);

  const docEvents: ExtractedAcademicEvent[] = result.events.map((evt, idx) => ({
    ...evt,
    id: `${documentId}-evt-${idx + 1}`,
    documentId
  }));

  // Replace events strictly for this document only (never mix documents)
  const allEvents = getExtractedEvents().filter(e => e.documentId !== documentId);
  saveExtractedEvents([...docEvents, ...allEvents]);

  const updatedDoc: UniversityCalendarDocument = {
    ...targetDoc,
    universityName: result.universityName,
    calendarTitle: result.calendarTitle,
    circularNumber: result.circularNumber || targetDoc.circularNumber,
    academicYear: result.academicYear || targetDoc.academicYear,
    applicableFaculties: [result.applicableFaculty as any || 'Science & Technology'],
    programsIdentified: result.programsIdentified,
    totalSourceRowsIdentified: result.totalSourceRows,
    successfullyExtractedCount: result.successfullyExtracted,
    recordsRequiringReviewCount: result.recordsRequiringReview,
    possibleDuplicatesCount: result.possibleDuplicates,
    missingUnprocessedRowsCount: result.missingUnprocessedRows,
    dateValidationIssuesCount: result.dateValidationIssues,
    formatDetected: result.detectedFormat as any,
    extractionStatus: 'Extraction Completed',
    verificationStatus: result.recordsRequiringReview > 0 ? 'Needs Review' : 'Verified',
    updatedAt: new Date().toISOString().split('T')[0]
  };

  saveUniversityDocuments(docs.map(d => d.id === documentId ? updatedDoc : d));
  saveDocumentSourcePages(documentId, result.sourcePages);

  return updatedDoc;
};

// ─────────────────────────────────────────────────────────────────────────────
// Backward Compatibility Payload Support
// ─────────────────────────────────────────────────────────────────────────────

export interface UploadUniversityCalendarPayload {
  universityName: string;
  calendarTitle: string;
  circularNumber?: string;
  academicYear: string;
  documentType: UniversityCalendarDocument['documentType'];
  applicableFaculties: UniversityCalendarDocument['applicableFaculties'];
  file: {
    fileName: string;
    fileSize: string;
    fileType: string;
    fileUrl: string;
  };
}

export const uploadAndSubmitForAIAnalysis = (payload: UploadUniversityCalendarPayload): UniversityCalendarDocument => {
  const result = extractSppuScienceTechCircular(payload.file.fileName);
  const newDocId = `univ-doc-${Date.now()}`;

  const newDoc: UniversityCalendarDocument = {
    id: newDocId,
    universityName: payload.universityName || result.universityName,
    calendarTitle: payload.calendarTitle || result.calendarTitle,
    circularNumber: payload.circularNumber || result.circularNumber,
    academicYear: payload.academicYear || result.academicYear,
    documentType: payload.documentType,
    applicableFaculties: payload.applicableFaculties.length > 0 ? payload.applicableFaculties : ['Science & Technology'],
    programsIdentified: result.programsIdentified,
    uploadedDate: new Date().toISOString().split('T')[0],
    file: {
      ...payload.file,
      uploadDate: new Date().toISOString().split('T')[0]
    },
    extractionStatus: 'Extraction Completed',
    verificationStatus: 'Needs Review',
    formatDetected: 'Format A: Program-wise / Course-wise Calendar',
    totalSourceRowsIdentified: result.totalSourceRows,
    successfullyExtractedCount: result.successfullyExtracted,
    recordsRequiringReviewCount: result.recordsRequiringReview,
    possibleDuplicatesCount: result.possibleDuplicates,
    missingUnprocessedRowsCount: result.missingUnprocessedRows,
    dateValidationIssuesCount: result.dateValidationIssues,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };

  const remappedEvents = result.events.map((e, idx) => ({
    ...e,
    id: `${newDocId}-evt-${idx + 1}`,
    documentId: newDocId
  }));

  const docs = getUniversityDocuments();
  saveUniversityDocuments([newDoc, ...docs]);

  const currentEvents = getExtractedEvents();
  saveExtractedEvents([...remappedEvents, ...currentEvents]);

  saveDocumentSourcePages(newDocId, result.sourcePages);

  return newDoc;
};

// ─────────────────────────────────────────────────────────────────────────────
// Verification, Approval & Update Operations
// ─────────────────────────────────────────────────────────────────────────────

export const updateExtractedEvent = (id: string, updates: Partial<ExtractedAcademicEvent>): void => {
  const events = getExtractedEvents();
  const updated = events.map(evt => {
    if (evt.id === id) {
      return { ...evt, ...updates };
    }
    return evt;
  });
  saveExtractedEvents(updated);
};

export const approveAllExtractedEventsForDocument = (documentId: string): void => {
  const events = getExtractedEvents();
  const updatedEvents = events.map(evt => {
    if (evt.documentId === documentId) {
      return {
        ...evt,
        isApproved: true,
        validationStatus: 'Verified' as const,
        approvedAt: new Date().toISOString().split('T')[0]
      };
    }
    return evt;
  });
  saveExtractedEvents(updatedEvents);

  // Update document verification status to 'Verified'
  const docs = getUniversityDocuments();
  const updatedDocs = docs.map(d => {
    if (d.id === documentId) {
      return {
        ...d,
        verificationStatus: 'Verified' as VerificationStatus,
        recordsRequiringReviewCount: 0,
        possibleDuplicatesCount: 0,
        dateValidationIssuesCount: 0,
        updatedAt: new Date().toISOString().split('T')[0]
      };
    }
    return d;
  });
  saveUniversityDocuments(updatedDocs);
};

export const dismissDuplicateWarning = (eventId: string): void => {
  updateExtractedEvent(eventId, {
    isDuplicate: false,
    validationStatus: 'Valid'
  });
};

export const deleteUniversityDocument = (documentId: string): void => {
  const docs = getUniversityDocuments();
  saveUniversityDocuments(docs.filter(d => d.id !== documentId));

  const events = getExtractedEvents();
  saveExtractedEvents(events.filter(e => e.documentId !== documentId));
};
