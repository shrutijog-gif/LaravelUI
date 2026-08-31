import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Bookmark, ArrowUpRight } from 'lucide-react';
import { Timetable } from '../../../types/timetable';
import { getStoredTimetables } from '../../../data/mockTimetableData';
import { getStoredCardPresets, CardSlotConfig } from '../../../utils/cardPresets';
import { CardPresetView } from '../../modules/developer/CardPresetView';

export interface TimetableBlockProps {
  title?: string;
  description?: string;
  view?: 'card' | 'grid' | 'table';
  cardStyle?: string;
  tableStyle?: string;
  columns?: 2 | 3 | 4;
  className?: string;
  anchorId?: string;
  showFields?: {
    title?: boolean;
    file?: boolean;
    branch?: boolean;
    semester?: boolean;
    download?: boolean;
    year?: boolean;
    icon?: boolean;
  };
  timetables?: Timetable[];
  isPreview?: boolean;
}

export const TimetableBlock: React.FC<TimetableBlockProps> = ({
  title = 'Academic Timetables',
  description = 'Download the latest timetables for your academic year.',
  view = 'card',
  cardStyle = 'style-1',
  tableStyle,
  columns = 3,
  className = '',
  anchorId = '',
  showFields = { title: true, file: true, branch: true, semester: true, download: true, year: true },
  timetables,
  isPreview = false,
}) => {
  const [liveTimetables, setLiveTimetables] = useState<Timetable[]>(() => getStoredTimetables());

  useEffect(() => {
    const handleUpdate = () => {
      setLiveTimetables(getStoredTimetables());
    };

    window.addEventListener('timetable-data-updated', handleUpdate);
    window.addEventListener('tenant-changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('timetable-data-updated', handleUpdate);
      window.removeEventListener('tenant-changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const sourceTimetables = timetables && timetables.length > 0 ? timetables : liveTimetables;
  const displayedTimetables = sourceTimetables.filter(t => t.showOnWebsite !== false);
  const selectedStyle = cardStyle || 'style-1';
  const isTableView = view === 'table' || selectedStyle.startsWith('table-');
  const activeTableStyle = selectedStyle.startsWith('table-') 
    ? selectedStyle 
    : (tableStyle || 'table-1');

  const getValidFileUrl = (url?: string) => {
    if (url && url.trim() !== '' && url !== '#') {
      return url;
    }
    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  };

  const renderContent = () => {
    if (displayedTimetables.length === 0) {
      return (
        <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
          No timetables available at the moment.
        </div>
      );
    }

    if (isTableView) {
      /* Table Style 3 (Modern Gradient Table Header) */
      if (activeTableStyle === 'table-3') {
        return (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-bold uppercase tracking-wider">
                  {showFields?.title && <th className="py-4 px-4 sm:px-6">Timetable Name</th>}
                  {showFields?.year && <th className="py-4 px-4">Year</th>}
                  {showFields?.branch && <th className="py-4 px-4">Branch</th>}
                  {showFields?.semester && <th className="py-4 px-4">Semester</th>}
                  {(showFields?.file || showFields?.download) && <th className="py-4 px-4 sm:px-6 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {displayedTimetables.map(timetable => (
                  <tr key={timetable.id} className="hover:bg-blue-50/40 transition-colors group">
                    {showFields?.title && (
                      <td className="py-4 px-4 sm:px-6 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {timetable.name}
                      </td>
                    )}
                    {showFields?.year && (
                      <td className="py-4 px-4 text-gray-600 font-medium">
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-1 rounded-full font-bold shadow-2xs">
                          {timetable.year}
                        </span>
                      </td>
                    )}
                    {showFields?.branch && (
                      <td className="py-4 px-4 text-gray-600">
                        {timetable.branch?.length > 0 ? timetable.branch.join(', ') : '—'}
                      </td>
                    )}
                    {showFields?.semester && (
                      <td className="py-4 px-4">
                        {timetable.semester?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {timetable.semester.map(sem => (
                              <span key={sem} className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">
                                {sem}
                              </span>
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                    )}
                    {(showFields?.file || showFields?.download) && (
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {showFields?.download && (
                          <a
                            href={getValidFileUrl(timetable.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-gray-900 group-hover:bg-blue-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                          >
                            Download PDF <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      /* Table Style 2 (Bordered Row Cards Table) */
      if (activeTableStyle === 'table-2') {
        return (
          <div className="flex flex-col gap-3 w-full">
            {displayedTimetables.map(timetable => (
              <a
                key={timetable.id}
                href={getValidFileUrl(timetable.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  {showFields?.icon !== false && (
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shrink-0 shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    {showFields?.title && (
                      <h4 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                        {timetable.name}
                      </h4>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                      {showFields?.year && (
                        <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-100">
                          {timetable.year}
                        </span>
                      )}
                      {showFields?.branch && timetable.branch?.length > 0 && <span>Branch: {timetable.branch.join(', ')}</span>}
                      {showFields?.semester && timetable.semester?.length > 0 && <span>• Sem: {timetable.semester.join(', ')}</span>}
                    </div>
                  </div>
                </div>

                {showFields?.download && (
                  <span className="inline-flex items-center gap-1 bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0 self-end sm:self-center shadow-2xs">
                    View Document <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </a>
            ))}
          </div>
        );
      }

      /* Table Style 1 (Classic Clean Table) */
      return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200">
                {showFields?.title && <th className="py-3.5 px-4 sm:px-6">Timetable Name</th>}
                {showFields?.year && <th className="py-3.5 px-4">Year</th>}
                {showFields?.branch && <th className="py-3.5 px-4">Branch</th>}
                {showFields?.semester && <th className="py-3.5 px-4">Semester</th>}
                {(showFields?.file || showFields?.download) && <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {displayedTimetables.map(timetable => (
                <tr key={timetable.id} className="hover:bg-gray-50/80 transition-colors group">
                  {showFields?.title && (
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {timetable.name}
                    </td>
                  )}
                  {showFields?.year && (
                    <td className="py-3.5 px-4 text-gray-600 text-xs font-bold">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {timetable.year}
                      </span>
                    </td>
                  )}
                  {showFields?.branch && (
                    <td className="py-3.5 px-4 text-gray-600 text-xs">
                      {timetable.branch?.length > 0 ? timetable.branch.join(', ') : '—'}
                    </td>
                  )}
                  {showFields?.semester && (
                    <td className="py-3.5 px-4 text-gray-600 text-xs">
                      {timetable.semester?.length > 0 ? `Sem ${timetable.semester.join(', ')}` : '—'}
                    </td>
                  )}
                  {(showFields?.file || showFields?.download) && (
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      {showFields?.download && (
                        <a
                          href={getValidFileUrl(timetable.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-xs font-bold inline-flex items-center gap-1"
                        >
                          Download <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const cardPresets = getStoredCardPresets();
    const matchedPreset = cardPresets.find(p => p.id === selectedStyle);

    /* CARD VIEWS - Dynamic Slot Preset Rendering */
    return (
      <div className={
        isPreview 
          ? "w-full flex flex-col gap-4" 
          : cardStyle === 'style-4' 
            ? columns === 2 
              ? "grid grid-cols-1 md:grid-cols-2 gap-4" 
              : columns === 4 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" 
                : "flex flex-col gap-4" 
            : columns === 2 
              ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
              : columns === 4 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" 
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      }>
        {displayedTimetables.map(timetable => {
          if (matchedPreset) {
            return (
              <a 
                key={timetable.id} 
                href={getValidFileUrl(timetable.fileUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <CardPresetView
                  preset={matchedPreset}
                  sampleData={{
                    year: timetable.year,
                    logoText: timetable.branch?.[0] ? timetable.branch[0].slice(0, 3).toUpperCase() : 'PDF',
                    title: timetable.name,
                    recipient: timetable.branch?.length ? `${timetable.branch.join(', ')} • Sem ${timetable.semester?.join(', ') || ''}` : '',
                    pdf_url: timetable.fileUrl,
                  }}
                  viewMode="sample"
                />
              </a>
            );
          }

          /* Style 4 (Dual-Pane Split Card) - Title + Year + File Link */
          if (cardStyle === 'style-4') {
            return (
              <a
                key={timetable.id}
                href={getValidFileUrl(timetable.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all overflow-hidden flex flex-col sm:flex-row group h-full min-h-[140px] w-full cursor-pointer"
              >
                {/* Left Gradient Accent Block */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-4 flex sm:flex-col justify-between items-center sm:items-start shrink-0 w-full sm:w-32">
                  {showFields?.icon !== false && (
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/20 shadow-xs">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {showFields?.year && (
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/30">
                      {timetable.year}
                    </span>
                  )}
                </div>

                {/* Right Content Block */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white min-w-0">
                  <div className="space-y-2">
                    {showFields?.title && (
                      <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                        {timetable.name}
                      </h3>
                    )}
                    
                    {(showFields?.branch && timetable.branch?.length > 0) || (showFields?.semester && timetable.semester?.length > 0) ? (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        {showFields?.branch && timetable.branch?.length > 0 && (
                          <span>Branch: <strong className="text-gray-700 font-medium">{timetable.branch.join(', ')}</strong></span>
                        )}
                        {showFields?.semester && timetable.semester?.length > 0 && (
                          <span>• Sem: <strong className="text-gray-700 font-medium">{timetable.semester.join(', ')}</strong></span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {showFields?.download && (
                    <div className="pt-3 flex justify-end">
                      <span className="inline-flex items-center gap-1 bg-gray-900 group-hover:bg-blue-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs">
                        View Document <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>
              </a>
            );
          }

          /* Style 3 (Modern Gradient Banner Card) - Title + Year + File Link */
          if (cardStyle === 'style-3') {
            return (
              <a
                key={timetable.id}
                href={getValidFileUrl(timetable.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden flex flex-col justify-between group h-full min-h-[180px] cursor-pointer"
              >
                {/* Gradient Header Banner */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 text-white flex justify-between items-start">
                  <div className="flex-1 pr-3 min-w-0 flex items-start gap-3">
                    {showFields?.icon !== false && (
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/20 shrink-0">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {showFields?.title && (
                        <h3 className="font-bold text-base sm:text-lg leading-snug tracking-tight text-white group-hover:text-blue-100 transition-colors">
                          {timetable.name}
                        </h3>
                      )}
                      {showFields?.branch && timetable.branch?.length > 0 && (
                        <p className="text-blue-100/90 text-xs font-medium mt-1">
                          {timetable.branch.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {showFields?.year && (
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/30 shrink-0 shadow-2xs">
                      {timetable.year}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white space-y-4">
                  {showFields?.semester && timetable.semester?.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Semester:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {timetable.semester.map(sem => (
                          <span key={sem} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-semibold">
                            Sem {sem}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : <div />}

                  {showFields?.download && (
                    <div className="pt-2 flex justify-end border-t border-gray-100">
                      <span className="inline-flex items-center gap-1 bg-gray-900 group-hover:bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors shadow-2xs">
                        View Document <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>
              </a>
            );
          }

          /* Style 2 (Minimalist File Card) - Title + Year + File Link */
          if (cardStyle === 'style-2') {
            return (
              <a
                key={timetable.id}
                href={getValidFileUrl(timetable.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between group h-full min-h-[180px] cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {showFields?.icon !== false ? (
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-xs group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                    ) : <div />}
                    {showFields?.year && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-xs">
                        {timetable.year}
                      </span>
                    )}
                  </div>
                  
                  {showFields?.title && (
                    <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {timetable.name}
                    </h3>
                  )}
                  
                  {showFields?.branch && timetable.branch?.length > 0 && (
                    <div className="mb-3">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {timetable.branch[0] || 'General'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex justify-between items-center border-t border-gray-100 mt-2">
                  {showFields?.download ? (
                    <span className="text-blue-600 font-bold text-xs flex items-center gap-1 group-hover:text-blue-700 transition-colors">
                      View PDF <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  ) : <span />}
                  <button type="button" className="w-7 h-7 flex items-center justify-center rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors">
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </a>
            );
          }

          /* Style 1 (Classic Document Card) - Title + Year + File Link */
          return (
            <a
              key={timetable.id}
              href={getValidFileUrl(timetable.fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden group flex flex-col justify-between h-full min-h-[180px] cursor-pointer"
            >
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    {showFields?.icon !== false ? (
                      <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-2xs">
                        <Calendar className="w-6 h-6" />
                      </div>
                    ) : <div />}
                    {showFields?.year && (
                      <span className="font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-md text-xs">
                        {timetable.year}
                      </span>
                    )}
                  </div>
                  
                  {showFields?.title && (
                    <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                      {timetable.name}
                    </h3>
                  )}
                  
                  {(showFields?.branch && timetable.branch?.length > 0) || (showFields?.semester && timetable.semester?.length > 0) ? (
                    <div className="flex flex-col gap-1 text-xs text-gray-600 mt-2">
                      {showFields?.branch && timetable.branch?.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-900">Branch:</span> {timetable.branch.join(', ')}
                        </div>
                      )}
                      {showFields?.semester && timetable.semester?.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-900">Semester:</span> {timetable.semester.join(', ')}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {showFields?.download && (
                <div className="bg-gray-50/80 px-5 py-3 border-t border-gray-100 flex justify-end items-center">
                  <span className="text-blue-600 group-hover:text-blue-700 font-bold text-xs transition-colors flex items-center gap-1">
                    View Document <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div id={anchorId || undefined} className={`${isPreview ? "w-full p-1" : "max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"} ${className}`}>
      {(title || description) && (
        <div className="text-center mb-8">
          {title && <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{title}</h2>}
          {description && <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">{description}</p>}
        </div>
      )}
      {renderContent()}
    </div>
  );
};
