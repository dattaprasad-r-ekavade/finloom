import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

/** Placeholder for empty lists, missing data and not-yet-built features. */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ textAlign: 'center', py: { xs: 5, md: 7 }, px: 2 }}>
      {icon && (
        <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 3, bgcolor: 'brand.subtle', color: 'brand.onSubtle' }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" component="p">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
