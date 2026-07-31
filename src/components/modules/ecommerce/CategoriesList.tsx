import React, { useState } from 'react';
import { 
  Home,
  Carrot, 
  FlaskConical, 
  Sprout, 
  BookOpen, 
  Wrench, 
  Layers, 
  Search, 
  Plus, 
  Package, 
  ChevronRight 
} from 'lucide-react';
import { CategoryItem } from '../../../types/ecommerce';

interface CategoriesListProps {
  categories: CategoryItem[];
}

export const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Carrot':
        return <Carrot className="w-6 h-6 text-orange-600" />;
      case 'FlaskConical':
        return <FlaskConical className="w-6 h-6 text-purple-600" />;
      case 'Sprout':
        return <Sprout className="w-6 h-6 text-emerald-600" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-blue-600" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6 text-amber-600" />;
      default:
        return <Layers className="w-6 h-6 text-gray-600" />;
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <Home className="w-3.5 h-3.5 text-gray-600" />
        <span>/</span>
        <span>E-Commerce</span>
        <span>/</span>
        <span className="text-gray-800 font-semibold">Categories</span>
      </div>

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
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-xs">
                  {renderCategoryIcon(cat.iconName)}
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  <Package className="w-3.5 h-3.5" /> {cat.itemCount} Listed Items
                </span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-lg">{cat.name}</h3>
                <p className="text-xs font-mono text-gray-400 mt-0.5">slug: {cat.slug}</p>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{cat.description}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                Active Category
              </span>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View Items <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
