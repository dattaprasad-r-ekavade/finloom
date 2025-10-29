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
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (role: 'user' | 'admin') => {
    // Simple demo login - no actual authentication
    if (role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/user');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Sign in to access your trading dashboard
            </Typography>

            <Box component="form" sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                variant="outlined"
              />

              <Box sx={{ mt: 2, mb: 2 }}>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ textDecoration: 'none', color: 'primary.main' }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => handleLogin('user')}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #0061A8 0%, #00A86B 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #004577 0%, #00764A 100%)',
                  },
                }}
              >
                Sign In as User
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => handleLogin('admin')}
                sx={{ mb: 2, py: 1.5 }}
              >
                Sign In as Admin
              </Button>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" align="center" color="text.secondary">
                Don&apos;t have an account?{' '}
                <Link
                  href="#"
                  sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 500 }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          align="center"
          color="text.secondary"
          sx={{ display: 'block', mt: 3 }}
        >
          Demo: Click either button to access dashboards
        </Typography>
      </Container>
    </Box>
  );
}
