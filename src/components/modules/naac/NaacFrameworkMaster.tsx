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

  // Active Criterion for Column 1 Drilldown
  const [selectedCritId, setSelectedCritId] = useState<string>(() => {
    return framework.criteria[0]?.id || '';
  });

  // Active Key Indicator for Column 2 Drilldown
  const [selectedKiId, setSelectedKiId] = useState<string>(() => {
    return framework.criteria[0]?.indicators[0]?.id || '';
  });

  // Track expanded state for metrics (default: all collapsed)
  const [expandedMetricIds, setExpandedMetricIds] = useState<Record<string, boolean>>({});

  const toggleMetricExpanded = (metricId: string) => {
    setExpandedMetricIds((prev) => ({
      ...prev,
      [metricId]: !prev[metricId],
    }));
  };

  // Sync framework on track or regime change
  useEffect(() => {
    const loaded = getTrackRegimeFramework(selectedTrack, selectedRegime);
    setFramework(loaded);
    const firstCrit = loaded.criteria[0];
    if (firstCrit) {
      setSelectedCritId(firstCrit.id);
      setSelectedKiId(firstCrit.indicators[0]?.id || '');
    } else {
      setSelectedCritId('');
      setSelectedKiId('');
    }
  }, [selectedTrack, selectedRegime]);

  // College Track Selector Dropdown state
  const [isTrackDropdownOpen, setIsTrackDropdownOpen] = useState(false);
  const trackDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trackDropdownRef.current && !trackDropdownRef.current.contains(e.target as Node)) {
        setIsTrackDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toast State
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
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
      setSelectedKiId('');
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
      const firstCrit = nextCriteria[0];
      setSelectedCritId(firstCrit?.id || '');
      setSelectedKiId(firstCrit?.indicators[0]?.id || '');
    }
    showToast(`Deleted ${code}`, 'info');
  };

  // KI CRUD
  const handleSaveKi = () => {
    if (!editingKi) return;
    const { isNew, critId, data } = editingKi;
    let createdKiId = data.id;
    const nextCriteria = framework.criteria.map((c) => {
      if (c.id !== critId) return c;
      let nextKis = [...c.indicators];
      if (isNew) {
        createdKiId = `ki-custom-${Date.now()}`;
        nextKis.push({ ...data, id: createdKiId, metrics: [] });
      } else {
        nextKis = nextKis.map((ki) => (ki.id === data.id ? { ...ki, ...data } : ki));
      }
      return { ...c, indicators: nextKis };
    });
    handleSaveFramework({ ...framework, criteria: nextCriteria });
    setSelectedKiId(createdKiId);
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
    if (selectedKiId === kiId) {
      const firstAvailable = nextCriteria.find((c) => c.indicators.length > 0)?.indicators[0]?.id || '';
      setSelectedKiId(firstAvailable);
    }
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
    showToast(isNew ? `Added Sub-Metric ${data.code}` : `Updated Sub-Metric ${data.code}`);
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
    showToast('Deleted Sub-Metric', 'info');
  };

  // Reset Defaults for active track & regime
  const handleResetToDefault = () => {
    const clean = resetTrackRegimeFramework(selectedTrack, selectedRegime);
    setFramework(clean);
    setSelectedCritId(clean.criteria[0]?.id || '');
    setSelectedKiId(clean.criteria[0]?.indicators[0]?.id || '');
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
        setSelectedKiId(parsed.criteria[0]?.indicators[0]?.id || '');
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

  const currentTrack = COLLEGE_TRACKS.find((t) => t.id === selectedTrack) || COLLEGE_TRACKS[0];

  // Active Criterion for Column 1 Drilldown
  const activeCriterion: NaacCriterionMaster | null =
    framework.criteria.find((c) => c.id === selectedCritId) || framework.criteria[0] || null;

  // Active Key Indicator under the active Criterion
  let activeKi: NaacKeyIndicatorMaster | null = null;
  if (activeCriterion) {
    activeKi =
      activeCriterion.indicators.find((ki) => ki.id === selectedKiId) ||
      activeCriterion.indicators[0] ||
      null;
  }
  const activeKiParentCriterion = activeCriterion;

  const handleSelectCriterion = (crit: NaacCriterionMaster) => {
    setSelectedCritId(crit.id);
    if (crit.indicators.length > 0) {
      setSelectedKiId(crit.indicators[0].id);
    } else {
      setSelectedKiId('');
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

      {/* ========================================================================= */}
      {/* TOP CONFIGURATION BAR: Track Dropdown + Regime Tabs + Live Summary Stats  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. College Track Selector Dropdown */}
          <div className="relative" ref={trackDropdownRef}>
            <button
              type="button"
              onClick={() => setIsTrackDropdownOpen(!isTrackDropdownOpen)}
              className="inline-flex items-center gap-2.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 transition-colors cursor-pointer shadow-2xs"
            >
              <div className="p-1 rounded-md bg-blue-600 text-white shrink-0">
                {getTrackIcon(currentTrack.iconName, true)}
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-gray-400 font-medium leading-none">College Track</span>
                <span className="text-xs font-bold text-gray-900 leading-tight">{currentTrack.name}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ml-1 ${isTrackDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTrackDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in">
                <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                  Select College Type
                </div>
                {COLLEGE_TRACKS.map((t) => {
                  const isCur = t.id === selectedTrack;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTrack(t.id);
                        setIsTrackDropdownOpen(false);
                      }}
                      className={`w-full p-2 rounded-lg text-left transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        isCur ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-gray-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1.5 rounded-md shrink-0 ${isCur ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {getTrackIcon(t.iconName, isCur)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs truncate">{t.name}</div>
                          <div className="text-[10px] text-gray-400 font-normal truncate">{t.badge}</div>
                        </div>
                      </div>
                      {isCur && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Accreditation Regime Switch (Tabs) */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => setSelectedRegime('raf_7')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedRegime === 'raf_7'
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200/60'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>📊 7 Criteria (RAF)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedRegime === 'raf_7' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200 text-slate-600'
              }`}>
                1000 Pts
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRegime('binary_10')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedRegime === 'binary_10'
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200/60'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>⭐ 10 Attributes (Binary)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedRegime === 'binary_10' ? 'bg-amber-50 text-amber-700' : 'bg-slate-200 text-slate-600'
              }`}>
                2024+
              </span>
            </button>
          </div>
        </div>

        {/* 3. Live Stats Tally */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg font-bold">
            <span>Total:</span>
            <span className="font-extrabold text-blue-900">{totalWeightage} Pts</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg font-medium">
            <span className="font-bold text-gray-900">{framework.criteria.length}</span>
            <span>{selectedRegime === 'binary_10' ? 'Attributes' : 'Criteria'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg font-medium">
            <span className="font-bold text-gray-900">
              {framework.criteria.reduce((sum, c) => sum + c.indicators.length, 0)}
            </span>
            <span>Key Indicators</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THREE-COLUMN WORKSPACE: 1) CRITERIA ➔ 2) KEY INDICATORS ➔ 3) METRICS      */}
      {/* Connected by Active Visual Pointer Triangles (▶)                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-start">
        {/* ========================================================================= */}
        {/* COLUMN 1 (3 Cols): CRITERIA / ATTRIBUTES LIST                             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-2.5">
          {/* Column Header & Actions */}
          <div className="flex items-center justify-between pb-1 min-h-[40px]">
            <div className="min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900">
                  1. {selectedRegime === 'binary_10' ? 'Attributes' : 'Criteria'}
                </h3>
                <span className="px-1.5 py-0.2 rounded font-extrabold text-[10px] bg-blue-50 text-blue-800 border border-blue-200">
                  {totalWeightage} Pts
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium truncate">
                {framework.criteria.length} Level-1 sections
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingCriterion({
                  isNew: true,
                  data: {
                    id: '',
                    code: selectedRegime === 'binary_10' ? `Attribute ${framework.criteria.length + 1}` : `Criterion ${framework.criteria.length + 1}`,
                    name: '',
                    weightage: 100,
                    indicators: [],
                  },
                })
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Criteria Cards */}
          <div className="space-y-2">
            {framework.criteria.map((criterion) => {
              const isCritSelected = criterion.id === activeCriterion?.id;

              return (
                <div
                  key={criterion.id}
                  onClick={() => handleSelectCriterion(criterion)}
                  className={`relative rounded-xl border transition-all cursor-pointer select-none p-3 ${
                    isCritSelected
                      ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-400/50 text-blue-950 z-10'
                      : 'bg-white hover:bg-slate-50 border-gray-200/90 hover:border-gray-300 text-gray-800'
                  }`}
                >
                  {/* Connecting Pointer Triangle pointing to Column 2 */}
                  {isCritSelected && (
                    <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-l-[10px] border-l-blue-500 z-20 drop-shadow-xs" />
                  )}

                  {/* Header Row: Code badge + Points + Actions */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        isCritSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/70'
                      }`}
                    >
                      {criterion.code}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <span className="px-1.5 py-0.2 rounded bg-blue-100/70 text-blue-900 border border-blue-200 font-extrabold text-[10px]">
                        {criterion.weightage} Pts
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCriterion({ isNew: false, data: criterion });
                        }}
                        className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer transition-colors"
                        title={`Edit ${criterion.code}`}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {framework.criteria.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCriterion(criterion.id, criterion.code);
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                          title={`Delete ${criterion.code}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title (Wraps naturally, full width) */}
                  <h4 className="text-xs font-bold leading-snug break-words mt-1.5">
                    {criterion.name}
                  </h4>

                  {/* Meta Bar */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-1.5 border-t border-gray-100/80">
                    <span>
                      {criterion.indicators.length} {criterion.indicators.length === 1 ? 'Key Indicator' : 'Key Indicators'}
                    </span>
                    <span>
                      {criterion.indicators.reduce((sum, k) => sum + (k.weightage || 0), 0)} Pts Total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2 (3 Cols - Same Width as Col 1): KEY INDICATORS FOR ACTIVE CRIT   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-2.5">
          {/* Column Header & Actions - Matches Col 1 exact height for perfect alignment */}
          <div className="flex items-center justify-between pb-1 min-h-[40px]">
            <div className="min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900">
                  2. Key Indicators
                </h3>
                {activeCriterion && (
                  <span className="px-1.5 py-0.2 rounded font-extrabold text-[10px] bg-blue-50 text-blue-800 border border-blue-200">
                    {activeCriterion.indicators.reduce((sum, k) => sum + (k.weightage || 0), 0)} / {activeCriterion.weightage} Pts
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 font-medium truncate">
                Under {activeCriterion?.code} ({activeCriterion?.indicators.length || 0} Indicators)
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!activeCriterion) return;
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
                });
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add KI</span>
            </button>
          </div>

          {/* Key Indicators List - Cards start at the EXACT SAME horizontal level as Col 1 */}
          <div className="space-y-2">
            {!activeCriterion || activeCriterion.indicators.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 text-center text-xs text-gray-400 space-y-2">
                <p>No Key Indicators under {activeCriterion?.code} yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (!activeCriterion) return;
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
                    });
                  }}
                  className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Key Indicator</span>
                </button>
              </div>
            ) : (
              activeCriterion.indicators.map((ki) => {
                const isKiSelected = ki.id === activeKi?.id;

                return (
                  <div
                    key={ki.id}
                    onClick={() => setSelectedKiId(ki.id)}
                    className={`relative rounded-xl border transition-all cursor-pointer select-none p-3 ${
                      isKiSelected
                        ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-400/50 text-blue-950 z-10'
                        : 'bg-white hover:bg-slate-50 border-gray-200/90 hover:border-gray-300 text-gray-800'
                    }`}
                  >
                    {/* Connecting Pointer Triangle pointing to Column 3 */}
                    {isKiSelected && (
                      <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-l-[10px] border-l-blue-500 z-20 drop-shadow-xs" />
                    )}

                    {/* Top line: KI Code + Weightage + Actions */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                          isKiSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        KI {ki.code}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-blue-100/70 text-blue-900 border border-blue-200">
                          {ki.weightage} Pts
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingKi({ isNew: false, critId: activeCriterion.id, data: ki });
                          }}
                          className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer transition-colors"
                          title="Edit Key Indicator"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteKi(activeCriterion.id, ki.id, ki.code);
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                          title="Delete Key Indicator"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Title (Unclipped, wraps naturally) */}
                    <h4 className="text-xs font-bold leading-snug break-words mt-1.5">
                      {ki.name}
                    </h4>

                    {/* Bottom Meta */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-1.5 border-t border-gray-100/80">
                      <span>{ki.metrics?.length || 0} Metrics</span>
                      {((ki.metrics?.reduce((sum, m) => sum + (m.subMetrics?.length || 0), 0)) || 0) > 0 && (
                        <span className="font-medium text-slate-500">
                          {ki.metrics?.reduce((sum, m) => sum + (m.subMetrics?.length || 0), 0)} Sub-Metrics
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 3 (6 Cols): UNIFIED KEY INDICATOR & METRICS WORKSPACE               */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6">
          {activeKi ? (
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col">
              {/* Header: Key Indicator Title & Actions Banner */}
              <div className="bg-white border-b border-gray-200/80 p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                      <span>{activeCriterion?.code}</span>
                      <span>&rsaquo;</span>
                      <span className="font-bold">Key Indicator {activeKi.code}</span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white ml-1">
                        Active Selection
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 break-words leading-snug mt-1">
                      {activeKi.name}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!activeCriterion) return;
                      setEditingMetric({
                        isNew: true,
                        critId: activeCriterion.id,
                        kiId: activeKi.id,
                        data: {
                          id: '',
                          code: `${activeKi.code}.${(activeKi.metrics?.length || 0) + 1}`,
                          metricType: 'QnM',
                          weightage: 10,
                          name: '',
                          description: '',
                          subMetrics: [],
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs cursor-pointer transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Metric</span>
                  </button>
                </div>

                {/* KI Metadata Chips */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap text-xs">
                  <span className="px-2.5 py-0.5 rounded-md font-bold bg-slate-50 text-blue-900 border border-slate-200 shadow-2xs">
                    Weightage: {activeKi.weightage} Pts
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md font-medium bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs">
                    {activeKi.metrics?.length || 0} Metrics
                  </span>
                  {((activeKi.metrics?.reduce((sum, m) => sum + (m.subMetrics?.length || 0), 0)) || 0) > 0 && (
                    <span className="px-2.5 py-0.5 rounded-md font-medium bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs">
                      {activeKi.metrics?.reduce((sum, m) => sum + (m.subMetrics?.length || 0), 0)} Sub-Metrics
                    </span>
                  )}
                </div>
              </div>

              {/* Body: Nested Metrics inside this Key Indicator */}
              <div className="p-4 sm:p-5 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Metrics under {activeKi.code} ({activeKi.metrics?.length || 0})
                  </span>
                </div>

                {activeKi.metrics?.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center space-y-3">
                    <p className="text-sm font-semibold text-gray-600">
                      No metrics defined under Key Indicator {activeKi.code} yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!activeCriterion) return;
                        setEditingMetric({
                          isNew: true,
                          critId: activeCriterion.id,
                          kiId: activeKi.id,
                          data: {
                            id: '',
                            code: `${activeKi.code}.1`,
                            metricType: 'QnM',
                            weightage: 10,
                            name: '',
                            description: '',
                            subMetrics: [],
                          },
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Metric</span>
                    </button>
                  </div>
                ) : (
                  activeKi.metrics.map((metric) => {
                    const isExpanded = !!expandedMetricIds[metric.id];

                    return (
                      <div
                        key={metric.id}
                        className="bg-white rounded-xl border border-gray-200/90 shadow-2xs transition-all hover:border-gray-300 overflow-hidden"
                      >
                        {/* Metric Header Bar - Clickable to expand/collapse */}
                        <div
                          onClick={() => toggleMetricExpanded(metric.id)}
                          className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
                            <span className="p-0.5 text-gray-400 hover:text-gray-600 shrink-0">
                              <ChevronRight
                                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90 text-blue-600' : ''
                                }`}
                              />
                            </span>

                            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                              Metric {metric.code}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase shrink-0 ${
                                metric.metricType === 'QnM'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              {metric.metricType === 'QnM' ? 'QnM' : 'QlM'}
                            </span>

                            <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                              {metric.weightage} Pts
                            </span>

                            {/* One-line preview of question when collapsed */}
                            <span className="text-xs font-semibold text-gray-800 truncate ml-1 flex-1">
                              {metric.name || <span className="italic text-gray-400 font-normal">No question text configured</span>}
                            </span>
                          </div>

                          {/* Metric Actions */}
                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                if (!activeCriterion) return;
                                setEditingSubMetric({
                                  isNew: true,
                                  critId: activeCriterion.id,
                                  kiId: activeKi.id,
                                  metricId: metric.id,
                                  data: {
                                    id: '',
                                    code: `${metric.code}.${String.fromCharCode(65 + (metric.subMetrics?.length || 0))}`,
                                    name: '',
                                    isMandatory: false,
                                    evidenceTypes: [],
                                  },
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-md cursor-pointer transition-colors"
                              title="Add Sub-Metric (if metric has sub-parts)"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Sub-Metric</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!activeCriterion) return;
                                setEditingMetric({
                                  isNew: false,
                                  critId: activeCriterion.id,
                                  kiId: activeKi.id,
                                  data: metric,
                                });
                              }}
                              className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md cursor-pointer transition-colors"
                              title="Edit Metric"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!activeCriterion) return;
                                handleDeleteMetric(activeCriterion.id, activeKi.id, metric.id, metric.code);
                              }}
                              className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer transition-colors"
                              title="Delete Metric"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Section: Full Question Statement & Sub-Metrics */}
                        {isExpanded && (
                          <div className="p-4 pt-3.5 border-t border-gray-100 space-y-3 bg-white animate-in fade-in duration-150">
                            {/* Metric Name / Question Text */}
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-relaxed break-words">
                                {metric.name || (
                                  <span className="italic text-gray-400 font-normal">
                                    No question text configured yet. Click edit to set official NAAC description.
                                  </span>
                                )}
                              </h4>
                            </div>

                            {/* Sub-Metrics Section - Only displayed if sub-metrics exist */}
                            {metric.subMetrics && metric.subMetrics.length > 0 && (
                              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                    Sub-Metrics ({metric.subMetrics.length})
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  {metric.subMetrics.map((sub) => (
                                    <div
                                      key={sub.id}
                                      className="flex items-center justify-between gap-2 p-2 bg-slate-50/70 rounded-lg border border-slate-200/70"
                                    >
                                      {/* Code & Name without document icon */}
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className="font-mono font-bold text-xs text-blue-900 shrink-0">
                                          {sub.code}
                                        </span>
                                        <span className="text-xs text-gray-800 break-words flex-1">
                                          {sub.name}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!activeCriterion) return;
                                            setEditingSubMetric({
                                              isNew: false,
                                              critId: activeCriterion.id,
                                              kiId: activeKi.id,
                                              metricId: metric.id,
                                              data: sub,
                                            });
                                          }}
                                          className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer transition-colors"
                                          title="Edit Sub-Metric"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!activeCriterion) return;
                                            handleDeleteSubMetric(activeCriterion.id, activeKi.id, metric.id, sub.id);
                                          }}
                                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                                          title="Delete Sub-Metric"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500 space-y-2">
              <FolderTree className="w-8 h-8 text-gray-400 mx-auto" />
              <h4 className="text-sm font-bold text-gray-700">No Key Indicator Selected</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Please select a Key Indicator from the middle column to inspect and configure its metrics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT / ADD CRITERION */}
      {/* ========================================================================= */}
      {editingCriterion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-left border border-slate-200">
            <h3 className="text-base font-black text-gray-900 mb-1">
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
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
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
            <h3 className="text-base font-black text-gray-900 mb-1">
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
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
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
            <h3 className="text-base font-black text-gray-900 mb-1">
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
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Metric
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT / ADD SUB-METRIC */}
      {/* ========================================================================= */}
      {editingSubMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-left border border-slate-200">
            <h3 className="text-base font-black text-gray-900 mb-1">
              {editingSubMetric.isNew ? 'Add Sub-Metric' : `Edit Sub-Metric ${editingSubMetric.data.code}`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Level 4 question sub-division under Metric.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sub-Metric Code</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Sub-Metric Title / Question Statement</label>
                <input
                  type="text"
                  value={editingSubMetric.data.name}
                  onChange={(e) =>
                    setEditingSubMetric({
                      ...editingSubMetric,
                      data: { ...editingSubMetric.data, name: e.target.value },
                    })
                  }
                  placeholder="e.g. Approved Syllabus Copy & BoS Minutes"
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
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
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Sub-Metric
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
