import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Info, 
  ExternalLink, 
  ShieldCheck, 
  Edit3,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  AcademicCalendar, 
  ExtractedEventDraft, 
  CalendarEventCategory, 
  CALENDAR_EVENT_CATEGORIES, 
  COLLEGE_DEPARTMENTS,
  VerificationStatus
} from '../../../../types/academicCalendar';
import { simulateDocumentExtraction, commitVerifiedDraftsToEvents } from '../../../../services/academicCalendarService';

interface DocumentExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendar: AcademicCalendar | null;
  onExtractionCompleted: (published: boolean) => void;
}

export const DocumentExtractionReviewModal: React.FC<DocumentExtractionReviewModalProps> = ({
  isOpen,
  onClose,
  calendar,
  onExtractionCompleted
}) => {
  const [drafts, setDrafts] = useState<ExtractedEventDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !calendar) return;

    if (calendar.uploadedDocument) {
      setIsLoading(true);
      simulateDocumentExtraction(calendar, calendar.uploadedDocument)
        .then(extracted => {
          setDrafts(extracted);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Extraction error:', err);
          setIsLoading(false);
        });
    } else {
      setDrafts([]);
    }
  }, [isOpen, calendar]);

  if (!isOpen || !calendar) return null;

  const handleUpdateDraft = (id: string, field: keyof ExtractedEventDraft, value: any) => {
    setDrafts(prev => prev.map(d => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const handleAddRow = () => {
    const newDraft: ExtractedEventDraft = {
      id: `draft-manual-${Date.now()}`,
      calendarId: calendar.id,
      name: 'New Academic Activity',
      category: 'Academic Activity',
      startDate: calendar.startDate || '2026-07-15',
      endDate: calendar.startDate || '2026-07-15',
      applicableDepartment: calendar.department || 'Entire College',
      applicableProgram: calendar.program || 'All Programs',
      applicableSemester: calendar.semester || 'All Semesters',
      description: 'Manually added academic event',
      verificationStatus: 'Verified',
      confidenceScore: 100
    };
    setDrafts(prev => [...prev, newDraft]);
    setEditingRowId(newDraft.id);
  };

  const handleDeleteRow = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  const handleToggleVerification = (id: string) => {
    setDrafts(prev => prev.map(d => {
      if (d.id !== id) return d;
      const nextStatus: VerificationStatus = 
        d.verificationStatus === 'Verified' ? 'Needs Correction' : 'Verified';
      return { ...d, verificationStatus: nextStatus };
    }));
  };

  const handleVerifyAll = () => {
    setDrafts(prev => prev.map(d => ({ ...d, verificationStatus: 'Verified' })));
  };

  const handleSaveEvents = (publish: boolean) => {
    // Only save items that are not Rejected
    const verifiedItems = drafts.filter(d => d.verificationStatus !== 'Rejected');
    commitVerifiedDraftsToEvents(calendar, verifiedItems, publish);
    onExtractionCompleted(publish);
  };

  const verifiedCount = drafts.filter(d => d.verificationStatus === 'Verified').length;
  const pendingCount = drafts.filter(d => d.verificationStatus !== 'Verified').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-6xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">
                Document Analysis & Event Extraction Review
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                OCR & Rule Parser
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Review and verify extracted academic dates before committing them into the Master Calendar.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reference Bar: Uploaded Document & Notice */}
        <div className="px-6 py-3.5 bg-blue-50/50 border-b border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {calendar.uploadedDocument?.fileType || 'DOC'}
            </div>
            <div>
              <span className="font-semibold text-gray-800">Source Document: </span>
              <span className="text-blue-900 font-medium">{calendar.uploadedDocument?.fileName || 'Uploaded Calendar File'}</span>
              <span className="text-gray-500 ml-2">({calendar.uploadedDocument?.fileSize || 'N/A'})</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-600">
            {calendar.uploadedDocument?.fileUrl && (
              <a
                href={calendar.uploadedDocument.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Reference Document
              </a>
            )}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                {verifiedCount} Verified
              </span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">
                  {pendingCount} Needs Review
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Prototype Service Distinction Notice */}
        <div className="px-6 py-2 bg-amber-50/70 border-b border-amber-200/80 flex items-center gap-2 text-[11px] text-amber-900 shrink-0">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Verification Protocol:</strong> As per ERP governance policy, no extracted events are published automatically without administrator verification. You may edit dates, rename activities, or correct applicability scopes inline below.
          </span>
        </div>

        {/* Table Body Area */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-800">Reading calendar document & parsing dates...</p>
              <p className="text-xs text-gray-500 mt-1">Analyzing examination cycles, holidays, term dates, and departmental events.</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-gray-700">No events found in this document.</p>
              <button
                onClick={handleAddRow}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Event Manually
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Extracted Events ({drafts.length} items detected)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVerifyAll}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark All as Verified
                  </button>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Row
                  </button>
                </div>
              </div>

              {/* Editable Table */}
              <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs text-gray-700 border-collapse">
                  <thead className="bg-gray-100/80 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3 w-12 text-center">Status</th>
                      <th className="p-3 min-w-[200px]">Event Name</th>
                      <th className="p-3 min-w-[140px]">Category</th>
                      <th className="p-3 min-w-[125px]">Start Date</th>
                      <th className="p-3 min-w-[125px]">End Date</th>
                      <th className="p-3 min-w-[150px]">Department</th>
                      <th className="p-3 min-w-[120px]">Program</th>
                      <th className="p-3 min-w-[100px]">Semester</th>
                      <th className="p-3 min-w-[160px]">Description</th>
                      <th className="p-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {drafts.map((draft) => {
                      const isVerified = draft.verificationStatus === 'Verified';
                      return (
                        <tr 
                          key={draft.id}
                          className={`hover:bg-gray-50/80 transition-colors ${
                            isVerified ? '' : 'bg-amber-50/30'
                          }`}
                        >
                          {/* Verification Toggle */}
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleVerification(draft.id)}
                              title={isVerified ? 'Verified (Click to toggle)' : 'Needs correction (Click to verify)'}
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                isVerified 
                                  ? 'text-emerald-600 hover:bg-emerald-50' 
                                  : 'text-amber-500 hover:bg-amber-50'
                              }`}
                            >
                              {isVerified ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <AlertTriangle className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Event Name */}
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={draft.name}
                              onChange={e => handleUpdateDraft(draft.id, 'name', e.target.value)}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 bg-transparent font-medium"
                            />
                            {draft.sourceSnippet && (
                              <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 italic">
                                Ref: {draft.sourceSnippet}
                              </p>
                            )}
                          </td>

                          {/* Category */}
                          <td className="p-2.5">
                            <select
                              value={draft.category}
                              onChange={e => handleUpdateDraft(draft.id, 'category', e.target.value as CalendarEventCategory)}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-blue-500"
                            >
                              {CALENDAR_EVENT_CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </td>

                          {/* Start Date */}
                          <td className="p-2.5">
                            <input
                              type="date"
                              value={draft.startDate}
                              onChange={e => handleUpdateDraft(draft.id, 'startDate', e.target.value)}
                              className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </td>

                          {/* End Date */}
                          <td className="p-2.5">
                            <input
                              type="date"
                              value={draft.endDate}
                              onChange={e => handleUpdateDraft(draft.id, 'endDate', e.target.value)}
                              className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </td>

                          {/* Department */}
                          <td className="p-2.5">
                            <select
                              value={draft.applicableDepartment}
                              onChange={e => handleUpdateDraft(draft.id, 'applicableDepartment', e.target.value)}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="Entire College">Entire College</option>
                              {COLLEGE_DEPARTMENTS.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </td>

                          {/* Program */}
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={draft.applicableProgram}
                              onChange={e => handleUpdateDraft(draft.id, 'applicableProgram', e.target.value)}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </td>

                          {/* Semester */}
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={draft.applicableSemester}
                              onChange={e => handleUpdateDraft(draft.id, 'applicableSemester', e.target.value)}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </td>

                          {/* Description */}
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={draft.description}
                              onChange={e => handleUpdateDraft(draft.id, 'description', e.target.value)}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </td>

                          {/* Action */}
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(draft.id)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 text-center sm:text-left">
            <span>Verified items will be converted into structured Calendar Events.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Keep as Draft & Close
            </button>
            <button
              type="button"
              onClick={() => handleSaveEvents(false)}
              className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Save Verified to Events
            </button>
            <button
              type="button"
              onClick={() => handleSaveEvents(true)}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Save & Publish Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
