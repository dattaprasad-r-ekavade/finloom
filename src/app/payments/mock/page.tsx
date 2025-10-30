'use client';

import React, { Suspense, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';

import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';

function MockPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);

  const selectedPlanId = searchParams.get('planId');

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
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          py: { xs: 6, md: 8 },
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, rgba(0,97,168,0.05) 0%, rgba(0,168,107,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(79,195,247,0.12) 0%, rgba(76,175,80,0.15) 100%)',
          }}
        >
          <CardContent sx={{ p: { xs: 4, md: 5 } }}>
            <Stack spacing={3}>
              <Stack spacing={1}>
                <CheckCircleOutline color="success" sx={{ fontSize: 40 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Mock payment checkpoint
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This is a placeholder for the Razorpay integration. We will auto-confirm your payment so you can continue testing the challenge experience.
                </Typography>
              </Stack>

              {selectedPlanId && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Plan reference captured. ID: <strong>{selectedPlanId}</strong>
                </Alert>
              )}

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ fontWeight: 600 }}
                  onClick={() => router.push('/dashboard/user')}
                >
                  Confirm mocked payment
                </Button>
                <Button variant="outlined" size="large" onClick={() => router.push('/challenge-plans')}>
                  Choose a different plan
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <MockPaymentContent />
    </Suspense>
  );
}
