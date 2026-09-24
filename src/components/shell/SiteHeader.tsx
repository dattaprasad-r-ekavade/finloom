'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
} from '@mui/material';
import ArrowOutward from '@mui/icons-material/ArrowOutward';
import Close from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuthStore } from '@/store/authStore';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { dashboardPathForRole, publicNav } from './navConfig';

/** Header for public pages (marketing, legal, auth). Signed-in app pages use AppShell. */
export default function SiteHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push('/');
  };

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Logo />
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {!user &&
              publicNav.map((item) => (
                <Button key={item.href} component={Link} href={item.href} color="inherit" sx={{ color: 'text.secondary' }}>
                  {item.label}
                </Button>
              ))}
            <ThemeToggle />
            {user ? (
              <>
                <Button component={Link} href={dashboardPathForRole(user.role)} variant="contained">
                  Go to dashboard
                </Button>
                <Button color="inherit" onClick={handleLogout} sx={{ color: 'text.secondary' }}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} href="/login" color="inherit" sx={{ color: 'text.secondary' }}>
                  Log in
                </Button>
                <Button component={Link} href="/trader/signup" variant="contained" endIcon={<ArrowOutward />}>
                  Get started
                </Button>
              </>
            )}
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <ThemeToggle />
            <IconButton aria-label="Open navigation" onClick={() => setOpen(true)} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: 300, p: 2 } } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Logo size="sm" />
          <IconButton aria-label="Close navigation" onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </Stack>
        <List onClick={() => setOpen(false)}>
          {publicNav.map((item) => (
            <ListItemButton key={item.href} component={Link} href={item.href}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ my: 1 }} />
        {user ? (
          <Stack spacing={1}>
            <Button component={Link} href={dashboardPathForRole(user.role)} variant="contained" onClick={() => setOpen(false)}>
              Go to dashboard
            </Button>
            <Button variant="outlined" onClick={handleLogout}>
              Sign out
            </Button>
          </Stack>
        ) : (
          <Stack spacing={1}>
            <Button component={Link} href="/trader/signup" variant="contained" onClick={() => setOpen(false)}>
              Get started
            </Button>
            <Button component={Link} href="/login" variant="outlined" onClick={() => setOpen(false)}>
              Log in
            </Button>
          </Stack>
        )}
      </Drawer>
    </AppBar>
  );
}
