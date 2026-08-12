import React from 'react';
import { Calendar, FileText, Bookmark, ArrowUpRight } from 'lucide-react';
import { Timetable } from '../../../types/timetable';
import { initialTimetables } from '../../../data/mockTimetableData';

export interface TimetableBlockProps {
  title?: string;
  description?: string;
  view?: 'card' | 'grid';
  cardStyle?: 'style-1' | 'style-2' | 'style-3' | 'style-4';
  showFields?: {
    title?: boolean;
    file?: boolean;
    branch?: boolean;
    semester?: boolean;
    download?: boolean;
    year?: boolean;
  };
  timetables?: Timetable[];
  isPreview?: boolean;
}

export const TimetableBlock: React.FC<TimetableBlockProps> = ({
  title = 'Academic Timetables',
  description = 'Download the latest timetables for your academic year.',
  view = 'card',
  cardStyle = 'style-1',
  showFields = { title: true, file: true, branch: true, semester: true, download: true, year: true },
  timetables = initialTimetables,
  isPreview = false,
}) => {
  const displayedTimetables = timetables;

  return (
    <div className={isPreview ? "w-full p-1" : "max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"}>
      {(title || description) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}

      <div className={
        isPreview 
          ? cardStyle === 'style-4' 
            ? "w-full flex flex-col gap-4" 
            : "w-full max-w-[360px] mx-auto flex flex-col gap-4" 
          : cardStyle === 'style-4' 
            ? "flex flex-col gap-4" 
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      }>
        {displayedTimetables.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
            No timetables available at the moment.
          </div>
        ) : (
          displayedTimetables.map(timetable => {
            
            // --- Style 4 (Dual-Pane Split Card) ---
            if (cardStyle === 'style-4') {
              return (
                <div key={timetable.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col sm:flex-row group min-h-[140px] w-full">
                  {/* Left Pane (Accent Side) */}
                  <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-4 flex sm:flex-col justify-between items-center sm:items-start shrink-0 w-full sm:w-32">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/20">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    {showFields?.year && (
                      <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-full border border-white/30">
                        {timetable.year}
                      </span>
                    )}
                  </div>

                  {/* Right Pane (Content Area) */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white min-w-0">
                    <div>
                      {showFields?.title && (
                        <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                          {timetable.name}
                        </h3>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                        {showFields?.branch && (
                          <span>Branch: <strong className="text-gray-700 font-medium">{timetable.branch.join(', ')}</strong></span>
                        )}
                        {showFields?.semester && (
                          <span>• Sem: <strong className="text-gray-700 font-medium">{timetable.semester.join(', ')}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Bottom File & Action Bar */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      {showFields?.file ? (
                        <span className="text-xs text-gray-400 flex items-center gap-1.5 truncate max-w-[150px]">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{timetable.fileName || 'Document.pdf'}</span>
                        </span>
                      ) : <span />}

                      {showFields?.download && (
                        <a
                          href={timetable.fileUrl || '#'}
                          className="inline-flex items-center gap-1 bg-gray-900 group-hover:bg-blue-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-sm shrink-0"
                        >
                          Download <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // --- Style 3 (Modern Gradient Banner) ---
            if (cardStyle === 'style-3') {
              return (
                <div key={timetable.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col group">
                  {/* Top Gradient Banner */}
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-4 sm:p-5 text-white flex justify-between items-start">
                    {/* Left: Title & Branch */}
                    <div className="flex-1 pr-3 min-w-0">
                      {showFields?.title && (
                        <h3 className="font-bold text-base sm:text-lg leading-snug tracking-tight text-white">
                          {timetable.name}
                        </h3>
                      )}
                      {showFields?.branch && (
                        <p className="text-blue-100/90 text-xs font-medium mt-1">
                          {timetable.branch.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Right: Year Badge */}
                    {showFields?.year && (
                      <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30 shrink-0">
                        {timetable.year}
                      </span>
                    )}
                  </div>

                  {/* Body with good breathing room and height */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white">
                    {showFields?.semester && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Semester:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {timetable.semester.map(sem => (
                            <span key={sem} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-semibold">
                              Sem {sem}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      {showFields?.file ? (
                        <span className="text-xs text-gray-500 flex items-center gap-1.5 truncate max-w-[140px]">
                          <FileText className="w-4 h-4 shrink-0 text-gray-400" />
                          <span className="truncate">{timetable.fileName || 'Schedule.pdf'}</span>
                        </span>
                      ) : <span />}

                      {showFields?.download && (
                        <a
                          href={timetable.fileUrl || '#'}
                          className="inline-flex items-center gap-1 bg-gray-900 group-hover:bg-blue-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                          Download PDF <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // --- Style 2 (Minimalist Card) ---
            if (cardStyle === 'style-2') {
              return (
                <div key={timetable.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
                  <div>
                    <div className="bg-blue-50/70 p-2.5 rounded-xl w-fit text-blue-700 mb-4 border border-blue-100/50">
                      <FileText className="w-5 h-5" />
                    </div>
                    
                    {showFields?.title && (
                      <h3 className="font-bold text-gray-900 text-base mb-2">
                        {timetable.name} {showFields?.year ? `(${timetable.year})` : ''}
                      </h3>
                    )}
                    
                    {showFields?.branch && (
                      <div className="mb-3">
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {timetable.branch[0] || 'General'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-gray-50 mt-4">
                    {showFields?.download && (
                      <a href={timetable.fileUrl || '#'} className="text-blue-700 font-semibold text-xs flex items-center gap-1 hover:text-blue-800 transition-colors">
                        View PDF <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button className="w-7 h-7 flex items-center justify-center rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors">
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // --- Style 1 (Default Card) ---
            return (
              <div key={timetable.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
                <div className="p-4 sm:p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                      <Calendar className="w-6 h-6" />
                    </div>
                    {showFields?.year && (
                      <span className="font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px]">
                        Year: {timetable.year}
                      </span>
                    )}
                  </div>
                  
                  {showFields?.title && (
                    <h3 className="font-bold text-gray-900 text-base leading-snug mb-2">
                      {timetable.name}
                    </h3>
                  )}
                  
                  <div className="flex flex-col gap-1 mt-2 text-xs">
                    {showFields?.branch && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="font-medium text-gray-900">Branch:</span> {timetable.branch.join(', ')}
                      </div>
                    )}
                    {showFields?.semester && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="font-medium text-gray-900">Semester:</span> {timetable.semester.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                
                {(showFields?.file || showFields?.download) && (
                  <div className="bg-gray-50/80 px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                    {showFields?.file ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate max-w-[130px]">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{timetable.fileName || 'Document'}</span>
                      </div>
                    ) : <div />}
                    
                    {showFields?.download && (
                      <a
                        href={timetable.fileUrl || '#'}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-xs transition-colors"
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

