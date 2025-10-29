'use client';

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box 
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
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'transparent', backdropFilter: 'blur(10px)' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Finloom
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button color="inherit" onClick={() => router.push('/')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => router.push('/login')}>
            Login
          </Button>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
