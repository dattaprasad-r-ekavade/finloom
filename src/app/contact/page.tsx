'use client';

import { Alert, Box, Button, Container, Paper, Typography } from '@mui/material';
import { ArrowBackRounded } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactUs() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f8f4' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 9 }, flexGrow: 1 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid #e3e9e2', borderRadius: 4 }}>
          <Typography sx={{ color: '#588268', fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' }}>Finloom preview</Typography>
          <Typography component="h1" sx={{ mt: 1.5, fontFamily: 'var(--font-poppins),sans-serif', fontSize: 36, fontWeight: 600, letterSpacing: '-.05em' }}>Contact and support</Typography>
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            This review deployment does not yet have a verified support address, staffed help desk or registered-business contact details. We will publish working contact channels before inviting paid learners.
          </Alert>
          <Typography sx={{ mt: 2, color: '#66756c', fontSize: 14, lineHeight: 1.8 }}>
            If you are reviewing Finloom, you can explore the learning pathway and planned historical-replay experience. Checkout is disabled; do not send identity or payment information through this preview.
          </Typography>
          <Button onClick={() => router.push('/')} startIcon={<ArrowBackRounded />} sx={{ mt: 2 }}>Back to Finloom</Button>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
