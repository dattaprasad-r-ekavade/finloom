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
import { AdminPanelSettings } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';

export default function AdminSignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'ADMIN' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Unable to create admin account.');
        return;
      }

      // Store user data in Zustand store and redirect to dashboard
      if (data.user) {
        setUser(data.user);
        setSuccess('Admin account created! Redirecting to dashboard...');
        
        setTimeout(() => {
          router.push('/dashboard/admin');
        }, 1000);
      } else {
        setSuccess('Admin account created! You can now sign in.');
        setTimeout(() => {
          router.push('/admin/login');
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
                ? 'linear-gradient(135deg, rgba(156,39,176,0.05) 0%, rgba(103,58,183,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(186,104,200,0.12) 0%, rgba(149,117,205,0.15) 100%)',
            boxShadow: (theme) =>
              theme.palette.mode === 'light'
                ? '0 24px 60px rgba(103, 58, 183, 0.18)'
                : '0 24px 60px rgba(103, 58, 183, 0.6)',
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
                icon={<AdminPanelSettings fontSize="small" />}
                label="Admin Registration"
                color="secondary"
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
                  Create Admin Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Register for administrative access to the Finloom platform with full oversight capabilities.
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
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  color="secondary"
                  sx={{
                    py: 1.6,
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 12px 30px rgba(103, 58, 183, 0.25)',
                    },
                  }}
                >
                  {loading ? 'Creating account…' : 'Create Admin Account'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  color="secondary"
                  onClick={() => router.push('/admin/login')}
                  sx={{ py: 1.6, fontWeight: 600 }}
                >
                  Back to Admin Sign In
                </Button>
              </Box>
            </Stack>

            <Stack spacing={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontFamily: '"Poppins", "Segoe UI", sans-serif' }}
              >
                Administrative Privileges
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admin accounts unlock complete platform oversight including user management, compliance dashboards,
                firm-wide analytics, and system configuration. Ensure you have authorization before registering.
              </Typography>
              <Divider flexItem>
                <Typography variant="caption" color="text.secondary">
                  Already have an account?
                </Typography>
              </Divider>
              <Typography variant="body2">
                Existing admins can{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => router.push('/admin/login')}
                  sx={{ fontWeight: 600 }}
                >
                  sign in here
                </Link>
                .
              </Typography>
              <Typography variant="body2">
                Need trader access?{' '}
                <Link href="/trader/signup" underline="hover" color="primary.main" fontWeight={600}>
                  Register as Trader
                </Link>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admin accounts are provisioned with elevated permissions. All registration attempts are logged
                for security purposes.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
