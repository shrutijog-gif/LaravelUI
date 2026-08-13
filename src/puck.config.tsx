import React, { useState } from 'react';
import type { Config } from '@measured/puck';
import { ChevronDown } from 'lucide-react';
import { TimetableBlock, TimetableBlockProps } from './components/storefront/blocks/TimetableBlock';
import { StylePickerModal } from './components/builder/StylePickerModal';

type Props = {
  HeadingBlock: { title: string };
  TimetableBlock: TimetableBlockProps & {
    headerConfig?: {
      title?: string;
      description?: string;
    };
  };
};

export const config: Config<Props> = {
  components: {
    HeadingBlock: {
      fields: {
        title: { type: 'text' },
      },
      defaultProps: {
        title: 'Heading',
      },
      render: ({ title }) => (
        <div style={{ padding: 64 }}>
          <h1>{title}</h1>
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
                  <span className="text-xs font-semibold text-gray-700">Content Controller</span>
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
