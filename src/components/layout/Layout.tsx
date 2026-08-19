import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { DashboardModule } from '../modules/DashboardModule';
import { EcommerceContainer } from '../modules/ecommerce/EcommerceContainer';
import { ModulePlaceholder } from '../modules/ModulePlaceholder';
import { TimetableAdmin } from '../modules/website/timetable/TimetableAdmin';
import { PageAdmin } from '../modules/website/pages/PageAdmin';

import { ModuleStudio } from '../modules/website/studio/ModuleStudio';
import { DynamicEntityManager } from '../modules/website/studio/DynamicEntityManager';

interface LayoutProps {
  onToggleViewMode?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onToggleViewMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [portalRole, setPortalRole] = useState<'superadmin' | 'collegeadmin'>('superadmin');
  const [activeModuleId, setActiveModuleId] = useState('module-studio');
  const [activeModuleLabel, setActiveModuleLabel] = useState('Module Studio');

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleSelectMenuItem = (id: string, label: string) => {
    setActiveModuleId(id);
    setActiveModuleLabel(label);
  };

  const handleSwitchPortalRole = (role: 'superadmin' | 'collegeadmin') => {
    setPortalRole(role);
    if (role === 'superadmin') {
      setActiveModuleId('module-studio');
      setActiveModuleLabel('Module Studio');
    } else {
      setActiveModuleId('dashboard');
      setActiveModuleLabel('Dashboard');
    }
  };

  const getEcommerceSubTab = (): 'dashboard' | 'products' | 'offers' | 'categories' | 'orders' => {
    switch (activeModuleId) {
      case 'ecommerce-dashboard':
        return 'dashboard';
      case 'ecommerce-offers':
        return 'offers';
      case 'ecommerce-categories':
        return 'categories';
      case 'ecommerce-orders':
        return 'orders';
      default:
        return 'products';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f4f6]">
      {/* Top Navigation Header */}
      <Header
        toggleSidebar={toggleSidebar}
        onToggleViewMode={onToggleViewMode}
        onSelectModule={handleSelectMenuItem}
        portalRole={portalRole}
        onSwitchPortalRole={handleSwitchPortalRole}
      />

      {/* Main Body Area (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar with Dynamic Superadmin / Collegeadmin Styling */}
        <Sidebar 
          isOpen={sidebarOpen}
          activeItem={activeModuleId}
          onSelectMenuItem={handleSelectMenuItem}
          portalRole={portalRole}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 p-6">
            {activeModuleId === 'dashboard' ? (
              <DashboardModule />
            ) : activeModuleId.startsWith('ecommerce') ? (
              <EcommerceContainer initialSubTab={getEcommerceSubTab()} />
            ) : activeModuleId.includes('studio') || activeModuleId === 'module-studio' ? (
              <ModuleStudio />
            ) : activeModuleId.startsWith('module-') ? (
              <DynamicEntityManager moduleSlug={activeModuleId.replace('module-', '')} />
            ) : activeModuleId.includes('content-manager') || activeModuleId === 'content-manager' ? (
              <DynamicEntityManager moduleSlug="awards" />
            ) : activeModuleId === 'website-timetable' ? (
              <TimetableAdmin />
            ) : activeModuleId === 'webpage' ? (
              <PageAdmin />
            ) : (
              <ModulePlaceholder 
                moduleId={activeModuleId} 
                moduleLabel={activeModuleLabel} 
              />
            )}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};
