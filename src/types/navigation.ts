export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  badge?: string;
  isIndent?: boolean;
}

export interface NavigationSection {
  title?: string;
  items: MenuItem[];
}
