import React, { useState, useEffect } from 'react';
import { NaacQuickUploadLanding } from './NaacQuickUploadLanding';
import { 
  CheckCircle2, 
  Sparkles, 
  FolderOpen, 
  Send, 
  ExternalLink, 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  X
} from 'lucide-react';
import { 
  getStoredNaacDocuments, 
  submitDocumentToProgram, 
  submitBatchNaacDocuments,
  deleteNaacDocument,
  addOrUpdateNaacDocument,
  NaacEvidenceDocument, 
  NAAC_CRITERIA_SUMMARY,
  NAAC_METRICS_LIST
} from '../../../data/naacDmsData';
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

const REPOSITORY_SAMPLE_FILES = [
  { id: 'f-1', name: 'CSE_OBE_Attainment_Report_2025_26.pdf', size: '3.4 MB', date: '2026-10-14' },
  { id: 'f-2', name: 'BoS_Minutes_Curriculum_Revision_2025.pdf', size: '2.1 MB', date: '2026-10-11' },
  { id: 'f-3', name: 'AI_Lab_GPU_Workstation_Invoices.pdf', size: '5.6 MB', date: '2026-10-09' },
  { id: 'f-4', name: 'DST_SERB_Research_Grant_Sanction.pdf', size: '4.2 MB', date: '2026-10-05' },
  { id: 'f-5', name: 'Student_Mentorship_Logs_2025.pdf', size: '2.8 MB', date: '2026-10-02' },
  { id: 'f-6', name: 'Stakeholder_Feedback_ATR_Report.pdf', size: '1.9 MB', date: '2026-09-28' },
];

export interface FacultyDeskProps {
  academicYear?: string;
  initialTab?: 'quick-upload' | 'my-evidence';
}

type EvidenceFilter = 'all' | 'draft' | 'submitted' | 'accepted' | 'needs_revision' | 'rejected';

