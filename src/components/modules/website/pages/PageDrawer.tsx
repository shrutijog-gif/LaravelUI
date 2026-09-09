import React, { useState, useEffect } from 'react';
import { Drawer } from '../../../common/Drawer';
import { WebPage } from '../../../../types/page';
import { Edit3, Check, Globe } from 'lucide-react';

interface PageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  page?: WebPage | null;
  onSave: (pageData: { 
    name: string; 
    customLink?: string; 
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  }, pageId?: string) => void;
}

export const PageDrawer: React.FC<PageDrawerProps> = ({
  isOpen,
  onClose,
  page = null,
  onSave
}) => {
  const [name, setName] = useState('');
  const [customLink, setCustomLink] = useState('');
  const [slug, setSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [isCustomSlugManually, setIsCustomSlugManually] = useState(false);
  const [isOtherExpanded, setIsOtherExpanded] = useState(false);

  // SEO & Optional fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Set form when drawer opens or page changes
  useEffect(() => {
    if (isOpen) {
      const initialName = page?.name || '';
      setName(initialName);
      setCustomLink(page?.customLink || '');
      const initialSlug = initialName ? initialName.toLowerCase().replace(/\s+/g, '-') : '';
      setSlug(initialSlug);
      setIsEditingSlug(false);
      setIsCustomSlugManually(false);
      setIsOtherExpanded(false);
      setMetaTitle(initialName ? `${initialName} | Vidya Pratishthan College` : '');
      setMetaDescription('');
      setMetaKeywords('');
    }
  }, [isOpen, page]);

  // Auto-sync slug when name changes if not edited manually
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isCustomSlugManually) {
      setSlug(newName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ 
      name, 
      customLink,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      metaTitle,
      metaDescription,
      metaKeywords,
    }, page?.id);
  };

  const isEditing = Boolean(page);
  const baseUrl = typeof window !== 'undefined' && window.location && window.location.origin 
    ? window.location.origin 
    : 'http://localhost:5173';
  const displayUrl = customLink && customLink.trim() !== '' 
    ? customLink 
    : `${baseUrl}/${slug || 'page'}`;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Page' : 'Add Page'}
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2563eb] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            Save
          </button>
        </>
      }
    >
      <form id="page-drawer-form" onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* 1. Page Name * */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Page Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. abcd"
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow min-h-[40px]"
          />
        </div>

        {/* 2. Custom Link */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Custom Link
          </label>
          <input
            type="text"
            value={customLink}
            onChange={(e) => setCustomLink(e.target.value)}
            placeholder=""
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow min-h-[40px]"
          />
        </div>

        {/* 3. URL Link with Edit Button */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            URL Link
          </label>
          <div className="flex items-center justify-between gap-3 p-1">
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline truncate max-w-lg font-medium"
            >
              {displayUrl}
            </a>

            <button
              type="button"
              onClick={() => setIsEditingSlug(!isEditingSlug)}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors shadow-2xs cursor-pointer shrink-0"
              title="Edit URL slug"
            >
              {isEditingSlug ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4" />}
            </button>
          </div>

          {/* Inline Slug Editor */}
          {isEditingSlug && (
            <div className="mt-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-gray-600">Custom URL Slug</label>
              <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono">
                <span className="text-gray-400 select-none">{baseUrl}/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''));
                    setIsCustomSlugManually(true);
                  }}
                  placeholder="custom-slug"
                  className="flex-1 bg-transparent text-blue-600 font-bold outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. Other Settings [Optional] with Expand / Collapse */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-800">
              Other Settings <span className="font-normal text-gray-400 text-xs">[Optional]</span>
            </label>
            <button 
              type="button" 
              onClick={() => setIsOtherExpanded(!isOtherExpanded)}
              className="text-blue-600 text-sm hover:underline cursor-pointer font-medium"
            >
              {isOtherExpanded ? 'Click to collapse' : 'Click to expand'}
            </button>
          </div>

          {isOtherExpanded && (
            <div className="mt-4 p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Meta Title (SEO)
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="e.g. Page Title | College Name"
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Short description for search engines..."
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="e.g. college, admissions, baramati, syllabus"
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

      </form>
    </Drawer>
  );
};
