'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  CheckCircle,
  Payment,
  TrendingUp,
  AccountBalance,
  Speed,
  Security,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';

type ChallengePlan = {
  id: string;
  name: string;
  description: string | null;
  accountSize: number;
  profitTargetPct: number;
  maxLossPct: number;
  dailyLossPct: number;
  fee: number;
  durationDays: number;
  allowedInstruments: string[];
  profitSplit: number;
  level: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function ChallengeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const [challenge, setChallenge] = useState<ChallengePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await fetch('/api/challenges/plans');
        const data = await response.json();
        
        if (response.ok) {
          const foundChallenge = data.plans?.find((p: ChallengePlan) => p.id === params.id);
          if (foundChallenge) {
            setChallenge(foundChallenge);
          } else {
            setError('Challenge not found');
          }
        } else {
          setError('Failed to load challenge details');
        }
      } catch (err) {
        console.error('Failed to fetch challenge:', err);
        setError('Failed to load challenge details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchChallenge();
    }
  }, [params.id]);

  const handleContinue = () => {
    if (user) {
      // User is logged in, go to challenge plans page to select
      router.push('/challenge-plans');
    } else {
      // User needs to register first
      router.push('/signup');
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Container>
      </Box>
    );
  }

  if (error || !challenge) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Challenge not found'}
          </Alert>
          <Button variant="contained" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4}>
          <Box>
            <Button 
              variant="text" 
              onClick={() => router.push('/')}
              sx={{ mb: 2 }}
            >
              ← Back to Home
            </Button>
            <Chip
              label={`Level ${challenge.level}`}
              color="primary"
              sx={{ mb: 2 }}
            />
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
              {challenge.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              {challenge.description}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {formatCurrency(challenge.fee)}
            </Typography>
          </Box>

          <Divider />

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  background: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, rgba(0,97,168,0.05) 0%, rgba(0,168,107,0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(79,195,247,0.12) 0%, rgba(76,175,80,0.15) 100%)',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AccountBalance color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Account Details
                      </Typography>
                    </Box>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" color="text.secondary">
                          Account Size
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatCurrency(challenge.accountSize)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" color="text.secondary">
                          Profit Split
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {challenge.profitSplit}%
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  background: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, rgba(0,97,168,0.05) 0%, rgba(0,168,107,0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(79,195,247,0.12) 0%, rgba(76,175,80,0.15) 100%)',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <TrendingUp color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Trading Objectives
                      </Typography>
                    </Box>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" color="text.secondary">
                          Profit Target
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {challenge.profitTargetPct}%
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {challenge.durationDays} days
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  background: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, rgba(0,97,168,0.05) 0%, rgba(0,168,107,0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(79,195,247,0.12) 0%, rgba(76,175,80,0.15) 100%)',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Security color="error" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Risk Parameters
                      </Typography>
                    </Box>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" color="text.secondary">
                          Max Loss
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                          {challenge.maxLossPct}%
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" color="text.secondary">
                          Daily Loss Limit
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                          {challenge.dailyLossPct}%
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  background: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, rgba(0,97,168,0.05) 0%, rgba(0,168,107,0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(79,195,247,0.12) 0%, rgba(76,175,80,0.15) 100%)',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Speed color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Allowed Instruments
                      </Typography>
                    </Box>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {challenge.allowedInstruments.map((instrument) => (
                        <Chip
                          key={instrument}
                          label={instrument}
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card
            sx={{
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? 'linear-gradient(135deg, rgba(0,97,168,0.08) 0%, rgba(0,168,107,0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(79,195,247,0.15) 0%, rgba(76,175,80,0.18) 100%)',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Ready to take this challenge?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                  {user
                    ? 'Click continue to proceed to the challenge selection page where you can reserve this challenge and complete the payment.'
                    : 'Register for a Finloom account to access this challenge and start your trading journey.'}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={user ? <Payment /> : <CheckCircle />}
                  onClick={handleContinue}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    backgroundImage: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'linear-gradient(135deg, #0061A8 0%, #00A86B 100%)'
                        : 'linear-gradient(135deg, #4FC3F7 0%, #4CAF50 100%)',
                  }}
                >
                  {user ? 'Continue to Challenge Plans' : 'Register Now'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
