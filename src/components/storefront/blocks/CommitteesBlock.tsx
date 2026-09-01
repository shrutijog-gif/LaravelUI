import React from 'react';

// Seed committees data — mirrors CommitteesAdmin seed
const SEED_COMMITTEES = [
  { id: 'c1', name: 'IQAC', type: 'Statutory' },
  { id: 'c2', name: 'Anti-Ragging Committee', type: 'Statutory' },
  { id: 'c3', name: 'Women Empowerment Cell', type: 'Student Support' },
  { id: 'c4', name: 'NSS Committee', type: 'Activity Group' },
  { id: 'c5', name: 'Cultural Committee', type: 'Activity Group' },
];

const DEFAULT_TABS = [
  { id: 'tab-members',    label: 'Committee Members' },
  { id: 'tab-activities', label: 'Activities' },
  { id: 'tab-mou',        label: 'MOU / Linkages' },
  { id: 'tab-gallery',    label: 'Photo Gallery' },
];

export interface CommitteesBlockProps {
  committeeId: string;
  title?: string;
  description?: string;
  className?: string;
  anchorId?: string;
}

export const CommitteesBlock: React.FC<CommitteesBlockProps> = ({ committeeId, title, description, className = '', anchorId = '' }) => {
  const [activeTab, setActiveTab] = React.useState(DEFAULT_TABS[0].id);

  const committee = SEED_COMMITTEES.find(c => c.id === committeeId) ?? SEED_COMMITTEES[0];

  return (
    <div id={anchorId || undefined} className={`py-8 px-4 max-w-5xl mx-auto ${className}`}>
      {/* Optional Puck Block Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
          {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
        </div>
      )}

      {/* Two-panel */}
      <div className="flex bg-white rounded-lg shadow border border-gray-200 overflow-hidden min-h-[320px]">
        {/* Left tab list */}
        <div className="w-52 flex-shrink-0 border-r border-gray-200 bg-gray-50">
          {DEFAULT_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3.5 text-sm border-b border-gray-100 transition-colors font-medium ${
                tab.id === activeTab
                  ? 'bg-white border-l-4 border-l-blue-600 text-gray-900 font-semibold pl-3'
                  : 'bg-gray-50 border-l-4 border-l-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1 p-6 min-w-0">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            {DEFAULT_TABS.find(t => t.id === activeTab)?.label}
          </h3>
          <hr className="mb-5 border-gray-200" />
          <div className="text-sm text-gray-400 italic">
            Content for this section will appear here.
          </div>
        </div>
      </div>
    </div>
  );
};
