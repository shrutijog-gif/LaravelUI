import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  School, 
  FileCheck2, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Search, 
  Sparkles, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Check, 
  X, 
  AlertCircle, 
  RotateCcw,
  SlidersHorizontal,
  Home,
  Layers,
  Send,
  Eye,
  MessageSquare,
  Trash2,
  Info,
  BarChart3,
  ArrowRight,
  Bell,
  ShieldCheck,
  Lock,
  GraduationCap,
  Filter,
  CheckSquare
} from 'lucide-react';
import { 
  ITM_SCHOOLS, 
  NAAC_CRITERIA_SUMMARY, 
  NAAC_METRICS_LIST, 
  KEY_INDICATORS,
  NaacEvidenceDocument, 
  NaacProgram,
  getStoredNaacDocuments, 
  reviewSchoolDocument,
  reviewBatchSchoolDocuments,
  deleteNaacDocument,
  submitBatchNaacDocuments
} from '../../../data/naacDmsData';
import { openFileInNewTab } from '../../../utils/fileHelper';
import { NaacQuickUploadLanding } from './NaacQuickUploadLanding';
import { Drawer } from '../../common/Drawer';

export interface SchoolProgramMeta {
  id: string;
  name: string;
  shortCode: string;
  degreeType: 'UG' | 'PG' | 'Institutional';
  coordinatorName: string;
  coordinatorEmail: string;
  isNaacFacing: boolean;
  naacScopeLabel: string;
  themeColor: string;
  gradient: string;
}

export const SOT_PROGRAMS_METADATA: SchoolProgramMeta[] = [
  {
    id: 'prog-cse',
    name: 'B.Tech Computer Science & Engineering',
    shortCode: 'B.Tech CSE',
    degreeType: 'UG',
    coordinatorName: 'Prof. Anita Verma',
    coordinatorEmail: 'cse.coord@itmuniversity.edu',
    isNaacFacing: true,
    naacScopeLabel: '🎯 Facing NAAC',
    themeColor: 'blue',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'prog-bca',
    name: 'BCA & Cloud Computing',
    shortCode: 'BCA',
    degreeType: 'UG',
    coordinatorName: 'Prof. Ramesh Kulkarni',
    coordinatorEmail: 'bca.coord@itmuniversity.edu',
    isNaacFacing: true,
    naacScopeLabel: '🎯 Facing NAAC',
    themeColor: 'teal',
    gradient: 'from-teal-600 to-emerald-700',
  },
  {
    id: 'prog-cyber',
    name: 'B.Sc Cyber Security & Digital Forensics',
    shortCode: 'B.Sc Cyber',
    degreeType: 'UG',
    coordinatorName: 'Prof. Neha Gupta',
    coordinatorEmail: 'cyber.coord@itmuniversity.edu',
    isNaacFacing: false,
    naacScopeLabel: '📋 Non-Facing (Contributor)',
    themeColor: 'emerald',
    gradient: 'from-emerald-600 to-cyan-700',
  },
  {
    id: 'prog-ai',
    name: 'M.Tech Artificial Intelligence & Machine Learning',
    shortCode: 'M.Tech AI',
    degreeType: 'PG',
    coordinatorName: 'Dr. Sanjeev Rao',
    coordinatorEmail: 'ai.coord@itmuniversity.edu',
    isNaacFacing: false,
    naacScopeLabel: '📋 Non-Facing (Contributor)',
    themeColor: 'indigo',
    gradient: 'from-indigo-600 to-purple-700',
  },
  {
    id: 'school-common',
    name: "School Level / Dean's Office Common Proofs",
    shortCode: 'School Common',
    degreeType: 'Institutional',
    coordinatorName: 'Dr. Rajesh Sharma',
    coordinatorEmail: 'rajesh.sharma@itmuniversity.edu',
    isNaacFacing: true,
    naacScopeLabel: '🏛️ School Common',
    themeColor: 'purple',
    gradient: 'from-slate-700 to-gray-900',
  },
];

interface SchoolCoordinatorDeskProps {
  initialTab?: 'quick-upload' | 'ssr-matrix' | 'repository' | 'review-queue';
}

