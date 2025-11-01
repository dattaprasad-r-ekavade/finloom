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
import {
  TrendingUp,
  Security,
  Analytics,
  Speed,
  AccountBalance,
  Assessment,
  CheckCircleOutline,
  Payment,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { robotoMonoFontFamily } from '@/theme/theme';

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

const heroStats = [
  {
    label: 'Live Profit',
    value: '+$2.8M',
    caption: 'Firm-wide P&L today',
    tone: 'success.main',
  },
  {
    label: 'Drawdown Watch',
    value: '-$320K',
    caption: 'Across 4 accounts',
    tone: 'error.main',
  },
  {
    label: 'Pending Verifications',
    value: '18',
    caption: 'KYC reviews in queue',
    tone: 'warning.main',
  },
];

const features = [
  {
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    title: 'Institutional Execution',
    description:
      'Trade on multi-venue liquidity with sub-3ms routing and automated risk circuit breakers.',
    indicator: { label: 'Profit Surge', color: 'success.main' },
  },
  {
    icon: <Analytics sx={{ fontSize: 40 }} />,
    title: 'Advanced Intelligence',
    description:
      'Predictive analytics, performance cohorts, and anomaly detection streamline scaling decisions.',
    indicator: { label: 'Insight', color: 'primary.main' },
  },
  {
    icon: <Security sx={{ fontSize: 40 }} />,
    title: 'Bank-Level Security',
    description:
      'Zero-trust infrastructure with biometric SSO, encrypted vaults, and SOC 2-ready policies.',
    indicator: { label: 'Compliance', color: 'warning.main' },
  },
  {
    icon: <Speed sx={{ fontSize: 40 }} />,
    title: 'Lightning Performance',
    description:
      'Adaptive streaming dashboards and GPU-accelerated charting keep teams informed in real time.',
    indicator: { label: '2.4ms Avg Fill', color: 'secondary.main' },
  },
  {
    icon: <AccountBalance sx={{ fontSize: 40 }} />,
    title: 'Capital Allocation',
    description:
      'Automate scaling rules, manage funding rounds, and connect traders to firm capital instantly.',
    indicator: { label: 'Growth', color: 'success.main' },
  },
  {
    icon: <Assessment sx={{ fontSize: 40 }} />,
    title: 'Precision Reporting',
    description:
      'Audit-ready exports, custom KPIs, and reconciled statements reduce end-of-day friction.',
    indicator: { label: 'Pending Reviews', color: 'warning.main' },
  },
];

const dashboards = [
  {
    badge: 'Trader Workspace',
    badgeColor: 'primary',
    title: 'Powerful tools for funded traders',
    description:
      'Monitor allocations, manage multi-asset portfolios, and track risk in one streamlined cockpit.',
    points: [
      'Green/red P&L heatmaps update tick-by-tick across accounts.',
      'Execute with smart order routing, risk guardrails, and margin insights.',
      'Shared intelligence feed keeps teams aligned on catalysts.',
    ],
  },
  {
    badge: 'Admin Command Center',
    badgeColor: 'secondary',
    title: 'Operational clarity for firm leaders',
    description:
      'Surface firm-wide KPIs, compliance alerts, and capital deployment in real time.',
    points: [
      'Amber pending queues highlight KYC, payouts, and escalations.',
      'Stress testing, funding cohorts, and trader scorecards in one view.',
      'Automated risk escalations with red alert thresholds and audit trails.',
    ],
  },
];

export default function Home() {
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

  const fadeInUpStyles = (delay = '0s') => ({
    transform: 'translateY(24px)',
    animation: 'fadeInUp 0.9s ease forwards',
    animationDelay: delay,
    '@keyframes fadeInUp': {
      from: { opacity: 0, transform: 'translateY(24px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: (theme) => (theme.palette.mode === 'light' ? '#FFFFFF' : theme.palette.text.primary),
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #0061A8 0%, #00A86B 100%)'
              : 'linear-gradient(135deg, rgba(79,195,247,0.25) 0%, rgba(76,175,80,0.25) 100%)',
          py: { xs: 10, md: 14 },
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(255,255,255,0.12)'
                : 'rgba(79,195,247,0.2)',
            top: -120,
            right: -140,
            filter: 'blur(0)',
            animation: 'pulse 12s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(0,0,0,0.08)'
                : 'rgba(76,175,80,0.22)',
            bottom: -120,
            left: -80,
            animation: 'pulse 10s ease-in-out infinite',
            animationDelay: '2s',
          },
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(0.95)', opacity: 0.6 },
            '50%': { transform: 'scale(1.05)', opacity: 1 },
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    fontFamily: '"Poppins", "Segoe UI", sans-serif',
                    lineHeight: 1.1,
                    fontSize: { xs: '2.8rem', md: '3.6rem' },
                    ...fadeInUpStyles('0s'),
                  }}
                >
                  Trade. Scale. Succeed with Finloom.
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    maxWidth: 600,
                    opacity: 0.9,
                    fontWeight: 400,
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    ...fadeInUpStyles('0.15s'),
                  }}
                >
                  A modern prop trading platform combining lightning execution, deep analytics, and
                  transparent risk governance for ambitious trading teams.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ ...fadeInUpStyles('0.3s') }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/trader/login')}
                    sx={{
                      px: 5,
                      py: 1.6,
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: '#0D1117',
                      backgroundColor: '#FFFFFF',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                      },
                    }}
                  >
                    Trader Portal
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/admin/login')}
                    sx={{
                      px: 5,
                      py: 1.6,
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      borderColor: 'currentColor',
                      color: 'inherit',
                      '&:hover': {
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,0.15)'
                            : 'rgba(79,195,247,0.15)',
                        borderColor: 'currentColor',
                      },
                    }}
                  >
                    Admin Portal
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2.5,
                  ...fadeInUpStyles('0.45s'),
                }}
              >
                {heroStats.map((stat) => (
                  <Card
                    key={stat.label}
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(13,17,23,0.7)',
                      color: 'inherit',
                      border: (theme) => `1px solid rgba(255,255,255,${theme.palette.mode === 'light' ? 0.3 : 0.1})`,
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="body2" sx={{ opacity: 0.85, mb: 1 }}>
                        {stat.label}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: robotoMonoFontFamily,
                          fontWeight: 600,
                          mb: 1,
                          color: stat.tone,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        {stat.caption}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 10 } }}>
        <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="Built for speed and trust"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, fontFamily: '"Poppins", "Segoe UI", sans-serif' }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              fontFamily: '"Poppins", "Segoe UI", sans-serif',
              maxWidth: 720,
            }}
          >
            Everything your proprietary trading firm needs to operate with precision
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680 }}>
            Finloom blends institutional tooling with intuitive UX so both traders and administrators can
            move faster, stay compliant, and scale confidently across markets.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'light'
                        ? '0 18px 35px rgba(0,97,168,0.12)'
                        : '0 18px 35px rgba(13,17,23,0.65)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ color: 'primary.main' }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                  <Chip
                    label={feature.indicator.label}
                    sx={{
                      alignSelf: 'flex-start',
                      fontWeight: 600,
                      color: feature.indicator.color,
                      borderColor: feature.indicator.color,
                      borderRadius: 6,
                    }}
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider sx={{ opacity: 0.4 }} />

      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 10 } }}>
        <Grid container spacing={4} alignItems="stretch">
          {dashboards.map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: { xs: 2, md: 3 },
                  background: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'linear-gradient(145deg, rgba(0,97,168,0.05) 0%, rgba(0,168,107,0.08) 100%)'
                      : 'linear-gradient(145deg, rgba(79,195,247,0.12) 0%, rgba(76,175,80,0.12) 100%)',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack spacing={3}>
                  <Chip
                    label={item.badge}
                    color={item.badgeColor as 'primary' | 'secondary'}
                    variant="outlined"
                    sx={{ fontWeight: 600, alignSelf: 'flex-start' }}
                  />
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, fontFamily: '"Poppins", "Segoe UI", sans-serif', mb: 1.5 }}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                  <Stack spacing={1.5}>
                    {item.points.map((point) => (
                      <Stack direction="row" spacing={1.5} alignItems="flex-start" key={point}>
                        <CheckCircleOutline color="success" sx={{ mt: '2px' }} />
                        <Typography variant="body2" color="text.secondary">
                          {point}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider sx={{ opacity: 0.4 }} />

      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 10 } }}>
        <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="Available Challenges"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, fontFamily: '"Poppins", "Segoe UI", sans-serif' }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              fontFamily: '"Poppins", "Segoe UI", sans-serif',
              maxWidth: 720,
            }}
          >
            Choose Your Trading Challenge
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680 }}>
            Select from our tiered challenges and start your journey to becoming a funded trader. Each challenge is designed to test your skills progressively.
          </Typography>
        </Stack>

        {loadingChallenges ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : challenges.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
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
                    borderRadius: 4,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: (theme) =>
                        theme.palette.mode === 'light'
                          ? '0 18px 35px rgba(0,97,168,0.18)'
                          : '0 18px 35px rgba(13,17,23,0.65)',
                    },
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

      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #0061A8 0%, #00A86B 100%)'
              : 'linear-gradient(135deg, rgba(79,195,247,0.2) 0%, rgba(76,175,80,0.18) 100%)',
          color: (theme) => (theme.palette.mode === 'light' ? '#FFFFFF' : theme.palette.text.primary),
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, fontFamily: '"Poppins", "Segoe UI", sans-serif', mb: 2 }}
          >
            Ready to accelerate your trading program?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Launch a performant, secure, and insight-driven prop firm experience with Finloom. Traders and
            administrators stay perfectly aligned.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/trader/signup')}
              sx={{
                px: 5,
                py: 1.6,
                fontSize: '1.05rem',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                color: '#0D1117',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
              }}
            >
              Join as Trader
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/admin/signup')}
              sx={{
                px: 5,
                py: 1.6,
                fontSize: '1.05rem',
                fontWeight: 600,
                borderColor: 'currentColor',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'rgba(255,255,255,0.18)'
                      : 'rgba(79,195,247,0.2)',
                  borderColor: 'currentColor',
                },
              }}
            >
              Join as Admin
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
