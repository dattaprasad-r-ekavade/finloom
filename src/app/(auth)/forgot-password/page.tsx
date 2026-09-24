'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Alert, Box, Button, CircularProgress, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { AuthCard } from '@/components/ui';

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

  const backToLogin = (
    <Typography variant="body2" color="text.secondary">
      Remember your password?{' '}
      <MuiLink component={Link} href="/login" fontWeight={600} underline="hover">
        Sign in
      </MuiLink>
    </Typography>
  );

  if (submitted) {
    return (
      <AuthCard title="Check your inbox" footer={backToLogin}>
        <Typography variant="body2" color="text.secondary">
          If an account with <strong>{email}</strong> exists, you will receive reset instructions shortly.
        </Typography>
      </AuthCard>
    );
  }

  return (
    <AuthCard eyebrow="Account" title="Forgot password" description="Enter your email and we'll send you a reset link." footer={backToLogin}>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email address"
            type="email"
            fullWidth
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Send reset link'}
          </Button>
        </Stack>
      </Box>
    </AuthCard>
  );
}
