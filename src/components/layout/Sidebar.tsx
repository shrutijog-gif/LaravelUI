import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ChevronDown, 
  ChevronRight, 
  Circle, 
  Database,
  Search,
  ShoppingBag,
  Code2,
  Layers,
  Briefcase,
  X,
  FileText,
  Plus,
  Send,
  AlertCircle,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { MenuItem } from '../../types/navigation';
import { getActiveTenant, CollegeTenant } from '../../data/tenantData';

export interface SidebarProps {
  activeItem: string;
  onSelectMenuItem: (id: string, label: string) => void;
  isOpen: boolean;
  onClose?: () => void;
  portalRole?: 'superadmin' | 'collegeadmin';
}

import { getStoredStudioTemplates } from '../../data/mockStudioData';

export const programCoordinatorMenuItems: MenuItem[] = [
  {
    id: 'naac-aqar',
    label: 'AQAR',
    icon: 'file',
  },
  {
    id: 'naac-ssr',
    label: 'SSR',
    icon: 'layers',
  },
  {
    id: 'naac-dvv',
    label: 'DVV',
    icon: 'check',
  },
];


export const schoolCoordinatorMenuItems: MenuItem[] = [
  {
    id: 'school-queue',
    label: 'Department Review Queue',
    icon: 'layers',
  },
  {
    id: 'school-departments',
    label: '4 Academic Programs',
    icon: 'circle',
  },
  {
    id: 'school-revisions',
    label: 'Revision Requests',
    icon: 'alert',
  },
  {
    id: 'school-forwarded',
    label: 'Forwarded to University',
    icon: 'send',
  },
];

export const universityCoordinatorMenuItems: MenuItem[] = [
  {
    id: 'univ-dashboard',
    label: 'Executive Dashboard',
    icon: 'home',
  },
  {
    id: 'univ-heatmap',
    label: '5-School Completeness',
    icon: 'layers',
  },
  {
    id: 'univ-dossier',
    label: 'Master SSR Evidence',
    icon: 'database',
  },
  {
    id: 'univ-export',
    label: 'Export NAAC Dossier',
    icon: 'briefcase',
  },
];

export const superadminMenuItems: MenuItem[] = [
  {
    id: 'platform-overview',
    label: 'Platform Dashboard',
    icon: 'home',
  },
  {
    id: 'module-studio',
    label: 'Module Studio ⚡',
    icon: 'database',
  },
  {
    id: 'naac-dms',
    label: 'NAAC Accreditation',
    icon: 'circle',
    children: [
      { id: 'naac-aqar', label: 'Program Coordinator (CSE)' },
      { id: 'naac-school', label: 'School Coordinator (Tech)' },
      { id: 'naac-university', label: 'University Coordinator (IQAC)' },
      { id: 'naac-ssr', label: 'SSR Dossier' },
      { id: 'naac-dvv', label: 'DVV Clarifications' },
    ],
  },
  {
    id: 'developers-area',
    label: 'Developers Area',
    icon: 'code',
    children: [
      { id: 'dev-importer', label: 'Convert Design (AI) ✨' },
      { id: 'dev-appearance', label: 'Website Appearance (CSS)' },
      { id: 'dev-header', label: 'Header' },
      { id: 'dev-footer', label: 'Footer' },
    ],
  },
  {
    id: 'tenant-management',
    label: 'Colleges & SaaS Tenants',
    icon: 'circle',
  },
  {
    id: 'global-notifications',
    label: 'Notification Studio',
    icon: 'circle',
  },
  {
    id: 'schema-registry',
    label: 'Global Schema Registry',
    icon: 'circle',
  },
  {
    id: 'user-roles',
    label: 'User Roles & Access Control',
    icon: 'circle',
  },
  {
    id: 'careers',
    label: 'Careers',
    icon: 'briefcase',
    children: [
      { id: 'career-postings', label: 'Job Postings' },
      { id: 'career-responses', label: 'Job Posting Responses' },
    ],
  },
];

