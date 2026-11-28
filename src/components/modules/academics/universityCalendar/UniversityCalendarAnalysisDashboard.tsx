import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Plus, 
  FileText, 
  Sparkles, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';
import { 
  UniversityCalendarDocument, 
  ExtractionStatus, 
  VerificationStatus,
  UNIVERSITY_FACULTIES
} from '../../../../types/universityCalendar';

interface UniversityCalendarAnalysisDashboardProps {
  documents: UniversityCalendarDocument[];
  onOpenUploadDrawer: () => void;
  onReviewExtractedData: (doc: UniversityCalendarDocument) => void;
  onReanalyse: (doc: UniversityCalendarDocument) => void;
  onDeleteDocument: (id: string) => void;
}

export const UniversityCalendarAnalysisDashboard: React.FC<UniversityCalendarAnalysisDashboardProps> = ({
  documents,
  onOpenUploadDrawer,
  onReviewExtractedData,
  onReanalyse,
  onDeleteDocument
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedFaculty, setSelectedFaculty] = useState('All');
  const [selectedExtractionStatus, setSelectedExtractionStatus] = useState('All');
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState('All');
  const [showPerPage, setShowPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<UniversityCalendarDocument | null>(null);

  // Dynamic calculations for Summary Cards (Section 3: "Display actual document counts from the system. Do not use hardcoded numbers.")
  const totalDocumentsCount = documents.length;
  const processingCount = documents.filter(d => d.extractionStatus === 'Processing' || d.verificationStatus === 'Processing').length;
  const needsReviewCount = documents.filter(d => d.verificationStatus === 'Needs Review').length;
  const verifiedCount = documents.filter(d => d.verificationStatus === 'Verified').length;

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.calendarTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.circularNumber && doc.circularNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.programsIdentified.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.file.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear = selectedYear === 'All' || doc.academicYear === selectedYear;
    const matchesFaculty = selectedFaculty === 'All' || doc.applicableFaculties.includes(selectedFaculty as any);
    const matchesExtraction = selectedExtractionStatus === 'All' || doc.extractionStatus === selectedExtractionStatus;
    const matchesVerification = selectedVerificationStatus === 'All' || doc.verificationStatus === selectedVerificationStatus;

    return matchesSearch && matchesYear && matchesFaculty && matchesExtraction && matchesVerification;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / showPerPage));
  const paginatedDocs = filteredDocuments.slice(
    (currentPage - 1) * showPerPage,
    currentPage * showPerPage
  );

  const getExtractionBadge = (status: ExtractionStatus) => {
    switch (status) {
      case 'Extraction Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Extraction Completed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Processing
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            Failed
          </span>
        );
      case 'Uploaded':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Uploaded
          </span>
        );
    }
  };

  const getVerificationBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
            Verified
          </span>
        );
      case 'Needs Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Needs Review
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Processing
          </span>
        );
      case 'Failed':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Home className="w-3.5 h-3.5 text-slate-600" />
        <span>/</span>
        <span className="text-gray-500">Academics</span>
        <span>/</span>
        <span className="text-gray-500">Academic Planning</span>
        <span>/</span>
        <span className="text-gray-800 font-semibold">University Calendar Analysis</span>
      </nav>

      {/* Screen 1 Header (Section 3) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
              🏛️
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                University Calendar Analysis
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload, analyse and organise university academic calendars into structured academic records.
              </p>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={onOpenUploadDrawer}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Upload University Calendar
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (Section 3: Actual dynamic system counts) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Documents</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900 mt-2 block">{totalDocumentsCount}</span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">University circulars uploaded</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Processing</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4 animate-spin" />
            </span>
          </div>
          <span className="text-2xl font-bold text-blue-700 mt-2 block">{processingCount}</span>
          <span className="text-[11px] text-blue-600 mt-0.5 block">Undergoing AI parsing</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Needs Review</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-bold text-amber-700 mt-2 block">{needsReviewCount}</span>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Awaiting coordinator verification</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Verified</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-bold text-emerald-700 mt-2 block">{verifiedCount}</span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Approved institutional records</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Academic Year */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={e => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Years</option>
              <option value="2026-27">2026–27</option>
              <option value="2025-26">2025–26</option>
              <option value="2024-25">2024–25</option>
            </select>
          </div>

          {/* Applicable Faculty */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Faculty / Stream
            </label>
            <select
              value={selectedFaculty}
              onChange={e => { setSelectedFaculty(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Faculties</option>
              {UNIVERSITY_FACULTIES.filter(f => f !== 'All Faculties').map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Extraction Status */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Extraction Status
            </label>
            <select
              value={selectedExtractionStatus}
              onChange={e => { setSelectedExtractionStatus(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Extraction States</option>
              <option value="Extraction Completed">Extraction Completed</option>
              <option value="Processing">Processing</option>
              <option value="Uploaded">Uploaded</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Verification Status
            </label>
            <select
              value={selectedVerificationStatus}
              onChange={e => { setSelectedVerificationStatus(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Verification States</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Verified">Verified</option>
              <option value="Processing">Processing</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search university, circular, program..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Reset Filter info */}
        {(selectedYear !== 'All' || selectedFaculty !== 'All' || selectedExtractionStatus !== 'All' || selectedVerificationStatus !== 'All' || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-600">
            <span>Showing {filteredDocuments.length} of {documents.length} filtered calendars</span>
            <button
              onClick={() => {
                setSelectedYear('All');
                setSelectedFaculty('All');
                setSelectedExtractionStatus('All');
                setSelectedVerificationStatus('All');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Document Listing Table (Section 3) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Show</span>
            <select
              value={showPerPage}
              onChange={e => { setShowPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[5, 10, 25, 50].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>entries per page</span>
          </div>

          <div className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Structured Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 border-collapse">
            <thead className="bg-gray-100/75 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 min-w-[200px]">University Name</th>
                <th className="px-4 py-3 min-w-[220px]">Calendar Title</th>
                <th className="px-4 py-3 min-w-[95px]">Academic Year</th>
                <th className="px-4 py-3 min-w-[150px]">Applicable Faculty</th>
                <th className="px-4 py-3 min-w-[170px]">Programs Identified</th>
                <th className="px-4 py-3 min-w-[100px]">Uploaded Date</th>
                <th className="px-4 py-3 min-w-[130px]">Extraction Status</th>
                <th className="px-4 py-3 min-w-[110px]">Verification</th>
                <th className="px-4 py-3 min-w-[160px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedDocs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">No university calendar documents found.</p>
                    <p className="text-xs text-gray-400 mt-0.5">Click "Upload University Calendar" to upload official university circulars for AI analysis.</p>
                  </td>
                </tr>
              ) : (
                paginatedDocs.map(doc => {
                  const isProcessing = doc.extractionStatus === 'Processing';

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* University Name */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900 leading-snug">
                          {doc.universityName}
                        </div>
                        {doc.circularNumber && (
                          <span className="text-[11px] text-gray-500 block mt-0.5 font-mono">
                            {doc.circularNumber}
                          </span>
                        )}
                      </td>

                      {/* Calendar Title */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-gray-900 leading-snug">
                          {doc.calendarTitle}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                          <span className="text-blue-700 font-semibold">{doc.documentType}</span>
                          {doc.formatDetected && (
                            <span>• {doc.formatDetected.split(':')[0]}</span>
                          )}
                        </div>
                      </td>

                      {/* Academic Year */}
                      <td className="px-4 py-3.5 font-bold text-gray-800">
                        {doc.academicYear}
                      </td>

                      {/* Applicable Faculty / Stream */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {doc.applicableFaculties.map((f, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 border border-gray-200">
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Programs Identified */}
                      <td className="px-4 py-3.5">
                        {isProcessing ? (
                          <span className="text-blue-600 font-medium text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            Detecting programs...
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {doc.programsIdentified.map((p, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Uploaded Date */}
                      <td className="px-4 py-3.5 text-gray-600 font-mono text-[11px]">
                        {doc.uploadedDate}
                      </td>

                      {/* Extraction Status */}
                      <td className="px-4 py-3.5">
                        {getExtractionBadge(doc.extractionStatus)}
                      </td>

                      {/* Verification Status */}
                      <td className="px-4 py-3.5">
                        {getVerificationBadge(doc.verificationStatus)}
                      </td>

                      {/* Actions (Section 3: View, Analyse/Re-analyse, Review Extracted Data, Download Original, Delete) */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Review Extracted Data (Primary Action) */}
                          <button
                            onClick={() => onReviewExtractedData(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                            title="Review Extracted Data & Approvals"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            Review
                          </button>

                          {/* Re-analyse */}
                          <button
                            onClick={() => onReanalyse(doc)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Re-run AI Analysis"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Download Original */}
                          <a
                            href={doc.file.fileUrl}
                            download={doc.file.fileName}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                            title={`Download Original (${doc.file.fileName})`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmTarget(doc)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Calendar Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50/50 text-xs text-gray-600">
          <div>
            Showing {(currentPage - 1) * showPerPage + 1} to{' '}
            {Math.min(currentPage * showPerPage, filteredDocuments.length)} of{' '}
            {filteredDocuments.length} documents
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded text-xs font-semibold cursor-pointer ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Delete University Calendar</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirmTarget.calendarTitle}"</span>?
              All associated AI extracted events, duplicate flags, and source reference traces will be removed.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteDocument(deleteConfirmTarget.id);
                  setDeleteConfirmTarget(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
