import React from 'react';
import { Calendar, FileText, Bookmark, ArrowUpRight } from 'lucide-react';
import { Timetable } from '../../../types/timetable';
import { initialTimetables } from '../../../data/mockTimetableData';

export interface TimetableBlockProps {
  title?: string;
  description?: string;
  view?: 'card' | 'grid';
  cardStyle?: 'style-1' | 'style-2';
  showFields?: {
    title?: boolean;
    file?: boolean;
    branch?: boolean;
    semester?: boolean;
    download?: boolean;
    year?: boolean;
  };
  timetables?: Timetable[];
}

export const TimetableBlock: React.FC<TimetableBlockProps> = ({
  title = 'Academic Timetables',
  description = 'Download the latest timetables for your academic year.',
  view = 'card',
  cardStyle = 'style-1',
  showFields = { title: true, file: true, branch: true, semester: true, download: true, year: true },
  timetables = initialTimetables
}) => {
  const displayedTimetables = timetables;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
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
          displayedTimetables.map(timetable => {
            
            // --- Style 2 (Minimalist Card) ---
            if (cardStyle === 'style-2') {
              return (
                <div key={timetable.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                  <div className="bg-blue-50/50 p-3 rounded-2xl w-fit text-blue-700 mb-6 border border-blue-100/50">
                    <FileText className="w-6 h-6" />
                  </div>
                  
                  {showFields?.title && (
                    <h3 className="font-bold text-gray-900 text-lg mb-3">
                      {timetable.name} {showFields?.year ? timetable.year : ''}
                    </h3>
                  )}
                  
                  {showFields?.branch && (
                    <div className="mb-4">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {timetable.branch[0] || 'General'}
                      </span>
                    </div>
                  )}

                  <div className="mt-auto pt-6 flex justify-between items-center border-t border-gray-50">
                    {showFields?.download && (
                      <a href={timetable.fileUrl || '#'} className="text-blue-700 font-semibold text-sm flex items-center gap-1 hover:text-blue-800 transition-colors">
                        View PDF <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            // --- Style 1 (Default Card) ---
            return (
              <div key={timetable.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                      <Calendar className="w-8 h-8" />
                    </div>
                    {showFields?.year && (
                      <span className="font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        Year: {timetable.year}
                      </span>
                    )}
                  </div>
                  
                  {showFields?.title && (
                    <h3 className="font-bold text-gray-900 text-xl leading-tight mb-2">
                      {timetable.name}
                    </h3>
                  )}
                  
                  <div className="flex flex-col gap-1 mt-3">
                    {showFields?.branch && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium text-gray-900">Branch:</span> {timetable.branch.join(', ')}
                      </div>
                    )}
                    {showFields?.semester && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium text-gray-900">Semester:</span> {timetable.semester.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                
                {(showFields?.file || showFields?.download) && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                    {showFields?.file ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate max-w-[150px]">{timetable.fileName || 'Document'}</span>
                      </div>
                    ) : <div></div>}
                    
                    {showFields?.download && (
                      <a
                        href={timetable.fileUrl || '#'}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
