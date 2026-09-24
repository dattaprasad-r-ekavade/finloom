'use client';

import { useMemo } from 'react';
import { useColorScheme } from '@mui/material/styles';
import { brand, chart, market, neutral } from './tokens';

/**
 * Resolved colour values for chart libraries. SVG presentation attributes and
 * canvas charts cannot read CSS variables, so charts take concrete values for
 * the active scheme from here instead of hardcoding hex.
 */
export function useChartColors() {
  const { mode, systemMode } = useColorScheme();
  const resolved = (mode === 'system' ? systemMode : mode) === 'dark' ? 'dark' : 'light';
  return useMemo(() => ({
    mode: resolved,
    brand: brand[resolved].main,
    up: market[resolved].up,
    down: market[resolved].down,
    text: neutral[resolved].text,
    textMuted: neutral[resolved].textMuted,
    border: neutral[resolved].border,
    ...chart[resolved],
  }), [resolved]);
}
