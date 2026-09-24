/**
 * Finloom design tokens: the only place raw colour values may live.
 *
 * Components must read colours through the MUI theme (`sx={{ color: 'text.secondary' }}`)
 * or CSS variables (`var(--mui-palette-brand-subtle)`), never hex literals.
 * ESLint enforces this outside `src/theme/`.
 *
 * One brand hue (forest green) in both modes. Market up/down colours are
 * deliberately distinct from the brand so profit is never confused with chrome.
 */

export const brand = {
  light: { main: '#174F3D', light: '#4A8662', dark: '#103B30', contrastText: '#FFFFFF' },
  dark: { main: '#6FB58D', light: '#8CC7A3', dark: '#4F9570', contrastText: '#0E1411' },
};

export const neutral = {
  light: {
    bg: '#F7F8F4',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    subtle: '#EFF5EF',
    border: '#E3E9E2',
    text: '#152720',
    textMuted: '#65736C',
  },
  dark: {
    bg: '#0E1411',
    surface: '#151C18',
    surfaceRaised: '#1B241F',
    subtle: '#1D2A23',
    border: '#26312B',
    text: '#E6EDE8',
    textMuted: '#93A39A',
  },
};

/** Tinted brand surfaces for chips, highlights and icon wells. */
export const brandSurface = {
  light: { subtle: '#EEF5ED', muted: '#CBE8D8', onSubtle: '#315E40' },
  dark: { subtle: '#1F3329', muted: '#2B4A3A', onSubtle: '#A8D9B6' },
};

/** Price movement colours. Always pair with a sign or ▲/▼, never colour alone. */
export const market = {
  light: { up: '#15803D', down: '#C62828', flat: '#65736C' },
  dark: { up: '#4ADE80', down: '#F87171', flat: '#93A39A' },
};

export const status = {
  light: { error: '#C62828', warning: '#B26A00', info: '#1D5C8C', success: '#2E7D4F' },
  dark: { error: '#F87171', warning: '#F5B456', info: '#7FB8E0', success: '#6FB58D' },
};

/** Dark "inverse" panel used by the landing replay preview and certificate band. */
export const inverse = {
  light: { bg: '#1B342C', bgDeep: '#13271F', text: '#EEF6F0', textMuted: '#9AAFA0', accent: '#9ED9C3' },
  dark: { bg: '#15241E', bgDeep: '#0F1A15', text: '#EEF6F0', textMuted: '#9AAFA0', accent: '#9ED9C3' },
};

export const radius = { sm: 8, md: 10, lg: 16, xl: 24 } as const;

export const fontFamily = {
  sans: 'var(--font-inter), "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  display: 'var(--font-poppins), var(--font-inter), "Segoe UI", Arial, sans-serif',
  mono: 'var(--font-roboto-mono), "Roboto Mono", ui-monospace, "Courier New", monospace',
};

/** Categorical series colours for charts (recharts, lightweight-charts). */
export const chart = {
  light: { series: ['#2F7D57', '#1D5C8C', '#B26A00', '#7A5AA6', '#8A968F'], grid: '#E3E9E2', axis: '#65736C', surface: '#FFFFFF' },
  dark: { series: ['#6FB58D', '#7FB8E0', '#F5B456', '#B8A2DA', '#93A39A'], grid: '#26312B', axis: '#93A39A', surface: '#151C18' },
};
