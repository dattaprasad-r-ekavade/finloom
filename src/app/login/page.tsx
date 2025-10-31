'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePassword } from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error ?? 'Invalid email');
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error ?? 'Invalid password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Unable to sign in.');
        return;
      }

      // Store user data in Zustand store
      if (data.user) {
        setUser(data.user);
      }

      const destination = data.user?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user';
      router.push(destination);
    } catch (err) {
      console.error(err);
      setError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: { xs: 8, md: 10 } }}>
        <Card
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, rgba(0,97,168,0.05) 0%, rgba(0,168,107,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(79,195,247,0.12) 0%, rgba(76,175,80,0.15) 100%)',
            boxShadow: (theme) =>
              theme.palette.mode === 'light'
                ? '0 24px 60px rgba(0, 25, 55, 0.18)'
                : '0 24px 60px rgba(3, 8, 14, 0.6)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <CardContent
            sx={{
              p: { xs: 4, md: 6 },
              display: 'grid',
              gap: { xs: 4, md: 6 },
              gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
              alignItems: 'center',
            }}
          >
            <Stack spacing={3} sx={{ maxWidth: 420 }}>
              <Chip
                icon={<Lock fontSize="small" />}
                label="Secure Sign In"
                color="primary"
                variant="outlined"
                sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
              />
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    fontFamily: '"Poppins", "Segoe UI", sans-serif',
                    mb: 1,
                  }}
                >
                  Welcome back to Finloom
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Access your trading intelligence and operational oversight in seconds.
                </Typography>
              </Box>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {error && (
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  autoComplete="email"
                  required
                  error={!!emailError}
                  helperText={emailError}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  autoComplete="current-password"
                  required
                  error={!!passwordError}
                  helperText={passwordError}
                />
                <Box sx={{ textAlign: 'right' }}>
                  <Link href="#" underline="hover" color="primary.main" fontWeight={600}>
                    Forgot password?
                  </Link>
                </Box>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.6,
                    fontWeight: 600,
                    backgroundImage: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'linear-gradient(135deg, #0061A8 0%, #00A86B 100%)'
                        : 'linear-gradient(135deg, #4FC3F7 0%, #4CAF50 100%)',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 12px 30px rgba(0, 97, 168, 0.25)',
                    },
                  }}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/signup')}
                  sx={{ py: 1.6, fontWeight: 600 }}
                >
                  Create an account
                </Button>
              </Box>
            </Stack>

            <Stack spacing={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontFamily: '"Poppins", "Segoe UI", sans-serif' }}
              >
                Designed for high-performance teams
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time account status, scalable risk controls, and instant messaging keep traders and admins
                aligned. Enjoy light, performant UI transitions optimised for focus.
              </Typography>
              <Divider flexItem>
                <Typography variant="caption" color="text.secondary">
                  Access Requests
                </Typography>
              </Divider>
              <Typography variant="body2">
                Don&apos;t have credentials yet?{' '}
                <Link href="/signup" underline="hover" color="primary.main" fontWeight={600}>
                  Request platform access
                </Link>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Demo mode: sign in to preview the dashboards with your configured role.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
