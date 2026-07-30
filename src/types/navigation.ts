export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
}

export interface NavigationSection {
  title?: string;
  items: MenuItem[];
}
