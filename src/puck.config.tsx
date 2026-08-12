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
                  <span className="text-xs font-semibold text-gray-700">Header Controller</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="p-3 space-y-3 bg-white">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                      <input
                        type="text"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={value?.title ?? 'Academic Timetables'}
                        onChange={(e) => onChange({ ...value, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                      <textarea
                        rows={2}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y outline-none"
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
        cardStyle: {
          type: 'custom',
          render: ({ value = 'style-1', onChange }) => {
            const [isExpanded, setIsExpanded] = useState(true);
            const [isModalOpen, setIsModalOpen] = useState(false);

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
                  <div className="p-3 bg-white">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 active:bg-gray-300 rounded-md font-semibold text-xs text-gray-700 transition-colors flex items-center justify-between"
                    >
                      <span>Select Style</span>
                      <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 uppercase font-bold">
                        {value || 'style-1'}
                      </span>
                    </button>

                    <StylePickerModal
                      isOpen={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                      selectedStyle={value || 'style-1'}
                      onSelectStyle={(newStyle) => onChange(newStyle)}
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
          render: ({ value = { title: true, file: true, branch: true, semester: true, download: true, year: true }, onChange }) => {
            const [isExpanded, setIsExpanded] = useState(true);
            const toggle = (field: string) => onChange({ ...value, [field]: !value[field] });
            const fields = [
              { key: 'title', label: 'Title' },
              { key: 'file', label: 'File' },
              { key: 'branch', label: 'Branch' },
              { key: 'semester', label: 'Semester' },
              { key: 'download', label: 'Download button' },
              { key: 'year', label: 'Year' },
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
                  <div className="p-2 flex flex-col gap-1 bg-white">
                    {fields.map(f => (
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
        }
      },
      defaultProps: {
        headerConfig: {
          title: 'Academic Timetables',
          description: 'Download the latest timetables for your academic year.',
        },
        cardStyle: 'style-1',
        showFields: { title: true, file: true, branch: true, semester: true, download: true, year: true },
      },
      render: ({ headerConfig, title, description, cardStyle, showFields }) => (
        <TimetableBlock 
          title={headerConfig?.title ?? title ?? 'Academic Timetables'} 
          description={headerConfig?.description ?? description ?? 'Download the latest timetables for your academic year.'}
          cardStyle={cardStyle}
          showFields={showFields}
        />
      ),
    },
  },
};
