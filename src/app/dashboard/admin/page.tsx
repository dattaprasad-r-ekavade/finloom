'use client';

import React from 'react';
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
} from '@mui/material';
import {
  People,
  TrendingUp,
  AccountBalance,
  Assessment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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

export default function AdminDashboard() {
  // Sample data
  const platformRevenueData = [
    { month: 'Jan', revenue: 45000, users: 1200 },
    { month: 'Feb', revenue: 52000, users: 1350 },
    { month: 'Mar', revenue: 48000, users: 1400 },
    { month: 'Apr', revenue: 61000, users: 1550 },
    { month: 'May', revenue: 55000, users: 1680 },
    { month: 'Jun', revenue: 67000, users: 1820 },
  ];

  const userActivityData = [
    { name: 'Active', value: 1450, color: '#00A86B' },
    { name: 'Inactive', value: 370, color: '#F39C12' },
    { name: 'New', value: 280, color: '#0061A8' },
  ];

  const topTraders = [
    { rank: 1, name: 'John Smith', profit: '$45,200', winRate: '72%', status: 'Active' },
    { rank: 2, name: 'Sarah Johnson', profit: '$38,900', winRate: '68%', status: 'Active' },
    { rank: 3, name: 'Mike Williams', profit: '$32,500', winRate: '65%', status: 'Active' },
    { rank: 4, name: 'Emily Brown', profit: '$28,100', winRate: '71%', status: 'Active' },
    { rank: 5, name: 'David Lee', profit: '$25,800', winRate: '63%', status: 'Active' },
  ];

  const stats = [
    {
      title: 'Total Users',
      value: '2,100',
      change: '+12.5%',
      isPositive: true,
      icon: <People sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Platform Revenue',
      value: '$67,000',
      change: '+21.8%',
      isPositive: true,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Total AUM',
      value: '$8.4M',
      change: '+15.2%',
      isPositive: true,
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Active Trades',
      value: '1,847',
      change: '+8.7%',
      isPositive: true,
      icon: <Assessment sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          Admin Dashboard
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
            {/* Platform Revenue & Users */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Platform Revenue & User Growth
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={platformRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0061A8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0061A8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A86B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0061A8"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue ($)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="users"
                    stroke="#00A86B"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>

            {/* User Activity Pie Chart */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                User Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userActivityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Top Traders Table */}
          <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Top Traders
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Rank</strong></TableCell>
                      <TableCell><strong>Trader Name</strong></TableCell>
                      <TableCell><strong>Total Profit</strong></TableCell>
                      <TableCell><strong>Win Rate</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topTraders.map((trader) => (
                      <TableRow key={trader.rank} hover>
                        <TableCell>
                          <Typography
                            sx={{
                              fontFamily: robotoMonoFontFamily,
                              fontWeight: 600,
                            }}
                          >
                            #{trader.rank}
                          </Typography>
                        </TableCell>
                        <TableCell>{trader.name}</TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontFamily: robotoMonoFontFamily,
                              color: 'success.main',
                              fontWeight: 600,
                            }}
                          >
                            {trader.profit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontFamily: robotoMonoFontFamily,
                              fontWeight: 500,
                            }}
                          >
                            {trader.winRate}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={trader.status}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
        </Box>
      </Container>
    </Box>
  );
}
