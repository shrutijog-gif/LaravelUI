import React, { useState, useEffect } from 'react';
import { FieldDefinition, FieldType } from '../../../../types/moduleStudio';
import { getStoredStudioTemplates } from '../../../../data/mockStudioData';
import { Plus, Trash2, GripVertical, Check, Layers, AlertCircle, Link2 } from 'lucide-react';

export const systemPicklists = [
  {
    id: 'categories',
    label: 'Category / NAAC Criteria Picklist',
    options: ['Academic Excellence', 'Research & Innovation', 'Student Sports & Cultural', 'Governance & Quality', 'Extension & Community Outreach'],
  },
  {
    id: 'document_types',
    label: 'Document Type / Category Picklist',
    options: ['Circular & Notice', 'AQAR Annual Report', 'Policy Document', 'Financial Statement', 'Audit Report', 'Academic Calendar'],
  },
  {
    id: 'designations',
    label: 'Designation & Role Picklist',
    options: ['Principal / Director', 'Professor & HOD', 'Associate Professor', 'Assistant Professor', 'Dean Academics', 'Registrar'],
  },
];

export const systemMasters = [
  {
    id: 'departments',
    label: 'Department Master (CSE, Mechanical, Electrical, Civil...)',
    options: ['Computer Science & Engineering', 'Mechanical Engineering', 'Electrical & Electronics', 'Civil Engineering', 'Applied Sciences', 'Humanities & Social Sciences'],
  },
  {
    id: 'programs',
    label: 'Academic Program / Degree Master (B.Tech, M.Tech, MBA...)',
    options: ['B.Tech Computer Science', 'B.Tech Mechanical Engineering', 'B.Tech Civil Engineering', 'M.Tech AI & Data Science', 'B.Sc Food Technology', 'B.Com Commerce & Finance', 'MBA Business Admin', 'Ph.D Research Scholars'],
  },
  {
    id: 'streams',
    label: 'Stream / Branch Master (AI & DS, Software, Thermal...)',
    options: ['Artificial Intelligence & Data Science', 'Software Engineering', 'Structural Engineering', 'Power Systems', 'Robotics & Automation'],
  },
  {
    id: 'years',
    label: 'Academic Year Master (2026-27, 2025-26...)',
    options: ['2026-2027', '2025-2026', '2024-2025', '2023-2024', '2022-2023'],
  },
  {
    id: 'semesters',
    label: 'Semester Master (1, 2, 3, 4, 5, 6, 7, 8)',
    options: ['1', '2', '3', '4', '5', '6', '7', '8'],
  },
  {
    id: 'sections',
    label: 'Section Master (A, B, C, D, All Sections)',
    options: ['A', 'B', 'C', 'D', 'All Sections'],
  },
];

interface StudioFieldsEditorProps {
  fields: FieldDefinition[];
  onChange: (updatedFields: FieldDefinition[]) => void;
}

