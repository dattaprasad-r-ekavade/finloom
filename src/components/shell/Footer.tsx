'use client';

import Link from 'next/link';
import { Box, Container, Divider, Link as MuiLink, Stack, Typography } from '@mui/material';
import Logo from './Logo';

const footerLinks = [
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
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
      { label: 'Practice plans', href: '/challenge-plans' },
      { label: 'Log in', href: '/login' },
      { label: 'Create an account', href: '/trader/signup' },
    ],
  },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.subtle', borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '2fr 1fr 1fr 1fr' },
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box>
            <Logo />
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mt: 1.5, mb: 2 }}>
              A learning and simulated-practice platform for people building market knowledge and disciplined trading habits.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Simulation only. Virtual results have no cash value.
            </Typography>
          </Box>

          {footerLinks.map((section) => (
            <Box key={section.title}>
              <Typography variant="overline" color="text.secondary" component="h2" sx={{ mb: 1, display: 'block' }}>
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link) => (
                  <MuiLink key={link.href} component={Link} href={link.href} variant="body2" color="text.secondary" underline="hover">
                    {link.label}
                  </MuiLink>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: { xs: 3, md: 4 } }} />

        <Typography variant="caption" color="text.secondary">
          &copy; {new Date().getFullYear()} Finloom. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
