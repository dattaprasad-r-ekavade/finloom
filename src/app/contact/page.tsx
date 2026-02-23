'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactUs() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 1, textAlign: 'center' }}>
          Contact Us
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
          Have questions about our trading challenges, need support with your account, or want to learn more about Finloom? We&apos;d love to hear from you.
        </Typography>

        <Grid container spacing={4}>
          {/* Contact Info Cards */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3}>
              <Paper sx={{ p: 3, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'primary.main', color: 'white' }}>
                    <EmailIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Email Us</Typography>
                    <Typography variant="body2" color="text.secondary">support@finloom.com</Typography>
                    <Typography variant="body2" color="text.secondary">legal@finloom.com</Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'primary.main', color: 'white' }}>
                    <PhoneIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Call Us</Typography>
                    <Typography variant="body2" color="text.secondary">+91 80 XXXX XXXX</Typography>
                    <Typography variant="body2" color="text.secondary">Mon&ndash;Fri, 9:00 AM &ndash; 6:00 PM IST</Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'primary.main', color: 'white' }}>
                    <LocationOnIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Visit Us</Typography>
                    <Typography variant="body2" color="text.secondary">Finloom Technologies Pvt. Ltd.</Typography>
                    <Typography variant="body2" color="text.secondary">Bangalore, Karnataka 560001, India</Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'primary.main', color: 'white' }}>
                    <AccessTimeIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Support Hours</Typography>
                    <Typography variant="body2" color="text.secondary">Monday &ndash; Friday: 9:00 AM &ndash; 6:00 PM IST</Typography>
                    <Typography variant="body2" color="text.secondary">Saturday: 10:00 AM &ndash; 2:00 PM IST</Typography>
                    <Typography variant="body2" color="text.secondary">Sunday &amp; Public Holidays: Closed</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Send Us a Message
              </Typography>
              <Stack spacing={2.5}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  size="small"
                  type="email"
                />
                <TextField
                  fullWidth
                  label="Phone Number (Optional)"
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Subject"
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Challenge inquiry, Account issue, Refund request"
                />
                <TextField
                  fullWidth
                  label="Message"
                  variant="outlined"
                  multiline
                  rows={5}
                  placeholder="Please describe your inquiry in detail..."
                />
                <Button
                  variant="contained"
                  size="large"
                  sx={{ alignSelf: 'flex-start', px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Send Message
                </Button>
                <Typography variant="caption" color="text.secondary">
                  By submitting this form, you agree to our Privacy Policy. We typically respond within 1&ndash;2 business days.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
