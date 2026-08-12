import React from 'react';
import { X, Check } from 'lucide-react';
import { TimetableBlock } from '../storefront/blocks/TimetableBlock';

export interface StylePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStyle: string;
  onSelectStyle: (style: string) => void;
}

const sampleTimetable = {
  id: 'sample-1',
  name: 'B.Tech First Year (Sem 1)',
  year: '2024-25',
  branch: ['Computer Science', 'IT'],
  semester: ['I', 'II'],
  fileName: 'btech_1st_sem1.pdf',
  fileUrl: '#',
};

const stylesList = [
  {
    id: 'style-1',
    name: 'Card Style 1 (Classic)',
    description: 'Displays a top calendar icon badge, year tag, detailed branch/semester list, and a bottom download section.',
  },
  {
    id: 'style-2',
    name: 'Card Style 2 (Minimalist)',
    description: 'Clean minimalist card with a file icon badge, rounded branch tag, bottom PDF link, and bookmark action.',
  },
  {
    id: 'style-3',
    name: 'Card Style 3 (Modern Gradient)',
    description: 'Vibrant top accent header with gradient background, semester badges, and a prominent call-to-action button.',
  },
  {
    id: 'style-4',
    name: 'Card Style 4 (Dual-Pane Split Card)',
    description: 'Modern split-pane horizontal card featuring a left gradient accent block for icon/year and a clean content area on the right.',
  },
];

export const StylePickerModal: React.FC<StylePickerModalProps> = ({
  isOpen,
  onClose,
  selectedStyle,
  onSelectStyle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select Card Style</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Choose a card layout matching your timetable specifications.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Grid of styles */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {stylesList.map((styleItem) => {
            const isSelected = selectedStyle === styleItem.id;

            return (
              <div
                key={styleItem.id}
                onClick={() => {
                  onSelectStyle(styleItem.id);
                  onClose();
                }}
                className={`group relative rounded-xl border-2 transition-all p-5 cursor-pointer flex flex-col md:flex-row gap-6 items-start md:items-center ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/20 shadow-md ring-2 ring-blue-600/20'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50'
                }`}
              >
                {/* Style Info & Text */}
                <div className="md:w-[30%] w-full space-y-2 shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-base">
                      {styleItem.name}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {styleItem.description}
                  </p>
                  
                  <div className="pt-2">
                    <button
                      type="button"
                      className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 group-hover:bg-blue-600 group-hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Use This Style'}
                    </button>
                  </div>
                </div>

                {/* Visual Preview */}
                <div className="md:w-[70%] w-full bg-gray-50/80 p-4 sm:p-5 rounded-xl border border-gray-100 min-w-0 flex items-center justify-center">
                  <TimetableBlock
                    title=""
                    description=""
                    cardStyle={styleItem.id as any}
                    timetables={[sampleTimetable]}
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
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
