'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp,
  Security,
  Analytics,
  Speed,
  AccountBalance,
  Assessment,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Real-Time Trading',
      description: 'Execute trades with lightning-fast speed and precision',
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Advanced Analytics',
      description: 'Data-driven insights to optimize your trading strategy',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Bank-Level Security',
      description: 'Your funds and data protected with enterprise-grade encryption',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'High Performance',
      description: 'Ultra-low latency infrastructure for competitive advantage',
    },
    {
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      title: 'Prop Trading',
      description: 'Access firm capital and scale your trading operation',
    },
    {
      icon: <Assessment sx={{ fontSize: 40 }} />,
      title: 'Detailed Reporting',
      description: 'Comprehensive performance metrics and trade analytics',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navbar />
      
      {/* Hero Section with Blue-Green Gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0061A8 0%, #00A86B 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              mb: 3,
            }}
          >
            Welcome to Finloom
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.95,
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
            }}
          >
            Your gateway to professional prop trading with cutting-edge analytics and real-time market insights
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
              sx={{
                backgroundColor: 'white',
                color: '#0061A8',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 600 }}
        >
          Why Choose Finloom?
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 4,
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                p: 2,
              }}
            >
                <CardContent>
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #0061A8 0%, #00A86B 100%)'
              : 'linear-gradient(135deg, #4FC3F7 0%, #4CAF50 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Start Trading?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.95 }}>
            Join thousands of traders who trust Finloom for their prop trading needs
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/login')}
            sx={{
              backgroundColor: 'white',
              color: '#0061A8',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
            }}
          >
            Sign Up Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
