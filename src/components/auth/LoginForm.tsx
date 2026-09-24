'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { AuthCard } from '@/components/ui';
import { dashboardPathForRole } from '@/components/shell/navConfig';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePassword } from '@/lib/validation';

type Role = 'TRADER' | 'ADMIN';

interface LoginFormProps {
  /** Restrict this form to one role. The API rejects other roles with a clear message. */
  expectedRole?: Role;
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Extra content under the form (links to other portals, dev tools). */
  footer?: ReactNode;
}

/** Only allow same-origin relative redirects such as `/dashboard/user/trading`. */
function safeRedirect(): string | null {
  if (typeof window === 'undefined') return null;
  const target = new URLSearchParams(window.location.search).get('redirect');
  return target && target.startsWith('/') && !target.startsWith('//') ? target : null;
}

/** Shared sign-in form for /login, /trader/login and /admin/login. */
export default function LoginForm({
  expectedRole,
  eyebrow = 'Sign in',
  title = 'Welcome back',
  description = 'Continue to your Finloom learning and practice workspace.',
  footer,
}: LoginFormProps) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const emailCheck = validateEmail(email);
    const passwordCheck = validatePassword(password);
    const nextErrors = {
      email: emailCheck.valid ? undefined : emailCheck.error ?? 'Invalid email',
      password: passwordCheck.valid ? undefined : passwordCheck.error ?? 'Invalid password',
    };
    setFieldErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...(expectedRole ? { expectedRole } : {}) }),
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Unable to sign in.');
        setLoading(false);
        return;
      }

      if (data.user) setUser(data.user);
      router.replace(safeRedirect() ?? dashboardPathForRole(data.user?.role));
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Unexpected error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthCard eyebrow={eyebrow} title={title} description={description} footer={footer}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <TextField
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            autoComplete="email"
            required
            fullWidth
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            autoComplete="current-password"
            required
            fullWidth
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password}
          />
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            <MuiLink component={Link} href="/forgot-password" underline="hover" fontWeight={600}>
              Forgot password?
            </MuiLink>
          </Typography>
          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </Box>
    </AuthCard>
  );
}
