import React, { useState } from 'react';
import { WebsiteAppearanceView } from './WebsiteAppearanceView';
import { HeaderEditorView } from './HeaderEditorView';
import { FooterEditorView } from './FooterEditorView';
import { DesignImporterView } from './DesignImporterView';
import { FileManager } from '../fileManager/FileManager';

interface DevHeaderFooterStudioProps {
  initialTab?: 'importer' | 'header' | 'footer' | 'css' | 'files';
  onNavigateTab?: (tab: string) => void;
}

export const DevHeaderFooterStudio: React.FC<DevHeaderFooterStudioProps> = ({ 
  initialTab = 'importer',
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<'importer' | 'header' | 'footer' | 'css' | 'files'>(initialTab);

  const handleTabChange = (tab: 'importer' | 'header' | 'footer' | 'css' | 'files') => {
    setActiveTab(tab);
    if (onNavigateTab) {
      onNavigateTab(tab === 'importer' ? 'dev-importer' : tab === 'header' ? 'dev-header' : tab === 'footer' ? 'dev-footer' : tab === 'css' ? 'dev-appearance' : 'file-manager');
    }
  };

  if (activeTab === 'header') {
    return (
      <HeaderEditorView 
        onBack={() => handleTabChange('importer')}
        onOpenImporter={() => handleTabChange('importer')}
        onOpenFileManager={() => handleTabChange('files')}
      />
    );
  }

  if (activeTab === 'footer') {
    return (
      <FooterEditorView 
        onBack={() => handleTabChange('importer')}
        onOpenImporter={() => handleTabChange('importer')}
        onOpenFileManager={() => handleTabChange('files')}
      />
    );
  }

  if (activeTab === 'css') {
    return (
      <WebsiteAppearanceView 
        onOpenImporter={() => handleTabChange('importer')}
        onOpenFileManager={() => handleTabChange('files')}
      />
    );
  }

  if (activeTab === 'files') {
    return <FileManager />;
  }

  return (
    <DesignImporterView 
      onNavigateTo={(tab) => handleTabChange(tab)}
    />
  );
};

export default DevHeaderFooterStudio;
