import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  IndianRupee, 
  FileText, 
  Upload, 
  ExternalLink, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  X,
  Save,
  Check,
  ClipboardList
} from 'lucide-react';
import { 
  ExtendedProfileMetric, 
  getStoredExtendedProfile, 
  saveExtendedProfile, 
  SAMPLE_PDF_URL 
} from '../../../data/naacDmsData';
import { openFileInNewTab } from '../../../utils/fileHelper';

const NAAC_SUGGESTED_DOCS_BY_METRIC: Record<string, string[]> = {
  '1.1': [
    'Affiliating University approval / syllabus order mentioning approved courses',
    'Board of Studies (BoS) & Academic Council course sanction orders',
    'Consolidated 5-year list of approved courses signed by the Principal / Dean',
  ],
  '1.2': [
    'Statutory regulatory body approval letters (UGC, AICTE, BCI, PCI, etc.)',
    'Affiliating University permanent / temporary affiliation notifications',
    'Certified list of degree programs offered across the 5 assessment years',
  ],
  '2.1': [
    'Certified student enrollment roll list signed by Registrar / Principal with seal',
    'State Higher Education Directorate / Affiliating University approved admission roster',
    'Year-wise summary table of total enrolled students across all programs',
  ],
  '2.2': [
    'State / Central Government reservation quota roster & policy order',
    'Sanctioned intake letters with category-wise seat breakup (SC, ST, OBC, EWS)',
    'Certified list of admitted students against reserved categories signed by Principal',
  ],
  '2.3': [
    'Controller of Examinations (CoE) / University authenticated graduation list',
    'Final year terminal examination appearance list certified by Principal',
    'Annual examination result gazette / notification for outgoing candidates',
  ],
  '3.1': [
    'Official faculty appointment letters with joining reports & designations',
    'Year-wise certified list of full-time teachers for all 5 years signed by Principal',
    'Affiliating University approval / endorsement letters of appointed teachers',
  ],
  '3.2': [
    'Governing Body / Board of Management official sanctioned post resolution',
    'State Govt grant-in-aid sanctioned staff cadre strength order',
    'Cadre-wise sanctioned posts breakdown statement signed by Competent Authority',
  ],
  '4.1': [
    'IT Asset Register & physical stock verification report (with MAC / IP addresses)',
    'Purchase bills & invoices of computers allocated for student academic use',
    'Lab-wise computer distribution list certified by Principal & IT Head',
  ],
  '4.2': [
    'Audited Income & Expenditure Statements for all 5 years signed by CA with UDIN',
    'Statement showing expenditure excluding salary certified by Finance Officer / CA',
    'Extract of budget allocation & audit balance sheets highlighting operational expenses',
  ],
};

interface ExtendedProfileWorkspaceProps {
  cycleId: string;
  cycleNumber: string;
  yearFrom: string;
  yearTo: string;
}

