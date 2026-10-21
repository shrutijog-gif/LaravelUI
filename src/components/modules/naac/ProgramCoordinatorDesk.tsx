import React, { useState, useEffect } from 'react';
import { 
  Home,
  FileText, 
  ExternalLink, 
  Check, 
  Send, 
  Plus, 
  X,
  BookOpen,
  Monitor,
  Microscope,
  Cpu,
  Users,
  Building,
  Award,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Sparkles,
  Bot,
  Copy,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  CheckSquare,
  Clock,
  Layers,
  MessageSquare,
  Filter,
  Pencil,
  Download,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Trash2,
  Calendar,
  Bell
} from 'lucide-react';
import { 
  NaacEvidenceDocument, 
  CSE_DEPARTMENT_FACULTY,
  NAAC_CRITERIA_SUMMARY,
  NAAC_METRICS_LIST,
  getStoredNaacDocuments, 
  compileDocumentIntoDossier,
  requestRevisionFromFaculty,
  dispatchDepartmentDossierToSchool,
  addOrUpdateNaacDocument,
  deleteNaacDocument
} from '../../../data/naacDmsData';
import { openFileInNewTab } from '../../../utils/fileHelper';
import { Drawer } from '../../common/Drawer';
import { getStoredAuthUser } from '../../../services/authService';

// NAAC Key Indicator Mapping
interface KeyIndicatorDef {
  code: string;
  name: string;
  criterionCode: string;
  metricCodes: string[];
}

const KEY_INDICATORS: KeyIndicatorDef[] = [
  // Criterion 1
  { code: '1.1', name: 'Curricular Planning and Implementation', criterionCode: 'Criterion 1', metricCodes: ['1.1.1'] },
  { code: '1.2', name: 'Academic Flexibility', criterionCode: 'Criterion 1', metricCodes: ['1.2.1'] },
  { code: '1.3', name: 'Curriculum Enrichment', criterionCode: 'Criterion 1', metricCodes: ['1.3.1'] },
  { code: '1.4', name: 'Feedback System', criterionCode: 'Criterion 1', metricCodes: ['1.4.1'] },
  // Criterion 2
  { code: '2.1', name: 'Student Enrolment and Profile', criterionCode: 'Criterion 2', metricCodes: ['2.1.1'] },
  { code: '2.3', name: 'Teaching-Learning Process & Experiential Methods', criterionCode: 'Criterion 2', metricCodes: ['2.3.1'] },
  { code: '2.4', name: 'Teacher Profile and Quality Credentials', criterionCode: 'Criterion 2', metricCodes: ['2.4.1'] },
  { code: '2.6', name: 'Student Performance and Learning Outcomes (PO/CO)', criterionCode: 'Criterion 2', metricCodes: ['2.6.1'] },
  // Criterion 3
  { code: '3.1', name: 'Resource Mobilization for Research & Grants', criterionCode: 'Criterion 3', metricCodes: ['3.1.1'] },
  { code: '3.2', name: 'Innovation Ecosystem & Incubation Center', criterionCode: 'Criterion 3', metricCodes: ['3.2.1'] },
  { code: '3.4', name: 'Extension Activities & Social Responsibility', criterionCode: 'Criterion 3', metricCodes: ['3.4.1'] },
  { code: '3.5', name: 'Collaboration, Linkages & Corporate MoUs', criterionCode: 'Criterion 3', metricCodes: ['3.5.1'] },
  // Criterion 4
  { code: '4.1', name: 'Physical Facilities (ICT Classrooms & Labs)', criterionCode: 'Criterion 4', metricCodes: ['4.1.1'] },
  { code: '4.2', name: 'Library as a Learning Resource & E-Subscriptions', criterionCode: 'Criterion 4', metricCodes: ['4.2.1'] },
  // Criterion 5
  { code: '5.1', name: 'Student Support & Freeships', criterionCode: 'Criterion 5', metricCodes: ['5.1.1'] },
  { code: '5.3', name: 'Student Participation & Awards', criterionCode: 'Criterion 5', metricCodes: ['5.3.1'] },
  // Criterion 6
  { code: '6.5', name: 'Internal Quality Assurance System (IQAC)', criterionCode: 'Criterion 6', metricCodes: ['6.5.1'] },
  // Criterion 7
  { code: '7.1', name: 'Institutional Values & Gender Equity', criterionCode: 'Criterion 7', metricCodes: ['7.1.1'] },
  { code: '7.2', name: 'Institutional Best Practices', criterionCode: 'Criterion 7', metricCodes: ['7.2.1'] },
];

// Sample repository files for the existing file manager tab
const REPOSITORY_SAMPLE_FILES = [
  { id: 'f-1', name: 'CSE_OBE_Attainment_Report_2025_26.pdf', size: '3.4 MB', date: '2026-10-14' },
  { id: 'f-2', name: 'BoS_Minutes_Curriculum_Revision_2025.pdf', size: '2.1 MB', date: '2026-10-11' },
  { id: 'f-3', name: 'AI_Lab_GPU_Workstation_Invoices.pdf', size: '5.6 MB', date: '2026-10-09' },
  { id: 'f-4', name: 'DST_SERB_Research_Grant_Sanction.pdf', size: '4.2 MB', date: '2026-10-05' },
  { id: 'f-5', name: 'Student_Mentorship_Logs_2025.pdf', size: '2.8 MB', date: '2026-10-02' },
  { id: 'f-6', name: 'Stakeholder_Feedback_ATR_Report.pdf', size: '1.9 MB', date: '2026-09-28' },
];

interface AqarYearRecord {
  id: string;
  year: string;
  status: 'completed' | 'in_progress' | 'not_started';
  aqarReportStatus: 'added' | 'not_added';
}

const DEFAULT_AQAR_YEARS: AqarYearRecord[] = [
  { id: 'y-1', year: '2026-27', status: 'not_started', aqarReportStatus: 'not_added' },
  { id: 'y-2', year: '2025-26', status: 'completed', aqarReportStatus: 'not_added' },
  { id: 'y-3', year: '2024-25', status: 'in_progress', aqarReportStatus: 'not_added' },
  { id: 'y-4', year: '2022-23', status: 'not_started', aqarReportStatus: 'not_added' },
  { id: 'y-5', year: '2019-20', status: 'not_started', aqarReportStatus: 'not_added' },
];

interface ProgramCoordinatorDeskProps {
  activeSection?: 'aqar' | 'ssr' | 'dvv';
  initialTab?: 'criteria' | 'team' | 'compiled' | 'submissions';
}

