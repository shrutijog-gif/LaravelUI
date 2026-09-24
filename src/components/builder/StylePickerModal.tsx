import React, { useState, useEffect } from 'react';
import { X, Check, LayoutGrid, Table } from 'lucide-react';
import { TimetableBlock } from '../storefront/blocks/TimetableBlock';
import { getStoredCardPresets } from '../../utils/cardPresets';
import { CardPresetView } from '../modules/developer/CardPresetView';

export interface StylePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStyle: string;
  onSelectStyle: (style: string) => void;
  moduleId?: string;
  moduleTitle?: string;
  sampleData?: any;
}

const sampleTimetables = [
  {
    id: 'sample-1',
    name: 'B.Sc Home Science & Food Technology Schedule',
    year: '2026-2027',
    branch: ['Food Technology'],
    semester: ['1'],
    section: ['A'],
    fileName: 'Home_Science_Sem1_2026.pdf',
    fileUrl: '#',
    showOnWebsite: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'sample-2',
    name: 'M.Sc Clinical Nutrition & Dietetics Exam Schedule',
    year: '2026-2027',
    branch: ['Clinical Nutrition'],
    semester: ['3'],
    section: ['A'],
    fileName: 'MSc_Nutrition_Timetable_2026.pdf',
    fileUrl: '#',
    showOnWebsite: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'sample-3',
    name: 'B.Ed Special Education & Disability Studies',
    year: '2026-2027',
    branch: ['Pedagogy & Child Dev'],
    semester: ['2'],
    section: ['A'],
    fileName: 'BED_Special_Ed_Schedule.pdf',
    fileUrl: '#',
    showOnWebsite: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

const tableStylesList = [
  {
    id: 'table-1',
    name: 'Table Style 1 (Classic Clean)',
    description: 'Structured table layout with subtle hover highlighting, clear column headers, and direct download links.',
  },
  {
    id: 'table-2',
    name: 'Table Style 2 (Bordered Row Cards)',
    description: 'Distinct card-like table rows with file icon badges and a primary action button per row.',
  },
  {
    id: 'table-3',
    name: 'Table Style 3 (Modern Gradient Header)',
    description: 'Vibrant gradient table header row with glassmorphism accent pills and high-visibility download actions.',
  },
];

const iconBadgeStylesList = [
  {
    id: 'icon-1',
    name: 'Tile Style 1 (Circular White Ring Badges)',
    description: 'Circular navy icon badge with a white border ring, drop shadow, and centered title underneath.',
  },
  {
    id: 'icon-2',
    name: 'Tile Style 2 (Solid Crimson Circle Badges)',
    description: 'Deep red circular badge with white icon, subtle shadow, and centered title underneath.',
  },
  {
    id: 'icon-3',
    name: 'Tile Style 3 (Rotated Diamond Badges)',
    description: '45-degree rotated diamond icon tile with an upright white icon and centered title underneath.',
  },
];

export const StylePickerModal: React.FC<StylePickerModalProps> = ({
  isOpen,
  onClose,
  selectedStyle,
  onSelectStyle,
  moduleId,
  moduleTitle,
  sampleData,
}) => {
  const [cardPresets, setCardPresets] = useState(getStoredCardPresets());

  useEffect(() => {
    if (isOpen) {
      setCardPresets(getStoredCardPresets());
    }
    const handleUpdate = () => {
      setCardPresets(getStoredCardPresets());
    };
    window.addEventListener('card-presets-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('card-presets-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [isOpen]);

  const isTimetable = moduleId === 'timetable' || moduleTitle?.toLowerCase().includes('time table') || moduleId?.toLowerCase().includes('timetable');

  const resolvedSampleData = sampleData || (isTimetable ? {
    year: '2026-2027',
    logoText: 'BS',
    title: 'B.Sc Home Science & Food Technology Schedule',
    recipient: 'Food Technology • Semester 1',
    pdf_url: '#',
  } : {
    year: '2024-25',
    logoText: moduleTitle ? moduleTitle.slice(0, 2).toUpperCase() : 'UG',
    title: `${moduleTitle || 'Academic'} Document Record`,
    recipient: 'Department & Program Details',
    pdf_url: '#',
  });

  const cardStylesList = cardPresets.map(preset => {
    let name = preset.name;
    let description = preset.description;
    if (isTimetable) {
      if (preset.id === 'style-1') {
        name = 'Style 1: Official Timetable Card';
        description = 'Official timetable layout with branch initials badge, title, semester details, and download link.';
      } else if (preset.id === 'style-2') {
        name = 'Style 2: Compact Minimal Timetable Card';
        description = 'Clean minimalist card featuring academic year pill, timetable title, and direct download action.';
      } else if (preset.id === 'style-3') {
        name = 'Style 3: Gradient Banner Timetable Card';
        description = 'Modern gradient header banner with high-contrast branch details and action button.';
      } else if (preset.id === 'style-4') {
        name = 'Style 4: Dual-Pane Split Timetable Card';
        description = 'Split visual card with colored branch block on the left and timetable details on the right.';
      }
    }
    return {
      id: preset.id,
      name,
      description,
    };
  });

  const [activeTab, setActiveTab] = useState<'card' | 'table' | 'icon'>((
    selectedStyle?.startsWith('table-')
      ? 'table'
      : (selectedStyle?.startsWith('icon-') || selectedStyle?.startsWith('quicklink-'))
      ? 'icon'
      : 'card'
  ));

  if (!isOpen) return null;

  const currentList = activeTab === 'card' ? cardStylesList : activeTab === 'table' ? tableStylesList : iconBadgeStylesList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">
              {moduleTitle ? `Select Display Template — ${moduleTitle}` : 'Select Display Template'}
            </h2>
            {isTimetable && (
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                Time Table Context
              </span>
            )}
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-gray-200/80 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === 'card'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Card Styles ({cardStylesList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Table Styles ({tableStylesList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('icon')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === 'icon'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚡ Compact Tile Styles ({iconBadgeStylesList.length})
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {currentList.map((styleItem) => {
            const isSelected = selectedStyle === styleItem.id;

            return (
              <div
                key={styleItem.id}
                onClick={() => {
                  onSelectStyle(styleItem.id);
                  onClose();
                }}
                className={`group relative rounded-xl border-2 transition-all p-3.5 sm:p-4 cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/20 shadow-md ring-2 ring-blue-600/20'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50'
                }`}
              >
                {/* Style Info & Text */}
                <div className="md:w-[32%] w-full space-y-1.5 shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">
                      {styleItem.name}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {styleItem.description}
                  </p>
                  
                  <div className="pt-1">
                    <button
                      type="button"
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 group-hover:bg-blue-600 group-hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Use This Style'}
                    </button>
                  </div>
                </div>

                {/* Visual Preview Container */}
                <div className="md:w-[65%] w-full bg-gray-50/80 p-3 sm:p-4 rounded-xl border border-gray-100 min-w-0 flex items-center justify-center">
                  <div className="w-full max-w-[380px] mx-auto">
                    {(styleItem.id.startsWith('icon-') || styleItem.id.startsWith('quicklink-')) ? (
                      <div className="flex items-center justify-center gap-6 py-3">
                        {styleItem.id.includes('1') ? (
                          <>
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-14 h-14 rounded-full bg-[#0F2748] text-white flex items-center justify-center border-4 border-white shadow-md">
                                <LayoutGrid className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-[11px] font-bold text-gray-800 text-center">UG Program</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-14 h-14 rounded-full bg-[#0F2748] text-white flex items-center justify-center border-4 border-white shadow-md">
                                <Table className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-[11px] font-bold text-gray-800 text-center">PG Program</span>
                            </div>
                          </>
                        ) : styleItem.id.includes('2') ? (
                          <>
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-14 h-14 rounded-full bg-[#8B1D0F] text-white flex items-center justify-center shadow-sm">
                                <LayoutGrid className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-[11px] font-bold text-gray-800 text-center">Time Table</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-14 h-14 rounded-full bg-[#8B1D0F] text-white flex items-center justify-center shadow-sm">
                                <Table className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-[11px] font-bold text-gray-800 text-center">Examination</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-12 h-12 rotate-45 bg-[#0F2748] text-white flex items-center justify-center shadow-md">
                                <div className="-rotate-45">
                                  <LayoutGrid className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-gray-800 text-center">Prospectus</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-12 h-12 rotate-45 bg-teal-700 text-white flex items-center justify-center shadow-md">
                                <div className="-rotate-45">
                                  <Table className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-gray-800 text-center">Results</span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : activeTab === 'card' ? (
                      (() => {
                        const matchedPreset = cardPresets.find(p => p.id === styleItem.id) || cardPresets[0];
                        return (
                          <CardPresetView
                            preset={matchedPreset}
                            sampleData={resolvedSampleData}
                            viewMode="sample"
                          />
                        );
                      })()
                    ) : (
                      <TimetableBlock
                        title=""
                        description=""
                        view={activeTab as any}
                        cardStyle={styleItem.id as any}
                        tableStyle={styleItem.id as any}
                        timetables={sampleTimetables}
                        isPreview={true}
                        showFields={{
                          title: true,
                          file: true,
                          branch: true,
                          semester: true,
                          download: true,
                          year: true,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