export const getCollegeAdminMenuItems = (): MenuItem[] => {
  const templates = getStoredStudioTemplates();

  const studioChildren = templates.map(t => ({
    id: `module-${t.schema.slug}`,
    label: t.schema.name || t.schema.slug,
  }));

  const defaultStudioChildren = [
    { id: 'module-awards', label: 'Awards & Recognitions' },
    { id: 'module-reports', label: 'Examination Reports' },
  ];

  const dynamicModules = studioChildren.length > 0 
    ? Array.from(new Map(studioChildren.map(item => [item.id, item])).values())
    : defaultStudioChildren;

  const menu: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'home',
    },
    {
      id: 'naac-dms',
      label: 'NAAC Accreditation',
      icon: 'circle',
      children: [
        { id: 'naac-aqar', label: 'Program Coordinator (CSE)' },
        { id: 'naac-school', label: 'School Coordinator (Tech)' },
        { id: 'naac-university', label: 'University Coordinator (IQAC)' },
        { id: 'naac-ssr', label: 'SSR Dossier' },
        { id: 'naac-dvv', label: 'DVV Clarifications' },
      ],
    },
    {
      id: 'dynamic-modules-group',
      label: 'Dynamic Modules',
      icon: 'circle',
      children: dynamicModules,
    },
    {
      id: 'homepage',
      label: 'Home Page',
      icon: 'circle',
      children: [
        { id: 'news-notices', label: 'News And Notices' },
        { id: 'dynamic-popup', label: 'Dynamic Popup' },
        { id: 'home-slider', label: 'Home Slider' },
        { id: 'testimonials', label: 'Testimonials' },
      ],
    },
    {
      id: 'website-builder',
      label: 'Website Builder',
      icon: 'circle',
      children: [
        { id: 'webpage', label: 'Webpage' },
        { id: 'menu-builder', label: 'Menu Builder' },
      ],
    },
    {
      id: 'website',
      label: 'Website',
      icon: 'circle',
      children: [
        { id: 'photo-gallery', label: 'Photo Gallery' },
        { id: 'events', label: 'Events' },
        { id: 'activities', label: 'Activities' },
        { id: 'admission-enquiry', label: 'Website Admission Enquiry Form' },
        { id: 'staff', label: 'Staff' },
        { id: 'college-research', label: 'College Research' },
        { id: 'departments', label: 'Department' },
        { id: 'quick-links', label: 'Quick Links' },
        { id: 'nirf-showcase', label: 'NIRF Showcase' },
      ],
    },
    {
      id: 'careers',
      label: 'Careers',
      icon: 'briefcase',
      children: [
        { id: 'career-postings', label: 'Job Postings' },
        { id: 'career-responses', label: 'Job Posting Responses' },
      ],
    },
    {
      id: 'academics',
      label: 'Academics',
      icon: 'circle',
      children: [
        { id: 'departments', label: 'Departments' },
        { id: 'website-timetable', label: 'Timetables' },
        { id: 'committees', label: 'Committees' },
      ],
    },
    {
      id: 'ecommerce',
      label: 'Ecommerce',
      icon: 'shopping-bag',
      children: [
        { id: 'ecommerce-dashboard', label: 'Dashboard' },
        { id: 'ecommerce-products', label: 'List of Products' },
        { id: 'ecommerce-offers', label: 'Offers & Coupons' },
        { id: 'ecommerce-categories', label: 'Categories' },
        { id: 'ecommerce-orders', label: 'Orders' },
      ],
    },
    {
      id: 'developers-area',
      label: 'Developers Area',
      icon: 'code',
      children: [
        { id: 'dev-importer', label: 'Convert Design (AI) ✨' },
        { id: 'dev-appearance', label: 'Website Appearance' },
        { id: 'dev-footer', label: 'Footer' },
        { id: 'dev-header', label: 'Header' },
        { id: 'file-manager', label: 'File Manager' },
        { id: 'dev-shortcode', label: 'ShortCode' },
        { id: 'dev-findreplace', label: 'Find and Replace' },
      ],
    },
    {
      id: 'setup-config',
      label: 'Setup/Config',
      icon: 'database',
      children: [
        { id: 'design-settings', label: 'Design Settings' },
        { id: 'card-builder-studio', label: 'Card Builder' },
        { id: 'module-studio', label: 'Custom Module Studio ⚡' },
        { id: 'setup-email-template', label: 'Email Template' },
        { id: 'setup-manage-users', label: 'Manage Users' },
      ],
    },
  ];

  return menu;
};

