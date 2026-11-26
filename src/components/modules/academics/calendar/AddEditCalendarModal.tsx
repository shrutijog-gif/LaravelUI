import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { 
  AcademicCalendar, 
  CalendarType, 
  CALENDAR_TYPES, 
  ACADEMIC_YEARS, 
  COLLEGE_DEPARTMENTS, 
  UploadedCalendarDocument 
} from '../../../../types/academicCalendar';

interface AddEditCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarToEdit: AcademicCalendar | null;
  onSave: (
    calendarData: Omit<AcademicCalendar, 'id' | 'createdAt' | 'updatedAt' | 'eventsCount'>,
    triggerExtraction: boolean
  ) => void;
}

export const AddEditCalendarModal: React.FC<AddEditCalendarModalProps> = ({
  isOpen,
  onClose,
  calendarToEdit,
  onSave
}) => {
  const [name, setName] = useState('');
  const [calendarType, setCalendarType] = useState<CalendarType>('College Calendar');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [institutionName, setInstitutionName] = useState('Elite Autonomous College of Arts, Science and Commerce');
  const [department, setDepartment] = useState('');
  const [program, setProgram] = useState('');
  const [semester, setSemester] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<AcademicCalendar['status']>('Draft');

  // File upload state
  const [uploadedDoc, setUploadedDoc] = useState<UploadedCalendarDocument | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [triggerExtraction, setTriggerExtraction] = useState(true);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (calendarToEdit) {
      setName(calendarToEdit.name);
      setCalendarType(calendarToEdit.calendarType);
      setAcademicYear(calendarToEdit.academicYear);
      setInstitutionName(calendarToEdit.institutionName || 'Elite Autonomous College of Arts, Science and Commerce');
      setDepartment(calendarToEdit.department || '');
      setProgram(calendarToEdit.program || '');
      setSemester(calendarToEdit.semester || '');
      setStartDate(calendarToEdit.startDate);
      setEndDate(calendarToEdit.endDate);
      setDescription(calendarToEdit.description || '');
      setStatus(calendarToEdit.status);
      setUploadedDoc(calendarToEdit.uploadedDocument || null);
      setTriggerExtraction(false);
    } else {
      setName('');
      setCalendarType('College Calendar');
      setAcademicYear('2026-2027');
      setInstitutionName('Elite Autonomous College of Arts, Science and Commerce');
      setDepartment('');
      setProgram('');
      setSemester('');
      setStartDate('2026-07-01');
      setEndDate('2027-05-31');
      setDescription('');
      setStatus('Draft');
      setUploadedDoc(null);
      setTriggerExtraction(true);
    }
    setErrors({});
    setFileError('');
  }, [calendarToEdit, isOpen]);

  if (!isOpen) return null;

  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

  const handleFileProcess = (file: File) => {
    setFileError('');
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext)) {
      setFileError(`Unsupported format (.${ext}). Please upload PDF, DOC, DOCX, XLS, or XLSX.`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFileError('File size exceeds the 25 MB limit.');
      return;
    }

    // Format size
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    // Create a local blob URL for immediate preview
    const fileUrl = URL.createObjectURL(file);

    setUploadedDoc({
      fileName: file.name,
      fileSize: sizeStr,
      fileType: ext,
      fileUrl,
      uploadDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleBrowseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Calendar name is required';
    if (!calendarType) errs.calendarType = 'Please select a calendar type';
    if (!academicYear) errs.academicYear = 'Please select an academic year';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!endDate) errs.endDate = 'End date is required';
    if (startDate && endDate && startDate > endDate) {
      errs.endDate = 'End date cannot be earlier than start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: name.trim(),
      calendarType,
      academicYear,
      institutionName: institutionName.trim(),
      department: department.trim() || undefined,
      program: program.trim() || undefined,
      semester: semester.trim() || undefined,
      startDate,
      endDate,
      description: description.trim() || undefined,
      status,
      uploadedDocument: uploadedDoc || undefined
    }, triggerExtraction && Boolean(uploadedDoc));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] flex flex-col my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {calendarToEdit ? 'Edit Academic Calendar' : 'Add New Academic Calendar'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Define academic term schedules, institutional calendars, or upload official notification documents.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Calendar Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Calendar Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. State University Master Academic Calendar 2026-27"
              className={`w-full border rounded-lg px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-400 bg-red-50/20' : 'border-gray-300 bg-white'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Grid: Calendar Type & Academic Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Calendar Type <span className="text-red-500">*</span>
              </label>
              <select
                value={calendarType}
                onChange={e => setCalendarType(e.target.value as CalendarType)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CALENDAR_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ACADEMIC_YEARS.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* University / College Institution */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              University / College Organization
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={e => setInstitutionName(e.target.value)}
              placeholder="e.g. Elite Autonomous College of Arts, Science and Commerce"
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department, Program, Semester (Conditional / Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Department <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {COLLEGE_DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Program <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={program}
                onChange={e => setProgram(e.target.value)}
                placeholder="e.g. B.Tech CSE / B.Com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Semester / Term <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={semester}
                onChange={e => setSemester(e.target.value)}
                placeholder="e.g. Sem 1 & 2 / Odd Sem"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={`w-full border rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? 'border-red-400 bg-red-50/20' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className={`w-full border rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-400 bg-red-50/20' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide context, circular references, Academic Council approval numbers or remarks..."
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Document Upload Section (Section 6) */}
          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider">
                Upload Calendar Document
              </label>
              <span className="text-[11px] text-gray-500">
                Optional: You can also create calendars manually
              </span>
            </div>

            {uploadedDoc ? (
              <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {uploadedDoc.fileType}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {uploadedDoc.fileName}
                    </p>
                    <div className="flex items-center gap-2.5 text-xs text-gray-500 mt-0.5">
                      <span>{uploadedDoc.fileSize}</span>
                      <span>•</span>
                      <span>Uploaded: {uploadedDoc.uploadDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadedDoc(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
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
                  Drag and drop calendar file here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 underline font-semibold cursor-pointer"
                  >
                    Browse Files
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max size: 25 MB)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleBrowseChange}
              className="hidden"
            />

            {fileError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Document Extraction Checkbox (Section 7) */}
            {uploadedDoc && !calendarToEdit && (
              <div className="mt-3 bg-indigo-50/70 border border-indigo-200/80 rounded-lg p-3 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="trigger-extraction-cb"
                  checked={triggerExtraction}
                  onChange={e => setTriggerExtraction(e.target.checked)}
                  className="mt-0.5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="trigger-extraction-cb" className="text-xs text-indigo-900 cursor-pointer">
                  <span className="font-bold">Automatically extract academic dates and events</span>
                  <p className="text-indigo-700 mt-0.5">
                    Analyzes the uploaded document to extract exam windows, holidays, CIE dates, and vacations into an editable verification review table before publishing.
                  </p>
                </label>
              </div>
            )}
          </div>

          {/* Status selector */}
          <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Calendar Status
            </span>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as AcademicCalendar['status'])}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {calendarToEdit ? 'Save Changes' : uploadedDoc && triggerExtraction ? 'Save & Review Extracted Events' : 'Create Calendar'}
          </button>
        </div>
      </div>
    </div>
  );
};
