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
  ShieldCheck,
  BarChart3,
  Award,
  Lock,
  MessageSquare,
  Layers,
  Cpu,
  Briefcase,
  Palette,
  HeartPulse,
  UtensilsCrossed,
  Bell,
  Send,
  AlertTriangle,
  Mail,
  User,
  GraduationCap,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { 
  ITM_SCHOOLS, 
  NAAC_CRITERIA_SUMMARY, 
  NAAC_METRICS_LIST, 
  KEY_INDICATORS,
  NaacEvidenceDocument, 
  NaacSchool,
  NaacProgram,
  getStoredNaacDocuments, 
  verifyUniversityDocument,
  deleteNaacDocument 
} from '../../../data/naacDmsData';
import { openFileInNewTab } from '../../../utils/fileHelper';
import { NaacQuickUploadLanding } from './NaacQuickUploadLanding';

const SCHOOL_THEMES: Record<string, {
  color: string;
  bgLight: string;
  borderLight: string;
  badgeBg: string;
  icon: React.ElementType;
  gradient: string;
}> = {
  'sch-tech': {
    color: 'text-blue-600',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Cpu,
    gradient: 'from-blue-600 to-indigo-700',
  },
  'sch-mgmt': {
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: Briefcase,
    gradient: 'from-emerald-600 to-teal-700',
  },
  'sch-design': {
    color: 'text-purple-600',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Palette,
    gradient: 'from-purple-600 to-pink-600',
  },
  'sch-health': {
    color: 'text-teal-600',
    bgLight: 'bg-teal-50',
    borderLight: 'border-teal-200',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
    icon: HeartPulse,
    gradient: 'from-teal-600 to-cyan-700',
  },
  'sch-hospitality': {
    color: 'text-amber-600',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: UtensilsCrossed,
    gradient: 'from-amber-600 to-orange-600',
  },
};

interface UniversityCoordinatorDeskProps {
  initialTab?: 'quick-upload' | 'repository' | 'verification-queue' | 'ssr-matrix';
}

