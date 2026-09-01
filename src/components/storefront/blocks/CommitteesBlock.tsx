import React from 'react';
import { getStoredCardPresets } from '../../../utils/cardPresets';
import { CardPresetView } from '../../modules/developer/CardPresetView';

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

const MOCK_MEMBERS = [
  { name: 'Dr. Anand Joshi',  designation: 'Professor & HOD',       role: 'Convener',            img: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { name: 'Dr. Sunita Rao',   designation: 'Associate Professor',    role: 'Member',              img: 'https://randomuser.me/api/portraits/women/41.jpg' },
  { name: 'Mr. Vikram Singh', designation: 'Assistant Professor',    role: 'Member',              img: undefined },
  { name: 'Ms. Pooja Desai',  designation: 'Student Representative', role: 'Student Coordinator', img: 'https://randomuser.me/api/portraits/women/61.jpg' },
];

export interface CommitteesBlockProps {
  committeeId: string;
  title?: string;
  description?: string;
  showPhoto?: boolean;
  showDesignation?: boolean;
  gridCols?: number;
  cardStyle?: string;
  className?: string;
  anchorId?: string;
}

export const CommitteesBlock: React.FC<CommitteesBlockProps> = ({ 
  committeeId, 
  title, 
  description, 
  showPhoto = true,
  showDesignation = true,
  gridCols = 2,
  cardStyle = '',
  className = '', 
  anchorId = '' 
}) => {
  const [activeTab, setActiveTab] = React.useState(DEFAULT_TABS[0].id);

  const committee = SEED_COMMITTEES.find(c => c.id === committeeId) ?? SEED_COMMITTEES[0];

  // Resolve preset from global card preset store — same mechanism as TimetableBlock
  // Note: StylePickerModal saves IDs in uppercase (e.g. 'STYLE-4'), presets are stored lowercase ('style-4')
  const cardPresets = getStoredCardPresets();
  const matchedPreset = cardStyle ? cardPresets.find((p: any) => p.id.toLowerCase() === cardStyle?.toLowerCase()) : null;


  const gridClass = gridCols === 1 ? 'grid-cols-1' :
                    gridCols === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                    'grid-cols-1 md:grid-cols-2';

  return (
    <div id={anchorId || undefined} className={`py-8 w-full ${className}`}>
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
          
          {activeTab === 'tab-members' ? (
            <div className={`grid gap-4 ${gridClass}`}>
              {MOCK_MEMBERS.map((member, i) => {
                /* ── Use CardPresetView when a Design-Studio preset is matched ── */
                if (matchedPreset) {
                  return (
                    <div key={i}>
                      <CardPresetView
                        preset={matchedPreset}
                        sampleData={{
                          year: '',
                          logoText: member.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
                          title: member.name,
                          recipient: showDesignation ? member.designation : '',
                          pdf_url: '#',
                          imageUrl: showPhoto ? member.img : undefined,
                          badge: member.role,
                        }}
                        viewMode="sample"
                      />
                    </div>
                  );
                }

                /* ── Fallback: plain bordered card ── */
                return (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50/50 border border-gray-200 rounded-lg">
                    {showPhoto && (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center border border-gray-200">
                        {member.img ? (
                          <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-500 font-bold text-xs">{member.name.charAt(0)}</span>
                        )}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{member.name}</h4>
                      {showDesignation && <p className="text-xs text-gray-500 mt-0.5">{member.designation}</p>}
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wide uppercase rounded">
                        {member.role}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">
              Content for this section will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