export const initialMenuItems: MenuItem[] = getCollegeAdminMenuItems();

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeItem, 
  onSelectMenuItem,
  isOpen,
  onClose,
  portalRole = 'superadmin'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTenant, setCurrentTenant] = useState<CollegeTenant>(getActiveTenant());

  useEffect(() => {
    const handleTenantChange = () => {
      setCurrentTenant(getActiveTenant());
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, []);

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    'naac-dms': true,
    'developers-area': false,
    'dynamic-modules-group': false,
    'setup-config': false,
    ecommerce: false,
    homepage: false,
    website: false,
    'website-builder': false,
    careers: false,
  });

  const portalType = typeof window !== 'undefined' ? localStorage.getItem('college_cms_portal_type') : null;
  const isNaacProgram = portalType === 'naac-program' || activeItem === 'naac-aqar' || activeItem === 'naac-ssr' || activeItem === 'naac-dvv';
  const isNaacSchool = portalType === 'naac-school' || activeItem === 'naac-school' || activeItem.startsWith('school-');
  const isNaacUniversity = portalType === 'naac-university' || activeItem === 'naac-university' || activeItem.startsWith('univ-');

  const isSuperAdmin = portalRole === 'superadmin';
  const menuList = isNaacProgram
    ? programCoordinatorMenuItems
    : isNaacSchool
    ? schoolCoordinatorMenuItems
    : isNaacUniversity
    ? universityCoordinatorMenuItems
    : isSuperAdmin
    ? superadminMenuItems
    : getCollegeAdminMenuItems();

  const sidebarBg = isNaacProgram || isNaacSchool || isNaacUniversity || isSuperAdmin
    ? 'bg-[#0f172a] border-r border-slate-800 text-white'
    : 'bg-[#1d4ed8] text-white';

  const getActiveItemBg = (isActive: boolean) => {
    if (isNaacProgram || isNaacSchool || isNaacUniversity) {
      if (!isActive) return 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium';
      if (isNaacUniversity) return 'bg-purple-600 text-white font-bold shadow-xs';
      if (isNaacSchool) return 'bg-blue-600 text-white font-bold shadow-xs';
      return 'bg-emerald-600 text-white font-bold shadow-xs';
    }
    if (!isActive) return 'text-white/90 hover:bg-white/10';
    return 'bg-[#2563eb] text-white shadow-xs font-semibold';
  };

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleItemClick = (id: string, label: string) => {
    onSelectMenuItem(id, label);
    if (onClose && typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  const filteredMenuItems = menuList.filter(item => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesLabel = item.label.toLowerCase().includes(query);
    const matchesChildren = item.children?.some(child => 
      child.label.toLowerCase().includes(query)
    );
    return matchesLabel || matchesChildren;
  });

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] h-full lg:h-auto lg:static lg:flex-shrink-0 flex flex-col transition-all duration-300 shadow-2xl lg:shadow-none ${sidebarBg} ${
        isOpen 
          ? 'translate-x-0 lg:w-64' 
          : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden pointer-events-none lg:pointer-events-auto'
      }`}
      style={{ minHeight: 'calc(100vh - 4rem)' }}
    >
      {/* Mobile Drawer Header with Close Button */}
      <div className={`flex items-center justify-between px-4 py-3.5 border-b border-white/10 lg:hidden shrink-0`}>
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center font-black text-xs shrink-0">
            {isNaacProgram ? '📋' : isNaacSchool ? '🏫' : isNaacUniversity ? '🏛️' : isSuperAdmin ? '⚡' : '🏛️'}
          </div>
          <span className="font-bold text-sm text-white truncate">
            {isNaacProgram ? 'Program Coordinator' : isNaacSchool ? 'School Coordinator' : isNaacUniversity ? 'University IQAC' : isSuperAdmin ? 'WhiteCode Master Console' : currentTenant.name}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
          title="Close Navigation"
          aria-label="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role-Specific Institutional Badge Header in Sidebar */}
      {isNaacProgram && (
        <div className="p-3.5 pb-0 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-slate-700 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-600">
              📋
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Program Coordinator
              </span>
              <span className="block text-xs font-bold text-white truncate">
                B.Tech CSE Department
              </span>
            </div>
          </div>
        </div>
      )}

      {isNaacSchool && (
        <div className="p-3.5 pb-0 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-slate-700 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-600">
              🏫
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                School Coordinator
              </span>
              <span className="block text-xs font-bold text-white truncate">
                School of Technology
              </span>
            </div>
          </div>
        </div>
      )}

      {isNaacUniversity && (
        <div className="p-3.5 pb-0 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-slate-700 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-600">
              🏛️
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                University IQAC
              </span>
              <span className="block text-xs font-bold text-white truncate">
                Master SSR Directorate
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Module Search Input */}
      <div className="p-3.5 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder={
              isNaacProgram ? "Search department..." : 
              isNaacSchool ? "Search school..." : 
              isNaacUniversity ? "Search university..." : 
              "Search modules..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs rounded-lg pl-3 pr-8 py-2 border transition-colors ${
              isNaacProgram || isNaacSchool || isNaacUniversity || isSuperAdmin
                ? `bg-slate-800/80 text-white placeholder-slate-400 border-slate-700 focus:outline-none focus:ring-1 ${
                    isNaacUniversity ? 'focus:ring-purple-500' : isNaacSchool ? 'focus:ring-blue-500' : 'focus:ring-emerald-500'
                  }`
                : 'bg-white/15 text-white placeholder-white/60 border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30'
            }`}
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none text-slate-400" />
        </div>
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const isSubOpen = Boolean(openSubmenus[item.id]);
          const isActive = 
            activeItem === item.id || 
            (item.id === 'naac-dms' && activeItem.startsWith('naac-')) ||
            (isNaacUniversity && (activeItem === 'naac-university' || !activeItem) && item.id === 'univ-dashboard') ||
            (isNaacSchool && (activeItem === 'naac-school' || !activeItem) && item.id === 'school-queue') ||
            (isNaacProgram && (activeItem === 'naac-program' || !activeItem) && item.id === 'naac-aqar');

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleSubmenu(item.id);
                    if (item.id === 'naac-dms') {
                      handleItemClick('naac-aqar', 'AQAR');
                    }
                  } else {
                    handleItemClick(item.id, item.label);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${getActiveItemBg(isActive)}`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon === 'home' && <Home className="w-4 h-4 shrink-0" />}
                  {item.icon === 'file' && <FileText className="w-4 h-4 shrink-0" />}
                  {item.icon === 'plus' && <Plus className="w-4 h-4 shrink-0" />}
                  {item.icon === 'send' && <Send className="w-4 h-4 shrink-0" />}
                  {item.icon === 'alert' && <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />}
                  {item.icon === 'check' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
                  {item.icon === 'book' && <BookOpen className="w-4 h-4 shrink-0" />}
                  {item.icon === 'shopping-bag' && <ShoppingBag className="w-4 h-4 shrink-0" />}
                  {item.icon === 'database' && <Database className="w-4 h-4 shrink-0" />}
                  {item.icon === 'code' && <Code2 className="w-4 h-4 shrink-0" />}
                  {item.icon === 'circle' && <Circle className="w-4 h-4 stroke-[2] shrink-0" />}
                  {item.icon === 'layers' && <Layers className="w-4 h-4 shrink-0" />}
                  {item.icon === 'briefcase' && <Briefcase className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </div>
                {hasChildren && (
                  <span className="shrink-0 ml-1">
                    {isSubOpen ? (
                      <ChevronDown className={`w-4 h-4 ${isNaacProgram ? 'text-gray-400' : 'text-white/70'}`} />
                    ) : (
                      <ChevronRight className={`w-4 h-4 ${isNaacProgram ? 'text-gray-400' : 'text-white/70'}`} />
                    )}
                  </span>
                )}
              </button>


              {/* Submenu render */}
              {hasChildren && isSubOpen && (
                <div className="pl-6 space-y-1 py-1">
                  {item.children?.map((child) => {
                    const isChildActive = activeItem === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => handleItemClick(child.id, child.label)}
                        className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                          isChildActive
                            ? 'bg-white/20 text-white font-semibold'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block shrink-0"></span>
                        <span className="truncate">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
