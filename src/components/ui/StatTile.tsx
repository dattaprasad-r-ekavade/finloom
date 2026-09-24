import type { ReactNode } from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import { fontFamily } from '@/theme/tokens';

type Tone = 'default' | 'up' | 'down' | 'brand';

interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  /** Secondary line under the value, e.g. "of ₹5,00,000". */
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
}

const toneColor: Record<Tone, string> = {
  default: 'text.primary',
  up: 'market.up',
  down: 'market.down',
  brand: 'primary.main',
};

/** Compact KPI tile. Values use tabular monospace digits so they align in rows. */
export default function StatTile({ label, value, hint, icon, tone = 'default' }: StatTileProps) {
  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        {icon && (
          <Box sx={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 2, bgcolor: 'brand.subtle', color: 'brand.onSubtle' }}>
            {icon}
          </Box>
        )}
      </Stack>
      <Typography sx={{ mt: 1, fontFamily: fontFamily.mono, fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.4rem' }, color: toneColor[tone] }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Card>
  );
}
