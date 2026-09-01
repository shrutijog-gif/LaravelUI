import React, { useState } from 'react';
import { 
  Home, 
  ChevronDown, 
  ChevronRight, 
  Circle, 
  Database,
  Search,
  ShoppingBag,
  Code2
} from 'lucide-react';
import { MenuItem } from '../../types/navigation';

export interface SidebarProps {
  activeItem: string;
  onSelectMenuItem: (id: string, label: string) => void;
  isOpen: boolean;
  portalRole?: 'superadmin' | 'collegeadmin';
}

import { getStoredStudioTemplates } from '../../data/mockStudioData';

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
    id: 'developers-area',
    label: 'Developers Area',
    icon: 'code',
    children: [
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
    id: 'platform-settings',
    label: 'Platform Setup & Configuration',
    icon: 'database',
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
      id: 'dynamic-modules-group',
      label: 'Dynamic Modules',
      icon: 'layers',
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
      id: 'website',
      label: 'Website',
      icon: 'circle',
      children: [
        { id: 'photo-gallery', label: 'Photo Gallery' },
        { id: 'admission-enquiry', label: 'Website Admission Enquiry Form' },
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
      id: 'academics',
      label: 'Academics',
      icon: 'circle',
      children: [
        { id: 'website-timetable', label: 'Timetables' },
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
        { id: 'dev-header', label: 'Header' },
        { id: 'dev-footer', label: 'Footer' },
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
  portalRole = 'superadmin'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    'developers-area': false,
    'dynamic-modules-group': false,
    'setup-config': false,
    ecommerce: false,
    homepage: false,
    website: false,
    'website-builder': false,
  });

  const isSuperAdmin = portalRole === 'superadmin';
  const menuList = isSuperAdmin ? superadminMenuItems : getCollegeAdminMenuItems();

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
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
      className={`text-white flex-shrink-0 flex flex-col transition-all duration-300 z-20 ${
        isSuperAdmin ? 'bg-[#0f172a] border-r border-amber-500/20' : 'bg-[#1d4ed8]'
      } ${
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      }`}
      style={{ minHeight: 'calc(100vh - 4rem)' }}
    >


      {/* Module Search Input */}
      {/* Module Search Input */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/15 text-white placeholder-white/60 text-sm rounded-lg pl-3 pr-8 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <Search className="w-4 h-4 text-white/50 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const isSubOpen = Boolean(openSubmenus[item.id]);
          const isActive = activeItem === item.id;

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleSubmenu(item.id);
                  } else {
                    onSelectMenuItem(item.id, item.label);
                  }
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#2563eb] text-white shadow-xs font-semibold' 
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon === 'home' && <Home className="w-4 h-4" />}
                  {item.icon === 'shopping-bag' && <ShoppingBag className="w-4 h-4" />}
                  {item.icon === 'database' && <Database className="w-4 h-4" />}
                  {item.icon === 'code' && <Code2 className="w-4 h-4" />}
                  {item.icon === 'circle' && <Circle className="w-4 h-4 stroke-[2]" />}
                  <span>{item.label}</span>
                </div>
                {hasChildren && (
                  <span>
                    {isSubOpen ? (
                      <ChevronDown className="w-4 h-4 text-white/70" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/70" />
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
                        onClick={() => onSelectMenuItem(child.id, child.label)}
                        className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-colors ${
                          isChildActive
                            ? 'bg-white/20 text-white font-semibold'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block"></span>
                        <span>{child.label}</span>
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
