import type { ReactNode } from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';

interface AuthCardProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Links under the form, e.g. "New here? Create an account". */
  footer?: ReactNode;
}

/** Centred card used by every sign-in, sign-up and password page. */
export default function AuthCard({ eyebrow, title, description, children, footer }: AuthCardProps) {
  return (
    <Card sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, sm: 4 } }}>
      <Stack spacing={3}>
        <Box>
          {eyebrow && (
            <Typography variant="overline" color="primary" component="p">
              {eyebrow}
            </Typography>
          )}
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {description}
            </Typography>
          )}
        </Box>
        {children}
        {footer && <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>{footer}</Box>}
      </Stack>
    </Card>
  );
}
