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
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { formatDateTime, formatChartDate } from '@/lib/dateFormat';

interface ChallengeStatusPayload {
  challenge: {
    id: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
  };
  plan: {
    id: string;
    name: string;
    level: number;
    accountSize: number;
    profitTargetPct: number;
    maxLossPct: number;
    dailyLossPct: number;
    durationDays: number;
    profitSplit: number;
  };
  payments: {
    id: string;
    amount: number;
    mockTransactionId: string;
    paidAt: string;
  }[];
  metrics: {
    id: string;
    date: string;
    dailyPnl: number;
    cumulativePnl: number;
    tradesCount: number;
    winRate: number;
    maxDrawdown: number;
    profitTarget: number;
    violations: number;
  }[];
  summary: {
    cumulativePnl: number;
    profitTarget: number;
    progressPct: number;
    daysElapsed: number;
    daysRemaining: number;
    maxDrawdown: number;
    winRate: number;
    tradesCount: number;
  };
  credentials: {
    username: string;
    password: string;
  } | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function ChallengeMonitorPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [status, setStatus] = useState<ChallengeStatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const selectionResponse = await fetch(
          `/api/challenges/selection?userId=${encodeURIComponent(user.id)}`
        );
        const selectionData = await selectionResponse.json();

        if (!selectionResponse.ok) {
          throw new Error(selectionData.error ?? 'Unable to load challenge selection.');
        }

        if (!selectionData.selection) {
          setStatus(null);
          setError('No active challenge found. Reserve a plan to view monitoring.');
          return;
        }

        const statusResponse = await fetch(
          `/api/challenges/status/${selectionData.selection.id}`
        );
        const statusData = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(statusData.error ?? 'Unable to load challenge status.');
        }

        setStatus(statusData as ChallengeStatusPayload);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : 'Unable to load challenge monitoring data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, user]);

  const credentials = status?.credentials ?? null;

  const payment = status?.payments?.[0] ?? null;

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
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, flexGrow: 1 }}>
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Chip
              label="Challenge monitor"
              color="primary"
              variant="outlined"
              sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Track your mock challenge performance
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
              Review profit target progress, daily performance, and guardrail adherence for your active evaluation.
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
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
          ) : status ? (
            <>
              <Card
                elevation={0}
                sx={{
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
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {status.plan.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Level {status.plan.level} • {status.challenge.status}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" onClick={() => router.push('/dashboard/user')}>
                          Back to dashboard
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() =>
                            router.push(`/payments/mock?planId=${encodeURIComponent(status.plan.id)}`)
                          }
                        >
                          Payment details
                        </Button>
                      </Stack>
                    </Stack>

                    <Stack spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Profit target progress
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={status.summary.progressPct}
                        sx={{ borderRadius: 10, height: 10 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {status.summary.progressPct.toFixed(1)}% of{' '}
                        {formatCurrency(status.summary.profitTarget)} achieved.{' '}
                        {status.summary.daysRemaining} days remaining.
                      </Typography>
                    </Stack>

                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={2}
                      flexWrap="wrap"
                    >
                      <Card
                        variant="outlined"
                        sx={{ flex: 1, minWidth: 220, borderRadius: 3 }}
                      >
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Account balance
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>
                            {formatCurrency(status.plan.accountSize + status.summary.cumulativePnl)}
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card
                        variant="outlined"
                        sx={{ flex: 1, minWidth: 220, borderRadius: 3 }}
                      >
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Max drawdown
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>
                            {formatCurrency(status.summary.maxDrawdown)}
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card
                        variant="outlined"
                        sx={{ flex: 1, minWidth: 220, borderRadius: 3 }}
                      >
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Win rate
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>
                            {status.summary.winRate.toFixed(1)}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Stack>

                    {credentials && (
                      <Alert
                        severity="success"
                        sx={{
                          borderRadius: 2,
                          border: (theme) => `1px solid ${theme.palette.success.light}`,
                        }}
                      >
                        Demo credentials — Username:{' '}
                        <strong>{credentials.username}</strong>, Password:{' '}
                        <strong>{credentials.password}</strong>
                      </Alert>
                    )}

                    {payment && (
                      <Alert
                        severity="info"
                        sx={{
                          borderRadius: 2,
                          border: (theme) => `1px solid ${theme.palette.info.light}`,
                        }}
                      >
                        Latest transaction {payment.mockTransactionId} paid on{' '}
                        {formatDateTime(payment.paidAt)}
                        . Amount {formatCurrency(payment.amount)}.
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Daily performance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Showing the full series of mocked challenge metrics.
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Daily P&L</TableCell>
                          <TableCell align="right">Cumulative</TableCell>
                          <TableCell align="right">Trades</TableCell>
                          <TableCell align="right">Win rate</TableCell>
                          <TableCell align="right">Drawdown</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {status.metrics.map((metric) => (
                          <TableRow key={metric.id}>
                            <TableCell>
                              {formatChartDate(metric.date)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(metric.dailyPnl)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(metric.cumulativePnl)}
                            </TableCell>
                            <TableCell align="right">{metric.tradesCount}</TableCell>
                            <TableCell align="right">
                              {metric.winRate.toFixed(1)}%
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(metric.maxDrawdown)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}



