import React, { useState } from 'react';
import { Settings, X, Plus, Eye, GripVertical, AlignLeft, Layers, Home, Pencil, CheckCircle2, AlertCircle } from 'lucide-react';
import { Department, DepartmentTab, getDepartmentTabs, saveDepartmentTabs, syncDepartmentTabsToAll } from '../../../../data/mockDepartmentData';
import { DepartmentStaffManager } from './DepartmentStaffManager';

interface DepartmentContentManagerProps {
  department: Department;
  onBack: () => void;
}

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
// Static Tab Panel (WYSIWYG / Content)
// ─────────────────────────────────────────────
const StaticTabPanel: React.FC<{
  tab: DepartmentTab;
  onContentChange: (id: string, v: string) => void;
  onSave?: () => void;
}> = ({ tab, onContentChange, onSave }) => {
  const [hasContent, setHasContent] = useState(!!tab.content);
  const [showAddElement, setShowAddElement] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync state if tab content changes externally
  React.useEffect(() => {
    setHasContent(!!tab.content);
  }, [tab.id, tab.content]);

  const handleSave = () => {
    if (onSave) onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setSaved(false);
  };

  return (
    <div>
      {/* Right panel header: tab name + Cancel / Save */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{tab.label}</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-1.5 text-sm bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-xs"
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      {hasContent ? (
        /* WYSIWYG toolbar + textarea */
        <div className="space-y-3">
          <div className="border border-gray-200 rounded overflow-hidden shadow-2xs">
            <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
              {['B', 'I', 'U'].map(f => (
                <button
                  key={f}
                  type="button"
                  className="w-7 h-7 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded transition-colors"
                >
                  <span className={f === 'B' ? 'font-bold' : f === 'I' ? 'italic' : 'underline'}>{f}</span>
                </button>
              ))}
              <div className="w-px h-4 bg-gray-300 mx-1.5" />
              {['H1', 'H2', 'H3'].map(h => (
                <button
                  key={h}
                  type="button"
                  className="px-2 h-7 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded transition-colors"
                >
                  {h}
                </button>
              ))}
              <div className="w-px h-4 bg-gray-300 mx-1.5" />
              <button type="button" className="px-2 h-7 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors">UL</button>
              <button type="button" className="px-2 h-7 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors">OL</button>
              <div className="w-px h-4 bg-gray-300 mx-1.5" />
              <button type="button" className="px-2 h-7 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors">Link</button>
              <button type="button" className="px-2 h-7 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors">Img</button>
            </div>
            <textarea
              value={tab.content}
              onChange={e => onContentChange(tab.id, e.target.value)}
              placeholder="Start typing content here..."
              rows={10}
              className="w-full px-4 py-3 text-sm text-gray-800 resize-y focus:outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                onContentChange(tab.id, '');
                setHasContent(false);
              }}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              Clear Content
            </button>
          </div>
        </div>
      ) : (
        /* Dashed empty box with + button matching screenshot exactly */
        <div
          className="border border-dashed border-gray-300 rounded flex items-center justify-center bg-white w-full"
          style={{ minHeight: '120px' }}
        >
          <button
            type="button"
            onClick={() => setShowAddElement(true)}
            className="w-9 h-9 bg-white border border-gray-300 rounded flex items-center justify-center text-gray-800 hover:border-gray-400 hover:bg-gray-50 shadow-2xs transition-all cursor-pointer"
            title="Add Element"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      )}

      {/* Add Element modal */}
      {showAddElement && (
        <AddElementModal
          onClose={() => setShowAddElement(false)}
          onSelect={() => {
            setHasContent(true);
            setShowAddElement(false);
          }}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Dynamic Tab Panel (e.g. Photo Gallery)
// ─────────────────────────────────────────────
const DynamicTabPanel: React.FC<{ tab: DepartmentTab }> = ({ tab }) => (
  <>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-semibold text-gray-800">{tab.label}</h3>
    </div>
    <hr className="mb-5 border-gray-200" />
    <div
      className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50"
      style={{ minHeight: '180px' }}
    >
      <div className="text-3xl mb-2">🖼️</div>
      <p className="text-sm font-medium text-gray-600 mb-1">Dynamic — {tab.label}</p>
      <p className="text-xs text-gray-400 text-center max-w-xs">
        Links to the Photo Gallery module. Department images will appear here on the public site.
      </p>
    </div>
  </>
);

// ─────────────────────────────────────────────
// Tab Manager Modal (Manage Sections)
// ─────────────────────────────────────────────
const TabManagerModal: React.FC<{
  tabs: DepartmentTab[];
  onTabsChange: (tabs: DepartmentTab[]) => void;
  onClose: () => void;
}> = ({ tabs, onTabsChange, onClose }) => {
  const [localTabs, setLocalTabs] = useState<DepartmentTab[]>(tabs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  const toggleVisible = (id: string) =>
    setLocalTabs(prev => prev.map(t => (t.id === id ? { ...t, visible: !t.visible } : t)));

  const deleteTab = (id: string) =>
    setLocalTabs(prev => prev.filter(t => t.id !== id));

  const startEdit = (tab: DepartmentTab) => {
    setEditingId(tab.id);
    setEditValue(tab.label);
  };

  const commitEdit = (id: string) => {
    if (editValue.trim()) {
      setLocalTabs(prev => prev.map(t => (t.id === id ? { ...t, label: editValue.trim() } : t)));
    }
    setEditingId(null);
  };

  const addTab = () => {
    if (!newTabName.trim()) return;
    setLocalTabs(prev => [
      ...prev,
      {
        id: `tab-custom-${Date.now()}`,
        label: newTabName.trim(),
        type: 'static',
        visible: true,
        content: '',
      },
    ]);
    setNewTabName('');
    setAddingNew(false);
  };

  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  const handleConfirmSyncAll = () => {
    const count = syncDepartmentTabsToAll(localTabs);
    onTabsChange(localTabs);
    setSyncedCount(count);
    setTimeout(() => {
      setSyncedCount(null);
      setShowSyncConfirm(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col" style={{ maxHeight: '85vh' }}>
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
                onKeyDown={e => {
                  if (e.key === 'Enter') addTab();
                  if (e.key === 'Escape') {
                    setAddingNew(false);
                    setNewTabName('');
                  }
                }}
                placeholder="Section name..."
                className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                onClick={addTab}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAddingNew(false);
                  setNewTabName('');
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
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
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab" />

              {editingId === tab.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(tab.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitEdit(tab.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
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

              {/* Delete button */}
              <button
                onClick={() => deleteTab(tab.id)}
                disabled={tab.type === 'staff'}
                className={`transition-colors flex-shrink-0 text-sm font-medium ${tab.type === 'staff' ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500 hover:text-red-500'}`}
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer matching screenshot 2 */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSyncConfirm(true)}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
            title="Sync all sections across departments"
          >
            Sync All
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
                onTabsChange(localTabs);
                onClose();
              }}
              className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>

        {/* Sync All Confirmation Dialog */}
        {showSyncConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in">
              {syncedCount !== null ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-base font-bold text-gray-900 mb-1">Sections Synced!</h3>
                  <p className="text-xs text-gray-600">
                    Successfully applied section structure across all {syncedCount} departments.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Apply to All Departments?</h3>
                      <p className="text-xs text-gray-500">Sync section structure</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-5">
                    This will sync the section list, order, names, and visibility across <strong>all departments</strong>. Each department's own written content will remain safe.
                  </p>
                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => setShowSyncConfirm(false)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmSyncAll}
                      className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
                    >
                      Yes, Apply to All
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component: DepartmentContentManager
// ─────────────────────────────────────────────
export const DepartmentContentManager: React.FC<DepartmentContentManagerProps> = ({ department, onBack }) => {
  const [tabs, setTabs] = useState<DepartmentTab[]>(() => getDepartmentTabs(department.id));
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const storedTabs = getDepartmentTabs(department.id);
    const hasMou = storedTabs.some(t => t.id === 'tab-mou' && t.visible);
    if (hasMou) return 'tab-mou';
    return storedTabs[0]?.id || 'tab-overview';
  });
  const [showTabManager, setShowTabManager] = useState(false);

  // Sync state if tabs are updated globally
  React.useEffect(() => {
    const handleGlobalSync = () => {
      setTabs(getDepartmentTabs(department.id));
    };
    window.addEventListener('department-tabs-synced', handleGlobalSync);
    return () => window.removeEventListener('department-tabs-synced', handleGlobalSync);
  }, [department.id]);

  const visibleTabs = tabs.filter(t => t.visible);
  const activeTab = visibleTabs.find(t => t.id === activeTabId) ?? visibleTabs[0];

  const updateTabContent = (tabId: string, content: string) => {
    setTabs(prev => {
      const next = prev.map(t => (t.id === tabId ? { ...t, content } : t));
      saveDepartmentTabs(department.id, next);
      return next;
    });
  };

  const handleSaveTabContent = () => {
    saveDepartmentTabs(department.id, tabs);
  };

  const handleTabsChange = (updated: DepartmentTab[]) => {
    setTabs(updated);
    saveDepartmentTabs(department.id, updated);
    if (!updated.find(t => t.id === activeTabId && t.visible)) {
      const first = updated.find(t => t.visible);
      if (first) setActiveTabId(first.id);
    }
  };

  const departmentDisplayName = department.name.toLowerCase().startsWith('department of')
    ? department.name
    : `Department of ${department.name}`;

  return (
    <div className="min-h-full">
      {/* Breadcrumb — matching screenshot Home / Departments / Department Profile */}
      <nav className="flex items-center gap-2 text-xs text-gray-800 mb-5">
        <button onClick={onBack} className="hover:text-blue-600 transition-colors font-medium">
          Home
        </button>
        <span className="text-gray-400">/</span>
        <button onClick={onBack} className="hover:text-blue-600 transition-colors font-medium">
          Departments
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">Department Profile</span>
      </nav>

      {/* Page title + gear icon */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">{departmentDisplayName}</h1>
        <button
          type="button"
          onClick={() => setShowTabManager(true)}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-800 transition-colors shadow-2xs cursor-pointer"
          title="Manage Tabs"
        >
          <Settings className="w-4 h-4 text-gray-800" />
        </button>
      </div>

      {/* Two-panel card matching screenshot */}
      <div className="flex bg-white rounded-md border border-gray-200/90 shadow-2xs overflow-hidden" style={{ minHeight: '520px' }}>
        {/* Left: vertical tab list — gray background with white active tab */}
        <div className="flex-shrink-0 border-r border-gray-200 overflow-y-scroll bg-gray-100" style={{ width: '270px', maxHeight: '560px' }}>
          {visibleTabs.map(tab => {
            const isActive = tab.id === activeTab?.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`w-full text-left px-5 py-3.5 text-sm border-b border-gray-200 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white border-l-4 border-l-blue-600 font-bold text-gray-900 pl-4'
                    : 'bg-gray-100 border-l-4 border-l-transparent text-gray-700 hover:bg-gray-200/80 font-medium'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: content panel */}
        <div className="flex-1 p-8 min-w-0 bg-white">
          {activeTab ? (
            activeTab.type === 'staff' ? (
              <DepartmentStaffManager
                key={`${department.id}-${activeTab.id}`}
                departmentId={department.id}
                category={activeTab.staffCategory || 'teaching'}
                categoryTitle={activeTab.label}
              />
            ) : activeTab.id === 'tab-photo-gallery' ? (
              <DynamicTabPanel key={activeTab.id} tab={activeTab} />
            ) : (
              <StaticTabPanel
                key={activeTab.id}
                tab={activeTab}
                onContentChange={updateTabContent}
                onSave={handleSaveTabContent}
              />
            )
          ) : (
            <div className="text-center text-gray-400 py-16">No tabs available</div>
          )}
        </div>
      </div>

      {/* Tab Manager Modal */}
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

