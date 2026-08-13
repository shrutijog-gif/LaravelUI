import React, { useState } from 'react';
import { Search, MoreHorizontal, Copy } from 'lucide-react';
import { WebPage } from '../../../../types/page';

interface PageListProps {
  pages: WebPage[];
  onAdd: () => void;
  onActionClick: (page: WebPage) => void;
}

export const PageList: React.FC<PageListProps> = ({
  pages,
  onAdd,
  onActionClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCount, setShowCount] = useState('10');

  const filteredPages = pages.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Pages</h1>
        <button
          onClick={onAdd}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium text-sm px-5 py-2 rounded shadow-sm transition-colors"
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
                <th className="py-4 px-5 w-32">Action</th>
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
                  const url = page.type === 'custom' 
                    ? page.customLink 
                    : `https://preproladyirwin.whitecodetech.com/${page.name.toLowerCase().replace(/\s+/g, '-')}`;

                  return (
                    <tr key={page.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5 text-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-gray-800 font-medium mb-1">{page.name}</div>
                        <div className="flex items-center gap-1.5 text-blue-600 text-xs">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-xs md:max-w-sm">
                            {url}
                          </a>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors" title="Copy URL">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-gray-600">
                        {page.lastModified}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onActionClick(page)}
                            className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap transition-colors"
                          >
                            {page.type === 'custom' ? 'Custom Link' : 'Page Builder'}
                          </button>
                          <button className="text-gray-400 hover:text-gray-700 transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
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
