import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { DashboardModule } from '../modules/DashboardModule';
import { ModulePlaceholder } from '../modules/ModulePlaceholder';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModuleId, setActiveModuleId] = useState('dashboard');
  const [activeModuleLabel, setActiveModuleLabel] = useState('Dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleSelectMenuItem = (id: string, label: string) => {
    setActiveModuleId(id);
    setActiveModuleLabel(label);
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
