import React, { useState, useRef, useEffect } from 'react';
import { Drawer } from '../../../common/Drawer';
import { 
  Upload, 
  UploadCloud, 
  FileText, 
  Check, 
  X, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { 
  UniversityDocumentType, 
  UniversityFacultyStream, 
  UNIVERSITY_DOCUMENT_TYPES, 
  UNIVERSITY_FACULTIES, 
  SAMPLE_UNIVERSITIES 
} from '../../../../types/universityCalendar';
import { UploadUniversityCalendarPayload } from '../../../../services/universityCalendarAnalysisService';

interface UploadUniversityCalendarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: UploadUniversityCalendarPayload) => void;
}

export const UploadUniversityCalendarDrawer: React.FC<UploadUniversityCalendarDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [universityName, setUniversityName] = useState(SAMPLE_UNIVERSITIES[0]);
  const [customUniversity, setCustomUniversity] = useState('');
  const [calendarTitle, setCalendarTitle] = useState('');
  const [circularNumber, setCircularNumber] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [documentType, setDocumentType] = useState<UniversityDocumentType>('University Academic Calendar');
  const [selectedFaculties, setSelectedFaculties] = useState<UniversityFacultyStream[]>(['All Faculties']);
  
  // File upload state
  const [file, setFile] = useState<{
    fileName: string;
    fileSize: string;
    fileType: string;
    fileUrl: string;
    rawFile?: File;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUniversityName(SAMPLE_UNIVERSITIES[0]);
      setCustomUniversity('');
      setCalendarTitle('');
      setCircularNumber('');
      setAcademicYear('2026-27');
      setDocumentType('University Academic Calendar');
      setSelectedFaculties(['All Faculties']);
      setFile(null);
      setErrors({});
      setFileError('');
    }
  }, [isOpen]);

  const allowedExtensions = ['pdf', 'xls', 'xlsx', 'doc', 'docx'];

  const handleFileProcess = (selectedFile: File) => {
    setFileError('');
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext)) {
      setFileError(`Unsupported format (.${ext}). Please upload PDF, XLS, XLSX, DOC, or DOCX.`);
      return;
    }

    if (selectedFile.size > 30 * 1024 * 1024) {
      setFileError('File size exceeds the 30 MB maximum limit.');
      return;
    }

    const sizeStr = selectedFile.size > 1024 * 1024 
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(selectedFile.size / 1024)} KB`;

    const fileUrl = URL.createObjectURL(selectedFile);

    setFile({
      fileName: selectedFile.name,
      fileSize: sizeStr,
      fileType: ext,
      fileUrl,
      rawFile: selectedFile
    });

    // Auto-fill calendar title if empty
    if (!calendarTitle.trim()) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setCalendarTitle(cleanName);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const toggleFaculty = (faculty: UniversityFacultyStream) => {
    if (faculty === 'All Faculties') {
      setSelectedFaculties(['All Faculties']);
      return;
    }

    let updated: UniversityFacultyStream[] = selectedFaculties.filter(f => f !== 'All Faculties');
    if (updated.includes(faculty)) {
      updated = updated.filter(f => f !== faculty);
    } else {
      updated.push(faculty);
    }

    if (updated.length === 0) {
      updated = ['All Faculties'];
    }
    setSelectedFaculties(updated);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const finalUniv = universityName === 'Other University / Autonomous Board' ? customUniversity : universityName;
    if (!finalUniv.trim()) {
      errs.universityName = 'University Name is required';
    }
    if (!calendarTitle.trim()) {
      errs.calendarTitle = 'Calendar Title / Circular Title is required';
    }
    if (!academicYear.trim()) {
      errs.academicYear = 'Academic Year is required';
    }
    if (!file) {
      errs.file = 'Please upload a university calendar document (PDF, XLS, XLSX, DOC, DOCX)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!file) return;

    const finalUniv = universityName === 'Other University / Autonomous Board' 
      ? customUniversity.trim() 
      : universityName;

    onSubmit({
      universityName: finalUniv,
      calendarTitle: calendarTitle.trim(),
      circularNumber: circularNumber.trim() || undefined,
      academicYear: academicYear.trim(),
      documentType,
      applicableFaculties: selectedFaculties,
      file: {
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        fileUrl: file.fileUrl
      }
    });
  };

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-blue-200" />
        Send to AI for Analysis
      </button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Upload University Calendar"
      maxWidth="max-w-2xl"
      position="right"
      footer={footer}
    >
      <div className="p-6 space-y-6">
        {/* Header Description Badge (Section 4) */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3 text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Add university academic calendar details and submit the document for AI analysis.</span>
            <p className="text-blue-700 text-[11px] mt-0.5">
              The AI engine will automatically parse program terms, semester schedules, examination windows, and vacations from the uploaded file.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. University Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
              University Name <span className="text-red-500">*</span>
            </label>
            <select
              value={universityName}
              onChange={e => setUniversityName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {SAMPLE_UNIVERSITIES.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            {universityName === 'Other University / Autonomous Board' && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Enter full University / Autonomous Board name..."
                  value={customUniversity}
                  onChange={e => setCustomUniversity(e.target.value)}
                  className={`w-full border rounded-md px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.universityName ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
              </div>
            )}
            {errors.universityName && (
              <p className="text-xs text-red-500 mt-1">{errors.universityName}</p>
            )}
          </div>

          {/* 2. Calendar Title & Circular Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                Calendar Title / Circular Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Academic Calendar 2026–27"
                value={calendarTitle}
                onChange={e => setCalendarTitle(e.target.value)}
                className={`w-full border rounded-md px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.calendarTitle ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.calendarTitle && (
                <p className="text-xs text-red-500 mt-1">{errors.calendarTitle}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                Circular Number <span className="text-gray-400 font-normal lowercase">(opt)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cir No. 229 of 2026"
                value={circularNumber}
                onChange={e => setCircularNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 3. Academic Year & Document Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2026-27">2026–27</option>
                <option value="2025-26">2025–26</option>
                <option value="2024-25">2024–25</option>
                <option value="2023-24">2023–24</option>
              </select>
              {errors.academicYear && (
                <p className="text-xs text-red-500 mt-1">{errors.academicYear}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={documentType}
                onChange={e => setDocumentType(e.target.value as UniversityDocumentType)}
                className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {UNIVERSITY_DOCUMENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Applicable Faculty / Stream (Multi-select) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider">
                Applicable Faculty / Stream <span className="text-gray-400 font-normal lowercase">(multi-select)</span>
              </label>
              <span className="text-[11px] text-gray-500">
                {selectedFaculties.length} selected
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 p-2.5 border border-gray-200 rounded-lg bg-gray-50/50 max-h-36 overflow-y-auto">
              {UNIVERSITY_FACULTIES.map(faculty => {
                const isSelected = selectedFaculties.includes(faculty);
                return (
                  <button
                    key={faculty}
                    type="button"
                    onClick={() => toggleFaculty(faculty)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-2xs' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    {faculty}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Upload Document Section (Section 4 & 6) */}
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
              Upload Document <span className="text-red-500">*</span>
            </label>
            <p className="text-[11px] text-gray-500 mb-2">
              Supported formats: PDF, XLS, XLSX, DOC, DOCX (Max: 30 MB)
            </p>

            {file ? (
              <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {file.fileType}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {file.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{file.fileSize}</span>
                      <span>•</span>
                      <span className="uppercase text-blue-700 font-bold">{file.fileType} Document</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/40'
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  Drag and drop university calendar file here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 underline font-semibold cursor-pointer"
                  >
                    Browse File
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Accepts official circular PDFs, semester schedules, or Excel spreadsheets
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.xls,.xlsx,.doc,.docx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {fileError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {errors.file && (
              <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.file}</p>
            )}
          </div>
        </form>
      </div>
    </Drawer>
  );
};
