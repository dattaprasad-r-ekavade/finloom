'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Payment } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

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

export default function ChallengesSection() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<ChallengePlan[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch('/api/challenges/plans');
        const data = await response.json();
        if (response.ok) {
          setChallenges(data.plans ?? []);
        }
      } catch (error) {
        console.error('Failed to fetch challenges:', error);
      } finally {
        setLoadingChallenges(false);
      }
    };

    fetchChallenges();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 } }}>
      <Stack spacing={1.5} alignItems="center" sx={{ textAlign: 'center', mb: 5 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 600,
            fontFamily: '"Poppins", "Segoe UI", sans-serif',
            maxWidth: 680,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
          }}
        >
          Choose Your Trading Challenge
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          Select from our tiered challenges and start your journey to becoming a funded trader.
        </Typography>
      </Stack>

      {loadingChallenges ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : challenges.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" color="text.secondary">
            No challenges available at the moment. Please check back soon.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {challenges.map((challenge) => (
            <Grid key={challenge.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  cursor: 'pointer',
                }}
                onClick={() => router.push(`/challenges/${challenge.id}`)}
              >
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                  <Box>
                    <Chip
                      label={`Level ${challenge.level}`}
                      size="small"
                      color="primary"
                      sx={{ mb: 1.5 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {challenge.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {challenge.description}
                    </Typography>
                  </Box>

                  <Divider />

                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Account Size
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(challenge.accountSize)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Profit Target
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {challenge.profitTargetPct}%
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Max Loss
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {challenge.maxLossPct}%
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {challenge.durationDays} days
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Box sx={{ mt: 'auto' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {formatCurrency(challenge.fee)}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Payment />}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/challenges/${challenge.id}`);
                      }}
                      sx={{ fontWeight: 600 }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
