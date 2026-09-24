'use client';

import Link from 'next/link';
import { Alert, Button, Stack } from '@mui/material';
import { AuthCard } from '@/components/ui';

export default function AdminSignupDisabledPage() {
  return (
    <AuthCard eyebrow="Admin" title="Admin self-signup is disabled" description="Admin accounts are created and managed internally.">
      <Alert severity="info">Ask an existing administrator for access.</Alert>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button component={Link} href="/admin/login" variant="contained">
          Go to admin sign in
        </Button>
        {process.env.NODE_ENV !== 'production' && (
          <Button component={Link} href="/admin/local-credentials" variant="outlined">
            Local credential manager
          </Button>
        )}
      </Stack>
    </AuthCard>
  );
}
