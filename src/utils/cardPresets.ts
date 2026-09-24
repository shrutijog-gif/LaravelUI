export interface CardSlotConfig {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
  presetStyleType?: 'official' | 'minimal' | 'gradient-banner' | 'split-card' | 'custom';
  moduleContextId?: string;
  showTopAccent: boolean;
  accentPosition: 'top' | 'left' | 'bottom' | 'right' | 'all' | 'none';
  accentSides: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
  accentWidth: number; // 2, 4, 6, or 8px
  accentColor: string;
  gradientColor?: string;
  badgeSlot: {
    enabled: boolean;
    fieldVar: string;
    bgColor: string;
    textColor: string;
    displayMode?: 'label_and_value' | 'value_only';
  };
  mediaSlot: {
    enabled: boolean;
    type: 'icon' | 'initials' | 'image' | 'logo';
    fieldVar: string;
    bgStyle: 'white' | 'subtle' | 'primary';
    iconName?: string;
    imageUrl?: string;
    initialsText?: string;
    initialsSource?: 'static' | 'field';
    initialsFieldVar?: string;
    initialsLength?: 1 | 2 | 3 | 4;
    initialsCasing?: 'uppercase' | 'lowercase' | 'original';
    shape?: 'square' | 'rounded' | 'circle';
    size?: 'sm' | 'md' | 'lg';
    bgColor?: string;
    iconColor?: string;
  };
  titleSlot: {
    fieldVar: string;
    fontSize: 'sm' | 'base' | 'lg';
    enabled?: boolean;
  };
  subtitleSlot: {
    enabled: boolean;
    fieldVar: string;
    displayMode?: 'label_and_value' | 'value_only';
    customLabel?: string;
  };
  showDivider: boolean;
  footerLeftSlot: {
    enabled: boolean;
    label: string;
    fieldVar: string;
    displayMode?: 'label_and_value' | 'value_only';
  };
  footerRightSlot: {
    enabled: boolean;
    label: string;
    fieldVar: string;
    showArrow: boolean;
  };
  borderRadius?: 'none' | 'sm' | 'md' | 'lg';
  shadowSize?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: 'none' | 'lift' | 'scale' | 'glow';
  cardBgColor?: string;
  detailLineMode?: 'label_and_value' | 'value_only' | 'custom_label';
  customDetailLabel?: string;
  htmlTemplate?: string;
}

export interface ModuleSchema {
  id: string;
  name: string;
  fields: { name: string; label: string; type: string }[];
  sampleData: {
    year: string;
    logoText: string;
    title: string;
    recipient: string;
    pdf_url: string;
  };
}

