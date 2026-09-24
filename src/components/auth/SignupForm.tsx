'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import { AuthCard } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validateName, validatePassword } from '@/lib/validation';

interface SignupFormProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Where to send a signed-in user after the account is created. */
  nextPath?: string;
  footer?: ReactNode;
}

/** Shared learner sign-up form for /signup and /trader/signup. Admin self-signup is disabled. */
export default function SignupForm({
  eyebrow = 'Create account',
  title = 'Start learning with Finloom',
  description = 'Practise with virtual orders and published rules. Simulated results have no cash value.',
  nextPath = '/challenge-plans',
  footer,
}: SignupFormProps) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const nameCheck = name.trim() ? validateName(name) : { valid: true as const, error: undefined };
    const emailCheck = validateEmail(email);
    const passwordCheck = validatePassword(password);
    const nextErrors = {
      name: nameCheck.valid ? undefined : nameCheck.error ?? 'Invalid name',
      email: emailCheck.valid ? undefined : emailCheck.error ?? 'Invalid email',
      password: passwordCheck.valid ? undefined : passwordCheck.error ?? 'Invalid password',
    };
    setFieldErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.password) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'TRADER' }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Unable to create account.');
        setLoading(false);
        return;
      }

      if (data.user) {
        setUser(data.user);
        setSuccess('Account created. Taking you to the next step…');
        router.replace(nextPath);
        router.refresh();
      } else {
        setSuccess('Account created. You can now sign in.');
        router.replace('/login');
      }
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
          {success && <Alert severity="success">{success}</Alert>}
          <TextField
            label="Full name (optional)"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }}
            autoComplete="name"
            fullWidth
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name}
          />
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
            autoComplete="new-password"
            required
            fullWidth
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password ?? 'At least 8 characters.'}
          />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </Stack>
      </Box>
    </AuthCard>
  );
}
