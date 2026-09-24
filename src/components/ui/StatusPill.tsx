import type { ReactNode } from 'react';
import { Box } from '@mui/material';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'brand';

const toneSx: Record<StatusTone, { color: string; dot: string }> = {
  neutral: { color: 'text.secondary', dot: 'text.secondary' },
  success: { color: 'success.main', dot: 'success.main' },
  warning: { color: 'warning.main', dot: 'warning.main' },
  error: { color: 'error.main', dot: 'error.main' },
  info: { color: 'info.main', dot: 'info.main' },
  brand: { color: 'brand.onSubtle', dot: 'primary.main' },
};

/** Small status label with a dot, e.g. "Active", "Pending review", "Delayed · 14:32 IST". */
export default function StatusPill({ tone = 'neutral', children }: { tone?: StatusTone; children: ReactNode }) {
  const t = toneSx[tone];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.25,
        borderRadius: 999,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: t.color,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '20px',
        whiteSpace: 'nowrap',
      }}
    >
      <Box component="span" aria-hidden="true" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: t.dot }} />
      {children}
    </Box>
  );
}
