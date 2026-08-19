import React, { useState, useEffect } from 'react';
import { StudioTemplate, DynamicEntityItem, ModuleSchema } from '../../../types/moduleStudio';
import { getStoredStudioTemplates, getStoredEntitiesBySlug } from '../../../data/mockStudioData';
import { getActiveTenant } from '../../../data/tenantData';
import { Search, ArrowUpRight, FileText, Calendar, Award, ExternalLink, ShieldCheck } from 'lucide-react';

export interface DynamicModuleBlockProps {
  moduleSlug?: string;
  template?: StudioTemplate;
  titleOverride?: string;
  descriptionOverride?: string;
  headerAlign?: 'left' | 'center' | 'right';
  cardStyle?: 'style-1' | 'style-2' | 'style-3' | 'style-4' | 'table-1' | 'table-2' | 'table-3';
  columns?: 2 | 3 | 4;
  className?: string;
  anchorId?: string;
  showFields?: Record<string, boolean>;
  isPreview?: boolean;
}

export const DynamicModuleBlock: React.FC<DynamicModuleBlockProps> = ({
  moduleSlug = 'awards',
  template: passedTemplate,
  titleOverride,
  descriptionOverride,
  headerAlign = 'center',
  cardStyle,
  columns = 3,
  className = '',
  anchorId = '',
  showFields,
  isPreview = false,
}) => {
  const activeTenant = getActiveTenant();
  const targetSlug = passedTemplate ? passedTemplate.schema.slug : moduleSlug;

  const [template, setTemplate] = useState<StudioTemplate | undefined>(() => {
    if (passedTemplate) return passedTemplate;
    const templates = getStoredStudioTemplates();
    return templates.find(t => t.schema.slug === targetSlug) || templates[0];
  });

  const [items, setItems] = useState<DynamicEntityItem[]>(() => {
    return getStoredEntitiesBySlug(targetSlug, activeTenant.id);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadLatestData = () => {
      const templates = getStoredStudioTemplates();
      const matched = templates.find(t => t.schema.slug === targetSlug) || passedTemplate;
      if (matched) {
        setTemplate(matched);
      }
      const storedItems = getStoredEntitiesBySlug(targetSlug, activeTenant.id);
      setItems(storedItems);
    };

    loadLatestData();

    window.addEventListener('studio-templates-updated', loadLatestData);
    window.addEventListener('studio-data-updated', loadLatestData);
    window.addEventListener('timetable-data-updated', loadLatestData);
    window.addEventListener('storage', loadLatestData);
    window.addEventListener(`studio-entities-updated-${targetSlug}`, loadLatestData);
    window.addEventListener('tenant-changed', loadLatestData);

    return () => {
      window.removeEventListener('studio-templates-updated', loadLatestData);
      window.removeEventListener('studio-data-updated', loadLatestData);
      window.removeEventListener('timetable-data-updated', loadLatestData);
      window.removeEventListener('storage', loadLatestData);
      window.removeEventListener(`studio-entities-updated-${targetSlug}`, loadLatestData);
      window.removeEventListener('tenant-changed', loadLatestData);
    };
  }, [targetSlug, passedTemplate, activeTenant.id]);

  if (!template) {
    return (
      <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
        Module not configured in Studio.
      </div>
    );
  }

  const schema = template?.schema || { name: '', description: '', slug: '', fields: [], displayConfig: {} };
  const fields = schema.fields || [];
  const displayConfig = schema.displayConfig || {};

  const headerTitle = titleOverride || schema.name;
  const headerDescription = descriptionOverride || schema.description;

  // Detect filterable field (category, branch, department, or type)
  const filterField = fields.find((f: any) => f.name === 'category' || f.name === 'branch' || f.name === 'department' || f.name === 'type');
  const filterKey = filterField?.name || 'category';
  const filterLabel = filterField ? filterField.label : 'Category';

  // Extract unique filter values dynamically from actual items
  const categories = Array.from(
    new Set(
      (items || []).flatMap(item => {
        if (!item || !item.data) return [];
        const val = item.data[filterKey];
        if (!val) return [];
        return Array.isArray(val) ? val : [String(val)];
      }).filter(Boolean)
    )
  );

  // Filter items
  const filteredItems = (items || []).filter(item => {
    if (!item) return false;
    if (item.showOnWebsite === false) return false;

    // Search query check
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const dataValues = item.data ? Object.values(item.data).join(' ').toLowerCase() : '';
      if (!dataValues.includes(query)) return false;
    }

    // Category / Branch filter check
    if (selectedCategory !== 'all') {
      const val = item.data ? item.data[filterKey] : undefined;
      if (Array.isArray(val)) {
        if (!val.includes(selectedCategory)) return false;
      } else if (String(val) !== selectedCategory) {
        return false;
      }
    }

    return true;
  });

  // Pagination setup
  const itemsPerPage = 6;
  const shouldShowPagination = showFields?.pagination === true;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const displayedItems = shouldShowPagination
    ? filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredItems;

  const getValidUrl = (url?: string) => {
    if (url && url.trim() !== '' && url !== '#') return url;
    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  };

  const activeStyle = cardStyle || displayConfig.cardStyle || 'style-1';
  const isTableView = activeStyle.startsWith('table-');
  const gridColsClass = columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : columns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const shouldShowSearch = showFields?.search === true;
  const shouldShowCategoryFilter = showFields?.categoryFilter === true && categories.length > 0;

  const textAlignClass = headerAlign === 'center' ? 'text-center' : headerAlign === 'right' ? 'text-right' : 'text-left';

  return (
    <div id={anchorId || undefined} className={`w-full space-y-6 ${className}`}>
      {/* 1. Block Header Group (Title & Description) */}
      {displayConfig.showTitle !== false && (headerTitle || headerDescription) && (
        <div className={`w-full ${headerAlign === 'center' ? 'text-center' : headerAlign === 'right' ? 'text-right' : 'text-left'}`}>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {headerTitle}
          </h3>
          {headerDescription && (
            <p className={`text-sm text-gray-600 mt-1 ${headerAlign === 'center' ? 'mx-auto max-w-2xl' : headerAlign === 'right' ? 'ms-auto max-w-2xl' : 'max-w-2xl'}`}>
              {headerDescription}
            </p>
          )}
        </div>
      )}

      {/* 2. Block Features Group (Search Bar & Category Filter Toolbar) */}
      {(shouldShowSearch || shouldShowCategoryFilter) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/80 pb-4">
          <div className="flex flex-wrap items-center gap-2.5 ms-auto">
            {shouldShowSearch && (
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-52 shadow-2xs"
                />
              </div>
            )}

            {shouldShowCategoryFilter && (
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="py-1.5 px-3 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs text-gray-700 font-medium"
              >
                <option value="all">All {filterLabel}s ({categories.length})</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="font-semibold text-sm">No items found for {headerTitle}.</p>
          <p className="text-xs text-gray-400 mt-1">Check back later or adjust your search filter.</p>
        </div>
      )}

      {/* Card View Rendering */}
      {!isTableView && filteredItems.length > 0 && (
        <div className={`grid ${gridColsClass} gap-6`}>
          {displayedItems.map(item => {
            const cardFields = fields.filter(f => f.showInCard !== false && (showFields ? showFields[f.name] !== false : true));
            const imageField = fields.find(f => f.type === 'image');
            const itemData = item?.data || {};
            const imageUrl = imageField ? itemData[imageField.name] : null;
            const pdfField = fields.find(f => f.type === 'file_pdf') || fields.find(f => f.name.toLowerCase().includes('file'));
            const fileUrl = getValidUrl(pdfField ? itemData[pdfField.name] : '#');
            const titleVal = itemData.title || itemData.name || itemData.recipient || 'Untitled Record';
            const yearVal = itemData.year;
            const showDownload = showFields ? showFields.download !== false : true;
            const showIcon = showFields ? showFields.icon !== false : true;

            /* STYLE 4: Dual-Pane Split Card */
            if (activeStyle === 'style-4') {
              return (
                <a
                  key={item.id}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden flex flex-col sm:flex-row group h-full min-h-[160px] w-full cursor-pointer"
                >
                  {/* Left Gradient Accent Block */}
                  <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-4 flex sm:flex-col justify-between items-center sm:items-start shrink-0 w-full sm:w-36">
                    {showIcon && (
                      <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/20 shadow-xs">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {yearVal && (showFields ? showFields.year !== false : true) && (
                      <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/30">
                        {yearVal}
                      </span>
                    )}
                  </div>

                  {/* Right Content Block */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-white min-w-0">
                    <div className="space-y-2">
                      <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                        {titleVal}
                      </h3>
                      
                      <div className="space-y-1 text-xs text-gray-500">
                        {cardFields.map(f => {
                          const isFileField = f.type === 'file_pdf' || f.name === 'choose_file' || f.name.toLowerCase().includes('file');
                          if (f.name === 'title' || f.type === 'image' || f.name === 'year' || f.name === 'academic_year' || isFileField) return null;
                          const val = itemData[f.name];
                          if (!val) return null;
                          return (
                            <div key={f.id} className="truncate">
                              <span className="font-semibold text-gray-700">{f.label}:</span>{' '}
                              <span>{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {showDownload && (
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

            /* STYLE 3: Modern Gradient Banner Card */
            if (activeStyle === 'style-3') {
              return (
                <a
                  key={item.id}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden flex flex-col justify-between group h-full min-h-[180px] cursor-pointer"
                >
                  {/* Gradient Header Banner */}
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 text-white flex justify-between items-start">
                    <div className="flex-1 pr-3 min-w-0 flex items-start gap-3">
                      {showIcon && (
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/20 shrink-0">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg leading-snug tracking-tight text-white group-hover:text-blue-100 transition-colors">
                          {titleVal}
                        </h3>
                      </div>
                    </div>

                    {yearVal && (showFields ? showFields.year !== false : true) && (
                      <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/30 shrink-0 shadow-2xs">
                        {yearVal}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-white space-y-4">
                    <div className="space-y-2 text-xs text-gray-600">
                      {cardFields.map(f => {
                        const isFileField = f.type === 'file_pdf' || f.name === 'choose_file' || f.name.toLowerCase().includes('file');
                        if (f.name === 'title' || f.type === 'image' || f.name === 'year' || f.name === 'academic_year' || isFileField) return null;
                        const val = itemData[f.name];
                        if (!val) return null;
                        return (
                          <div key={f.id} className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-700">{f.label}:</span>
                            <span className="truncate">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                          </div>
                        );
                      })}
                    </div>

                    {showDownload && (
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

            /* STYLE 2: Minimalist File Card */
            if (activeStyle === 'style-2') {
              return (
                <a
                  key={item.id}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between group h-full min-h-[180px] cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      {showIcon ? (
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-xs group-hover:scale-105 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                      ) : <div />}
                      {yearVal && (showFields ? showFields.year !== false : true) && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-xs">
                          {yearVal}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {titleVal}
                    </h3>

                    <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                      {cardFields.map(f => {
                        const isFileField = f.type === 'file_pdf' || f.name === 'choose_file' || f.name.toLowerCase().includes('file');
                        if (f.name === 'title' || f.type === 'image' || f.name === 'year' || f.name === 'academic_year' || isFileField) return null;
                        const val = itemData[f.name];
                        if (!val) return null;
                        return (
                          <div key={f.id} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                            <span className="font-medium text-gray-600">{f.label}: {Array.isArray(val) ? val.join(', ') : String(val)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between items-center border-t border-gray-100 mt-2">
                    {showDownload ? (
                      <span className="text-blue-600 font-bold text-xs flex items-center gap-1 group-hover:text-blue-700 transition-colors">
                        View Document <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    ) : <span />}
                  </div>
                </a>
              );
            }

            /* STYLE 1 (Default): Classic Document Card */
            return (
              <a
                key={item.id}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden group flex flex-col justify-between h-full min-h-[180px] cursor-pointer"
              >
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      {showIcon ? (
                        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-2xs">
                          <FileText className="w-6 h-6" />
                        </div>
                      ) : <div />}
                      {yearVal && (showFields ? showFields.year !== false : true) && (
                        <span className="font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-md text-xs">
                          {yearVal}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                      {titleVal}
                    </h3>
                    
                    <div className="flex flex-col gap-1 text-xs text-gray-600 mt-2">
                      {cardFields.map(f => {
                        const isFileField = f.type === 'file_pdf' || f.name === 'choose_file' || f.name.toLowerCase().includes('file');
                        if (f.name === 'title' || f.type === 'image' || f.name === 'year' || f.name === 'academic_year' || isFileField) return null;
                        const val = itemData[f.name];
                        if (!val) return null;
                        return (
                          <div key={f.id}>
                            <span className="font-medium text-gray-900">{f.label}:</span>{' '}
                            <span>{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {showDownload && (
                    <div className="pt-3 flex justify-end border-t border-gray-100 mt-4">
                      <span className="text-blue-600 font-bold text-xs flex items-center gap-1 group-hover:text-blue-700 transition-colors">
                        View Document <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Table View Rendering */}
      {isTableView && filteredItems.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={
                activeStyle === 'table-3'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-bold uppercase tracking-wider'
                  : 'bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200'
              }>
                {fields.filter(f => f.showInTable !== false && (showFields ? showFields[f.name] !== false : true)).map(f => (
                  <th key={f.id} className="py-4 px-4 sm:px-6">{f.label}</th>
                ))}
                {(showFields ? showFields.download !== false : true) && (
                  <th className="py-4 px-4 sm:px-6 text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {displayedItems.map(item => {
                const rowData = item?.data || {};
                return (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    {fields.filter(f => f.showInTable !== false && (showFields ? showFields[f.name] !== false : true)).map(f => {
                      const val = rowData[f.name];
                    return (
                      <td key={f.id} className="py-4 px-4 sm:px-6 text-gray-800 text-xs">
                        {f.name === 'title' ? (
                          <span className="font-bold text-gray-900 group-hover:text-blue-600 text-sm transition-colors">
                            {val || '—'}
                          </span>
                        ) : f.type === 'badge' ? (
                          <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full border border-blue-100">
                            {val}
                          </span>
                        ) : (
                          <span>{Array.isArray(val) ? val.join(', ') : val || '—'}</span>
                        )}
                      </td>
                    );
                  })}
                  {(showFields ? showFields.download !== false : true) && (
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <a
                        href={getValidUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-gray-900 group-hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                      >
                        {displayConfig.primaryActionLabel || 'View'} <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {shouldShowPagination && totalPages > 1 && (
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200/80 mt-6">
          <p className="text-xs text-gray-500 font-medium">
            Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of <span className="font-semibold text-gray-900">{filteredItems.length}</span> records
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 shadow-2xs"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors shadow-2xs ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
