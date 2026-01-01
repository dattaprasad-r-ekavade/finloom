'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { CheckCircle, Payment, Verified } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

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

type ChallengeSelection = {
  id: string;
  status: string;
  plan: ChallengePlan;
  mockedPayments: {
    id: string;
    amount: number;
    mockTransactionId: string;
    paidAt: string;
  }[];
  demoAccountCredentials: string | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function ChallengePlansPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [plans, setPlans] = useState<ChallengePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSelection, setLoadingSelection] = useState(false);
  const [selection, setSelection] = useState<ChallengeSelection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressionData, setProgressionData] = useState<{
    highestPassedLevel: number;
    unlockedLevels: number[];
    canProgress: boolean;
    reason: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    // Allow users to browse challenges even without KYC
    // KYC will be required later in the flow

    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const response = await fetch('/api/challenges/plans');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? 'Unable to load challenge plans.');
        }

        setPlans(data.plans ?? []);
      } catch (planError) {
        console.error(planError);
        setError('Unable to load challenge plans right now.');
      } finally {
        setLoadingPlans(false);
      }
    };

    const fetchSelection = async () => {
      if (!user) {
        return;
      }

      setLoadingSelection(true);
      try {
        const response = await fetch(
          `/api/challenges/selection?userId=${encodeURIComponent(user.id)}`
        );
        const data = await response.json();

        if (response.ok) {
          setSelection(data.selection ?? null);
        }
      } catch (selectionError) {
        console.error(selectionError);
      } finally {
        setLoadingSelection(false);
      }
    };

    const fetchProgression = async () => {
      if (!user) {
        return;
      }

      try {
        const response = await fetch(
          `/api/challenges/next-level?userId=${encodeURIComponent(user.id)}`
        );
        const data = await response.json();

        if (response.ok) {
          setProgressionData({
            highestPassedLevel: data.highestPassedLevel ?? 0,
            unlockedLevels: data.unlockedLevels ?? [1],
            canProgress: data.canProgress ?? true,
            reason: data.reason ?? '',
          });
        }
      } catch (progressError) {
        console.error(progressError);
        // Default to level 1 unlocked if API fails
        setProgressionData({
          highestPassedLevel: 0,
          unlockedLevels: [1],
          canProgress: true,
          reason: '',
        });
      }
    };

    fetchPlans();
    fetchSelection();
    fetchProgression();
  }, [router, user]);

  const selectedPlanId = selection?.plan?.id ?? null;

  useEffect(() => {
    if (selection?.status === 'ACTIVE' && !successMessage) {
      setSuccessMessage('Challenge is already active with mock funding.');
    }
  }, [selection?.status, successMessage]);

  const comparisonHighlights = useMemo(
    () => [
      {
        label: 'Profit target',
        build: (plan: ChallengePlan) => `${plan.profitTargetPct}%`,
      },
      {
        label: 'Max loss',
        build: (plan: ChallengePlan) => `${plan.maxLossPct}%`,
      },
      {
        label: 'Daily loss guardrail',
        build: (plan: ChallengePlan) => `${plan.dailyLossPct}%`,
      },
      {
        label: 'Trading window',
        build: (plan: ChallengePlan) => `${plan.durationDays} days`,
      },
      {
        label: 'Profit split',
        build: (plan: ChallengePlan) => `${plan.profitSplit}%`,
      },
    ],
    []
  );

  const handlePlanSelection = useCallback(
    async (plan: ChallengePlan) => {
      if (!user || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await fetch('/api/challenges/select', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, planId: plan.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? 'Unable to reserve this challenge plan.');
          return;
        }

        setSuccessMessage(data.message ?? 'Challenge plan secured.');
        setSelection(data.selection ?? null);

        // Check if user has completed KYC before proceeding to payment
        if (!user.hasCompletedKyc) {
          setTimeout(() => {
            router.push('/kyc');
          }, 1200);
        } else {
          setTimeout(() => {
            router.push(`/payments/mock?planId=${encodeURIComponent(plan.id)}`);
          }, 1200);
        }
      } catch (selectError) {
        console.error(selectError);
        setError('Unexpected error while reserving this plan.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, router, user]
  );

  const isLoading = loadingPlans || loadingSelection;

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
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 6, md: 8 } }}>
        <Stack spacing={4}>
          <Stack spacing={1.5}>
            <Chip
              icon={<Verified fontSize="small" />}
              label="Select your evaluation tier"
              color="primary"
              variant="outlined"
              sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Reserve your simulated trading seat
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
              Compare the funded account pathways, lock in your preferred capital level, and proceed to the mocked payment flow to activate your evaluation.
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 320,
              }}
            >
              <CircularProgress />
            </Box>
          ) : plans.length === 0 ? (
            <Alert
              severity="info"
              sx={{
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.info.light}`,
              }}
            >
              No active challenge plans are currently available. Please check back soon as tiers reopen.
            </Alert>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {plans.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                const isActivePlan = isSelected && selection?.status === 'ACTIVE';
                const isLocked = progressionData 
                  ? !progressionData.unlockedLevels.includes(plan.level)
                  : plan.level > 1;
                const isPassed = progressionData 
                  ? plan.level <= progressionData.highestPassedLevel
                  : false;

                return (
                  <Card
                    key={plan.id}
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      border: (theme) =>
                        `1px solid ${
                          isLocked
                            ? theme.palette.grey[300]
                            : isSelected 
                            ? theme.palette.primary.light 
                            : theme.palette.divider
                        }`,
                      background: (theme) =>
                        isLocked
                          ? theme.palette.grey[100]
                          : theme.palette.mode === 'light'
                          ? 'linear-gradient(135deg, rgba(0,97,168,0.05) 0%, rgba(0,168,107,0.08) 100%)'
                          : 'linear-gradient(135deg, rgba(79,195,247,0.12) 0%, rgba(76,175,80,0.15) 100%)',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: isLocked ? 0.6 : 1,
                    }}
                  >
                      {isPassed && (
                        <Chip
                          icon={<CheckCircle fontSize="small" />}
                          label="Completed"
                          color="success"
                          size="small"
                          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                        />
                      )}
                      {isSelected && !isPassed && (
                        <Chip
                          icon={<CheckCircle fontSize="small" />}
                          label={isActivePlan ? 'Live challenge' : 'Reserved'}
                          color={isActivePlan ? 'success' : 'info'}
                          size="small"
                          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                        />
                      )}
                      {isLocked && (
                        <Chip
                          label=" Locked"
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: 16, 
                            right: 16, 
                            zIndex: 1,
                            backgroundColor: 'grey.300',
                            color: 'grey.700',
                          }}
                        />
                      )}
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Level {plan.level}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {plan.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {plan.description}
                        </Typography>
                      </Stack>

                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Capital allocation
                        </Typography>
                        <Typography variant="h6">{formatCurrency(plan.accountSize)}</Typography>
                      </Stack>

                      <Divider />

                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Risk guardrails
                        </Typography>
                        <Stack spacing={0.5}>
                          {comparisonHighlights.map((item) => (
                            <Stack direction="row" justifyContent="space-between" key={item.label}>
                              <Typography variant="body2" color="text.secondary">
                                {item.label}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.build(plan)}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>

                      <Divider />

                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Instrument access
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {plan.allowedInstruments.map((instrument) => (
                            <Chip
                              key={instrument}
                              label={instrument}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Stack>

                      <Divider />

                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Evaluation fee
                        </Typography>
                        <Typography variant="h6">{formatCurrency(plan.fee)}</Typography>
                      </Stack>

                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isLocked || isSubmitting || isSelected}
                        onClick={() => handlePlanSelection(plan)}
                        startIcon={isLocked ? undefined : <Payment />}
                        sx={{ mt: 1.5, fontWeight: 600 }}
                      >
                        {isLocked
                          ? ` Complete Level ${(progressionData?.highestPassedLevel || 0) + 1} first`
                          : isSelected
                          ? isActivePlan
                            ? 'Challenge live'
                            : 'Reserved for you'
                          : 'Reserve & continue'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

          <Alert
            severity="info"
            sx={{
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.info.light}`,
            }}
          >
            Complete the mocked payment step to receive demo account credentials and unlock challenge analytics.
          </Alert>
        </Stack>
      </Container>
    </Box>
  );
}
