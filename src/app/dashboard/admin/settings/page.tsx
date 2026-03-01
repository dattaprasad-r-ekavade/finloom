'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import { Settings as SettingsIcon, Save, Verified } from '@mui/icons-material';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { formatDateTime } from '@/lib/dateFormat';

interface AdminSettingsData {
  id: string;
  autoApproveKyc: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [settings, setSettings] = useState<AdminSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [autoApproveKyc, setAutoApproveKyc] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      router.replace('/dashboard/user');
      return;
    }

    fetchSettings();
  }, [isLoading, user, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
        setAutoApproveKyc(result.data.autoApproveKyc);
      } else {
        setError(result.error || 'Failed to fetch settings');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoApproveKyc }),
      });

      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
        setSuccess('Settings saved successfully');
      } else {
        setError(result.error || 'Failed to save settings');
      }
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Container>
      </Box>
    );
  }

  const hasChanges = settings?.autoApproveKyc !== autoApproveKyc;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SettingsIcon sx={{ fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Admin Settings
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Configure platform-wide settings and preferences
            </Typography>
          </Stack>

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

          {/* KYC Settings */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? 'linear-gradient(135deg, rgba(0,97,168,0.05) 0%, rgba(0,168,107,0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(79,195,247,0.12) 0%, rgba(76,175,80,0.15) 100%)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Verified color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    KYC Verification Settings
                  </Typography>
                </Stack>

                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      checked={autoApproveKyc}
                      onChange={(e) => setAutoApproveKyc(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Auto-approve KYC submissions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        When enabled, all KYC submissions will be automatically approved without manual review.
                        When disabled, admins must manually approve or reject each KYC submission.
                      </Typography>
                    </Box>
                  }
                />

                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    label={autoApproveKyc ? 'Auto-approval Enabled' : 'Manual Review Required'}
                    color={autoApproveKyc ? 'success' : 'warning'}
                    size="small"
                  />
                  {hasChanges && (
                    <Chip
                      label="Unsaved changes"
                      color="info"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>

                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    <strong>Note:</strong> Changing this setting only affects future KYC submissions. 
                    Existing pending submissions will still require manual review unless you approve them individually.
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="outlined"
              onClick={fetchSettings}
              disabled={saving || !hasChanges}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving || !hasChanges}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Stack>

          {/* Settings Info */}
          {settings && (
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {formatDateTime(settings.updatedAt)}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
