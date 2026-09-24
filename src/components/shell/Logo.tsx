'use client';

import Link from 'next/link';
import { Box, Typography } from '@mui/material';

/** Finloom wordmark. Used by every header so all areas share one identity. */
export default function Logo({ href = '/', size = 'md' }: { href?: string; size?: 'sm' | 'md' }) {
  const fontSize = size === 'sm' ? 18 : 21;
  return (
    <Box
      component={Link}
      href={href}
      aria-label="Finloom home"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: 'text.primary', textDecoration: 'none' }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 12,
          height: 12,
          borderRadius: '5px 5px 5px 1px',
          bgcolor: 'primary.main',
          transform: 'rotate(-10deg)',
        }}
      />
      <Typography
        component="span"
        sx={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize, fontWeight: 600, letterSpacing: '-0.06em' }}
      >
        finloom
      </Typography>
    </Box>
  );
}
