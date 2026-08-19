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
  isPreview?: boolean;
}

export const DynamicModuleBlock: React.FC<DynamicModuleBlockProps> = ({
  moduleSlug = 'awards',
  template: passedTemplate,
  titleOverride,
  descriptionOverride,
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

  const { schema } = template;
  const { displayConfig, fields } = schema;

  const headerTitle = titleOverride || schema.name;
  const headerDescription = descriptionOverride || schema.description;

  // Filter items
  const filteredItems = items.filter(item => {
    if (item.showOnWebsite === false) return false;

    // Search query check
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const dataValues = Object.values(item.data).join(' ').toLowerCase();
      if (!dataValues.includes(query)) return false;
    }

    // Category filter check
    if (selectedCategory !== 'all' && item.data.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  // Extract unique categories for filter
  const categories = Array.from(
    new Set(items.map(item => item.data.category).filter(Boolean))
  );

  const getValidUrl = (url?: string) => {
    if (url && url.trim() !== '' && url !== '#') return url;
    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  };

  const isTableView = displayConfig.defaultView === 'table';

  return (
    <div className="w-full space-y-6">
      {/* Block Header */}
      {displayConfig.showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200/80 pb-5">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {headerTitle}
            </h3>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              {headerDescription}
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {displayConfig.showSearch && (
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-44"
                />
              </div>
            )}

            {displayConfig.showCategoryFilter && categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="py-1.5 px-3 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Categories ({items.length})</option>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const cardFields = fields.filter(f => f.showInCard !== false);
            const imageField = fields.find(f => f.type === 'image');
            const imageUrl = imageField ? item.data[imageField.name] : null;
            const pdfField = fields.find(f => f.type === 'file_pdf');

            return (
              <div
                key={item.id}
                className={`group bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col justify-between ${
                  displayConfig.cardStyle === 'style-2'
                    ? 'border-gray-200 hover:border-blue-400 p-5'
                    : displayConfig.cardStyle === 'style-3'
                    ? 'border-indigo-100 shadow-sm'
                    : 'border-gray-200 shadow-xs hover:border-blue-300 p-5'
                }`}
              >
                <div>
                  {/* Style 3 Top Gradient Banner */}
                  {displayConfig.cardStyle === 'style-3' && (
                    <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                  )}

                  {/* Photo / Image Header if present */}
                  {imageUrl && displayConfig.cardStyle !== 'style-2' && (
                    <div className="relative h-44 -mx-5 -mt-5 mb-4 overflow-hidden bg-gray-100">
                      <img
                        src={imageUrl}
                        alt={item.data.title || 'Module Item'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {item.data.category && (
                        <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                          {item.data.category}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Header Title & Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors leading-snug">
                      {item.data.title || item.data.name || 'Untitled Record'}
                    </h4>
                    {item.data.year && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
                        {item.data.year}
                      </span>
                    )}
                  </div>

                  {/* Dynamic Field Key-Value Badges */}
                  <div className="space-y-2 text-xs text-gray-600 mt-3">
                    {cardFields.map(f => {
                      if (f.name === 'title' || f.type === 'image') return null;
                      const val = item.data[f.name];
                      if (val === undefined || val === null || val === '') return null;

                      if (f.type === 'badge') {
                        return (
                          <div key={f.id} className="inline-block mr-2 mb-1">
                            <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              {String(val)}
                            </span>
                          </div>
                        );
                      }

                      if (f.type === 'textarea') {
                        return (
                          <p key={f.id} className="text-gray-500 line-clamp-3 text-xs leading-relaxed mt-2 pt-2 border-t border-gray-100">
                            {String(val)}
                          </p>
                        );
                      }

                      return (
                        <div key={f.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <span className="font-semibold text-gray-700">{f.label}:</span>
                          <span className="truncate">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Action Button Footer */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400">
                    Official Record
                  </span>
                  <a
                    href={getValidUrl(pdfField ? item.data[pdfField.name] : '#')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-gray-900 group-hover:bg-blue-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                  >
                    {displayConfig.primaryActionLabel || 'View Details'}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
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
                displayConfig.tableStyle === 'table-3'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-bold uppercase tracking-wider'
                  : 'bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200'
              }>
                {fields.filter(f => f.showInTable !== false).map(f => (
                  <th key={f.id} className="py-4 px-4 sm:px-6">{f.label}</th>
                ))}
                <th className="py-4 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  {fields.filter(f => f.showInTable !== false).map(f => {
                    const val = item.data[f.name];
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
