'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Navbar from '@/components/Navbar';

interface CredentialsInfo {
  apiKey: string;
  clientCode: string;
  hasTokens: boolean;
  tokenExpiresAt: string;
}

export default function AngelOneCredentialsPage() {
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [credentialsInfo, setCredentialsInfo] = useState<CredentialsInfo | null>(null);

  const [formData, setFormData] = useState({
    apiKey: '',
    clientCode: '',
    mpin: '',
    totpSecret: '',
  });

  useEffect(() => {
    fetchCredentialsInfo();
  }, []);

  const fetchCredentialsInfo = async () => {
    setLoadingInfo(true);
    try {
      const response = await fetch('/api/admin/angelone-credentials');
      const data = await response.json();

      if (data.success) {
        setCredentialsInfo(data.data);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch credentials info' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to fetch credentials info' });
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleSeedFromEnv = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/angelone-credentials', {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Credentials seeded successfully from environment variables' });
        fetchCredentialsInfo();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to seed credentials' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to seed credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/angelone-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Credentials updated successfully' });
        setFormData({ apiKey: '', clientCode: '', mpin: '', totpSecret: '' });
        fetchCredentialsInfo();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update credentials' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update credentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        AngelOne Credentials Management
      </Typography>

      {loadingInfo ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Current Credentials Info */}
          {credentialsInfo && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Credentials Status
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                    <Typography variant="body2" color="text.secondary">
                      API Key:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {credentialsInfo.apiKey ? `${credentialsInfo.apiKey.substring(0, 10)}...` : 'Not set'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                    <Typography variant="body2" color="text.secondary">
                      Client Code:
                    </Typography>
                    <Typography variant="body1">
                      {credentialsInfo.clientCode || 'Not set'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                    <Typography variant="body2" color="text.secondary">
                      Token Status:
                    </Typography>
                    <Typography variant="body1" color={credentialsInfo.hasTokens ? 'success.main' : 'error.main'}>
                      {credentialsInfo.hasTokens ? 'Active' : 'Not Generated'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                    <Typography variant="body2" color="text.secondary">
                      Token Expires At:
                    </Typography>
                    <Typography variant="body1">
                      {credentialsInfo.tokenExpiresAt 
                        ? new Date(credentialsInfo.tokenExpiresAt).toLocaleString()
                        : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Seed from Environment Button */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seed from Environment Variables
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Load credentials from .env.local file (ANGELONE_API_KEY, ANGELONE_CLIENT_CODE, ANGELONE_MPIN, ANGELONE_TOTP_SECRET)
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSeedFromEnv}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Seed from Environment'}
            </Button>
          </Paper>

          {/* Manual Update Form */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Update Credentials Manually
            </Typography>
            <Box component="form" onSubmit={handleUpdateCredentials} noValidate>
              <TextField
                fullWidth
                margin="normal"
                label="API Key"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                helperText="Your AngelOne API Key"
              />
              <TextField
                fullWidth
                margin="normal"
                label="Client Code"
                value={formData.clientCode}
                onChange={(e) => setFormData({ ...formData, clientCode: e.target.value })}
                helperText="Your AngelOne Client Code"
              />
              <TextField
                fullWidth
                margin="normal"
                label="MPIN"
                type="password"
                value={formData.mpin}
                onChange={(e) => setFormData({ ...formData, mpin: e.target.value })}
                helperText="Your 4-digit MPIN"
              />
              <TextField
                fullWidth
                margin="normal"
                label="TOTP Secret"
                type="password"
                value={formData.totpSecret}
                onChange={(e) => setFormData({ ...formData, totpSecret: e.target.value })}
                helperText="Your TOTP Secret Key (e.g., 4Q64HNKKRN3NXBOUEWDKVxxxxx)"
              />
              <Box mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Credentials'}
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Message Display */}
          {message && (
            <Box mt={2}>
              <Alert severity={message.type}>{message.text}</Alert>
            </Box>
          )}
        </>
      )}
    </Container>
    </Box>
  );
}

