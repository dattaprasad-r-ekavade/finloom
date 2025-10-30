'use client';

import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Stack, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';

export default function ChallengePlansPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!user.hasCompletedKyc) {
      router.replace('/kyc');
    }
  }, [router, user]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />
      <Container
        maxWidth="md"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          py: { xs: 6, md: 8 },
        }}
      >
        <Stack
          spacing={3}
          sx={{
            width: '100%',
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            p: { xs: 4, md: 6 },
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, rgba(0,97,168,0.04) 0%, rgba(0,168,107,0.06) 100%)'
                : 'linear-gradient(135deg, rgba(79,195,247,0.08) 0%, rgba(76,175,80,0.1) 100%)',
          }}
        >
          <Chip
            label="Coming soon"
            color="primary"
            variant="outlined"
            sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
          />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Challenge plan marketplace is almost ready
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We are finalising the evaluation tiers, account sizes, and risk guardrails. Once live, you will be able
            to reserve a challenge seat instantly and receive demo credentials in minutes.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            In the meantime, review your dashboard analytics and ensure your trading playbook is ready for the launch window.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/dashboard/user')}
            sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
          >
            Back to dashboard
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
