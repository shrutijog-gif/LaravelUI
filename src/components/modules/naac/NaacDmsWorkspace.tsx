import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  School, 
  FileCheck2, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Trash2, 
  Eye, 
  Send,
  RotateCcw,
  Check,
  X,
  Layers,
  ArrowRight,
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  BarChart3
} from 'lucide-react';
import { 
  ITM_SCHOOLS, 
  NAAC_CRITERIA_SUMMARY, 
  NAAC_METRICS_LIST, 
  NaacEvidenceDocument, 
  NaacSchool, 
  NaacProgram, 
  NaacMetric,
  getStoredNaacDocuments, 
  addOrUpdateNaacDocument, 
  submitDocumentToSchool, 
  reviewSchoolDocument, 
  verifyUniversityDocument, 
  deleteNaacDocument 
} from '../../../data/naacDmsData';
import { openFileInNewTab } from '../../../utils/fileHelper';

export type NaacViewTab = 'dashboard' | 'program' | 'school' | 'university' | 'criteria' | 'schools';

export interface NaacDmsWorkspaceProps {
  initialRole?: NaacViewTab;
}

export const NaacDmsWorkspace: React.FC<NaacDmsWorkspaceProps> = ({
  initialRole = 'dashboard',
}) => {
  const [activeTab, setActiveTab] = useState<NaacViewTab>(initialRole);

  useEffect(() => {
    if (initialRole) {
      setActiveTab(initialRole);
    }
  }, [initialRole]);

  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() => getStoredNaacDocuments());

  // Listen for live updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      setDocuments(getStoredNaacDocuments());
    };
    window.addEventListener('naac-dms-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('naac-dms-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Program Coordinator State
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('sch-tech');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('prog-cse');
  const [programSearch, setProgramSearch] = useState('');
  const [programStatusFilter, setProgramStatusFilter] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New Document Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newYear, setNewYear] = useState('2025-2026');
  const [newMetricCode, setNewMetricCode] = useState('2.6.1');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('');

  // School Coordinator State
  const [schoolCoordSchoolId, setSchoolCoordSchoolId] = useState<string>('sch-tech');
  const [schoolProgramFilter, setSchoolProgramFilter] = useState<string>('all');
  const [reviewNoteModalDoc, setReviewNoteModalDoc] = useState<NaacEvidenceDocument | null>(null);
  const [reviewActionType, setReviewActionType] = useState<'approve' | 'revision'>('approve');
  const [reviewFeedbackNote, setReviewFeedbackNote] = useState('');

  // University Coordinator State
  const [univSchoolFilter, setUnivSchoolFilter] = useState<string>('all');
  const [univCriterionFilter, setUnivCriterionFilter] = useState<string>('all');
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  // Criteria Explorer State
  const [selectedCriterionCode, setSelectedCriterionCode] = useState<string>('CR-1');
  const [criteriaMetricFilter, setCriteriaMetricFilter] = useState<string>('all');

  // Constituent Schools Directory State
  const [schoolsDirectorySearch, setSchoolsDirectorySearch] = useState('');

  // Current selected school and program objects
  const activeSchoolObj = ITM_SCHOOLS.find(s => s.id === selectedSchoolId) || ITM_SCHOOLS[0];
  const activeProgramObj = activeSchoolObj.programs.find(p => p.id === selectedProgramId) || activeSchoolObj.programs[0];

  // Selected metric object
  const activeMetricObj = NAAC_METRICS_LIST.find(m => m.code === newMetricCode) || NAAC_METRICS_LIST[0];

  // Handle PDF file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setNewFileSize(sizeInMb);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setNewFileUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // Submit new evidence
  const handleSaveEvidence = (status: 'draft' | 'submitted_to_school') => {
    if (!newTitle.trim()) return;

    const metric = NAAC_METRICS_LIST.find(m => m.code === newMetricCode) || NAAC_METRICS_LIST[0];
    const school = ITM_SCHOOLS.find(s => s.id === selectedSchoolId) || ITM_SCHOOLS[0];
    const program = school.programs.find(p => p.id === selectedProgramId) || school.programs[0];

    const fallbackPdf = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    addOrUpdateNaacDocument({
      title: newTitle.trim(),
      description: newDesc.trim(),
      schoolId: school.id,
      schoolName: school.name,
      programId: program.id,
      programName: program.name,
      academicYear: newYear,
      criterionId: metric.criterionId,
      criterionCode: metric.criterionCode,
      metricCode: metric.code,
      metricName: metric.name,
      metricType: metric.metricType,
      fileName: newFileName || `${metric.code}_Evidence_Proof.pdf`,
      fileSize: newFileSize || '1.8 MB',
      fileUrl: newFileUrl || fallbackPdf,
      uploadedBy: program.coordinatorName,
      status: status,
    });

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewFileName('');
    setNewFileUrl('');
    setNewFileSize('');
    setIsUploadModalOpen(false);
  };

  // Execute School Review
  const handleConfirmSchoolReview = () => {
    if (!reviewNoteModalDoc) return;
    const isApproved = reviewActionType === 'approve';
    reviewSchoolDocument(
      reviewNoteModalDoc.id, 
      isApproved, 
      reviewFeedbackNote || (isApproved ? 'Approved by School Coordinator. Complies with documentation rubrics.' : 'Please revise and resubmit with missing supporting appendices.'),
      'Dr. Rajesh Sharma'
    );
    setReviewNoteModalDoc(null);
    setReviewFeedbackNote('');
  };

  // Filtered documents for Program Coordinator
  const programDocuments = documents.filter(doc => {
    if (doc.schoolId !== selectedSchoolId) return false;
    if (doc.programId !== selectedProgramId) return false;
    if (programStatusFilter !== 'all' && doc.status !== programStatusFilter) return false;
    if (programSearch.trim()) {
      const q = programSearch.toLowerCase();
      const matchText = `${doc.title} ${doc.metricCode} ${doc.metricName} ${doc.description}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Filtered documents for School Coordinator
  const schoolDocuments = documents.filter(doc => {
    if (doc.schoolId !== schoolCoordSchoolId) return false;
    if (schoolProgramFilter !== 'all' && doc.programId !== schoolProgramFilter) return false;
    return true;
  });

  // Filtered documents for University Coordinator
  const univDocuments = documents.filter(doc => {
    if (univSchoolFilter !== 'all' && doc.schoolId !== univSchoolFilter) return false;
    if (univCriterionFilter !== 'all' && doc.criterionCode !== univCriterionFilter) return false;
    return true;
  });

  // Workflow status pill helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            <Clock className="w-3 h-3 text-gray-500" /> Draft
          </span>
        );
      case 'submitted_to_school':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3 h-3 text-blue-500" /> Submitted to School
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Changes Requested
          </span>
        );
      case 'approved_by_school':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Approved by School
          </span>
        );
      case 'university_verified':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" /> University Verified
          </span>
        );
      default:
        return null;
    }
  };

  // Stats calculation
  const totalDocs = documents.length;
  const verifiedDocs = documents.filter(d => d.status === 'university_verified').length;
  const schoolApprovedDocs = documents.filter(d => d.status === 'approved_by_school').length;
  const pendingSchoolDocs = documents.filter(d => d.status === 'submitted_to_school').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* 🏛️ Top Header & Institution Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Accreditation Management
              </span>
              <span className="text-xs font-semibold text-gray-300">
                ITM Skills University
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              NAAC Document Management System
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              3-tier evidence collection, departmental review, and master consolidation across 5 Schools, 18 Academic Programs, and Criteria 1 through 7.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="block text-2xl font-black text-white">{totalDocs}</span>
              <span className="text-[11px] font-medium text-gray-300 uppercase tracking-wider">Total Proofs</span>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-md rounded-2xl p-3 border border-blue-400/20">
              <span className="block text-2xl font-black text-blue-300">{pendingSchoolDocs}</span>
              <span className="text-[11px] font-medium text-blue-200 uppercase tracking-wider">Under Review</span>
            </div>
            <div className="bg-indigo-500/20 backdrop-blur-md rounded-2xl p-3 border border-indigo-400/20">
              <span className="block text-2xl font-black text-indigo-300">{schoolApprovedDocs}</span>
              <span className="text-[11px] font-medium text-indigo-200 uppercase tracking-wider">School Approved</span>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3 border border-emerald-400/20">
              <span className="block text-2xl font-black text-emerald-300">{verifiedDocs}</span>
              <span className="text-[11px] font-medium text-emerald-200 uppercase tracking-wider">Univ. Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🎛️ NAAC DMS WORKFLOW NAVIGATION BAR */}
      <div className="bg-white rounded-2xl p-2 border border-gray-200/90 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Option 1: Executive Overview */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2.5 p-3 rounded-xl transition-all text-left cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-800'
                : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold truncate">Executive Overview</span>
              <span className={`block text-[10px] truncate ${activeTab === 'dashboard' ? 'text-gray-300' : 'text-gray-400'}`}>
                KPIs & Funnel
              </span>
            </div>
          </button>

          {/* Option 2: Program Coordinator */}
          <button
            type="button"
            onClick={() => setActiveTab('program')}
            className={`flex items-center gap-2.5 p-3 rounded-xl transition-all text-left cursor-pointer ${
              activeTab === 'program'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500'
                : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              activeTab === 'program' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold truncate">1. Program Evidence</span>
              <span className={`block text-[10px] truncate ${activeTab === 'program' ? 'text-emerald-100' : 'text-gray-400'}`}>
                Tier 1 Uploads
              </span>
            </div>
          </button>

          {/* Option 3: School Review Queue */}
          <button
            type="button"
            onClick={() => setActiveTab('school')}
            className={`flex items-center gap-2.5 p-3 rounded-xl transition-all text-left cursor-pointer ${
              activeTab === 'school'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500'
                : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              activeTab === 'school' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              <School className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold truncate">2. School Review</span>
              <span className={`block text-[10px] truncate ${activeTab === 'school' ? 'text-blue-100' : 'text-gray-400'}`}>
                Tier 2 Quality Gate
              </span>
            </div>
          </button>

          {/* Option 4: University Master Dossier */}
          <button
            type="button"
            onClick={() => setActiveTab('university')}
            className={`flex items-center gap-2.5 p-3 rounded-xl transition-all text-left cursor-pointer ${
              activeTab === 'university'
                ? 'bg-purple-700 text-white shadow-sm ring-2 ring-purple-600'
                : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              activeTab === 'university' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold truncate">3. Master Dossier</span>
              <span className={`block text-[10px] truncate ${activeTab === 'university' ? 'text-purple-100' : 'text-gray-400'}`}>
                Tier 3 SSR Archive
              </span>
            </div>
          </button>

          {/* Option 5: Criteria 1-7 Repositories */}
          <button
            type="button"
            onClick={() => setActiveTab('criteria')}
            className={`flex items-center gap-2.5 p-3 rounded-xl transition-all text-left cursor-pointer ${
              activeTab === 'criteria'
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500'
                : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              activeTab === 'criteria' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold truncate">Criteria 1–7</span>
              <span className={`block text-[10px] truncate ${activeTab === 'criteria' ? 'text-amber-100' : 'text-gray-400'}`}>
                7 Repositories
              </span>
            </div>
          </button>

          {/* Option 6: 5 Constituent Schools */}
          <button
            type="button"
            onClick={() => setActiveTab('schools')}
            className={`flex items-center gap-2.5 p-3 rounded-xl transition-all text-left cursor-pointer ${
              activeTab === 'schools'
                ? 'bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-600'
                : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              activeTab === 'schools' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold truncate">5 Schools</span>
              <span className={`block text-[10px] truncate ${activeTab === 'schools' ? 'text-cyan-100' : 'text-gray-400'}`}>
                18 Programs
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 📊 STAGE 0: EXECUTIVE OVERVIEW                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Institutional Workflow Status Funnel */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  3-Stage NAAC Accreditation Evidence Pipeline
                </h3>
                <p className="text-xs text-gray-500">
                  Standardized hierarchical workflow for ITM Skills University NAAC Self-Study Report (SSR) compilation.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Cycle 1 (2025–2030)
              </span>
            </div>

            {/* 3 Interactive Launchers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-gradient-to-br from-emerald-50/80 to-white rounded-2xl p-5 border border-emerald-200/80 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                      1
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      18 Programs
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    Department Evidence Upload
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    Program Coordinators upload quantitative and qualitative evidence mapped to Criteria 1–7 metrics with PDF proofs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('program')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Open Program Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2 */}
              <div className="bg-gradient-to-br from-blue-50/80 to-white rounded-2xl p-5 border border-blue-200/80 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                      2
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      5 Schools
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    School Quality Review Gate
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    School Coordinators audit departmental evidence, enforce compliance against rubrics, and approve or request revision.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('school')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Open Review Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 3 */}
              <div className="bg-gradient-to-br from-purple-50/80 to-white rounded-2xl p-5 border border-purple-200/80 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black text-xs">
                      3
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      Master IQAC
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    University Verification & SSR
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    University IQAC Coordinator gives final institutional sign-off, seals verified proofs, and compiles the Master SSR Dossier.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('university')}
                  className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Open Master SSR Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 7 NAAC Criteria Summary Grid */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Criteria 1–7 Accreditation Readiness
                </h3>
                <p className="text-xs text-gray-500">
                  Weightage breakdown, metrics, and evidence repository status across all criteria.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('criteria')}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Criteria Repositories</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {NAAC_CRITERIA_SUMMARY.map(c => {
                const criteriaDocs = documents.filter(d => d.criterionCode === c.code);
                const verified = criteriaDocs.filter(d => d.status === 'university_verified').length;
                const pct = criteriaDocs.length > 0 ? Math.round((verified / criteriaDocs.length) * 100) : 0;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCriterionCode(c.code);
                      setActiveTab('criteria');
                    }}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-800">
                          {c.code}
                        </span>
                        <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {c.weightage} Pts
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-indigo-900 transition-colors line-clamp-1">
                        {c.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                        {c.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/80">
                      <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                        <span className="text-gray-500 text-[11px]">{criteriaDocs.length} Proofs</span>
                        <span className="text-indigo-700">{pct}% Locked</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5 Constituent Schools Performance */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Constituent Schools Institutional Scorecard
                </h3>
                <p className="text-xs text-gray-500">
                  Quality status, departmental progress, and coordinator contacts for ITM Skills University.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('schools')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>View All 5 Schools & 18 Programs</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200">
                    <th className="py-3.5 px-4 sm:px-6">School & Dean</th>
                    <th className="py-3.5 px-4">Departments</th>
                    <th className="py-3.5 px-4">Evidence Proofs</th>
                    <th className="py-3.5 px-4">Verification Health</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {ITM_SCHOOLS.map(s => {
                    const sDocs = documents.filter(d => d.schoolId === s.id);
                    const verified = sDocs.filter(d => d.status === 'university_verified').length;
                    const pct = sDocs.length > 0 ? Math.round((verified / sDocs.length) * 100) : 0;

                    return (
                      <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div>
                            <span className="font-bold text-gray-900 text-sm block">
                              {s.name}
                            </span>
                            <span className="text-[11px] text-gray-500 mt-0.5 block">
                              Lead: {s.deanName} • {s.deanEmail}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-700">
                          {s.programs.length} Academic Programs
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-gray-900">{sDocs.length} proofs</span>
                          <span className="block text-[10px] text-gray-500">
                            {sDocs.filter(d => d.status === 'submitted_to_school').length} under review
                          </span>
                        </td>
                        <td className="py-4 px-4 min-w-[140px]">
                          <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                            <span className="text-gray-600">{pct}% Complete</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-1.5 rounded-full" 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSchoolId(s.id);
                              setSchoolCoordSchoolId(s.id);
                              setActiveTab('school');
                            }}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Review Queue ➔
                          </button>
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 📋 STAGE 1: PROGRAM COORDINATOR VIEW                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'program' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Program Context Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-base shrink-0">
                📋
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                  Logged In As Program Coordinator
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  {activeProgramObj.coordinatorName} — {activeProgramObj.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {activeSchoolObj.name} • {activeProgramObj.degreeType} Program
                </p>
              </div>
            </div>

            {/* School & Program Switchers for Demo Flexibility */}
            <div className="flex flex-wrap items-center gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Switch School:</label>
                <select
                  value={selectedSchoolId}
                  onChange={e => {
                    setSelectedSchoolId(e.target.value);
                    const targetSch = ITM_SCHOOLS.find(s => s.id === e.target.value);
                    if (targetSch && targetSch.programs.length > 0) {
                      setSelectedProgramId(targetSch.programs[0].id);
                    }
                  }}
                  className="text-xs font-semibold px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {ITM_SCHOOLS.map(s => (
                    <option key={s.id} value={s.id}>{s.shortCode} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Switch Program:</label>
                <select
                  value={selectedProgramId}
                  onChange={e => setSelectedProgramId(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {activeSchoolObj.programs.map(p => (
                    <option key={p.id} value={p.id}>{p.shortCode}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-4 sm:mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit New Evidence</span>
              </button>
            </div>
          </div>

          {/* Submissions Search & Filter Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search proofs by title or metric code (e.g. 2.6.1)..."
                value={programSearch}
                onChange={e => setProgramSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Status:</span>
              <select
                value={programStatusFilter}
                onChange={e => setProgramStatusFilter(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">All Submissions ({documents.filter(d => d.programId === selectedProgramId).length})</option>
                <option value="draft">Drafts</option>
                <option value="submitted_to_school">Submitted to School</option>
                <option value="changes_requested">Changes Requested</option>
                <option value="approved_by_school">Approved by School</option>
                <option value="university_verified">University Verified</option>
              </select>
            </div>
          </div>

          {/* Program Submissions Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {programDocuments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">No evidence proofs found</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Click "+ Submit New Evidence" above to upload documentation tagged to NAAC Criteria 1–7.
                </p>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Submit Evidence
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200">
                      <th className="py-3.5 px-4 sm:px-6">Document Title</th>
                      <th className="py-3.5 px-4">NAAC Metric</th>
                      <th className="py-3.5 px-4">Academic Year</th>
                      <th className="py-3.5 px-4">File Proof</th>
                      <th className="py-3.5 px-4">Workflow Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {programDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-emerald-50/30 transition-colors group">
                        <td className="py-4 px-4 sm:px-6">
                          <div>
                            <span className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors block text-sm">
                              {doc.title}
                            </span>
                            {doc.description && (
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                {doc.description}
                              </p>
                            )}
                            {doc.schoolReviewNote && doc.status === 'changes_requested' && (
                              <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <strong>School Reviewer Feedback:</strong> {doc.schoolReviewNote}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                              {doc.metricCode} ({doc.metricType})
                            </span>
                            <span className="block font-medium text-gray-700 text-[11px]">
                              {doc.criterionCode}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-semibold text-gray-700">
                          {doc.academicYear}
                        </td>

                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => openFileInNewTab(doc.fileUrl, doc.title)}
                            className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold underline hover:no-underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[140px]">{doc.fileName}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </button>
                        </td>

                        <td className="py-4 px-4">
                          {renderStatusBadge(doc.status)}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {doc.status === 'draft' && (
                              <button
                                type="button"
                                onClick={() => submitDocumentToSchool(doc.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                              >
                                <Send className="w-3 h-3" /> Submit
                              </button>
                            )}

                            {doc.status === 'changes_requested' && (
                              <button
                                type="button"
                                onClick={() => submitDocumentToSchool(doc.id)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                              >
                                <RotateCcw className="w-3 h-3" /> Resubmit
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteNaacDocument(doc.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 🏫 STAGE 2: SCHOOL COORDINATOR VIEW                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'school' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* School Context Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-base shrink-0">
                🏫
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-blue-700 tracking-wider">
                  Logged In As School Coordinator
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Dr. Rajesh Sharma — School Review & Quality Gate
                </h3>
                <p className="text-xs text-gray-500">
                  {ITM_SCHOOLS.find(s => s.id === schoolCoordSchoolId)?.name} • Dean: {ITM_SCHOOLS.find(s => s.id === schoolCoordSchoolId)?.deanName}
                </p>
              </div>
            </div>

            {/* School Switcher for Demo */}
            <div className="flex items-center gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Active School:</label>
                <select
                  value={schoolCoordSchoolId}
                  onChange={e => {
                    setSchoolCoordSchoolId(e.target.value);
                    setSchoolProgramFilter('all');
                  }}
                  className="text-xs font-semibold px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {ITM_SCHOOLS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Filter Department:</label>
                <select
                  value={schoolProgramFilter}
                  onChange={e => setSchoolProgramFilter(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Departments in School</option>
                  {ITM_SCHOOLS.find(s => s.id === schoolCoordSchoolId)?.programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* School Review Queue */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Departmental Submissions for Review ({schoolDocuments.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Review submitted documents, check against Criteria guidelines, and approve to forward to the university.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                {schoolDocuments.filter(d => d.status === 'submitted_to_school').length} Pending Review
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200">
                    <th className="py-3.5 px-4 sm:px-6">Document & Department</th>
                    <th className="py-3.5 px-4">Criterion / Metric</th>
                    <th className="py-3.5 px-4">Proof File</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {schoolDocuments.map(doc => (
                    <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div>
                          <span className="font-bold text-gray-900 text-sm block">
                            {doc.title}
                          </span>
                          <span className="text-[11px] font-semibold text-blue-700 block mt-0.5">
                            {doc.programName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Uploaded by {doc.uploadedBy} on {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 font-mono">
                          {doc.metricCode}
                        </span>
                        <span className="block text-[11px] text-gray-600 font-medium mt-0.5">
                          {doc.metricName}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => openFileInNewTab(doc.fileUrl, doc.title)}
                          className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View PDF ({doc.fileSize || '2 MB'})</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>

                      <td className="py-4 px-4">
                        {renderStatusBadge(doc.status)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {doc.status === 'submitted_to_school' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setReviewNoteModalDoc(doc);
                                setReviewActionType('approve');
                                setReviewFeedbackNote('');
                              }}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve & Forward
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setReviewNoteModalDoc(doc);
                                setReviewActionType('revision');
                                setReviewFeedbackNote('');
                              }}
                              className="px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-gray-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <AlertCircle className="w-3.5 h-3.5" /> Request Changes
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">
                            Reviewed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 🏛️ STAGE 3: UNIVERSITY COORDINATOR VIEW                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'university' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* University Context Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center font-bold text-base shrink-0">
                🏛️
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-purple-700 tracking-wider">
                  Logged In As University IQAC Coordinator
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Dr. Vikram Malhotra — Master NAAC Institutional Oversight
                </h3>
                <p className="text-xs text-gray-500">
                  ITM Skills University • Governing all 5 Schools and 18 Academic Programs
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowExportSuccess(true);
                setTimeout(() => setShowExportSuccess(false), 3000);
              }}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-700/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Export NAAC SSR Master Dossier</span>
            </button>
          </div>

          {showExportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>NAAC Self-Study Report (SSR) Evidence Manifest generated successfully! All verified document URLs compiled.</span>
            </div>
          )}

          {/* 5-School Completeness Matrix */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              5-School NAAC Completeness Heatmap
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Real-time submission and verification status across all 5 constituent schools.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {ITM_SCHOOLS.map(school => {
                const schoolDocs = documents.filter(d => d.schoolId === school.id);
                const verifiedInSchool = schoolDocs.filter(d => d.status === 'university_verified').length;
                const progressPct = schoolDocs.length > 0 ? Math.round((verifiedInSchool / schoolDocs.length) * 100) : 0;

                return (
                  <div key={school.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200">
                        {school.shortCode}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 mt-2 line-clamp-1" title={school.name}>
                        {school.name}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {school.programs.length} Programs
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/80">
                      <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                        <span className="text-gray-600">Verification</span>
                        <span className="text-purple-700">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {verifiedInSchool} of {schoolDocs.length} proofs locked
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Master Dossier Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Master University Evidence Register ({univDocuments.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Perform final university IQAC sign-off to lock evidence proofs into the permanent NAAC archive.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={univSchoolFilter}
                  onChange={e => setUnivSchoolFilter(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                >
                  <option value="all">All 5 Schools</option>
                  {ITM_SCHOOLS.map(s => (
                    <option key={s.id} value={s.id}>{s.shortCode}</option>
                  ))}
                </select>

                <select
                  value={univCriterionFilter}
                  onChange={e => setUnivCriterionFilter(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                >
                  <option value="all">All 7 Criteria</option>
                  {NAAC_CRITERIA_SUMMARY.map(c => (
                    <option key={c.id} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200">
                    <th className="py-3.5 px-4 sm:px-6">Document Title</th>
                    <th className="py-3.5 px-4">School & Department</th>
                    <th className="py-3.5 px-4">Criterion</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">University Sign-Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {univDocuments.map(doc => (
                    <tr key={doc.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-bold text-gray-900 text-sm block">
                          {doc.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => openFileInNewTab(doc.fileUrl, doc.title)}
                          className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 underline text-xs font-medium mt-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{doc.fileName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-800 block">{doc.schoolName}</span>
                        <span className="text-[11px] text-gray-500">{doc.programName}</span>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-purple-700">
                        {doc.metricCode} ({doc.criterionCode})
                      </td>

                      <td className="py-4 px-4">
                        {renderStatusBadge(doc.status)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {doc.status === 'approved_by_school' ? (
                          <button
                            type="button"
                            onClick={() => verifyUniversityDocument(doc.id, true, 'Verified and locked for NAAC SSR Archive.', 'Dr. Vikram Malhotra')}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Lock & Verify
                          </button>
                        ) : doc.status === 'university_verified' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Locked
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            Awaiting School
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 📚 STAGE 4: CRITERIA 1–7 REPOSITORIES                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'criteria' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Criteria Horizontal Selector Tabs */}
          <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {NAAC_CRITERIA_SUMMARY.map(c => {
                const isSelected = selectedCriterionCode === c.code;
                const cDocs = documents.filter(d => d.criterionCode === c.code);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCriterionCode(c.code);
                      setCriteriaMetricFilter('all');
                    }}
                    className={`px-4 py-3 rounded-xl text-left shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-500'
                        : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        {c.code}
                      </span>
                      <span className={`text-[10px] font-extrabold ${isSelected ? 'text-amber-200' : 'text-amber-700'}`}>
                        {c.weightage} Pts
                      </span>
                    </div>
                    <span className="block text-xs font-bold truncate max-w-[170px]">{c.name}</span>
                    <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-amber-100' : 'text-gray-400'}`}>
                      {cDocs.length} proofs attached
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Criterion Details & Action Banner */}
          {(() => {
            const currentCriterion = NAAC_CRITERIA_SUMMARY.find(c => c.code === selectedCriterionCode) || NAAC_CRITERIA_SUMMARY[0];
            const metricsForCriterion = NAAC_METRICS_LIST.filter(m => m.criterionCode === currentCriterion.code);
            const criterionDocs = documents.filter(d => {
              const matchesCriterion = d.criterionCode === currentCriterion.code;
              const matchesMetric = criteriaMetricFilter === 'all' || d.metricCode === criteriaMetricFilter;
              return matchesCriterion && matchesMetric;
            });
            const verifiedCount = criterionDocs.filter(d => d.status === 'university_verified').length;

            return (
              <div className="space-y-6">
                {/* Criterion Info Header */}
                <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-amber-900/40 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-mono">
                        NAAC {currentCriterion.code}
                      </span>
                      <span className="text-xs font-bold text-amber-200">
                        Institutional Weightage: {currentCriterion.weightage} / 1000
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {currentCriterion.name}
                    </h2>
                    <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                      {currentCriterion.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                      <span className="block text-2xl font-black text-amber-300">{criterionDocs.length}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-300">Total Proofs</span>
                    </div>
                    <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-400/20 text-center min-w-[100px]">
                      <span className="block text-2xl font-black text-emerald-300">{verifiedCount}</span>
                      <span className="text-[10px] uppercase font-bold text-emerald-200">Locked / Verified</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const firstMetric = metricsForCriterion[0]?.code || '1.1.1';
                        setNewMetricCode(firstMetric);
                        setActiveTab('program');
                        setIsUploadModalOpen(true);
                      }}
                      className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload Proof to {currentCriterion.code}</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Evaluation Metrics under {currentCriterion.code} ({metricsForCriterion.length} Metrics)
                      </h3>
                      <p className="text-xs text-gray-500">
                        Click any metric to filter the evidence register below.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCriteriaMetricFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          criteriaMetricFilter === 'all'
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        All Metrics ({metricsForCriterion.length})
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {metricsForCriterion.map(m => {
                      const isSelectedMetric = criteriaMetricFilter === m.code;
                      const mDocs = documents.filter(d => d.metricCode === m.code);
                      return (
                        <div
                          key={m.code}
                          onClick={() => setCriteriaMetricFilter(isSelectedMetric ? 'all' : m.code)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelectedMetric
                              ? 'bg-amber-50 border-amber-500 shadow-sm'
                              : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-900">
                                Metric {m.code}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                m.metricType === 'QnM'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}>
                                {m.metricType === 'QnM' ? 'Quantitative (QnM)' : 'Qualitative (QlM)'}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{m.name}</h4>
                            <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{m.description}</p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-gray-200/70 flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-gray-600">{mDocs.length} Evidence Proofs</span>
                            <span className="font-bold text-amber-700">Filter ➔</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Evidence Proofs Table under Criterion */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Evidence Documents Attached to {currentCriterion.code} ({criterionDocs.length})
                      </h3>
                      <p className="text-xs text-gray-500">
                        Live proof registry submitted across all 5 schools and 18 programs.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200">
                          <th className="py-3.5 px-4 sm:px-6">Document Title</th>
                          <th className="py-3.5 px-4">School & Department</th>
                          <th className="py-3.5 px-4">Metric Code</th>
                          <th className="py-3.5 px-4">Year</th>
                          <th className="py-3.5 px-4">Proof File</th>
                          <th className="py-3.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {criterionDocs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-gray-400">
                              No evidence proofs uploaded for this metric yet. Click "Upload Proof" to add.
                            </td>
                          </tr>
                        ) : (
                          criterionDocs.map(doc => (
                            <tr key={doc.id} className="hover:bg-amber-50/20 transition-colors">
                              <td className="py-4 px-4 sm:px-6">
                                <span className="font-bold text-gray-900 text-sm block">
                                  {doc.title}
                                </span>
                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                  Uploaded by {doc.uploadedBy} on {new Date(doc.uploadedAt).toLocaleDateString()}
                                </span>
                              </td>

                              <td className="py-4 px-4">
                                <span className="font-bold text-gray-800 block">{doc.schoolName}</span>
                                <span className="text-[11px] text-blue-700 font-semibold">{doc.programName}</span>
                              </td>

                              <td className="py-4 px-4 font-mono font-bold text-gray-800">
                                <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                                  {doc.metricCode}
                                </span>
                              </td>

                              <td className="py-4 px-4 font-semibold text-gray-700">
                                {doc.academicYear}
                              </td>

                              <td className="py-4 px-4">
                                <button
                                  type="button"
                                  onClick={() => openFileInNewTab(doc.fileUrl, doc.title)}
                                  className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold underline"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>{doc.fileName}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </td>

                              <td className="py-4 px-4">
                                {renderStatusBadge(doc.status)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 🏢 STAGE 5: 5 CONSTITUENT SCHOOLS DIRECTORY                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'schools' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-cyan-900/40 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Constituent Structure
                </span>
                <span className="text-xs font-semibold text-gray-300">
                  ITM Skills University
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                5 Constituent Schools & 18 Academic Programs
              </h2>
              <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                Autonomous and deemed multi-faculty collegiate structure participating in NAAC Accreditation Cycle 1.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                <span className="block text-2xl font-black text-cyan-300">5</span>
                <span className="text-[10px] uppercase font-bold text-gray-300">Schools</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                <span className="block text-2xl font-black text-white">18</span>
                <span className="text-[10px] uppercase font-bold text-gray-300">Programs</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search schools, programs, or coordinators..."
                value={schoolsDirectorySearch}
                onChange={e => setSchoolsDirectorySearch(e.target.value)}
                className="w-full text-xs font-medium pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
            {schoolsDirectorySearch && (
              <button
                type="button"
                onClick={() => setSchoolsDirectorySearch('')}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-3 py-2 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* 5 Detailed School Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {ITM_SCHOOLS
              .filter(s => {
                if (!schoolsDirectorySearch.trim()) return true;
                const q = schoolsDirectorySearch.toLowerCase();
                const matchesSchool = s.name.toLowerCase().includes(q) || s.deanName.toLowerCase().includes(q);
                const matchesProg = s.programs.some(p => p.name.toLowerCase().includes(q) || p.coordinatorName.toLowerCase().includes(q));
                return matchesSchool || matchesProg;
              })
              .map(school => {
                const sDocs = documents.filter(d => d.schoolId === school.id);
                const verifiedInSchool = sDocs.filter(d => d.status === 'university_verified').length;
                const progressPct = sDocs.length > 0 ? Math.round((verifiedInSchool / sDocs.length) * 100) : 0;

                return (
                  <div key={school.id} className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                    {/* School Top Header */}
                    <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-br from-gray-50/80 to-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center justify-center font-black text-sm shrink-0">
                            {school.shortCode}
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                              Constituent Faculty
                            </span>
                            <h3 className="text-base font-bold text-gray-900 mt-1">
                              {school.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Coordinator: <span className="font-semibold text-gray-800">{school.deanName}</span> • {school.deanEmail}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-black text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                          {school.programs.length} Programs
                        </span>
                      </div>

                      {/* Verification Progress Bar */}
                      <div className="mt-4 pt-3 border-t border-gray-200/80">
                        <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                          <span className="text-gray-600">Verification Completeness</span>
                          <span className="text-cyan-700 font-bold">{progressPct}% ({verifiedInSchool}/{sDocs.length} Proofs)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-cyan-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Academic Programs List inside this School */}
                    <div className="p-5 sm:p-6 space-y-3 flex-1">
                      <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
                        Departments & Academic Offerings:
                      </h4>

                      <div className="space-y-2">
                        {school.programs.map(prog => {
                          const pDocs = documents.filter(d => d.programId === prog.id);
                          return (
                            <div
                              key={prog.id}
                              className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <span className="font-bold text-gray-900 block">{prog.name}</span>
                                <span className="text-[11px] text-gray-500">
                                  Lead: {prog.coordinatorName} ({prog.degreeType})
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
                                  {pDocs.length} proofs
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSchoolId(school.id);
                                    setSelectedProgramId(prog.id);
                                    setActiveTab('program');
                                  }}
                                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded hover:bg-emerald-50 cursor-pointer"
                                >
                                  Upload ➔
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* School Actions Footer */}
                    <div className="p-4 sm:p-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSchoolId(school.id);
                          setSelectedProgramId(school.programs[0]?.id || '');
                          setActiveTab('program');
                        }}
                        className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Department Desk
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSchoolId(school.id);
                          setSchoolCoordSchoolId(school.id);
                          setActiveTab('school');
                        }}
                        className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <span>Review School Queue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 📤 UPLOAD EVIDENCE MODAL                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Upload & Submit NAAC Evidence Proof
                  </h3>
                  <p className="text-xs text-gray-500">
                    {activeProgramObj.name} ({activeSchoolObj.name})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Document / Evidence Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Outcome-Based Education (OBE) Attainment Rubrics 2025"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    NAAC Metric Code & Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMetricCode}
                    onChange={e => setNewMetricCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold bg-white"
                  >
                    {NAAC_METRICS_LIST.map(m => (
                      <option key={m.code} value={m.code}>
                        {m.code} - {m.name.slice(0, 42)}... ({m.metricType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newYear}
                    onChange={e => setNewYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold bg-white"
                  >
                    <option value="2025-2026">2025-2026 (Current Academic Year)</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="2022-2023">2022-2023</option>
                  </select>
                </div>
              </div>

              {/* Metric Details Notice */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-blue-900">{activeMetricObj.criterionCode}: {activeMetricObj.name}</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-200 text-blue-800">
                    {activeMetricObj.metricType === 'QnM' ? 'Quantitative Metric' : 'Qualitative Metric'}
                  </span>
                </div>
                <p className="text-[11px] text-blue-700">
                  {activeMetricObj.description}
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Evidence Description / Context Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide context on methodology, student batches covered, or meeting dates..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Attach Supporting PDF Document / Proof <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-gray-50/50">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="evidence_pdf_input"
                  />
                  <label htmlFor="evidence_pdf_input" className="cursor-pointer block">
                    <FileText className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                    <span className="font-bold text-gray-800 block text-xs">
                      {newFileName ? newFileName : 'Click to browse & upload PDF file'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {newFileSize ? `Size: ${newFileSize}` : 'PDF files up to 25MB supported'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveEvidence('draft')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={!newTitle.trim()}
                onClick={() => handleSaveEvidence('submitted_to_school')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to School Coordinator</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 📝 SCHOOL REVIEW NOTE MODAL                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {reviewNoteModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {reviewActionType === 'approve' ? 'Approve & Forward Submission' : 'Request Revision / Changes'}
              </h3>
              <button
                type="button"
                onClick={() => setReviewNoteModalDoc(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="font-semibold text-gray-800">
                Document: <span className="font-normal text-gray-600">{reviewNoteModalDoc.title}</span>
              </p>
              <p className="font-semibold text-gray-800">
                Department: <span className="font-normal text-gray-600">{reviewNoteModalDoc.programName}</span>
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {reviewActionType === 'approve' ? 'Verification Remarks (Optional):' : 'Specific Changes Required:*'}
                </label>
                <textarea
                  rows={3}
                  placeholder={reviewActionType === 'approve' ? 'e.g. Verified against Criteria rubrics. Quality matches requirements.' : 'e.g. Please attach the student attendance sheets and official council approval.'}
                  value={reviewFeedbackNote}
                  onChange={e => setReviewFeedbackNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReviewNoteModalDoc(null)}
                className="px-3.5 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSchoolReview}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md ${
                  reviewActionType === 'approve' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {reviewActionType === 'approve' ? 'Confirm Approval' : 'Send Revision Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
