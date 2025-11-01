'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import { 
  Brightness4, 
  Brightness7,
  Person,
  Logout,
  Dashboard,
  Settings,
  People,
} from '@mui/icons-material';
import { useThemeMode } from '@/theme/ThemeProvider';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { mode, toggleTheme } = useThemeMode();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState<null | HTMLElement>(null);
  const [traderMenuAnchor, setTraderMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAdminMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAdminMenuAnchor(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAdminMenuAnchor(null);
  };

  const handleTraderMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTraderMenuAnchor(event.currentTarget);
  };

  const handleTraderMenuClose = () => {
    setTraderMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      logout();
      handleMenuClose();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDashboard = () => {
    handleMenuClose();
    if (user?.role === 'ADMIN') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/user');
    }
  };

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
              cursor: 'pointer',
            }}
            onClick={() => router.push('/')}
          >
            Finloom
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center' }}>
            {user ? (
              <>
                <Chip
                  label={user.role === 'ADMIN' ? 'Admin' : 'Trader'}
                  color={user.role === 'ADMIN' ? 'secondary' : 'primary'}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} arrow>
                  <IconButton
                    onClick={toggleTheme}
                    color="inherit"
                    size="small"
                    sx={{
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}
                  >
                    {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Account menu" arrow>
                  <Button
                    color="inherit"
                    startIcon={<Person />}
                    onClick={handleMenuOpen}
                    sx={{ fontWeight: 500 }}
                  >
                    {user.name || user.email}
                  </Button>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleDashboard}>
                    <Dashboard sx={{ mr: 1 }} fontSize="small" />
                    Dashboard
                  </MenuItem>
                  {user.role === 'ADMIN' && (
                    <MenuItem onClick={() => { router.push('/dashboard/admin/users'); handleMenuClose(); }}>
                      <People sx={{ mr: 1 }} fontSize="small" />
                      Manage Users
                    </MenuItem>
                  )}
                  {user.role === 'ADMIN' && (
                    <MenuItem onClick={() => { router.push('/dashboard/admin/settings'); handleMenuClose(); }}>
                      <Settings sx={{ mr: 1 }} fontSize="small" />
                      Settings
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1 }} fontSize="small" />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} arrow>
                  <IconButton
                    onClick={toggleTheme}
                    color="inherit"
                    size="small"
                    sx={{
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}
                  >
                    {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Button
                  color="inherit"
                  onClick={() => router.push('/')}
                  sx={{ fontWeight: 500 }}
                >
                  Home
                </Button>
                <Button 
                  color="inherit" 
                  onClick={handleTraderMenuOpen} 
                  sx={{ fontWeight: 500 }}
                >
                  Trader
                </Button>
                <Menu
                  anchorEl={traderMenuAnchor}
                  open={Boolean(traderMenuAnchor)}
                  onClose={handleTraderMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={() => { router.push('/trader/login'); handleTraderMenuClose(); }}>
                    Trader Login
                  </MenuItem>
                  <MenuItem onClick={() => { router.push('/trader/signup'); handleTraderMenuClose(); }}>
                    Trader Sign Up
                  </MenuItem>
                </Menu>
                <Button 
                  color="inherit" 
                  onClick={handleAdminMenuOpen}
                  sx={{ fontWeight: 500 }}
                >
                  Admin
                </Button>
                <Menu
                  anchorEl={adminMenuAnchor}
                  open={Boolean(adminMenuAnchor)}
                  onClose={handleAdminMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={() => { router.push('/admin/login'); handleAdminMenuClose(); }}>
                    Admin Login
                  </MenuItem>
                  <MenuItem onClick={() => { router.push('/admin/signup'); handleAdminMenuClose(); }}>
                    Admin Sign Up
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
