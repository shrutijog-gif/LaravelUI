import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Download, 
  RefreshCw, 
  Trash2, 
  ChevronRight, 
  X, 
  FileCheck2, 
  Layers, 
  Eye, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  UniversityCalendarDocument 
} from '../../../../types/universityCalendar';
import { 
  processCalendarUploadWithAI 
} from '../../../../services/universityCalendarAnalysisService';

interface UniversityAcademicCalendarUploadLandingProps {
  documents: UniversityCalendarDocument[];
  onReviewExtractedData: (doc: UniversityCalendarDocument) => void;
  onReanalyse: (doc: UniversityCalendarDocument) => void;
  onDeleteDocument: (id: string) => void;
}

export const UniversityAcademicCalendarUploadLanding: React.FC<UniversityAcademicCalendarUploadLandingProps> = ({
  documents,
  onReviewExtractedData,
  onReanalyse,
  onDeleteDocument
}) => {
  // Upload and drag-and-drop states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Extraction Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('Initializing AI extraction pipeline...');
  const [progressPercent, setProgressPercent] = useState(0);
  const cancelProcessingRef = useRef(false);

  // Recent Documents filter and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs-review' | 'verified'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Supported extensions
  const ALLOWED_EXTENSIONS = ['pdf', 'xls', 'xlsx', 'doc', 'docx'];
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

  const validateAndSetFile = (file: File) => {
    setFileError(null);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(`Unsupported file format (.${ext}). Supported formats: PDF, XLS, XLSX, DOC, DOCX`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError('File size exceeds 25 MB limit. Please select a smaller document.');
      return false;
    }

    setSelectedFile(file);
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgressPercent(10);
    setProcessingStage('Reading document text and OCR layer...');
    cancelProcessingRef.current = false;

    try {
      const createdDoc = await processCalendarUploadWithAI(selectedFile, (stage, percent) => {
        if (!cancelProcessingRef.current) {
          setProcessingStage(stage);
          setProgressPercent(percent);
        }
      });

      if (!cancelProcessingRef.current) {
        setProgressPercent(100);
        setProcessingStage('Extraction completed successfully. Opening review...');
        setTimeout(() => {
          setIsProcessing(false);
          setSelectedFile(null);
          onReviewExtractedData(createdDoc);
        }, 600);
      }
    } catch (err: any) {
      if (!cancelProcessingRef.current) {
        setIsProcessing(false);
        setFileError(`AI extraction failed: ${err?.message || 'Unable to parse document.'}`);
      }
    }
  };

  const handleCancelAnalysis = () => {
    cancelProcessingRef.current = true;
    setIsProcessing(false);
    setProgressPercent(0);
    setProcessingStage('');
  };

  // Quick load test document helper
  const handleLoadSamplePdf = () => {
    // Create simulated file representing the actual SPPU Science & Technology Circular 197/2026
    const blob = new Blob(['%PDF-1.4 simulated SPPU Circular 197/2026'], { type: 'application/pdf' });
    const sampleFile = new File([blob], 'SPPU-Science_&_Technology_Academic_Year_2026-27.pdf', {
      type: 'application/pdf',
      lastModified: Date.now()
    });
    setSelectedFile(sampleFile);
    setFileError(null);
  };

  // Filtered recent documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.calendarTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.academicYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.programsIdentified.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'needs-review') {
      return doc.verificationStatus === 'Needs Review';
    }
    if (statusFilter === 'verified') {
      return doc.verificationStatus === 'Verified';
    }
    return true;
  });

  const totalDocuments = documents.length;
  const needsReviewCount = documents.filter(d => d.verificationStatus === 'Needs Review').length;
  const verifiedCount = documents.filter(d => d.verificationStatus === 'Verified').length;

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. Header Section                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                University Academic Calendar
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Extraction Engine Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload and analyse university academic calendars to automatically organise academic schedules, programs, terms and events.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-3 py-1.5 rounded-lg bg-gray-100 font-medium">
              SPPU & MU Circular Support Active
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. Central AI Upload Dropzone (Inspired by NAAC Quick Evidence Drop) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xls,.xlsx,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* PROCESSING STATE: Animated progress and stages */}
        {isProcessing ? (
          <div className="max-w-xl mx-auto py-8 text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <Sparkles className="w-8 h-8 animate-spin text-blue-600" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                Analysing University Academic Calendar with AI
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                {selectedFile?.name}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="font-medium text-blue-700">{processingStage}</span>
                <span className="font-bold">{progressPercent}%</span>
              </div>
            </div>

            {/* Stage Steps Indicator */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-left pt-2">
              <div className={`p-2 rounded border ${progressPercent >= 20 ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                1. Text OCR
              </div>
              <div className={`p-2 rounded border ${progressPercent >= 45 ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                2. Circular Metadata
              </div>
              <div className={`p-2 rounded border ${progressPercent >= 70 ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                3. Merged Table Rows
              </div>
              <div className={`p-2 rounded border ${progressPercent >= 90 ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                4. Term Schedules
              </div>
            </div>

            {/* Cancel Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCancelAnalysis}
                className="px-4 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel Analysis
              </button>
            </div>
          </div>
        ) : !selectedFile ? (
          /* STATE A: NO FILE SELECTED - LARGE DROPZONE */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-3xl mx-auto border-2 border-dashed rounded-2xl py-10 px-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-100 scale-[1.01]'
                : 'border-gray-300 hover:border-blue-400 hover:bg-slate-50/60 bg-white'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-slate-600 mb-3 shadow-2xs">
              <Upload className="w-7 h-7 text-slate-600 stroke-[2.2]" />
            </div>

            <p className="text-base sm:text-lg font-bold text-gray-800 tracking-tight">
              Drag &amp; drop academic calendar here
            </p>

            <p className="text-xs text-gray-500 mt-1 max-w-md">
              Upload university circulars, semester calendars, or term schedules. AI will automatically extract programs, merged table cells, and academic dates.
            </p>

            <div className="mt-4">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-colors shadow-2xs">
                Choose File to Upload
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-gray-400 mt-3 font-medium">
              Supported formats: PDF, XLS, XLSX, DOC, DOCX &bull; Maximum file size: 25 MB
            </p>

            {/* Quick Test Document Pill */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSamplePdf();
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Use Test Document: SPPU Science &amp; Technology Circular 197/2026 PDF</span>
            </div>
          </div>
        ) : (
          /* STATE B: FILE SELECTED - UNIFIED CARD BOX */
          <div className="w-full max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
            <div className="border border-blue-200 rounded-2xl p-5 bg-gradient-to-b from-blue-50/40 to-white shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {selectedFile.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 uppercase">
                        {selectedFile.name.split('.').pop()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedFile.size > 1024 * 1024 
                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` 
                        : `${Math.round(selectedFile.size / 1024)} KB`} &bull; Ready for AI extraction
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
                  >
                    Replace File
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notice / Guidance */}
              <div className="mt-4 pt-3.5 border-t border-blue-100 flex items-start gap-2.5 text-xs text-blue-900/80">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  No manual fields required. AI will automatically identify the <strong>University Name</strong>, <strong>Academic Year</strong>, <strong>Faculty / Stream</strong>, <strong>Programs</strong>, <strong>Merged Table Rows</strong>, and <strong>Term I / Term II Dates</strong>.
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleTriggerAnalysis}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Analyse Academic Calendar with AI
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {fileError && (
          <div className="max-w-3xl mx-auto mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 font-medium">{fileError}</div>
            <button
              onClick={() => setFileError(null)}
              className="text-rose-400 hover:text-rose-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. Summary Counters Strip                                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Total Documents
            </span>
            <span className="text-xl font-bold text-gray-900 mt-0.5 block">
              {totalDocuments}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              Needs Review
            </span>
            <span className="text-xl font-bold text-amber-700 mt-0.5 block">
              {needsReviewCount}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              Verified &amp; Approved
            </span>
            <span className="text-xl font-bold text-emerald-700 mt-0.5 block">
              {verifiedCount}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. Recent University Documents & Calendars List                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Recent University Calendars &amp; Documents
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review extracted milestones, verify circular schedules, or re-run analysis.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter Tabs */}
            <div className="flex bg-gray-200/80 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({totalDocuments})
              </button>
              <button
                onClick={() => setStatusFilter('needs-review')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'needs-review'
                    ? 'bg-white text-amber-800 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Needs Review ({needsReviewCount})
              </button>
              <button
                onClick={() => setStatusFilter('verified')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'verified'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Verified ({verifiedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search calendars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 border-collapse">
            <thead className="bg-gray-100/70 text-gray-600 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 min-w-[220px]">University &amp; Calendar Title</th>
                <th className="px-4 py-3 min-w-[100px]">Academic Year</th>
                <th className="px-4 py-3 min-w-[140px]">Faculty / Stream</th>
                <th className="px-4 py-3 min-w-[180px]">Programs Identified</th>
                <th className="px-4 py-3 min-w-[100px]">Uploaded Date</th>
                <th className="px-4 py-3 min-w-[120px]">Extraction</th>
                <th className="px-4 py-3 min-w-[110px]">Verification</th>
                <th className="px-4 py-3 min-w-[140px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No university calendars found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* University & Title */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-900 leading-tight">
                        {doc.universityName}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                        {doc.calendarTitle}
                      </div>
                      {doc.circularNumber && (
                        <span className="inline-block text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mt-1 font-mono font-medium">
                          {doc.circularNumber}
                        </span>
                      )}
                    </td>

                    {/* Academic Year */}
                    <td className="px-4 py-3.5 font-semibold text-gray-800">
                      {doc.academicYear}
                    </td>

                    {/* Faculty */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-800">
                        {doc.applicableFaculties?.join(', ') || 'Science & Technology'}
                      </span>
                    </td>

                    {/* Programs Identified */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {doc.programsIdentified?.slice(0, 3).map((prog, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200/60 truncate max-w-[200px]"
                            title={prog}
                          >
                            {prog}
                          </span>
                        ))}
                        {doc.programsIdentified?.length > 3 && (
                          <span className="text-[10px] text-gray-400 font-semibold self-center">
                            +{doc.programsIdentified.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Uploaded Date */}
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {doc.uploadedDate}
                    </td>

                    {/* Extraction Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.extractionStatus === 'Extraction Completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : doc.extractionStatus === 'Processing'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200 animate-pulse'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.extractionStatus === 'Extraction Completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {doc.extractionStatus}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.verificationStatus === 'Verified'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : doc.verificationStatus === 'Needs Review'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.verificationStatus === 'Verified' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                        {doc.verificationStatus === 'Needs Review' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {doc.verificationStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onReviewExtractedData(doc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                          title="Review Extracted Data & Quality Gate"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review Data
                        </button>

                        <a
                          href={doc.file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={doc.file.fileName}
                          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Download Original File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => onReanalyse(doc)}
                          className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Re-analyse Document"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(doc.id)}
                          className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-gray-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Delete University Calendar</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to delete this document and its associated extracted records?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDocument(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