export const SchoolCoordinatorDesk: React.FC<SchoolCoordinatorDeskProps> = ({
  initialTab = 'ssr-matrix',
}) => {
  const [deskMode, setDeskMode] = useState<'quick-upload' | 'ssr-matrix' | 'repository' | 'review-queue'>(initialTab);
  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() => getStoredNaacDocuments());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // NAAC Readiness & Drawer States
  const [selectedProgramForDrawer, setSelectedProgramForDrawer] = useState<string | null>(null);
  const [remindersSent, setRemindersSent] = useState<Record<string, string>>({});
  const [tableScopeFilter, setTableScopeFilter] = useState<'all' | 'facing' | 'non-facing'>('all');
  const [tableStatusFilter, setTableStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [drawerTabFilter, setDrawerTabFilter] = useState<'all' | 'pending' | 'approved' | 'missing'>('all');
  const [drawerSearch, setDrawerSearch] = useState<string>('');

  // School context: School of Technology & Computer Engineering (sch-tech)
  const currentSchool = ITM_SCHOOLS.find(s => s.id === 'sch-tech') || ITM_SCHOOLS[0];
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');
  const [selectedCriterionFilter, setSelectedCriterionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('2025-26');

  // Active selected program object (if specific program chosen)
  const currentProgram = currentSchool.programs.find(p => p.id === selectedProgramFilter);

  // Hierarchy expansion state
  const [collapsedCriteria, setCollapsedCriteria] = useState<Record<string, boolean>>({
    'Criterion 2': true,
    'Criterion 3': true,
    'Criterion 4': true,
    'Criterion 5': true,
    'Criterion 6': true,
    'Criterion 7': true,
  });

  const [collapsedKeyIndicators, setCollapsedKeyIndicators] = useState<Record<string, boolean>>({
    '1.2': true,
    '1.3': true,
    '1.4': true,
    '2.2': true,
    '2.3': true,
  });

  // Revision Feedback Modal State
  const [revisionDoc, setRevisionDoc] = useState<NaacEvidenceDocument | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState<string>('');

  // Batch Selection State for Program Submissions Review
  const [selectedReviewDocIds, setSelectedReviewDocIds] = useState<string[]>([]);

  // Batch Selection State for School Repository (Forwarding to University Coordinator)
  const [selectedRepoDocIds, setSelectedRepoDocIds] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatDocDate = (dateStr?: string) => {
    if (!dateStr) return '21 Oct 2026';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '21 Oct 2026';
    }
  };

  const getCleanPersonName = (name?: string) => {
    if (!name || name === 'Program Coordinator') return 'Prof. Anita Verma';
    const cleaned = name.replace(/\s*\([^)]*\)/g, '').trim();
    if (cleaned.toLowerCase() === 'program coordinator') return 'Prof. Anita Verma';
    return cleaned || 'Prof. Anita Verma';
  };

  const getDepartmentDot = (doc: NaacEvidenceDocument) => {
    const isCommon = doc.programId === 'school-common' || !doc.programId || doc.uploadedBy?.includes('School Coordinator');
    if (isCommon) {
      return {
        color: 'bg-purple-500 ring-2 ring-purple-200',
        label: 'School Common Proof',
        shortName: 'School Common',
        emoji: '🟣'
      };
    }
    const progId = doc.programId || '';
    const progLower = (doc.programName || '').toLowerCase();
    if (progId === 'prog-cse' || progLower.includes('cse') || progLower.includes('computer')) {
      return {
        color: 'bg-blue-500 ring-2 ring-blue-200',
        label: doc.programName || 'B.Tech CSE',
        shortName: 'B.Tech CSE',
        emoji: '🔵'
      };
    }
    if (progId === 'prog-bca' || progId === 'prog-it' || progLower.includes('bca') || progLower.includes('cloud') || progLower.includes('information')) {
      return {
        color: 'bg-teal-500 ring-2 ring-teal-200',
        label: doc.programName || 'BCA & Cloud Computing',
        shortName: 'BCA & Cloud',
        emoji: '🟢'
      };
    }
    if (progId === 'prog-cyber' || progLower.includes('cyber') || progLower.includes('forensic')) {
      return {
        color: 'bg-emerald-500 ring-2 ring-emerald-200',
        label: doc.programName || 'B.Sc Cyber Security',
        shortName: 'B.Sc Cyber',
        emoji: '🟢'
      };
    }
    if (progId === 'prog-ai' || progLower.includes('ai') || progLower.includes('machine learning')) {
      return {
        color: 'bg-indigo-500 ring-2 ring-indigo-200',
        label: doc.programName || 'M.Tech AI & ML',
        shortName: 'M.Tech AI-ML',
        emoji: '🟣'
      };
    }
    return {
      color: 'bg-slate-400 ring-2 ring-slate-200',
      label: doc.programName || 'Department Proof',
      shortName: 'Department',
      emoji: '⚪'
    };
  };

  const refreshDocuments = () => {
    setDocuments(getStoredNaacDocuments());
  };

  useEffect(() => {
    const handleUpdate = () => refreshDocuments();
    window.addEventListener('naac-dms-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('naac-dms-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // All documents belonging to this school
  const allSchoolDocs = documents.filter(d => 
    Boolean(
      d && (
        d.schoolId === currentSchool.id || 
        d.schoolId === 'sch-tech' || 
        d.schoolId === 'sch-eng' ||
        d.programId === 'prog-cse' ||
        d.programId === 'prog-bca' ||
        d.programId === 'prog-cyber' ||
        d.programId === 'prog-ai' ||
        d.programName?.toLowerCase().includes('computer') ||
        d.programName?.toLowerCase().includes('technology') ||
        d.uploadedBy?.toLowerCase().includes('rajesh') ||
        d.uploadedBy?.toLowerCase().includes('anita')
      )
    )
  );

  // Documents submitted by program coordinators needing school review
  const pendingReviewDocs = allSchoolDocs.filter(d => d.status === 'submitted_to_school');
  const approvedDocs = allSchoolDocs.filter(d => d.status === 'approved_by_school');
  const verifiedDocs = allSchoolDocs.filter(d => d.status === 'university_verified');

  // School Repository: Approved or submitted proofs (school approved, forwarded to university, university verified, or uploaded by school coordinator)
  const schoolDocs = allSchoolDocs.filter(d => 
    d.status === 'approved_by_school' || d.status === 'submitted_to_university' || d.status === 'university_verified' || !d.status || d.uploadedBy?.includes('School Coordinator')
  );

  // Program-filtered lists
  const matchesProgram = (d: NaacEvidenceDocument) => {
    if (selectedProgramFilter === 'all') return true;
    if (selectedProgramFilter === 'school-common') {
      return !d.programId || d.programId === 'school-common' || d.programId === 'sch-tech' || d.programId === 'sch-eng' || d.uploadedBy?.includes('School Coordinator');
    }
    return d.programId === selectedProgramFilter;
  };

  const filteredSchoolDocs = schoolDocs.filter(matchesProgram);
  const filteredPendingDocs = pendingReviewDocs.filter(matchesProgram);

  // Helper to match a document to a specific academic program in this school
  const matchesProgramId = (doc: NaacEvidenceDocument, progId: string) => {
    if (progId === 'school-common') {
      return (
        doc.programId === 'school-common' ||
        !doc.programId ||
        doc.programId === 'sch-tech' ||
        doc.programId === 'sch-eng' ||
        doc.uploadedBy?.includes('School Coordinator') ||
        doc.uploadedBy?.includes('Rajesh Sharma') ||
        doc.title?.toLowerCase().includes('dean') ||
        doc.title?.toLowerCase().includes('governing') ||
        doc.title?.toLowerCase().includes('fdp')
      );
    }
    if (progId === 'prog-cse') {
      return (
        doc.programId === 'prog-cse' ||
        doc.programName?.toLowerCase().includes('cse') ||
        doc.programName?.toLowerCase().includes('computer science') ||
        doc.fileName?.toLowerCase().includes('cse') ||
        doc.id?.includes('cse')
      );
    }
    if (progId === 'prog-bca') {
      return (
        doc.programId === 'prog-bca' ||
        doc.programName?.toLowerCase().includes('bca') ||
        doc.programName?.toLowerCase().includes('cloud') ||
        doc.fileName?.toLowerCase().includes('bca') ||
        doc.id?.includes('bca')
      );
    }
    if (progId === 'prog-cyber') {
      return (
        doc.programId === 'prog-cyber' ||
        doc.programName?.toLowerCase().includes('cyber') ||
        doc.fileName?.toLowerCase().includes('cyber') ||
        doc.id?.includes('cyber')
      );
    }
    if (progId === 'prog-ai') {
      return (
        doc.programId === 'prog-ai' ||
        doc.programName?.toLowerCase().includes('ai') ||
        doc.programName?.toLowerCase().includes('artificial') ||
        doc.fileName?.toLowerCase().includes('ai') ||
        doc.id?.includes('ai')
      );
    }
    return doc.programId === progId;
  };

  // Overall School Readiness calculation: % of 7 NAAC criteria covered by at least 1 document in this school
  const schoolCriteriaWithDocs = new Set(allSchoolDocs.map(d => d.criterionCode));
  const overallSchoolReadiness = Math.min(100, Math.round((schoolCriteriaWithDocs.size / 7) * 100));

  const handleSendProgramReminder = (prog: SchoolProgramMeta) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRemindersSent(prev => ({ ...prev, [prog.id]: timeStr }));
    showToast(`📢 Official School IQAC Reminder sent to ${prog.coordinatorName} (${prog.coordinatorEmail}) for ${prog.shortCode} evidence proof submission.`);
  };

  // Approve & Move to School Repository
  const handleApproveDocument = (doc: NaacEvidenceDocument) => {
    const targetIds = [doc.id, doc.fileName].filter(Boolean) as string[];
    const updatedDocs = reviewBatchSchoolDocuments(
      targetIds, 
      true, 
      'Approved by School Coordinator & Dean. All evidentiary requirements satisfied for AQAR/SSR compilation.',
      'Dr. Rajesh Sharma (School Coordinator)'
    );
    setSelectedReviewDocIds(prev => prev.filter(id => id !== doc.id));
    setDocuments([...updatedDocs]);
    showToast(`✅ Approved "${doc.fileName || doc.title}" into School Repository!`);
  };

  // Batch Approve Selected Documents
  const handleBatchApproveSelected = () => {
    if (selectedReviewDocIds.length === 0) return;
    const targetIds = [...selectedReviewDocIds];
    const updatedDocs = reviewBatchSchoolDocuments(
      targetIds, 
      true, 
      'Approved by School Coordinator & Dean. All evidentiary requirements satisfied for AQAR/SSR compilation.',
      'Dr. Rajesh Sharma (School Coordinator)'
    );
    setSelectedReviewDocIds([]);
    setDocuments([...updatedDocs]);
    showToast(`✅ Successfully approved ${targetIds.length} document${targetIds.length > 1 ? 's' : ''} into School Repository!`);
  };

  // Selection handlers for School Repository
  const handleToggleSelectRepoDoc = (docId: string) => {
    setSelectedRepoDocIds(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const allVisibleRepoDocs = filteredSchoolDocs.filter(d => {
    if (selectedCriterionFilter !== 'all' && d.criterionCode !== selectedCriterionFilter) return false;
    if (!searchQuery.trim()) return true;
    return (
      (d.fileName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.metricCode.includes(searchQuery)
    );
  });

  const allRepoSelected = allVisibleRepoDocs.length > 0 && allVisibleRepoDocs.every(d => selectedRepoDocIds.includes(d.id));

  const handleToggleSelectAllRepo = () => {
    if (allRepoSelected) {
      setSelectedRepoDocIds(prev => prev.filter(id => !allVisibleRepoDocs.some(d => d.id === id)));
    } else {
      const newIds = Array.from(new Set([...selectedRepoDocIds, ...allVisibleRepoDocs.map(d => d.id)]));
      setSelectedRepoDocIds(newIds);
    }
  };

  // Submit selected School Repository documents to University Coordinator (Central IQAC)
  const handleSubmitToUniversity = () => {
    if (selectedRepoDocIds.length === 0) return;
    const count = submitBatchNaacDocuments(
      selectedRepoDocIds,
      'submitted_to_university',
      {
        schoolReviewedBy: 'Dr. Rajesh Sharma (School Coordinator)',
        schoolReviewedAt: new Date().toISOString(),
      }
    );
    setSelectedRepoDocIds([]);
    refreshDocuments();
    showToast(`🚀 Successfully submitted ${count} document${count > 1 ? 's' : ''} to University Coordinator (Central IQAC)!`);
  };

  // Submit Revision Feedback
  const handleSubmitRevision = () => {
    if (!revisionDoc) return;
    const note = revisionFeedback.trim() || 'Please re-upload with official departmental stamp and BoS verification.';
    const updatedDocs = reviewBatchSchoolDocuments(
      [revisionDoc.id, revisionDoc.fileName].filter(Boolean) as string[], 
      false, 
      note, 
      'Dr. Rajesh Sharma (School Coordinator)'
    );
    setDocuments([...updatedDocs]);
    setRevisionDoc(null);
    setRevisionFeedback('');
    showToast(`⚠️ Revision request sent back to Program Coordinator for "${revisionDoc.fileName}".`);
  };

  const toggleCriterion = (code: string) => {
    setCollapsedCriteria(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleKeyIndicator = (code: string) => {
    setCollapsedKeyIndicators(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const expandAll = () => {
    setCollapsedCriteria({});
    setCollapsedKeyIndicators({});
  };

  const collapseAll = () => {
    const allCrit: Record<string, boolean> = {};
    NAAC_CRITERIA_SUMMARY.forEach(c => { allCrit[c.code] = true; });
    setCollapsedCriteria(allCrit);

    const allKi: Record<string, boolean> = {};
    KEY_INDICATORS.forEach(k => { allKi[k.code] = true; });
    setCollapsedKeyIndicators(allKi);
  };

  // Switch Portal Role helper
  const handleSwitchPortalRole = (role: 'naac-faculty' | 'naac-program' | 'naac-school' | 'naac-university') => {
    localStorage.setItem('college_cms_portal_type', role);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#0f2748] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-blue-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ACTION TABS BAR FOR REPOSITORY & REVIEW QUEUE MODES */}
      {deskMode !== 'quick-upload' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1 flex items-center justify-between">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDeskMode('quick-upload')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                (deskMode as string) === 'quick-upload'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick Proof Drop</span>
            </button>

            <button
              type="button"
              onClick={() => setDeskMode('ssr-matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                deskMode === 'ssr-matrix'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>NAAC Readiness</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 rounded-full font-bold">
                {overallSchoolReadiness}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDeskMode('review-queue')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                deskMode === 'review-queue'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Review Documents</span>
              {pendingReviewDocs.length > 0 && (
                <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {pendingReviewDocs.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setDeskMode('repository')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                deskMode === 'repository'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>School Repository</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 rounded-full font-bold">
                {schoolDocs.length}
              </span>
            </button>
          </div>

          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-mono text-xs font-semibold border border-blue-200">
            AQAR {academicYear}
          </span>
        </div>
      )}

      {/* MAIN BODY AREA */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${deskMode === 'quick-upload' ? 'pt-2' : 'pt-6'}`}>
        {/* VIEW 1: GOOGLE-STYLE QUICK UPLOAD BAR (UNIFIED ONE LINE BAR) */}
        {deskMode === 'quick-upload' && (
          <NaacQuickUploadLanding
            academicYear={academicYear}
            role="school"
            hideTopUploadButton={true}
            topBarLeftSlot={
              <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeskMode('quick-upload')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white text-blue-700 shadow-2xs border border-slate-200/80"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Quick Proof Drop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeskMode('ssr-matrix')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>NAAC Readiness</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 rounded-full font-bold">
                    {overallSchoolReadiness}%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeskMode('review-queue')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Review Program Documents</span>
                  {pendingReviewDocs.length > 0 && (
                    <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                      {pendingReviewDocs.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDeskMode('repository')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>School Repository</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 rounded-full font-bold">
                    {schoolDocs.length}
                  </span>
                </button>
              </div>
            }
            headingTitle="Drop NAAC Evidence"
            schoolId={currentSchool.id}
            schoolName={currentSchool.name}
            submitTargetName="University Coordinator"
            uploaderName="Dr. Rajesh Sharma (School Coordinator)"
            storageKeySuffix="school_tech"
            onNavigateToDocumentList={(critCode, metricCode) => {
              setDeskMode('repository');
              if (critCode) {
                setSelectedCriterionFilter(critCode);
                setCollapsedCriteria(prev => ({ ...prev, [critCode]: false }));
              }
            }}
          />
        )}

        {/* VIEW 2: SCHOOL DOCUMENT REPOSITORY (GRID) */}
        {deskMode === 'repository' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Top Filter and Search Bar (Single Line, No Scrollbar) */}
            <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Criterion Filter */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-gray-600 whitespace-nowrap text-[11px]">Criterion:</span>
                  <select
                    value={selectedCriterionFilter}
                    onChange={(e) => setSelectedCriterionFilter(e.target.value)}
                    className="px-2 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 cursor-pointer focus:ring-1 focus:ring-blue-500 max-w-[155px] truncate"
                  >
                    <option value="all">All Criteria (1–7)</option>
                    {NAAC_CRITERIA_SUMMARY.map(c => (
                      <option key={c.id} value={c.code}>{c.code}: {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Program Filter */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-gray-600 whitespace-nowrap text-[11px]">Program:</span>
                  <select
                    value={selectedProgramFilter}
                    onChange={(e) => setSelectedProgramFilter(e.target.value)}
                    className="px-2 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 cursor-pointer focus:ring-1 focus:ring-blue-500 max-w-[170px] truncate"
                  >
                    <option value="all">All Programs (5)</option>
                    <option value="prog-cse">🔵 B.Tech CSE</option>
                    <option value="prog-bca">🟢 BCA & Cloud</option>
                    <option value="prog-cyber">🟢 B.Sc Cyber</option>
                    <option value="prog-ai">🟣 M.Tech AI-ML</option>
                    <option value="school-common">🟣 School Common</option>
                  </select>
                </div>
              </div>

              {/* Search + Expand/Collapse */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search proofs, metrics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-lg text-xs w-44 sm:w-56 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="inline-flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50 text-[11px] font-semibold text-gray-600 shrink-0 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="px-2 py-1 hover:bg-white rounded cursor-pointer transition-colors"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="px-2 py-1 hover:bg-white rounded cursor-pointer transition-colors"
                  >
                    Collapse All
                  </button>
                </div>
              </div>
            </div>

            {/* School Repository Hierarchical Table with Integrated Department Key */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
              {/* Integrated Department Color Key Strip + Batch Action */}
              <div className="bg-slate-50/90 border-b border-gray-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Department Key:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-gray-700">
                    <span className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-default" title="B.Tech Computer Science & Engineering">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200 shrink-0"></span>
                      <span>B.Tech CSE</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 hover:text-teal-600 transition-colors cursor-default" title="BCA & Cloud Computing">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-200 shrink-0"></span>
                      <span>BCA & Cloud</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition-colors cursor-default" title="B.Sc Cyber Security & Digital Forensics">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0"></span>
                      <span>B.Sc Cyber</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-default" title="M.Tech Artificial Intelligence & Machine Learning">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-200 shrink-0"></span>
                      <span>M.Tech AI-ML</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 hover:text-purple-600 transition-colors cursor-default" title="School Common Proofs (All Programs)">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-200 shrink-0"></span>
                      <span>School Common</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedRepoDocIds.length > 0 && (
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      {selectedRepoDocIds.length} selected
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmitToUniversity}
                    disabled={selectedRepoDocIds.length === 0}
                    className="px-3.5 py-1.5 bg-[#0f2748] hover:bg-[#183963] active:scale-[0.99] text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    title={
                      selectedRepoDocIds.length === 0
                        ? 'Select documents with checkboxes to submit to University Coordinator'
                        : `Submit ${selectedRepoDocIds.length} selected document(s) to University Coordinator`
                    }
                  >
                    <Send className="w-3.5 h-3.5 text-blue-200" />
                    <span>Submit to University Coordinator {selectedRepoDocIds.length > 0 ? `(${selectedRepoDocIds.length})` : ''}</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 w-[34%]">Metric / NAAC Hierarchy</th>
                      <th className="py-2.5 px-3 w-[8%]">Type</th>
                      <th className="py-2.5 px-3 w-[28%]">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={allRepoSelected}
                            onChange={handleToggleSelectAllRepo}
                            disabled={allVisibleRepoDocs.length === 0}
                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-40 accent-[#0f2748]"
                            title={allRepoSelected ? 'Deselect all' : 'Select all documents in School Repository'}
                          />
                          <span>Attached Document</span>
                        </div>
                      </th>
                      <th className="py-2.5 px-3 w-[15%]">
                        <div className="flex items-center gap-1.5">
                          <span>Uploaded By</span>
                          <span 
                            className="cursor-help text-slate-400 hover:text-blue-600 inline-flex items-center" 
                            title="Colored dots identify the submitting Department (see Department Key above)"
                          >
                            <Info className="w-3 h-3" />
                          </span>
                        </div>
                      </th>
                      <th className="py-2.5 px-3 w-[11%]">Date</th>
                      <th className="py-2.5 px-2 w-[4%] text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {NAAC_CRITERIA_SUMMARY.filter(crit => {
                      if (selectedCriterionFilter !== 'all' && crit.code !== selectedCriterionFilter) return false;
                      return true;
                    }).map((crit) => {
                      const isCritCollapsed = Boolean(collapsedCriteria[crit.code]);
                      const critIndicators = KEY_INDICATORS.filter(ki => ki.criterionCode === crit.code);
                      const critDocs = schoolDocs.filter(d => {
                        const matchesCrit = d.criterionCode === crit.code;
                        const matchesProg = matchesProgram(d);
                        const matchesSearch = !searchQuery.trim() || 
                          d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.metricCode.includes(searchQuery);
                        return matchesCrit && matchesProg && matchesSearch;
                      });

                      return (
                        <React.Fragment key={crit.id}>
                          {/* LEVEL 1: CRITERION GROUP ROW */}
                          <tr 
                            onClick={() => toggleCriterion(crit.code)}
                            className="cursor-pointer bg-slate-100 hover:bg-slate-200/80 transition-colors border-t border-b border-slate-300 select-none"
                          >
                            <td colSpan={6} className="py-2.5 px-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={critDocs.length > 0 && critDocs.every(d => selectedRepoDocIds.includes(d.id))}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => {
                                      const allCritSel = critDocs.length > 0 && critDocs.every(d => selectedRepoDocIds.includes(d.id));
                                      if (allCritSel) {
                                        setSelectedRepoDocIds(prev => prev.filter(id => !critDocs.some(d => d.id === id)));
                                      } else {
                                        setSelectedRepoDocIds(prev => Array.from(new Set([...prev, ...critDocs.map(d => d.id)])));
                                      }
                                    }}
                                    disabled={critDocs.length === 0}
                                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-40 accent-[#0f2748]"
                                    title={
                                      critDocs.length === 0
                                        ? 'No documents in this criterion'
                                        : `Select/Deselect all ${critDocs.length} documents in ${crit.code}`
                                    }
                                  />
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
                                    {crit.weightage || 150} Marks
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                                    {critIndicators.length} Indicators
                                  </span>
                                  <span className={`px-2.5 py-0.5 rounded-lg font-bold text-xs ${
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

                          {/* LEVEL 2: KEY INDICATORS */}
                          {!isCritCollapsed && critIndicators.map((ki) => {
                            const isKiCollapsed = Boolean(collapsedKeyIndicators[ki.code]);
                            const kiMetrics = NAAC_METRICS_LIST.filter(m => m.code.startsWith(ki.code));
                            const kiDocs = schoolDocs.filter(d => {
                              const matchesKi = d.metricCode.startsWith(ki.code);
                              const matchesProg = matchesProgram(d);
                              const matchesSearch = !searchQuery.trim() || 
                                d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                d.metricCode.includes(searchQuery);
                              return matchesKi && matchesProg && matchesSearch;
                            });

                            return (
                              <React.Fragment key={ki.code}>
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
                                            <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
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

                                {/* LEVEL 3: METRIC ROWS */}
                                {!isKiCollapsed && kiMetrics.map((metric) => {
                                  const metricDocs = schoolDocs.filter(d => {
                                    const matchM = d.metricCode === metric.code;
                                    const matchProg = matchesProgram(d);
                                    const matchQ = !searchQuery.trim() || 
                                      d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      d.metricCode.includes(searchQuery);
                                    return matchM && matchProg && matchQ;
                                  });

                                  if (metricDocs.length === 0) {
                                    return (
                                      <tr key={metric.code} className="hover:bg-slate-50/60 transition-colors border-b border-gray-100 text-xs">
                                        <td className="py-2.5 px-4 pl-14 align-top">
                                          <div className="flex items-start gap-2">
                                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-bold shrink-0">
                                              {metric.code}
                                            </span>
                                            <span className="font-medium text-gray-900 leading-tight">{metric.name}</span>
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-gray-600 align-top whitespace-nowrap text-[11px]">
                                          <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 border border-gray-200">
                                            {metric.metricType}
                                          </span>
                                        </td>
                                        <td colSpan={4} className="py-2.5 px-3 text-gray-400 italic text-[11px] align-middle">
                                          No approved proofs attached yet
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return metricDocs.map((doc, dIdx) => (
                                    <tr key={doc.id} className="hover:bg-amber-50/20 transition-colors border-b border-gray-100 text-xs">
                                      {dIdx === 0 && (
                                        <>
                                          <td rowSpan={metricDocs.length} className="py-2.5 px-4 pl-14 align-top border-r border-gray-100">
                                            <div className="flex items-start gap-2">
                                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-bold shrink-0">
                                                {metric.code}
                                              </span>
                                              <span className="font-medium text-gray-900 leading-tight">{metric.name}</span>
                                            </div>
                                          </td>
                                          <td rowSpan={metricDocs.length} className="py-2.5 px-3 text-gray-600 align-top whitespace-nowrap text-[11px] border-r border-gray-100">
                                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 border border-gray-200">
                                              {metric.metricType}
                                            </span>
                                          </td>
                                        </>
                                      )}

                                      {/* Col 3: Attached Supporting Document Link */}
                                      <td className="py-2.5 px-3 align-top">
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            checked={selectedRepoDocIds.includes(doc.id)}
                                            onChange={() => handleToggleSelectRepoDoc(doc.id)}
                                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0f2748] shrink-0"
                                            title={`Select "${doc.fileName || doc.title}"`}
                                          />
                                          <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                          <button
                                            type="button"
                                            onClick={() => openFileInNewTab(doc.fileUrl)}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline truncate text-left cursor-pointer max-w-[280px]"
                                            title={`Open ${doc.fileName || doc.title}`}
                                          >
                                            {doc.fileName || doc.title}
                                          </button>
                                          {doc.status === 'submitted_to_university' ? (
                                            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-full font-bold shrink-0 whitespace-nowrap" title="Submitted to University Coordinator">
                                              Submitted
                                            </span>
                                          ) : doc.status === 'university_verified' ? (
                                            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-full font-bold shrink-0 whitespace-nowrap" title="Verified by Central IQAC">
                                              Verified
                                            </span>
                                          ) : null}
                                        </div>
                                      </td>

                                      {/* Col 4: Uploaded By with Department Dot (Single Line) */}
                                      <td className="py-2.5 px-3 text-gray-700 align-top text-xs">
                                        {(() => {
                                          const dept = getDepartmentDot(doc);
                                          return (
                                            <div 
                                              className="flex items-center gap-2 truncate"
                                              title={`${dept.label} • ${getCleanPersonName(doc.facultyName || doc.uploadedBy)}`}
                                            >
                                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dept.color}`} title={`Department: ${dept.label}`} />
                                              <span className="font-semibold text-gray-900 truncate">
                                                {getCleanPersonName(doc.facultyName || doc.uploadedBy)}
                                              </span>
                                            </div>
                                          );
                                        })()}
                                      </td>

                                      {/* Col 5: Date */}
                                      <td className="py-2.5 px-3 text-gray-500 align-top text-xs whitespace-nowrap">
                                        {formatDocDate(doc.uploadedAt)}
                                      </td>

                                      {/* Col 6: Action */}
                                      <td className="py-2.5 px-2 text-center align-top">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Remove "${doc.fileName}" from School Repository?`)) {
                                              deleteNaacDocument(doc.id);
                                              refreshDocuments();
                                              showToast(`Removed proof "${doc.fileName}".`);
                                            }
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
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: SPECIALIZED GRID - PROGRAM SUBMISSIONS REVIEW QUEUE */}
        {deskMode === 'review-queue' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Header info */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-gray-900">
                  Department Submissions Awaiting School Review ({pendingReviewDocs.length})
                </h3>
                {selectedReviewDocIds.length > 0 && (
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    {selectedReviewDocIds.length} selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                {/* Batch Approve Button */}
                <button
                  type="button"
                  onClick={handleBatchApproveSelected}
                  disabled={selectedReviewDocIds.length === 0}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  title={
                    selectedReviewDocIds.length === 0
                      ? 'Select documents with checkboxes to batch approve'
                      : `Approve and forward ${selectedReviewDocIds.length} selected documents to University IQAC`
                  }
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Selected {selectedReviewDocIds.length > 0 ? `(${selectedReviewDocIds.length})` : ''}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Program:</span>
                  <select
                    value={selectedProgramFilter}
                    onChange={(e) => setSelectedProgramFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 cursor-pointer focus:ring-1 focus:ring-blue-500 max-w-[200px] truncate"
                  >
                    <option value="all">All Programs (5)</option>
                    <option value="prog-cse">🔵 B.Tech CSE</option>
                    <option value="prog-bca">🟢 BCA & Cloud</option>
                    <option value="prog-cyber">🟢 B.Sc Cyber</option>
                    <option value="prog-ai">🟣 M.Tech AI-ML</option>
                    <option value="school-common">🟣 School Common</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Queue Table */}
            {pendingReviewDocs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">Review Queue is All Clear!</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  All departmental submissions for {currentSchool.name} have been reviewed and approved.
                </p>
                <button
                  type="button"
                  onClick={() => setDeskMode('repository')}
                  className="mt-4 px-4 py-1.5 bg-[#0f2748] text-white text-xs font-semibold rounded-lg hover:bg-[#183963] cursor-pointer"
                >
                  View School Document Repository
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                {/* Integrated Department Color Key Strip */}
                <div className="bg-slate-50/90 border-b border-gray-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Department Key:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-gray-700">
                    <span className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-default" title="B.Tech Computer Science & Engineering">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200 shrink-0"></span>
                      <span>B.Tech CSE</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 hover:text-teal-600 transition-colors cursor-default" title="BCA & Cloud Computing">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-200 shrink-0"></span>
                      <span>BCA & Cloud</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition-colors cursor-default" title="B.Sc Cyber Security & Digital Forensics">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0"></span>
                      <span>B.Sc Cyber</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-default" title="M.Tech Artificial Intelligence & Machine Learning">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-200 shrink-0"></span>
                      <span>M.Tech AI-ML</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 hover:text-purple-600 transition-colors cursor-default" title="School Common Proofs (All Programs)">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-200 shrink-0"></span>
                      <span>School Common</span>
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">
                          {(() => {
                            const currentQueueDocs = pendingReviewDocs.filter(matchesProgram);
                            const allSelected = currentQueueDocs.length > 0 && currentQueueDocs.every(d => selectedReviewDocIds.includes(d.id));
                            return (
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={() => {
                                  if (allSelected) {
                                    setSelectedReviewDocIds(prev => prev.filter(id => !currentQueueDocs.some(d => d.id === id)));
                                  } else {
                                    const newIds = Array.from(new Set([...selectedReviewDocIds, ...currentQueueDocs.map(d => d.id)]));
                                    setSelectedReviewDocIds(newIds);
                                  }
                                }}
                                disabled={currentQueueDocs.length === 0}
                                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-40 accent-[#0f2748]"
                                title={allSelected ? 'Deselect all' : 'Select all documents'}
                              />
                            );
                          })()}
                        </th>
                        <th className="py-2.5 px-3 w-[22%]">Program / Dept</th>
                        <th className="py-2.5 px-3 w-[10%]">Metric</th>
                        <th className="py-2.5 px-4 w-[32%]">File Name</th>
                        <th className="py-2.5 px-3 w-[16%]">Uploaded By</th>
                        <th className="py-2.5 px-4 w-[16%] text-right">Review Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pendingReviewDocs
                        .filter(matchesProgram)
                        .map((doc) => {
                          const isSelected = selectedReviewDocIds.includes(doc.id);
                          const dept = getDepartmentDot(doc);
                          return (
                            <tr key={doc.id} className={`hover:bg-blue-50/30 transition-colors ${isSelected ? 'bg-blue-50/20' : ''}`}>
                              {/* Row Checkbox */}
                              <td className="py-3 px-3 text-center align-middle">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    setSelectedReviewDocIds(prev =>
                                      prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
                                    );
                                  }}
                                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0f2748]"
                                  title={`Select "${doc.fileName}"`}
                                />
                              </td>

                              {/* Program / Dept with Department Indicator Dot */}
                              <td className="py-3 px-3 align-top">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dept.color}`} title={`Department: ${dept.label}`} />
                                  <span className="font-bold text-gray-900 text-xs leading-snug">
                                    {doc.programName}
                                  </span>
                                </div>
                              </td>

                              {/* Metric */}
                              <td className="py-3 px-3 align-top">
                                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded inline-block">
                                  {doc.metricCode}
                                </span>
                                <span className="block text-[10px] text-gray-500 mt-1">
                                  {doc.criterionCode}
                                </span>
                              </td>

                              {/* File Name only (no description subtitle) */}
                              <td className="py-3 px-4 align-top">
                                <div
                                  onClick={() => openFileInNewTab(doc.fileUrl)}
                                  className="font-semibold text-gray-900 hover:text-blue-700 cursor-pointer text-xs leading-snug truncate"
                                  title={doc.fileName}
                                >
                                  {doc.fileName}
                                </div>
                                {doc.fileSize && (
                                  <span className="text-[10px] text-gray-400 mt-0.5 inline-block">
                                    {doc.fileSize}
                                  </span>
                                )}
                              </td>

                              {/* Uploaded By */}
                              <td className="py-3 px-3 align-top">
                                <span className="font-semibold text-gray-800 block text-xs truncate">
                                  {getCleanPersonName(doc.uploadedBy || doc.facultyName)}
                                </span>
                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                  {doc.uploadedAt ? doc.uploadedAt.split('T')[0] : 'Recent'}
                                </span>
                              </td>

                            {/* Actions */}
                            <td className="py-3 px-4 align-top text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleApproveDocument(doc)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                                  title="Approve and forward this evidence to University IQAC"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRevisionDoc(doc)}
                                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                                  title="Request revisions or feedback from program coordinator"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Revise</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openFileInNewTab(doc.fileUrl)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                  title="Open PDF"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: SPECIALIZED GRID - SCHOOL NAAC READINESS & PROGRAM AUDIT */}
        {deskMode === 'ssr-matrix' && (
          <div className="space-y-6 animate-in fade-in">
            {/* 1. TOP EXECUTIVE HEADER WITH METRIC STRIP */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-gray-900">
                    School NAAC Readiness &amp; Program Submission Audit
                  </h3>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    SOT • {currentSchool.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                  Multi-program compliance tracker for Dr. Rajesh Sharma (School Coordinator). Monitor active evidence submissions across all academic programs, distinguishing NAAC-facing programs from institutional data contributors.
                </p>
              </div>

              {/* Overall School Readiness Meter */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-3 rounded-xl shrink-0">
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-gray-500 block">Overall School SSR Readiness</span>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="text-lg font-black text-emerald-700 leading-none">
                      {overallSchoolReadiness}%
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">({schoolCriteriaWithDocs.size}/7 Criteria)</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* 2. PROGRAM OVERVIEW BOXES (4-5 BOXES) */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Academic Programs Under School of Technology ({SOT_PROGRAMS_METADATA.length})</span>
                  </h4>
                  <span className="text-[11px] text-gray-500 hidden sm:inline">
                    Click any program card to open its full evidence audit drawer
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    2 Facing NAAC
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    2 Contributing
                  </span>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                    1 Common
                  </span>
                </div>
              </div>

              {/* Responsive 5-Box Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
                {SOT_PROGRAMS_METADATA.map((prog) => {
                  const progAllDocs = allSchoolDocs.filter(d => matchesProgramId(d, prog.id));
                  const progCriteriaSet = new Set(progAllDocs.map(d => d.criterionCode));
                  const progReadinessPct = Math.min(100, Math.round((progCriteriaSet.size / 7) * 100));

                  return (
                    <div
                      key={prog.id}
                      className="bg-white rounded-2xl border border-gray-200/90 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer"
                      onClick={() => {
                        setSelectedProgramForDrawer(prog.id);
                        setDrawerTabFilter('all');
                      }}
                    >
                      {/* Top colored accent gradient strip */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${prog.gradient}`} />

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        {/* Title & Tag */}
                        <div>
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <span className="font-mono text-[11px] font-bold text-gray-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                              {prog.shortCode}
                            </span>
                            <span 
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                                prog.isNaacFacing 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                  : prog.id === 'school-common'
                                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                                  : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}
                            >
                              {prog.naacScopeLabel}
                            </span>
                          </div>

                          <h5 
                            className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 min-h-[32px]" 
                            title={prog.name}
                          >
                            {prog.name}
                          </h5>

                          {/* Coordinator Row with inline Reminder Ping */}
                          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Coordinator</span>
                              <span className="text-xs font-semibold text-gray-800 truncate block" title={prog.coordinatorName}>
                                {prog.coordinatorName}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendProgramReminder(prog);
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors shrink-0"
                              title={`Send submission reminder to ${prog.coordinatorName}`}
                            >
                              {remindersSent[prog.id] ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Bell className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Progress and Stats Box */}
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] font-semibold text-gray-600">Readiness</span>
                            <span className="text-xs font-black text-emerald-700">{progReadinessPct}%</span>
                          </div>

                          {/* Meter Bar */}
                          <div className="w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-1.5 rounded-full transition-all duration-500 bg-emerald-500"
                              style={{ width: `${progReadinessPct}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                            <span>{progCriteriaSet.size}/7 Criteria</span>
                            <span className="font-semibold text-gray-700">{progAllDocs.length} Proofs</span>
                          </div>
                        </div>

                        {/* Action CTA Button */}
                        <button
                          type="button"
                          className="w-full py-1.5 px-2 bg-white hover:bg-blue-50 text-gray-800 hover:text-blue-700 border border-gray-200 hover:border-blue-300 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs group-hover:bg-blue-50"
                        >
                          <span>Open Drawer</span>
                          <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. CONSOLIDATED MASTER DOCUMENTS TABLE (WITH ROWSPAN MERGED FIRST COLUMN) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              {/* Table Top Filter Bar */}
              <div className="p-4 border-b border-gray-200 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Consolidated Evidence Submissions Across All Programs</span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Program-wise merged view (rowSpan) detailing submitted files, uploader faculty/coordinator, and School Review approvals.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Scope Filter Pills */}
                  <div className="inline-flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setTableScopeFilter('all')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        tableScopeFilter === 'all'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      All ({SOT_PROGRAMS_METADATA.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableScopeFilter('facing')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        tableScopeFilter === 'facing'
                          ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      🎯 Facing NAAC (2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableScopeFilter('non-facing')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        tableScopeFilter === 'non-facing'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📋 Non-Facing (2)
                    </button>
                  </div>

                  {/* Status Filter */}
                  <select
                    value={tableStatusFilter}
                    onChange={(e) => setTableStatusFilter(e.target.value as any)}
                    className="px-2.5 py-1 bg-slate-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending School Review</option>
                    <option value="approved">Approved into School Repo</option>
                  </select>

                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Search proofs, metrics..."
                      value={tableSearchQuery}
                      onChange={(e) => setTableSearchQuery(e.target.value)}
                      className="pl-8 pr-2.5 py-1 text-xs border border-gray-300 rounded-lg w-40 focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Table Data */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 w-[23%]">Program &amp; Scope (Merged)</th>
                      <th className="py-2.5 px-3 w-[14%]">Metric &amp; Criterion</th>
                      <th className="py-2.5 px-3 w-[33%]">Evidence Proof</th>
                      <th className="py-2.5 px-3 w-[15%]">Submitted By</th>
                      <th className="py-2.5 px-3 w-[9%] text-center">Status</th>
                      <th className="py-2.5 px-2 w-[6%] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(() => {
                      const displayedProgs = SOT_PROGRAMS_METADATA.filter(prog => {
                        if (tableScopeFilter === 'facing') return prog.isNaacFacing && prog.id !== 'school-common';
                        if (tableScopeFilter === 'non-facing') return !prog.isNaacFacing;
                        return true;
                      });

                      return displayedProgs.map((prog) => {
                        const progAllDocs = allSchoolDocs.filter(d => matchesProgramId(d, prog.id));
                        const matchingDocs = progAllDocs.filter(d => {
                          const matchesStatus = 
                            tableStatusFilter === 'all' ? true :
                            tableStatusFilter === 'pending' ? d.status === 'submitted_to_school' :
                            (d.status === 'approved_by_school' || d.status === 'university_verified');
                          const matchesSearch = !tableSearchQuery.trim() ||
                            d.fileName.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
                            d.title.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
                            d.metricCode.includes(tableSearchQuery) ||
                            (d.uploadedBy && d.uploadedBy.toLowerCase().includes(tableSearchQuery.toLowerCase()));
                          return matchesStatus && matchesSearch;
                        });

                        // Program without matching documents
                        if (matchingDocs.length === 0) {
                          return (
                            <tr key={prog.id} className="border-b border-gray-200 hover:bg-slate-50/50">
                              <td className="py-3 px-4 align-top bg-slate-50/70 border-r border-gray-200">
                                <div className="font-bold text-gray-900 text-xs">{prog.name}</div>
                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${prog.isNaacFacing ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                                    {prog.naacScopeLabel}
                                  </span>
                                  <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-semibold">
                                    {prog.degreeType}
                                  </span>
                                </div>
                                <div className="text-[11px] text-gray-500 mt-2">
                                  Coord: <strong className="text-gray-700">{prog.coordinatorName}</strong>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedProgramForDrawer(prog.id)}
                                  className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Open Drawer</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </td>

                              <td colSpan={5} className="py-6 px-4 text-center align-middle bg-white">
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <span className="text-xs text-gray-400 italic">
                                    No evidence documents match current filter.
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleSendProgramReminder(prog)}
                                    className="mt-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
                                  >
                                    <Bell className="w-3 h-3" />
                                    <span>Remind {prog.coordinatorName} to Submit</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        // Program with matching documents (Merged RowSpan First Cell)
                        return matchingDocs.map((doc, docIdx) => (
                          <tr key={`${prog.id}-${doc.id}-${docIdx}`} className="hover:bg-blue-50/20 transition-colors border-b border-gray-100">
                            {/* FIRST COLUMN (Merged with rowSpan) */}
                            {docIdx === 0 && (
                              <td
                                rowSpan={matchingDocs.length}
                                className="py-3 px-4 align-top bg-slate-50/70 border-r border-gray-200 min-w-[210px]"
                              >
                                <div className="font-bold text-gray-900 text-xs leading-snug">{prog.name}</div>
                                
                                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${prog.isNaacFacing ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                                    {prog.naacScopeLabel}
                                  </span>
                                  <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-semibold">
                                    {prog.degreeType}
                                  </span>
                                </div>

                                <div className="text-[11px] text-gray-600 mt-2.5">
                                  Coord: <strong className="text-gray-800">{prog.coordinatorName}</strong>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5 truncate" title={prog.coordinatorEmail}>
                                  {prog.coordinatorEmail}
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-gray-200">
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                    {matchingDocs.length} Proof{matchingDocs.length > 1 ? 's' : ''}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handleSendProgramReminder(prog)}
                                    className="p-1 text-gray-400 hover:text-blue-700 hover:bg-white rounded cursor-pointer transition-colors"
                                    title={`Send reminder to ${prog.coordinatorName}`}
                                  >
                                    {remindersSent[prog.id] ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Bell className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setSelectedProgramForDrawer(prog.id)}
                                  className="mt-2.5 w-full py-1.5 px-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                >
                                  <span>Open Drawer</span>
                                  <ArrowRight className="w-3 h-3 text-gray-400" />
                                </button>
                              </td>
                            )}

                            {/* Col 2: Metric */}
                            <td className="py-3 px-3 align-top border-r border-gray-100">
                              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded inline-block">
                                {doc.metricCode}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded ml-1.5">
                                {doc.metricType || 'QnM'}
                              </span>
                              <span className="block text-[11px] text-gray-500 mt-1 font-medium">
                                {doc.criterionCode}
                              </span>
                            </td>

                            {/* Col 3: Attached Proof */}
                            <td className="py-3 px-3 align-top border-r border-gray-100">
                              <div
                                onClick={() => openFileInNewTab(doc.fileUrl)}
                                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-xs leading-snug flex items-center gap-1.5"
                                title={doc.fileName}
                              >
                                <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                <span className="truncate max-w-[260px]">{doc.fileName}</span>
                              </div>
                              <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-1">
                                {doc.title}
                              </p>
                              {doc.fileSize && (
                                <span className="text-[10px] text-gray-400 mt-0.5 inline-block">
                                  {doc.fileSize}
                                </span>
                              )}
                            </td>

                            {/* Col 4: Submitted By */}
                            <td className="py-3 px-3 align-top border-r border-gray-100">
                              <span className="font-bold text-gray-900 block text-xs">
                                {doc.facultyName || doc.uploadedBy}
                              </span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">
                                {formatDocDate(doc.uploadedAt)}
                              </span>
                            </td>

                            {/* Col 5: Status */}
                            <td className="py-3 px-3 align-top text-center border-r border-gray-100">
                              {doc.status === 'approved_by_school' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Approved</span>
                                </span>
                              ) : doc.status === 'university_verified' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                  <Lock className="w-3 h-3 text-purple-600" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Pending Review</span>
                                </span>
                              )}
                            </td>

                            {/* Col 6: Actions */}
                            <td className="py-3 px-2 align-top text-center">
                              <div className="flex items-center justify-center gap-1">
                                {doc.status === 'submitted_to_school' && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveDocument(doc)}
                                    className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded cursor-pointer transition-colors"
                                    title="Quick Approve into School Repo"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => openFileInNewTab(doc.fileUrl)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                                  title="Open PDF"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REVISION FEEDBACK MODAL */}
      {revisionDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-gray-900">Request Revision from Program Coordinator</h3>
              </div>
              <button
                type="button"
                onClick={() => setRevisionDoc(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase">Document</span>
                <p className="text-xs font-bold text-gray-900 mt-0.5">{revisionDoc.fileName}</p>
                <p className="text-[11px] text-gray-500">{revisionDoc.programName} • Metric {revisionDoc.metricCode}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Revision Instructions & Feedback Note:
                </label>
                <textarea
                  rows={3}
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  placeholder="e.g. Please attach the signed Dean BoS resolution page and student attendance sheets."
                  className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRevisionDoc(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRevision}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs"
              >
                Send Revision Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER DRAWER: DETAILED PROGRAM AUDIT & SUBMISSIONS */}
      {(() => {
        const selectedDrawerProg = SOT_PROGRAMS_METADATA.find(p => p.id === selectedProgramForDrawer);
        if (!selectedDrawerProg) return null;

        const drawerAllDocs = allSchoolDocs.filter(d => matchesProgramId(d, selectedDrawerProg.id));
        const drawerCriteriaWithDocs = new Set(drawerAllDocs.map(d => d.criterionCode));
        const drawerReadinessPct = Math.min(100, Math.round((drawerCriteriaWithDocs.size / 7) * 100));
        const drawerPendingDocs = drawerAllDocs.filter(d => d.status === 'submitted_to_school');
        const drawerApprovedDocs = drawerAllDocs.filter(d => d.status === 'approved_by_school' || d.status === 'university_verified');
        const missingCriteriaList = NAAC_CRITERIA_SUMMARY.filter(c => !drawerCriteriaWithDocs.has(c.code));

        const filteredDrawerDocs = drawerAllDocs.filter(d => {
          if (drawerTabFilter === 'pending') return d.status === 'submitted_to_school';
          if (drawerTabFilter === 'approved') return d.status === 'approved_by_school' || d.status === 'university_verified';
          return true;
        }).filter(d => {
          if (!drawerSearch.trim()) return true;
          return (
            d.fileName.toLowerCase().includes(drawerSearch.toLowerCase()) ||
            d.title.toLowerCase().includes(drawerSearch.toLowerCase()) ||
            d.metricCode.includes(drawerSearch) ||
            (d.uploadedBy && d.uploadedBy.toLowerCase().includes(drawerSearch.toLowerCase()))
          );
        });

        return (
          <Drawer
            isOpen={Boolean(selectedProgramForDrawer)}
            onClose={() => setSelectedProgramForDrawer(null)}
            title={`Program Evidence Audit — ${selectedDrawerProg.shortCode}`}
            maxWidth="max-w-2xl"
          >
            <div className="p-5 space-y-5">
              {/* Drawer Top Program Banner */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {selectedDrawerProg.shortCode}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedDrawerProg.isNaacFacing ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                        {selectedDrawerProg.naacScopeLabel}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                        {selectedDrawerProg.degreeType}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">
                      {selectedDrawerProg.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Coordinator: <strong className="text-gray-800">{selectedDrawerProg.coordinatorName}</strong> ({selectedDrawerProg.coordinatorEmail})
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendProgramReminder(selectedDrawerProg)}
                    className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                    title={`Send submission reminder to ${selectedDrawerProg.coordinatorName}`}
                  >
                    {remindersSent[selectedDrawerProg.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Reminder Sent</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Send Reminder</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600">NAAC SSR Progress</span>
                    <span className="font-black text-emerald-700">{drawerReadinessPct}% ({drawerCriteriaWithDocs.size}/7 Criteria Covered)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${drawerReadinessPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Drawer Sub-tabs */}
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-2">
                <div className="flex items-center gap-1 overflow-x-auto text-xs">
                  <button
                    type="button"
                    onClick={() => setDrawerTabFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      drawerTabFilter === 'all'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Docs ({drawerAllDocs.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawerTabFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      drawerTabFilter === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>Pending Review</span>
                    {drawerPendingDocs.length > 0 && (
                      <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full">
                        {drawerPendingDocs.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawerTabFilter('approved')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      drawerTabFilter === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Approved ({drawerApprovedDocs.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawerTabFilter('missing')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      drawerTabFilter === 'missing'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>Missing Criteria</span>
                    {missingCriteriaList.length > 0 && (
                      <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.2 rounded-full">
                        {missingCriteriaList.length}
                      </span>
                    )}
                  </button>
                </div>

                {drawerTabFilter !== 'missing' && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      placeholder="Search docs..."
                      value={drawerSearch}
                      onChange={(e) => setDrawerSearch(e.target.value)}
                      className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-lg w-32 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Drawer Content */}
              {drawerTabFilter === 'missing' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <p className="font-semibold">⚠️ Action Required: Missing Criteria</p>
                    <p className="mt-0.5 text-[11px] text-amber-700">
                      The following Criteria (out of 7) do not have any evidence proofs uploaded by this program yet.
                    </p>
                  </div>

                  {missingCriteriaList.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-800">All 7 Criteria Covered!</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">This program has submitted proofs across all 7 NAAC criteria.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {missingCriteriaList.map(crit => (
                        <div key={crit.id} className="p-3.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#0f2748] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {crit.code}
                            </span>
                            <h5 className="text-xs font-bold text-gray-900 mt-1">
                              {crit.name}
                            </h5>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Weightage: {crit.weightage} marks • No proofs submitted
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              showToast(`📢 Reminder sent to ${selectedDrawerProg.coordinatorName} for ${crit.code}: ${crit.name}`);
                            }}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1"
                          >
                            <Bell className="w-3 h-3" />
                            <span>Request Proof</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredDrawerDocs.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-800">No documents found</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">No evidence matching current tab or search filters.</p>
                    </div>
                  ) : (
                    filteredDrawerDocs.map(doc => (
                      <div key={doc.id} className="p-3.5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-all shadow-2xs space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                              {doc.metricCode}
                            </span>
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                              {doc.criterionCode}
                            </span>
                          </div>

                          {doc.status === 'approved_by_school' ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Approved into School Repo
                            </span>
                          ) : doc.status === 'university_verified' ? (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                              University Verified
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              Pending Review
                            </span>
                          )}
                        </div>

                        <div>
                          <div
                            onClick={() => openFileInNewTab(doc.fileUrl)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span>{doc.fileName}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5">
                            {doc.title}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                          <span>By: <strong className="text-gray-700">{doc.facultyName || doc.uploadedBy}</strong> • {formatDocDate(doc.uploadedAt)}</span>
                          
                          <div className="flex items-center gap-1.5">
                            {doc.status === 'submitted_to_school' && (
                              <button
                                type="button"
                                onClick={() => handleApproveDocument(doc)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => openFileInNewTab(doc.fileUrl)}
                              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                              title="Open PDF"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Drawer>
        );
      })()}
    </div>
  );
};
