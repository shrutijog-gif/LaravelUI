import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Package,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { CategoryItem, CategorySlug } from '../../../types/ecommerce';

interface CategoriesListProps {
  categories: CategoryItem[];
}

export const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>(categories);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '' as CategorySlug | string,
    description: '',
  });

  const handleOpenAddModal = () => {
    setEditingCategoryId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategoryId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteCategory = (catId: string) => {
    setCategoryItems(prev => prev.filter(c => c.id !== catId));
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const slugValue = (formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-')) as CategorySlug;

    if (editingCategoryId) {
      setCategoryItems(prev =>
        prev.map(c =>
          c.id === editingCategoryId
            ? {
              ...c,
              name: formData.name.trim(),
              slug: slugValue,
              description: formData.description.trim(),
            }
            : c
        )
      );
    } else {
      const newCategory: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: formData.name.trim(),
        slug: slugValue,
        itemCount: 0,
        description: formData.description.trim(),
        iconName: 'Package',
      };
      setCategoryItems(prev => [newCategory, ...prev]);
    }

    setIsAddModalOpen(false);
  };

  const filteredCategories = categoryItems.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Product Categories</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search category name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 text-gray-900 text-sm rounded-lg pl-9 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-xs flex items-center gap-2 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {/* Table Content View */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Listed Items</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No categories found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {cat.name}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                        {cat.slug}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        <Package className="w-3.5 h-3.5" /> {cat.itemCount} Listed Items
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Slide-Over Drawer */}
      {isAddModalOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          {/* Right Slide-over Panel */}
          <div className="fixed inset-y-0 right-0 z-[9999] w-full max-w-md bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <h3 className="text-base font-bold text-gray-900">
                {editingCategoryId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <form id="category-drawer-form" onSubmit={handleSaveCategory} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fertilizers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Slug (URL Identifier)
                </label>
                <input
                  type="text"
                  placeholder="e.g. fertilizers (optional)"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 shadow-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="category-drawer-form"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-xs transition-colors"
              >
                {editingCategoryId ? 'Update Category' : 'Save Category'}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};



