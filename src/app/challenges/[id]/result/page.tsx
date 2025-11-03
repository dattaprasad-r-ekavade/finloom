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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  TrendingUp,
  ShowChart,
  EmojiEvents,
  Replay,
  ArrowForward,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';

import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { formatDateTime, formatChartDate } from '@/lib/dateFormat';

interface ViolationDetail {
  type: string;
  date: string;
  description: string;
  severity: string;
}

interface EvaluationResult {
  challengeId: string;
  planName: string;
  currentStatus: string;
  passed: boolean;
  failed: boolean;
  reason: string;
  summary: string;
  violations: ViolationDetail[];
  profitTargetAchieved: boolean;
  progressPct: number;
  eligibleForNextLevel: boolean;
}

interface ChallengeMetric {
  date: string;
  dailyPnl: number;
  cumulativePnl: number;
  tradesCount: number;
  winRate: number;
  maxDrawdown: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

function ChallengeResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const challengeId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [metrics, setMetrics] = useState<ChallengeMetric[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!challengeId) {
      setError('Challenge ID is required.');
      setLoading(false);
      return;
    }

    const fetchEvaluation = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get evaluation result
        const evalResponse = await fetch(
          `/api/challenges/evaluate?challengeId=${encodeURIComponent(challengeId)}`
        );
        const evalData = await evalResponse.json();

        if (!evalResponse.ok) {
          throw new Error(evalData.error ?? 'Unable to load evaluation.');
        }

        if (evalData.evaluations && evalData.evaluations.length > 0) {
          setEvaluation(evalData.evaluations[0]);
        }

        // Get challenge metrics
        const statusResponse = await fetch(
          `/api/challenges/status/${encodeURIComponent(challengeId)}`
        );
        const statusData = await statusResponse.json();

        if (statusResponse.ok && statusData.metrics) {
          setMetrics(statusData.metrics);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load challenge result.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [challengeId, router, user]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !evaluation) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Challenge result not found.'}
          </Alert>
          <Button variant="contained" onClick={() => router.push('/dashboard/user')}>
            Back to Dashboard
          </Button>
        </Container>
      </Box>
    );
  }

  const isPassed = evaluation.passed;
  const isFailed = evaluation.failed;
  const latestMetric = metrics[metrics.length - 1];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={4}>
          {/* Header Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: (theme) =>
                `2px solid ${
                  isPassed
                    ? theme.palette.success.main
                    : isFailed
                    ? theme.palette.error.main
                    : theme.palette.warning.main
                }`,
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? isPassed
                    ? 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(129,199,132,0.15) 100%)'
                    : isFailed
                    ? 'linear-gradient(135deg, rgba(244,67,54,0.1) 0%, rgba(239,83,80,0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,167,38,0.15) 100%)'
                  : isPassed
                  ? 'linear-gradient(135deg, rgba(76,175,80,0.2) 0%, rgba(129,199,132,0.25) 100%)'
                  : isFailed
                  ? 'linear-gradient(135deg, rgba(244,67,54,0.2) 0%, rgba(239,83,80,0.25) 100%)'
                  : 'linear-gradient(135deg, rgba(255,152,0,0.2) 0%, rgba(255,167,38,0.25) 100%)',
            }}
          >
            <CardContent sx={{ p: 5 }}>
              <Stack spacing={3} alignItems="center" textAlign="center">
                {isPassed ? (
                  <EmojiEvents sx={{ fontSize: 80, color: 'success.main' }} />
                ) : isFailed ? (
                  <Cancel sx={{ fontSize: 80, color: 'error.main' }} />
                ) : (
                  <ShowChart sx={{ fontSize: 80, color: 'warning.main' }} />
                )}

                <Stack spacing={1}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {isPassed
                      ? 'Challenge Passed!'
                      : isFailed
                      ? 'Challenge Failed'
                      : 'Challenge In Progress'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {evaluation.planName}
                  </Typography>
                </Stack>

                <Chip
                  icon={
                    isPassed ? (
                      <CheckCircle fontSize="small" />
                    ) : isFailed ? (
                      <Cancel fontSize="small" />
                    ) : undefined
                  }
                  label={evaluation.currentStatus}
                  color={isPassed ? 'success' : isFailed ? 'error' : 'warning'}
                  sx={{ fontSize: '1rem', py: 2.5, px: 2 }}
                />

                <Typography variant="body1" sx={{ maxWidth: 600 }}>
                  {evaluation.summary}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Performance Summary
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 3,
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {evaluation.progressPct.toFixed(1)}%
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Cumulative P&L
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: latestMetric?.cumulativePnl >= 0 ? 'success.main' : 'error.main' }}>
                    {latestMetric ? formatCurrency(latestMetric.cumulativePnl) : '—'}
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Total Trades
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {metrics.reduce((sum, m) => sum + m.tradesCount, 0)}
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Win Rate
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {latestMetric ? `${latestMetric.winRate.toFixed(1)}%` : '—'}
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Violations */}
          {evaluation.violations.length > 0 && (
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: (theme) => `1px solid ${theme.palette.error.light}`,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Violations
                </Typography>
                <Stack spacing={2}>
                  {evaluation.violations.map((violation, index) => (
                    <Alert key={index} severity={violation.severity === 'CRITICAL' ? 'error' : 'warning'}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {violation.type.replace('_', ' ')}
                      </Typography>
                      <Typography variant="body2">{violation.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(violation.date)}
                      </Typography>
                    </Alert>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Recent Metrics */}
          {metrics.length > 0 && (
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Recent Trading Metrics
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Daily P&L</TableCell>
                        <TableCell align="right">Cumulative</TableCell>
                        <TableCell align="right">Trades</TableCell>
                        <TableCell align="right">Win Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.slice(-10).map((metric, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {formatChartDate(metric.date)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: metric.dailyPnl >= 0 ? 'success.main' : 'error.main',
                              fontWeight: 600,
                            }}
                          >
                            {formatCurrency(metric.dailyPnl)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(metric.cumulativePnl)}</TableCell>
                          <TableCell align="right">{metric.tradesCount}</TableCell>
                          <TableCell align="right">{metric.winRate.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Next Steps
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {isPassed && evaluation.eligibleForNextLevel && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<TrendingUp />}
                    onClick={() => router.push('/challenge-plans')}
                    sx={{ flex: 1, fontWeight: 600 }}
                  >
                    Start Next Level Challenge
                  </Button>
                )}
                {isFailed && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Replay />}
                    onClick={() => router.push('/challenge-plans')}
                    sx={{ flex: 1, fontWeight: 600 }}
                  >
                    Try Again
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowForward />}
                  onClick={() => router.push('/dashboard/user')}
                  sx={{ flex: 1, fontWeight: 600 }}
                >
                  Back to Dashboard
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

export default function ChallengeResultPage() {
  return (
    <React.Suspense
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
      <ChallengeResultContent />
    </React.Suspense>
  );
}
