import type { ReactNode } from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';

interface StatusScreenProps {
  /** Short code such as 404 or 403. */
  code?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

/** Full-width message for errors, access problems and not-found pages. */
export default function StatusScreen({ code, title, description, actions, children }: StatusScreenProps) {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
      {code && (
        <Typography sx={{ fontFamily: 'var(--font-roboto-mono), monospace', fontSize: { xs: 56, md: 72 }, fontWeight: 600, color: 'primary.main', lineHeight: 1 }}>
          {code}
        </Typography>
      )}
      <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, mx: 'auto', maxWidth: 480 }}>
          {description}
        </Typography>
      )}
      {children && <Box sx={{ mt: 3 }}>{children}</Box>}
      {actions && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 4 }}>
          {actions}
        </Stack>
      )}
    </Container>
  );
}
