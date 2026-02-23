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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { 
  Brightness4, 
  Brightness7,
  Person,
  Logout,
  Dashboard,
  Settings,
  People,
  Menu as MenuIcon,
  Close,
  Home,
  Login,
  PersonAdd,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useThemeMode } from '@/theme/ThemeProvider';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { mode, toggleTheme } = useThemeMode();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState<null | HTMLElement>(null);
  const [traderMenuAnchor, setTraderMenuAnchor] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      setDrawerOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDashboard = () => {
    handleMenuClose();
    setDrawerOpen(false);
    if (user?.role === 'ADMIN') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/user');
    }
  };

  const navigateAndClose = (path: string) => {
    setDrawerOpen(false);
    router.push(path);
  };

  const mobileDrawerContent = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
          Finloom
        </Typography>
        <IconButton onClick={() => setDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      {user ? (
        <List sx={{ flex: 1 }}>
          <ListItem sx={{ px: 2, py: 1.5 }}>
            <Chip
              label={user.role === 'ADMIN' ? 'Admin' : 'Trader'}
              color={user.role === 'ADMIN' ? 'secondary' : 'primary'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 500 }}>
              {user.name || user.email}
            </Typography>
          </ListItem>
          <Divider sx={{ my: 1 }} />
          <ListItemButton onClick={handleDashboard}>
            <ListItemIcon><Dashboard /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          {user.role === 'ADMIN' && (
            <>
              <ListItemButton onClick={() => navigateAndClose('/dashboard/admin/users')}>
                <ListItemIcon><People /></ListItemIcon>
                <ListItemText primary="Manage Users" />
              </ListItemButton>
              <ListItemButton onClick={() => navigateAndClose('/dashboard/admin/settings')}>
                <ListItemIcon><Settings /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </>
          )}
          <Divider sx={{ my: 1 }} />
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      ) : (
        <List sx={{ flex: 1 }}>
          <ListItemButton onClick={() => navigateAndClose('/')}>
            <ListItemIcon><Home /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
          <Divider sx={{ my: 1 }} />
          <ListItem sx={{ px: 2 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
              Trader
            </Typography>
          </ListItem>
          <ListItemButton onClick={() => navigateAndClose('/trader/login')}>
            <ListItemIcon><Login /></ListItemIcon>
            <ListItemText primary="Trader Login" />
          </ListItemButton>
          <ListItemButton onClick={() => navigateAndClose('/trader/signup')}>
            <ListItemIcon><PersonAdd /></ListItemIcon>
            <ListItemText primary="Trader Sign Up" />
          </ListItemButton>
          <Divider sx={{ my: 1 }} />
          <ListItem sx={{ px: 2 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
              Admin
            </Typography>
          </ListItem>
          <ListItemButton onClick={() => navigateAndClose('/admin/login')}>
            <ListItemIcon><AdminPanelSettings /></ListItemIcon>
            <ListItemText primary="Admin Login" />
          </ListItemButton>
          <ListItemButton onClick={() => navigateAndClose('/admin/signup')}>
            <ListItemIcon><PersonAdd /></ListItemIcon>
            <ListItemText primary="Admin Sign Up" />
          </ListItemButton>
        </List>
      )}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          onClick={toggleTheme}
          sx={{ borderRadius: 2 }}
        >
          {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </Box>
    </Box>
  );

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
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 72 } }}>
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

          {/* Mobile: hamburger + theme toggle */}
          {isMobile ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
              <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                  sx: {
                    backgroundColor: 'background.paper',
                    backgroundImage: 'none',
                  },
                }}
              >
                {mobileDrawerContent}
              </Drawer>
            </Box>
          ) : (
            /* Desktop nav items */
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
