import React, { useState } from 'react';
import { TabsConfig, TabBlueprint, TabComponentType } from '../../../../types/moduleStudio';
import {
  Plus, Trash2, GripVertical, FileText, Layers, Users, Image as ImageIcon,
  FileCheck, Settings, Check, Pencil, Eye, EyeOff
} from 'lucide-react';

interface StudioTabsEditorProps {
  tabsConfig?: TabsConfig;
  onChange: (updatedConfig: TabsConfig) => void;
}

export interface ComponentTypeMeta {
  label: string;
  desc: string;
  category: 'ui' | 'dynamic';
  categoryLabel: string;
  icon: React.ReactNode;
  defaultSample: any;
}

export const COMPONENT_TYPE_META: Record<string, ComponentTypeMeta> = {
  ui_section: {
    label: 'UI Content Section (Text Block / Accordion)',
    desc: 'Authored content panel: editor clicks + to choose Text Block (WYSIWYG) or Accordion Panels',
    category: 'ui',
    categoryLabel: 'UI Component',
    icon: <Layers className="w-4 h-4 text-blue-600" />,
    defaultSample: '',
  },
  faculty_grid: {
    label: 'Faculty & Staff Grid',
    desc: 'Member cards with portrait photo, designation, qualification, and contact links',
    category: 'dynamic',
    categoryLabel: 'Dynamic Component',
    icon: <Users className="w-4 h-4 text-emerald-600" />,
    defaultSample: [],
  },
  document_list: {
    label: 'Document Downloads',
    desc: 'PDF schedules, annual calendars, syllabi circulars, and notices',
    category: 'dynamic',
    categoryLabel: 'Dynamic Component',
    icon: <FileCheck className="w-4 h-4 text-rose-600" />,
    defaultSample: [],
  },
  media_gallery: {
    label: 'Photo Gallery',
    desc: 'Grid of lab facilities, seminar events, and field visit photos',
    category: 'dynamic',
    categoryLabel: 'Dynamic Component',
    icon: <ImageIcon className="w-4 h-4 text-purple-600" />,
    defaultSample: [],
  },
  // Aliases for backward compatibility
  rich_text: {
    label: 'UI Content Section (Text Block / Accordion)',
    desc: 'Authored content panel: editor clicks + to choose Text Block (WYSIWYG) or Accordion Panels',
    category: 'ui',
    categoryLabel: 'UI Component',
    icon: <FileText className="w-4 h-4 text-blue-600" />,
    defaultSample: '',
  },
  accordion: {
    label: 'UI Content Section (Text Block / Accordion)',
    desc: 'Authored content panel: editor clicks + to choose Text Block (WYSIWYG) or Accordion Panels',
    category: 'ui',
    categoryLabel: 'UI Component',
    icon: <Layers className="w-4 h-4 text-blue-600" />,
    defaultSample: [],
  },
};

