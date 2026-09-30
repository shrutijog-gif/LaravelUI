import React, { useState, useEffect } from 'react';
import { StudioTemplate, DynamicEntityItem, ModuleSchema } from '../../../types/moduleStudio';
import { getStoredStudioTemplates, getStoredEntitiesBySlug } from '../../../data/mockStudioData';
import { getActiveTenant } from '../../../data/tenantData';
import { Search, ArrowUpRight, FileText, Calendar, Award, Trophy, BookOpen, ExternalLink, ShieldCheck, Layers, Globe, Download } from 'lucide-react';
import { CardPresetView } from '../../modules/developer/CardPresetView';
import { getStoredCardPresets, INITIAL_CARD_PRESETS, CardSlotConfig } from '../../../utils/cardPresets';

export interface DynamicModuleBlockProps {
  moduleSlug?: string;
  template?: StudioTemplate;
  titleOverride?: string;
  descriptionOverride?: string;
  headerAlign?: 'left' | 'center' | 'right';
  cardStyle?: 'style-1' | 'style-2' | 'style-3' | 'style-4' | 'table-1' | 'table-2' | 'table-3' | 'icon-1' | 'icon-2' | 'icon-3' | 'quicklink-1' | 'quicklink-2' | 'quicklink-3' | string;
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
  const [cardPresets, setCardPresets] = useState<CardSlotConfig[]>(() => getStoredCardPresets());

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

    const handlePresetsUpdated = () => {
      setCardPresets(getStoredCardPresets());
    };

    window.addEventListener('card-presets-updated', handlePresetsUpdated);
    window.addEventListener('studio-templates-updated', loadLatestData);
    window.addEventListener('studio-data-updated', loadLatestData);
    window.addEventListener('timetable-data-updated', loadLatestData);
    window.addEventListener('storage', loadLatestData);
    window.addEventListener(`studio-entities-updated-${targetSlug}`, loadLatestData);
    window.addEventListener('tenant-changed', loadLatestData);

