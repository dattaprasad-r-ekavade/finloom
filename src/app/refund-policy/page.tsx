'use client';

import React from 'react';
import { Box, Container, Typography, Stack, Divider, Paper } from '@mui/material';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RefundPolicy() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 1 }}>
            Refund &amp; Cancellation Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Last updated: February 23, 2026
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>1. Overview</Typography>
              <Typography variant="body2" color="text.secondary">
                This Refund and Cancellation Policy outlines the terms under which refunds may be issued for services purchased on the Finloom platform. We strive to provide a fair and transparent refund process for all our users. Please read this policy carefully before purchasing any challenge plan or service.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>2. Digital Service &mdash; No Physical Delivery</Typography>
              <Typography variant="body2" color="text.secondary">
                Finloom is a digital-only platform providing trading evaluation services. All services are delivered electronically through our web platform. There are no physical products or shipments involved. Access to purchased challenge plans is granted immediately upon successful payment confirmation.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>3. Refund Eligibility</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                3.1 Full Refund
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                A full refund will be issued if: the payment was processed but the challenge account was not provisioned within 24 hours due to a platform error; a duplicate payment was made for the same challenge plan; or a technical issue on our end prevented you from accessing the challenge at all and the issue could not be resolved within 48 hours.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                3.2 No Refund
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Refunds will not be issued in the following cases: the trader has already placed one or more trades in the challenge account; the challenge evaluation period has commenced and trading activity has been recorded; the trader violated the challenge rules (e.g., exceeded daily loss limit, maximum drawdown, or used prohibited trading strategies); the trader failed the challenge evaluation; or the trader requests a cancellation after the challenge account has been activated and is functional.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>4. Cancellation Policy</Typography>
              <Typography variant="body2" color="text.secondary">
                Users may request cancellation of a purchased challenge plan only before the challenge account has been activated. Once the challenge account is provisioned and active, cancellation requests will not be accepted. To request a cancellation, please contact our support team within 2 hours of purchase and before any trading activity has occurred.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>5. Refund Process</Typography>
              <Typography variant="body2" color="text.secondary">
                To request a refund, send an email to support@finloom.com with the following details: your registered email address, the order/transaction ID, the challenge plan purchased, the reason for the refund request, and any supporting screenshots or documentation. Our team will review your request within 3&ndash;5 business days and respond with a decision. If approved, the refund will be processed within 5&ndash;7 business days to the original payment method.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>6. Refund Method</Typography>
              <Typography variant="body2" color="text.secondary">
                Approved refunds will be credited back to the original payment method used during purchase (UPI, credit/debit card, net banking, etc.) via Razorpay. The refund processing timeline depends on your bank or payment provider and typically takes 5&ndash;10 business days to reflect in your account after we initiate the refund.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>7. Promotional Offers and Discounts</Typography>
              <Typography variant="body2" color="text.secondary">
                Challenge plans purchased using promotional codes, discounts, or special offers are subject to the same refund policy. Refund amounts for discounted purchases will be limited to the actual amount paid, not the original list price. Free trial or promotional challenge accounts are not eligible for refunds.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>8. Platform Credits</Typography>
              <Typography variant="body2" color="text.secondary">
                In certain cases, instead of a monetary refund, we may offer platform credits that can be used to purchase a new challenge plan. Platform credits are non-transferable, have no cash value, and must be used within 90 days of issuance. This will only be offered as an alternative and not as a substitute if a monetary refund is eligible.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>9. Dispute Resolution</Typography>
              <Typography variant="body2" color="text.secondary">
                If you are unsatisfied with our refund decision, you may escalate your concern by emailing legal@finloom.com. We will conduct a secondary review within 7 business days. For unresolved disputes, either party may seek resolution through the appropriate legal channels under the jurisdiction of Bangalore, Karnataka, India.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>10. Contact Us</Typography>
              <Typography variant="body2" color="text.secondary">
                For refund or cancellation inquiries, please contact:<br />
                Email: support@finloom.com<br />
                Address: Finloom Technologies Pvt. Ltd., Bangalore, Karnataka, India<br />
                Response Time: 1&ndash;2 business days
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
