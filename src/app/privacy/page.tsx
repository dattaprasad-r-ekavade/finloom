'use client';

import { Alert, Box, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f8f4' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 }, flexGrow: 1 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid #e3e9e2', borderRadius: 4 }}>
          <Typography component="h1" sx={{ mb: 1, fontFamily: 'var(--font-poppins),sans-serif', fontSize: 32, fontWeight: 600, letterSpacing: '-.04em' }}>Privacy preview</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Preview notice · September 23, 2026</Typography>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            This notice is not a final privacy policy. Do not enter real PAN, identity or address details in this preview. The data controller, support contact, retention rules and complete launch disclosures must be confirmed before public registration.
          </Alert>
          <Stack spacing={2.5} divider={<Divider flexItem />}>
            <Box>
              <Typography variant="h6" sx={{ mb: 0.75, fontWeight: 600 }}>What this preview may collect</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Account registration asks for a name, email address and password; passwords are stored as password hashes. If enabled in a local development environment, the identity form stores a phone number, PAN, date of birth and address. The product may also store simulated trade entries, assessment progress and technical logs. Do not submit sensitive identity information to a preview deployment.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ mb: 0.75, fontWeight: 600 }}>Analytics and service providers</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                The application includes Vercel Analytics and Speed Insights. It is designed to run on Vercel and a PostgreSQL database. Paid checkout is disabled in this preview, and there is no live-data entitlement or simulated-profit payout. Provider roles, data locations, retention and deletion procedures must be documented for the launch service.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ mb: 0.75, fontWeight: 600 }}>Before launch</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Finloom must identify the responsible legal entity and privacy contact, document each purpose and legal basis, set retention and deletion schedules, review processor agreements, and publish a complete privacy policy and user-request process before collecting data from public paid users.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
