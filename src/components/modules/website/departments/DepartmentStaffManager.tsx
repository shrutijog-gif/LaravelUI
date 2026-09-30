import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Search, GripVertical, Mail, Phone, GraduationCap, Award } from 'lucide-react';
import { DepartmentStaffMember, StaffCategory, getDepartmentStaff, saveDepartmentStaff } from '../../../../data/mockDepartmentData';

interface DepartmentStaffManagerProps {
  departmentId: string;
  category: StaffCategory;
  categoryTitle: string;
}

export const DepartmentStaffManager: React.FC<DepartmentStaffManagerProps> = ({
  departmentId,
  category,
  categoryTitle,
}) => {
  const [allStaff, setAllStaff] = useState<DepartmentStaffMember[]>(() => getDepartmentStaff(departmentId));
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<DepartmentStaffMember | null>(null);
  const [formData, setFormData] = useState<Partial<DepartmentStaffMember>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter staff for current category
  const currentCategoryStaff = allStaff
    .filter(s => s.category === category)
    .sort((a, b) => a.order - b.order);

  const filteredStaff = currentCategoryStaff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.designation && s.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.qualification && s.qualification.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.specialization && s.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const persistStaff = (updatedAllStaff: DepartmentStaffMember[]) => {
    setAllStaff(updatedAllStaff);
    saveDepartmentStaff(departmentId, updatedAllStaff);
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      departmentId,
      category,
      name: '',
      designation: category === 'teaching' ? 'Assistant Professor' : category === 'non-teaching' ? 'Lab Assistant' : 'Distinguished Alumnus',
      qualification: '',
      specialization: '',
      experience: '',
      email: '',
      phone: '',
      imageUrl: '',
      order: currentCategoryStaff.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (staff: DepartmentStaffMember) => {
    setEditingStaff(staff);
    setFormData({ ...staff });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = allStaff.filter(s => s.id !== id);
    persistStaff(updated);
    setDeleteConfirmId(null);
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('Please provide a full name.');
      return;
    }

    if (editingStaff) {
      const updated = allStaff.map(s =>
        s.id === editingStaff.id
          ? ({ ...s, ...formData, name: formData.name!.trim() } as DepartmentStaffMember)
          : s
      );
      persistStaff(updated);
    } else {
      const newMember: DepartmentStaffMember = {
        id: `st-${Date.now()}`,
        departmentId,
        category,
        name: formData.name!.trim(),
        designation: formData.designation?.trim() || '',
        qualification: formData.qualification?.trim() || '',
        specialization: formData.specialization?.trim() || '',
        experience: formData.experience?.trim() || '',
        email: formData.email?.trim() || '',
        phone: formData.phone?.trim() || '',
        imageUrl: formData.imageUrl || '',
        order: currentCategoryStaff.length + 1,
      };
      persistStaff([...allStaff, newMember]);
    }

    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (searchQuery) return;
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (searchQuery) return;
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggedId(null);
      return;
    }

    const items = [...currentCategoryStaff];
    const sourceIdx = items.findIndex(item => item.id === sourceId);
    const targetIdx = items.findIndex(item => item.id === targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const [moved] = items.splice(sourceIdx, 1);
      items.splice(targetIdx, 0, moved);

      // Re-index orders for current category
      const otherCategoryStaff = allStaff.filter(s => s.category !== category);
      const reorderedCurrent = items.map((item, idx) => ({ ...item, order: idx + 1 }));

      persistStaff([...otherCategoryStaff, ...reorderedCurrent]);
    }
    setDraggedId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{categoryTitle}</h3>
          <p className="text-xs text-gray-500">
            {currentCategoryStaff.length} {category === 'alumnae' ? 'Alumni' : 'Staff Member(s)'} listed
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${categoryTitle.toLowerCase()}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add {category === 'alumnae' ? 'Alumnus' : 'Staff'}
          </button>
        </div>
      </div>

      {/* Staff Grid/Cards */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/70 rounded-lg border border-dashed border-gray-200">
          <p className="text-sm font-medium text-gray-500">
            {searchQuery ? 'No members found matching your search.' : `No ${categoryTitle.toLowerCase()} added yet.`}
          </p>
          <button
            onClick={openAddModal}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Click to add the first profile
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredStaff.map(staff => (
            <div
              key={staff.id}
              draggable={!searchQuery}
              onDragStart={e => handleDragStart(e, staff.id)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, staff.id)}
              className={`flex items-center justify-between p-3 bg-white border rounded-lg transition-all ${
                draggedId === staff.id ? 'opacity-40 border-blue-400 bg-blue-50/20' : 'border-gray-200 hover:border-gray-300 hover:shadow-xs'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-center gap-3 min-w-0">
                {!searchQuery && (
                  <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-600 cursor-grab flex-shrink-0" />
                )}

                {/* Avatar */}
                <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-700 flex-shrink-0 flex items-center justify-center border border-white shadow-xs">
                  {staff.imageUrl ? (
                    <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {staff.name
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{staff.name}</h4>
                    {staff.experience && (
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                        {staff.experience}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-700 font-medium truncate">{staff.designation}</p>

                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1 flex-wrap">
                    {staff.qualification && (
                      <span className="flex items-center gap-1 truncate">
                        <GraduationCap className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        {staff.qualification}
                      </span>
                    )}
                    {staff.specialization && (
                      <span className="flex items-center gap-1 truncate text-gray-600">
                        <Award className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        {staff.specialization}
                      </span>
                    )}
                    {staff.email && (
                      <span className="flex items-center gap-1 text-gray-400 hidden md:flex truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        {staff.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                <button
                  onClick={() => openEditModal(staff)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit profile"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(staff.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">
                {editingStaff ? `Edit ${editingStaff.name}` : `Add New ${category === 'alumnae' ? 'Alumnus' : 'Staff Member'}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Photo Upload & Preview */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Profile Photo</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-2xs">
                      Upload File
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {formData.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Recommended: Square PNG/JPEG, under 2MB</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Anand Joshi"
                  value={formData.name || ''}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  placeholder={category === 'teaching' ? 'e.g. Professor & HOD' : category === 'non-teaching' ? 'e.g. Senior Clerk' : 'e.g. VP at Google (Batch 2008)'}
                  value={formData.designation || ''}
                  onChange={e => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Qualification & Experience Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. Ph.D., M.Tech"
                    value={formData.qualification || ''}
                    onChange={e => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Experience / Batch</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Years or Batch 2012"
                    value={formData.experience || ''}
                    onChange={e => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Area of Specialization / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Cloud Computing, System Admin"
                  value={formData.specialization || ''}
                  onChange={e => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. faculty@college.edu"
                    value={formData.email || ''}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98200 12345"
                    value={formData.phone || ''}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                {editingStaff ? 'Update Profile' : 'Save Staff Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 animate-in fade-in">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Confirm Delete</h4>
            <p className="text-xs text-gray-600 mb-4">
              Are you sure you want to remove this profile? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
