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
import { DesignSettings } from '../modules/developer/DesignSettings';
import { CardBuilderStudio } from '../modules/developer/CardBuilderStudio';
import { DevHeaderFooterStudio } from '../modules/developer/DevHeaderFooterStudio';
import { FileManager } from '../modules/fileManager/FileManager';
import { CommitteesAdmin } from '../modules/website/committees/CommitteesAdmin';
import { DepartmentsAdmin } from '../modules/website/departments/DepartmentsAdmin'; // Clean departments module
import { CareersAdmin } from '../modules/website/careers/CareersAdmin';
import { NirfShowcaseAdmin } from '../modules/website/nirf/NirfShowcaseAdmin';
import { NaacDmsWorkspace } from '../modules/naac/NaacDmsWorkspace';
import { ProgramCoordinatorDesk } from '../modules/naac/ProgramCoordinatorDesk';
import { SchoolCoordinatorDesk } from '../modules/naac/SchoolCoordinatorDesk';
import { UniversityCoordinatorDesk } from '../modules/naac/UniversityCoordinatorDesk';
import { FacultyDesk } from '../modules/naac/FacultyDesk';

interface LayoutProps {
  initialPortalRole?: 'superadmin' | 'collegeadmin';
  onToggleViewMode?: () => void;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  initialPortalRole = 'collegeadmin',
  onToggleViewMode, 
  onLogout 
}) => {
  const getInitialModule = (): string => {
    const portalType = typeof window !== 'undefined' ? localStorage.getItem('college_cms_portal_type') : null;
    if (portalType === 'naac-faculty') return 'naac-faculty';
    if (portalType === 'naac-program') return 'naac-aqar';
    if (portalType === 'naac-school') return 'naac-school';
    if (portalType === 'naac-university') return 'naac-university';
    if (portalType && portalType.startsWith('naac-')) return 'naac-dashboard';
    return initialPortalRole === 'superadmin' ? 'module-studio' : 'dashboard';
  };

  const [activeModuleId, setActiveModuleId] = useState<string>(() => getInitialModule());
  const [activeModuleLabel, setActiveModuleLabel] = useState<string>(() => {
    const initMod = getInitialModule();
    if (initMod === 'naac-faculty') return 'Faculty Desk';
    if (initMod === 'naac-aqar') return 'AQAR';
    if (initMod === 'naac-school') return 'School Coordinator';
    if (initMod === 'naac-university') return 'University Coordinator';
    if (initMod === 'school-queue') return 'School Review Queue';
    if (initMod === 'univ-dashboard') return 'University IQAC';
    if (initMod === 'naac-dashboard') return 'NAAC Accreditation DMS';
    return initialPortalRole === 'superadmin' ? 'Module Studio' : 'Dashboard';
  });

  const getInitialNaacRole = (moduleId?: string): 'dashboard' | 'program' | 'school' | 'university' | 'criteria' | 'schools' => {
    const portalType = typeof window !== 'undefined' ? localStorage.getItem('college_cms_portal_type') : null;
    const target = moduleId || activeModuleId || getInitialModule();
    if (target === 'naac-program') return 'program';
    if (target === 'naac-school') return 'school';
    if (target === 'naac-university') return 'university';
    if (target === 'naac-criteria') return 'criteria';
    if (target === 'naac-schools') return 'schools';
    if (target === 'naac-dashboard') return 'dashboard';
    
    if (portalType === 'naac-school') return 'school';
    if (portalType === 'naac-university') return 'university';
    if (portalType === 'naac-program') return 'program';
    return 'dashboard';
  };

  const [sidebarOpen, setSidebarOpen] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [portalRole, setPortalRole] = useState<'superadmin' | 'collegeadmin'>(initialPortalRole);

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
        onLogout={onLogout}
      />

      {/* Main Body Area (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity cursor-pointer"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar with Dynamic Superadmin / Collegeadmin Styling */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeItem={activeModuleId}
          onSelectMenuItem={handleSelectMenuItem}
          portalRole={portalRole}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 p-3.5 sm:p-6 min-w-0 w-full overflow-x-hidden">
            {activeModuleId === 'card-builder-studio' ? (
              <CardBuilderStudio />
            ) : activeModuleId === 'design-settings' ? (
              <DesignSettings />
            ) : activeModuleId === 'dev-importer' ? (
              <DevHeaderFooterStudio initialTab="importer" />
            ) : activeModuleId === 'dev-header' ? (
              <DevHeaderFooterStudio initialTab="header" />
            ) : activeModuleId === 'dev-footer' ? (
              <DevHeaderFooterStudio initialTab="footer" />
            ) : activeModuleId === 'dev-appearance' ? (
              <DevHeaderFooterStudio initialTab="css" />
            ) : activeModuleId === 'file-manager' ? (
              <FileManager />
            ) : activeModuleId === 'dashboard' ? (
              <DashboardModule />
            ) : activeModuleId.startsWith('ecommerce') ? (
              <EcommerceContainer initialSubTab={getEcommerceSubTab()} />
            ) : activeModuleId.includes('studio') || activeModuleId === 'module-studio' ? (
              <ModuleStudio />
            ) : activeModuleId.startsWith('module-') ? (
              <DynamicEntityManager moduleSlug={activeModuleId.replace('module-', '')} />
            ) : activeModuleId.includes('content-manager') || activeModuleId === 'content-manager' ? (
              <DynamicEntityManager moduleSlug="awards" />
            ) : activeModuleId === 'career-postings' ? (
              <CareersAdmin initialTab="jobs" />
            ) : activeModuleId === 'career-responses' ? (
              <CareersAdmin initialTab="applicants" />
            ) : activeModuleId.startsWith('career') || activeModuleId === 'website-careers' ? (
              <CareersAdmin />
            ) : activeModuleId === 'committees' ? (
              <CommitteesAdmin />
            ) : activeModuleId === 'departments' ? (
              <DepartmentsAdmin />
            ) : activeModuleId === 'webpage' ? (
              <PageAdmin />
            ) : activeModuleId === 'nirf-showcase' ? (
              <NirfShowcaseAdmin />
            ) : activeModuleId === 'naac-faculty' || activeModuleId.startsWith('faculty-') ? (
              <FacultyDesk initialTab={activeModuleId === 'faculty-evidence' ? 'my-evidence' : 'quick-upload'} />
            ) : activeModuleId === 'naac-school' || activeModuleId.startsWith('school-') ? (
              <SchoolCoordinatorDesk />
            ) : activeModuleId === 'naac-university' || activeModuleId.startsWith('univ-') ? (
              <UniversityCoordinatorDesk />
            ) : activeModuleId === 'naac-aqar' || activeModuleId === 'naac-dms' || activeModuleId.startsWith('prog-') ? (
              <ProgramCoordinatorDesk activeSection="aqar" />
            ) : activeModuleId === 'naac-ssr' ? (
              <ProgramCoordinatorDesk activeSection="ssr" />
            ) : activeModuleId === 'naac-dvv' ? (
              <ProgramCoordinatorDesk activeSection="dvv" />
            ) : activeModuleId.startsWith('naac-') ? (
              <NaacDmsWorkspace initialRole={getInitialNaacRole(activeModuleId)} />
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
