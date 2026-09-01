import React, { useState } from 'react';
import type { Config } from '@measured/puck';
import { ChevronDown } from 'lucide-react';
import { TimetableBlock, TimetableBlockProps } from './components/storefront/blocks/TimetableBlock';
import { CommitteesBlock } from './components/storefront/blocks/CommitteesBlock';
import { StylePickerModal } from './components/builder/StylePickerModal';

import { DynamicModuleBlock } from './components/storefront/blocks/DynamicModuleBlock';
import { getStoredStudioTemplates } from './data/mockStudioData';

type Props = Record<string, any>;

export const getDynamicPuckConfig = (): Config<Props> => {
  const templates = getStoredStudioTemplates();

  const moduleOptions = templates.map(t => ({
    label: `${t.schema.name || 'Untitled'} (${t.schema.slug})`,
    value: t.schema.slug,
  }));

  const createDynamicModulePuckFields = (template: any) => {
    const schema = template.schema;
    const fields = schema.fields || [];

    return {
      /* 1. Header Controller Box */
      headerConfig: {
        type: 'custom',
        render: ({ value = { title: schema.name, description: schema.description }, onChange }: any) => {
          const [isExpanded, setIsExpanded] = useState(true);

          return (
            <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
              >
                <span className="text-xs font-semibold text-gray-700">Block Header</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="p-3 space-y-3 bg-white">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={value?.title ?? schema.name}
                      onChange={(e) => onChange({ ...value, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y outline-none"
                      value={value?.description ?? schema.description}
                      onChange={(e) => onChange({ ...value, description: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        },
      },

      /* 2. Style Controller Box */
      styleConfig: {
        type: 'custom',
        render: ({ value = { cardStyle: 'style-1', columns: 3 }, onChange }: any) => {
          const [isExpanded, setIsExpanded] = useState(true);
          const [isModalOpen, setIsModalOpen] = useState(false);
          
          const activeStyle = typeof value === 'string' ? value : (value?.cardStyle || 'style-1');
          const activeColumns = typeof value === 'object' && value?.columns ? value.columns : 3;
          const isTable = activeStyle.startsWith('table-');

          return (
            <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
              >
                <span className="text-xs font-semibold text-gray-700">Style Controller</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="p-3 bg-white space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 active:bg-gray-300 rounded-md font-semibold text-xs text-gray-700 transition-colors flex items-center justify-between"
                  >
                    <span>Select Style</span>
                    <span className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 uppercase font-bold">
                      {activeStyle}
                    </span>
                  </button>

                  {!isTable && (
                    <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                      <span>Cards Per Row</span>
                      <select
                        value={activeColumns}
                        onChange={(e) => {
                          const currentObj = typeof value === 'object' ? value : { cardStyle: value };
                          onChange({ ...currentObj, columns: Number(e.target.value) });
                        }}
                        className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 font-bold text-[11px] outline-none cursor-pointer hover:border-blue-400 transition-colors"
                      >
                        <option value={2}>2 Cards</option>
                        <option value={3}>3 Cards</option>
                        <option value={4}>4 Cards</option>
                      </select>
                    </div>
                  )}

                  <StylePickerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedStyle={activeStyle}
                    onSelectStyle={(newStyle) => {
                      const currentObj = typeof value === 'object' ? value : { columns: 3 };
                      onChange({ ...currentObj, cardStyle: newStyle });
                    }}
                  />
                </div>
              )}
            </div>
          );
        },
      },

      /* 3. Card Fields Controller Box (Per-Entry Elements) */
      showFields: {
        type: 'custom',
        render: ({ value, onChange }: any) => {
          const [isExpanded, setIsExpanded] = useState(true);

          const initialValues: Record<string, boolean> = {
            download: true,
            icon: true,
          };
          fields.forEach((f: any) => { initialValues[f.name] = true; });

          const activeValue = value || initialValues;

          const toggle = (fieldKey: string) => {
            onChange({ ...activeValue, [fieldKey]: !activeValue[fieldKey] });
          };

          const cardUiElements = [
            { key: 'download', label: 'View / Download button' },
            { key: 'icon', label: 'Icon / Image Header' },
          ];

          return (
            <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
              >
                <span className="text-xs font-semibold text-gray-700">Module Fields Controller</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="p-2 flex flex-col gap-0.5 bg-white">
                  {/* Core Module Schema Fields */}
                  {fields.map((f: any) => (
                    <label key={f.name} className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        checked={activeValue[f.name] !== false} 
                        onChange={() => toggle(f.name)} 
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-1 mx-1" />

                  {/* Per-Card UI Action Elements */}
                  {cardUiElements.map(f => (
                    <label key={f.key} className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        checked={activeValue[f.key] !== false} 
                        onChange={() => toggle(f.key)} 
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        }
      },

      /* 4. Block Features Controller Box (Whole-Block Features) */
      toolbarConfig: {
        type: 'custom',
        render: ({ value = { search: true, categoryFilter: true }, onChange }: any) => {
          const [isExpanded, setIsExpanded] = useState(true);

          const toggle = (featureKey: string) => {
            onChange({ ...value, [featureKey]: !value[featureKey] });
          };

          return (
            <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
              >
                <span className="text-xs font-semibold text-gray-700">Block Features Controller</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="p-2 flex flex-col gap-0.5 bg-white">
                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      checked={value?.search !== false} 
                      onChange={() => toggle('search')} 
                    />
                    <span>Search Bar</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      checked={value?.categoryFilter !== false} 
                      onChange={() => toggle('categoryFilter')} 
                    />
                    <span>Category Filter</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      checked={value?.pagination !== false} 
                      onChange={() => toggle('pagination')} 
                    />
                    <span>Pagination</span>
                  </label>
                </div>
              )}
            </div>
          );
        }
      },

      /* 4. Advanced Controller Box */
      advancedConfig: {
        type: 'custom',
        render: ({ value = { anchorId: '', className: '' }, onChange }: any) => {
          const [isExpanded, setIsExpanded] = useState(false);
          const activeAnchorId = typeof value === 'object' && value?.anchorId ? value.anchorId : '';
          const activeClassName = typeof value === 'object' && value?.className ? value.className : (typeof value === 'string' ? value : '');

          return (
            <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
              >
                <span className="text-xs font-semibold text-gray-700">Advanced Controller</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="p-3 bg-white space-y-2">
                  <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between gap-2">
                    <span className="shrink-0">Anchor Id</span>
                    <input
                      type="text"
                      placeholder={`e.g. ${schema.slug}-section`}
                      className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-mono text-gray-800 text-left w-36 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={activeAnchorId}
                      onChange={(e) => {
                        const currentObj = typeof value === 'object' ? value : {};
                        onChange({ ...currentObj, anchorId: e.target.value });
                      }}
                    />
                  </div>

                  <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between gap-2">
                    <span className="shrink-0">Css Class</span>
                    <input
                      type="text"
                      placeholder="e.g. custom-class"
                      className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-mono text-gray-800 text-left w-36 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={activeClassName}
                      onChange={(e) => {
                        const currentObj = typeof value === 'object' ? value : {};
                        onChange({ ...currentObj, className: e.target.value });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        },
      },
    };
  };

  // Build dynamic component definitions for every module created in Module Studio / College Admin
  const dynamicModuleComponents: Record<string, any> = {};

  const studioComponentKeys = templates.map(t => {
    const slug = t.schema.slug;
    const componentKey = `Studio_${slug.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    const iconPrefix = slug === 'awards' ? '🏆 ' : slug === 'timetables' ? '📅 ' : slug === 'reports' ? '📄 ' : '⚡ ';

    dynamicModuleComponents[componentKey] = {
      label: `${iconPrefix}${t.schema.name || slug}`,
      fields: createDynamicModulePuckFields(t),
      defaultProps: {
        headerConfig: {
          title: t.schema.name,
          description: t.schema.description,
        },
        styleConfig: {
          cardStyle: 'style-1',
          columns: 3,
        },
        advancedConfig: {
          anchorId: '',
          className: '',
        },
      },
      render: ({ headerConfig, styleConfig, showFields, toolbarConfig, advancedConfig }: any) => {
        const resolvedStyle = (typeof styleConfig === 'object' ? styleConfig?.cardStyle : styleConfig) ?? 'style-1';
        const resolvedColumns = (typeof styleConfig === 'object' ? styleConfig?.columns : 3) ?? 3;
        const resolvedClass = (typeof advancedConfig === 'object' ? advancedConfig?.className : '') ?? '';
        const resolvedAnchorId = (typeof advancedConfig === 'object' ? advancedConfig?.anchorId : '') ?? '';

        const combinedShowFields = {
          ...showFields,
          search: toolbarConfig?.search,
          categoryFilter: toolbarConfig?.categoryFilter,
          pagination: toolbarConfig?.pagination,
        };

        return (
          <DynamicModuleBlock
            moduleSlug={slug}
            template={t}
            titleOverride={headerConfig?.title}
            descriptionOverride={headerConfig?.description}
            headerAlign={headerConfig?.align || 'left'}
            cardStyle={resolvedStyle as any}
            columns={resolvedColumns as any}
            className={resolvedClass}
            anchorId={resolvedAnchorId}
            showFields={combinedShowFields}
          />
        );
      },
    };

    return componentKey;
  });

  return {
    categories: {
      '⚡ Module Studio': {
        components: [...studioComponentKeys, 'DynamicStudioModule'],
      },
      '📝 General Components': {
        components: ['HeadingBlock', 'TimetableBlock'],
      },
    },
    components: {
      ...dynamicModuleComponents,
      DynamicStudioModule: {
        label: '🧩 Generic Module Selector',
        fields: {
          moduleSlug: {
            type: 'select',
            options: moduleOptions.length > 0 ? moduleOptions : [
              { label: 'Awards & Recognitions', value: 'awards' },
              { label: 'Academic Timetables', value: 'timetables' },
              { label: 'Examination Reports', value: 'reports' },
            ],
          },
          titleOverride: { type: 'text' },
          descriptionOverride: { type: 'text' },
        },
        defaultProps: {
          moduleSlug: moduleOptions[0]?.value || 'awards',
          titleOverride: '',
          descriptionOverride: '',
        },
        render: ({ moduleSlug, titleOverride, descriptionOverride }: any) => (
          <DynamicModuleBlock
            moduleSlug={moduleSlug}
            titleOverride={titleOverride}
            descriptionOverride={descriptionOverride}
          />
        ),
      },
      CommitteesBlock: {
        label: 'Committees',
        fields: {
          /* 1. Block Header accordion */
          headerConfig: {
            type: 'custom',
            render: ({ value = { title: 'Committees', description: '' }, onChange }: any) => {
              const [isExpanded, setIsExpanded] = useState(true);
              return (
                <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-gray-700">Block Header</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="p-3 space-y-3 bg-white">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          value={value?.title ?? 'Committees'}
                          onChange={(e) => onChange({ ...value, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                        <textarea
                          rows={2}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y outline-none"
                          value={value?.description ?? ''}
                          onChange={(e) => onChange({ ...value, description: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            },
          },

          /* 2. Committee Selector accordion */
          committeeConfig: {
            type: 'custom',
            render: ({ value = { committeeId: 'c1' }, onChange }: any) => {
              const [isExpanded, setIsExpanded] = useState(true);
              const committees = [
                { id: 'c1', name: 'IQAC' },
                { id: 'c2', name: 'Anti-Ragging Committee' },
                { id: 'c3', name: 'Women Empowerment Cell' },
                { id: 'c4', name: 'NSS Committee' },
                { id: 'c5', name: 'Cultural Committee' },
              ];
              const selected = committees.find(c => c.id === (value?.committeeId ?? 'c1'));
              return (
                <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-gray-700">Committee</span>
                    <div className="flex items-center gap-2">
                      {!isExpanded && selected && (
                        <span className="text-xs font-semibold text-blue-600 uppercase">{selected.name}</span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="p-3 bg-white">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Select Committee</label>
                      <select
                        value={value?.committeeId ?? 'c1'}
                        onChange={(e) => onChange({ ...value, committeeId: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      >
                        {committees.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            },
          },

          /* 3. Advanced Controller Box */
          advancedConfig: {
            type: 'custom',
            render: ({ value = { anchorId: '', className: '' }, onChange }) => {
              const [isExpanded, setIsExpanded] = useState(false);
              const activeAnchorId = typeof value === 'object' && value?.anchorId ? value.anchorId : '';
              const activeClassName = typeof value === 'object' && value?.className ? value.className : (typeof value === 'string' ? value : '');

              return (
                <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-gray-700">Advanced Controller</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white space-y-2">
                      <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between gap-2">
                        <span className="shrink-0">Anchor Id</span>
                        <input
                          type="text"
                          placeholder="e.g. custom_module_"
                          className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-mono text-gray-800 text-left w-36 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          value={activeAnchorId}
                          onChange={(e) => {
                            const currentObj = typeof value === 'object' ? value : {};
                            onChange({ ...currentObj, anchorId: e.target.value });
                          }}
                        />
                      </div>

                      <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between gap-2">
                        <span className="shrink-0">Css Class</span>
                        <input
                          type="text"
                          placeholder="e.g. custom-class"
                          className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-mono text-gray-800 text-left w-36 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          value={activeClassName}
                          onChange={(e) => {
                            const currentObj = typeof value === 'object' ? value : {};
                            onChange({ ...currentObj, className: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            },
          },
        },
        defaultProps: {
          headerConfig: { title: 'Committees', description: '' },
          committeeConfig: { committeeId: 'c1' },
          advancedConfig: { anchorId: '', className: '' },
        },
        render: ({ headerConfig, committeeConfig, advancedConfig }: any) => (
          <CommitteesBlock
            committeeId={committeeConfig?.committeeId ?? 'c1'}
            title={headerConfig?.title}
            description={headerConfig?.description}
            anchorId={advancedConfig?.anchorId}
            className={advancedConfig?.className}
          />
        ),
      },
      HeadingBlock: {
        label: '📝 Title Heading',
        fields: {
          title: { type: 'text' },
        },
        defaultProps: {
          title: 'Heading Section',
        },
        render: ({ title }: any) => (
          <div style={{ padding: '32px 0' }}>
            <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
          </div>
        ),
      },
      TimetableBlock: {
      label: 'Timetables',
      fields: {
        /* 1. Header Controller Box */
        headerConfig: {
          type: 'custom',
          render: ({ value = { title: 'Academic Timetables', description: 'Download the latest timetables for your academic year.' }, onChange }) => {
            const [isExpanded, setIsExpanded] = useState(true);

            return (
              <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-gray-700">Block Header</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="p-3 space-y-3 bg-white">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                      <input
                        type="text"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={value?.title ?? 'Academic Timetables'}
                        onChange={(e) => onChange({ ...value, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                      <textarea
                        rows={2}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y outline-none"
                        value={value?.description ?? 'Download the latest timetables for your academic year.'}
                        onChange={(e) => onChange({ ...value, description: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          },
        },

        /* 2. Style Controller Box */
        styleConfig: {
          type: 'custom',
          render: ({ value = { cardStyle: 'style-1', columns: 3, className: '' }, onChange }) => {
            const [isExpanded, setIsExpanded] = useState(true);
            const [isModalOpen, setIsModalOpen] = useState(false);
            
            // Extract properties supporting string or object for backward compatibility
            const activeStyle = typeof value === 'string' ? value : (value?.cardStyle || 'style-1');
            const activeColumns = typeof value === 'object' && value?.columns ? value.columns : 3;
            const activeClassName = typeof value === 'object' && value?.className ? value.className : '';
            const isTable = activeStyle.startsWith('table-');

            return (
              <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-gray-700">Style Controller</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="p-3 bg-white space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 active:bg-gray-300 rounded-md font-semibold text-xs text-gray-700 transition-colors flex items-center justify-between"
                    >
                      <span>Select Style</span>
                      <span className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 uppercase font-bold">
                        {activeStyle}
                      </span>
                    </button>

                    {!isTable && (
                      <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                        <span>Cards Per Row</span>
                        <select
                          value={activeColumns}
                          onChange={(e) => {
                            const currentObj = typeof value === 'object' ? value : { cardStyle: value };
                            onChange({ ...currentObj, columns: Number(e.target.value) });
                          }}
                          className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 font-bold text-[11px] outline-none cursor-pointer hover:border-blue-400 transition-colors"
                        >
                          <option value={2}>2 Cards</option>
                          <option value={3}>3 Cards</option>
                          <option value={4}>4 Cards</option>
                        </select>
                      </div>
                    )}

                    <StylePickerModal
                      isOpen={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                      selectedStyle={activeStyle}
                      onSelectStyle={(newStyle) => {
                        const currentObj = typeof value === 'object' ? value : { columns: 3 };
                        onChange({ ...currentObj, cardStyle: newStyle });
                      }}
                    />
                  </div>
                )}
              </div>
            );
          },
        },

        /* 3. Content Controller Box */
        showFields: {
          type: 'custom',
          render: ({ value = { title: true, year: true, file: true, branch: true, semester: true, download: true, icon: true }, onChange }) => {
            const [isExpanded, setIsExpanded] = useState(true);
            const toggle = (field: string) => onChange({ ...value, [field]: !value[field] });
            
            const coreFields = [
              { key: 'title', label: 'Name' },
              { key: 'year', label: 'Year' },
              { key: 'file', label: 'File Name' },
              { key: 'branch', label: 'Branch' },
              { key: 'semester', label: 'Semester' },
            ];

            const uiFields = [
              { key: 'download', label: 'Download button' },
              { key: 'icon', label: 'Icon' },
            ];

            return (
              <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-gray-700">Module Fields Controller</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="p-2 flex flex-col gap-0.5 bg-white">
                    {/* Core Data Fields */}
                    {coreFields.map(f => (
                      <label key={f.key} className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          checked={value[f.key] !== false} 
                          onChange={() => toggle(f.key)} 
                        />
                        <span>{f.label}</span>
                      </label>
                    ))}

                    {/* Divider separating core data fields from UI component elements */}
                    <div className="border-t border-gray-100 my-1 mx-1" />

                    {/* UI Component Elements */}
                    {uiFields.map(f => (
                      <label key={f.key} className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          checked={value[f.key] !== false} 
                          onChange={() => toggle(f.key)} 
                        />
                        <span>{f.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          }
        },

        /* 4. Advanced Controller Box */
        advancedConfig: {
          type: 'custom',
          render: ({ value = { anchorId: '', className: '' }, onChange }) => {
            const [isExpanded, setIsExpanded] = useState(false);
            const activeAnchorId = typeof value === 'object' && value?.anchorId ? value.anchorId : '';
            const activeClassName = typeof value === 'object' && value?.className ? value.className : (typeof value === 'string' ? value : '');

            return (
              <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-gray-700">Advanced Controller</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="p-3 bg-white space-y-2">
                    <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between gap-2">
                      <span className="shrink-0">Anchor Id</span>
                      <input
                        type="text"
                        placeholder="e.g. timetable-section"
                        className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-mono text-gray-800 text-left w-36 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={activeAnchorId}
                        onChange={(e) => {
                          const currentObj = typeof value === 'object' ? value : {};
                          onChange({ ...currentObj, anchorId: e.target.value });
                        }}
                      />
                    </div>

                    <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between gap-2">
                      <span className="shrink-0">Css Class</span>
                      <input
                        type="text"
                        placeholder="e.g. custom-class"
                        className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-mono text-gray-800 text-left w-36 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={activeClassName}
                        onChange={(e) => {
                          const currentObj = typeof value === 'object' ? value : {};
                          onChange({ ...currentObj, className: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          },
        },
      },
      defaultProps: {
        headerConfig: {
          title: 'Academic Timetables',
          description: 'Download the latest timetables for your academic year.',
        },
        styleConfig: {
          cardStyle: 'style-1',
          columns: 3,
        },
        advancedConfig: {
          anchorId: '',
          className: '',
        },
        showFields: { title: true, year: true, file: true, branch: true, semester: true, download: true, icon: true },
      },
      render: ({ headerConfig, styleConfig, advancedConfig, cardStyle, columns, className, anchorId, title, description, showFields }) => {
        const resolvedStyle = (typeof styleConfig === 'object' ? styleConfig?.cardStyle : styleConfig) ?? cardStyle ?? 'style-1';
        const resolvedColumns = (typeof styleConfig === 'object' ? styleConfig?.columns : columns) ?? 3;
        const resolvedClass = (typeof advancedConfig === 'object' ? advancedConfig?.className : advancedConfig) ?? className ?? '';
        const resolvedAnchorId = (typeof advancedConfig === 'object' ? advancedConfig?.anchorId : advancedConfig) ?? anchorId ?? '';

        return (
          <TimetableBlock 
            title={headerConfig?.title ?? title ?? 'Academic Timetables'} 
            description={headerConfig?.description ?? description ?? 'Download the latest timetables for your academic year.'}
            cardStyle={resolvedStyle as any}
            columns={resolvedColumns as any}
            className={resolvedClass}
            anchorId={resolvedAnchorId}
            showFields={showFields}
          />
        );
      },
    },
  },
};
};

export const config = getDynamicPuckConfig();
