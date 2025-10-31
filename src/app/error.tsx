'use client';

import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Stack, Alert } from '@mui/material';
import { Home, Refresh } from '@mui/icons-material';
import Navbar from '@/components/Navbar';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error('Application error:', error);
  }, [error]);

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
                  ? 'linear-gradient(135deg, #F44336 0%, #FF9800 100%)'
                  : 'linear-gradient(135deg, #FF5252 0%, #FFA726 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            500
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Something Went Wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            An unexpected error occurred. Our team has been notified and is working to fix it.
            Please try again or return to the home page.
          </Typography>

          {process.env.NODE_ENV === 'development' && error.message && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {error.message}
              </Typography>
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<Refresh />}
              onClick={reset}
              sx={{ fontWeight: 600 }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Home />}
              onClick={() => (window.location.href = '/')}
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
