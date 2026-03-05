'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { CheckCircleOutline, CreditCard } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

function RazorpayPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [orderData, setOrderData] = useState<{
    orderId: string;
    amount: number;
    keyId: string;
    challengeId: string;
    planName: string;
  } | null>(null);

  const planId = searchParams.get('planId');

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!user.hasCompletedKyc) {
      router.replace('/kyc');
      return;
    }

    // Load Razorpay checkout script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Create order
    const createOrder = async () => {
      try {
        const response = await fetch('/api/payment/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? 'Unable to initiate payment.');
        } else {
          setOrderData(data);
        }
      } catch {
        setError('Unable to connect to payment service. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    createOrder();

    return () => {
      document.body.removeChild(script);
    };
  }, [router, user, planId]);

  const handlePayment = useCallback(async () => {
    if (!orderData || !user) return;

    setProcessing(true);
    setError(null);

    const options: RazorpayOptions = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: 'INR',
      name: 'Finloom',
      description: `Challenge: ${orderData.planName}`,
      order_id: orderData.orderId,
      prefill: {
        name: user.name ?? undefined,
        email: user.email,
      },
      theme: { color: '#0061A8' },
      handler: async (response: RazorpayPaymentResponse) => {
        try {
          const verifyResponse = await fetch('/api/payment/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              challengeId: orderData.challengeId,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok) {
            setError(verifyData.error ?? 'Payment verification failed. Please contact support.');
          } else {
            setSuccess(true);
            setTimeout(() => router.push('/dashboard/user'), 2500);
          }
        } catch {
          setError('Payment verification failed. Please contact support with your payment ID.');
        } finally {
          setProcessing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }, [orderData, user, router]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 8 } }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              <Stack spacing={1}>
                <Chip
                  icon={<CreditCard fontSize="small" />}
                  label="Secure payment"
                  color="primary"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Complete your payment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pay securely via UPI, debit/credit card, net banking, or any Razorpay supported method.
                </Typography>
              </Stack>

              <Divider />

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Stack spacing={2}>
                  <Alert severity="error">{error}</Alert>
                  <Button variant="outlined" onClick={() => router.back()}>
                    Go back
                  </Button>
                </Stack>
              ) : success ? (
                <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
                  <CheckCircleOutline sx={{ fontSize: 56, color: 'success.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Payment confirmed!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your challenge has been activated. Redirecting to your dashboard…
                  </Typography>
                  <CircularProgress size={20} />
                </Stack>
              ) : orderData ? (
                <Stack spacing={3}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(0,97,168,0.05)'
                          : 'rgba(79,195,247,0.08)',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack>
                      <Typography variant="body2" color="text.secondary">
                        Challenge plan
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {orderData.planName}
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatCurrency(orderData.amount / 100)}
                    </Typography>
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    You will be redirected to the Razorpay checkout. Supported: UPI, PhonePe, GPay, debit/credit cards, net banking.
                  </Typography>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={processing}
                    onClick={handlePayment}
                    sx={{ fontWeight: 600, py: 1.5 }}
                  >
                    {processing ? 'Opening checkout…' : `Pay ${formatCurrency(orderData.amount / 100)}`}
                  </Button>

                  <Button
                    variant="text"
                    size="small"
                    color="inherit"
                    onClick={() => router.back()}
                    sx={{ color: 'text.secondary' }}
                  >
                    Cancel and go back
                  </Button>
                </Stack>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function RazorpayPaymentPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <RazorpayPaymentContent />
    </Suspense>
  );
}
