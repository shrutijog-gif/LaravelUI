export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'file_pdf' 
  | 'image' 
  | 'date' 
  | 'boolean' 
  | 'badge';

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

export type ViewMode = 'card' | 'grid' | 'table';
export type CardStylePreset = 'style-1' | 'style-2' | 'style-3' | 'style-4';
export type TableStylePreset = 'table-1' | 'table-2' | 'table-3';

export interface DisplayBlockConfig {
  defaultView: ViewMode;
  cardStyle: CardStylePreset;
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
  displayConfig: DisplayBlockConfig;
  behaviors?: ModuleBehaviors;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicEntityItem {
  id: string;
  tenantId: string;
  moduleSlug: string;
  data: Record<string, any>; // Dynamic field key-value pairs
  showOnWebsite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudioTemplate {
  schema: ModuleSchema;
  sampleItems: DynamicEntityItem[];
}
