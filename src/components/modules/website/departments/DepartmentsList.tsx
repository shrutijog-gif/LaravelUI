import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, X, AlertTriangle, Home, Pencil, Trash2 } from 'lucide-react';
import { Department, DepartmentStream, DEPARTMENT_STREAMS } from '../../../../data/mockDepartmentData';

interface DepartmentsListProps {
  departments: Department[];
  onDepartmentsChange: (departments: Department[]) => void;
  onManage: (department: Department) => void;
} // Clean 3-column layout: Departments, Stream, Action

type ModalMode = 'add' | 'edit' | null;

interface DeleteConfirm {
  id: string;
  name: string;
}

export const DepartmentsList: React.FC<DepartmentsListProps> = ({
  departments,
  onDepartmentsChange,
  onManage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPerPage, setShowPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formName, setFormName] = useState('');
  const [formStream, setFormStream] = useState<DepartmentStream | ''>('');
  const [formErrors, setFormErrors] = useState<{ name?: string; stream?: string }>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);

  // Filter
  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.stream && d.stream.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / showPerPage));
  const paginated = filtered.slice((currentPage - 1) * showPerPage, currentPage * showPerPage);

  // Modal helpers
  const openAdd = () => {
    setFormName('');
    setFormStream('');
    setFormErrors({});
    setEditingDept(null);
    setModalMode('add');
  };

  const openEdit = (d: Department) => {
    setFormName(d.name);
    setFormStream(d.stream);
    setFormErrors({});
    setEditingDept(d);
    setModalMode('edit');
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingDept(null);
  };

  const validate = () => {
    const errs: { name?: string; stream?: string } = {};
    if (!formName.trim()) errs.name = 'Name is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (modalMode === 'add') {
      const newDept: Department = {
        id: `dept_${Date.now()}`,
        name: formName.trim(),
        stream: (formStream || 'Science') as DepartmentStream,
      };
      onDepartmentsChange([...departments, newDept]);
    } else if (modalMode === 'edit' && editingDept) {
      onDepartmentsChange(
        departments.map(d =>
          d.id === editingDept.id
            ? { ...d, name: formName.trim(), stream: (formStream || d.stream) as DepartmentStream }
            : d
        )
      );
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    onDepartmentsChange(departments.filter(d => d.id !== id));
    setDeleteConfirm(null);
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Home className="w-4 h-4 text-slate-600" />
        <span>/</span>
        <span className="text-gray-600">Department</span>
      </nav>

      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Departments</h1>
        <button
          id="add-department-btn"
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          Add Department
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
        {/* Table toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show :</span>
            <select
              value={showPerPage}
              onChange={e => { setShowPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {[5, 10, 25, 50].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search.."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-52"
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs tracking-wide w-1/2">Departments</th>
              <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs tracking-wide w-1/4">Stream</th>
              <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs tracking-wide text-center w-1/4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  {searchQuery ? 'No departments match your search.' : 'No records available'}
                </td>
              </tr>
            ) : (
              paginated.map(dept => (
                <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{dept.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{dept.stream}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => onManage(dept)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                      >
                        Manage Content
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === dept.id ? null : dept.id)}
                          className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenuId === dept.id && (
                          <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded shadow-lg py-1 w-36">
                            <button
                              onClick={() => openEdit(dept)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil className="w-4 h-4 text-gray-700" /> Edit details
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirm({ id: dept.id, name: dept.name });
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Showing {(currentPage - 1) * showPerPage + 1}–{Math.min(currentPage * showPerPage, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded text-sm font-medium border ${
                    page === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal (Right-side drawer matching Committees) ── */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                {modalMode === 'add' ? 'Add Department' : 'Edit Department'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Physics"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.name ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Stream */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stream
                </label>
                <select
                  value={formStream}
                  onChange={e => setFormStream(e.target.value as DepartmentStream | '')}
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${
                    formErrors.stream ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Stream</option>
                  {DEPARTMENT_STREAMS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {formErrors.stream && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.stream}</p>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Delete Department</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close menus */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
};
