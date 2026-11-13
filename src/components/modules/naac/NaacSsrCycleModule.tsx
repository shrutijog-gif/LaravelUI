import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Pencil,
  Layers,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  BookOpen,
  Upload,
  FolderPlus,
  Search,
  ArrowUp,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Building2,
  ShieldCheck,
  Globe,
  FileText,
  Send,
  Check,
  RotateCcw,
  Users,
  SlidersHorizontal
} from 'lucide-react';
import {
  NAAC_CRITERIA_SUMMARY,
  KEY_INDICATORS,
  NAAC_METRICS_LIST,
  ITM_SCHOOLS,
  type NaacEvidenceDocument,
  type NaacWorkflowStatus,
  type NaacSsrCycle,
  type NaacHierarchyMode,
  type NaacSimRole,
  HIERARCHY_CONFIGS,
  getStoredNaacDocuments,
  addOrUpdateNaacDocument,
  getStoredNaacCycles,
  saveNaacCycles,
  getTenantDefaultHierarchyMode,
  setTenantHierarchyMode,
  getActiveNaacRole,
  setActiveNaacRole,
} from '../../../data/naacDmsData';
import { getActiveTenant, CollegeTenant } from '../../../data/tenantData';
import { openFileInNewTab } from '../../../utils/fileHelper';
import { NaacQuickUploadLanding } from './NaacQuickUploadLanding';
import { ExtendedProfileWorkspace } from './ExtendedProfileWorkspace';
import { DvvClarificationsWorkspace } from './DvvClarificationsWorkspace';
import { QifEvidenceDirectoryTable } from './QifEvidenceDirectoryTable';

interface NaacSsrCycleModuleProps {
  mode?: 'ssr' | 'aqar';
  onNavigateToAllocation?: () => void;
  initialCycleId?: string | null;
  onSelectCycle?: (cycleId: string | null) => void;
}

interface CmsVirtualFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentFolder: string;
  dateModified: string;
  size: string;
  fileUrl: string;
}

