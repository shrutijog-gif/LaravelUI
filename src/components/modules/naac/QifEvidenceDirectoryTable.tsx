import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  Layers,
  Sparkles,
  Copy,
  Pencil,
  ExternalLink,
  Trash2,
  X,
  Search,
  Plus,
  Upload,
  CheckCircle2,
  Check,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import {
  NaacEvidenceDocument,
  getStoredNaacDocuments,
  addOrUpdateNaacDocument,
  deleteNaacDocument,
  NAAC_CRITERIA_SUMMARY,
  NAAC_METRICS_LIST,
  KEY_INDICATORS,
  SAMPLE_PDF_URL
} from '../../../data/naacDmsData';
import { openFileInNewTab, generateCompiledNaacIndexPdfDataUrl } from '../../../utils/fileHelper';

interface QifEvidenceDirectoryTableProps {
  cycleId: string;
  cycleNumber: string;
  yearFrom: string;
  yearTo: string;
  initialCriterionCode?: string;
}

export const QifEvidenceDirectoryTable: React.FC<QifEvidenceDirectoryTableProps> = ({
  cycleId,
  cycleNumber,
  yearFrom,
  yearTo,
  initialCriterionCode,
}) => {
  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() => getStoredNaacDocuments());
  const [searchQuery, setSearchQuery] = useState('');
  const [criterionFilter, setCriterionFilter] = useState<string>(initialCriterionCode || 'ALL');
  const [showEmptyMetrics, setShowEmptyMetrics] = useState<boolean>(true);

  // Hierarchy expand / collapse state
  const [expandedCrits, setExpandedCrits] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = { 'Criterion 1': true };
    if (initialCriterionCode && initialCriterionCode !== 'ALL') {
      init[initialCriterionCode] = true;
    }
    return init;
  });
  const [expandedKis, setExpandedKis] = useState<Record<string, boolean>>({
    '1.1': true,
  });
  const [expandedMetrics, setExpandedMetrics] = useState<Record<string, boolean>>({
    '1.1.1': true,
    '1.1.2': true,
    '1.1.3': true,
  });

  // Multi-selection state
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Drag and drop states
  const [dragOverCrit, setDragOverCrit] = useState<string | null>(null);
  const [dragOverKi, setDragOverKi] = useState<string | null>(null);
  const [dragOverMetric, setDragOverMetric] = useState<string | null>(null);
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [recentlyAddedDocIds, setRecentlyAddedDocIds] = useState<string[]>([]);

  // Popover states
  const [openCompiledPopoverId, setOpenCompiledPopoverId] = useState<string | null>(null);
  const [openAiPopoverId, setOpenAiPopoverId] = useState<string | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compile PDF Modal State
  const [compilePdfModal, setCompilePdfModal] = useState<{
    crit: string;
    ki: string;
    metric: string;
    fileName: string;
    sourceDocs: NaacEvidenceDocument[];
  } | null>(null);

  // Edit Filing Target Modal State
  const [editingDocModal, setEditingDocModal] = useState<{
    docId: string;
    fileName: string;
    crit: string;
    ki: string;
    metric: string;
    aiReason?: string;
  } | null>(null);

  // Upload Evidence Document Modal State
  const [uploadModalState, setUploadModalState] = useState<{
    crit: string;
    ki: string;
    metric: string;
    file: File | null;
  } | null>(null);
  const [isModalDropDragging, setIsModalDropDragging] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  const openUploadModal = (targetCrit?: string, targetKi?: string, targetMetric?: string) => {
    const finalCrit = targetCrit || (criterionFilter !== 'ALL' ? criterionFilter : 'Criterion 1');
    const kis = KEY_INDICATORS.filter(
      (k) => k.criterionCode.toLowerCase() === finalCrit.toLowerCase()
    );
    const finalKi = targetKi || kis[0]?.code || '1.1';
    const metrics = NAAC_METRICS_LIST.filter(
      (m) => m.criterionCode.toLowerCase() === finalCrit.toLowerCase()
    );
    const finalMetric =
      targetMetric ||
      metrics.find((m) => m.code.startsWith(finalKi))?.code ||
      metrics[0]?.code ||
      '1.1.1';

    setUploadModalState({
      crit: finalCrit,
      ki: finalKi,
      metric: finalMetric,
      file: null,
    });
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetTarget, setUploadTargetTarget] = useState<{ crit: string; ki: string; metric: string } | null>(null);

  // Canonical format helpers
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

  // Sync documents with localStorage
  const refreshDocuments = () => {
    setDocuments(getStoredNaacDocuments());
  };

  useEffect(() => {
    window.addEventListener('naac-dms-updated', refreshDocuments);
    window.addEventListener('storage', refreshDocuments);
    return () => {
      window.removeEventListener('naac-dms-updated', refreshDocuments);
      window.removeEventListener('storage', refreshDocuments);
    };
  }, []);

  // Update criterion filter if prop changes
  useEffect(() => {
    if (initialCriterionCode) {
      setCriterionFilter(initialCriterionCode);
      if (initialCriterionCode !== 'ALL') {
        setExpandedCrits((prev) => ({ ...prev, [initialCriterionCode]: true }));
      }
    }
  }, [initialCriterionCode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Process and save newly uploaded file
  const processAndSaveFile = (file: File, targetCritCode: string, targetMetricCode: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || SAMPLE_PDF_URL;
      const canonicalCrit = toCanonicalCrit(targetCritCode);
      const canonicalMetric = toCanonicalMetric(targetMetricCode);
      const critObj = NAAC_CRITERIA_SUMMARY.find(
        (c) => c.code.toLowerCase() === canonicalCrit.toLowerCase()
      ) || NAAC_CRITERIA_SUMMARY[0];
      const metricObj = NAAC_METRICS_LIST.find((m) => m.code === canonicalMetric);
      const parts = canonicalMetric.split('.');
      const kiCode = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : '1.1';

      const newDocId = `naac-qif-doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newDoc: Partial<NaacEvidenceDocument> = {
        id: newDocId,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        description: `Evidence document filed to ${canonicalCrit} › KI ${kiCode} › Metric ${canonicalMetric}`,
        fileName: file.name,
        fileUrl: dataUrl,
        fileSize: `${Math.max(0.4, Number((file.size / (1024 * 1024)).toFixed(1)))} MB`,
        academicYear: yearFrom ? `${yearFrom}-${yearTo.slice(-2)}` : '2024-25',
        criterionId: critObj.id,
        criterionCode: critObj.code,
        keyIndicatorCode: kiCode,
        metricCode: canonicalMetric,
        metricName: metricObj?.name || `Metric ${canonicalMetric} Proof`,
        metricType: metricObj?.metricType || 'QnM',
        status: 'university_verified',
        uploadedBy: 'Accreditation Coordinator',
        uploadedAt: new Date().toISOString().split('T')[0],
        cycleId: cycleId,
      };

      addOrUpdateNaacDocument(newDoc);
      refreshDocuments();
      setRecentlyAddedDocIds((prev) => [...prev, newDocId]);
      setTimeout(() => {
        setRecentlyAddedDocIds((prev) => prev.filter((id) => id !== newDocId));
      }, 4500);
      setExpandedCrits((prev) => ({ ...prev, [critObj.code]: true }));
      setExpandedKis((prev) => ({ ...prev, [kiCode]: true }));
      setExpandedMetrics((prev) => ({ ...prev, [canonicalMetric]: true }));
      showToast(`Uploaded & filed to ${critObj.code} › KI ${kiCode} › Metric ${canonicalMetric}: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Handle single or multiple file upload
  const handleFilesSelected = (files: File[], targetCrit?: string, targetKi?: string, targetMetric?: string) => {
    if (files.length === 0) return;
    const finalCrit = targetCrit || (criterionFilter !== 'ALL' ? criterionFilter : 'Criterion 1');
    const finalKi = targetKi || '1.1';
    let finalMetric = targetMetric;
    if (!finalMetric) {
      const match = NAAC_METRICS_LIST.find((m) => m.code.startsWith(finalKi));
      finalMetric = match ? match.code : '1.1.1';
    }

    files.forEach((file) => {
      processAndSaveFile(file, finalCrit, finalMetric);
    });
  };

  // Drop handlers

  const handleCritDrop = (e: React.DragEvent, critCode: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCrit(null);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    if (files.length === 0) return;
    const matchingMetric = NAAC_METRICS_LIST.find(
      (m) => m.criterionCode.toLowerCase() === critCode.toLowerCase()
    )?.code || '1.1.1';
    handleFilesSelected(files, critCode, undefined, matchingMetric);
  };

  const handleKiDrop = (e: React.DragEvent, critCode: string, kiCode: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKi(null);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    if (files.length === 0) return;
    const matchingMetric = NAAC_METRICS_LIST.find((m) => m.code.startsWith(kiCode))?.code || `${kiCode}.1`;
    handleFilesSelected(files, critCode, kiCode, matchingMetric);
  };

  const handleMetricDrop = (e: React.DragEvent, critCode: string, kiCode: string, metricCode: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverMetric(null);
    setDragCursorPos(null);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    if (files.length === 0) return;
    handleFilesSelected(files, critCode, kiCode, metricCode);
  };

  // Filter documents by cycle & search
  const filteredDocuments = documents.filter((doc) => {
    if (cycleId && doc.cycleId && doc.cycleId !== cycleId) {
      return false;
    }

    if (criterionFilter !== 'ALL') {
      if (toCanonicalCrit(doc.criterionCode || 'Criterion 1') !== criterionFilter) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (doc.fileName || doc.title || '').toLowerCase().includes(q);
      const matchCrit = (doc.criterionCode || '').toLowerCase().includes(q);
      const matchMetric = (doc.metricCode || '').toLowerCase().includes(q);
      const matchUploader = (doc.uploadedBy || '').toLowerCase().includes(q);
      return matchName || matchCrit || matchMetric || matchUploader;
    }

    return true;
  });

  // Calculate completeness stats for Gap Analysis badge
  const activeMetricsInScope = NAAC_METRICS_LIST.filter(
    (m) => criterionFilter === 'ALL' || m.criterionCode.toLowerCase() === criterionFilter.toLowerCase()
  );
  const coveredMetricCodes = new Set(
    filteredDocuments.map((d) => toCanonicalMetric(d.metricCode || '1.1.1'))
  );
  const totalMetricsInScope = activeMetricsInScope.length;
  const totalCoveredInScope = activeMetricsInScope.filter((m) => coveredMetricCodes.has(m.code)).length;
  const coveragePercent = totalMetricsInScope > 0 ? Math.round((totalCoveredInScope / totalMetricsInScope) * 100) : 0;

  // Handle Delete
  const handleDelete = (docId: string, docName: string) => {
    if (window.confirm(`Are you sure you want to delete "${docName}" from NAAC Evidence?`)) {
      deleteNaacDocument(docId);
      refreshDocuments();
      setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
      showToast(`Removed evidence: ${docName}`);
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            handleFilesSelected(
              files,
              uploadTargetTarget?.crit,
              uploadTargetTarget?.ki,
              uploadTargetTarget?.metric
            );
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
          setUploadTargetTarget(null);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50">
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-xl shadow-xl flex items-center justify-between text-xs font-semibold gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-800 hover:text-emerald-950 p-1 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Hierarchy Card matching Filed NAAC Evidence Directory (Flat continuous table) */}
      <div className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-2xs">
        {/* Search, Expand/Collapse, Empty Metric Toggle & Criterion Filter Bar */}
        <div className="p-3.5 border-b border-gray-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name, criterion, or metric (e.g. 1.1.2 or Syllabus)..."
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
                  const allMets: Record<string, boolean> = {};
                  NAAC_CRITERIA_SUMMARY.forEach((c) => {
                    allCrits[c.code] = true;
                  });
                  KEY_INDICATORS.forEach((k) => {
                    allKis[k.code] = true;
                  });
                  NAAC_METRICS_LIST.forEach((m) => {
                    allMets[m.code] = true;
                  });
                  setExpandedCrits(allCrits);
                  setExpandedKis(allKis);
                  setExpandedMetrics(allMets);
                }}
                className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:text-blue-700 hover:bg-white rounded-md transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => {
                  setExpandedCrits({});
                  setExpandedKis({});
                  setExpandedMetrics({});
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
                    setExpandedCrits((prev) => ({ ...prev, [val]: true }));
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

            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold whitespace-nowrap shrink-0">
              {filteredDocuments.length} Documents
            </span>

            {/* Direct Upload Document Button */}
            <button
              type="button"
              onClick={() => openUploadModal()}
              className="px-3.5 py-1.5 bg-[#1d4ed8] hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer inline-flex items-center gap-1.5 transition-all hover:shadow active:scale-95 shrink-0"
              title="Upload and file new evidence document"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Selection Action Bar for "Compile as One PDF" */}
        {selectedDocIds.length > 0 && (
          <div className="px-4 py-2.5 bg-blue-50/90 border-b border-blue-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1d4ed8] text-white text-xs font-bold">
                {selectedDocIds.length} Selected
              </span>
              <span className="text-xs font-medium text-blue-950">
                Select multiple evidence files to merge into a single PDF with a shareable NAAC SSR Portal link.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDocIds([])}
                className="px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg cursor-pointer transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  const selectedDocs = filteredDocuments.filter((d) =>
                    selectedDocIds.includes(d.id)
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
                <span>Compile as One PDF ({selectedDocIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* 4-Tier Tree Structure: Criterion -> Key Indicator -> Metric Header -> Documents with Tree Guides */}
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

            const isCritExpanded =
              Boolean(searchQuery.trim()) ||
              Boolean(expandedCrits[crit.code]);

            // Registered KIs under this Criterion
            const registeredKisInCrit = KEY_INDICATORS.filter(
              (k) => k.criterionCode.toLowerCase() === crit.code.toLowerCase()
            );

            const isCritDragOver = dragOverCrit === crit.code;

            return (
              <div key={crit.code} className="bg-white">
                {/* TIER 1: CRITERION FOLDER ROW (Solid Slate Bar) */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverCrit(crit.code);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverCrit(null);
                  }}
                  onDrop={(e) => handleCritDrop(e, crit.code)}
                  onClick={() =>
                    setExpandedCrits((prev) => ({
                      ...prev,
                      [crit.code]: !isCritExpanded,
                    }))
                  }
                  className={`px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors border-b ${
                    isCritDragOver
                      ? 'bg-blue-100/90 ring-2 ring-blue-500'
                      : isCritExpanded
                      ? 'bg-slate-100 hover:bg-slate-200/70 border-slate-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isCritExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-700 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <FolderOpen className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {crit.code}: {crit.name}
                    </span>
                    {isCritDragOver && (
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold animate-pulse">
                        Drop to file into {crit.code}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-[11px] font-semibold text-gray-500">
                      {registeredKisInCrit.length}{' '}
                      {registeredKisInCrit.length === 1 ? 'Key Indicator' : 'Key Indicators'}
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

                {/* TIER 2: KEY INDICATORS */}
                {isCritExpanded && (
                  <div className="divide-y divide-gray-100 border-t border-gray-200/80">
                    {registeredKisInCrit.length === 0 ? (
                      <div className="py-4 px-10 text-xs text-gray-400 italic bg-gray-50/40">
                        No indicators registered under {crit.code}.
                      </div>
                    ) : (
                      registeredKisInCrit.map((kiInfo) => {
                        const kiCode = kiInfo.code;
                        const kiDocs = docsInCrit.filter((d) => {
                          const mCode = toCanonicalMetric(d.metricCode || '1.1.1');
                          const kCode = d.keyIndicatorCode || (mCode.split('.').length >= 2 ? `${mCode.split('.')[0]}.${mCode.split('.')[1]}` : '1.1');
                          return kCode === kiCode;
                        });

                        const isKiExpanded =
                          Boolean(searchQuery.trim()) ||
                          Boolean(expandedKis[kiCode]);

                        const kiDocIds = kiDocs.map((d) => d.id);
                        const selectedCountInKi = kiDocIds.filter((id) =>
                          selectedDocIds.includes(id)
                        ).length;
                        const isAllKiSelected =
                          kiDocIds.length > 0 && selectedCountInKi === kiDocIds.length;

                        const isKiDragOver = dragOverKi === kiCode;

                        // Retrieve official NAAC metrics for this Key Indicator
                        const officialMetricsForKi = NAAC_METRICS_LIST.filter(
                          (m) => m.code.startsWith(kiCode + '.') || (kiInfo.metricCodes && kiInfo.metricCodes.includes(m.code))
                        );

                        // Also identify any custom/extra metric codes present in documents
                        const officialCodesSet = new Set(officialMetricsForKi.map((m) => m.code));
                        const extraMetricCodes = Array.from(
                          new Set(
                            kiDocs
                              .map((d) => toCanonicalMetric(d.metricCode || '1.1.1'))
                              .filter((mCode) => !officialCodesSet.has(mCode))
                          )
                        );

                        const allMetricsForKi = [
                          ...officialMetricsForKi,
                          ...extraMetricCodes.map((code) => ({
                            code,
                            name: `Metric ${code} Evidence`,
                            criterionId: crit.id,
                            criterionCode: crit.code,
                            metricType: 'QnM' as const,
                            description: 'Uploaded Supporting Evidence',
                          })),
                        ].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

                        return (
                          <div key={kiCode} className="bg-white">
                            {/* TIER 2: KEY INDICATOR HEADER (Soft Blue Bar, Checkbox at pl-8) */}
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragOverKi(kiCode);
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragOverKi(null);
                              }}
                              onDrop={(e) => handleKiDrop(e, crit.code, kiCode)}
                              onClick={() =>
                                setExpandedKis((prev) => ({
                                  ...prev,
                                  [kiCode]: !isKiExpanded,
                                }))
                              }
                              className={`pl-8 pr-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors border-y ${
                                isKiDragOver
                                  ? 'bg-blue-100/90 ring-2 ring-blue-500'
                                  : isKiExpanded
                                  ? 'bg-blue-50/60 hover:bg-blue-50/90 border-blue-100'
                                  : 'bg-white hover:bg-blue-50/30 border-gray-100'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isAllKiSelected}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (isAllKiSelected) {
                                      setSelectedDocIds((prev) =>
                                        prev.filter((id) => !kiDocIds.includes(id))
                                      );
                                    } else {
                                      setSelectedDocIds((prev) =>
                                        Array.from(new Set([...prev, ...kiDocIds]))
                                      );
                                      setExpandedKis((prev) => ({
                                        ...prev,
                                        [kiCode]: true,
                                      }));
                                    }
                                  }}
                                  disabled={kiDocIds.length === 0}
                                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#1d4ed8] focus:ring-blue-500 accent-[#1d4ed8] cursor-pointer shrink-0 disabled:opacity-30"
                                  title={kiDocIds.length > 0 ? `Select all ${kiDocIds.length} documents in KI ${kiCode}` : 'No documents in this indicator yet'}
                                />
                                {isKiExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                )}
                                <span className="font-mono text-[11px] font-bold text-blue-900 bg-white border border-blue-200 px-2 py-0.5 rounded shadow-2xs shrink-0">
                                  KI {kiCode}
                                </span>
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {kiInfo.name}
                                </span>
                                {isKiDragOver && (
                                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold animate-pulse">
                                    Drop to file into KI {kiCode}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] font-medium text-blue-900/70">
                                  {allMetricsForKi.length} {allMetricsForKi.length === 1 ? 'Metric' : 'Metrics'}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-[11px] font-bold text-blue-800">
                                  {kiDocs.length} {kiDocs.length === 1 ? 'Doc' : 'Docs'}
                                </span>
                              </div>
                            </div>

                            {/* TIER 3 & 4: METRICS & DOCUMENTS */}
                            {isKiExpanded && (
                              <div className="border-t border-gray-100 divide-y divide-gray-100 bg-white">
                                {allMetricsForKi.map((metric) => {
                                  const metricDocs = kiDocs.filter(
                                    (d) => toCanonicalMetric(d.metricCode || '1.1.1') === metric.code
                                  );

                                  // If searching and this metric has 0 docs and query doesn't match metric, hide
                                  if (searchQuery.trim()) {
                                    const q = searchQuery.toLowerCase();
                                    const metricMatches =
                                      metric.code.toLowerCase().includes(q) ||
                                      metric.name.toLowerCase().includes(q);
                                    if (metricDocs.length === 0 && !metricMatches) {
                                      return null;
                                    }
                                  }

                                  // If hiding empty metrics and 0 docs, hide
                                  if (!showEmptyMetrics && metricDocs.length === 0) {
                                    return null;
                                  }

                                  const isMetricExpanded =
                                    Boolean(searchQuery.trim()) ||
                                    expandedMetrics[metric.code] !== false; // default open

                                  const metricDocIds = metricDocs.map((d) => d.id);
                                  const selectedCountInMetric = metricDocIds.filter((id) =>
                                    selectedDocIds.includes(id)
                                  ).length;
                                  const isAllMetricSelected =
                                    metricDocIds.length > 0 &&
                                    selectedCountInMetric === metricDocIds.length;

                                  const isThisMetricDragOver = dragOverMetric === metric.code;

                                  // Sort documents for this metric: Newly added first approach
                                   const sortedMetricDocs = [...metricDocs].sort((a, b) => {
                                     // 1. Newly dropped / uploaded files appear first at the top
                                     const aIsRecent = recentlyAddedDocIds.includes(a.id);
                                     const bIsRecent = recentlyAddedDocIds.includes(b.id);
                                     if (aIsRecent && !bIsRecent) return -1;
                                     if (!aIsRecent && bIsRecent) return 1;

                                     // 2. Compiled master PDFs next
                                     if (a.isCompiledPdf && !b.isCompiledPdf) return -1;
                                     if (!a.isCompiledPdf && b.isCompiledPdf) return 1;

                                     // 3. Newest uploaded date first
                                     const dateA = a.uploadedAt || '';
                                     const dateB = b.uploadedAt || '';
                                     if (dateA !== dateB) {
                                       return dateB.localeCompare(dateA);
                                     }

                                     // 4. Alphabetical fallback
                                     return (a.fileName || a.title).localeCompare(b.fileName || b.title);
                                   });

                                  return (
                                    <div
                                      key={`metric-section-${metric.code}`}
                                      onDragEnter={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDragOverMetric(metric.code);
                                        setDragCursorPos({ x: e.clientX, y: e.clientY });
                                      }}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (dragOverMetric !== metric.code) {
                                          setDragOverMetric(metric.code);
                                        }
                                        setDragCursorPos({ x: e.clientX, y: e.clientY });
                                      }}
                                      className="relative bg-white"
                                    >
                                      {/* Smooth, Flicker-Free Full Metric Drop Overlay (With Center Confirmation Card) */}
                                      {isThisMetricDragOver && (
                                        <div
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDragCursorPos({ x: e.clientX, y: e.clientY });
                                          }}
                                          onDragLeave={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDragOverMetric(null);
                                            setDragCursorPos(null);
                                          }}
                                          onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDragOverMetric(null);
                                            setDragCursorPos(null);
                                            handleMetricDrop(e, crit.code, kiCode, metric.code);
                                          }}
                                          className="absolute inset-0 z-30 bg-blue-50/90 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center p-4 text-blue-950 pointer-events-auto select-none shadow-md backdrop-blur-[1px]"
                                        >
                                          {/* Center of the area confirmation card */}
                                          <div className="px-5 py-3 rounded-xl bg-white border-2 border-blue-500 shadow-xl flex items-center gap-3 text-blue-950 pointer-events-none">
                                            <Upload className="w-5 h-5 text-blue-700 animate-bounce" />
                                            <span className="text-xs sm:text-sm font-bold">
                                              Drop file here to attach to Metric {metric.code}
                                            </span>
                                            <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-300 px-2.5 py-0.5 rounded shadow-2xs">
                                              Release to Upload
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      {/* TIER 3: METRIC SUB-HEADER (Distinct Slate/Gray Bar at pl-12) */}
                                      <div
                                        onClick={() => {
                                          if (metricDocs.length > 0) {
                                            setExpandedMetrics((prev) => ({
                                              ...prev,
                                              [metric.code]: !isMetricExpanded,
                                            }));
                                          }
                                        }}
                                        className={`pl-12 pr-4 py-2 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors border-y ${
                                          isThisMetricDragOver
                                            ? 'bg-blue-100/90 ring-2 ring-blue-500'
                                            : metricDocs.length > 0
                                            ? 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                                            : 'bg-amber-50/70 hover:bg-amber-100/60 border-amber-200/80'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                          <input
                                            type="checkbox"
                                            checked={isAllMetricSelected}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              if (isAllMetricSelected) {
                                                setSelectedDocIds((prev) =>
                                                  prev.filter((id) => !metricDocIds.includes(id))
                                                );
                                              } else {
                                                setSelectedDocIds((prev) =>
                                                  Array.from(new Set([...prev, ...metricDocIds]))
                                                );
                                                setExpandedMetrics((prev) => ({
                                                  ...prev,
                                                  [metric.code]: true,
                                                }));
                                              }
                                            }}
                                            disabled={metricDocIds.length === 0}
                                            className="w-3.5 h-3.5 rounded border-gray-300 text-[#1d4ed8] focus:ring-blue-500 accent-[#1d4ed8] cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                                            title={
                                              metricDocIds.length > 0
                                                ? `Select all ${metricDocIds.length} files in Metric ${metric.code}`
                                                : 'No documents attached'
                                            }
                                          />

                                          {metricDocs.length > 0 ? (
                                            isMetricExpanded ? (
                                              <ChevronDown className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                            ) : (
                                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            )
                                          ) : (
                                            <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0" title="No documents filed under this metric">
                                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                            </span>
                                          )}

                                          <span className="font-mono text-[11px] font-bold text-slate-900 bg-white border border-slate-300 px-2.5 py-0.5 rounded shadow-2xs shrink-0">
                                            Metric {metric.code}
                                          </span>

                                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0">
                                            {metric.metricType}
                                          </span>

                                          {/* FULL METRIC TITLE */}
                                          <span className="text-xs font-bold text-slate-800 truncate" title={metric.name}>
                                            {metric.name}
                                          </span>

                                          {metricDocs.length === 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold shrink-0 shadow-2xs">
                                              <AlertCircle className="w-3 h-3 text-amber-700" />
                                              <span>No Evidence Attached</span>
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          

                                          {/* Direct Add button */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openUploadModal(crit.code, kiCode, metric.code);
                                            }}
                                            className="px-2.5 py-1 bg-[#1d4ed8] hover:bg-blue-800 text-white rounded-md text-[11px] font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer transition-all hover:shadow active:scale-95 shrink-0"
                                            title={`Upload evidence specifically for Metric ${metric.code}`}
                                          >
                                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                            <span>Add</span>
                                          </button>

                                          {/* Compile button if multiple selected */}
                                          {selectedCountInMetric > 1 && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const selectedInMetricDocs = sortedMetricDocs.filter((d) =>
                                                  selectedDocIds.includes(d.id)
                                                );
                                                if (selectedInMetricDocs.length === 0) return;
                                                setCompilePdfModal({
                                                  crit: crit.code,
                                                  ki: kiCode,
                                                  metric: metric.code,
                                                  fileName: `Metric_${metric.code.replace(/\./g, '_')}_Compiled_SSR_Evidence_${selectedInMetricDocs.length}Files.pdf`,
                                                  sourceDocs: selectedInMetricDocs,
                                                });
                                              }}
                                              className="px-2 py-0.5 bg-[#1d4ed8] hover:bg-blue-800 text-white text-[11px] font-bold rounded shadow-2xs cursor-pointer inline-flex items-center gap-1 transition-colors"
                                            >
                                              <Layers className="w-3 h-3" />
                                              <span>Compile ({selectedCountInMetric})</span>
                                            </button>
                                          )}

                                          <span
                                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                                              metricDocs.length > 0
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                            }`}
                                          >
                                            {metricDocs.length} {metricDocs.length === 1 ? 'Doc' : 'Docs'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* TIER 4: DOCUMENTS (Droppable Zone with VS Code Tree Guide Line) */}
                                      {isMetricExpanded && sortedMetricDocs.length > 0 && (
                                        <div className="relative divide-y divide-gray-100 bg-white">
                                          {/* Subtle VS Code Vertical Tree Guide Line */}
                                          <div className="absolute left-[3.25rem] top-0 bottom-0 w-px bg-slate-300 pointer-events-none" />


                                          {sortedMetricDocs.map((doc) => {
                                              const isAiUploaded = Boolean(
                                                doc.aiAutoFiled || doc.aiReason
                                              );
                                              const isPopoverOpen = openAiPopoverId === doc.id;
                                              const isCompiledPopoverOpen =
                                                openCompiledPopoverId === doc.id;
                                              const isDocChecked = selectedDocIds.includes(doc.id);
                                              const isRecentlyAdded = recentlyAddedDocIds.includes(doc.id);

                                              return (
                                                <div
                                                  key={doc.id}
                                                  className={`pl-16 pr-4 py-2 flex items-center justify-between gap-3 text-xs transition-all duration-1000 ${
                                                    isRecentlyAdded
                                                      ? 'bg-emerald-50/90 border-y border-emerald-300 ring-1 ring-emerald-400'
                                                      : doc.isCompiledPdf
                                                      ? 'bg-blue-50/40 hover:bg-blue-50/60'
                                                      : isDocChecked
                                                      ? 'bg-blue-50/25 hover:bg-blue-50/40'
                                                      : 'bg-white hover:bg-blue-50/30'
                                                  }`}
                                                >
                                                  {/* Tree Connector + Checkbox + File Format Badge + Filename + Size */}
                                                  <div className="flex items-center gap-2.5 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
                                                    <input
                                                      type="checkbox"
                                                      checked={isDocChecked}
                                                      onChange={() => {
                                                        setSelectedDocIds((prev) =>
                                                          prev.includes(doc.id)
                                                            ? prev.filter((id) => id !== doc.id)
                                                            : [...prev, doc.id]
                                                        );
                                                      }}
                                                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#1d4ed8] focus:ring-blue-500 accent-[#1d4ed8] cursor-pointer shrink-0"
                                                    />

                                                    {/* Metric Number Badge */}
                                                    <span
                                                      className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50/80 border border-blue-200/90 px-2 py-0.5 rounded shadow-2xs shrink-0"
                                                      title={`Metric ${toCanonicalMetric(doc.metricCode || metric.code)}`}
                                                    >
                                                      {toCanonicalMetric(doc.metricCode || metric.code)}
                                                    </span>

                                                    <FileText className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                                                    
                                                    {/* Filename with distinct file link styling */}
                                                    <span
                                                      onClick={() => openFileInNewTab(doc.fileUrl)}
                                                      className={`font-medium hover:text-blue-700 hover:underline cursor-pointer truncate max-w-md ${
                                                        doc.isCompiledPdf
                                                          ? 'text-blue-950 font-bold'
                                                          : 'text-slate-800'
                                                      }`}
                                                      title={doc.fileName || doc.title}
                                                    >
                                                      {doc.fileName || doc.title}
                                                    </span>

                                                    {isRecentlyAdded && (
                                                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold animate-pulse inline-flex items-center gap-1 shrink-0">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                        <span>Just Added</span>
                                                      </span>
                                                    )}

                                                    {/* File Size badge */}
                                                    <span className="text-[10px] text-slate-400 font-normal shrink-0">
                                                      ({doc.fileSize || '1.8 MB'})
                                                    </span>

                                                    {/* Compiled PDF Badge + Popover */}
                                                    {doc.isCompiledPdf && (
                                                      <div className="relative group inline-block shrink-0">
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenCompiledPopoverId(
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

                                                    {/* Interactive AI Filed Badge */}
                                                    {isAiUploaded && doc.aiReason && (
                                                      <div className="relative group inline-block shrink-0">
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenAiPopoverId(
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
                                                                  setOpenAiPopoverId(null);
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
                                                          showToast(`Copied document link: ${docShareUrl}`);
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
                                                            crit: crit.code,
                                                            ki: kiCode,
                                                            metric: metric.code,
                                                            aiReason: isAiUploaded
                                                              ? doc.aiReason
                                                              : undefined,
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
                        {m.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium">
                Generates Index PDF with working NAAC links
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCompilePdfModal(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalFileName =
                      compilePdfModal.fileName.trim().endsWith('.pdf')
                        ? compilePdfModal.fileName.trim()
                        : `${compilePdfModal.fileName.trim()}.pdf`;

                    const compiledDocId = `compiled-${Date.now()}`;
                    const portalUrl = `${window.location.origin}/?naacDoc=${encodeURIComponent(
                      compiledDocId
                    )}&file=${encodeURIComponent(finalFileName)}`;

                    const critObj = NAAC_CRITERIA_SUMMARY.find(
                      (c) =>
                        c.code.toLowerCase() ===
                        compilePdfModal.crit.toLowerCase()
                    );
                    const metricObj = NAAC_METRICS_LIST.find(
                      (m) => m.code === compilePdfModal.metric
                    );
                    const cycleLabel = `${cycleNumber} (${yearFrom} to ${yearTo})`;

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
                      uploadedBy: 'IQAC Coordinator',
                      uploadedAt: new Date().toISOString().split('T')[0],
                      status: 'university_verified',
                      cycleId: cycleId,
                      isCompiledPdf: true,
                      compiledSourceFiles: compilePdfModal.sourceDocs.map(
                        (d) => d.fileName || d.title
                      ),
                      naacPortalUrl: portalUrl,
                    });

                    navigator.clipboard?.writeText(portalUrl);
                    refreshDocuments();
                    setExpandedCrits((prev) => ({
                      ...prev,
                      [compilePdfModal.crit]: true,
                    }));
                    setExpandedKis((prev) => ({
                      ...prev,
                      [compilePdfModal.ki]: true,
                    }));
                    setExpandedMetrics((prev) => ({
                      ...prev,
                      [compilePdfModal.metric]: true,
                    }));
                    setSelectedDocIds([]);
                    setCompilePdfModal(null);
                    openFileInNewTab(generatedPdfDataUrl, finalFileName);
                    showToast(
                      `Compiled Index PDF (${kbSize} KB) generated & NAAC link copied!`
                    );
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1d4ed8] hover:bg-blue-800 shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Generate Compiled PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Filing Destination Popup Modal */}
      {editingDocModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 text-left">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Edit Filing Destination
                </h3>
                <p className="text-xs text-gray-500 truncate max-w-sm mt-0.5">
                  {editingDocModal.fileName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingDocModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Criterion Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  1. Target Criterion
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
                  className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {NAAC_CRITERIA_SUMMARY.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}: {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Key Indicator Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
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
                  className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-indigo-500 cursor-pointer"
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

              {/* Metric Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  3. Specific Metric
                </label>
                <select
                  value={editingDocModal.metric}
                  onChange={(e) => {
                    const nextMetric = toCanonicalMetric(e.target.value);
                    const parts = nextMetric.split('.');
                    const parentKi =
                      parts.length >= 2
                        ? `${parts[0]}.${parts[1]}`
                        : editingDocModal.ki;
                    setEditingDocModal({
                      ...editingDocModal,
                      ki: parentKi,
                      metric: nextMetric,
                    });
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-indigo-500 cursor-pointer"
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

            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingDocModal(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const critObj = NAAC_CRITERIA_SUMMARY.find(
                    (c) =>
                      c.code.toLowerCase() ===
                      editingDocModal.crit.toLowerCase()
                  );
                  const metricObj = NAAC_METRICS_LIST.find(
                    (m) => m.code === editingDocModal.metric
                  );
                  addOrUpdateNaacDocument({
                    id: editingDocModal.docId,
                    criterionCode: editingDocModal.crit,
                    criterionId: critObj?.id || 'crit-1',
                    keyIndicatorCode: editingDocModal.ki,
                    metricCode: editingDocModal.metric,
                    metricName:
                      metricObj?.name ||
                      `${editingDocModal.metric} Evidence Proof`,
                  });
                  refreshDocuments();
                  showToast(
                    `Updated destination to ${editingDocModal.crit} › KI ${editingDocModal.ki} › Metric ${editingDocModal.metric}`
                  );
                  setEditingDocModal(null);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1d4ed8] hover:bg-blue-800 shadow-2xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Evidence Document Popup Modal */}
      {uploadModalState && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 text-left">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Upload NAAC Evidence Document
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    File evidence under Criterion, Key Indicator, and Metric
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalState(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Criterion Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  1. Target Criterion
                </label>
                <select
                  value={uploadModalState.crit}
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
                    setUploadModalState({
                      ...uploadModalState,
                      crit: nextCrit,
                      ki: nextKi,
                      metric: nextMetric,
                    });
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-blue-500 cursor-pointer"
                >
                  {NAAC_CRITERIA_SUMMARY.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}: {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Key Indicator Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  2. Key Indicator (KI)
                </label>
                <select
                  value={uploadModalState.ki}
                  onChange={(e) => {
                    const nextKi = toCanonicalKi(e.target.value);
                    const metrics = NAAC_METRICS_LIST.filter(
                      (m) =>
                        m.criterionCode.toLowerCase() ===
                        uploadModalState.crit.toLowerCase()
                    );
                    const nextMetric =
                      metrics.find((m) => m.code.startsWith(nextKi))?.code ||
                      metrics[0]?.code ||
                      '1.1.1';
                    setUploadModalState({
                      ...uploadModalState,
                      ki: nextKi,
                      metric: nextMetric,
                    });
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-blue-500 cursor-pointer"
                >
                  {KEY_INDICATORS.filter(
                    (k) =>
                      k.criterionCode.toLowerCase() ===
                      uploadModalState.crit.toLowerCase()
                  ).map((ki) => (
                    <option key={ki.code} value={ki.code}>
                      KI {ki.code}: {ki.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Metric Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  3. Metric
                </label>
                <select
                  value={uploadModalState.metric}
                  onChange={(e) => {
                    const nextMetric = toCanonicalMetric(e.target.value);
                    const parts = nextMetric.split('.');
                    const parentKi =
                      parts.length >= 2
                        ? `${parts[0]}.${parts[1]}`
                        : uploadModalState.ki;
                    setUploadModalState({
                      ...uploadModalState,
                      ki: parentKi,
                      metric: nextMetric,
                    });
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-blue-500 cursor-pointer"
                >
                  {NAAC_METRICS_LIST.filter(
                    (m) =>
                      m.criterionCode.toLowerCase() ===
                      uploadModalState.crit.toLowerCase()
                  ).map((m) => (
                    <option key={m.code} value={m.code}>
                      Metric {m.code} ({m.metricType}) — {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Attachment Area */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  4. Select Evidence File (PDF)
                </label>
                <input
                  ref={modalFileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      setUploadModalState((prev) => (prev ? { ...prev, file } : null));
                    }
                    if (modalFileInputRef.current) modalFileInputRef.current.value = '';
                  }}
                />

                {!uploadModalState.file ? (
                  <div
                    onClick={() => modalFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsModalDropDragging(true);
                    }}
                    onDragLeave={() => setIsModalDropDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsModalDropDragging(false);
                      const file = Array.from(e.dataTransfer.files).find((f) =>
                        f.name.toLowerCase().endsWith('.pdf')
                      );
                      if (file) {
                        setUploadModalState((prev) => (prev ? { ...prev, file } : null));
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isModalDropDragging
                        ? 'border-blue-600 bg-blue-50/80 shadow-inner'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50/40 bg-gray-50/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        Click to browse or drop your PDF here
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Accepts standard PDF documents up to 25 MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-blue-200 bg-blue-50/70 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {uploadModalState.file.name}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {(uploadModalState.file.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to file
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setUploadModalState((prev) => (prev ? { ...prev, file: null } : null))
                      }
                      className="p-1 text-gray-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUploadModalState(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!uploadModalState.file}
                onClick={() => {
                  if (!uploadModalState.file) return;
                  processAndSaveFile(
                    uploadModalState.file,
                    uploadModalState.crit,
                    uploadModalState.metric
                  );
                  setUploadModalState(null);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1d4ed8] hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer inline-flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload &amp; File Evidence</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating Cursor Drop Tooltip (Follows mouse directly under the document being held) */}
      {dragOverMetric && dragCursorPos && (
        <div
          style={{
            position: 'fixed',
            left: dragCursorPos.x + 16,
            top: dragCursorPos.y + 24,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-900/95 text-white text-xs font-bold shadow-2xl border border-blue-400 flex items-center gap-2 select-none pointer-events-none animate-in fade-in zoom-in-95 duration-100"
        >
          <Upload className="w-3.5 h-3.5 text-blue-400 animate-bounce shrink-0" />
          <span>Dropping into Metric {dragOverMetric}</span>
        </div>
      )}
    </div>
  );
};