export const ProgramCoordinatorDesk: React.FC<ProgramCoordinatorDeskProps> = ({ 
  activeSection = 'aqar',
  initialTab = 'criteria' 
}) => {
  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() => getStoredNaacDocuments());
  
  // Year Navigation (Screenshot 1 -> Screenshot 2 -> Screenshot 3)
  const [selectedYear, setSelectedYear] = useState<string | null>('2025-26');
  const [selectedCriterionCode, setSelectedCriterionCode] = useState<string | null>(null);
  const [openIndicatorAccordion, setOpenIndicatorAccordion] = useState<string | null>(null);
  
  // Desk tab: Criteria vs Team roster
  const [activeDeskTab, setActiveDeskTab] = useState<'criteria' | 'team'>(
    initialTab === 'compiled' || initialTab === 'team' ? 'team' : 'criteria'
  );
  // View Toggle: 'cards' (Screenshot 2) vs 'table' (Compact Document List Table)
  const [criteriaViewMode, setCriteriaViewMode] = useState<'cards' | 'table'>('cards');
  const [tableCriterionFilter, setTableCriterionFilter] = useState<string>('all');
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string | null>(null);
  
  // 3-Level Hierarchy Collapsible State: Criteria > Key Indicator > Metric
  const [collapsedCriteria, setCollapsedCriteria] = useState<Record<string, boolean>>({
    'Criterion 2': true,
    'Criterion 3': true,
    'Criterion 4': true,
    'Criterion 5': true,
    'Criterion 6': true,
    'Criterion 7': true,
  });

  const toggleCriterion = (criterionCode: string) => {
    setCollapsedCriteria(prev => ({
      ...prev,
      [criterionCode]: !prev[criterionCode]
    }));
  };

  const [collapsedKeyIndicators, setCollapsedKeyIndicators] = useState<Record<string, boolean>>({
    '1.2': true,
    '1.3': true,
    '1.4': true,
    '2.2': true,
    '2.3': true,
    '2.4': true,
    '2.5': true,
    '2.6': true,
    '2.7': true,
  });

  const toggleKeyIndicator = (code: string) => {
    setCollapsedKeyIndicators(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const expandAllHierarchy = () => {
    setCollapsedCriteria({});
    setCollapsedKeyIndicators({});
  };

  const collapseAllHierarchy = () => {
    const allCrit: Record<string, boolean> = {};
    NAAC_CRITERIA_SUMMARY.forEach(c => { allCrit[c.code] = true; });
    setCollapsedCriteria(allCrit);

    const allKi: Record<string, boolean> = {};
    KEY_INDICATORS.forEach(ki => { allKi[ki.code] = true; });
    setCollapsedKeyIndicators(allKi);
  };

  // Delete document
  const handleDeleteDocument = (docId: string, docTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${docTitle}"?`)) {
      deleteNaacDocument(docId);
      setDocuments(getStoredNaacDocuments());
      showToast(`Removed "${docTitle}"`);
    }
  };

  // Format date helper
  const formatDocDate = (dateStr?: string) => {
    if (!dateStr) return '14 Oct 2026';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '14 Oct 2026';
    }
  };
  
  // AQAR Years Master State (Screenshot 1)
  const [aqarYears, setAqarYears] = useState<AqarYearRecord[]>(DEFAULT_AQAR_YEARS);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [newInitiateYear, setNewInitiateYear] = useState('2027-28');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [revisionDoc, setRevisionDoc] = useState<NaacEvidenceDocument | null>(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [copiedNarrative, setCopiedNarrative] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [transmittalRemarks, setTransmittalRemarks] = useState(
    'Forwarding compiled AQAR 2025-26 supporting documentation for B.Tech Computer Science & Engineering. All 7 Criteria covered with approved faculty proofs, OBE attainment sheets, and BoS minutes.'
  );

  // Reminder Preview Modal State
  const [reminderFaculty, setReminderFaculty] = useState<typeof CSE_DEPARTMENT_FACULTY[0] | null>(null);
  const [reminderSubject, setReminderSubject] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [dontShowReminderAgain, setDontShowReminderAgain] = useState(false);
  const [skipReminderPreview, setSkipReminderPreview] = useState<boolean>(() => {
    return localStorage.getItem('naac_skip_reminder_preview') === 'true';
  });

  // Add Document Form State (Screenshot 4)
  const [modalCriterionCode, setModalCriterionCode] = useState('Criterion 1');
  const [selectedIndicatorCode, setSelectedIndicatorCode] = useState('1.1');
  const [selectedMetricCode, setSelectedMetricCode] = useState('1.1.1');
  const [selectedFacultyId, setSelectedFacultyId] = useState(CSE_DEPARTMENT_FACULTY[0].id);
  const [newTitle, setNewTitle] = useState('');
  const [activeFileTab, setActiveFileTab] = useState<'existing' | 'new'>('new');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; size: string; url: string }>>([]);
  const [selectedRepoFiles, setSelectedRepoFiles] = useState<string[]>([REPOSITORY_SAMPLE_FILES[0].name]);
  const [repoSearchQuery, setRepoSearchQuery] = useState('');

  // Sync state with storage
  useEffect(() => {
    const handleSync = () => {
      setDocuments(getStoredNaacDocuments());
    };
    window.addEventListener('naac-dms-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('naac-dms-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filter department documents (B.Tech CSE)
  const deptDocs = documents.filter(d => 
    d.programId === 'prog-cse' || d.programName.includes('Computer Science')
  );

  const pendingDocs = deptDocs.filter(d => d.status === 'draft' || !d.status);
  const submittedDocs = deptDocs.filter(d => d.status === 'submitted_to_school');

  const compiledDocs = deptDocs.filter(d => 
    d.coordinatorReviewStatus === 'compiled' || d.status === 'submitted_to_school' || d.status === 'approved_by_school'
  );

  const isDispatchedToSchool = submittedDocs.length > 0;
  const coveredCriteriaCount = new Set(deptDocs.map(d => d.criterionCode).filter(Boolean)).size;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compile individual document into dossier
  const handleCompileDoc = (docId: string) => {
    compileDocumentIntoDossier(docId);
    showToast('Document marked as compiled in Department Dossier');
  };

  // Submit department package to next authority (School Coordinator Dr. Rajesh Sharma)
  const handleConfirmSubmitToSchool = () => {
    const count = dispatchDepartmentDossierToSchool('prog-cse');
    setShowSubmitModal(false);
    showToast(`Successfully submitted ${count} proofs to School Coordinator (Dr. Rajesh Sharma) for review`);
  };

  // Reminder Preview Handlers
  const handleInitiateReminder = (faculty: typeof CSE_DEPARTMENT_FACULTY[0]) => {
    if (skipReminderPreview) {
      showToast(`Reminder sent directly to ${faculty.name} (${faculty.email})`);
      return;
    }

    setReminderFaculty(faculty);
    setReminderSubject(`[Action Required] AQAR ${selectedYear || '2025-26'} Supporting Proofs for ${faculty.criterionAssigned}`);
    setReminderMessage(
      `Dear ${faculty.name},\n\nThis is a gentle reminder to upload the required supporting proofs and metric documentation for ${faculty.criterionAssigned} for the AQAR ${selectedYear || '2025-26'} submission cycle.\n\nPlease upload the evidence files in the portal so we can finalize the department dossier for school-level review.\n\nWarm regards,\nProf. Anita Verma\nProgram Coordinator (B.Tech CSE)`
    );
    setDontShowReminderAgain(false);
  };

  const handleSendReminderConfirm = () => {
    if (!reminderFaculty) return;

    if (dontShowReminderAgain) {
      localStorage.setItem('naac_skip_reminder_preview', 'true');
      setSkipReminderPreview(true);
    }

    showToast(`Reminder sent to ${reminderFaculty.name} (${reminderFaculty.email})`);
    setReminderFaculty(null);
  };



  // Toggle AQAR Year status (Complete All Docs vs Undo)
  const handleToggleYearStatus = (yearId: string) => {
    setAqarYears(prev => prev.map(y => {
      if (y.id === yearId) {
        const nextStatus = y.status === 'completed' ? 'in_progress' : 'completed';
        showToast(`Status updated to ${nextStatus === 'completed' ? 'Completed' : 'In Progress'} for ${y.year}`);
        return { ...y, status: nextStatus };
      }
      return y;
    }));
  };

  // Initiate New AQAR Year
  const handleInitiateNewYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInitiateYear.trim()) return;
    const newRecord: AqarYearRecord = {
      id: `y-${Date.now()}`,
      year: newInitiateYear.trim(),
      status: 'not_started',
      aqarReportStatus: 'not_added',
    };
    setAqarYears([newRecord, ...aqarYears]);
    setShowInitiateModal(false);
    showToast(`Initiated AQAR cycle for Academic Year ${newInitiateYear}`);
  };

  // Handle request revision
  const handleSaveRevisionRequest = () => {
    if (!revisionDoc) return;
    requestRevisionFromFaculty(revisionDoc.id, revisionNote || 'Please update proof according to Jan 2023 NAAC guidelines.');
    setRevisionDoc(null);
    setRevisionNote('');
    showToast('Revision request sent back to faculty member');
  };

  // Handle local file upload (supports multiple files)
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = `${sizeInMb} MB`;
      const fileId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFiles(prev => [
          ...prev,
          {
            id: fileId,
            name: file.name,
            size: sizeStr,
            url: reader.result as string,
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Remove individual uploaded file
  const handleRemoveUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Toggle selection for repository files
  const toggleRepoFile = (fileName: string) => {
    setSelectedRepoFiles(prev =>
      prev.includes(fileName)
        ? prev.filter(name => name !== fileName)
        : [...prev, fileName]
    );
  };

  // Select / Deselect all filtered repository files
  const toggleSelectAllRepo = () => {
    const filtered = REPOSITORY_SAMPLE_FILES.filter(f =>
      f.name.toLowerCase().includes(repoSearchQuery.toLowerCase())
    );
    const allSelected = filtered.length > 0 && filtered.every(f => selectedRepoFiles.includes(f.name));
    if (allSelected) {
      setSelectedRepoFiles(prev => prev.filter(name => !filtered.some(f => f.name === name)));
    } else {
      const toAdd = filtered.map(f => f.name).filter(name => !selectedRepoFiles.includes(name));
      setSelectedRepoFiles(prev => [...prev, ...toAdd]);
    }
  };

  // Save new supporting document(s)
  const handleSaveDocument = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const metric = NAAC_METRICS_LIST.find(m => m.code === selectedMetricCode);
    const currentUser = getStoredAuthUser();
    const uploaderName = currentUser?.name || 'Prof. Anita Verma';
    const uploaderRole = currentUser?.role || 'Program Coordinator (B.Tech CSE)';
    const fallbackPdf = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    let attachedCount = 0;

    if (activeFileTab === 'new') {
      if (uploadedFiles.length === 0) {
        showToast('Please upload or drag at least one evidence document');
        return;
      }
      uploadedFiles.forEach((file) => {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        addOrUpdateNaacDocument({
          title: cleanTitle || `${selectedMetricCode} - ${metric?.name || 'Supporting Evidence'}`,
          programId: 'prog-cse',
          programName: 'B.Tech Computer Science & Engineering',
          schoolId: 'sch-tech',
          schoolName: 'School of Technology & Computer Engineering',
          academicYear: selectedYear || '2025-2026',
          criterionId: metric?.criterionId || 'crit-1',
          criterionCode: modalCriterionCode,
          metricCode: selectedMetricCode,
          metricName: metric?.name || 'Supporting Evidence',
          metricType: metric?.metricType || 'QlM',
          fileUrl: file.url || fallbackPdf,
          fileName: file.name,
          fileSize: file.size,
          uploadedBy: uploaderName,
          status: 'draft',
          submittedByFacultyId: 'coord-anita-verma',
          facultyName: uploaderName,
          facultyDesignation: uploaderRole,
          coordinatorReviewStatus: 'compiled',
          compiledAt: new Date().toISOString(),
        });
        attachedCount++;
      });
      setUploadedFiles([]);
    } else {
      if (selectedRepoFiles.length === 0) {
        showToast('Please select at least one document from the repository');
        return;
      }
      selectedRepoFiles.forEach((fileName) => {
        const repoFile = REPOSITORY_SAMPLE_FILES.find(f => f.name === fileName);
        const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        addOrUpdateNaacDocument({
          title: cleanTitle || `${selectedMetricCode} - ${metric?.name || 'Supporting Evidence'}`,
          programId: 'prog-cse',
          programName: 'B.Tech Computer Science & Engineering',
          schoolId: 'sch-tech',
          schoolName: 'School of Technology & Computer Engineering',
          academicYear: selectedYear || '2025-2026',
          criterionId: metric?.criterionId || 'crit-1',
          criterionCode: modalCriterionCode,
          metricCode: selectedMetricCode,
          metricName: metric?.name || 'Supporting Evidence',
          metricType: metric?.metricType || 'QlM',
          fileUrl: fallbackPdf,
          fileName: fileName,
          fileSize: repoFile?.size || '2.5 MB',
          uploadedBy: uploaderName,
          status: 'draft',
          submittedByFacultyId: 'coord-anita-verma',
          facultyName: uploaderName,
          facultyDesignation: uploaderRole,
          coordinatorReviewStatus: 'compiled',
          compiledAt: new Date().toISOString(),
        });
        attachedCount++;
      });
    }

    setNewTitle('');
    setShowAddModal(false);
    showToast(`Successfully attached ${attachedCount} document${attachedCount > 1 ? 's' : ''} for Metric ${selectedMetricCode}`);
  };

  // Criterion Card Icon helper
  const getCriterionIcon = (code: string) => {
    switch (code) {
      case 'Criterion 1': return <BookOpen className="w-6 h-6 text-gray-700" />;
      case 'Criterion 2': return <Monitor className="w-6 h-6 text-gray-700" />;
      case 'Criterion 3': return <Microscope className="w-6 h-6 text-gray-700" />;
      case 'Criterion 4': return <Cpu className="w-6 h-6 text-gray-700" />;
      case 'Criterion 5': return <Users className="w-6 h-6 text-gray-700" />;
      case 'Criterion 6': return <Building className="w-6 h-6 text-gray-700" />;
      case 'Criterion 7': return <Award className="w-6 h-6 text-gray-700" />;
      default: return <BookOpen className="w-6 h-6 text-gray-700" />;
    }
  };

  // Filtered documents for team table
  const teamDisplayedDocs = selectedFacultyFilter
    ? deptDocs.filter(d => 
        (selectedFacultyFilter === 'coord-anita-verma' && (
          d.submittedByFacultyId === 'coord-anita-verma' ||
          d.uploadedBy?.toLowerCase().includes('anita') ||
          d.facultyName?.toLowerCase().includes('anita')
        )) ||
        d.submittedByFacultyId === selectedFacultyFilter || 
        d.uploadedBy?.includes(selectedFacultyFilter) ||
        d.criterionId === selectedFacultyFilter ||
        d.criterionCode === selectedFacultyFilter
      )
    : deptDocs;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-xl shadow-xl flex items-center justify-between text-xs font-semibold gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-0.5 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-200/50 rounded cursor-pointer transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          MODULE VIEW: SSR (Self Study Report) - 5-Year Master Accreditation
         ========================================================================= */}
      {activeSection === 'ssr' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#2563eb] text-white flex items-center justify-center shadow-xs">
                <Home className="w-4 h-4" />
              </div>
              <h1 className="text-sm sm:text-base font-bold text-gray-800">
                SSR (Self Study Report) - 5-Year Master Accreditation
              </h1>
            </div>
            <div className="text-xs text-blue-600 font-medium">
              <span>NAAC Accreditation</span> <span className="text-gray-400">/</span> <span className="text-gray-600 font-bold">SSR Master</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">5-Year Institutional Self Study Report (SSR) Compilation</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Synthesize 5 consecutive AQAR cycles (2022-23 to 2026-27) into the unified Institutional Master SSR for NAAC Peer Team assessment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => showToast('5-Year Master SSR Package compiled and exported')}
                className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs inline-flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Master SSR Package (PDF)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1">
                <span className="text-gray-500 font-medium">Quantitative Metrics (QnM)</span>
                <p className="text-xl font-bold text-blue-900">92.4% Attainment</p>
                <span className="text-[11px] text-blue-700">Verified across all 7 criteria</span>
              </div>
              <div className="p-4 rounded-lg bg-purple-50/60 border border-purple-200 space-y-1">
                <span className="text-gray-500 font-medium">Qualitative Metrics (QlM)</span>
                <p className="text-xl font-bold text-purple-900">38/38 Drafted</p>
                <span className="text-[11px] text-purple-700">AI Qualitative Narratives ready</span>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
                <span className="text-gray-500 font-medium">Peer Team Readiness</span>
                <p className="text-xl font-bold text-emerald-900">A++ Projected</p>
                <span className="text-[11px] text-emerald-700">Institutional CGPA target: 3.65</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE VIEW: DVV (Data Validation & Verification) Clarifications
         ========================================================================= */}
      {activeSection === 'dvv' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#2563eb] text-white flex items-center justify-center shadow-xs">
                <Home className="w-4 h-4" />
              </div>
              <h1 className="text-sm sm:text-base font-bold text-gray-800">
                DVV (Data Validation & Verification) Clarifications
              </h1>
            </div>
            <div className="text-xs text-blue-600 font-medium">
              <span>NAAC Accreditation</span> <span className="text-gray-400">/</span> <span className="text-gray-600 font-bold">DVV Clarifications</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">NAAC DVV Audit Queries & Proof Validations</h3>
                <p className="text-xs text-gray-500 mt-1">Review clarifications raised by NAAC Partner DVV Agency and attach attested response files.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                0 Critical Gaps
              </span>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">Metric 1.1.3: Project work / Field work / Internships documentation</span>
                <span className="text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded">Resolved & Validated</span>
              </div>
              <p className="text-[11px] text-gray-600">
                Clarification Request: Provide authenticated completion certificates of 6-month industry internships. All 142 student certificates counter-signed by Principal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE VIEW: AQAR (Annual Quality Assurance Report) - Full 4-Step Flow
         ========================================================================= */}
      {activeSection === 'aqar' && (
        <>
          {/* ---------------------------------------------------------------------
              LEVEL 1: AQAR YEAR MASTER TABLE (Matches Screenshot 1 Exactly)
             --------------------------------------------------------------------- */}
          {!selectedYear && (
            <div className="space-y-6 animate-in fade-in">
              {/* Blue House Header & Initiate AQAR Button (Matches Screenshot 1) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#2563eb] text-white flex items-center justify-center shadow-xs">
                    <Home className="w-4 h-4" />
                  </div>
                  <h1 className="text-sm sm:text-base font-bold text-gray-800">
                    AQAR (Annual Quality Assurance Report)
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInitiateModal(true)}
                  className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Initiate AQAR</span>
                </button>
              </div>

              {/* Master AQAR Table (Matches Screenshot 1) */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs">
                    <thead className="bg-gray-50/80 text-gray-700 font-semibold border-b border-gray-200 text-xs">
                      <tr>
                        <th className="py-3.5 px-4 w-16">#</th>
                        <th className="py-3.5 px-6 w-36">Year</th>
                        <th className="py-3.5 px-6">Supporting Documents</th>
                        <th className="py-3.5 px-6">AQAR</th>
                        <th className="py-3.5 px-6 w-44">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                      {aqarYears.map((row, index) => {
                        // Count docs for this year
                        const yearDocs = deptDocs.filter(d => d.academicYear === row.year || (row.year === '2025-26' && d.academicYear.includes('2025')));
                        const docCount = yearDocs.length;
                        const hasDocs = docCount > 0;

                        return (
                          <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                            {/* # */}
                            <td className="py-4 px-4 text-gray-500 font-medium">
                              {index + 1}
                            </td>

                            {/* Year */}
                            <td className="py-4 px-6 font-semibold text-gray-900">
                              {row.year}
                            </td>

                            {/* Supporting Documents (Pill + Blue Edit Button) */}
                            <td className="py-4 px-6">
                              <div className="inline-flex items-center gap-2">
                                {hasDocs ? (
                                  <span 
                                    onClick={() => setSelectedYear(row.year)}
                                    className="bg-[#dcfce7] text-[#15803d] px-3 py-1.5 rounded font-semibold text-xs cursor-pointer hover:bg-emerald-200 transition-colors inline-block"
                                  >
                                    Documents added: {docCount}
                                  </span>
                                ) : (
                                  <span 
                                    onClick={() => setSelectedYear(row.year)}
                                    className="bg-[#fee2e2] text-[#b91c1c] px-3 py-1.5 rounded font-semibold text-xs cursor-pointer hover:bg-rose-200 transition-colors inline-block"
                                  >
                                    Documents not added
                                  </span>
                                )}

                                {/* Blue Edit Pen Box */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedYear(row.year)}
                                  className="w-7 h-7 rounded bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer shadow-xs transition-colors shrink-0"
                                  title={`Edit Supporting Documents for ${row.year}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                            {/* AQAR (Pill + Blue Edit Button) */}
                            <td className="py-4 px-6">
                              <div className="inline-flex items-center gap-2">
                                {row.aqarReportStatus === 'added' ? (
                                  <span className="bg-[#dcfce7] text-[#15803d] px-3 py-1.5 rounded font-semibold text-xs inline-block">
                                    AQAR generated
                                  </span>
                                ) : (
                                  <span className="bg-[#fee2e2] text-[#b91c1c] px-3 py-1.5 rounded font-semibold text-xs inline-block">
                                    AQAR not added
                                  </span>
                                )}

                                {/* Blue Edit Pen Box */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAqarYears(prev => prev.map(y => y.id === row.id ? { ...y, aqarReportStatus: y.aqarReportStatus === 'added' ? 'not_added' : 'added' } : y));
                                    showToast(`AQAR report status updated for ${row.year}`);
                                  }}
                                  className="w-7 h-7 rounded bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer shadow-xs transition-colors shrink-0"
                                  title={`Generate AQAR Report for ${row.year}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                            {/* Action Button (Complete All Docs vs Completed (Undo)) */}
                            <td className="py-4 px-6">
                              {row.status === 'completed' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleYearStatus(row.id)}
                                  className="bg-gray-400 hover:bg-gray-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded shadow-xs cursor-pointer transition-colors"
                                >
                                  Completed (Undo)
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleYearStatus(row.id)}
                                  className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-xs px-3.5 py-1.5 rounded shadow-xs cursor-pointer transition-colors"
                                >
                                  Complete All Docs
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------------
              LEVEL 2: 7 CRITERIA CARDS GRID FOR SELECTED YEAR (Matches Screenshot 2)
             --------------------------------------------------------------------- */}
          {selectedYear && !selectedCriterionCode && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header with Breadcrumb back to AQAR Year Table */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#2563eb] text-white flex items-center justify-center shadow-xs">
                    <Home className="w-4 h-4" />
                  </div>
                  <h1 className="text-sm sm:text-base font-bold text-gray-800">
                    AQAR Supporting Documents for {selectedYear}
                  </h1>
                </div>

                {/* Breadcrumb & Action */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setModalCriterionCode('Criterion 1');
                      setSelectedIndicatorCode('1.1');
                      setSelectedMetricCode('1.1.1');
                      const lead = CSE_DEPARTMENT_FACULTY.find(f => f.criterionAssigned.includes('Criterion 1'));
                      if (lead) setSelectedFacultyId(lead.id);
                      setShowAddModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Document</span>
                  </button>

                  {pendingDocs.length === 0 && submittedDocs.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Submitted for Review ({submittedDocs.length})</span>
                    </span>
                  ) : submittedDocs.length > 0 && pendingDocs.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded border border-gray-200">
                        <span>{submittedDocs.length} Submitted</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSubmitModal(true)}
                        className="px-3 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Additional ({pendingDocs.length}) ➔</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      disabled={deptDocs.length === 0}
                      className="px-3.5 py-1.5 bg-[#2563eb] hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold text-xs rounded shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Review ({deptDocs.length}) ➔</span>
                    </button>
                  )}

                  <div className="text-xs text-blue-600 font-medium flex items-center gap-1.5 pl-2 border-l border-gray-200">
                    <button 
                      onClick={() => setSelectedYear(null)} 
                      className="hover:underline cursor-pointer"
                    >
                      AQAR
                    </button>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600 font-bold">NAAC Criteria</span>
                  </div>
                </div>
              </div>

              {/* Department Desk Navigation Tabs & View Mode Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-2">
                {/* View Toggle: Cards vs Compact Table */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDeskTab('criteria');
                      setCriteriaViewMode('cards');
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeDeskTab === 'criteria' && criteriaViewMode === 'cards'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Criteria Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveDeskTab('criteria');
                      setCriteriaViewMode('table');
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeDeskTab === 'criteria' && criteriaViewMode === 'table'
                        ? 'bg-white text-blue-700 shadow-xs font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Document List</span>
                  </button>
                </div>

                {/* Team Contributions Tab */}
                <button
                  type="button"
                  onClick={() => setActiveDeskTab(activeDeskTab === 'team' ? 'criteria' : 'team')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    activeDeskTab === 'team'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Team Contributions (7 Criteria)</span>
                </button>
              </div>

              {/* VIEW 1: 7 CRITERIA CARDS GRID (Matches Screenshot 2) */}
              {activeDeskTab === 'criteria' && criteriaViewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {NAAC_CRITERIA_SUMMARY.map((crit) => {
                    const critDocs = deptDocs.filter(d => d.criterionCode === crit.code || d.criterionId === crit.id);
                    const assignedFaculty = CSE_DEPARTMENT_FACULTY.find(f => f.criterionAssigned.includes(crit.code));
                    const facultyLead = assignedFaculty ? assignedFaculty.name : 'Prof. Anita Verma';

                    return (
                      <div 
                        key={crit.id}
                        className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs flex items-center justify-between gap-4 hover:border-blue-400 transition-all"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Icon Box */}
                          <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                            {getCriterionIcon(crit.code)}
                          </div>

                          {/* Title & Metadata */}
                          <div className="min-w-0">
                            <span className="block text-[11px] font-bold text-gray-500 uppercase">
                              {crit.code}:
                            </span>
                            <h3 className="text-sm font-bold text-gray-900 leading-snug truncate">
                              {crit.name}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              Documents Added: <strong className="text-gray-900 font-bold">{critDocs.length}</strong>
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                              Lead: {facultyLead}
                            </p>
                          </div>
                        </div>

                        {/* Actions: Yellow Bordered Bell Reminder + Start Adding Documents */}
                        <div className="flex items-center gap-2 shrink-0">
                          {assignedFaculty && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInitiateReminder(assignedFaculty);
                              }}
                              className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer transition-colors shrink-0"
                              title={`Send reminder to ${assignedFaculty.name}`}
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedCriterionCode(crit.code)}
                            className="px-3.5 py-1.5 border border-[#2563eb] text-[#2563eb] hover:bg-blue-50 font-bold text-xs rounded shadow-2xs shrink-0 cursor-pointer transition-colors"
                          >
                            Start Adding Documents
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW 2: 3-TIER HIERARCHICAL TABLE (Criteria > Key Indicator > Metric) */}
              {activeDeskTab === 'criteria' && criteriaViewMode === 'table' && (() => {
                // Filter criteria, indicators, and metrics
                const filteredCriteria = NAAC_CRITERIA_SUMMARY.filter(crit => {
                  if (tableCriterionFilter !== 'all' && crit.code !== tableCriterionFilter) return false;
                  if (tableSearchQuery.trim()) {
                    const q = tableSearchQuery.toLowerCase();
                    const matchCrit = crit.name.toLowerCase().includes(q) || crit.code.toLowerCase().includes(q);
                    const critIndicators = KEY_INDICATORS.filter(ki => ki.criterionCode === crit.code);
                    const matchKi = critIndicators.some(ki => ki.name.toLowerCase().includes(q) || ki.code.toLowerCase().includes(q));
                    const critMetrics = NAAC_METRICS_LIST.filter(m => m.criterionCode === crit.code);
                    const matchMetrics = critMetrics.some(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q));
                    const matchDocs = deptDocs.some(d => d.criterionCode === crit.code && (d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q)));
                    return matchCrit || matchKi || matchMetrics || matchDocs;
                  }
                  return true;
                });

                return (
                  <div className="space-y-3">
                    {/* Filter, Search & Expand/Collapse Controls */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-semibold text-gray-600">Filter Criterion:</span>
                        <select
                          value={tableCriterionFilter}
                          onChange={(e) => setTableCriterionFilter(e.target.value)}
                          className="px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer"
                        >
                          <option value="all">All Criteria (1–7)</option>
                          {NAAC_CRITERIA_SUMMARY.map(c => (
                            <option key={c.id} value={c.code}>{c.code}: {c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            placeholder="Search criteria, indicator, metric, or file..."
                            value={tableSearchQuery}
                            onChange={(e) => setTableSearchQuery(e.target.value)}
                            className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs w-64 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Expand / Collapse All */}
                        <div className="inline-flex items-center gap-1 border border-gray-200 rounded p-0.5 bg-gray-50">
                          <button
                            type="button"
                            onClick={expandAllHierarchy}
                            className="px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-white rounded cursor-pointer transition-colors"
                          >
                            Expand All
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={collapseAllHierarchy}
                            className="px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-white rounded cursor-pointer transition-colors"
                          >
                            Collapse All
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Single Collapsible Hierarchy Table: Criteria -> Key Indicators -> Metrics (Zero Nested Tables) */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[11px] uppercase tracking-wider">
                            <tr>
                              <th className="py-2.5 px-4 w-[38%]">Metric / NAAC Hierarchy</th>
                              <th className="py-2.5 px-3 w-[12%]">Type</th>
                              <th className="py-2.5 px-3 w-[26%]">Attached Document</th>
                              <th className="py-2.5 px-3 w-[12%]">Uploaded By</th>
                              <th className="py-2.5 px-3 w-[8%]">Date</th>
                              <th className="py-2.5 px-2 w-[4%] text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredCriteria.length > 0 ? (
                              filteredCriteria.map((crit) => {
                                const isCritCollapsed = Boolean(collapsedCriteria[crit.code]);
                                const critIndicators = KEY_INDICATORS.filter(ki => ki.criterionCode === crit.code);
                                const critDocs = deptDocs.filter(d => d.criterionCode === crit.code);

                                return (
                                  <React.Fragment key={crit.id}>
                                    {/* LEVEL 1: CRITERION GROUP ROW (Single TR, colSpan 6) */}
                                    <tr 
                                      onClick={() => toggleCriterion(crit.code)}
                                      className="cursor-pointer bg-slate-100 hover:bg-slate-200/80 transition-colors border-t border-b border-slate-300 select-none"
                                    >
                                      <td colSpan={6} className="py-2.5 px-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleCriterion(crit.code);
                                              }}
                                              className="p-1 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                                            >
                                              {isCritCollapsed ? (
                                                <ChevronRight className="w-4 h-4 text-slate-700 font-bold" />
                                              ) : (
                                                <ChevronDown className="w-4 h-4 text-blue-700 font-bold" />
                                              )}
                                            </button>
                                            <span className="font-bold text-sm text-slate-900">
                                              <span className="text-blue-800">{crit.code}:</span> {crit.name}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs">
                                            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                                              {crit.weightage} Marks
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                                              {critIndicators.length} Indicators
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded font-bold ${
                                              critDocs.length > 0 
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}>
                                              {critDocs.length} {critDocs.length === 1 ? 'doc' : 'docs'}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>

                                    {/* LEVEL 2: KEY INDICATORS (Rows in the SAME table) */}
                                    {!isCritCollapsed && critIndicators.map((ki) => {
                                      const isKiCollapsed = Boolean(collapsedKeyIndicators[ki.code]);
                                      const kiMetrics = NAAC_METRICS_LIST.filter(m => ki.metricCodes.includes(m.code) || m.code.startsWith(ki.code));
                                      const kiDocs = deptDocs.filter(d => kiMetrics.some(m => m.code === d.metricCode));

                                      return (
                                        <React.Fragment key={ki.code}>
                                          {/* Key Indicator Row (Single TR, colSpan 6) */}
                                          <tr 
                                            onClick={() => toggleKeyIndicator(ki.code)}
                                            className="cursor-pointer bg-blue-50/40 hover:bg-blue-50/70 transition-colors border-b border-blue-100/70 select-none"
                                          >
                                            <td colSpan={6} className="py-2 px-4 pl-9">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      toggleKeyIndicator(ki.code);
                                                    }}
                                                    className="p-0.5 rounded text-blue-700 hover:text-blue-900 cursor-pointer"
                                                  >
                                                    {isKiCollapsed ? (
                                                      <ChevronRight className="w-3.5 h-3.5" />
                                                    ) : (
                                                      <ChevronDown className="w-3.5 h-3.5 text-blue-700 font-bold" />
                                                    )}
                                                  </button>
                                                  <span className="font-semibold text-xs text-blue-950">
                                                    <span className="font-bold">{ki.code}:</span> {ki.name}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px]">
                                                  <span className="text-gray-500 font-medium">
                                                    {kiMetrics.length} {kiMetrics.length === 1 ? 'Metric' : 'Metrics'}
                                                  </span>
                                                  <span className={`font-semibold ${
                                                    kiDocs.length > 0 ? 'text-emerald-700' : 'text-gray-400'
                                                  }`}>
                                                    • {kiDocs.length} {kiDocs.length === 1 ? 'doc' : 'docs'}
                                                  </span>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>

                                          {/* LEVEL 3: METRIC ROWS (Rows in the SAME table matching 6 columns) */}
                                          {!isKiCollapsed && kiMetrics.map((metric) => {
                                            const metricDocs = deptDocs.filter(d => d.metricCode === metric.code);

                                            if (metricDocs.length === 0) {
                                              return (
                                                <tr key={metric.code} className="hover:bg-slate-50/60 transition-colors border-b border-gray-100 text-xs">
                                                  {/* Col 1: Metric Code & Name */}
                                                  <td className="py-2.5 px-4 pl-14 align-top">
                                                    <div className="flex items-start gap-2">
                                                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-bold shrink-0">
                                                        {metric.code}
                                                      </span>
                                                      <span className="font-medium text-gray-900 leading-tight">{metric.name}</span>
                                                    </div>
                                                  </td>

                                                  {/* Col 2: Type */}
                                                  <td className="py-2.5 px-3 text-gray-600 align-top whitespace-nowrap text-[11px]">
                                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 border border-gray-200">
                                                      {metric.metricType}
                                                    </span>
                                                  </td>

                                                  {/* Col 3-6: No Documents */}
                                                  <td colSpan={4} className="py-2.5 px-3 text-gray-400 italic text-[11px] align-middle">
                                                    No documents uploaded for this metric
                                                  </td>
                                                </tr>
                                              );
                                            }

                                            return metricDocs.map((doc, dIdx) => (
                                              <tr key={doc.id} className="hover:bg-amber-50/20 transition-colors border-b border-gray-100 text-xs">
                                                {/* Col 1: Metric Code & Name (Spans across all docs for this metric) */}
                                                {dIdx === 0 ? (
                                                  <>
                                                    <td rowSpan={metricDocs.length} className="py-2.5 px-4 pl-14 align-top border-r border-gray-100">
                                                      <div className="flex items-start gap-2">
                                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-bold shrink-0">
                                                          {metric.code}
                                                        </span>
                                                        <span className="font-medium text-gray-900 leading-tight">{metric.name}</span>
                                                      </div>
                                                    </td>

                                                    {/* Col 2: Type */}
                                                    <td rowSpan={metricDocs.length} className="py-2.5 px-3 text-gray-600 align-top whitespace-nowrap text-[11px] border-r border-gray-100">
                                                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 border border-gray-200">
                                                        {metric.metricType}
                                                      </span>
                                                    </td>
                                                  </>
                                                ) : null}

                                                {/* Col 3: Attached Supporting Document Link */}
                                                <td className="py-2.5 px-3 align-top">
                                                  <div className="flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                                    <button
                                                      type="button"
                                                      onClick={() => openFileInNewTab(doc.fileUrl)}
                                                      className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline truncate text-left cursor-pointer"
                                                      title={`Open ${doc.fileName || doc.title}`}
                                                    >
                                                      {doc.fileName || doc.title}
                                                    </button>
                                                  </div>
                                                </td>

                                                {/* Col 4: Uploaded By */}
                                                <td className="py-2.5 px-3 text-gray-700 align-top text-xs whitespace-nowrap">
                                                  {doc.facultyName || doc.uploadedBy}
                                                </td>

                                                {/* Col 5: Date */}
                                                <td className="py-2.5 px-3 text-gray-500 align-top text-xs whitespace-nowrap">
                                                  {formatDocDate(doc.uploadedAt)}
                                                </td>

                                                {/* Col 6: Delete Trash Action */}
                                                <td className="py-2.5 px-2 text-center align-top">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteDocument(doc.id, doc.fileName || doc.title);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                                                    title="Delete document"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </td>
                                              </tr>
                                            ));
                                          })}
                                        </React.Fragment>
                                      );
                                    })}
                                  </React.Fragment>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-400">
                                  No criteria or metrics found matching your filter.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB CONTENT 2: DEPARTMENT TEAM FACULTY ROSTER & COMPILATION TABLE */}
              {activeDeskTab === 'team' && (
                <div className="space-y-6">
                  {/* Faculty Team Roster */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                          NAAC Criteria Team Contributions (All 7 Criteria)
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Faculty leads assigned to all 7 criteria. Track upload status, filter documents, or send reminders to criterion heads.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {skipReminderPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.removeItem('naac_skip_reminder_preview');
                              setSkipReminderPreview(false);
                              showToast('Reminder preview re-enabled');
                            }}
                            className="text-[11px] text-blue-600 hover:text-blue-800 underline cursor-pointer font-medium"
                          >
                            Re-enable reminder preview
                          </button>
                        )}
                        {selectedFacultyFilter && (
                          <button
                            type="button"
                            onClick={() => setSelectedFacultyFilter(null)}
                            className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Clear Filter</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                      {/* 1ST BOX: PROF. ANITA VERMA (PROGRAM COORDINATOR) - DISTINCT COLOR, NO DOSSIER */}
                      {(() => {
                        const anitaDocs = deptDocs.filter(d => 
                          d.uploadedBy?.toLowerCase().includes('anita') || 
                          d.facultyName?.toLowerCase().includes('anita') || 
                          d.submittedByFacultyId === 'coord-anita-verma'
                        );
                        const isSelected = selectedFacultyFilter === 'coord-anita-verma';

                        return (
                          <div
                            onClick={() => setSelectedFacultyFilter(isSelected ? null : 'coord-anita-verma')}
                            className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected 
                                ? 'bg-amber-100 border-amber-500 shadow-xs ring-2 ring-amber-400' 
                                : 'bg-amber-50/90 border-amber-200 hover:border-amber-300 hover:bg-amber-100/60 shadow-2xs'
                            }`}
                          >
                            <div>
                              {/* Top Coordinator Tag & Badge */}
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200">
                                <span className="text-[11px] font-bold text-amber-800 tracking-wide uppercase">
                                  COORDINATOR
                                </span>
                                <span className="text-[10px] font-bold text-amber-900 bg-amber-200/70 px-1.5 py-0.5 rounded border border-amber-300 shadow-2xs">
                                  Lead Role
                                </span>
                              </div>

                              {/* Title (No word dossier) */}
                              <h4 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 min-h-[32px]">
                                Department AQAR Coordination
                              </h4>

                              {/* Coordinator Profile (Anita Verma) */}
                              <div className="flex items-center gap-2 mt-2.5">
                                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs">
                                  AV
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-gray-900 text-[11px] truncate">
                                    Prof. Anita Verma
                                  </p>
                                  <p className="text-[10px] text-amber-800 font-medium truncate">
                                    Program Coordinator
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Proofs Status & Quick Upload Action */}
                            <div className="mt-3 pt-2.5 border-t border-amber-200 flex items-center justify-between text-[11px] gap-2">
                              {anitaDocs.length > 0 ? (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-white/95 border border-emerald-300 px-2 py-0.5 rounded text-[11px] shadow-2xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>{anitaDocs.length} {anitaDocs.length === 1 ? 'proof' : 'proofs'} uploaded</span>
                                </span>
                              ) : (
                                <span className="text-amber-800 bg-white/95 border border-amber-300 font-bold px-2 py-0.5 rounded text-[10px] shadow-2xs">
                                  0 proofs uploaded
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAddModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px] cursor-pointer transition-colors shrink-0 shadow-2xs"
                                title="Upload document as Program Coordinator"
                              >
                                <Plus className="w-3 h-3 stroke-[2.5]" />
                                <span>Upload</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* CRITERIA 1 TO 7 CARDS */}
                      {NAAC_CRITERIA_SUMMARY.map((crit) => {
                        const assignedFaculty = CSE_DEPARTMENT_FACULTY.find(f => f.criterionAssigned.includes(crit.code)) || CSE_DEPARTMENT_FACULTY[0];
                        const critDocs = deptDocs.filter(d => d.criterionCode === crit.code || d.criterionId === crit.id);
                        const isSelected = selectedFacultyFilter === assignedFaculty.id || selectedFacultyFilter === crit.code || selectedFacultyFilter === crit.id;

                        return (
                          <div
                            key={crit.id}
                            onClick={() => setSelectedFacultyFilter(isSelected ? null : crit.code)}
                            className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected 
                                ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-300' 
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs shadow-2xs'
                            }`}
                          >
                            <div>
                              {/* Top Criteria Tag & Weightage */}
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                                <span className="text-[11px] font-bold text-blue-700 tracking-wide uppercase">
                                  {crit.code}
                                </span>
                                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {crit.weightage} Marks
                                </span>
                              </div>

                              {/* Criterion Name */}
                              <h4 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 min-h-[32px]" title={crit.name}>
                                {crit.name}
                              </h4>

                              {/* Assigned Faculty Lead */}
                              <div className="flex items-center gap-2 mt-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#0f2748] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {assignedFaculty.avatarInitials}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-gray-900 text-[11px] truncate">
                                    {assignedFaculty.name}
                                  </p>
                                  <p className="text-[10px] text-gray-500 truncate">
                                    Criterion Head
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Proofs Status & Action */}
                            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] gap-2">
                              {critDocs.length > 0 ? (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>{critDocs.length} {critDocs.length === 1 ? 'proof' : 'proofs'} uploaded</span>
                                </span>
                              ) : (
                                <span className="text-amber-700 bg-amber-50 border border-amber-200 font-semibold px-2 py-0.5 rounded text-[10px]">
                                  0 proofs uploaded
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInitiateReminder(assignedFaculty);
                                }}
                                className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer transition-colors shrink-0"
                                title={`Send reminder to ${assignedFaculty.name}`}
                              >
                                <Bell className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Compilation Dossier Table */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
                      <div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                          Team Contributions Review & Compilation Area
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Review each document submitted by faculty, verify against NAAC rubrics, and compile into the final package.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModalCriterionCode('Criterion 1');
                            setSelectedIndicatorCode('1.1');
                            setSelectedMetricCode('1.1.1');
                            setShowAddModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Upload Proof for Team</span>
                        </button>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] border-b border-gray-200">
                          <tr>
                            <th className="py-2.5 px-4">Metric & Title</th>
                            <th className="py-2.5 px-4">Criterion</th>
                            <th className="py-2.5 px-4">Faculty Contributor</th>
                            <th className="py-2.5 px-4">File & Size</th>
                            <th className="py-2.5 px-4">Compilation Status</th>
                            <th className="py-2.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-800">
                          {teamDisplayedDocs.length > 0 ? (
                            teamDisplayedDocs.map((doc) => {
                              const isCompiled = doc.coordinatorReviewStatus === 'compiled' || doc.status === 'submitted_to_school';
                              const isRevisionRequested = doc.coordinatorReviewStatus === 'changes_requested';

                              return (
                                <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                                  {/* Metric & Title */}
                                  <td className="py-3 px-4">
                                    <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mb-1">
                                      Metric {doc.metricCode} ({doc.metricType})
                                    </span>
                                    <h4 className="font-bold text-gray-900 leading-snug">
                                      {doc.title}
                                    </h4>
                                  </td>

                                  {/* Criterion */}
                                  <td className="py-3 px-4 whitespace-nowrap text-gray-600 font-medium">
                                    {doc.criterionCode}
                                  </td>

                                  {/* Faculty Contributor */}
                                  <td className="py-3 px-4">
                                    <span className="font-bold text-gray-900 block truncate">
                                      {doc.facultyName || doc.uploadedBy}
                                    </span>
                                    <span className="text-[10px] text-gray-500 block">
                                      {doc.facultyDesignation || 'Department Faculty'}
                                    </span>
                                  </td>

                                  {/* File */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => openFileInNewTab(doc.fileUrl)}
                                      className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-red-500" />
                                      <span className="truncate max-w-[150px]">{doc.fileName}</span>
                                    </button>
                                    <span className="block text-[10px] text-gray-400 mt-0.5">
                                      {doc.fileSize || '2.4 MB'}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    {isDispatchedToSchool ? (
                                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-flex items-center gap-1">
                                        <Send className="w-3 h-3" />
                                        <span>With School Authority</span>
                                      </span>
                                    ) : isCompiled ? (
                                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-flex items-center gap-1">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                        <span>Compiled in Dossier</span>
                                      </span>
                                    ) : isRevisionRequested ? (
                                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Revision Requested</span>
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                                        Pending Review
                                      </span>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3 px-4 whitespace-nowrap text-right">
                                    <div className="inline-flex items-center gap-1.5 justify-end">
                                      {!isCompiled && !isDispatchedToSchool && (
                                        <button
                                          type="button"
                                          onClick={() => handleCompileDoc(doc.id)}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                                        >
                                          Compile
                                        </button>
                                      )}

                                      {!isDispatchedToSchool && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRevisionDoc(doc);
                                            setRevisionNote(doc.coordinatorFeedback || '');
                                          }}
                                          className="px-2 py-1 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded text-[11px] font-semibold cursor-pointer"
                                          title="Request revision from faculty"
                                        >
                                          Feedback
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => openFileInNewTab(doc.fileUrl)}
                                        className="p-1 text-gray-500 hover:text-blue-600 rounded cursor-pointer"
                                        title="View PDF"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-gray-400">
                                No documents found for this filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------------
              LEVEL 3: KEY INDICATORS ACCORDION FOR SELECTED CRITERION (Matches Screenshot 3)
             --------------------------------------------------------------------- */}
          {selectedYear && selectedCriterionCode && (() => {
            const critSummary = NAAC_CRITERIA_SUMMARY.find(c => c.code === selectedCriterionCode) || NAAC_CRITERIA_SUMMARY[0];
            const assignedFaculty = CSE_DEPARTMENT_FACULTY.find(f => f.criterionAssigned.includes(critSummary.code));
            const indicatorsForCrit = KEY_INDICATORS.filter(ki => ki.criterionCode === critSummary.code);
            const docsForCrit = deptDocs.filter(d => d.criterionCode === critSummary.code);

            return (
              <div className="space-y-5 animate-in fade-in">
                {/* Header & Breadcrumbs (Matches Screenshot 3) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#2563eb] text-white flex items-center justify-center shadow-xs">
                      <Home className="w-4 h-4" />
                    </div>
                    <h1 className="text-sm sm:text-base font-bold text-gray-800">
                      AQAR Supporting Documents for {selectedYear}
                    </h1>
                  </div>

                  {/* Breadcrumb Navigation */}
                  <div className="text-xs text-blue-600 font-medium flex items-center gap-1.5">
                    <button 
                      onClick={() => { setSelectedYear(null); setSelectedCriterionCode(null); }} 
                      className="hover:underline cursor-pointer"
                    >
                      AQAR
                    </button>
                    <span className="text-gray-400">/</span>
                    <button 
                      onClick={() => setSelectedCriterionCode(null)} 
                      className="hover:underline cursor-pointer"
                    >
                      NAAC Criteria
                    </button>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600 font-bold">{critSummary.code}</span>
                  </div>
                </div>

                {/* Criterion Title Bar + Add Documents & AI Buttons */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-gray-800 shrink-0" />
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">
                        {critSummary.code}: {critSummary.name}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Faculty In-Charge: <strong className="text-gray-700">{assignedFaculty?.name || 'Prof. Anita Verma'}</strong> • {docsForCrit.length} Documents Attached
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* AI Audit & Drafter Button */}
                    <button
                      type="button"
                      onClick={() => setShowAiModal(true)}
                      className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>AI Compliance Audit & SSR Drafter</span>
                    </button>

                    {/* Add Documents Button (Matches Screenshot 3) */}
                    <button
                      type="button"
                      onClick={() => {
                        setModalCriterionCode(critSummary.code);
                        if (indicatorsForCrit[0]) {
                          setSelectedIndicatorCode(indicatorsForCrit[0].code);
                          setSelectedMetricCode(indicatorsForCrit[0].metricCodes[0] || '1.1.1');
                        }
                        if (assignedFaculty) setSelectedFacultyId(assignedFaculty.id);
                        setShowAddModal(true);
                      }}
                      className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Documents</span>
                    </button>
                  </div>
                </div>

                {/* Key Indicators Accordion List (Matches Screenshot 3) */}
                <div className="space-y-3">
                  {indicatorsForCrit.map((ki) => {
                    const indicatorDocs = docsForCrit.filter(d => d.metricCode.startsWith(ki.code));
                    const isExpanded = openIndicatorAccordion === ki.code || indicatorDocs.length > 0;

                    return (
                      <div key={ki.code} className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                        {/* Accordion Header */}
                        <div 
                          onClick={() => setOpenIndicatorAccordion(openIndicatorAccordion === ki.code ? null : ki.code)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-800">
                              Key Indicator - {ki.code} {ki.name}
                            </span>
                            {indicatorDocs.length > 0 && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                                {indicatorDocs.length} {indicatorDocs.length === 1 ? 'doc' : 'docs'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>

                        {/* Accordion Body */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50/30">
                            {indicatorDocs.length > 0 ? (
                              <div className="space-y-2 mt-2">
                                {indicatorDocs.map((doc) => (
                                  <div 
                                    key={doc.id}
                                    className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                          Metric {doc.metricCode}
                                        </span>
                                        <h4 className="text-xs font-bold text-gray-900">
                                          {doc.title}
                                        </h4>
                                      </div>
                                      <p className="text-[11px] text-gray-500 mt-1">
                                        Uploaded by: <strong className="text-gray-700">{doc.facultyName || doc.uploadedBy}</strong> ({doc.facultyDesignation || 'Department Faculty'}) • File: {doc.fileName}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => openFileInNewTab(doc.fileUrl)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold cursor-pointer transition-colors"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-red-500" />
                                        <span>View PDF</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </button>

                                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-flex items-center gap-1">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                        <span>Compiled</span>
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-4 text-xs text-gray-400 flex items-center justify-between">
                                <span>No documents uploaded</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setModalCriterionCode(critSummary.code);
                                    setSelectedIndicatorCode(ki.code);
                                    setSelectedMetricCode(ki.metricCodes[0] || '1.1.1');
                                    if (assignedFaculty) setSelectedFacultyId(assignedFaculty.id);
                                    setShowAddModal(true);
                                  }}
                                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                                >
                                  + Add Document for Indicator {ki.code}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* =========================================================================
          MODAL: INITIATE AQAR ACADEMIC YEAR (Initiate button modal from Screenshot 1)
         ========================================================================= */}
      {showInitiateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">
                Initiate New AQAR Academic Year
              </h3>
              <button onClick={() => setShowInitiateModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateNewYear} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Academic Year Format (YYYY-YY) *
                </label>
                <input
                  type="text"
                  value={newInitiateYear}
                  onChange={(e) => setNewInitiateYear(e.target.value)}
                  placeholder="e.g. 2027-28"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <p className="text-[11px] text-gray-500">
                Initiating an AQAR creates the supporting document checklist and criteria matrices for your department.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInitiateModal(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2563eb] text-white rounded font-bold hover:bg-blue-700 shadow-xs"
                >
                  Initiate AQAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          RIGHT SLIDE-OVER DRAWER: ADD SUPPORTING EVIDENCE DOCUMENT
         ========================================================================= */}
      <Drawer
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Supporting Evidence Document"
        maxWidth="max-w-4xl"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-semibold text-xs hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDocument}
              className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-md font-bold text-xs shadow-xs cursor-pointer transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {(() => {
                  const count = activeFileTab === 'new' ? uploadedFiles.length : selectedRepoFiles.length;
                  if (count > 1) return `Save & Attach (${count}) Documents`;
                  if (count === 1) return 'Save & Attach (1) Document';
                  return 'Save & Attach Document';
                })()}
              </span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveDocument} className="p-6 space-y-5 text-xs">
          {/* Active Cycle Context Header */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Accreditation Cycle</span>
              <h4 className="font-bold text-gray-900 text-xs mt-0.5">AQAR {selectedYear || '2025-26'}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Department Program</span>
              <span className="font-semibold text-gray-800 text-xs">B.Tech Computer Science & Engg</span>
            </div>
          </div>

          {/* Criterion, Key Indicator & Metric in ONE SINGLE LINE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Criterion */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5 text-xs">
                Criterion
              </label>
              <select
                value={modalCriterionCode}
                onChange={(e) => {
                  const newCode = e.target.value;
                  setModalCriterionCode(newCode);
                  const kis = KEY_INDICATORS.filter(ki => ki.criterionCode === newCode);
                  if (kis.length > 0) {
                    setSelectedIndicatorCode(kis[0].code);
                    if (kis[0].metricCodes[0]) {
                      setSelectedMetricCode(kis[0].metricCodes[0]);
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-gray-400 focus:outline-hidden font-medium bg-white cursor-pointer shadow-2xs truncate"
              >
                {NAAC_CRITERIA_SUMMARY.map(crit => (
                  <option key={crit.id} value={crit.code}>
                    {crit.code}: {crit.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Key Indicator */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5 text-xs">
                Key Indicator
              </label>
              <select
                value={selectedIndicatorCode}
                onChange={(e) => {
                  setSelectedIndicatorCode(e.target.value);
                  const ki = KEY_INDICATORS.find(k => k.code === e.target.value);
                  if (ki && ki.metricCodes[0]) setSelectedMetricCode(ki.metricCodes[0]);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-gray-400 focus:outline-hidden font-medium bg-white cursor-pointer shadow-2xs truncate"
              >
                {KEY_INDICATORS.filter(ki => ki.criterionCode === modalCriterionCode).map(ki => (
                  <option key={ki.code} value={ki.code}>
                    {ki.code} - {ki.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Metric Code */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5 text-xs">
                Metric Code
              </label>
              <select
                value={selectedMetricCode}
                onChange={(e) => setSelectedMetricCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-gray-400 focus:outline-hidden font-medium bg-white cursor-pointer shadow-2xs truncate"
              >
                {NAAC_METRICS_LIST.filter(m => m.code.startsWith(selectedIndicatorCode)).map(m => (
                  <option key={m.code} value={m.code}>
                    Metric {m.code} ({m.metricType}) - {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>


          {/* Compact Metric Summary Strip (Neutral Gray, Reduced Height) */}
          {(() => {
            const currentMetric = NAAC_METRICS_LIST.find(m => m.code === selectedMetricCode);
            if (!currentMetric) return null;
            return (
              <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs flex items-center justify-between gap-3 shadow-2xs">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="font-bold text-gray-900 shrink-0">Metric {currentMetric.code}:</span>
                  <span className="font-medium text-gray-800 truncate">{currentMetric.name}</span>
                  <span className="text-gray-300 hidden md:inline">•</span>
                  <span className="text-gray-500 text-[11px] truncate hidden md:inline">{currentMetric.description}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                  {currentMetric.metricType === 'QnM' ? 'Quantitative (QnM)' : 'Qualitative (QlM)'}
                </span>
              </div>
            );
          })()}

          {/* Evidence File Attachment - Spacious Multiple Document Support */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-gray-700 text-xs">
                Evidence Documents *
              </label>

              {/* Segmented Switch with Counts */}
              <div className="inline-flex rounded-lg p-0.5 bg-gray-100 border border-gray-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveFileTab('new')}
                  className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    activeFileTab === 'new'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Upload Files {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFileTab('existing')}
                  className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    activeFileTab === 'existing'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  From Repository {selectedRepoFiles.length > 0 && `(${selectedRepoFiles.length})`}
                </button>
              </div>
            </div>

            {/* TAB 1: UPLOAD MULTIPLE FILES */}
            {activeFileTab === 'new' && (
              <div className="space-y-3">
                {/* Drag & Drop Upload Zone */}
                <input
                  type="file"
                  id="evidence-file-input"
                  multiple
                  accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                  onChange={handleLocalFileUpload}
                  className="hidden"
                />
                <label 
                  htmlFor="evidence-file-input" 
                  className="cursor-pointer block border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-4 text-center transition-all bg-gray-50/50 hover:bg-gray-100/60"
                >
                  <div className="flex items-center justify-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center shrink-0 shadow-2xs">
                      <FolderOpen className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-gray-800 hover:underline block">
                        Choose files or drag & drop multiple documents
                      </span>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        PDF, DOCX, XLSX, Geo-tagged photos (Upload multiple, up to 25 MB each)
                      </span>
                    </div>
                  </div>
                </label>

                {/* Staged Uploaded Documents Queue Area - Generous Height */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                      Uploaded Documents List ({uploadedFiles.length})
                    </span>
                    {uploadedFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUploadedFiles([])}
                        className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-xl p-2.5 bg-gray-50/70 min-h-[220px] max-h-[380px] overflow-y-auto space-y-2">
                    {uploadedFiles.length === 0 ? (
                      <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center p-4 text-gray-400">
                        <FileText className="w-8 h-8 text-gray-300 mb-2 stroke-[1.5]" />
                        <p className="text-xs font-medium text-gray-600">No documents uploaded yet</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Files uploaded above will appear here before saving.</p>
                      </div>
                    ) : (
                      uploadedFiles.map((file) => (
                        <div 
                          key={file.id} 
                          className="p-2.5 rounded-lg bg-white border border-gray-200 shadow-2xs flex items-center justify-between text-xs hover:border-blue-200 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-red-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-semibold text-gray-900 block truncate">{file.name}</span>
                              <span className="text-[10px] text-gray-400">{file.size}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Ready to Attach
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveUploadedFile(file.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                              title="Remove document"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SELECT MULTIPLE FROM REPOSITORY */}
            {activeFileTab === 'existing' && (() => {
              const filteredRepoFiles = REPOSITORY_SAMPLE_FILES.filter(f =>
                f.name.toLowerCase().includes(repoSearchQuery.toLowerCase())
              );
              const allFilteredSelected = filteredRepoFiles.length > 0 && filteredRepoFiles.every(f => selectedRepoFiles.includes(f.name));

              return (
                <div className="space-y-2">
                  {/* Search & Select All Bar */}
                  <div className="flex items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700 select-none">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAllRepo}
                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Select All</span>
                    </label>

                    <div className="relative flex-1 max-w-xs">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        placeholder="Search repository documents..."
                        value={repoSearchQuery}
                        onChange={(e) => setRepoSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 shrink-0">
                      {selectedRepoFiles.length} Selected
                    </span>
                  </div>

                  {/* Spacious Scrollable Document List Area */}
                  <div className="border border-gray-200 rounded-xl p-2 bg-white min-h-[280px] max-h-[420px] overflow-y-auto divide-y divide-gray-100 text-xs">
                    {filteredRepoFiles.length === 0 ? (
                      <div className="py-12 text-center text-gray-400">
                        <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2 stroke-[1.5]" />
                        <p className="text-xs font-medium text-gray-600">No matching documents found</p>
                      </div>
                    ) : (
                      filteredRepoFiles.map((file) => {
                        const isChecked = selectedRepoFiles.includes(file.name);
                        return (
                          <label 
                            key={file.id} 
                            className={`flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors ${
                              isChecked ? 'bg-blue-50/70 border border-blue-200' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              name="selectedRepoFiles"
                              checked={isChecked}
                              onChange={() => toggleRepoFile(file.name)}
                              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <FileText className="w-4 h-4 text-red-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="block font-medium text-gray-900 truncate">{file.name}</span>
                              <span className="block text-[10px] text-gray-400">{file.size} • Modified {file.date}</span>
                            </div>
                            {isChecked && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-300 shrink-0">
                                Selected
                              </span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </form>
      </Drawer>

      {/* =========================================================================
          DRAWER: SUBMIT FOR REVIEW (Version 1: Status Hand-off & Intimating Approver)
         ========================================================================= */}
      <Drawer
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit for Review"
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="text-xs font-semibold px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmitToSchool}
              className="text-xs font-bold px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg shadow-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Review ➔</span>
            </button>
          </div>
        }
      >
        <div className="p-6 space-y-5 text-xs">
          {/* Submission Context Card */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Department Submission
              </span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                AQAR {selectedYear || '2025-26'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-gray-900">
              B.Tech Computer Science & Engineering
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-1">
              <span>
                Proofs to Submit:{' '}
                <strong className="text-gray-900 font-bold">
                  {pendingDocs.length > 0 ? pendingDocs.length : deptDocs.length} Documents
                </strong>
                {submittedDocs.length > 0 && pendingDocs.length > 0 && (
                  <span className="text-blue-700 font-medium ml-1">
                    ({submittedDocs.length} already submitted)
                  </span>
                )}
              </span>
              <span>•</span>
              <span>
                Criteria Covered:{' '}
                <strong className="text-gray-900 font-bold">
                  {coveredCriteriaCount} of 7 Criteria Covered
                </strong>
              </span>
            </div>
          </div>

          {/* Intimating Approver Card */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span className="font-bold text-blue-900 text-xs">Assigned Reviewer</span>
            </div>
            <div className="pl-6 space-y-1">
              <p className="font-bold text-gray-900 text-xs">Dr. Rajesh Sharma</p>
              <p className="text-[11px] text-gray-600">School Coordinator / Dean (School of Tech & Comp. Eng.)</p>
              <p className="text-[11px] text-blue-800 pt-1 leading-relaxed">
                Submitting will notify Dr. Rajesh Sharma that B.Tech CSE documents are ready for school-level verification.
              </p>
            </div>
          </div>

          {/* Note to Approver (Optional) */}
          <div>
            <label className="block font-bold text-gray-800 mb-1.5 text-xs">
              Note or Remarks for Approver (Optional)
            </label>
            <textarea
              rows={3}
              value={transmittalRemarks}
              onChange={(e) => setTransmittalRemarks(e.target.value)}
              placeholder="Add any context or comments for Dr. Rajesh Sharma..."
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs text-gray-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden placeholder:text-gray-400"
            />
          </div>
        </div>
      </Drawer>

      {/* =========================================================================
          MODAL 3: REQUEST REVISION FEEDBACK FROM FACULTY MEMBER
         ========================================================================= */}
      {revisionDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-amber-900">
                  Request Revision from Faculty
                </h3>
              </div>
              <button onClick={() => setRevisionDoc(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <span className="block text-[11px] text-gray-500">Document:</span>
                <strong className="text-gray-900">{revisionDoc.title}</strong>
              </div>
              <div>
                <span className="block text-[11px] text-gray-500">Assigned Faculty:</span>
                <strong className="text-gray-900">{revisionDoc.facultyName || revisionDoc.uploadedBy}</strong>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Coordinator Instructions / Notes:
                </label>
                <textarea
                  rows={3}
                  value={revisionNote}
                  placeholder="e.g. Please attach page 4 with the Dean's counter-signature."
                  onChange={(e) => setRevisionNote(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRevisionDoc(null)}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRevisionRequest}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-xs"
              >
                Send Request to Faculty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REMINDER PREVIEW POPUP (With "Don't show again" setting)
         ========================================================================= */}
      {reminderFaculty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col">
            {/* Header - Clean white, no colored banner */}
            <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-sm text-gray-900">
                  Contribution Reminder Preview
                </h3>
              </div>
              <button 
                onClick={() => setReminderFaculty(null)} 
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              {/* Recipient Details Card */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0f2748] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {reminderFaculty.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-gray-900 text-xs truncate">{reminderFaculty.name}</strong>
                    <span className="text-[10px] text-gray-500 truncate">{reminderFaculty.email}</span>
                  </div>
                  <p className="text-[11px] text-blue-700 font-semibold truncate mt-0.5">
                    {reminderFaculty.criterionAssigned} Head
                  </p>
                </div>
              </div>

              {/* Subject Field */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 text-xs">
                  Email & In-App Subject:
                </label>
                <input
                  type="text"
                  value={reminderSubject}
                  onChange={(e) => setReminderSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Message Field (Editable) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 text-xs">
                  Message Content (Editable):
                </label>
                <textarea
                  rows={6}
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-xs text-gray-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden leading-relaxed font-sans"
                />
              </div>

              {/* Don't show me again checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={dontShowReminderAgain}
                    onChange={(e) => setDontShowReminderAgain(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-medium text-gray-700">
                    Don't show this message again (send directly next time)
                  </span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setReminderFaculty(null)}
                className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendReminderConfirm}
                className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reminder ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: AI COMPLIANCE AUDIT & SSR QUALITATIVE DRAFTER (AI Innovation)
         ========================================================================= */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    AI NAAC Compliance Audit & SSR Drafter
                  </h3>
                  <p className="text-[11px] text-purple-200">
                    {selectedCriterionCode}: Automated Audit & Synthesis for School Coordinator
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* 1. Audit Checklist Card */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                  <Bot className="w-4 h-4 text-purple-700" />
                  <span>AI Automated Verification Findings (Jan 2023 Manual)</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-[11px] text-gray-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Academic Council & BoS Minutes:</strong> Verified. Curricular alignment with CBCS structure is documented.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-gray-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Outcome-Based Rubrics:</strong> Bloom taxonomy mappings for direct PO/CO attainment verified.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Recommended Action:</strong> Metric 1.4 requires Stakeholder ATR (Action Taken Report) to be officially counter-signed by the School Dean.</span>
                  </div>
                </div>
              </div>

              {/* 2. AI Synthesized Qualitative SSR Narrative */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 text-xs">
                    Synthesized Qualitative Narrative (SSR Draft - Max 500 Words):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCopiedNarrative(true);
                      setTimeout(() => setCopiedNarrative(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedNarrative ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 leading-relaxed font-serif text-[11px] space-y-2 select-text">
                  <p>
                    The Department of Computer Science & Engineering adheres to a rigorous Outcome-Based Education (OBE) framework aligned with National Education Policy (NEP) guidelines. The curriculum structure integrates semester-wise Programme Outcomes (POs) and Course Outcomes (COs) mapped to revised Bloom’s Taxonomy levels. 
                  </p>
                  <p>
                    Curricular revisions are validated through structured Board of Studies (BoS) meetings comprising academic experts and corporate industry leaders. Experiential learning is reinforced through 12 industrial lab projects, cloud computing capstones, and mandatory 6-month industry internships, ensuring students achieve optimal technical attainment.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-gray-500">
                Ready to include with submission to School Coordinator
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  showToast('AI SSR Narrative saved to department package');
                }}
                className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs cursor-pointer"
              >
                Include in Submission Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
