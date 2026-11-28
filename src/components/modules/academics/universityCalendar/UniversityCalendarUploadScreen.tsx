import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileCheck2, 
  Table2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  UniversityCalendarDocument 
} from '../../../../types/universityCalendar';
import { 
  processCalendarUploadWithAI 
} from '../../../../services/universityCalendarAnalysisService';

interface UniversityCalendarUploadScreenProps {
  uploadedCalendarsCount: number;
  onNavigateToUploadedCalendars: () => void;
  onAnalysisSuccess: (doc: UniversityCalendarDocument) => void;
}

export const UniversityCalendarUploadScreen: React.FC<UniversityCalendarUploadScreenProps> = ({
  uploadedCalendarsCount,
  onNavigateToUploadedCalendars,
  onAnalysisSuccess
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
          onAnalysisSuccess(createdDoc);
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

  // Quick load test document helper for SPPU Circular 197/2026
  const handleLoadSamplePdf = () => {
    const blob = new Blob(['%PDF-1.4 simulated SPPU Circular 197/2026'], { type: 'application/pdf' });
    const sampleFile = new File([blob], 'SPPU-Science_&_Technology_Academic_Year_2026-27.pdf', {
      type: 'application/pdf',
      lastModified: Date.now()
    });
    setSelectedFile(sampleFile);
    setFileError(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Page Header with Direct Navigation to Screen 2                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Upload University Academic Calendar
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload university academic calendars to automatically organise academic schedules, programs, terms and events.
            </p>
          </div>

          {/* Navigation Action: View Uploaded Calendars (Screen 2) */}
          <button
            type="button"
            onClick={onNavigateToUploadedCalendars}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Table2 className="w-4 h-4" />
            <span>View Uploaded Calendars</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-200/80 text-blue-900 font-mono text-[10px]">
              {uploadedCalendarsCount}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Main Drag & Drop Upload Area (NAAC Evidence Drop Style)             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 shadow-sm">
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
          <div className="max-w-xl mx-auto py-10 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <Sparkles className="w-8 h-8 animate-spin text-blue-600" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                Analysing Academic Calendar with AI
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

            {/* Cancel Option */}
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
          /* STATE A: NO FILE SELECTED - MINIMAL CLEAN DROPZONE */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl mx-auto border-2 border-dashed rounded-2xl py-14 px-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-100 scale-[1.01]'
                : 'border-gray-300 hover:border-blue-400 hover:bg-slate-50/60 bg-white'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-slate-600 mb-3 shadow-2xs">
              <Upload className="w-8 h-8 text-slate-600 stroke-[2.2]" />
            </div>

            <p className="text-base sm:text-lg font-bold text-gray-800 tracking-tight">
              Drag &amp; drop academic calendar here
            </p>

            <p className="text-xs text-gray-500 mt-1 max-w-md">
              Upload university circulars, semester calendars, or term schedules. AI will automatically extract programs, merged table cells, and academic dates.
            </p>

            <div className="mt-5">
              <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-colors shadow-2xs">
                Choose File to Upload
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-gray-400 mt-4 font-medium">
              Supported formats: PDF, XLS, XLSX, DOC, DOCX &bull; Maximum file size: 25 MB
            </p>

            {/* Quick Test Document Pill */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSamplePdf();
              }}
              className="mt-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Use Test Document: SPPU Science &amp; Technology Circular 197/2026 PDF</span>
            </div>
          </div>
        ) : (
          /* STATE B: FILE SELECTED - UNIFIED CARD BOX */
          <div className="w-full max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
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

              {/* Guidance */}
              <div className="mt-4 pt-3.5 border-t border-blue-100 flex items-start gap-2.5 text-xs text-blue-900/80">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  No manual data entry required. AI will automatically detect the <strong>University</strong>, <strong>Academic Year</strong>, <strong>Faculty</strong>, <strong>Programs</strong>, <strong>Merged Rows</strong>, and <strong>Dates</strong>.
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTriggerAnalysis}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyse Academic Calendar with AI</span>
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {fileError && (
          <div className="max-w-2xl mx-auto mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
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
    </div>
  );
};