    return () => {
      window.removeEventListener('card-presets-updated', handlePresetsUpdated);
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

      {/* Card & Icon Badge View Rendering */}
      {!isTableView && filteredItems.length > 0 && (
        <div className={(activeStyle.startsWith('icon-') || activeStyle.startsWith('quicklink-')) ? 'flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-4' : `grid ${gridColsClass} gap-6`}>
          {displayedItems.map(item => {
            const cardFields = fields.filter(f => f.showInCard !== false && (showFields ? showFields[f.name] !== false : true));
            const imageField = fields.find(f => f.type === 'image');
            const itemData = item?.data || {};
            const imageUrl = imageField ? itemData[imageField.name] : null;
            const linkField = fields.find(f => f.type === 'url') || fields.find(f => f.name.toLowerCase().includes('link') || f.name.toLowerCase() === 'url');
            const pdfField = fields.find(f => f.type === 'file_pdf') || fields.find(f => f.name.toLowerCase().includes('file'));
            const rawTargetUrl = (linkField && itemData[linkField.name]) ? itemData[linkField.name] : (pdfField ? itemData[pdfField.name] : (itemData.fileUrl || itemData.pdf_url || itemData.url || '#'));
            const fileUrl = getValidUrl(rawTargetUrl);
            const titleField = fields.find(f => f.name === 'title' || f.name === 'name' || f.name.includes('name') || f.name.includes('title')) || fields.find(f => f.type === 'text');
            const titleVal = (titleField && itemData[titleField.name])
              ? itemData[titleField.name]
              : (itemData.title || itemData.name || itemData.timetable_name || itemData.recipient || 'Untitled Record');

            const yearField = fields.find(f => f.name === 'year' || f.name === 'academic_year' || f.name.includes('year') || f.name.includes('status') || f.name.includes('trimester'));
            const yearVal = (yearField && itemData[yearField.name])
              ? itemData[yearField.name]
              : (itemData.year || itemData.academic_year || '2026-2027');

            const iconField = fields.find(f => f.type === 'icon') || fields.find(f => f.name.toLowerCase() === 'icon');
            const iconVal = iconField ? itemData[iconField.name] : null;
            const showDownload = showFields ? showFields.download !== false : true;
            const showIcon = showFields ? showFields.icon !== false : true;

            const renderItemMedia = (iconSizeClass = "w-8 h-8") => {
              if (imageUrl) {
                return <img src={imageUrl} alt={titleVal} className={`${iconSizeClass} object-contain`} />;
              }
              if (iconVal === 'award' || iconVal === 'trophy') return <span className="text-2xl sm:text-3xl leading-none select-none">🏆</span>;
              if (iconVal === 'calendar') return <span className="text-2xl sm:text-3xl leading-none select-none">📅</span>;
              if (iconVal === 'book') return <span className="text-2xl sm:text-3xl leading-none select-none">📚</span>;
              if (iconVal === 'graduation-cap') return <span className="text-2xl sm:text-3xl leading-none select-none">🎓</span>;
              if (iconVal === 'shield') return <span className="text-2xl sm:text-3xl leading-none select-none">🛡️</span>;
              if (iconVal === 'layers') return <span className="text-2xl sm:text-3xl leading-none select-none">⚡</span>;
              if (iconVal === 'globe') return <span className="text-2xl sm:text-3xl leading-none select-none">🌐</span>;
              if (iconVal === 'download') return <span className="text-2xl sm:text-3xl leading-none select-none">📥</span>;
              if (iconVal === 'external-link') return <span className="text-2xl sm:text-3xl leading-none select-none">🔗</span>;
              return <FileText className={iconSizeClass} />;
            };

            /* ICON BADGE STYLE 1: Circular Navy Badges with White Ring Border */
            if (activeStyle === 'icon-1' || activeStyle === 'quicklink-1') {
              return (
                <a
                  key={item.id}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-2 transition-transform hover:-translate-y-1 cursor-pointer max-w-[110px]"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0F2748] text-white flex items-center justify-center border-4 border-white shadow-md group-hover:bg-blue-600 transition-all shrink-0">
                    {renderItemMedia("w-7 h-7 sm:w-8 sm:h-8")}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 text-center leading-snug group-hover:text-blue-600 transition-colors">
                    {titleVal}
                  </span>
                </a>
              );
            }

            /* ICON BADGE STYLE 2: Solid Crimson Circle Badges */
            if (activeStyle === 'icon-2' || activeStyle === 'quicklink-2') {
              return (
                <a
                  key={item.id}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-2 transition-transform hover:-translate-y-1 cursor-pointer max-w-[110px]"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#8B1D0F] text-white flex items-center justify-center shadow-sm group-hover:bg-amber-700 transition-all shrink-0">
                    {renderItemMedia("w-7 h-7 sm:w-8 sm:h-8")}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 text-center leading-snug group-hover:text-amber-700 transition-colors">
                    {titleVal}
                  </span>
                </a>
              );
            }

            /* ICON BADGE STYLE 3: Rotated Diamond Badges */
            if (activeStyle === 'icon-3' || activeStyle === 'quicklink-3') {
              return (
                <a
                  key={item.id}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-4 p-2 transition-transform hover:-translate-y-1 cursor-pointer max-w-[110px]"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rotate-45 bg-[#0F2748] group-hover:bg-teal-600 text-white flex items-center justify-center shadow-md transition-colors shrink-0">
                    <div className="-rotate-45">
                      {renderItemMedia("w-6 h-6 sm:w-7 sm:h-7")}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-800 text-center leading-snug group-hover:text-teal-700 transition-colors">
                    {titleVal}
                  </span>
                </a>
              );
            }

            // Standard Card Presets (style-1, style-2, style-3, style-4, or custom presets)
            const cardPresets = getStoredCardPresets();
            const presetConfig = cardPresets.find(p => p.id === activeStyle) || cardPresets.find(p => p.id === 'style-1') || INITIAL_CARD_PRESETS[0];

            // Helper to check if a field/toggle is enabled in Puck's showFields controller
            const isAllowed = (key: string) => showFields ? showFields[key] !== false : true;

            // Dynamically evaluate slot visibility based on Puck's Module Fields Controller
            const effectivePreset: CardSlotConfig = {
              ...presetConfig,
              mediaSlot: {
                ...presetConfig.mediaSlot,
                enabled: presetConfig.mediaSlot?.enabled !== false && isAllowed('icon'),
              },
              badgeSlot: {
                ...presetConfig.badgeSlot,
                enabled: presetConfig.badgeSlot?.enabled !== false && (isAllowed('year') || isAllowed('academic_year')),
              },
              titleSlot: {
                ...presetConfig.titleSlot,
                enabled: presetConfig.titleSlot?.enabled !== false && isAllowed('title'),
              },
              footerRightSlot: {
                ...presetConfig.footerRightSlot,
                enabled: presetConfig.footerRightSlot?.enabled !== false && isAllowed('download'),
              },
            };

            // Build recipient / metadata fields dynamically according to active schema checkboxes
            const allowedFields = fields.filter(f => isAllowed(f.name));
            const activeRecipientVals = allowedFields
              .filter(f => f.name !== 'title' && f.type !== 'image' && f.name !== 'year' && f.name !== 'academic_year' && f.type !== 'file_pdf' && f.name !== 'choose_file')
              .map(f => itemData[f.name])
              .filter(Boolean);

            const fieldEntries = allowedFields
              .filter(f => f.name !== 'title' && f.type !== 'image' && f.name !== 'year' && f.name !== 'academic_year' && f.type !== 'file_pdf' && f.name !== 'choose_file')
              .map(f => ({
                name: f.name,
                label: f.label,
                value: itemData[f.name]
              }))
              .filter(f => f.value !== undefined && f.value !== null && f.value !== '');

            const itemSampleData = {
              title: isAllowed('title') ? titleVal : '',
              recipient: activeRecipientVals.length > 0 ? activeRecipientVals.join(', ') : (isAllowed('category') ? (itemData.category || itemData.type || '') : ''),
              year: (isAllowed('year') || isAllowed('academic_year')) ? (yearVal || itemData.year || itemData.academic_year || '2024-25') : '',
              category: isAllowed('category') ? (itemData.category || itemData.type || '') : '',
              pdf_url: fileUrl,
              fieldEntries: fieldEntries,
              ...itemData
            };

            return (
              <a
                key={item.id}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full cursor-pointer no-underline group"
              >
                <CardPresetView
                  preset={effectivePreset}
                  sampleData={itemSampleData}
                  viewMode="sample"
                />
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
                const linkField = fields.find(f => f.type === 'url') || fields.find(f => f.name.toLowerCase().includes('link') || f.name.toLowerCase() === 'url');
                const pdfField = fields.find(f => f.type === 'file_pdf') || fields.find(f => f.name.toLowerCase().includes('file'));
                const rawTargetUrl = (linkField && rowData[linkField.name]) ? rowData[linkField.name] : (pdfField ? rowData[pdfField.name] : (rowData.fileUrl || rowData.pdf_url || rowData.url || '#'));
                const fileUrl = getValidUrl(rawTargetUrl);
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
                        href={fileUrl}
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
