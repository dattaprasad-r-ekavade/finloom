'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  TrendingUp,
  AccountBalance,
  Assessment,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Navbar from '@/components/Navbar';
import { robotoMonoFontFamily } from '@/theme/theme';
import { formatDate } from '@/lib/dateFormat';

interface OverviewData {
  overview: {
    totalChallenges: number;
    activeChallenges: number;
    passedChallenges: number;
    failedChallenges: number;
    pendingChallenges: number;
    passRate: number;
    totalRevenue: number;
    avgCompletionTimeDays: number;
  };
  revenueByLevel: Array<{
    level: number;
    revenue: number;
    challengeCount: number;
  }>;
  recentChallenges: Array<{
    id: string;
    status: string;
    userName: string;
    userEmail: string;
    planName: string;
    planLevel: number;
    accountSize: number;
    currentPnl: number;
    startDate: string | null;
    createdAt: string;
  }>;
  userStats: {
    totalUsers: number;
    kycApprovedUsers: number;
    kycApprovalRate: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/challenges/overview');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch overview data');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'No data available'}</Alert>
        </Container>
      </Box>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Challenge status distribution for pie chart
  const challengeStatusData = [
    { name: 'Active', value: data.overview.activeChallenges, color: '#00A86B' },
    { name: 'Passed', value: data.overview.passedChallenges, color: '#0061A8' },
    { name: 'Failed', value: data.overview.failedChallenges, color: '#F39C12' },
    { name: 'Pending', value: data.overview.pendingChallenges, color: '#9E9E9E' },
  ].filter(item => item.value > 0);

  // Revenue by level chart data
  const revenueChartData = data.revenueByLevel.map(level => ({
    level: `Level ${level.level}`,
    revenue: level.revenue,
    challenges: level.challengeCount,
  }));

  const stats = [
    {
      title: 'Total Users',
      value: data.userStats.totalUsers.toLocaleString(),
      change: `${data.userStats.kycApprovalRate.toFixed(1)}% KYC approved`,
      isPositive: true,
      icon: <People sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Platform Revenue',
      value: formatCurrency(data.overview.totalRevenue),
      change: `${data.overview.totalChallenges} total challenges`,
      isPositive: true,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Active Challenges',
      value: data.overview.activeChallenges.toString(),
      change: `${data.overview.passRate.toFixed(1)}% pass rate`,
      isPositive: data.overview.passRate > 50,
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Avg Completion',
      value: `${data.overview.avgCompletionTimeDays.toFixed(0)} days`,
      change: `${data.overview.passedChallenges} passed`,
      isPositive: true,
      icon: <Assessment sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
            Gain real-time visibility into firm performance, risk posture, and trader success with dashboards
            tuned for operational leaders.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Chip label="Capital" color="primary" variant="outlined" />
            <Chip label="Risk Alerts" color="error" variant="outlined" />
            <Chip label="Compliance" color="warning" variant="outlined" />
          </Stack>
        </Stack>

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
                    {stat.change} from last month
                  </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Charts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Row 1: Revenue and User Activity */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              gap: 3,
            }}
          >
            {/* Revenue by Level */}
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
                Revenue by Challenge Level
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') return formatCurrency(value);
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0061A8" name="Revenue (₹)" />
                  <Bar dataKey="challenges" fill="#00A86B" name="Challenges" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Challenge Status Distribution */}
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
                Challenge Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={challengeStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {challengeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Recent Challenges Table */}
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
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Recent Challenges
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Trader</strong></TableCell>
                      <TableCell><strong>Challenge Plan</strong></TableCell>
                      <TableCell><strong>Account Size</strong></TableCell>
                      <TableCell><strong>Current P&L</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Start Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentChallenges.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary">No challenges yet</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.recentChallenges.map((challenge) => (
                        <TableRow key={challenge.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {challenge.userName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {challenge.userEmail}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">{challenge.planName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Level {challenge.planLevel}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: robotoMonoFontFamily,
                                fontWeight: 500,
                              }}
                            >
                              {formatCurrency(challenge.accountSize)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: robotoMonoFontFamily,
                                color: challenge.currentPnl >= 0 ? 'success.main' : 'error.main',
                                fontWeight: 600,
                              }}
                            >
                              {formatCurrency(challenge.currentPnl)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={challenge.status}
                              color={
                                challenge.status === 'ACTIVE'
                                  ? 'success'
                                  : challenge.status === 'PASSED'
                                  ? 'primary'
                                  : challenge.status === 'FAILED'
                                  ? 'error'
                                  : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {challenge.startDate
                                ? formatDate(challenge.startDate)
                                : formatDate(challenge.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
        </Box>
      </Container>
    </Box>
  );
}
