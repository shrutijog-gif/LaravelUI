import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Plus, 
  Calendar, 
  Eye, 
  Pencil, 
  Trash2, 
  Filter, 
  Layers, 
  Building, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  Tag,
  BookOpen
} from 'lucide-react';
import { 
  CalendarEvent, 
  CalendarEventCategory, 
  CALENDAR_EVENT_CATEGORIES, 
  ApplicabilityScope, 
  APPLICABILITY_SCOPES, 
  COLLEGE_DEPARTMENTS, 
  EventStatus,
  AcademicCalendar
} from '../../../../types/academicCalendar';

interface ManageCalendarEventsProps {
  events: CalendarEvent[];
  calendars: AcademicCalendar[];
  onAddEvent: (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  onEditEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
}

export const ManageCalendarEvents: React.FC<ManageCalendarEventsProps> = ({
  events,
  calendars,
  onAddEvent,
  onEditEvent,
  onDeleteEvent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCalendarSource, setSelectedCalendarSource] = useState('All');
  const [selectedApplicability, setSelectedApplicability] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showPerPage, setShowPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<CalendarEvent | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CalendarEventCategory>('Academic Activity');
  const [calendarId, setCalendarId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [applicabilityType, setApplicabilityType] = useState<ApplicabilityScope>('Entire College');
  const [deptValue, setDeptValue] = useState('');
  const [programValue, setProgramValue] = useState('');
  const [semesterValue, setSemesterValue] = useState('');
  const [subjectValue, setSubjectValue] = useState('');
  const [status, setStatus] = useState<EventStatus>('Scheduled');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtering
  const filteredEvents = events.filter(evt => {
    const matchesSearch = 
      evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.calendarName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.applicability.department && evt.applicability.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesSource = selectedCalendarSource === 'All' || evt.calendarId === selectedCalendarSource;
    const matchesScope = selectedApplicability === 'All' || evt.applicability.type === selectedApplicability;
    const matchesStatus = selectedStatus === 'All' || evt.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesSource && matchesScope && matchesStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / showPerPage));
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * showPerPage,
    currentPage * showPerPage
  );

  const openAddModal = () => {
    setEditingEvent(null);
    setName('');
    setCategory('Academic Activity');
    setCalendarId(calendars[0]?.id || 'manual');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setApplicabilityType('Entire College');
    setDeptValue('');
    setProgramValue('');
    setSemesterValue('');
    setSubjectValue('');
    setStatus('Scheduled');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (evt: CalendarEvent) => {
    setEditingEvent(evt);
    setName(evt.name);
    setCategory(evt.category);
    setCalendarId(evt.calendarId);
    setStartDate(evt.startDate);
    setEndDate(evt.endDate);
    setDescription(evt.description);
    setApplicabilityType(evt.applicability.type);
    setDeptValue(evt.applicability.department || '');
    setProgramValue(evt.applicability.program || '');
    setSemesterValue(evt.applicability.semester || '');
    setSubjectValue(evt.applicability.subject || '');
    setStatus(evt.status);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Event name is required';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!endDate) errs.endDate = 'End date is required';
    if (startDate && endDate && startDate > endDate) {
      errs.endDate = 'End date cannot be earlier than start date';
    }
    if (applicabilityType === 'Selected Department' && !deptValue) {
      errs.deptValue = 'Please select the target department';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const matchedCal = calendars.find(c => c.id === calendarId);
    const calName = matchedCal ? matchedCal.name : 'Manual Entry';

    const eventPayload: Omit<CalendarEvent, 'id' | 'createdAt'> = {
      calendarId,
      calendarName: calName,
      name: name.trim(),
      category,
      startDate,
      endDate,
      description: description.trim(),
      applicability: {
        type: applicabilityType,
        department: deptValue || undefined,
        program: programValue || undefined,
        semester: semesterValue || undefined,
        subject: subjectValue || undefined
      },
      status,
      verificationStatus: 'Verified'
    };

    if (editingEvent) {
      onEditEvent(editingEvent.id, eventPayload);
    } else {
      onAddEvent(eventPayload);
    }
    setIsModalOpen(false);
  };

  const getCategoryColor = (cat: CalendarEventCategory) => {
    switch (cat) {
      case 'University Examination':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'College Examination':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Holiday':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Vacation':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Workshop':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Seminar':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Cultural Activity':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Sports Activity':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Admission Activity':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Academic Activity':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Department Event':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Other':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getApplicabilityDisplay = (app: CalendarEvent['applicability']) => {
    switch (app.type) {
      case 'Entire College':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            Entire College
          </span>
        );
      case 'Selected Department':
        return (
          <span className="inline-flex items-center gap-1 text-teal-700 font-semibold text-xs">
            <Layers className="w-3.5 h-3.5 text-teal-500" />
            {app.department || 'Selected Dept'}
          </span>
        );
      case 'Selected Program':
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 font-semibold text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
            {app.program || 'Selected Program'}
          </span>
        );
      case 'Selected Semester':
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            {app.semester || 'Selected Sem'}
          </span>
        );
      case 'Specific Subject':
        return (
          <span className="inline-flex items-center gap-1 text-purple-700 font-semibold text-xs">
            <BookOpen className="w-3.5 h-3.5 text-purple-500" />
            {app.subject || 'Specific Subject'}
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
        <span className="text-gray-800 font-semibold">Manage Calendar Events</span>
      </nav>

      {/* Header (Section 8) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
              📌
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Manage Calendar Events
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure individual academic activities, examinations, department workshops, and holidays with targeted applicability.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Filter Bar (Section 8) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Event Category */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {CALENDAR_EVENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Calendar Source */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Calendar Source
            </label>
            <select
              value={selectedCalendarSource}
              onChange={e => { setSelectedCalendarSource(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Calendars</option>
              {calendars.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Applicability Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Applicability
            </label>
            <select
              value={selectedApplicability}
              onChange={e => { setSelectedApplicability(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Scopes</option>
              {APPLICABILITY_SCOPES.map(scope => (
                <option key={scope} value={scope}>{scope}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Postponed">Postponed</option>
              <option value="Cancelled">Cancelled</option>
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
                placeholder="Search event name, desc..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Active Filter Clear Info */}
        {(selectedCategory !== 'All' || selectedCalendarSource !== 'All' || selectedApplicability !== 'All' || selectedStatus !== 'All' || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-600">
            <span>Showing {filteredEvents.length} of {events.length} filtered events</span>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedCalendarSource('All');
                setSelectedApplicability('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Structured Events Table */}
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
            <span>events per page</span>
          </div>

          <div className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 border-collapse">
            <thead className="bg-gray-100/75 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 min-w-[220px]">Event Name</th>
                <th className="px-4 py-3 min-w-[150px]">Category</th>
                <th className="px-4 py-3 min-w-[180px]">Calendar Source</th>
                <th className="px-4 py-3 min-w-[110px]">Start Date</th>
                <th className="px-4 py-3 min-w-[110px]">End Date</th>
                <th className="px-4 py-3 min-w-[160px]">Applicability</th>
                <th className="px-4 py-3 min-w-[90px]">Status</th>
                <th className="px-4 py-3 min-w-[110px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">No events found matching your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedEvents.map(evt => {
                  return (
                    <tr key={evt.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Name & Snippet */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900 leading-snug">
                          {evt.name}
                        </div>
                        {evt.description && (
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            {evt.description}
                          </p>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getCategoryColor(evt.category)}`}>
                          {evt.category}
                        </span>
                      </td>

                      {/* Source Calendar */}
                      <td className="px-4 py-3.5 text-gray-600 font-medium truncate max-w-[200px]" title={evt.calendarName}>
                        {evt.calendarName}
                      </td>

                      {/* Start Date */}
                      <td className="px-4 py-3.5 text-gray-700 font-mono">
                        {evt.startDate}
                      </td>

                      {/* End Date */}
                      <td className="px-4 py-3.5 text-gray-700 font-mono">
                        {evt.endDate}
                      </td>

                      {/* Applicability */}
                      <td className="px-4 py-3.5">
                        {getApplicabilityDisplay(evt.applicability)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          evt.status === 'Scheduled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          evt.status === 'Completed' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                          evt.status === 'Postponed' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {evt.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingEvent(evt)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="View Event"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(evt)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Edit Event"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmTarget(evt)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Event"
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
            {Math.min(currentPage * showPerPage, filteredEvents.length)} of{' '}
            {filteredEvents.length} events
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

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold text-gray-900">
                {editingEvent ? 'Edit Calendar Event' : 'Add New Calendar Event'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Continuous Internal Evaluation (CIE-1)"
                  className={`w-full border rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? 'border-red-400 bg-red-50/20' : 'border-gray-300 bg-white'
                  }`}
                />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>

              {/* Category & Calendar Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as CalendarEventCategory)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CALENDAR_EVENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Calendar Source
                  </label>
                  <select
                    value={calendarId}
                    onChange={e => setCalendarId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">Stand-alone / Manual Event</option>
                    {calendars.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className={`w-full border rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.startDate ? 'border-red-400 bg-red-50/20' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {formErrors.startDate && <p className="text-xs text-red-500 mt-1">{formErrors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className={`w-full border rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.endDate ? 'border-red-400 bg-red-50/20' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {formErrors.endDate && <p className="text-xs text-red-500 mt-1">{formErrors.endDate}</p>}
                </div>
              </div>

              {/* Applicability Scope (Crucial Requirement: Section 8) */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                    Event Target Applicability Scope
                  </label>
                  <p className="text-[11px] text-gray-500 mb-2.5">
                    Define whether this event affects all college faculty/students or is restricted to a particular faculty/department.
                  </p>
                  <select
                    value={applicabilityType}
                    onChange={e => setApplicabilityType(e.target.value as ApplicabilityScope)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {APPLICABILITY_SCOPES.map(scope => (
                      <option key={scope} value={scope}>{scope}</option>
                    ))}
                  </select>
                </div>

                {/* Conditional Fields based on Applicability Scope */}
                {applicabilityType === 'Selected Department' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Target Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={deptValue}
                      onChange={e => setDeptValue(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {COLLEGE_DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {formErrors.deptValue && <p className="text-xs text-red-500 mt-1">{formErrors.deptValue}</p>}
                  </div>
                )}

                {applicabilityType === 'Selected Program' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                      <select
                        value={deptValue}
                        onChange={e => setDeptValue(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 bg-white"
                      >
                        <option value="">Select Department</option>
                        {COLLEGE_DEPARTMENTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Program Name</label>
                      <input
                        type="text"
                        value={programValue}
                        onChange={e => setProgramValue(e.target.value)}
                        placeholder="e.g. B.Tech Artificial Intelligence"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                )}

                {applicabilityType === 'Selected Semester' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Department / Stream</label>
                      <select
                        value={deptValue}
                        onChange={e => setDeptValue(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 bg-white"
                      >
                        <option value="">All Departments</option>
                        {COLLEGE_DEPARTMENTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Semester</label>
                      <input
                        type="text"
                        value={semesterValue}
                        onChange={e => setSemesterValue(e.target.value)}
                        placeholder="e.g. Semester 5 / Odd Semesters"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                )}

                {applicabilityType === 'Specific Subject' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                      <select
                        value={deptValue}
                        onChange={e => setDeptValue(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 bg-white"
                      >
                        <option value="">Select Department</option>
                        {COLLEGE_DEPARTMENTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Course / Subject Name</label>
                      <input
                        type="text"
                        value={subjectValue}
                        onChange={e => setSubjectValue(e.target.value)}
                        placeholder="e.g. CS501: Data Structures & Algorithms"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Description & Instructions
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide syllabus details, guest speaker information, venue, or participation guidelines..."
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Event Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Execution Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as EventStatus)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Postponed">Postponed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
              >
                {editingEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Event Details Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getCategoryColor(viewingEvent.category)}`}>
                  {viewingEvent.category}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {viewingEvent.startDate} {viewingEvent.startDate !== viewingEvent.endDate && `to ${viewingEvent.endDate}`}
                </span>
              </div>
              <button
                onClick={() => setViewingEvent(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">
              {viewingEvent.name}
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {viewingEvent.description || 'No additional description provided.'}
            </p>

            <div className="space-y-2 text-xs border-t border-gray-100 pt-3 text-gray-600">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Source Calendar:</span>
                <span className="font-medium text-gray-800">{viewingEvent.calendarName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Applicability Scope:</span>
                <span>{getApplicabilityDisplay(viewingEvent.applicability)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Status:</span>
                <span className="font-bold text-emerald-700">{viewingEvent.status}</span>
              </div>
              {viewingEvent.isExtracted && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Origin:</span>
                  <span className="text-indigo-600 font-medium">Extracted from Document</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setViewingEvent(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = viewingEvent;
                  setViewingEvent(null);
                  openEditModal(target);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
              >
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Delete Event</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirmTarget.name}"</span>?
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
                  onDeleteEvent(deleteConfirmTarget.id);
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
