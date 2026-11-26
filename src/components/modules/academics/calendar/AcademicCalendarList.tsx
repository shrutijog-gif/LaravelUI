import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Plus, 
  Calendar, 
  FileText, 
  Eye, 
  Pencil, 
  Trash2, 
  UploadCloud, 
  CheckCircle2, 
  Archive, 
  MoreVertical, 
  AlertTriangle, 
  ExternalLink,
  Sparkles,
  Download,
  Filter,
  Layers,
  Building,
  GraduationCap
} from 'lucide-react';
import { 
  AcademicCalendar, 
  CalendarType, 
  CALENDAR_TYPES, 
  ACADEMIC_YEARS, 
  COLLEGE_DEPARTMENTS,
  CalendarStatus
} from '../../../../types/academicCalendar';

interface AcademicCalendarListProps {
  calendars: AcademicCalendar[];
  onAddCalendar: () => void;
  onEditCalendar: (calendar: AcademicCalendar) => void;
  onDeleteCalendar: (id: string) => void;
  onPublishCalendar: (id: string) => void;
  onArchiveCalendar: (id: string) => void;
  onOpenExtractionReview: (calendar: AcademicCalendar) => void;
  onUploadDocument: (calendar: AcademicCalendar) => void;
  onViewCalendarDetails: (calendar: AcademicCalendar) => void;
}

