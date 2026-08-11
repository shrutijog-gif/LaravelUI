import React from 'react';
import { Calendar, FileText } from 'lucide-react';
import { Timetable } from '../../../types/timetable';
import { initialTimetables } from '../../../data/mockTimetableData';

export interface TimetableBlockProps {
  title?: string;
  description?: string;
  yearFilter?: string;
  timetables?: Timetable[];
}

export const TimetableBlock: React.FC<TimetableBlockProps> = ({
  title = 'Academic Timetables',
  description = 'Download the latest timetables for your academic year.',
  yearFilter,
  timetables = initialTimetables
}) => {
  const displayedTimetables = yearFilter
    ? timetables.filter(t => t.year.toString() === yearFilter)
    : timetables;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-lg text-gray-500">
            {description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTimetables.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
            No timetables available at the moment.
          </div>
        ) : (
          displayedTimetables.map(timetable => (
            <div key={timetable.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <span className="font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                    Year: {timetable.year}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-xl leading-tight mb-2">
                  {timetable.name}
                </h3>
                
                <div className="flex flex-col gap-1 mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Branch:</span> {timetable.branch.join(', ')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Semester:</span> {timetable.semester.join(', ')}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[150px]">{timetable.fileName || 'Document'}</span>
                </div>
                <a
                  href={timetable.fileUrl || '#'}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
