import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { StudioTemplate, ModuleSchema } from '../../../../types/moduleStudio';
import { getStoredStudioTemplates, saveStudioTemplates } from '../../../../data/mockStudioData';
import { naacCriteriaList } from '../../../../data/naacCriteriaData';
import { StudioFieldsEditor } from './StudioFieldsEditor';
import { StudioLayoutCanvas } from './StudioLayoutCanvas';
import { DynamicModuleBlock } from '../../../storefront/blocks/DynamicModuleBlock';
import {
  Plus, Search, Edit3, Settings2, Trash2, Copy, Eye, X, Check, Layers,
  Award, Calendar, FileText, Sparkles, ShieldCheck, ArrowRight
} from 'lucide-react';

export const ModuleStudio: React.FC = () => {
  const [templates, setTemplates] = useState<StudioTemplate[]>(() => getStoredStudioTemplates());
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fields' | 'accreditation'>('fields');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const selectedTemplate = templates.find(t => t.schema.slug === selectedSlug) || null;

  const handleOpenConfig = (slug: string) => {
    setSelectedSlug(slug);
    setActiveTab('fields');
    setIsDrawerOpen(true);
  };

  const handleCreateNewModule = () => {
    const newSlug = `custom_module_${Date.now().toString().slice(-4)}`;
    const newTemplate: StudioTemplate = {
      schema: {
        id: `mod-${Date.now()}`,
        name: '',
        slug: newSlug,
        description: '',
        category: '',
        status: 'draft',
        version: 'v1 (draft)',
        iconName: 'Sparkles',
        fields: [
          { id: 'f1', name: 'title', label: 'Title', type: 'text', required: true, showInCard: true, showInTable: true, placeholder: 'Enter Title...' },
          { id: 'f2', name: 'description', label: 'Description', type: 'textarea', required: false, showInCard: true, showInTable: true, placeholder: 'Enter description...' },
        ],
        displayConfig: {
          defaultView: 'card',
          cardStyle: 'style-1',
          tableStyle: 'table-1',
          columns: 3,
          showTitle: true,
          showSearch: true,
          showCategoryFilter: true,
          primaryActionLabel: 'View Details',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      sampleItems: [],
    };

    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    saveStudioTemplates(updated);
    setSelectedSlug(newSlug);
    setIsDrawerOpen(true);
  };

  const handleUpdateCurrentSchema = (updatedSchema: Partial<ModuleSchema>) => {
    if (!selectedSlug) return;
    const updatedTemplates = templates.map(t =>
      t.schema.slug === selectedSlug
        ? {
            ...t,
            schema: {
              ...t.schema,
              ...updatedSchema,
              updatedAt: new Date().toISOString(),
            },
          }
        : t
    );
    setTemplates(updatedTemplates);
    saveStudioTemplates(updatedTemplates);
  };

  const handleSaveDraft = () => {
    saveStudioTemplates(templates);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handlePublish = () => {
    handleUpdateCurrentSchema({ status: 'published' });
    handleSaveDraft();
  };

  const handleCloneModule = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = templates.find(t => t.schema.slug === slug);
    if (!target) return;

    const clonedSlug = `${target.schema.slug}_copy_${Date.now().toString().slice(-3)}`;
    const cloned: StudioTemplate = {
      ...target,
      schema: {
        ...target.schema,
        id: `mod-${Date.now()}`,
        name: `${target.schema.name} (Copy)`,
        slug: clonedSlug,
        status: 'draft',
        version: 'v1 (draft)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    const updated = [cloned, ...templates];
    setTemplates(updated);
    saveStudioTemplates(updated);
  };

  const handleDeleteModule = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (templates.length <= 1) return;
    const updated = templates.filter(t => t.schema.slug !== slug);
    setTemplates(updated);
    saveStudioTemplates(updated);
    if (selectedSlug === slug) {
      setIsDrawerOpen(false);
      setSelectedSlug(null);
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.schema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.schema.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.schema.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getModuleIcon = (slug: string) => {
    if (slug === 'awards') return <Award className="w-5 h-5 text-amber-500" />;
    if (slug === 'timetables') return <Calendar className="w-5 h-5 text-blue-500" />;
    if (slug === 'reports') return <FileText className="w-5 h-5 text-indigo-500" />;
    return <Sparkles className="w-5 h-5 text-purple-500" />;
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Module Studio</h1>
        </div>

        <button
          onClick={handleCreateNewModule}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {/* 2. Controls & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search configured modules..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <strong>{filteredTemplates.length}</strong> configured modules
        </div>
      </div>

      {/* 3. Clean 2-Column Table Gallery of Modules */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200">
                <th className="py-3.5 px-6 w-2/5">Module</th>
                <th className="py-3.5 px-6 w-2/5">Details</th>
                <th className="py-3.5 px-6 text-right w-1/5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredTemplates.map(template => {
                const { schema } = template;
                const fieldNames = schema.fields.map(f => f.label).join(', ');

                return (
                  <tr
                    key={schema.id}
                    onClick={() => handleOpenConfig(schema.slug)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* Column 1: Module Name */}
                    <td className="py-4 px-6">
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                          {schema.name || <span className="text-gray-400 italic font-normal">(Untitled Module)</span>}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm line-clamp-1">
                          {schema.description}
                        </p>
                      </div>
                    </td>

                    {/* Column 2: Details & Config Summary */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-800 font-medium">
                          <Layers className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span>{schema.fields.length} Configured Fields:</span>
                        </div>
                        <p className="text-xs text-gray-500 font-normal truncate max-w-md">
                          {fieldNames}
                        </p>
                      </div>
                    </td>

                    {/* Column 3: Status & Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          schema.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {schema.status === 'published' ? 'Published' : 'Draft'}
                        </span>

                        <button
                          onClick={() => handleOpenConfig(schema.slug)}
                          className="inline-flex items-center gap-1 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300 transition-all shadow-2xs"
                        >
                          <Settings2 className="w-3.5 h-3.5" /> Configure
                        </button>

                        <button
                          onClick={(e) => handleCloneModule(schema.slug, e)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Clone Module"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteModule(schema.slug, e)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Slide-Over Visual Configuration Drawer (Mounted to document.body via Portal) */}
      {isDrawerOpen && selectedTemplate && createPortal(
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999] bg-gray-900/60 backdrop-blur-xs flex justify-end m-0 p-0 overflow-hidden">
          <div className="bg-white w-full max-w-6xl lg:w-[92vw] h-screen max-h-screen my-0 rounded-none border-l border-gray-200 flex flex-col justify-between overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-bold text-lg">
                  {selectedTemplate.schema.name?.trim() ? (
                    <span className="text-gray-900 font-bold">{selectedTemplate.schema.name}</span>
                  ) : (
                    <span className="text-gray-400 font-medium">New Module</span>
                  )}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveDraft}
                  className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {isSavedNotice ? 'Saved!' : 'Save Draft'}
                </button>
                <button
                  onClick={handlePublish}
                  className="text-xs font-bold px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Publish Module
                </button>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Basic Info Header Bar */}
            <div className="px-6 py-3.5 bg-white border-b border-gray-200 shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">
                    Module Title <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.schema.name}
                    onChange={e => handleUpdateCurrentSchema({ name: e.target.value })}
                    placeholder="Enter Module Title (e.g. Awards, Timetables)..."
                    className="w-full text-xs font-medium px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:font-normal placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">Description</label>
                  <input
                    type="text"
                    value={selectedTemplate.schema.description}
                    onChange={e => handleUpdateCurrentSchema({ description: e.target.value })}
                    placeholder="Brief description of this module..."
                    className="w-full text-xs font-medium px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:font-normal placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="px-6 border-b border-gray-200 bg-white shrink-0">
              <nav className="flex space-x-6 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('fields')}
                  className={`py-3 border-b-2 transition-colors ${
                    activeTab === 'fields' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  📋 Fields & Form Builder ({selectedTemplate.schema.fields.length})
                </button>

                <button
                  onClick={() => setActiveTab('accreditation')}
                  className={`py-3 border-b-2 transition-colors ${
                    activeTab === 'accreditation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  🛡️ Accreditation Binding
                </button>
              </nav>
            </div>

            {/* Main Drawer Body */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
              {activeTab === 'fields' && (
                <StudioFieldsEditor
                  fields={selectedTemplate.schema.fields}
                  onChange={updatedFields => handleUpdateCurrentSchema({ fields: updatedFields })}
                />
              )}

              {activeTab === 'accreditation' && (() => {
                const activeCriterionCode = (selectedTemplate.schema as any).naacCriterion || (selectedTemplate.schema.slug === 'timetables' ? 'Criterion 2' : selectedTemplate.schema.slug === 'awards' ? 'Criterion 5' : selectedTemplate.schema.slug === 'reports' ? 'Criterion 6' : '');
                const activeIndicatorCode = (selectedTemplate.schema as any).naacIndicator || (selectedTemplate.schema.slug === 'timetables' ? '2.3.1 Student-Centric Methods' : selectedTemplate.schema.slug === 'awards' ? '5.3.1 Student Sports & Cultural Competitions' : selectedTemplate.schema.slug === 'reports' ? '6.5.1 Internal Quality Assurance Cell (IQAC)' : '');

                const selectedCritObj = naacCriteriaList.find(c => c.code === activeCriterionCode);

                return (
                  <div className="space-y-6 w-full">
                    {/* NAAC Accreditation Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl font-bold text-base">🛡️</span>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">NAAC Accreditation & Criterion Alignment</h3>
                          <p className="text-xs text-gray-500">Configure which NAAC Criteria, Key Indicators, and Metrics entries in this module automatically bind to.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        {/* Criterion Selector */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            1. NAAC Criterion <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={activeCriterionCode}
                            onChange={e => handleUpdateCurrentSchema({ naacCriterion: e.target.value, naacIndicator: '' } as any)}
                            className="w-full text-xs font-medium px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="">-- No NAAC Binding --</option>
                            {naacCriteriaList.map(c => (
                              <option key={c.id} value={c.code}>
                                {c.code}: {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Key Indicator Selector */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            2. Key Indicator (KI)
                          </label>
                          <select
                            value={activeCriterionCode ? (selectedCritObj?.code || '') : ''}
                            disabled={!activeCriterionCode}
                            className="w-full text-xs font-medium px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            <option value="">{selectedCritObj ? `${selectedCritObj.code}: ${selectedCritObj.name}` : '-- Select Criterion First --'}</option>
                          </select>
                        </div>

                        {/* Metric Selector */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            3. Metric (QnM / QlM)
                          </label>
                          <select
                            value={activeIndicatorCode}
                            onChange={e => handleUpdateCurrentSchema({ naacIndicator: e.target.value } as any)}
                            disabled={!activeCriterionCode}
                            className="w-full text-xs font-medium px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            <option value="">-- Select Metric --</option>
                            {selectedCritObj?.indicators.map(ind => (
                              <option key={ind.code} value={`${ind.code} ${ind.name}`}>
                                [{ind.metricType}] {ind.code} - {ind.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Selected NAAC Summary Box */}
                      {activeCriterionCode && activeIndicatorCode && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-900">Active Binding Rule:</span>
                            <span className="text-amber-800 font-medium">Entries auto-link to <strong className="font-bold">{activeCriterionCode}</strong> • Metric <strong className="font-bold">{activeIndicatorCode}</strong></span>
                          </div>
                          <span className="bg-amber-200/80 text-amber-900 font-bold px-2.5 py-1 rounded-lg text-[11px]">Active Link</span>
                        </div>
                      )}
                    </div>

                    {/* NIRF & Additional Institutional Frameworks (Extensible Card) */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                        <span className="p-2.5 bg-blue-100 text-blue-800 rounded-xl font-bold text-base">🏆</span>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">NIRF & Additional Institutional Frameworks</h3>
                          <p className="text-xs text-gray-500">Bind data entries to NIRF Ranking Parameters and NBA Accreditation Standards.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">NIRF Ranking Parameter</label>
                          <select className="w-full text-xs font-medium px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="">-- Unbound --</option>
                            <option value="TLR">TLR - Teaching, Learning & Resources</option>
                            <option value="RPC">RPC - Research & Professional Practice</option>
                            <option value="GO">GO - Graduation Outcomes</option>
                            <option value="OI">OI - Outreach & Inclusivity</option>
                            <option value="PER">PER - Peer Perception</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">NBA Program Metric</label>
                          <select className="w-full text-xs font-medium px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="">-- Unbound --</option>
                            <option value="CO-PO">Course Outcome - Program Outcome Mapping</option>
                            <option value="Student-Performance">Student Performance & Placement</option>
                            <option value="Faculty-Contributions">Faculty Contributions & Cadre Ratio</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