export const UniversityCoordinatorDesk: React.FC<UniversityCoordinatorDeskProps> = ({
  initialTab = 'quick-upload',
}) => {
  const [deskMode, setDeskMode] = useState<'quick-upload' | 'repository' | 'verification-queue' | 'ssr-matrix'>(initialTab);
  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() => getStoredNaacDocuments());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('all');
  const [selectedCriterionFilter, setSelectedCriterionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'locked' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('2025-26');

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

  // Reopen Feedback Modal State
  const [reopenDoc, setReopenDoc] = useState<NaacEvidenceDocument | null>(null);
  const [reopenNote, setReopenNote] = useState<string>('');

  // School Slide-Over Drawer & Reminder States
  const [selectedSchoolForDrawer, setSelectedSchoolForDrawer] = useState<NaacSchool | null>(null);
  const [remindersSent, setRemindersSent] = useState<Record<string, string>>({});

  // School card expand/collapse state (default: all collapsed for super clean view)
  const [expandedSchools, setExpandedSchools] = useState<Record<string, boolean>>({});

  const toggleSchoolExpand = (schoolId: string) => {
    setExpandedSchools(prev => ({ ...prev, [schoolId]: !prev[schoolId] }));
  };

  const expandAllSchools = () => {
    const all: Record<string, boolean> = {};
    ITM_SCHOOLS.forEach(s => { all[s.id] = true; });
    setExpandedSchools(all);
  };

  const collapseAllSchools = () => {
    setExpandedSchools({});
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendReminder = (program: NaacProgram, schoolName: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRemindersSent(prev => ({ ...prev, [program.id]: timeStr }));
    showToast(`📢 Official IQAC Reminder sent to ${program.coordinatorName} (${program.coordinatorEmail}) for ${program.shortCode} evidence proof submission.`);
  };

  const handleSendBatchReminders = (school: NaacSchool) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: Record<string, string> = {};
    school.programs.forEach(p => {
      updated[p.id] = timeStr;
    });
    setRemindersSent(prev => ({ ...prev, ...updated }));
    showToast(`📢 Batch IQAC Reminders sent to all ${school.programs.length} program coordinators across ${school.shortCode}.`);
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

  // Filter queues
  const pendingVerificationDocs = documents.filter(
    d => d.status === 'approved_by_school' || d.status === 'submitted_to_university'
  );
  const verifiedDocs = documents.filter(d => d.status === 'university_verified');
  const totalVerifiedCount = verifiedDocs.length;
  const overallSSRProgress = Math.min(100, Math.round((totalVerifiedCount / Math.max(1, documents.length)) * 100));

  // Verify and Lock Document
  const handleVerifyDocument = (doc: NaacEvidenceDocument) => {
    verifyUniversityDocument(
      doc.id, 
      true, 
      'Verified by Central IQAC Steering Committee. Locked for permanent SSR Dossier submission.',
      'Dr. Vikram Malhotra (IQAC Director)'
    );
    refreshDocuments();
    showToast(`🔒 "${doc.fileName}" verified and locked into NAAC SSR Master Archive!`);
  };

  // Re-open with Feedback
  const handleSubmitReopen = () => {
    if (!reopenDoc) return;
    const note = reopenNote.trim() || 'Central IQAC requires additional signed compliance annexures.';
    verifyUniversityDocument(
      reopenDoc.id, 
      false, 
      note, 
      'Dr. Vikram Malhotra (IQAC Director)'
    );
    refreshDocuments();
    setReopenDoc(null);
    setReopenNote('');
    showToast(`⚠️ Revision request sent back for "${reopenDoc.fileName}".`);
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
        <div className="fixed top-5 right-5 z-50 bg-[#0f2748] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-purple-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
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

      {/* ACTION TABS BAR FOR REPOSITORY / QUEUE / SSR MODES */}
      {deskMode !== 'quick-upload' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1 flex items-center justify-between">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDeskMode('quick-upload')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                deskMode === 'quick-upload'
                  ? 'bg-white text-purple-700 shadow-2xs border border-slate-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Quick Proof Drop</span>
            </button>

            <button
              type="button"
              onClick={() => setDeskMode('ssr-matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                deskMode === 'ssr-matrix'
                  ? 'bg-white text-purple-700 shadow-2xs border border-slate-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
              <span>NAAC Readiness</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 rounded-full font-bold">
                {overallSSRProgress}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDeskMode('verification-queue')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                deskMode === 'verification-queue'
                  ? 'bg-white text-purple-700 shadow-2xs border border-slate-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Verification Queue</span>
              {pendingVerificationDocs.length > 0 && (
                <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {pendingVerificationDocs.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setDeskMode('repository')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                deskMode === 'repository'
                  ? 'bg-white text-purple-700 shadow-2xs border border-slate-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>University Repository</span>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 rounded-full font-bold">
                {documents.length}
              </span>
            </button>
          </div>

          <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded font-mono text-xs font-semibold border border-purple-200">
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
            role="university"
            hideTopUploadButton={true}
            topBarLeftSlot={
              <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeskMode('quick-upload')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white text-purple-700 shadow-2xs border border-slate-200/80"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Quick Proof Drop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeskMode('ssr-matrix')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                  <span>NAAC Readiness</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 rounded-full font-bold">
                    {overallSSRProgress}%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeskMode('verification-queue')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Verification Queue</span>
                  {pendingVerificationDocs.length > 0 && (
                    <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                      {pendingVerificationDocs.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDeskMode('repository')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>University Repository</span>
                  <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 rounded-full font-bold">
                    {documents.length}
                  </span>
                </button>
              </div>
            }
            headingTitle="Drop NAAC Evidence"
            schoolId="sch-central"
            schoolName="ITM Skills University Central Archive"
            submitTargetName="Permanent SSR Archive"
            uploaderName="Dr. Vikram Malhotra (IQAC Director)"
            storageKeySuffix="univ_iqac"
            onNavigateToDocumentList={(critCode, metricCode) => {
              setDeskMode('repository');
              if (critCode) {
                setSelectedCriterionFilter(critCode);
                setCollapsedCriteria(prev => ({ ...prev, [critCode]: false }));
              }
            }}
          />
        )}

        {/* VIEW 2: MASTER UNIVERSITY DOCUMENT REPOSITORY (GRID) */}
        {deskMode === 'repository' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Top Filter and Search Bar (Single-Line Compact Bar) */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between gap-2.5 text-xs overflow-x-auto flex-nowrap whitespace-nowrap">
              <div className="flex items-center gap-2.5 shrink-0">
                {/* School Filter */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-semibold text-gray-600">School:</span>
                  <select
                    value={selectedSchoolFilter}
                    onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                    className="px-2 py-1.5 bg-slate-50 border border-gray-300 rounded text-xs font-medium text-gray-800 cursor-pointer focus:ring-1 focus:ring-purple-500 max-w-[170px] truncate"
                  >
                    <option value="all">All 5 Schools</option>
                    {ITM_SCHOOLS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    <option value="sch-central">University Central Master Proofs</option>
                  </select>
                </div>

                {/* Criterion Filter */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-semibold text-gray-600">Criterion:</span>
                  <select
                    value={selectedCriterionFilter}
                    onChange={(e) => setSelectedCriterionFilter(e.target.value)}
                    className="px-2 py-1.5 bg-slate-50 border border-gray-300 rounded text-xs font-medium text-gray-800 cursor-pointer focus:ring-1 focus:ring-purple-500 max-w-[160px] truncate"
                  >
                    <option value="all">All Criteria (1–7)</option>
                    {NAAC_CRITERIA_SUMMARY.map(c => (
                      <option key={c.id} value={c.code}>{c.code}: {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quick Status Filter Pills */}
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded border border-gray-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      statusFilter === 'all' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Proofs ({documents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('locked')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'locked' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Lock className="w-2.5 h-2.5 text-purple-600" />
                    <span>Locked ({verifiedDocs.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('approved')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'approved' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Awaiting Lock ({pendingVerificationDocs.length})</span>
                  </button>
                </div>
              </div>

              {/* Right: Search + Expand/Collapse */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    placeholder="Search proofs, files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 pr-2.5 py-1.5 border border-gray-300 rounded text-xs w-36 lg:w-48 focus:ring-1 focus:ring-purple-500 bg-white"
                  />
                </div>

                <div className="inline-flex items-center gap-0.5 border border-gray-200 rounded p-0.5 bg-gray-50 text-[11px] font-semibold text-gray-600 shrink-0">
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

            {/* University Repository Hierarchical Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 w-[28%]">Metric / NAAC Hierarchy</th>
                      <th className="py-2.5 px-3 w-[7%]">Type</th>
                      <th className="py-2.5 px-3 w-[33%]">Evidence Proof</th>
                      <th className="py-2.5 px-3 w-[18%]">School & Department</th>
                      <th className="py-2.5 px-3 w-[10%] text-center">SSR Status</th>
                      <th className="py-2.5 px-2 w-[4%] text-center">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {NAAC_CRITERIA_SUMMARY.filter(crit => {
                      if (selectedCriterionFilter !== 'all' && crit.code !== selectedCriterionFilter) return false;
                      return true;
                    }).map((crit) => {
                      const isCritCollapsed = Boolean(collapsedCriteria[crit.code]);
                      const critIndicators = KEY_INDICATORS.filter(ki => ki.criterionCode === crit.code);
                      const critDocs = documents.filter(d => {
                        const matchesCrit = d.criterionCode === crit.code;
                        const matchesSchool = selectedSchoolFilter === 'all' || d.schoolId === selectedSchoolFilter;
                        const matchesSearch = !searchQuery.trim() || 
                          d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.metricCode.includes(searchQuery);
                        return matchesCrit && matchesSchool && matchesSearch;
                      });

                      return (
                        <React.Fragment key={crit.id}>
                          {/* CRITERION LEVEL ROW */}
                          <tr
                            onClick={() => toggleCriterion(crit.code)}
                            className="bg-slate-100/80 hover:bg-slate-200/70 border-y border-slate-300/80 cursor-pointer select-none transition-colors"
                          >
                            <td colSpan={6} className="py-2.5 px-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isCritCollapsed ? (
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                  )}
                                  <span className="font-mono text-xs font-bold text-[#0f2748] bg-white px-2 py-0.5 rounded border border-slate-300">
                                    {crit.code}
                                  </span>
                                  <span className="text-xs font-bold text-gray-900">
                                    {crit.name}
                                  </span>
                                </div>
                                <span className="text-[11px] font-semibold text-purple-800 bg-white px-2.5 py-0.5 rounded-full border border-purple-200">
                                  {critDocs.length} institutional proofs
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* KEY INDICATOR & METRICS */}
                          {!isCritCollapsed && critIndicators.map((ki) => {
                            const isKiCollapsed = Boolean(collapsedKeyIndicators[ki.code]);
                            const kiMetrics = NAAC_METRICS_LIST.filter(m => m.code.startsWith(ki.code));
                            const kiDocs = documents.filter(d => {
                              const matchesKi = d.metricCode.startsWith(ki.code);
                              const matchesSchool = selectedSchoolFilter === 'all' || d.schoolId === selectedSchoolFilter;
                              const matchesSearch = !searchQuery.trim() || 
                                d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                d.metricCode.includes(searchQuery);
                              return matchesKi && matchesSchool && matchesSearch;
                            });

                            return (
                              <React.Fragment key={ki.code}>
                                <tr
                                  onClick={() => toggleKeyIndicator(ki.code)}
                                  className="bg-purple-50/40 hover:bg-purple-100/40 border-b border-purple-100 cursor-pointer select-none transition-colors"
                                >
                                  <td colSpan={6} className="py-2 px-6">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {isKiCollapsed ? (
                                          <ChevronRight className="w-3.5 h-3.5 text-purple-600" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5 text-purple-600" />
                                        )}
                                        <span className="font-mono text-[11px] font-bold text-purple-700 bg-white px-1.5 py-0.2 rounded border border-purple-200">
                                          KI {ki.code}
                                        </span>
                                        <span className="text-xs font-bold text-purple-950">
                                          {ki.name}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-semibold text-purple-700 bg-white px-2 py-0.2 rounded-full border border-purple-200">
                                        {kiDocs.length} {kiDocs.length === 1 ? 'doc' : 'docs'}
                                      </span>
                                    </div>
                                  </td>
                                </tr>

                                {/* METRICS ROWS */}
                                {!isKiCollapsed && kiMetrics.map((metric) => {
                                  const metricDocs = documents.filter(d => {
                                    const matchM = d.metricCode === metric.code;
                                    const matchSchool = selectedSchoolFilter === 'all' || d.schoolId === selectedSchoolFilter;
                                    const matchStatus = 
                                      statusFilter === 'all' ? true :
                                      statusFilter === 'locked' ? d.status === 'university_verified' :
                                      (d.status === 'approved_by_school' || d.status === 'submitted_to_university');
                                    const matchQ = !searchQuery.trim() || 
                                      (d.fileName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      (d.schoolName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      (d.programName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      d.metricCode.includes(searchQuery);
                                    return matchM && matchSchool && matchStatus && matchQ;
                                  });

                                  if (metricDocs.length === 0) {
                                    return (
                                      <tr key={metric.code} className="hover:bg-slate-50/60 transition-colors border-b border-gray-100 text-xs">
                                        <td className="py-2.5 px-4 pl-12 align-top">
                                          <div className="flex items-start gap-2">
                                            <span className="font-mono text-[11px] font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
                                              {metric.code}
                                            </span>
                                            <span className="font-medium text-gray-900 leading-tight">{metric.name}</span>
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-gray-600 align-top whitespace-nowrap text-[11px]">
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                            metric.metricType === 'QnM'
                                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                                              : 'bg-teal-50 text-teal-700 border-teal-200'
                                          }`}>
                                            {metric.metricType}
                                          </span>
                                        </td>
                                        <td colSpan={4} className="py-2.5 px-3 text-gray-400 italic text-[11px] align-middle">
                                          No proofs attached yet for this metric
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return metricDocs.map((doc, dIdx) => {
                                    const isVerified = doc.status === 'university_verified';
                                    const isApproved = doc.status === 'approved_by_school';

                                    return (
                                      <tr key={doc.id} className="hover:bg-purple-50/20 transition-colors border-b border-gray-100 text-xs group">
                                        {/* Col 1 & 2: Metric Code & Name (Spans across all docs for this metric) */}
                                        {dIdx === 0 ? (
                                          <>
                                            <td rowSpan={metricDocs.length} className="py-2.5 px-4 pl-12 align-top border-r border-gray-100 bg-slate-50/20">
                                              <div className="flex items-start gap-2">
                                                <span className="font-mono text-[11px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded shrink-0">
                                                  {metric.code}
                                                </span>
                                                <span className="font-semibold text-gray-900 leading-tight">{metric.name}</span>
                                              </div>
                                            </td>

                                            <td rowSpan={metricDocs.length} className="py-2.5 px-3 align-top whitespace-nowrap text-[11px] border-r border-gray-100 bg-slate-50/20">
                                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                                metric.metricType === 'QnM'
                                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                  : 'bg-teal-50 text-teal-700 border-teal-200'
                                              }`}>
                                                {metric.metricType}
                                              </span>
                                            </td>
                                          </>
                                        ) : null}

                                        {/* Col 3: Evidence Proof Link & Details */}
                                        <td className="py-2.5 px-3 align-top">
                                          <div className="flex items-start gap-2">
                                            <FileText className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                              <button
                                                type="button"
                                                onClick={() => openFileInNewTab(doc.fileUrl)}
                                                className="text-xs font-semibold text-blue-700 hover:text-purple-800 hover:underline truncate text-left cursor-pointer block max-w-[280px]"
                                                title={`Open ${doc.fileName || doc.title}`}
                                              >
                                                {doc.title || doc.fileName}
                                              </button>
                                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500 font-mono">
                                                <span className="truncate max-w-[210px]" title={doc.fileName}>{doc.fileName}</span>
                                                {doc.fileSize && (
                                                  <span className="text-gray-400 shrink-0">• {doc.fileSize}</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </td>

                                        {/* Col 4: School & Department */}
                                        <td className="py-2.5 px-3 align-top">
                                          <div className="leading-tight">
                                            <span className="font-semibold text-gray-900 block text-xs truncate" title={doc.schoolName}>
                                              {doc.schoolName}
                                            </span>
                                            <span className="text-[10px] font-medium text-purple-700 bg-purple-50 border border-purple-200/80 px-1.5 py-0.5 rounded inline-block mt-0.5 truncate max-w-[190px]" title={doc.programName}>
                                              {doc.programName}
                                            </span>
                                          </div>
                                        </td>

                                        {/* Col 5: SSR Status */}
                                        <td className="py-2.5 px-3 text-center align-middle whitespace-nowrap">
                                          {isVerified ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-900 bg-purple-100 border border-purple-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                                              <Lock className="w-2.5 h-2.5 text-purple-700" />
                                              SSR Locked
                                            </span>
                                          ) : isApproved ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                              {doc.status === 'submitted_to_university' ? 'Forwarded by School' : 'School Approved'}
                                            </span>
                                          ) : (
                                            <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                              Pending
                                            </span>
                                          )}
                                        </td>

                                        {/* Col 6: Quick View Action */}
                                        <td className="py-2.5 px-2 text-center align-middle">
                                          <button
                                            type="button"
                                            onClick={() => openFileInNewTab(doc.fileUrl)}
                                            className="p-1 text-gray-400 hover:text-purple-700 hover:bg-purple-100 rounded transition-colors cursor-pointer inline-flex items-center justify-center"
                                            title="Open Document PDF in new tab"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  });
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

        {/* VIEW 3: SPECIALIZED GRID - UNIVERSITY VERIFICATION QUEUE */}
        {deskMode === 'verification-queue' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  School-Approved Evidence Awaiting Final University IQAC Sign-off ({pendingVerificationDocs.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verify documentation passed from Constituent Schools. Clicking "Verify & Lock" certifies compliance and archives proofs into the permanent NAAC SSR registry.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">School:</span>
                <select
                  value={selectedSchoolFilter}
                  onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 cursor-pointer"
                >
                  <option value="all">All Schools</option>
                  {ITM_SCHOOLS.map(s => (
                    <option key={s.id} value={s.id}>{s.shortCode}</option>
                  ))}
                </select>
              </div>
            </div>

            {pendingVerificationDocs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">No Pending Approvals!</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  All evidence forwarded by Constituent Schools have been verified and locked.
                </p>
                <button
                  type="button"
                  onClick={() => setDeskMode('repository')}
                  className="mt-4 px-4 py-1.5 bg-[#0f2748] text-white text-xs font-semibold rounded-lg hover:bg-[#183963] cursor-pointer"
                >
                  Explore Master Repository
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4 w-[20%]">School & Program</th>
                        <th className="py-2.5 px-3 w-[12%]">Metric</th>
                        <th className="py-2.5 px-4 w-[34%]">Evidence File & Proof</th>
                        <th className="py-2.5 px-3 w-[16%]">School Sign-off</th>
                        <th className="py-2.5 px-4 w-[18%] text-right">IQAC Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pendingVerificationDocs
                        .filter(d => selectedSchoolFilter === 'all' || d.schoolId === selectedSchoolFilter)
                        .map((doc) => (
                          <tr key={doc.id} className="hover:bg-purple-50/20 transition-colors">
                            {/* School */}
                            <td className="py-3 px-4 align-top">
                              <span className="font-bold text-gray-900 block text-xs">
                                {doc.schoolName}
                              </span>
                              <span className="text-[11px] text-gray-500 block mt-0.5">
                                {doc.programName}
                              </span>
                            </td>

                            {/* Metric */}
                            <td className="py-3 px-3 align-top">
                              <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded inline-block">
                                {doc.metricCode}
                              </span>
                              <span className="block text-[10px] text-gray-500 mt-1">
                                {doc.criterionCode}
                              </span>
                            </td>

                            {/* File Name & Title */}
                            <td className="py-3 px-4 align-top">
                              <div
                                onClick={() => openFileInNewTab(doc.fileUrl)}
                                className="font-semibold text-gray-900 hover:text-purple-700 cursor-pointer text-xs leading-snug"
                                title={doc.fileName}
                              >
                                {doc.fileName}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                {doc.title}
                              </p>
                              {doc.fileSize && (
                                <span className="text-[10px] text-gray-400 mt-0.5 inline-block">
                                  {doc.fileSize}
                                </span>
                              )}
                            </td>

                            {/* School Sign-off */}
                            <td className="py-3 px-3 align-top">
                              <div className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approved</span>
                              </div>
                              <span className="text-[10px] text-gray-500 block mt-0.5">
                                {doc.schoolReviewedBy || 'School Dean'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 align-top text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleVerifyDocument(doc)}
                                  className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                                  title="Certify and permanently lock this proof for SSR"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Verify & Lock</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setReopenDoc(doc)}
                                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                                  title="Send back for revision with IQAC feedback"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Re-open</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openFileInNewTab(doc.fileUrl)}
                                  className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                                  title="Open PDF"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: SPECIALIZED GRID - CROSS-SCHOOL SSR READINESS MATRIX */}
        {deskMode === 'ssr-matrix' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Executive Progress Card */}
            <div className="bg-gradient-to-r from-[#0f2748] to-[#1e3a5f] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-300/30 text-[10px] font-bold uppercase tracking-wider">
                  Executive Accreditation Dossier
                </span>
                <h2 className="text-xl font-black">
                  Institutional SSR Readiness: {overallSSRProgress}%
                </h2>
                <p className="text-xs text-slate-300 max-w-xl">
                  {totalVerifiedCount} of {documents.length} evidence proofs verified and locked across all 5 Constituent Schools for NAAC SSR submission.
                </p>
              </div>

              <div className="w-full md:w-72 bg-white/10 p-4 rounded-xl border border-white/10 shrink-0">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span>Audit Progress</span>
                  <span>{overallSSRProgress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${overallSSRProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-300 mt-2 block">
                  Target: 100% Lock before SSR upload window
                </span>
              </div>
            </div>

            {/* School by School Executive Cards */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <span>Constituent Schools Audit &amp; Program-wise Status</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live accreditation readiness by criteria coverage. Click any card to open the program audit drawer.
                  </p>
                </div>

                <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full shadow-2xs shrink-0">
                  5 Constituent Schools
                </span>
              </div>

              {/* Spacious 2-Column Responsive Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {ITM_SCHOOLS.map(school => {
                  const theme = SCHOOL_THEMES[school.id] || SCHOOL_THEMES['sch-tech'];
                  const SchoolIcon = theme.icon;
                  const schoolAllDocs = documents.filter(d => d.schoolId === school.id);
                  const schoolVerified = schoolAllDocs.filter(d => d.status === 'university_verified').length;
                  
                  // Calculate readiness by how many criteria (out of 7) have documents
                  const criteriaWithDocs = new Set(schoolAllDocs.map(d => d.criterionCode));
                  const coveredCriteriaCount = criteriaWithDocs.size;
                  const readinessPct = Math.round((coveredCriteriaCount / 7) * 100);

                  return (
                    <div 
                      key={school.id} 
                      className="bg-white rounded-2xl border border-gray-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top colored accent line */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* 1. LOGO, COLLEGE NAME & SCHOOL COORDINATOR */}
                          <div className="flex items-start justify-between gap-3 mb-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* School Logo */}
                              <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${theme.gradient} text-white flex items-center justify-center shadow-xs shrink-0`}>
                                <SchoolIcon className="w-5 h-5 stroke-[2.2]" />
                              </div>

                              {/* College Name & School Coordinator */}
                              <div className="min-w-0">
                                <p className="text-xs text-gray-500 truncate">
                                  School Coordinator: <strong className="text-gray-800 font-semibold">{school.coordinatorName}</strong>
                                </p>
                                <h4 className="text-sm font-bold text-gray-900 mt-0.5 leading-snug truncate" title={school.name}>
                                  {school.name}
                                </h4>
                              </div>
                            </div>

                            {/* Top Quick Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSendBatchReminders(school)}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-gray-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="Send IQAC reminder to all program coordinators in this school"
                              >
                                <Bell className="w-3 h-3 text-slate-600" />
                                <span className="hidden sm:inline">Remind All</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedSchoolForDrawer(school)}
                                className="p-1 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                                title="Open full slide-over audit drawer"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* 2. NAAC READINESS STRIP (Common Green for All Cards) */}
                          <div className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-gray-100 space-y-1.5 mb-3.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-700">NAAC Readiness:</span>
                                <span className="font-semibold text-emerald-700">
                                  {coveredCriteriaCount} of 7 Criteria Covered
                                </span>
                              </div>

                              <span className="font-extrabold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                {readinessPct}%
                              </span>
                            </div>

                            {/* Readiness Meter */}
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-2 rounded-full transition-all duration-500 bg-emerald-500"
                                style={{ width: `${readinessPct}%` }}
                              />
                            </div>
                          </div>

                          {/* 3. PROGRAM NAMES (Simple List) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              <span>Academic Programs ({school.programs.length})</span>
                              <span>Readiness</span>
                            </div>

                            {school.programs.map(program => {
                              const progDocs = documents.filter(d => 
                                d.schoolId === school.id && 
                                (d.programId === program.id || (!d.programId && school.programs[0]?.id === program.id))
                              );
                              const progCriteriaWithDocs = new Set(progDocs.map(d => d.criterionCode));
                              const progPct = Math.round((progCriteriaWithDocs.size / 7) * 100);

                              return (
                                <div 
                                  key={program.id}
                                  className="text-xs text-gray-800 font-medium py-1.5 px-3 rounded-lg bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-2 hover:bg-slate-100/70 transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                    <span className="truncate">{program.name}</span>
                                  </div>

                                  <span className="text-[11px] font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md shrink-0">
                                    {progPct}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 4. OPEN DRAWER ACTION BUTTON */}
                        <button
                          type="button"
                          onClick={() => setSelectedSchoolForDrawer(school)}
                          className="mt-4 w-full py-2 px-3 bg-[#0f2748] hover:bg-[#183963] text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs group"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SLIDE-OVER DRAWER: DETAILED PROGRAM-WISE CRITERIA MATRIX & COORDINATOR AUDIT */}
      {selectedSchoolForDrawer && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setSelectedSchoolForDrawer(null)}
        >
          <div 
            className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            {(() => {
              const theme = SCHOOL_THEMES[selectedSchoolForDrawer.id] || SCHOOL_THEMES['sch-tech'];
              const SchoolIcon = theme.icon;
              const schoolDocs = documents.filter(d => d.schoolId === selectedSchoolForDrawer.id);
              const verifiedDocsCount = schoolDocs.filter(d => d.status === 'university_verified').length;
              const schoolPct = schoolDocs.length > 0 ? Math.round((verifiedDocsCount / schoolDocs.length) * 100) : 0;

              return (
                <div className="p-5 border-b border-gray-200 bg-slate-50 shrink-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${theme.gradient} text-white flex items-center justify-center shadow-xs shrink-0`}>
                        <SchoolIcon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-extrabold text-purple-700 bg-purple-100/80 border border-purple-200 px-2 py-0.5 rounded">
                            {selectedSchoolForDrawer.shortCode}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            Dean: <strong className="text-gray-900">{selectedSchoolForDrawer.deanName}</strong>
                          </span>
                        </div>
                        <h2 className="text-base font-black text-gray-900 mt-1 leading-snug">
                          {selectedSchoolForDrawer.name}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          School Coordinator: <span className="font-semibold text-gray-700">{selectedSchoolForDrawer.coordinatorName}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedSchoolForDrawer(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                      title="Close drawer (Esc)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* School Progress & Batch Actions Card */}
                  <div className="mt-4 bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">SSR Audit Readiness:</span>
                        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {schoolPct}%
                        </span>
                        <span className="text-[11px] text-gray-500">
                          ({verifiedDocsCount} verified of {schoolDocs.length} proofs)
                        </span>
                      </div>
                      <div className="w-56 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${schoolPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendBatchReminders(selectedSchoolForDrawer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors shadow-2xs cursor-pointer shrink-0"
                      title="Send IQAC reminder to all program coordinators in this school"
                    >
                      <Bell className="w-3.5 h-3.5 text-purple-600" />
                      <span>Remind All Programs</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Drawer Body: Program-wise Cards List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                <span>{selectedSchoolForDrawer.programs.length} Constituent Academic Programs</span>
                <span className="text-[11px] font-normal normal-case text-gray-400">
                  Criteria C1 to C7 Coverage
                </span>
              </div>

              {selectedSchoolForDrawer.programs.map((program) => {
                // Program-specific documents
                const programDocs = documents.filter(d => 
                  d.schoolId === selectedSchoolForDrawer.id && 
                  (d.programId === program.id || (!d.programId && selectedSchoolForDrawer.programs[0]?.id === program.id))
                );

                const verifiedCount = programDocs.filter(d => d.status === 'university_verified').length;
                const pendingCount = programDocs.filter(d => d.status === 'approved_by_school' || d.status === 'submitted_to_university' || d.status === 'submitted_to_program').length;

                // Criteria status breakdown
                const criteriaStatusMap = NAAC_CRITERIA_SUMMARY.map(crit => {
                  const critDocs = programDocs.filter(d => d.criterionCode === crit.code);
                  const isVerified = critDocs.some(d => d.status === 'university_verified');
                  const isPending = critDocs.some(d => d.status === 'approved_by_school' || d.status === 'submitted_to_university' || d.status === 'submitted_to_program');
                  const count = critDocs.length;
                  return {
                    code: crit.code,
                    short: crit.code.replace('Criterion ', 'C'),
                    name: crit.name,
                    count,
                    status: isVerified ? 'verified' : isPending ? 'pending' : count > 0 ? 'uploaded' : 'missing',
                  };
                });

                const missingCriteria = criteriaStatusMap.filter(c => c.status === 'missing');
                const isReminderSent = !!remindersSent[program.id];

                return (
                  <div 
                    key={program.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs hover:border-slate-300 transition-all space-y-3 text-left"
                  >
                    {/* Program Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            program.degreeType === 'UG' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            program.degreeType === 'PG' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {program.degreeType}
                          </span>
                          <span className="font-mono text-xs font-extrabold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {program.shortCode}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                          {program.name}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                          {verifiedCount} / {programDocs.length} Verified
                        </span>
                      </div>
                    </div>

                    {/* Program Coordinator Profile Pill */}
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">
                            {program.coordinatorName}
                          </p>
                          <a 
                            href={`mailto:${program.coordinatorEmail}`}
                            className="text-[11px] text-gray-500 hover:text-purple-600 flex items-center gap-1 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="w-3 h-3" />
                            <span>{program.coordinatorEmail}</span>
                          </a>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 shrink-0 self-start sm:self-auto">
                        Program Coordinator
                      </span>
                    </div>

                    {/* Criteria Status Heatmap (Criteria 1 to 7) */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1.5">
                        <span>Criteria Heatmap (C1 – C7):</span>
                        <span className="text-[10px] text-gray-400">
                          {7 - missingCriteria.length}/7 Criteria Uploaded
                        </span>
                      </div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {criteriaStatusMap.map((crit) => {
                          const bg = 
                            crit.status === 'verified' ? 'bg-emerald-500 text-white border-emerald-600' :
                            crit.status === 'pending' ? 'bg-amber-400 text-amber-950 border-amber-500' :
                            crit.status === 'uploaded' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            'bg-gray-100 text-gray-400 border-gray-200';

                          return (
                            <div 
                              key={crit.code}
                              className={`py-1.5 rounded-lg border text-center font-mono text-[10px] font-bold flex flex-col items-center justify-center transition-all ${bg}`}
                              title={`${crit.code} (${crit.name}): ${crit.count} proof(s) - Status: ${crit.status}`}
                            >
                              <span>{crit.short}</span>
                              <span className="text-[9px] opacity-90 font-normal">
                                {crit.count > 0 ? `${crit.count}p` : '—'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Warning Callout for Missing Criteria */}
                    {missingCriteria.length > 0 ? (
                      <div className="bg-rose-50 border border-rose-200/90 rounded-lg p-2.5 flex items-start gap-2 text-xs text-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-rose-900 leading-tight">
                            {missingCriteria.length} Criteria Missing Proofs
                          </p>
                          <p className="text-[11px] text-rose-700 mt-0.5">
                            No evidence proofs recorded for: {missingCriteria.map(m => m.short).join(', ')}.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-2 flex items-center gap-2 text-xs text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">All 7 NAAC criteria have active evidence submissions.</span>
                      </div>
                    )}

                    {/* Program Actions Footer */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSchoolFilter(selectedSchoolForDrawer.id);
                          setSearchQuery(program.shortCode);
                          setSelectedSchoolForDrawer(null);
                          setDeskMode('repository');
                          showToast(`Filtered repository to ${program.name}`);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-purple-700 py-1 px-2.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        title="View evidence proofs for this program in the Master Repository"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
                        <span>View Proofs ({programDocs.length})</span>
                      </button>

                      {/* Send Reminder Action Button */}
                      <button
                        type="button"
                        onClick={() => handleSendReminder(program, selectedSchoolForDrawer.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          isReminderSent 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-[#0f2748] hover:bg-[#183963] text-white'
                        }`}
                        title={`Send official IQAC reminder email to ${program.coordinatorName}`}
                      >
                        {isReminderSent ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                            <span>Reminder Sent ({remindersSent[program.id]})</span>
                          </>
                        ) : (
                          <>
                            <Bell className="w-3.5 h-3.5 text-amber-300" />
                            <span>Send Reminder</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Bottom Footer */}
            <div className="p-4 border-t border-gray-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500 font-medium">
                University IQAC Oversight &bull; Real-time SSR Dossier Monitoring
              </span>
              <button
                type="button"
                onClick={() => setSelectedSchoolForDrawer(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RE-OPEN WITH FEEDBACK MODAL */}
      {reopenDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-gray-900">Re-open Evidence with IQAC Feedback</h3>
              </div>
              <button
                type="button"
                onClick={() => setReopenDoc(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase">Evidence Document</span>
                <p className="text-xs font-bold text-gray-900 mt-0.5">{reopenDoc.fileName}</p>
                <p className="text-[11px] text-gray-500">{reopenDoc.schoolName} • Metric {reopenDoc.metricCode}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Central IQAC Review Instructions:
                </label>
                <textarea
                  rows={3}
                  value={reopenNote}
                  onChange={(e) => setReopenNote(e.target.value)}
                  placeholder="e.g. Please attach the university registrar notification along with the audited financial statement."
                  className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReopenDoc(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReopen}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs"
              >
                Send Re-open Instructions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
