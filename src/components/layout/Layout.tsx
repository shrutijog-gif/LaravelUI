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
import { NaacSsrCycleModule } from '../modules/naac/NaacSsrCycleModule';
import { NaacCriteriaAllocation } from '../modules/naac/NaacCriteriaAllocation';
import { NaacQuickUploadLanding } from '../modules/naac/NaacQuickUploadLanding';
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
    if (portalType === 'cms-naac') return 'naac-quick-drop';
    if (portalType === 'naac-faculty') return 'naac-faculty';
    if (portalType === 'naac-program') return 'naac-aqar-standalone';
    if (portalType === 'naac-school') return 'naac-school';
    if (portalType === 'naac-university') return 'naac-university';
    return initialPortalRole === 'superadmin' ? 'module-studio' : 'naac-quick-drop';
  };

  const [activeModuleId, setActiveModuleId] = useState<string>(() => getInitialModule());
  const [activeModuleLabel, setActiveModuleLabel] = useState<string>(() => {
    const initMod = getInitialModule();
    if (initMod === 'naac-quick-drop') return 'Quick Evidence Drop';
    if (initMod === 'naac-ssr-cycle') return 'NAAC Cycles';
    if (initMod.startsWith('naac-cycle-')) return 'Cycle Workspace';
    if (initMod === 'naac-faculty') return 'Faculty Desk';
    if (initMod === 'naac-aqar-standalone') return 'AQAR';
    if (initMod === 'naac-school') return 'School Coordinator';
    if (initMod === 'naac-university') return 'University Coordinator';
    return initialPortalRole === 'superadmin' ? 'Module Studio' : 'Quick Evidence Drop';
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
            ) : activeModuleId === 'naac-aqar-standalone' || (typeof window !== 'undefined' && localStorage.getItem('college_cms_portal_type') === 'naac-program' && (activeModuleId === 'naac-aqar' || activeModuleId === 'naac-ssr' || activeModuleId === 'naac-dvv')) ? (
              <ProgramCoordinatorDesk activeSection={activeModuleId === 'naac-ssr' ? 'ssr' : activeModuleId === 'naac-dvv' ? 'dvv' : 'aqar'} />
            ) : activeModuleId === 'naac-quick-drop' || activeModuleId === 'naac-evidence-directory' ? (
              <NaacQuickUploadLanding
                academicYear="2024-25"
                initialDirectoryOpen={activeModuleId === 'naac-evidence-directory'}
                onNavigateToDocumentList={() =>
                  handleSelectMenuItem('naac-ssr-cycle', 'All Cycles')
                }
              />
            ) : activeModuleId === 'naac-ssr-cycle' || activeModuleId === 'naac-dms' || activeModuleId === 'naac-ssr' || activeModuleId === 'naac-dvv' || activeModuleId.startsWith('naac-cycle-') ? (
              <NaacSsrCycleModule
                mode="ssr"
                initialCycleId={activeModuleId.startsWith('naac-cycle-') ? activeModuleId.replace('naac-cycle-', '') : null}
                onSelectCycle={(cycleId) => {
                  if (cycleId) {
                    handleSelectMenuItem(`naac-cycle-${cycleId}`, `Cycle ${cycleId.replace('cycle-', '')}`);
                  } else {
                    handleSelectMenuItem('naac-ssr-cycle', 'All Cycles');
                  }
                }}
                onNavigateToAllocation={() =>
                  handleSelectMenuItem('naac-criteria-allocation', 'Criteria Allocation')
                }
              />
            ) : activeModuleId === 'naac-aqar' ? (
              <NaacSsrCycleModule
                mode="aqar"
                onNavigateToAllocation={() =>
                  handleSelectMenuItem('naac-criteria-allocation', 'Criteria Allocation')
                }
              />
            ) : activeModuleId === 'naac-criteria-allocation' ? (
              <NaacCriteriaAllocation
                onBackToCycles={() => handleSelectMenuItem('naac-ssr-cycle', 'All Cycles')}
              />
            ) : activeModuleId === 'naac-faculty' || activeModuleId.startsWith('faculty-') ? (
              <FacultyDesk initialTab={activeModuleId === 'faculty-evidence' ? 'my-evidence' : 'quick-upload'} />
            ) : activeModuleId === 'naac-school' || activeModuleId.startsWith('school-') ? (
              <SchoolCoordinatorDesk initialTab={activeModuleId === 'school-queue' ? 'review-queue' : 'ssr-matrix'} />
            ) : activeModuleId === 'naac-university' || activeModuleId.startsWith('univ-') ? (
              <UniversityCoordinatorDesk />
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
