import React, { useState } from 'react';
import { Search, Edit2, Trash2, FileText, MoreHorizontal } from 'lucide-react';
import { Timetable } from '../../../../types/timetable';

interface TimetableListProps {
  timetables: Timetable[];
  onAdd: () => void;
  onEdit: (timetable: Timetable) => void;
  onDelete: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export const TimetableList: React.FC<TimetableListProps> = ({
  timetables,
  onAdd,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCount, setShowCount] = useState('10');
  const [yearFilter, setYearFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const startYear = currentYear + i;
    const endYear = (startYear + 1).toString().slice(-2);
    return `${startYear}-${endYear}`;
  });
  const branchOptions = ['BCA', 'BBA', 'B.Com', 'B.Tech', 'MBA'];

  const filteredTimetables = timetables.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter ? t.year === yearFilter : true;
    const matchesBranch = branchFilter ? t.branch.includes(branchFilter) : true;
    
    return matchesSearch && matchesYear && matchesBranch;
  });

  return (
    <div className="space-y-4">
      {/* Page Header (Outside the card) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Timetables</h1>
        <button
          onClick={onAdd}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium text-sm px-5 py-2 rounded shadow-sm transition-colors"
        >
          Add Timetable
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show :</span>
            <select
              value={showCount}
              onChange={(e) => setShowCount(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full sm:w-auto border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white min-w-[140px]"
            >
              <option value="">All Years</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full sm:w-auto border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white min-w-[140px]"
            >
              <option value="">All Branches</option>
              {branchOptions.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 text-sm rounded pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-4 px-5">Timetable Name</th>
                <th className="py-4 px-5">Academic Year</th>
                <th className="py-4 px-5">Branch</th>
                <th className="py-4 px-5">Semester</th>
                <th className="py-4 px-5">Section</th>
                <th className="py-4 px-5">File</th>
                <th className="py-4 px-5">Show on Website</th>
                <th className="py-4 px-5 w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredTimetables.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No timetables found.
                  </td>
                </tr>
              ) : (
                filteredTimetables.map(timetable => (
                  <tr key={timetable.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-5 text-gray-800">
                      {timetable.name}
                    </td>
                    <td className="py-4 px-5 text-gray-600">
                      {timetable.year}
                    </td>
                    <td className="py-4 px-5 text-gray-600">
                      {timetable.branch.join(', ')}
                    </td>
                    <td className="py-4 px-5 text-gray-600">
                      {timetable.semester.join(', ')}
                    </td>
                    <td className="py-4 px-5 text-gray-600">
                      {timetable.section?.join(', ') || '-'}
                    </td>
                    <td className="py-4 px-5 text-gray-600">
                      {timetable.fileName ? (
                        <a 
                          href={timetable.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 group hover:text-blue-600 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
                          <span className="truncate max-w-[150px] underline-offset-2 underline" title={timetable.fileName}>
                            {timetable.fileName}
                          </span>
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleStatus && onToggleStatus(timetable.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                            timetable.showOnWebsite ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          title="Click to toggle visibility"
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              timetable.showOnWebsite ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-medium ${timetable.showOnWebsite ? 'text-blue-600' : 'text-gray-500'}`}>
                          {timetable.showOnWebsite ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(timetable)}
                          className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(timetable.id)}
                          className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Static Mock) */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors" disabled>
              &lt;
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-blue-600 bg-blue-600 text-white font-medium shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