export const MODULE_SCHEMAS: ModuleSchema[] = [
  {
    id: 'affiliation',
    name: 'Affiliation & Accreditation',
    fields: [
      { name: 'title', label: 'Affiliation Title', type: 'text' },
      { name: 'year', label: 'Status / Year', type: 'text' },
      { name: 'recipient', label: 'Authority Name', type: 'text' },
      { name: 'logoText', label: 'Logo Initials', type: 'text' },
      { name: 'pdf_url', label: 'Document Link', type: 'url' },
    ],
    sampleData: {
      year: 'Active',
      logoText: 'UGC',
      title: 'UGC Affiliation',
      recipient: 'University Grants Commission',
      pdf_url: '#',
    },
  },
  {
    id: 'timetable',
    name: 'Academic Timetables',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'year', label: 'Year', type: 'text' },
      { name: 'pdf_url', label: 'Pdf file', type: 'url' },
      { name: 'semester', label: 'Semester', type: 'text' },
      { name: 'branch', label: 'Branch', type: 'text' },
      { name: 'recipient', label: 'Branch & Semester', type: 'text' },
      { name: 'section', label: 'Section', type: 'text' },
    ],
    sampleData: {
      year: '2026-2027',
      logoText: 'BS',
      title: 'B.Sc Home Science & Food Technology Schedule',
      recipient: 'Food Technology • Semester 1',
      branch: 'Food Technology',
      semester: 'Semester 1',
      section: 'Section A',
      pdf_url: '#',
    },
  },
  {
    id: 'aqar',
    name: 'AQAR & NAAC Reports',
    fields: [
      { name: 'title', label: 'Metric Name / Title', type: 'text' },
      { name: 'year', label: 'Academic Year', type: 'text' },
      { name: 'recipient', label: 'Criterion & Category', type: 'text' },
      { name: 'logoText', label: 'Criterion Badge', type: 'text' },
      { name: 'pdf_url', label: 'Report PDF', type: 'url' },
    ],
    sampleData: {
      year: '2024-25',
      logoText: 'C-1',
      title: 'Curricular Planning and Implementation Annual Report',
      recipient: 'Criterion 1: Curricular Aspects • Metric 1.1.2',
      pdf_url: '#',
    },
  },
  {
    id: 'results',
    name: 'Results & Academic Awards',
    fields: [
      { name: 'title', label: 'Result Name', type: 'text' },
      { name: 'year', label: 'Exam Year', type: 'text' },
      { name: 'recipient', label: 'Top Scorer / Student', type: 'text' },
      { name: 'logoText', label: 'Grade Badge', type: 'text' },
      { name: 'pdf_url', label: 'Result PDF', type: 'url' },
    ],
    sampleData: {
      year: '2024',
      logoText: 'A+',
      title: 'Annual Examination Results',
      recipient: 'Batch 2020-2024 - 98.4% Pass Rate',
      pdf_url: '#',
    },
  },
  {
    id: 'reports',
    name: 'Annual Reports & Archives',
    fields: [
      { name: 'title', label: 'Report Title', type: 'text' },
      { name: 'year', label: 'Report Year', type: 'text' },
      { name: 'recipient', label: 'Publishing Department', type: 'text' },
      { name: 'logoText', label: 'Report Code', type: 'text' },
      { name: 'pdf_url', label: 'Report File', type: 'url' },
    ],
    sampleData: {
      year: '2023-24',
      logoText: 'AR',
      title: 'Annual Institutional Audit Report',
      recipient: 'Internal Quality Assurance Cell (IQAC)',
      pdf_url: '#',
    },
  },
];

