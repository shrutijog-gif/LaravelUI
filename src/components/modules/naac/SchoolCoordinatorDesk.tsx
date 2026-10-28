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
  Info
} from 'lucide-react';
import { 
  ITM_SCHOOLS, 
  NAAC_CRITERIA_SUMMARY, 
  NAAC_METRICS_LIST, 
  KEY_INDICATORS,
  NaacEvidenceDocument, 
  getStoredNaacDocuments, 
  reviewSchoolDocument,
  deleteNaacDocument 
} from '../../../data/naacDmsData';
import { openFileInNewTab } from '../../../utils/fileHelper';
import { NaacQuickUploadLanding } from './NaacQuickUploadLanding';

interface SchoolCoordinatorDeskProps {
  initialTab?: 'quick-upload' | 'repository' | 'review-queue';
}

export const SchoolCoordinatorDesk: React.FC<SchoolCoordinatorDeskProps> = ({
  initialTab = 'quick-upload',
}) => {
  const [deskMode, setDeskMode] = useState<'quick-upload' | 'repository' | 'review-queue'>(initialTab);
  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() => getStoredNaacDocuments());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
  const allSchoolDocs = documents.filter(d => d.schoolId === currentSchool.id || d.schoolId === 'sch-eng');

  // Documents submitted by program coordinators needing school review
  const pendingReviewDocs = allSchoolDocs.filter(d => d.status === 'submitted_to_school');
  const approvedDocs = allSchoolDocs.filter(d => d.status === 'approved_by_school');
  const verifiedDocs = allSchoolDocs.filter(d => d.status === 'university_verified');

  // School Repository: Always approved proofs (school approved, university verified, or uploaded by school coordinator)
  const schoolDocs = allSchoolDocs.filter(d => 
    d.status === 'approved_by_school' || d.status === 'university_verified' || !d.status || d.uploadedBy?.includes('School Coordinator')
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

  // Approve & Forward to University
  const handleApproveDocument = (doc: NaacEvidenceDocument) => {
    reviewSchoolDocument(
      doc.id, 
      true, 
      'Approved by School Coordinator & Dean. All evidentiary requirements satisfied for AQAR/SSR compilation.',
      'Dr. Rajesh Sharma (School Coordinator)'
    );
    refreshDocuments();
    showToast(`✅ Approved "${doc.fileName}" and forwarded to University IQAC!`);
  };

  // Batch Approve Selected Documents
  const handleBatchApproveSelected = () => {
    if (selectedReviewDocIds.length === 0) return;
    const count = selectedReviewDocIds.length;
    selectedReviewDocIds.forEach(id => {
      reviewSchoolDocument(
        id, 
        true, 
        'Approved by School Coordinator & Dean. All evidentiary requirements satisfied for AQAR/SSR compilation.',
        'Dr. Rajesh Sharma (School Coordinator)'
      );
    });
    setSelectedReviewDocIds([]);
    refreshDocuments();
    showToast(`✅ Successfully approved ${count} document${count > 1 ? 's' : ''} and forwarded to University IQAC!`);
  };

  // Submit Revision Feedback
  const handleSubmitRevision = () => {
    if (!revisionDoc) return;
    const note = revisionFeedback.trim() || 'Please re-upload with official departmental stamp and BoS verification.';
    reviewSchoolDocument(
      revisionDoc.id, 
      false, 
      note, 
      'Dr. Rajesh Sharma (School Coordinator)'
    );
    refreshDocuments();
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
  const handleSwitchPortalRole = (role: 'naac-program' | 'naac-school' | 'naac-university') => {
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
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setDeskMode('quick-upload')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  deskMode === 'quick-upload'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Quick Proof Drop</span>
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
              {/* Integrated Department Color Key Strip */}
              <div className="bg-slate-50/90 border-b border-gray-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Department Key:</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-gray-700">
                  <span className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-default" title="B.Tech Computer Science & Engineering (Prof. Anita Verma)">
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
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 w-[36%]">Metric / NAAC Hierarchy</th>
                      <th className="py-2.5 px-3 w-[8%]">Type</th>
                      <th className="py-2.5 px-3 w-[26%]">Attached Document</th>
                      <th className="py-2.5 px-3 w-[16%]">
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
                      <th className="py-2.5 px-3 w-[10%]"></th>
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
                                        <div className="flex items-center gap-1.5">
                                          <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                          <button
                                            type="button"
                                            onClick={() => openFileInNewTab(doc.fileUrl)}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline truncate text-left cursor-pointer max-w-[280px]"
                                            title={`Open ${doc.fileName || doc.title}`}
                                          >
                                            {doc.fileName || doc.title}
                                          </button>
                                        </div>
                                      </td>

                                      {/* Col 4: Uploaded By with Department Dot (Single Line) */}
                                      <td className="py-2.5 px-3 text-gray-700 align-top text-xs">
                                        {(() => {
                                          const dept = getDepartmentDot(doc);
                                          return (
                                            <div 
                                              className="flex items-center gap-2 truncate"
                                              title={`${dept.label} • ${doc.facultyName || doc.uploadedBy}`}
                                            >
                                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dept.color}`} title={`Department: ${dept.label}`} />
                                              <span className="font-semibold text-gray-900 truncate">
                                                {doc.facultyName || doc.uploadedBy}
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
                        <th className="py-2.5 px-3 w-[16%]">Submitted By</th>
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
                                <div className="flex items-start gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${dept.color}`} title={`Department: ${dept.label}`} />
                                  <div>
                                    <span className="font-bold text-gray-900 block text-xs leading-snug">
                                      {doc.programName}
                                    </span>
                                    <span className="text-[10px] text-gray-500 block mt-0.5">
                                      {doc.academicYear}
                                    </span>
                                  </div>
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

                              {/* Submitted By (no department dot here) */}
                              <td className="py-3 px-3 align-top">
                                <span className="font-semibold text-gray-800 block text-xs truncate">
                                  {doc.uploadedBy}
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
    </div>
  );
};
