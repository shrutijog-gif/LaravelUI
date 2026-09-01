import React, { useState } from 'react';
import { Settings, X, Plus, Eye, EyeOff, Trash2, GripVertical, AlignLeft, Layers, Home, Pencil } from 'lucide-react';
import { Committee } from './CommitteesAdmin';
import { CommitteeMembersManager } from './CommitteeMembersManager';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type TabType = 'static' | 'dynamic';

interface CommitteeTab {
  id: string;
  label: string;
  type: TabType;
  visible: boolean;
  content: string;
}

const defaultTabs = (): CommitteeTab[] => [
  { id: 'tab-members',    label: 'Committee Members', type: 'dynamic', visible: true, content: '' },
  { id: 'tab-activities', label: 'Activities',        type: 'static',  visible: true, content: '' },
  { id: 'tab-mou',        label: 'MOU / Linkages',    type: 'static',  visible: true, content: '' },
  { id: 'tab-gallery',    label: 'Photo Gallery',     type: 'dynamic', visible: true, content: '' },
];

// ─────────────────────────────────────────────
// Static tab right-panel (empty state → + → editor)
// ─────────────────────────────────────────────
const StaticTabPanel: React.FC<{
  tab: CommitteeTab;
  onContentChange: (id: string, v: string) => void;
}> = ({ tab, onContentChange }) => {
  const [hasContent, setHasContent] = useState(false);
  const [showAddElement, setShowAddElement] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      {/* Right panel header: tab name + Cancel / Save */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800">{tab.label}</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>
      <hr className="mb-5 border-gray-200" />

      {hasContent ? (
        /* WYSIWYG toolbar + textarea */
        <div className="border border-gray-200 rounded overflow-hidden">
          <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
            {['B', 'I', 'U'].map(f => (
              <button key={f} className="w-7 h-7 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors">
                <span className={f === 'B' ? 'font-bold' : f === 'I' ? 'italic' : 'underline'}>{f}</span>
              </button>
            ))}
            <div className="w-px h-4 bg-gray-300 mx-1" />
            {['H1', 'H2', 'H3'].map(h => (
              <button key={h} className="px-1.5 h-7 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors">{h}</button>
            ))}
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <button className="px-1.5 h-7 text-xs text-gray-700 hover:bg-gray-200 rounded transition-colors">UL</button>
            <button className="px-1.5 h-7 text-xs text-gray-700 hover:bg-gray-200 rounded transition-colors">OL</button>
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <button className="px-1.5 h-7 text-xs text-gray-700 hover:bg-gray-200 rounded transition-colors">Link</button>
            <button className="px-1.5 h-7 text-xs text-gray-700 hover:bg-gray-200 rounded transition-colors">Img</button>
          </div>
          <textarea
            value={tab.content}
            onChange={e => onContentChange(tab.id, e.target.value)}
            placeholder="Start typing content here..."
            rows={10}
            className="w-full px-3 py-3 text-sm text-gray-700 resize-y focus:outline-none"
          />
        </div>
      ) : (
        /* Dashed empty box with + button — exactly like screenshot */
        <div
          className="border border-dashed border-gray-300 rounded flex items-center justify-center bg-white"
          style={{ minHeight: '180px' }}
        >
          <button
            onClick={() => setShowAddElement(true)}
            className="w-9 h-9 bg-white border border-gray-300 rounded flex items-center justify-center text-gray-600 hover:border-blue-400 hover:text-blue-600 shadow-sm transition-all"
            title="Add Element"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Element modal */}
      {showAddElement && (
        <AddElementModal
          onClose={() => setShowAddElement(false)}
          onSelect={() => { setHasContent(true); setShowAddElement(false); }}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────
// Dynamic tab placeholder
// ─────────────────────────────────────────────
const DynamicTabPanel: React.FC<{ tab: CommitteeTab }> = ({ tab }) => {
  const isMembers = tab.label.toLowerCase().includes('member');
  const isGallery = tab.label.toLowerCase().includes('gallery');

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800">{tab.label}</h3>
      </div>
      <hr className="mb-5 border-gray-200" />
      <div
        className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50"
        style={{ minHeight: '180px' }}
      >
        <div className="text-3xl mb-2">{isMembers ? '👥' : isGallery ? '🖼️' : '📋'}</div>
        <p className="text-sm font-medium text-gray-600 mb-1">Dynamic — {tab.label}</p>
        <p className="text-xs text-gray-400 text-center max-w-xs">
          {isMembers
            ? 'Links to the Members module. Member cards will appear here on the public site.'
            : isGallery
            ? 'Links to the Photo Gallery module. Images will appear here on the public site.'
            : 'Data from linked module will appear here on the public site.'}
        </p>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────
// Add Element Modal
// ─────────────────────────────────────────────
const AddElementModal: React.FC<{
  onClose: () => void;
  onSelect: (type: 'text' | 'accordion') => void;
}> = ({ onClose, onSelect }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-800">Add Element</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'text', icon: <AlignLeft className="w-7 h-7 text-white" />, label: 'Text Block', desc: 'A block of text with WYSIWYG editor' },
          { id: 'accordion', icon: <Layers className="w-7 h-7 text-white" />, label: 'Accordion', desc: 'Collapsible Content Panels' },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id as 'text' | 'accordion')}
            className="border-2 border-gray-100 rounded-lg p-4 text-left hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-700 transition-colors">
              {opt.icon}
            </div>
            <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Tab Manager Modal
// ─────────────────────────────────────────────
const TabManagerModal: React.FC<{
  tabs: CommitteeTab[];
  onTabsChange: (tabs: CommitteeTab[]) => void;
  onClose: () => void;
}> = ({ tabs, onTabsChange, onClose }) => {
  const [localTabs, setLocalTabs] = useState<CommitteeTab[]>(tabs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  const toggleVisible = (id: string) =>
    setLocalTabs(prev => prev.map(t => t.id === id ? { ...t, visible: !t.visible } : t));

  const deleteTab = (id: string) =>
    setLocalTabs(prev => prev.filter(t => t.id !== id));

  const startEdit = (tab: CommitteeTab) => {
    setEditingId(tab.id);
    setEditValue(tab.label);
  };

  const commitEdit = (id: string) => {
    if (editValue.trim())
      setLocalTabs(prev => prev.map(t => t.id === id ? { ...t, label: editValue.trim() } : t));
    setEditingId(null);
  };

  const addTab = () => {
    if (!newTabName.trim()) return;
    setLocalTabs(prev => [...prev, {
      id: `tab-${Date.now()}`,
      label: newTabName.trim(),
      type: 'static',
      visible: true,
      content: '',
    }]);
    setNewTabName('');
    setAddingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col" style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Manage Sections</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Section row */}
        <div className="px-6 py-3 border-b border-gray-100">
          {addingNew ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={newTabName}
                onChange={e => setNewTabName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addTab(); if (e.key === 'Escape') { setAddingNew(false); setNewTabName(''); } }}
                placeholder="Section name..."
                className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button onClick={addTab} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Add</button>
              <button onClick={() => { setAddingNew(false); setNewTabName(''); }} className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingNew(true)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add New Section
            </button>
          )}
        </div>

        {/* Tab rows — scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {localTabs.map(tab => (
            <div key={tab.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
              {/* Drag handle */}
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab" />

              {/* Name / inline edit */}
              {editingId === tab.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(tab.id)}
                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(tab.id); if (e.key === 'Escape') setEditingId(null); }}
                  className="flex-1 border border-blue-400 rounded px-2 py-0.5 text-sm focus:outline-none"
                />
              ) : (
                <span className="flex-1 text-sm text-gray-800">{tab.label}</span>
              )}

              {/* Pencil — edit name */}
              <button
                onClick={() => startEdit(tab)}
                className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                title="Rename"
              >
                <Pencil className="w-4 h-4" />
              </button>

              {/* Eye — visibility toggle */}
              <button
                onClick={() => toggleVisible(tab.id)}
                className={`transition-colors flex-shrink-0 ${tab.visible ? 'text-gray-400 hover:text-gray-700' : 'text-gray-200 hover:text-gray-400'}`}
                title={tab.visible ? 'Hide' : 'Show'}
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* × delete */}
              <button
                onClick={() => deleteTab(tab.id)}
                className={`transition-colors flex-shrink-0 text-sm font-medium ${tab.type === 'dynamic' ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500 hover:text-red-500'}`}
                title="Delete"
                disabled={tab.type === 'dynamic'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => { onTabsChange(localTabs); }}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sync All
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onTabsChange(localTabs); onClose(); }}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
// Main: CommitteeContentManager
// ─────────────────────────────────────────────
interface CommitteeContentManagerProps {
  committee: Committee;
  onBack: () => void;
}

