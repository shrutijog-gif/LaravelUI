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
  Layers
} from 'lucide-react';
import { 
  ITM_SCHOOLS, 
  NAAC_CRITERIA_SUMMARY, 
  NAAC_METRICS_LIST, 
  KEY_INDICATORS,
  NaacEvidenceDocument, 
  getStoredNaacDocuments, 
  verifyUniversityDocument,
  deleteNaacDocument 
} from '../../../data/naacDmsData';
import { openFileInNewTab } from '../../../utils/fileHelper';
import { NaacQuickUploadLanding } from './NaacQuickUploadLanding';

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
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
  const pendingVerificationDocs = documents.filter(d => d.status === 'approved_by_school');
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
  const handleSwitchPortalRole = (role: 'naac-program' | 'naac-school' | 'naac-university') => {
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
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
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
                onClick={() => setDeskMode('ssr-matrix')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  deskMode === 'ssr-matrix'
                    ? 'bg-white text-purple-700 shadow-2xs border border-slate-200/80'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                <span>SSR Readiness</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 rounded-full font-bold">
                  {overallSSRProgress}%
                </span>
              </button>
            </div>

            <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded font-mono text-xs font-semibold border border-purple-200">
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
            role="university"
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
                  onClick={() => setDeskMode('repository')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>University Repository</span>
                  <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 rounded-full font-bold">
                    {documents.length}
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
                  onClick={() => setDeskMode('ssr-matrix')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                  <span>SSR Readiness</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 rounded-full font-bold">
                    {overallSSRProgress}%
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
            {/* Top Filter and Search Bar */}
            <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* School Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-600">School:</span>
                  <select
                    value={selectedSchoolFilter}
                    onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 cursor-pointer focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="all">All 5 Constituent Schools</option>
                    {ITM_SCHOOLS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    <option value="sch-central">University Central Master Proofs</option>
                  </select>
                </div>

                {/* Criterion Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-600">Criterion:</span>
                  <select
                    value={selectedCriterionFilter}
                    onChange={(e) => setSelectedCriterionFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 cursor-pointer focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="all">All Criteria (1–7)</option>
                    {NAAC_CRITERIA_SUMMARY.map(c => (
                      <option key={c.id} value={c.code}>{c.code}: {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search + Expand/Collapse */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search university evidence archive..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs w-60 focus:ring-1 focus:ring-purple-500 bg-white"
                  />
                </div>

                <div className="inline-flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50 text-[11px] font-semibold text-gray-600">
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
                      <th className="py-2.5 px-4 w-[38%]">Metric / NAAC Hierarchy</th>
                      <th className="py-2.5 px-3 w-[10%]">Type</th>
                      <th className="py-2.5 px-3 w-[26%]">Evidence Proof</th>
                      <th className="py-2.5 px-3 w-[14%]">School & Dept</th>
                      <th className="py-2.5 px-3 w-[12%] text-center">SSR Status</th>
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
                            <td colSpan={5} className="py-2.5 px-4">
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
                                  <td colSpan={5} className="py-2 px-6">
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
                                    const matchQ = !searchQuery.trim() || 
                                      d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      d.metricCode.includes(searchQuery);
                                    return matchM && matchSchool && matchQ;
                                  });

                                  return (
                                    <React.Fragment key={metric.code}>
                                      <tr className="hover:bg-slate-50/80 transition-colors border-b border-gray-100">
                                        <td className="py-2.5 px-8">
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
                                              {metric.code}
                                            </span>
                                            <span className="text-xs text-gray-800 font-medium">
                                              {metric.name}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                            metric.metricType === 'QnM'
                                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                                              : 'bg-teal-50 text-teal-700 border-teal-200'
                                          }`}>
                                            {metric.metricType}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          {metricDocs.length > 0 ? (
                                            <div className="space-y-1">
                                              {metricDocs.map(d => (
                                                <div 
                                                  key={d.id}
                                                  onClick={() => openFileInNewTab(d.fileUrl)}
                                                  className="font-medium text-gray-800 hover:text-purple-700 truncate cursor-pointer text-xs"
                                                  title={d.fileName}
                                                >
                                                  {d.fileName}
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="text-[11px] text-gray-400 italic">No proofs attached yet</span>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          {metricDocs.length > 0 ? (
                                            <div className="space-y-1">
                                              {metricDocs.map(d => (
                                                <div key={d.id} className="text-[11px] leading-tight">
                                                  <span className="font-bold text-gray-800 block truncate">{d.schoolName}</span>
                                                  <span className="text-gray-500 truncate block text-[10px]">{d.programName}</span>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="text-gray-400">—</span>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                          {metricDocs.length > 0 ? (
                                            <div className="space-y-1">
                                              {metricDocs.map(d => {
                                                const isVerified = d.status === 'university_verified';
                                                return (
                                                  <div key={d.id}>
                                                    {isVerified ? (
                                                      <span className="inline-block text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-300 px-2 py-0.5 rounded-full">
                                                        SSR Locked 🔒
                                                      </span>
                                                    ) : (
                                                      <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                        School Approved
                                                      </span>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          ) : (
                                            <span className="text-gray-400">—</span>
                                          )}
                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  );
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

            {/* School by School Readiness Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ITM_SCHOOLS.map(school => {
                const schoolAllDocs = documents.filter(d => d.schoolId === school.id);
                const schoolVerified = schoolAllDocs.filter(d => d.status === 'university_verified').length;
                const pct = schoolAllDocs.length > 0 ? Math.round((schoolVerified / schoolAllDocs.length) * 100) : 0;

                return (
                  <div key={school.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          {school.shortCode}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-1" title={school.name}>
                          {school.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Dean: {school.deanName}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2 py-1 rounded-lg">
                        {pct}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                        <span>{schoolVerified} verified</span>
                        <span>{schoolAllDocs.length} total proofs</span>
                      </div>
                    </div>

                    {/* Criteria mini badges */}
                    <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1">
                      {NAAC_CRITERIA_SUMMARY.map(c => {
                        const hasDocs = schoolAllDocs.some(d => d.criterionCode === c.code);
                        return (
                          <span 
                            key={c.code}
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                              hasDocs 
                                ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' 
                                : 'bg-gray-100 text-gray-400'
                            }`}
                            title={`${c.code}: ${hasDocs ? 'Has proofs' : 'Empty'}`}
                          >
                            {c.code.replace('Criterion ', 'C')}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
