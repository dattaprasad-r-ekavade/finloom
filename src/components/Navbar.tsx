'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
} from '@mui/material';
import { 
  Brightness4, 
  Brightness7 
} from '@mui/icons-material';
import { useThemeMode } from '@/theme/ThemeProvider';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { mode, toggleTheme } = useThemeMode();
  const router = useRouter();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? 'rgba(250, 250, 250, 0.85)'
            : 'rgba(13, 17, 23, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontFamily: '"Poppins", "Segoe UI", sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            Finloom
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={() => router.push('/')}
              sx={{ fontWeight: 500 }}
            >
              Home
            </Button>
            <Button color="inherit" onClick={() => router.push('/login')} sx={{ fontWeight: 500 }}>
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push('/login')}
              sx={{
                backgroundImage: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, #0061A8 0%, #00A86B 100%)'
                    : 'linear-gradient(135deg, #4FC3F7 0%, #4CAF50 100%)',
                boxShadow: 'none',
                fontWeight: 600,
                '&:hover': {
                  boxShadow: '0 8px 20px rgba(0, 97, 168, 0.25)',
                },
              }}
            >
              Request Funding
            </Button>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
