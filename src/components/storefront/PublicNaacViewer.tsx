import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Copy,
  CheckCircle2
} from 'lucide-react';
import {
  NAAC_CRITERIA_SUMMARY,
  KEY_INDICATORS,
  NAAC_METRICS_LIST,
  type NaacEvidenceDocument,
  type NaacSsrCycle,
  getStoredNaacDocuments,
  getStoredNaacCycles,
} from '../../data/naacDmsData';
import { openFileInNewTab } from '../../utils/fileHelper';

export const PublicNaacViewer: React.FC = () => {
  const [cycles, setCycles] = useState<NaacSsrCycle[]>(() => getStoredNaacCycles());
  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() =>
    getStoredNaacDocuments()
  );

  // Selected cycle/year for 8.png reader view (null = show 7.png table view)
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState<string | null>(null);
  const [activeCriterionCode, setActiveCriterionCode] = useState<string>('Criterion 1');
  const [expandedKeyIndicators, setExpandedKeyIndicators] = useState<Record<string, boolean>>({
    '1.1': true,
    '1.2': true,
    '2.1': true,
    '3.1': true,
    '4.1': true,
    '5.1': true,
    '6.1': true,
    '7.1': true,
  });
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  useEffect(() => {
    const syncData = () => {
      setCycles(getStoredNaacCycles());
      setDocuments(getStoredNaacDocuments());
    };
    window.addEventListener('naac-dms-updated', syncData);
    window.addEventListener('naac-cycles-updated', syncData);
    window.addEventListener('storage', syncData);
    return () => {
      window.removeEventListener('naac-dms-updated', syncData);
      window.removeEventListener('naac-cycles-updated', syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  // Show documents that are published (university_verified) or fallback to all non-draft documents so demo is rich
  const publishedDocs = documents.filter((d) => d.status !== 'draft');

  const aqarYears = [
    ...cycles.map((c) => ({
      id: c.id,
      label: `${c.cycleNumber} (${c.yearFrom} to ${c.yearTo})`,
      badge: 'SSR Cycle',
    })),
    { id: 'aqar-2024-25', label: '2024-25', badge: 'AQAR' },
    { id: 'aqar-2025-26', label: '2025-26', badge: 'AQAR' },
  ];

  const activeCritObj =
    NAAC_CRITERIA_SUMMARY.find((c) => c.code === activeCriterionCode) ||
    NAAC_CRITERIA_SUMMARY[0];

  const activeKeyIndicators = KEY_INDICATORS.filter(
    (ki) => ki.criterionCode === activeCritObj.code
  );

  const handleCopyLink = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedToast('Document URL copied to clipboard!');
    setTimeout(() => setCopiedToast(null), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6">
      {copiedToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* ===================================================================
          VIEW 1 (7.png): CYCLE / ACADEMIC YEAR LIST CARD
      =================================================================== */}
      {!selectedPeriodLabel ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1.5">
            SSR & AQAR (Annual Quality Assurance Report)
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            Select an SSR Cycle or academic year to view supporting documents and reports
          </p>

          {/* Table Header Bar matching 7.png */}
          <div className="bg-[#f1f5f9] rounded-xl px-5 py-3.5 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#0f2748] mb-2">
            <span>ACADEMIC YEAR / SSR CYCLE</span>
            <span>ACTIONS / REPORTS</span>
          </div>

          {/* Rows matching 7.png */}
          <div className="divide-y divide-gray-100">
            {aqarYears.map((row) => (
              <div
                key={row.id}
                className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">{row.label}</span>
                  {row.badge === 'SSR Cycle' && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      NAAC SSR
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedPeriodLabel(row.label)}
                  className="px-4 py-2 rounded-lg bg-[#1d4ed8] hover:bg-blue-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Supporting Documents</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ===================================================================
           VIEW 2 (8.png): LEFT CRITERION SIDEBAR + RIGHT METRIC DOCUMENTS
        =================================================================== */
        <div className="space-y-6">
          {/* Top Navigation Bar matching 8.png */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <button
              onClick={() => setSelectedPeriodLabel(null)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Academic Years</span>
            </button>

            <div className="text-sm sm:text-base font-extrabold text-gray-900">
              {selectedPeriodLabel.includes('Cycle') ? 'SSR: ' : 'AQAR: '}
              <span className="font-semibold text-gray-800">{selectedPeriodLabel}</span>
            </div>
          </div>

          {/* 2-Column Reader Layout matching 8.png */}
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Left Sidebar Card matching 8.png */}
            <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
              <div className="divide-y divide-gray-100 text-xs sm:text-sm">
                <button
                  onClick={() => setActiveCriterionCode('Criterion 1')}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="font-medium">Extended Profile</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                {NAAC_CRITERIA_SUMMARY.map((crit, idx) => {
                  const isActive = activeCriterionCode === crit.code;
                  return (
                    <button
                      key={crit.id}
                      onClick={() => {
                        setActiveCriterionCode(crit.code);
                        const firstKi = KEY_INDICATORS.find(
                          (k) => k.criterionCode === crit.code
                        );
                        if (firstKi) {
                          setExpandedKeyIndicators((prev) => ({
                            ...prev,
                            [firstKi.code]: true,
                          }));
                        }
                      }}
                      className={`w-full px-5 py-4 text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'border-l-4 border-l-[#1d4ed8] bg-blue-50/60 text-[#1d4ed8] font-bold'
                          : 'text-gray-700 hover:bg-gray-50 font-medium'
                      }`}
                    >
                      <span className="pr-2 leading-snug">
                        {idx + 1}. {crit.name}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#1d4ed8]' : 'text-gray-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Main Content Panel matching 8.png */}
            <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 border-t-4 border-t-[#0f2748] p-6 sm:p-8 shadow-2xs space-y-6">
              {/* Criterion Title with Gold Line matching 8.png */}
              <div className="flex items-center gap-4">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#0f2748] underline decoration-2 underline-offset-4 shrink-0">
                  {activeCritObj.name}
                </h3>
                <div className="flex-1 h-0.5 bg-amber-400 mt-1" />
              </div>

              {/* Key Indicators Accordion List matching 8.png */}
              <div className="space-y-4">
                {activeKeyIndicators.map((ki) => {
                  const isOpen = Boolean(expandedKeyIndicators[ki.code]);
                  const kiMetrics = NAAC_METRICS_LIST.filter((m) =>
                    ki.metricCodes.includes(m.code)
                  );
                  const kiDocCount = kiMetrics.reduce((acc, m) => {
                    const docs = publishedDocs.filter((d) => d.metricCode === m.code);
                    return acc + docs.length;
                  }, 0);

                  return (
                    <div
                      key={ki.code}
                      className="rounded-xl border border-gray-200 overflow-hidden bg-white"
                    >
                      {/* Key Indicator Header matching 8.png */}
                      <div
                        onClick={() =>
                          setExpandedKeyIndicators((prev) => ({
                            ...prev,
                            [ki.code]: !prev[ki.code],
                          }))
                        }
                        className="px-5 py-4 bg-[#f8fafc] flex items-center justify-between cursor-pointer hover:bg-gray-100/80 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold text-gray-800">
                            {ki.code} {ki.name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-200/80 text-gray-700">
                            {kiDocCount} {kiDocCount === 1 ? 'doc' : 'docs'}
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </div>

                      {/* Metrics & Supporting PDFs inside Key Indicator matching 8.png */}
                      {isOpen && (
                        <div className="p-5 space-y-4 bg-white border-t border-gray-100">
                          {kiMetrics.map((metric) => {
                            const metricDocs = publishedDocs.filter(
                              (d) => d.metricCode === metric.code
                            );
                            return (
                              <div
                                key={metric.code}
                                className="rounded-xl border border-gray-200/90 p-5 space-y-3.5 bg-white"
                              >
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                                  <strong className="text-gray-900">{metric.code}:</strong>{' '}
                                  {metric.description || metric.name}
                                </p>

                                {metricDocs.length > 0 && (
                                  <div className="pt-2 border-t border-gray-100 space-y-2">
                                    {metricDocs.map((doc) => (
                                      <div
                                        key={doc.id}
                                        className="px-3.5 py-2.5 rounded-lg bg-[#f8fafc] border border-gray-200/60 flex items-center justify-between gap-3 hover:bg-blue-50/40 transition-colors"
                                      >
                                        <div
                                          onClick={() => openFileInNewTab(doc.fileUrl)}
                                          className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                                        >
                                          <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                                          <span className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 group-hover:underline truncate">
                                            {doc.fileName || `${doc.title}.pdf`}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          <button
                                            onClick={() => openFileInNewTab(doc.fileUrl)}
                                            className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
                                            title="Open Supporting Document"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleCopyLink(doc.fileUrl)}
                                            className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
                                            title="Copy Document Link"
                                          >
                                            <Copy className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