export const INITIAL_CARD_PRESETS: CardSlotConfig[] = [
  {
    id: 'style-1',
    name: 'Style 1: Official Document / Affiliation Card',
    description: 'Upper-left badge, logo box with title/subtitle, divider line, and bottom download action.',
    presetStyleType: 'official',
    showTopAccent: false,
    accentPosition: 'top',
    accentSides: { top: false, bottom: false, left: false, right: false },
    accentWidth: 4,
    accentColor: '#2563eb', // Primary Blue
    gradientColor: '#2563eb',
    badgeSlot: {
      enabled: true,
      fieldVar: 'year',
      bgColor: '#eff6ff',
      textColor: '#1d4ed8',
    },
    mediaSlot: {
      enabled: true,
      type: 'initials',
      initialsLength: 2,
      shape: 'rounded',
      size: 'md',
      bgColor: '#2563eb',
      iconColor: '#ffffff',
      fieldVar: 'recipient',
      bgStyle: 'white',
    },
    titleSlot: {
      fieldVar: 'title',
      fontSize: 'base',
    },
    subtitleSlot: {
      enabled: true,
      fieldVar: 'recipient',
    },
    showDivider: true,
    footerLeftSlot: {
      enabled: true,
      label: 'Official Document',
      fieldVar: '',
    },
    footerRightSlot: {
      enabled: true,
      label: 'View Document',
      fieldVar: 'pdf_url',
      showArrow: true,
    },
  },
  {
    id: 'style-2',
    name: 'Style 2: Compact Minimal Card',
    description: 'Minimalist card layout featuring document icon badge, top year pill, and direct action link.',
    presetStyleType: 'minimal',
    showTopAccent: false,
    accentPosition: 'top',
    accentSides: { top: false, bottom: false, left: false, right: false },
    accentWidth: 4,
    accentColor: '#2563eb',
    gradientColor: '#2563eb',
    badgeSlot: {
      enabled: true,
      fieldVar: 'year',
      bgColor: '#eff6ff',
      textColor: '#1d4ed8',
    },
    mediaSlot: {
      enabled: true,
      type: 'initials',
      initialsLength: 2,
      shape: 'rounded',
      size: 'md',
      bgColor: '#2563eb',
      iconColor: '#ffffff',
      fieldVar: 'category',
      bgStyle: 'subtle',
    },
    titleSlot: {
      fieldVar: 'title',
      fontSize: 'base',
    },
    subtitleSlot: {
      enabled: true,
      fieldVar: 'recipient',
    },
    showDivider: true,
    footerLeftSlot: {
      enabled: true,
      label: 'Official Document',
      fieldVar: '',
    },
    footerRightSlot: {
      enabled: true,
      label: 'View Document',
      fieldVar: 'pdf_url',
      showArrow: true,
    },
  },
  {
    id: 'style-3',
    name: 'Style 3: Modern Gradient Banner',
    description: 'Vibrant top gradient banner presenting the title in bold, with a white body holding details and action button.',
    presetStyleType: 'gradient-banner',
    showTopAccent: false,
    accentPosition: 'top',
    accentSides: { top: false, bottom: false, left: false, right: false },
    accentWidth: 4,
    accentColor: '#2563eb',
    gradientColor: '#3b82f6',
    badgeSlot: {
      enabled: true,
      fieldVar: 'year',
      bgColor: '#ffffff33',
      textColor: '#ffffff',
    },
    mediaSlot: {
      enabled: true,
      type: 'initials',
      initialsLength: 2,
      shape: 'rounded',
      size: 'md',
      bgColor: '#2563eb',
      iconColor: '#ffffff',
      fieldVar: '',
      bgStyle: 'subtle',
    },
    titleSlot: {
      fieldVar: 'title',
      fontSize: 'base',
    },
    subtitleSlot: {
      enabled: true,
      fieldVar: 'recipient',
    },
    showDivider: true,
    footerLeftSlot: {
      enabled: true,
      label: 'Semester',
      fieldVar: '',
    },
    footerRightSlot: {
      enabled: true,
      label: 'View Document',
      fieldVar: 'pdf_url',
      showArrow: true,
    },
  },
  {
    id: 'style-4',
    name: 'Style 4: Left Accent Border Card',
    description: 'Prominent vertical brand accent border with full-width content and clean metadata bar.',
    presetStyleType: 'split-card',
    showTopAccent: false,
    accentPosition: 'left',
    accentSides: { top: false, bottom: false, left: true, right: false },
    accentWidth: 5,
    accentColor: '#2563eb',
    gradientColor: '#3b82f6',
    badgeSlot: {
      enabled: true,
      fieldVar: 'year',
      bgColor: '#eff6ff',
      textColor: '#1d4ed8',
    },
    mediaSlot: {
      enabled: true,
      type: 'initials',
      initialsLength: 2,
      shape: 'rounded',
      size: 'md',
      bgColor: '#2563eb',
      iconColor: '#ffffff',
      fieldVar: '',
      bgStyle: 'white',
    },
    titleSlot: {
      fieldVar: 'title',
      fontSize: 'base',
    },
    subtitleSlot: {
      enabled: true,
      fieldVar: 'recipient',
    },
    showDivider: false,
    footerLeftSlot: {
      enabled: true,
      label: 'Details',
      fieldVar: '',
    },
    footerRightSlot: {
      enabled: true,
      label: 'View Details',
      fieldVar: '',
      showArrow: true,
    },
  },
];

export const STORAGE_KEY = 'college_cms_card_presets';
let memoryPresetsCache: CardSlotConfig[] | null = null;

