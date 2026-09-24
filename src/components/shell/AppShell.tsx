'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { useAuthStore } from '@/store/authStore';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { appNav, areaForPath, isActive } from './navConfig';

const RAIL_WIDTH = 232;
const TOPBAR_HEIGHT = 64;
const BOTTOM_NAV_HEIGHT = 64;

/**
 * Shell for every signed-in page (learner and admin). It shares the logo,
 * typography and tokens with the marketing header so the app and the site
 * read as one product.
 * - md and up: fixed side rail.
 * - xs–sm: top bar plus bottom navigation.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const logout = useAuthStore((state) => state.logout);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);

  const area = areaForPath(pathname);
  const items = appNav[area];
  const activeIndex = items.findIndex((item) => isActive(item, pathname));

  useEffect(() => {
    if (!user) void checkAuth();
  }, [user, checkAuth]);

  const handleLogout = async () => {
    setAccountAnchor(null);
    await logout();
    router.push('/');
  };

  const initials = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ minHeight: TOPBAR_HEIGHT, gap: 1.5, px: { xs: 2, md: 3 } }}>
          <Logo href={area === 'admin' ? '/dashboard/admin' : '/dashboard/user'} />
          <Chip size="small" label={area === 'admin' ? 'Admin' : 'Learner'} sx={{ bgcolor: 'brand.subtle', color: 'brand.onSubtle' }} />
          <Box sx={{ flexGrow: 1 }} />
          <ThemeToggle />
          <Tooltip title="Account">
            <IconButton aria-label="Account menu" onClick={(e) => setAccountAnchor(e.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'brand.muted', color: 'brand.onSubtle' }}>{initials}</Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={accountAnchor}
            open={Boolean(accountAnchor)}
            onClose={() => setAccountAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {user && (
              <Box sx={{ px: 2, py: 1, maxWidth: 260 }}>
                <Typography variant="body2" fontWeight={600} noWrap>{user.name || 'Signed in'}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap component="p">{user.email}</Typography>
              </Box>
            )}
            <Divider />
            <MenuItem component={Link} href="/" onClick={() => setAccountAnchor(null)}>
              <ListItemIcon><OpenInNew fontSize="small" /></ListItemIcon>
              Public site
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Box
          component="nav"
          aria-label={area === 'admin' ? 'Admin navigation' : 'Learner navigation'}
          sx={{
            display: { xs: 'none', md: 'block' },
            width: RAIL_WIDTH,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: 'sticky',
            top: TOPBAR_HEIGHT,
            height: `calc(100dvh - ${TOPBAR_HEIGHT}px)`,
            overflowY: 'auto',
          }}
        >
          <List
            subheader={
              <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '40px', typography: 'overline', color: 'text.secondary' }}>
                {area === 'admin' ? 'Administration' : 'Your workspace'}
              </ListSubheader>
            }
            sx={{ px: 1.5, py: 2 }}
          >
            {items.map((item, index) => {
              const Icon = item.icon;
              const selected = index === activeIndex;
              return (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  selected={selected}
                  aria-current={selected ? 'page' : undefined}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    color: 'text.secondary',
                    '&.Mui-selected': { bgcolor: 'brand.subtle', color: 'brand.onSubtle' },
                    '&.Mui-selected:hover': { bgcolor: 'brand.subtle' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={item.label} slotProps={{ primary: { fontWeight: selected ? 600 : 500, fontSize: 14 } }} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            pb: { xs: `${BOTTOM_NAV_HEIGHT + 8}px`, md: 0 },
          }}
        >
          {children}
        </Box>
      </Box>

      <Paper
        component="nav"
        aria-label="Primary"
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          borderTop: 1,
          borderColor: 'divider',
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <BottomNavigation showLabels value={activeIndex === -1 ? false : activeIndex} sx={{ height: BOTTOM_NAV_HEIGHT, bgcolor: 'background.paper' }}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <BottomNavigationAction
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                icon={<Icon />}
                sx={{ minWidth: 0, '&.Mui-selected': { color: 'primary.main' } }}
              />
            );
          })}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

/** Standard page body inside AppShell: consistent padding and max width. */
export function AppPage({ children, maxWidth = 1280 }: { children: ReactNode; maxWidth?: number | 'none' }) {
  return (
    <Stack spacing={3} sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, md: 4 }, mx: 'auto', width: '100%', maxWidth: maxWidth === 'none' ? 'none' : maxWidth }}>
      {children}
    </Stack>
  );
}
