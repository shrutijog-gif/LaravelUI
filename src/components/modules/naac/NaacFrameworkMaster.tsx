import React, { useState, useEffect, useRef } from 'react';
import {
  FolderTree,
  Plus,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Check,
  X,
  FileText,
  Sliders,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Home,
  ArrowRight,
  Building2,
  GraduationCap,
  Stethoscope,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import {
  NaacFrameworkProfile,
  NaacCriterionMaster,
  NaacKeyIndicatorMaster,
  NaacMetricMaster,
  NaacSubMetricMaster,
  NaacFrameworkType,
  AVAILABLE_FRAMEWORK_PRESETS,
  CollegeTrackId,
  RegimeId,
  COLLEGE_TRACKS,
  getTrackRegimeFramework,
  saveTrackRegimeFramework,
  resetTrackRegimeFramework,
  exportFrameworkToJson,
  importFrameworkFromJson,
} from '../../../data/naacFrameworkData';
import { getStoredNaacCycles, NaacSsrCycle } from '../../../data/naacDmsData';

interface NaacFrameworkMasterProps {
  initialCycleId?: string | null;
  onNavigateToCycle?: (cycleId: string) => void;
  onNavigateToQuickDrop?: () => void;
}

export const NaacFrameworkMaster: React.FC<NaacFrameworkMasterProps> = ({
  initialCycleId,
  onNavigateToCycle,
  onNavigateToQuickDrop,
}) => {
  // 1. College Track & Regime Selection
  const [selectedTrack, setSelectedTrack] = useState<CollegeTrackId>('affiliated');
  const [selectedRegime, setSelectedRegime] = useState<RegimeId>('raf_7');

  // 2. Active Framework State for Selected Track & Regime
  const [framework, setFramework] = useState<NaacFrameworkProfile>(() =>
    getTrackRegimeFramework(selectedTrack, selectedRegime)
  );

  // Sync framework on track or regime change
  useEffect(() => {
    const loaded = getTrackRegimeFramework(selectedTrack, selectedRegime);
    setFramework(loaded);
  }, [selectedTrack, selectedRegime]);

  // Selected Criterion in Left Column (Master Selection)
  const [selectedCritId, setSelectedCritId] = useState<string>(() => {
    return framework.criteria[0]?.id || 'crit-1';
  });

  // Ensure selectedCritId is always valid when framework changes
  useEffect(() => {
    if (!framework.criteria.some((c) => c.id === selectedCritId)) {
      setSelectedCritId(framework.criteria[0]?.id || '');
    }
  }, [framework, selectedCritId]);

  const activeCriterion = framework.criteria.find((c) => c.id === selectedCritId) || framework.criteria[0] || null;

  // Toast State
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Right Column Accordion for KIs
  const [expandedKis, setExpandedKis] = useState<Record<string, boolean>>({});
  const toggleKiExpand = (kiId: string) => {
    setExpandedKis((prev) => ({ ...prev, [kiId]: !prev[kiId] }));
  };

  // Modals State
  const [editingCriterion, setEditingCriterion] = useState<{ isNew: boolean; data: NaacCriterionMaster } | null>(null);
  const [editingKi, setEditingKi] = useState<{ isNew: boolean; critId: string; data: NaacKeyIndicatorMaster } | null>(null);
  const [editingMetric, setEditingMetric] = useState<{ isNew: boolean; critId: string; kiId: string; data: NaacMetricMaster } | null>(null);
  const [editingSubMetric, setEditingSubMetric] = useState<{ isNew: boolean; critId: string; kiId: string; metricId: string; data: NaacSubMetricMaster } | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Framework Save helper (Persists per College Track + Regime)
  const handleSaveFramework = (updated: NaacFrameworkProfile) => {
    setFramework(updated);
    saveTrackRegimeFramework(selectedTrack, selectedRegime, updated);
  };

  // Total Weightage check
  const totalWeightage = framework.criteria.reduce((sum, c) => sum + (c.weightage || 0), 0);

  // Criterion CRUD
  const handleSaveCriterion = () => {
    if (!editingCriterion) return;
    const { isNew, data } = editingCriterion;
    let nextCriteria = [...framework.criteria];
    if (isNew) {
      const newId = `crit-custom-${Date.now()}`;
      nextCriteria.push({ ...data, id: newId, indicators: [] });
      setSelectedCritId(newId);
    } else {
      nextCriteria = nextCriteria.map((c) => (c.id === data.id ? { ...c, ...data } : c));
    }
    handleSaveFramework({ ...framework, criteria: nextCriteria });
    setEditingCriterion(null);
    showToast(isNew ? `Added ${data.code}` : `Updated ${data.code}`);
  };

  const handleDeleteCriterion = (critId: string, code: string) => {
    if (!window.confirm(`Delete ${code} and all its indicators?`)) return;
    const nextCriteria = framework.criteria.filter((c) => c.id !== critId);
    handleSaveFramework({ ...framework, criteria: nextCriteria });
    if (selectedCritId === critId) {
      setSelectedCritId(nextCriteria[0]?.id || '');
    }
    showToast(`Deleted ${code}`, 'info');
  };

  // KI CRUD
  const handleSaveKi = () => {
    if (!editingKi) return;
    const { isNew, critId, data } = editingKi;
    const nextCriteria = framework.criteria.map((c) => {
      if (c.id !== critId) return c;
      let nextKis = [...c.indicators];
      if (isNew) {
        nextKis.push({ ...data, id: `ki-custom-${Date.now()}`, metrics: [] });
      } else {
        nextKis = nextKis.map((ki) => (ki.id === data.id ? { ...ki, ...data } : ki));
      }
      return { ...c, indicators: nextKis };
    });
    handleSaveFramework({ ...framework, criteria: nextCriteria });
    setEditingKi(null);
    showToast(isNew ? `Added KI ${data.code}` : `Updated KI ${data.code}`);
  };

  const handleDeleteKi = (critId: string, kiId: string, code: string) => {
    if (!window.confirm(`Delete Key Indicator ${code}?`)) return;
    const nextCriteria = framework.criteria.map((c) => {
      if (c.id !== critId) return c;
      return { ...c, indicators: c.indicators.filter((ki) => ki.id !== kiId) };
    });
    handleSaveFramework({ ...framework, criteria: nextCriteria });
    showToast(`Deleted KI ${code}`, 'info');
  };

  // Metric CRUD
  const handleSaveMetric = () => {
    if (!editingMetric) return;
    const { isNew, critId, kiId, data } = editingMetric;
    const nextCriteria = framework.criteria.map((c) => {
      if (c.id !== critId) return c;
      const nextKis = c.indicators.map((ki) => {
        if (ki.id !== kiId) return ki;
        let nextMetrics = [...ki.metrics];
        if (isNew) {
          nextMetrics.push({ ...data, id: `m-custom-${Date.now()}`, subMetrics: [] });
        } else {
          nextMetrics = nextMetrics.map((m) => (m.id === data.id ? { ...m, ...data } : m));
        }
        return { ...ki, metrics: nextMetrics };
      });
      return { ...c, indicators: nextKis };
    });
    handleSaveFramework({ ...framework, criteria: nextCriteria });
    setEditingMetric(null);
    showToast(isNew ? `Added Metric ${data.code}` : `Updated Metric ${data.code}`);
  };

  const handleDeleteMetric = (critId: string, kiId: string, metricId: string, code: string) => {
    if (!window.confirm(`Delete Metric ${code}?`)) return;
    const nextCriteria = framework.criteria.map((c) => {
      if (c.id !== critId) return c;
      const nextKis = c.indicators.map((ki) => {
        if (ki.id !== kiId) return ki;
        return { ...ki, metrics: ki.metrics.filter((m) => m.id !== metricId) };
      });
      return { ...c, indicators: nextKis };
    });
    handleSaveFramework({ ...framework, criteria: nextCriteria });
    showToast(`Deleted Metric ${code}`, 'info');
  };

  // Sub-Metric CRUD
  const handleSaveSubMetric = () => {
    if (!editingSubMetric) return;
    const { isNew, critId, kiId, metricId, data } = editingSubMetric;
    const nextCriteria = framework.criteria.map((c) => {
      if (c.id !== critId) return c;
      const nextKis = c.indicators.map((ki) => {
        if (ki.id !== kiId) return ki;
        const nextMetrics = ki.metrics.map((m) => {
          if (m.id !== metricId) return m;
          let nextSub = [...(m.subMetrics || [])];
          if (isNew) {
            nextSub.push({ ...data, id: `sm-custom-${Date.now()}` });
          } else {
            nextSub = nextSub.map((sm) => (sm.id === data.id ? { ...sm, ...data } : sm));
          }
          return { ...m, subMetrics: nextSub };
        });
        return { ...ki, metrics: nextMetrics };
      });
      return { ...c, indicators: nextKis };
    });
    handleSaveFramework({ ...framework, criteria: nextCriteria });
    setEditingSubMetric(null);
    showToast(isNew ? `Added Deliverable ${data.code}` : `Updated Deliverable ${data.code}`);
  };

  const handleDeleteSubMetric = (critId: string, kiId: string, metricId: string, subId: string) => {
    const nextCriteria = framework.criteria.map((c) => {
      if (c.id !== critId) return c;
      const nextKis = c.indicators.map((ki) => {
        if (ki.id !== kiId) return ki;
        const nextMetrics = ki.metrics.map((m) => {
          if (m.id !== metricId) return m;
          return { ...m, subMetrics: (m.subMetrics || []).filter((sm) => sm.id !== subId) };
        });
        return { ...ki, metrics: nextMetrics };
      });
      return { ...c, indicators: nextKis };
    });
    handleSaveFramework({ ...framework, criteria: nextCriteria });
    showToast('Deleted Deliverable', 'info');
  };

  // Reset Defaults for active track & regime
  const handleResetToDefault = () => {
    const clean = resetTrackRegimeFramework(selectedTrack, selectedRegime);
    setFramework(clean);
    setSelectedCritId(clean.criteria[0]?.id || '');
    setResetConfirmOpen(false);
    showToast(`Reset ${clean.name} to official NAAC guidelines!`);
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = exportFrameworkToJson(framework);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naac_master_${selectedTrack}_${selectedRegime}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Framework JSON');
  };

  // Import JSON
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed || !Array.isArray(parsed.criteria)) {
          throw new Error('Invalid framework JSON: missing criteria array');
        }
        handleSaveFramework(parsed);
        setSelectedCritId(parsed.criteria[0]?.id || '');
        showToast('Imported custom framework!');
      } catch (err: any) {
        showToast(`Failed to import JSON: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Icon helper for college tracks
  const getTrackIcon = (iconName: string, isSelected: boolean) => {
    const cls = `w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-600'}`;
    switch (iconName) {
      case 'Building2':
        return <Building2 className={cls} />;
      case 'GraduationCap':
        return <GraduationCap className={cls} />;
      case 'Stethoscope':
        return <Stethoscope className={cls} />;
      case 'Landmark':
        return <Landmark className={cls} />;
      default:
        return <FolderTree className={cls} />;
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in pb-16 text-slate-800">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold animate-in fade-in slide-in-from-bottom-2 ${
            toastMsg.type === 'error'
              ? 'bg-rose-600 text-white'
              : toastMsg.type === 'info'
              ? 'bg-blue-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Breadcrumb matching overall CMS NAAC pages */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
        <Home className="w-3.5 h-3.5 text-gray-500" />
        <span>/</span>
        <span
          onClick={onNavigateToQuickDrop}
          className="hover:text-blue-600 cursor-pointer"
        >
          NAAC
        </span>
        <span>/</span>
        <span className="text-gray-900 font-bold">Key Indicator Framework Master</span>
      </div>

      {/* Standard CMS Page Heading Bar with Quick Back and Global Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
            Key Indicator Framework Master
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure official criteria, key indicators, metric weights &amp; evidence checklists by college track &amp; regime.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onNavigateToQuickDrop && (
            <button
              type="button"
              onClick={onNavigateToQuickDrop}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs sm:text-sm font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5"
            >
              &larr; Back to Quick Drop
            </button>
          )}

          {/* JSON Export / Import / Reset */}
          <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleExportJson}
              className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
              title="Export Current Framework JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
              title="Import Framework JSON"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer transition-colors"
              title="Reset Track Framework to NAAC Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* LEVEL 1: DIFFERENT TYPES OF COLLEGES (Clean Cards Spread Out) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
            Step 1: Select Institution Track / College Type
          </span>
          <span className="text-[11px] font-medium text-gray-400">
            One trust/management can configure multiple college tracks independently
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COLLEGE_TRACKS.map((track) => {
            const isSelected = track.id === selectedTrack;
            return (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-[#0f2748] ring-2 ring-blue-100 shadow-sm'
                    : 'bg-white border-gray-200/90 hover:border-gray-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#0f2748] text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {getTrackIcon(track.iconName, isSelected)}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-blue-100 text-blue-900 font-extrabold' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {track.badge}
                  </span>
                </div>

                <h3 className={`text-xs font-black line-clamp-1 ${isSelected ? 'text-[#0f2748]' : 'text-gray-900'}`}>
                  {track.name}
                </h3>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                  {track.description}
                </p>

                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                  <span className="text-gray-400 font-medium truncate">{track.examples}</span>
                  {isSelected && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#0f2748] text-white shrink-0">
                      Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LEVEL 2: ACCREDITATION REGIME (Binary vs RAF Toggle) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setSelectedRegime('raf_7')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              selectedRegime === 'raf_7'
                ? 'bg-white text-[#0f2748] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 7 Criteria RAF (Traditional Graded)
          </button>
          <button
            type="button"
            onClick={() => setSelectedRegime('binary_10')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              selectedRegime === 'binary_10'
                ? 'bg-white text-[#0f2748] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⭐ 10 Attributes Binary (2024+ Reform)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="font-extrabold text-gray-900">{framework.name}</span>
          <span className="text-gray-300">•</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            {totalWeightage} / 1000 Pts
          </span>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
            {framework.criteria.length} {selectedRegime === 'raf_7' ? 'Criteria' : 'Attributes'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            {framework.criteria.reduce((sum, c) => sum + c.indicators.length, 0)} Key Indicators
          </span>
        </div>
      </div>

      {/* TWO-COLUMN MASTER-DETAIL LAYOUT */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ================================================================= */}
          {/* LEFT COLUMN: CRITERIA LIST (Master Selector - 4/12 cols)          */}
          {/* ================================================================= */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Criteria / Attributes ({framework.criteria.length})
                </h2>
                <span className="text-[11px] font-bold text-slate-400">
                  Total: {totalWeightage} / 1000 Pts
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingCriterion({
                    isNew: true,
                    data: {
                      id: '',
                      code: `Criterion ${framework.criteria.length + 1}`,
                      name: '',
                      weightage: 100,
                      indicators: [],
                    },
                  })
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                title="Add new Criterion"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List of Criteria Cards */}
            <div className="space-y-2">
              {framework.criteria.map((criterion, idx) => {
                const isSelected = criterion.id === selectedCritId;
                const kiCount = criterion.indicators.length;
                const metricCount = criterion.indicators.reduce((acc, ki) => acc + ki.metrics.length, 0);

                return (
                  <div
                    key={criterion.id}
                    onClick={() => setSelectedCritId(criterion.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-100 shadow-xs'
                        : 'border-slate-200/90 bg-white hover:border-blue-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${
                          isSelected ? 'bg-[#0f2748] text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {criterion.code}
                      </span>
                      <span className="text-xs font-black text-blue-900">
                        {criterion.weightage} Pts
                      </span>
                    </div>

                    <h3
                      className={`text-xs font-extrabold line-clamp-1 ${
                        isSelected ? 'text-[#0f2748]' : 'text-slate-800'
                      }`}
                    >
                      {criterion.name}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100/80">
                      <span>{kiCount} Indicators • {metricCount} Metrics</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: CRITERION DETAILS & METRICS (Detail View - 8/12)     */}
          {/* ================================================================= */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200/90 shadow-2xs p-5 text-left">
            {!activeCriterion ? (
              <div className="py-12 text-center text-slate-400">
                <FolderTree className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-600">Select a Criterion on the left</p>
                <p className="text-xs text-slate-400 mt-0.5">Click any criterion card to inspect and edit its metrics.</p>
              </div>
            ) : (
              <div>
                {/* ACTIVE CRITERION HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-[#0f2748] text-white tracking-wide">
                        {activeCriterion.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-900 border border-blue-200">
                        {activeCriterion.weightage} Pts Total
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      {activeCriterion.name}
                    </h2>
                    {activeCriterion.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {activeCriterion.description}
                      </p>
                    )}
                  </div>

                  {/* Criterion Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingKi({
                          isNew: true,
                          critId: activeCriterion.id,
                          data: {
                            id: '',
                            code: `${activeCriterion.code.replace(/[^0-9]/g, '') || '1'}.${activeCriterion.indicators.length + 1}`,
                            name: '',
                            weightage: 20,
                            metrics: [],
                          },
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0f2748] hover:bg-blue-900 transition-colors shadow-2xs cursor-pointer"
                      title="Add Key Indicator"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Key Indicator</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingCriterion({ isNew: false, data: activeCriterion })}
                      className="p-1.5 text-slate-500 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 rounded-lg cursor-pointer"
                      title="Edit Criterion Title & Weightage"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {framework.criteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCriterion(activeCriterion.id, activeCriterion.code)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete Criterion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* KEY INDICATORS & METRICS LIST */}
                <div className="space-y-4">
                  {activeCriterion.indicators.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                      <span>No Key Indicators added to {activeCriterion.code} yet.</span>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingKi({
                              isNew: true,
                              critId: activeCriterion.id,
                              data: {
                                id: '',
                                code: `${activeCriterion.code.replace(/[^0-9]/g, '') || '1'}.1`,
                                name: '',
                                weightage: 20,
                                metrics: [],
                              },
                            })
                          }
                          className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Key Indicator 1.1</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    activeCriterion.indicators.map((ki) => {
                      const isKiExpanded = expandedKis[ki.id] ?? true;

                      return (
                        <div
                          key={ki.id}
                          className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
                        >
                          {/* KI HEADER */}
                          <div
                            onClick={() => toggleKiExpand(ki.id)}
                            className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 cursor-pointer select-none transition-colors border-b border-slate-200/70"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="text-slate-500">
                                {isKiExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-800 text-white font-mono">
                                KI {ki.code}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {ki.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800">
                                {ki.weightage} Pts
                              </span>

                              {/* Add Metric */}
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingMetric({
                                    isNew: true,
                                    critId: activeCriterion.id,
                                    kiId: ki.id,
                                    data: {
                                      id: '',
                                      code: `${ki.code}.${ki.metrics.length + 1}`,
                                      name: '',
                                      metricType: 'QnM',
                                      weightage: 10,
                                      subMetrics: [],
                                    },
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-blue-700 hover:bg-blue-100 bg-white border border-slate-300 transition-colors"
                                title="Add Metric under this KI"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Metric</span>
                              </button>

                              {/* Edit KI */}
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingKi({
                                    isNew: false,
                                    critId: activeCriterion.id,
                                    data: ki,
                                  })
                                }
                                className="p-1 text-slate-500 hover:text-amber-700 rounded hover:bg-slate-200"
                                title="Edit Key Indicator"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>

                              {/* Delete KI */}
                              <button
                                type="button"
                                onClick={() => handleDeleteKi(activeCriterion.id, ki.id, ki.code)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200"
                                title="Delete Key Indicator"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* METRICS INSIDE KI */}
                          {isKiExpanded && (
                            <div className="p-3 divide-y divide-slate-100 space-y-3 bg-white">
                              {ki.metrics.length === 0 ? (
                                <div className="py-3 text-center text-xs text-slate-400">
                                  No metrics added yet. Click &quot;Add Metric&quot; to configure metrics under KI {ki.code}.
                                </div>
                              ) : (
                                ki.metrics.map((metric) => (
                                  <div key={metric.id} className="pt-3 first:pt-0">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        {/* Metric Code, Type, Weightage */}
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                          <span className="font-mono text-xs font-black text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                            Metric {metric.code}
                                          </span>
                                          <span
                                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                              metric.metricType === 'QnM'
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                                            }`}
                                          >
                                            {metric.metricType === 'QnM' ? 'QnM • Quantitative' : 'QlM • Qualitative'}
                                          </span>
                                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                            {metric.weightage} Pts
                                          </span>
                                        </div>

                                        {/* Metric Official Question Text */}
                                        <p className="text-xs sm:text-[13px] font-semibold text-slate-900 leading-snug">
                                          {metric.name}
                                        </p>

                                        {metric.description && (
                                          <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">
                                            {metric.description}
                                          </p>
                                        )}
                                      </div>

                                      {/* Metric Actions */}
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {/* Add Deliverable */}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingSubMetric({
                                              isNew: true,
                                              critId: activeCriterion.id,
                                              kiId: ki.id,
                                              metricId: metric.id,
                                              data: {
                                                id: '',
                                                code: `${metric.code}.${String.fromCharCode(65 + (metric.subMetrics?.length || 0))}`,
                                                name: '',
                                                isMandatory: true,
                                                evidenceTypes: ['pdf'],
                                              },
                                            })
                                          }
                                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                                          title="Add Evidence Deliverable"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>Add Deliverable</span>
                                        </button>

                                        {/* Edit Metric */}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingMetric({
                                              isNew: false,
                                              critId: activeCriterion.id,
                                              kiId: ki.id,
                                              data: metric,
                                            })
                                          }
                                          className="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-100"
                                          title="Edit Metric"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>

                                        {/* Delete Metric */}
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteMetric(activeCriterion.id, ki.id, metric.id, metric.code)}
                                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                                          title="Delete Metric"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* LEVEL 4 EVIDENCE DELIVERABLES (Checklist items) */}
                                    {metric.subMetrics && metric.subMetrics.length > 0 && (
                                      <div className="mt-2.5 pl-3 border-l-2 border-blue-200 space-y-1.5 bg-slate-50/70 p-2.5 rounded-r-lg">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                                          Evidence Deliverables &amp; Proof Checklist ({metric.subMetrics.length}):
                                        </span>
                                        {metric.subMetrics.map((sm) => (
                                          <div
                                            key={sm.id}
                                            className="flex items-center justify-between gap-2 text-xs text-slate-700 bg-white px-2.5 py-1.5 rounded border border-slate-200/80 shadow-2xs"
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                              <span className="font-mono font-bold text-blue-950 shrink-0">
                                                {sm.code}
                                              </span>
                                              <span className="font-medium truncate">{sm.name}</span>
                                              {sm.isMandatory && (
                                                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-bold border border-amber-200 shrink-0">
                                                  Mandatory
                                                </span>
                                              )}
                                              {sm.evidenceTypes && (
                                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded uppercase shrink-0">
                                                  {sm.evidenceTypes.join(', ')}
                                                </span>
                                              )}
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setEditingSubMetric({
                                                    isNew: false,
                                                    critId: activeCriterion.id,
                                                    kiId: ki.id,
                                                    metricId: metric.id,
                                                    data: sm,
                                                  })
                                                }
                                                className="p-0.5 text-slate-400 hover:text-amber-600"
                                                title="Edit Deliverable"
                                              >
                                                <Edit2 className="w-3 h-3" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteSubMetric(activeCriterion.id, ki.id, metric.id, sm.id)}
                                                className="p-0.5 text-slate-400 hover:text-rose-600"
                                                title="Delete Deliverable"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT / ADD CRITERION */}
      {/* ========================================================================= */}
      {editingCriterion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-left border border-slate-200">
            <h3 className="text-base font-black text-[#0f2748] mb-1">
              {editingCriterion.isNew ? 'Add New Criterion / Attribute' : `Edit ${editingCriterion.data.code}`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Level 1 Section Master for NAAC accreditation evaluation.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Criterion Code</label>
                <input
                  type="text"
                  value={editingCriterion.data.code}
                  onChange={(e) =>
                    setEditingCriterion({
                      ...editingCriterion,
                      data: { ...editingCriterion.data, code: e.target.value },
                    })
                  }
                  placeholder="e.g. Criterion 1 or Attribute 1"
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Criterion Title</label>
                <input
                  type="text"
                  value={editingCriterion.data.name}
                  onChange={(e) =>
                    setEditingCriterion({
                      ...editingCriterion,
                      data: { ...editingCriterion.data, name: e.target.value },
                    })
                  }
                  placeholder="e.g. Curricular Aspects"
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Weightage (Points)</label>
                <input
                  type="number"
                  value={editingCriterion.data.weightage}
                  onChange={(e) =>
                    setEditingCriterion({
                      ...editingCriterion,
                      data: { ...editingCriterion.data, weightage: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={editingCriterion.data.description || ''}
                  onChange={(e) =>
                    setEditingCriterion({
                      ...editingCriterion,
                      data: { ...editingCriterion.data, description: e.target.value },
                    })
                  }
                  placeholder="Scope or guidance for this criterion..."
                  className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingCriterion(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCriterion}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0f2748] hover:bg-blue-900 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Criterion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT / ADD KEY INDICATOR (KI) */}
      {/* ========================================================================= */}
      {editingKi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-left border border-slate-200">
            <h3 className="text-base font-black text-[#0f2748] mb-1">
              {editingKi.isNew ? 'Add Key Indicator' : `Edit KI ${editingKi.data.code}`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Level 2 Sub-Section grouping related metrics.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">KI Code</label>
                <input
                  type="text"
                  value={editingKi.data.code}
                  onChange={(e) =>
                    setEditingKi({
                      ...editingKi,
                      data: { ...editingKi.data, code: e.target.value },
                    })
                  }
                  placeholder="e.g. 1.1 or A1.1"
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Indicator Title</label>
                <input
                  type="text"
                  value={editingKi.data.name}
                  onChange={(e) =>
                    setEditingKi({
                      ...editingKi,
                      data: { ...editingKi.data, name: e.target.value },
                    })
                  }
                  placeholder="e.g. Curricular Planning and Implementation"
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">KI Weightage (Points)</label>
                <input
                  type="number"
                  value={editingKi.data.weightage}
                  onChange={(e) =>
                    setEditingKi({
                      ...editingKi,
                      data: { ...editingKi.data, weightage: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingKi(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveKi}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0f2748] hover:bg-blue-900 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Key Indicator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT / ADD METRIC */}
      {/* ========================================================================= */}
      {editingMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-left border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-[#0f2748] mb-1">
              {editingMetric.isNew ? 'Add Metric' : `Edit Metric ${editingMetric.data.code}`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Level 3 Compliance Metric (QnM Quantitative vs QlM Qualitative).
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Metric Code</label>
                  <input
                    type="text"
                    value={editingMetric.data.code}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        data: { ...editingMetric.data, code: e.target.value },
                      })
                    }
                    placeholder="e.g. 1.1.1"
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Metric Nature</label>
                  <select
                    value={editingMetric.data.metricType}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        data: { ...editingMetric.data, metricType: e.target.value as 'QnM' | 'QlM' },
                      })
                    }
                    className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
                  >
                    <option value="QnM">QnM (Quantitative • Numbers)</option>
                    <option value="QlM">QlM (Qualitative • Narrative)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Metric Official Question Text</label>
                <textarea
                  rows={3}
                  value={editingMetric.data.name}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      data: { ...editingMetric.data, name: e.target.value },
                    })
                  }
                  placeholder="Official question text as given in the NAAC manual..."
                  className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Weightage (Points)</label>
                <input
                  type="number"
                  value={editingMetric.data.weightage}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      data: { ...editingMetric.data, weightage: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Evaluation Guidance (Optional)</label>
                <textarea
                  rows={2}
                  value={editingMetric.data.description || ''}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      data: { ...editingMetric.data, description: e.target.value },
                    })
                  }
                  placeholder="Instructions for DVV verification, required data templates..."
                  className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingMetric(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMetric}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0f2748] hover:bg-blue-900 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Metric
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT / ADD SUB-METRIC DELIVERABLE */}
      {/* ========================================================================= */}
      {editingSubMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-left border border-slate-200">
            <h3 className="text-base font-black text-[#0f2748] mb-1">
              {editingSubMetric.isNew ? 'Add Evidence Deliverable' : `Edit Deliverable ${editingSubMetric.data.code}`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Level 4 Proof Document required for DVV audit compliance.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deliverable Code</label>
                <input
                  type="text"
                  value={editingSubMetric.data.code}
                  onChange={(e) =>
                    setEditingSubMetric({
                      ...editingSubMetric,
                      data: { ...editingSubMetric.data, code: e.target.value },
                    })
                  }
                  placeholder="e.g. 1.1.1.A"
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title / Deliverable</label>
                <input
                  type="text"
                  value={editingSubMetric.data.name}
                  onChange={(e) =>
                    setEditingSubMetric({
                      ...editingSubMetric,
                      data: { ...editingSubMetric.data, name: e.target.value },
                    })
                  }
                  placeholder="e.g. BoS Minutes signed by Principal"
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sub-mandatory"
                  checked={editingSubMetric.data.isMandatory}
                  onChange={(e) =>
                    setEditingSubMetric({
                      ...editingSubMetric,
                      data: { ...editingSubMetric.data, isMandatory: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0f2748]"
                />
                <label htmlFor="sub-mandatory" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Mandatory for DVV Clearance (Star item)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSubMetric(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSubMetric}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0f2748] hover:bg-blue-900 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Deliverable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET CONFIRMATION */}
      {/* ========================================================================= */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-left border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <HelpCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black text-slate-900">
                Reset to Official NAAC Defaults?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              This will discard any custom metrics or weightage adjustments made in this browser for <span className="font-bold text-slate-800">{framework.name}</span> and restore the official NAAC template guidelines.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Yes, Reset Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default NaacFrameworkMaster;
