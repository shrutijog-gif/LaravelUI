import React, { useState } from 'react';
import { 
  Home, 
  ChevronDown, 
  ChevronRight, 
  Circle, 
  Database,
  Search,
  ShoppingBag
} from 'lucide-react';
import { MenuItem } from '../../types/navigation';

interface SidebarProps {
  activeItem: string;
  onSelectMenuItem: (id: string, label: string) => void;
  isOpen: boolean;
}

export const initialMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce',
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
    id: 'file-manager',
    label: 'File Manager',
    icon: 'circle',
  },
  {
    id: 'homepage',
    label: 'Homepage',
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
      { id: 'website-timetable', label: 'Timetable' },
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
    children: [],
  },
  {
    id: 'setup-config',
    label: 'Setup / Config',
    icon: 'database',
    children: [],
  },
  {
    id: 'developers-area',
    label: 'Developers Area',
    icon: 'circle',
    children: [],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeItem, 
  onSelectMenuItem,
  isOpen 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    ecommerce: false,
    homepage: false,
    website: false,
    'website-builder': false,
  });

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredMenuItems = initialMenuItems.filter(item => {
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
      className={`bg-[#1d4ed8] text-white flex-shrink-0 flex flex-col transition-all duration-200 z-20 ${
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      }`}
      style={{ minHeight: 'calc(100vh - 4rem)' }}
    >
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
