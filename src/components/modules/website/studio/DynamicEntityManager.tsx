import React, { useState, useEffect } from 'react';
import { StudioTemplate, DynamicEntityItem, FieldDefinition } from '../../../../types/moduleStudio';
import { getStoredStudioTemplates, getStoredEntitiesBySlug, saveStoredEntitiesBySlug } from '../../../../data/mockStudioData';
import { getActiveTenant } from '../../../../data/tenantData';
import { naacCriteriaList } from '../../../../data/naacCriteriaData';
import { Drawer } from '../../../common/Drawer';
import { Plus, Search, Trash2, Edit, Eye, EyeOff, Check, X, ShieldCheck, Download, Award, FileText, Layers, Upload, ExternalLink } from 'lucide-react';

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

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({});

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
    setFormData({ ...item.data });
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    let updatedItems: DynamicEntityItem[];

    if (editingItem) {
      updatedItems = items.map(item =>
        item.id === editingItem.id
          ? { ...item, data: formData, updatedAt: new Date().toISOString() }
          : item
      );
    } else {
      const newItem: DynamicEntityItem = {
        id: `ent_${Date.now()}`,
        tenantId: activeTenant.id,
        moduleSlug: selectedTemplate.schema.slug,
        showOnWebsite: true,
        data: formData,
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
  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(item.data).join(' ').toLowerCase().includes(query);
  });

  // Filter to valid named modules only
  const validTemplates = templates.filter(t => t.schema.name && t.schema.name.trim() !== '');

  return (
    <div className="space-y-6">
      {/* Clean Page Title Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{schema?.name || 'Module Manager'}</h1>
      </div>

      {/* Controls & Action Bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${schema.name}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200">
                {schema.fields.map(f => {
                  const headerText = (f.label.toLowerCase() === 'choose file' || f.name.toLowerCase() === 'choose_file')
                    ? 'File Name'
                    : f.label;
                  return (
                    <th key={f.id} className="py-3.5 px-4">{headerText}</th>
                  );
                })}
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={schema.fields.length + 1} className="py-12 text-center text-gray-400 font-medium">
                    No records found for {schema.name}. Click "+ Add New" to create one.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                    {schema.fields.map(f => {
                      const val = item.data[f.name];
                      return (
                        <td key={f.id} className="py-3.5 px-4 max-w-xs truncate font-medium text-gray-800">
                          {f.type === 'image' && val ? (
                            <img src={val} alt="Thumbnail" className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                          ) : (f.type === 'file_pdf' || f.name.toLowerCase().includes('file')) && val ? (
                            <a
                              href={val}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{item.data[`${f.name}_filename`] || item.data['choose_file_filename'] || item.data['file_pdf_filename'] || 'View Document PDF'}</span>
                            </a>
                          ) : f.type === 'badge' ? (
                            <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-100">
                              {val}
                            </span>
                          ) : (
                            <span>{Array.isArray(val) ? val.join(', ') : String(val || '—')}</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-5 text-right whitespace-nowrap space-x-2">
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
                  ) : field.type === 'file_pdf' ? (
                    <div className="flex items-center w-full bg-white border border-gray-300 rounded-xl overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-blue-500">
                      <label className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold border-r border-gray-300 cursor-pointer shrink-0 transition-colors">
                        Choose File
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
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
                        {formData[`${field.name}_filename`] || (formData[field.name] ? 'PDF File Attached' : 'No file chosen')}
                      </span>
                      {formData[field.name] && (
                        <a
                          href={formData[field.name]}
                          target="_blank"
                          rel="noreferrer"
                          className="mr-2 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 shrink-0"
                        >
                          View PDF
                        </a>
                      )}
                    </div>
                  ) : field.type === 'image' ? (
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
                        <img
                          src={formData[field.name]}
                          alt="Preview"
                          className="w-7 h-7 object-cover rounded-md border border-gray-200 mr-2 shrink-0"
                        />
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
