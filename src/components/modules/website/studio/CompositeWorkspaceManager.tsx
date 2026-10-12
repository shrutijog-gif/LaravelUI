import React, { useState, useEffect } from 'react';
import {
  DynamicEntityItem, ModuleSchema, DynamicTabItemData, TabComponentType, TabBlueprint
} from '../../../../types/moduleStudio';
import {
  getStoredStudioTemplates,
  saveStudioTemplates,
  getStoredEntitiesBySlug,
  saveStoredEntitiesBySlug,
} from '../../../../data/mockStudioData';
import {
  AlignLeft, Layers, Users, Image as ImageIcon, FileCheck, Plus, X,
  Settings, Check, Trash2, ChevronUp, ChevronDown, Eye, EyeOff,
  Pencil, Search, ExternalLink, Download, Upload, Bold, Italic, Underline,
  List, ListOrdered, Link2, Sparkles, GripVertical
} from 'lucide-react';

interface CompositeWorkspaceManagerProps {
  entity: DynamicEntityItem;
  schema: ModuleSchema;
  onBack: () => void;
  onUpdateEntity: (updatedEntity: DynamicEntityItem) => void;
}

// ─────────────────────────────────────────────
// Add Element Modal (Screenshot 6)
// ─────────────────────────────────────────────
const AddElementModal: React.FC<{
  onClose: () => void;
  onSelect: (type: TabComponentType) => void;
}> = ({ onClose, onSelect }) => (
  <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">Add Element</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Category 1: UI Content Components */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              🎨 UI Content Components
            </span>
            <span className="text-[11px] text-gray-500 font-normal">Authored directly on this tab</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: 'rich_text' as TabComponentType,
                icon: <AlignLeft className="w-6 h-6 text-white" />,
                label: 'Text Block',
                desc: 'A block of text with WYSIWYG editor',
                badge: 'UI Block',
              },
              {
                id: 'accordion' as TabComponentType,
                icon: <Layers className="w-6 h-6 text-white" />,
                label: 'Accordion',
                desc: 'Collapsible Content Panels',
                badge: 'UI Block',
              },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt.id)}
                className="border-2 border-gray-100 rounded-xl p-3.5 text-left hover:border-blue-400 hover:bg-blue-50/40 transition-all group flex flex-col justify-between min-h-[125px]"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-2.5 group-hover:bg-blue-700 transition-colors shadow-xs">
                  {opt.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{opt.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Category 2: Dynamic Components */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              ⚡ Dynamic Components
            </span>
            <span className="text-[11px] text-gray-500 font-normal">Linked module entities & data</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: 'faculty_grid' as TabComponentType,
                icon: <Users className="w-6 h-6 text-white" />,
                label: 'Faculty Grid',
                desc: 'Staff directory cards with photos',
                badge: 'Dynamic',
              },
              {
                id: 'document_list' as TabComponentType,
                icon: <FileCheck className="w-6 h-6 text-white" />,
                label: 'Document List',
                desc: 'Downloadable PDFs & circulars',
                badge: 'Dynamic',
              },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt.id)}
                className="border-2 border-gray-100 rounded-xl p-3.5 text-left hover:border-purple-400 hover:bg-purple-50/40 transition-all group flex flex-col justify-between min-h-[125px]"
              >
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center mb-2.5 group-hover:bg-purple-700 transition-colors shadow-xs">
                  {opt.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{opt.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Runtime Tab Settings Modal (⚙)
// ─────────────────────────────────────────────
interface TabSettingsModalProps {
  tabs: DynamicTabItemData[];
  onClose: () => void;
  onSaveTabs: (updatedTabs: DynamicTabItemData[], shouldSyncAll?: boolean) => void;
}

const TabSettingsModal: React.FC<TabSettingsModalProps> = ({ tabs, onClose, onSaveTabs }) => {
  const [localTabs, setLocalTabs] = useState<DynamicTabItemData[]>([...tabs]);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [syncDone, setSyncDone] = useState(false);

  const startEdit = (tab: DynamicTabItemData) => {
    setEditingTabId(tab.id);
    setEditLabel(tab.label);
  };

  const commitEdit = (tabId: string) => {
    if (editLabel.trim()) {
      setLocalTabs(prev =>
        prev.map(t => (t.id === tabId ? { ...t, label: editLabel.trim() } : t))
      );
    }
    setEditingTabId(null);
  };

  const handleAddTab = () => {
    if (!newTabName.trim()) return;
    const newTab: DynamicTabItemData = {
      id: `tab-${Date.now().toString().slice(-4)}`,
      label: newTabName.trim(),
      componentType: 'ui_section',
      visible: true,
      content: '',
    };
    setLocalTabs([...localTabs, newTab]);
    setNewTabName('');
    setAddingNew(false);
  };

  const toggleVisible = (id: string) => {
    setLocalTabs(prev =>
      prev.map(t => (t.id === id ? { ...t, visible: t.visible === false ? true : false } : t))
    );
  };

  const deleteTab = (id: string) => {
    setLocalTabs(prev => prev.filter(t => t.id !== id));
  };

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
    const reordered = [...localTabs];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setLocalTabs(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSyncAll = () => {
    onSaveTabs(localTabs, true);
    setSyncDone(true);
    setTimeout(() => {
      setSyncDone(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col border border-gray-100 overflow-hidden">
        {/* Header matching screenshot 2 */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Manage Sections</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Section Row */}
        <div className="px-6 py-3.5 border-b border-gray-100">
          {addingNew ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={newTabName}
                onChange={e => setNewTabName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddTab();
                  if (e.key === 'Escape') {
                    setAddingNew(false);
                    setNewTabName('');
                  }
                }}
                placeholder="Section name..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTab}
                className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingNew(false);
                  setNewTabName('');
                }}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingNew(true)}
              className="flex items-center gap-2 text-sm text-gray-900 hover:text-blue-600 transition-colors font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add New Section
            </button>
          )}
        </div>

        {/* Scrollable sections rows with native scrollbar */}
        <div className="flex-1 overflow-y-scroll max-h-[380px] divide-y divide-gray-100">
          {localTabs.map((tab, idx) => {
            const isEditing = editingTabId === tab.id;
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
                className={`px-6 py-3.5 flex items-center gap-3 transition-colors select-none ${
                  isDragging
                    ? 'opacity-40 bg-blue-50'
                    : isDragOver
                    ? 'bg-blue-50/50 border-t-2 border-blue-500'
                    : 'hover:bg-gray-50/80'
                }`}
              >
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab active:cursor-grabbing" />

                {isEditing ? (
                  <input
                    autoFocus
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    onBlur={() => commitEdit(tab.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit(tab.id);
                      if (e.key === 'Escape') setEditingTabId(null);
                    }}
                    className="flex-1 border border-blue-400 rounded px-2 py-0.5 text-sm focus:outline-none"
                  />
                ) : (
                  <span
                    className={`flex-1 text-sm font-medium ${
                      tab.visible === false ? 'text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </span>
                )}

                {/* Icons in exact order of screenshot 2: [Pencil] [Eye] [X] */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(tab)}
                    className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    title="Rename"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleVisible(tab.id)}
                    className={`transition-colors cursor-pointer ${
                      tab.visible === false
                        ? 'text-gray-300 hover:text-gray-500'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title={tab.visible === false ? 'Show Section' : 'Hide Section'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteTab(tab.id)}
                    className="text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer matching screenshot 2: Sync All (left) | Cancel & Save (right) */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSyncAll}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            {syncDone ? '✓ Synced!' : 'Sync All'}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSaveTabs(localTabs);
                onClose();
              }}
              className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Workspace Component
// ─────────────────────────────────────────────
export const CompositeWorkspaceManager: React.FC<CompositeWorkspaceManagerProps> = ({
  entity,
  schema,
  onBack,
  onUpdateEntity,
}) => {
  // Initialize tabs from entity.tabsData or blueprint
  const initializeTabs = (): DynamicTabItemData[] => {
    const blueprintTabs = schema.tabsConfig?.defaultTabs || [];
    const savedTabsData = entity.tabsData || {};

    if (Object.keys(savedTabsData).length > 0) {
      return Object.values(savedTabsData);
    }

    // Provision from blueprint
    return blueprintTabs.map(bp => ({
      id: bp.id,
      label: bp.label,
      componentType: bp.componentType,
      visible: bp.visible !== false,
      content: bp.defaultContent || (bp.componentType === 'rich_text' ? '' : []),
    }));
  };

  const [tabs, setTabs] = useState<DynamicTabItemData[]>(initializeTabs);
  const visibleTabs = tabs.filter(t => t.visible !== false);
  const [activeTabId, setActiveTabId] = useState<string>(visibleTabs[0]?.id || tabs[0]?.id || '');
  const [showAddElementModal, setShowAddElementModal] = useState(false);
  const [isTabSettingsOpen, setIsTabSettingsOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Active tab reference
  const currentTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Accordion modal state
  const [isAddingAccordion, setIsAddingAccordion] = useState(false);
  const [accordionTitle, setAccordionTitle] = useState('');
  const [accordionContent, setAccordionContent] = useState('');

  // Faculty modal state
  const [isAddingFaculty, setIsAddingFaculty] = useState(false);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    designation: 'Professor',
    department: entity.data.name || 'Department',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  });

  const handleUpdateTabContent = (tabId: string, newContent: any, newType?: TabComponentType) => {
    setTabs(prev =>
      prev.map(t => (t.id === tabId ? { ...t, content: newContent, ...(newType ? { componentType: newType } : {}) } : t))
    );
  };

  const handleSaveAll = () => {
    const tabsDataMap: Record<string, DynamicTabItemData> = {};
    tabs.forEach(t => {
      tabsDataMap[t.id] = t;
    });

    const updatedEntity: DynamicEntityItem = {
      ...entity,
      tabsData: tabsDataMap,
      updatedAt: new Date().toISOString(),
    };

    onUpdateEntity(updatedEntity);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleSelectElement = (type: TabComponentType) => {
    if (!currentTab) return;
    let initialContent: any = '';
    let resolvedType: TabComponentType = type;

    if (type === 'accordion') {
      resolvedType = 'ui_section';
      initialContent = [
        { id: `acc-1`, title: 'Program Overview & Scope', content: 'Detailed curriculum and career horizons.' },
      ];
    } else if (type === 'rich_text') {
      resolvedType = 'ui_section';
      initialContent = '<p>Type or paste formatted text content here...</p>';
    } else if (type === 'faculty_grid') {
      initialContent = [
        {
          id: `f-1`,
          name: 'Mrs. Ravinder Chadha',
          designation: 'Professor',
          department: entity.data.name || 'DEPARTMENT',
          imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        },
      ];
    } else if (type === 'document_list') {
      initialContent = [
        { id: `doc-1`, title: 'Academic Schedule & Circular 2026-27', fileUrl: '#' },
      ];
    }
    handleUpdateTabContent(currentTab.id, initialContent, resolvedType);
    setShowAddElementModal(false);
  };

  const handleAddAccordionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accordionTitle.trim()) return;
    const existing = Array.isArray(currentTab.content) ? currentTab.content : [];
    const updated = [
      ...existing,
      { id: `acc_${Date.now()}`, title: accordionTitle.trim(), content: accordionContent.trim() },
    ];
    handleUpdateTabContent(currentTab.id, updated);
    setAccordionTitle('');
    setAccordionContent('');
    setIsAddingAccordion(false);
  };

  const handleDeleteAccordionItem = (id: string) => {
    const existing = Array.isArray(currentTab.content) ? currentTab.content : [];
    handleUpdateTabContent(currentTab.id, existing.filter((item: any) => item.id !== id));
  };

  const handleAddFacultyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name.trim()) return;
    const existing = Array.isArray(currentTab.content) ? currentTab.content : [];
    const updated = [
      ...existing,
      { id: `fac_${Date.now()}`, ...facultyForm },
    ];
    handleUpdateTabContent(currentTab.id, updated);
    setFacultyForm({
      name: '',
      designation: 'Professor',
      department: entity.data.name || 'Department',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    });
    setIsAddingFaculty(false);
  };

  const handleDeleteFacultyMember = (id: string) => {
    const existing = Array.isArray(currentTab.content) ? currentTab.content : [];
    handleUpdateTabContent(currentTab.id, existing.filter((item: any) => item.id !== id));
  };

  const entityTitle = entity.data.name || entity.data.title || 'Department Profile';

  return (
    <div className="space-y-4">
      {/* Breadcrumb Header matching screenshot */}
      <nav className="flex items-center gap-2 text-xs text-gray-800 mb-5">
        <button onClick={onBack} className="hover:text-blue-600 transition-colors font-medium">Home</button>
        <span className="text-gray-400">/</span>
        <button onClick={onBack} className="hover:text-blue-600 transition-colors font-medium">{schema.name}</button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">Department Profile</span>
      </nav>

      {/* Title & Settings Header — OUTSIDE the white card */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
          {entityTitle.toLowerCase().startsWith('department of') ? entityTitle : `Department of ${entityTitle}`}
        </h1>

        <button
          type="button"
          onClick={() => setIsTabSettingsOpen(true)}
          className="p-1.5 text-gray-800 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors border border-gray-300 shadow-2xs cursor-pointer"
          title="Manage Tabs (Settings)"
        >
          <Settings className="w-4 h-4 text-gray-800" />
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-md border border-gray-200/90 shadow-2xs overflow-hidden">
        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          {/* Left Column: Vertical Tabs Navigation — gray background with white active tab */}
          <div className="md:col-span-3 border-r border-gray-200 bg-gray-100 overflow-y-scroll max-h-[560px]">
            <nav className="divide-y divide-gray-200">
              {visibleTabs.map(tab => {
                const isActive = tab.id === currentTab?.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTabId(tab.id)}
                    className={`w-full text-left px-5 py-3.5 text-sm transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-white text-gray-900 border-l-4 border-blue-600 font-bold pl-4'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80 font-medium border-l-4 border-transparent'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Column: Tab Content Workspace (Screenshots 5 & 6) */}
          <div className="md:col-span-9 p-6 flex flex-col justify-between bg-white">
            <div>
              {/* Tab Header with Cancel and Save Buttons */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">{currentTab?.label || 'Tab Content'}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-1.5 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    className="px-5 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {savedNotice ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Saved!
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content Rendering Body */}
              <div>
                {/* 1. Empty State: Show dashed box with + button matching screenshot */}
                {(!currentTab?.content ||
                  (Array.isArray(currentTab.content) && currentTab.content.length === 0) ||
                  (typeof currentTab.content === 'string' && currentTab.content.trim() === '')) ? (
                  <div
                    className="border border-dashed border-gray-300 rounded flex items-center justify-center bg-white w-full"
                    style={{ minHeight: '120px' }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowAddElementModal(true)}
                      className="w-9 h-9 bg-white border border-gray-300 rounded flex items-center justify-center text-gray-800 hover:border-gray-400 hover:bg-gray-50 shadow-2xs transition-all cursor-pointer"
                      title="Add Element"
                    >
                      <Plus className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  </div>
                ) : (
                  /* 2. Active Element Renderers */
                  <div className="space-y-4">
                    {/* Rich Text Editor */}
                    {(currentTab.componentType === 'rich_text' || (currentTab.componentType === 'ui_section' && (!Array.isArray(currentTab.content) || currentTab.content.length === 0 || typeof currentTab.content === 'string'))) && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                        {/* WYSIWYG Toolbar */}
                        <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
                          <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-700 font-bold text-xs" title="Bold">
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-700 italic text-xs" title="Italic">
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-700 underline text-xs" title="Underline">
                            <Underline className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-px h-4 bg-gray-300 mx-1" />
                          <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded text-gray-700 font-bold text-xs">H1</button>
                          <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded text-gray-700 font-bold text-xs">H2</button>
                          <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded text-gray-700 font-bold text-xs">H3</button>
                          <div className="w-px h-4 bg-gray-300 mx-1" />
                          <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-700 text-xs" title="Bullet List">
                            <List className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-700 text-xs" title="Numbered List">
                            <ListOrdered className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-px h-4 bg-gray-300 mx-1" />
                          <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-700 text-xs" title="Insert Link">
                            <Link2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={12}
                          value={typeof currentTab.content === 'string' ? currentTab.content : ''}
                          onChange={e => handleUpdateTabContent(currentTab.id, e.target.value)}
                          placeholder="Type or paste formatted text content here..."
                          className="w-full p-4 text-xs font-medium text-gray-800 leading-relaxed focus:outline-none focus:ring-0 resize-y"
                        />
                      </div>
                    )}

                    {/* Accordion Panels Renderer */}
                    {(currentTab.componentType === 'accordion' || (currentTab.componentType === 'ui_section' && Array.isArray(currentTab.content) && currentTab.content.length > 0)) && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-xs font-bold text-gray-700">Collapsible Panels ({Array.isArray(currentTab.content) ? currentTab.content.length : 0})</span>
                          <button
                            type="button"
                            onClick={() => setIsAddingAccordion(true)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Accordion Panel
                          </button>
                        </div>

                        {isAddingAccordion && (
                          <form onSubmit={handleAddAccordionItem} className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3 animate-in fade-in duration-150">
                            <span className="text-xs font-bold text-blue-900 block">New Accordion Panel</span>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Panel Title *</label>
                              <input
                                type="text"
                                required
                                value={accordionTitle}
                                onChange={e => setAccordionTitle(e.target.value)}
                                placeholder="e.g. Eligibility Criteria, Course Syllabus..."
                                className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Panel Details *</label>
                              <textarea
                                rows={3}
                                required
                                value={accordionContent}
                                onChange={e => setAccordionContent(e.target.value)}
                                placeholder="Enter detailed text or bullet points..."
                                className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsAddingAccordion(false)}
                                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-white rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                Add Panel
                              </button>
                            </div>
                          </form>
                        )}

                        <div className="space-y-2">
                          {Array.isArray(currentTab.content) &&
                            currentTab.content.map((item: any) => (
                              <div key={item.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/40 hover:bg-white transition-colors">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-gray-900">{item.title}</h4>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAccordionItem(item.id)}
                                    className="text-gray-400 hover:text-red-600 p-1"
                                    title="Delete Panel"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.content}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Faculty Grid Renderer (Screenshot 9) */}
                    {currentTab.componentType === 'faculty_grid' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-xs font-bold text-gray-700">
                            Faculty & Staff Directory ({Array.isArray(currentTab.content) ? currentTab.content.length : 0})
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAddingFaculty(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Faculty Member
                          </button>
                        </div>

                        {isAddingFaculty && (
                          <form onSubmit={handleAddFacultyMember} className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3 animate-in fade-in duration-150">
                            <span className="text-xs font-bold text-blue-900 block">Add Faculty Profile</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Full Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={facultyForm.name}
                                  onChange={e => setFacultyForm({ ...facultyForm, name: e.target.value })}
                                  placeholder="e.g. Dr. Neena Bhatia"
                                  className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Designation *</label>
                                <input
                                  type="text"
                                  required
                                  value={facultyForm.designation}
                                  onChange={e => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                                  placeholder="e.g. Professor / Associate Professor"
                                  className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Department Tag</label>
                                <input
                                  type="text"
                                  value={facultyForm.department}
                                  onChange={e => setFacultyForm({ ...facultyForm, department: e.target.value })}
                                  placeholder="e.g. PHYSICS / FOOD NUTRITION"
                                  className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Portrait Photo URL</label>
                                <input
                                  type="text"
                                  value={facultyForm.imageUrl}
                                  onChange={e => setFacultyForm({ ...facultyForm, imageUrl: e.target.value })}
                                  placeholder="https://..."
                                  className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setIsAddingFaculty(false)}
                                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-white rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                Save Member
                              </button>
                            </div>
                          </form>
                        )}

                        {/* 3-Column Responsive Grid (matching Screenshot 9) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {Array.isArray(currentTab.content) &&
                            currentTab.content.map((member: any) => (
                              <div
                                key={member.id}
                                className="bg-white border border-gray-200/90 rounded-2xl p-4 flex items-center gap-3.5 hover:shadow-md transition-all group relative"
                              >
                                <img
                                  src={member.imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'}
                                  alt={member.name}
                                  className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-gray-100 shadow-2xs"
                                />
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-bold text-gray-900 truncate">{member.name}</h4>
                                  <p className="text-[11px] text-amber-700 font-semibold truncate mt-0.5">{member.designation}</p>
                                  <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5 uppercase tracking-wide">
                                    {member.department || entityTitle}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFacultyMember(member.id)}
                                  className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity absolute top-2 right-2"
                                  title="Delete Member"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Element Modal (Screenshot 6) */}
      {showAddElementModal && (
        <AddElementModal
          onClose={() => setShowAddElementModal(false)}
          onSelect={handleSelectElement}
        />
      )}

      {/* Tab Settings Modal (⚙) */}
      {isTabSettingsOpen && (
        <TabSettingsModal
          tabs={tabs}
          onClose={() => setIsTabSettingsOpen(false)}
          onSaveTabs={(updatedTabs, shouldSyncAll) => {
            setTabs(updatedTabs);
            const visible = updatedTabs.filter(t => t.visible !== false);
            if (!visible.some(t => t.id === activeTabId)) {
              setActiveTabId(visible[0]?.id || updatedTabs[0]?.id || '');
            }

            // 1. Update this entity's tabsData map
            const tabsDataMap: Record<string, DynamicTabItemData> = {};
            updatedTabs.forEach(t => {
              tabsDataMap[t.id] = t;
            });

            const updatedCurrentEntity: DynamicEntityItem = {
              ...entity,
              tabsData: tabsDataMap,
              updatedAt: new Date().toISOString(),
            };
            onUpdateEntity(updatedCurrentEntity);

            // 2. Reflect the updated tab definition back into Custom Module Studio schema (defaultTabs)
            try {
              const templates = getStoredStudioTemplates();
              const updatedTemplates = templates.map(t => {
                if (t.schema.slug === schema.slug || t.schema.id === schema.id) {
                  return {
                    ...t,
                    schema: {
                      ...t.schema,
                      tabsConfig: {
                        ...t.schema.tabsConfig,
                        allowRuntimeCustomTabs: true,
                        defaultTabs: updatedTabs.map(tab => ({
                          id: tab.id,
                          label: tab.label,
                          slug: tab.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                          componentType: tab.componentType || 'ui_section',
                          visible: tab.visible !== false,
                        })),
                      },
                    },
                  };
                }
                return t;
              });
              saveStudioTemplates(updatedTemplates);
            } catch (e) {
              console.error('Failed to sync blueprint back to Module Studio:', e);
            }

            // 3. If Sync All is requested, sync across all other existing entities in this module
            if (shouldSyncAll) {
              try {
                const allEntities = getStoredEntitiesBySlug(schema.slug);
                const syncedEntities = allEntities.map(it => {
                  if (it.id === entity.id) return updatedCurrentEntity;
                  const currentMap = it.tabsData || {};
                  const nextMap: Record<string, DynamicTabItemData> = {};
                  updatedTabs.forEach(tab => {
                    const existing = currentMap[tab.id];
                    nextMap[tab.id] = {
                      ...tab,
                      content: existing && existing.content ? existing.content : tab.content,
                    };
                  });
                  return {
                    ...it,
                    tabsData: nextMap,
                    updatedAt: new Date().toISOString(),
                  };
                });
                saveStoredEntitiesBySlug(schema.slug, syncedEntities);
              } catch (e) {
                console.error('Failed to sync sections across all entities:', e);
              }
            }

            setIsTabSettingsOpen(false);
          }}
        />
      )}
    </div>
  );
};
