'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const values = [
  {
    icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
    title: 'Performance First',
    description: 'We believe in recognizing and rewarding consistent trading performance. Our evaluation criteria are designed to identify disciplined, skilled traders.',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 32 }} />,
    title: 'Risk Management',
    description: 'Capital preservation is at the heart of sustainable trading. Our platform enforces strict risk parameters to ensure responsible and accountable trading.',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 32 }} />,
    title: 'Real-Time Technology',
    description: 'Built on modern infrastructure with real-time market data integration, our platform provides a professional-grade trading experience.',
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 32 }} />,
    title: 'Trader Community',
    description: 'We are building a community of talented traders across India. Together, we aim to democratize access to institutional-grade trading capital.',
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 32 }} />,
    title: 'Fair Evaluation',
    description: 'Our challenge evaluation metrics are transparent, objective, and clearly defined. Every trader is assessed on the same criteria with no hidden rules.',
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 32 }} />,
    title: 'Dedicated Support',
    description: 'Our support team is available to assist you with technical issues, account queries, and any questions about the evaluation process.',
  },
];

const stats = [
  { value: '500+', label: 'Registered Traders' },
  { value: '₹5 Cr+', label: 'Evaluation Capital' },
  { value: '3', label: 'Challenge Tiers' },
  { value: '99.9%', label: 'Platform Uptime' },
];

export default function AboutUs() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <Navbar />

      {/* Hero Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #0a1929 0%, #1a237e 100%)' : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: '"Poppins", sans-serif', mb: 2 }}>
            About Finloom
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.6, maxWidth: 700, mx: 'auto' }}>
            India&apos;s proprietary trading evaluation platform &mdash; empowering skilled traders with funded accounts through rigorous, transparent, and fair performance-based challenges.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        <Stack spacing={6}>
          {/* Our Story */}
          <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 2 }}>
              Our Story
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              Finloom was founded with a clear mission: to bridge the gap between talented traders and the capital they need to succeed. We recognized that many skilled traders in India lack access to sufficient capital to trade professionally, despite having the skills and discipline to generate consistent returns.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              Our proprietary evaluation platform uses real-time market data and professional-grade analytics to assess trading performance across multiple dimensions &mdash; profitability, risk management, consistency, and discipline. Traders who meet our rigorous evaluation criteria earn access to funded trading accounts where they can trade with institutional capital.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Built by traders, for traders, Finloom leverages modern technology including real-time data feeds, advanced charting, and automated risk monitoring to create an evaluation experience that mirrors professional trading environments. Our platform is designed to identify and nurture trading talent across India.
            </Typography>
          </Paper>

          {/* Stats */}
          <Grid container spacing={3}>
            {stats.map((stat) => (
              <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
                <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Poppins", sans-serif', color: 'primary.main' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Our Values */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 3, textAlign: 'center' }}>
              Our Values
            </Typography>
            <Grid container spacing={3}>
              {values.map((value) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={value.title}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: '100%', border: (theme) => `1px solid ${theme.palette.divider}`, transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: 'primary.main', backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(79, 195, 247, 0.12)' : 'rgba(0, 97, 168, 0.08)' }}>
                      {value.icon}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider />

          {/* How It Works */}
          <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 3 }}>
              How It Works
            </Typography>
            <Grid container spacing={3}>
              {[
                { step: '01', title: 'Choose a Challenge', desc: 'Select from our Starter, Growth, or Pro challenge tiers based on your trading experience and goals. Each tier has defined profit targets, loss limits, and evaluation durations.' },
                { step: '02', title: 'Complete KYC', desc: 'Verify your identity through our streamlined KYC process. Submit your PAN card and other required documents for quick verification and account activation.' },
                { step: '03', title: 'Trade & Prove', desc: 'Trade in a simulated environment using real-time market data. Meet the profit target while respecting risk parameters to demonstrate your trading skill.' },
                { step: '04', title: 'Get Funded', desc: 'Pass the evaluation and receive access to a funded trading account. Trade with real capital and earn profit splits based on your performance.' },
              ].map((item) => (
                <Grid size={{ xs: 12, sm: 6 }} key={item.step}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: '"Poppins", sans-serif', minWidth: 48 }}>
                      {item.step}
                    </Typography>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Company Information */}
          <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 2 }}>
              Company Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Company Name:</strong> Finloom Technologies Private Limited
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Registered Address:</strong> Bangalore, Karnataka, India
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Email:</strong> contact@finloom.com
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Website:</strong> www.finloom.com
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Industry:</strong> Financial Technology / Prop Trading
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Founded:</strong> 2025
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
}
