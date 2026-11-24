export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'radio'
  | 'checkbox'
  | 'file_pdf' 
  | 'image' 
  | 'icon'
  | 'url'
  | 'date' 
  | 'boolean' 
  | 'badge'
  | 'document_link';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDefinition {
  id: string;
  name: string; // Internal key e.g. "year", "title", "image"
  label: string; // UI Label e.g. "Academic Year", "Award Title"
  type: FieldType;
  required?: boolean;
  defaultValue?: any;
  options?: FieldOption[]; // For select/multiselect
  placeholder?: string;
  helpText?: string;
  showInCard?: boolean;
  showInTable?: boolean;
  badgeColor?: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'gray';
}

export type ViewMode = 'card' | 'grid' | 'table' | 'list';
export type CardStylePreset = 'style-1' | 'style-2' | 'style-3' | 'style-4';
export type TableStylePreset = 'table-1' | 'table-2' | 'table-3';
export type ListStylePreset = 'list-1' | 'list-2' | 'list-3';

export interface DisplayBlockConfig {
  defaultView: ViewMode;
  cardStyle: CardStylePreset | TableStylePreset | ListStylePreset | string;
  tableStyle: TableStylePreset;
  columns: 2 | 3 | 4;
  showTitle: boolean;
  showSearch: boolean;
  showCategoryFilter: boolean;
  primaryActionLabel: string; // e.g., "Download PDF", "View Details", "Learn More"
}

export interface ModuleBehaviors {
  enableNaacBinding?: boolean; // Bind to NAAC Criteria (1-7) & Key Indicators
  enableWebsitePublishing?: boolean; // Toggles website storefront visibility
  enableAuditTrail?: boolean; // Tracks modification history
}

export interface ModuleSchema {
  id: string;
  name: string; // e.g., "Awards & Honors", "Academic Timetables"
  slug: string; // e.g., "awards", "timetables", "reports"
  description: string;
  category: string; // e.g., "Academic", "Recognition", "Governance"
  status: 'published' | 'draft' | 'archived';
  version: string;
  iconName?: string; // Lucide icon name
  fields: FieldDefinition[];
  displayConfig?: DisplayBlockConfig;
  behaviors?: ModuleBehaviors;
  archetype?: ModuleArchetype; // 'standard' (flat table/card) or 'tabbed_composite' (parent entity with tabs)
  tabsConfig?: TabsConfig; // Configuration for default tabs and allowed component types
  createdAt: string;
  updatedAt: string;
}

export type ModuleArchetype = 'standard' | 'tabbed_composite';

export type TabComponentType = 
  | 'ui_section'      // UI Content Section (Editor chooses Text Block WYSIWYG or Accordion via +)
  | 'rich_text'       // WYSIWYG editor (Text Block)
  | 'accordion'       // Collapsible FAQ / panel list
  | 'faculty_grid'    // Staff / Faculty cards grid
  | 'media_gallery'   // Photo / video album
  | 'document_list';  // Downloadable timetables, circulars, PDFs

export interface TabBlueprint {
  id: string;
  label: string;
  slug: string;
  componentType: TabComponentType;
  defaultContent?: any;
  required?: boolean;
  visible?: boolean;
  allowRuntimeAdd?: boolean;
  options?: Record<string, any>;
}

export type CompositeLayoutStyle = 'horizontal_tabs' | 'vertical_tabs' | 'runny_page';

export interface TabsConfig {
  defaultTabs: TabBlueprint[];
  allowRuntimeCustomTabs?: boolean;
  allowedElementTypes?: TabComponentType[];
  defaultLayoutStyle?: CompositeLayoutStyle;
}

export interface DynamicTabItemData {
  id: string;
  label: string;
  componentType: TabComponentType;
  content: any; // HTML string for rich_text, array for accordion or faculty, etc.
  visible?: boolean;
  order?: number;
}

export interface DynamicEntityItem {
  id: string;
  tenantId: string;
  moduleSlug: string;
  data: Record<string, any>; // Dynamic parent field key-value pairs
  tabsData?: Record<string, DynamicTabItemData>; // Dynamic tabs data for tabbed_composite archetype
  showOnWebsite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudioTemplate {
  schema: ModuleSchema;
  sampleItems: DynamicEntityItem[];
}

