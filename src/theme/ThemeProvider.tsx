'use client';

import type { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';

/**
 * Server-rendered MUI theme with CSS-variable light/dark schemes.
 * The active scheme is applied before paint by <InitColorSchemeScript /> in
 * the root layout, so there is no flash and no hydration gate.
 * Use `useColorScheme()` from '@mui/material/styles' to read or change the mode.
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <MUIThemeProvider theme={theme} defaultMode="system">
        <CssBaseline enableColorScheme />
        {children}
      </MUIThemeProvider>
    </AppRouterCacheProvider>
  );
}