export const getStoredCardPresets = (): CardSlotConfig[] => {
  if (memoryPresetsCache) return memoryPresetsCache;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: CardSlotConfig[] = JSON.parse(stored);
      // Merge stored updates onto INITIAL_CARD_PRESETS, and add any extra custom presets
      const mergedInitial = INITIAL_CARD_PRESETS.map(initial => {
        const foundStored = parsed.find(p => p.id === initial.id);
        return foundStored || initial;
      });
      const customOnes = parsed.filter(p => !mergedInitial.some(i => i.id === p.id));
      memoryPresetsCache = [...mergedInitial, ...customOnes];
      return memoryPresetsCache;
    }
  } catch (e) {
    console.error('Failed to parse card presets', e);
  }
  memoryPresetsCache = INITIAL_CARD_PRESETS;
  return memoryPresetsCache;
};

export const saveCardPreset = (presetToSave: CardSlotConfig): CardSlotConfig[] => {
  const current = getStoredCardPresets();
  const index = current.findIndex(p => p.id === presetToSave.id);
  let updated: CardSlotConfig[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = presetToSave;
  } else {
    updated = [...current, presetToSave];
  }

  memoryPresetsCache = updated;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('localStorage quota reached, preset saved to memory cache', e);
  }

  window.dispatchEvent(new CustomEvent('card-presets-updated', { detail: updated }));
  return updated;
};

export const deleteCardPreset = (id: string): CardSlotConfig[] => {
  const current = getStoredCardPresets();
  const updated = current.filter(p => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('card-presets-updated', { detail: updated }));
  } catch (e) {
    console.error('Failed to delete card preset', e);
  }
  return updated;
};

export const resetAllCardPresets = (): CardSlotConfig[] => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('card-presets-updated', { detail: INITIAL_CARD_PRESETS }));
  } catch (e) {
    console.error('Failed to reset card presets', e);
  }
  return INITIAL_CARD_PRESETS;
};

export const duplicateCardPreset = (preset: CardSlotConfig): CardSlotConfig => {
  const newPreset: CardSlotConfig = {
    ...JSON.parse(JSON.stringify(preset)),
    id: `style-copy-${Date.now().toString().slice(-4)}`,
    name: `${preset.name} (Copy)`,
    isCustom: Boolean(preset.isCustom),
  };
  saveCardPreset(newPreset);
  return newPreset;
};

export const createNewCardPreset = (): CardSlotConfig => {
  const count = getStoredCardPresets().length + 1;
  return {
    id: `style-custom-${Date.now().toString().slice(-4)}`,
    name: `Style ${count}: Custom Card Layout`,
    description: 'Custom card layout built in Card Builder Studio.',
    isCustom: true,
    presetStyleType: 'custom',
    showTopAccent: true,
    accentPosition: 'left',
    accentSides: { top: false, bottom: false, left: true, right: false },
    accentWidth: 4,
    accentColor: '#2563eb',
    badgeSlot: {
      enabled: true,
      fieldVar: '',
      bgColor: '#eff6ff',
      textColor: '#1d4ed8',
      displayMode: 'value_only',
    },
    mediaSlot: {
      enabled: true,
      type: 'initials',
      initialsLength: 2,
      shape: 'circle',
      size: 'md',
      bgColor: '#2563eb',
      iconColor: '#ffffff',
      fieldVar: '',
      bgStyle: 'white',
    },
    titleSlot: {
      fieldVar: '',
      fontSize: 'base',
    },
    subtitleSlot: {
      enabled: true,
      fieldVar: '',
      displayMode: 'value_only',
    },
    showDivider: true,
    footerLeftSlot: {
      enabled: false,
      label: '',
      fieldVar: '',
    },
    footerRightSlot: {
      enabled: true,
      label: 'Download PDF',
      fieldVar: '',
      showArrow: true,
    },
    borderRadius: 'md',
    shadowSize: 'sm',
    hoverEffect: 'lift',
  };
};

