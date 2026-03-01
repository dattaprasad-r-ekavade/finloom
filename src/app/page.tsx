'use client';

import React from 'react';
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
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { robotoMonoFontFamily } from '@/theme/theme';

const heroStats = [
  {
    label: 'Live Profit',
    value: '+₹2.8M',
    caption: 'Firm-wide P&L today',
    tone: 'success.main',
  },
  {
    label: 'Drawdown Watch',
    value: '-₹320K',
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
    icon: <TrendingUp sx={{ fontSize: 36 }} />,
    title: 'Institutional Execution',
    description:
      'Trade on multi-venue liquidity with sub-3ms routing and automated risk circuit breakers.',
    accentColor: '#00A86B',
  },
  {
    icon: <Analytics sx={{ fontSize: 36 }} />,
    title: 'Advanced Intelligence',
    description:
      'Predictive analytics, performance cohorts, and anomaly detection streamline scaling decisions.',
    accentColor: '#0061A8',
  },
  {
    icon: <Security sx={{ fontSize: 36 }} />,
    title: 'Bank-Level Security',
    description:
      'Zero-trust infrastructure with biometric SSO, encrypted vaults, and SOC 2-ready policies.',
    accentColor: '#F39C12',
  },
  {
    icon: <Speed sx={{ fontSize: 36 }} />,
    title: 'Lightning Performance',
    description:
      'Adaptive streaming dashboards and GPU-accelerated charting keep teams informed in real time.',
    accentColor: '#4FC3F7',
  },
  {
    icon: <AccountBalance sx={{ fontSize: 36 }} />,
    title: 'Capital Allocation',
    description:
      'Automate scaling rules, manage funding rounds, and connect traders to firm capital instantly.',
    accentColor: '#00A86B',
  },
  {
    icon: <Assessment sx={{ fontSize: 36 }} />,
    title: 'Precision Reporting',
    description:
      'Audit-ready exports, custom KPIs, and reconciled statements reduce end-of-day friction.',
    accentColor: '#F39C12',
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

// Lazy-loaded challenges section
const ChallengesSection = dynamic(() => import('./ChallengesSection'), {
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  ),
});

export default function Home() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: (theme) => (theme.palette.mode === 'light' ? '#FFFFFF' : theme.palette.text.primary),
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(145deg, #004577 0%, #0061A8 60%, #00764A 100%)'
              : 'linear-gradient(145deg, rgba(79,195,247,0.18) 0%, rgba(76,175,80,0.14) 100%)',
          py: { xs: 7, md: 10 },
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(79,195,247,0.08)',
            top: -80,
            right: -60,
            filter: 'blur(40px)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(0,0,0,0.04)'
                : 'rgba(76,175,80,0.08)',
            bottom: -60,
            left: -40,
            filter: 'blur(40px)',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={5} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2.5}>
                <Typography
                  variant="h2"
                  component="h1"
                  className="fade-in-up"
                  sx={{
                    fontWeight: 700,
                    fontFamily: '"Poppins", "Segoe UI", sans-serif',
                    lineHeight: 1.1,
                    fontSize: { xs: '2.4rem', md: '3.2rem' },
                  }}
                >
                  Trade. Scale. Succeed with Finloom.
                </Typography>
                <Typography
                  variant="h6"
                  className="fade-in-up"
                  sx={{
                    maxWidth: 560,
                    opacity: 0.9,
                    fontWeight: 400,
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    animationDelay: '0.15s',
                  }}
                >
                  A modern prop trading platform combining lightning execution, deep analytics, and
                  transparent risk governance for ambitious trading teams.
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  className="fade-in-up"
                  sx={{ animationDelay: '0.3s' }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/trader/login')}
                    sx={{
                      px: 4,
                      py: 1.4,
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#0D1117',
                      backgroundColor: '#FFFFFF',
                      width: { xs: '100%', sm: 'auto' },
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
                      px: 4,
                      py: 1.4,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderColor: 'currentColor',
                      color: 'inherit',
                      width: { xs: '100%', sm: 'auto' },
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
                className="fade-in-up"
                sx={{
                  display: 'grid',
                  gap: 2,
                  animationDelay: '0.45s',
                }}
              >
                {heroStats.map((stat) => (
                  <Card
                    key={stat.label}
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.14)'
                          : 'rgba(13,17,23,0.65)',
                      color: 'inherit',
                      border: (theme) => `1px solid rgba(255,255,255,${theme.palette.mode === 'light' ? 0.2 : 0.08})`,
                      backdropFilter: 'blur(12px)',
                      boxShadow: 'none',
                      '&:hover': {
                        transform: 'none',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                        {stat.label}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: robotoMonoFontFamily,
                          fontWeight: 600,
                          mb: 0.5,
                          color: stat.tone,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
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

      {/* Features Section */}
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
            Everything your proprietary trading firm needs
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            Finloom blends institutional tooling with intuitive UX so both traders and administrators can
            move faster, stay compliant, and scale confidently.
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
                  borderLeft: `3px solid ${feature.accentColor}`,
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box
                    sx={{
                      color: 'primary.main',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(0, 97, 168, 0.08)'
                          : 'rgba(79, 195, 247, 0.12)',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider sx={{ opacity: 0.4 }} />

      {/* Dashboards Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={3} alignItems="stretch">
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
                      ? 'linear-gradient(145deg, rgba(0,97,168,0.03) 0%, rgba(0,168,107,0.05) 100%)'
                      : 'linear-gradient(145deg, rgba(79,195,247,0.08) 0%, rgba(76,175,80,0.08) 100%)',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack spacing={2.5}>
                  <Chip
                    label={item.badge}
                    color={item.badgeColor as 'primary' | 'secondary'}
                    variant="outlined"
                    sx={{ fontWeight: 600, alignSelf: 'flex-start' }}
                  />
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, fontFamily: '"Poppins", "Segoe UI", sans-serif', mb: 1 }}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                  <Stack spacing={1.5}>
                    {item.points.map((point) => (
                      <Stack direction="row" spacing={1.5} alignItems="flex-start" key={point}>
                        <CheckCircleOutline color="success" sx={{ mt: '2px', fontSize: 20 }} />
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

      {/* Challenges Section (lazy loaded) */}
      <ChallengesSection />

      {/* CTA Section */}
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(145deg, #004577 0%, #0061A8 60%, #00764A 100%)'
              : 'linear-gradient(145deg, rgba(79,195,247,0.15) 0%, rgba(76,175,80,0.12) 100%)',
          color: (theme) => (theme.palette.mode === 'light' ? '#FFFFFF' : theme.palette.text.primary),
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, fontFamily: '"Poppins", "Segoe UI", sans-serif', mb: 1.5 }}
          >
            Ready to accelerate your trading program?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Launch a performant, secure, and insight-driven prop firm experience with Finloom.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/trader/signup')}
              sx={{
                px: 4,
                py: 1.4,
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                color: '#0D1117',
                width: { xs: '100%', sm: 'auto' },
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
                px: 4,
                py: 1.4,
                fontSize: '1rem',
                fontWeight: 600,
                borderColor: 'currentColor',
                color: 'inherit',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(79,195,247,0.15)',
                  borderColor: 'currentColor',
                },
              }}
            >
              Join as Admin
            </Button>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