export const StudioFieldsEditor: React.FC<StudioFieldsEditorProps> = ({ fields, onChange }) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(fields[0]?.id || null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const storedTemplates = getStoredStudioTemplates();

  // New field form state
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newType, setNewType] = useState<FieldType>('text');
  const [isKeyManuallyEdited, setIsKeyManuallyEdited] = useState(false);

  const handleLabelChange = (val: string) => {
    setNewLabel(val);
    if (!isKeyManuallyEdited) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      setNewKey(slug);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  // Raw text state for options input so commas can be typed without getting immediately stripped
  const [optionsRawText, setOptionsRawText] = useState<string>('');

  useEffect(() => {
    if (selectedField?.options) {
      setOptionsRawText(selectedField.options.map(o => o.label).join(', '));
    } else {
      setOptionsRawText('');
    }
  }, [selectedFieldId]);

  const handleAddField = () => {
    if (!newLabel.trim()) return;

    const keyName = newKey.trim() || newLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newField: FieldDefinition = {
      id: `f_${Date.now()}`,
      name: keyName,
      label: newLabel.trim(),
      type: newType,
      required: false,
      showInCard: true,
      showInTable: true,
      placeholder: `Enter ${newLabel}...`,
    };

    const updated = [...fields, newField];
    onChange(updated);
    setSelectedFieldId(newField.id);
    setNewLabel('');
    setNewKey('');
    setNewType('text');
    setIsAddingNew(false);
  };

  const handleRemoveField = (id: string) => {
    const updated = fields.filter(f => f.id !== id);
    onChange(updated);
    if (selectedFieldId === id) {
      setSelectedFieldId(updated[0]?.id || null);
    }
  };

  const handleUpdateField = (id: string, updates: Partial<FieldDefinition>) => {
    const updated = fields.map(f => (f.id === id ? { ...f, ...updates } : f));
    onChange(updated);
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...fields];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    onChange(updated);
    setDraggedIndex(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[420px]">
      {/* Left List of Fields */}
      <div className="w-full lg:w-1/3 bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Configured Fields ({fields.length})
            </h4>
            <button
              onClick={() => {
                setIsAddingNew(true);
                setNewLabel('');
                setNewKey('');
                setIsKeyManuallyEdited(false);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors border border-blue-200"
            >
              <Plus className="w-3.5 h-3.5" /> Add Field
            </button>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {fields.map((field, index) => (
              <div
                key={field.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => { setSelectedFieldId(field.id); setIsAddingNew(false); }}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                  draggedIndex === index
                    ? 'opacity-40 border-dashed border-blue-500 bg-blue-50'
                    : selectedFieldId === field.id && !isAddingNew
                    ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-white/70 border-gray-200 hover:border-gray-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <GripVertical className="w-4 h-4 text-gray-400 shrink-0 cursor-grab active:cursor-grabbing hover:text-gray-700" />
                  <div className="truncate">
                    <p className="font-semibold text-xs text-gray-900 truncate">
                      {field.label}
                      {field.required && <span className="text-red-500 font-bold ml-0.5 text-xs">*</span>}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                      <span>{field.name}</span> • <span className="bg-gray-100 text-gray-600 px-1 py-0.2 rounded uppercase">{field.type}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveField(field.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                    title="Remove Field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Field Config Detail Pane */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
        {isAddingNew ? (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="font-bold text-sm text-gray-900">+ Add New Metadata Field</h3>
              <p className="text-xs text-gray-500">Define a new attribute for this module.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Field Display Label *</label>
                <input
                  type="text"
                  placeholder="e.g. Award Title, Department"
                  value={newLabel}
                  onChange={e => handleLabelChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Key Name</label>
                <input
                  type="text"
                  placeholder="e.g. award_title (auto-generated)"
                  value={newKey}
                  onChange={e => {
                    setNewKey(e.target.value);
                    setIsKeyManuallyEdited(true);
                  }}
                  className="w-full text-xs font-mono px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Data Input Type *</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as FieldType)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="text">Text Input (Single Line)</option>
                  <option value="url">URL / Website Link</option>
                  <option value="textarea">Textarea (Multi Line)</option>
                  <option value="number">Number</option>
                  <option value="select">Dropdown Select</option>
                  <option value="multiselect">Multi-Select Tags</option>
                  <option value="radio">Radio Buttons (Single Pick)</option>
                  <option value="checkbox">Checkbox Group (Multi Pick)</option>
                  <option value="badge">Badge Tag</option>
                  <option value="file_pdf">Document PDF Upload / URL</option>
                  <option value="image">Image Photo URL</option>
                  <option value="icon">Vector Icon Picker / Symbol</option>
                  <option value="date">Date Picker</option>
                </select>
              </div>

              {(newType === 'select' || newType === 'multiselect' || newType === 'radio' || newType === 'checkbox' || newType === 'badge') && (
                <div className="sm:col-span-2 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-800">
                      Field Choices & Options
                    </label>
                    <span className="text-[10px] text-gray-500 font-mono">
                      Master or Manual Choices
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Bind to Central System Master or Module Data Lookup:
                    </label>
                    <select
                      onChange={e => {
                        const val = e.target.value;
                        if (!val) return;
                        const optsEl = document.getElementById('new_field_options_input') as HTMLInputElement | null;
                        
                        if (val.startsWith('module_')) {
                          const slug = val.replace('module_', '');
                          const t = storedTemplates.find(tmpl => tmpl.schema.slug === slug);
                          if (t && t.sampleItems && t.sampleItems.length > 0) {
                            const titles = Array.from(new Set(t.sampleItems.map(item => item.data.title || item.data.name || item.data.recipient || item.id).filter(Boolean)));
                            if (optsEl) optsEl.value = titles.join(', ');
                          }
                        } else if (val.startsWith('picklist_')) {
                          const pId = val.replace('picklist_', '');
                          const found = systemPicklists.find(p => p.id === pId);
                          if (found && optsEl) optsEl.value = found.options.join(', ');
                        } else if (val.startsWith('master_')) {
                          const mId = val.replace('master_', '');
                          const found = systemMasters.find(m => m.id === mId);
                          if (found && optsEl) optsEl.value = found.options.join(', ');
                        }
                      }}
                      className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 font-medium"
                    >
                      <option value="">-- Select Picklist, Master Table, or Module --</option>
                      <optgroup label="System Picklists">
                        {systemPicklists.map(p => (
                          <option key={p.id} value={`picklist_${p.id}`}>{p.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Central Master Tables">
                        {systemMasters.map(m => (
                          <option key={m.id} value={`master_${m.id}`}>{m.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Custom Module References">
                        {storedTemplates.map(t => (
                          <option key={t.schema.slug} value={`module_${t.schema.slug}`}>
                            Module: {t.schema.name || t.schema.slug}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-900 mb-1">
                      Option Values (Comma-Separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sem 1, Sem 2, Sem 3, Sem 4 or 2026-2027, 2025-2026"
                      id="new_field_options_input"
                      className="w-full text-xs px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400"
                    />
                    <p className="text-[10px] text-blue-700 mt-1">Select a picklist above to auto-populate, or type manual choices separated by commas.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-xs font-semibold px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const optsEl = document.getElementById('new_field_options_input') as HTMLInputElement | null;
                  const optsRaw = optsEl ? optsEl.value : '';
                  const parsedOpts = optsRaw.split(',').map(s => s.trim()).filter(Boolean).map(val => ({ label: val, value: val }));
                  
                  if (!newLabel.trim()) return;
                  const keyName = newKey.trim() || newLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
                  const newField: FieldDefinition = {
                    id: `f_${Date.now()}`,
                    name: keyName,
                    label: newLabel.trim(),
                    type: newType,
                    required: false,
                    showInCard: true,
                    showInTable: true,
                    placeholder: `Select ${newLabel}...`,
                    options: parsedOpts.length > 0 ? parsedOpts : undefined,
                  };
                  const updated = [...fields, newField];
                  onChange(updated);
                  setSelectedFieldId(newField.id);
                  setNewLabel('');
                  setNewKey('');
                  setIsKeyManuallyEdited(false);
                  setNewType('text');
                  setIsAddingNew(false);
                }}
                className="text-xs font-bold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save Field
              </button>
            </div>
          </div>
        ) : selectedField ? (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  {selectedField.label}
                  {selectedField.required && <span className="text-red-500 font-bold ml-1 text-sm">*</span>}
                </h3>
              </div>
              <span className="bg-gray-100 text-gray-700 font-mono text-xs font-bold px-2.5 py-1 rounded-md uppercase border border-gray-200">
                {selectedField.type}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Field Label</label>
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={e => handleUpdateField(selectedField.id, { label: e.target.value })}
                  className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Key Name</label>
                <input
                  type="text"
                  value={selectedField.name}
                  onChange={e => handleUpdateField(selectedField.id, { name: e.target.value })}
                  className="w-full text-xs font-mono px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Field Type</label>
                <select
                  value={selectedField.type}
                  onChange={e => handleUpdateField(selectedField.id, { type: e.target.value as FieldType })}
                  className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="text">Text Input (Single Line)</option>
                  <option value="url">URL / Website Link</option>
                  <option value="textarea">Textarea (Multi Line)</option>
                  <option value="number">Number</option>
                  <option value="select">Dropdown Select</option>
                  <option value="multiselect">Multi-Select Tags</option>
                  <option value="radio">Radio Buttons (Single Pick)</option>
                  <option value="checkbox">Checkbox Group (Multi Pick)</option>
                  <option value="badge">Badge Tag</option>
                  <option value="file_pdf">Document PDF Upload / URL</option>
                  <option value="image">Image Photo URL</option>
                  <option value="icon">Vector Icon Picker / Symbol</option>
                  <option value="date">Date Picker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Placeholder Text</label>
                <input
                  type="text"
                  value={selectedField.placeholder || ''}
                  onChange={e => handleUpdateField(selectedField.id, { placeholder: e.target.value })}
                  className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Field Rules */}
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                <input
                  type="checkbox"
                  checked={selectedField.required || false}
                  onChange={e => handleUpdateField(selectedField.id, { required: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Mandatory Field (Required for Submission)
              </label>
            </div>

            {/* Options configurator for select/multiselect/radio/checkbox/badge */}
            {(selectedField.type === 'select' || selectedField.type === 'multiselect' || selectedField.type === 'radio' || selectedField.type === 'checkbox' || selectedField.type === 'badge') && (
              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-gray-800">Field Choices & Options</h4>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {selectedField.options?.length || 0} choices configured
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Bind to Central Master Table or Module Reference:
                  </label>
                  <select
                    onChange={e => {
                      const val = e.target.value;
                      if (!val) return;
                      
                      if (val.startsWith('module_')) {
                        const slug = val.replace('module_', '');
                        const t = storedTemplates.find(tmpl => tmpl.schema.slug === slug);
                        if (t && t.sampleItems && t.sampleItems.length > 0) {
                          const titles = Array.from(new Set(t.sampleItems.map(item => item.data.title || item.data.name || item.data.recipient || item.id).filter(Boolean)));
                          const textVal = titles.join(', ');
                          setOptionsRawText(textVal);
                          const parsed = titles.map(val => ({ label: val, value: val }));
                          handleUpdateField(selectedField.id, { options: parsed });
                        }
                      } else if (val.startsWith('picklist_')) {
                        const pId = val.replace('picklist_', '');
                        const found = systemPicklists.find(p => p.id === pId);
                        if (found) {
                          const textVal = found.options.join(', ');
                          setOptionsRawText(textVal);
                          const parsed = found.options.map(val => ({ label: val, value: val }));
                          handleUpdateField(selectedField.id, { options: parsed });
                        }
                      } else if (val.startsWith('master_')) {
                        const mId = val.replace('master_', '');
                        const found = systemMasters.find(m => m.id === mId);
                        if (found) {
                          const textVal = found.options.join(', ');
                          setOptionsRawText(textVal);
                          const parsed = found.options.map(val => ({ label: val, value: val }));
                          handleUpdateField(selectedField.id, { options: parsed });
                        }
                      }
                    }}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                  >
                    <option value="">-- Select Picklist, Master Table, or Module --</option>
                    <optgroup label="System Picklists">
                      {systemPicklists.map(p => (
                        <option key={p.id} value={`picklist_${p.id}`}>{p.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Central Master Tables">
                      {systemMasters.map(m => (
                        <option key={m.id} value={`master_${m.id}`}>{m.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Custom Module References">
                      {storedTemplates.map(t => (
                        <option key={t.schema.slug} value={`module_${t.schema.slug}`}>
                          Module: {t.schema.name || t.schema.slug}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Option Values (Comma-Separated)
                  </label>
                  <input
                    type="text"
                    value={optionsRawText}
                    onChange={e => {
                      const raw = e.target.value;
                      setOptionsRawText(raw);
                      const parsed = raw.split(',').map(s => s.trim()).filter(Boolean).map(val => ({ label: val, value: val }));
                      handleUpdateField(selectedField.id, { options: parsed });
                    }}
                    placeholder="e.g. Sem 1, Sem 2, Sem 3 or 2026-2027, 2025-2026"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {selectedField.options && selectedField.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedField.options.map((opt, idx) => (
                      <span key={idx} className="bg-white border border-gray-200 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded shadow-2xs">
                        {opt.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400 text-xs">
            Select a field on the left or click "+ Add Field" to configure settings.
          </div>
        )}
      </div>
    </div>
  );
};
