'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Navbar from '@/components/Navbar';

type CredentialsPayload = {
  email: string;
  name: string | null;
  role: 'ADMIN';
  defaultCredentials: {
    email: string;
    password: string;
    name: string;
  };
};

export default function LocalAdminCredentialsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [defaultEmail, setDefaultEmail] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/local-admin-credentials');
        const data = (await response.json()) as { success?: boolean; error?: string; data?: CredentialsPayload };
        if (!response.ok || !data.data) {
          throw new Error(data.error || 'Unable to load credentials.');
        }

        if (!mounted) {
          return;
        }

        setEmail(data.data.email);
        setName(data.data.name || '');
        setDefaultEmail(data.data.defaultCredentials.email);
        setDefaultPassword(data.data.defaultCredentials.password);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load credentials.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch('/api/admin/local-admin-credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Unable to save credentials.');
      }

      setPassword('');
      setSuccess('Local admin credentials updated. Use them on /admin/login.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save credentials.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Local Admin Credentials
              </Typography>
              <Alert severity="info">
                This page works only on local development (localhost). It edits the fixed primary admin account.
              </Alert>

              {defaultEmail && (
                <Alert severity="warning">
                  Default fallback: <strong>{defaultEmail}</strong> / <strong>{defaultPassword}</strong>
                </Alert>
              )}

              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}

              {loading ? (
                <Typography variant="body2" color="text.secondary">
                  Loading...
                </Typography>
              ) : (
                <Box component="form" onSubmit={handleSave}>
                  <Stack spacing={2}>
                    <TextField
                      label="Admin Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Admin Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      required
                    />
                    <TextField
                      label="New Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
                      helperText="Minimum 8 characters"
                    />
                    <Button type="submit" variant="contained" disabled={saving}>
                      {saving ? 'Saving...' : 'Update Credentials'}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
