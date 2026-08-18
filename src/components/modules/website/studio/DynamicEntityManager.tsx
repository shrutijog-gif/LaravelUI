import React, { useState, useEffect } from 'react';
import { StudioTemplate, DynamicEntityItem, FieldDefinition } from '../../../../types/moduleStudio';
import { getStoredStudioTemplates, getStoredEntitiesBySlug, saveStoredEntitiesBySlug } from '../../../../data/mockStudioData';
import { getActiveTenant } from '../../../../data/tenantData';
import { Plus, Search, Trash2, Edit, Eye, EyeOff, Check, X, ShieldCheck, Download, Award, FileText, Layers } from 'lucide-react';

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Clean Page Title Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{schema.name} Manager</h1>
        {/* Dynamic Module Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 bg-gray-100 p-1 rounded-xl border border-gray-200">
          {templates.map(t => (
            <button
              key={t.schema.id}
              onClick={() => setActiveSlug(t.schema.slug)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeSlug === t.schema.slug
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.schema.name}
            </button>
          ))}
        </div>
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
          <Plus className="w-4 h-4" /> Add New Record
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200">
                <th className="py-3.5 px-5">Status</th>
                {schema.fields.map(f => (
                  <th key={f.id} className="py-3.5 px-4">{f.label}</th>
                ))}
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={schema.fields.length + 2} className="py-12 text-center text-gray-400 font-medium">
                    No records found for {schema.name}. Click "+ Add New Record" to create one.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleVisibility(item.id)}
                        className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                          item.showOnWebsite !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {item.showOnWebsite !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {item.showOnWebsite !== false ? 'Published' : 'Hidden'}
                      </button>
                    </td>

                    {schema.fields.map(f => {
                      const val = item.data[f.name];
                      return (
                        <td key={f.id} className="py-3.5 px-4 max-w-xs truncate font-medium text-gray-800">
                          {f.type === 'image' && val ? (
                            <img src={val} alt="Thumbnail" className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
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

      {/* Dynamic Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  {editingItem ? `Edit ${schema.name} Entry` : `Add New ${schema.name} Entry`}
                </h3>
                <p className="text-xs text-gray-500 font-mono">Module: {schema.slug} • {activeTenant.name}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {schema.fields.map(field => (
                <div key={field.id}>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
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
              ))}

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-semibold px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-bold px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  {editingItem ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