export const DEFAULT_CARD_HTML_TEMPLATES: Record<string, string> = {
  'style-1': `<div class="p-5 space-y-4">
  <div class="flex items-start justify-between gap-2">
    <div class="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">BS</div>
    <span class="dynamicFieldDeclaration font-bold px-3 py-1 rounded-lg text-xs bg-blue-50 text-blue-700" data-slot="badgeSlot">
      2026-2027
    </span>
  </div>
  <div class="space-y-1">
    <h3 class="dynamicFieldDeclaration font-bold text-base text-gray-900" data-slot="titleSlot">
      B.Sc Home Science & Food Technology Schedule
    </h3>
    <p class="dynamicFieldDeclaration text-xs text-gray-500" data-slot="subtitleSlot">
      Food Technology • Semester 1
    </p>
  </div>
  <div class="border-t border-gray-100 pt-3 flex justify-end">
    <a class="dynamicFieldDeclaration font-bold text-xs text-blue-600 inline-flex items-center gap-1" data-slot="footerRightSlot">
      Download PDF ↗
    </a>
  </div>
</div>`,
  'style-2': `<div class="p-5 space-y-4">
  <div class="flex items-start justify-between gap-2">
    <div class="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">BS</div>
    <span class="dynamicFieldDeclaration font-bold px-3 py-1 rounded-lg text-xs bg-blue-50 text-blue-700" data-slot="badgeSlot">
      2026-2027
    </span>
  </div>
  <div class="space-y-1">
    <h3 class="dynamicFieldDeclaration font-bold text-base text-gray-900" data-slot="titleSlot">
      B.Sc Home Science & Food Technology Schedule
    </h3>
    <p class="dynamicFieldDeclaration text-xs text-gray-500" data-slot="subtitleSlot">
      Food Technology • Semester 1
    </p>
  </div>
  <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
    <a class="dynamicFieldDeclaration font-bold text-xs text-blue-600" data-slot="footerRightSlot">Download PDF ↗</a>
  </div>
</div>`,
  'style-3': `<div class="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white space-y-3">
  <div class="flex items-center justify-between">
    <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">BS</div>
    <span class="dynamicFieldDeclaration bg-white/20 px-2.5 py-0.5 rounded-full text-xs" data-slot="badgeSlot">2026-2027</span>
  </div>
  <h3 class="dynamicFieldDeclaration font-bold text-base" data-slot="titleSlot">Schedule Title</h3>
  <p class="dynamicFieldDeclaration text-xs text-white/90" data-slot="subtitleSlot">Program Details</p>
</div>
<div class="p-4 bg-white flex justify-end">
  <a class="dynamicFieldDeclaration px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl" data-slot="footerRightSlot">Download PDF ↗</a>
</div>`,
  'style-4': `<div class="p-5 border-l-4 border-l-blue-600 bg-white space-y-4">
  <div class="flex items-start justify-between gap-2">
    <div class="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">BS</div>
    <span class="dynamicFieldDeclaration font-bold px-3 py-1 rounded-lg text-xs bg-blue-50 text-blue-700" data-slot="badgeSlot">2026-2027</span>
  </div>
  <div class="space-y-1">
    <h3 class="dynamicFieldDeclaration font-bold text-base text-gray-900" data-slot="titleSlot">Schedule Title</h3>
    <p class="dynamicFieldDeclaration text-xs text-gray-500" data-slot="subtitleSlot">Program Details • Semester 1</p>
  </div>
  <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
    <span class="text-[11px] text-gray-400 font-medium">Official Document</span>
    <a class="dynamicFieldDeclaration font-bold text-xs text-blue-600" data-slot="footerRightSlot">View Details ↗</a>
  </div>
</div>`
};

export const extractDynamicSlots = (html: string): string[] => {
  const matches = html.matchAll(/data-slot=["']([^"']+)["']/g);
  const slots: string[] = [];
  for (const m of matches) {
    if (m[1] && !slots.includes(m[1])) {
      slots.push(m[1]);
    }
  }
  return slots.length > 0 ? slots : ['badgeSlot', 'titleSlot', 'subtitleSlot', 'footerRightSlot'];
};
