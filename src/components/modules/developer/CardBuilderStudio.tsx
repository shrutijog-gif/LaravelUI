import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Save, 
  Check, 
  Sparkles, 
  Sliders, 
  Eye, 
  Edit3,
  Copy,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Upload,
  Image,
  Calendar,
  FileText,
  Award,
  Trophy,
  ShieldCheck,
  BookOpen,
  Globe,
  Layers,
  Search,
  User,
  Star,
  Briefcase,
  Heart,
  Download,
  Tag,
  Bookmark,
  Zap,
  Compass,
  Target,
  Clock,
  Bell,
  MapPin,
  Hash,
  Mail,
  Phone,
  Lock,
  Settings,
  X,
  ChevronsUpDown,
  Folder,
  File,
  Link,
  Share2,
  Printer,
  Info,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Cloud,
  Database,
  Server,
  Code,
  Terminal,
  Activity,
  BarChart2,
  PieChart,
  TrendingUp,
  Feather,
  PenTool,
  ExternalLink,
  GraduationCap,
  Flame,
  Shield,
  RotateCcw
} from 'lucide-react';
import { CardPresetView } from './CardPresetView';
import { 
  CardSlotConfig, 
  getStoredCardPresets, 
  saveCardPreset, 
  createNewCardPreset,
  deleteCardPreset,
  duplicateCardPreset,
  resetAllCardPresets,
  MODULE_SCHEMAS,
  ModuleSchema,
  INITIAL_CARD_PRESETS,
  DEFAULT_CARD_HTML_TEMPLATES,
  extractDynamicSlots
} from '../../../utils/cardPresets';
import { getStoredStudioTemplates } from '../../../data/mockStudioData';

const BASE_STYLE_OPTIONS = [
  {
    id: 'style-1',
    name: 'Official Standard',
    desc: 'Classic academic card with top badge, initials logo & action link.',
    icon: '🏛️',
  },
  {
    id: 'style-2',
    name: 'Minimal Modern',
    desc: 'Clean borders, top rounded year pill & direct inline link.',
    icon: '✨',
  },
  {
    id: 'style-3',
    name: 'Vibrant Gradient',
    desc: 'Gradient header banner with dark high-contrast action button.',
    icon: '🎨',
  },
  {
    id: 'style-4',
    name: 'Left Accent',
    desc: 'Thick color accent stripe with full-width typography & metadata bar.',
    icon: '⚡',
  },
];

