import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Upload, 
  ExternalLink, 
  Send, 
  Trash2, 
  Plus, 
  X, 
  Search,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { 
  NaacDvvQuery, 
  getStoredDvvQueries, 
  saveDvvQueries, 
  SAMPLE_PDF_URL 
} from '../../../data/naacDmsData';
import { openFileInNewTab } from '../../../utils/fileHelper';

interface DvvClarificationsWorkspaceProps {
  cycleId: string;
  cycleNumber: string;
  yearFrom: string;
  yearTo: string;
}

export const DvvClarificationsWorkspace: React.FC<DvvClarificationsWorkspaceProps> = ({
  cycleId,
  cycleNumber,
  yearFrom,
  yearTo,
}) => {
  const [queries, setQueries] = useState<NaacDvvQuery[]>(() =>
    getStoredDvvQueries(cycleId)
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'submitted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setQueries(getStoredDvvQueries(cycleId));
  }, [cycleId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const pendingCount = queries.filter((q) => q.status === 'pending').length;
  const submittedCount = queries.filter((q) => q.status === 'submitted' || q.status === 'accepted').length;

  const filteredQueries = queries.filter((q) => {
    if (activeFilter === 'pending' && q.status !== 'pending') return false;
    if (activeFilter === 'submitted' && q.status === 'pending') return false;
    if (searchQuery.trim()) {
      const qText = `${q.targetCode} ${q.targetTitle} ${q.naacQueryText}`.toLowerCase();
      return qText.includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Handle Response Text Change
  const handleResponseTextChange = (id: string, text: string) => {
    const updated = queries.map((q) => (q.id === id ? { ...q, heiResponseText: text } : q));
    setQueries(updated);
    saveDvvQueries(cycleId, updated);
  };

  // Upload DVV Proof Document
  const handleUploadDvvDocument = (queryId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || SAMPLE_PDF_URL;
      const newDoc = {
        id: `dvv-doc-${Date.now()}`,
        fileName: file.name,
        fileUrl: dataUrl,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
      };

      const updated = queries.map((q) =>
        q.id === queryId
          ? {
              ...q,
              supportingDocuments: [...q.supportingDocuments, newDoc],
            }
          : q
      );

      setQueries(updated);
      saveDvvQueries(cycleId, updated);
      showToast(`Attached DVV evidence: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Remove DVV document
  const handleRemoveDvvDocument = (queryId: string, docId: string) => {
    const updated = queries.map((q) =>
      q.id === queryId
        ? {
            ...q,
            supportingDocuments: q.supportingDocuments.filter((d) => d.id !== docId),
          }
        : q
    );
    setQueries(updated);
    saveDvvQueries(cycleId, updated);
    showToast('Evidence document removed');
  };

  // Submit response to NAAC
  const handleSubmitResponseToNaac = (id: string) => {
    const targetQuery = queries.find((q) => q.id === id);
    if (!targetQuery) return;

    if (!targetQuery.heiResponseText?.trim() && targetQuery.supportingDocuments.length === 0) {
      showToast('Please provide a response remark or attach supporting evidence before submitting.');
      return;
    }

    const updated = queries.map((q) =>
      q.id === id
        ? {
            ...q,
            status: 'submitted' as const,
            heiResponseDate: new Date().toISOString().split('T')[0],
          }
        : q
    );

    setQueries(updated);
    saveDvvQueries(cycleId, updated);
    showToast(`Clarification response for ${targetQuery.targetCode} submitted to NAAC DVV`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50">
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-xl shadow-xl flex items-center justify-between text-xs font-semibold gap-3 animate-fade-in">
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

      {/* Top Banner & Overview */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold uppercase tracking-wider">
              {cycleNumber} ({yearFrom} to {yearTo})
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[11px] font-bold">
              NAAC Partner Evaluation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Data Validation & Verification (DVV) Clarifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-300/90 mt-1 max-w-2xl">
            Official clarification queries raised by NAAC's DVV verification partner. Upload revised metrics, supporting certificates, and official response letters within the 15-day compliance window.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs px-5 py-3.5 rounded-xl border border-white/10 shrink-0 self-start md:self-auto">
          <div>
            <div className="text-lg font-black text-amber-300">{pendingCount} Pending</div>
            <div className="text-[11px] text-slate-300">Action Required</div>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div>
            <div className="text-lg font-black text-emerald-300">{submittedCount} Submitted</div>
            <div className="text-[11px] text-slate-300">Awaiting NAAC Review</div>
          </div>
        </div>
      </div>

      {/* Controls: Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Queries ({queries.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'pending'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending Action ({pendingCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('submitted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'submitted'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-600 hover:text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Submitted ({submittedCount})</span>
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search queries or metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Query Cards List */}
      <div className="space-y-5">
        {filteredQueries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 text-xs">
            No DVV queries match the selected filter.
          </div>
        ) : (
          filteredQueries.map((q) => {
            const isPending = q.status === 'pending';

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border shadow-2xs overflow-hidden transition-all ${
                  isPending
                    ? 'border-amber-300 ring-2 ring-amber-400/10'
                    : 'border-gray-200/90'
                }`}
              >
                {/* Query Header */}
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-black text-xs">
                      {q.queryNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs">
                      {q.targetCode}
                    </span>
                    <span className="text-xs font-bold text-gray-800">{q.targetTitle}</span>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Due: {q.deadlineDate}</span>
                    </div>

                    {isPending ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Pending Clarification
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Submitted on {q.heiResponseDate}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* NAAC Query Box */}
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950">
                    <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>NAAC DVV Evaluation Query (Received {q.naacQueryDate}):</span>
                    </div>
                    <p className="leading-relaxed pl-6">{q.naacQueryText}</p>
                  </div>

                  {/* HEI Response Remarks */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>HEI Clarification Response / Remarks:</span>
                    </label>
                    <textarea
                      rows={3}
                      value={q.heiResponseText || ''}
                      onChange={(e) => handleResponseTextChange(q.id, e.target.value)}
                      placeholder="Type your official clarification explanation here. Reference the attached documents and year-wise verification..."
                      className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  {/* Supporting Documents List */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-600" />
                        <span>Clarification Supporting Documents ({q.supportingDocuments.length})</span>
                      </span>

                      <div>
                        <input
                          type="file"
                          accept=".pdf,.xlsx,.xls,.doc,.docx"
                          className="hidden"
                          ref={(el) => (fileInputRefs.current[q.id] = el)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadDvvDocument(q.id, file);
                          }}
                        />
                        <button
                          onClick={() => fileInputRefs.current[q.id]?.click()}
                          className="px-3 py-1.5 rounded-lg border border-dashed border-blue-400 bg-blue-50/40 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Attach Document Proof</span>
                        </button>
                      </div>
                    </div>

                    {q.supportingDocuments.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-3.5 text-center text-xs text-gray-500">
                        No clarification documents attached yet. Click "Attach Document Proof" to upload signed letters or revised spreadsheets.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.supportingDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="border border-gray-200 rounded-xl p-3 bg-white hover:border-blue-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-gray-900 truncate" title={doc.fileName}>
                                  {doc.fileName}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {doc.fileSize} • Uploaded {doc.uploadedAt}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openFileInNewTab(doc.fileUrl)}
                                className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleRemoveDvvDocument(q.id, doc.id)}
                                className="p-1 rounded-lg border border-gray-200 hover:bg-rose-50 hover:border-rose-200 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-[11px] text-gray-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>HEI Submissions are cryptographically time-stamped and logged.</span>
                    </div>

                    <button
                      onClick={() => handleSubmitResponseToNaac(q.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        isPending
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isPending ? 'Submit Clarification to NAAC' : 'Update & Re-Submit Response'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

