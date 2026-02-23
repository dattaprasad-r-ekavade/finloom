'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import {
  CheckCircleOutline,
  Payment,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';

import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { formatDateTime } from '@/lib/dateFormat';

type ChallengeSelection = {
  id: string;
  status: string;
  plan: {
    id: string;
    name: string;
    level: number;
    fee: number;
    accountSize: number;
    profitTargetPct: number;
    maxLossPct: number;
    dailyLossPct: number;
    durationDays: number;
  };
  mockedPayments: {
    id: string;
    amount: number;
    mockTransactionId: string;
    paidAt: string;
  }[];
  demoAccountCredentials: string | null;
};

type MockPaymentRecord = {
  id: string;
  amount: number;
  mockTransactionId: string;
  paidAt: string;
};

type MockPaymentResponse = {
  message?: string;
  payment: MockPaymentRecord;
  challenge: ChallengeSelection;
  credentials?: {
    username: string;
    password: string;
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const parseCredentials = (
  value: string | null
): { username: string; password: string } | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as { username: string; password: string };

    if (parsed.username && parsed.password) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to parse stored demo credentials', error);
  }

  const [usernamePart, passwordPart] = value.split('|').map((part) => part.trim());

  if (usernamePart?.toLowerCase().startsWith('username') && passwordPart?.toLowerCase().startsWith('password')) {
    const username = usernamePart.split(':')[1]?.trim();
    const password = passwordPart.split(':')[1]?.trim();

    if (username && password) {
      return { username, password };
    }
  }

  return null;
};

function MockPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);

  const [selection, setSelection] = useState<ChallengeSelection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [paymentRecord, setPaymentRecord] = useState<MockPaymentRecord | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedPlanId = searchParams.get('planId');

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!user.hasCompletedKyc) {
      router.replace('/kyc');
      return;
    }

    const fetchSelection = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/challenges/selection');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? 'Unable to load mock payment details.');
        }

        if (!data.selection) {
          setError('No challenge reservation found. Reserve a plan before making a payment.');
        }

        setSelection(data.selection ?? null);
        setPaymentRecord(data.selection?.mockedPayments?.[0] ?? null);
      } catch (selectionError) {
        console.error(selectionError);
        setError('Unable to load mock payment details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSelection();

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [router, user]);

  const isActive = selection?.status === 'ACTIVE';
  const isPending = selection?.status === 'PENDING';

  const plan = selection?.plan ?? null;
  const credentials = useMemo(
    () => parseCredentials(selection?.demoAccountCredentials ?? null),
    [selection?.demoAccountCredentials]
  );

  const handleConfirm = useCallback(async () => {
    if (!user || !selection) {
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/payment/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = (await response.json()) as MockPaymentResponse & { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Unable to process mock payment.');
        return;
      }

      setSelection(data.challenge);
      setPaymentRecord(data.payment);
      setSuccessMessage(data.message ?? 'Mock payment confirmed. Challenge activated.');

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/dashboard/user');
      }, 5000);
    } catch (paymentError) {
      console.error(paymentError);
      setError('Unexpected error while processing mock payment.');
    } finally {
      setProcessing(false);
    }
  }, [router, selection, user]);

  const handleCopyCredentials = useCallback(async () => {
    if (!credentials) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `Username: ${credentials.username}\nPassword: ${credentials.password}`
      );
      setCopyFeedback('Credentials copied to clipboard.');
      setTimeout(() => setCopyFeedback(null), 2500);
    } catch (copyError) {
      console.error(copyError);
      setCopyFeedback('Unable to copy credentials. Please copy them manually.');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  }, [credentials]);

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
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            <Stack spacing={4}>
              <Stack spacing={1}>
                <CheckCircleOutline color="success" sx={{ fontSize: 40 }} />
                <Chip
                  label="Razorpay mock checkout"
                  color="primary"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Mock payment checkpoint
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isPending
                    ? 'Confirming will create a mock payment record, activate your reserved challenge, and reveal demo trading credentials.'
                    : 'Mock payment already exists for this plan. Review the details or proceed to the dashboard.'}
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

              {copyFeedback && (
                <Alert
                  severity="info"
                  sx={{ borderRadius: 2, border: (theme) => `1px solid ${theme.palette.info.light}` }}
                >
                  {copyFeedback}
                </Alert>
              )}

              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 240,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : !selection || !plan ? (
                <Alert
                  severity="info"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => router.push('/challenge-plans')}
                    >
                      Browse plans
                    </Button>
                  }
                >
                  Reserve a challenge plan before completing the mock payment.
                </Alert>
              ) : (
                <Stack spacing={3}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
                      gap: 3,
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Payment summary
                      </Typography>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Plan
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Level {plan.level} · {plan.name}
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Evaluation fee
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {formatCurrency(plan.fee)}
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Trading capital unlocked
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatCurrency(plan.accountSize)}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack spacing={1.5}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Guardrail highlights
                      </Typography>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Profit target
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {plan.profitTargetPct}% over {plan.durationDays} days
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Max loss · Daily loss
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {plan.maxLossPct}% overall · {plan.dailyLossPct}% per day
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Payment status
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: (theme) =>
                              isActive ? theme.palette.success.main : theme.palette.warning.main,
                          }}
                        >
                          {isActive ? 'Paid (mock)' : 'Awaiting confirmation'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Divider />

                  {paymentRecord && (
                    <Stack spacing={0.75}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Latest mock payment
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Transaction ID: <strong>{paymentRecord.mockTransactionId}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Paid on {formatDateTime(paymentRecord.paidAt)} · Amount {formatCurrency(paymentRecord.amount)}
                      </Typography>
                    </Stack>
                  )}

                  <Alert
                    severity="info"
                    sx={{ borderRadius: 2, border: (theme) => `1px solid ${theme.palette.info.light}` }}
                  >
                    Your challenge is now active. Proceed to the dashboard to access your trading terminal.
                  </Alert>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ pt: 1 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Payment />}
                      onClick={handleConfirm}
                      disabled={processing || isActive}
                      sx={{ flex: 1, fontWeight: 600 }}
                    >
                      {isActive ? 'Mock payment already confirmed' : processing ? 'Processing...' : 'Confirm mock payment'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{ flex: 1, fontWeight: 600 }}
                      onClick={() => router.push('/challenge-plans')}
                    >
                      Choose a different plan
                    </Button>
                  </Stack>

                  {successMessage && (
                    <Typography variant="caption" color="text.secondary">
                      Redirecting to dashboard in 5 seconds…
                    </Typography>
                  )}

                  {selectedPlanId && (
                    <Typography variant="caption" color="text.secondary">
                      Plan reference from selection: <strong>{selectedPlanId}</strong>
                    </Typography>
                  )}
                </Stack>
              )}
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
