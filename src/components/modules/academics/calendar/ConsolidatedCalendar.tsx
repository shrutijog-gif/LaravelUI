import React, { useState } from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Layers, 
  Building, 
  GraduationCap, 
  Clock, 
  Eye, 
  Printer, 
  Download,
  Info,
  X,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { 
  CalendarEvent, 
  AcademicCalendar, 
  CalendarEventCategory, 
  CALENDAR_EVENT_CATEGORIES, 
  COLLEGE_DEPARTMENTS, 
  CALENDAR_TYPES,
  CalendarType,
  ACADEMIC_YEARS
} from '../../../../types/academicCalendar';

interface ConsolidatedCalendarProps {
  events: CalendarEvent[];
  calendars: AcademicCalendar[];
}

type CalendarViewMode = 'month' | 'week' | 'list';

export const ConsolidatedCalendar: React.FC<ConsolidatedCalendarProps> = ({
  events,
  calendars
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  
  // Date navigation state
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 6, 1)); // Default to July 2026
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Filters (Section 9)
  const [selectedYear, setSelectedYear] = useState('2026-2027');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 6, 15)); // Center around academic start
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter events
  const filteredEvents = events.filter(evt => {
    // Only published calendar events or standalone
    const parentCal = calendars.find(c => c.id === evt.calendarId);
    if (parentCal && parentCal.status !== 'Published' && parentCal.status !== 'Under Review') {
      return false;
    }

    if (selectedYear !== 'All' && parentCal && parentCal.academicYear !== selectedYear) {
      return false;
    }

    if (selectedType !== 'All' && parentCal && parentCal.calendarType !== selectedType) {
      return false;
    }

    if (selectedDept !== 'All' && evt.applicability.department && evt.applicability.department !== selectedDept) {
      return false;
    }

    if (selectedProgram && evt.applicability.program && !evt.applicability.program.toLowerCase().includes(selectedProgram.toLowerCase())) {
      return false;
    }

    if (selectedSemester && evt.applicability.semester && !evt.applicability.semester.toLowerCase().includes(selectedSemester.toLowerCase())) {
      return false;
    }

    if (selectedCategory !== 'All' && evt.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const getCategoryColor = (cat: CalendarEventCategory) => {
    switch (cat) {
      case 'University Examination':
        return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-600' };
      case 'College Examination':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', dot: 'bg-indigo-600' };
      case 'Holiday':
        return { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', dot: 'bg-rose-600' };
      case 'Vacation':
        return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-600' };
      case 'Workshop':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-600' };
      case 'Seminar':
        return { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300', dot: 'bg-cyan-600' };
      case 'Cultural Activity':
        return { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300', dot: 'bg-pink-600' };
      case 'Sports Activity':
        return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-600' };
      case 'Admission Activity':
        return { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300', dot: 'bg-teal-600' };
      case 'Academic Activity':
        return { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300', dot: 'bg-sky-600' };
      case 'Department Event':
        return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-600' };
      case 'Other':
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', dot: 'bg-gray-600' };
    }
  };

  // Helper to test if date falls within event start and end
  const getEventsForDate = (dateStr: string) => {
    return filteredEvents.filter(evt => {
      return dateStr >= evt.startDate && dateStr <= evt.endDate;
    });
  };

  // Build Monthly Grid days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Trailing previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      events: getEventsForDate(dateStr)
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      events: getEventsForDate(dateStr)
    });
  }

  // Leading next month days
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      events: getEventsForDate(dateStr)
    });
  }

  // Build Weekly View days
  const currDayOfWeek = currentDate.getDay();
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currDayOfWeek);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    weekDays.push({
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      dateNumber: d.getDate(),
      dateStr,
      events: getEventsForDate(dateStr)
    });
  }

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
        <span className="text-gray-800 font-semibold">Consolidated Calendar</span>
      </nav>

      {/* Header & Controls (Section 9) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-sm shrink-0">
              🗓️
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Consolidated Academic Calendar
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Unified institutional timeline combining university exam notifications, college schedules, and departmental activities.
              </p>
            </div>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekly View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer transition-colors"
            title="Print Calendar"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Bar (Section 9) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Academic Year */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Years</option>
              {ACADEMIC_YEARS.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Calendar Type */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Calendar Type
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              {CALENDAR_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              {COLLEGE_DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Program */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Program
            </label>
            <input
              type="text"
              placeholder="Filter program..."
              value={selectedProgram}
              onChange={e => setSelectedProgram(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Semester
            </label>
            <input
              type="text"
              placeholder="e.g. Sem 1 / Odd"
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>

          {/* Event Category */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {CALENDAR_EVENT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend strip */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-[11px]">
          <span className="font-semibold text-gray-500">Categories:</span>
          {CALENDAR_EVENT_CATEGORIES.slice(0, 7).map(c => {
            const colors = getCategoryColor(c);
            return (
              <span key={c} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-gray-700">
                <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
                {c}
              </span>
            );
          })}
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          {/* Navigation Month Header */}
          <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-gray-900">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={handleToday}
                className="text-xs font-semibold px-2.5 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Month Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-100/60 text-center text-[11px] font-bold text-gray-600 uppercase py-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-200 bg-gray-200">
            {calendarDays.map((cell, idx) => {
              return (
                <div
                  key={idx}
                  className={`min-h-[105px] p-1.5 flex flex-col justify-between ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-gray-50/70 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      cell.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {cell.dayNumber}
                    </span>
                    {cell.events.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center">
                        {cell.events.length}
                      </span>
                    )}
                  </div>

                  {/* Event Pills */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[75px]">
                    {cell.events.slice(0, 3).map(evt => {
                      const colors = getCategoryColor(evt.category);
                      return (
                        <button
                          key={evt.id}
                          type="button"
                          onClick={() => setSelectedEvent(evt)}
                          title={`${evt.name} (${evt.calendarName})`}
                          className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium border truncate block cursor-pointer transition-transform hover:scale-[1.02] ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {evt.name}
                        </button>
                      );
                    })}
                    {cell.events.length > 3 && (
                      <span className="text-[9px] font-semibold text-blue-600 block pl-1">
                        +{cell.events.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly View */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              Week of {weekDays[0].dateStr} to {weekDays[6].dateStr}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 divide-x divide-gray-200 min-h-[420px]">
            {weekDays.map((col, idx) => {
              return (
                <div key={idx} className="p-3 bg-white flex flex-col space-y-2">
                  <div className="text-center border-b border-gray-100 pb-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase block">
                      {col.dayName}
                    </span>
                    <span className="text-base font-bold text-gray-900 block mt-0.5">
                      {col.dateNumber}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {col.events.length === 0 ? (
                      <span className="text-[10px] text-gray-400 block text-center mt-4">
                        No events
                      </span>
                    ) : (
                      col.events.map(evt => {
                        const colors = getCategoryColor(evt.category);
                        return (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer hover:shadow-xs transition-shadow ${colors.bg} ${colors.border}`}
                          >
                            <span className={`text-[9px] font-bold uppercase tracking-wider block ${colors.text}`}>
                              {evt.category}
                            </span>
                            <span className="font-semibold text-gray-900 block mt-0.5 line-clamp-2">
                              {evt.name}
                            </span>
                            <span className="text-[10px] text-gray-500 block mt-1 truncate">
                              Src: {evt.calendarName}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List / Agenda View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              Chronological Academic Milestones & Events ({filteredEvents.length} items)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead className="bg-gray-100/75 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 min-w-[120px]">Date Range</th>
                  <th className="px-4 py-3 min-w-[220px]">Event Name</th>
                  <th className="px-4 py-3 min-w-[150px]">Category</th>
                  <th className="px-4 py-3 min-w-[180px]">Calendar Source</th>
                  <th className="px-4 py-3 min-w-[160px]">Applicability</th>
                  <th className="px-4 py-3 w-16 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No events found for current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map(evt => {
                    const colors = getCategoryColor(evt.category);
                    return (
                      <tr key={evt.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-gray-800 font-medium">
                          {evt.startDate} {evt.startDate !== evt.endDate && `to ${evt.endDate}`}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900">
                          {evt.name}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {evt.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 font-medium truncate max-w-[220px]" title={evt.calendarName}>
                          {evt.calendarName}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-gray-700">
                            {evt.applicability.type}
                            {evt.applicability.department && ` › ${evt.applicability.department}`}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedEvent(evt)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Details Popover Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getCategoryColor(selectedEvent.category).bg} ${getCategoryColor(selectedEvent.category).text} ${getCategoryColor(selectedEvent.category).border}`}>
                {selectedEvent.category}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">
              {selectedEvent.name}
            </h3>

            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 leading-relaxed">
              {selectedEvent.description || 'No additional event details provided.'}
            </p>

            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Scheduled Date:</span>
                <span className="font-mono text-gray-900">
                  {selectedEvent.startDate} {selectedEvent.startDate !== selectedEvent.endDate && `to ${selectedEvent.endDate}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Source Calendar:</span>
                <span className="text-blue-700 font-medium truncate max-w-[220px]" title={selectedEvent.calendarName}>
                  {selectedEvent.calendarName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Target Applicability:</span>
                <span className="font-medium text-gray-900">
                  {selectedEvent.applicability.type}
                  {selectedEvent.applicability.department && ` (${selectedEvent.applicability.department})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Status:</span>
                <span className="font-bold text-emerald-700">{selectedEvent.status}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
