export interface DesignTokens {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  neutralBg: string;
  cardBg: string;
  textColor: string;
  fontFamily: string;
  borderRadius: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  boxShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  buttonStyle: 'rounded' | 'pill' | 'sharp';
  customCss: string;
}

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  primaryColor: '#1d4ed8', // Royal Blue
  secondaryColor: '#0f172a', // Dark Slate
  accentColor: '#f59e0b', // Amber
  neutralBg: '#f8fafc', // Soft Gray
  cardBg: '#ffffff',
  textColor: '#0f172a',
  fontFamily: 'Inter',
  borderRadius: 'xl',
  boxShadow: 'md',
  buttonStyle: 'rounded',
  customCss: `/* Custom Utility Classes for Developers */
.glass-glow-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px -10px rgba(37, 99, 235, 0.15);
}

.gradient-text-accent {
  background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.custom-pill-badge {
  border-radius: 9999px;
  padding: 4px 12px;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}`,
};

const STORAGE_KEY = 'laravel_ui_design_tokens';

export const getDesignTokens = (): DesignTokens => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_DESIGN_TOKENS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to parse design tokens', e);
  }
  return DEFAULT_DESIGN_TOKENS;
};

export const saveDesignTokens = (tokens: DesignTokens): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    applyTokensToDOM(tokens);
    window.dispatchEvent(new CustomEvent('design-tokens-updated', { detail: tokens }));
  } catch (e) {
    console.error('Failed to save design tokens', e);
  }
};

export const applyTokensToDOM = (tokens: DesignTokens): void => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--ds-primary-color', tokens.primaryColor);
  root.style.setProperty('--ds-secondary-color', tokens.secondaryColor);
  root.style.setProperty('--ds-accent-color', tokens.accentColor);
  root.style.setProperty('--ds-neutral-bg', tokens.neutralBg);
  root.style.setProperty('--ds-card-bg', tokens.cardBg);
  root.style.setProperty('--ds-text-color', tokens.textColor);

  // Border Radius Mapping
  const radiusMap: Record<string, string> = {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  };
  root.style.setProperty('--ds-border-radius', radiusMap[tokens.borderRadius] || '0.75rem');

  // Custom CSS Style Tag Injection
  let styleEl = document.getElementById('ds-custom-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'ds-custom-styles';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = tokens.customCss || '';
};

// Initialize tokens on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    applyTokensToDOM(getDesignTokens());
  }, 0);
}
