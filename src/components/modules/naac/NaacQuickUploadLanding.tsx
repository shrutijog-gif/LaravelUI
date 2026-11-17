import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  FolderOpen, 
  ArrowRight, 
  ExternalLink, 
  Trash2, 
  Eye, 
  EyeOff,
  KeyRound,
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
  Camera,
  ChevronDown,
  Lightbulb,
  Info,
  Loader2,
  Send,
  Home,
  Pencil,
  Copy,
  Settings
} from 'lucide-react';
import { 
  NAAC_CRITERIA_SUMMARY, 
  NAAC_METRICS_LIST,
  KEY_INDICATORS,
  type NaacEvidenceDocument, 
  type NaacWorkflowStatus,
  type NaacSsrCycle,
  getStoredNaacDocuments, 
  addOrUpdateNaacDocument, 
  deleteNaacDocument,
  submitBatchNaacDocuments,
  getStoredNaacCycles,
  saveNaacCycles
} from '../../../data/naacDmsData';
import { openFileInNewTab, generateCompiledNaacIndexPdfDataUrl } from '../../../utils/fileHelper';

export interface NaacQuickUploadLandingProps {
  academicYear: string;
  cycleId?: string;
  onNavigateToDocumentList?: (critCode?: string, metricCode?: string, toastMsg?: string, cycleId?: string) => void;
  // Role & Scope Customization
  role?: 'faculty' | 'program' | 'school' | 'university';
  levelBadgeText?: string;
  portalTitle?: string;
  portalSubtitle?: string;
  headingTitle?: string;
  schoolId?: string;
  schoolName?: string;
  programId?: string;
  programName?: string;
  uploaderName?: string;
  submitTargetName?: string;
  initialSeedDocIds?: string[];
  storageKeySuffix?: string;
  topBarLeftSlot?: React.ReactNode;
  hideTopUploadButton?: boolean;
  initialDirectoryOpen?: boolean;
}

// Global in-memory cache for extracted document text & embedded visual images (keyed by file name and lowercased name)
const globalExtractedTextCache = new Map<string, string>();
const globalEmbeddedImageCache = new Map<string, string>();

