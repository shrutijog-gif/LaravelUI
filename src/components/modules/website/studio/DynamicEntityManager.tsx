import React, { useState, useEffect } from 'react';
import { StudioTemplate, DynamicEntityItem, FieldDefinition } from '../../../../types/moduleStudio';
import { getStoredStudioTemplates, getStoredEntitiesBySlug, saveStoredEntitiesBySlug } from '../../../../data/mockStudioData';
import { getActiveTenant } from '../../../../data/tenantData';
import { naacCriteriaList } from '../../../../data/naacCriteriaData';
import { Drawer } from '../../../common/Drawer';
import { Plus, Search, Trash2, Edit, Eye, EyeOff, Check, X, ShieldCheck, Download, Award, Trophy, BookOpen, GraduationCap, FileText, Layers, Upload, ExternalLink, Globe, Home, MoreHorizontal, AlertCircle } from 'lucide-react';
import { openFileInNewTab, getDocumentLinkInfo } from '../../../../utils/fileHelper';
import { CompositeWorkspaceManager } from './CompositeWorkspaceManager';

interface DynamicEntityManagerProps {
  moduleSlug?: string;
}

export const DynamicEntityManager: React.FC<DynamicEntityManagerProps> = ({ moduleSlug = 'awards' }) => {
  const activeTenant = getActiveTenant();
  const [templates, setTemplates] = useState<StudioTemplate[]>(() => getStoredStudioTemplates());
  const [activeSlug, setActiveSlug] = useState<string>(moduleSlug);

  const selectedTemplate = templates.find(t => t.schema.slug === activeSlug) || templates[0];
  const [items, setItems] = useState<DynamicEntityItem[]>(() => 
    selectedTemplate ? getStoredEntitiesBySlug(selectedTemplate.schema.slug, activeTenant.id) : []
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DynamicEntityItem | null>(null);
  const [managingItem, setManagingItem] = useState<DynamicEntityItem | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    setActiveSlug(moduleSlug);
  }, [moduleSlug]);

  useEffect(() => {
    if (selectedTemplate) {
      setItems(getStoredEntitiesBySlug(selectedTemplate.schema.slug, activeTenant.id));
    }
  }, [activeSlug, activeTenant.id]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalError(null);
    const initialData: Record<string, any> = {};
    if (selectedTemplate) {
      selectedTemplate.schema.fields.forEach(f => {
        initialData[f.name] = f.defaultValue || '';
      });
    }
    setFormData(initialData);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: DynamicEntityItem) => {
    setEditingItem(item);
    setModalError(null);
    setFormData({ ...item.data });
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setModalError(null);

    // Validate required fields and mutual exclusivity
    for (const f of selectedTemplate.schema.fields) {
      if (f.type === 'document_link') {
        const titleVal = formData[`${f.name}_title`] ?? (f.name === 'title' ? formData.title : formData[`${f.name}_text`]);
        const destVal = formData[f.name];
        if (f.required !== false && (!titleVal || !String(titleVal).trim())) {
          setModalError('Please enter a Document Title / Link Text.');
          return;
        }
        if (f.required !== false && (!destVal || !String(destVal).trim())) {
          setModalError('Please attach either a local PDF file OR enter an external website link.');
          return;
        }
      } else if (f.type === 'file_pdf' || f.name.toLowerCase().includes('pdf') || f.label.toLowerCase().includes('pdf')) {
        const destVal = formData[f.name];
        if (f.required && (!destVal || !String(destVal).trim())) {
          setModalError(`Please attach either a local PDF file OR enter an external link for "${f.label}".`);
          return;
        }
      } else if (f.required && (!formData[f.name] || (typeof formData[f.name] === 'string' && !formData[f.name].trim()))) {
        setModalError(`Please fill in the required field "${f.label}".`);
        return;
      }
    }

    const finalData = { ...formData };
    
    // Auto-detect and normalize any uploaded PDF or document across fields
    let detectedFileUrl: string | null = null;
    let detectedFileName: string | null = null;

    // First pass: Prioritize actual uploaded local PDF base64 data URLs
    for (const f of selectedTemplate.schema.fields) {
      const val = finalData[f.name];
      if (val && typeof val === 'string' && (val.startsWith('data:application/pdf') || val.startsWith('data:'))) {
        detectedFileUrl = val;
        detectedFileName = finalData[`${f.name}_filename`] || detectedFileName;
        break;
      }
    }

    // Second pass: Check fields specifically designated as document / PDF
    if (!detectedFileUrl) {
      for (const f of selectedTemplate.schema.fields) {
        const fn = f.name.toLowerCase();
        const fl = f.label.toLowerCase();
        const isPdfField = f.type === 'file_pdf' || f.type === 'document_link' || fn.includes('pdf') || fl.includes('pdf') || fn.includes('file') || fl.includes('file') || fn.includes('doc');
        const val = finalData[f.name];
        if (f.type === 'document_link') {
          // If record does not have a separate title field filled, fall back to this document link title
          if (finalData[`${f.name}_title`] && !finalData.title) {
            finalData.title = finalData[`${f.name}_title`];
          }
        }
        if (isPdfField && val && typeof val === 'string' && val.trim() !== '' && val !== '#') {
          detectedFileUrl = val;
          detectedFileName = finalData[`${f.name}_filename`] || detectedFileName;
          break;
        }
      }
    }

    // Third pass: Check any remaining non-image URL fields
    if (!detectedFileUrl) {
      for (const f of selectedTemplate.schema.fields) {
        if (f.type !== 'image') {
          const val = finalData[f.name];
          if (val && typeof val === 'string' && (val.includes('.pdf') || val.startsWith('http'))) {
            detectedFileUrl = val;
            detectedFileName = finalData[`${f.name}_filename`] || detectedFileName;
            break;
          }
        }
      }
    }

    if (detectedFileUrl) {
      finalData.fileUrl = detectedFileUrl;
      finalData.pdf_url = detectedFileUrl;
      finalData.file = detectedFileUrl;
      finalData.choose_file = detectedFileUrl;
      if (detectedFileName) {
        finalData.fileName = detectedFileName;
        finalData.choose_file_filename = detectedFileName;
        finalData.file_pdf_filename = detectedFileName;
      }
    }

    let updatedItems: DynamicEntityItem[];

    if (editingItem) {
      updatedItems = items.map(item =>
        item.id === editingItem.id
          ? { ...item, data: finalData, updatedAt: new Date().toISOString() }
          : item
      );
    } else {
      const newItem: DynamicEntityItem = {
        id: `ent_${Date.now()}`,
        tenantId: activeTenant.id,
        moduleSlug: selectedTemplate.schema.slug,
        showOnWebsite: true,
        data: finalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedItems = [newItem, ...items];
    }

    setItems(updatedItems);
    saveStoredEntitiesBySlug(selectedTemplate.schema.slug, updatedItems, activeTenant.id);
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    if (!selectedTemplate) return;
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    saveStoredEntitiesBySlug(selectedTemplate.schema.slug, updated, activeTenant.id);
  };

  const handleToggleVisibility = (id: string) => {
    if (!selectedTemplate) return;
    const updated = items.map(item =>
      item.id === id ? { ...item, showOnWebsite: !item.showOnWebsite } : item
    );
    setItems(updated);
    saveStoredEntitiesBySlug(selectedTemplate.schema.slug, updated, activeTenant.id);
  };

  if (!selectedTemplate) return null;

  const { schema } = selectedTemplate;

  // Composite Tabbed Manage Content Workspace (Screenshots 5 & 6)
  if (managingItem && schema.archetype === 'tabbed_composite') {
    return (
      <CompositeWorkspaceManager
        entity={managingItem}
        schema={schema}
        onBack={() => setManagingItem(null)}
        onUpdateEntity={(updated) => {
          const updatedList = items.map(it => it.id === updated.id ? updated : it);
          setItems(updatedList);
          saveStoredEntitiesBySlug(schema.slug, updatedList, activeTenant.id);
          setManagingItem(updated);
        }}
      />
    );
  }

  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(item.data).join(' ').toLowerCase().includes(query);
  });

  return (
    <div className="space-y-4">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Home className="w-3.5 h-3.5 text-gray-400" />
        <span>/</span>
        <span className="font-medium text-gray-800">{schema.slug === 'departments' ? 'Department' : schema.name}</span>
      </div>

      {/* Clean Page Title Header & Add Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{schema.name}</h1>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          {schema.slug === 'departments' ? 'Add Department' : `Add ${schema.name.replace(/s$/, '')}`}
        </button>
      </div>

      {/* Controls & Action Bar matching Screenshot 1 & 3 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Show :</span>
          <select className="border border-gray-300 rounded px-2.5 py-1 text-xs font-medium text-gray-700 bg-white focus:outline-none">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search.."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs">
        <div className="overflow-x-auto min-h-[240px] pb-12 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                {schema.fields.map(f => {
                  const headerText = (f.label.toLowerCase() === 'choose file' || f.name.toLowerCase() === 'choose_file')
                    ? 'File Name'
                    : f.label.toUpperCase();
                  return (
                    <th key={f.id} className="py-3 px-5">{headerText}</th>
                  );
                })}
                <th className="py-3 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={schema.fields.length + 1} className="py-12 text-center text-gray-400 font-medium">
                    No records available
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors group">
                    {schema.fields.map(f => {
                      const val = item.data[f.name];
                      return (
                        <td key={f.id} className="py-3.5 px-5 max-w-xs truncate font-medium text-gray-800">
                          {f.type === 'image' && val ? (
                            <img src={val} alt="Thumbnail" className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                          ) : f.type === 'icon' && val ? (
                            <span className="text-xl inline-block">
                              {val === 'award' || val === 'trophy' ? '🏆' :
                               val === 'calendar' ? '📅' :
                               val === 'book' ? '📚' :
                               val === 'graduation-cap' ? '🎓' :
                               val === 'shield' ? '🛡️' :
                               val === 'layers' ? '⚡' :
                               val === 'globe' ? '🌐' :
                               val === 'download' ? '📥' :
                               val === 'external-link' ? '🔗' :
                               '📄'}
                            </span>
                          ) : f.type === 'document_link' ? (() => {
                            const { text: docText, url: docUrl } = getDocumentLinkInfo(item.data, f);
                            return (
                              <button
                                type="button"
                                onClick={() => openFileInNewTab(docUrl, item.data[`${f.name}_filename`] || docText)}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors cursor-pointer text-left"
                                title={`Click to open ${docText}`}
                              >
                                {docText}
                              </button>
                            );
                          })() : (
                            f.type === 'file_pdf' || 
                            f.name.toLowerCase().includes('file') || 
                            f.name.toLowerCase().includes('pdf') || 
                            f.label.toLowerCase().includes('pdf') || 
                            (typeof val === 'string' && (val.startsWith('data:application/pdf') || val.startsWith('data:') || val.toLowerCase().includes('.pdf') || val.includes('dummy.pdf')))
                          ) && val ? (
                            <button
                              type="button"
                              onClick={() => openFileInNewTab(val, item.data[`${f.name}_filename`])}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors cursor-pointer text-left"
                              title="Click to view/open document"
                            >
                              {item.data[`${f.name}_filename`] || item.data['choose_file_filename'] || item.data['file_pdf_filename'] || (typeof val === 'string' && val.startsWith('data:') ? 'Attached Local File' : 'View Document')}
                            </button>
                          ) : f.type === 'badge' ? (
                            val ? (
                              <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-100">
                                {val}
                              </span>
                            ) : null
                          ) : (
                            <span>{Array.isArray(val) ? val.join(', ') : (val !== undefined && val !== null ? String(val) : '')}</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      {schema.archetype === 'tabbed_composite' ? (
                        <div className="flex items-center justify-end gap-3 relative">
                          <button
                            type="button"
                            onClick={() => setManagingItem(item)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs hover:underline cursor-pointer"
                          >
                            Manage Content
                          </button>
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() => setActionMenuOpenId(actionMenuOpenId === item.id ? null : item.id)}
                              className="p-1 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors"
                              title="Actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {actionMenuOpenId === item.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setActionMenuOpenId(null)}
                                />
                                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuOpenId(null);
                                      handleOpenEditModal(item);
                                    }}
                                    className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 font-medium"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-gray-400" /> Edit Details
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuOpenId(null);
                                      handleDeleteItem(item.id);
                                    }}
                                    className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Add / Edit Slide-Over Drawer */}
      <Drawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit ${schema.name} Entry` : `Add New ${schema.name} Entry`}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="text-xs font-semibold px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const formEl = document.getElementById('dynamic-entity-form') as HTMLFormElement | null;
                if (formEl) formEl.requestSubmit();
              }}
              className="text-xs font-bold px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="p-6">
          <form id="dynamic-entity-form" onSubmit={handleSaveItem} className="space-y-4">
            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}
            {schema.fields.map(field => {
              const getOptions = (): { label: string; value: string }[] => {
                const lname = (field.name + ' ' + field.label).toLowerCase();

                // If field has custom options configured, check if they are valid (not draft junk like "w", "122")
                if (field.options && field.options.length > 0) {
                  const validCustom = field.options.filter(o => o.label && o.label !== 'w' && o.label !== 'x' && o.label !== '122' && o.label.length > 1);
                  // If custom options were explicitly set to numbers 1..8 or clean letters A..D, use them
                  const isCleanCustom = field.options.every(o => o.label && o.label !== 'w' && o.label !== 'x');
                  if (isCleanCustom && field.options.length >= 2 && !lname.includes('year') && !lname.includes('sem') && !lname.includes('sec')) {
                    return field.options;
                  }
                  if (validCustom.length >= 2 && !lname.includes('year') && !lname.includes('sem') && !lname.includes('sec')) {
                    return validCustom;
                  }
                }

                // Standard Academic Year Master
                if (lname.includes('year')) {
                  return [
                    { label: '2026-2027', value: '2026-2027' },
                    { label: '2025-2026', value: '2025-2026' },
                    { label: '2024-2025', value: '2024-2025' },
                    { label: '2023-2024', value: '2023-2024' },
                  ];
                }

                // Standard Semester Master (1, 2, 3, 4, 5, 6, 7, 8)
                if (lname.includes('sem')) {
                  return [
                    { label: '1', value: '1' },
                    { label: '2', value: '2' },
                    { label: '3', value: '3' },
                    { label: '4', value: '4' },
                    { label: '5', value: '5' },
                    { label: '6', value: '6' },
                    { label: '7', value: '7' },
                    { label: '8', value: '8' },
                  ];
                }

                // Standard Section Master (A, B, C, D, All Sections)
                if (lname.includes('section') || lname.includes('sec')) {
                  return [
                    { label: 'A', value: 'A' },
                    { label: 'B', value: 'B' },
                    { label: 'C', value: 'C' },
                    { label: 'D', value: 'D' },
                    { label: 'All Sections', value: 'All Sections' },
                  ];
                }

                // Standard Program / Branch / Stream Master
                if (lname.includes('branch') || lname.includes('program') || lname.includes('stream')) {
                  return [
                    { label: 'Computer Science', value: 'Computer Science' },
                    { label: 'Media Studies', value: 'Media Studies' },
                    { label: 'Commerce & Finance', value: 'Commerce & Finance' },
                    { label: 'MSc Nutrition', value: 'MSc Nutrition' },
                    { label: 'Food Tech', value: 'Food Tech' },
                    { label: 'Pedagogy & Child Dev', value: 'Pedagogy & Child Dev' },
                    { label: 'Finance & HR', value: 'Finance & HR' },
                    { label: 'Agronomy', value: 'Agronomy' },
                  ];
                }

                if (lname.includes('category')) {
                  return [
                    { label: 'Academic', value: 'Academic' },
                    { label: 'Recognition', value: 'Recognition' },
                    { label: 'Research', value: 'Research' },
                  ];
                }

                if (field.options && field.options.length > 0) {
                  return field.options;
                }

                return [
                  { label: 'Option 1', value: 'Option 1' },
                  { label: 'Option 2', value: 'Option 2' },
                  { label: 'Option 3', value: 'Option 3' },
                ];
              };

              const fieldOptions = getOptions();

              return (
                <div key={field.id}>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'select' || field.type === 'badge' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">{field.placeholder || `-- Select ${field.label} --`}</option>
                      {fieldOptions.map((opt, idx) => (
                        <option key={idx} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'radio' ? (
                    <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                      {fieldOptions.map((opt, idx) => {
                        const isSelected = formData[field.name] === opt.value;
                        return (
                          <label
                            key={idx}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                              isSelected ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`field_${field.id}`}
                              value={opt.value}
                              checked={isSelected}
                              onChange={() => setFormData({ ...formData, [field.name]: opt.value })}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                  ) : field.type === 'checkbox' || field.type === 'multiselect' ? (
                    <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                      {fieldOptions.map((opt, idx) => {
                        const currentVals: string[] = Array.isArray(formData[field.name])
                          ? formData[field.name]
                          : formData[field.name] ? [formData[field.name]] : [];
                        const isSelected = currentVals.includes(opt.value);
                        return (
                          <label
                            key={idx}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                              isSelected ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const newVals = isSelected
                                  ? currentVals.filter(v => v !== opt.value)
                                  : [...currentVals, opt.value];
                                setFormData({ ...formData, [field.name]: newVals });
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                  ) : field.type === 'icon' ? (
                    <select
                      value={formData[field.name] || 'file-text'}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="calendar">📅 Calendar / Schedule</option>
                      <option value="award">🏆 Award / Trophy</option>
                      <option value="book">📚 Book / Syllabus</option>
                      <option value="file-text">📄 Document / Manual</option>
                      <option value="shield">🛡️ Shield / Security</option>
                      <option value="layers">⚡ Layers / System</option>
                      <option value="globe">🌐 Globe / Portal</option>
                      <option value="download">📥 Download / File</option>
                      <option value="external-link">🔗 External Link</option>
                    </select>
                  ) : field.type === 'url' ? (
                    <div className="relative">
                      <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder={field.placeholder || "https://example.com/link"}
                        value={formData[field.name] || ''}
                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-mono text-blue-600"
                      />
                    </div>
                  ) : field.type === 'document_link' ? (() => {
                    const hasLocalFile = Boolean(formData[field.name] && typeof formData[field.name] === 'string' && formData[field.name].startsWith('data:'));
                    const externalUrlValue = (formData[field.name] && typeof formData[field.name] === 'string' && !formData[field.name].startsWith('data:')) ? formData[field.name] : '';
                    const hasExternalUrl = Boolean(externalUrlValue.trim() !== '');

                    return (
                      <div className="space-y-3 p-3.5 bg-gray-50/70 rounded-xl border border-gray-200">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Document Title / Link Text <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder={field.placeholder || "Enter Title..."}
                            value={formData[`${field.name}_title`] ?? (field.name === 'title' ? (formData.title || '') : (formData[`${field.name}_text`] || ''))}
                            onChange={e => {
                              const val = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                [`${field.name}_title`]: val,
                                ...(field.name === 'title' ? { title: val } : {}),
                              }));
                            }}
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-gray-900 shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Document File or External Web Link <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            {/* Option A: Choose Local File */}
                            <div className={`flex items-center w-full bg-white border rounded-lg overflow-hidden shadow-2xs transition-all ${
                              hasExternalUrl ? 'opacity-60 border-gray-200 bg-gray-50' : 'border-gray-300 focus-within:ring-2 focus-within:ring-blue-500'
                            }`}>
                              <label className={`px-3.5 py-2 text-xs font-bold border-r border-gray-300 shrink-0 transition-colors ${
                                hasExternalUrl ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 cursor-pointer'
                              }`}>
                                Choose Local File
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                  disabled={hasExternalUrl}
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (evt) => {
                                        const dataUrl = evt.target?.result as string;
                                        setFormData(prev => ({
                                          ...prev,
                                          [field.name]: dataUrl,
                                          [`${field.name}_filename`]: file.name,
                                          fileUrl: dataUrl,
                                          pdf_url: dataUrl,
                                          file: dataUrl,
                                          fileName: file.name,
                                          file_pdf_filename: file.name,
                                          choose_file_filename: file.name,
                                        }));
                                        setModalError(null);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              <span className="px-3 text-xs text-gray-500 truncate flex-1 font-sans">
                                {hasExternalUrl ? (
                                  <span className="text-gray-400 italic">Clear external link below to choose local file</span>
                                ) : (
                                  formData[`${field.name}_filename`] || (hasLocalFile ? 'Local File Attached' : 'No local file chosen')
                                )}
                              </span>
                              {hasLocalFile && (
                                <div className="flex items-center gap-1 mr-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openFileInNewTab(formData[field.name], formData[`${field.name}_filename`])}
                                    className="px-2 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 shrink-0 cursor-pointer"
                                  >
                                    View File
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => {
                                        const nextData = { ...prev };
                                        delete nextData[field.name];
                                        delete nextData[`${field.name}_filename`];
                                        delete nextData.fileUrl;
                                        delete nextData.pdf_url;
                                        delete nextData.file;
                                        return nextData;
                                      });
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="Remove File"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Prominent "OR" divider */}
                            <div className="relative flex py-1 items-center">
                              <div className="flex-grow border-t border-gray-300"></div>
                              <span className="shrink-0 mx-3 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-gray-500 bg-white border border-gray-200 rounded-full shadow-2xs uppercase">
                                OR
                              </span>
                              <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            {/* Option B: External Website / Document URL */}
                            <div className="relative">
                              <Globe className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${hasLocalFile ? 'text-gray-300' : 'text-gray-400'}`} />
                              <input
                                type="text"
                                disabled={hasLocalFile}
                                placeholder={hasLocalFile ? "Local file attached (remove file above to paste link)" : "Paste external website link or document URL (e.g. https://...)"}
                                value={externalUrlValue}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    [field.name]: val,
                                    fileUrl: val,
                                    pdf_url: val,
                                    file: val,
                                  }));
                                  setModalError(null);
                                }}
                                className={`w-full text-xs pl-8 pr-8 py-2 border rounded-lg focus:outline-none transition-all font-mono ${
                                  hasLocalFile
                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed placeholder:text-gray-400 placeholder:italic'
                                    : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-400'
                                }`}
                              />
                              {hasExternalUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => {
                                      const nextData = { ...prev };
                                      delete nextData[field.name];
                                      delete nextData.fileUrl;
                                      delete nextData.pdf_url;
                                      delete nextData.file;
                                      return nextData;
                                    });
                                  }}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
                                  title="Clear URL"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <p className="text-[10px] text-gray-500 italic">
                              * Only one destination can be used: attach a local PDF file OR paste an external website link.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                  : (field.type === 'file_pdf' || field.name.toLowerCase().includes('pdf') || field.label.toLowerCase().includes('pdf')) ? (() => {
                    const hasLocalFile = Boolean(formData[field.name] && typeof formData[field.name] === 'string' && formData[field.name].startsWith('data:'));
                    const externalUrlValue = (formData[field.name] && typeof formData[field.name] === 'string' && !formData[field.name].startsWith('data:')) ? formData[field.name] : '';
                    const hasExternalUrl = Boolean(externalUrlValue.trim() !== '');

                    return (
                      <div className="space-y-2 p-3 bg-gray-50/50 rounded-xl border border-gray-200">
                        <div className={`flex items-center w-full bg-white border rounded-xl overflow-hidden shadow-2xs transition-all ${
                          hasExternalUrl ? 'opacity-60 border-gray-200 bg-gray-50' : 'border-gray-300 focus-within:ring-2 focus-within:ring-blue-500'
                        }`}>
                          <label className={`px-4 py-2 text-xs font-bold border-r border-gray-300 shrink-0 transition-colors ${
                            hasExternalUrl ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 cursor-pointer'
                          }`}>
                            Choose Local PDF
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              disabled={hasExternalUrl}
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    const dataUrl = evt.target?.result as string;
                                    setFormData(prev => ({
                                      ...prev,
                                      [field.name]: dataUrl,
                                      [`${field.name}_filename`]: file.name,
                                      fileUrl: dataUrl,
                                      pdf_url: dataUrl,
                                      file: dataUrl,
                                      fileName: file.name,
                                      file_pdf_filename: file.name,
                                      choose_file_filename: file.name,
                                    }));
                                    setModalError(null);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <span className="px-3 text-xs text-gray-500 truncate flex-1 font-sans">
                            {hasExternalUrl ? (
                              <span className="text-gray-400 italic">Clear external URL below to choose local file</span>
                            ) : (
                              formData[`${field.name}_filename`] || (hasLocalFile ? 'Local PDF File Attached' : 'No local file chosen')
                            )}
                          </span>
                          {hasLocalFile && (
                            <div className="flex items-center gap-1 mr-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => openFileInNewTab(formData[field.name], formData[`${field.name}_filename`])}
                                className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 shrink-0 cursor-pointer"
                              >
                                View PDF
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => {
                                    const nextData = { ...prev };
                                    delete nextData[field.name];
                                    delete nextData[`${field.name}_filename`];
                                    delete nextData.fileUrl;
                                    delete nextData.pdf_url;
                                    delete nextData.file;
                                    return nextData;
                                  });
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove PDF File"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Prominent "OR" divider */}
                        <div className="relative flex py-1 items-center">
                          <div className="flex-grow border-t border-gray-300"></div>
                          <span className="shrink-0 mx-3 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-gray-500 bg-white border border-gray-200 rounded-full shadow-2xs uppercase">
                            OR
                          </span>
                          <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        <div className="relative">
                          <Globe className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${hasLocalFile ? 'text-gray-300' : 'text-gray-400'}`} />
                          <input
                            type="text"
                            disabled={hasLocalFile}
                            placeholder={hasLocalFile ? "Local file attached (remove file above to paste URL)" : "Paste external website link or document URL (e.g. https://...)"}
                            value={externalUrlValue}
                            onChange={e => {
                              const val = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                [field.name]: val,
                                fileUrl: val,
                                pdf_url: val,
                                file: val,
                              }));
                              setModalError(null);
                            }}
                            className={`w-full text-xs pl-8 pr-8 py-2 border rounded-lg focus:outline-none transition-all font-mono ${
                              hasLocalFile
                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed placeholder:text-gray-400 placeholder:italic'
                                : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-400'
                            }`}
                          />
                          {hasExternalUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => {
                                  const nextData = { ...prev };
                                  delete nextData[field.name];
                                  delete nextData.fileUrl;
                                  delete nextData.pdf_url;
                                  delete nextData.file;
                                  return nextData;
                                });
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
                              title="Clear URL"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 italic">
                          * Provide either a local PDF file OR an external website link, not both.
                        </p>
                      </div>
                    );
                  })() : field.type === 'image' ? (
                    <div className="flex items-center w-full bg-white border border-gray-300 rounded-xl overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-blue-500">
                      <label className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold border-r border-gray-300 cursor-pointer shrink-0 transition-colors">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                setFormData({
                                  ...formData,
                                  [field.name]: evt.target?.result as string,
                                  [`${field.name}_filename`]: file.name,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="px-3 text-xs text-gray-500 truncate flex-1 font-sans">
                        {formData[`${field.name}_filename`] || (formData[field.name] ? 'Image Attached' : 'No file chosen')}
                      </span>
                      {formData[field.name] && (
                        <div className="flex items-center gap-1 mr-2 shrink-0">
                          <img
                            src={formData[field.name]}
                            alt="Preview"
                            className="w-7 h-7 object-cover rounded-md border border-gray-200 shrink-0"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextData = { ...formData };
                              delete nextData[field.name];
                              delete nextData[`${field.name}_filename`];
                              setFormData(nextData);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={formData[field.name] || ''}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={formData[field.name] || ''}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      value={formData[field.name] || ''}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.placeholder || `Enter ${field.label}...`}
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )}
                </div>
              );
            })}
          </form>
        </div>
      </Drawer>
    </div>
  );
};