export const FacultyDesk: React.FC<FacultyDeskProps> = ({
  academicYear = '2025-26',
  initialTab = 'quick-upload',
}) => {
  const [deskMode, setDeskMode] = useState<'quick-upload' | 'my-evidence'>(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() => getStoredNaacDocuments());
  const [activeFilter, setActiveFilter] = useState<EvidenceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCritFilter, setSelectedCritFilter] = useState<string>('all');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Drawer state for Upload New Evidence
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [modalCriterionCode, setModalCriterionCode] = useState('Criterion 1');
  const [selectedIndicatorCode, setSelectedIndicatorCode] = useState('1.1');
  const [selectedMetricCode, setSelectedMetricCode] = useState('1.1.1');
  const [activeFileTab, setActiveFileTab] = useState<'new' | 'existing'>('new');
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; size: string; url: string }[]>([]);
  const [selectedRepoFiles, setSelectedRepoFiles] = useState<string[]>([]);
  const [repoSearchQuery, setRepoSearchQuery] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (initialTab) setDeskMode(initialTab);
  }, [initialTab]);

  // Live-sync documents on storage or custom event
  const refreshDocuments = () => {
    setDocuments(getStoredNaacDocuments());
  };

  useEffect(() => {
    const handleSync = () => refreshDocuments();
    window.addEventListener('naac-dms-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('naac-dms-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filter strictly for Dr. Ramesh Gupta's documents
  const facultyDocs = documents.filter((doc) => {
    if (!doc || !doc.id) return false;
    const isProgramMatch = !doc.programId || doc.programId === 'prog-cse';
    const isRameshDoc = Boolean(
      doc.uploadedBy?.toLowerCase().includes('ramesh') ||
      doc.facultyName?.toLowerCase().includes('ramesh') ||
      doc.submittedByFacultyId === 'fac-1'
    );
    return isProgramMatch && isRameshDoc;
  });

  // Filter counts
  const draftCount = facultyDocs.filter(d => d.status === 'draft' && d.coordinatorReviewStatus !== 'changes_requested').length;
  const submittedCount = facultyDocs.filter(d => (d.status === 'submitted_to_program' || d.status === 'submitted_to_school') && d.coordinatorReviewStatus !== 'compiled').length;
  const acceptedCount = facultyDocs.filter(d => d.coordinatorReviewStatus === 'compiled' || d.status === 'approved_by_school' || d.status === 'university_verified').length;
  const needsRevisionCount = facultyDocs.filter(d => d.coordinatorReviewStatus === 'changes_requested').length;
  const rejectedCount = facultyDocs.filter(d => d.coordinatorReviewStatus === 'rejected').length;

  const TABS: { id: EvidenceFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: facultyDocs.length },
    { id: 'draft', label: 'Draft', count: draftCount },
    { id: 'submitted', label: 'Submitted', count: submittedCount },
    { id: 'accepted', label: 'Accepted', count: acceptedCount },
    { id: 'needs_revision', label: 'Needs Revision', count: needsRevisionCount },
    { id: 'rejected', label: 'Rejected', count: rejectedCount },
  ];

  // Filtered evidence items
  const filteredDocs = facultyDocs.filter((doc) => {
    // 1. Status Filter Tab
    if (activeFilter === 'draft') {
      if (doc.status !== 'draft' || doc.coordinatorReviewStatus === 'changes_requested') return false;
    } else if (activeFilter === 'submitted') {
      if (doc.status !== 'submitted_to_program' || doc.coordinatorReviewStatus === 'compiled') return false;
    } else if (activeFilter === 'accepted') {
      if (doc.coordinatorReviewStatus !== 'compiled' && doc.status !== 'approved_by_school' && doc.status !== 'university_verified') return false;
    } else if (activeFilter === 'needs_revision') {
      if (doc.coordinatorReviewStatus !== 'changes_requested') return false;
    } else if (activeFilter === 'rejected') {
      if (doc.coordinatorReviewStatus !== 'rejected') return false;
    }

    // 2. Criteria Filter Dropdown
    if (selectedCritFilter !== 'all') {
      if (doc.criterionCode?.toLowerCase() !== selectedCritFilter.toLowerCase() && doc.criterionId !== selectedCritFilter) {
        return false;
      }
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchFile = doc.fileName?.toLowerCase().includes(q) || doc.title?.toLowerCase().includes(q);
      const matchMetric = doc.metricCode?.toLowerCase().includes(q);
      if (!matchFile && !matchMetric) return false;
    }

    return true;
  });

  // Handle batch selection
  const unsubmittedDocs = filteredDocs.filter(d => d.status === 'draft' || d.coordinatorReviewStatus === 'changes_requested');
  const isAllSelected = unsubmittedDocs.length > 0 && unsubmittedDocs.every(d => selectedDocIds.includes(d.id));

  const handleToggleSelectAll = () => {
    const unsubmittedIds = unsubmittedDocs.map(d => d.id);
    if (isAllSelected) {
      setSelectedDocIds(prev => prev.filter(id => !unsubmittedIds.includes(id)));
    } else {
      setSelectedDocIds(prev => Array.from(new Set([...prev, ...unsubmittedIds])));
    }
  };

  const handleToggleSelectDoc = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Submit selected documents to Program Coordinator
  const handleSubmitSelected = () => {
    if (selectedDocIds.length === 0) return;
    const count = submitBatchNaacDocuments(selectedDocIds, 'submitted_to_program', {
      coordinatorReviewStatus: 'pending_review'
    });
    setSelectedDocIds([]);
    refreshDocuments();
    showToast(`✅ Successfully submitted ${count} document(s) to Program Coordinator.`);
  };

  // Handle single document submit
  const handleSingleSubmit = (docId: string, title: string) => {
    const res = submitDocumentToProgram(docId);
    if (res) {
      refreshDocuments();
      showToast(`✅ Submitted "${title}" to Program Coordinator.`);
    }
  };

  // Handle document deletion (only allowed for drafts)
  const handleDelete = (docId: string, title: string) => {
    if (window.confirm(`Delete draft evidence "${title}"?`)) {
      const deleted = deleteNaacDocument(docId);
      if (deleted) {
        setSelectedDocIds(prev => prev.filter(id => id !== docId));
        refreshDocuments();
        showToast(`🗑️ Deleted draft "${title}".`);
      } else {
        showToast('Only draft documents can be deleted.');
      }
    }
  };

  // Handle local file upload (multiple files)
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

  // Save new supporting document(s) from drawer
  const handleSaveEvidenceDocument = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const metric = NAAC_METRICS_LIST.find(m => m.code === selectedMetricCode);
    const currentUser = getStoredAuthUser();
    const uploaderName = currentUser?.name || 'Dr. Ramesh Gupta (Associate Professor)';
    const uploaderRole = currentUser?.role || 'Faculty';
    const fallbackPdf = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    const newDocIds: string[] = [];

    if (activeFileTab === 'new') {
      if (uploadedFiles.length === 0) {
        showToast('Please upload or drag at least one evidence document');
        return;
      }
      uploadedFiles.forEach((file) => {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        const created = addOrUpdateNaacDocument({
          title: cleanTitle || `${selectedMetricCode} - ${metric?.name || 'Supporting Evidence'}`,
          programId: 'prog-cse',
          programName: 'B.Tech Computer Science & Engineering',
          schoolId: 'sch-tech',
          schoolName: 'School of Technology & Computer Engineering',
          academicYear: academicYear || '2025-26',
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
          submittedByFacultyId: 'fac-1',
          facultyName: 'Dr. Ramesh Gupta',
          facultyDesignation: 'Associate Professor',
          coordinatorReviewStatus: undefined,
        });
        if (created?.id) newDocIds.push(created.id);
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
        const created = addOrUpdateNaacDocument({
          title: cleanTitle || `${selectedMetricCode} - ${metric?.name || 'Supporting Evidence'}`,
          programId: 'prog-cse',
          programName: 'B.Tech Computer Science & Engineering',
          schoolId: 'sch-tech',
          schoolName: 'School of Technology & Computer Engineering',
          academicYear: academicYear || '2025-26',
          criterionId: metric?.criterionId || 'crit-1',
          criterionCode: modalCriterionCode,
          metricCode: selectedMetricCode,
          metricName: metric?.name || 'Supporting Evidence',
          metricType: metric?.metricType || 'QlM',
          fileUrl: fallbackPdf,
          fileName: fileName,
          fileSize: repoFile?.size || '2.4 MB',
          uploadedBy: uploaderName,
          status: 'draft',
          submittedByFacultyId: 'fac-1',
          facultyName: 'Dr. Ramesh Gupta',
          facultyDesignation: 'Associate Professor',
          coordinatorReviewStatus: undefined,
        });
        if (created?.id) newDocIds.push(created.id);
      });
      setSelectedRepoFiles([]);
    }

    // Persist new document IDs to faculty tracking keys in localStorage
    if (newDocIds.length > 0) {
      try {
        const keys = [
          'naac_my_uploaded_doc_ids_faculty_cse',
          'naac_my_uploaded_doc_ids_faculty',
          'naac_my_uploaded_doc_ids_v3'
        ];
        keys.forEach(key => {
          const raw = localStorage.getItem(key);
          const existing: string[] = raw ? JSON.parse(raw) : [];
          const merged = Array.from(new Set([...existing, ...newDocIds]));
          localStorage.setItem(key, JSON.stringify(merged));
        });
      } catch (e) {
        console.warn('Could not store myDocIds:', e);
      }
    }

    refreshDocuments();
    setIsUploadDrawerOpen(false);
    showToast(`✨ Added ${newDocIds.length} draft evidence document(s) under ${modalCriterionCode} › Metric ${selectedMetricCode}`);
  };

  // Segmented control shared between views
  const renderSegmentedToggle = () => (
    <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
      <button
        type="button"
        onClick={() => setDeskMode('quick-upload')}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
          deskMode === 'quick-upload'
            ? 'bg-white text-[#0f2748] shadow-2xs border border-slate-200/80'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-gray-500" />
        <span>Quick Proof Drop</span>
      </button>

      <button
        type="button"
        onClick={() => setDeskMode('my-evidence')}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
          deskMode === 'my-evidence'
            ? 'bg-white text-[#0f2748] shadow-2xs border border-slate-200/80'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <FolderOpen className="w-3.5 h-3.5 text-gray-500" />
        <span>My Evidence</span>
        <span className="text-[10px] bg-slate-200/80 text-gray-800 px-1.5 rounded-full font-bold">
          {facultyDocs.length}
        </span>
        {needsRevisionCount > 0 && (
          <span className="text-[10px] bg-slate-800 text-white px-1.5 py-0.2 rounded-full font-bold">
            {needsRevisionCount} action
          </span>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-xl shadow-xl flex items-center justify-between text-xs font-semibold gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)} 
            className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW 1: QUICK UPLOAD BAR */}
      {deskMode === 'quick-upload' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <NaacQuickUploadLanding
            academicYear={academicYear}
            role="faculty"
            portalTitle="Department of Computer Science & Engineering"
            headingTitle="Drop NAAC Evidence"
            schoolId="sch-tech"
            schoolName="School of Technology & Computer Engineering"
            programId="prog-cse"
            programName="B.Tech Computer Science & Engineering"
            submitTargetName="Program Coordinator"
            uploaderName="Dr. Ramesh Gupta (Associate Professor)"
            storageKeySuffix="faculty_cse"
            hideTopUploadButton={true}
            topBarLeftSlot={renderSegmentedToggle()}
            onNavigateToDocumentList={() => {
              setDeskMode('my-evidence');
            }}
          />
        </div>
      )}

      {/* VIEW 2: DEDICATED 'MY EVIDENCE' VIEW */}
      {deskMode === 'my-evidence' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 space-y-3.5 animate-in fade-in">
          {/* Top Header Row — seamless with Quick Proof Drop view */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              {renderSegmentedToggle()}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded font-mono text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                AQAR {academicYear}
              </span>
              <button
                type="button"
                onClick={() => {
                  setModalCriterionCode('Criterion 1');
                  setSelectedIndicatorCode('1.1');
                  setSelectedMetricCode('1.1.1');
                  setUploadedFiles([]);
                  setSelectedRepoFiles([]);
                  setIsUploadDrawerOpen(true);
                }}
                className="px-3.5 py-1.5 bg-[#0f2748] hover:bg-[#183963] text-white font-bold text-xs rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Upload New Supporting Evidence Document"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Upload New Evidence</span>
              </button>
            </div>
          </div>

          {/* Filter Toolbar — Neutral hover across all tabs */}
          <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Exactly: All, Draft, Submitted, Accepted, Needs Revision, Rejected */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {TABS.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#0f2748] text-white shadow-2xs'
                        : 'bg-slate-100 text-gray-700 hover:bg-slate-200 hover:text-gray-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-gray-700 border border-slate-200'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Criteria Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search file name or metric..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <select
                value={selectedCritFilter}
                onChange={(e) => setSelectedCritFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Criteria</option>
                {NAAC_CRITERIA_SUMMARY.map(crit => (
                  <option key={crit.code} value={crit.code}>
                    {crit.code}
                  </option>
                ))}
              </select>

              {/* Batch Submit Button */}
              {selectedDocIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleSubmitSelected}
                  className="px-3.5 py-1.5 bg-[#0f2748] hover:bg-[#183963] text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap animate-in fade-in"
                >
                  <Send className="w-3 h-3 text-blue-200" />
                  <span>Submit ({selectedDocIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* TABLE VIEW (NO CARDS, NO DESCRIPTION — CRITERIA/KI/METRIC & FILE DETAILS) */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold text-[10px] uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">
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
                            ? 'Deselect all'
                            : 'Select all unsubmitted'
                        }
                      />
                    </th>
                    <th className="py-2.5 px-3 w-56 whitespace-nowrap">Criteria / KI / Metric</th>
                    <th className="py-2.5 px-3 min-w-[300px]">File Name & Details</th>
                    <th className="py-2.5 px-3 w-32 text-center whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 w-36 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                          <FileText className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-gray-800">No evidence documents found</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Try adjusting your filter or search query.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => {
                      const isNeedsRevision = doc.coordinatorReviewStatus === 'changes_requested';
                      const isAccepted = doc.coordinatorReviewStatus === 'compiled' || doc.status === 'approved_by_school' || doc.status === 'university_verified';
                      const isSubmitted = doc.status === 'submitted_to_program' && !isAccepted;
                      const isRejected = doc.coordinatorReviewStatus === 'rejected';
                      const isDraft = !isSubmitted && !isAccepted && !isNeedsRevision && !isRejected;
                      const isSelected = selectedDocIds.includes(doc.id);

                      // Derive Key Indicator from Metric Code (e.g. 2.1.1 -> 2.1)
                      const kiCode = doc.keyIndicatorCode || (doc.metricCode ? doc.metricCode.split('.').slice(0, 2).join('.') : '2.1');

                      return (
                        <tr 
                          key={doc.id}
                          className={`transition-colors ${
                            isSelected
                              ? 'bg-slate-100/60'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* 1. Checkbox */}
                          <td className="py-3 px-3 text-center align-top">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isAccepted}
                              onChange={() => handleToggleSelectDoc(doc.id)}
                              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 accent-[#0f2748] mt-1"
                            />
                          </td>

                          {/* 2. Criteria & KI on Line 1, Metric on Line 2 */}
                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <div className="space-y-0.5">
                              <div className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                                <span>{doc.criterionCode || 'Criterion 2'}</span>
                                <span className="text-gray-300 font-normal">•</span>
                                <span className="text-gray-600 font-semibold">KI {kiCode}</span>
                              </div>
                              <div className="text-xs font-bold text-blue-700">
                                Metric {doc.metricCode}
                              </div>
                            </div>
                          </td>

                          {/* 3. File Name & Details (with inline HOD feedback if revision needed) */}
                          <td className="py-3 px-3 align-top">
                            <div className="space-y-1">
                              <a
                                href={doc.fileUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1.5 text-xs font-sans"
                              >
                                <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                <span className="truncate max-w-[360px]">{doc.fileName || doc.title || 'Attached_Proof.pdf'}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                              </a>
                              <div className="flex items-center gap-2 text-[11px] text-gray-500 font-sans">
                                <span>{doc.fileSize || '2.4 MB'}</span>
                                <span className="text-gray-300">•</span>
                                <span>Uploaded: {doc.uploadedAt ? doc.uploadedAt.split('T')[0] : 'Recent'}</span>
                              </div>

                              {/* Inline HOD Review Feedback if revision is needed */}
                              {isNeedsRevision && doc.coordinatorFeedback && (
                                <div className="mt-1.5 p-2 bg-amber-50/90 border border-amber-200 rounded-lg text-xs space-y-0.5">
                                  <span className="font-bold text-amber-950">Feedback from HOD: </span>
                                  <span className="text-amber-900 leading-relaxed font-medium">"{doc.coordinatorFeedback}"</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 4. Status Badge */}
                          <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                            {isNeedsRevision ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                Needs Revision
                              </span>
                            ) : isSubmitted ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Submitted
                              </span>
                            ) : isAccepted ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Accepted
                              </span>
                            ) : isRejected ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                                Rejected
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                Draft
                              </span>
                            )}
                          </td>

                          {/* 5. Actions: First Submit, then Delete */}
                          <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Submit First */}
                              {(isDraft || isNeedsRevision) && (
                                <button
                                  type="button"
                                  onClick={() => handleSingleSubmit(doc.id, doc.fileName || doc.title)}
                                  className="px-2.5 py-1 bg-[#0f2748] hover:bg-[#183963] text-white font-bold text-[11px] rounded-lg shadow-2xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Submit to Program Coordinator"
                                >
                                  <Send className="w-2.5 h-2.5 text-blue-200" />
                                  <span>Submit</span>
                                </button>
                              )}

                              {/* Delete Second (only if in draft) */}
                              {isDraft && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(doc.id, doc.fileName || doc.title)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete draft document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          RIGHT SLIDE-OVER DRAWER: ADD SUPPORTING EVIDENCE DOCUMENT
         ========================================================================= */}
      <Drawer
        isOpen={isUploadDrawerOpen}
        onClose={() => setIsUploadDrawerOpen(false)}
        position="right"
        title="Add Supporting Evidence Document"
        maxWidth="max-w-4xl"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsUploadDrawerOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-semibold text-xs hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEvidenceDocument}
              className="px-4 py-2 bg-[#0f2748] hover:bg-[#183963] text-white rounded-md font-bold text-xs shadow-xs cursor-pointer transition-colors inline-flex items-center gap-1.5"
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
        <form onSubmit={handleSaveEvidenceDocument} className="p-6 space-y-5 text-xs font-sans">
          {/* Active Cycle Context Header */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Accreditation Cycle</span>
              <h4 className="font-bold text-gray-900 text-xs mt-0.5">AQAR {academicYear || '2025-26'}</h4>
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

          {/* Compact Metric Summary Strip */}
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

          {/* Evidence Documents Attachment */}
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
                <input
                  type="file"
                  id="faculty-evidence-file-input"
                  multiple
                  accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                  onChange={handleLocalFileUpload}
                  className="hidden"
                />
                <label 
                  htmlFor="faculty-evidence-file-input" 
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

                {/* Staged Uploaded Documents Queue Area */}
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

                  <div className="border border-gray-200 rounded-xl p-2.5 bg-gray-50/70 min-h-[180px] max-h-[340px] overflow-y-auto space-y-2">
                    {uploadedFiles.length === 0 ? (
                      <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4 text-gray-400">
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

                  {/* Document List Area */}
                  <div className="border border-gray-200 rounded-xl p-2.5 bg-gray-50/70 min-h-[180px] max-h-[340px] overflow-y-auto space-y-2">
                    {filteredRepoFiles.map((file) => {
                      const isSelected = selectedRepoFiles.includes(file.name);
                      return (
                        <div
                          key={file.id}
                          onClick={() => toggleRepoFile(file.name)}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <FileText className="w-4 h-4 text-red-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-semibold text-gray-900 block truncate">{file.name}</span>
                              <span className="text-[10px] text-gray-400">{file.size} • {file.date}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                              Selected
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </form>
      </Drawer>
    </div>
  );
};
