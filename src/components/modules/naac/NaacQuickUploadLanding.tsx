import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FolderOpen, 
  ArrowRight, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Search, 
  Clock, 
  ShieldCheck, 
  Check, 
  Layers, 
  Calendar,
  X,
  FileCheck2,
  HardDrive,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  Mic,
  Camera
} from 'lucide-react';
import { 
  NAAC_CRITERIA_SUMMARY, 
  NAAC_METRICS_LIST, 
  KEY_INDICATORS,
  NaacEvidenceDocument, 
  getStoredNaacDocuments, 
  addOrUpdateNaacDocument, 
  deleteNaacDocument 
} from '../../../data/naacDmsData';
import { openFileInNewTab } from '../../../utils/fileHelper';

export interface NaacQuickUploadLandingProps {
  academicYear: string;
  onNavigateToDocumentList: (critCode?: string, metricCode?: string) => void;
}

export const NaacQuickUploadLanding: React.FC<NaacQuickUploadLandingProps> = ({
  academicYear,
  onNavigateToDocumentList,
}) => {
  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() => getStoredNaacDocuments());
  const [isDragging, setIsDragging] = useState(false);
  const [isBarDragging, setIsBarDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [documentDescription, setDocumentDescription] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Google Bar & AI Mode state
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState<boolean>(false);

  // Filter state for recent uploads list
  const [searchQuery, setSearchQuery] = useState('');
  const [criterionFilter, setCriterionFilter] = useState<string>('ALL');

  // Sync documents from storage
  const refreshDocuments = () => {
    setDocuments(getStoredNaacDocuments());
  };

  // Destination Target State (Criterion, Key Indicator, Metric)
  const [selectedCriterionCode, setSelectedCriterionCode] = useState<string>('Criterion 6');
  const [selectedKeyIndicatorCode, setSelectedKeyIndicatorCode] = useState<string>('6.5');
  const [selectedMetricCode, setSelectedMetricCode] = useState<string>('6.5.1');
  const [isChangeOpen, setIsChangeOpen] = useState<boolean>(false);

  // Filter key indicators and metrics based on selected criterion
  const availableKeyIndicators = KEY_INDICATORS.filter(
    (ki) => ki.criterionCode.toLowerCase() === selectedCriterionCode.toLowerCase()
  );
  const currentKeyIndicator = KEY_INDICATORS.find(
    (ki) => ki.code === selectedKeyIndicatorCode
  ) || availableKeyIndicators[0];

  const availableMetrics = NAAC_METRICS_LIST.filter(
    (m) => m.criterionCode.toLowerCase() === selectedCriterionCode.toLowerCase()
  );
  const currentMetric = NAAC_METRICS_LIST.find((m) => m.code === selectedMetricCode) || availableMetrics[0];

  // When criterion changes, auto-select corresponding Key Indicator and Metric
  const handleCriterionChange = (critCode: string) => {
    setSelectedCriterionCode(critCode);
    const kis = KEY_INDICATORS.filter(
      (ki) => ki.criterionCode.toLowerCase() === critCode.toLowerCase()
    );
    const newKiCode = kis[0]?.code || '1.1';
    setSelectedKeyIndicatorCode(newKiCode);

    const metricsForCrit = NAAC_METRICS_LIST.filter(
      (m) => m.criterionCode.toLowerCase() === critCode.toLowerCase()
    );
    const matchingMetric = metricsForCrit.find(m => m.code.startsWith(newKiCode)) || metricsForCrit[0];
    if (matchingMetric) {
      setSelectedMetricCode(matchingMetric.code);
    }
  };

  // When key indicator changes, auto-select first matching metric
  const handleKeyIndicatorChange = (kiCode: string) => {
    setSelectedKeyIndicatorCode(kiCode);
    const matchingMetrics = availableMetrics.filter(m => m.code.startsWith(kiCode));
    if (matchingMetrics.length > 0) {
      setSelectedMetricCode(matchingMetrics[0].code);
    }
  };

  // Smart AI Metric Suggestion based on file name
  const getAiSuggestion = (filename: string): { crit: string; keyIndicator: string; metric: string; reason: string } => {
    const lower = filename.toLowerCase();
    if (lower.includes('syllabus') || lower.includes('curriculum') || lower.includes('lesson') || lower.includes('timetable')) {
      return { crit: 'Criterion 1', keyIndicator: '1.1', metric: '1.1.1', reason: 'Curricular Planning & Implementation' };
    }
    if (lower.includes('elective') || lower.includes('cbcs')) {
      return { crit: 'Criterion 1', keyIndicator: '1.2', metric: '1.2.1', reason: 'CBCS Academic Flexibility' };
    }
    if (lower.includes('enrichment') || lower.includes('value added')) {
      return { crit: 'Criterion 1', keyIndicator: '1.3', metric: '1.3.1', reason: 'Curriculum Enrichment' };
    }
    if (lower.includes('feedback') || lower.includes('atr') || lower.includes('stakeholder')) {
      return { crit: 'Criterion 1', keyIndicator: '1.4', metric: '1.4.1', reason: 'Feedback System & ATR' };
    }
    if (lower.includes('enroll') || lower.includes('admission') || lower.includes('student') || lower.includes('intake')) {
      return { crit: 'Criterion 2', keyIndicator: '2.1', metric: '2.1.1', reason: 'Student Enrolment Profile' };
    }
    if (lower.includes('experiential') || lower.includes('visit') || lower.includes('project') || lower.includes('lab manual')) {
      return { crit: 'Criterion 2', keyIndicator: '2.3', metric: '2.3.1', reason: 'Student-Centric Experiential Methods' };
    }
    if (lower.includes('phd') || lower.includes('faculty') || lower.includes('teacher') || lower.includes('credentials')) {
      return { crit: 'Criterion 2', keyIndicator: '2.4', metric: '2.4.1', reason: 'Teacher Profile & Credentials' };
    }
    if (lower.includes('outcome') || lower.includes('po') || lower.includes('co') || lower.includes('attainment')) {
      return { crit: 'Criterion 2', keyIndicator: '2.6', metric: '2.6.1', reason: 'PO/CO Learning Outcomes' };
    }
    if (lower.includes('grant') || lower.includes('research') || lower.includes('fund') || lower.includes('seed')) {
      return { crit: 'Criterion 3', keyIndicator: '3.1', metric: '3.1.1', reason: 'Resource Mobilization for Research & Grants' };
    }
    if (lower.includes('incubat') || lower.includes('innovat') || lower.includes('startup') || lower.includes('hackathon')) {
      return { crit: 'Criterion 3', keyIndicator: '3.2', metric: '3.2.1', reason: 'Innovation Ecosystem & Incubation' };
    }
    if (lower.includes('extension') || lower.includes('outreach') || lower.includes('nss') || lower.includes('ncc') || lower.includes('community')) {
      return { crit: 'Criterion 3', keyIndicator: '3.4', metric: '3.4.1', reason: 'Extension & Social Outreach' };
    }
    if (lower.includes('mou') || lower.includes('collaborat') || lower.includes('industry') || lower.includes('linkage')) {
      return { crit: 'Criterion 3', keyIndicator: '3.5', metric: '3.5.1', reason: 'Corporate MoUs & Collaborations' };
    }
    if (lower.includes('lab') || lower.includes('ict') || lower.includes('facility') || lower.includes('classroom') || lower.includes('infrastructure')) {
      return { crit: 'Criterion 4', keyIndicator: '4.1', metric: '4.1.1', reason: 'Physical & ICT Infrastructure' };
    }
    if (lower.includes('library') || lower.includes('book') || lower.includes('journal') || lower.includes('ieee') || lower.includes('springer')) {
      return { crit: 'Criterion 4', keyIndicator: '4.2', metric: '4.2.1', reason: 'Library Learning Resource' };
    }
    if (lower.includes('scholarship') || lower.includes('freeship') || lower.includes('support')) {
      return { crit: 'Criterion 5', keyIndicator: '5.1', metric: '5.1.1', reason: 'Student Support & Freeships' };
    }
    if (lower.includes('sport') || lower.includes('cultural') || lower.includes('award') || lower.includes('event')) {
      return { crit: 'Criterion 5', keyIndicator: '5.3', metric: '5.3.1', reason: 'Student Participation & Awards' };
    }
    if (lower.includes('iqac') || lower.includes('formation') || lower.includes('audit') || lower.includes('quality') || lower.includes('minutes')) {
      return { crit: 'Criterion 6', keyIndicator: '6.5', metric: '6.5.1', reason: 'Internal Quality Assurance (IQAC)' };
    }
    if (lower.includes('gender') || lower.includes('equity') || lower.includes('safety') || lower.includes('icc')) {
      return { crit: 'Criterion 7', keyIndicator: '7.1', metric: '7.1.1', reason: 'Institutional Values & Gender Equity' };
    }
    if (lower.includes('green') || lower.includes('best practice') || lower.includes('sustainability') || lower.includes('case study')) {
      return { crit: 'Criterion 7', keyIndicator: '7.2', metric: '7.2.1', reason: 'Institutional Best Practices' };
    }
    return { crit: 'Criterion 6', keyIndicator: '6.5', metric: '6.5.1', reason: 'Internal Quality Assurance (IQAC)' };
  };

  const [aiSuggestion, setAiSuggestion] = useState<{ crit: string; keyIndicator: string; metric: string; reason: string } | null>(null);

  // File drop / select handler
  const processFile = (file: File) => {
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      setUploadedFile({
        name: file.name,
        size: sizeStr,
        dataUrl,
      });

      // Auto-set title from filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocumentTitle(cleanName);

      // Auto-populate suggestions
      const suggestion = getAiSuggestion(file.name);
      setSelectedCriterionCode(suggestion.crit);
      setSelectedKeyIndicatorCode(suggestion.keyIndicator);
      setSelectedMetricCode(suggestion.metric);
      setAiSuggestion(suggestion);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Real-time title typing and AI metric suggestion
  const handleTitleInput = (val: string) => {
    setDocumentTitle(val);
    if (isAiMode && val.trim().length > 3) {
      const sug = getAiSuggestion(val);
      if (sug) {
        setAiSuggestion(sug);
      }
    }
  };

  // Google Bar Drag & Drop Handlers
  const handleBarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBarDragging(true);
  };

  const handleBarDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBarDragging(false);
  };

  const handleBarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBarDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Speech / Mic click handler
  const handleMicClick = () => {
    setIsListening(true);
    setSuccessToast('🎤 Listening for voice note / document title...');
    setTimeout(() => {
      setIsListening(false);
      if (!documentTitle.trim()) {
        const sample = 'Approved Syllabus Revision & CBCS Handout 2025-26';
        handleTitleInput(sample);
        setSuccessToast(`🎙️ Voice transcribed: "${sample}"`);
        setTimeout(() => setSuccessToast(null), 3500);
      }
    }, 1500);
  };

  // Explicit AI Auto-Tag Trigger
  const handleTriggerAutoTag = () => {
    const textToCheck = uploadedFile?.name || documentTitle;
    if (!textToCheck.trim()) {
      setSuccessToast('Please enter a document title or attach a file to auto-tag.');
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }
    const sug = getAiSuggestion(textToCheck);
    if (sug) {
      handleCriterionChange(sug.crit);
      setSelectedMetricCode(sug.metric);
      setSuccessToast(`AI Auto-Tagged to ${sug.crit} → Metric ${sug.metric} (${sug.reason})`);
      setTimeout(() => setSuccessToast(null), 4000);
    } else {
      setSuccessToast('AI scanned document. Please select target criterion manually.');
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    handleCriterionChange(aiSuggestion.crit);
    setSelectedMetricCode(aiSuggestion.metric);
    setAiSuggestion(null);
  };

  // Confirm and Drop Evidence Document into Repository
  const handleConfirmAndDrop = () => {
    if (!uploadedFile) {
      fileInputRef.current?.click();
      return;
    }

    setIsSubmitting(true);

    const activeCrit = NAAC_CRITERIA_SUMMARY.find((c) => c.code === selectedCriterionCode);
    const activeMetric = NAAC_METRICS_LIST.find((m) => m.code === selectedMetricCode);

    const fileUrl = uploadedFile.dataUrl;
    const fileName = uploadedFile.name;
    const docTitle = documentTitle.trim() || uploadedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const fileSize = uploadedFile.size;

    const newDoc: NaacEvidenceDocument = {
      id: `doc-${Date.now()}`,
      title: docTitle,
      description: `Ingested NAAC evidence for ${selectedCriterionCode} › Key Indicator ${selectedKeyIndicatorCode} › Metric ${selectedMetricCode}.`,
      schoolId: 'sch-eng',
      schoolName: 'School of Engineering & Technology',
      programId: 'prog-cse',
      programName: 'B.Tech Computer Science & Engineering',
      academicYear: academicYear || '2025-26',
      criterionId: activeCrit?.id || 'crit-1',
      criterionCode: selectedCriterionCode,
      metricCode: selectedMetricCode,
      metricName: activeMetric?.name || `${selectedMetricCode} Evidence Proof`,
      metricType: activeMetric?.metricType || 'QnM',
      fileUrl,
      fileName,
      fileSize,
      uploadedBy: 'Program Coordinator (CSE)',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      version: 'v1.0',
    };

    addOrUpdateNaacDocument(newDoc);
    refreshDocuments();

    setSuccessToast(`Document "${fileName}" confirmed & dropped into ${selectedCriterionCode} › KI ${selectedKeyIndicatorCode} › Metric ${selectedMetricCode}!`);
    setTimeout(() => setSuccessToast(null), 5000);

    // Reset Form
    setUploadedFile(null);
    setDocumentTitle('');
    setDocumentDescription('');
    setAiSuggestion(null);
    setIsChangeOpen(false);
    setIsSubmitting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleConfirmAndDrop();
  };

  // Delete handler
  const handleDelete = (docId: string, title: string) => {
    if (window.confirm(`Delete evidence file "${title}"?`)) {
      deleteNaacDocument(docId);
      refreshDocuments();
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.metricCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.criterionCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCriterion = criterionFilter === 'ALL' || doc.criterionCode === criterionFilter;
    return matchesSearch && matchesCriterion;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-top-2 border border-emerald-600">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <div className="text-xs font-medium">
            {successToast}
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessToast(null)} 
            className="ml-2 text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Subtle Navigation Bar */}
      <div className="flex items-center justify-between py-2.5 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#0f2748]">NAAC Proof Vault</span>
          <span className="text-gray-300">•</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono text-[11px] font-semibold border border-blue-200">
            AQAR {academicYear}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500 font-medium">B.Tech CSE</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateToDocumentList()}
            className="text-xs font-semibold text-[#0f2748] hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open Master Repository Document List"
          >
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span>Master Repository</span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
              {documents.length}
            </span>
          </button>
        </div>
      </div>

      {/* Center Google-Style Uncluttered Experience */}
      <div className="flex flex-col items-center justify-center min-h-[64vh] max-w-5xl w-full mx-auto px-4 text-center">
        {/* Bold Heading */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-[#0f2748] select-none">
            NAAC Proof
          </h1>
        </div>

        {/* Google-Style Upload Bar Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* The Upload Area Capsule Bar (Longer & Clickable Everywhere) */}
          <div
            onClick={() => {
              if (!uploadedFile) {
                fileInputRef.current?.click();
              }
            }}
            onDragOver={handleBarDragOver}
            onDragLeave={handleBarDragLeave}
            onDrop={handleBarDrop}
            className={`relative flex items-center bg-white border rounded-full px-4 py-2.5 sm:px-5 sm:py-3 transition-all shadow-[0_2px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_26px_rgba(0,0,0,0.12)] cursor-pointer w-full max-w-4xl mx-auto ${
              isBarDragging
                ? 'border-blue-500 ring-4 ring-blue-100 bg-blue-50/50 scale-[1.005]'
                : 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100/60'
            }`}
          >
            {/* When a file is uploaded: no search, show file chip, target route, and confirm & drop */}
            {uploadedFile ? (
              <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-3 min-w-0 text-left w-full">
                {/* Left: Attached File Chip */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/90 border border-blue-200 text-blue-900 rounded-full text-xs font-semibold shrink-0 max-w-[220px] sm:max-w-[260px] cursor-pointer hover:bg-blue-100 transition-colors shadow-2xs"
                  title="Click to replace file"
                >
                  <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate max-w-[140px]">{uploadedFile.name}</span>
                  <span className="text-[10px] text-blue-500 font-normal shrink-0">({uploadedFile.size})</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                      setAiSuggestion(null);
                    }}
                    className="text-blue-400 hover:text-red-600 ml-0.5 cursor-pointer p-0.5 rounded-full hover:bg-blue-200/50"
                    title="Remove attached file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Center: Auto Suggestions (Criteria, Key Indicator, Metric) */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center px-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Auto:</span>
                  </span>

                  <div className="inline-flex items-center gap-1 text-xs font-semibold overflow-hidden">
                    <span 
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-200 shrink-0 font-bold"
                      title={selectedCriterionCode}
                    >
                      {selectedCriterionCode}
                    </span>
                    <span className="text-gray-400 font-bold">›</span>
                    <span 
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-200 shrink-0 font-medium"
                      title={`Key Indicator ${selectedKeyIndicatorCode}: ${currentKeyIndicator?.name || ''}`}
                    >
                      KI {selectedKeyIndicatorCode}
                    </span>
                    <span className="text-gray-400 font-bold">›</span>
                    <span 
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 shrink-0 font-bold truncate max-w-[180px]"
                      title={`Metric ${selectedMetricCode}: ${currentMetric?.name || ''}`}
                    >
                      Metric {selectedMetricCode}
                    </span>
                  </div>
                </div>

                {/* Right: Change Button + Confirm and Drop Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsChangeOpen(!isChangeOpen);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isChangeOpen
                        ? 'bg-blue-100 text-blue-800 border border-blue-300 ring-2 ring-blue-100'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-2xs'
                    }`}
                    title="Manually select Criterion, Key Indicator, or Metric"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-gray-600" />
                    <span>{isChangeOpen ? 'Hide' : 'Change'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmAndDrop();
                    }}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#0f2748] hover:bg-[#183963] active:scale-[0.98] shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                    title="Confirm destination and ingest evidence into repository"
                  >
                    <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                    <span>Confirm & Drop</span>
                  </button>
                </div>
              </div>
            ) : (
              // Empty State (Click anywhere to upload)
              <div className="flex items-center justify-between w-full min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium select-none truncate">
                    Drop evidence file here or click anywhere to upload...
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <span className="rounded-full px-3 py-1 text-[11px] font-semibold flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs select-none">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Auto-Classification</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Horizontal Side-by-Side Selectboxes - Appears ONLY when user clicks Change */}
          {isChangeOpen && (
            <div className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-xs border border-blue-200 rounded-2xl p-3.5 sm:p-4 shadow-md text-left transition-all animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    Manual Classification
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    Select target destination
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangeOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 cursor-pointer"
                  title="Close manual selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Criterion Select Box */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    1. Criterion
                  </label>
                  <select
                    value={selectedCriterionCode}
                    onChange={(e) => handleCriterionChange(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white text-gray-800 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    {NAAC_CRITERIA_SUMMARY.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}: {c.name.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Key Indicator Select Box */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    2. Key Indicator
                  </label>
                  <select
                    value={selectedKeyIndicatorCode}
                    onChange={(e) => handleKeyIndicatorChange(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white text-gray-800 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    {availableKeyIndicators.map((ki) => (
                      <option key={ki.code} value={ki.code}>
                        KI {ki.code}: {ki.name.substring(0, 32)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Metric Select Box */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    3. Metric
                  </label>
                  <select
                    value={selectedMetricCode}
                    onChange={(e) => setSelectedMetricCode(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white text-gray-800 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    {availableMetrics.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.code} ({m.metricType}) - {m.name.substring(0, 28)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Simple Clean Guidelines & Repository Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsGuidelinesOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Criteria Guidelines</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToDocumentList()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Master Repository ({documents.length} proofs)</span>
            </button>
          </div>
        </form>

        {/* Google-Style Subtle Footer Link */}
        <div className="pt-8 text-xs text-gray-500">
          <span>NAAC Evidence DMS: Program Coordinator (Prof. Anita Verma) • </span>
          <button
            type="button"
            onClick={() => onNavigateToDocumentList()}
            className="text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            Open Full Repository ({documents.length} proofs) &rarr;
          </button>
        </div>
      </div>

      {/* Criteria Guidelines Modal */}
      {isGuidelinesOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">NAAC Criteria & Evidence Guidelines</h3>
                  <p className="text-[11px] text-gray-500">Official AQAR evidence requirements for 7 core criteria</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGuidelinesOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 divide-y divide-gray-100">
              {NAAC_CRITERIA_SUMMARY.map((crit) => (
                <div key={crit.code} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {crit.code}
                      </span>
                      <span className="text-xs font-bold text-gray-900">{crit.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">({crit.weightage} pts)</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {crit.code === 'Criterion 1' && 'Approved syllabi, BoS minutes, timetable copies, CBCS handouts, curriculum feedback reports.'}
                      {crit.code === 'Criterion 2' && 'Enrolment lists, faculty Ph.D notifications, teacher awards, mentor-mentee records, evaluation schedules.'}
                      {crit.code === 'Criterion 3' && 'Government/industry research grants, seed money sanctions, UGC Care journal publications, signed MoUs.'}
                      {crit.code === 'Criterion 4' && 'Smart classroom geo-tagged photos, LMS portal audit, central library books & e-journals subscription proof.'}
                      {crit.code === 'Criterion 5' && 'Institutional scholarships, competitive exam coaching attendance, student council activities, placement letters.'}
                      {crit.code === 'Criterion 6' && 'Vision/mission documents, IQAC meeting minutes with ATR, CAS promotion files, audited balance sheets.'}
                      {crit.code === 'Criterion 7' && 'Gender audit reports, solar/rainwater plant photos, green campus initiatives, best practice case studies.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleCriterionChange(crit.code);
                      setIsGuidelinesOpen(false);
                      setSuccessToast(`Switched target to ${crit.code}`);
                      setTimeout(() => setSuccessToast(null), 3000);
                    }}
                    className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded border border-blue-200 cursor-pointer transition-colors"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGuidelinesOpen(false)}
                className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};