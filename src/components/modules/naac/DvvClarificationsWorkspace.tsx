import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  ExternalLink, 
  Trash2, 
  Plus, 
  X, 
  Search,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { 
  DvvClarificationDocument,
  getStoredDvvDocuments,
  saveDvvDocuments,
  NAAC_CRITERIA_SUMMARY,
  KEY_INDICATORS,
  NAAC_METRICS_LIST,
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
  const [documents, setDocuments] = useState<DvvClarificationDocument[]>(() =>
    getStoredDvvDocuments(cycleId)
  );

  // Upload Box State
  const [selectedCrit, setSelectedCrit] = useState('Criterion 2');
  const [selectedKi, setSelectedKi] = useState('2.1');
  const [selectedMetric, setSelectedMetric] = useState('2.1.2');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [criterionFilter, setCriterionFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setDocuments(getStoredDvvDocuments(cycleId));
  }, [cycleId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upload handler
  const handleUploadDocument = () => {
    if (!selectedFile) {
      showToast('Please select a PDF document to upload.');
      return;
    }

    const metricObj = NAAC_METRICS_LIST.find((m) => m.code === selectedMetric);
    const metricTitle = metricObj ? metricObj.name : `Metric ${selectedMetric} Clarification`;
    const currentDate = new Date().toISOString().split('T')[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || SAMPLE_PDF_URL;
      const newDoc: DvvClarificationDocument = {
        id: `dvv-doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        cycleId,
        criterionCode: selectedCrit,
        keyIndicatorCode: selectedKi,
        metricCode: selectedMetric,
        metricTitle,
        fileName: selectedFile.name,
        fileUrl: dataUrl,
        fileSize: `${Math.max(0.4, Number((selectedFile.size / (1024 * 1024)).toFixed(1)))} MB`,
        uploadedAt: currentDate,
        uploadedBy: 'Accreditation Coordinator',
      };

      const updated = [newDoc, ...documents];
      setDocuments(updated);
      saveDvvDocuments(cycleId, updated);
      showToast(`Uploaded DVV clarification document for Metric ${selectedMetric}!`);
      setSelectedFile(null);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Delete handler
  const handleDeleteDocument = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from DVV clarifications?`)) {
      const updated = documents.filter((d) => d.id !== id);
      setDocuments(updated);
      saveDvvDocuments(cycleId, updated);
      showToast(`Removed ${name}`);
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter((d) => {
    if (criterionFilter !== 'ALL' && d.criterionCode !== criterionFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.fileName.toLowerCase().includes(q);
      const matchMetric = d.metricCode.toLowerCase().includes(q);
      const matchTitle = (d.metricTitle || '').toLowerCase().includes(q);
      return matchName || matchMetric || matchTitle;
    }
    return true;
  });

  // Available KIs for chosen Criterion
  const availableKis = KEY_INDICATORS.filter(
    (k) => k.criterionCode.toLowerCase() === selectedCrit.toLowerCase()
  );

  // Available Metrics for chosen Criterion & KI
  const availableMetrics = NAAC_METRICS_LIST.filter(
    (m) =>
      m.criterionCode.toLowerCase() === selectedCrit.toLowerCase() &&
      m.code.startsWith(selectedKi)
  );

  return (
    <div className="space-y-6 text-left">
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

      {/* Top Inline Box: Select Criteria, Key Indicator, Metric & Upload */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Upload DVV Clarification Document
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Select target Criterion, Key Indicator, and Metric to attach revised clarification evidence.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            {cycleNumber} ({yearFrom} to {yearTo})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5 items-end">
          {/* Criterion Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              1. Criterion
            </label>
            <select
              value={selectedCrit}
              onChange={(e) => {
                const nextCrit = e.target.value;
                setSelectedCrit(nextCrit);
                const kis = KEY_INDICATORS.filter(
                  (k) => k.criterionCode.toLowerCase() === nextCrit.toLowerCase()
                );
                const nextKi = kis[0]?.code || '1.1';
                setSelectedKi(nextKi);
                const mets = NAAC_METRICS_LIST.filter(
                  (m) =>
                    m.criterionCode.toLowerCase() === nextCrit.toLowerCase() &&
                    m.code.startsWith(nextKi)
                );
                setSelectedMetric(mets[0]?.code || '1.1.1');
              }}
              className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {NAAC_CRITERIA_SUMMARY.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}: {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Key Indicator Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              2. Key Indicator (KI)
            </label>
            <select
              value={selectedKi}
              onChange={(e) => {
                const nextKi = e.target.value;
                setSelectedKi(nextKi);
                const mets = NAAC_METRICS_LIST.filter(
                  (m) =>
                    m.criterionCode.toLowerCase() === selectedCrit.toLowerCase() &&
                    m.code.startsWith(nextKi)
                );
                setSelectedMetric(mets[0]?.code || `${nextKi}.1`);
              }}
              className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {availableKis.map((ki) => (
                <option key={ki.code} value={ki.code}>
                  KI {ki.code}: {ki.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              3. Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {availableMetrics.map((m) => (
                <option key={m.code} value={m.code}>
                  Metric {m.code} ({m.metricType}) — {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Picker & Upload CTA */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              4. Evidence Document (PDF)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedFile(file);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 text-xs font-semibold px-3 py-2 border rounded-xl flex items-center justify-between gap-1.5 cursor-pointer truncate ${
                  selectedFile
                    ? 'border-blue-400 bg-blue-50/70 text-blue-900 font-bold'
                    : 'border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 text-gray-600'
                }`}
              >
                <span className="truncate">
                  {selectedFile ? selectedFile.name : 'Choose PDF file...'}
                </span>
                {selectedFile && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-gray-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleUploadDocument}
                disabled={!selectedFile}
                className="px-4 py-2 bg-[#1d4ed8] hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer inline-flex items-center gap-1.5 transition-all hover:shadow active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Upload</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Document Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Criterion Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
              Filter Criterion:
            </span>
            <select
              value={criterionFilter}
              onChange={(e) => setCriterionFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 cursor-pointer text-gray-900 shadow-2xs"
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
            {filteredDocuments.length} DVV Documents
          </span>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by file name or metric..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Uploaded Documents List - Key Indicator Framework Continuous Table Style */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs divide-y divide-slate-100">
        {filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/30">
            No DVV clarification documents uploaded yet for the selected filter. Select Criterion, Key Indicator, and Metric above to attach files.
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/80 transition-colors gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Metric Number Badge */}
                <span
                  className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50/80 border border-blue-200/90 px-2 py-0.5 rounded shadow-2xs shrink-0"
                  title={`Metric ${doc.metricCode}`}
                >
                  {doc.metricCode}
                </span>

                <FileText className="w-3.5 h-3.5 shrink-0 text-blue-600" />

                {/* Filename with distinct link styling */}
                <span
                  onClick={() => openFileInNewTab(doc.fileUrl)}
                  className="font-medium text-slate-800 hover:text-blue-700 hover:underline cursor-pointer truncate max-w-md text-xs"
                  title={doc.fileName}
                >
                  {doc.fileName}
                </span>

                {/* Metric Title subtitle */}
                <span className="text-[11px] text-slate-500 truncate max-w-xs hidden lg:inline" title={doc.metricTitle}>
                  • {doc.metricTitle}
                </span>

                {/* File Size badge */}
                <span className="text-[10px] text-slate-400 font-normal shrink-0">
                  ({doc.fileSize})
                </span>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-xs">
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  {doc.uploadedBy || 'Accreditation Coordinator'} &bull; {doc.uploadedAt}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openFileInNewTab(doc.fileUrl)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                    title="Open Document in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.id, doc.fileName)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
