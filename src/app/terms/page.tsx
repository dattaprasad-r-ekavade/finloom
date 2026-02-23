'use client';

import React from 'react';
import { Box, Container, Typography, Stack, Divider, Paper } from '@mui/material';
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
            Last updated: February 23, 2026
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>1. Acceptance of Terms</Typography>
              <Typography variant="body2" color="text.secondary">
                By accessing or using the Finloom platform (&quot;Platform&quot;), operated by Finloom Technologies Private Limited (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree to these Terms, you must not use the Platform. These Terms constitute a legally binding agreement between you and the Company.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>2. Description of Services</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Finloom is a proprietary trading evaluation platform that provides:
              </Typography>
              <Typography component="ul" variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                <li>Trading challenge evaluations for aspiring funded traders</li>
                <li>Simulated and demo trading environments with real-time market data</li>
                <li>Performance analytics, risk monitoring dashboards, and KPI tracking</li>
                <li>KYC verification and user management systems</li>
                <li>Funded account access for traders who successfully pass evaluation challenges</li>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                The Platform does not provide investment advice, portfolio management services, or direct brokerage services. All trading activities during the evaluation phase are conducted in a simulated environment.
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
                Challenge plans are offered at various tiers with different account sizes, profit targets, maximum loss limits, and evaluation durations. Fees for challenge plans are non-refundable once the evaluation period has commenced unless otherwise stated in our Refund Policy. The Company reserves the right to modify challenge plan structures, pricing, and availability at any time. Changes will not affect active challenges already purchased.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>6. Trading Rules and Risk Limits</Typography>
              <Typography variant="body2" color="text.secondary">
                All traders must adhere to the risk parameters defined in their selected challenge plan, including but not limited to: daily loss limits, maximum drawdown thresholds, profit target percentages, and permitted trading instruments. Violation of any risk limit will result in automatic failure of the challenge. The Company employs automated risk monitoring systems that enforce these limits in real time.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>7. Payments</Typography>
              <Typography variant="body2" color="text.secondary">
                All payments are processed securely through Razorpay, our authorized payment gateway partner. We accept payments via UPI, debit cards, credit cards, net banking, and other methods supported by Razorpay. All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise specified. Payment confirmation will be sent to your registered email address upon successful transaction.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>8. Intellectual Property</Typography>
              <Typography variant="body2" color="text.secondary">
                All content on the Platform, including but not limited to software, text, graphics, logos, designs, analytics tools, and trading interfaces, is the intellectual property of Finloom Technologies Private Limited and is protected under applicable copyright and trademark laws. You may not reproduce, distribute, modify, or create derivative works from any Platform content without prior written consent.
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
                These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or use of the Platform shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India. The parties agree to first attempt to resolve disputes through good-faith negotiation before pursuing formal legal proceedings.
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
                For questions about these Terms, please contact us at:<br />
                Email: legal@finloom.com<br />
                Address: Finloom Technologies Pvt. Ltd., Bangalore, Karnataka, India
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
