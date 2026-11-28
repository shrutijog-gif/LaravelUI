import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Eye, 
  Download, 
  RefreshCw, 
  Trash2, 
  Plus, 
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  Filter
} from 'lucide-react';
import { 
  UniversityCalendarDocument 
} from '../../../../types/universityCalendar';

interface UploadedCalendarsScreenProps {
  documents: UniversityCalendarDocument[];
  onNavigateToUpload: () => void;
  onReviewData: (doc: UniversityCalendarDocument) => void;
  onReanalyse: (doc: UniversityCalendarDocument) => void;
  onDeleteDocument: (id: string) => void;
}

export const UploadedCalendarsScreen: React.FC<UploadedCalendarsScreenProps> = ({
  documents,
  onNavigateToUpload,
  onReviewData,
  onReanalyse,
  onDeleteDocument
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs-review' | 'verified'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.calendarTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.academicYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.circularNumber && doc.circularNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.programsIdentified.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'needs-review') {
      return doc.verificationStatus === 'Needs Review';
    }
    if (statusFilter === 'verified') {
      return doc.verificationStatus === 'Verified';
    }
    return true;
  });

  const totalDocuments = documents.length;
  const needsReviewCount = documents.filter(d => d.verificationStatus === 'Needs Review').length;
  const verifiedCount = documents.filter(d => d.verificationStatus === 'Verified').length;

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. Header with Primary Action: + Upload Academic Calendar           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Uploaded University Calendars
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {totalDocuments} {totalDocuments === 1 ? 'Calendar' : 'Calendars'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Manage, inspect and review previously uploaded university academic schedules and AI extracted records.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onNavigateToUpload}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Academic Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. Summary KPI Cards                                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Total Uploaded Calendars
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              {totalDocuments}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              Needs Review
            </span>
            <span className="text-2xl font-bold text-amber-700 mt-1 block">
              {needsReviewCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              Verified &amp; Approved
            </span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">
              {verifiedCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. Uploaded Calendars Listing Table                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex bg-gray-200/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({totalDocuments})
            </button>
            <button
              onClick={() => setStatusFilter('needs-review')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                statusFilter === 'needs-review'
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Needs Review ({needsReviewCount})
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                statusFilter === 'verified'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Verified ({verifiedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search university or calendar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 border-collapse">
            <thead className="bg-gray-100/70 text-gray-600 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 min-w-[220px]">University Name</th>
                <th className="px-4 py-3 min-w-[220px]">Calendar Title</th>
                <th className="px-4 py-3 min-w-[100px]">Academic Year</th>
                <th className="px-4 py-3 min-w-[110px]">Upload Date</th>
                <th className="px-4 py-3 min-w-[120px]">Extraction Status</th>
                <th className="px-4 py-3 min-w-[120px]">Verification Status</th>
                <th className="px-4 py-3 min-w-[150px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-500">
                    <FileText className="w-9 h-9 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">No university calendars found</p>
                    <p className="text-xs text-gray-400 mt-1">Upload a university academic calendar to begin AI analysis.</p>
                    <button
                      onClick={onNavigateToUpload}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Upload Calendar Now
                    </button>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* University Name */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-900 leading-tight">
                        {doc.universityName}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {doc.applicableFaculties?.join(', ') || 'Science & Technology'}
                      </div>
                    </td>

                    {/* Calendar Title & Circular */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-800 line-clamp-1">
                        {doc.calendarTitle}
                      </div>
                      {doc.circularNumber && (
                        <span className="inline-block text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mt-1 font-mono font-medium">
                          {doc.circularNumber}
                        </span>
                      )}
                    </td>

                    {/* Academic Year */}
                    <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                      {doc.academicYear}
                    </td>

                    {/* Upload Date */}
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {doc.uploadedDate}
                    </td>

                    {/* Extraction Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.extractionStatus === 'Extraction Completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : doc.extractionStatus === 'Processing'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200 animate-pulse'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.extractionStatus === 'Extraction Completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {doc.extractionStatus}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.verificationStatus === 'Verified'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : doc.verificationStatus === 'Needs Review'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.verificationStatus === 'Verified' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                        {doc.verificationStatus === 'Needs Review' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {doc.verificationStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Primary Review Data Action Button */}
                        <button
                          onClick={() => onReviewData(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
                          title="Open AI Extracted Structured Data Review"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review Data
                        </button>

                        {/* Download Original Document */}
                        <a
                          href={doc.file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={doc.file.fileName}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Download Original Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        {/* Re-analyse */}
                        <button
                          onClick={() => onReanalyse(doc)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Re-analyse Document"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirmId(doc.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-gray-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Delete University Calendar</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to delete this calendar and its AI extracted records?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDocument(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
