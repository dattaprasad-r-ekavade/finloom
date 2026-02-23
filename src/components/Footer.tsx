'use client';

import React from 'react';
import { Box, Container, Typography, Stack, Divider, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';

const footerLinks = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Refund Policy', href: '/refund-policy' },
    ],
  },
  {
    title: 'Product',
    links: [
      { label: 'Challenge Plans', href: '/challenge-plans' },
      { label: 'Trader Login', href: '/trader/login' },
      { label: 'Admin Login', href: '/admin/login' },
    ],
  },
];

export default function Footer() {
  const router = useRouter();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? '#F5F5F5' : '#0A0E14',
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '2fr 1fr 1fr 1fr' },
            gap: { xs: 3, md: 4 },
          }}
        >
          {/* Brand column */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
                mb: 1.5,
              }}
            >
              Finloom
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mb: 2 }}>
              A modern proprietary trading platform combining lightning execution, deep analytics, and
              transparent risk governance for ambitious trading teams.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Operated by Finloom Technologies Private Limited
            </Typography>
          </Box>

          {/* Link columns */}
          {footerLinks.map((section) => (
            <Box key={section.title}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link) => (
                  <Typography
                    key={link.label}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'primary.main' },
                    }}
                    onClick={() => router.push(link.href)}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: { xs: 3, md: 4 } }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', sm: 'center' }}
          spacing={2}
        >
          <Typography variant="caption" color="text.secondary">
            &copy; {new Date().getFullYear()} Finloom Technologies Pvt. Ltd. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
              onClick={() => router.push('/terms')}
            >
              Terms
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
              onClick={() => router.push('/privacy')}
            >
              Privacy
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
              onClick={() => router.push('/refund-policy')}
            >
              Refunds
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
