import React, { useState, useEffect, useRef } from 'react';
import { Upload, XCircle, ChevronDown, Check } from 'lucide-react';
import { Drawer } from '../../../common/Drawer';
import { Timetable } from '../../../../types/timetable';

// Custom Multi-Select Component
interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange, placeholder = "Select options..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);

  const isAllSelected = options.length > 0 && selected.length === options.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If there is less than 260px (approx height of dropdown) below, open upwards
      if (spaceBelow < 260) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(i => i !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-900 mb-1.5">{label}</label>
      <div 
        className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm cursor-pointer min-h-[40px] flex items-center justify-between focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1">
          {selected.length === 0 && <span className="text-gray-400">{placeholder}</span>}
          {selected.length > 0 && selected.length < options.length && (
            selected.map(s => (
              <span key={s} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                {s}
                <button 
                  type="button" 
                  className="hover:text-red-500 rounded-full flex items-center justify-center transition-colors"
                  onClick={(e) => { e.stopPropagation(); toggleOption(s); }}
                >×</button>
              </span>
            ))
          )}
          {isAllSelected && <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded font-medium">All Selected</span>}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
      </div>
      
      {isOpen && (
        <div className={`absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto ${
          dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}>
          <div 
            className="p-2.5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors" 
            onClick={toggleAll}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isAllSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
              {isAllSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm font-medium text-gray-900">Select All</span>
          </div>
          {options.map(opt => {
            const isSelected = selected.includes(opt);
            return (
              <div 
                key={opt} 
                className="p-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors" 
                onClick={() => toggleOption(opt)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-gray-800">{opt}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Main Drawer Component
interface TimetableDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  timetableToEdit: Timetable | null;
  onSave: (timetable: Omit<Timetable, 'id' | 'createdAt'>) => void;
}

export const TimetableDrawer: React.FC<TimetableDrawerProps> = ({
  isOpen,
  onClose,
  timetableToEdit,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    semester: [] as string[],
    branch: [] as string[],
    section: [] as string[],
    year: '2026-27',
    fileName: '',
    fileUrl: '',
    showOnWebsite: true
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (timetableToEdit) {
        setFormData({
          name: timetableToEdit.name,
          semester: timetableToEdit.semester || [],
          branch: timetableToEdit.branch || [],
          section: timetableToEdit.section || [],
          year: timetableToEdit.year || '2026-27',
          fileName: timetableToEdit.fileName,
          fileUrl: timetableToEdit.fileUrl,
          showOnWebsite: timetableToEdit.showOnWebsite ?? true
        });
      } else {
        setFormData({
          name: '',
          semester: [],
          branch: [],
          section: [],
          year: '2026-27',
          fileName: '',
          fileUrl: '',
          showOnWebsite: true
        });
      }
    }
  }, [isOpen, timetableToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.year.trim() || !formData.fileName) {
      alert("Please fill in all mandatory fields, including uploading a file.");
      return;
    }
    onSave(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file) 
      }));
    }
  };

  const semesterOptions = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const branchOptions = ['BCA', 'BBA', 'B.Com', 'B.Tech', 'MBA'];
  const sectionOptions = ['A', 'B', 'C', 'D'];
  
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const startYear = currentYear + i;
    const endYear = (startYear + 1).toString().slice(-2);
    return `${startYear}-${endYear}`;
  });

  const inputClassName = "w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow min-h-[40px]";
  const labelClassName = "block text-sm font-medium text-gray-900 mb-1.5";

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Timetable"
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="timetable-drawer-form"
            className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors ml-3"
          >
            Save
          </button>
        </>
      }
    >
      <form id="timetable-drawer-form" onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Full Width Fields */}
        <div className="space-y-6">
          <div>
            <label className={labelClassName}>
              Timetable Name <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Even Semester Time Table 2026–27"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>
              Upload File <span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex gap-3 items-center w-full bg-white border border-gray-200 rounded-md pr-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow min-h-[40px]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border-r border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors h-full rounded-l-md"
                >
                  Choose File
                </button>
                {formData.fileName && (
                  <a 
                    href={formData.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate flex-1 pl-1"
                  >
                    {formData.fileName}
                  </a>
                )}
                {!formData.fileName && (
                  <span className="text-sm text-gray-500 truncate flex-1 pl-1">
                    No file chosen
                  </span>
                )}
                
                {formData.fileName && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, fileName: '', fileUrl: '' }))}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-2">
          
          <div>
            <label className={labelClassName}>
              Academic Year <span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className={`${inputClassName} appearance-none cursor-pointer`}
              >
                <option value="" disabled>Select Year</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <MultiSelect
            label="Semester"
            options={semesterOptions}
            selected={formData.semester}
            onChange={(val) => setFormData({ ...formData, semester: val })}
            placeholder="Select Semester"
          />

          <MultiSelect
            label="Programme / Branch"
            options={branchOptions}
            selected={formData.branch}
            onChange={(val) => setFormData({ ...formData, branch: val })}
            placeholder="Select Programme"
          />

          <MultiSelect
            label="Section"
            options={sectionOptions}
            selected={formData.section}
            onChange={(val) => setFormData({ ...formData, section: val })}
            placeholder="Select Section"
          />

          <div>
            <label className={labelClassName}>
              Show on Website
            </label>
            <div className="flex items-center gap-3 h-[40px]">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, showOnWebsite: !prev.showOnWebsite }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.showOnWebsite ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.showOnWebsite ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${formData.showOnWebsite ? 'text-blue-600' : 'text-gray-500'}`}>
                {formData.showOnWebsite ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

        </div>

      </form>
    </Drawer>
  );
};