export const CardBuilderStudio: React.FC = () => {
  const [presets, setPresets] = useState<CardSlotConfig[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<CardSlotConfig | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('timetable');
  const [activeDragField, setActiveDragField] = useState<string | null>(null);
  const [activeSlotName, setActiveSlotName] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newCustomVarName, setNewCustomVarName] = useState<string>('');
  const [userCustomVars, setUserCustomVars] = useState<{ name: string; label: string }[]>([]);
  const [viewMode, setViewMode] = useState<'blueprint' | 'sample'>('sample');
  const [isMappingMode, setIsMappingMode] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [showHtmlEditor, setShowHtmlEditor] = useState<boolean>(false);
  const [showTweakHtml, setShowTweakHtml] = useState<boolean>(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadPresets = () => {
    const list = getStoredCardPresets();
    const filtered = list.filter(p => p.id.startsWith('style-custom-'));
    setPresets(filtered);
  };

  useEffect(() => {
    loadPresets();
    const handleUpdate = () => loadPresets();
    window.addEventListener('card-presets-updated', handleUpdate);
    return () => window.removeEventListener('card-presets-updated', handleUpdate);
  }, []);

  const handleOpenNew = () => {
    setIsNewModalOpen(true);
  };

  const handleOpenNewWithModule = (moduleId: string) => {
    const newPreset = createNewCardPreset();
    const schema = allModuleSchemas.find(m => m.id === moduleId);
    newPreset.name = schema ? `${schema.name} Card Template` : 'New Card Template';
    newPreset.moduleContextId = moduleId;
    setEditingPreset(newPreset);
    setSelectedModuleId(moduleId);
    setViewMode('sample');
    setIsMappingMode(false);
    setWizardStep(1);
    setHtmlCode(DEFAULT_CARD_HTML_TEMPLATES['style-1'] || '');
    setIsNewModalOpen(false);
    setIsDrawerOpen(true);
  };

  const handleEdit = (preset: CardSlotConfig) => {
    setEditingPreset(JSON.parse(JSON.stringify(preset)));
    setSelectedModuleId(preset.moduleContextId || 'timetable');
    setViewMode('sample');
    setIsMappingMode(false);
    setWizardStep(1);
    setHtmlCode(preset.htmlTemplate || DEFAULT_CARD_HTML_TEMPLATES[preset.id] || DEFAULT_CARD_HTML_TEMPLATES['style-1'] || '');
    setIsDrawerOpen(true);
  };

  const handleDuplicate = (preset: CardSlotConfig) => {
    const dup = duplicateCardPreset(preset);
    loadPresets();
    setToastMessage(`Duplicated preset to "${dup.name}"`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteCardPreset(id);
      loadPresets();
      setToastMessage(`Deleted preset "${name}"`);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleResetStyles = () => {
    if (confirm('Are you sure you want to reset all card presets to their original defaults? All custom edits will be discarded.')) {
      resetAllCardPresets();
      loadPresets();
      setToastMessage('Reset all card styles to original defaults!');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const THEME_PALETTES: Record<string, { badgeBg: string; badgeText: string; mediaBg: string; mediaText: string }> = {
    '#2563eb': { badgeBg: '#eff6ff', badgeText: '#1d4ed8', mediaBg: '#2563eb', mediaText: '#ffffff' }, // University Blue
    '#059669': { badgeBg: '#ecfdf5', badgeText: '#047857', mediaBg: '#059669', mediaText: '#ffffff' }, // Emerald Green
    '#dc2626': { badgeBg: '#fef2f2', badgeText: '#b91c1c', mediaBg: '#dc2626', mediaText: '#ffffff' }, // Crimson Red
    '#7c3aed': { badgeBg: '#f5f3ff', badgeText: '#6d28d9', mediaBg: '#7c3aed', mediaText: '#ffffff' }, // Royal Purple
    '#d97706': { badgeBg: '#fffbeb', badgeText: '#b45309', mediaBg: '#d97706', mediaText: '#ffffff' }, // Amber Gold
  };

  const handleSelectThemeColor = (colorHex: string) => {
    if (!editingPreset) return;
    const hex = colorHex.toLowerCase();
    const palette = THEME_PALETTES[hex] || {
      badgeBg: `${colorHex}1a`,
      badgeText: colorHex,
      mediaBg: colorHex,
      mediaText: '#ffffff',
    };

    setEditingPreset({
      ...editingPreset,
      accentColor: colorHex,
      mediaSlot: {
        ...editingPreset.mediaSlot,
        bgColor: palette.mediaBg,
        iconColor: palette.mediaText,
      },
      badgeSlot: {
        ...editingPreset.badgeSlot,
        bgColor: palette.badgeBg,
        textColor: palette.badgeText,
      },
    });
  };

  const handleSaveDrawer = () => {
    if (editingPreset) {
      saveCardPreset({ ...editingPreset, htmlTemplate: htmlCode });
      loadPresets();
      setIsDrawerOpen(false);
      setEditingPreset(null);
      setToastMessage(`Saved preset "${editingPreset.name}" system-wide!`);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleUpdateEditing = (updates: Partial<CardSlotConfig>) => {
    if (editingPreset) {
      setEditingPreset({ ...editingPreset, ...updates });
    }
  };

  const handleDropToSlot = (slotName: string, fieldName: string) => {
    if (!editingPreset) return;
    let updates: Partial<CardSlotConfig> = {};
    if (slotName === 'badgeSlot') updates = { badgeSlot: { ...editingPreset.badgeSlot, fieldVar: fieldName, enabled: !!fieldName } };
    else if (slotName === 'mediaSlot') updates = { mediaSlot: { ...editingPreset.mediaSlot, fieldVar: fieldName, enabled: !!fieldName } };
    else if (slotName === 'titleSlot') updates = { titleSlot: { ...editingPreset.titleSlot, fieldVar: fieldName } };
    else if (slotName === 'subtitleSlot') updates = { subtitleSlot: { ...editingPreset.subtitleSlot, fieldVar: fieldName, enabled: !!fieldName } };
    else if (slotName === 'footerLeftSlot') updates = { footerLeftSlot: { ...editingPreset.footerLeftSlot, fieldVar: fieldName, enabled: !!fieldName } };
    else if (slotName === 'footerRightSlot') updates = { footerRightSlot: { ...editingPreset.footerRightSlot, fieldVar: fieldName, enabled: !!fieldName } };

    handleUpdateEditing(updates);
    setToastMessage(`Mapped {${fieldName}} to ${slotName}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectBaseStyle = (styleId: string) => {
    if (styleId === 'custom-html') {
      if (!editingPreset) return;
      const customHtml = htmlCode || editingPreset.htmlTemplate || DEFAULT_CARD_HTML_TEMPLATES['style-1'] || '';
      setHtmlCode(customHtml);
      setEditingPreset({
        ...editingPreset,
        presetStyleType: 'custom',
        isCustom: true,
        htmlTemplate: customHtml,
      });
      setShowHtmlEditor(true);
      return;
    }
    const base = INITIAL_CARD_PRESETS.find(p => p.id === styleId);
    if (!base || !editingPreset) return;
    const newHtml = DEFAULT_CARD_HTML_TEMPLATES[styleId] || '';
    setHtmlCode(newHtml);
    const currentBadgeVar = editingPreset.badgeSlot?.fieldVar || '';
    const currentMediaVar = editingPreset.mediaSlot?.fieldVar || '';
    const currentTitleVar = editingPreset.titleSlot?.fieldVar || '';
    const currentSubVar = editingPreset.subtitleSlot?.fieldVar || '';
    const currentFooterVar = editingPreset.footerRightSlot?.fieldVar || '';

    setEditingPreset({
      ...editingPreset,
      isCustom: false,
      presetStyleType: base.presetStyleType,
      showTopAccent: base.showTopAccent,
      accentPosition: base.accentPosition,
      accentSides: base.accentSides,
      accentWidth: base.accentWidth,
      accentColor: base.accentColor,
      gradientColor: base.gradientColor,
      badgeSlot: { ...base.badgeSlot, fieldVar: currentBadgeVar },
      mediaSlot: { ...base.mediaSlot, fieldVar: currentMediaVar },
      titleSlot: { ...base.titleSlot, fieldVar: currentTitleVar },
      subtitleSlot: { ...base.subtitleSlot, fieldVar: currentSubVar },
      showDivider: base.showDivider,
      footerLeftSlot: { ...base.footerLeftSlot, fieldVar: editingPreset.footerLeftSlot?.fieldVar || '' },
      footerRightSlot: { ...base.footerRightSlot, fieldVar: currentFooterVar },
      borderRadius: base.borderRadius,
      shadowSize: base.shadowSize,
      hoverEffect: base.hoverEffect,
      cardBgColor: base.cardBgColor,
      htmlTemplate: newHtml,
    });
    setToastMessage(`Switched to base template "${base.name}"`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleCustomizeTemplateHtml = (styleId: string) => {
    const base = INITIAL_CARD_PRESETS.find(p => p.id === styleId);
    const templateMarkup = DEFAULT_CARD_HTML_TEMPLATES[styleId] || htmlCode || '';
    setHtmlCode(templateMarkup);
    if (editingPreset) {
      setEditingPreset({
        ...editingPreset,
        isCustom: true,
        presetStyleType: 'custom',
        htmlTemplate: templateMarkup,
      });
    }
    setShowHtmlEditor(true);
    setToastMessage(`Customizing HTML for "${base?.name || styleId}"`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleInsertSlotTag = (slotType: string) => {
    let snippet = '';
    if (slotType === 'badgeSlot') {
      snippet = '\n  <span class="dynamicFieldDeclaration font-bold px-3 py-1 rounded-lg text-xs bg-blue-50 text-blue-700" data-slot="badgeSlot">2026-2027</span>';
    } else if (slotType === 'titleSlot') {
      snippet = '\n  <h3 class="dynamicFieldDeclaration font-bold text-base text-gray-900" data-slot="titleSlot">Schedule Title</h3>';
    } else if (slotType === 'subtitleSlot') {
      snippet = '\n  <p class="dynamicFieldDeclaration text-xs text-gray-500" data-slot="subtitleSlot">Program Details • Semester 1</p>';
    } else if (slotType === 'footerRightSlot') {
      snippet = '\n  <a class="dynamicFieldDeclaration font-bold text-xs text-blue-600" data-slot="footerRightSlot">Download PDF ↗</a>';
    }
    const nextHtml = (htmlCode || '') + snippet;
    setHtmlCode(nextHtml);
    handleUpdateEditing({ htmlTemplate: nextHtml });
    setToastMessage(`Tagged dynamic slot: ${slotType}`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Dynamic Module Schemas (Built-in + Module Studio Dynamic Entities)
  const studioTemplates = getStoredStudioTemplates();
  const dynamicSchemas: ModuleSchema[] = studioTemplates.map((t) => ({
    id: t.schema.slug || t.schema.id,
    name: t.schema.name,
    fields: t.schema.fields.map((f: any) => ({
      name: f.name || f.key || f.id,
      label: f.label,
      type: f.type,
    })),
    sampleData: {
      year: 'Active',
      logoText: t.schema.name.slice(0, 3).toUpperCase(),
      title: `${t.schema.name} Record`,
      recipient: 'Sample Data',
      pdf_url: '#',
    },
  }));

  const allModuleSchemas = [...MODULE_SCHEMAS, ...dynamicSchemas];
  const currentModuleSchema = allModuleSchemas.find(m => m.id === selectedModuleId) || null;

  const handleAddCustomVar = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCustomVarName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!clean) return;
    if (!userCustomVars.some((v) => v.name === clean)) {
      setUserCustomVars((prev) => [...prev, { name: clean, label: newCustomVarName.trim() }]);
    }
    setNewCustomVarName('');
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top One-Line Header */}
      <div className="py-1 border-b border-gray-200/80 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Card Builder Studio</h1>
          <p className="text-xs text-gray-500 mt-0.5">Your saved card templates. Create and manage custom card designs for any module.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Style</span>
            <span className="text-[10px] bg-blue-800/60 text-blue-100 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider border border-blue-400/30">Advanced</span>
          </button>
        </div>
      </div>

      {/* Floating Top-Right White Toaster Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-white rounded-xl shadow-xl border border-gray-200/80 min-w-[280px] max-w-sm overflow-hidden animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="p-3.5 flex items-start gap-3 relative">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="flex-1 pr-4">
              <p className="text-xs font-semibold text-gray-700 leading-snug">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md transition-colors cursor-pointer absolute top-2.5 right-2.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Bottom Green Progress Accent Bar */}
          <div className="h-1 bg-emerald-500 w-full animate-pulse" />
        </div>
      )}

      {/* Main Saved Styles Gallery Grid */}
      {presets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/60 flex items-center justify-center mb-5 shadow-xs">
            <Layers className="w-9 h-9 text-blue-400" />
          </div>
          <h3 className="text-base font-extrabold text-gray-900 mb-1.5">No saved styles yet</h3>
          <p className="text-xs text-gray-500 max-w-sm text-center leading-relaxed mb-6">
            Create your first custom card template by clicking the button above. Choose a base style, map data fields, and pick your colors.
          </p>
          <button
            onClick={handleOpenNew}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Style</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {presets.map((preset) => (
            <div key={preset.id} className="group">
              {/* Clickable Card Box Container */}
              <div 
                onClick={() => handleEdit(preset)}
                className="bg-white rounded-2xl border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group/card"
              >
                {/* Card Internal Top Header */}
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-900 transition-colors line-clamp-1">
                    {preset.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 shrink-0 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Custom
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(preset);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Duplicate Preset"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(preset.id, preset.name);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Delete Preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  {/* Visual Card Preview */}
                  <CardPresetView preset={preset} sampleData={currentModuleSchema?.sampleData} viewMode="sample" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-Viewport Studio Drawer (Portalled to document.body for 100% full-screen coverage) */}
      {isDrawerOpen && editingPreset && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] overflow-hidden bg-black/50 flex justify-end animate-fade-in">
          <div className="w-full max-w-[96vw] bg-white shadow-2xl flex flex-col h-full">
            
            {/* Studio Drawer Top Header — Row 1: Name + Actions */}
            <div className="px-8 py-3 bg-white border-b border-gray-100 flex items-center justify-between gap-6">
              {/* Left: Name and Module */}
              <div className="flex items-center gap-5 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Name</label>
                  <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 focus-within:border-blue-500 focus-within:bg-white rounded-lg px-3 py-1.5 transition-all">
                    <input
                      type="text"
                      value={editingPreset.name}
                      onChange={(e) => handleUpdateEditing({ name: e.target.value })}
                      placeholder="Template Name"
                      className="text-sm font-bold text-gray-900 bg-transparent outline-none w-64"
                    />
                    <Edit3 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </div>
                </div>

                <div className="h-5 w-px bg-gray-200 shrink-0" />

                <div className="flex items-center gap-2.5 min-w-0">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Template for</label>
                  <span className="text-sm font-semibold text-gray-700 truncate">
                    {currentModuleSchema?.name || 'Academic Timetables'}
                  </span>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setEditingPreset(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDrawer}
                  className="px-4 py-2 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    if (editingPreset) {
                      saveCardPreset({ ...editingPreset, htmlTemplate: htmlCode, isPublished: true });
                      loadPresets();
                      setIsDrawerOpen(false);
                      setEditingPreset(null);
                      setToastMessage(`Published "${editingPreset.name}" — now live across all modules!`);
                      setTimeout(() => setToastMessage(null), 2500);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>
              </div>
            </div>

            {/* Studio Drawer Top Header — Row 2: Wizard Steps */}
            <div className="px-8 py-2 bg-gray-50/80 border-b border-gray-200 flex items-center justify-center">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    wizardStep === 1
                      ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    wizardStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>1</span>
                  <span>Choose Style</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    wizardStep === 2
                      ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    wizardStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>2</span>
                  <span>Decide Fields</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    wizardStep === 3
                      ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    wizardStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>3</span>
                  <span>Decide Colors</span>
                </button>
              </div>
            </div>

            {/* Studio Drawer Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">

              {/* STEP 1: Select Style (Slide 2: 5 Styles Across the Screen) */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  {/* Style Gallery Grid: 3 columns, authentic card dimensions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto py-2">
                    {/* The 4 Base Card Styles */}
                    {BASE_STYLE_OPTIONS.map((styleOpt) => {
                      const basePreset = INITIAL_CARD_PRESETS.find(p => p.id === styleOpt.id) || INITIAL_CARD_PRESETS[0];
                      const isSelected = !editingPreset.isCustom && editingPreset.presetStyleType === basePreset.presetStyleType;

                      return (
                        <div
                          key={styleOpt.id}
                          onClick={() => handleSelectBaseStyle(styleOpt.id)}
                          className="group cursor-pointer flex flex-col space-y-3 transition-all"
                        >
                          {/* Card Header Strip */}
                          <div className="flex items-center justify-between px-1">
                            <span className="text-sm font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {styleOpt.name}
                            </span>
                            {isSelected && (
                              <span className="text-xs font-bold text-white bg-blue-600 px-3 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                <Check className="w-3.5 h-3.5" /> Selected
                              </span>
                            )}
                          </div>

                          {/* The Real Authentic Card */}
                          <div className={`rounded-2xl transition-all duration-200 ${
                            isSelected
                              ? 'ring-4 ring-blue-600 ring-offset-2 shadow-xl scale-[1.01]'
                              : 'hover:shadow-lg hover:-translate-y-1'
                          }`}>
                            <CardPresetView
                              preset={basePreset}
                              sampleData={currentModuleSchema?.sampleData}
                              viewMode="sample"
                              wizardStep={1}
                              className="w-full min-h-[260px]"
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* Card 5: Custom HTML Card Option */}
                    <div
                      onClick={() => handleSelectBaseStyle('custom-html')}
                      className="group cursor-pointer flex flex-col space-y-3 transition-all"
                    >
                      <div className="flex items-center justify-between px-1">
                        <span className="text-sm font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          Custom HTML
                        </span>
                        {editingPreset.isCustom && (
                          <span className="text-xs font-bold text-white bg-indigo-600 px-3 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>

                      {/* Card Dimension Container for Custom HTML */}
                      <div className={`min-h-[260px] bg-white rounded-2xl border-2 border-dashed flex flex-col justify-between p-6 transition-all duration-200 ${
                        editingPreset.isCustom
                          ? 'border-indigo-600 ring-4 ring-indigo-600 ring-offset-2 shadow-xl scale-[1.01] bg-indigo-50/20'
                          : 'border-gray-300 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-xs">
                            <Code className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            HTML / Tailwind
                          </span>
                        </div>

                        <div className="space-y-1.5 my-auto py-2">
                          <h4 className="font-extrabold text-sm text-gray-900">Custom HTML Markup</h4>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            Write custom HTML and tag elements with dynamic slot attributes for full styling freedom.
                          </p>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBaseStyle('custom-html');
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Open HTML Editor</span>
                          </button>
                          <span className="text-[11px] font-mono text-gray-400 font-medium">data-slot="..."</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation Strip */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-gray-500">Selected Style:</span>
                      <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {editingPreset.isCustom ? 'Custom HTML Template' : editingPreset.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-2"
                    >
                      <span>Next: Decide Fields</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Decide Fields (Slide 3 & 4: Center Card with Slots, Right Sidebar Data Available) */}
              {wizardStep === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Center / Left Stage: The Selected Card with Droppable Slots (8 cols) */}
                  <div className="lg:col-span-8 bg-slate-100/90 p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col min-h-[620px]">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-600" />
                        <h2 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                          Step 2: Adjust Fields & Card Slots
                        </h2>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        Drag fields from right onto Slot 1 – Slot 5
                      </span>
                    </div>

                    {/* Prominent Card Display with Dashed Droppable Slot Boxes */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full max-w-[480px]">
                      <CardPresetView 
                        preset={editingPreset} 
                        sampleData={currentModuleSchema?.sampleData}
                        wizardStep={2}
                        availableFields={currentModuleSchema?.fields}
                        onDropToSlot={handleDropToSlot}
                        activeDragField={activeDragField}
                      />
                      </div>
                    </div>

                  </div>

                  {/* Right Sidebar: Data Available (4 cols) matching Slide 3 & Slide 4 */}
                  <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-5">
                    {/* Header */}
                    <div className="border-b border-gray-100 pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-blue-600" /> Fields Available
                        </h3>
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                          {currentModuleSchema?.fields.length || 0} Fields
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Drag any field onto card slots or click a slot on the card to map.
                      </p>
                    </div>

                    {/* Draggable Fields List */}
                    <div className="space-y-2.5">
                      {currentModuleSchema?.fields.map((f) => (
                        <div
                          key={f.name}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', f.name);
                            setActiveDragField(f.name);
                          }}
                          onDragEnd={() => setActiveDragField(null)}
                          className="p-3 bg-white hover:bg-blue-50/80 border border-gray-200 hover:border-blue-400 rounded-xl shadow-2xs transition-all cursor-grab active:cursor-grabbing flex items-center justify-between group select-none hover:shadow-xs"
                          title={`Drag "${f.label}" onto a card slot`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-gray-400 group-hover:text-blue-600 font-mono text-sm leading-none">⠿</span>
                            <div className="min-w-0">
                              <div className="font-extrabold text-xs text-gray-800 group-hover:text-blue-800 truncate">
                                {f.label}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-gray-100 group-hover:bg-blue-600 text-gray-600 group-hover:text-white px-2 py-0.5 rounded-md transition-colors shrink-0">
                            Drag ↗
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Quick Slot Mapping Overview & Configuration */}
                    <div className="pt-3 border-t border-gray-100 space-y-2.5">
                      <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wide block">
                        Current Slot Mapping:
                      </span>
                      <div className="space-y-1.5 text-xs">
                        {/* Slot 1 — Locked / Style-configured */}
                        <div className="flex items-center justify-between p-2 rounded-lg border bg-gray-50 border-gray-200">
                          <span className="font-bold text-gray-700">Slot 1 (Media/Logo):</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                            🔒 {editingPreset.mediaSlot?.type || 'initials'}
                          </span>
                        </div>
                        {/* Slots 2–4 — Droppable field slots */}
                        {[
                          { label: 'Slot 2 (Badge)', value: editingPreset.badgeSlot?.fieldVar },
                          { label: 'Slot 3 (Title)', value: editingPreset.titleSlot?.fieldVar },
                          { label: 'Slot 4 (Subtitle)', value: editingPreset.subtitleSlot?.fieldVar },
                        ].map((slot) => (
                          <div key={slot.label} className={`flex items-center justify-between p-2 rounded-lg border ${slot.value ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/50 border-dashed border-gray-200'}`}>
                            <span className={`font-bold ${slot.value ? 'text-gray-700' : 'text-gray-400'}`}>{slot.label}:</span>
                            {slot.value ? (
                              <span className="font-mono text-blue-700 text-[11px] font-bold">{slot.value}</span>
                            ) : (
                              <span className="text-gray-300 text-[11px]">—</span>
                            )}
                          </div>
                        ))}
                        {/* Slot 5 — Locked / Label-only */}
                        <div className="flex items-center justify-between p-2 rounded-lg border bg-gray-50 border-gray-200">
                          <span className="font-bold text-gray-700">Slot 5 (Action Link):</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                            🔒 {editingPreset.footerRightSlot?.label || 'View Document'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Colors & Style Factors */}
              {wizardStep === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Step 3 Left Panel (5 cols): The 8 Style & Property Controls */}
                  <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-5 max-h-[760px] overflow-y-auto">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                      <Sliders className="w-4 h-4 text-blue-600" /> Style & Property Controls
                    </h3>
                    <div className="space-y-4 text-xs">
                    {/* 1. Theme & Background Colors */}
                    <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-gray-800 block">1. Theme Colors</label>
                        
                        {/* Solid / Gradient Mode Switcher */}
                        <div className="bg-gray-200/70 p-0.5 rounded-lg flex items-center gap-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateEditing({ gradientColor: editingPreset.accentColor });
                            }}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              (!editingPreset.gradientColor || editingPreset.gradientColor === editingPreset.accentColor)
                                ? 'bg-white text-gray-900 shadow-2xs'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            Solid
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const defaultEnd = editingPreset.accentColor === '#2563eb' ? '#4f46e5' : '#3b82f6';
                              handleUpdateEditing({
                                gradientColor: (editingPreset.gradientColor && editingPreset.gradientColor !== editingPreset.accentColor)
                                  ? editingPreset.gradientColor
                                  : defaultEnd
                              });
                            }}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              (editingPreset.gradientColor && editingPreset.gradientColor !== editingPreset.accentColor)
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            Gradient
                          </button>
                        </div>
                      </div>

                      {/* MODE A: SOLID COLOR MODE */}
                      {(!editingPreset.gradientColor || editingPreset.gradientColor === editingPreset.accentColor) ? (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-700 font-semibold">Primary Theme Color</label>
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-gray-300 shadow-2xs">
                              <input
                                type="color"
                                value={editingPreset.accentColor}
                                onChange={(e) => {
                                  const hex = e.target.value;
                                  handleSelectThemeColor(hex);
                                  handleUpdateEditing({ accentColor: hex, gradientColor: hex });
                                }}
                                className="w-5 h-4 rounded-xs cursor-pointer border-0 p-0 shrink-0"
                              />
                              <span className="text-xs font-bold font-mono text-gray-800">{editingPreset.accentColor}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {[
                              { name: 'University Blue', hex: '#2563eb' },
                              { name: 'Emerald Green', hex: '#059669' },
                              { name: 'Crimson Red', hex: '#dc2626' },
                              { name: 'Royal Purple', hex: '#7c3aed' },
                              { name: 'Amber Gold', hex: '#d97706' },
                            ].map((c) => (
                              <button
                                key={c.hex}
                                type="button"
                                onClick={() => {
                                  handleSelectThemeColor(c.hex);
                                  handleUpdateEditing({ accentColor: c.hex, gradientColor: c.hex });
                                }}
                                style={{ backgroundColor: c.hex }}
                                className={`w-6 h-6 rounded-lg border transition-transform cursor-pointer shrink-0 ${
                                  editingPreset.accentColor === c.hex ? 'border-blue-600 ring-2 ring-blue-400/30 scale-105' : 'border-gray-300 hover:scale-105'
                                }`}
                                title={c.name}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* MODE B: GRADIENT THEME MODE */
                        <div className="space-y-3 pt-1">
                          {/* 2 Pickers Side-by-Side: Color 1 (Start) & Color 2 (End) */}
                          <div className="grid grid-cols-2 gap-3 bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-700 block">Color 1 (Start)</label>
                              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-300">
                                <input
                                  type="color"
                                  value={editingPreset.accentColor}
                                  onChange={(e) => handleSelectThemeColor(e.target.value)}
                                  className="w-4 h-3.5 rounded-xs cursor-pointer border-0 p-0 shrink-0"
                                />
                                <span className="text-[11px] font-bold font-mono text-gray-800">{editingPreset.accentColor}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-700 block">Color 2 (End)</label>
                              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-300">
                                <input
                                  type="color"
                                  value={editingPreset.gradientColor}
                                  onChange={(e) => handleUpdateEditing({ gradientColor: e.target.value })}
                                  className="w-4 h-3.5 rounded-xs cursor-pointer border-0 p-0 shrink-0"
                                />
                                <span className="text-[11px] font-bold font-mono text-gray-800">{editingPreset.gradientColor}</span>
                              </div>
                            </div>
                          </div>

                          {/* Harmonious Dual-Color Gradient Presets */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-gray-600 block">Quick Gradient Presets</span>
                            <div className="flex items-center gap-2">
                              {[
                                { name: 'Royal Sapphire (Blue -> Sky)', c1: '#1e40af', c2: '#3b82f6' },
                                { name: 'Electric Violet (Indigo -> Purple)', c1: '#6366f1', c2: '#a855f7' },
                                { name: 'Nordic Twilight (Navy -> Blue)', c1: '#0f172a', c2: '#2563eb' },
                                { name: 'Emerald Lagoon (Green -> Cyan)', c1: '#047857', c2: '#06b6d4' },
                                { name: 'Sunset Flame (Crimson -> Gold)', c1: '#b91c1c', c2: '#f59e0b' },
                                { name: 'Cosmic Aurora (Violet -> Cyan)', c1: '#4c1d95', c2: '#0284c7' },
                              ].map((g) => (
                                <button
                                  key={g.name}
                                  type="button"
                                  onClick={() => {
                                    handleSelectThemeColor(g.c1);
                                    handleUpdateEditing({ accentColor: g.c1, gradientColor: g.c2 });
                                  }}
                                  style={{ background: `linear-gradient(135deg, ${g.c1} 0%, ${g.c2} 100%)` }}
                                  className={`w-6 h-6 rounded-lg border transition-transform cursor-pointer shrink-0 ${
                                    (editingPreset.accentColor === g.c1 && editingPreset.gradientColor === g.c2)
                                      ? 'border-blue-600 ring-2 ring-blue-400/40 scale-110'
                                      : 'border-white/50 hover:scale-105 shadow-2xs'
                                  }`}
                                  title={g.name}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2.5 border-t border-gray-200/60 flex items-center justify-between">
                      <label className="text-xs text-gray-700 font-semibold">Card BG Color</label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          {[
                            { name: 'Pure White', hex: '#ffffff' },
                            { name: 'Soft Gray', hex: '#f9fafb' },
                            { name: 'Warm Cream', hex: '#fdfbf7' },
                            { name: 'Subtle Blue', hex: '#f0f7ff' },
                          ].map((bg) => (
                            <button
                              key={bg.hex}
                              type="button"
                              onClick={() => handleUpdateEditing({ cardBgColor: bg.hex })}
                              style={{ backgroundColor: bg.hex }}
                              className={`w-5 h-5 rounded-md border transition-transform cursor-pointer ${
                                (editingPreset.cardBgColor || '#ffffff') === bg.hex ? 'border-blue-600 ring-2 ring-blue-400/30' : 'border-gray-300 hover:scale-105'
                              }`}
                              title={bg.name}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-gray-300 shadow-2xs">
                          <input
                            type="color"
                            value={editingPreset.cardBgColor || '#ffffff'}
                            onChange={(e) => handleUpdateEditing({ cardBgColor: e.target.value })}
                            className="w-5 h-4 rounded-xs cursor-pointer border-0 p-0 shrink-0"
                          />
                          <span className="text-xs font-bold font-mono text-gray-800">{editingPreset.cardBgColor || '#ffffff'}</span>
                        </div>
                      </div>
                    </div>

                    </div>

                  {/* 2. Separate Accent Border Box */}
                  <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-800">2. Accent Border Settings</label>
                      <input
                        type="checkbox"
                        checked={editingPreset.showTopAccent}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          handleUpdateEditing({ 
                            showTopAccent: isChecked,
                            accentSides: isChecked 
                              ? { top: true, bottom: false, left: false, right: false } 
                              : { top: false, bottom: false, left: false, right: false }
                          });
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        title="Enable Accent Border"
                      />
                    </div>

                    {editingPreset.showTopAccent && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] text-gray-500 font-semibold mb-1 block">Accent Sides</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { key: 'top', label: 'Top' },
                              { key: 'bottom', label: 'Btm' },
                              { key: 'left', label: 'Lft' },
                              { key: 'right', label: 'Rgt' },
                            ].map((side) => {
                              const sides = editingPreset.accentSides || { top: true, bottom: false, left: false, right: false };
                              const isActive = (sides as any)[side.key];
                              return (
                                <button
                                  key={side.key}
                                  type="button"
                                  onClick={() => {
                                    const nextSides = { ...sides, [side.key]: !isActive };
                                    const hasAnySide = Object.values(nextSides).some(Boolean);
                                    handleUpdateEditing({
                                      accentSides: nextSides,
                                      showTopAccent: hasAnySide,
                                    });
                                  }}
                                  className={`py-1 text-center font-semibold text-[10px] rounded border transition-all ${
                                    isActive 
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                                  }`}
                                >
                                  {side.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-gray-500 font-semibold mb-1 block">Accent Thickness</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[2, 4, 6].map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => handleUpdateEditing({ accentWidth: w })}
                                className={`py-1 text-center font-bold text-[10px] rounded border transition-all ${
                                  editingPreset.accentWidth === w 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {w}px
                              </button>
                            ))}
                            {/* Custom Input Box */}
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                max="30"
                                value={editingPreset.accentWidth || ''}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  handleUpdateEditing({ accentWidth: isNaN(val) ? 0 : val });
                                }}
                                placeholder="Custom"
                                title="Enter custom thickness (px)"
                                className={`w-full py-1 px-1 text-center font-bold text-[10px] rounded border transition-all focus:outline-none ${
                                  ![2, 4, 6].includes(editingPreset.accentWidth || 0)
                                    ? 'bg-blue-50 text-blue-700 border-blue-600 ring-1 ring-blue-500/30'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Media Box / Icon Settings */}
                  <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-800">3. Media Box / Icon Settings</label>
                      <input
                        type="checkbox"
                        checked={editingPreset.mediaSlot?.enabled}
                        onChange={(e) => handleUpdateEditing({
                          mediaSlot: { ...editingPreset.mediaSlot, enabled: e.target.checked }
                        })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {editingPreset.mediaSlot?.enabled && (
                      <div className="space-y-4 pt-1">
                        {/* Top Section: Media Content Rows matching user wireframe */}
                        <div className="space-y-2.5">
                          <label className="text-[11px] font-semibold text-gray-600 block">Media Content</label>

                          {/* Row 1: Radio Icon + Icon Picker Button + Inline Light Panel */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <label 
                                onClick={() => handleUpdateEditing({ mediaSlot: { ...editingPreset.mediaSlot, type: 'icon' } })}
                                className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 w-24 shrink-0"
                              >
                                <input
                                  type="radio"
                                  name="mediaTypeRadioList"
                                  checked={(editingPreset.mediaSlot.type || 'icon') === 'icon'}
                                  onChange={() => handleUpdateEditing({ mediaSlot: { ...editingPreset.mediaSlot, type: 'icon' } })}
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span>Icon</span>
                              </label>

                              {(editingPreset.mediaSlot.type || 'icon') === 'icon' && (
                                <button
                                  type="button"
                                  onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                                  className="px-3 py-1.5 bg-white text-gray-800 hover:bg-gray-50 hover:border-blue-500 rounded-xl border border-gray-300 flex items-center gap-2.5 shadow-2xs transition-all cursor-pointer font-bold text-xs"
                                  title="Click to toggle Icon Library panel"
                                >
                                  {(() => {
                                    const iconName = editingPreset.mediaSlot.iconName || 'Calendar';
                                    const iconMap: Record<string, any> = {
                                      Calendar, FileText, Award, Trophy, ShieldCheck, BookOpen, Globe, Layers,
                                      User, Star, Briefcase, Heart, Download, Tag, Bookmark, Zap, Compass, Target,
                                      Clock, Bell, MapPin, Hash, Mail, Phone, Lock, Settings,
                                      Folder, File, Link, Share2, Printer, Info, HelpCircle, AlertCircle, CheckCircle2,
                                      Cloud, Database, Server, Code, Terminal, Activity, BarChart2, PieChart, TrendingUp,
                                      Feather, PenTool, ExternalLink, GraduationCap, Flame, Shield
                                    };
                                    const IconComp = iconMap[iconName] || Calendar;
                                    return <IconComp className="w-4 h-4 text-blue-600" />;
                                  })()}
                                  <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                              )}
                            </div>

                            {/* Inline Light-Mode Icon Library Panel */}
                            {(editingPreset.mediaSlot.type || 'icon') === 'icon' && isIconPickerOpen && (
                              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                {/* Search Header */}
                                <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                                  <div className="relative flex-1">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
                                    <input
                                      type="text"
                                      value={iconSearchQuery}
                                      onChange={(e) => setIconSearchQuery(e.target.value)}
                                      placeholder="Search icon..."
                                      className="w-full pl-8 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                                      autoFocus
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setIsIconPickerOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* 50+ Icons Grid */}
                                <div className="max-h-[220px] overflow-y-auto grid grid-cols-7 gap-1.5 pr-1">
                                  {[
                                    { name: 'GraduationCap', icon: GraduationCap, label: 'graduation cap degree college university student academic cap' },
                                    { name: 'BookOpen', icon: BookOpen, label: 'book open read study course syllabus' },
                                    { name: 'Award', icon: Award, label: 'award badge honor rank gold medal certificate' },
                                    { name: 'Trophy', icon: Trophy, label: 'trophy winner first prize achievement championship' },
                                    { name: 'FileText', icon: FileText, label: 'file document text paper report syllabus' },
                                    { name: 'Calendar', icon: Calendar, label: 'calendar events date time schedule timetable' },
                                    { name: 'Clock', icon: Clock, label: 'clock time schedule duration deadline' },
                                    { name: 'Globe', icon: Globe, label: 'globe portal web internet site online' },
                                    { name: 'Layers', icon: Layers, label: 'layers category stack module' },
                                    { name: 'User', icon: User, label: 'user student profile person account avatar' },
                                    { name: 'Star', icon: Star, label: 'star favorite grade rating star' },
                                    { name: 'Briefcase', icon: Briefcase, label: 'briefcase work job placement career hiring' },
                                    { name: 'ShieldCheck', icon: ShieldCheck, label: 'shield check security verified accredited safe' },
                                    { name: 'Shield', icon: Shield, label: 'shield security protection guard' },
                                    { name: 'Heart', icon: Heart, label: 'heart health favorite like love' },
                                    { name: 'Flame', icon: Flame, label: 'flame fire hot popular trending' },
                                    { name: 'Download', icon: Download, label: 'download pdf file link save export' },
                                    { name: 'Tag', icon: Tag, label: 'tag label category price' },
                                    { name: 'Bookmark', icon: Bookmark, label: 'bookmark mark save favorite' },
                                    { name: 'Zap', icon: Zap, label: 'zap quick fast flash instant' },
                                    { name: 'Compass', icon: Compass, label: 'compass direction explore guide navigation' },
                                    { name: 'Target', icon: Target, label: 'target goal objective aim score' },
                                    { name: 'Bell', icon: Bell, label: 'bell notice notification alert announcement' },
                                    { name: 'MapPin', icon: MapPin, label: 'map pin location campus address venue' },
                                    { name: 'Hash', icon: Hash, label: 'hash number tag id code' },
                                    { name: 'Mail', icon: Mail, label: 'mail email message contact inbox' },
                                    { name: 'Phone', icon: Phone, label: 'phone call mobile contact helpline' },
                                    { name: 'Lock', icon: Lock, label: 'lock secure private password key' },
                                    { name: 'Settings', icon: Settings, label: 'settings config options gear' },
                                    { name: 'Folder', icon: Folder, label: 'folder directory files archive' },
                                    { name: 'File', icon: File, label: 'file document blank paper' },
                                    { name: 'Link', icon: Link, label: 'link url website attachment' },
                                    { name: 'Share2', icon: Share2, label: 'share social send export' },
                                    { name: 'Printer', icon: Printer, label: 'printer print hardcopy paper' },
                                    { name: 'ExternalLink', icon: ExternalLink, label: 'external link open new window' },
                                    { name: 'BarChart2', icon: BarChart2, label: 'chart bar statistics analytics report graph' },
                                    { name: 'PieChart', icon: PieChart, label: 'pie chart graph statistics analytics' },
                                    { name: 'TrendingUp', icon: TrendingUp, label: 'trending up growth progress success' },
                                    { name: 'Activity', icon: Activity, label: 'activity pulse health status monitor' },
                                    { name: 'Cloud', icon: Cloud, label: 'cloud storage server hosting online' },
                                    { name: 'Database', icon: Database, label: 'database sql records data store' },
                                    { name: 'Server', icon: Server, label: 'server infrastructure host machine' },
                                    { name: 'Code', icon: Code, label: 'code programming developer script html' },
                                    { name: 'Terminal', icon: Terminal, label: 'terminal console command cli shell' },
                                    { name: 'Feather', icon: Feather, label: 'feather pen write author article blog' },
                                    { name: 'PenTool', icon: PenTool, label: 'pen tool design edit draw graphics' },
                                    { name: 'Info', icon: Info, label: 'info information help details' },
                                    { name: 'HelpCircle', icon: HelpCircle, label: 'help circle question support faq' },
                                    { name: 'AlertCircle', icon: AlertCircle, label: 'alert warning caution emergency' },
                                    { name: 'CheckCircle2', icon: CheckCircle2, label: 'check circle verified success complete' },
                                  ]
                                    .filter((item) => 
                                      !iconSearchQuery || 
                                      item.name.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
                                      item.label.toLowerCase().includes(iconSearchQuery.toLowerCase())
                                    )
                                    .map((item) => {
                                      const IconComp = item.icon;
                                      const isSel = (editingPreset.mediaSlot.iconName || 'Calendar') === item.name;
                                      return (
                                        <button
                                          key={item.name}
                                          type="button"
                                          onClick={() => {
                                            handleUpdateEditing({
                                              mediaSlot: { ...editingPreset.mediaSlot, iconName: item.name }
                                            });
                                            setIsIconPickerOpen(false);
                                          }}
                                          className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                            isSel
                                              ? 'bg-blue-50 text-blue-600 border-blue-500 shadow-2xs font-bold ring-1 ring-blue-400'
                                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50/50 hover:text-blue-600 hover:border-blue-300'
                                          }`}
                                          title={item.name}
                                        >
                                          <IconComp className="w-4 h-4" />
                                        </button>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Row 2: Radio Image + Browse Image Button */}
                          <div className="flex items-center gap-3">
                            <label 
                              onClick={() => handleUpdateEditing({ mediaSlot: { ...editingPreset.mediaSlot, type: 'image' } })}
                              className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 w-24 shrink-0"
                            >
                              <input
                                type="radio"
                                name="mediaTypeRadioList"
                                checked={editingPreset.mediaSlot.type === 'image'}
                                onChange={() => handleUpdateEditing({ mediaSlot: { ...editingPreset.mediaSlot, type: 'image' } })}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span>Image</span>
                            </label>

                            {editingPreset.mediaSlot.type === 'image' && (
                              <div className="flex-1 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg font-bold text-xs cursor-pointer shadow-2xs transition-colors shrink-0"
                                >
                                  Browse Image
                                </button>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const dataUrl = ev.target?.result as string;
                                        if (dataUrl) {
                                          handleUpdateEditing({
                                            mediaSlot: {
                                              ...editingPreset.mediaSlot,
                                              type: 'image',
                                              imageUrl: dataUrl,
                                            }
                                          });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                      e.target.value = '';
                                    }
                                  }}
                                />
                                <input
                                  type="text"
                                  value={editingPreset.mediaSlot.imageUrl || ''}
                                  onChange={(e) => handleUpdateEditing({
                                    mediaSlot: { ...editingPreset.mediaSlot, type: 'image', imageUrl: e.target.value }
                                  })}
                                  className="flex-1 px-2.5 py-1 border border-gray-300 rounded-lg text-xs font-mono"
                                  placeholder="Paste image URL or browse image..."
                                />
                              </div>
                            )}
                          </div>

                          {/* Row 3: Radio Initials + Length Pills + Same-line Asterisk Note */}
                          <div className="flex items-center gap-3">
                            <label 
                              onClick={() => handleUpdateEditing({ mediaSlot: { ...editingPreset.mediaSlot, type: 'initials' } })}
                              className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 w-24 shrink-0"
                            >
                              <input
                                type="radio"
                                name="mediaTypeRadioList"
                                checked={editingPreset.mediaSlot.type === 'initials'}
                                onChange={() => handleUpdateEditing({ mediaSlot: { ...editingPreset.mediaSlot, type: 'initials' } })}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span>Initials</span>
                            </label>

                            {editingPreset.mediaSlot.type === 'initials' && (
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {[1, 2, 3].map((num) => (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() => handleUpdateEditing({
                                        mediaSlot: { ...editingPreset.mediaSlot, initialsLength: num as any }
                                      })}
                                      className={`w-5 h-5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center ${
                                        (editingPreset.mediaSlot.initialsLength || 2) === num
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      {num}
                                    </button>
                                  ))}
                                </div>

                                <span 
                                  className="text-[10px] text-gray-400 italic truncate" 
                                  title="First 1, 2, or 3 letters of main title will be displayed in the box"
                                >
                                  * First {(editingPreset.mediaSlot.initialsLength || 2)} letter{(editingPreset.mediaSlot.initialsLength || 2) > 1 ? 's' : ''} of title will be displayed in the box
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Section: Single Line for Box Shape, Box Size, Box BG Color, Icon/Text Color matching user wireframe */}
                        <div className="pt-3 border-t border-gray-200/60 grid grid-cols-4 gap-2 items-center">
                          {/* Col 1: Box Shape */}
                          <div>
                            <label className="text-[10px] font-semibold text-gray-500 block mb-1 truncate">Box Shape</label>
                            <select
                              value={editingPreset.mediaSlot.shape || 'rounded'}
                              onChange={(e) => handleUpdateEditing({
                                mediaSlot: { ...editingPreset.mediaSlot, shape: e.target.value as any }
                              })}
                              className="w-full px-1.5 py-1 border border-gray-300 rounded-lg text-xs bg-white font-medium"
                            >
                              <option value="square">Square</option>
                              <option value="rounded">Rounded</option>
                              <option value="circle">Circle</option>
                            </select>
                          </div>

                          {/* Col 2: Box Size */}
                          <div>
                            <label className="text-[10px] font-semibold text-gray-500 block mb-1 truncate">Box Size</label>
                            <select
                              value={editingPreset.mediaSlot.size || 'md'}
                              onChange={(e) => handleUpdateEditing({
                                mediaSlot: { ...editingPreset.mediaSlot, size: e.target.value as any }
                              })}
                              className="w-full px-1.5 py-1 border border-gray-300 rounded-lg text-xs bg-white font-medium"
                            >
                              <option value="sm">Small</option>
                              <option value="md">Medium</option>
                              <option value="lg">Large</option>
                            </select>
                          </div>

                          {/* Col 3: Box BG Color */}
                          <div>
                            <label className="text-[10px] font-semibold text-gray-500 block mb-1 truncate">Box BG Color</label>
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-gray-300 shadow-2xs">
                              <input
                                type="color"
                                value={editingPreset.mediaSlot.bgColor || editingPreset.accentColor || '#2563eb'}
                                onChange={(e) => handleUpdateEditing({
                                  mediaSlot: { ...editingPreset.mediaSlot, bgColor: e.target.value }
                                })}
                                className="w-5 h-4 rounded-xs cursor-pointer border-0 p-0 shrink-0"
                              />
                              <span className="text-xs font-bold font-mono text-gray-800 truncate">
                                {editingPreset.mediaSlot.bgColor || editingPreset.accentColor || '#2563eb'}
                              </span>
                            </div>
                          </div>

                          {/* Col 4: Icon / Text Color */}
                          <div>
                            <label className="text-[10px] font-semibold text-gray-500 block mb-1 truncate">Icon/Text Color</label>
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-gray-300 shadow-2xs">
                              <input
                                type="color"
                                value={editingPreset.mediaSlot.iconColor || '#ffffff'}
                                onChange={(e) => handleUpdateEditing({
                                  mediaSlot: { ...editingPreset.mediaSlot, iconColor: e.target.value }
                                })}
                                className="w-5 h-4 rounded-xs cursor-pointer border-0 p-0 shrink-0"
                              />
                              <span className="text-xs font-bold font-mono text-gray-800 truncate">
                                {editingPreset.mediaSlot.iconColor || '#ffffff'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Badge Pill Settings */}
                  <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-800">4. Badge Pill Settings (Year / Tag)</label>
                      <input
                        type="checkbox"
                        checked={editingPreset.badgeSlot?.enabled !== false}
                        onChange={(e) => handleUpdateEditing({
                          badgeSlot: { ...editingPreset.badgeSlot, enabled: e.target.checked }
                        })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        title="Toggle Badge Pill"
                      />
                    </div>

                    {editingPreset.badgeSlot?.enabled !== false && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-gray-600 font-semibold">Badge Colors</label>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-500 font-medium">BG:</span>
                              <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-gray-300 shadow-2xs">
                                <input
                                  type="color"
                                  value={editingPreset.badgeSlot?.bgColor || '#eff6ff'}
                                  onChange={(e) => handleUpdateEditing({
                                    badgeSlot: { ...editingPreset.badgeSlot, bgColor: e.target.value }
                                  })}
                                  className="w-4 h-3.5 rounded-xs cursor-pointer border-0 p-0 shrink-0"
                                />
                                <span className="text-[10px] font-bold font-mono text-gray-700">
                                  {editingPreset.badgeSlot?.bgColor || '#eff6ff'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-500 font-medium">Text:</span>
                              <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-gray-300 shadow-2xs">
                                <input
                                  type="color"
                                  value={editingPreset.badgeSlot?.textColor || '#1d4ed8'}
                                  onChange={(e) => handleUpdateEditing({
                                    badgeSlot: { ...editingPreset.badgeSlot, textColor: e.target.value }
                                  })}
                                  className="w-4 h-3.5 rounded-xs cursor-pointer border-0 p-0 shrink-0"
                                />
                                <span className="text-[10px] font-bold font-mono text-gray-700">
                                  {editingPreset.badgeSlot?.textColor || '#1d4ed8'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                          <label className="text-[11px] text-gray-600 font-semibold">Display Format</label>
                          <select
                            value={editingPreset.badgeSlot?.displayMode || 'value_only'}
                            onChange={(e) => handleUpdateEditing({
                              badgeSlot: { ...editingPreset.badgeSlot, displayMode: e.target.value as any }
                            })}
                            className="px-2 py-0.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 shadow-2xs cursor-pointer"
                          >
                            <option value="value_only">Value Only (2026-2027)</option>
                            <option value="label_and_value">Label & Value (Year: 2026-2027)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                          <label className="text-[11px] text-gray-600 font-semibold">Mapped Field</label>
                          <select
                            value={editingPreset.badgeSlot?.fieldVar || 'year'}
                            onChange={(e) => handleDropToSlot('badgeSlot', e.target.value)}
                            className="px-2 py-0.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-blue-700 shadow-2xs cursor-pointer max-w-[190px]"
                          >
                            {(currentModuleSchema?.fields || [
                              { name: 'year', label: 'Academic Year' },
                              { name: 'title', label: 'Title' },
                              { name: 'branch', label: 'Branch' },
                              { name: 'semester', label: 'Semester' },
                              { name: 'section', label: 'Section' },
                            ]).map((f) => (
                              <option key={f.name} value={f.name}>{f.label} ({f.name})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. Subtitle & Detail Lines Settings */}
                  <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-800">5. Subtitle & Detail Lines</label>
                      <input
                        type="checkbox"
                        checked={editingPreset.subtitleSlot?.enabled !== false}
                        onChange={(e) => handleUpdateEditing({
                          subtitleSlot: { ...editingPreset.subtitleSlot, enabled: e.target.checked }
                        })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        title="Toggle Subtitle / Detail Lines"
                      />
                    </div>

                    {editingPreset.subtitleSlot?.enabled !== false && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-gray-600 font-semibold">Display Format</label>
                          <select
                            value={editingPreset.subtitleSlot?.displayMode || editingPreset.detailLineMode || 'value_only'}
                            onChange={(e) => {
                              const mode = e.target.value as any;
                              handleUpdateEditing({
                                detailLineMode: mode,
                                subtitleSlot: { ...editingPreset.subtitleSlot, displayMode: mode }
                              });
                            }}
                            className="px-2 py-0.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 shadow-2xs cursor-pointer"
                          >
                            <option value="value_only">Value Only (Food Technology • Sem 1)</option>
                            <option value="label_and_value">Label & Value (Branch: Food Technology)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                          <label className="text-[11px] text-gray-600 font-semibold">Mapped Field</label>
                          <select
                            value={editingPreset.subtitleSlot?.fieldVar || 'recipient'}
                            onChange={(e) => handleDropToSlot('subtitleSlot', e.target.value)}
                            className="px-2 py-0.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-blue-700 shadow-2xs cursor-pointer max-w-[190px]"
                          >
                            {(currentModuleSchema?.fields || [
                              { name: 'recipient', label: 'Program & Semester' },
                              { name: 'branch', label: 'Branch' },
                              { name: 'semester', label: 'Semester' },
                              { name: 'section', label: 'Section' },
                              { name: 'year', label: 'Academic Year' },
                            ]).map((f) => (
                              <option key={f.name} value={f.name}>{f.label} ({f.name})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 6. Footer Right Action Slot */}
                  <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-800">6. Footer Right Action Link</label>
                      <input
                        type="checkbox"
                        checked={editingPreset.footerRightSlot?.enabled !== false}
                        onChange={(e) => handleUpdateEditing({
                          footerRightSlot: { ...editingPreset.footerRightSlot, enabled: e.target.checked }
                        })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {editingPreset.footerRightSlot?.enabled !== false && (
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-600 block mb-1">Action Text Label</label>
                          <input
                            type="text"
                            value={editingPreset.footerRightSlot.label || 'Download PDF'}
                            onChange={(e) => handleUpdateEditing({
                              footerRightSlot: { ...editingPreset.footerRightSlot, label: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white font-medium"
                            placeholder="Download PDF"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <label className="text-[11px] text-gray-600 font-semibold">Show Arrow Icon ↗</label>
                          <input
                            type="checkbox"
                            checked={editingPreset.footerRightSlot.showArrow !== false}
                            onChange={(e) => handleUpdateEditing({
                              footerRightSlot: { ...editingPreset.footerRightSlot, showArrow: e.target.checked }
                            })}
                            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                          <label className="text-[11px] text-gray-600 font-semibold">Mapped Link Field</label>
                          <select
                            value={editingPreset.footerRightSlot?.fieldVar || 'pdf_url'}
                            onChange={(e) => handleDropToSlot('footerRightSlot', e.target.value)}
                            className="px-2 py-0.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-blue-700 shadow-2xs cursor-pointer max-w-[190px]"
                          >
                            {(currentModuleSchema?.fields || [
                              { name: 'pdf_url', label: 'PDF Document Link' },
                              { name: 'link', label: 'External URL' },
                              { name: 'title', label: 'Title' },
                            ]).map((f) => (
                              <option key={f.name} value={f.name}>{f.label} ({f.name})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 7. Card Aesthetics & Geometry Panel */}
                  <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-800 block">7. Card Aesthetics & Geometry</label>
                      <input
                        type="checkbox"
                        checked={editingPreset.showDivider !== false || (editingPreset.shadowSize && editingPreset.shadowSize !== 'none') || (editingPreset.borderRadius && editingPreset.borderRadius !== 'none')}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          if (!isChecked) {
                            handleUpdateEditing({ showDivider: false, shadowSize: 'none', borderRadius: 'none' });
                          } else {
                            handleUpdateEditing({ showDivider: true, shadowSize: 'md', borderRadius: 'md' });
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        title="Toggle Aesthetics & Geometry"
                      />
                    </div>

                    {(editingPreset.showDivider !== false || (editingPreset.shadowSize && editingPreset.shadowSize !== 'none') || (editingPreset.borderRadius && editingPreset.borderRadius !== 'none')) && (
                      <>
                        {/* a. Horizontal Divider Line */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <label className="text-[11px] font-semibold text-gray-600 flex items-center gap-2 cursor-pointer">
                            <span>a. Show divider line?</span>
                            <input
                              type="checkbox"
                              checked={editingPreset.showDivider !== false}
                              onChange={(e) => handleUpdateEditing({ showDivider: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer accent-blue-600"
                            />
                          </label>
                        </div>

                        {/* b. Shadows */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[11px] font-semibold text-gray-600 block">b. Card Shadows</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'none', label: 'None' },
                              { id: 'sm', label: 'Subtle' },
                              { id: 'md', label: 'Medium' },
                              { id: 'lg', label: 'Floating' },
                            ].map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleUpdateEditing({ shadowSize: s.id as any })}
                                className={`py-1 text-center font-bold text-[10px] rounded border transition-all cursor-pointer ${
                                  (editingPreset.shadowSize || 'none') === s.id
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* c. Corner Radius */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[11px] font-semibold text-gray-600 block">c. Corner Radius</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'none', label: 'None' },
                              { id: 'sm', label: '8px' },
                              { id: 'md', label: '16px' },
                            ].map((r) => (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => handleUpdateEditing({ borderRadius: r.id as any })}
                                className={`py-1 text-center font-bold text-[10px] rounded border transition-all cursor-pointer ${
                                  (editingPreset.borderRadius || 'md') === r.id
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {r.label}
                              </button>
                            ))}
                            {/* Custom Input Box */}
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={
                                  !['none', 'sm', 'md'].includes(String(editingPreset.borderRadius || ''))
                                    ? editingPreset.borderRadius || ''
                                    : ''
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateEditing({ borderRadius: val !== '' ? parseInt(val, 10) as any : 'none' });
                                }}
                                placeholder="Custom"
                                title="Enter custom corner radius (px)"
                                className={`w-full py-1 px-1 text-center font-bold text-[10px] rounded border transition-all focus:outline-none ${
                                  !['none', 'sm', 'md'].includes(String(editingPreset.borderRadius || ''))
                                    ? 'bg-blue-50 text-blue-700 border-blue-600 ring-1 ring-blue-500/30'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 8. Dedicated Hover Effect Panel */}
                  <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-2">
                    <label className="font-bold text-gray-800 block">8. Hover Effect Settings</label>

                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {[
                        { id: 'none', label: 'Static' },
                        { id: 'lift', label: 'Lift' },
                        { id: 'scale', label: 'Scale' },
                        { id: 'glow', label: 'Glow' },
                      ].map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => handleUpdateEditing({ hoverEffect: h.id as any })}
                          className={`py-1.5 px-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                            (editingPreset.hoverEffect || 'none') === h.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* 9. Tweak HTML — Advanced Layout Editor */}
                  <div className="border border-indigo-100 rounded-xl bg-indigo-50/40">
                    <button
                      type="button"
                      onClick={() => {
                        if (!showTweakHtml) {
                          const styleId = editingPreset.isCustom ? 'style-1' : (
                            editingPreset.presetStyleType === 'official' ? 'style-1' :
                            editingPreset.presetStyleType === 'minimal' ? 'style-2' :
                            editingPreset.presetStyleType === 'gradient-banner' ? 'style-3' :
                            editingPreset.presetStyleType === 'split-card' ? 'style-4' : 'style-1'
                          );
                          const baseHtml = editingPreset.htmlTemplate || DEFAULT_CARD_HTML_TEMPLATES[styleId] || DEFAULT_CARD_HTML_TEMPLATES['style-1'] || '';
                          setHtmlCode(baseHtml);
                        }
                        setShowTweakHtml(prev => !prev);
                      }}
                      className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer group rounded-xl"
                    >
                      <span className="flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5" />
                        9. Tweak HTML Layout
                      </span>
                      <span className={`text-indigo-400 transition-transform duration-200 ${showTweakHtml ? 'rotate-180' : ''}`}>
                        ▾
                      </span>
                    </button>

                    {showTweakHtml && (
                      <div className="px-3.5 pb-3.5 space-y-2">
                        <p className="text-[10px] text-indigo-600/80 leading-relaxed">
                          Edit Tailwind classes for alignment, spacing, typography. Keep{' '}
                          <code className="bg-white text-indigo-700 px-1 rounded font-mono border border-indigo-200">data-slot="..."</code>{' '}
                          attributes — they wire your fields. The right panel shows a live preview.
                        </p>
                        <textarea
                          value={htmlCode}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHtmlCode(val);
                            setEditingPreset(prev => prev ? { ...prev, htmlTemplate: val } : prev);
                          }}
                          spellCheck={false}
                          className="w-full h-48 p-3 text-[11px] font-mono bg-gray-900 text-green-300 rounded-xl border border-gray-700 resize-y outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed"
                          placeholder={'<div class="p-5 space-y-4">...</div>'}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-indigo-500 italic flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            Auto-applies · saved via <strong className="not-italic text-indigo-700">Save &amp; Publish</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const styleId = editingPreset.isCustom ? 'style-1' : (
                                editingPreset.presetStyleType === 'official' ? 'style-1' :
                                editingPreset.presetStyleType === 'minimal' ? 'style-2' :
                                editingPreset.presetStyleType === 'gradient-banner' ? 'style-3' :
                                editingPreset.presetStyleType === 'split-card' ? 'style-4' : 'style-1'
                              );
                              const orig = DEFAULT_CARD_HTML_TEMPLATES[styleId] || '';
                              setHtmlCode(orig);
                              setEditingPreset(prev => prev ? { ...prev, htmlTemplate: orig } : prev);
                            }}
                            className="text-[10px] text-gray-400 hover:text-red-500 underline cursor-pointer transition-colors"
                          >
                            Reset to default
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

                  {/* Step 3 Right Panel (7 cols): Studio Canvas for Final Production Card */}
                  <div className="lg:col-span-7 bg-slate-100/80 p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col items-center justify-between min-h-[560px] space-y-4">
                    <div className="flex items-center justify-between w-full border-b border-gray-200/60 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Step 3: Colors & Style Factors (Production Preview)</span>
                      </div>
                      <div className="bg-white border border-gray-200 p-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setViewMode('blueprint')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            viewMode === 'blueprint' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Blueprint
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('sample')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            viewMode === 'sample' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Live Sample
                        </button>
                      </div>
                    </div>

                    <div className="w-full max-w-[420px] my-auto">
                      {showTweakHtml && htmlCode ? (
                        // When Tweak HTML is open: swap to live HTML-rendered preview
                        <div className="flex flex-col gap-2">
                          {/* Label floats above the card, clearly outside it */}
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500">
                              Live HTML Preview
                            </span>
                          </div>
                          {/* Pure card HTML — no inner header */}
                          <div className="rounded-2xl border-2 border-dashed border-indigo-300 bg-white shadow-md overflow-hidden">
                            <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                          </div>
                        </div>
                      ) : (
                        <CardPresetView 
                          preset={editingPreset} 
                          sampleData={currentModuleSchema?.sampleData}
                          wizardStep={3}
                          viewMode={viewMode}
                        />
                      )}
                    </div>

                    <div className="w-full border-t border-gray-200/60 pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setWizardStep(2)}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back: Decide Fields</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveDrawer}
                        className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save & Publish Template</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom HTML Editor Modal (Opened on click of Custom HTML card) */}
            {showHtmlEditor && (
              <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <Code className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900">Custom HTML Card Template</h3>
                        <p className="text-[11px] text-gray-500">
                          Tag any element with <code className="bg-white px-1 py-0.5 rounded text-indigo-700 font-bold border border-indigo-200">class="dynamicFieldDeclaration"</code> and <code className="bg-white px-1 py-0.5 rounded text-indigo-700 font-bold border border-indigo-200">data-slot="..."</code>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowHtmlEditor(false)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    {/* Quick Insert Buttons */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-gray-700 block">Quick Insert Dynamic Slot Tags:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleInsertSlotTag('badgeSlot')}
                          className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg border border-gray-200 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                        >
                          + 🏷️ Badge Area
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertSlotTag('titleSlot')}
                          className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg border border-gray-200 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                        >
                          + 📌 Main Title
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertSlotTag('subtitleSlot')}
                          className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg border border-gray-200 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                        >
                          + 📝 Subtitle Area
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertSlotTag('footerRightSlot')}
                          className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-md border border-gray-200 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                        >
                          + 🔗 Action Link
                        </button>
                      </div>
                    </div>

                    {/* Monospace Code Editor */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700">HTML Markup:</label>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {extractDynamicSlots(htmlCode || '').length} slots detected
                        </span>
                      </div>
                      <textarea
                        value={htmlCode}
                        onChange={(e) => {
                          setHtmlCode(e.target.value);
                          handleUpdateEditing({ htmlTemplate: e.target.value });
                        }}
                        rows={13}
                        className="w-full font-mono text-xs p-4 bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y leading-relaxed"
                        placeholder="Paste or write HTML here..."
                      />
                    </div>

                    {/* Detected slots list */}
                    <div className="flex flex-wrap items-center gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-xs font-bold text-gray-600">Detected Droppable Slots:</span>
                      {extractDynamicSlots(htmlCode || '').map((slot) => (
                        <span key={slot} className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
                          <Check className="w-3 h-3 text-emerald-700" />
                          {slot === 'badgeSlot' ? '🏷️ Badge Area' :
                           slot === 'titleSlot' ? '📌 Main Title' :
                           slot === 'subtitleSlot' ? '📝 Subtitle Area' :
                           slot === 'footerRightSlot' ? '🔗 Action Link' :
                           slot === 'mediaSlot' ? '🖼️ Media Box' : slot}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/80">
                    <button
                      type="button"
                      onClick={() => setShowHtmlEditor(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateEditing({ 
                          htmlTemplate: htmlCode,
                          presetStyleType: 'custom',
                          isCustom: true
                        });
                        setShowHtmlEditor(false);
                        setToastMessage('Custom HTML layout applied!');
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply Custom HTML & Close</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Upfront Module Selection Modal for New Template */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Create Card Template</h3>
                <p className="text-xs text-gray-500">Select which module this card template will be designed for:</p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {allModuleSchemas.map((schema) => (
                <button
                  key={schema.id}
                  type="button"
                  onClick={() => handleOpenNewWithModule(schema.id)}
                  className="w-full p-3.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/60 flex items-center justify-between transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {schema.id === 'timetable' ? '📅' :
                       schema.id === 'aqar' ? '📜' :
                       schema.id === 'affiliation' ? '🏛️' :
                       schema.id === 'results' ? '🏆' : '📊'}
                    </span>
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-900 group-hover:text-blue-700">
                        {schema.name}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {schema.fields.length} available fields ({schema.fields.map(f => f.label).slice(0, 3).join(', ')}...)
                      </p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-blue-600 group-hover:text-white text-gray-400 flex items-center justify-center transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-gray-400" />
              <span>Target module is selected upfront to prevent slot mapping conflicts.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
