import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Copy, 
  Info, 
  ExternalLink, 
  Pencil, 
  Check, 
  X, 
  Trash2, 
  Search, 
  ShieldCheck, 
  ChevronRight,
  Filter,
  Plus,
  Calendar,
  Layers,
  Lock,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react';
import { 
  UniversityCalendarDocument, 
  ExtractedAcademicEvent, 
  SourceDocumentSheetPage,
  AcademicEventCategory,
  ACADEMIC_EVENT_CATEGORIES,
  DateType
} from '../../../../types/universityCalendar';
import { 
  getExtractedEvents, 
  getDocumentSourcePages, 
  updateExtractedEvent, 
  approveAllExtractedEventsForDocument, 
  dismissDuplicateWarning 
} from '../../../../services/universityCalendarAnalysisService';

interface ExtractedDataReviewScreenProps {
  document: UniversityCalendarDocument;
  onBackToDashboard: () => void;
  onApproveSuccess: () => void;
}

type FilterTab = 'all' | 'term-1' | 'term-2' | 'needs-review' | 'confirmed' | 'tentative' | 'verified';

export const ExtractedDataReviewScreen: React.FC<ExtractedDataReviewScreenProps> = ({
  document,
  onBackToDashboard,
  onApproveSuccess
}) => {
  const [events, setEvents] = useState<ExtractedAcademicEvent[]>([]);
  const [pages, setPages] = useState<SourceDocumentSheetPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Comparison View State: Default is FALSE (Never show PDF preview by default)
  const [showPdfComparison, setShowPdfComparison] = useState(false);

  // Inline / Modal Edit states
  const [editingEvent, setEditingEvent] = useState<ExtractedAcademicEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);

  useEffect(() => {
    const list = getExtractedEvents(document.id);
    setEvents(list);
    const sourcePages = getDocumentSourcePages(document.id);
    setPages(sourcePages);
    if (list.length > 0) {
      setSelectedEventId(list[0].id);
      if (list[0].sourcePageNumber && list[0].sourcePageNumber <= sourcePages.length) {
        setActivePageIndex(list[0].sourcePageNumber - 1);
      }
    }
  }, [document]);

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0] || null;

  // Counts for tabs & KPI
  const term1Events = events.filter(e => e.semester?.includes('Term - I') || e.semester?.includes('Term 1') || e.eventName.includes('Term - I'));
  const term2Events = events.filter(e => e.semester?.includes('Term - II') || e.semester?.includes('Term 2') || e.eventName.includes('Term - II'));
  const needsReviewEvents = events.filter(e => e.validationStatus === 'Needs Review' || e.validationStatus === 'Missing End Date' || e.isDuplicate);
  const confirmedEvents = events.filter(e => e.dateType === 'Confirmed');
  const tentativeEvents = events.filter(e => e.dateType === 'Tentative');
  const approvedEvents = events.filter(e => e.isApproved || e.validationStatus === 'Verified');

  const approvedCount = approvedEvents.length;
  const unresolvedReviewCount = needsReviewEvents.filter(e => !e.isApproved).length;

  // Filter events by tab and search
  const filteredEvents = events.filter(evt => {
    const matchesSearch = 
      evt.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.sourceReference && evt.sourceReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.sourceSnippet && evt.sourceSnippet.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'term-1') {
      return evt.semester?.includes('Term - I') || evt.semester?.includes('Term 1') || evt.eventName.includes('Term - I');
    }
    if (activeTab === 'term-2') {
      return evt.semester?.includes('Term - II') || evt.semester?.includes('Term 2') || evt.eventName.includes('Term - II');
    }
    if (activeTab === 'needs-review') {
      return evt.validationStatus === 'Needs Review' || evt.validationStatus === 'Missing End Date' || evt.isDuplicate;
    }
    if (activeTab === 'confirmed') {
      return evt.dateType === 'Confirmed';
    }
    if (activeTab === 'tentative') {
      return evt.dateType === 'Tentative';
    }
    if (activeTab === 'verified') {
      return evt.isApproved || evt.validationStatus === 'Verified';
    }
    return true;
  });

  const handleSelectEvent = (evt: ExtractedAcademicEvent) => {
    setSelectedEventId(evt.id);
    if (evt.sourcePageNumber && evt.sourcePageNumber <= pages.length) {
      setActivePageIndex(evt.sourcePageNumber - 1);
    }
  };

  const handleOpenEdit = (evt: ExtractedAcademicEvent) => {
    setEditingEvent({ ...evt });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    updateExtractedEvent(editingEvent.id, {
      ...editingEvent,
      validationStatus: editingEvent.validationStatus === 'Missing End Date' && editingEvent.endDate !== 'Not Specified' ? 'Valid' : editingEvent.validationStatus
    });
    setEvents(getExtractedEvents(document.id));
    setIsEditModalOpen(false);
  };

  const handleDismissDuplicate = (id: string) => {
    dismissDuplicateWarning(id);
    setEvents(getExtractedEvents(document.id));
  };

  const handleApproveAll = () => {
    approveAllExtractedEventsForDocument(document.id);
    setEvents(getExtractedEvents(document.id));
    setApproveConfirmOpen(false);
    onApproveSuccess();
  };

  const handleQuickApproveSingle = (id: string) => {
    updateExtractedEvent(id, {
      isApproved: true,
      validationStatus: 'Verified',
      approvedAt: new Date().toISOString().split('T')[0]
    });
    setEvents(getExtractedEvents(document.id));
  };

  const currentPage = pages[activePageIndex] || pages[0];

  return (
    <div className="space-y-4">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Top Header: Navigation Back & Toggle View Original PDF Action       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Back to Uploaded Calendars"
            aria-label="Back to Uploaded Calendars"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Review Extracted Data &amp; Verification
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {document.academicYear}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {document.extractionStatus}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {document.universityName} • {document.calendarTitle}
              {document.circularNumber && ` • ${document.circularNumber}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Toggle View / Hide Original PDF Comparison Button */}
          {showPdfComparison ? (
            <button
              type="button"
              onClick={() => setShowPdfComparison(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer transition-colors shadow-2xs whitespace-nowrap shrink-0"
              title="Return to extracted-data-only view"
            >
              <EyeOff className="w-3.5 h-3.5 text-gray-600" />
              <span>Hide Original PDF</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowPdfComparison(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors shadow-2xs whitespace-nowrap shrink-0"
              title="Open side-by-side comparison view with original document"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>View Original PDF</span>
            </button>
          )}

          <a
            href={document.file.fileUrl}
            target="_blank"
            rel="noreferrer"
            download={document.file.fileName}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>

          {/* Quality Approval Gate */}
          {unresolvedReviewCount > 0 ? (
            <button
              onClick={() => setActiveTab('needs-review')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Resolve review items before final approval"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Resolve {unresolvedReviewCount} Review Item(s)</span>
            </button>
          ) : (
            <button
              onClick={() => setApproveConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Approve Verified Records ({approvedCount}/{events.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Unresolved Review Items Quality Banner                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {unresolvedReviewCount > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Quality Gate Enforced:</span>
              <span className="ml-1 text-amber-800">
                {unresolvedReviewCount} record(s) flagged for coordinator review. Please verify or correct them before final approval.
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('needs-review')}
            className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg shrink-0 cursor-pointer transition-colors"
          >
            View Review Items
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Structured Organization Metadata Strip                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        <div className="bg-white p-2.5 rounded-lg border border-gray-200">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Faculty / Stream</span>
          <span className="text-xs font-bold text-gray-900 truncate block mt-0.5" title={document.applicableFaculties?.join(', ')}>
            {document.applicableFaculties?.join(', ') || 'Science & Technology'}
          </span>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-gray-200">
          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">Total Extracted</span>
          <span className="text-lg font-bold text-blue-700">{events.length}</span>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-gray-200">
          <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block">Term &ndash; I Schedule</span>
          <span className="text-lg font-bold text-indigo-700">{term1Events.length}</span>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-gray-200">
          <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider block">Term &ndash; II Schedule</span>
          <span className="text-lg font-bold text-purple-700">{term2Events.length}</span>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-gray-200">
          <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider block">Needs Review</span>
          <span className="text-lg font-bold text-amber-700">{unresolvedReviewCount}</span>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-gray-200">
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">Verified Records</span>
          <span className="text-lg font-bold text-emerald-700">{approvedCount}</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Content View: Default (Extracted Only) vs Comparison View (2-Panel) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className={showPdfComparison ? "grid grid-cols-1 lg:grid-cols-12 gap-4 items-start" : "space-y-4"}>
        
        {/* =================================================================== */}
        {/* LEFT PANEL: Original Document Preview (ONLY when showPdfComparison) */}
        {/* =================================================================== */}
        {showPdfComparison && (
          <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col h-[760px] sticky top-4 animate-in fade-in slide-in-from-left duration-200">
            {/* Left Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Original Document Preview
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-gray-500 uppercase px-2 py-0.5 rounded bg-gray-200">
                  {document.file.fileType}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPdfComparison(false)}
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                  title="Close PDF preview"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Page Navigation Tabs */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-100/60 overflow-x-auto shrink-0 text-xs">
              {pages.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setActivePageIndex(idx)}
                  className={`px-3 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    activePageIndex === idx
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Active Event Snippet Highlight Box */}
            {selectedEvent && (
              <div className="p-3 bg-amber-50/90 border-b border-amber-200 text-xs shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Selected Event Source Trace:
                  </span>
                  <span className="font-mono text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    {selectedEvent.sourceReference}
                  </span>
                </div>
                <p className="text-amber-950 font-serif italic text-xs leading-relaxed bg-white/70 p-2 rounded border border-amber-200/60">
                  "{selectedEvent.sourceSnippet || 'Source text reference logged in circular table.'}"
                </p>
              </div>
            )}

            {/* Document Content View */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
              {currentPage && (
                <>
                  <div className="border border-gray-200 rounded-lg p-3 bg-slate-50/70 whitespace-pre-line text-gray-800 text-[11px] leading-relaxed shadow-2xs font-sans">
                    {currentPage.rawTextPreview}
                  </div>

                  {currentPage.tabularRows && currentPage.tabularRows.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
                      <div className="bg-gray-100 px-3 py-1.5 font-bold text-[10px] text-gray-700 uppercase tracking-wider border-b border-gray-200 font-sans">
                        OCR Extracted Table Rows ({currentPage.label})
                      </div>
                      <table className="w-full text-left text-[11px] border-collapse bg-white">
                        <tbody className="divide-y divide-gray-100 font-sans">
                          {currentPage.tabularRows.map(row => {
                            const isHighlighted = 
                              (selectedEvent?.sourceReference && selectedEvent.sourceReference.includes(`Row ${row.rowNumber}`)) ||
                              (selectedEvent?.semester?.includes('Term - I') && row.cells[0]?.includes('Term I')) ||
                              (selectedEvent?.semester?.includes('Term - II') && row.cells[0]?.includes('Term II'));

                            return (
                              <tr 
                                key={row.rowNumber}
                                className={`transition-colors ${
                                  isHighlighted 
                                    ? 'bg-amber-100/90 font-medium' 
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <td className="p-2 w-7 text-gray-400 font-mono text-[10px]">
                                  {row.rowNumber}
                                </td>
                                {row.cells.map((c, i) => (
                                  <td key={i} className="p-2 text-gray-800 text-xs">
                                    {c}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* RIGHT / MAIN PANEL: Extracted Structured Records Table              */}
        {/* =================================================================== */}
        <div className={showPdfComparison ? "lg:col-span-7 space-y-3.5" : "w-full space-y-3.5"}>
          {/* Header Controls: Filter Tabs & Search */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Tab Pills */}
              <div className="flex flex-wrap gap-1 text-xs">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Records ({events.length})
                </button>
                <button
                  onClick={() => setActiveTab('term-1')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeTab === 'term-1'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  Term &ndash; I ({term1Events.length})
                </button>
                <button
                  onClick={() => setActiveTab('term-2')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeTab === 'term-2'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  Term &ndash; II ({term2Events.length})
                </button>
                <button
                  onClick={() => setActiveTab('needs-review')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeTab === 'needs-review'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Needs Review ({needsReviewEvents.length})
                </button>
                <button
                  onClick={() => setActiveTab('confirmed')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeTab === 'confirmed'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  Confirmed ({confirmedEvents.length})
                </button>
                <button
                  onClick={() => setActiveTab('tentative')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeTab === 'tentative'
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100'
                  }`}
                >
                  Tentative ({tentativeEvents.length})
                </button>
                <button
                  onClick={() => setActiveTab('verified')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeTab === 'verified'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Verified ({approvedCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter extracted events..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-1.5 text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Clean Spacious Extracted Records Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[640px]">
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead className="bg-gray-100/80 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 min-w-[200px]">Event Name</th>
                    <th className="px-4 py-3 min-w-[140px]">Program &amp; Year</th>
                    <th className="px-4 py-3 min-w-[90px]">Term</th>
                    <th className="px-4 py-3 min-w-[100px]">Start Date</th>
                    <th className="px-4 py-3 min-w-[100px]">End Date</th>
                    <th className="px-4 py-3 min-w-[120px]">Category</th>
                    <th className="px-4 py-3 min-w-[90px]">Date Type</th>
                    <th className="px-4 py-3 min-w-[100px]">Status</th>
                    <th className="px-4 py-3 min-w-[100px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-14 text-center text-gray-500">
                        No events match current filter tab.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map(evt => {
                      const isSelected = evt.id === selectedEventId;

                      return (
                        <tr
                          key={evt.id}
                          onClick={() => handleSelectEvent(evt)}
                          className={`transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-50/70 ring-1 ring-blue-300' 
                              : evt.isDuplicate 
                              ? 'bg-purple-50/30 hover:bg-purple-50/50' 
                              : evt.validationStatus === 'Missing End Date' 
                              ? 'bg-rose-50/30 hover:bg-rose-50/50' 
                              : 'hover:bg-gray-50/80'
                          }`}
                        >
                          {/* Event Name */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-gray-900 leading-snug">
                              {evt.eventName}
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              Ref: {evt.sourceReference}
                            </span>
                            {evt.duplicateReason && (
                              <div className="text-[10px] text-purple-700 bg-purple-50 p-1 rounded mt-1 border border-purple-200">
                                ⚠ {evt.duplicateReason}
                              </div>
                            )}
                          </td>

                          {/* Program / Year */}
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-blue-900 block text-xs">
                              {evt.program}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {evt.year}
                            </span>
                          </td>

                          {/* Term / Semester */}
                          <td className="px-4 py-3.5 whitespace-nowrap font-medium text-gray-700">
                            {evt.semester}
                          </td>

                          {/* Start Date */}
                          <td className="px-4 py-3.5 font-mono text-gray-800 font-medium whitespace-nowrap">
                            {evt.startDate}
                          </td>

                          {/* End Date */}
                          <td className="px-4 py-3.5 font-mono text-gray-800 font-medium whitespace-nowrap">
                            {evt.endDate === 'Not Specified' ? (
                              <span className="text-rose-600 font-bold text-[11px] bg-rose-50 px-1.5 py-0.5 rounded">
                                Not Specified
                              </span>
                            ) : (
                              evt.endDate
                            )}
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                              {evt.category}
                            </span>
                          </td>

                          {/* Date Type */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              evt.dateType === 'Confirmed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              evt.dateType === 'Tentative' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                              'bg-purple-50 text-purple-800 border border-purple-200'
                            }`}>
                              {evt.dateType}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            {evt.isApproved ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            ) : evt.isDuplicate ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700">
                                <Copy className="w-3.5 h-3.5" />
                                Duplicate
                              </span>
                            ) : evt.validationStatus === 'Missing End Date' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Review Date
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-gray-500">
                                Extracted
                              </span>
                            )}
                          </td>

                          {/* Actions: Edit & Verify */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit Modal Button */}
                              <button
                                onClick={e => { e.stopPropagation(); handleOpenEdit(evt); }}
                                className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                title="Edit & Correct Event Details"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Dismiss duplicate warning */}
                              {evt.isDuplicate && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleDismissDuplicate(evt.id); }}
                                  className="p-1 rounded text-purple-600 hover:bg-purple-50 cursor-pointer"
                                  title="Dismiss Duplicate Warning"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Quick Verify Single */}
                              {!evt.isApproved && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleQuickApproveSingle(evt.id); }}
                                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                  title="Mark Record as Verified"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Edit Extracted Event Modal                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isEditModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                Edit &amp; Correct Extracted Event
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  value={editingEvent.eventName}
                  onChange={e => setEditingEvent({ ...editingEvent, eventName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 text-xs text-gray-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={editingEvent.category}
                    onChange={e => setEditingEvent({ ...editingEvent, category: e.target.value as AcademicEventCategory })}
                    className="w-full border border-gray-300 rounded-md p-2 text-xs text-gray-900 bg-white"
                  >
                    {ACADEMIC_EVENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date Type</label>
                  <select
                    value={editingEvent.dateType}
                    onChange={e => setEditingEvent({ ...editingEvent, dateType: e.target.value as DateType })}
                    className="w-full border border-gray-300 rounded-md p-2 text-xs text-gray-900 bg-white"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Tentative">Tentative</option>
                    <option value="Derived">Derived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Program</label>
                  <input
                    type="text"
                    value={editingEvent.program}
                    onChange={e => setEditingEvent({ ...editingEvent, program: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-xs text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Year / Semester</label>
                  <input
                    type="text"
                    value={`${editingEvent.year} • ${editingEvent.semester}`}
                    onChange={e => setEditingEvent({ ...editingEvent, semester: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-xs text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={editingEvent.startDate}
                    onChange={e => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-xs text-gray-900 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Date</label>
                  <input
                    type="text"
                    value={editingEvent.endDate}
                    onChange={e => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-xs text-gray-900 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description / Remarks</label>
                <textarea
                  rows={2}
                  value={editingEvent.description || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 text-xs text-gray-900 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Approve Confirmation Modal                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {approveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Approve Verified Records</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              You are about to verify and approve all <span className="font-bold text-gray-900">{events.length} extracted academic events</span> from <span className="font-semibold">{document.calendarTitle}</span>.
              Approved records will transition into verified institutional data.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setApproveConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveAll}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm &amp; Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
