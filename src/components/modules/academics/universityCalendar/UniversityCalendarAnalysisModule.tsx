import React, { useState, useEffect } from 'react';
import { 
  UniversityCalendarDocument 
} from '../../../../types/universityCalendar';
import { 
  getUniversityDocuments, 
  deleteUniversityDocument,
  reanalyseUniversityDocument
} from '../../../../services/universityCalendarAnalysisService';
import { UniversityCalendarUploadScreen } from './UniversityCalendarUploadScreen';
import { UploadedCalendarsScreen } from './UploadedCalendarsScreen';
import { ExtractedDataReviewScreen } from './ExtractedDataReviewScreen';
import { CheckCircle2, X, Sparkles } from 'lucide-react';

export type UniversityCalendarView = 'upload' | 'list' | 'review';

export const UniversityCalendarAnalysisModule: React.FC = () => {
  const [documents, setDocuments] = useState<UniversityCalendarDocument[]>(getUniversityDocuments);
  const [activeView, setActiveView] = useState<UniversityCalendarView>('upload');
  const [reviewingDocument, setReviewingDocument] = useState<UniversityCalendarDocument | null>(null);
  
  // Notification toast
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info';
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      const refreshed = getUniversityDocuments();
      setDocuments(refreshed);
      if (reviewingDocument) {
        const found = refreshed.find(d => d.id === reviewingDocument.id);
        if (found) setReviewingDocument(found);
      }
    };

    window.addEventListener('university-calendar-updated', handleUpdate);
    return () => window.removeEventListener('university-calendar-updated', handleUpdate);
  }, [reviewingDocument]);

  const handleNavigateToUpload = () => {
    setActiveView('upload');
  };

  const handleNavigateToList = () => {
    setActiveView('list');
  };

  const handleReviewData = (doc: UniversityCalendarDocument) => {
    setReviewingDocument(doc);
    setActiveView('review');
  };

  const handleAnalysisSuccess = (doc: UniversityCalendarDocument) => {
    setReviewingDocument(doc);
    setActiveView('review');
    setToastMessage({
      type: 'success',
      title: 'AI Analysis Complete',
      description: `Structured records for "${doc.calendarTitle}" extracted successfully. Review and verify data before approval.`
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  const handleReanalyse = (doc: UniversityCalendarDocument) => {
    setToastMessage({
      type: 'info',
      title: 'Re-analysis Triggered',
      description: `Re-running AI structure extraction and duplicate checks for "${doc.calendarTitle}".`
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleDelete = (id: string) => {
    deleteUniversityDocument(id);
    setDocuments(getUniversityDocuments());
    if (reviewingDocument?.id === id) {
      setReviewingDocument(null);
      setActiveView('list');
    }
    setToastMessage({
      type: 'success',
      title: 'Calendar Deleted',
      description: 'The university calendar and associated extracted records have been removed.'
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleApproveSuccess = () => {
    setToastMessage({
      type: 'success',
      title: 'Calendar Approved & Verified',
      description: 'Extracted academic milestones have been successfully verified and saved into institutional records.'
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-bottom duration-300">
          <div className={`p-2 rounded-lg shrink-0 ${toastMessage.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-blue-600" />}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-gray-900">{toastMessage.title}</h4>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{toastMessage.description}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Screen 1: Upload Academic Calendar */}
      {activeView === 'upload' && (
        <UniversityCalendarUploadScreen
          uploadedCalendarsCount={documents.length}
          onNavigateToUploadedCalendars={handleNavigateToList}
          onAnalysisSuccess={handleAnalysisSuccess}
        />
      )}

      {/* Screen 2: Uploaded Calendars List */}
      {activeView === 'list' && (
        <UploadedCalendarsScreen
          documents={documents}
          onNavigateToUpload={handleNavigateToUpload}
          onReviewData={handleReviewData}
          onReanalyse={handleReanalyse}
          onDeleteDocument={handleDelete}
        />
      )}

      {/* Screen 3: Review Data Screen */}
      {activeView === 'review' && reviewingDocument && (
        <ExtractedDataReviewScreen
          document={reviewingDocument}
          onBackToDashboard={handleNavigateToList}
          onApproveSuccess={handleApproveSuccess}
        />
      )}
    </div>
  );
};
