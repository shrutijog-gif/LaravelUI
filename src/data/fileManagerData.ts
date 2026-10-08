// File Manager Data Storage for Website Assets, Documents & Media

export interface ManagedFile {
  id: string;
  name: string;
  folder: string; // 'website-assets' | 'documents' | 'banners' | custom
  url: string;
  size: string;
  type: 'image' | 'pdf' | 'document' | 'other';
  dimensions?: string;
  uploadedAt: string;
}

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  itemCount: number;
}

export const DEFAULT_FOLDERS: FolderItem[] = [
  { id: 'website-assets', name: 'Website Assets', path: '/website-assets', itemCount: 4 },
  { id: 'documents', name: 'Documents', path: '/documents', itemCount: 2 },
  { id: 'banners', name: 'Banners', path: '/banners', itemCount: 2 },
];

export const DEFAULT_FILES: ManagedFile[] = [
  {
    id: 'f-1',
    name: 'vaze_emblem_logo.png',
    folder: 'website-assets',
    url: '/website-assets/vaze_emblem_logo.png',
    size: '18.4 KB',
    type: 'image',
    dimensions: '70 x 70',
    uploadedAt: 'Today, 04:15 PM'
  },
  {
    id: 'f-2',
    name: 'vaze_40years_pure.png',
    folder: 'website-assets',
    url: '/website-assets/vaze_40years_pure.png',
    size: '14.2 KB',
    type: 'image',
    dimensions: '104 x 53',
    uploadedAt: 'Today, 04:20 PM'
  },
  {
    id: 'f-3',
    name: 'vaze_campus_map.png',
    folder: 'website-assets',
    url: '/website-assets/vaze_campus_map.png',
    size: '145.8 KB',
    type: 'image',
    dimensions: '770 x 400',
    uploadedAt: 'Today, 04:25 PM'
  },
  {
    id: 'f-4',
    name: 'vaze_footer_map_side.png',
    folder: 'website-assets',
    url: '/website-assets/vaze_footer_map_side.png',
    size: '224 KB',
    type: 'image',
    dimensions: '420 x 280',
    uploadedAt: 'Today, 04:30 PM'
  },
  {
    id: 'f-5',
    name: 'Academic-Calendar-2025-26.pdf',
    folder: 'documents',
    url: '#',
    size: '420 KB',
    type: 'pdf',
    uploadedAt: 'Yesterday'
  },
  {
    id: 'f-6',
    name: 'College-Prospectus.pdf',
    folder: 'documents',
    url: '#',
    size: '1.8 MB',
    type: 'pdf',
    uploadedAt: 'Yesterday'
  },
  {
    id: 'f-7',
    name: 'convocation-2025.jpg',
    folder: 'banners',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop',
    size: '890 KB',
    type: 'image',
    dimensions: '1920 x 600',
    uploadedAt: '2 days ago'
  },
  {
    id: 'f-8',
    name: 'annual-sports-meet.jpg',
    folder: 'banners',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop',
    size: '720 KB',
    type: 'image',
    dimensions: '1920 x 600',
    uploadedAt: '3 days ago'
  }
];

const FILE_STORAGE_KEY = 'cms_file_manager_items_v2';

export const getStoredFiles = (): ManagedFile[] => {
  try {
    const raw = localStorage.getItem(FILE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to get stored files', e);
  }
  return DEFAULT_FILES;
};

export const saveStoredFiles = (files: ManagedFile[]) => {
  localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify(files));
  window.dispatchEvent(new CustomEvent('file-manager-updated', { detail: { files } }));
};

export const addFileToFolder = (file: Omit<ManagedFile, 'id' | 'uploadedAt'>): ManagedFile => {
  const current = getStoredFiles();
  const newFile: ManagedFile = {
    ...file,
    id: 'f-' + Date.now(),
    uploadedAt: 'Just now'
  };
  const updated = [newFile, ...current];
  saveStoredFiles(updated);
  return newFile;
};
