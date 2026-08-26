export interface CardSlotConfig {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
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
  badgeSlot: {
    enabled: boolean;
    fieldVar: string;
    bgColor: string;
    textColor: string;
  };
  mediaSlot: {
    enabled: boolean;
    type: 'logo' | 'icon' | 'image';
    fieldVar: string;
    bgStyle: 'white' | 'subtle' | 'primary';
  };
  titleSlot: {
    fieldVar: string;
    fontSize: 'sm' | 'base' | 'lg';
  };
  subtitleSlot: {
    enabled: boolean;
    fieldVar: string;
  };
  showDivider: boolean;
  footerLeftSlot: {
    enabled: boolean;
    label: string;
    fieldVar: string;
  };
  footerRightSlot: {
    enabled: boolean;
    label: string;
    fieldVar: string;
    showArrow: boolean;
  };
}

export const INITIAL_CARD_PRESETS: CardSlotConfig[] = [
  {
    id: 'style-1',
    name: 'Style 1: Official Document / Affiliation Card',
    description: 'Top accent line, upper-left badge, logo box with title/subtitle, divider line, and bottom download action.',
    showTopAccent: true,
    accentPosition: 'top',
    accentSides: { top: true, bottom: false, left: false, right: false },
    accentWidth: 4,
    accentColor: '#ea580c', // Orange/Crimson Accent
    badgeSlot: {
      enabled: true,
      fieldVar: 'year',
      bgColor: '#fff7ed',
      textColor: '#c2410c',
    },
    mediaSlot: {
      enabled: true,
      type: 'logo',
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
      label: 'Open PDF',
      fieldVar: 'pdf_url',
      showArrow: true,
    },
  },
  {
    id: 'style-2',
    name: 'Style 2: Results & Academic Award Card',
    description: 'Minimalist card layout featuring ribbon/badge icon, top year pill, and direct result action link.',
    showTopAccent: true,
    accentPosition: 'top',
    accentSides: { top: true, bottom: false, left: false, right: false },
    accentWidth: 4,
    accentColor: '#ea580c',
    badgeSlot: {
      enabled: true,
      fieldVar: 'year',
      bgColor: '#fff7ed',
      textColor: '#c2410c',
    },
    mediaSlot: {
      enabled: true,
      type: 'icon',
      fieldVar: 'category',
      bgStyle: 'subtle',
    },
    titleSlot: {
      fieldVar: 'title',
      fontSize: 'base',
    },
    subtitleSlot: {
      enabled: true,
      fieldVar: 'description',
    },
    showDivider: true,
    footerLeftSlot: {
      enabled: true,
      label: 'PDF Document',
      fieldVar: '',
    },
    footerRightSlot: {
      enabled: true,
      label: 'View Result',
      fieldVar: 'pdf_url',
      showArrow: true,
    },
  },
  {
    id: 'style-3',
    name: 'Style 3: Annual Report & Archive Card',
    description: 'Clean structured document card with document icon box and report metadata.',
    showTopAccent: true,
    accentPosition: 'top',
    accentSides: { top: true, bottom: false, left: false, right: false },
    accentWidth: 4,
    accentColor: '#7c2d12',
    badgeSlot: {
      enabled: true,
      fieldVar: 'year',
      bgColor: '#fff7ed',
      textColor: '#9a3412',
    },
    mediaSlot: {
      enabled: true,
      type: 'icon',
      fieldVar: '',
      bgStyle: 'subtle',
    },
    titleSlot: {
      fieldVar: 'title',
      fontSize: 'base',
    },
    subtitleSlot: {
      enabled: true,
      fieldVar: 'category',
    },
    showDivider: true,
    footerLeftSlot: {
      enabled: true,
      label: 'PDF Document',
      fieldVar: '',
    },
    footerRightSlot: {
      enabled: false,
      label: '',
      fieldVar: '',
      showArrow: false,
    },
  },
  {
    id: 'style-4',
    name: 'Style 4: Dual-Pane Split Card',
    description: 'Horizontal split-pane layout with left accent icon block and clean right pane for details.',
    showTopAccent: true,
    accentPosition: 'left',
    accentSides: { top: false, bottom: false, left: true, right: false },
    accentWidth: 6,
    accentColor: '#2563eb',
    badgeSlot: {
      enabled: true,
      fieldVar: 'category',
      bgColor: '#eff6ff',
      textColor: '#1d4ed8',
    },
    mediaSlot: {
      enabled: true,
      type: 'image',
      fieldVar: 'image',
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

const STORAGE_KEY = 'laravel_ui_card_presets';

export const getStoredCardPresets = (): CardSlotConfig[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: CardSlotConfig[] = JSON.parse(stored);
      return parsed.map(p => ({
        ...p,
        accentPosition: p.accentPosition || (p.showTopAccent ? 'top' : 'none'),
        accentSides: p.accentSides || {
          top: p.accentPosition === 'top' || p.accentPosition === 'all' || Boolean(p.showTopAccent),
          bottom: p.accentPosition === 'bottom' || p.accentPosition === 'all',
          left: p.accentPosition === 'left' || p.accentPosition === 'all',
          right: p.accentPosition === 'right' || p.accentPosition === 'all',
        },
        accentWidth: p.accentWidth || 4,
      }));
    }
  } catch (e) {
    console.error('Failed to parse card presets', e);
  }
  return INITIAL_CARD_PRESETS;
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

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('card-presets-updated', { detail: updated }));
  } catch (e) {
    console.error('Failed to save card preset', e);
  }

  return updated;
};

export const createNewCardPreset = (): CardSlotConfig => {
  const count = getStoredCardPresets().length + 1;
  return {
    id: `style-custom-${Date.now().toString().slice(-4)}`,
    name: `Style ${count}: Custom Card Layout`,
    description: 'Custom card layout built in Card Builder Studio.',
    isCustom: true,
    showTopAccent: true,
    accentPosition: 'left',
    accentSides: { top: false, bottom: false, left: true, right: false },
    accentWidth: 4,
    accentColor: '#2563eb',
    badgeSlot: {
      enabled: true,
      fieldVar: 'year',
      bgColor: '#eff6ff',
      textColor: '#1d4ed8',
    },
    mediaSlot: {
      enabled: true,
      type: 'logo',
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
  };
};
