import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Search, GripVertical } from 'lucide-react';

export interface CommitteeMember {
  id: string;
  name: string;
  designation?: string; 
  role?: string;        // e.g. "C", "Admin", "Convener"
  imageUrl?: string;
}

// Mock central Staff Database (Combines Teaching & Non-Teaching)
const MOCK_ALL_STAFF_DB = [
  // Teaching Staff
  { id: 'f1', name: 'Dr. Anand Joshi', designation: 'Professor & HOD', staffType: 'Teaching', imageUrl: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { id: 'f2', name: 'Dr. Sunita Rao', designation: 'Associate Professor', staffType: 'Teaching', imageUrl: 'https://randomuser.me/api/portraits/women/41.jpg' },
  { id: 'f3', name: 'Mr. Vikram Singh', designation: 'Assistant Professor', staffType: 'Teaching' }, 
  { id: 'f4', name: 'Ms. Pooja Desai', designation: 'Assistant Professor', staffType: 'Teaching', imageUrl: 'https://randomuser.me/api/portraits/women/61.jpg' },
  { id: 'f5', name: 'Dr. Rajesh Iyer', designation: 'Professor', staffType: 'Teaching', imageUrl: 'https://randomuser.me/api/portraits/men/71.jpg' },
  // Non-Teaching Staff
  { id: 'nt1', name: 'Mr. Suresh Kadam', designation: 'Registrar', staffType: 'Non-Teaching', imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 'nt2', name: 'Ms. Meena Patil', designation: 'Senior Clerk', staffType: 'Non-Teaching', imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 'nt3', name: 'Mr. Ramesh Gawali', designation: 'Lab Assistant', staffType: 'Non-Teaching' }, 
];

// Mock initial data matching user's example
const INITIAL_MEMBERS: CommitteeMember[] = [
  { id: 'm1', name: 'Dr. Anand Joshi', designation: 'Professor & HOD', role: 'Convener', imageUrl: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { id: 'm2', name: 'Dr. Sunita Rao', designation: 'Associate Professor', role: 'Member', imageUrl: 'https://randomuser.me/api/portraits/women/41.jpg' },
  { id: 'm3', name: 'Mr. Vikram Singh', designation: 'Assistant Professor', role: 'Member' },
  { id: 'm4', name: 'Ms. Pooja Desai', designation: 'Student Representative', role: 'Student Coordinator', imageUrl: 'https://randomuser.me/api/portraits/women/61.jpg' },
];

export const CommitteeMembersManager: React.FC = () => {
  const [members, setMembers] = useState<CommitteeMember[]>(INITIAL_MEMBERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [formData, setFormData] = useState<Partial<CommitteeMember>>({});

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.designation && m.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({ name: '', designation: '', role: '', imageUrl: '' });
    setShowSuggestions(false);
    setIsModalOpen(true);
  };

  const openEditModal = (member: CommitteeMember) => {
    setEditingMember(member);
    setFormData({ ...member });
    setShowSuggestions(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name) {
      alert('Please fill the Name field.');
      return;
    }

    if (editingMember) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...formData, id: m.id } as CommitteeMember : m));
    } else {
      setMembers(prev => [...prev, { ...formData, id: `m-${Date.now()}` } as CommitteeMember]);
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

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (searchQuery) {
      e.preventDefault();
      return;
    }
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (searchQuery) return;
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (searchQuery) return;
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const oldIndex = members.findIndex(m => m.id === draggedId);
    const newIndex = members.findIndex(m => m.id === targetId);

    if (oldIndex === -1 || newIndex === -1) return;

    const newMembers = [...members];
    const [movedItem] = newMembers.splice(oldIndex, 1);
    newMembers.splice(newIndex, 0, movedItem);

    setMembers(newMembers);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  // Autocomplete logic
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
    setShowSuggestions(true);
  };

  const selectStaff = (staff: typeof MOCK_ALL_STAFF_DB[0]) => {
    setFormData({
      ...formData,
      name: staff.name,
      designation: staff.designation,
      imageUrl: staff.imageUrl,
    });
    setShowSuggestions(false);
  };

  const staffSuggestions = MOCK_ALL_STAFF_DB.filter(f => 
    f.name.toLowerCase().includes((formData.name || '').toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Committee Members</h2>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Search Bar */}
      <div className="py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
          />
        </div>
      </div>

      {/* Member List Grid */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p className="text-gray-500 text-sm">No members found.</p>
          </div>
        ) : (
          filteredMembers.map(member => (
            <div 
              key={member.id} 
              draggable={!searchQuery}
              onDragStart={(e) => handleDragStart(e, member.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, member.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group ${
                draggedId === member.id ? 'opacity-40 border-dashed border-blue-400 bg-blue-50' : ''
              } ${!searchQuery ? 'cursor-grab active:cursor-grabbing' : ''}`}
            >
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                {!searchQuery && (
                  <GripVertical className="w-5 h-5 text-gray-300 flex-shrink-0 cursor-grab" />
                )}

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 font-bold text-lg">{member.name.charAt(0)}</span>
                  )}
                </div>
                
                {/* Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 leading-tight">
                    {member.name}
                    {member.role && (
                      <span className="font-normal text-gray-500 ml-1.5 text-[0.9em]">({member.role})</span>
                    )}
                  </h3>
                  {member.designation && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{member.designation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(member)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="text-lg font-bold text-gray-900">{editingMember ? 'Edit Member' : 'Add New Member'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Photo Upload */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 relative group cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-semibold uppercase tracking-wider">Change</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Profile Photo</h4>
                  <p className="text-xs text-gray-500 mt-1">Recommended size: 400x400px.<br/>Max file size: 2MB.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={handleNameChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search staff or type custom name..."
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-gray-400"
                  />
                  {/* Autocomplete Dropdown */}
                  {showSuggestions && formData.name && staffSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Suggested Staff
                      </div>
                      <ul className="max-h-48 overflow-y-auto">
                        {staffSuggestions.map(staff => (
                          <li 
                            key={staff.id}
                            onMouseDown={() => selectStaff(staff)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                          >
                            {staff.imageUrl ? (
                              <img src={staff.imageUrl} alt={staff.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <span className="text-gray-500 font-bold text-xs">{staff.name.charAt(0)}</span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {staff.name}
                                <span className="ml-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">{staff.staffType}</span>
                              </div>
                              <div className="text-xs text-gray-500">{staff.designation}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation</label>
                  <input
                    type="text"
                    value={formData.designation || ''}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Professor / Student (Optional)"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role in Committee</label>
                  <input
                    type="text"
                    value={formData.role || ''}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. C, Admin, Convener (Optional)"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
