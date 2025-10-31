'use client';

import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function NotFound() {
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
                  ? 'linear-gradient(135deg, #0061A8 0%, #00A86B 100%)'
                  : 'linear-gradient(135deg, #4FC3F7 0%, #4CAF50 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            404
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            The page you're looking for doesn't exist or has been moved. 
            Please check the URL or navigate back to continue.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              onClick={() => router.push('/')}
              sx={{ fontWeight: 600 }}
            >
              Go Home
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              onClick={() => router.back()}
              sx={{ fontWeight: 600 }}
            >
              Go Back
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
