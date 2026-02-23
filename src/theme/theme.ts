'use client';

import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Light theme colors
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0061A8',
      light: '#3381BA',
      dark: '#004577',
    },
    secondary: {
      main: '#00A86B',
      light: '#33BA8B',
      dark: '#00764A',
    },
    success: {
      main: '#00A86B',
    },
    error: {
      main: '#E74C3C',
    },
    warning: {
      main: '#F39C12',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E1E1E',
      secondary: '#4D5561',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: 'var(--font-inter), "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    },
    body2: {
      fontFamily: 'var(--font-inter), "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    },
    button: {
      fontFamily: 'var(--font-inter), "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FAFAFA',
          color: '#1E1E1E',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Dark theme colors
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4FC3F7',
      light: '#80D4FA',
      dark: '#2196F3',
    },
    secondary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#E74C3C',
    },
    warning: {
      main: '#F39C12',
    },
    background: {
      default: '#0D1117',
      paper: '#161B22',
    },
    text: {
      primary: '#E6EDF3',
      secondary: '#8B949E',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: 'var(--font-poppins), "Poppins", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: 'var(--font-inter), "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    },
    body2: {
      fontFamily: 'var(--font-inter), "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    },
    button: {
      fontFamily: 'var(--font-inter), "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0D1117',
          color: '#E6EDF3',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Font family for monospace stats
const robotoMonoFontFamily = 'var(--font-roboto-mono), "Roboto Mono", "Courier New", monospace';

// Apply responsive font scaling across breakpoints
const responsiveLightTheme = responsiveFontSizes(lightTheme);
const responsiveDarkTheme = responsiveFontSizes(darkTheme);

export { responsiveLightTheme as lightTheme, responsiveDarkTheme as darkTheme, robotoMonoFontFamily };

