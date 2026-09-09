import React, { useState } from 'react';
import { Search, MoreHorizontal, Copy, Check, Trash2, Edit3, Files } from 'lucide-react';
import { WebPage } from '../../../../types/page';

interface PageListProps {
  pages: WebPage[];
  onAdd: () => void;
  onActionClick: (page: WebPage) => void;
  onEditDetails?: (page: WebPage) => void;
  onDuplicate?: (page: WebPage) => void;
  onDelete?: (pageId: string) => void;
}

export const PageList: React.FC<PageListProps> = ({
  pages,
  onAdd,
  onActionClick,
  onEditDetails,
  onDuplicate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCount, setShowCount] = useState('10');
  const [activeMenuPageId, setActiveMenuPageId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const filteredPages = pages.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyUrl = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Pages</h1>
        <button
          type="button"
          onClick={onAdd}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium text-sm px-5 py-2 rounded shadow-sm transition-colors cursor-pointer"
        >
          Add Page
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show :</span>
            <select
              value={showCount}
              onChange={(e) => setShowCount(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 text-sm rounded pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50/50">
                <th className="py-4 px-5 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="py-4 px-5">Page Name</th>
                <th className="py-4 px-5">Last Modified On</th>
                <th className="py-4 px-5 w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No pages found.
                  </td>
                </tr>
              ) : (
                filteredPages.map(page => {
                  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:5173';
                  const slug = (page.slug || page.name).toLowerCase().replace(/\s+/g, '-');
                  const url = page.type === 'custom' && page.customLink 
                    ? page.customLink 
                    : `${origin}/${slug}`;

                  return (
                    <tr key={page.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5 text-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="py-4 px-5">
                        <div 
                          onClick={() => onActionClick(page)}
                          className="text-gray-800 font-medium mb-1 hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {page.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-600 text-xs">
                          <a 
                            href={url} 
                            onClick={(e) => {
                              e.preventDefault();
                              const liveUrl = page.type === 'custom' && page.customLink && page.customLink.startsWith('http') && !page.customLink.includes(window.location.host)
                                ? page.customLink
                                : `${origin}${window.location.pathname}?mode=storefront&page=${slug}`;
                              window.open(liveUrl, '_blank');
                            }}
                            className="hover:underline truncate max-w-xs md:max-w-sm cursor-pointer"
                            title="Click to view live page"
                          >
                            {url}
                          </a>
                          <button 
                            type="button"
                            onClick={(e) => handleCopyUrl(url, e)}
                            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" 
                            title="Copy URL"
                          >
                            {copiedUrl === url ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-gray-600">
                        {page.lastModified}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3 relative">
                          <button
                            type="button"
                            onClick={() => onActionClick(page)}
                            className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap transition-colors cursor-pointer"
                          >
                            {page.type === 'custom' ? 'Custom Link' : 'Page Builder'}
                          </button>

                          <div className="relative">
                            <button 
                              type="button"
                              onClick={() => setActiveMenuPageId(activeMenuPageId === page.id ? null : page.id)}
                              className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Page Options"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>

                            {activeMenuPageId === page.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-30" 
                                  onClick={() => setActiveMenuPageId(null)} 
                                />
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                                  {/* 1. Duplicate Page */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuPageId(null);
                                      if (onDuplicate) onDuplicate(page);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <Files className="w-4 h-4 text-gray-600" />
                                    <span>Duplicate Page</span>
                                  </button>

                                  {/* 2. Edit details */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuPageId(null);
                                      if (onEditDetails) onEditDetails(page);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-4 h-4 text-gray-600" />
                                    <span>Edit details</span>
                                  </button>

                                  {/* 3. Delete */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuPageId(null);
                                      if (onDelete) {
                                        if (confirm(`Are you sure you want to delete "${page.name}"?`)) {
                                          onDelete(page.id);
                                        }
                                      }
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-gray-100 mt-0.5 pt-2"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
