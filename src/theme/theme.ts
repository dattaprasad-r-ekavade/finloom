import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';
import {
  brand,
  brandSurface,
  fontFamily,
  inverse,
  market,
  neutral,
  radius,
  status,
} from './tokens';

declare module '@mui/material/styles' {
  interface TypeBackground {
    subtle: string;
    raised: string;
  }
  interface Palette {
    brand: { subtle: string; muted: string; onSubtle: string };
    market: { up: string; down: string; flat: string };
    inverse: { bg: string; bgDeep: string; text: string; textMuted: string; accent: string };
  }
  interface PaletteOptions {
    brand?: Palette['brand'];
    market?: Palette['market'];
    inverse?: Palette['inverse'];
  }
}

type Mode = 'light' | 'dark';

const paletteFor = (mode: Mode) => ({
  primary: brand[mode],
  secondary: {
    main: brandSurface[mode].onSubtle,
    contrastText: mode === 'light' ? neutral.light.surface : neutral.dark.bg,
  },
  success: { main: status[mode].success },
  error: { main: status[mode].error },
  warning: { main: status[mode].warning },
  info: { main: status[mode].info },
  background: {
    default: neutral[mode].bg,
    paper: neutral[mode].surface,
    subtle: neutral[mode].subtle,
    raised: neutral[mode].surfaceRaised,
  },
  text: { primary: neutral[mode].text, secondary: neutral[mode].textMuted },
  divider: neutral[mode].border,
  brand: brandSurface[mode],
  market: market[mode],
  inverse: inverse[mode],
});

const headingFont = { fontFamily: fontFamily.display, letterSpacing: '-0.02em' };

const baseTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-color-scheme' },
  colorSchemes: {
    light: { palette: paletteFor('light') },
    dark: { palette: paletteFor('dark') },
  },
  typography: {
    fontFamily: fontFamily.sans,
    h1: { ...headingFont, fontWeight: 600 },
    h2: { ...headingFont, fontWeight: 600 },
    h3: { ...headingFont, fontWeight: 600 },
    h4: { ...headingFont, fontWeight: 600 },
    h5: { ...headingFont, fontWeight: 600 },
    h6: { ...headingFont, fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
    overline: { fontWeight: 700, letterSpacing: '0.12em' },
  },
  shape: { borderRadius: radius.md },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: 'antialiased' },
        '::selection': {
          background: 'var(--mui-palette-brand-muted)',
          color: 'var(--mui-palette-text-primary)',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: { root: { borderRadius: radius.lg } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: radius.sm, paddingInline: 18 } },
    },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: radius.sm } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: {
          backgroundColor: 'var(--mui-palette-background-paper)',
          borderBottom: '1px solid var(--mui-palette-divider)',
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: radius.lg } } },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 600, color: 'var(--mui-palette-text-secondary)' } } },
  },
});

export const theme = responsiveFontSizes(baseTheme);

/** Monospace family for prices and tabular numbers. */
export const robotoMonoFontFamily = fontFamily.mono;
