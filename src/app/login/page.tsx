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
} from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/user');
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
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <Box sx={{ textAlign: 'right' }}>
                  <Link href="#" underline="hover" color="primary.main" fontWeight={600}>
                    Forgot password?
                  </Link>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => handleLogin('user')}
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
                  Sign in as Trader
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => handleLogin('admin')}
                  sx={{ py: 1.6, fontWeight: 600 }}
                >
                  Sign in as Admin
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
                <Link href="#" underline="hover" color="primary.main" fontWeight={600}>
                  Request platform access
                </Link>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Demo mode: select either option above to preview the dashboards.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