export const StudioTabsEditor: React.FC<StudioTabsEditorProps> = ({ tabsConfig, onChange }) => {
  const currentTabs = tabsConfig?.defaultTabs || [];
  const allowRuntime = tabsConfig?.allowRuntimeCustomTabs ?? true;
  const allowedTypes = tabsConfig?.allowedElementTypes || (Object.keys(COMPONENT_TYPE_META) as TabComponentType[]);
  const updateConfig = (updatedTabs: TabBlueprint[]) => {
    onChange({
      defaultTabs: updatedTabs,
      allowRuntimeCustomTabs: allowRuntime,
      allowedElementTypes: allowedTypes,
      defaultLayoutStyle: tabsConfig?.defaultLayoutStyle || 'vertical_tabs',
    });
  };

  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabLabel, setNewTabLabel] = useState('');
  const [newTabType, setNewTabType] = useState<TabComponentType>('ui_section');

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editType, setEditType] = useState<TabComponentType>('ui_section');

  const handleStartEdit = (tab: TabBlueprint) => {
    setEditingTabId(tab.id);
    setEditLabel(tab.label);
    setEditType(tab.componentType === 'rich_text' || tab.componentType === 'accordion' ? 'ui_section' : tab.componentType);
  };

  const handleSaveEdit = (tabId: string) => {
    if (!editLabel.trim()) return;
    const newSlug = editLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const updated = currentTabs.map(t => {
      if (t.id === tabId) {
        return {
          ...t,
          label: editLabel.trim(),
          slug: newSlug || t.slug,
          componentType: editType,
          defaultContent: COMPONENT_TYPE_META[editType]?.defaultSample ?? t.defaultContent,
        };
      }
      return t;
    });

    updateConfig(updated);
    setEditingTabId(null);
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...currentTabs];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    updateConfig(reordered);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAddTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabLabel.trim()) return;

    const slug = newTabLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newBlueprint: TabBlueprint = {
      id: `tab_${Date.now().toString().slice(-4)}`,
      label: newTabLabel.trim(),
      slug: slug || `tab-${Date.now()}`,
      componentType: newTabType,
      defaultContent: COMPONENT_TYPE_META[newTabType].defaultSample,
      visible: true,
      allowRuntimeAdd: true,
    };

    const updated = [...currentTabs, newBlueprint];
    updateConfig(updated);

    setNewTabLabel('');
    setNewTabType('ui_section');
    setIsAddingTab(false);
  };

  const handleToggleVisible = (tabId: string) => {
    const updated = currentTabs.map(t => {
      if (t.id === tabId) {
        return {
          ...t,
          visible: t.visible === false ? true : false,
        };
      }
      return t;
    });

    updateConfig(updated);
  };

  const handleDeleteTab = (tabId: string) => {
    const updated = currentTabs.filter(t => t.id !== tabId);
    updateConfig(updated);
  };

  const handleUpdateTabType = (tabId: string, newType: TabComponentType) => {
    const updated = currentTabs.map(t => {
      if (t.id === tabId) {
        return {
          ...t,
          componentType: newType,
          defaultContent: COMPONENT_TYPE_META[newType].defaultSample,
        };
      }
      return t;
    });

    updateConfig(updated);
  };

  return (
    <div className="space-y-6">
      {/* Tabs List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Default tabs
          </h3>

          <button
            type="button"
            onClick={() => setIsAddingTab(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Default Tab
          </button>
        </div>

        {/* Add Tab Drawer / Inline Form */}
        {isAddingTab && (
          <div className="p-4 bg-blue-50/60 border-b border-blue-100 animate-in fade-in duration-200">
            <form onSubmit={handleAddTab} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">Define New Tab</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Tab Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTabLabel}
                    onChange={e => setNewTabLabel(e.target.value)}
                    placeholder="e.g. Research Labs, Student Testimonials..."
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Component / Element Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newTabType}
                    onChange={e => setNewTabType(e.target.value as TabComponentType)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <optgroup label="UI Components" className="font-bold text-gray-900">
                      <option value="ui_section" className="font-normal text-gray-700">UI Content (Text Block / Accordion)</option>
                    </optgroup>
                    <optgroup label="Dynamic Components" className="font-bold text-gray-900">
                      <option value="faculty_grid" className="font-normal text-gray-700">Faculty & Staff Grid</option>
                      <option value="document_list" className="font-normal text-gray-700">Document Downloads</option>
                      <option value="media_gallery" className="font-normal text-gray-700">Photo Gallery</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingTab(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs"
                >
                  Confirm & Add Tab
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Items */}
        <div className="divide-y divide-gray-100">
          {currentTabs.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No default tabs configured yet. Click "Add Default Tab" above to add tabs.
            </div>
          ) : (
            currentTabs.map((tab, idx) => {
              const meta = COMPONENT_TYPE_META[tab.componentType] || COMPONENT_TYPE_META.rich_text;
              const isEditing = editingTabId === tab.id;

              if (isEditing) {
                return (
                  <div key={tab.id} className="p-4 bg-blue-50/60 border-b border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-150">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Tab Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editLabel}
                          onChange={e => setEditLabel(e.target.value)}
                          placeholder="e.g. Overview, Faculty..."
                          className="w-full text-xs font-semibold px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Component / Element Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editType}
                          onChange={e => setEditType(e.target.value as TabComponentType)}
                          className="w-full text-xs font-medium px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <optgroup label="UI Components" className="font-bold text-gray-900">
                            <option value="ui_section" className="font-normal text-gray-700">UI Content (Text Block / Accordion)</option>
                          </optgroup>
                          <optgroup label="Dynamic Components" className="font-bold text-gray-900">
                            <option value="faculty_grid" className="font-normal text-gray-700">Faculty & Staff Grid</option>
                            <option value="document_list" className="font-normal text-gray-700">Document Downloads</option>
                            <option value="media_gallery" className="font-normal text-gray-700">Photo Gallery</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:pt-5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setEditingTabId(null)}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(tab.id)}
                        className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              const isDragging = draggedIndex === idx;
              const isDragOver = dragOverIndex === idx && draggedIndex !== idx;

              return (
                <div
                  key={tab.id}
                  draggable
                  onDragStart={e => handleDragStart(e, idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDrop={e => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 transition-all flex items-center justify-between gap-4 select-none cursor-grab active:cursor-grabbing ${
                    isDragging
                      ? 'opacity-40 bg-blue-50/50 border-2 border-dashed border-blue-400'
                      : isDragOver
                      ? 'bg-blue-50/30 border-t-2 border-blue-500'
                      : 'hover:bg-gray-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-gray-400 hover:text-gray-700 p-0.5" title="Drag to reorder">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${tab.visible === false ? 'text-gray-400' : 'text-gray-900'}`}>
                        {tab.label}
                      </span>
                      {tab.visible === false && (
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
                      {tab.componentType === 'ui_section' || tab.componentType === 'rich_text' || tab.componentType === 'accordion'
                        ? 'UI Content (Text / Accordion)'
                        : meta.label}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(tab)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Tab Settings"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleVisible(tab.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        tab.visible === false
                          ? 'text-gray-300 hover:text-gray-600 hover:bg-gray-100'
                          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title={tab.visible === false ? 'Show Section (Hidden)' : 'Hide Section'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTab(tab.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Tab"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
