'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Stack,
  Button,
  Alert,
  Skeleton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShowChart,
  ContentCopy,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { robotoMonoFontFamily } from '@/theme/theme';
import { useAuthStore } from '@/store/authStore';
import { parseChallengeCredentials } from '@/lib/challengeCredentials';

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
  credentials: {
    username: string;
    password: string;
  } | null;
  summary: {
    daysRemaining: number;
    progressPct: number;
    profitTarget: number;
  };
  metrics: {
    id: string;
    date: string;
    dailyPnl: number;
    cumulativePnl: number;
    tradesCount: number;
    winRate: number;
    maxDrawdown: number;
  }[];
}

type ChallengeSelection = {
  id: string;
  status: string;
  plan: {
    id: string;
    name: string;
    level: number;
    accountSize: number;
    fee: number;
    profitTargetPct: number;
    maxLossPct: number;
    dailyLossPct: number;
    durationDays: number;
    profitSplit: number;
    allowedInstruments: string[];
  };
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

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));


const FALLBACK_PERFORMANCE_DATA = [
  { date: 'Jan', pnl: 4000, cumulative: 4000 },
  { date: 'Feb', pnl: 3000, cumulative: 7000 },
  { date: 'Mar', pnl: 2000, cumulative: 9000 },
  { date: 'Apr', pnl: 2780, cumulative: 11780 },
  { date: 'May', pnl: 1890, cumulative: 13670 },
  { date: 'Jun', pnl: 2390, cumulative: 16060 },
];

const FALLBACK_PORTFOLIO_DATA = [
  { date: '1', value: 45000 },
  { date: '5', value: 47000 },
  { date: '10', value: 46500 },
  { date: '15', value: 49000 },
  { date: '20', value: 51000 },
  { date: '25', value: 52500 },
  { date: '30', value: 54200 },
];

const FALLBACK_TRADE_VOLUME_DATA = [
  { date: 'Mon', trades: 120, winRate: 65 },
  { date: 'Tue', trades: 150, winRate: 60 },
  { date: 'Wed', trades: 98, winRate: 62 },
  { date: 'Thu', trades: 180, winRate: 70 },
  { date: 'Fri', trades: 200, winRate: 68 },
  { date: 'Sat', trades: 85, winRate: 55 },
  { date: 'Sun', trades: 60, winRate: 58 },
];