export const NaacQuickUploadLanding: React.FC<NaacQuickUploadLandingProps> = ({
  academicYear,
  cycleId,
  onNavigateToDocumentList,
  role = 'program',
  levelBadgeText,
  portalTitle,
  portalSubtitle,
  headingTitle,
  schoolId,
  schoolName,
  programId,
  programName,
  uploaderName,
  submitTargetName,
  initialSeedDocIds,
  storageKeySuffix,
  topBarLeftSlot,
  hideTopUploadButton = false,
  initialDirectoryOpen = false,
}) => {
  const submitTargetLabel =
    submitTargetName ||
    (role === 'school'
      ? 'University Coordinator'
      : role === 'university'
      ? 'Permanent SSR Archive'
      : 'Program Coordinator');

  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() => getStoredNaacDocuments());
  const [cycles, setCycles] = useState<NaacSsrCycle[]>(() => getStoredNaacCycles());
  const [selectedCycleId, setSelectedCycleId] = useState<string>(() => cycleId || getStoredNaacCycles()[0]?.id || 'cycle-1');

  useEffect(() => {
    if (cycleId) {
      setSelectedCycleId(cycleId);
    }
  }, [cycleId]);

  const isInsideCycle = Boolean(cycleId);
  const activeCycleObj = cycles.find((c) => c.id === selectedCycleId) || cycles[0] || null;
  const [isDragging, setIsDragging] = useState(false);
  const [isBarDragging, setIsBarDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [documentDescription, setDocumentDescription] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; dataUrl: string; extractedText?: string; extractedImage?: string } | null>(null);
  const [uploadedFilesBatch, setUploadedFilesBatch] = useState<
    Array<{
      docId: string;
      name: string;
      size: string;
      dataUrl: string;
      crit: string;
      keyIndicator: string;
      metric: string;
      reason?: string;
      source?: 'openai' | 'rule-engine';
      isManualEdit?: boolean;
      docNature?: 'supporting_doc' | 'ground_proof';
      extractedText?: string;
      extractedImage?: string;
      auditChecks?: {
        signature?: boolean;
        stamp?: boolean;
        date?: boolean;
        time?: boolean;
        letterhead?: boolean;
        cycleYear?: boolean;
        geotag?: boolean;
        notes?: string;
      };
    }>
  >([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<{
    message: string;
    action?: {
      critCode?: string;
      metricCode?: string;
    };
  } | string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSuccessToast = (
    msgOrObj: string | { message: string; action?: { critCode?: string; metricCode?: string } },
    actionParam?: { critCode?: string; metricCode?: string },
    durationMs = 8000
  ) => {
    if (typeof msgOrObj === 'string') {
      setSuccessToast({ message: msgOrObj, action: actionParam });
    } else {
      setSuccessToast(msgOrObj);
    }
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setSuccessToast(null);
    }, durationMs);
  };

  // NAAC Readiness Audit Configuration & Popover 
  const [auditConfig, setAuditConfig] = useState<{
    enabled: boolean;
    checkSignature: boolean;
    checkStamp: boolean;
    checkDate: boolean;
    checkTime: boolean;
    checkLetterhead: boolean;
    checkCycleYear?: boolean;
    checkGeotag?: boolean;
  }>({
    enabled: true,
    checkSignature: true,
    checkStamp: true,
    checkDate: true,
    checkTime: true,
    checkLetterhead: true,
  });
  const [activeAuditPopoverId, setActiveAuditPopoverId] = useState<string | null>(null);
  const [isApplyChecksOpen, setIsApplyChecksOpen] = useState<boolean>(false);

  // Google Bar & AI Mode state
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState<boolean>(false);

  // Filter state for recent uploads list
  const [searchQuery, setSearchQuery] = useState('');
  const [criterionFilter, setCriterionFilter] = useState<string>('ALL');

  // My Documents Drawer state & tracking
  const [isMyDocsDrawerOpen, setIsMyDocsDrawerOpen] = useState<boolean>(false);
  const myDocsStorageKey = `naac_my_uploaded_doc_ids_${storageKeySuffix || role || 'v3'}`;
  const [myDocIds, setMyDocIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(myDocsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    if (initialSeedDocIds && initialSeedDocIds.length > 0) {
      return initialSeedDocIds;
    }
    if (role === 'faculty') {
      return ['naac-cse-fac-1', 'naac-cse-fac-1-b', 'naac-cse-fac-5-b'];
    }
    if (role === 'school') {
      return ['naac-doc-2', 'naac-cse-fac-5', 'naac-cse-fac-5-b', 'naac-cse-fac-3'];
    }
    if (role === 'university') {
      return ['naac-doc-4', 'naac-doc-2', 'naac-cse-fac-5'];
    }
    // Default program coordinator
    return [
      'naac-cse-fac-5',
      'naac-cse-fac-5-b',
      'naac-cse-fac-5-c',
      'naac-cse-fac-5-d',
      'naac-cse-fac-5-e',
      'naac-cse-fac-1',
      'naac-cse-fac-1-b',
      'naac-cse-fac-3',
      'naac-cse-fac-2',
      'naac-cse-fac-4',
    ];
  });

  // Auto-sync documents when data layer updates in this tab or another tab
  useEffect(() => {
    const handleSync = () => {
      const freshDocs = getStoredNaacDocuments();
      setDocuments(freshDocs);
      setCycles(getStoredNaacCycles());
      // Clean up selectedDocIds to retain only still-unsubmitted selected documents instead of blindly wiping selection
      setSelectedDocIds((prev) => {
        if (prev.length === 0) return prev;
        const freshMap = new Map(freshDocs.map((d) => [d.id, d]));
        return prev.filter((id) => {
          const doc = freshMap.get(id);
          return (
            doc &&
            !Boolean(
              doc.status === 'submitted_to_program' ||
              doc.status === 'submitted_to_school' ||
              doc.status === 'approved_by_school' ||
              doc.status === 'submitted_to_university' ||
              doc.status === 'university_verified'
            )
          );
        });
      });
      try {
        const saved = localStorage.getItem(myDocsStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setMyDocIds(parsed);
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('naac-dms-updated', handleSync);
    window.addEventListener('naac-cycles-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('naac-dms-updated', handleSync);
      window.removeEventListener('naac-cycles-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [myDocsStorageKey]);

  const myDocuments = (Array.isArray(documents) ? documents : []).filter((doc) => {
    if (!doc || !doc.id) return false;

    // 1. Faculty member role: Dr. Ramesh Gupta proofs ONLY (strictly his own documents)
    if (role === 'faculty') {
      const isMyProgram = !programId || doc.programId === programId || doc.programId === 'prog-cse';
      const validMyDocIds = Array.isArray(myDocIds) ? myDocIds : [];
      const isRameshDoc = Boolean(
        doc.uploadedBy?.toLowerCase().includes('ramesh') ||
        doc.facultyName?.toLowerCase().includes('ramesh') ||
        doc.submittedByFacultyId === 'fac-1'
      );
      // Also allow newly dropped evidence in this active session
      const isNewlyUploadedInSession = validMyDocIds.includes(doc.id) && (!doc.facultyName || doc.uploadedBy?.toLowerCase().includes('ramesh'));
      return isMyProgram && (isRameshDoc || isNewlyUploadedInSession);
    }

    // 2. Explicitly tracked in myDocIds list
    const validMyDocIds = Array.isArray(myDocIds) ? myDocIds : [];
    if (validMyDocIds.includes(doc.id)) return true;

    // 3. Program Coordinator role: any document uploaded by coordinator or belonging to CSE program
    if (role === 'program') {
      const isMyProgram = !programId || doc.programId === programId || doc.programId === 'prog-cse' || Boolean(doc.programName?.toLowerCase().includes('computer science'));
      const isMyUpload = Boolean(
        doc.uploadedBy?.toLowerCase().includes('anita') ||
        doc.uploadedBy?.toLowerCase().includes('program coordinator') ||
        doc.facultyName?.toLowerCase().includes('anita') ||
        doc.submittedByFacultyId === 'coord-anita-verma' ||
        doc.id?.startsWith('doc-')
      );
      return isMyProgram && isMyUpload;
    }

    // 3. School Coordinator role
    if (role === 'school') {
      return !schoolId || doc.schoolId === schoolId || doc.schoolId === 'sch-tech';
    }

    // 4. University Coordinator role
    if (role === 'university') {
      return true;
    }

    return false;
  });

  const isDocSubmitted = (doc: NaacEvidenceDocument) =>
    Boolean(
      doc && (
        doc.status === 'submitted_to_program' ||
        doc.status === 'submitted_to_school' ||
        doc.status === 'approved_by_school' ||
        doc.status === 'submitted_to_university' ||
        doc.status === 'university_verified'
      )
    );

  const unsubmittedDocs = myDocuments.filter((d) => !isDocSubmitted(d));

  // Selection state for submitting documents to coordinator (default unchecked)
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // True if ALL unsubmitted documents across all criteria are currently selected
  const isAllSelected =
    unsubmittedDocs.length > 0 &&
    unsubmittedDocs.every((d) => selectedDocIds.includes(d.id));

  // Toggle selection of all unsubmitted documents
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(unsubmittedDocs.map((d) => d.id));
    }
  };

  const handleToggleSelectDoc = (docId: string) => {
    const doc = myDocuments.find((d) => d.id === docId);
    if (doc && isDocSubmitted(doc)) return;

    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // Toggle selection for all unsubmitted documents within a specific criterion group
  const handleToggleSelectCriterion = (docsInCrit: NaacEvidenceDocument[]) => {
    const unsubmittedInCrit = docsInCrit.filter((d) => !isDocSubmitted(d));
    if (unsubmittedInCrit.length === 0) return;
    const allCritSelected = unsubmittedInCrit.every((d) => selectedDocIds.includes(d.id));
    if (allCritSelected) {
      const critIds = new Set(unsubmittedInCrit.map((d) => d.id));
      setSelectedDocIds((prev) => prev.filter((id) => !critIds.has(id)));
    } else {
      const newIds = unsubmittedInCrit.map((d) => d.id);
      setSelectedDocIds((prev) => Array.from(new Set([...prev, ...newIds])));
    }
  };

  // Sync documents from storage
  const refreshDocuments = () => {
    setDocuments(getStoredNaacDocuments());
  };

  // Destination Target State (Criterion, Key Indicator, Metric) — Defaults to Criterion 1 for manual
  const [selectedCriterionCode, setSelectedCriterionCode] = useState<string>('Criterion 1');
  const [selectedKeyIndicatorCode, setSelectedKeyIndicatorCode] = useState<string>('1.1');
  const [selectedMetricCode, setSelectedMetricCode] = useState<string>('1.1.1');
  const [isChangeOpen, setIsChangeOpen] = useState<boolean>(false);
  const [isAiBoxOpen, setIsAiBoxOpen] = useState<boolean>(false);

  // AI Filing Mode State (Default ON for 'Let AI do the filing')
  const [useAi, setUseAi] = useState<boolean>(true);
  const [autoCompleteFiling, setAutoCompleteFiling] = useState<boolean>(false);
  const [autoFiledNotice, setAutoFiledNotice] = useState<{
    count: number;
    criteriaSummary: string;
    docIds: string[];
    firstCritCode?: string;
    firstMetricCode?: string;
  } | null>(null);
  const [isDirectoryViewOpen, setIsDirectoryViewOpen] = useState<boolean>(initialDirectoryOpen);
  useEffect(() => {
    setIsDirectoryViewOpen(initialDirectoryOpen);
  }, [initialDirectoryOpen]);
  const [editingDocModal, setEditingDocModal] = useState<{
    docId: string;
    fileName: string;
    fileSize?: string;
    fileUrl?: string;
    crit: string;
    ki: string;
    metric: string;
    aiReason?: string;
    docNature?: 'supporting_doc' | 'ground_proof';
    extractedText?: string;
    auditChecks?: {
      signature?: boolean;
      stamp?: boolean;
      date?: boolean;
      time?: boolean;
      letterhead?: boolean;
      cycleYear?: boolean;
      geotag?: boolean;
      notes?: string;
    };
  } | null>(null);
  const [openAiReasonDocId, setOpenAiReasonDocId] = useState<string | null>(null);
  const [isDrawerAiReasonOpen, setIsDrawerAiReasonOpen] = useState(false);
  const [expandedDirectoryCrits, setExpandedDirectoryCrits] = useState<Record<string, boolean>>({
    'Criterion 1': true,
  });
  const [expandedDirectoryMetrics, setExpandedDirectoryMetrics] = useState<Record<string, boolean>>({
    '1.1': true,
  });
  const [selectedDirectoryDocIds, setSelectedDirectoryDocIds] = useState<string[]>([]);
  const [compilePdfModal, setCompilePdfModal] = useState<{
    crit: string;
    ki: string;
    metric: string;
    fileName: string;
    sourceDocs: NaacEvidenceDocument[];
  } | null>(null);
  const [openCompiledFilesDocId, setOpenCompiledFilesDocId] = useState<string | null>(null);
  const [isManageCyclesModalOpen, setIsManageCyclesModalOpen] = useState<boolean>(false);
  const [draftCycles, setDraftCycles] = useState<NaacSsrCycle[]>([]);
  const [editingCycleRowId, setEditingCycleRowId] = useState<string | null>(null);
  const ACADEMIC_YEAR_OPTIONS = Array.from({ length: 26 }, (_, i) => {
    const startYear = 2010 + i;
    const endShort = String((startYear + 1) % 100).padStart(2, '0');
    return `${startYear}-${endShort}`;
  });
  const getFiveYearEndAcademicYear = (fromYr: string): string => {
    const startYear = parseInt(fromYr.split('-')[0], 10);
    if (isNaN(startYear)) return fromYr;
    const targetStart = startYear + 4;
    const targetEndShort = String((targetStart + 1) % 100).padStart(2, '0');
    return `${targetStart}-${targetEndShort}`;
  };
  const [newCycleDraft, setNewCycleDraft] = useState<{
    cycleNumber: string;
    yearFrom: string;
    yearTo: string;
    status: 'Active' | 'Submitted' | 'Completed';
  }>({
    cycleNumber: '',
    yearFrom: '',
    yearTo: '',
    status: 'Active',
  });

  const openManageCyclesModal = () => {
    setDraftCycles(cycles.map((c) => ({ ...c })));
    setEditingCycleRowId(null);
    setNewCycleDraft({
      cycleNumber: `NAAC Cycle ${cycles.length + 1}`,
      yearFrom: '2026-27',
      yearTo: '2030-31',
      status: 'Active',
    });
    setIsManageCyclesModalOpen(true);
  };
  const [openaiKey, setOpenaiKey] = useState<string>(() => localStorage.getItem('openai_api_key') || (import.meta.env?.VITE_OPENAI_API_KEY as string) || '');
  const [showOpenaiKey, setShowOpenaiKey] = useState<boolean>(false);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Canonical helpers to prevent string mismatch across OpenAI, rules, and UI selects
  const toCanonicalCrit = (val: string) => {
    const m = val?.match(/Criterion\s*(\d)/i) || val?.match(/(\d)/);
    return m ? `Criterion ${m[1]}` : 'Criterion 1';
  };
  const toCanonicalKi = (val: string) => {
    const m = val?.match(/(\d+\.\d+)/);
    return m ? m[1] : '1.1';
  };
  const toCanonicalMetric = (val: string) => {
    const m = val?.match(/(\d+\.\d+\.\d+)/);
    return m ? m[1] : '1.1.1';
  };

  // Robust clean Criterion number and codes
  const cleanCritCode = toCanonicalCrit(selectedCriterionCode);
  const cleanKiCode = toCanonicalKi(selectedKeyIndicatorCode);
  const cleanMetricCode = toCanonicalMetric(selectedMetricCode);

  const currentCriterion = NAAC_CRITERIA_SUMMARY.find(
    (c) => c.code.toLowerCase() === cleanCritCode.toLowerCase()
  ) || NAAC_CRITERIA_SUMMARY[0];

  const availableKeyIndicators = KEY_INDICATORS.filter(
    (ki) => ki.criterionCode.toLowerCase() === cleanCritCode.toLowerCase()
  );
  const currentKeyIndicator = KEY_INDICATORS.find(
    (ki) => ki.code === cleanKiCode
  ) || availableKeyIndicators[0];

  const availableMetrics = NAAC_METRICS_LIST.filter(
    (m) => m.criterionCode.toLowerCase() === cleanCritCode.toLowerCase()
  );
  const currentMetric = NAAC_METRICS_LIST.find((m) => m.code === cleanMetricCode) || availableMetrics[0];

  // Live sync active ingested document (or all batch documents in Manual Mode) when user modifies destination selectors
  const syncActiveDocDestination = (crit: string, metric: string, title?: string) => {
    if (!activeDocId) return;
    const critObj = NAAC_CRITERIA_SUMMARY.find((c) => c.code.toLowerCase() === crit.toLowerCase());
    const metricObj = NAAC_METRICS_LIST.find((m) => m.code === metric);
    const parts = metric.split('.');
    const kiCode = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : '1.1';

    if (!useAi) {
      // In Manual Mode, apply the shared Criterion/KI/Metric to all files that haven't been manually overridden
      if (uploadedFilesBatch.length > 0) {
        uploadedFilesBatch.forEach((item) => {
          if (item.isManualEdit) return; // Preserve explicit user override for this document!
          addOrUpdateNaacDocument({
            id: item.docId,
            criterionCode: crit,
            criterionId: critObj?.id || 'crit-1',
            metricCode: metric,
            metricName: metricObj?.name || `${metric} Evidence Proof`,
            metricType: metricObj?.metricType || 'QnM',
          });
        });
        setUploadedFilesBatch((prev) =>
          prev.map((item) =>
            item.isManualEdit
              ? item
              : { ...item, crit, keyIndicator: kiCode, metric }
          )
        );
      }
      if (activeDocId) {
        addOrUpdateNaacDocument({
          id: activeDocId,
          ...(title ? { title } : {}),
          criterionCode: crit,
          criterionId: critObj?.id || 'crit-1',
          metricCode: metric,
          metricName: metricObj?.name || `${metric} Evidence Proof`,
          metricType: metricObj?.metricType || 'QnM',
        });
      }
    } else {
      addOrUpdateNaacDocument({
        id: activeDocId,
        ...(title ? { title } : {}),
        criterionCode: crit,
        criterionId: critObj?.id || 'crit-1',
        metricCode: metric,
        metricName: metricObj?.name || `${metric} Evidence Proof`,
        metricType: metricObj?.metricType || 'QnM',
      });
      setUploadedFilesBatch((prev) =>
        prev.map((item) =>
          item.docId === activeDocId
            ? { ...item, crit, keyIndicator: kiCode, metric }
            : item
        )
      );
    }
    refreshDocuments();
  };

  // When criterion changes, auto-select corresponding Key Indicator and Metric
  const handleCriterionChange = (critCode: string) => {
    const canonical = toCanonicalCrit(critCode);
    setSelectedCriterionCode(canonical);
    const kis = KEY_INDICATORS.filter(
      (ki) => ki.criterionCode.toLowerCase() === canonical.toLowerCase()
    );
    const newKiCode = kis[0]?.code || '1.1';
    setSelectedKeyIndicatorCode(newKiCode);

    const metricsForCrit = NAAC_METRICS_LIST.filter(
      (m) => m.criterionCode.toLowerCase() === canonical.toLowerCase()
    );
    const matchingMetric = metricsForCrit.find(m => m.code.startsWith(newKiCode)) || metricsForCrit[0];
    const newMetricCode = matchingMetric ? matchingMetric.code : '1.1.1';
    if (matchingMetric) {
      setSelectedMetricCode(newMetricCode);
    }
    syncActiveDocDestination(canonical, newMetricCode);
  };

  // When key indicator changes, auto-select first matching metric
  const handleKeyIndicatorChange = (kiCode: string) => {
    const canonical = toCanonicalKi(kiCode);
    setSelectedKeyIndicatorCode(canonical);
    const matchingMetrics = availableMetrics.filter(m => m.code.startsWith(canonical));
    if (matchingMetrics.length > 0) {
      setSelectedMetricCode(matchingMetrics[0].code);
      syncActiveDocDestination(cleanCritCode, matchingMetrics[0].code);
    }
  };

  // When metric changes, auto-sync parent key indicator
  const handleMetricChange = (metricCode: string) => {
    const canonical = toCanonicalMetric(metricCode);
    setSelectedMetricCode(canonical);
    const parts = canonical.split('.');
    if (parts.length >= 2) {
      const parentKi = `${parts[0]}.${parts[1]}`;
      setSelectedKeyIndicatorCode(parentKi);
    }
    syncActiveDocDestination(cleanCritCode, canonical);
  };

  // Per-file destination handlers when multiple files are uploaded
  const updateBatchItemDestination = (docId: string, crit: string, ki: string, metric: string) => {
    const critObj = NAAC_CRITERIA_SUMMARY.find((c) => c.code.toLowerCase() === crit.toLowerCase());
    const metricObj = NAAC_METRICS_LIST.find((m) => m.code === metric);
    addOrUpdateNaacDocument({
      id: docId,
      criterionCode: crit,
      criterionId: critObj?.id || 'crit-1',
      metricCode: metric,
      metricName: metricObj?.name || `${metric} Evidence Proof`,
      metricType: metricObj?.metricType || 'QnM',
    });
    setUploadedFilesBatch((prev) =>
      prev.map((item) =>
        item.docId === docId
          ? { ...item, crit, keyIndicator: ki, metric, isManualEdit: true }
          : item
      )
    );
    if (docId === activeDocId && useAi) {
      setSelectedCriterionCode(crit);
      setSelectedKeyIndicatorCode(ki);
      setSelectedMetricCode(metric);
    }
    refreshDocuments();
  };

  const handleBatchItemCriterionChange = (docId: string, critCode: string) => {
    const canonical = toCanonicalCrit(critCode);
    const kis = KEY_INDICATORS.filter((ki) => ki.criterionCode.toLowerCase() === canonical.toLowerCase());
    const newKiCode = kis[0]?.code || '1.1';
    const metricsForCrit = NAAC_METRICS_LIST.filter((m) => m.criterionCode.toLowerCase() === canonical.toLowerCase());
    const matchingMetric = metricsForCrit.find((m) => m.code.startsWith(newKiCode)) || metricsForCrit[0];
    const newMetricCode = matchingMetric ? matchingMetric.code : '1.1.1';
    updateBatchItemDestination(docId, canonical, newKiCode, newMetricCode);
  };

  const handleBatchItemKiChange = (docId: string, currentCrit: string, kiCode: string) => {
    const canonical = toCanonicalKi(kiCode);
    const metricsForCrit = NAAC_METRICS_LIST.filter((m) => m.criterionCode.toLowerCase() === currentCrit.toLowerCase());
    const matchingMetrics = metricsForCrit.filter((m) => m.code.startsWith(canonical));
    const newMetricCode = matchingMetrics[0]?.code || metricsForCrit[0]?.code || '1.1.1';
    updateBatchItemDestination(docId, currentCrit, canonical, newMetricCode);
  };

  const handleBatchItemMetricChange = (docId: string, currentCrit: string, metricCode: string) => {
    const canonical = toCanonicalMetric(metricCode);
    const parts = canonical.split('.');
    const parentKi = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : '1.1';
    updateBatchItemDestination(docId, currentCrit, parentKi, canonical);
  };

  const handleBatchItemToggleManual = (docId: string) => {
    setUploadedFilesBatch((prev) =>
      prev.map((item) =>
        item.docId === docId ? { ...item, isManualEdit: !item.isManualEdit } : item
      )
    );
  };

  // Smart AI Metric Suggestion based on file name & extracted document content
  const getAiSuggestion = (filename: string, docText?: string): { crit: string; keyIndicator: string; metric: string; reason: string; source: 'rule-engine' } => {
    const isLorem = docText ? /lorem\s+ipsum/i.test(docText) : false;
    if (isLorem) {
      return { 
        crit: 'Criterion 6', 
        keyIndicator: '6.5', 
        metric: '6.5.1', 
        reason: 'The document contains placeholder text (Lorem Ipsum) with no valid institutional or academic NAAC evidence. Please verify before filing.',
        source: 'rule-engine' 
      };
    }

    // 0. Direct NAAC Metric Code detection in filename or text header (e.g. "5.3.3.1 Report.pdf", "3.4.1", "1.1.1")
    const explicitMetricMatch = filename.match(/\b([1-7])\.([1-5])(?:\.([1-5]))?\b/) || 
      (docText ? docText.slice(0, 500).match(/\b([1-7])\.([1-5])\.([1-5])\b/) : null);

    if (explicitMetricMatch) {
      const cNum = explicitMetricMatch[1];
      const kiNum = `${cNum}.${explicitMetricMatch[2]}`;
      const mNum = explicitMetricMatch[3] ? `${kiNum}.${explicitMetricMatch[3]}` : `${kiNum}.1`;
      
      const foundMetric = NAAC_METRICS_LIST.find((m) => m.code === mNum) || 
        NAAC_METRICS_LIST.find((m) => m.code.startsWith(kiNum)) ||
        NAAC_METRICS_LIST.find((m) => m.code.startsWith(cNum));

      if (foundMetric) {
        return {
          crit: foundMetric.criterionCode,
          keyIndicator: foundMetric.code.split('.').slice(0, 2).join('.'),
          metric: foundMetric.code,
          reason: `Document is designated for Metric ${foundMetric.code} (${foundMetric.name}). Mapped to ${foundMetric.criterionCode} under Key Indicator ${foundMetric.code.split('.').slice(0, 2).join('.')}.`,
          source: 'rule-engine',
        };
      }
    }

    const lower = (filename + (docText ? ' ' + docText.slice(0, 1000) : '')).toLowerCase();
    if (lower.includes('sports') || lower.includes('cultural') || lower.includes('singing') || lower.includes('tournament') || lower.includes('championship') || lower.includes('athletics')) {
      return { 
        crit: 'Criterion 5', 
        keyIndicator: '5.3', 
        metric: '5.3.3', 
        reason: 'Detected sports competitions, cultural events, or student festivals. Mapped to Criterion 5 (Student Support & Progression) under KI 5.3 (Metric 5.3.3).',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('syllabus') || lower.includes('curriculum') || lower.includes('lesson') || lower.includes('timetable')) {
      return { 
        crit: 'Criterion 1', 
        keyIndicator: '1.1', 
        metric: '1.1.1', 
        reason: 'Detected curriculum design & syllabus planning terminology. Mapped to Criterion 1 (Curricular Aspects) under KI 1.1 Curricular Planning and Delivery.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('elective') || lower.includes('cbcs')) {
      return { 
        crit: 'Criterion 1', 
        keyIndicator: '1.2', 
        metric: '1.2.1', 
        reason: 'Detected elective course / CBCS academic flexibility terms. Mapped to Criterion 1 under KI 1.2 Academic Flexibility.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('enrichment') || lower.includes('value added')) {
      return { 
        crit: 'Criterion 1', 
        keyIndicator: '1.3', 
        metric: '1.3.1', 
        reason: 'Detected value-added and curriculum enrichment course content. Mapped to Criterion 1 under KI 1.3 Curriculum Enrichment.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('feedback') || lower.includes('atr') || lower.includes('stakeholder')) {
      return { 
        crit: 'Criterion 1', 
        keyIndicator: '1.4', 
        metric: '1.4.1', 
        reason: 'Detected stakeholder feedback and Action Taken Report (ATR) documentation. Mapped to Criterion 1 under KI 1.4 Feedback System.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('enroll') || lower.includes('admission') || lower.includes('student') || lower.includes('intake')) {
      return { 
        crit: 'Criterion 2', 
        keyIndicator: '2.1', 
        metric: '2.1.1', 
        reason: 'Detected student admissions, sanctioned intake, and enrolment records. Mapped to Criterion 2 (Teaching-Learning & Evaluation) under KI 2.1 Student Enrolment.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('experiential') || lower.includes('visit') || lower.includes('project') || lower.includes('lab manual')) {
      return { 
        crit: 'Criterion 2', 
        keyIndicator: '2.3', 
        metric: '2.3.1', 
        reason: 'Detected student-centric experiential learning, industrial visits, or laboratory projects. Mapped to Criterion 2 under KI 2.3 Teaching-Learning Process.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('phd') || lower.includes('faculty') || lower.includes('teacher') || lower.includes('credentials')) {
      return { 
        crit: 'Criterion 2', 
        keyIndicator: '2.4', 
        metric: '2.4.1', 
        reason: 'Detected faculty credentials, Ph.D. degrees, and full-time teacher qualifications. Mapped to Criterion 2 under KI 2.4 Teacher Profile and Quality.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('outcome') || lower.includes('po') || lower.includes('co') || lower.includes('attainment')) {
      return { 
        crit: 'Criterion 2', 
        keyIndicator: '2.6', 
        metric: '2.6.1', 
        reason: 'Detected Program Outcomes (POs) and Course Outcomes (COs) attainment mapping. Mapped to Criterion 2 under KI 2.6 Student Performance & Learning Outcomes.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('grant') || lower.includes('research') || lower.includes('fund') || lower.includes('seed')) {
      return { 
        crit: 'Criterion 3', 
        keyIndicator: '3.1', 
        metric: '3.1.1', 
        reason: 'Detected research grant sanctions, funding allocations, or seed money awards. Mapped to Criterion 3 (Research, Innovations & Extension) under KI 3.1 Resource Mobilization.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('incubat') || lower.includes('innovat') || lower.includes('startup') || lower.includes('hackathon')) {
      return { 
        crit: 'Criterion 3', 
        keyIndicator: '3.2', 
        metric: '3.2.1', 
        reason: 'Detected innovation ecosystem, startup incubation center, or hackathon proofs. Mapped to Criterion 3 under KI 3.2 Innovation Ecosystem.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('extension') || lower.includes('outreach') || lower.includes('nss') || lower.includes('ncc') || lower.includes('community') || lower.includes('blood') || lower.includes('donation') || lower.includes('camp') || lower.includes('red cross') || lower.includes('swachh') || lower.includes('village') || lower.includes('health') || lower.includes('clinic')) {
      return { 
        crit: 'Criterion 3', 
        keyIndicator: '3.4', 
        metric: '3.4.1', 
        reason: 'Detected Blood Donation Camp, NSS/NCC, or community outreach extension activity. Mapped to Criterion 3 (Research, Innovations & Extension) under KI 3.4 Extension Activities (Metric 3.4.1).',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('mou') || lower.includes('collaborat') || lower.includes('industry') || lower.includes('linkage')) {
      return { 
        crit: 'Criterion 3', 
        keyIndicator: '3.5', 
        metric: '3.5.1', 
        reason: 'Detected formal MoUs, corporate collaborations, and industry linkages. Mapped to Criterion 3 under KI 3.5 Collaboration & Linkages.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('lab') || lower.includes('ict') || lower.includes('facility') || lower.includes('classroom') || lower.includes('infrastructure')) {
      return { 
        crit: 'Criterion 4', 
        keyIndicator: '4.1', 
        metric: '4.1.1', 
        reason: 'Detected ICT-enabled classrooms, laboratory facilities, and physical infrastructure records. Mapped to Criterion 4 (Infrastructure) under KI 4.1 Physical Facilities.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('library') || lower.includes('book') || lower.includes('journal') || lower.includes('ieee') || lower.includes('springer')) {
      return { 
        crit: 'Criterion 4', 
        keyIndicator: '4.2', 
        metric: '4.2.1', 
        reason: 'Detected library automated resources, e-journal subscriptions, and books catalog. Mapped to Criterion 4 under KI 4.2 Library as a Learning Resource.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('scholarship') || lower.includes('freeship') || lower.includes('support')) {
      return { 
        crit: 'Criterion 5', 
        keyIndicator: '5.1', 
        metric: '5.1.1', 
        reason: 'Detected government scholarships, institutional freeships, and student financial aid. Mapped to Criterion 5 (Student Support & Progression) under KI 5.1 Student Support.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('sport') || lower.includes('cultural') || lower.includes('award') || lower.includes('event')) {
      return { 
        crit: 'Criterion 5', 
        keyIndicator: '5.3', 
        metric: '5.3.1', 
        reason: 'Detected sports medals, cultural festival participation, and competitive student awards. Mapped to Criterion 5 under KI 5.3 Student Participation.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('iqac') || lower.includes('formation') || lower.includes('audit') || lower.includes('quality') || lower.includes('minutes')) {
      return { 
        crit: 'Criterion 6', 
        keyIndicator: '6.5', 
        metric: '6.5.1', 
        reason: 'Detected IQAC quality reviews, academic audit reports, or IQAC meeting minutes. Mapped to Criterion 6 (Governance) under KI 6.5 Internal Quality Assurance System.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('gender') || lower.includes('equity') || lower.includes('safety') || lower.includes('icc')) {
      return { 
        crit: 'Criterion 7', 
        keyIndicator: '7.1', 
        metric: '7.1.1', 
        reason: 'Detected gender equity promotion, campus safety initiatives, or ICC records. Mapped to Criterion 7 (Institutional Values) under KI 7.1 Institutional Values.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('green') || lower.includes('best practice') || lower.includes('sustainability') || lower.includes('case study')) {
      return { 
        crit: 'Criterion 7', 
        keyIndicator: '7.2', 
        metric: '7.2.1', 
        reason: 'Detected green campus initiatives, environment audits, or institutional best practice case studies. Mapped to Criterion 7 under KI 7.2 Best Practices.',
        source: 'rule-engine' 
      };
    }
    return { 
      crit: 'Criterion 6', 
      keyIndicator: '6.5', 
      metric: '6.5.1', 
      reason: 'General academic/administrative evidence. Mapped to Criterion 6 (Governance & Quality Assurance) for institutional audit review.',
      source: 'rule-engine' 
    };
  };

  // NAAC Framework: Document Nature Distinction (Supporting Doc vs Ground Proof)
  const detectDocNature = (filename: string): 'supporting_doc' | 'ground_proof' => {
    const lower = filename.toLowerCase();
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filename);
    if (
      isImage ||
      lower.includes('photo') ||
      lower.includes('pic') ||
      lower.includes('snap') ||
      lower.includes('attendance') ||
      lower.includes('sheet') ||
      lower.includes('certificate') ||
      lower.includes('receipt') ||
      lower.includes('bill') ||
      lower.includes('voucher')
    ) {
      return 'ground_proof';
    }
    return 'supporting_doc';
  };

  // Extract actual document text and embedded images from uploaded files (docx, doc, xlsx, xls, csv, pdf, txt, jpg/png) for genuine RAG analysis
  const extractDocumentContent = async (
    file: File
  ): Promise<{ text: string; embeddedImage?: string; hasEmbeddedImages: boolean }> => {
    const name = file.name.toLowerCase();

    // 1. Plain text / CSV / structured text
    if (
      name.endsWith('.txt') ||
      name.endsWith('.csv') ||
      name.endsWith('.md') ||
      name.endsWith('.json') ||
      name.endsWith('.html') ||
      name.endsWith('.xml') ||
      name.endsWith('.rtf')
    ) {
      try {
        const text = await file.text();
        return { text: text.slice(0, 8000), hasEmbeddedImages: false };
      } catch {
        return { text: '', hasEmbeddedImages: false };
      }
    }

    // 2. Modern Office OpenXML ZIP archives (.docx Word, .xlsx Excel)
    if (name.endsWith('.docx') || name.endsWith('.xlsx')) {
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const view = new DataView(buffer);
        let offset = 0;
        let extractedText = '';
        let firstImage: string | undefined;
        let hasImages = false;

        while (offset < bytes.length - 30) {
          if (view.getUint32(offset, true) === 0x04034b50) {
            const compMethod = view.getUint16(offset + 8, true);
            const compSize = view.getUint32(offset + 18, true);
            const nameLen = view.getUint16(offset + 26, true);
            const extraLen = view.getUint16(offset + 28, true);
            const nameBytes = bytes.subarray(offset + 30, offset + 30 + nameLen);
            const entryName = new TextDecoder().decode(nameBytes);
            const dataStart = offset + 30 + nameLen + extraLen;

            // Word document text
            if (entryName === 'word/document.xml') {
              const compData = bytes.subarray(dataStart, dataStart + compSize);
              let xml = '';
              if (compMethod === 8 && typeof DecompressionStream !== 'undefined') {
                try {
                  const resp = new Response(new Blob([compData]).stream().pipeThrough(new DecompressionStream('deflate-raw')));
                  const decompressed = await resp.arrayBuffer();
                  xml = new TextDecoder().decode(decompressed);
                } catch {
                  xml = new TextDecoder().decode(compData);
                }
              } else {
                xml = new TextDecoder().decode(compData);
              }
              if (xml.includes('<w:drawing') || xml.includes('<w:pict') || xml.includes('<a:blip')) {
                hasImages = true;
              }
              extractedText += ' ' + xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            } 
            // Excel shared strings (all text cells in workbook)
            else if (entryName === 'xl/sharedStrings.xml') {
              const compData = bytes.subarray(dataStart, dataStart + compSize);
              let xml = '';
              if (compMethod === 8 && typeof DecompressionStream !== 'undefined') {
                try {
                  const resp = new Response(new Blob([compData]).stream().pipeThrough(new DecompressionStream('deflate-raw')));
                  const decompressed = await resp.arrayBuffer();
                  xml = new TextDecoder().decode(decompressed);
                } catch {
                  xml = new TextDecoder().decode(compData);
                }
              } else {
                xml = new TextDecoder().decode(compData);
              }
              extractedText += ' ' + xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            }
            // Excel first worksheet values
            else if (entryName === 'xl/worksheets/sheet1.xml' && extractedText.length < 3000) {
              const compData = bytes.subarray(dataStart, dataStart + compSize);
              let xml = '';
              if (compMethod === 8 && typeof DecompressionStream !== 'undefined') {
                try {
                  const resp = new Response(new Blob([compData]).stream().pipeThrough(new DecompressionStream('deflate-raw')));
                  const decompressed = await resp.arrayBuffer();
                  xml = new TextDecoder().decode(decompressed);
                } catch {
                  xml = new TextDecoder().decode(compData);
                }
              } else {
                xml = new TextDecoder().decode(compData);
              }
              extractedText += ' ' + xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            }
            // Embedded media images (signatures, stamps, logos, photos)
            else if ((entryName.startsWith('word/media/') || entryName.startsWith('xl/media/') || entryName.includes('/media/')) && !firstImage) {
              hasImages = true;
              try {
                const compData = bytes.subarray(dataStart, dataStart + compSize);
                let imgBuffer: ArrayBuffer;
                if (compMethod === 8 && typeof DecompressionStream !== 'undefined') {
                  const resp = new Response(new Blob([compData]).stream().pipeThrough(new DecompressionStream('deflate-raw')));
                  imgBuffer = await resp.arrayBuffer();
                } else {
                  imgBuffer = compData.buffer.slice(compData.byteOffset, compData.byteOffset + compData.byteLength);
                }
                const mime = entryName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
                const uint8 = new Uint8Array(imgBuffer);
                let binary = '';
                const chunk = 8192;
                for (let i = 0; i < uint8.length; i += chunk) {
                  binary += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + chunk)));
                }
                firstImage = `data:${mime};base64,${btoa(binary)}`;
              } catch (e) {
                console.warn('Could not extract media image:', e);
              }
            }
            offset = dataStart + Math.max(1, compSize);
          } else {
            offset++;
          }
        }
        return { text: extractedText.trim().slice(0, 8000), embeddedImage: firstImage, hasEmbeddedImages: hasImages };
      } catch (err) {
        console.warn('Office OpenXML extraction error:', err);
      }
    }

    // 3. Legacy binary Word/Excel files (.doc, .xls)
    if (name.endsWith('.doc') || name.endsWith('.xls')) {
      try {
        const buffer = await file.arrayBuffer();
        const raw = new TextDecoder('latin1').decode(new Uint8Array(buffer));
        const words = raw.match(/[a-zA-Z0-9_\-\s]{4,80}/g) || [];
        const filtered = words.filter(w => !/[\x00-\x1F\x7F-\x9F]/.test(w) && w.trim().length > 3);
        if (filtered.length > 5) {
          return { text: filtered.slice(0, 200).join(' ').replace(/\s+/g, ' ').trim().slice(0, 8000), hasEmbeddedImages: false };
        }
      } catch (err) {
        console.warn('Legacy doc/xls extraction error:', err);
      }
    }

    // 4. PDF Files (Extract text from uncompressed & FlateDecode compressed streams + embedded JPEG scans)
    if (name.endsWith('.pdf')) {
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const raw = new TextDecoder('latin1').decode(bytes);
        const matches: string[] = [];

        // Helper to extract Tj and TJ text tokens from a decoded string
        const extractTokens = (str: string) => {
          const tjRegex = /\(([^)]{1,})\)\s*Tj/g;
          let m: RegExpExecArray | null;
          while ((m = tjRegex.exec(str)) !== null && matches.length < 800) {
            matches.push(m[1]);
          }
          const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
          while ((m = tjArrayRegex.exec(str)) !== null && matches.length < 800) {
            const innerTokens = m[1].match(/\(([^)]+)\)/g) || [];
            innerTokens.forEach(t => matches.push(t.replace(/[()]/g, '')));
          }
        };

        // First attempt: uncompressed tokens
        extractTokens(raw);

        // Second attempt: decompress FlateDecode content streams (filtering out image XObjects for speed and accuracy)
        if (matches.length < 50 && raw.includes('FlateDecode') && typeof DecompressionStream !== 'undefined') {
          let searchIdx = 0;
          while (searchIdx < raw.length && matches.length < 1500) {
            const streamStart = raw.indexOf('stream', searchIdx);
            if (streamStart === -1) break;
            let contentStart = streamStart + 6;
            if (raw.charCodeAt(contentStart) === 13) contentStart++;
            if (raw.charCodeAt(contentStart) === 10) contentStart++;
            const endStream = raw.indexOf('endstream', contentStart);
            if (endStream === -1) break;

            const header = raw.slice(Math.max(0, streamStart - 200), streamStart);
            // Only decompress text streams; skip image XObjects to prevent stream contention
            if (header.includes('FlateDecode') && !header.includes('/Subtype/Image') && !header.includes('/Subtype /Image') && !header.includes('/DCTDecode')) {
              const compBytes = bytes.subarray(contentStart, endStream);
              if (compBytes.length > 4) {
                try {
                  const resp = new Response(new Blob([compBytes]).stream().pipeThrough(new DecompressionStream('deflate')));
                  const decompBuffer = await resp.arrayBuffer();
                  const decompText = new TextDecoder('latin1').decode(decompBuffer);
                  extractTokens(decompText);
                } catch {
                  try {
                    const resp = new Response(new Blob([compBytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')));
                    const decompBuffer = await resp.arrayBuffer();
                    const decompText = new TextDecoder('latin1').decode(decompBuffer);
                    extractTokens(decompText);
                  } catch {}
                }
              }
            }
            searchIdx = endStream + 9;
          }
        }

        // Inspect if PDF contains embedded JPEG images (e.g. scanned page or signature)
        let firstPdfImage: string | undefined;
        let hasPdfImages = raw.includes('/Subtype/Image') || raw.includes('/Subtype /Image') || raw.includes('/DCTDecode');

        // Locate JPEG byte sequence (0xFF, 0xD8, 0xFF) inside PDF binary
        let jpegStart = -1;
        for (let i = 0; i < bytes.length - 3; i++) {
          if (bytes[i] === 0xFF && bytes[i + 1] === 0xD8 && bytes[i + 2] === 0xFF) {
            jpegStart = i;
            break;
          }
        }
        if (jpegStart !== -1) {
          let jpegEnd = -1;
          for (let i = jpegStart + 3; i < bytes.length - 1; i++) {
            if (bytes[i] === 0xFF && bytes[i + 1] === 0xD9) {
              jpegEnd = i + 2;
              break;
            }
          }
          if (jpegEnd > jpegStart && (jpegEnd - jpegStart) < 2000000) {
            hasPdfImages = true;
            const imgBytes = bytes.subarray(jpegStart, jpegEnd);
            let binary = '';
            const chunk = 8192;
            for (let i = 0; i < imgBytes.length; i += chunk) {
              binary += String.fromCharCode.apply(null, Array.from(imgBytes.subarray(i, i + chunk)));
            }
            firstPdfImage = `data:image/jpeg;base64,${btoa(binary)}`;
          }
        }

        const pdfText = matches.join(' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
        globalExtractedTextCache.set(file.name, pdfText);
        globalExtractedTextCache.set(file.name.toLowerCase(), pdfText);
        if (firstPdfImage) {
          globalEmbeddedImageCache.set(file.name, firstPdfImage);
          globalEmbeddedImageCache.set(file.name.toLowerCase(), firstPdfImage);
        }
        return { text: pdfText, embeddedImage: firstPdfImage, hasEmbeddedImages: hasPdfImages };
      } catch (err) {
        console.warn('PDF text extraction error:', err);
      }
    }

    // 5. Direct Images (jpg, jpeg, png, webp, gif)
    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(name)) {
      return { text: '', hasEmbeddedImages: true };
    }

    return { text: '', hasEmbeddedImages: false };
  };

  const extractDocumentText = async (file: File): Promise<string> => {
    const content = await extractDocumentContent(file);
    return content.text;
  };

  // NAAC Framework: Evaluates Compliance Checks (Signature, Stamp, Date, Time, Letterhead)
  const evaluateDocAudit = (
    filename: string,
    nature: 'supporting_doc' | 'ground_proof',
    customChecks?: {
      signature?: boolean;
      stamp?: boolean;
      date?: boolean;
      time?: boolean;
      letterhead?: boolean;
      cycleYear?: boolean;
      geotag?: boolean;
      notes?: string;
    },
    config = auditConfig,
    docText?: string
  ) => {
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
    const lower = filename.toLowerCase();
    const effectiveText = docText || globalExtractedTextCache.get(filename) || globalExtractedTextCache.get(lower) || '';
    const hasVisualImage = Boolean((customChecks as any)?.hasEmbeddedImages) || 
      Boolean(globalEmbeddedImageCache.get(filename)) || 
      Boolean(globalEmbeddedImageCache.get(lower)) || 
      isImage ||
      nature === 'ground_proof';
    const isLorem = effectiveText ? /lorem\s+ipsum/i.test(effectiveText) : false;
    const isManual = Boolean((customChecks as any)?.isManual);

    // 1. Signature: Detect authorized institutional signatures
    const hasValidSig = effectiveText
      ? /(sign(ed|ature)?|principal|dean|hod|director|registrar|authorized|faculty|convenor|coordinator|sd\/-)\b/i.test(effectiveText) || lower.includes('sign')
      : lower.includes('signed') || lower.includes('sign') || hasVisualImage;
    const sig = isManual
      ? Boolean(customChecks?.signature)
      : (Boolean(customChecks?.signature) || hasValidSig || Boolean((customChecks as any)?.hasEmbeddedImages));

    // 2. Stamp: Official institutional stamp / rubber seal / approved by
    const hasValidStamp = effectiveText
      ? /(stamp(ed)?|seal|official\s+seal|rubber\s+stamp|approved\s+by|verified|attested|principal|director|dean|hod|convenor|coordinator|समन्वयक|संस्थान)\b/i.test(effectiveText) || lower.includes('stamp') || lower.includes('seal') || (hasVisualImage && sig)
      : lower.includes('stamp') || lower.includes('seal') || sig || hasVisualImage;
    const stamp = isManual
      ? Boolean(customChecks?.stamp)
      : (Boolean(customChecks?.stamp) || hasValidStamp);

    // 3. Date: Explicit document date (e.g. 4 June 2019, 19.06.2021) or academic cycle years (2020-21, 2014-15)
    const hasValidDate = /(\b\d{1,2}\s*[-/.]\s*([01]?\d|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*[-/.]\s*(20\d{2}|\d{2})\b)|\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}\b|\b20\d{2}\s*[-–]\s*\d{2,4}\b|\b20(1[4-9]|2[0-9])\b|(date|dated)\s*[:.-]?\s*\d/i.test(effectiveText || '') ||
      /\b20(1[4-9]|2[0-9])\b/.test(lower) || lower.includes('date');
    const date = isManual
      ? Boolean(customChecks?.date)
      : (Boolean(customChecks?.date) || Boolean(customChecks?.cycleYear) || hasValidDate);

    // 4. Time / Timestamp: Authentic digital timestamp, camera/photo timestamp watermark, meeting time, or system timestamp metadata
    const hasValidTime = effectiveText
      ? /(timestamp|time\s*stamp|photo\s*timestamp|camera\s*timestamp|geotag|\b\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?\b|\b\d{2}[/-]\d{2}[/-]\d{4}\s+\d{2}:\d{2}\b|\b\d{1,2}:\d{2}\s*(am|pm|hrs|hours)?\b)/i.test(effectiveText)
      : (lower.includes('timestamp') || lower.includes('geotag'));
    const time = isManual
      ? Boolean(customChecks?.time)
      : (Boolean(customChecks?.time) || Boolean(customChecks?.geotag) || hasValidTime);

    // 5. Letterhead: Official college / university / institutional letterhead
    const hasValidLetterhead = effectiveText
      ? /(college|university|institute|academy|faculty|department|iqac|letterhead|campus|office\s+of|central\s+institute)\b/i.test(effectiveText)
      : lower.includes('letterhead') || lower.includes('college') || lower.includes('univ') || lower.includes('institute');
    const letterhead = isManual
      ? Boolean(customChecks?.letterhead)
      : (Boolean(customChecks?.letterhead) || hasValidLetterhead);

    let activeChecks = 0;
    let passedChecks = 0;

    if (config.checkSignature) {
      activeChecks++;
      if (sig) passedChecks++;
    }
    if (config.checkStamp) {
      activeChecks++;
      if (stamp) passedChecks++;
    }
    if (config.checkDate) {
      activeChecks++;
      if (date) passedChecks++;
    }
    if (config.checkTime) {
      activeChecks++;
      if (time) passedChecks++;
    }
    if (config.checkLetterhead) {
      activeChecks++;
      if (letterhead) passedChecks++;
    }

    const total = activeChecks;
    const isReady = activeChecks > 0 && passedChecks === total;

    return {
      signature: sig,
      stamp,
      date,
      time,
      letterhead,
      cycleYear: date,
      geotag: time,
      score: passedChecks,
      totalChecks: total,
      isReady,
      notes: customChecks?.notes,
    };
  };

  const toggleItemDocNature = (docId: string) => {
    setUploadedFilesBatch((prev) =>
      prev.map((item) => {
        if (item.docId === docId) {
          const currentNature = item.docNature || detectDocNature(item.name);
          const nextNature = currentNature === 'ground_proof' ? 'supporting_doc' : 'ground_proof';
          return {
            ...item,
            docNature: nextNature,
            isManualEdit: true,
          };
        }
        return item;
      })
    );
  };

  const toggleItemAuditCheck = (
    docId: string,
    checkKey: 'signature' | 'stamp' | 'date' | 'time' | 'letterhead' | 'cycleYear' | 'geotag'
  ) => {
    setUploadedFilesBatch((prev) =>
      prev.map((item) => {
        if (item.docId === docId) {
          const nature = item.docNature || detectDocNature(item.name);
          const currentAudit = evaluateDocAudit(item.name, nature, item.auditChecks, auditConfig, item.extractedText);
          const currentVal = currentAudit[checkKey];
          const updatedChecks = {
            ...item.auditChecks,
            signature: currentAudit.signature,
            stamp: currentAudit.stamp,
            date: currentAudit.date,
            time: currentAudit.time,
            letterhead: currentAudit.letterhead,
            cycleYear: currentAudit.cycleYear,
            geotag: currentAudit.geotag,
            [checkKey]: !currentVal,
            isManual: true,
          };
          return {
            ...item,
            auditChecks: updatedChecks,
            isManualEdit: true,
          };
        }
        return item;
      })
    );
  };

  const [aiSuggestion, setAiSuggestion] = useState<{ 
    crit: string; 
    keyIndicator: string; 
    metric: string; 
    reason: string; 
    source?: 'openai' | 'rule-engine';
  } | null>(null);

  // Deep AI Classification via OpenAI with Multimodal Vision & NAAC Framework Knowledge (Supports single or batch item)
  const classifyWithOpenAi = async (
    filename: string,
    key: string,
    fileDataUrl?: string,
    targetDocId?: string,
    updateActiveUi: boolean = true,
    fileText?: string,
    extractedImage?: string
  ) => {
    try {
      setIsAiProcessing(true);
      if (updateActiveUi) {
        setAiSuggestion(null);
      }

      const isRawImage = !!(fileDataUrl && (
        fileDataUrl.startsWith('data:image/jpeg') || 
        fileDataUrl.startsWith('data:image/png') || 
        fileDataUrl.startsWith('data:image/webp') || 
        fileDataUrl.startsWith('data:image/jpg') ||
        fileDataUrl.startsWith('data:image/gif')
      ));

      // Either the uploaded file is an image, or we extracted an embedded image (signature, seal, stamp) from the document
      const imageToSend = isRawImage ? fileDataUrl : extractedImage;
      const isLorem = fileText ? /lorem\s+ipsum/i.test(fileText) : false;

      // Detect explicit metric code pattern in filename or document header (e.g. "5.3.3.1 Report.pdf", "5.3.3", "3.4.1", "1.1.1")
      const explicitMetricMatch = filename.match(/\b([1-7])\.([1-5])(?:\.([1-5]))?\b/) || 
        (fileText ? fileText.slice(0, 500).match(/\b([1-7])\.([1-5])\.([1-5])\b/) : null);

      const prompt = `You are a Senior NAAC (National Assessment and Accreditation Council) Accreditation Assessor and Quality Assurance Specialist.

TASK:
Analyze this uploaded academic evidence file and classify it into the single most appropriate NAAC AQAR Criterion, Key Indicator, and Metric.
File name: "${filename}"
${explicitMetricMatch ? `\nPRIORITY METRIC CLUE: The file name or document header contains NAAC code "${explicitMetricMatch[0]}". Match this to Criterion ${explicitMetricMatch[1]}, Key Indicator ${explicitMetricMatch[1]}.${explicitMetricMatch[2]}, and Metric ${explicitMetricMatch[1]}.${explicitMetricMatch[2]}.${explicitMetricMatch[3] || '1'}.\n` : ''}
${fileText ? `ACTUAL DOCUMENT TEXT CONTENT (Extracted via RAG):
"""
${fileText.slice(0, 3500)}
"""` : (imageToSend ? 'NOTE: An image of the evidence document or event photograph is attached. INSPECT THE VISUAL CONTENTS CAREFULLY (read all visible text, banners, certificates, posters, Red Cross / NSS / university logos, doctors/donors, and context) to identify what institutional event or record this represents.' : 'Analyze the filename, extension, and institutional context.')}${imageToSend && fileText ? '\n\nNOTE: An image or graphic element (e.g. signature, seal, stamp, or embedded photo) extracted from this document is also attached. Inspect the visual graphic carefully along with the text.' : ''}

CRITICAL RULES FOR REASONING & ACCURACY:
1. STRICT CONTENT-BASED REASONING:
   - Base your classification and reasoning on the actual document text and visual content provided above.
   - If the text is filler/placeholder dummy text (e.g. "Lorem ipsum dolor sit amet..."), or contains no verifiable college records:
     * In "reason": state clearly "The document contains placeholder text (Lorem Ipsum) with no valid institutional or academic NAAC evidence."
     * In "suggestedTitle": return null. DO NOT fabricate, hallucinate, or assign fake academic titles (e.g. "Analysis of Student Participation...", "Curricular Planning...") for placeholder or dummy documents.
   - If the document is about Sports competitions, cultural events, singing/dance/arts festivals, athletic meets, or reports of sports/cultural activities, classify under Criterion 5 › KI 5.3 › Metric 5.3.3!
2. AUDIT COMPLIANCE CHECKS:
   - "signatureDetected": true IF an actual handwritten signature, digital signature graphic, or designated signatory line (Principal, HoD, Registrar, Dean, Coordinator, Convener) is present in the document text or attached visual graphic. (Note: If an attached image contains a handwritten or digital signature, mark "signatureDetected": true even if the accompanying text is placeholder/Lorem Ipsum).
   - "stampDetected": true IF an official institutional seal, round stamp, rubber stamp, oval stamp, bilingual rubber stamp, or designation seal (e.g. Coordinator, Principal, HoD, Director, Dean, Registrar, or institutional rubber stamp imprint at the bottom or margin) is visible or mentioned.
   - "dateDetected": true IF an explicit date (e.g. 4 June 2019, 19.06.2021) or academic cycle year (e.g. 2020-21, 2014-15) is present.
   - "timeDetected": true ONLY IF an actual digital timestamp, camera timestamp watermark, photo timestamp, GPS geo-tag, or system-generated timestamp metadata (e.g. "Generated on 2024-05-10 14:30", photo watermark timestamp) is present. NOTE: A regular printed circular, letter, or minutes of meeting that merely mentions a meeting time in passing (e.g. "meeting at 3:10 pm") does NOT qualify as a timestamped document; mark "timeDetected": false for narrative documents without an authentic timestamp watermark or digital timestamp.
   - "letterheadDetected": true IF official college/university letterhead, header, crest, or department banner is present.
   - "complianceAuditNote": 1 sentence summarizing what passed or failed.

OFFICIAL NAAC CRITERIA & METRIC GUIDANCE:
- Criterion 1: Curricular Aspects
  * KI 1.1 Curricular Planning (1.1.1 BoS minutes, lesson plans, timetables)
  * KI 1.2 Academic Flexibility (1.2.1 CBCS electives)
  * KI 1.3 Curriculum Enrichment (1.3.1 Cross-cutting values, 1.3.2 Value-added courses, 1.3.3 Field projects & Internships)
  * KI 1.4 Feedback System (1.4.1 Stakeholder feedback ATR)

- Criterion 2: Teaching-Learning and Evaluation
  * KI 2.1 Enrolment (2.1.1 Intake sanctions)
  * KI 2.2 Student Diversity (2.2.1 Remedial teaching)
  * KI 2.3 Teaching-Learning Process (2.3.1 Experiential / problem-solving methods)
  * KI 2.4 Teacher Profile (2.4.1 Faculty Ph.D./NET credentials)
  * KI 2.5 Evaluation Process (2.5.1 Internal assessment reforms)
  * KI 2.6 Learning Outcomes (2.6.1 PO/CO attainment analysis)
  * KI 2.7 Student Satisfaction Survey (2.7.1 SSS reports)

- Criterion 3: Research, Innovations and Extension
  * KI 3.1 Resource Mobilization for Research (3.1.1 Government & corporate research grants)
  * KI 3.2 Innovation Ecosystem (3.2.1 Incubation center, start-ups & hackathons, 3.2.2 IPR workshops)
  * KI 3.3 Research Publications (3.3.1 UGC CARE/Scopus journal papers, 3.3.2 Books & edited volumes)
  * KI 3.4 Extension Activities & Social Responsibility:
    - Metric 3.4.1: Extension and outreach programs conducted in community development through NSS, NCC, Red Cross, YRC, Blood Donation Camps, Swachh Bharat, Medical & Health Clinics, Village Adoption.
    - Metric 3.4.2: Awards and recognitions received for extension activities from government or recognized bodies.
  * KI 3.5 Collaboration & Linkages (3.5.1 MoUs with industry, corporations, and foreign universities)

- Criterion 4: Infrastructure and Learning Resources
  * KI 4.1 Physical Facilities (4.1.1 Smart classrooms, labs, seminar halls, 4.1.2 Sports & gym infrastructure)
  * KI 4.2 Library as a Learning Resource (4.2.1 ILMS software, e-journal subscriptions IEEE/Springer)
  * KI 4.3 IT Infrastructure (4.3.1 Wi-Fi bandwidth, firewall, 4.3.2 Student-computer ratio)
  * KI 4.4 Campus Maintenance (4.4.1 Physical maintenance AMC & audited balance sheets)

- Criterion 5: Student Support and Progression
  * KI 5.1 Student Support (5.1.1 Scholarships & freeships, 5.1.2 Soft skills training, 5.1.3 Competitive exam coaching GATE/GRE)
  * KI 5.2 Student Progression (5.2.1 Campus placement offer letters, 5.2.2 Higher education admissions)
  * KI 5.3 Student Participation:
    - Metric 5.3.1: Awards/medals for outstanding performance in sports/cultural activities at university/state/national/international level.
    - Metric 5.3.2: Presence of an active Student Council & representation of students on academic & administrative bodies.
    - Metric 5.3.3: Reports of sports and cultural activities / competitions / events organized by the institution.
  * KI 5.4 Alumni Engagement (5.4.1 Alumni association activities & contributions)

- Criterion 6: Governance, Leadership and Management
  * KI 6.1 Institutional Vision (6.1.1 Perspective plan)
  * KI 6.2 Strategy Deployment (6.2.1 Organogram, 6.2.3 E-governance ERP implementation)
  * KI 6.3 Faculty Empowerment (6.3.1 Staff welfare, 6.3.2 Conference financial aid, 6.3.3 FDP programs)
  * KI 6.4 Financial Management (6.4.1 CA audited statements & institutional budgets)
  * KI 6.5 Internal Quality Assurance System (6.5.1 IQAC quality audits, accreditation reviews, ATR)

- Criterion 7: Institutional Values and Best Practices
  * KI 7.1 Institutional Values (7.1.1 Gender equity, 7.1.2 Green campus, solar energy & waste management)
  * KI 7.2 Best Practices (7.2.1 Institutional institutionalized best practices)
  * KI 7.3 Institutional Distinctiveness (7.3.1 Flagship institutional distinctiveness)

SPECIFIC CATEGORY RULES:
- Sports & Cultural Events/Reports/Competitions: Classify under Criterion 5, Key Indicator 5.3, Metric 5.3.3.
- Social/Community/NSS/Health Outreach: Classify under Criterion 3, Key Indicator 3.4, Metric 3.4.1.

NAAC COMPLIANCE AUDIT GUIDANCE:
1. Document Nature Distinction:
   - "supporting_doc": Institutional narratives, activity reports, BoS minutes, circulars, syllabus, policies, audited accounts.
   - "ground_proof": Empirical ground evidence like event photos, attendance sheets with student/participant signatures, certificates, payment receipts.
2. Mandatory Compliance Verification:
   - signatureDetected: boolean (Authorized signatory or person's handwritten/digital signature present)
   - stampDetected: boolean (Official institutional seal, round stamp, or rubber stamp present)
   - dateDetected: boolean (Explicit date or academic year present)
   - timeDetected: boolean (Digital timestamp, camera/photo timestamp watermark, or official timestamp present. Routine narrative docs or minutes without a formal timestamp watermark must be false)
   - letterheadDetected: boolean (College letterhead, official crest or department header present)
   - complianceAuditNote: short 1-sentence assessment of compliance readiness.

If the filename is generic (e.g. "download.jpg", "image.png", "scan.pdf"), infer the event from the document text/visuals and generate a concise, professional title.

Respond in JSON ONLY:
{
  "crit": "Criterion [1-7]",
  "keyIndicator": "[Criterion].[KI number]",
  "metric": "[Criterion].[KI number].[Metric number]",
  "suggestedTitle": "Professional Descriptive Title for the Document, or null if placeholder/dummy text",
  "reason": "Detailed 1-2 sentence explanation connecting the visual/text evidence to this specific NAAC Criterion, Key Indicator, and Metric.",
  "docNature": "supporting_doc",
  "signatureDetected": false,
  "stampDetected": false,
  "dateDetected": false,
  "timeDetected": false,
  "letterheadDetected": false,
  "complianceAuditNote": "Assessment of compliance readiness."
}`;

      // Build multimodal payload
      const userContent: any[] = [
        { type: "text", text: prompt }
      ];

      if (imageToSend) {
        userContent.push({
          type: "image_url",
          image_url: {
            url: imageToSend,
            detail: "high"
          }
        });
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: userContent }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const parsed = JSON.parse(json.choices[0].message.content);
        if (parsed.crit && parsed.keyIndicator && parsed.metric) {
          const canonicalCrit = toCanonicalCrit(parsed.crit);
          const canonicalKi = toCanonicalKi(parsed.keyIndicator);
          const canonicalMetric = toCanonicalMetric(parsed.metric);
          const aiReason = parsed.reason || 'OpenAI Vision & Natural Language analysis of evidence document content and metadata.';

          // Priority resolution: if document or filename has an explicit NAAC metric number (e.g. 5.3.3 or 5.3.3.1), anchor to it
          let finalCrit = canonicalCrit;
          let finalKi = canonicalKi;
          let finalMetric = canonicalMetric;

          if (explicitMetricMatch) {
            const expCritNum = explicitMetricMatch[1];
            const expKiNum = `${expCritNum}.${explicitMetricMatch[2]}`;
            const expMetricNum = explicitMetricMatch[3] ? `${expKiNum}.${explicitMetricMatch[3]}` : `${expKiNum}.1`;
            const matchedMetric = NAAC_METRICS_LIST.find((m) => m.code === expMetricNum) || 
              NAAC_METRICS_LIST.find((m) => m.code.startsWith(expKiNum)) ||
              NAAC_METRICS_LIST.find((m) => m.code.startsWith(expCritNum));
            if (matchedMetric) {
              finalCrit = matchedMetric.criterionCode;
              finalKi = matchedMetric.code.split('.').slice(0, 2).join('.');
              finalMetric = matchedMetric.code;
            }
          }

          //  Detect nature & compliance flags from OpenAI response
          const aiDocNature: 'supporting_doc' | 'ground_proof' =
            parsed.docNature === 'supporting_doc' || parsed.docNature === 'ground_proof'
              ? parsed.docNature
              : (isRawImage ? 'ground_proof' : 'supporting_doc');

          // Reinforce flags with filename clues, extracted text content, and extracted images
          const lowerName = filename.toLowerCase();
          const isDirectImg = isRawImage || /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
          const effectiveImage = extractedImage || (isDirectImg ? fileDataUrl : undefined) || globalEmbeddedImageCache.get(filename) || globalEmbeddedImageCache.get(lowerName);
          const effectiveText = fileText || globalExtractedTextCache.get(filename) || globalExtractedTextCache.get(lowerName) || '';

          const hasSignatureInName = /(sign(ed|ature)?)\b/i.test(lowerName);
          const hasStampInName = /(stamp(ed)?|seal)\b/i.test(lowerName);
          const hasDateInName = /(\b20(1[4-9]|2[0-9])\b|date)\b/i.test(lowerName);
          const hasTimeInName = /(timestamp|time\s*stamp|photo\s*timestamp|geotag)\b/i.test(lowerName);
          const hasLetterheadInName = /(letterhead|college|univ|institute)\b/i.test(lowerName);

          const hasSignatureInDoc = effectiveText ? /(sign(ed|ature)?|principal|dean|hod|director|registrar|authorized|faculty|convenor|coordinator|sd\/-)\b/i.test(effectiveText) : false;
          const hasStampInDoc = effectiveText ? /(stamp(ed)?|seal|official\s+seal|rubber\s+stamp|approved\s+by|verified|attested|principal|director|dean|hod|convenor|aicte|university|naac|समन्वयक|संस्थान)\b/i.test(effectiveText) : false;
          const hasDateInDoc = effectiveText ? /(\b\d{1,2}\s*[-/.]\s*([01]?\d|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*[-/.]\s*(20\d{2}|\d{2})\b)|\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}\b|\b20\d{2}\s*[-–]\s*\d{2,4}\b|\b20(1[4-9]|2[0-9])\b|(date|dated)\s*[:.-]?\s*\d/i.test(effectiveText) : false;
          const hasTimeInDoc = effectiveText ? /(timestamp|time\s*stamp|photo\s*timestamp|camera\s*timestamp|geotag|\b\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?\b|\b\d{2}[/-]\d{2}[/-]\d{4}\s+\d{2}:\d{2}\b)/i.test(effectiveText) : false;
          const hasLetterheadInDoc = effectiveText ? /(college|university|institute|academy|faculty|department|iqac|letterhead|campus)\b/i.test(effectiveText) : false;

          const sigDetected = (typeof parsed.signatureDetected === 'boolean' ? parsed.signatureDetected : false) || hasSignatureInName || hasSignatureInDoc || Boolean(effectiveImage);
          const stampDetected = (typeof parsed.stampDetected === 'boolean' ? parsed.stampDetected : false) || hasStampInName || hasStampInDoc || sigDetected || Boolean(effectiveImage);
          const dateDetected = (typeof parsed.dateDetected === 'boolean' ? parsed.dateDetected : (typeof parsed.cycleYearMatch === 'boolean' ? parsed.cycleYearMatch : false)) || hasDateInName || hasDateInDoc;
          const timeDetected = (typeof parsed.timeDetected === 'boolean' ? parsed.timeDetected : (typeof parsed.geotagDetected === 'boolean' ? parsed.geotagDetected : false)) || hasTimeInName || hasTimeInDoc;
          const letterheadDetected = (typeof parsed.letterheadDetected === 'boolean' ? parsed.letterheadDetected : false) || hasLetterheadInName || hasLetterheadInDoc;

          const aiAuditChecks = {
            signature: sigDetected,
            stamp: stampDetected,
            date: dateDetected,
            time: timeDetected,
            letterhead: letterheadDetected,
            cycleYear: dateDetected,
            geotag: timeDetected,
            hasEmbeddedImages: Boolean(effectiveImage),
            isManual: false,
            notes: parsed.complianceAuditNote || (isLorem && !sigDetected ? 'Document contains placeholder text without verified signatory.' : 'Compliance evaluated via AI multimodal analysis.'),
          };
          const auditRes = evaluateDocAudit(filename, aiDocNature, aiAuditChecks, auditConfig, effectiveText);

          // Only use suggestedTitle if it is not a placeholder/NA text and document is not dummy/Lorem Ipsum
          const isValidTitle = !isLorem && parsed.suggestedTitle && 
            !/^N\/A/i.test(parsed.suggestedTitle) && 
            !/placeholder/i.test(parsed.suggestedTitle);
          let effectiveTitle = isValidTitle ? parsed.suggestedTitle : undefined;
          if (explicitMetricMatch && finalMetric === '5.3.3' && /health|community|nss/i.test(effectiveTitle || '')) {
            effectiveTitle = 'Reports of Sports and Cultural Activities/Events';
          }

          if (effectiveTitle) {
            globalEmbeddedImageCache.set(effectiveTitle, effectiveImage || '');
            globalEmbeddedImageCache.set(effectiveTitle.toLowerCase(), effectiveImage || '');
            if (effectiveText) {
              globalExtractedTextCache.set(effectiveTitle, effectiveText);
              globalExtractedTextCache.set(effectiveTitle.toLowerCase(), effectiveText);
            }
          }

          const docIdToUpdate = targetDocId || activeDocId;
          if (docIdToUpdate) {
            const critObj = NAAC_CRITERIA_SUMMARY.find((c) => c.code.toLowerCase() === finalCrit.toLowerCase());
            const metricObj = NAAC_METRICS_LIST.find((m) => m.code === finalMetric);
            addOrUpdateNaacDocument({
              id: docIdToUpdate,
              ...(effectiveTitle ? { title: effectiveTitle } : {}),
              criterionCode: finalCrit,
              criterionId: critObj?.id || 'crit-1',
              metricCode: finalMetric,
              metricName: metricObj?.name || `${finalMetric} Evidence Proof`,
              metricType: metricObj?.metricType || 'QnM',
              aiReason: aiReason,
              aiAutoFiled: true,
              docNature: aiDocNature,
              readinessScore: `${auditRes.score}/${auditRes.totalChecks}`,
              readinessPassed: auditRes.isReady,
              readinessChecks: {
                signature: auditRes.signature,
                stamp: auditRes.stamp,
                date: auditRes.date,
                time: auditRes.time,
                cycleYear: auditRes.cycleYear,
                letterhead: auditRes.letterhead,
                geotag: auditRes.geotag,
                notes: auditRes.notes,
              },
            });
            setUploadedFilesBatch((prev) =>
              prev.map((item) =>
                item.docId === docIdToUpdate
                  ? {
                      ...item,
                      name: item.name,
                      crit: finalCrit,
                      keyIndicator: finalKi,
                      metric: finalMetric,
                      reason: aiReason,
                      source: 'openai',
                      docNature: aiDocNature,
                      auditChecks: aiAuditChecks,
                      extractedText: fileText || item.extractedText,
                      extractedImage: extractedImage || item.extractedImage,
                    }
                  : item
              )
            );
            refreshDocuments();
          }

          if (updateActiveUi) {
            setSelectedCriterionCode(finalCrit);
            setSelectedKeyIndicatorCode(finalKi);
            setSelectedMetricCode(finalMetric);

            if (effectiveTitle) {
              const rawName = filename.toLowerCase();
              if (rawName.startsWith('download') || rawName.startsWith('image') || rawName.startsWith('img') || rawName.startsWith('photo') || rawName.startsWith('scan') || rawName.startsWith('file')) {
                setDocumentTitle(effectiveTitle);
              }
            }

            setAiSuggestion({
              crit: finalCrit,
              keyIndicator: finalKi,
              metric: finalMetric,
              reason: aiReason,
              source: 'openai',
            });
            setIsAiBoxOpen(true);
            showSuccessToast(
              `✨ AI mapped "${filename}" into ${finalCrit} › Metric ${finalMetric}`,
              { critCode: finalCrit, metricCode: finalMetric },
              8000
            );
          }
        }
      } else if (updateActiveUi) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${res.status}: OpenAI classification request failed.`;
        setAiSuggestion({
          crit: selectedCriterionCode,
          keyIndicator: selectedKeyIndicatorCode,
          metric: selectedMetricCode,
          reason: `OpenAI Notice: ${errMsg}. Please check your API key below or use manual selection.`,
          source: 'rule-engine',
        });
        setSuccessToast(`OpenAI: ${errMsg}`);
        setTimeout(() => setSuccessToast(null), 5000);
      }
    } catch (err: any) {
      console.warn('OpenAI classification error, fallback remains active:', err);
      if (updateActiveUi) {
        setAiSuggestion({
          crit: selectedCriterionCode,
          keyIndicator: selectedKeyIndicatorCode,
          metric: selectedMetricCode,
          reason: 'Unable to complete AI analysis due to a network or connection issue. You can select target destination manually.',
          source: 'rule-engine',
        });
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  // File drop / select handler — Supports single OR multiple files, immediately auto-ingesting & classifying each document
  const processFiles = (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    setAutoFiledNotice(null);
    if (useAi) {
      setIsAiProcessing(true);
    }

    filesArray.forEach((file, index) => {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      let initialCrit = cleanCritCode || 'Criterion 1';
      let initialKi = cleanKiCode || '1.1';
      let initialMetric = cleanMetricCode || '1.1.1';
      let initialReason = 'Analyzed document title & institutional context against NAAC Quality Indicator Framework.';

      const ruleSug = getAiSuggestion(file.name);
      if (ruleSug) {
        initialReason = ruleSug.reason;
        // Split files into different criteria automatically when Let AI do the filing is active
        if (useAi) {
          initialCrit = toCanonicalCrit(ruleSug.crit);
          initialKi = toCanonicalKi(ruleSug.keyIndicator);
          initialMetric = toCanonicalMetric(ruleSug.metric);
        }
      }

      if (index === 0) {
        setDocumentTitle(cleanName);
        setSelectedCriterionCode(initialCrit);
        setSelectedKeyIndicatorCode(initialKi);
        setSelectedMetricCode(initialMetric);
      }

      const activeCrit = NAAC_CRITERIA_SUMMARY.find((c) => c.code.toLowerCase() === initialCrit.toLowerCase()) || NAAC_CRITERIA_SUMMARY[0];
      const metricsForCrit = NAAC_METRICS_LIST.filter((m) => m.criterionCode.toLowerCase() === initialCrit.toLowerCase());
      const activeMetric = metricsForCrit.find((m) => m.code === initialMetric) || metricsForCrit[0] || NAAC_METRICS_LIST[0];

      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawDataUrl = (e.target?.result as string) || '';
        const fileObjectUrl = URL.createObjectURL(file);
        // Retain the genuine uploaded document URL (base64 Data URL or Blob URL) so the user opens their actual document
        const safeDataUrl = rawDataUrl || fileObjectUrl;

        // Extract actual document text and embedded images for RAG analysis & compliance verification
        const docExtraction = await extractDocumentContent(file);
        const isDirectImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
        const extractedText = docExtraction.text;
        const extractedImage = docExtraction.embeddedImage || (isDirectImg ? safeDataUrl : undefined);
        if (extractedImage) {
          globalEmbeddedImageCache.set(file.name, extractedImage);
          globalEmbeddedImageCache.set(file.name.toLowerCase(), extractedImage);
          if (cleanName) {
            globalEmbeddedImageCache.set(cleanName, extractedImage);
            globalEmbeddedImageCache.set(cleanName.toLowerCase(), extractedImage);
          }
        }
        const isLorem = /lorem\s+ipsum/i.test(extractedText);
        const hasSignatureWord = /(sign(ed|ature)?)\b/i.test(file.name);
        const hasSignature = /(sign(ed|ature)?|principal|dean|hod|director|registrar|authorized|faculty|convenor|coordinator|sd\/-)\b/i.test(extractedText);
        const hasStamp = /(stamp(ed)?|seal|official\s+seal|rubber\s+stamp|approved\s+by|verified|attested|principal|director|dean|hod|convenor)\b/i.test(extractedText);
        const hasDate = /(\b\d{1,2}\s*[-/.]\s*([01]?\d|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*[-/.]\s*(20\d{2}|\d{2})\b)|\b20\d{2}\s*[-–]\s*\d{2,4}\b|\b20(1[4-9]|2[0-9])\b|(date|dated)\s*[:.-]?\s*\d/i.test(extractedText);
        const hasTime = /(\b\d{1,2}[:.]\d{2}(\s*[-–to]+\s*\d{1,2}[:.]\d{2})?\s*(am|pm|hrs|hours|ist)?\b|time\s*[:.-]\s*\d|\b\d{1,2}\s*(am|pm)\b|\b(am|pm)\b|\b\d{1,2}[:.]\d{2}\b|two hours|hours)/i.test(extractedText);
        const hasLetterhead = /(college|university|institute|academy|faculty|department|iqac|letterhead|campus)\b/i.test(extractedText);

        if (isLorem) {
          initialReason = 'The document contains placeholder text (Lorem Ipsum) with no valid institutional or academic NAAC evidence.';
        } else if (extractedText) {
          const textSug = getAiSuggestion(file.name, extractedText);
          if (textSug) {
            initialReason = textSug.reason;
            if (useAi) {
              initialCrit = toCanonicalCrit(textSug.crit);
              initialKi = toCanonicalKi(textSug.keyIndicator);
              initialMetric = toCanonicalMetric(textSug.metric);
            }
          }
        }

        const initialNature = detectDocNature(file.name);
        const lowerName = file.name.toLowerCase();

        const initialAuditChecks = {
          signature: hasSignatureWord || hasSignature || Boolean(docExtraction.hasEmbeddedImages),
          stamp: extractedText ? hasStamp : (lowerName.includes('stamp') || lowerName.includes('seal') || Boolean(docExtraction.hasEmbeddedImages) || Boolean(hasSignature)),
          date: extractedText ? hasDate : (/\b20(1[4-9]|2[0-9])\b/.test(lowerName) || lowerName.includes('date')),
          time: extractedText ? /(timestamp|time\s*stamp|photo\s*timestamp|camera\s*timestamp|geotag)/i.test(extractedText) : (lowerName.includes('timestamp') || lowerName.includes('geotag')),
          letterhead: extractedText ? hasLetterhead : (initialNature === 'supporting_doc' || lowerName.includes('college') || lowerName.includes('institute')),
          cycleYear: extractedText ? hasDate : (/\b20(1[4-9]|2[0-9])\b/.test(lowerName)),
          geotag: lowerName.includes('geotag') || lowerName.includes('timestamp'),
          hasEmbeddedImages: Boolean(docExtraction.hasEmbeddedImages),
          isManual: false,
        };
        const initialAudit = evaluateDocAudit(file.name, initialNature, initialAuditChecks, auditConfig, extractedText);

        const newDocId = `doc-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;
        const newDoc: NaacEvidenceDocument = {
          id: newDocId,
          title: cleanName || file.name,
          description: `Ingested NAAC evidence for ${initialCrit} › Key Indicator ${initialKi} › Metric ${initialMetric}.`,
          schoolId: schoolId || 'sch-tech',
          schoolName: schoolName || 'School of Technology & Computer Engineering',
          programId: programId || (role === 'school' ? 'school-common' : role === 'university' ? 'univ-master' : 'prog-cse'),
          programName: programName || (role === 'school' ? 'School Level Evidence' : role === 'university' ? 'Central Institutional Evidence' : 'B.Tech Computer Science & Engineering'),
          academicYear: academicYear || '2025-26',
          criterionId: activeCrit?.id || 'crit-1',
          criterionCode: initialCrit,
          metricCode: initialMetric,
          metricName: activeMetric?.name || `${initialMetric} Evidence Proof`,
          metricType: activeMetric?.metricType || 'QnM',
          fileUrl: safeDataUrl,
          fileName: file.name,
          fileSize: sizeStr,
          uploadedBy: uploaderName || (role === 'school' ? 'Dean (School Coordinator)' : role === 'university' ? 'IQAC Central Committee' : 'Prof. Anita Verma'),
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'draft',
          version: 'v1.0',
          aiReason: useAi ? initialReason : undefined,
          aiAutoFiled: Boolean(useAi),
          cycleId: selectedCycleId,
          docNature: initialNature,
          readinessScore: `${initialAudit.score}/${initialAudit.totalChecks}`,
          readinessPassed: initialAudit.isReady,
          readinessChecks: {
            signature: initialAudit.signature,
            cycleYear: initialAudit.cycleYear,
            letterhead: initialAudit.letterhead,
            geotag: initialAudit.geotag,
            notes: initialAudit.notes,
          },
        };

        const created = addOrUpdateNaacDocument(newDoc);
        const targetId = created?.id || newDoc.id;

        setMyDocIds((prev) => {
          const updatedMyDocIds = Array.from(new Set([targetId, ...prev]));
          try {
            localStorage.setItem(myDocsStorageKey, JSON.stringify(updatedMyDocIds));
            localStorage.setItem('naac_my_uploaded_doc_ids_prog_cse', JSON.stringify(updatedMyDocIds));
            localStorage.setItem('naac_my_uploaded_doc_ids_program', JSON.stringify(updatedMyDocIds));
          } catch (err) {
            console.warn('Could not store myDocIds in localStorage:', err);
          }
          return updatedMyDocIds;
        });

        setSelectedDocIds((prev) => Array.from(new Set([targetId, ...prev])));
        refreshDocuments();

        if (index === 0) {
          setUploadedFile({
            name: file.name,
            size: sizeStr,
            dataUrl: safeDataUrl,
            extractedText,
            extractedImage,
          });
          setActiveDocId(targetId);
        }

        setUploadedFilesBatch((prev) => [
          ...prev,
          {
            docId: targetId,
            name: file.name,
            size: sizeStr,
            dataUrl: safeDataUrl,
            crit: initialCrit,
            keyIndicator: initialKi,
            metric: initialMetric,
            reason: initialReason,
            source: 'rule-engine',
            docNature: initialNature,
            extractedText,
            extractedImage,
            auditChecks: initialAuditChecks,
          },
        ]);

        // If AI is enabled, classify EVERY uploaded file in the batch
        if (useAi) {
          if (openaiKey.trim()) {
            classifyWithOpenAi(file.name, openaiKey.trim(), rawDataUrl, targetId, index === 0, extractedText, extractedImage);
          } else {
            if (index === 0) {
              setIsAiBoxOpen(true);
              setAiSuggestion({
                crit: initialCrit,
                keyIndicator: initialKi,
                metric: initialMetric,
                reason: initialReason,
                source: 'rule-engine',
              });
            }
            if (index === filesArray.length - 1) {
              setTimeout(() => {
                setIsAiProcessing(false);
                if (filesArray.length > 1) {
                  showSuccessToast(
                    `✨ AI scanned & mapped ${filesArray.length} documents! Review & click Confirm to file.`,
                    { critCode: initialCrit, metricCode: initialMetric },
                    8000
                  );
                } else {
                  showSuccessToast(
                    `✨ AI mapped "${file.name}" to ${initialCrit} › Metric ${initialMetric}!`,
                    { critCode: initialCrit, metricCode: initialMetric },
                    8000
                  );
                }
              }, 1600);
            }
          }
        } else if (index === 0) {
          setIsAiBoxOpen(false);
          setIsChangeOpen(true);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
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
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Real-time title typing and AI metric suggestion
  const handleTitleInput = (val: string) => {
    setDocumentTitle(val);
    if (activeDocId && val.trim()) {
      addOrUpdateNaacDocument({ id: activeDocId, title: val.trim() });
      refreshDocuments();
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
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

  // Confirm and Finalize Evidence Document in Repository
  const handleConfirmAndDrop = () => {
    if (!uploadedFile) {
      fileInputRef.current?.click();
      return;
    }

    setIsSubmitting(true);

    const activeCrit = NAAC_CRITERIA_SUMMARY.find((c) => c.code.toLowerCase() === cleanCritCode.toLowerCase()) || NAAC_CRITERIA_SUMMARY[0];
    const activeMetric = NAAC_METRICS_LIST.find((m) => m.code === cleanMetricCode) || availableMetrics[0];

    const fileName = uploadedFile.name;
    const docTitle = documentTitle.trim() || uploadedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    const targetId = activeDocId || `doc-${Date.now()}`;
    if (uploadedFilesBatch.length <= 1) {
      const singleNature = detectDocNature(fileName);
      const singleAudit = evaluateDocAudit(fileName, singleNature, undefined, auditConfig, uploadedFile.extractedText);
      addOrUpdateNaacDocument({
        id: targetId,
        title: docTitle,
        criterionCode: cleanCritCode,
        criterionId: activeCrit?.id || 'crit-1',
        metricCode: cleanMetricCode,
        metricName: activeMetric?.name || `${cleanMetricCode} Evidence Proof`,
        metricType: activeMetric?.metricType || 'QnM',
        fileUrl: uploadedFile.dataUrl,
        fileName,
        fileSize: uploadedFile.size,
        status: 'draft',
        schoolId: schoolId || 'sch-tech',
        programId: programId || (role === 'school' ? 'school-common' : role === 'university' ? 'univ-master' : 'prog-cse'),
        uploadedBy: uploaderName || (role === 'school' ? 'Dean (School Coordinator)' : role === 'university' ? 'IQAC Central Committee' : 'Prof. Anita Verma'),
        cycleId: selectedCycleId,
        docNature: singleNature,
        readinessScore: `${singleAudit.score}/${singleAudit.totalChecks}`,
        readinessPassed: singleAudit.isReady,
        readinessChecks: {
          signature: singleAudit.signature,
          stamp: singleAudit.stamp,
          date: singleAudit.date,
          time: singleAudit.time,
          letterhead: singleAudit.letterhead,
          cycleYear: singleAudit.cycleYear,
          geotag: singleAudit.geotag,
          notes: singleAudit.notes,
        },
      });
    } else {
      uploadedFilesBatch.forEach((item) => {
        const itemNature = item.docNature || detectDocNature(item.name);
        const itemAudit = evaluateDocAudit(item.name, itemNature, item.auditChecks, auditConfig, item.extractedText);
        addOrUpdateNaacDocument({
          id: item.docId,
          docNature: itemNature,
          readinessScore: `${itemAudit.score}/${itemAudit.totalChecks}`,
          readinessPassed: itemAudit.isReady,
          readinessChecks: {
            signature: itemAudit.signature,
            stamp: itemAudit.stamp,
            date: itemAudit.date,
            time: itemAudit.time,
            letterhead: itemAudit.letterhead,
            cycleYear: itemAudit.cycleYear,
            geotag: itemAudit.geotag,
            notes: itemAudit.notes,
          },
        });
      });
    }

    const batchIds =
      uploadedFilesBatch.length > 0
        ? uploadedFilesBatch.map((f) => f.docId)
        : [targetId];
    const updatedMyDocIds = Array.from(new Set([...batchIds, ...myDocIds]));
    setMyDocIds(updatedMyDocIds);
    setSelectedDocIds((prev) => Array.from(new Set([...batchIds, ...prev])));
    try {
      localStorage.setItem(myDocsStorageKey, JSON.stringify(updatedMyDocIds));
      localStorage.setItem('naac_my_uploaded_doc_ids_prog_cse', JSON.stringify(updatedMyDocIds));
      localStorage.setItem('naac_my_uploaded_doc_ids_program', JSON.stringify(updatedMyDocIds));
    } catch (e) {
      // ignore
    }
    refreshDocuments();

    const filedCount = uploadedFilesBatch.length > 0 ? uploadedFilesBatch.length : 1;
    const criteriaSummary =
      uploadedFilesBatch.length > 0
        ? Array.from(
            new Set(
              uploadedFilesBatch.map(
                (f) => `${toCanonicalCrit(f.crit)} (${toCanonicalMetric(f.metric)})`
              )
            )
          ).join(', ')
        : `${cleanCritCode} (${cleanMetricCode})`;

    const firstCrit = uploadedFilesBatch.length > 0 ? toCanonicalCrit(uploadedFilesBatch[0].crit) : cleanCritCode;
    const firstMetric = uploadedFilesBatch.length > 0 ? toCanonicalMetric(uploadedFilesBatch[0].metric) : cleanMetricCode;

    setAutoFiledNotice({
      count: filedCount,
      criteriaSummary,
      docIds: batchIds,
      firstCritCode: firstCrit,
      firstMetricCode: firstMetric,
    });

    const successMsg = filedCount > 1
      ? `✓ Filed ${filedCount} documents across ${criteriaSummary}!`
      : `✓ Filed "${fileName}" into ${criteriaSummary}!`;

    showSuccessToast(
      successMsg,
      { critCode: firstCrit, metricCode: firstMetric },
      9000
    );

    // Reset Form for next upload
    setUploadedFile(null);
    setUploadedFilesBatch([]);
    setActiveDocId(null);
    setDocumentTitle('');
    setDocumentDescription('');
    setSelectedCriterionCode('Criterion 1');
    setSelectedKeyIndicatorCode('1.1');
    setSelectedMetricCode('1.1.1');
    setAiSuggestion(null);
    setIsChangeOpen(false);
    setIsSubmitting(false);
  };

  // Submit selected documents to Coordinator / University / Archive
  const handleSubmitToCoordinator = () => {
    const targetDocIds = selectedDocIds.filter((id) =>
      unsubmittedDocs.some((d) => d.id === id)
    );

    if (targetDocIds.length === 0) {
      setSuccessToast('Please select at least one document to submit.');
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    const nextStatus: NaacWorkflowStatus = submitTargetLabel === 'Program Coordinator'
      ? 'submitted_to_program'
      : role === 'school'
      ? 'submitted_to_university'
      : role === 'university'
      ? 'university_verified'
      : 'submitted_to_program';

    const targetLabel = submitTargetLabel;

    const count = submitBatchNaacDocuments(targetDocIds, nextStatus, {
      coordinatorReviewStatus: (submitTargetLabel === 'Program Coordinator' || role === 'program') ? 'pending_review' : undefined,
      schoolReviewedBy: role === 'school' && submitTargetLabel !== 'Program Coordinator' ? (uploaderName || 'Dean (School Coordinator)') : undefined,
      schoolReviewedAt: role === 'school' && submitTargetLabel !== 'Program Coordinator' ? new Date().toISOString() : undefined,
      universityVerifiedBy: role === 'university' ? (uploaderName || 'IQAC Central Committee') : undefined,
      universityVerifiedAt: role === 'university' ? new Date().toISOString() : undefined,
    });

    setSelectedDocIds([]);
    refreshDocuments();
    setSuccessToast(`✨ Successfully submitted ${count} selected document${count === 1 ? '' : 's'} to ${targetLabel}!`);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  // Delete document from my documents (only drafts can be deleted)
  const handleDeleteMyDoc = (docId: string, title: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc && isDocSubmitted(doc)) {
      setSuccessToast('Cannot delete: Document has already been submitted.');
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    if (window.confirm(`Delete evidence file "${title}"?`)) {
      const deleted = deleteNaacDocument(docId);
      if (!deleted) {
        setSuccessToast('Submitted documents cannot be deleted.');
        setTimeout(() => setSuccessToast(null), 3000);
        return;
      }
      const updated = myDocIds.filter((id) => id !== docId);
      setMyDocIds(updated);
      setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
      localStorage.setItem(myDocsStorageKey, JSON.stringify(updated));
      refreshDocuments();
      setSuccessToast(`Deleted "${title}" from uploaded documents.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // View Complete Document Repository
  const handleViewCompleteRepository = () => {
    setIsMyDocsDrawerOpen(false);
    if (typeof onNavigateToDocumentList === 'function') {
      onNavigateToDocumentList();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleConfirmAndDrop();
  };

  // Delete handler
  const handleDelete = (docId: string, title: string) => {
    if (window.confirm(`Delete evidence file "${title}"?`)) {
      deleteNaacDocument(docId);
      setSelectedDirectoryDocIds((prev) => prev.filter((id) => id !== docId));
      refreshDocuments();
      setSuccessToast(`Deleted "${title}" from Evidence Directory.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Filtered documents (filtered by selected Cycle, Search query, and Criterion)
  const filteredDocuments = (Array.isArray(documents) ? documents : []).filter((doc, idx) => {
    if (!doc) return false;

    // Resolve cycle for document (explicit cycleId for uploaded docs, or deterministic cycle assignment for seed docs with NAAC Cycle 3 as primary active cycle)
    const effectiveCycleId = doc.cycleId
      ? doc.cycleId
      : idx % 6 === 4
      ? 'cycle-2'
      : idx % 8 === 5
      ? 'cycle-1'
      : 'cycle-3';

    const matchesCycle = !selectedCycleId || effectiveCycleId === selectedCycleId;
    if (!matchesCycle) return false;

    const title = (doc.title || doc.fileName || '').toLowerCase();
    const metric = (doc.metricCode || '').toLowerCase();
    const crit = (doc.criterionCode || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch = !query || title.includes(query) || metric.includes(query) || crit.includes(query);
    const matchesCriterion = criterionFilter === 'ALL' || doc.criterionCode === criterionFilter || crit === criterionFilter.toLowerCase();
    return matchesSearch && matchesCriterion;
  });

  return (
    <div className={`animate-in fade-in ${isDirectoryViewOpen ? 'space-y-6 pb-12' : 'flex-1 flex flex-col justify-center my-auto w-full'}`}>
      {/* Toast Notification — Single Source of Truth with Repository Link Button */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-xl shadow-xl flex items-center justify-between text-xs font-semibold gap-3 animate-in fade-in slide-in-from-top-2 max-w-xl">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="truncate">{typeof successToast === 'string' ? successToast : successToast.message}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {typeof onNavigateToDocumentList === 'function' && typeof successToast === 'object' && successToast?.action && (
              <button
                type="button"
                onClick={() => {
                  onNavigateToDocumentList(
                    successToast.action?.critCode,
                    successToast.action?.metricCode,
                    undefined,
                    selectedCycleId
                  );
                  setSuccessToast(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-2xs cursor-pointer transition-all shrink-0"
              >
                <span>View Document in Repository</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              type="button" 
              onClick={() => setSuccessToast(null)} 
              className="text-emerald-700 hover:text-emerald-950 p-0.5 rounded cursor-pointer transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Manage / Edit / Add NAAC Cycles Popup Modal */}
      {isManageCyclesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Manage NAAC Accreditation Cycles
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Edit existing cycle years or add a new NAAC SSR cycle
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageCyclesModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* 1. First Row: + Add New Cycle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  + Add New Cycle
                </label>
                <div className="grid grid-cols-12 gap-2 items-end bg-blue-50/40 p-3 rounded-xl border border-blue-200/80">
                  <div className="col-span-4">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">
                      Cycle Title
                    </label>
                    <input
                      type="text"
                      value={newCycleDraft.cycleNumber}
                      onChange={(e) =>
                        setNewCycleDraft({ ...newCycleDraft, cycleNumber: e.target.value })
                      }
                      placeholder="NAAC Cycle 4"
                      className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">
                      From Year
                    </label>
                    <select
                      value={newCycleDraft.yearFrom}
                      onChange={(e) => {
                        const fromYr = e.target.value;
                        setNewCycleDraft({
                          ...newCycleDraft,
                          yearFrom: fromYr,
                          yearTo: getFiveYearEndAcademicYear(fromYr),
                        });
                      }}
                      className="w-full text-xs font-semibold px-2 py-1.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-gray-900 cursor-pointer"
                    >
                      {ACADEMIC_YEAR_OPTIONS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">
                      To Year
                    </label>
                    <select
                      value={newCycleDraft.yearTo}
                      onChange={(e) =>
                        setNewCycleDraft({ ...newCycleDraft, yearTo: e.target.value })
                      }
                      className="w-full text-xs font-semibold px-2 py-1.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-gray-900 cursor-pointer"
                    >
                      {ACADEMIC_YEAR_OPTIONS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newCycleDraft.cycleNumber.trim()) return;
                        const newId = `cycle-${Date.now()}`;
                        const added: NaacSsrCycle = {
                          id: newId,
                          cycleNumber: newCycleDraft.cycleNumber.trim(),
                          yearFrom: newCycleDraft.yearFrom.trim() || '2026-27',
                          yearTo: newCycleDraft.yearTo.trim() || '2030-31',
                          status: 'Active',
                          createdAt: new Date().toISOString().split('T')[0],
                        };
                        const updatedList = [added, ...draftCycles];
                        setDraftCycles(updatedList);
                        saveNaacCycles(updatedList);
                        setCycles(updatedList);
                        setNewCycleDraft({
                          cycleNumber: `NAAC Cycle ${updatedList.length + 1}`,
                          yearFrom: '2031-32',
                          yearTo: '2035-36',
                          status: 'Active',
                        });
                        setSuccessToast(`Added "${added.cycleNumber}"!`);
                        setTimeout(() => setSuccessToast(null), 3000);
                      }}
                      className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer inline-flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Existing Cycles List (Read-only by default, editable on clicking Edit icon) */}
              <div className="pt-3 border-t border-gray-200">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Existing NAAC Cycles
                </label>
                <div className="space-y-2">
                  {draftCycles.map((cyc, idx) => {
                    const isRowEditing = editingCycleRowId === cyc.id;

                    return (
                      <div
                        key={cyc.id}
                        className={`rounded-xl border transition-colors ${
                          isRowEditing
                            ? 'bg-blue-50/30 border-blue-300 p-2.5'
                            : 'bg-slate-50 border-slate-200 px-3.5 py-2.5 flex items-center justify-between gap-3'
                        }`}
                      >
                        {isRowEditing ? (
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-4">
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                                Cycle Title
                              </label>
                              <input
                                type="text"
                                value={cyc.cycleNumber}
                                onChange={(e) => {
                                  const next = [...draftCycles];
                                  next[idx] = { ...cyc, cycleNumber: e.target.value };
                                  setDraftCycles(next);
                                }}
                                className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-blue-400 rounded-lg outline-none focus:border-blue-600 text-gray-900"
                              />
                            </div>

                            <div className="col-span-3">
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                                From Year
                              </label>
                              <select
                                value={cyc.yearFrom}
                                onChange={(e) => {
                                  const fromYr = e.target.value;
                                  const next = [...draftCycles];
                                  next[idx] = {
                                    ...cyc,
                                    yearFrom: fromYr,
                                    yearTo: getFiveYearEndAcademicYear(fromYr),
                                  };
                                  setDraftCycles(next);
                                }}
                                className="w-full text-xs font-semibold px-2 py-1.5 bg-white border border-blue-400 rounded-lg outline-none focus:border-blue-600 text-gray-800 cursor-pointer"
                              >
                                {ACADEMIC_YEAR_OPTIONS.map((yr) => (
                                  <option key={yr} value={yr}>
                                    {yr}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-span-3">
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                                To Year
                              </label>
                              <select
                                value={cyc.yearTo}
                                onChange={(e) => {
                                  const next = [...draftCycles];
                                  next[idx] = { ...cyc, yearTo: e.target.value };
                                  setDraftCycles(next);
                                }}
                                className="w-full text-xs font-semibold px-2 py-1.5 bg-white border border-blue-400 rounded-lg outline-none focus:border-blue-600 text-gray-800 cursor-pointer"
                              >
                                {ACADEMIC_YEAR_OPTIONS.map((yr) => (
                                  <option key={yr} value={yr}>
                                    {yr}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-span-2 flex items-center justify-end gap-1 pt-3.5">
                              <button
                                type="button"
                                onClick={() => {
                                  saveNaacCycles(draftCycles);
                                  setCycles(draftCycles);
                                  setEditingCycleRowId(null);
                                  setSuccessToast(`Saved "${cyc.cycleNumber}"!`);
                                  setTimeout(() => setSuccessToast(null), 2500);
                                }}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors"
                                title="Save Changes"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDraftCycles(cycles.map((c) => ({ ...c })));
                                  setEditingCycleRowId(null);
                                }}
                                className="p-1.5 bg-white hover:bg-gray-100 text-gray-500 border border-gray-200 rounded-lg cursor-pointer transition-colors"
                                title="Cancel Edit"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xs font-bold text-gray-900">
                                {cyc.cycleNumber}
                              </span>
                              <span className="text-gray-300">&bull;</span>
                              <span className="text-xs font-semibold text-blue-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md">
                                {cyc.yearFrom} to {cyc.yearTo}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setEditingCycleRowId(cyc.id)}
                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                                title="Edit Cycle"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {draftCycles.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedList = draftCycles.filter(
                                      (c) => c.id !== cyc.id
                                    );
                                    setDraftCycles(updatedList);
                                    saveNaacCycles(updatedList);
                                    setCycles(updatedList);
                                    if (!updatedList.some((c) => c.id === selectedCycleId)) {
                                      setSelectedCycleId(updatedList[0].id);
                                    }
                                    setSuccessToast(`Deleted "${cyc.cycleNumber}".`);
                                    setTimeout(() => setSuccessToast(null), 2500);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                  title="Delete Cycle"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar: Single Unified Line */}
      <div className="flex items-center justify-between py-1">
        {topBarLeftSlot ? (
          /* One Unified Line: Parent Desk Action Tabs on Left */
          <div className="flex items-center gap-3">
            {topBarLeftSlot}
          </div>
        ) : (
          /* Default Left Branding */
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {portalTitle && (
              <span className="text-gray-700 font-semibold">{portalTitle}</span>
            )}
            {levelBadgeText && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                role === 'university' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                role === 'school' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>
                {levelBadgeText}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {topBarLeftSlot && (
            <span className={`px-2.5 py-1 rounded font-mono text-xs font-semibold border ${
              role === 'program' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              role === 'university' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              AQAR {academicYear}
            </span>
          )}
        </div>
      </div>

      {isDirectoryViewOpen ? (
        /* FILED EVIDENCE DIRECTORY VIEW — MATCHING OVERALL CMS PAGE DESIGN */
        <div className="w-full space-y-5 animate-in fade-in">
          {/* Breadcrumb matching overall CMS NAAC pages */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <Home className="w-3.5 h-3.5 text-gray-500" />
            <span>/</span>
            <span
              onClick={() => setIsDirectoryViewOpen(false)}
              className="hover:text-blue-600 cursor-pointer"
            >
              NAAC
            </span>
            <span>/</span>
            <span className="text-gray-900 font-bold">Filed NAAC Evidence Directory</span>
          </div>

          {/* Standard CMS Page Heading Bar (outside card) with Cycle Selection & Dynamic Count */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
                Filed NAAC Evidence Directory
              </h1>

              {/* Cycle Selection Dropdown above table */}
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2.5 py-1 shadow-2xs">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Cycle:
                </span>
                {isInsideCycle ? (
                  <span className="text-xs font-bold text-gray-900 whitespace-nowrap">
                    {activeCycleObj
                      ? `${activeCycleObj.cycleNumber} : ${activeCycleObj.yearFrom} to ${activeCycleObj.yearTo}`
                      : selectedCycleId}
                  </span>
                ) : (
                  <>
                    <select
                      value={selectedCycleId}
                      onChange={(e) => setSelectedCycleId(e.target.value)}
                      className="text-xs font-bold text-blue-700 bg-transparent outline-none cursor-pointer pr-1"
                    >
                      {cycles.map((c) => (
                        <option key={c.id} value={c.id} className="text-gray-900 font-semibold">
                          {c.cycleNumber} : {c.yearFrom} to {c.yearTo}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={openManageCyclesModal}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer border-l border-gray-200 pl-2"
                      title="Edit or Add NAAC Cycles"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold whitespace-nowrap shrink-0">
                {filteredDocuments.length} Documents
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsDirectoryViewOpen(false)}
                className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs sm:text-sm font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              >
                &larr; Back to Quick Drop
              </button>

              {typeof onNavigateToDocumentList === 'function' && (
                <button
                  type="button"
                  onClick={() => onNavigateToDocumentList()}
                  className="px-4 py-2 bg-[#1d4ed8] hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Open Cycle (SSR)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter & Collapsible Hierarchy Card matching CMS NAAC tables */}
          <div className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-2xs">
            {/* Search, Expand/Collapse & Criterion Filter Bar inside Top of Card */}
            <div className="p-3.5 border-b border-gray-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by file name, criterion, or metric code..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Expand All / Collapse All */}
                <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      const allCrits: Record<string, boolean> = {};
                      const allKis: Record<string, boolean> = {};
                      NAAC_CRITERIA_SUMMARY.forEach((c) => {
                        allCrits[c.code] = true;
                      });
                      KEY_INDICATORS.forEach((k) => {
                        allKis[k.code] = true;
                      });
                      setExpandedDirectoryCrits(allCrits);
                      setExpandedDirectoryMetrics(allKis);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:text-blue-700 hover:bg-white rounded-md transition-colors cursor-pointer"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedDirectoryCrits({});
                      setExpandedDirectoryMetrics({});
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:text-blue-700 hover:bg-white rounded-md transition-colors cursor-pointer"
                  >
                    Collapse All
                  </button>
                </div>

                {/* Criterion Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Filter Criterion:
                  </span>
                  <select
                    value={criterionFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCriterionFilter(val);
                      if (val !== 'ALL') {
                        setExpandedDirectoryCrits((prev) => ({ ...prev, [val]: true }));
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 cursor-pointer text-gray-900"
                  >
                    <option value="ALL">All Criteria (1–7)</option>
                    {NAAC_CRITERIA_SUMMARY.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}: {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Selection Action Bar for "Compile as One PDF" */}
            {selectedDirectoryDocIds.length > 0 && (
              <div className="px-4 py-2.5 bg-blue-50/90 border-b border-blue-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1d4ed8] text-white text-xs font-bold">
                    {selectedDirectoryDocIds.length} Selected
                  </span>
                  <span className="text-xs font-medium text-blue-950">
                    Select multiple evidence files to merge into a single PDF with a shareable NAAC SSR Portal link.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDirectoryDocIds([])}
                    className="px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg cursor-pointer transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const selectedDocs = filteredDocuments.filter((d) =>
                        selectedDirectoryDocIds.includes(d.id)
                      );
                      if (selectedDocs.length === 0) return;
                      const firstDoc = selectedDocs[0];
                      const defCrit = toCanonicalCrit(firstDoc.criterionCode || 'Criterion 1');
                      const defMetric = toCanonicalMetric(firstDoc.metricCode || '1.1.1');
                      const parts = defMetric.split('.');
                      const defKi =
                        firstDoc.keyIndicatorCode ||
                        (parts.length >= 2 ? `${parts[0]}.${parts[1]}` : '1.1');
                      setCompilePdfModal({
                        crit: defCrit,
                        ki: defKi,
                        metric: defMetric,
                        fileName: `Metric_${defMetric.replace(/\./g, '_')}_Compiled_SSR_Evidence_${selectedDocs.length}Files.pdf`,
                        sourceDocs: selectedDocs,
                      });
                    }}
                    className="px-3.5 py-1.5 bg-[#1d4ed8] hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Compile as One PDF ({selectedDirectoryDocIds.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3-Level Collapsible Folder Accordion: Criterion -> Key Indicator -> Documents */}
            <div className="divide-y divide-gray-200">
              {NAAC_CRITERIA_SUMMARY.filter(
                (crit) => criterionFilter === 'ALL' || crit.code === criterionFilter
              ).map((crit) => {
                const docsInCrit = filteredDocuments.filter(
                  (d) => toCanonicalCrit(d.criterionCode || 'Criterion 1') === crit.code
                );

                // If searching and this criterion has 0 matches, hide empty criterion row
                if (searchQuery.trim() && docsInCrit.length === 0) {
                  return null;
                }

                const hasAutoFiledInCrit = docsInCrit.some((d) =>
                  Boolean(autoFiledNotice?.docIds.includes(d.id))
                );
                const isCritExpanded =
                  Boolean(searchQuery.trim()) ||
                  hasAutoFiledInCrit ||
                  Boolean(expandedDirectoryCrits[crit.code]);

                // Group docsInCrit by Key Indicator Code (sorted by KI Code)
                const kiGroupsMap = new Map<string, NaacEvidenceDocument[]>();
                docsInCrit.forEach((d) => {
                  const mCode = toCanonicalMetric(d.metricCode || '1.1.1');
                  const parts = mCode.split('.');
                  const kCode =
                    d.keyIndicatorCode ||
                    (parts.length >= 2 ? `${parts[0]}.${parts[1]}` : '1.1');
                  const existing = kiGroupsMap.get(kCode) || [];
                  existing.push(d);
                  kiGroupsMap.set(kCode, existing);
                });
                const sortedKiEntries = Array.from(kiGroupsMap.entries()).sort((a, b) =>
                  a[0].localeCompare(b[0], undefined, { numeric: true })
                );

                return (
                  <div key={crit.code} className="bg-white">
                    {/* LEVEL 1: Fast Criterion Folder Row */}
                    <div
                      onClick={() =>
                        setExpandedDirectoryCrits((prev) => ({
                          ...prev,
                          [crit.code]: !isCritExpanded,
                        }))
                      }
                      className={`px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                        isCritExpanded
                          ? 'bg-slate-100/90 hover:bg-slate-200/60'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isCritExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <FolderOpen className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-mono text-xs font-bold text-[#0f2748] bg-white border border-slate-300 px-2 py-0.5 rounded shadow-2xs shrink-0">
                          {crit.code}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {crit.name}
                        </span>
                        {hasAutoFiledInCrit && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold shrink-0">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Newly Filed</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-block text-[11px] font-medium text-gray-500">
                          {sortedKiEntries.length}{' '}
                          {sortedKiEntries.length === 1 ? 'Key Indicator' : 'Key Indicators'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            docsInCrit.length > 0
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-gray-50 text-gray-400 border-gray-200'
                          }`}
                        >
                          {docsInCrit.length} {docsInCrit.length === 1 ? 'Doc' : 'Docs'}
                        </span>
                      </div>
                    </div>

                    {/* LEVEL 2: Key Indicator Expandable Rows inside Criterion */}
                    {isCritExpanded && (
                      <div className="divide-y divide-gray-100 border-t border-gray-200/80">
                        {sortedKiEntries.length === 0 ? (
                          <div className="py-4 px-10 text-xs text-gray-400 italic bg-gray-50/40">
                            No documents filed under {crit.code} in this cycle yet.
                          </div>
                        ) : (
                          sortedKiEntries.map(([kiCode, kiDocs]) => {
                            const kiInfo = KEY_INDICATORS.find((k) => k.code === kiCode);
                            const hasAutoFiledInKi = kiDocs.some((d) =>
                              Boolean(autoFiledNotice?.docIds.includes(d.id))
                            );
                            const isKiExpanded =
                              Boolean(searchQuery.trim()) ||
                              hasAutoFiledInKi ||
                              Boolean(expandedDirectoryMetrics[kiCode]);

                            // Sort documents inside Key Indicator: Compiled PDFs pinned first, then by Metric Code
                            const sortedKiDocs = [...kiDocs].sort((a, b) => {
                              if (a.isCompiledPdf && !b.isCompiledPdf) return -1;
                              if (!a.isCompiledPdf && b.isCompiledPdf) return 1;
                              return toCanonicalMetric(a.metricCode || '1.1.1').localeCompare(
                                toCanonicalMetric(b.metricCode || '1.1.1'),
                                undefined,
                                { numeric: true }
                              );
                            });

                            const kiDocIds = sortedKiDocs.map((d) => d.id);
                            const selectedCountInKi = kiDocIds.filter((id) =>
                              selectedDirectoryDocIds.includes(id)
                            ).length;
                            const isAllKiSelected =
                              kiDocIds.length > 0 && selectedCountInKi === kiDocIds.length;

                            return (
                              <div key={kiCode} className="bg-white">
                                {/* Fast Key Indicator Expandable Sub-Row */}
                                <div
                                  onClick={() =>
                                    setExpandedDirectoryMetrics((prev) => ({
                                      ...prev,
                                      [kiCode]: !isKiExpanded,
                                    }))
                                  }
                                  className={`pl-8 pr-4 py-2 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                                    isKiExpanded
                                      ? 'bg-blue-50/40 hover:bg-blue-50/70'
                                      : 'bg-slate-50/50 hover:bg-slate-100/70'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {/* Select All in Key Indicator Checkbox */}
                                    <input
                                      type="checkbox"
                                      checked={isAllKiSelected}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        if (isAllKiSelected) {
                                          setSelectedDirectoryDocIds((prev) =>
                                            prev.filter((id) => !kiDocIds.includes(id))
                                          );
                                        } else {
                                          setSelectedDirectoryDocIds((prev) =>
                                            Array.from(new Set([...prev, ...kiDocIds]))
                                          );
                                          setExpandedDirectoryMetrics((prev) => ({
                                            ...prev,
                                            [kiCode]: true,
                                          }));
                                        }
                                      }}
                                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#1d4ed8] focus:ring-blue-500 accent-[#1d4ed8] cursor-pointer shrink-0"
                                      title={`Select all ${kiDocIds.length} documents in KI ${kiCode}`}
                                    />
                                    {isKiExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    )}
                                    <span className="font-mono text-[11px] font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">
                                      KI {kiCode}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-800 truncate">
                                      {kiInfo?.name || `Key Indicator ${kiCode}`}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {selectedCountInKi > 0 && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const selectedInKiDocs = sortedKiDocs.filter((d) =>
                                            selectedDirectoryDocIds.includes(d.id)
                                          );
                                          if (selectedInKiDocs.length === 0) return;
                                          const firstDoc = selectedInKiDocs[0];
                                          const defMetric = toCanonicalMetric(
                                            firstDoc.metricCode || '1.1.1'
                                          );
                                          setCompilePdfModal({
                                            crit: crit.code,
                                            ki: kiCode,
                                            metric: defMetric,
                                            fileName: `Metric_${defMetric.replace(/\./g, '_')}_Compiled_SSR_Evidence_${selectedInKiDocs.length}Files.pdf`,
                                            sourceDocs: selectedInKiDocs,
                                          });
                                        }}
                                        className="px-2.5 py-0.5 rounded-md bg-[#1d4ed8] hover:bg-blue-800 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                                      >
                                        <Layers className="w-3 h-3" />
                                        <span>Compile as One PDF ({selectedCountInKi})</span>
                                      </button>
                                    )}
                                    <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[11px] font-bold text-gray-700">
                                      {sortedKiDocs.length}{' '}
                                      {sortedKiDocs.length === 1 ? 'Document' : 'Documents'}
                                    </span>
                                  </div>
                                </div>

                                {/* LEVEL 3: Document Rows inside Key Indicator (each with Checkbox + Metric Pill) */}
                                {isKiExpanded && (
                                  <div className="border-t border-gray-100 divide-y divide-gray-100 bg-white">
                                    {sortedKiDocs.map((doc) => {
                                      const docMetricCode = toCanonicalMetric(
                                        doc.metricCode || '1.1.1'
                                      );
                                      const metricInfo = NAAC_METRICS_LIST.find(
                                        (m) => m.code === docMetricCode
                                      );
                                      const isJustFiled = Boolean(
                                        autoFiledNotice?.docIds.includes(doc.id)
                                      );
                                      const isAiUploaded = Boolean(
                                        doc.aiAutoFiled || doc.aiReason
                                      );
                                      const isPopoverOpen = openAiReasonDocId === doc.id;
                                      const isCompiledPopoverOpen =
                                        openCompiledFilesDocId === doc.id;
                                      const isDocChecked = selectedDirectoryDocIds.includes(
                                        doc.id
                                      );

                                      return (
                                        <div
                                          key={doc.id}
                                          className={`pl-12 pr-4 py-2 flex items-center justify-between gap-3 hover:bg-blue-50/30 transition-colors text-xs ${
                                            doc.isCompiledPdf
                                              ? 'bg-blue-50/40'
                                              : isJustFiled
                                              ? 'bg-emerald-50/50'
                                              : isDocChecked
                                              ? 'bg-blue-50/25'
                                              : ''
                                          }`}
                                        >
                                          {/* Checkbox + Metric Pill + Document Title + Size + Compiled/AI Badges */}
                                          <div className="flex items-center gap-2.5 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
                                            <input
                                              type="checkbox"
                                              checked={isDocChecked}
                                              onChange={() => {
                                                setSelectedDirectoryDocIds((prev) =>
                                                  prev.includes(doc.id)
                                                    ? prev.filter((id) => id !== doc.id)
                                                    : [...prev, doc.id]
                                                );
                                              }}
                                              className="w-3.5 h-3.5 rounded border-gray-300 text-[#1d4ed8] focus:ring-blue-500 accent-[#1d4ed8] cursor-pointer shrink-0"
                                            />
                                            <span
                                              className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shrink-0"
                                              title={
                                                metricInfo?.name
                                                  ? `Metric ${docMetricCode}: ${metricInfo.name}`
                                                  : `Metric ${docMetricCode}`
                                              }
                                            >
                                              Metric {docMetricCode}
                                            </span>
                                            <FileText className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                                            <span
                                              onClick={() => openFileInNewTab(doc.fileUrl)}
                                              className={`font-semibold hover:text-blue-700 cursor-pointer truncate max-w-md ${
                                                doc.isCompiledPdf
                                                  ? 'text-blue-950 font-bold'
                                                  : 'text-gray-900'
                                              }`}
                                              title={doc.fileName || doc.title}
                                            >
                                              {doc.fileName || doc.title}
                                            </span>

                                            {/* Compiled PDF Badge + Included Files Popover */}
                                            {doc.isCompiledPdf && (
                                              <div className="relative group inline-block shrink-0">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenCompiledFilesDocId(
                                                      isCompiledPopoverOpen ? null : doc.id
                                                    );
                                                  }}
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold cursor-pointer transition-colors"
                                                  title="Hover or click to view merged files in this compiled PDF"
                                                >
                                                  <Layers className="w-2.5 h-2.5 text-blue-600" />
                                                  <span>
                                                    Compiled PDF (
                                                    {doc.compiledSourceFiles?.length || 1} files)
                                                  </span>
                                                </button>

                                                {doc.compiledSourceFiles &&
                                                  doc.compiledSourceFiles.length > 0 && (
                                                    <div
                                                      className={`absolute left-0 bottom-full mb-2 w-72 sm:w-80 p-3 rounded-xl bg-slate-900 text-white text-[11px] leading-relaxed shadow-xl border border-slate-700 z-30 transition-all ${
                                                        isCompiledPopoverOpen
                                                          ? 'opacity-100 visible translate-y-0'
                                                          : 'opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 pointer-events-none'
                                                      }`}
                                                    >
                                                      <div className="font-bold text-indigo-300 text-[10px] uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-700/80 flex items-center justify-between">
                                                        <span>Merged Source Documents</span>
                                                        <span>
                                                          {doc.compiledSourceFiles.length} Files
                                                        </span>
                                                      </div>
                                                      <ol className="list-decimal list-inside space-y-1 text-slate-200">
                                                        {doc.compiledSourceFiles.map(
                                                          (srcName, sIdx) => (
                                                            <li
                                                              key={sIdx}
                                                              className="truncate"
                                                              title={srcName}
                                                            >
                                                              {srcName}
                                                            </li>
                                                          )
                                                        )}
                                                      </ol>
                                                    </div>
                                                  )}
                                              </div>
                                            )}

                                            {/* Interactive AI Filed Badge (Hover or Click for AI Reasoning Popover) */}
                                            {isAiUploaded && doc.aiReason && (
                                              <div className="relative group inline-block shrink-0">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenAiReasonDocId(
                                                      isPopoverOpen ? null : doc.id
                                                    );
                                                  }}
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold cursor-pointer transition-colors"
                                                  title="Hover or click to view AI filing reasoning"
                                                >
                                                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                                  <span>AI Filed</span>
                                                </button>

                                                <div
                                                  className={`absolute left-0 bottom-full mb-2 w-72 sm:w-80 p-3 rounded-xl bg-slate-900 text-white text-[11px] leading-relaxed shadow-xl border border-slate-700 z-30 transition-all ${
                                                    isPopoverOpen
                                                      ? 'opacity-100 visible translate-y-0'
                                                      : 'opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 pointer-events-none'
                                                  }`}
                                                >
                                                  <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-slate-700/80">
                                                    <span className="font-bold text-amber-300 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                                                      <Sparkles className="w-3 h-3 text-amber-400" />
                                                      AI Reasoning
                                                    </span>
                                                    {isPopoverOpen && (
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setOpenAiReasonDocId(null);
                                                        }}
                                                        className="text-slate-400 hover:text-white cursor-pointer"
                                                      >
                                                        <X className="w-3 h-3" />
                                                      </button>
                                                    )}
                                                  </div>
                                                  <p className="text-slate-200 font-normal">
                                                    {doc.aiReason}
                                                  </p>
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          {/* Right Side: Uploader, Date & Actions */}
                                          <div className="flex items-center gap-4 shrink-0">
                                            <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-500">
                                              <span className="truncate max-w-[140px]">
                                                {doc.uploadedBy || 'Faculty / IQAC'}
                                              </span>
                                              <span>&bull;</span>
                                              <span>{doc.uploadedAt}</span>
                                            </div>

                                            <div className="inline-flex items-center gap-1">
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  const docShareUrl =
                                                    doc.naacPortalUrl ||
                                                    `${window.location.origin}/?naacDoc=${encodeURIComponent(
                                                      doc.id
                                                    )}&file=${encodeURIComponent(
                                                      (doc.fileName || doc.title || 'document.pdf').replace(
                                                        /\s+/g,
                                                        '_'
                                                      )
                                                    )}`;
                                                  navigator.clipboard?.writeText(docShareUrl);
                                                  setSuccessToast(
                                                    `Copied document link: ${docShareUrl}`
                                                  );
                                                  setTimeout(() => setSuccessToast(null), 3500);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                                                title="Copy Document Link for NAAC Portal"
                                              >
                                                <Copy className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setEditingDocModal({
                                                    docId: doc.id,
                                                    fileName: doc.fileName || doc.title,
                                                    fileSize: doc.fileSize,
                                                    fileUrl: doc.fileUrl,
                                                    crit: crit.code,
                                                    ki: kiCode,
                                                    metric: docMetricCode,
                                                    aiReason: isAiUploaded
                                                      ? doc.aiReason
                                                      : undefined,
                                                    docNature: (doc.docNature as any) || 'supporting_doc',
                                                    auditChecks: doc.readinessChecks,
                                                  })
                                                }
                                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                                                title="Edit Criterion, Key Indicator & Metric"
                                              >
                                                <Pencil className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => openFileInNewTab(doc.fileUrl)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                                title="Open Document"
                                              >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleDelete(
                                                    doc.id,
                                                    doc.fileName || doc.title
                                                  )
                                                }
                                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                                title="Delete Document"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compile as One PDF Popup Modal */}
          {compilePdfModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full overflow-hidden animate-in zoom-in-95">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#1d4ed8] text-white flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Compile as One PDF for NAAC SSR Portal
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Merging {compilePdfModal.sourceDocs.length} selected documents into a single compiled PDF &amp; portal link
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompilePdfModal(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                  {/* Included Files List */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Included Documents ({compilePdfModal.sourceDocs.length} Files in Compilation Order)
                    </label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1.5">
                      {compilePdfModal.sourceDocs.map((sDoc, idx) => (
                        <div
                          key={sDoc.id}
                          className="flex items-center justify-between gap-2 text-xs bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/80"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-gray-800 truncate">
                              {sDoc.fileName || sDoc.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compiled File Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Compiled PDF File Name
                    </label>
                    <input
                      type="text"
                      value={compilePdfModal.fileName}
                      onChange={(e) =>
                        setCompilePdfModal({
                          ...compilePdfModal,
                          fileName: e.target.value,
                        })
                      }
                      className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Destination Criterion, Key Indicator & Metric */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        1. Criterion
                      </label>
                      <select
                        value={compilePdfModal.crit}
                        onChange={(e) => {
                          const nextCrit = toCanonicalCrit(e.target.value);
                          const kis = KEY_INDICATORS.filter(
                            (k) => k.criterionCode.toLowerCase() === nextCrit.toLowerCase()
                          );
                          const nextKi = kis[0]?.code || '1.1';
                          const metrics = NAAC_METRICS_LIST.filter(
                            (m) => m.criterionCode.toLowerCase() === nextCrit.toLowerCase()
                          );
                          const nextMetric =
                            metrics.find((m) => m.code.startsWith(nextKi))?.code ||
                            metrics[0]?.code ||
                            '1.1.1';
                          setCompilePdfModal({
                            ...compilePdfModal,
                            crit: nextCrit,
                            ki: nextKi,
                            metric: nextMetric,
                            fileName: `Metric_${nextMetric.replace(/\./g, '_')}_Compiled_SSR_Evidence_${compilePdfModal.sourceDocs.length}Files.pdf`,
                          });
                        }}
                        className="w-full text-xs font-semibold px-2.5 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {NAAC_CRITERIA_SUMMARY.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        2. Key Indicator
                      </label>
                      <select
                        value={compilePdfModal.ki}
                        onChange={(e) => {
                          const nextKi = toCanonicalKi(e.target.value);
                          const metrics = NAAC_METRICS_LIST.filter(
                            (m) =>
                              m.criterionCode.toLowerCase() ===
                              compilePdfModal.crit.toLowerCase()
                          );
                          const nextMetric =
                            metrics.find((m) => m.code.startsWith(nextKi))?.code ||
                            metrics[0]?.code ||
                            '1.1.1';
                          setCompilePdfModal({
                            ...compilePdfModal,
                            ki: nextKi,
                            metric: nextMetric,
                            fileName: `Metric_${nextMetric.replace(/\./g, '_')}_Compiled_SSR_Evidence_${compilePdfModal.sourceDocs.length}Files.pdf`,
                          });
                        }}
                        className="w-full text-xs font-semibold px-2.5 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {KEY_INDICATORS.filter(
                          (k) =>
                            k.criterionCode.toLowerCase() ===
                            compilePdfModal.crit.toLowerCase()
                        ).map((ki) => (
                          <option key={ki.code} value={ki.code}>
                            KI {ki.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        3. Metric
                      </label>
                      <select
                        value={compilePdfModal.metric}
                        onChange={(e) => {
                          const nextMetric = toCanonicalMetric(e.target.value);
                          const parts = nextMetric.split('.');
                          const parentKi =
                            parts.length >= 2
                              ? `${parts[0]}.${parts[1]}`
                              : compilePdfModal.ki;
                          setCompilePdfModal({
                            ...compilePdfModal,
                            ki: parentKi,
                            metric: nextMetric,
                            fileName: `Metric_${nextMetric.replace(/\./g, '_')}_Compiled_SSR_Evidence_${compilePdfModal.sourceDocs.length}Files.pdf`,
                          });
                        }}
                        className="w-full text-xs font-semibold px-2.5 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {NAAC_METRICS_LIST.filter(
                          (m) =>
                            m.criterionCode.toLowerCase() ===
                            compilePdfModal.crit.toLowerCase()
                        ).map((m) => (
                          <option key={m.code} value={m.code}>
                            Metric {m.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Preview of Shareable NAAC Portal URL */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                    <div className="font-bold text-emerald-900 mb-1 flex items-center justify-between">
                      <span>Shareable NAAC SSR Portal Evidence Link</span>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Auto-Generated
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-emerald-800 truncate bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200">
                      {`${window.location.origin}/?naacDoc=compiled-${compilePdfModal.metric.replace(
                        /\./g,
                        '-'
                      )}&file=${encodeURIComponent(
                        compilePdfModal.fileName || 'Compiled_Evidence.pdf'
                      )}`}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCompilePdfModal(null)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const critObj = NAAC_CRITERIA_SUMMARY.find(
                        (c) =>
                          c.code.toLowerCase() === compilePdfModal.crit.toLowerCase()
                      );
                      const metricObj = NAAC_METRICS_LIST.find(
                        (m) => m.code === compilePdfModal.metric
                      );
                      const finalFileName =
                        compilePdfModal.fileName.trim() ||
                        `Metric_${compilePdfModal.metric}_Compiled_Evidence.pdf`;
                      const compiledDocId = `compiled-${Date.now()}`;
                      const portalUrl = `${window.location.origin}/?naacDoc=${compiledDocId}&file=${encodeURIComponent(
                        finalFileName
                      )}`;

                      const activeCycleObj = cycles.find(
                        (c) => c.id === selectedCycleId
                      );
                      const cycleLabel = activeCycleObj
                        ? `${activeCycleObj.cycleNumber} (${activeCycleObj.yearFrom} to ${activeCycleObj.yearTo})`
                        : 'NAAC Cycle 3 (2021-22 to 2025-26)';

                      const generatedPdfDataUrl = generateCompiledNaacIndexPdfDataUrl({
                        cycleTitle: cycleLabel,
                        criterionCode: compilePdfModal.crit,
                        keyIndicatorCode: compilePdfModal.ki,
                        metricCode: compilePdfModal.metric,
                        metricName:
                          metricObj?.name ||
                          `Metric ${compilePdfModal.metric} Compiled Evidence`,
                        compiledFileName: finalFileName,
                        documents: compilePdfModal.sourceDocs.map((d) => ({
                          id: d.id,
                          title: d.title,
                          fileName: d.fileName || d.title,
                          fileSize: d.fileSize || '1.8 MB',
                          uploadedBy: d.uploadedBy || 'IQAC / Faculty',
                          uploadedAt: d.uploadedAt,
                          fileUrl: d.fileUrl,
                        })),
                      });

                      const kbSize = Math.max(
                        28,
                        Math.round((generatedPdfDataUrl.length * 0.75) / 1024) + 24
                      );

                      addOrUpdateNaacDocument({
                        id: compiledDocId,
                        title: finalFileName.replace(/\.pdf$/i, ''),
                        fileName: finalFileName,
                        fileSize: `${kbSize} KB (Index PDF)`,
                        fileUrl: generatedPdfDataUrl,
                        criterionCode: compilePdfModal.crit,
                        criterionId: critObj?.id || 'crit-1',
                        keyIndicatorCode: compilePdfModal.ki,
                        metricCode: compilePdfModal.metric,
                        metricName:
                          metricObj?.name ||
                          `Metric ${compilePdfModal.metric} Compiled Evidence`,
                        metricType: metricObj?.metricType || 'QnM',
                        uploadedBy: uploaderName || 'IQAC Coordinator',
                        uploadedAt: new Date().toISOString().split('T')[0],
                        status: 'university_verified',
                        cycleId: selectedCycleId,
                        isCompiledPdf: true,
                        compiledSourceFiles: compilePdfModal.sourceDocs.map(
                          (d) => d.fileName || d.title
                        ),
                        naacPortalUrl: portalUrl,
                      });

                      navigator.clipboard?.writeText(portalUrl);
                      refreshDocuments();
                      setExpandedDirectoryCrits((prev) => ({
                        ...prev,
                        [compilePdfModal.crit]: true,
                      }));
                      setExpandedDirectoryMetrics((prev) => ({
                        ...prev,
                        [compilePdfModal.ki]: true,
                      }));
                      setSelectedDirectoryDocIds([]);
                      setCompilePdfModal(null);
                      openFileInNewTab(generatedPdfDataUrl, finalFileName);
                      setSuccessToast(
                        `Generated lightweight Index PDF (${kbSize} KB) with ${compilePdfModal.sourceDocs.length} document links & copied NAAC link!`
                      );
                      setTimeout(() => setSuccessToast(null), 5000);
                    }}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1d4ed8] hover:bg-blue-800 shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Compile PDF &amp; Copy NAAC Link</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
      /* Center Uncluttered Experience */
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 text-center my-auto py-2 sm:py-4">
        {/* Bold Heading */}
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0f2748]">
            {headingTitle || 'Drop NAAC Evidence'}
          </h1>
          {portalSubtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium max-w-lg mx-auto">
              {portalSubtitle}
            </p>
          )}
        </div>

        {/* Select Cycle Dropdown / Locked Cycle Name Above Droppable Area */}
        <div className="mb-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Cycle:
            </span>
            {isInsideCycle ? (
              <span className="text-xs sm:text-sm font-bold text-gray-900 pr-1">
                {activeCycleObj
                  ? `${activeCycleObj.cycleNumber} : ${activeCycleObj.yearFrom} to ${activeCycleObj.yearTo}`
                  : selectedCycleId}
              </span>
            ) : (
              <>
                <select
                  value={selectedCycleId}
                  onChange={(e) => setSelectedCycleId(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-bold text-gray-900 outline-none border-none cursor-pointer pr-1"
                >
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cycleNumber} : {c.yearFrom} to {c.yearTo}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={openManageCyclesModal}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border-l border-gray-200 pl-2.5"
                  title="Edit or Add NAAC Cycles"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Hidden File Input (Supports Multiple Files) */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />

          {!uploadedFile ? (
            /* EMPTY STATE: Wide Drag & Drop Card with Clear Auto vs Manual Division (Sleek Height & Blue Hover Border) */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleBarDragOver}
              onDragLeave={handleBarDragLeave}
              onDrop={handleBarDrop}
              className={`relative w-full max-w-4xl mx-auto rounded-3xl border-2 border-dashed p-5 sm:p-6 transition-all duration-200 cursor-pointer text-center shadow-[0_4px_20px_rgba(15,39,72,0.05)] hover:shadow-[0_10px_28px_rgba(15,39,72,0.09)] min-h-[185px] flex flex-col justify-between bg-white ${
                useAi
                  ? 'border-indigo-300 ring-2 ring-indigo-100/70 hover:border-blue-500'
                  : 'border-slate-300 hover:border-blue-400'
              } ${
                isBarDragging ? '!border-blue-500 !bg-slate-50 ring-4 ring-blue-100 scale-[1.005]' : ''
              }`}
            >
              {/* Top Divided Header: Let AI do the filing vs Manual Mode Division + NAAC Audit Checklist */}
              <div 
                className="w-full flex flex-col md:flex-row items-center justify-between gap-2.5 pb-3 mb-2 border-b border-gray-100/90"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left: Let AI do the filing vs Manual Mode Segmented Division */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">
                    Mode:
                  </span>
                  <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setUseAi(true)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        useAi
                          ? 'bg-white text-indigo-950 shadow-xs border border-indigo-200/80 ring-1 ring-indigo-100'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="AI scans documents, maps Criterion & Metric, and shows reasoning before filing"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${useAi ? 'text-amber-500 fill-amber-400' : 'text-gray-400'}`} />
                      <span>Let AI do the filing</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUseAi(false)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !useAi
                          ? 'bg-white text-gray-900 shadow-xs border border-gray-300 ring-1 ring-gray-100'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="Direct manual assignment of Criterion and Metric"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                      <span>Do Filing Manually</span>
                    </button>
                  </div>
                </div>

                {/* Right: Apply Checks Dropdown Popover (Only Shown in AI Mode) */}
                {useAi && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsApplyChecksOpen(!isApplyChecksOpen);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                        [auditConfig.checkSignature, auditConfig.checkStamp, auditConfig.checkDate, auditConfig.checkTime, auditConfig.checkLetterhead].filter(Boolean).length > 0
                          ? 'bg-blue-50/90 text-blue-900 border-blue-200 hover:bg-blue-100'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                      title="Configure AI compliance scan before uploading"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Apply Checks</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#0f2748] text-white">
                        {[auditConfig.checkSignature, auditConfig.checkStamp, auditConfig.checkDate, auditConfig.checkTime, auditConfig.checkLetterhead].filter(Boolean).length}/5
                      </span>
                      <ChevronDown className={`w-3 h-3 text-blue-700 transition-transform ${isApplyChecksOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Popover Card for AI Mode */}
                    {isApplyChecksOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-2.5 text-left z-50 animate-in fade-in zoom-in-95"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 mb-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>Apply Checks</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsApplyChecksOpen(false)}
                            className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                            title="Close"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-0.5">
                          {/* 1. Signature */}
                          <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none transition-colors">
                            <input
                              type="checkbox"
                              checked={auditConfig.checkSignature}
                              onChange={(e) => setAuditConfig((c) => ({ ...c, checkSignature: e.target.checked }))}
                              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                            />
                            <span className="text-xs font-medium text-gray-800">Signature</span>
                          </label>

                          {/* 2. Stamp */}
                          <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none transition-colors">
                            <input
                              type="checkbox"
                              checked={auditConfig.checkStamp}
                              onChange={(e) => setAuditConfig((c) => ({ ...c, checkStamp: e.target.checked }))}
                              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                            />
                            <span className="text-xs font-medium text-gray-800">Stamp</span>
                          </label>

                          {/* 3. Date */}
                          <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none transition-colors">
                            <input
                              type="checkbox"
                              checked={auditConfig.checkDate}
                              onChange={(e) => setAuditConfig((c) => ({ ...c, checkDate: e.target.checked }))}
                              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                            />
                            <span className="text-xs font-medium text-gray-800">Date</span>
                          </label>

                          {/* 4. Time */}
                          <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none transition-colors">
                            <input
                              type="checkbox"
                              checked={auditConfig.checkTime}
                              onChange={(e) => setAuditConfig((c) => ({ ...c, checkTime: e.target.checked }))}
                              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                            />
                            <span className="text-xs font-medium text-gray-800">Time</span>
                          </label>

                          {/* 5. Letterhead */}
                          <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none transition-colors">
                            <input
                              type="checkbox"
                              checked={auditConfig.checkLetterhead}
                              onChange={(e) => setAuditConfig((c) => ({ ...c, checkLetterhead: e.target.checked }))}
                              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                            />
                            <span className="text-xs font-medium text-gray-800">Letterhead</span>
                          </label>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              const allChecked = auditConfig.checkSignature && auditConfig.checkStamp && auditConfig.checkDate && auditConfig.checkTime && auditConfig.checkLetterhead;
                              setAuditConfig({
                                enabled: true,
                                checkSignature: !allChecked,
                                checkStamp: !allChecked,
                                checkDate: !allChecked,
                                checkTime: !allChecked,
                                checkLetterhead: !allChecked,
                              });
                            }}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            {auditConfig.checkSignature && auditConfig.checkStamp && auditConfig.checkDate && auditConfig.checkTime && auditConfig.checkLetterhead ? 'Deselect All' : 'Select All'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsApplyChecksOpen(false)}
                            className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-2xs"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Center Dropzone Illustration & Action (Clean White Styling & Sleek Height) */}
              <div className="py-2.5 sm:py-3.5 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-slate-600 mb-2 shadow-2xs">
                  <Upload className="w-6 h-6 text-slate-600 stroke-[2.2]" />
                </div>

                <p className="text-sm sm:text-base font-bold text-gray-800 tracking-tight">
                  Drag &amp; drop NAAC evidence file here
                </p>

                <div className="mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-colors shadow-2xs">
                    Choose File to Upload
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs text-gray-400 mt-2 font-medium">
                  Supports PDF, DOCX, XLSX, PNG, JPG &bull; Maximum file size: 25 MB
                </p>
              </div>
            </div>
          ) : (
            /* UPLOADED FILE STATE: SINGLE UNIFIED CARD BOX */
            <div
              onDragOver={handleBarDragOver}
              onDragLeave={handleBarDragLeave}
              onDrop={handleBarDrop}
              className={`w-full max-w-5xl mx-auto bg-white border-2 rounded-2xl p-4 sm:p-5 shadow-lg text-left transition-all animate-in fade-in zoom-in-95 ${
                isBarDragging ? 'border-blue-500 ring-4 ring-blue-100 bg-blue-50/30' : 'border-blue-200/90'
              }`}
            >
              {/* Box Top Header: Let AI do the filing Checkbox, File Chip, and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                {/* Left: Let AI do the filing + Attached File Chip */}
                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                  <label
                    htmlFor="enable-ai-card-box"
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold select-none cursor-pointer transition-all shrink-0 ${
                      useAi
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                    }`}
                    title="Toggle AI Filing & Reasoning"
                  >
                    <input
                      id="enable-ai-card-box"
                      type="checkbox"
                      checked={useAi}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setUseAi(checked);
                        if (checked) {
                          setIsChangeOpen(false);
                          setIsAiProcessing(true);
                          if (uploadedFilesBatch.length > 0) {
                            const activeItem =
                              uploadedFilesBatch.find((f) => f.docId === activeDocId) ||
                              uploadedFilesBatch[0];

                            // Apply AI rule engine mapping to each file in the batch
                            const aiMappedBatch = uploadedFilesBatch.map((item) => {
                              const sug = getAiSuggestion(item.name);
                              const c = toCanonicalCrit(sug.crit);
                              const k = toCanonicalKi(sug.keyIndicator);
                              const m = toCanonicalMetric(sug.metric);
                              const critObj = NAAC_CRITERIA_SUMMARY.find(
                                (cr) => cr.code.toLowerCase() === c.toLowerCase()
                              );
                              const metricObj = NAAC_METRICS_LIST.find((mt) => mt.code === m);
                              addOrUpdateNaacDocument({
                                id: item.docId,
                                criterionCode: c,
                                criterionId: critObj?.id || 'crit-1',
                                metricCode: m,
                                metricName: metricObj?.name || `${m} Evidence Proof`,
                                metricType: metricObj?.metricType || 'QnM',
                                aiReason: sug.reason,
                                aiAutoFiled: true,
                              });
                              return {
                                ...item,
                                crit: c,
                                keyIndicator: k,
                                metric: m,
                                reason: sug.reason,
                                source: 'rule-engine' as const,
                                isManualEdit: false,
                              };
                            });
                            setUploadedFilesBatch(aiMappedBatch);
                            refreshDocuments();

                            if (openaiKey.trim()) {
                              aiMappedBatch.forEach((item) => {
                                classifyWithOpenAi(
                                  item.name,
                                  openaiKey.trim(),
                                  item.dataUrl,
                                  item.docId,
                                  item.docId === activeItem.docId,
                                  item.extractedText,
                                  item.extractedImage
                                );
                              });
                            } else if (activeItem) {
                              const mappedActive =
                                aiMappedBatch.find((f) => f.docId === activeItem.docId) ||
                                aiMappedBatch[0];
                              setSelectedCriterionCode(mappedActive.crit);
                              setSelectedKeyIndicatorCode(mappedActive.keyIndicator);
                              setSelectedMetricCode(mappedActive.metric);
                              setAiSuggestion({
                                crit: mappedActive.crit,
                                keyIndicator: mappedActive.keyIndicator,
                                metric: mappedActive.metric,
                                reason: mappedActive.reason,
                                source: 'rule-engine',
                              });
                              setTimeout(() => setIsAiProcessing(false), 1500);
                            }
                          } else if (uploadedFile && openaiKey.trim()) {
                            classifyWithOpenAi(
                              uploadedFile.name,
                              openaiKey.trim(),
                              uploadedFile.dataUrl,
                              undefined,
                              true,
                              uploadedFile.extractedText,
                              uploadedFile.extractedImage
                            );
                          } else {
                            setTimeout(() => setIsAiProcessing(false), 1500);
                          }
                        } else {
                          setIsAiProcessing(false);
                          // Switching to Manual Mode: carry over active selection & apply shared destination to batch
                          const sharedCrit = aiSuggestion
                            ? toCanonicalCrit(aiSuggestion.crit)
                            : cleanCritCode;
                          const sharedKi = aiSuggestion
                            ? toCanonicalKi(aiSuggestion.keyIndicator)
                            : cleanKiCode;
                          const sharedMetric = aiSuggestion
                            ? toCanonicalMetric(aiSuggestion.metric)
                            : cleanMetricCode;

                          setSelectedCriterionCode(sharedCrit);
                          setSelectedKeyIndicatorCode(sharedKi);
                          setSelectedMetricCode(sharedMetric);

                          if (uploadedFilesBatch.length > 1) {
                            const critObj = NAAC_CRITERIA_SUMMARY.find(
                              (c) => c.code.toLowerCase() === sharedCrit.toLowerCase()
                            );
                            const metricObj = NAAC_METRICS_LIST.find((m) => m.code === sharedMetric);
                            uploadedFilesBatch.forEach((item) => {
                              addOrUpdateNaacDocument({
                                id: item.docId,
                                criterionCode: sharedCrit,
                                criterionId: critObj?.id || 'crit-1',
                                metricCode: sharedMetric,
                                metricName: metricObj?.name || `${sharedMetric} Evidence Proof`,
                                metricType: metricObj?.metricType || 'QnM',
                              });
                            });
                            setUploadedFilesBatch((prev) =>
                              prev.map((item) => ({
                                ...item,
                                crit: sharedCrit,
                                keyIndicator: sharedKi,
                                metric: sharedMetric,
                                isManualEdit: false,
                              }))
                            );
                            refreshDocuments();
                          }

                          setAiSuggestion(null);
                          setIsChangeOpen(true);
                        }
                      }}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0f2748]"
                    />
                    <Sparkles className={`w-3.5 h-3.5 ${useAi ? 'text-amber-600 fill-amber-500' : 'text-gray-400'}`} />
                    <span>Let AI do the filing</span>
                  </label>

                  <div className="h-4 w-px bg-gray-200 hidden sm:block shrink-0" />

                  {uploadedFilesBatch.length <= 1 ? (
                    /* Single File Chip on Top Bar */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/90 border border-blue-200 text-blue-900 rounded-full text-xs font-semibold cursor-pointer hover:bg-blue-100 transition-colors shadow-2xs min-w-0"
                      title="Click to replace or add files"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate max-w-[200px] font-medium">
                        {uploadedFile.name}
                      </span>
                      <span className="text-[10px] text-blue-500 font-normal shrink-0">
                        ({uploadedFile.size})
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeDocId) {
                            deleteNaacDocument(activeDocId);
                            const updated = myDocIds.filter((id) => id !== activeDocId);
                            setMyDocIds(updated);
                            setSelectedDocIds((prev) =>
                              prev.filter((id) => id !== activeDocId)
                            );
                            try {
                              localStorage.setItem(myDocsStorageKey, JSON.stringify(updated));
                              localStorage.setItem(
                                'naac_my_uploaded_doc_ids_prog_cse',
                                JSON.stringify(updated)
                              );
                              localStorage.setItem(
                                'naac_my_uploaded_doc_ids_program',
                                JSON.stringify(updated)
                              );
                            } catch (err) {
                              // ignore
                            }
                            refreshDocuments();
                          }
                          setUploadedFile(null);
                          setUploadedFilesBatch([]);
                          setActiveDocId(null);
                          setSelectedCriterionCode('Criterion 1');
                          setSelectedKeyIndicatorCode('1.1');
                          setSelectedMetricCode('1.1.1');
                          setAiSuggestion(null);
                          setIsChangeOpen(false);
                          setIsAiBoxOpen(false);
                        }}
                        className="text-blue-400 hover:text-red-600 ml-1 cursor-pointer p-0.5 rounded hover:bg-blue-200/50"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* Multiple Files Summary Badge on Top Bar */
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-full text-xs font-bold">
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{uploadedFilesBatch.length} Files Attached</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 cursor-pointer transition-colors"
                    title="Add more files to this upload batch"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Files</span>
                  </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 justify-end">
                  {uploadedFilesBatch.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        uploadedFilesBatch.forEach((f) => deleteNaacDocument(f.docId));
                        const removedSet = new Set(uploadedFilesBatch.map((f) => f.docId));
                        const updated = myDocIds.filter((id) => !removedSet.has(id));
                        setMyDocIds(updated);
                        setSelectedDocIds((prev) => prev.filter((id) => !removedSet.has(id)));
                        refreshDocuments();
                        setUploadedFilesBatch([]);
                        setUploadedFile(null);
                        setActiveDocId(null);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-rose-600 bg-gray-100 hover:bg-rose-50 border border-gray-300 transition-colors cursor-pointer"
                    >
                      <span>Clear All</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmAndDrop();
                    }}
                    disabled={isSubmitting || isAiProcessing}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1d4ed8] hover:bg-blue-800 active:scale-[0.98] shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
                    title={isAiProcessing ? 'AI is analyzing evidence document...' : 'Confirm destination and drop document into repository'}
                  >
                    {isAiProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-blue-300 animate-spin" />
                        <span>AI Mapping...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                        <span>
                          Confirm &amp; File{uploadedFilesBatch.length > 1 ? ` (${uploadedFilesBatch.length})` : ''}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* MANUAL MODE: Target Destination Selectors Above the Unified Table */}
              {!useAi && (
                <div className="pt-2.5 pb-3 border-b border-gray-100 animate-in fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Select Target Destination{uploadedFilesBatch.length > 1 ? ` (Applies to all ${uploadedFilesBatch.length} documents below)` : ''}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      Do Filing Manually
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 1. Criterion */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        1. Criterion
                      </label>
                      <select
                        value={cleanCritCode}
                        onChange={(e) => handleCriterionChange(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white text-gray-800 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
                      >
                        {NAAC_CRITERIA_SUMMARY.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}: {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Key Indicator */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        2. Key Indicator
                      </label>
                      <select
                        value={cleanKiCode}
                        onChange={(e) => handleKeyIndicatorChange(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white text-gray-800 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
                      >
                        {availableKeyIndicators.map((ki) => (
                          <option key={ki.code} value={ki.code}>
                            KI {ki.code}: {ki.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Metric */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        3. Metric
                      </label>
                      <select
                        value={cleanMetricCode}
                        onChange={(e) => handleMetricChange(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white text-gray-800 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
                      >
                        {availableKeyIndicators.map((ki) => {
                          const metricsInKi = availableMetrics.filter((m) => m.code.startsWith(ki.code));
                          if (metricsInKi.length === 0) return null;
                          return (
                            <optgroup key={ki.code} label={`KI ${ki.code}: ${ki.name}`}>
                              {metricsInKi.map((m) => (
                                <option key={m.code} value={m.code}>
                                  {m.code} ({m.metricType}) — {m.name}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {isAiProcessing && useAi ? (
                /* IMPRESSIVE AI SCANNING & CLASSIFICATION LOADER (Shown for both Single & Multi-File Drops) */
                <div className="py-6 px-4 sm:px-6 my-2 bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-slate-50 border border-indigo-200/80 rounded-2xl text-left animate-in fade-in space-y-4 shadow-2xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#0f2748] text-white flex items-center justify-center shrink-0 shadow-md ring-4 ring-indigo-100">
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-extrabold text-[#0f2748]">
                          AI is scanning &amp; classifying{' '}
                          {uploadedFilesBatch.length > 1
                            ? `${uploadedFilesBatch.length} evidence documents`
                            : `"${uploadedFile.name}"`}
                          ...
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-800 bg-indigo-100/90 border border-indigo-200 px-2.5 py-0.5 rounded-full animate-pulse">
                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                          <span>NAAC SSR Mapping</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Reading document titles, institutional attributes &amp; academic keywords to determine exact NAAC Criterion, Key Indicator, Metric &amp; audit reasoning...
                      </p>
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0f2748] via-indigo-600 to-emerald-500 rounded-full animate-pulse w-4/5 transition-all duration-700" />
                  </div>

                  {/* 3 Step Indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 border border-indigo-100 text-xs font-semibold text-gray-800 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1. Document Ingested</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 border border-indigo-200 text-xs font-bold text-indigo-900 shadow-2xs">
                      <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                      <span>2. Matching Criterion &amp; Metric</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 border border-gray-200 text-xs font-semibold text-gray-600">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>3. Preparing AI Reasoning</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* UNIFIED PREVIEW TABLE (100% VISUAL CONSISTENCY FOR BOTH AI AND MANUAL MODES) */
                <div className="pt-3 animate-in fade-in space-y-2.5">
                  <div className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${useAi ? 'bg-emerald-500 animate-pulse' : 'bg-blue-600'}`} />
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                        {useAi
                          ? `AI Classification & Reasoning Review (${uploadedFilesBatch.length} ${
                              uploadedFilesBatch.length === 1 ? 'Document' : 'Documents'
                            })`
                          : `Filing Preview (${uploadedFilesBatch.length} ${
                              uploadedFilesBatch.length === 1 ? 'Document' : 'Documents'
                            })`}
                      </span>
                    </div>
                    {useAi &&
                      (aiSuggestion?.source === 'openai' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-full shadow-2xs">
                          <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-500" />
                          <span>OpenAI GPT-4o-mini</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-full shadow-2xs">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          <span>NAAC AI Rule Engine</span>
                        </span>
                      ))}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="py-2.5 px-3.5 w-[36%]">Document &amp; Nature</th>
                          <th className="py-2.5 px-3 w-[30%]">Criteria &amp; KI</th>
                          <th className="py-2.5 px-3 w-[24%]">Metric</th>
                          <th className="py-2.5 px-3 text-right w-[10%]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {uploadedFilesBatch.map((batchItem, idx) => {
                          const itemCritCode = toCanonicalCrit(batchItem.crit);
                          const itemKiCode = toCanonicalKi(batchItem.keyIndicator);
                          const itemMetricCode = toCanonicalMetric(batchItem.metric);

                          const itemCriterionObj =
                            NAAC_CRITERIA_SUMMARY.find(
                              (c) => c.code.toLowerCase() === itemCritCode.toLowerCase()
                            ) || NAAC_CRITERIA_SUMMARY[0];
                          const itemAvailableKis = KEY_INDICATORS.filter(
                            (ki) => ki.criterionCode.toLowerCase() === itemCritCode.toLowerCase()
                          );
                          const itemKiObj =
                            KEY_INDICATORS.find((ki) => ki.code === itemKiCode) ||
                            itemAvailableKis[0];
                          const itemAvailableMetrics = NAAC_METRICS_LIST.filter(
                            (m) => m.criterionCode.toLowerCase() === itemCritCode.toLowerCase()
                          );
                          const itemMetricObj =
                            NAAC_METRICS_LIST.find((m) => m.code === itemMetricCode) ||
                            itemAvailableMetrics[0];

                          const itemReason =
                            batchItem.reason || getAiSuggestion(batchItem.name, batchItem.extractedText).reason;

                          //  Document Nature & Audit Status
                          const itemNature = batchItem.docNature || detectDocNature(batchItem.name);
                          const effectiveAuditChecks = {
                            ...batchItem.auditChecks,
                            hasEmbeddedImages: (batchItem.auditChecks as any)?.hasEmbeddedImages ?? Boolean(batchItem.extractedImage || batchItem.dataUrl?.startsWith('data:image')),
                          };
                          const itemAudit = evaluateDocAudit(batchItem.name, itemNature, effectiveAuditChecks, auditConfig, batchItem.extractedText);

                          return (
                            <React.Fragment key={batchItem.docId}>
                              {/* 1. Main Document & Destination Row */}
                              <tr className="transition-colors align-top hover:bg-slate-50/70 border-b border-slate-100">
                                {/* 1. Document & Nature Distinction */}
                                <td className="py-3 px-3.5">
                                  <div className="flex items-start gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <div className="min-w-0">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openFileInNewTab(batchItem.dataUrl, batchItem.name)
                                        }
                                        className="font-bold text-gray-900 hover:text-blue-600 text-left break-words line-clamp-2 leading-snug cursor-pointer"
                                        title={`Preview ${batchItem.name}`}
                                      >
                                        {batchItem.name}
                                      </button>
                                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        <span className="text-[10px] text-gray-400 font-medium">
                                          {batchItem.size}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        {/* Document Nature Badge (Toggleable) */}
                                        <button
                                          type="button"
                                          onClick={() => toggleItemDocNature(batchItem.docId)}
                                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer border ${
                                            itemNature === 'ground_proof'
                                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                                              : 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100 shadow-2xs'
                                          }`}
                                          title={
                                            itemNature === 'ground_proof'
                                              ? 'Ground Proof: Field photograph, signed attendance, student feedback. Click to toggle.'
                                              : 'Supporting Document: Official institutional notification, circular, syllabus, minutes. Click to toggle.'
                                          }
                                        >
                                          {itemNature === 'ground_proof' ? (
                                            <>
                                               
                                              <span>Ground Proof</span>
                                            </>
                                          ) : (
                                            <>
                                              <FileText className="w-3 h-3 text-indigo-600 shrink-0" />
                                              <span>Supporting Document</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* 2. Criteria & KI */}
                                <td className="py-3 px-3">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="px-2 py-0.5 rounded bg-[#0f2748] text-white font-mono text-[10px] font-bold">
                                        {itemCritCode}
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                                        KI {itemKiCode}
                                      </span>
                                      {!useAi && batchItem.isManualEdit && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold" title="Manually customized for this document">
                                          Custom
                                        </span>
                                      )}
                                    </div>
                                    <p
                                      className="text-[11px] font-semibold text-gray-700 mt-1 line-clamp-2 leading-snug"
                                      title={`${itemCriterionObj.name} — ${itemKiObj?.name || ''}`}
                                    >
                                      {itemKiObj?.name || itemCriterionObj.name}
                                    </p>
                                  </div>
                                </td>

                                {/* 3. Metric */}
                                <td className="py-3 px-3">
                                  <div>
                                    <span className="inline-block px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[11px] font-extrabold">
                                      Metric {itemMetricCode}
                                    </span>
                                    <p
                                      className="text-[11px] font-medium text-gray-600 mt-1 line-clamp-2 leading-snug"
                                      title={itemMetricObj?.name}
                                    >
                                      {itemMetricObj?.name || `Metric ${itemMetricCode}`}
                                    </p>
                                  </div>
                                </td>

                                {/* 4. Edit / Remove Actions */}
                                <td className="py-3 px-3 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingDocModal({
                                          docId: batchItem.docId,
                                          fileName: batchItem.name,
                                          fileSize: batchItem.size,
                                          fileUrl: batchItem.dataUrl,
                                          crit: itemCritCode,
                                          ki: itemKiCode,
                                          metric: itemMetricCode,
                                          aiReason: useAi ? itemReason : undefined,
                                          docNature: itemNature,
                                          extractedText: batchItem.extractedText,
                                          auditChecks: batchItem.auditChecks,
                                        })
                                      }
                                      className="p-1.5 rounded-lg bg-white text-gray-600 border border-gray-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                                      title="Edit Filing Destination"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNaacDocument(batchItem.docId);
                                        const updated = myDocIds.filter(
                                          (id) => id !== batchItem.docId
                                        );
                                        setMyDocIds(updated);
                                        setSelectedDocIds((prev) =>
                                          prev.filter((id) => id !== batchItem.docId)
                                        );
                                        try {
                                          localStorage.setItem(
                                            myDocsStorageKey,
                                            JSON.stringify(updated)
                                          );
                                          localStorage.setItem(
                                            'naac_my_uploaded_doc_ids_prog_cse',
                                            JSON.stringify(updated)
                                          );
                                          localStorage.setItem(
                                            'naac_my_uploaded_doc_ids_program',
                                            JSON.stringify(updated)
                                          );
                                        } catch (err) {
                                          // ignore
                                        }
                                        refreshDocuments();

                                        const remaining = uploadedFilesBatch.filter(
                                          (f) => f.docId !== batchItem.docId
                                        );
                                        setUploadedFilesBatch(remaining);
                                        if (remaining.length > 0) {
                                          const next = remaining[0];
                                          setActiveDocId(next.docId);
                                          setUploadedFile({
                                            name: next.name,
                                            size: next.size,
                                            dataUrl: next.dataUrl,
                                          });
                                          setSelectedCriterionCode(next.crit);
                                          setSelectedKeyIndicatorCode(next.keyIndicator);
                                          setSelectedMetricCode(next.metric);
                                        } else {
                                          setUploadedFile(null);
                                          setActiveDocId(null);
                                          setSelectedCriterionCode('Criterion 1');
                                          setSelectedKeyIndicatorCode('1.1');
                                          setSelectedMetricCode('1.1.1');
                                          setAiSuggestion(null);
                                          setIsChangeOpen(false);
                                          setIsAiBoxOpen(false);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-white text-gray-500 border border-gray-200 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Remove document"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* 2. DEDICATED FULL-WIDTH AI REASONING & NAAC READINESS ROW */}
                              <tr className="bg-slate-50/50 border-b border-gray-200 text-xs">
                                <td colSpan={4} className="py-2.5 px-4 pl-10">
                                  <div className="space-y-2.5">
                                    {/* A. AI Reasoning (Full-Width with High Readability) */}
                                    {useAi && (
                                      <div className="flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed bg-white/80 border border-slate-200/90 rounded-lg p-2.5 shadow-2xs">
                                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                          <span className="font-bold text-[#0f2748] mr-1.5">AI Mapping Reasoning:</span>
                                          <span className="text-slate-700 font-medium leading-relaxed">{itemReason}</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* B. NAAC Readiness Checklist Box (Matching AI Reasoning Card Box) */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white/80 border border-slate-200/90 rounded-lg p-2.5 shadow-2xs text-gray-700">
                                      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
                                        {/* Label & Score */}
                                        <span className="font-bold text-[#0f2748] flex items-center gap-1.5">
                                         
                                          <span>Evidence Audit:</span>
                                          <span className="text-gray-500 font-normal">
                                            {itemAudit.totalChecks > 0 ? `(${itemAudit.score}/${itemAudit.totalChecks})` : '(No checks selected)'}
                                          </span>
                                        </span>

                                        {/* 1. Signature */}
                                        {auditConfig.checkSignature && (
                                          <>
                                            <span className="text-gray-300 hidden sm:inline">|</span>
                                            <button
                                              type="button"
                                              onClick={() => toggleItemAuditCheck(batchItem.docId, 'signature')}
                                              className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-950 py-0.5 px-1 rounded hover:bg-slate-200/50 transition-colors cursor-pointer"
                                              title={itemAudit.signature ? 'Signature: Verified (Click to toggle)' : 'Signature: Missing (Click to toggle)'}
                                            >
                                              <span className="text-gray-700 font-medium">Signature:</span>
                                              {itemAudit.signature ? (
                                                <Check className="w-4.5 h-4.5 text-emerald-600 stroke-[3] shrink-0" />
                                              ) : (
                                                <AlertTriangle className="w-4.5 h-4.5 text-amber-500 fill-amber-50 stroke-[2.5] shrink-0" />
                                              )}
                                            </button>
                                          </>
                                        )}

                                        {/* 2. Stamp */}
                                        {auditConfig.checkStamp && (
                                          <>
                                            <span className="text-gray-300 hidden sm:inline">|</span>
                                            <button
                                              type="button"
                                              onClick={() => toggleItemAuditCheck(batchItem.docId, 'stamp')}
                                              className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-950 py-0.5 px-1 rounded hover:bg-slate-200/50 transition-colors cursor-pointer"
                                              title={itemAudit.stamp ? 'Stamp: Verified (Click to toggle)' : 'Stamp: Missing (Click to toggle)'}
                                            >
                                              <span className="text-gray-700 font-medium">Stamp:</span>
                                              {itemAudit.stamp ? (
                                                <Check className="w-4.5 h-4.5 text-emerald-600 stroke-[3] shrink-0" />
                                              ) : (
                                                <AlertTriangle className="w-4.5 h-4.5 text-amber-500 fill-amber-50 stroke-[2.5] shrink-0" />
                                              )}
                                            </button>
                                          </>
                                        )}

                                        {/* 3. Date */}
                                        {auditConfig.checkDate && (
                                          <>
                                            <span className="text-gray-300 hidden sm:inline">|</span>
                                            <button
                                              type="button"
                                              onClick={() => toggleItemAuditCheck(batchItem.docId, 'date')}
                                              className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-950 py-0.5 px-1 rounded hover:bg-slate-200/50 transition-colors cursor-pointer"
                                              title={itemAudit.date ? 'Date: Verified (Click to toggle)' : 'Date: Missing (Click to toggle)'}
                                            >
                                              <span className="text-gray-700 font-medium">Date:</span>
                                              {itemAudit.date ? (
                                                <Check className="w-4.5 h-4.5 text-emerald-600 stroke-[3] shrink-0" />
                                              ) : (
                                                <AlertTriangle className="w-4.5 h-4.5 text-amber-500 fill-amber-50 stroke-[2.5] shrink-0" />
                                              )}
                                            </button>
                                          </>
                                        )}

                                        {/* 4. Time */}
                                        {auditConfig.checkTime && (
                                          <>
                                            <span className="text-gray-300 hidden sm:inline">|</span>
                                            <button
                                              type="button"
                                              onClick={() => toggleItemAuditCheck(batchItem.docId, 'time')}
                                              className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-950 py-0.5 px-1 rounded hover:bg-slate-200/50 transition-colors cursor-pointer"
                                              title={itemAudit.time ? 'Time: Verified (Click to toggle)' : 'Time: Missing (Click to toggle)'}
                                            >
                                              <span className="text-gray-700 font-medium">Time:</span>
                                              {itemAudit.time ? (
                                                <Check className="w-4.5 h-4.5 text-emerald-600 stroke-[3] shrink-0" />
                                              ) : (
                                                <AlertTriangle className="w-4.5 h-4.5 text-amber-500 fill-amber-50 stroke-[2.5] shrink-0" />
                                              )}
                                            </button>
                                          </>
                                        )}

                                        {/* 5. Letterhead */}
                                        {auditConfig.checkLetterhead && (
                                          <>
                                            <span className="text-gray-300 hidden sm:inline">|</span>
                                            <button
                                              type="button"
                                              onClick={() => toggleItemAuditCheck(batchItem.docId, 'letterhead')}
                                              className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-950 py-0.5 px-1 rounded hover:bg-slate-200/50 transition-colors cursor-pointer"
                                              title={itemAudit.letterhead ? 'Letterhead: Detected (Click to toggle)' : 'Letterhead: Missing (Click to toggle)'}
                                            >
                                              <span className="text-gray-700 font-medium">Letterhead:</span>
                                              {itemAudit.letterhead ? (
                                                <Check className="w-4.5 h-4.5 text-emerald-600 stroke-[3] shrink-0" />
                                              ) : (
                                                <AlertTriangle className="w-4.5 h-4.5 text-amber-500 fill-amber-50 stroke-[2.5] shrink-0" />
                                              )}
                                            </button>
                                          </>
                                        )}
                                     </div>
                                   </div>
                                 </div>
                               </td>
                             </tr>

                             {/* 3. DISTINCT VISUAL SEPARATION BETWEEN MULTIPLE FILES */}
                             {idx < uploadedFilesBatch.length - 1 && (
                               <tr className="h-3.5 bg-slate-100/90 border-y border-slate-200/90" aria-hidden="true">
                                 <td colSpan={4} className="p-0" />
                               </tr>
                             )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}



          {/* OpenAI Pass Key Below Drop Area */}
          {useAi && (
            <div className="flex items-center justify-center pt-3 animate-in fade-in slide-in-from-top-1">
              <div className="inline-flex items-center gap-2.5 bg-white/95 border border-gray-200/90 rounded-full px-4 py-1.5 shadow-2xs text-xs">
                <KeyRound className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="text-gray-600 font-semibold text-[11px] shrink-0">OpenAI API Key:</span>
                <div className="relative flex items-center">
                  <input
                    type={showOpenaiKey ? 'text' : 'password'}
                    value={openaiKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOpenaiKey(val);
                      localStorage.setItem('openai_api_key', val);
                    }}
                    placeholder="sk-..."
                    className="text-xs pl-2.5 pr-7 py-0.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 focus:border-blue-500 rounded-lg outline-hidden font-mono w-[180px] sm:w-[220px] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    className="absolute right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    title={showOpenaiKey ? 'Hide key' : 'Show key'}
                  >
                    {showOpenaiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                {openaiKey.trim() && (
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-bold shrink-0">
                    Key Saved
                  </span>
                )}
                {isAiProcessing && (
                  <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-semibold animate-pulse shrink-0">
                    Analyzing...
                  </span>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
      )}

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

      {/* =========================================================================
          MY DOCUMENTS RIGHT-SIDE DRAWER
          Shows criteria-wise document list with:
          - Submit to Program Coordinator button
          - View Complete Document Repository button
         ========================================================================= */}
      {isMyDocsDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMyDocsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
            <div className="w-screen max-w-3xl bg-white shadow-2xl border-l border-gray-200 flex flex-col pointer-events-auto animate-in slide-in-from-right duration-200">
              {/* Drawer Header: Plain white, no icon, no description */}
              <div className="px-5 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-bold text-gray-900">My Uploaded Documents</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                    {myDocuments.length}
                  </span>
                  {selectedDocIds.length > 0 && (
                    <span className="text-[11px] text-blue-700 font-semibold bg-blue-50/70 border border-blue-200 px-2 py-0.5 rounded-full">
                      {selectedDocIds.length} selected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMyDocsDrawerOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  title="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body: One continuous table */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {myDocuments.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">No documents uploaded yet</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      Drop evidence files on the main screen to ingest them criteria-wise.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMyDocsDrawerOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="mt-4 px-4 py-1.5 bg-[#0f2748] text-white text-xs font-semibold rounded-lg hover:bg-[#183963] cursor-pointer"
                    >
                      Upload File Now
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
         
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
                          <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-2 px-3 w-9 text-center">
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                disabled={unsubmittedDocs.length === 0}
                                onChange={handleToggleSelectAll}
                                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 accent-[#0f2748]"
                                title={
                                  unsubmittedDocs.length === 0
                                    ? 'All documents are already submitted'
                                    : isAllSelected
                                    ? 'Deselect all unsubmitted documents'
                                    : 'Select all unsubmitted documents'
                                }
                              />
                            </th>
                            <th className="py-2 px-3 whitespace-nowrap">Metric</th>
                            <th className="py-2 px-3">File Name</th>
                            <th className="py-2 px-3 text-center whitespace-nowrap">Status</th>
                            <th className="py-2 px-3 text-right whitespace-nowrap">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {NAAC_CRITERIA_SUMMARY.map((crit) => {
                            const docsInCrit = myDocuments.filter((d) => {
                              const canon = toCanonicalCrit(d.criterionCode || '');
                              if (canon) {
                                return canon.toLowerCase() === crit.code.toLowerCase();
                              }
                              return (
                                d.criterionCode?.toLowerCase() === crit.code.toLowerCase() ||
                                d.criterionId === crit.id
                              );
                            });
                            if (docsInCrit.length === 0) return null;

                            const unsubmittedInCrit = docsInCrit.filter((d) => !isDocSubmitted(d));
                            const isCritSelected =
                              unsubmittedInCrit.length > 0 &&
                              unsubmittedInCrit.every((d) => selectedDocIds.includes(d.id));

                            return (
                              <React.Fragment key={crit.code}>
                                {/* Criterion Group Subheader Row with Group Select Checkbox */}
                                <tr className="bg-slate-50/80 border-y border-slate-200/80">
                                  <td className="py-1.5 px-3 text-center align-middle">
                                    <input
                                      type="checkbox"
                                      checked={isCritSelected}
                                      disabled={unsubmittedInCrit.length === 0}
                                      onChange={() => handleToggleSelectCriterion(docsInCrit)}
                                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 accent-[#0f2748]"
                                      title={
                                        unsubmittedInCrit.length === 0
                                          ? 'All documents in this criterion are submitted'
                                          : isCritSelected
                                          ? `Deselect all in ${crit.code}`
                                          : `Select all in ${crit.code}`
                                      }
                                    />
                                  </td>
                                  <td colSpan={4} className="py-1.5 px-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-mono text-[10px] font-bold text-[#0f2748] bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                          {crit.code}
                                        </span>
                                        <span className="text-[11px] font-bold text-gray-800 truncate" title={crit.name}>
                                          {crit.name}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                                        {docsInCrit.length} {docsInCrit.length === 1 ? 'doc' : 'docs'}
                                      </span>
                                    </div>
                                  </td>
                                </tr>

                                {/* Documents under this Criterion: Checkbox -> Metric -> File Name -> Status -> Action */}
                                {docsInCrit.map((doc) => {
                                  const isChecked = selectedDocIds.includes(doc.id);
                                  const isSubmitted = isDocSubmitted(doc);

                                  return (
                                    <tr
                                      key={doc.id}
                                      className={`hover:bg-blue-50/30 transition-colors group ${
                                        isChecked ? 'bg-blue-50/20' : ''
                                      }`}
                                    >
                                      {/* 1. Checkbox */}
                                      <td className="py-2 px-3 text-center align-middle">
                                        <input
                                          type="checkbox"
                                          checked={!isSubmitted && isChecked}
                                          disabled={isSubmitted}
                                          onChange={() => !isSubmitted && handleToggleSelectDoc(doc.id)}
                                          className={`w-3.5 h-3.5 rounded shrink-0 transition-opacity ${
                                            isSubmitted
                                              ? 'opacity-25 cursor-not-allowed bg-gray-200 accent-gray-400'
                                              : 'text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0f2748]'
                                          }`}
                                          title={isSubmitted ? 'Already submitted' : `Select "${doc.fileName}"`}
                                        />
                                      </td>

                                      {/* 2. Metric (FIRST) */}
                                      <td className="py-2 px-3 align-middle whitespace-nowrap">
                                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                          {doc.metricCode}
                                        </span>
                                      </td>

                                      {/* 3. File Name (single clean line, no subtitle) */}
                                      <td className="py-2 px-3 align-middle">
                                        <div
                                          onClick={() => openFileInNewTab(doc.fileUrl)}
                                          className="font-medium text-gray-800 group-hover:text-blue-700 cursor-pointer truncate text-xs"
                                          title={doc.fileName}
                                        >
                                          {doc.fileName}
                                        </div>
                                        {doc.coordinatorReviewStatus === 'changes_requested' && doc.coordinatorFeedback && (
                                          <div className="text-[10px] text-amber-700 font-medium truncate mt-0.5" title={doc.coordinatorFeedback}>
                                            <span className="font-bold">Note:</span> {doc.coordinatorFeedback}
                                          </div>
                                        )}
                                      </td>

                                      {/* 4. Status: 4-Tier Workflow */}
                                      <td className="py-2 px-3 align-middle text-center whitespace-nowrap">
                                        {doc.status === 'draft' || !doc.status ? (
                                          <span 
                                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                              doc.coordinatorReviewStatus === 'changes_requested'
                                                ? 'text-amber-800 bg-amber-100/90 border border-amber-300'
                                                : 'text-amber-700 bg-amber-50 border border-amber-200'
                                            }`}
                                            title={doc.coordinatorFeedback ? `Revision requested: "${doc.coordinatorFeedback}"` : 'Draft evidence'}
                                          >
                                            {doc.coordinatorReviewStatus === 'changes_requested' ? 'Changes Requested' : 'Draft'}
                                          </span>
                                        ) : doc.status === 'submitted_to_program' ? (
                                          <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full" title="Submitted to Program Coordinator">
                                            Submitted to Program Coordinator
                                          </span>
                                        ) : doc.status === 'submitted_to_school' ? (
                                          <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full" title="Submitted to School Coordinator">
                                            Submitted to School Coordinator
                                          </span>
                                        ) : (
                                          <span className="inline-block text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full" title="Submitted to University Coordinator">
                                            Submitted to University Coordinator
                                          </span>
                                        )}
                                      </td>

                                      {/* 5. Action */}
                                      <td className="py-2 px-3 align-middle text-right whitespace-nowrap">
                                        <div className="inline-flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => openFileInNewTab(doc.fileUrl)}
                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                                            title="View Document"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={isSubmitted}
                                            onClick={() => !isSubmitted && handleDeleteMyDoc(doc.id, doc.fileName || doc.title)}
                                            className={`p-1 rounded transition-colors ${
                                              isSubmitted
                                                ? 'opacity-20 cursor-not-allowed text-gray-300'
                                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                                            }`}
                                            title={isSubmitted ? 'Submitted documents cannot be deleted' : 'Delete from My Documents'}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}

                          {/* Fallback for documents with non-standard criteria */}
                          {(() => {
                            const standardCritCodes = new Set(NAAC_CRITERIA_SUMMARY.map((c) => c.code.toLowerCase()));
                            const otherDocs = myDocuments.filter((d) => {
                              const canon = toCanonicalCrit(d.criterionCode || '');
                              if (canon && standardCritCodes.has(canon.toLowerCase())) return false;
                              return !NAAC_CRITERIA_SUMMARY.some(
                                (c) => c.code.toLowerCase() === d.criterionCode?.toLowerCase() || c.id === d.criterionId
                              );
                            });
                            if (otherDocs.length === 0) return null;

                            const unsubmittedInOther = otherDocs.filter((d) => !isDocSubmitted(d));
                            const isOtherSelected =
                              unsubmittedInOther.length > 0 &&
                              unsubmittedInOther.every((d) => selectedDocIds.includes(d.id));

                            return (
                              <React.Fragment key="other-criteria">
                                <tr className="bg-slate-50/80 border-y border-slate-200/80">
                                  <td className="py-1.5 px-3 text-center align-middle">
                                    <input
                                      type="checkbox"
                                      checked={isOtherSelected}
                                      disabled={unsubmittedInOther.length === 0}
                                      onChange={() => handleToggleSelectCriterion(otherDocs)}
                                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 accent-[#0f2748]"
                                      title={
                                        unsubmittedInOther.length === 0
                                          ? 'All additional documents are submitted'
                                          : isOtherSelected
                                          ? 'Deselect all additional documents'
                                          : 'Select all additional documents'
                                      }
                                    />
                                  </td>
                                  <td colSpan={4} className="py-1.5 px-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-gray-800">Additional Ingested Evidence</span>
                                      <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                        {otherDocs.length} {otherDocs.length === 1 ? 'doc' : 'docs'}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                                {otherDocs.map((doc) => {
                                  const isChecked = selectedDocIds.includes(doc.id);
                                  const isSubmitted = isDocSubmitted(doc);
                                  return (
                                    <tr key={doc.id} className={`hover:bg-blue-50/30 transition-colors group ${isChecked ? 'bg-blue-50/20' : ''}`}>
                                      <td className="py-2 px-3 text-center align-middle">
                                        <input
                                          type="checkbox"
                                          checked={!isSubmitted && isChecked}
                                          disabled={isSubmitted}
                                          onChange={() => !isSubmitted && handleToggleSelectDoc(doc.id)}
                                          className={`w-3.5 h-3.5 rounded shrink-0 transition-opacity ${
                                            isSubmitted
                                              ? 'opacity-25 cursor-not-allowed bg-gray-200 accent-gray-400'
                                              : 'text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0f2748]'
                                          }`}
                                          title={isSubmitted ? 'Already submitted' : `Select "${doc.fileName}"`}
                                        />
                                      </td>
                                      <td className="py-2 px-3 align-middle whitespace-nowrap">
                                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                          {doc.metricCode || '1.1.1'}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 align-middle">
                                        <div
                                          onClick={() => openFileInNewTab(doc.fileUrl)}
                                          className="font-medium text-gray-800 group-hover:text-blue-700 cursor-pointer truncate text-xs"
                                          title={doc.fileName}
                                        >
                                          {doc.fileName}
                                        </div>
                                        {doc.coordinatorReviewStatus === 'changes_requested' && doc.coordinatorFeedback && (
                                          <div className="text-[10px] text-amber-700 font-medium truncate mt-0.5" title={doc.coordinatorFeedback}>
                                            <span className="font-bold">Note:</span> {doc.coordinatorFeedback}
                                          </div>
                                        )}
                                      </td>
                                      <td className="py-2 px-3 align-middle text-center whitespace-nowrap">
                                        {doc.status === 'draft' || !doc.status ? (
                                          <span 
                                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                              doc.coordinatorReviewStatus === 'changes_requested'
                                                ? 'text-amber-800 bg-amber-100/90 border border-amber-300'
                                                : 'text-amber-700 bg-amber-50 border border-amber-200'
                                            }`}
                                            title={doc.coordinatorFeedback ? `Revision requested: "${doc.coordinatorFeedback}"` : 'Draft evidence'}
                                          >
                                            {doc.coordinatorReviewStatus === 'changes_requested' ? 'Changes Requested' : 'Draft'}
                                          </span>
                                        ) : doc.status === 'submitted_to_program' ? (
                                          <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full" title="Submitted to Program Coordinator">
                                            Submitted to Program Coordinator
                                          </span>
                                        ) : doc.status === 'submitted_to_school' ? (
                                          <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full" title="Submitted to School Coordinator">
                                            Submitted to School Coordinator
                                          </span>
                                        ) : (
                                          <span className="inline-block text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full" title="Submitted to University Coordinator">
                                            Submitted to University Coordinator
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 px-3 align-middle text-right whitespace-nowrap">
                                        <div className="inline-flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => openFileInNewTab(doc.fileUrl)}
                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                                            title="View Document"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={isSubmitted}
                                            onClick={() => !isSubmitted && handleDeleteMyDoc(doc.id, doc.fileName || doc.title)}
                                            className={`p-1 rounded transition-colors ${
                                              isSubmitted
                                                ? 'opacity-20 cursor-not-allowed text-gray-300'
                                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                                            }`}
                                            title={isSubmitted ? 'Submitted documents cannot be deleted' : 'Delete from My Documents'}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-gray-200 shrink-0">
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  {/* 1. Submit Action Button */}
                  <button
                    type="button"
                    onClick={handleSubmitToCoordinator}
                    disabled={selectedDocIds.length === 0}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0f2748] hover:bg-[#183963] active:scale-[0.99] shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    title={
                      selectedDocIds.length === 0
                        ? `Select at least one document to submit to ${submitTargetLabel}`
                        : `Submit ${selectedDocIds.length} selected document(s) to ${submitTargetLabel}`
                    }
                  >
                    <Send className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                    <span>
                      Submit to {submitTargetLabel}
                      {selectedDocIds.length > 0 ? ` (${selectedDocIds.length})` : ''}
                    </span>
                  </button>

                  {/* 2. View Program Repository / Close Action Button */}
                  {role === 'faculty' ? (
                    <button
                      type="button"
                      onClick={() => setIsMyDocsDrawerOpen(false)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleViewCompleteRepository}
                      className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-slate-100 hover:text-gray-900 border border-gray-300 shadow-2xs active:scale-[0.99] transition-all cursor-pointer"
                      title="Close drawer and navigate to the full Program Repository table"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View Program Repository</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Filing Destination & Evidence Audit Slide-over Right Drawer */}
      {editingDocModal && (() => {
        const modalNature = editingDocModal.docNature || 'supporting_doc';
        const modalAudit = evaluateDocAudit(
          editingDocModal.fileName,
          modalNature,
          editingDocModal.auditChecks,
          auditConfig,
          editingDocModal.extractedText
        );

        const auditChecklistItems = [
          {
            key: 'signature',
            label: 'Institutional Signature',
            icon: '✍️',
            active: Boolean(auditConfig.checkSignature),
            verified: modalAudit.signature,
            verifiedMsg: 'Authorized faculty or administrative signature detected.',
            missingMsg: 'Missing authorized signature endorsement on document.',
          },
          {
            key: 'stamp',
            label: 'Official Seal / Rubber Stamp',
            icon: '💮',
            active: Boolean(auditConfig.checkStamp),
            verified: modalAudit.stamp,
            verifiedMsg: 'Official college/department seal or stamp verified.',
            missingMsg: 'No institutional rubber seal or stamp detected.',
          },
          {
            key: 'date',
            label: 'Document Date / Academic Cycle',
            icon: '📅',
            active: Boolean(auditConfig.checkDate),
            verified: modalAudit.date,
            verifiedMsg: 'Explicit date or academic year identified.',
            missingMsg: 'Document does not state an explicit date or year.',
          },
          {
            key: 'time',
            label: 'Event Time / Timestamp',
            icon: '⏱️',
            active: Boolean(auditConfig.checkTime),
            verified: modalAudit.time,
            verifiedMsg: 'Meeting time or authentic timestamp recorded.',
            missingMsg: 'Event timing or timestamp watermark not recorded.',
          },
          {
            key: 'letterhead',
            label: 'College Letterhead',
            icon: '🏛️',
            active: Boolean(auditConfig.checkLetterhead),
            verified: modalAudit.letterhead,
            verifiedMsg: 'Official college letterhead header verified.',
            missingMsg: 'Official institutional letterhead header not detected.',
          },
        ];

        return (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
            {/* Click backdrop to close */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => setEditingDocModal(null)}
              aria-label="Close backdrop"
            />

            {/* Slide-over Right Drawer (Expanded Width & Uncrowded Airy Layout) */}
            <div className="relative w-full max-w-xl md:max-w-2xl h-full bg-white shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-300 z-10 text-left">
              {/* FIXED HEADER */}
              <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  Edit Destination & Audit
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingDocModal(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors shrink-0"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SCROLLABLE BODY */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* AI Reasoning (Collapsible Pill/Accordion to save vertical space) */}
                {editingDocModal.aiReason && (
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => setIsDrawerAiReasonOpen((prev) => !prev)}
                      className="w-full px-3.5 py-2 flex items-center justify-between text-left font-semibold text-amber-900 hover:bg-amber-100/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                          AI Mapping Reason
                        </span>
                        {!isDrawerAiReasonOpen && (
                          <span className="text-gray-500 font-normal truncate max-w-[320px] text-[11px]">
                            — {editingDocModal.aiReason}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-amber-700 shrink-0 transition-transform duration-200 ${
                          isDrawerAiReasonOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isDrawerAiReasonOpen && (
                      <div className="px-3.5 pb-2.5 pt-1 text-gray-700 leading-relaxed text-[11.5px] border-t border-amber-200/50 bg-amber-50/30">
                        {editingDocModal.aiReason}
                      </div>
                    )}
                  </div>
                )}

                {/* 1. Destination Hierarchy (Criterion & KI 2-Col Grid, Metric Below) */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        1. Criterion
                      </label>
                      <select
                        value={editingDocModal.crit}
                        onChange={(e) => {
                          const nextCrit = toCanonicalCrit(e.target.value);
                          const kis = KEY_INDICATORS.filter(
                            (k) => k.criterionCode.toLowerCase() === nextCrit.toLowerCase()
                          );
                          const nextKi = kis[0]?.code || '1.1';
                          const metrics = NAAC_METRICS_LIST.filter(
                            (m) => m.criterionCode.toLowerCase() === nextCrit.toLowerCase()
                          );
                          const nextMetric =
                            metrics.find((m) => m.code.startsWith(nextKi))?.code ||
                            metrics[0]?.code ||
                            '1.1.1';
                          setEditingDocModal({
                            ...editingDocModal,
                            crit: nextCrit,
                            ki: nextKi,
                            metric: nextMetric,
                          });
                        }}
                        className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                      >
                        {NAAC_CRITERIA_SUMMARY.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}: {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        2. Key Indicator
                      </label>
                      <select
                        value={editingDocModal.ki}
                        onChange={(e) => {
                          const nextKi = toCanonicalKi(e.target.value);
                          const metrics = NAAC_METRICS_LIST.filter(
                            (m) =>
                              m.criterionCode.toLowerCase() ===
                              editingDocModal.crit.toLowerCase()
                          );
                          const nextMetric =
                            metrics.find((m) => m.code.startsWith(nextKi))?.code ||
                            metrics[0]?.code ||
                            '1.1.1';
                          setEditingDocModal({
                            ...editingDocModal,
                            ki: nextKi,
                            metric: nextMetric,
                          });
                        }}
                        className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                      >
                        {KEY_INDICATORS.filter(
                          (k) =>
                            k.criterionCode.toLowerCase() ===
                            editingDocModal.crit.toLowerCase()
                        ).map((ki) => (
                          <option key={ki.code} value={ki.code}>
                            KI {ki.code}: {ki.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      3. Metric Destination
                    </label>
                    <select
                      value={editingDocModal.metric}
                      onChange={(e) => {
                        const nextMetric = toCanonicalMetric(e.target.value);
                        const parts = nextMetric.split('.');
                        const parentKi =
                          parts.length >= 2 ? `${parts[0]}.${parts[1]}` : editingDocModal.ki;
                        setEditingDocModal({
                          ...editingDocModal,
                          ki: parentKi,
                          metric: nextMetric,
                        });
                      }}
                      className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                    >
                      {NAAC_METRICS_LIST.filter(
                        (m) =>
                          m.criterionCode.toLowerCase() ===
                          editingDocModal.crit.toLowerCase()
                      ).map((m) => (
                        <option key={m.code} value={m.code}>
                          {m.code} ({m.metricType}) — {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Document Nature (Plain Radio Buttons) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      4. Document Nature
                    </label>
 
                  </div>
                  <div className="flex items-center gap-6 py-1">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="drawerDocNature"
                        value="supporting_doc"
                        checked={modalNature === 'supporting_doc'}
                        onChange={() =>
                          setEditingDocModal({
                            ...editingDocModal,
                            docNature: 'supporting_doc',
                          })
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Supporting Document</span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="drawerDocNature"
                        value="ground_proof"
                        checked={modalNature === 'ground_proof'}
                        onChange={() =>
                          setEditingDocModal({
                            ...editingDocModal,
                            docNature: 'ground_proof',
                          })
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Ground Proof</span>
                    </label>
                  </div>
                </div>

                {/* 3. Evidence Audit Results (Clean List) */}
                <div className="pt-3 border-t border-gray-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                   
                    <span className="text-xs font-bold text-gray-800">
                      5. Evidence Audit
                    </span>
                  </div>

                  {/* Clean, Compact Row-by-Row Audit Status Items */}
                  <div className="bg-slate-50/70 rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {auditChecklistItems.map((item) => (
                      <div
                        key={item.key}
                        className={`px-3.5 py-2 flex items-center justify-between transition-colors ${
                          !item.active ? 'opacity-50 bg-slate-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="text-sm shrink-0">{item.icon}</span>
                          <span className="text-xs font-semibold text-gray-800 truncate">
                            {item.label}
                          </span>
                        </div>

                        <div className="shrink-0">
                          {!item.active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200">
                              Skipped
                            </span>
                          ) : item.verified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold text-amber-800 bg-amber-100/70 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Missing</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FIXED FOOTER */}
              <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingDocModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateBatchItemDestination(
                      editingDocModal.docId,
                      editingDocModal.crit,
                      editingDocModal.ki,
                      editingDocModal.metric
                    );
                    const critObj = NAAC_CRITERIA_SUMMARY.find(
                      (c) =>
                        c.code.toLowerCase() === editingDocModal.crit.toLowerCase()
                    );
                    const metricObj = NAAC_METRICS_LIST.find(
                      (m) => m.code === editingDocModal.metric
                    );
                    const modalNature = editingDocModal.docNature || 'supporting_doc';
                    const modalAudit = evaluateDocAudit(
                      editingDocModal.fileName,
                      modalNature,
                      editingDocModal.auditChecks,
                      auditConfig,
                      editingDocModal.extractedText
                    );

                    setUploadedFilesBatch((prev) =>
                      prev.map((item) =>
                        item.docId === editingDocModal.docId
                          ? {
                              ...item,
                              crit: editingDocModal.crit,
                              keyIndicator: editingDocModal.ki,
                              metric: editingDocModal.metric,
                              docNature: modalNature,
                              auditChecks: editingDocModal.auditChecks,
                              isManualEdit: true,
                            }
                          : item
                      )
                    );

                    addOrUpdateNaacDocument({
                      id: editingDocModal.docId,
                      criterionCode: editingDocModal.crit,
                      criterionId: critObj?.id || 'crit-1',
                      keyIndicatorCode: editingDocModal.ki,
                      metricCode: editingDocModal.metric,
                      metricName:
                        metricObj?.name || `${editingDocModal.metric} Evidence Proof`,
                      docNature: modalNature,
                      readinessScore: `${modalAudit.score}/${modalAudit.totalChecks}`,
                      readinessPassed: modalAudit.isReady,
                      readinessChecks: {
                        signature: modalAudit.signature,
                        stamp: modalAudit.stamp,
                        date: modalAudit.date,
                        time: modalAudit.time,
                        letterhead: modalAudit.letterhead,
                        cycleYear: modalAudit.cycleYear,
                        geotag: modalAudit.geotag,
                        notes: modalAudit.notes,
                      },
                    });
                    refreshDocuments();
                    setSuccessToast(
                      `Updated "${editingDocModal.fileName}" destination & evidence audit checks!`
                    );
                    setTimeout(() => setSuccessToast(null), 3500);
                    setEditingDocModal(null);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1d4ed8] hover:bg-blue-800 shadow-2xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};