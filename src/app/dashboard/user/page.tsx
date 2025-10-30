'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShowChart,
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
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function UserDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasCompletedKyc = user?.hasCompletedKyc ?? false;
  const kycStatusText = hasCompletedKyc ? 'KYC approved' : 'KYC pending';
  const kycChipColor = hasCompletedKyc ? 'success' : 'warning';
  const [selection, setSelection] = useState<ChallengeSelection | null>(null);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  useEffect(() => {
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

  const challengeHighlights = useMemo(
    () =>
      selection
        ? [
            { label: 'Capital', value: formatCurrency(selection.plan.accountSize) },
            { label: 'Fee', value: formatCurrency(selection.plan.fee) },
            { label: 'Profit target', value: `${selection.plan.profitTargetPct}%` },
            { label: 'Max loss', value: `${selection.plan.maxLossPct}%` },
            { label: 'Daily loss', value: `${selection.plan.dailyLossPct}%` },
            { label: 'Duration', value: `${selection.plan.durationDays} days` },
            { label: 'Profit split', value: `${selection.plan.profitSplit}%` },
          ]
        : [],
    [selection]
  );

  // Sample data for charts
  const performanceData = [
    { month: 'Jan', profit: 4000, loss: 2400 },
    { month: 'Feb', profit: 3000, loss: 1398 },
    { month: 'Mar', profit: 2000, loss: 9800 },
    { month: 'Apr', profit: 2780, loss: 3908 },
    { month: 'May', profit: 1890, loss: 4800 },
    { month: 'Jun', profit: 2390, loss: 3800 },
  ];

  const portfolioData = [
    { date: '1', value: 45000 },
    { date: '5', value: 47000 },
    { date: '10', value: 46500 },
    { date: '15', value: 49000 },
    { date: '20', value: 51000 },
    { date: '25', value: 52500 },
    { date: '30', value: 54200 },
  ];

  const tradeVolumeData = [
    { day: 'Mon', volume: 120 },
    { day: 'Tue', volume: 150 },
    { day: 'Wed', volume: 98 },
    { day: 'Thu', volume: 180 },
    { day: 'Fri', volume: 200 },
    { day: 'Sat', volume: 85 },
    { day: 'Sun', volume: 60 },
  ];

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

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            mb: 4,
          }}
        >
          {selectionLoading ? (
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
                    Level {selection.plan.level} pathway secured. Complete the mocked payment to activate your simulated capital.
                  </Typography>
                </Box>
                <Chip label={selection.status} color="primary" sx={{ alignSelf: 'flex-start' }} />
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
                <AreaChart data={portfolioData}>
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
                <BarChart data={tradeVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#0061A8" />
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
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#00A86B"
                    strokeWidth={2}
                    name="Profit"
                  />
                  <Line
                    type="monotone"
                    dataKey="loss"
                    stroke="#E74C3C"
                    strokeWidth={2}
                    name="Loss"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
        </Box>
      </Container>
    </Box>
  );
}