export const ExtendedProfileWorkspace: React.FC<ExtendedProfileWorkspaceProps> = ({
  cycleId,
  cycleNumber,
  yearFrom,
  yearTo,
}) => {
  const [metrics, setMetrics] = useState<ExtendedProfileMetric[]>(() =>
    getStoredExtendedProfile(cycleId)
  );
  const [activeSection, setActiveSection] = useState<'programs' | 'students' | 'teachers' | 'expenditure'>('programs');
  const [editingMetric, setEditingMetric] = useState<ExtendedProfileMetric | null>(null);
  const [editYearValues, setEditYearValues] = useState<{ year: string; value: number }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setMetrics(getStoredExtendedProfile(cycleId));
  }, [cycleId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const sections = [
    { id: 'programs' as const, label: '1. Programs', icon: Building2, desc: 'Courses & Degree Programs' },
    { id: 'students' as const, label: '2. Students', icon: GraduationCap, desc: 'Enrollment, Reserved Seats & Outgoing' },
    { id: 'teachers' as const, label: '3. Teachers', icon: Users, desc: 'Full-Time Faculty & Sanctioned Posts' },
    { id: 'expenditure' as const, label: '4. Institution & Expenditure', icon: IndianRupee, desc: 'Computers & Non-Salary Budget' },
  ];

  const currentSectionMetrics = metrics.filter((m) => m.section === activeSection);

  // Edit Numbers Modal handlers
  const handleOpenEditNumbers = (metric: ExtendedProfileMetric) => {
    setEditingMetric(metric);
    setEditYearValues(metric.years.map((y) => ({ ...y })));
  };

  const handleSaveNumbers = () => {
    if (!editingMetric) return;
    const total = editYearValues.reduce((sum, y) => sum + (Number(y.value) || 0), 0);
    const avg = Number((total / (editYearValues.length || 1)).toFixed(2));

    const updated = metrics.map((m) =>
      m.id === editingMetric.id
        ? {
            ...m,
            years: editYearValues.map((y) => ({ year: y.year, value: Number(y.value) || 0 })),
            total: editingMetric.code === '1.2' || editingMetric.code === '4.1' ? editYearValues[editYearValues.length - 1]?.value || 0 : total,
            average: avg,
          }
        : m
    );

    setMetrics(updated);
    saveExtendedProfile(cycleId, updated);
    setEditingMetric(null);
    showToast(`Updated quantitative data for Metric ${editingMetric.code}`);
  };

  // Upload proof file
  const handleFileUpload = (metricId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || SAMPLE_PDF_URL;
      const newProof = {
        id: `ep-doc-${Date.now()}`,
        fileName: file.name,
        fileUrl: dataUrl,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        verified: true,
        verificationNote: 'Uploaded and certified by IQAC Coordinator',
      };

      const updated = metrics.map((m) =>
        m.id === metricId
          ? {
              ...m,
              documentProofs: [...m.documentProofs, newProof],
            }
          : m
      );

      setMetrics(updated);
      saveExtendedProfile(cycleId, updated);
      showToast(`Uploaded evidence: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Remove proof file
  const handleRemoveProof = (metricId: string, proofId: string) => {
    const updated = metrics.map((m) =>
      m.id === metricId
        ? {
            ...m,
            documentProofs: m.documentProofs.filter((p) => p.id !== proofId),
          }
        : m
    );
    setMetrics(updated);
    saveExtendedProfile(cycleId, updated);
    showToast('Evidence document removed');
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

      {/* 4 Section Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          const secMetrics = metrics.filter((m) => m.section === sec.id);
          const proofsInSec = secMetrics.reduce((sum, m) => sum + m.documentProofs.length, 0);

          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-50/80 border-blue-600 shadow-xs ring-2 ring-blue-600/10'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {proofsInSec} Proofs
                </span>
              </div>
              <div>
                <div className={`text-sm font-bold ${isActive ? 'text-blue-950' : 'text-gray-900'}`}>
                  {sec.label}
                </div>
                <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{sec.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Section Metrics Cards */}
      <div className="space-y-6">
        {currentSectionMetrics.map((metric) => {
          return (
            <div
              key={metric.id}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden transition-all hover:border-blue-200"
            >
              {/* Metric Card Header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs shrink-0 mt-0.5">
                    Metric {metric.code}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                      {metric.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <span className="text-xs font-semibold text-gray-600 px-2 py-1 rounded-md bg-white border border-gray-200">
                    Unit: <strong className="text-gray-900">{metric.unit}</strong>
                  </span>
                  <button
                    onClick={() => handleOpenEditNumbers(metric)}
                    className="px-3 py-1.5 rounded-lg border border-blue-600 bg-blue-50/60 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Numbers</span>
                  </button>
                </div>
              </div>

              {/* 5-Year Data Table */}
              <div className="p-5">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>5-Year Cycle Quantitative Breakdown</span>
                  <span className="text-gray-500 font-normal normal-case">
                    {metric.code === '1.2' || metric.code === '4.1' ? 'Current Active: ' : '5-Year Total: '}
                    <strong className="text-gray-900 font-bold">{metric.total?.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                      <tr>
                        {metric.years.map((y) => (
                          <th key={y.year} className="px-4 py-2.5 text-center">
                            {y.year}
                          </th>
                        ))}
                        <th className="px-4 py-2.5 text-center bg-blue-50/50 text-blue-900 font-extrabold border-l border-gray-200">
                          {metric.code === '1.2' || metric.code === '4.1' ? 'Current Active' : '5-Year Total'}
                        </th>
                        <th className="px-4 py-2.5 text-center bg-indigo-50/50 text-indigo-900 font-extrabold border-l border-gray-200">
                          Yearly Average
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        {metric.years.map((y) => (
                          <td key={y.year} className="px-4 py-3 text-center font-bold text-gray-800 text-sm">
                            {y.value.toLocaleString()}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center font-extrabold text-blue-700 text-sm bg-blue-50/30 border-l border-gray-200">
                          {metric.total?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center font-extrabold text-indigo-700 text-sm bg-indigo-50/30 border-l border-gray-200">
                          {metric.average?.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Supporting Proofs: Left Suggestions / Right Actual Documents */}
                <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left Column: Suggestions / NAAC Mandated Proofs (5 cols on lg) */}
                  <div className="lg:col-span-5 flex flex-col">
                    {/* Left Header Outside */}
                    <div className="flex items-center gap-2 h-8 mb-2.5">
                      <ClipboardList className="w-4 h-4 text-blue-700 shrink-0" />
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Suggested Supporting Proofs
                      </h4>
                    </div>

                    {/* Left Content Box */}
                    <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between flex-1 min-h-[160px] shadow-2xs">
                      <div>
                        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                          NAAC standard documents expected by DVV partner for Metric {metric.code}:
                        </p>
                        <ul className="space-y-2.5">
                          {(NAAC_SUGGESTED_DOCS_BY_METRIC[metric.code] || [
                            'Official institutional order signed by Principal',
                            'Competent authority certified summary statement',
                          ]).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-blue-900">Standard: Affiliated Colleges</span>
                        <span className="italic text-slate-400">PDF format</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actual Documents in Key Indicator Framework Style (7 cols on lg) */}
                  <div className="lg:col-span-7 flex flex-col">
                    {/* Right Header Outside */}
                    <div className="flex items-center justify-between h-8 mb-2.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-600 shrink-0" />
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Uploaded Evidence Proofs ({metric.documentProofs.length})
                        </span>
                      </div>

                      <div>
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          ref={(el) => (fileInputRefs.current[metric.id] = el)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(metric.id, file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[metric.id]?.click()}
                          className="px-3 py-1.5 bg-[#1d4ed8] hover:bg-blue-800 text-white rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:shadow active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Upload Institutional Proof</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Continuous Table Rows Box */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs divide-y divide-slate-100 flex-1 min-h-[160px] flex flex-col">
                      {metric.documentProofs.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/30 flex-1 flex items-center justify-center">
                          No evidence document filed yet for Metric {metric.code}. Click <strong className="text-blue-700 font-semibold mx-1">"Upload Institutional Proof"</strong> to attach approved lists or certified orders.
                        </div>
                      ) : (
                        metric.documentProofs.map((proof) => (
                          <div
                            key={proof.id}
                            className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50/80 transition-colors gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {/* Metric Number Badge */}
                              <span
                                className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50/80 border border-blue-200/90 px-2 py-0.5 rounded shadow-2xs shrink-0"
                                title={`Metric ${metric.code}`}
                              >
                                {metric.code}
                              </span>

                              <FileText className="w-3.5 h-3.5 shrink-0 text-blue-600" />

                              {/* Filename with distinct link styling */}
                              <span
                                onClick={() => openFileInNewTab(proof.fileUrl)}
                                className="font-medium text-slate-800 hover:text-blue-700 hover:underline cursor-pointer truncate max-w-xs text-xs"
                                title={proof.fileName}
                              >
                                {proof.fileName}
                              </span>

                              {/* File Size badge */}
                              <span className="text-[10px] text-slate-400 font-normal shrink-0">
                                ({proof.fileSize})
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 text-xs">
                              <div className="text-[11px] text-slate-400 hidden xl:block">
                                {proof.uploadedAt}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openFileInNewTab(proof.fileUrl)}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                  title="Open Document in New Tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProof(metric.id, proof.id)}
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          disabled={activeSection === 'programs'}
          onClick={() => {
            const idx = sections.findIndex((s) => s.id === activeSection);
            if (idx > 0) setActiveSection(sections[idx - 1].id);
          }}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Section</span>
        </button>

        <button
          disabled={activeSection === 'expenditure'}
          onClick={() => {
            const idx = sections.findIndex((s) => s.id === activeSection);
            if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Next Section</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Numbers Modal */}
      {editingMetric && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Metric {editingMetric.code}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">
                  Edit 5-Year Quantitative Values
                </h3>
                <p className="text-xs text-gray-500 mt-1">{editingMetric.title}</p>
              </div>
              <button
                onClick={() => setEditingMetric(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <label className="block text-xs font-bold text-gray-700">
                Annual Breakdown ({editingMetric.unit})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {editYearValues.map((y, idx) => (
                  <div key={y.year} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      {y.year}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={y.value}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setEditYearValues((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, value: val } : item))
                        );
                      }}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-800 outline-none focus:border-blue-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setEditingMetric(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNumbers}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

