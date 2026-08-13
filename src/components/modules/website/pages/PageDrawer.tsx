import React, { useState } from 'react';
import { Drawer } from '../../../common/Drawer';
import { WebPage } from '../../../../types/page';

interface PageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (page: Omit<WebPage, 'id' | 'lastModified' | 'type'>) => void;
}

export const PageDrawer: React.FC<PageDrawerProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [customLink, setCustomLink] = useState('');
  
  // Reset form when drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setCustomLink('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, customLink });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Page"
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Save
          </button>
        </>
      }
    >
      <form id="page-drawer-form" onSubmit={handleSubmit} className="p-6 space-y-6">
        
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            Page Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow min-h-[40px]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            Custom Link
          </label>
          <input
            type="text"
            value={customLink}
            onChange={(e) => setCustomLink(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow min-h-[40px]"
          />
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-gray-100">
          <label className="block text-sm font-bold text-gray-900">
            Other Settings <span className="font-normal text-gray-500">[Optional]</span>
          </label>
          <button type="button" className="text-blue-600 text-sm hover:underline">
            Click to expand
          </button>
        </div>

      </form>
    </Drawer>
  );
};
