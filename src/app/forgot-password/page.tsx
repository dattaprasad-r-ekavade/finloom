'use client';

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xs" sx={{ py: { xs: 8, md: 12 } }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {submitted ? (
              <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  Check your inbox
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  If an account with <strong>{email}</strong> exists, you will receive reset
                  instructions shortly.
                </Typography>
                <MuiLink component={Link} href="/login" underline="hover" variant="body2">
                  Back to login
                </MuiLink>
              </Stack>
            ) : (
              <Stack spacing={3}>
                <Stack spacing={0.5}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Forgot password
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter your email and we&apos;ll send you a reset link.
                  </Typography>
                </Stack>

                {error && <Alert severity="error">{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      label="Email address"
                      type="email"
                      fullWidth
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading}
                      sx={{ fontWeight: 600 }}
                    >
                      {loading ? <CircularProgress size={22} color="inherit" /> : 'Send reset link'}
                    </Button>
                  </Stack>
                </Box>

                <Typography variant="body2" align="center" color="text.secondary">
                  Remember your password?{' '}
                  <MuiLink component={Link} href="/login" underline="hover">
                    Log in
                  </MuiLink>
                </Typography>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
