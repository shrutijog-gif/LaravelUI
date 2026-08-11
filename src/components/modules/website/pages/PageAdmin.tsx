import React, { useState } from 'react';
import { WebPage } from '../../../../types/page';
import { initialPages } from '../../../../data/mockPageData';
import { PageList } from './PageList';
import { PageDrawer } from './PageDrawer';
import { PuckEditor } from '../../../builder/PuckEditor';

export const PageAdmin: React.FC = () => {
  const [pages, setPages] = useState<WebPage[]>(initialPages);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeBuilderPage, setActiveBuilderPage] = useState<WebPage | null>(null);

  const handleSavePage = (pageData: Omit<WebPage, 'id' | 'lastModified' | 'type'>) => {
    const newPage: WebPage = {
      ...pageData,
      id: `p-${Date.now()}`,
      lastModified: new Date().toLocaleDateString('en-GB') + ' at ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase(),
      type: pageData.customLink && pageData.customLink.trim() !== '' ? 'custom' : 'builder'
    };
    
    setPages(prev => [newPage, ...prev]);
    setIsDrawerOpen(false);
  };

  const handleActionClick = (page: WebPage) => {
    if (page.type === 'builder') {
      setActiveBuilderPage(page);
    }
  };

  if (activeBuilderPage) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          <PuckEditor 
            pageName={activeBuilderPage.name}
            onBack={() => setActiveBuilderPage(null)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageList 
        pages={pages}
        onAdd={() => setIsDrawerOpen(true)}
        onActionClick={handleActionClick}
      />
      
      <PageDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSavePage}
      />
    </div>
  );
};
