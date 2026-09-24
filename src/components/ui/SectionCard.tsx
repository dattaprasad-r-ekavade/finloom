import type { ReactNode } from 'react';
import { Box, Card, CardContent, Stack, Typography, type SxProps, type Theme } from '@mui/material';

interface SectionCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  /** Remove body padding, e.g. for full-bleed tables. */
  flush?: boolean;
  sx?: SxProps<Theme>;
}

/** Bordered surface with an optional header row. The default container for app content. */
export default function SectionCard({ title, subtitle, action, children, flush, sx }: SectionCardProps) {
  return (
    <Card sx={sx}>
      {(title || action) && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ px: { xs: 2, sm: 2.5 }, pt: 2, pb: flush ? 2 : 0 }}>
          <Box sx={{ minWidth: 0 }}>
            {title && <Typography variant="h6" component="h2" sx={{ fontSize: '1.05rem' }}>{title}</Typography>}
            {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
          </Box>
          {action}
        </Stack>
      )}
      {flush ? children : <CardContent sx={{ px: { xs: 2, sm: 2.5 }, '&:last-child': { pb: 2.5 } }}>{children}</CardContent>}
    </Card>
  );
}
