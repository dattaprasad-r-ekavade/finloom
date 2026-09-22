'use client';

import { Alert, Box, Container, Paper, Typography } from '@mui/material';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RefundPolicy() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f8f4' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 }, flexGrow: 1 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid #e3e9e2', borderRadius: 4 }}>
          <Typography component="h1" sx={{ mb: 1, fontFamily: 'var(--font-poppins),sans-serif', fontSize: 32, fontWeight: 600, letterSpacing: '-.04em' }}>Payment and refund preview</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Preview notice · September 23, 2026</Typography>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Paid checkout is disabled in this deployment. No purchase is available here.
          </Alert>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85 }}>
            Before any paid assessment opens, Finloom will publish the exact fee and billing period, renewal and cancellation steps, what each subscription includes, attempt and retry rules, refund eligibility, platform-outage remedies, taxes, payment provider, invoice details and a working support channel. Those conditions will be shown before payment and reviewed for the Indian launch. The placeholder prices and legacy wording elsewhere in this development branch are not an offer to sell a service.
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
