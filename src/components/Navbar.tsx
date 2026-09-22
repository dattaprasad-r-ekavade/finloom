'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar, Box, Button, Chip, Container, Drawer, IconButton, List, ListItemButton,
  ListItemText, Menu, MenuItem, Toolbar, Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { AccountCircle, Dashboard, Logout, Menu as MenuIcon, Close, ArrowOutward } from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);

  const navigate = (path: string) => {
    setDrawerOpen(false);
    setAccountAnchor(null);
    router.push(path);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    setAccountAnchor(null);
    setDrawerOpen(false);
    router.push('/');
  };

  const publicLinks = (
    <>
      <Button color="inherit" onClick={() => navigate('/#pathway')}>How it works</Button>
      <Button color="inherit" onClick={() => navigate('/#learning')}>Learning</Button>
      <Button color="inherit" onClick={() => navigate('/about')}>About</Button>
    </>
  );

  return (
    <AppBar position="sticky" elevation={0} sx={{ color: 'text.primary', background: 'rgba(251,252,249,.9)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(21,39,32,.08)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 }, gap: 2 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
            <Box aria-hidden="true" sx={{ width: 12, height: 12, borderRadius: '5px 5px 5px 1px', background: '#69a982', transform: 'rotate(-10deg)' }} />
            <Typography sx={{ color: '#163f31', fontFamily: 'var(--font-poppins), sans-serif', fontSize: 21, fontWeight: 600, letterSpacing: '-.06em' }}>finloom</Typography>
          </Link>

          {!isMobile && !user && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>{publicLinks}</Box>}
          {!isMobile && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip size="small" label={user.role === 'ADMIN' ? 'Admin' : 'Learner'} sx={{ fontWeight: 700, background: '#eef5ed', color: '#315e40' }} />
              <Button color="inherit" startIcon={<Dashboard />} onClick={() => navigate(user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user')}>Dashboard</Button>
              <Tooltip title="Account options">
                <Button color="inherit" startIcon={<AccountCircle />} onClick={(event) => setAccountAnchor(event.currentTarget)}>{user.name || user.email}</Button>
              </Tooltip>
              <Menu anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={() => setAccountAnchor(null)}>
                {user.role === 'ADMIN' && <MenuItem onClick={() => navigate('/dashboard/admin/users')}>Manage users</MenuItem>}
                <MenuItem onClick={handleLogout}><Logout fontSize="small" sx={{ mr: 1 }} />Sign out</MenuItem>
              </Menu>
            </Box>
          )}
          {!isMobile && !user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button color="inherit" onClick={() => navigate('/trader/login')}>Log in</Button>
              <Button variant="contained" endIcon={<ArrowOutward />} onClick={() => navigate('/trader/signup')} sx={{ px: 2.1, borderRadius: '11px', color: 'white', background: '#174f3d', '&:hover': { background: '#103b30' } }}>Get started</Button>
            </Box>
          )}
          {isMobile && (
            <>
              <IconButton aria-label="Open navigation" onClick={() => setDrawerOpen(true)} sx={{ color: '#214c38', border: '1px solid #e2e9e1', borderRadius: '11px' }}><MenuIcon /></IconButton>
              <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 300, p: 2.5, background: '#fbfcf9' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 20, fontWeight: 600 }}>finloom</Typography>
                  <IconButton aria-label="Close navigation" onClick={() => setDrawerOpen(false)}><Close /></IconButton>
                </Box>
                <List>
                  {user ? (
                    <>
                      <ListItemButton onClick={() => navigate(user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user')}><ListItemText primary="Dashboard" /></ListItemButton>
                      {user.role === 'ADMIN' && <ListItemButton onClick={() => navigate('/dashboard/admin/users')}><ListItemText primary="Manage users" /></ListItemButton>}
                      <ListItemButton onClick={handleLogout}><ListItemText primary="Sign out" /></ListItemButton>
                    </>
                  ) : (
                    <>
                      <ListItemButton onClick={() => navigate('/#pathway')}><ListItemText primary="How it works" /></ListItemButton>
                      <ListItemButton onClick={() => navigate('/#learning')}><ListItemText primary="Learning" /></ListItemButton>
                      <ListItemButton onClick={() => navigate('/about')}><ListItemText primary="About" /></ListItemButton>
                      <ListItemButton onClick={() => navigate('/trader/login')}><ListItemText primary="Log in" /></ListItemButton>
                      <Button fullWidth variant="contained" onClick={() => navigate('/trader/signup')} sx={{ mt: 2, borderRadius: '11px', background: '#174f3d' }}>Get started</Button>
                    </>
                  )}
                </List>
              </Drawer>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
