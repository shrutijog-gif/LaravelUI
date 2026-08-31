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
  ModuleSchema
} from '../../../utils/cardPresets';
import { getStoredStudioTemplates } from '../../../data/mockStudioData';

export const CardBuilderStudio: React.FC = () => {
  const [presets, setPresets] = useState<CardSlotConfig[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<CardSlotConfig | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [activeDragField, setActiveDragField] = useState<string | null>(null);
  const [activeSlotName, setActiveSlotName] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newCustomVarName, setNewCustomVarName] = useState<string>('');
  const [userCustomVars, setUserCustomVars] = useState<{ name: string; label: string }[]>([]);
  const [viewMode, setViewMode] = useState<'blueprint' | 'sample'>('blueprint');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadPresets = () => {
    const list = getStoredCardPresets();
    const filtered = list.filter(p => ['style-1', 'style-2', 'style-3', 'style-4'].includes(p.id) || p.id.startsWith('style-custom-'));
    setPresets(filtered);
  };

  useEffect(() => {
    loadPresets();
    const handleUpdate = () => loadPresets();
    window.addEventListener('card-presets-updated', handleUpdate);
    return () => window.removeEventListener('card-presets-updated', handleUpdate);
  }, []);

  const handleOpenNew = () => {
    const newPreset = createNewCardPreset();
    setEditingPreset(newPreset);
    setViewMode('blueprint');
    setIsDrawerOpen(true);
  };

  const handleEdit = (preset: CardSlotConfig) => {
    setEditingPreset(JSON.parse(JSON.stringify(preset)));
    setViewMode('blueprint');
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
      saveCardPreset(editingPreset);
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

  // Dynamic Module Schemas (Built-in + Module Studio Dynamic Entities)
  const studioTemplates = getStoredStudioTemplates();
  const dynamicSchemas: ModuleSchema[] = studioTemplates.map((t) => ({
    id: t.schema.slug || t.id,
    name: t.schema.name,
    fields: t.schema.fields.map((f) => ({
      name: f.key,
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
        <h1 className="text-xl font-bold text-gray-900">Card Builder Studio</h1>

        <div className="flex items-center gap-3">
          {/* Reset Styles Button */}
          <button
            onClick={handleResetStyles}
            className="px-3 py-1.5 rounded-lg border border-gray-200/80 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Discard all changes and restore original default card styles"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reset Styles</span>
          </button>

          {/* Blueprint / Live Sample Toggle */}
          <div className="bg-gray-100 p-1 rounded-lg border border-gray-200/80 flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => setViewMode('blueprint')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'blueprint'
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Blueprint Slots
            </button>
            <button
              onClick={() => setViewMode('sample')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'sample'
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Live Sample Data
            </button>
          </div>

          <button
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-2"
          >
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

      {/* Main Preset Gallery Grid */}
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
                  {preset.isCustom ? (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 shrink-0 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Custom
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/80 shrink-0">
                      Default
                    </span>
                  )}
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
                  {preset.isCustom && (
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
                  )}
                </div>
              </div>

              <div className="p-4 bg-white">
                {/* Visual Card Preview */}
                <CardPresetView preset={preset} sampleData={currentModuleSchema?.sampleData} viewMode={viewMode} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-Viewport Studio Drawer (Portalled to document.body for 100% full-screen coverage) */}
      {isDrawerOpen && editingPreset && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] overflow-hidden bg-black/50 flex justify-end animate-fade-in">
          <div className="w-full max-w-[96vw] bg-white shadow-2xl flex flex-col h-full">
            
            {/* Studio Drawer Top Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {editingPreset.isCustom ? 'Advanced Studio Workstation' : 'Preset Quick Customize'}
                </span>
                <span className="text-gray-300">|</span>
                
                {/* Inline Editable Preset Title */}
                <div className="flex items-center gap-1.5 group">
                  <input
                    type="text"
                    value={editingPreset.name}
                    onChange={(e) => handleUpdateEditing({ name: e.target.value })}
                    style={{ width: `${Math.max(editingPreset.name.length + 1, 15)}ch` }}
                    className="text-base font-extrabold text-gray-900 bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/40 px-2 py-0.5 rounded-md outline-none transition-all cursor-pointer"
                  />
                  <Edit3 className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>

                {editingPreset.isCustom && (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    Custom Layout
                  </span>
                )}
              </div>

              {/* Header Action Buttons & View Toggle */}
              <div className="flex items-center gap-3">
                {/* Blueprint / Live Sample Toggle inside Drawer Header */}
                <div className="bg-gray-100 p-1 rounded-lg border border-gray-200/80 flex items-center gap-1 shadow-2xs">
                  <button
                    onClick={() => setViewMode('blueprint')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'blueprint'
                        ? 'bg-white text-blue-700 shadow-xs border border-gray-200/80'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Blueprint Slots
                  </button>
                  <button
                    onClick={() => setViewMode('sample')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'sample'
                        ? 'bg-white text-blue-700 shadow-xs border border-gray-200/80'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Live Sample Data
                  </button>
                </div>

                <div className="h-4 w-px bg-gray-200" />

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setEditingPreset(null);
                  }}
                  className="px-4 py-1.5 rounded-[4px] border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDrawer}
                  className="px-4 py-1.5 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Studio Drawer Content: 2 Clean Columns (Canvas 7 cols, Property & Design Controls 5 cols) */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gray-50/50">
              
              {/* Column 1: Interactive Studio Canvas (7 cols - Centered Card Preview) */}
              <div className="lg:col-span-7 bg-slate-100/80 p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col items-center justify-between h-fit space-y-4">
                <div className="flex items-center justify-between w-full border-b border-gray-200/60 pb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <Eye className="w-4 h-4 text-blue-600" /> Interactive Studio Canvas
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {viewMode === 'blueprint' ? '📐 Blueprint Slots Mode' : '👁️ Live Sample Data Mode'}
                  </span>
                </div>

                <div className="w-full max-w-[420px] my-auto">
                  <CardPresetView 
                    preset={editingPreset} 
                    sampleData={currentModuleSchema?.sampleData}
                    viewMode={viewMode}
                    onDropToSlot={handleDropToSlot}
                    activeDragField={activeDragField}
                    onSelectSlot={setActiveSlotName}
                    activeSlotName={activeSlotName}
                  />
                </div>

                {/* Bottom Divider & Muted Note Section */}
                <div className="w-full border-t border-gray-200/50 pt-3 mt-1 space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Note:
                  </span>
                  <p className="text-[10px] text-gray-400 font-normal leading-relaxed">
                    This card layout template is optimized to display up to 5 primary visual regions:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-gray-400 pt-0.5">
                    <div>• <span className="text-gray-500 font-medium">Media Box:</span> Icon, Image, or Initials</div>
                    <div>• <span className="text-gray-500 font-medium">Badge Pill:</span> Status or Category tag</div>
                    <div>• <span className="text-gray-500 font-medium">Title:</span> Main heading text</div>
                    <div>• <span className="text-gray-500 font-medium">Detail Lines:</span> 1–3 key metadata fields</div>
                    <div className="sm:col-span-2">• <span className="text-gray-500 font-medium">Footer Action:</span> Action link or button</div>
                  </div>
                </div>
              </div>
              {/* Column 2: Property Controls, Design Settings & Label Modes (5 cols) */}
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

                    {/* Badge Pill Custom Color Overrides */}
                    <div className="pt-2.5 border-t border-gray-200/60 flex items-center justify-between">
                      <label className="text-xs text-gray-700 font-semibold">Badge Pill Colors</label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500 font-medium">BG:</span>
                          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-gray-300">
                            <input
                              type="color"
                              value={editingPreset.badgeSlot?.bgColor || '#eff6ff'}
                              onChange={(e) => handleUpdateEditing({
                                badgeSlot: { ...editingPreset.badgeSlot, bgColor: e.target.value }
                              })}
                              className="w-4 h-3.5 rounded-xs cursor-pointer border-0 p-0 shrink-0"
                              title="Badge Pill Background Color"
                            />
                            <span className="text-[10px] font-bold font-mono text-gray-700">
                              {editingPreset.badgeSlot?.bgColor || '#eff6ff'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500 font-medium">Text:</span>
                          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-gray-300">
                            <input
                              type="color"
                              value={editingPreset.badgeSlot?.textColor || '#1d4ed8'}
                              onChange={(e) => handleUpdateEditing({
                                badgeSlot: { ...editingPreset.badgeSlot, textColor: e.target.value }
                              })}
                              className="w-4 h-3.5 rounded-xs cursor-pointer border-0 p-0 shrink-0"
                              title="Badge Pill Text Color"
                            />
                            <span className="text-[10px] font-bold font-mono text-gray-700">
                              {editingPreset.badgeSlot?.textColor || '#1d4ed8'}
                            </span>
                          </div>
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

                  {/* 4. Footer Right Action Slot */}
                  <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-800">4. Footer Right Action Link</label>
                      <input
                        type="checkbox"
                        checked={editingPreset.footerRightSlot?.enabled}
                        onChange={(e) => handleUpdateEditing({
                          footerRightSlot: { ...editingPreset.footerRightSlot, enabled: e.target.checked }
                        })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {editingPreset.footerRightSlot?.enabled && (
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-600 block mb-1">Action Text Label</label>
                          <input
                            type="text"
                            value={editingPreset.footerRightSlot.label}
                            onChange={(e) => handleUpdateEditing({
                              footerRightSlot: { ...editingPreset.footerRightSlot, label: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                            placeholder="View Document"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <label className="text-[11px] text-gray-600 font-semibold">Show Arrow Icon ↗</label>
                          <input
                            type="checkbox"
                            checked={editingPreset.footerRightSlot.showArrow}
                            onChange={(e) => handleUpdateEditing({
                              footerRightSlot: { ...editingPreset.footerRightSlot, showArrow: e.target.checked }
                            })}
                            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. Card Aesthetics & Geometry Panel */}
                  <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-800 block">5. Card Aesthetics & Geometry</label>
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

                  {/* 6. Dedicated Hover Effect Panel */}
                  <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-2">
                    <label className="font-bold text-gray-800 block">6. Hover Effect Settings</label>

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

                  {/* 7. Slot Text Formatting */}
                  <div className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-2.5">
                    <label className="font-bold text-gray-800 block">7. Slot Text Formatting</label>

                    <div className="space-y-2 pt-1">
                      {/* Subtitle / Details Slot */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-700 font-semibold">Subtitle / Detail Lines</span>
                        <select
                          value={editingPreset.subtitleSlot?.displayMode || editingPreset.detailLineMode || 'value_only'}
                          onChange={(e) => {
                            const mode = e.target.value as any;
                            handleUpdateEditing({
                              detailLineMode: mode,
                              subtitleSlot: { ...editingPreset.subtitleSlot, displayMode: mode }
                            });
                          }}
                          className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer"
                        >
                          <option value="value_only">Value Only</option>
                          <option value="label_and_value">Label & Value</option>
                        </select>
                      </div>

                      {/* Badge Slot */}
                      {editingPreset.badgeSlot?.enabled !== false && (
                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                          <span className="text-xs text-gray-700 font-semibold">Badge Pill</span>
                          <select
                            value={editingPreset.badgeSlot?.displayMode || 'value_only'}
                            onChange={(e) => handleUpdateEditing({
                              badgeSlot: { ...editingPreset.badgeSlot, displayMode: e.target.value as any }
                            })}
                            className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer"
                          >
                            <option value="value_only">Value Only</option>
                            <option value="label_and_value">Label & Value</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