const DEFAULT_CMS_FILES: CmsVirtualFile[] = [
  {
    id: 'fld-2025-29',
    name: '2025-29',
    type: 'folder',
    parentFolder: 'SSR',
    dateModified: '2026-10-26 15:36:36',
    size: '0 B',
    fileUrl: '',
  },
  {
    id: 'fl-sample-1',
    name: 'sample.pdf',
    type: 'file',
    parentFolder: 'SSR',
    dateModified: '2026-10-26 15:36:31',
    size: '18.37 KB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'fl-sample-bos',
    name: 'BoS_Signed_Minutes_2025_26.pdf',
    type: 'file',
    parentFolder: 'SSR',
    dateModified: '2026-10-28 11:20:15',
    size: '1.42 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'fl-sample-feedback',
    name: 'Curriculum_Action_Taken_Report_ATR.pdf',
    type: 'file',
    parentFolder: 'SSR',
    dateModified: '2026-10-30 09:45:10',
    size: '840 KB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
];

// Key Indicator weightages matching screenshot 5.png
const KEY_INDICATOR_WEIGHTAGES: Record<string, number> = {
  '1.1': 20,
  '1.2': 30,
  '1.3': 30,
  '1.4': 20,
  '2.1': 20,
  '2.2': 15,
  '2.3': 20,
  '2.4': 20,
  '2.5': 15,
  '2.6': 30,
  '2.7': 30,
  '3.1': 20,
  '3.2': 15,
  '3.3': 25,
  '3.4': 20,
  '3.5': 20,
  '4.1': 30,
  '4.2': 20,
  '4.3': 30,
  '4.4': 20,
  '5.1': 25,
  '5.2': 25,
  '5.3': 25,
  '5.4': 25,
  '6.1': 15,
  '6.2': 15,
  '6.3': 25,
  '6.4': 20,
  '6.5': 25,
  '7.1': 50,
  '7.2': 30,
  '7.3': 20,
};

export const NaacSsrCycleModule: React.FC<NaacSsrCycleModuleProps> = ({
  mode = 'ssr',
  onNavigateToAllocation,
  initialCycleId,
  onSelectCycle,
}) => {
  const [tenant, setTenant] = useState<CollegeTenant>(() => getActiveTenant());
  const [hierarchyMode, setHierarchyMode] = useState<NaacHierarchyMode>(() =>
    getTenantDefaultHierarchyMode(getActiveTenant().id)
  );
  const [activeRole, setActiveRole] = useState<NaacSimRole>(() => getActiveNaacRole());

  // Cycles & Navigation State
  // Screen 1: 'cycle-list' (2.png) -> Screen 2: 'cycle-overview' (4.png) -> Screen 3: 'criterion-detail' (5.png)
  const [cycles, setCycles] = useState<NaacSsrCycle[]>(() => getStoredNaacCycles());
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(initialCycleId ?? null);
  const [selectedCriterionCode, setSelectedCriterionCode] = useState<string | null>(null);
  const [cycleActiveTab, setCycleActiveTab] = useState<'quick_drop' | 'qif' | 'extended_profile' | 'dvv' | 'ssr_report'>('quick_drop');

  useEffect(() => {
    if (initialCycleId !== undefined) {
      setSelectedCycleId(initialCycleId);
      setSelectedCriterionCode(null);
      setCycleActiveTab('quick_drop');
    }
  }, [initialCycleId]);

  const handleChooseCycle = (cycleId: string | null) => {
    setSelectedCycleId(cycleId);
    setSelectedCriterionCode(null);
    setCycleActiveTab('quick_drop');
    if (onSelectCycle) {
      onSelectCycle(cycleId);
    }
  };

  // Initiate / Edit Cycle Drawer State (3.png)
  const [isCycleDrawerOpen, setIsCycleDrawerOpen] = useState<boolean>(false);
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);
  const [cycleNumberInput, setCycleNumberInput] = useState<string>('NAAC Cycle 1');
  const [yearFromInput, setYearFromInput] = useState<string>('2024-25');
  const [yearToInput, setYearToInput] = useState<string>('2028-29');

  // Inside Cycle (4.png) State
  const [isSsrSectionOpen, setIsSsrSectionOpen] = useState<boolean>(true);
  const [isAiBarExpanded, setIsAiBarExpanded] = useState<boolean>(true);

  // Inside Criterion (5.png) State
  const [expandedKeyIndicators, setExpandedKeyIndicators] = useState<Record<string, boolean>>({
    '1.1': true,
    '1.2': true,
  });
  const [expandedMetrics, setExpandedMetrics] = useState<Record<string, boolean>>({
    '1.1.1': true,
    '1.2.1': true,
  });
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('ALL');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Add Files Modal State (6.png)
  const [addFilesModalMetric, setAddFilesModalMetric] = useState<{
    criterionCode: string;
    keyIndicatorCode: string;
    metricCode: string;
    metricName: string;
  } | null>(null);
  const [cmsFiles, setCmsFiles] = useState<CmsVirtualFile[]>(() => {
    try {
      const saved = localStorage.getItem('cms_naac_virtual_files_v1');
      return saved ? JSON.parse(saved) : DEFAULT_CMS_FILES;
    } catch {
      return DEFAULT_CMS_FILES;
    }
  });
  const [currentFolder, setCurrentFolder] = useState<string>('SSR');
  const [selectedModalFileIds, setSelectedModalFileIds] = useState<string[]>([]);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const ssrReportInputRef = useRef<HTMLInputElement>(null);

  // Documents State
  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() => getStoredNaacDocuments());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    const syncAll = () => {
      const activeT = getActiveTenant();
      setTenant(activeT);
      setHierarchyMode(getTenantDefaultHierarchyMode(activeT.id));
      setActiveRole(getActiveNaacRole());
      setDocuments(getStoredNaacDocuments());
      setCycles(getStoredNaacCycles());
    };
    window.addEventListener('tenant-changed', syncAll);
    window.addEventListener('naac-dms-updated', syncAll);
    window.addEventListener('naac-role-changed', syncAll);
    window.addEventListener('naac-hierarchy-changed', syncAll);
    window.addEventListener('naac-cycles-updated', syncAll);
    window.addEventListener('storage', syncAll);
    return () => {
      window.removeEventListener('tenant-changed', syncAll);
      window.removeEventListener('naac-dms-updated', syncAll);
      window.removeEventListener('naac-role-changed', syncAll);
      window.removeEventListener('naac-hierarchy-changed', syncAll);
      window.removeEventListener('naac-cycles-updated', syncAll);
      window.removeEventListener('storage', syncAll);
    };
  }, []);

  const currentHierarchyConfig = HIERARCHY_CONFIGS[hierarchyMode];
  const activeRoleMeta =
    currentHierarchyConfig.roles.find((r) => r.id === activeRole) ||
    currentHierarchyConfig.roles[currentHierarchyConfig.roles.length - 1];

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || cycles[0] || null;

  // Handle Initiate / Save Cycle (3.png)
  const handleOpenInitiateDrawer = (cycleToEdit?: NaacSsrCycle) => {
    if (cycleToEdit) {
      setEditingCycleId(cycleToEdit.id);
      setCycleNumberInput(cycleToEdit.cycleNumber);
      setYearFromInput(cycleToEdit.yearFrom);
      setYearToInput(cycleToEdit.yearTo);
    } else {
      setEditingCycleId(null);
      setCycleNumberInput(`NAAC Cycle ${cycles.length + 1}`);
      setYearFromInput('2024-25');
      setYearToInput('2028-29');
    }
    setIsCycleDrawerOpen(true);
  };

  const handleSaveCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleNumberInput || !yearFromInput || !yearToInput) return;

    if (editingCycleId) {
      const updated = cycles.map((c) =>
        c.id === editingCycleId
          ? { ...c, cycleNumber: cycleNumberInput, yearFrom: yearFromInput, yearTo: yearToInput }
          : c
      );
      setCycles(updated);
      saveNaacCycles(updated);
      showToast(`Updated ${cycleNumberInput} (${yearFromInput} to ${yearToInput})`);
    } else {
      const newCycle: NaacSsrCycle = {
        id: `cycle-${Date.now()}`,
        cycleNumber: cycleNumberInput,
        yearFrom: yearFromInput,
        yearTo: yearToInput,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      const updated = [...cycles, newCycle];
      setCycles(updated);
      saveNaacCycles(updated);
      showToast(`Initiated ${cycleNumberInput} : ${yearFromInput} to ${yearToInput}`);
    }
    setIsCycleDrawerOpen(false);
  };

  const handleDeleteCycle = (id: string) => {
    if (cycles.length <= 1) {
      showToast('At least one active NAAC Cycle is required.');
      return;
    }
    const updated = cycles.filter((c) => c.id !== id);
    setCycles(updated);
    saveNaacCycles(updated);
    if (selectedCycleId === id) {
      handleChooseCycle(null);
    }
    showToast('Cycle removed.');
  };

  // Handle Role Workflow Status Progression inside a Metric
  const handleWorkflowAction = (
    doc: NaacEvidenceDocument,
    action: 'submit' | 'approve' | 'request_changes' | 'publish_direct'
  ) => {
    let nextStatus: NaacWorkflowStatus = doc.status;

    if (action === 'request_changes') {
      nextStatus = 'changes_requested';
    } else if (action === 'publish_direct') {
      nextStatus = 'university_verified';
    } else if (action === 'submit') {
      // Faculty or lower level submitting upward
      if (hierarchyMode === 'direct_iqac') {
        nextStatus = 'submitted_to_university';
      } else {
        nextStatus = 'submitted_to_program';
      }
    } else if (action === 'approve') {
      if (activeRole === 'program') {
        // If 4-tier university_schools, forward to school; if 3-tier college_departments, forward straight to IQAC
        nextStatus =
          hierarchyMode === 'university_schools' ? 'submitted_to_school' : 'submitted_to_university';
      } else if (activeRole === 'school') {
        nextStatus = 'submitted_to_university';
      } else if (activeRole === 'university') {
        nextStatus = 'university_verified';
      } else {
        nextStatus = 'submitted_to_program';
      }
    }

    const updatedDoc: NaacEvidenceDocument = {
      ...doc,
      status: nextStatus,
      ...(activeRole === 'program' ? { coordinatorReviewStatus: action === 'request_changes' ? 'changes_requested' : 'compiled' } : {}),
      ...(activeRole === 'school' ? { schoolReviewedBy: activeRoleMeta.personName, schoolReviewedAt: new Date().toISOString() } : {}),
      ...(activeRole === 'university' || nextStatus === 'university_verified'
        ? { universityVerifiedBy: activeRoleMeta.personName, universityVerifiedAt: new Date().toISOString() }
        : {}),
    };

    addOrUpdateNaacDocument(updatedDoc);
    setDocuments(getStoredNaacDocuments());

    if (nextStatus === 'university_verified') {
      showToast(`"${doc.fileName || doc.title}" approved & published live to Public Website!`);
    } else if (nextStatus === 'changes_requested') {
      showToast(`Revision requested on "${doc.fileName || doc.title}".`);
    } else {
      showToast(`"${doc.fileName || doc.title}" approved & forwarded to next hierarchy level.`);
    }
  };

  // Filter documents by current role & selected filters
  const getFilteredMetricDocs = (metricCode: string) => {
    return documents.filter((d) => {
      if (d.metricCode !== metricCode) return false;
      if (selectedSchoolFilter !== 'ALL' && d.schoolId !== selectedSchoolFilter) return false;
      if (selectedProgramFilter !== 'ALL' && d.programId !== selectedProgramFilter) return false;
      if (statusFilter === 'PUBLISHED' && d.status !== 'university_verified') return false;
      if (statusFilter === 'PENDING' && d.status === 'university_verified') return false;
      return true;
    });
  };

  // Handle uploading single or multiple files inside the Add Files Modal (6.png)
  const handleModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl =
          typeof reader.result === 'string' && reader.result.length < 75000
            ? reader.result
            : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        const sizeKb = `${(file.size / 1024).toFixed(2)} KB`;
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

        const newVirtualFile: CmsVirtualFile = {
          id: `fl-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
          name: file.name,
          type: 'file',
          parentFolder: currentFolder,
          dateModified: nowStr,
          size: sizeKb,
          fileUrl: dataUrl,
        };

        setCmsFiles((prev) => {
          const updatedFiles = [newVirtualFile, ...prev];
          localStorage.setItem('cms_naac_virtual_files_v1', JSON.stringify(updatedFiles));
          return updatedFiles;
        });
        setSelectedModalFileIds((prev) => [...prev, newVirtualFile.id]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleCreateFolderInModal = () => {
    if (!newFolderName.trim()) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const folder: CmsVirtualFile = {
      id: `fld-${Date.now()}`,
      name: newFolderName.trim(),
      type: 'folder',
      parentFolder: currentFolder,
      dateModified: nowStr,
      size: '0 B',
      fileUrl: '',
    };
    const updatedFiles = [folder, ...cmsFiles];
    setCmsFiles(updatedFiles);
    localStorage.setItem('cms_naac_virtual_files_v1', JSON.stringify(updatedFiles));
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  // Save selected files from Add Files Modal (6.png) into the active Metric
  const handleSaveModalFilesToMetric = () => {
    if (!addFilesModalMetric) return;
    const selectedFiles = cmsFiles.filter(
      (f) => f.type === 'file' && selectedModalFileIds.includes(f.id)
    );
    if (selectedFiles.length === 0) {
      showToast('Please select at least one file to attach.');
      return;
    }

    const critObj = NAAC_CRITERIA_SUMMARY.find(
      (c) => c.code === addFilesModalMetric.criterionCode
    );

    const initialStatus: NaacWorkflowStatus =
      activeRole === 'university'
        ? 'university_verified'
        : activeRole === 'school'
        ? 'submitted_to_university'
        : activeRole === 'program'
        ? hierarchyMode === 'university_schools'
          ? 'submitted_to_school'
          : 'submitted_to_university'
        : 'submitted_to_program';

    selectedFiles.forEach((f, idx) => {
      const newDoc: NaacEvidenceDocument = {
        id: `naac-cms-${Date.now()}-${idx}`,
        title: f.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        description: `Uploaded under ${addFilesModalMetric.metricCode} (${addFilesModalMetric.metricName})`,
        schoolId: 'sch-tech',
        schoolName:
          hierarchyMode === 'university_schools'
            ? 'School of Technology & Computer Engineering'
            : tenant.name,
        programId: 'prog-cse',
        programName:
          hierarchyMode === 'university_schools'
            ? 'B.Tech Computer Science & Engineering'
            : 'Department of Computer Science',
        academicYear: selectedCycle ? `${selectedCycle.yearFrom}` : '2024-25',
        criterionId: critObj?.id || 'crit-1',
        criterionCode: addFilesModalMetric.criterionCode,
        keyIndicatorCode: addFilesModalMetric.keyIndicatorCode,
        metricCode: addFilesModalMetric.metricCode,
        metricName: addFilesModalMetric.metricName,
        metricType: 'QlM',
        fileUrl: f.fileUrl,
        fileName: f.name,
        fileSize: f.size,
        uploadedBy: `${activeRoleMeta.personName} (${activeRoleMeta.title})`,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: initialStatus,
        version: 'v1.0',
      };
      addOrUpdateNaacDocument(newDoc);
    });

    setDocuments(getStoredNaacDocuments());
    setExpandedMetrics((prev) => ({ ...prev, [addFilesModalMetric.metricCode]: true }));
    showToast(
      `Attached ${selectedFiles.length} file(s) to Metric ${addFilesModalMetric.metricCode}!`
    );
    setAddFilesModalMetric(null);
    setSelectedModalFileIds([]);
  };

  // Status badge helper showing multi-tenant hierarchy progress
  const renderWorkflowBadge = (status: NaacWorkflowStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
            <Clock className="w-3 h-3 text-gray-500" />
            Draft (Faculty)
          </span>
        );
      case 'submitted_to_program':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending {hierarchyMode === 'university_schools' ? 'Program Coord' : 'Dept HOD'} Review
          </span>
        );
      case 'submitted_to_school':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Pending School Coordinator
          </span>
        );
      case 'approved_by_school':
      case 'submitted_to_university':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Clock className="w-3 h-3 text-purple-600" />
            Pending IQAC Final Approval
          </span>
        );
      case 'university_verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Published on Website 🌐
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Revision Requested
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-5 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-xl shadow-xl flex items-center justify-between text-xs font-semibold gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToastMsg(null)} 
            className="text-emerald-700 hover:text-emerald-950 p-0.5 rounded cursor-pointer transition-colors shrink-0"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ===================================================================
          SCREEN 1 (2.png): CYCLE (SSR) - DVV LIST VIEW
      =================================================================== */}
      {!selectedCycleId && !selectedCriterionCode && (
        <div className="space-y-5">
          {/* Breadcrumb matching 2.png */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <Home className="w-3.5 h-3.5 text-gray-500" />
            <span>/</span>
            <span className="text-gray-900 font-bold">
              {mode === 'aqar' ? 'AQAR Cycles' : 'SSR'}
            </span>
          </div>

          {/* Header Bar with "Initiate Cycle" button matching 2.png */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              {mode === 'aqar' ? 'AQAR (Annual Quality Assurance Report)' : 'SSR'}
            </h1>
            <button
              onClick={() => handleOpenInitiateDrawer()}
              className="px-4 py-2 bg-[#1d4ed8] hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Initiate Cycle
            </button>
          </div>

          {/* List of Initiated Cycles matching 2.png */}
          <div className="space-y-3">
            {cycles.map((cycle) => {
              const totalCycleDocs = documents.length;
              const publishedDocs = documents.filter(
                (d) => d.status === 'university_verified'
              ).length;
              const pendingDocs = documents.filter(
                (d) => d.status !== 'university_verified' && d.status !== 'draft'
              ).length;

              return (
                <div
                  key={cycle.id}
                  className="bg-white rounded-xl border border-gray-200/90 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-blue-300 transition-all"
                >
                  <div
                    onClick={() => handleChooseCycle(cycle.id)}
                    className="flex flex-wrap items-center gap-3 cursor-pointer group"
                  >
                    <span className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {cycle.cycleNumber} :{' '}
                      <span className="font-normal text-gray-700">
                        {cycle.yearFrom} to {cycle.yearTo}
                      </span>
                    </span>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        {totalCycleDocs} Total Docs
                      </span>
                      {pendingDocs > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                          {pendingDocs} In Review
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        {publishedDocs} Published on Website
                      </span>
                    </div>
                  </div>

                  {/* Right Action Icons matching 2.png: Edit Pencil, Layers (Open Criteria), Trash */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenInitiateDrawer(cycle)}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
                      title="Edit Cycle"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleChooseCycle(cycle.id)}
                      className="p-2 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                      title="Open SSR Criteria & AI Quick Upload"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCycle(cycle.id)}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-rose-50 hover:border-rose-200 text-gray-700 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Cycle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          SCREEN 2 (4.png): INSIDE A CYCLE -> AI BAR + EXTENDED PROFILE + CRITERIA 1-7
      =================================================================== */}
      {selectedCycleId && !selectedCriterionCode && selectedCycle && (
        <div className="space-y-5">
          {/* Breadcrumb matching 4.png / 5.png */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 flex-wrap">
              <button
                onClick={() => handleChooseCycle(null)}
                className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <span>/</span>
              <button
                onClick={() => handleChooseCycle(null)}
                className="hover:text-blue-600 underline cursor-pointer"
              >
               SSR
              </button>
              <span>/</span>
              <button
                onClick={() => setCycleActiveTab('quick_drop')}
                className="hover:text-blue-600 underline cursor-pointer"
              >
                {selectedCycle.cycleNumber} ({selectedCycle.yearFrom} to {selectedCycle.yearTo})
              </button>
              <span>/</span>
              <span className="text-gray-900 font-bold">
                {cycleActiveTab === 'quick_drop'
                  ? 'Quick Evidence Drop'
                  : cycleActiveTab === 'qif'
                  ? 'Key Indicator Framework'
                  : cycleActiveTab === 'extended_profile'
                  ? 'Extended Profile'
                  : cycleActiveTab === 'dvv'
                  ? 'DVV'
                  : 'SSR Report'}
              </span>
            </div>
          </div>

          {/* Main 5 Cycle Workspace Tabs (Single Line, No Extra Background) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-nowrap">
            <button
              onClick={() => setCycleActiveTab('quick_drop')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                cycleActiveTab === 'quick_drop'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200/90 font-medium shadow-2xs'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${cycleActiveTab === 'quick_drop' ? 'text-amber-300' : 'text-blue-600'}`} />
              <span>Quick Evidence Drop</span>
            </button>

            <button
              onClick={() => setCycleActiveTab('qif')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                cycleActiveTab === 'qif'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200/90 font-medium shadow-2xs'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Key Indicator Framework</span>
            </button>

            <button
              onClick={() => setCycleActiveTab('extended_profile')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                cycleActiveTab === 'extended_profile'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200/90 font-medium shadow-2xs'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Extended Profile</span>
            </button>

            <button
              onClick={() => setCycleActiveTab('dvv')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                cycleActiveTab === 'dvv'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200/90 font-medium shadow-2xs'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>DVV</span>
            </button>

            <button
              onClick={() => setCycleActiveTab('ssr_report')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                cycleActiveTab === 'ssr_report'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200/90 font-medium shadow-2xs'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>SSR Report</span>
            </button>
          </div>

          {/* TAB 1: Quick Evidence Drop */}
          {cycleActiveTab === 'quick_drop' && (
            <NaacQuickUploadLanding
              academicYear={selectedCycle.yearFrom}
              role={activeRole}
              uploaderName={activeRoleMeta.personName}
              schoolId="sch-tech"
              schoolName={
                hierarchyMode === 'university_schools'
                  ? 'School of Technology & Computer Engineering'
                  : tenant.name
              }
              programId="prog-cse"
              programName={activeRoleMeta.unitLabel}
              submitTargetName={
                activeRole === 'faculty'
                  ? hierarchyMode === 'university_schools'
                    ? 'Program Coordinator'
                    : 'Department HOD'
                  : activeRole === 'program'
                  ? hierarchyMode === 'university_schools'
                    ? 'School Coordinator'
                    : 'College IQAC'
                  : activeRole === 'school'
                  ? 'University IQAC'
                  : 'Public Website SSR Archive'
              }
              onNavigateToDocumentList={(critCode) => {
                if (critCode) {
                  setSelectedCriterionCode(critCode);
                } else {
                  setCycleActiveTab('qif');
                }
              }}
            />
          )}

          {/* TAB 2: Key Indicator Framework (Drop-enabled Directory Table) */}
          {cycleActiveTab === 'qif' && (
            <QifEvidenceDirectoryTable
              cycleId={selectedCycle.id}
              cycleNumber={selectedCycle.cycleNumber}
              yearFrom={selectedCycle.yearFrom}
              yearTo={selectedCycle.yearTo}
              initialCriterionCode={selectedCriterionCode || undefined}
            />
          )}

          {/* TAB 2: Extended Profile */}
          {cycleActiveTab === 'extended_profile' && (
            <ExtendedProfileWorkspace
              cycleId={selectedCycle.id}
              cycleNumber={selectedCycle.cycleNumber}
              yearFrom={selectedCycle.yearFrom}
              yearTo={selectedCycle.yearTo}
            />
          )}

          {/* TAB 4: DVV */}
          {cycleActiveTab === 'dvv' && (
            <DvvClarificationsWorkspace
              cycleId={selectedCycle.id}
              cycleNumber={selectedCycle.cycleNumber}
              yearFrom={selectedCycle.yearFrom}
              yearTo={selectedCycle.yearTo}
            />
          )}

          {/* TAB 5: SSR Report */}
          {cycleActiveTab === 'ssr_report' && (
            <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                        {selectedCycle.cycleNumber}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold">
                        {selectedCycle.yearFrom} to {selectedCycle.yearTo}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                       Self-Study Report (SSR)
                    </h3>
 
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                  <input
                    ref={ssrReportInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const updated = cycles.map((c) =>
                        c.id === selectedCycle.id
                          ? {
                              ...c,
                              ssrReportFileName: file.name,
                              ssrReportUrl:
                                'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                            }
                          : c
                      );
                      setCycles(updated);
                      saveNaacCycles(updated);
                      showToast(`Uploaded Master SSR Report: ${file.name}`);
                    }}
                  />
                  {!selectedCycle.ssrReportFileName && (
                    <button
                      onClick={() => ssrReportInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload SSR Report</span>
                    </button>
                  )}
                </div>
              </div>

              {selectedCycle.ssrReportFileName ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-emerald-950 truncate">
                        {selectedCycle.ssrReportFileName}
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        Active Master SSR Report linked to {selectedCycle.cycleNumber} • Verified for Accreditation
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openFileInNewTab(selectedCycle.ssrReportUrl!)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        const docName = selectedCycle.ssrReportFileName || 'SSR Report';
                        if (window.confirm(`Are you sure you want to remove "${docName}" from ${selectedCycle.cycleNumber}?`)) {
                          const updated = cycles.map((c) =>
                            c.id === selectedCycle.id
                              ? { ...c, ssrReportFileName: undefined, ssrReportUrl: undefined }
                              : c
                          );
                          setCycles(updated);
                          saveNaacCycles(updated);
                          showToast(`Removed SSR Report: ${docName}`);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-emerald-300 hover:bg-rose-50 hover:border-rose-300 text-emerald-800 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-8 text-center space-y-2">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto" />
                  <div className="text-xs font-bold text-gray-700">No SSR Report Document Uploaded</div>
                  <p className="text-[11px] text-gray-500 max-w-md mx-auto">
                    Click "Upload SSR Report" to attach the official compiled PDF of the Self-Study Report for this cycle.
                  </p>
                  <button
                    onClick={() => ssrReportInputRef.current?.click()}
                    className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload SSR Report</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          SCREEN 3 (5.png & 6.png): CRITERION DRILL-DOWN (KEY INDICATORS & METRICS)
      =================================================================== */}
      {selectedCriterionCode && selectedCycle && (
        <div className="space-y-5">
          {/* Breadcrumb matching 5.png */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <button
              onClick={() => {
                setSelectedCriterionCode(null);
                handleChooseCycle(null);
              }}
              className="hover:text-blue-600 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <span>/</span>
            <button
              onClick={() => {
                setSelectedCriterionCode(null);
                handleChooseCycle(null);
              }}
              className="hover:text-blue-600 underline cursor-pointer"
            >
             SSR
            </button>
            <span>/</span>
            <button
              onClick={() => setSelectedCriterionCode(null)}
              className="hover:text-blue-600 underline cursor-pointer"
            >
              {selectedCycle.cycleNumber.replace('NAAC ', '')} ({selectedCycle.yearFrom} to{' '}
              {selectedCycle.yearTo})
            </button>
          </div>

          {/* Criterion Header Bar matching 5.png */}
          {(() => {
            const critObj =
              NAAC_CRITERIA_SUMMARY.find((c) => c.code === selectedCriterionCode) ||
              NAAC_CRITERIA_SUMMARY[0];
            const keyIndicators = KEY_INDICATORS.filter(
              (ki) => ki.criterionCode === critObj.code
            );

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                      {critObj.code} - {critObj.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quick Criterion Switcher */}
                    <select
                      value={critObj.code}
                      onChange={(e) => setSelectedCriterionCode(e.target.value)}
                      className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none cursor-pointer"
                    >
                      {NAAC_CRITERIA_SUMMARY.map((c) => (
                        <option key={c.id} value={c.code}>
                          {c.code}: {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      Weightage: 100
                    </span>
                  </div>
                </div>

                {/* Multi-Tenant Unit / Status Filter Bar for Coordinators */}
                {(activeRole === 'school' || activeRole === 'university') && (
                  <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {hierarchyMode === 'university_schools' && activeRole === 'university' && (
                        <select
                          value={selectedSchoolFilter}
                          onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                          className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-800 outline-none cursor-pointer"
                        >
                          <option value="ALL">All 5 Schools</option>
                          {ITM_SCHOOLS.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      )}

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-800 outline-none cursor-pointer"
                      >
                        <option value="ALL">All Workflow Statuses</option>
                        <option value="PENDING">Pending Review / Verification</option>
                        <option value="PUBLISHED">Published on Website</option>
                      </select>
                    </div>

                    <div className="text-xs text-gray-500 font-medium">
                      Viewing as <strong className="text-gray-900">{activeRoleMeta.title}</strong> (
                      {activeRoleMeta.personName})
                    </div>
                  </div>
                )}

                {/* Key Indicator Accordions matching 5.png */}
                <div className="space-y-3.5">
                  {keyIndicators.map((ki) => {
                    const isKiExpanded = Boolean(expandedKeyIndicators[ki.code]);
                    const kiWeightage = KEY_INDICATOR_WEIGHTAGES[ki.code] || 25;
                    const kiMetrics = NAAC_METRICS_LIST.filter((m) =>
                      ki.metricCodes.includes(m.code)
                    );
                    const totalKiDocs = kiMetrics.reduce(
                      (acc, m) => acc + getFilteredMetricDocs(m.code).length,
                      0
                    );

                    return (
                      <div
                        key={ki.code}
                        className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden"
                      >
                        {/* Key Indicator Header Row matching 5.png */}
                        <div
                          onClick={() =>
                            setExpandedKeyIndicators((prev) => ({
                              ...prev,
                              [ki.code]: !prev[ki.code],
                            }))
                          }
                          className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-900">
                              {ki.code} {ki.name}
                            </span>
                            {totalKiDocs > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                {totalKiDocs} {totalKiDocs === 1 ? 'doc' : 'docs'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs sm:text-sm font-bold text-gray-900">
                              Weightage: {kiWeightage}
                            </span>
                            <div className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 bg-white">
                              {isKiExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Key Indicator -> Metrics List matching 6.png background & 8.png */}
                        {isKiExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-3 bg-gray-50/40">
                            {kiMetrics.map((metric) => {
                              const metricDocs = getFilteredMetricDocs(metric.code);
                              const isMetricOpen =
                                expandedMetrics[metric.code] ?? metricDocs.length > 0;

                              return (
                                <div
                                  key={metric.code}
                                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                                >
                                  {/* Metric Bar with Upload (↑) button and Expand Chevron matching 6.png */}
                                  <div className="px-4 py-3 flex items-center justify-between gap-4 bg-gray-50/60">
                                    <div
                                      onClick={() =>
                                        setExpandedMetrics((prev) => ({
                                          ...prev,
                                          [metric.code]: !isMetricOpen,
                                        }))
                                      }
                                      className="flex-1 text-xs sm:text-sm font-semibold text-gray-800 cursor-pointer leading-relaxed"
                                    >
                                      <span className="font-bold text-gray-900">
                                        {metric.code}:
                                      </span>{' '}
                                      {metric.description || metric.name}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {/* Upload Button (opens Add Files Modal 6.png) */}
                                      <button
                                        onClick={() => {
                                          setAddFilesModalMetric({
                                            criterionCode: critObj.code,
                                            keyIndicatorCode: ki.code,
                                            metricCode: metric.code,
                                            metricName: metric.name,
                                          });
                                          setSelectedModalFileIds([]);
                                        }}
                                        className="w-8 h-8 rounded-md border border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300 text-gray-700 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                                        title={`Add Files to Metric ${metric.code}`}
                                      >
                                        <Upload className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() =>
                                          setExpandedMetrics((prev) => ({
                                            ...prev,
                                            [metric.code]: !isMetricOpen,
                                          }))
                                        }
                                        className="w-8 h-8 rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                                      >
                                        {isMetricOpen ? (
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Attached Documents & Multi-Role Approval Bar inside Metric */}
                                  {isMetricOpen && (
                                    <div className="p-3.5 space-y-2 border-t border-gray-100">
                                      {metricDocs.length === 0 ? (
                                        <div className="text-xs text-gray-400 italic py-2 px-2 flex items-center justify-between">
                                          <span>
                                            No documents attached to {metric.code} yet. Use the upload button or AI Quick Upload Bar.
                                          </span>
                                        </div>
                                      ) : (
                                        metricDocs.map((doc) => (
                                          <div
                                            key={doc.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-white transition-colors"
                                          >
                                            {/* Left: Red PDF Icon + Filename + Hierarchy Unit Trail */}
                                            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                                              <FileText className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                                              <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                  <button
                                                    onClick={() => openFileInNewTab(doc.fileUrl)}
                                                    className="text-xs font-bold text-gray-900 hover:text-blue-600 hover:underline truncate cursor-pointer text-left"
                                                  >
                                                    {doc.fileName || `${doc.title}.pdf`}
                                                  </button>
                                                  {renderWorkflowBadge(doc.status)}
                                                </div>
                                                <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                                                  {hierarchyMode === 'university_schools' &&
                                                    doc.schoolName && (
                                                      <>
                                                        <span className="font-semibold text-gray-700">
                                                          {doc.schoolName}
                                                        </span>
                                                        <span>➔</span>
                                                      </>
                                                    )}
                                                  <span className="font-semibold text-gray-700">
                                                    {doc.programName || 'Department of CS'}
                                                  </span>
                                                  <span>•</span>
                                                  <span>Uploaded by {doc.uploadedBy}</span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Right: Role-Contextual Approval Buttons + View/Copy Icons */}
                                            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                              {/* Role Action Buttons */}
                                              {activeRole === 'faculty' &&
                                                (doc.status === 'draft' ||
                                                  doc.status === 'changes_requested') && (
                                                  <button
                                                    onClick={() =>
                                                      handleWorkflowAction(doc, 'submit')
                                                    }
                                                    className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                                  >
                                                    <Send className="w-3 h-3" />
                                                    <span>Submit for Review</span>
                                                  </button>
                                                )}

                                              {activeRole === 'program' &&
                                                (doc.status === 'draft' ||
                                                  doc.status === 'submitted_to_program') && (
                                                  <>
                                                    <button
                                                      onClick={() =>
                                                        handleWorkflowAction(doc, 'approve')
                                                      }
                                                      className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                                    >
                                                      <Check className="w-3 h-3" />
                                                      <span>
                                                        {hierarchyMode === 'university_schools'
                                                          ? 'Approve ➔ School'
                                                          : 'Approve ➔ IQAC'}
                                                      </span>
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        handleWorkflowAction(
                                                          doc,
                                                          'request_changes'
                                                        )
                                                      }
                                                      className="px-2 py-1 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold cursor-pointer"
                                                    >
                                                      Send Back
                                                    </button>
                                                  </>
                                                )}

                                              {activeRole === 'school' &&
                                                (doc.status === 'submitted_to_program' ||
                                                  doc.status === 'submitted_to_school') && (
                                                  <>
                                                    <button
                                                      onClick={() =>
                                                        handleWorkflowAction(doc, 'approve')
                                                      }
                                                      className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                                    >
                                                      <Check className="w-3 h-3" />
                                                      <span>Verify ➔ University IQAC</span>
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        handleWorkflowAction(
                                                          doc,
                                                          'request_changes'
                                                        )
                                                      }
                                                      className="px-2 py-1 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold cursor-pointer"
                                                    >
                                                      Send Back
                                                    </button>
                                                  </>
                                                )}

                                              {activeRole === 'university' &&
                                                doc.status !== 'university_verified' && (
                                                  <>
                                                    <button
                                                      onClick={() =>
                                                        handleWorkflowAction(
                                                          doc,
                                                          'publish_direct'
                                                        )
                                                      }
                                                      className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                                    >
                                                      <Globe className="w-3 h-3" />
                                                      <span>Approve & Publish</span>
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        handleWorkflowAction(
                                                          doc,
                                                          'request_changes'
                                                        )
                                                      }
                                                      className="px-2 py-1 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold cursor-pointer"
                                                    >
                                                      Send Back
                                                    </button>
                                                  </>
                                                )}

                                              {/* Standard Open & Copy Link buttons matching 8.png */}
                                              <button
                                                onClick={() => openFileInNewTab(doc.fileUrl)}
                                                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                                                title="Open PDF in new tab"
                                              >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  navigator.clipboard?.writeText(doc.fileUrl);
                                                  showToast('Document link copied to clipboard!');
                                                }}
                                                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                                                title="Copy document link"
                                              >
                                                <Copy className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ===================================================================
          RIGHT SLIDE-OVER DRAWER: INITIATE CYCLE (3.png)
      =================================================================== */}
      {isCycleDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  {editingCycleId ? 'Edit Cycle' : 'Initiate Cycle'}
                </h2>
                <button
                  onClick={() => setIsCycleDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Form Body matching 3.png */}
              <form id="initiate-cycle-form" onSubmit={handleSaveCycle} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Select Cycle <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={cycleNumberInput}
                    onChange={(e) => setCycleNumberInput(e.target.value)}
                    className="w-full rounded-lg border-2 border-blue-600 px-3.5 py-2.5 text-sm text-gray-800 outline-none bg-white"
                  >
                    <option value="NAAC Cycle 1">NAAC Cycle 1</option>
                    <option value="NAAC Cycle 2">NAAC Cycle 2</option>
                    <option value="NAAC Cycle 3">NAAC Cycle 3</option>
                    <option value="NAAC Cycle 4">NAAC Cycle 4</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                      Academic Year From <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={yearFromInput}
                      onChange={(e) => setYearFromInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 outline-none bg-white focus:border-blue-600"
                    >
                      <option value="2022-23">2022-23</option>
                      <option value="2023-24">2023-24</option>
                      <option value="2024-25">2024-25</option>
                      <option value="2025-26">2025-26</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                      Academic Year To <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={yearToInput}
                      onChange={(e) => setYearToInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 outline-none bg-white focus:border-blue-600"
                    >
                      <option value="2026-27">2026-27</option>
                      <option value="2027-28">2027-28</option>
                      <option value="2028-29">2028-29</option>
                      <option value="2029-30">2029-30</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Drawer Footer matching 3.png */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setIsCycleDrawerOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="initiate-cycle-form"
                className="px-5 py-2 rounded-lg bg-[#1d4ed8] hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          ADD FILES MODAL (6.png): CMS FILE MANAGER PICKER FOR METRICS
      =================================================================== */}
      {addFilesModalMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header matching 6.png */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Files</h3>
                <p className="text-xs text-gray-500">
                  Target: Metric {addFilesModalMetric.metricCode} ({addFilesModalMetric.metricName})
                </p>
              </div>
              <button
                onClick={() => setAddFilesModalMetric(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toolbar: Create Folder, Upload File, Search matching 6.png */}
            <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsCreatingFolder((prev) => !prev)}
                  className="px-3.5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 flex items-center gap-2 cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4 text-gray-700" />
                  <span>Create Folder</span>
                </button>

                <input
                  ref={modalFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  onChange={handleModalFileUpload}
                />
                <button
                  onClick={() => modalFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-gray-700" />
                  <span>Upload File</span>
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-blue-500 px-3.5 py-1.5 text-xs text-gray-800 outline-none"
                />
              </div>
            </div>

            {isCreatingFolder && (
              <div className="px-6 py-2.5 bg-blue-50/60 border-y border-blue-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter folder name (e.g. 2025-26)..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs bg-white outline-none"
                />
                <button
                  onClick={handleCreateFolderInModal}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Create
                </button>
              </div>
            )}

            {/* Folder Breadcrumb Row matching 6.png */}
            <div className="px-6 py-2.5 border-y border-gray-100 flex items-center gap-3 text-xs font-bold">
              <button
                onClick={() => setCurrentFolder('SSR')}
                className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentFolder('SSR')}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Home
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900">{currentFolder}</span>
              </div>
            </div>

            {/* File Table matching 6.png */}
            <div className="px-6 py-2 max-h-[280px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-700">
                    <th className="py-2.5 font-bold">
                      File Name{' '}
                      <span className="font-normal text-gray-400">
                        ({selectedModalFileIds.length}/
                        {cmsFiles.filter((f) => f.type === 'file').length} selected)
                      </span>
                    </th>
                    <th className="py-2.5 font-bold w-44">Date Modified</th>
                    <th className="py-2.5 font-bold w-24 text-right">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {cmsFiles
                    .filter((f) =>
                      modalSearchQuery
                        ? f.name.toLowerCase().includes(modalSearchQuery.toLowerCase())
                        : true
                    )
                    .map((item) => {
                      const isChecked = selectedModalFileIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            if (item.type === 'folder') {
                              setCurrentFolder(`SSR / ${item.name}`);
                            } else {
                              setSelectedModalFileIds((prev) =>
                                prev.includes(item.id)
                                  ? prev.filter((id) => id !== item.id)
                                  : [...prev, item.id]
                              );
                            }
                          }}
                          className={`cursor-pointer transition-colors ${
                            isChecked ? 'bg-blue-50/70' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-3 flex items-center gap-3">
                            {item.type === 'file' ? (
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="w-4" />
                            )}
                            <FileText
                              className={`w-4 h-4 ${
                                item.type === 'folder' ? 'text-amber-500' : 'text-blue-600'
                              }`}
                            />
                            <span className="font-medium text-gray-800">{item.name}</span>
                          </td>
                          <td className="py-3 text-gray-500">
                            <div className="flex items-center justify-between pr-3">
                              {item.type === 'file' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard?.writeText(item.fileUrl);
                                    showToast('File URL copied!');
                                  }}
                                  className="p-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-500"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                              <span>{item.dateModified}</span>
                            </div>
                          </td>
                          <td className="py-3 text-right text-gray-500">{item.size}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer matching 6.png */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-gray-50/40">
              <button
                onClick={handleSaveModalFilesToMetric}
                className="px-5 py-2 rounded-lg bg-[#1d4ed8] hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Save
              </button>
              <button
                onClick={() => setAddFilesModalMetric(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