export const AcademicCalendarList: React.FC<AcademicCalendarListProps> = ({
  calendars,
  onAddCalendar,
  onEditCalendar,
  onDeleteCalendar,
  onPublishCalendar,
  onArchiveCalendar,
  onOpenExtractionReview,
  onUploadDocument,
  onViewCalendarDetails
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showPerPage, setShowPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<AcademicCalendar | null>(null);

  // Filter logic
  const filteredCalendars = calendars.filter(cal => {
    const matchesSearch = 
      cal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cal.calendarType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cal.department && cal.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cal.uploadedDocument && cal.uploadedDocument.fileName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesYear = selectedYear === 'All' || cal.academicYear === selectedYear;
    const matchesType = selectedType === 'All' || cal.calendarType === selectedType;
    const matchesDept = selectedDepartment === 'All' || cal.department === selectedDepartment;

    return matchesSearch && matchesYear && matchesType && matchesDept;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCalendars.length / showPerPage));
  const paginatedCalendars = filteredCalendars.slice(
    (currentPage - 1) * showPerPage,
    currentPage * showPerPage
  );

  const getStatusBadge = (status: CalendarStatus) => {
    switch (status) {
      case 'Published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Published
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Under Review
          </span>
        );
      case 'Archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            Archived
          </span>
        );
      case 'Draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Draft
          </span>
        );
    }
  };

  const getTypeBadge = (type: CalendarType) => {
    switch (type) {
      case 'University Calendar':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Building className="w-3 h-3 text-purple-600" />
            University
          </span>
        );
      case 'College Calendar':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <GraduationCap className="w-3 h-3 text-blue-600" />
            College
          </span>
        );
      case 'Department Calendar':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Layers className="w-3 h-3 text-teal-600" />
            Department
          </span>
        );
      case 'Semester / Term Calendar':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Calendar className="w-3 h-3 text-amber-600" />
            Semester/Term
          </span>
        );
    }
  };

  const publishedCount = calendars.filter(c => c.status === 'Published').length;
  const reviewCount = calendars.filter(c => c.status === 'Under Review').length;
  const totalEvents = calendars.reduce((acc, c) => acc + (c.eventsCount || 0), 0);

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
        <span className="text-gray-800 font-semibold">Academic Calendar</span>
      </nav>

      {/* Page Header (Section 4) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">
              📅
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Academic Calendar
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage university, college and department academic schedules, terms and notifications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAddCalendar}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Calendar
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Calendars</span>
          <span className="text-xl font-bold text-gray-900 mt-1 block">{calendars.length}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Published Active</span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">{publishedCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">Under Review</span>
          <span className="text-xl font-bold text-amber-700 mt-1 block">{reviewCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Linked Milestones</span>
          <span className="text-xl font-bold text-blue-700 mt-1 block">{totalEvents}</span>
        </div>
      </div>

      {/* Filters & Search Toolbar (Section 4) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Academic Year Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={e => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Years</option>
              {ACADEMIC_YEARS.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Calendar Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Calendar Type
            </label>
            <select
              value={selectedType}
              onChange={e => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              {CALENDAR_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={e => { setSelectedDepartment(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              {COLLEGE_DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
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
                placeholder="Search calendar name, file..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Active Filter Clear Info */}
        {(selectedYear !== 'All' || selectedType !== 'All' || selectedDepartment !== 'All' || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-600">
            <span>
              Showing {filteredCalendars.length} of {calendars.length} filtered calendars
            </span>
            <button
              onClick={() => {
                setSelectedYear('All');
                setSelectedType('All');
                setSelectedDepartment('All');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card (Section 4) */}
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
                <th className="px-4 py-3 min-w-[240px]">Calendar Name</th>
                <th className="px-4 py-3 min-w-[150px]">Calendar Type</th>
                <th className="px-4 py-3 min-w-[100px]">Academic Year</th>
                <th className="px-4 py-3 min-w-[110px]">Start Date</th>
                <th className="px-4 py-3 min-w-[110px]">End Date</th>
                <th className="px-4 py-3 min-w-[170px]">Uploaded Document</th>
                <th className="px-4 py-3 min-w-[110px]">Status</th>
                <th className="px-4 py-3 min-w-[140px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedCalendars.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">No academic calendars match your filters.</p>
                    <p className="text-xs text-gray-400 mt-0.5">Try clearing filter parameters or click "Add Calendar" to create a new one.</p>
                  </td>
                </tr>
              ) : (
                paginatedCalendars.map(cal => {
                  return (
                    <tr key={cal.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Calendar Name */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900 leading-snug">
                          {cal.name}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                          {cal.department && (
                            <span className="text-teal-700 font-medium">
                              Dept: {cal.department}
                            </span>
                          )}
                          {cal.eventsCount > 0 && (
                            <span className="text-blue-600 font-semibold">
                              • {cal.eventsCount} events linked
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Calendar Type */}
                      <td className="px-4 py-3.5">
                        {getTypeBadge(cal.calendarType)}
                      </td>

                      {/* Academic Year */}
                      <td className="px-4 py-3.5 font-medium text-gray-800">
                        {cal.academicYear}
                      </td>

                      {/* Start Date */}
                      <td className="px-4 py-3.5 text-gray-700 font-mono">
                        {cal.startDate}
                      </td>

                      {/* End Date */}
                      <td className="px-4 py-3.5 text-gray-700 font-mono">
                        {cal.endDate}
                      </td>

                      {/* Uploaded Document */}
                      <td className="px-4 py-3.5">
                        {cal.uploadedDocument ? (
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                              {cal.uploadedDocument.fileType}
                            </span>
                            <div className="min-w-0 max-w-[130px]">
                              <a
                                href={cal.uploadedDocument.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 truncate block hover:underline"
                                title={cal.uploadedDocument.fileName}
                              >
                                {cal.uploadedDocument.fileName}
                              </a>
                              <span className="text-[10px] text-gray-400 block">
                                {cal.uploadedDocument.fileSize}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Manual / No Document
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {getStatusBadge(cal.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View details */}
                          <button
                            onClick={() => onViewCalendarDetails(cal)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="View Calendar Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditCalendar(cal)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Edit Calendar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Upload / Replace Document */}
                          <button
                            onClick={() => onUploadDocument(cal)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Upload / Replace Document"
                          >
                            <UploadCloud className="w-4 h-4" />
                          </button>

                          {/* Extraction Review (if doc exists) */}
                          {cal.uploadedDocument && (
                            <button
                              onClick={() => onOpenExtractionReview(cal)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Review & Verify Extracted Events"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          )}

                          {/* Publish toggle */}
                          {cal.status !== 'Published' && (
                            <button
                              onClick={() => onPublishCalendar(cal.id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Publish Calendar"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Archive toggle */}
                          {cal.status !== 'Archived' && (
                            <button
                              onClick={() => onArchiveCalendar(cal.id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Archive Calendar"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmTarget(cal)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Calendar"
                          >
                            <Trash2 className="w-4 h-4" />
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
            {Math.min(currentPage * showPerPage, filteredCalendars.length)} of{' '}
            {filteredCalendars.length} calendars
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
              <h3 className="text-base font-bold text-gray-900">Delete Calendar</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirmTarget.name}"</span>?
              All associated events and extraction records will be permanently removed.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteCalendar(deleteConfirmTarget.id);
                  setDeleteConfirmTarget(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer"
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
