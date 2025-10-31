'use client';

import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { Home, Login } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />
      <Container
        maxWidth="md"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            p: 4,
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, rgba(0,97,168,0.05) 0%, rgba(0,168,107,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(79,195,247,0.12) 0%, rgba(76,175,80,0.15) 100%)',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', md: '6rem' },
              fontWeight: 700,
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? 'linear-gradient(135deg, #F44336 0%, #E91E63 100%)'
                  : 'linear-gradient(135deg, #FF5252 0%, #FF4081 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            401
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Unauthorized
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            You need to be logged in to access this page. 
            Please sign in with your credentials to continue.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<Login />}
              onClick={() => router.push('/login')}
              sx={{ fontWeight: 600 }}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Home />}
              onClick={() => router.push('/')}
              sx={{ fontWeight: 600 }}
            >
              Go Home
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
