'use client';

import React from 'react';
import { Box, Container, Typography, Stack, Divider, Paper } from '@mui/material';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 1 }}>
            Privacy Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Last updated: February 23, 2026
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>1. Introduction</Typography>
              <Typography variant="body2" color="text.secondary">
                Finloom Technologies Private Limited (&quot;Finloom&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our proprietary trading evaluation platform. Please read this policy carefully. By using our Platform, you consent to the data practices described herein.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>2. Information We Collect</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                2.1 Personal Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                We collect the following personal information when you register, complete KYC verification, or use our services: full name, email address, phone number, date of birth, PAN card number and image, Aadhaar number (optional), address proof and identity proof documents, bank account details for payouts, and any other information required for identity verification under applicable regulations.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                2.2 Trading and Usage Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                We automatically collect: trading activity data (orders placed, positions held, performance metrics), challenge progress and evaluation results, IP address, browser type, device information, pages visited, time spent on pages, and referral URLs.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                2.3 Payment Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment processing is handled by Razorpay. We do not store your credit/debit card numbers or bank login credentials on our servers. Razorpay&apos;s handling of your payment information is governed by their privacy policy.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>3. How We Use Your Information</Typography>
              <Typography variant="body2" color="text.secondary">
                We use your personal information for the following purposes: to create and manage your user account; to verify your identity through KYC processes; to administer trading challenges and evaluate performance; to process payments and issue refunds where applicable; to communicate service updates, challenge results, and promotional offers; to improve our platform, services, and user experience; to detect and prevent fraud, abuse, or unauthorized access; to comply with legal and regulatory obligations; and to enforce our Terms and Conditions.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>4. Data Sharing and Disclosure</Typography>
              <Typography variant="body2" color="text.secondary">
                We do not sell your personal information to third parties. We may share your information with: payment processors (Razorpay) for transaction processing; KYC verification providers to validate your identity; cloud hosting and infrastructure providers (for secure data storage); analytics providers to improve our services; law enforcement or regulatory authorities when required by law; and professional advisors such as lawyers and auditors. All third-party service providers are contractually obligated to handle your data securely and only for the purposes specified.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>5. Data Security</Typography>
              <Typography variant="body2" color="text.secondary">
                We implement industry-standard security measures to protect your information, including: encryption of sensitive data in transit (TLS/SSL) and at rest, secure password hashing using bcrypt, role-based access controls for internal systems, regular security audits and vulnerability assessments, and secure API authentication using JWT tokens. While we strive to protect your information, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>6. Data Retention</Typography>
              <Typography variant="body2" color="text.secondary">
                We retain your personal information for as long as your account is active or as needed to provide you services. We may also retain information as necessary to comply with legal obligations, resolve disputes, and enforce agreements. KYC documents are retained as required by Indian financial regulations. You may request deletion of your account and associated data by contacting us, subject to our legal and regulatory retention obligations.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>7. Cookies and Tracking Technologies</Typography>
              <Typography variant="body2" color="text.secondary">
                We use cookies and similar tracking technologies to enhance your experience on our Platform. These include: essential cookies required for platform functionality and authentication, analytics cookies to understand user behavior and improve our services, and preference cookies to remember your settings (such as theme preference). You can control cookie settings through your browser preferences, though disabling certain cookies may affect platform functionality.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>8. Your Rights</Typography>
              <Typography variant="body2" color="text.secondary">
                Under applicable data protection laws, you have the right to: access the personal information we hold about you; correct inaccurate or incomplete information; request deletion of your personal data (subject to legal exceptions); withdraw consent for data processing at any time; object to processing of your data for specific purposes; and receive your data in a portable, machine-readable format. To exercise any of these rights, please contact us at privacy@finloom.com.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>9. Children&apos;s Privacy</Typography>
              <Typography variant="body2" color="text.secondary">
                Our Platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected information from a person under 18, we will take steps to delete such information promptly.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>10. Changes to This Policy</Typography>
              <Typography variant="body2" color="text.secondary">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated &quot;Last updated&quot; date. We encourage you to review this policy periodically. Continued use of the Platform after changes constitutes acceptance of the revised policy.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>11. Contact Us</Typography>
              <Typography variant="body2" color="text.secondary">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:<br />
                Email: privacy@finloom.com<br />
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
