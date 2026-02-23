'use client';

import React from 'react';
import { Alert, Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AdminSignupDisabledPage() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.5}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Admin Self-Signup Disabled
              </Typography>
              <Alert severity="info">
                Admin accounts are fixed and managed internally. New admin self-signups are blocked.
              </Alert>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" onClick={() => router.push('/admin/login')}>
                  Go to Admin Login
                </Button>
                <Button variant="outlined" onClick={() => router.push('/admin/local-credentials')}>
                  Local Credential Manager
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
