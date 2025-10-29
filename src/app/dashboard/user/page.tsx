'use client';

import React from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Paper,
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
import { robotoMonoFontFamily } from '@/theme/theme';

export default function UserDashboard() {
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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          User Dashboard
        </Typography>

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
            <Card key={index}>
              <CardContent>
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
            <Paper sx={{ p: 3 }}>
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
            <Paper sx={{ p: 3 }}>
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
          <Paper sx={{ p: 3 }}>
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