export default function UserDashboard() {
  const router = useRouter();
  const { user, isLoading, checkAuth } = useAuthStore();
  const hasCompletedKyc = user?.hasCompletedKyc ?? false;
  const kycStatusText = hasCompletedKyc ? 'KYC approved' : 'KYC pending';
  const kycChipColor = hasCompletedKyc ? 'success' : 'warning';
  const [selection, setSelection] = useState<ChallengeSelection | null>(null);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [challengeStatus, setChallengeStatus] =
    useState<ChallengeStatusPayload | null>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Wait for auth check to complete before redirecting
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    const fetchSelection = async () => {
      if (!hasCompletedKyc) {
        return;
      }

      setSelectionLoading(true);
      setSelectionError(null);

      try {
        const response = await fetch(
          `/api/challenges/selection?userId=${encodeURIComponent(user.id)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? 'Unable to load challenge selection.');
        }

        setSelection(data.selection ?? null);
      } catch (error) {
        console.error(error);
        setSelectionError('Unable to load your challenge plan.');
      } finally {
        setSelectionLoading(false);
      }
    };

    fetchSelection();
  }, [hasCompletedKyc, router, user]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!selection) {
        setChallengeStatus(null);
        return;
      }

      setStatusLoading(true);
      setStatusError(null);

      try {
        const response = await fetch(`/api/challenges/status/${selection.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? 'Unable to load challenge status.');
        }

        setChallengeStatus(data as ChallengeStatusPayload);
      } catch (error) {
        console.error(error);
        setStatusError('Unable to load challenge status.');
      } finally {
        setStatusLoading(false);
      }
    };

    fetchStatus();
  }, [selection]);

  const isActiveChallenge =
    (challengeStatus?.challenge.status ?? selection?.status) === 'ACTIVE';

  const primaryPayment =
    challengeStatus?.payments?.[0] ?? selection?.mockedPayments?.[0] ?? null;
  const credentials = useMemo(
    () =>
      challengeStatus?.credentials ??
      parseChallengeCredentials(selection?.demoAccountCredentials ?? null),
    [challengeStatus?.credentials, selection?.demoAccountCredentials]
  );

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
    } catch (error) {
      console.error('Clipboard copy failed', error);
      setCopyFeedback('Unable to copy credentials. Please copy them manually.');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  }, [credentials]);

  const challengeHighlights = useMemo(() => {
    const basePlan = challengeStatus?.plan ?? selection?.plan ?? null;
    const summary = challengeStatus?.summary ?? null;

    if (!basePlan) {
      return [];
    }

    const targetAmount = basePlan.accountSize * (basePlan.profitTargetPct / 100);

    return [
      { label: 'Capital', value: formatCurrency(basePlan.accountSize) },
      {
        label: 'Profit target',
        value: `${basePlan.profitTargetPct}% (${formatCurrency(targetAmount)})`,
      },
      { label: 'Max loss', value: `${basePlan.maxLossPct}%` },
      { label: 'Daily loss', value: `${basePlan.dailyLossPct}%` },
      { label: 'Duration', value: `${basePlan.durationDays} days` },
      {
        label: 'Progress',
        value: summary ? `${summary.progressPct.toFixed(1)}%` : '—',
      },
      {
        label: 'Days remaining',
        value: summary ? `${summary.daysRemaining}` : '—',
      },
    ];
  }, [challengeStatus, selection]);

  const metricsSeries = useMemo(() => {
    const metrics = challengeStatus?.metrics ?? [];

    if (metrics.length === 0) {
      return {
        cumulative: FALLBACK_PORTFOLIO_DATA,
        daily: FALLBACK_PERFORMANCE_DATA,
        trades: FALLBACK_TRADE_VOLUME_DATA,
      };
    }

    const accountSize =
      challengeStatus?.plan.accountSize ?? selection?.plan.accountSize ?? 0;

    const cumulative = metrics.map((metric) => ({
      date: new Date(metric.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      value: accountSize + metric.cumulativePnl,
    }));

    const daily = metrics.map((metric) => ({
      date: new Date(metric.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      pnl: metric.dailyPnl,
      cumulative: metric.cumulativePnl,
    }));

    const trades = metrics.map((metric) => ({
      date: new Date(metric.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      trades: metric.tradesCount,
      winRate: metric.winRate,
    }));

    return { cumulative, daily, trades };
  }, [challengeStatus, selection]);

  const stats = [
    {
      title: 'Total Balance',
      value: '$54,200',
      change: '+8.2%',
      isPositive: true,
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Today\'s P&L',
      value: '$1,680',
      change: '+3.1%',
      isPositive: true,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Active Positions',
      value: '12',
      change: '+2',
      isPositive: true,
      icon: <ShowChart sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Win Rate',
      value: '68.5%',
      change: '-1.2%',
      isPositive: false,
      icon: <TrendingDown sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            User Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
            Monitor your funded accounts, measure risk in real time, and action opportunities instantly with
            responsive analytics tailored for traders.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Chip label="Live" color="success" variant="outlined" />
            <Chip label="Risk Guardrails" color="warning" variant="outlined" />
            <Chip label="Performance" color="primary" variant="outlined" />
            <Chip label={kycStatusText} color={kycChipColor} variant="filled" />
          </Stack>
        </Stack>

        {!hasCompletedKyc && (
          <Alert
            severity="warning"
            sx={{
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.warning.light}`,
              mb: 4,
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => router.push('/kyc')}
                sx={{ fontWeight: 600 }}
              >
                Complete now
              </Button>
            }
          >
            Complete the rapid KYC flow to unlock challenge plans and funding simulations.
          </Alert>
        )}

        {statusError && (
          <Alert
            severity="error"
            onClose={() => setStatusError(null)}
            sx={{
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.error.light}`,
              mb: 4,
            }}
          >
            {statusError}
          </Alert>
        )}

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            mb: 4,
          }}
        >
          {selectionLoading || statusLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="text" width={240} height={28} />
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            </Stack>
          ) : selection ? (
            <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Challenge plan reserved: {selection.plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Level {selection.plan.level}{' '}
                    {isActiveChallenge
                      ? 'is funded with mock capital. Monitor your metrics and stay within guardrails.'
                      : 'pathway secured. Complete the mocked payment to activate your simulated capital.'}
                  </Typography>
                </Box>
                <Chip
                  label={selection.status}
                  color={isActiveChallenge ? 'success' : 'warning'}
                  sx={{ alignSelf: 'flex-start' }}
                />
              </Stack>

              <Stack
                direction="row"
                flexWrap="wrap"
                gap={2}
                sx={{ mt: 1 }}
              >
                {challengeHighlights.map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      minWidth: 140,
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Stack direction="row" flexWrap="wrap" gap={1}>
                {selection.plan.allowedInstruments.map((instrument) => (
                  <Chip key={instrument} label={instrument} variant="outlined" size="small" />
                ))}
              </Stack>

              {challengeStatus && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Profit target progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={challengeStatus.summary.progressPct}
                    sx={{ borderRadius: 10, height: 10 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {challengeStatus.summary.progressPct.toFixed(1)}% of{' '}
                    {formatCurrency(challengeStatus.summary.profitTarget)} reached.{' '}
                    {challengeStatus.summary.daysRemaining} days remaining.
                  </Typography>
                </Stack>
              )}

              {primaryPayment && (
                <Stack spacing={0.75}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Latest mock payment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transaction ID: <strong>{primaryPayment.mockTransactionId}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paid on {formatDateTime(primaryPayment.paidAt)} • Amount {formatCurrency(primaryPayment.amount)}
                  </Typography>
                </Stack>
              )}

              {credentials && (
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 2,
                    border: (theme) => `1px solid ${theme.palette.success.light}`,
                  }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      startIcon={<ContentCopy fontSize="small" />}
                      onClick={handleCopyCredentials}
                    >
                      Copy
                    </Button>
                  }
                >
                  Demo credentials ready — Username: <strong>{credentials.username}</strong>, Password:{' '}
                  <strong>{credentials.password}</strong>
                </Alert>
              )}

              {copyFeedback && (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2,
                    border: (theme) => `1px solid ${theme.palette.info.light}`,
                  }}
                >
                  {copyFeedback}
                </Alert>
              )}

              {!isActiveChallenge && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() =>
                      router.push(`/payments/mock?planId=${encodeURIComponent(selection.plan.id)}`)
                    }
                    sx={{ fontWeight: 600 }}
                  >
                    Proceed to mocked payment
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/challenge-plans')}
                  >
                    Switch plan
                  </Button>
                </Stack>
              )}

              {isActiveChallenge && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/dashboard/user/challenge')}
                    sx={{ fontWeight: 600 }}
                  >
                    Open challenge monitor
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() =>
                      router.push(`/payments/mock?planId=${encodeURIComponent(selection.plan.id)}`)
                    }
                  >
                    View payment details
                  </Button>
                </Stack>
              )}
            </Stack>
          ) : (
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Reserve your evaluation plan
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Once you select a plan you will be guided through mocked payment and receive demo credentials to start practicing.
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                disabled={!hasCompletedKyc}
                onClick={() => router.push('/challenge-plans')}
                sx={{ fontWeight: 600 }}
                  >
                    Explore challenge plans
                  </Button>
                </Stack>
          )}

          {selectionError && (
            <Alert
              severity="error"
              onClose={() => setSelectionError(null)}
              sx={{ mt: 2 }}
            >
              {selectionError}
            </Alert>
          )}
        </Paper>

        {/* Stats Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                background: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, rgba(0,97,168,0.04) 0%, rgba(0,168,107,0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(79,195,247,0.12) 0%, rgba(76,175,80,0.12) 100%)',
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Box sx={{ color: stat.isPositive ? 'success.main' : 'error.main' }}>
                      {stat.icon}
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: robotoMonoFontFamily,
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: stat.isPositive ? 'success.main' : 'error.main',
                      fontWeight: 500,
                    }}
                  >
                    {stat.change} from last week
                  </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Charts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Row 1: Portfolio and Trade Volume */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              gap: 3,
            }}
          >
            {/* Portfolio Value Chart */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Portfolio Value
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metricsSeries.cumulative}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A86B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00A86B"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>

            {/* Trade Volume Chart */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Trade Volume
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricsSeries.trades}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="trades" fill="#0061A8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Profit & Loss Chart */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Profit & Loss Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricsSeries.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#00A86B"
                    strokeWidth={2}
                    name="Cumulative"
                  />
                  <Line
                    type="monotone"
                    dataKey="pnl"
                    stroke="#E74C3C"
                    strokeWidth={2}
                    name="Daily P&L"
                  />
                </LineChart>
              </ResponsiveContainer>
          </Paper>
        </Box>

        {challengeStatus?.metrics && challengeStatus.metrics.length > 0 && (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent challenge metrics
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push('/dashboard/user/challenge')}
              >
                View full monitor
              </Button>
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
                  {challengeStatus.metrics.slice(-7).map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell>
                        {new Date(metric.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
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
          </Paper>
        )}
      </Container>
    </Box>
  );
}









