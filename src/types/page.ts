export interface WebPage {
  id: string;
  name: string;
  customLink?: string;
  lastModified: string;
  type: 'custom' | 'builder';
}
