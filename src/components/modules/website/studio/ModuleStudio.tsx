import React, { useState } from 'react';
import { StudioTemplate, ModuleSchema } from '../../../../types/moduleStudio';
import { getStoredStudioTemplates, saveStudioTemplates } from '../../../../data/mockStudioData';
import { getActiveTenant, setActiveTenantId, getAllTenants } from '../../../../data/tenantData';
import { StudioFieldsEditor } from './StudioFieldsEditor';
import { StudioLayoutCanvas } from './StudioLayoutCanvas';
import { DynamicModuleBlock } from '../../../storefront/blocks/DynamicModuleBlock';
import {
  Layers, Plus, Save, Send, Copy, Trash2, Search, Check, RefreshCw, Download, Upload,
  Sparkles, Code2, Eye, ShieldCheck, UserCheck, Settings, Award, Calendar, FileText
} from 'lucide-react';

export const ModuleStudio: React.FC = () => {
  const tenants = getAllTenants();
  const [activeTenant, setTenantState] = useState(() => getActiveTenant());

  // Role perspective: Super Admin vs College Admin
  const [roleMode, setRoleMode] = useState<'superadmin' | 'collegeadmin'>('superadmin');

  // Studio Templates
  const [templates, setTemplates] = useState<StudioTemplate[]>(() => getStoredStudioTemplates());
  const [selectedSlug, setSelectedSlug] = useState<string>(templates[0]?.schema.slug || 'awards');

  const selectedTemplate = templates.find(t => t.schema.slug === selectedSlug) || templates[0];
  const [activeTab, setActiveTab] = useState<'fields' | 'layout' | 'schema' | 'payload'>('fields');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSelectTemplate = (slug: string) => {
    setSelectedSlug(slug);
  };

  const handleUpdateCurrentSchema = (updatedSchema: Partial<ModuleSchema>) => {
    if (!selectedTemplate) return;
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

  const handleCreateNewTemplate = () => {
    const newSlug = `custom_module_${Date.now()}`;
    const newTemplate: StudioTemplate = {
      schema: {
        id: `mod-${Date.now()}`,
        name: 'New Custom Module',
        slug: newSlug,
        description: 'Define fields and layout for your custom document module.',
        category: 'Custom',
        status: 'draft',
        version: 'v1 (draft)',
        fields: [
          { id: 'f1', name: 'title', label: 'Title', type: 'text', required: true, showInCard: true, showInTable: true },
          { id: 'f2', name: 'category', label: 'Category', type: 'badge', showInCard: true, showInTable: true },
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
  };

  const handleCloneTemplate = () => {
    if (!selectedTemplate) return;
    const clonedSlug = `${selectedTemplate.schema.slug}_copy_${Date.now().toString().slice(-4)}`;
    const cloned: StudioTemplate = {
      ...selectedTemplate,
      schema: {
        ...selectedTemplate.schema,
        id: `mod-${Date.now()}`,
        name: `${selectedTemplate.schema.name} (Copy)`,
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
    setSelectedSlug(clonedSlug);
  };

  const handleDeleteTemplate = () => {
    if (templates.length <= 1) return;
    const updated = templates.filter(t => t.schema.slug !== selectedSlug);
    setTemplates(updated);
    saveStudioTemplates(updated);
    setSelectedSlug(updated[0].schema.slug);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(templates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `module_studio_templates_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredTemplates = templates.filter(t =>
    t.schema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.schema.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100/70 p-4 sm:p-6 space-y-6">
      {/* Clean Page Title Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Module Studio</h1>
      </div>

      {/* Main 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Templates List (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col justify-between min-h-[600px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">MODULES</h3>
              <button
                onClick={handleCreateNewTemplate}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Create New Module"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Template Cards List */}
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredTemplates.map(template => {
                const isSelected = template.schema.slug === selectedSlug;
                return (
                  <div
                    key={template.schema.id}
                    onClick={() => handleSelectTemplate(template.schema.slug)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-xs text-gray-900">{template.schema.name}</h4>
                      <span className="text-[10px] font-mono text-gray-400">/{template.schema.slug}</span>
                    </div>

                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{template.schema.description}</p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        template.schema.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {template.schema.status}
                      </span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">
                        {template.schema.category}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                        {template.schema.version}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={handleCreateNewTemplate}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> + New Module Template
            </button>
          </div>
        </div>

        {/* MIDDLE COLUMN: Template Details & Canvas Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {selectedTemplate ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-5">
              {/* Header Action Buttons */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">{selectedTemplate.schema.name}</h3>
                  <p className="text-xs text-gray-400 font-mono">slug: {selectedTemplate.schema.slug}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveDraft}
                    className="inline-flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-300 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> {isSavedNotice ? 'Saved!' : 'Save Draft'}
                  </button>
                  <button
                    onClick={handlePublish}
                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Publish
                  </button>
                  <button
                    onClick={handleCloneTemplate}
                    className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                    title="Clone Template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteTemplate}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Template Basic Information Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Module Name</label>
                  <input
                    type="text"
                    value={selectedTemplate.schema.name}
                    onChange={e => handleUpdateCurrentSchema({ name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={selectedTemplate.schema.category}
                    onChange={e => handleUpdateCurrentSchema({ category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={selectedTemplate.schema.description}
                    onChange={e => handleUpdateCurrentSchema({ description: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Canvas Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-6 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('fields')}
                    className={`py-2.5 border-b-2 transition-colors ${
                      activeTab === 'fields' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Fields & Metadata ({selectedTemplate.schema.fields.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('layout')}
                    className={`py-2.5 border-b-2 transition-colors ${
                      activeTab === 'layout' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Layout & Styles Canvas
                  </button>

                  <button
                    onClick={() => setActiveTab('schema')}
                    className={`py-2.5 border-b-2 transition-colors ${
                      activeTab === 'schema' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    JSON Explorer
                  </button>
                </nav>
              </div>

              {/* Tab Contents */}
              {activeTab === 'fields' && (
                <StudioFieldsEditor
                  fields={selectedTemplate.schema.fields}
                  onChange={updatedFields => handleUpdateCurrentSchema({ fields: updatedFields })}
                />
              )}

              {activeTab === 'layout' && (
                <StudioLayoutCanvas
                  config={selectedTemplate.schema.displayConfig}
                  onChange={updatedConfig => handleUpdateCurrentSchema({ displayConfig: updatedConfig })}
                />
              )}

              {activeTab === 'schema' && (
                <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[400px]">
                  <pre>{JSON.stringify(selectedTemplate.schema, null, 2)}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
              Select a module template on the left to configure.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Storefront Preview & Test Tenant (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Top Card: Live Storefront Preview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" /> Live Interactive Preview
              </h3>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Real-time Sync
              </span>
            </div>

            {/* Render Live Dynamic Block */}
            <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-200/80 max-h-[520px] overflow-y-auto">
              <DynamicModuleBlock
                moduleSlug={selectedSlug}
                template={selectedTemplate}
                isPreview={true}
              />
            </div>
          </div>

          {/* Bottom Card: Test Tenant Switcher */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
            <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Test Multi-Tenant Scope</h4>
            <p className="text-xs text-gray-500">Switch tenant context to preview college-specific styling.</p>

            <select
              value={activeTenant.id}
              onChange={e => {
                const target = tenants.find(t => t.id === e.target.value);
                if (target) {
                  setActiveTenantId(target.id);
                  setTenantState(target);
                }
              }}
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
