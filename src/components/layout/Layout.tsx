import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { DashboardModule } from '../modules/DashboardModule';
import { EcommerceContainer } from '../modules/ecommerce/EcommerceContainer';
import { ModulePlaceholder } from '../modules/ModulePlaceholder';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModuleId, setActiveModuleId] = useState('ecommerce-products');
  const [activeModuleLabel, setActiveModuleLabel] = useState('List of Products');

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleSelectMenuItem = (id: string, label: string) => {
    setActiveModuleId(id);
    setActiveModuleLabel(label);
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
      <Header toggleSidebar={toggleSidebar} />

      {/* Main Body Area (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          activeItem={activeModuleId}
          onSelectMenuItem={handleSelectMenuItem}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 p-6">
            {activeModuleId === 'dashboard' ? (
              <DashboardModule />
            ) : activeModuleId.startsWith('ecommerce') ? (
              <EcommerceContainer initialSubTab={getEcommerceSubTab()} />
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
