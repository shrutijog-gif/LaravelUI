import React, { useState } from 'react';
import type { Config } from '@measured/puck';
import { ChevronDown } from 'lucide-react';
import { TimetableBlock, TimetableBlockProps } from './components/storefront/blocks/TimetableBlock';
import { CommitteesBlock } from './components/storefront/blocks/CommitteesBlock';
import { DepartmentsBlock } from './components/storefront/blocks/DepartmentsBlock';
import { Careers } from './components/storefront/blocks/Careers';
import { HeroBanner } from './components/storefront/blocks/HeroBanner';
import { PrincipalMessage } from './components/storefront/blocks/PrincipalMessage';
import { StylePickerModal } from './components/builder/StylePickerModal';

import { DynamicModuleBlock } from './components/storefront/blocks/DynamicModuleBlock';
import { CodeEditorBlock } from './components/storefront/blocks/CodeEditorBlock';
import { RichTextBlock } from './components/storefront/blocks/RichTextBlock';
import { HtmlCodeEditorField } from './components/builder/HtmlCodeEditorField';
import { RichTextEditorField } from './components/builder/RichTextEditorField';
import { getStoredStudioTemplates } from './data/mockStudioData';
import { getStoredDepartments } from './data/mockDepartmentData';

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
    const isComposite = schema.archetype === 'tabbed_composite';
    const defaultTabs = schema.tabsConfig?.defaultTabs || [];

    const facultyTabs = defaultTabs.filter((t: any) => t.componentType === 'faculty_grid');
    const docTabs = defaultTabs.filter((t: any) => t.componentType === 'document_list');
    const galleryTabs = defaultTabs.filter((t: any) => t.componentType === 'media_gallery');

    const hasFaculty = isComposite && (facultyTabs.length > 0 || defaultTabs.length === 0);
    const hasDocuments = isComposite && docTabs.length > 0;
    const hasGallery = isComposite && galleryTabs.length > 0;

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
        render: ({ value = { cardStyle: schema.slug !== 'awards' && schema.archetype !== 'tabbed_composite' ? 'table' : 'style-1', columns: 3 }, onChange }: any) => {
          const [isExpanded, setIsExpanded] = useState(true);
          const [isModalOpen, setIsModalOpen] = useState(false);
          const isComposite = schema.archetype === 'tabbed_composite';
          const isCustomModule = schema.slug !== 'awards' && !isComposite;
          
          const activeLayoutStyle = typeof value === 'object' && value?.layoutStyle
            ? value.layoutStyle
            : (typeof value === 'string' && (value === 'horizontal_tabs' || value === 'vertical_tabs' || value === 'runny_page')
                ? value
                : (schema.tabsConfig?.defaultLayoutStyle || 'vertical_tabs'));

          let activeStyle = typeof value === 'string' ? value : (value?.cardStyle || (isCustomModule ? 'table' : 'style-1'));
          if (isCustomModule && !activeStyle.startsWith('table') && !activeStyle.startsWith('list')) {
            activeStyle = 'table';
          }
          const activeColumns = typeof value === 'object' && value?.columns ? value.columns : 3;
          const isTable = activeStyle.startsWith('table');
          const isList = activeStyle.startsWith('list');

          return (
            <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
              >
                <span className="text-xs font-semibold text-gray-700">Style Settings</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="p-3 bg-white space-y-3">
                  {isComposite ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Layout Style
                      </label>
                      <select
                        value={activeLayoutStyle}
                        onChange={(e) => {
                          const currentObj = typeof value === 'object' ? value : {};
                          onChange({
                            ...currentObj,
                            layoutStyle: e.target.value,
                            cardStyle: e.target.value,
                          });
                        }}
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                      >
                        <option value="horizontal_tabs">Horizontal Tabs</option>
                        <option value="vertical_tabs">Vertical Tabs</option>
                        <option value="runny_page">Runny Page</option>
                      </select>

                      {activeLayoutStyle === 'runny_page' && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100">
                          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-gray-700 select-none">
                            <input
                              type="checkbox"
                              checked={value?.showJumpStrip !== false}
                              onChange={(e) => {
                                 const currentObj = typeof value === 'object' ? value : {};
                                onChange({
                                  ...currentObj,
                                  showJumpStrip: e.target.checked,
                                });
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            <span>Show Jump to strip</span>
                          </label>
                        </div>
                      )}
                    </div>
                  ) : isCustomModule ? (
                    /* Display View Dropdown: Table View vs List View for Custom Modules */
                    <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                      <span>Display View</span>
                      <select
                        value={isTable ? 'table' : 'list'}
                        onChange={(e) => {
                          const currentObj = typeof value === 'object' ? value : {};
                          onChange({ ...currentObj, cardStyle: e.target.value });
                        }}
                        className="bg-white border border-gray-200 px-2.5 py-1 rounded text-blue-600 font-bold text-xs outline-none cursor-pointer hover:border-blue-400 transition-colors shadow-2xs"
                      >
                        <option value="table">Table View</option>
                        <option value="list">List View</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      {/* 1-Click Layout View Switcher: Cards vs Table */}
                      <div className="flex items-center gap-1 p-1 bg-gray-100 border border-gray-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => {
                            const currentObj = typeof value === 'object' ? value : { columns: 3 };
                            const prevStyle = currentObj.cardStyle || 'style-1';
                            const newStyle = prevStyle.startsWith('table-') ? 'style-1' : prevStyle;
                            onChange({ ...currentObj, cardStyle: newStyle });
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            !isTable 
                              ? 'bg-white text-blue-600 shadow-2xs border border-gray-200/80 font-extrabold' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <span>🎴 Cards</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const currentObj = typeof value === 'object' ? value : { columns: 3 };
                            onChange({ ...currentObj, cardStyle: 'table-1' });
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isTable 
                              ? 'bg-white text-blue-600 shadow-2xs border border-gray-200/80 font-extrabold' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <span>📋 Table</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 active:bg-gray-300 rounded-md font-semibold text-xs text-gray-700 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>Select Style Preset</span>
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
                        moduleId={schema.slug || schema.id}
                        moduleTitle={schema.name}
                        onSelectStyle={(newStyle) => {
                          const currentObj = typeof value === 'object' ? value : { columns: 3 };
                          onChange({ ...currentObj, cardStyle: newStyle });
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          );
        },
      },

      ...(isComposite ? {
        ...(hasFaculty ? {
          /* Dynamic Component Controller: Faculty & Staff */
          facultyConfig: {
            type: 'custom',
            render: ({ value, onChange }: any) => {
              const [isExpanded, setIsExpanded] = useState(true);

              const activeObj = typeof value === 'object' && value !== null ? value : {
                viewMode: 'card',
                columns: 3,
                showPhoto: true,
                showDesignation: true,
                showDepartment: true,
                showProfileLink: true,
              };

              const viewMode = activeObj.viewMode || 'card';
              const columns = activeObj.columns || 3;
              const boxTitle = facultyTabs.length === 1 ? `${facultyTabs[0].label} Settings` : 'Faculty & Staff Settings';

              return (
                <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-gray-700">{boxTitle}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white space-y-2.5">
                      {/* Display View: Card View vs List View */}
                      <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                        <span>Display View</span>
                        <select
                          value={viewMode}
                          onChange={(e) => onChange({ ...activeObj, viewMode: e.target.value })}
                          className="bg-white border border-gray-200 px-2 py-0.5 rounded text-blue-600 font-bold text-xs outline-none cursor-pointer hover:border-blue-400 transition-colors"
                        >
                          <option value="card">Card View</option>
                          <option value="list">List View</option>
                        </select>
                      </div>

                      {/* Columns / Cards Per Row (when Card View) */}
                      {viewMode === 'card' && (
                        <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                          <span>Cards Per Row</span>
                          <select
                            value={columns}
                            onChange={(e) => onChange({ ...activeObj, columns: Number(e.target.value) })}
                            className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 font-bold text-[11px] outline-none cursor-pointer hover:border-blue-400 transition-colors"
                          >
                            <option value={2}>2 Cards</option>
                            <option value={3}>3 Cards</option>
                            <option value={4}>4 Cards</option>
                          </select>
                        </div>
                      )}

                      {/* Visual Element Checkboxes */}
                      <div className="pt-1 flex flex-col gap-0.5 border-t border-gray-100">
                        <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={activeObj.showPhoto !== false}
                            onChange={(e) => onChange({ ...activeObj, showPhoto: e.target.checked })}
                          />
                          <span>Photo / Avatar</span>
                        </label>

                        <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={activeObj.showDesignation !== false}
                            onChange={(e) => onChange({ ...activeObj, showDesignation: e.target.checked })}
                          />
                          <span>Designation</span>
                        </label>

                        <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={activeObj.showDepartment !== false}
                            onChange={(e) => onChange({ ...activeObj, showDepartment: e.target.checked })}
                          />
                          <span>Department / Stream</span>
                        </label>

                        <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={activeObj.showProfileLink !== false}
                            onChange={(e) => onChange({ ...activeObj, showProfileLink: e.target.checked })}
                          />
                          <span>View Profile Link</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            },
          },
        } : {}),

        ...(hasDocuments ? {
          /* Dynamic Component Controller: Document Downloads */
          documentsConfig: {
            type: 'custom',
            render: ({ value, onChange }: any) => {
              const [isExpanded, setIsExpanded] = useState(true);

              const activeObj = typeof value === 'object' && value !== null ? value : {
                viewMode: 'list',
                showDownloadBtn: true,
                showIcon: true,
              };

              const viewMode = activeObj.viewMode || 'list';
              const boxTitle = docTabs.length === 1 ? `${docTabs[0].label} Settings` : 'Document Downloads Settings';

              return (
                <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-gray-700">{boxTitle}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white space-y-2.5">
                      <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                        <span>Display View</span>
                        <select
                          value={viewMode}
                          onChange={(e) => onChange({ ...activeObj, viewMode: e.target.value })}
                          className="bg-white border border-gray-200 px-2 py-0.5 rounded text-blue-600 font-bold text-xs outline-none cursor-pointer hover:border-blue-400 transition-colors"
                        >
                          <option value="list">List View</option>
                          <option value="grid">Grid View</option>
                        </select>
                      </div>

                      <div className="pt-1 flex flex-col gap-0.5 border-t border-gray-100">
                        <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={activeObj.showDownloadBtn !== false}
                            onChange={(e) => onChange({ ...activeObj, showDownloadBtn: e.target.checked })}
                          />
                          <span>Download Button</span>
                        </label>

                        <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={activeObj.showIcon !== false}
                            onChange={(e) => onChange({ ...activeObj, showIcon: e.target.checked })}
                          />
                          <span>File Type Icon</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            },
          },
        } : {}),

        ...(hasGallery ? {
          /* Dynamic Component Controller: Photo Gallery */
          galleryConfig: {
            type: 'custom',
            render: ({ value, onChange }: any) => {
              const [isExpanded, setIsExpanded] = useState(true);

              const activeObj = typeof value === 'object' && value !== null ? value : {
                columns: 3,
                showCaption: true,
              };

              const columns = activeObj.columns || 3;
              const boxTitle = galleryTabs.length === 1 ? `${galleryTabs[0].label} Settings` : 'Photo Gallery Settings';

              return (
                <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-gray-700">{boxTitle}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white space-y-2.5">
                      <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                        <span>Columns Per Row</span>
                        <select
                          value={columns}
                          onChange={(e) => onChange({ ...activeObj, columns: Number(e.target.value) })}
                          className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 font-bold text-[11px] outline-none cursor-pointer hover:border-blue-400 transition-colors"
                        >
                          <option value={2}>2 Columns</option>
                          <option value={3}>3 Columns</option>
                          <option value={4}>4 Columns</option>
                        </select>
                      </div>

                      <div className="pt-1 flex flex-col gap-0.5 border-t border-gray-100">
                        <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none text-gray-700">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={activeObj.showCaption !== false}
                            onChange={(e) => onChange({ ...activeObj, showCaption: e.target.checked })}
                          />
                          <span>Photo Caption</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            },
          },
        } : {}),
      } : {
        /* 3. Card Fields Controller Box (Per-Entry Elements for Flat Modules) */
        showFields: {
          type: 'custom',
          render: ({ value, onChange }: any) => {
            const [isExpanded, setIsExpanded] = useState(true);

            const initialValues: Record<string, boolean> = {};
            fields.forEach((f: any) => { initialValues[f.name] = true; });

            const activeValue = value || initialValues;

            const toggle = (fieldKey: string) => {
              onChange({ ...activeValue, [fieldKey]: !activeValue[fieldKey] });
            };

            return (
              <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-gray-700">Module Fields Settings</span>
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
                  </div>
                )}
              </div>
            );
          }
        },

        /* 4. Block Features Controller Box (Whole-Block Features for Flat Modules) */
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
                  <span className="text-xs font-semibold text-gray-700">Block Features Settings</span>
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
      }),

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
                <span className="text-xs font-semibold text-gray-700">Advanced Settings</span>
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
          cardStyle: t.schema.archetype === 'tabbed_composite' ? 'vertical_tabs' : (t.schema.slug !== 'awards' ? 'table' : 'style-1'),
          layoutStyle: t.schema.archetype === 'tabbed_composite' ? (t.schema.tabsConfig?.defaultLayoutStyle || 'vertical_tabs') : undefined,
          columns: 3,
        },
        ...(t.schema.archetype === 'tabbed_composite' ? {
          facultyConfig: {
            viewMode: 'card',
            columns: 3,
            showPhoto: true,
            showDesignation: true,
            showDepartment: true,
            showProfileLink: true,
          },
          documentsConfig: {
            viewMode: 'list',
            showDownloadBtn: true,
            showIcon: true,
          },
          galleryConfig: {
            columns: 3,
            showCaption: true,
          },
        } : {}),
        advancedConfig: {
          anchorId: '',
          className: '',
        },
      },
      render: ({ headerConfig, styleConfig, showFields, toolbarConfig, advancedConfig, facultyConfig, documentsConfig, galleryConfig }: any) => {
        const isComposite = t.schema.archetype === 'tabbed_composite';
        const isCustomModule = t.schema.slug !== 'awards' && !isComposite;
        const defaultStyle = isComposite ? 'vertical_tabs' : (isCustomModule ? 'table' : 'style-1');
        const resolvedLayoutStyle = (typeof styleConfig === 'object' ? (styleConfig?.layoutStyle || styleConfig?.cardStyle) : styleConfig) ?? defaultStyle;
        let resolvedStyle = (typeof styleConfig === 'object' ? styleConfig?.cardStyle : styleConfig) ?? defaultStyle;
        if (isCustomModule && !resolvedStyle.startsWith('table') && !resolvedStyle.startsWith('list')) {
          resolvedStyle = 'table';
        }
        const resolvedColumns = (typeof styleConfig === 'object' ? styleConfig?.columns : 3) ?? 3;
        const resolvedClass = (typeof advancedConfig === 'object' ? advancedConfig?.className : '') ?? '';
        const resolvedAnchorId = (typeof advancedConfig === 'object' ? advancedConfig?.anchorId : '') ?? '';

        const combinedShowFields = {
          ...showFields,
          search: toolbarConfig?.search,
          categoryFilter: toolbarConfig?.categoryFilter,
          pagination: toolbarConfig?.pagination,
        };

        const resolvedShowJumpStrip = typeof styleConfig === 'object' ? (styleConfig?.showJumpStrip !== false) : true;

        const resolvedFacultyConfig = {
          viewMode: facultyConfig?.viewMode || 'card',
          columns: facultyConfig?.columns || 3,
          showPhoto: facultyConfig?.showPhoto !== false,
          showDesignation: facultyConfig?.showDesignation !== false,
          showDepartment: facultyConfig?.showDepartment !== false,
          showProfileLink: facultyConfig?.showProfileLink !== false,
        };

        const resolvedDocumentsConfig = {
          viewMode: documentsConfig?.viewMode || 'list',
          showDownloadBtn: documentsConfig?.showDownloadBtn !== false,
          showIcon: documentsConfig?.showIcon !== false,
        };

        const resolvedGalleryConfig = {
          columns: galleryConfig?.columns || 3,
          showCaption: galleryConfig?.showCaption !== false,
        };

        return (
          <DynamicModuleBlock
            moduleSlug={slug}
            template={t}
            titleOverride={headerConfig?.title}
            descriptionOverride={headerConfig?.description}
            headerAlign={headerConfig?.align || 'left'}
            cardStyle={resolvedStyle as any}
            layoutStyle={resolvedLayoutStyle as any}
            showJumpStrip={resolvedShowJumpStrip}
            columns={resolvedColumns as any}
            className={resolvedClass}
            anchorId={resolvedAnchorId}
            showFields={combinedShowFields}
            dynamicTabSettings={{
              faculty: resolvedFacultyConfig,
              documents: resolvedDocumentsConfig,
              gallery: resolvedGalleryConfig,
            }}
          />
        );
      },
    };

    return componentKey;
  });

  const rawComponents: Record<string, any> = {
    ...dynamicModuleComponents,
      HeroBanner: {
        label: '🏛️ Hero Campus Banner',
        fields: {
          tagline: { type: 'text', label: 'Tagline Pill' },
          title: { type: 'text', label: 'Main Headline' },
          subtitle: { type: 'textarea', label: 'Subtitle Description' },
          bgImageUrl: { type: 'text', label: 'Background Image URL' },
          primaryCtaText: { type: 'text', label: 'Primary Button Label' },
          primaryCtaLink: { type: 'text', label: 'Primary Button Link' },
          secondaryCtaText: { type: 'text', label: 'Secondary Button Label' },
          secondaryCtaLink: { type: 'text', label: 'Secondary Button Link' },
          admissionTitle: { type: 'text', label: 'Admission Card Title' },
          admissionStatus: { type: 'text', label: 'Admission Status Tag' },
          highlight1: { type: 'text', label: 'Highlight Bullet 1' },
          highlight2: { type: 'text', label: 'Highlight Bullet 2' },
          highlight3: { type: 'text', label: 'Highlight Bullet 3' },
          anchorId: { type: 'text', label: 'Section Anchor ID' },
          className: { type: 'text', label: 'CSS Class' },
        },
        defaultProps: {
          tagline: 'Premier Centre of Higher Learning & Research',
          title: 'Empowering Generations Through Excellence & Innovation',
          subtitle: 'Discover cutting-edge academic curricula, world-class laboratory infrastructure, renowned faculty mentorship, and a thriving campus ecosystem designed for visionary leaders of tomorrow.',
          bgImageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop',
          primaryCtaText: 'Explore Academic Programs',
          primaryCtaLink: '#admissions',
          secondaryCtaText: 'View Timetables',
          secondaryCtaLink: '#timetables-section',
          admissionTitle: 'Apply for Academic Year 2026-27',
          admissionStatus: 'Open',
          highlight1: 'State-of-the-Art Research Laboratories & Digital Library',
          highlight2: '100% Placement Assistance & Corporate Partnerships',
          highlight3: 'Scholarship Grants for Merit & Economically Weaker Students',
          anchorId: 'hero',
          className: '',
        },
        render: (props: any) => <HeroBanner {...props} />,
      },
      PrincipalMessage: {
        label: "🎓 Principal's Message",
        fields: {
          principalName: { type: 'text', label: 'Principal Name' },
          principalTitle: { type: 'text', label: 'Designation / Title' },
          leadershipBadge: { type: 'text', label: 'Experience Badge' },
          messageTag: { type: 'text', label: 'Category Tag' },
          messageTitle: { type: 'text', label: 'Quote / Main Title' },
          paragraph1: { type: 'textarea', label: 'Paragraph 1' },
          paragraph2: { type: 'textarea', label: 'Paragraph 2' },
          anchorId: { type: 'text', label: 'Section Anchor ID' },
          className: { type: 'text', label: 'CSS Class' },
        },
        defaultProps: {
          principalName: 'Dr. Ananya Sharma',
          principalTitle: 'Principal & Dean',
          leadershipBadge: '25+ Yrs Academic Leadership',
          messageTag: 'Message from Leadership',
          messageTitle: '"Fostering Academic Rigor, Character & Global Competence"',
          paragraph1: 'Welcome to our esteemed institution. Education is not merely the acquisition of knowledge; it is the empowerment to think critically, innovate fearlessly, and serve society with integrity.',
          paragraph2: 'Our faculty members are world-class researchers and mentors who guide students through rigorous curriculum, practical industry projects, and holistic co-curricular growth. We invite you to explore our academic programs and join our vibrant community.',
          anchorId: 'principal-message',
          className: '',
        },
        render: (props: any) => <PrincipalMessage {...props} />,
      },
      RichText: {
        label: 'Rich Text',
        fields: {
          richTextConfig: {
            type: 'custom',
            render: ({ value = { content: '<p>Please Edit This</p>' }, onChange }: any) => {
              return (
                <RichTextEditorField
                  value={value}
                  onChange={onChange}
                />
              );
            },
          },
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
                    <span className="text-xs font-semibold text-gray-700">Advanced Settings</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white space-y-2">
                      <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between gap-2">
                        <span className="shrink-0">Anchor Id</span>
                        <input
                          type="text"
                          placeholder="e.g. rich-text-section"
                          className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-mono text-gray-800 text-left w-36 outline-none focus:border-blue-500"
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
                          placeholder="e.g. custom-prose"
                          className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-mono text-gray-800 text-left w-36 outline-none focus:border-blue-500"
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
          richTextConfig: {
            content: '<p>Please Edit This</p>',
          },
          advancedConfig: {
            anchorId: '',
            className: '',
          },
        },
        render: ({ richTextConfig, advancedConfig, content, className, anchorId }: any) => {
          return (
            <RichTextBlock
              richTextConfig={richTextConfig}
              advancedConfig={advancedConfig}
              content={content}
              className={className}
              anchorId={anchorId}
            />
          );
        },
      },
      CodeEditor: {
        label: 'Code Editer',
        fields: {
          /* 1. HTML Code Editor */
          codeConfig: {
            type: 'custom',
            render: ({ value = { code: '', editorHeight: '500px', containerStyle: 'default' }, onChange }: any) => {
              return (
                <HtmlCodeEditorField 
                  value={value} 
                  onChange={onChange} 
                />
              );
            },
          },
        },
        defaultProps: {
          codeConfig: {
            code: '',
            editorHeight: '500px',
            containerStyle: 'default',
          },
        },
        render: ({ codeConfig, code }: any) => {
          return (
            <CodeEditorBlock
              codeConfig={codeConfig}
              code={code}
            />
          );
        },
      },
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
        render: ({ moduleSlug, titleOverride, descriptionOverride, moduleConfig, headerConfig }: any) => (
          <DynamicModuleBlock
            moduleSlug={moduleSlug || moduleConfig?.moduleSlug || 'awards'}
            titleOverride={titleOverride || headerConfig?.title}
            descriptionOverride={descriptionOverride || headerConfig?.description}
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

          /* 3. Members Settings */
          membersConfig: {
            type: 'custom',
            render: ({ value = { showPhoto: true, showDesignation: true, gridCols: 2, cardStyle: '' }, onChange }: any) => {
              const [isExpanded, setIsExpanded] = useState(true);
              const [isModalOpen, setIsModalOpen] = useState(false);
              const activeStyle = value?.cardStyle ?? '';
              const activeColumns = value?.gridCols ?? 2;

              return (
                <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-gray-700">Members Settings</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="p-3 bg-white">
                      {/* Content Settings */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value?.showPhoto ?? true}
                            onChange={(e) => onChange({ ...value, showPhoto: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs font-semibold text-gray-700">Show Profile Photo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value?.showDesignation ?? true}
                            onChange={(e) => onChange({ ...value, showDesignation: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs font-semibold text-gray-700">Show Designation</span>
                        </label>
                      </div>

                      <hr className="my-4 border-gray-100" />

                      {/* Style Settings */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 active:bg-gray-300 rounded-md font-semibold text-xs text-gray-700 transition-colors flex items-center justify-between"
                        >
                          <span>Select Style</span>
                          <span className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 uppercase font-bold">
                            {activeStyle || 'Default'}
                          </span>
                        </button>

                        <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                          <span>Cards Per Row</span>
                          <select
                            value={activeColumns}
                            onChange={(e) => onChange({ ...value, gridCols: parseInt(e.target.value) })}
                            className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 font-bold text-[11px] outline-none cursor-pointer hover:border-blue-400 transition-colors"
                          >
                            <option value={1}>1 Card</option>
                            <option value={2}>2 Cards</option>
                            <option value={3}>3 Cards</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <StylePickerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedStyle={activeStyle}
                    onSelectStyle={(newStyle) => {
                      onChange({ ...value, cardStyle: newStyle });
                    }}
                  />
                </div>
              );
            },
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
                    <span className="text-xs font-semibold text-gray-700">Advanced Settings</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white space-y-2">
                      <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between gap-2">
                        <span className="shrink-0">Anchor Id</span>
                        <input
                          type="text"
                          placeholder="e.g. committees-section"
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
          membersConfig: { showPhoto: true, showDesignation: true, gridCols: 2, cardStyle: '' },
          advancedConfig: { anchorId: '', className: '' },
        },
        render: ({ headerConfig, committeeConfig, membersConfig, advancedConfig }: any) => {
          const title = headerConfig?.title ?? 'Committees';
          const description = headerConfig?.description ?? '';
          const committeeId = committeeConfig?.committeeId ?? 'c1';
          const gridCols = membersConfig?.gridCols ?? 2;
          const cardStyle = membersConfig?.cardStyle ?? '';
          const showPhoto = membersConfig?.showPhoto ?? true;
          const showDesignation = membersConfig?.showDesignation ?? true;
          const anchorId = typeof advancedConfig === 'object' ? advancedConfig?.anchorId : '';
          const className = typeof advancedConfig === 'object' ? advancedConfig?.className : (typeof advancedConfig === 'string' ? advancedConfig : '');
          
          return (
            <CommitteesBlock 
              committeeId={committeeId}
              title={title}
              description={description}
              showPhoto={showPhoto}
              showDesignation={showDesignation}
              gridCols={gridCols}
              cardStyle={cardStyle}
              anchorId={anchorId}
              className={className}
            />
          );
        },
      },
      DepartmentsBlock: {
        label: 'Departments',
        fields: {
          /* 1. Block Header accordion */
          headerConfig: {
            type: 'custom',
            render: ({ value = { title: 'Academic Departments', description: '' }, onChange }: any) => {
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
                          value={value?.title ?? 'Academic Departments'}
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

          /* 2. Department Selector accordion */
          departmentConfig: {
            type: 'custom',
            render: ({ value = { departmentId: 'dept-1' }, onChange }: any) => {
              const [isExpanded, setIsExpanded] = useState(true);
              const departments = getStoredDepartments();
              const selected = departments.find(d => d.id === (value?.departmentId ?? 'dept-1')) || departments[0];

              return (
                <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-gray-700">Department</span>
                    <div className="flex items-center gap-2">
                      {!isExpanded && selected && (
                        <span className="text-xs font-semibold text-blue-600 uppercase">{selected.name}</span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="p-3 bg-white">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Select Department</label>
                      <select
                        value={value?.departmentId ?? 'dept-1'}
                        onChange={(e) => onChange({ ...value, departmentId: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} {d.stream ? `(${d.stream})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            },
          },

              /* 3. Teaching Staff Accordion */
              teachingConfig: {
                type: 'custom',
                render: ({ value = { showPhoto: true, showDesignation: true, gridCols: 2, cardStyle: '' }, onChange }: any) => {
                  const [isExpanded, setIsExpanded] = useState(false);
                  const [isModalOpen, setIsModalOpen] = useState(false);
                  const activeStyle = value?.cardStyle ?? '';
                  const activeColumns = value?.gridCols ?? 2;

                  return (
                    <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                      >
                        <span className="text-xs font-semibold text-gray-700">Teaching Staff</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className="p-3 bg-white">
                          <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value?.showPhoto ?? true}
                                onChange={(e) => onChange({ ...value, showPhoto: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-xs font-semibold text-gray-700">Show Profile Photo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value?.showDesignation ?? true}
                                onChange={(e) => onChange({ ...value, showDesignation: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-xs font-semibold text-gray-700">Show Designation</span>
                            </label>
                          </div>

                          <hr className="my-3 border-gray-100" />

                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(true)}
                              className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 transition-colors flex items-center justify-between"
                            >
                              <span>Select Style</span>
                              <span className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 uppercase font-bold">
                                {activeStyle || 'Default'}
                              </span>
                            </button>

                            <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                              <span>Cards Per Row</span>
                              <select
                                value={activeColumns}
                                onChange={(e) => onChange({ ...value, gridCols: parseInt(e.target.value) })}
                                className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 font-bold text-[11px] outline-none cursor-pointer"
                              >
                                <option value={1}>1 Card</option>
                                <option value={2}>2 Cards</option>
                                <option value={3}>3 Cards</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      <StylePickerModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        selectedStyle={activeStyle}
                        onSelectStyle={(newStyle) => onChange({ ...value, cardStyle: newStyle })}
                      />
                    </div>
                  );
                },
              },

              /* 4. Non Teaching Staff Accordion */
              nonTeachingConfig: {
                type: 'custom',
                render: ({ value = { showPhoto: true, showDesignation: true, gridCols: 2, cardStyle: '' }, onChange }: any) => {
                  const [isExpanded, setIsExpanded] = useState(false);
                  const [isModalOpen, setIsModalOpen] = useState(false);
                  const activeStyle = value?.cardStyle ?? '';
                  const activeColumns = value?.gridCols ?? 2;

                  return (
                    <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                      >
                        <span className="text-xs font-semibold text-gray-700">Non Teaching Staff</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className="p-3 bg-white">
                          <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value?.showPhoto ?? true}
                                onChange={(e) => onChange({ ...value, showPhoto: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-xs font-semibold text-gray-700">Show Profile Photo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value?.showDesignation ?? true}
                                onChange={(e) => onChange({ ...value, showDesignation: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-xs font-semibold text-gray-700">Show Designation</span>
                            </label>
                          </div>

                          <hr className="my-3 border-gray-100" />

                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(true)}
                              className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 transition-colors flex items-center justify-between"
                            >
                              <span>Select Style</span>
                              <span className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 uppercase font-bold">
                                {activeStyle || 'Default'}
                              </span>
                            </button>

                            <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                              <span>Cards Per Row</span>
                              <select
                                value={activeColumns}
                                onChange={(e) => onChange({ ...value, gridCols: parseInt(e.target.value) })}
                                className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 font-bold text-[11px] outline-none cursor-pointer"
                              >
                                <option value={1}>1 Card</option>
                                <option value={2}>2 Cards</option>
                                <option value={3}>3 Cards</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      <StylePickerModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        selectedStyle={activeStyle}
                        onSelectStyle={(newStyle) => onChange({ ...value, cardStyle: newStyle })}
                      />
                    </div>
                  );
                },
              },

              /* 5. Distinguished Alumnae Accordion */
              alumnaeConfig: {
                type: 'custom',
                render: ({ value = { showPhoto: true, showDesignation: true, gridCols: 2, cardStyle: '' }, onChange }: any) => {
                  const [isExpanded, setIsExpanded] = useState(false);
                  const [isModalOpen, setIsModalOpen] = useState(false);
                  const activeStyle = value?.cardStyle ?? '';
                  const activeColumns = value?.gridCols ?? 2;

                  return (
                    <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                      >
                        <span className="text-xs font-semibold text-gray-700">Distinguished Alumnae</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className="p-3 bg-white">
                          <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value?.showPhoto ?? true}
                                onChange={(e) => onChange({ ...value, showPhoto: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-xs font-semibold text-gray-700">Show Profile Photo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value?.showDesignation ?? true}
                                onChange={(e) => onChange({ ...value, showDesignation: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-xs font-semibold text-gray-700">Show Batch / Profession</span>
                            </label>
                          </div>

                          <hr className="my-3 border-gray-100" />

                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(true)}
                              className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 transition-colors flex items-center justify-between"
                            >
                              <span>Select Style</span>
                              <span className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 uppercase font-bold">
                                {activeStyle || 'Default'}
                              </span>
                            </button>

                            <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                              <span>Cards Per Row</span>
                              <select
                                value={activeColumns}
                                onChange={(e) => onChange({ ...value, gridCols: parseInt(e.target.value) })}
                                className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 font-bold text-[11px] outline-none cursor-pointer"
                              >
                                <option value={1}>1 Card</option>
                                <option value={2}>2 Cards</option>
                                <option value={3}>3 Cards</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      <StylePickerModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        selectedStyle={activeStyle}
                        onSelectStyle={(newStyle) => onChange({ ...value, cardStyle: newStyle })}
                      />
                    </div>
                  );
                },
              },

              /* 6. Photo Gallery Accordion */
              galleryConfig: {
                type: 'custom',
                render: ({ value = { gridCols: 2, aspectRatio: 'video' }, onChange }: any) => {
                  const [isExpanded, setIsExpanded] = useState(false);
                  const activeColumns = value?.gridCols ?? 2;
                  const activeAspectRatio = value?.aspectRatio ?? 'video';

                  return (
                    <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                      >
                        <span className="text-xs font-semibold text-gray-700">Photo Gallery</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className="p-3 bg-white space-y-2">
                          <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                            <span>Photos Per Row</span>
                            <select
                              value={activeColumns}
                              onChange={(e) => onChange({ ...value, gridCols: parseInt(e.target.value) })}
                              className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 font-bold text-[11px] outline-none cursor-pointer"
                            >
                              <option value={2}>2 Columns</option>
                              <option value={3}>3 Columns</option>
                              <option value={4}>4 Columns</option>
                            </select>
                          </div>

                          <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between">
                            <span>Aspect Ratio</span>
                            <select
                              value={activeAspectRatio}
                              onChange={(e) => onChange({ ...value, aspectRatio: e.target.value })}
                              className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-blue-600 font-bold text-[11px] outline-none cursor-pointer"
                            >
                              <option value="video">Landscape (16:9)</option>
                              <option value="square">Square (1:1)</option>
                              <option value="tall">Portrait (3:4)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                },
              },

              /* 7. Advanced accordion */
              advancedConfig: {
                type: 'custom',
                render: ({ value = { anchorId: '', className: '' }, onChange }: any) => {
                  const [isExpanded, setIsExpanded] = useState(false);
                  const activeAnchorId = value?.anchorId ?? '';
                  const activeClassName = value?.className ?? '';

                  return (
                    <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                      >
                        <span className="text-xs font-semibold text-gray-700">Advanced</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className="p-3 space-y-2 bg-white">
                          <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between gap-2">
                            <span className="shrink-0">Anchor Id</span>
                            <input
                              type="text"
                              placeholder="e.g. dept-section"
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
                              placeholder="e.g. custom-dept-class"
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
              headerConfig: { title: 'Departments', description: '' },
              departmentConfig: { departmentId: 'dept-1' },
              teachingConfig: { showPhoto: true, showDesignation: true, gridCols: 2, cardStyle: '' },
              nonTeachingConfig: { showPhoto: true, showDesignation: true, gridCols: 2, cardStyle: '' },
              alumnaeConfig: { showPhoto: true, showDesignation: true, gridCols: 2, cardStyle: '' },
              galleryConfig: { gridCols: 2, aspectRatio: 'video' },
              advancedConfig: { anchorId: '', className: '' },
            },
            render: ({ headerConfig, departmentConfig, teachingConfig, nonTeachingConfig, alumnaeConfig, galleryConfig, advancedConfig }: any) => {
              const title = headerConfig?.title ?? 'Departments';
              const description = headerConfig?.description ?? '';
              const departmentId = departmentConfig?.departmentId ?? 'dept-1';
              const anchorId = typeof advancedConfig === 'object' ? advancedConfig?.anchorId : '';
              const className = typeof advancedConfig === 'object' ? advancedConfig?.className : (typeof advancedConfig === 'string' ? advancedConfig : '');

              return (
                <DepartmentsBlock
                  departmentId={departmentId}
                  title={title}
                  description={description}
                  teachingConfig={teachingConfig}
                  nonTeachingConfig={nonTeachingConfig}
                  alumnaeConfig={alumnaeConfig}
                  galleryConfig={galleryConfig}
                  anchorId={anchorId}
                  className={className}
                />
              );
            },
          },
      TimetableBlock: {
      label: 'Timetables',
      fields: {
        /* 1. Header Controller Box */
        headerConfig: {
          type: 'custom',
          render: ({ value = { title: 'Academic Timetables', description: 'Download the latest timetables for your academic year.' }, onChange }: any) => {
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
          render: ({ value = { cardStyle: 'style-1', columns: 3, className: '' }, onChange }: any) => {
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
                  <span className="text-xs font-semibold text-gray-700">Style Settings</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="p-3 bg-white space-y-3">
                    {/* 1-Click Layout View Switcher: Cards vs Table */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100 border border-gray-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          const currentObj = typeof value === 'object' ? value : { columns: 3 };
                          const prevStyle = currentObj.cardStyle || 'style-1';
                          const newStyle = prevStyle.startsWith('table-') ? 'style-1' : prevStyle;
                          onChange({ ...currentObj, cardStyle: newStyle });
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          !isTable 
                            ? 'bg-white text-blue-600 shadow-2xs border border-gray-200/80 font-extrabold' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <span>🎴 Cards</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const currentObj = typeof value === 'object' ? value : { columns: 3 };
                          onChange({ ...currentObj, cardStyle: 'table-1' });
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isTable 
                            ? 'bg-white text-blue-600 shadow-2xs border border-gray-200/80 font-extrabold' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <span>📋 Table</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 active:bg-gray-300 rounded-md font-semibold text-xs text-gray-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Select Style Preset</span>
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
                      moduleId="timetable"
                      moduleTitle="Academic Timetables"
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
          render: ({ value = { title: true, year: true, file: true, branch: true, semester: true }, onChange }: any) => {
            const [isExpanded, setIsExpanded] = useState(true);
            const toggle = (field: string) => onChange({ ...value, [field]: !value[field] });
            
            const coreFields = [
              { key: 'title', label: 'Name' },
              { key: 'year', label: 'Year' },
              { key: 'file', label: 'File Name' },
              { key: 'branch', label: 'Branch' },
              { key: 'semester', label: 'Semester' },
            ];

            return (
              <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-gray-700">Module Fields Settings</span>
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
                  <span className="text-xs font-semibold text-gray-700">Advanced Settings</span>
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
        showFields: { title: true, year: true, file: true, branch: true, semester: true },
      },
      render: ({ headerConfig, styleConfig, advancedConfig, cardStyle, columns, className, anchorId, title, description, showFields }: any) => {
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

  // ═══════════════════════════════════════════════════════
  // CAREERS BLOCK
  // ═══════════════════════════════════════════════════════
  Careers: {
    label: 'Careers',
    fields: {
      /* 1. Block Header */
      headerConfig: {
        type: 'custom',
        render: ({ value = { title: "We're Hiring", description: 'Join our growing team. Explore open roles and apply today.' }, onChange }: any) => {
          const [isExpanded, setIsExpanded] = useState(true);
          return (
            <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
              <button type="button" onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left">
                <span className="text-xs font-semibold text-gray-700">Block Header</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              {isExpanded && (
                <div className="p-3 space-y-3 bg-white">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                    <input type="text" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={value?.title ?? "We're Hiring"}
                      onChange={(e) => onChange({ ...value, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                    <textarea rows={2} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y outline-none"
                      value={value?.description ?? 'Join our growing team. Explore open roles and apply today.'}
                      onChange={(e) => onChange({ ...value, description: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          );
        },
      },

      /* 2. Advanced Controller */
      advancedConfig: {
        type: 'custom',
        render: ({ value = { anchorId: '', className: '' }, onChange }: any) => {
          const [isExpanded, setIsExpanded] = useState(false);
          const activeAnchorId = typeof value === 'object' && value?.anchorId ? value.anchorId : '';
          const activeClassName = typeof value === 'object' && value?.className ? value.className : '';
          return (
            <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
              <button type="button" onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-200/80 transition-colors text-left">
                <span className="text-xs font-semibold text-gray-700">Advanced Settings</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              {isExpanded && (
                <div className="p-3 bg-white space-y-2">
                  <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between gap-2">
                    <span className="shrink-0">Anchor Id</span>
                    <input type="text" placeholder="e.g. careers-section"
                      className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-mono text-gray-800 text-left w-36 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={activeAnchorId}
                      onChange={(e) => onChange({ ...value, anchorId: e.target.value })} />
                  </div>
                  <div className="w-full py-1.5 px-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 flex items-center justify-between gap-2">
                    <span className="shrink-0">Css Class</span>
                    <input type="text" placeholder="e.g. custom-class"
                      className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-mono text-gray-800 text-left w-36 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={activeClassName}
                      onChange={(e) => onChange({ ...value, className: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          );
        },
      },
    },
    defaultProps: {
      headerConfig: { title: "We're Hiring", description: 'Join our growing team. Explore open roles and apply today.' },
      advancedConfig: { anchorId: '', className: '' },
    },
    render: ({ headerConfig, advancedConfig }: any) => {
      return (
        <Careers
          title={headerConfig?.title ?? "We're Hiring"}
          description={headerConfig?.description ?? ''}
          columns={3}
          showSearch={false}
          className={advancedConfig?.className ?? ''}
          anchorId={advancedConfig?.anchorId ?? ''}
        />
      );
    },
  },
};

  const componentsProxy = new Proxy(rawComponents, {
    get(target: any, prop: string | symbol) {
      if (typeof prop === 'string') {
        if (prop in target) return target[prop];
        if (prop.startsWith('Studio_')) {
          const modSlug = prop.replace('Studio_', '');
          return {
            label: `⚡ ${modSlug}`,
            fields: {},
            render: () => (
              <div className="py-6 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/70 text-gray-500 text-xs">
                <span className="font-semibold text-gray-700">Module [{modSlug}]</span> is not configured in Module Studio.
              </div>
            )
          };
        }
      }
      return target[prop as string];
    },
    has(target: any, prop: string | symbol) {
      if (prop in target) return true;
      if (typeof prop === 'string' && prop.startsWith('Studio_')) return true;
      return false;
    }
  });

  return {
    categories: {
      'SYSTEM COMPONENTS': {
        components: ['CodeEditor'],
      },
      'UI COMPONENTS': {
        components: ['RichText'],
      },
      '⚡ Module Studio': {
        components: [...studioComponentKeys, 'DynamicStudioModule'],
      },
      '🏛️ University Sections': {
        components: ['HeroBanner', 'PrincipalMessage'],
      },
      '📝 General Components': {
        components: ['HeadingBlock', 'TimetableBlock', 'CommitteesBlock', 'DepartmentsBlock', 'Careers'],
      },
    },
    components: componentsProxy,
  };
};

export const config = getDynamicPuckConfig();
