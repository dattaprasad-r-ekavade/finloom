'use client';

import React from 'react';
import { Box, Container, Typography, Stack, Divider, Paper, Alert } from '@mui/material';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsAndConditions() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 1 }}>
            Terms and Conditions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Preview draft · September 23, 2026
          </Typography>
          <Alert severity="warning" sx={{ mb: 4 }}>
            These are preview disclosures, not final paid-service terms. Checkout is disabled in this deployment. Finloom must publish reviewed terms, verified company/contact details, and final data-use, renewal and refund policies before accepting paid learners.
          </Alert>

          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>1. Acceptance of Terms</Typography>
              <Typography variant="body2" color="text.secondary">
                These preview disclosures describe the Finloom website and its learning and simulated-practice features. They do not replace final service terms. The legal entity responsible for any commercial launch and its contact details must be confirmed and published before paid access opens.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>2. Description of Services</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Finloom is developing a market-learning and simulated-practice product. The current preview may include:
              </Typography>
              <Typography component="ul" variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                <li>Market-learning and independent NISM examination-preparation material, if and when published</li>
                <li>Simulated skills assessments with virtual balances</li>
                <li>A Finloom skills certificate for candidates who meet published assessment criteria</li>
                <li>Historical replay features only after a suitable data licence is secured</li>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Simulated trades do not use real capital; simulated gains and losses have no cash value and are not paid out. A Finloom certificate may be required to apply for a separate prop-desk role, but does not guarantee an interview, offer, salary or trading capital. Any employer makes its own hiring decision. Finloom does not provide investment advice, brokerage or portfolio-management services through the simulation.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>3. Eligibility</Typography>
              <Typography variant="body2" color="text.secondary">
                To use our Platform, you must: (a) be at least 18 years of age; (b) be a resident of India or a jurisdiction where use of such services is not prohibited; (c) have the legal capacity to enter into binding contracts; (d) provide accurate, complete, and current information during registration; (e) complete the KYC verification process as required by applicable laws and our internal policies.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>4. User Accounts</Typography>
              <Typography variant="body2" color="text.secondary">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to or use of your account. We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or pose a risk to our platform&apos;s integrity. Each user may maintain only one active account on the Platform.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>5. Challenge Plans and Fees</Typography>
              <Typography variant="body2" color="text.secondary">
                This preview does not accept payment. Before any paid assessment opens, the applicable price, billing period, renewal, included attempts, cancellation, outage, refund, tax and support terms must be shown clearly at checkout. Do not rely on placeholder plans or prices shown in a preview deployment.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>6. Trading Rules and Risk Limits</Typography>
              <Typography variant="body2" color="text.secondary">
                Published assessment rules will explain applicable limits, scoring, time windows, attempts and appeal procedures before a learner begins a scored attempt. Simulated performance is not evidence of actual returns or a guarantee of future results.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>7. Payments</Typography>
              <Typography variant="body2" color="text.secondary">
                Paid checkout is disabled in this preview. A payment provider, accepted payment methods, invoice/tax treatment, and payment-support process will be identified only after they are configured and verified for the commercial service.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>8. Intellectual Property</Typography>
              <Typography variant="body2" color="text.secondary">
                Platform content may be subject to intellectual-property rights held by Finloom or its licensors. Market-data rights and any permitted display or redistribution will be governed by applicable provider terms.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>9. Limitation of Liability</Typography>
              <Typography variant="body2" color="text.secondary">
                The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent permitted by law, the Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform, including but not limited to losses incurred during simulated trading, system downtime, data loss, or market data inaccuracies. Our total liability shall not exceed the amount paid by you for the specific service giving rise to the claim.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>10. Privacy</Typography>
              <Typography variant="body2" color="text.secondary">
                Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, store, and protect your personal information. By using the Platform, you consent to the data practices described in the Privacy Policy.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>11. Governing Law and Dispute Resolution</Typography>
              <Typography variant="body2" color="text.secondary">
                The governing law, dispute process and competent courts for any commercial service must be confirmed with Indian counsel and included in final terms before paid access opens.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>12. Modifications to Terms</Typography>
              <Typography variant="body2" color="text.secondary">
                We reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with a revised &quot;Last updated&quot; date. Continued use of the Platform after changes constitutes acceptance of the updated Terms. We encourage users to review this page periodically.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>13. Contact Information</Typography>
              <Typography variant="body2" color="text.secondary">
                A verified legal contact and responsible business entity have not yet been published for this preview. Contact details will be added before commercial launch.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
