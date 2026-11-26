import React, { useState, useEffect } from 'react';
import { 
  AcademicCalendar, 
  CalendarEvent, 
  UploadedCalendarDocument 
} from '../../../../types/academicCalendar';
import { 
  getStoredCalendars, 
  saveStoredCalendars, 
  getStoredEvents, 
  saveStoredEvents,
  addAcademicCalendar,
  updateAcademicCalendar,
  deleteAcademicCalendar,
  setCalendarStatus,
  attachDocumentToCalendar,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '../../../../services/academicCalendarService';
import { AcademicCalendarList } from './AcademicCalendarList';
import { ManageCalendarEvents } from './ManageCalendarEvents';
import { ConsolidatedCalendar } from './ConsolidatedCalendar';
import { AddEditCalendarModal } from './AddEditCalendarModal';
import { DocumentExtractionReviewModal } from './DocumentExtractionReviewModal';
import { X, ExternalLink, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface AcademicCalendarModuleProps {
  initialSubView?: 'academic-calendar' | 'manage-calendar-events' | 'consolidated-calendar';
}

export const AcademicCalendarModule: React.FC<AcademicCalendarModuleProps> = ({
  initialSubView = 'academic-calendar'
}) => {
  const [currentSubView, setCurrentSubView] = useState(initialSubView);
  const [calendars, setCalendars] = useState<AcademicCalendar[]>(getStoredCalendars);
  const [events, setEvents] = useState<CalendarEvent[]>(getStoredEvents);

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<AcademicCalendar | null>(null);

  const [isExtractionOpen, setIsExtractionOpen] = useState(false);
  const [extractionTargetCalendar, setExtractionTargetCalendar] = useState<AcademicCalendar | null>(null);

  const [viewingCalendar, setViewingCalendar] = useState<AcademicCalendar | null>(null);
  const [isQuickUploadOpen, setIsQuickUploadOpen] = useState(false);
  const [quickUploadCalendar, setQuickUploadCalendar] = useState<AcademicCalendar | null>(null);

  // Sync with prop if it changes via sidebar navigation
  useEffect(() => {
    setCurrentSubView(initialSubView);
  }, [initialSubView]);

  // Sync state on storage or custom events
  useEffect(() => {
    const handleCalendarUpdate = () => {
      setCalendars(getStoredCalendars());
    };
    const handleEventsUpdate = () => {
      setEvents(getStoredEvents());
    };

    window.addEventListener('academic-calendar-updated', handleCalendarUpdate);
    window.addEventListener('calendar-events-updated', handleEventsUpdate);

    return () => {
      window.removeEventListener('academic-calendar-updated', handleCalendarUpdate);
      window.removeEventListener('calendar-events-updated', handleEventsUpdate);
    };
  }, []);

  // Save calendar from Add/Edit modal
  const handleSaveCalendar = (
    calendarData: Omit<AcademicCalendar, 'id' | 'createdAt' | 'updatedAt' | 'eventsCount'>,
    triggerExtraction: boolean
  ) => {
    if (editingCalendar) {
      const updated = updateAcademicCalendar(editingCalendar.id, calendarData);
      if (updated) {
        setCalendars(getStoredCalendars());
      }
      setIsAddEditOpen(false);
      setEditingCalendar(null);
    } else {
      const created = addAcademicCalendar(calendarData);
      setCalendars(getStoredCalendars());
      setIsAddEditOpen(false);

      if (triggerExtraction && created.uploadedDocument) {
        setExtractionTargetCalendar(created);
        setIsExtractionOpen(true);
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingCalendar(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (cal: AcademicCalendar) => {
    setEditingCalendar(cal);
    setIsAddEditOpen(true);
  };

  const handleDeleteCalendar = (id: string) => {
    deleteAcademicCalendar(id);
    setCalendars(getStoredCalendars());
    setEvents(getStoredEvents());
  };

  const handlePublishCalendar = (id: string) => {
    setCalendarStatus(id, 'Published');
    setCalendars(getStoredCalendars());
  };

  const handleArchiveCalendar = (id: string) => {
    setCalendarStatus(id, 'Archived');
    setCalendars(getStoredCalendars());
  };

  const handleOpenExtraction = (cal: AcademicCalendar) => {
    setExtractionTargetCalendar(cal);
    setIsExtractionOpen(true);
  };

  const handleExtractionCompleted = (published: boolean) => {
    setIsExtractionOpen(false);
    setExtractionTargetCalendar(null);
    setCalendars(getStoredCalendars());
    setEvents(getStoredEvents());
  };

  const handleOpenUpload = (cal: AcademicCalendar) => {
    setQuickUploadCalendar(cal);
    setIsQuickUploadOpen(true);
  };

  const handleQuickUploadSave = (doc: UploadedCalendarDocument) => {
    if (quickUploadCalendar) {
      attachDocumentToCalendar(quickUploadCalendar.id, doc);
      setCalendars(getStoredCalendars());
      setIsQuickUploadOpen(false);
      
      // Prompt extraction review
      const updated = getStoredCalendars().find(c => c.id === quickUploadCalendar.id);
      if (updated) {
        setExtractionTargetCalendar(updated);
        setIsExtractionOpen(true);
      }
      setQuickUploadCalendar(null);
    }
  };

  // Events operations
  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    addCalendarEvent(eventData);
    setEvents(getStoredEvents());
    setCalendars(getStoredCalendars());
  };

  const handleEditEvent = (id: string, updates: Partial<CalendarEvent>) => {
    updateCalendarEvent(id, updates);
    setEvents(getStoredEvents());
  };

  const handleDeleteEvent = (id: string) => {
    deleteCalendarEvent(id);
    setEvents(getStoredEvents());
    setCalendars(getStoredCalendars());
  };

  return (
    <div className="space-y-6">
      {/* Sub-view Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setCurrentSubView('academic-calendar')}
            className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              currentSubView === 'academic-calendar'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Academic Calendar
          </button>
          <button
            onClick={() => setCurrentSubView('manage-calendar-events')}
            className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              currentSubView === 'manage-calendar-events'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manage Calendar Events
          </button>
          <button
            onClick={() => setCurrentSubView('consolidated-calendar')}
            className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              currentSubView === 'consolidated-calendar'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Consolidated Calendar
          </button>
        </div>
      </div>

      {/* Main Sub-view Render */}
      {currentSubView === 'academic-calendar' && (
        <AcademicCalendarList
          calendars={calendars}
          onAddCalendar={handleOpenAdd}
          onEditCalendar={handleOpenEdit}
          onDeleteCalendar={handleDeleteCalendar}
          onPublishCalendar={handlePublishCalendar}
          onArchiveCalendar={handleArchiveCalendar}
          onOpenExtractionReview={handleOpenExtraction}
          onUploadDocument={handleOpenUpload}
          onViewCalendarDetails={setViewingCalendar}
        />
      )}

      {currentSubView === 'manage-calendar-events' && (
        <ManageCalendarEvents
          events={events}
          calendars={calendars}
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {currentSubView === 'consolidated-calendar' && (
        <ConsolidatedCalendar
          events={events}
          calendars={calendars}
        />
      )}

      {/* Add / Edit Calendar Modal */}
      <AddEditCalendarModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingCalendar(null);
        }}
        calendarToEdit={editingCalendar}
        onSave={handleSaveCalendar}
      />

      {/* Document Extraction Review Modal */}
      <DocumentExtractionReviewModal
        isOpen={isExtractionOpen}
        onClose={() => {
          setIsExtractionOpen(false);
          setExtractionTargetCalendar(null);
        }}
        calendar={extractionTargetCalendar}
        onExtractionCompleted={handleExtractionCompleted}
      />

      {/* View Calendar Details Modal */}
      {viewingCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {viewingCalendar.calendarType}
              </span>
              <button
                onClick={() => setViewingCalendar(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1">
              {viewingCalendar.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4 font-mono">
              Academic Year: {viewingCalendar.academicYear} | {viewingCalendar.startDate} to {viewingCalendar.endDate}
            </p>

            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed mb-4 border border-gray-100">
              {viewingCalendar.description || 'No additional remarks registered.'}
            </div>

            {viewingCalendar.uploadedDocument && (
              <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-3 mb-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-gray-800 truncate">
                    {viewingCalendar.uploadedDocument.fileName}
                  </span>
                </div>
                <a
                  href={viewingCalendar.uploadedDocument.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold underline shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View File
                </a>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
              <span>Status: <strong className="text-gray-800">{viewingCalendar.status}</strong></span>
              <span>Events Linked: <strong className="text-blue-600">{viewingCalendar.eventsCount}</strong></span>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setViewingCalendar(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              {viewingCalendar.uploadedDocument && (
                <button
                  onClick={() => {
                    const target = viewingCalendar;
                    setViewingCalendar(null);
                    handleOpenExtraction(target);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Review Extracted Events
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Upload / Replace Modal */}
      {isQuickUploadOpen && quickUploadCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900">
                Upload / Replace Document
              </h3>
              <button
                onClick={() => {
                  setIsQuickUploadOpen(false);
                  setQuickUploadCalendar(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Select or drop a new document for <span className="font-semibold">{quickUploadCalendar.name}</span>. Supported formats: PDF, DOC, DOCX, XLS, XLSX.
            </p>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
                  const sizeStr = file.size > 1024 * 1024 
                    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                    : `${Math.round(file.size / 1024)} KB`;
                  handleQuickUploadSave({
                    fileName: file.name,
                    fileSize: sizeStr,
                    fileType: ext,
                    fileUrl: URL.createObjectURL(file),
                    uploadDate: new Date().toISOString().split('T')[0]
                  });
                }
              }}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => {
                  setIsQuickUploadOpen(false);
                  setQuickUploadCalendar(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
