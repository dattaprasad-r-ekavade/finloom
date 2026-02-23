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
  Chip,
  Stack,
  Alert,
  Link,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePassword, validateName } from '@/lib/validation';

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);

    // Validate name (optional field)
    if (name.trim()) {
      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        setNameError(nameValidation.error ?? 'Invalid name');
        return;
      }
    }

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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Unable to create account.');
        return;
      }

      // Store user data in Zustand store and redirect appropriately
      if (data.user) {
        setUser(data.user);
        const nextRoute = '/challenge-plans';

        setSuccess('Account created! Choose your challenge to get started.');

        setTimeout(() => {
          router.push(nextRoute);
        }, 1000);
      } else {
        setSuccess('Account created! You can now sign in.');
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
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
                icon={<PersonAdd fontSize="small" />}
                label="Create Account"
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
                  Join the Finloom network
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Register to unlock your trading workspace. Admin accounts are provisioned from the dedicated admin signup flow.
                </Typography>
              </Box>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {error && (
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" onClose={() => setSuccess(null)}>
                    {success}
                  </Alert>
                )}
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(null);
                  }}
                  autoComplete="name"
                  error={!!nameError}
                  helperText={nameError || 'Optional'}
                />
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
                  autoComplete="new-password"
                  required
                  error={!!passwordError}
                  helperText={passwordError || 'Minimum 8 characters'}
                />
                <Chip
                  label="Trader workspace account"
                  color="primary"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                />
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
                  {loading ? 'Creating account…' : 'Create account'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{ py: 1.6, fontWeight: 600 }}
                >
                  Back to sign in
                </Button>
              </Box>
            </Stack>

            <Stack spacing={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontFamily: '"Poppins", "Segoe UI", sans-serif' }}
              >
                Choose your operating cockpit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Traders get high-tempo analytics, instant funding signals, and execution tooling.
                Use the dedicated admin registration flow if you need administrative access.
              </Typography>
              <Divider flexItem>
                <Typography variant="caption" color="text.secondary">
                  Already on the platform?
                </Typography>
              </Divider>
              <Typography variant="body2">
                Returning members can{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => router.push('/login')}
                  sx={{ fontWeight: 600 }}
                >
                  sign in here
                </Link>
                .
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Trader accounts are provisioned instantly and redirected into the challenge selection flow.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
