'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { VerifiedUser, ArrowForward } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { validateName, validatePhone, validateIdNumber, validateAddress } from '@/lib/validation';

export default function KycPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.name) {
      setFullName(user.name);
    }
  }, [router, user]);

  useEffect(() => {
    if (user?.hasCompletedKyc) {
      setSuccessMessage('Your KYC is already approved.');
    }
  }, [user?.hasCompletedKyc]);

  const destinationAfterKyc = useMemo(() => {
    if (!user) {
      return '/login';
    }

    return user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user';
  }, [user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validate full name
    const nameValidation = validateName(fullName);
    if (!nameValidation.valid) {
      newErrors.fullName = nameValidation.error ?? 'Invalid name';
    }

    // Validate phone number
    const phoneValidation = validatePhone(phoneNumber);
    if (!phoneValidation.valid) {
      newErrors.phoneNumber = phoneValidation.error ?? 'Invalid phone number';
    }

    // Validate ID number
    const idValidation = validateIdNumber(idNumber);
    if (!idValidation.valid) {
      newErrors.idNumber = idValidation.error ?? 'Invalid ID number';
    }

    // Validate address
    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
      newErrors.address = addressValidation.error ?? 'Invalid address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (!validate() || !user) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName,
          phoneNumber,
          idNumber,
          address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error ?? 'Unable to submit KYC right now.');
        return;
      }

      setSuccessMessage('KYC submitted and auto-approved. Redirecting to your dashboard.');

      setUser({
        ...user,
        name: fullName,
        kycStatus: 'AUTO_APPROVED',
        hasCompletedKyc: true,
      });

      setTimeout(() => {
        router.push(destinationAfterKyc);
      }, 1500);
    } catch (error) {
      console.error('KYC submission failed', error);
      setErrorMessage('Unexpected error while submitting KYC.');
    } finally {
      setSubmitting(false);
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
      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: { xs: 6, md: 8 } }}>
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
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            <Stack spacing={4}>
              <Stack spacing={1.5}>
                <Chip
                  icon={<VerifiedUser fontSize="small" />}
                  label="Compliance clearance"
                  color="primary"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Complete your rapid KYC
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
                  Submit your verification details once to unlock funding workflows, payout tracking, and challenge plan selection.
                </Typography>
              </Stack>

              <Divider />

              {errorMessage && (
                <Alert severity="error" onClose={() => setErrorMessage(null)}>
                  {errorMessage}
                </Alert>
              )}

              {successMessage && (
                <Alert severity="success" onClose={() => setSuccessMessage(null)}>
                  {successMessage}
                </Alert>
              )}

              {user?.hasCompletedKyc ? (
                <Stack spacing={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    You&apos;re already cleared
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your documents are on file and auto-approved. Head to the dashboard to choose your challenge plan and begin trading simulations.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => router.push(destinationAfterKyc)}
                  >
                    Go to dashboard
                  </Button>
                </Stack>
              ) : (
                <Stack component="form" onSubmit={handleSubmit} spacing={2.5} noValidate>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    error={Boolean(errors.fullName)}
                    helperText={errors.fullName}
                  />
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2.5,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      error={Boolean(errors.phoneNumber)}
                      helperText={errors.phoneNumber}
                    />
                    <TextField
                      fullWidth
                      label="ID Number"
                      value={idNumber}
                      onChange={(event) => setIdNumber(event.target.value)}
                      error={Boolean(errors.idNumber)}
                      helperText={errors.idNumber}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    error={Boolean(errors.address)}
                    helperText={errors.address}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      sx={{
                        flex: 1,
                        fontWeight: 600,
                        py: 1.5,
                        backgroundImage: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'linear-gradient(135deg, #0061A8 0%, #00A86B 100%)'
                            : 'linear-gradient(135deg, #4FC3F7 0%, #4CAF50 100%)',
                        boxShadow: 'none',
                      }}
                    >
                      {submitting ? 'Submitting...' : 'Submit & auto-approve'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{ flex: 1, fontWeight: 600, py: 1.5 }}
                      onClick={() => router.push(destinationAfterKyc)}
                    >
                      Back to dashboard
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
