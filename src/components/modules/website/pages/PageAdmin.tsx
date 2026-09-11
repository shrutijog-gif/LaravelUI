import React, { useState, useEffect } from 'react';
import { WebPage } from '../../../../types/page';
import { 
  getStoredWebPages, 
  saveStoredWebPages, 
  updateStoredWebPage, 
  duplicateStoredWebPage, 
  deleteStoredWebPage,
  extractPageContentText
} from '../../../../data/mockPageData';
import { getActiveTenant } from '../../../../data/tenantData';
import { 
  formatOptimalSeoTitle, 
  formatOptimalSeoDescription, 
  formatOptimalSeoKeywords 
} from '../../../../services/aiAgentService';
import { PageList } from './PageList';
import { PageDrawer } from './PageDrawer';
import { PageSEODrawer } from './PageSEODrawer';
import { PuckEditor } from '../../../builder/PuckEditor';
import { CheckCircle2 } from 'lucide-react';

export const PageAdmin: React.FC = () => {
  const [pages, setPages] = useState<WebPage[]>(() => getStoredWebPages());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<WebPage | null>(null);
  
  // SEO Drawer state
  const [isSEODrawerOpen, setIsSEODrawerOpen] = useState(false);
  const [seoPage, setSeoPage] = useState<WebPage | null>(null);

  const [activeBuilderPage, setActiveBuilderPage] = useState<WebPage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setPages(getStoredWebPages());
    };
    window.addEventListener('web-pages-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('web-pages-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddDrawer = () => {
    setEditingPage(null);
    setIsDrawerOpen(true);
  };

  const handleEditDetails = (page: WebPage) => {
    setEditingPage(page);
    setIsDrawerOpen(true);
  };

  const handleOpenSEO = (page: WebPage) => {
    setSeoPage(page);
    setIsSEODrawerOpen(true);
  };

  const handleSaveSEO = (pageId: string, seoData: { seoTitle: string; metaDescription: string; metaKeywords: string }) => {
    const target = pages.find(p => p.id === pageId);
    if (!target) return;

    const updated = updateStoredWebPage(pageId, {
      name: target.name,
      customLink: target.customLink,
      seoTitle: seoData.seoTitle,
      metaDescription: seoData.metaDescription,
      metaKeywords: seoData.metaKeywords,
    });
    setPages(updated);
    showToast(`SEO settings for "${target.name}" saved successfully!`);
  };

  const handleSavePage = (pageData: any, pageId?: string) => {
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:5173';
    let trimmedCustom = (pageData.customLink || '').trim();
    if (trimmedCustom && !trimmedCustom.startsWith('http://') && !trimmedCustom.startsWith('https://') && !trimmedCustom.startsWith('/') && (trimmedCustom.includes('.') || trimmedCustom.startsWith('www.'))) {
      trimmedCustom = `https://${trimmedCustom}`;
    }

    const isCustom = Boolean(
      trimmedCustom !== '' && 
      !trimmedCustom.startsWith('/') && 
      !trimmedCustom.includes(origin) && 
      !trimmedCustom.includes('localhost') && 
      !trimmedCustom.includes(':5173')
    );

    const tenant = getActiveTenant();
    const collegeName = tenant?.name || 'Lady Irwin College';

    let resolvedSeoTitle = (pageData.metaTitle || pageData.seoTitle || '').trim();
    if (!resolvedSeoTitle) {
      resolvedSeoTitle = formatOptimalSeoTitle(pageData.name, collegeName);
    }

    let resolvedMetaDesc = (pageData.metaDescription || '').trim();
    let resolvedMetaKw = (pageData.metaKeywords || '').trim();

    // If custom link has data, generate SEO for this page
    if (trimmedCustom && (!resolvedMetaDesc || !resolvedMetaKw)) {
      const customContent = extractPageContentText(pageId || '', pageData.name, trimmedCustom);
      if (!resolvedMetaDesc) {
        resolvedMetaDesc = formatOptimalSeoDescription(pageData.name, collegeName, customContent);
      }
      if (!resolvedMetaKw) {
        resolvedMetaKw = formatOptimalSeoKeywords(pageData.name, collegeName, customContent);
      }
    }

    if (pageId) {
      // Updating existing page
      const updated = updateStoredWebPage(pageId, {
        ...pageData,
        seoTitle: resolvedSeoTitle,
        metaDescription: resolvedMetaDesc,
        metaKeywords: resolvedMetaKw,
        customLink: isCustom ? trimmedCustom : `${origin}/${pageData.slug || pageData.name.toLowerCase().trim().replace(/\s+/g, '-')}`,
        type: isCustom ? 'custom' : 'builder'
      });
      setPages(updated);
      setIsDrawerOpen(false);
      setEditingPage(null);
      showToast(`Page "${pageData.name}" updated successfully!`);
    } else {
      // Adding new page
      const newPage: WebPage = {
        name: pageData.name,
        customLink: isCustom ? trimmedCustom : `${origin}/${pageData.slug || pageData.name.toLowerCase().trim().replace(/\s+/g, '-')}`,
        slug: pageData.slug || pageData.name.toLowerCase().trim().replace(/\s+/g, '-'),
        seoTitle: resolvedSeoTitle,
        metaDescription: resolvedMetaDesc,
        metaKeywords: resolvedMetaKw,
        showHeader: pageData.showHeader ?? true,
        showFooter: pageData.showFooter ?? true,
        showBreadcrumb: pageData.showBreadcrumb ?? true,
        breadcrumbImageUrl: pageData.breadcrumbImageUrl,
        id: `p-${Date.now()}`,
        lastModified: new Date().toLocaleDateString('en-GB') + ' at ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase(),
        type: isCustom ? 'custom' : 'builder'
      };
      
      const updatedPages = [newPage, ...pages];
      saveStoredWebPages(updatedPages);
      setPages(updatedPages);
      setIsDrawerOpen(false);
      setEditingPage(null);
      showToast(`Page "${pageData.name}" created successfully!`);
    }
  };

  const handleDuplicatePage = (page: WebPage) => {
    const duplicated = duplicateStoredWebPage(page.id);
    if (duplicated) {
      setPages(getStoredWebPages());
      showToast(`Page "${duplicated.name}" duplicated successfully!`);
    }
  };

  const handleDeletePage = (pageId: string) => {
    const pageToDelete = pages.find(p => p.id === pageId);
    const updated = deleteStoredWebPage(pageId);
    setPages(updated);
    showToast(`Page "${pageToDelete?.name || ''}" deleted successfully.`);
  };

  const handleActionClick = (page: WebPage) => {
    if (page.type === 'builder') {
      setActiveBuilderPage(page);
    } else {
      // For Custom Link pages, open SEO Drawer directly!
      setSeoPage(page);
      setIsSEODrawerOpen(true);
    }
  };

  if (activeBuilderPage) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          <PuckEditor 
            pageId={activeBuilderPage.id}
            pageName={activeBuilderPage.name}
            onBack={() => {
              setActiveBuilderPage(null);
              setPages(getStoredWebPages());
            }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PageList 
        pages={pages}
        onAdd={handleOpenAddDrawer}
        onActionClick={handleActionClick}
        onEditDetails={handleEditDetails}
        onOpenSEO={handleOpenSEO}
        onDuplicate={handleDuplicatePage}
        onDelete={handleDeletePage}
      />
      
      <PageDrawer
        isOpen={isDrawerOpen}
        page={editingPage}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingPage(null);
        }}
        onSave={handleSavePage}
      />

      <PageSEODrawer
        isOpen={isSEODrawerOpen}
        page={seoPage}
        onClose={() => {
          setIsSEODrawerOpen(false);
          setSeoPage(null);
        }}
        onSave={handleSaveSEO}
      />
    </div>
  );
};