export const CommitteeContentManager: React.FC<CommitteeContentManagerProps> = ({ committee, onBack }) => {
  const [tabs, setTabs] = useState<CommitteeTab[]>(defaultTabs);
  const [activeTabId, setActiveTabId] = useState<string>('tab-members');
  const [showTabManager, setShowTabManager] = useState(false);

  const visibleTabs = tabs.filter(t => t.visible);
  const activeTab = visibleTabs.find(t => t.id === activeTabId) ?? visibleTabs[0];

  const updateTabContent = (tabId: string, content: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, content } : t));
  };

  const handleTabsChange = (updated: CommitteeTab[]) => {
    setTabs(updated);
    if (!updated.find(t => t.id === activeTabId && t.visible)) {
      const first = updated.find(t => t.visible);
      if (first) setActiveTabId(first.id);
    }
  };

  return (
    <div className="min-h-full">

      {/* Breadcrumb — flat text style matching screenshot */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-gray-700 transition-colors">
          <Home className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-gray-400">/</span>
        <button onClick={onBack} className="hover:text-blue-600 transition-colors text-gray-600">
          Committees
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">Committee Profile</span>
      </nav>

      {/* Page title + gear icon */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {committee.name}
        </h1>
        <button
          onClick={() => setShowTabManager(true)}
          className="text-gray-500 hover:text-gray-800 p-1.5 rounded hover:bg-gray-100 transition-colors"
          title="Manage Tabs"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Two-panel white card */}
      <div className="flex bg-white rounded shadow-sm border border-gray-200 overflow-hidden" style={{ minHeight: '420px' }}>

        {/* Left: vertical tab list — gray panel, active = white + blue left border */}
        <div className="flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-100" style={{ width: '220px' }}>
          {visibleTabs.map(tab => {
            const isActive = tab.id === (activeTab?.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`w-full text-left px-4 py-3.5 text-sm border-b border-gray-200 transition-colors ${
                  isActive
                    ? 'bg-white border-l-4 border-l-blue-600 font-bold text-gray-900 pl-3'
                    : 'bg-gray-100 border-l-4 border-l-transparent text-gray-700 hover:bg-gray-200 font-medium'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: content panel */}
        <div className="flex-1 p-6 min-w-0">
          {activeTab ? (
            activeTab.type === 'static' ? (
              <StaticTabPanel
                key={activeTab.id}
                tab={activeTab}
                onContentChange={updateTabContent}
              />
            ) : activeTab.id === 'tab-members' ? (
              <CommitteeMembersManager key={activeTab.id} />
            ) : (
              <DynamicTabPanel key={activeTab.id} tab={activeTab} />
            )
          ) : (
            <div className="text-center text-gray-400 py-16">No tabs available</div>
          )}
        </div>
      </div>

      {showTabManager && (
        <TabManagerModal
          tabs={tabs}
          onTabsChange={handleTabsChange}
          onClose={() => setShowTabManager(false)}
        />
      )}
    </div>
  );
};
