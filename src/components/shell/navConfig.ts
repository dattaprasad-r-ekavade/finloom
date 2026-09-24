import type { SvgIconComponent } from '@mui/icons-material';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import ShowChartOutlined from '@mui/icons-material/ShowChartOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import ViewListOutlined from '@mui/icons-material/ViewListOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';

export interface NavItem {
  label: string;
  href: string;
  icon: SvgIconComponent;
  /** Match only the exact path (for section roots like /dashboard/user). */
  exact?: boolean;
}

export type AppArea = 'trader' | 'admin';

/**
 * Navigation for the signed-in app. Add new sections here; AppShell renders
 * them as a side rail on desktop and a bottom bar on mobile (keep ≤ 5 items).
 */
export const appNav: Record<AppArea, NavItem[]> = {
  trader: [
    { label: 'Overview', href: '/dashboard/user', icon: DashboardOutlined, exact: true },
    { label: 'Practice', href: '/dashboard/user/trading', icon: ShowChartOutlined },
    { label: 'Challenge', href: '/dashboard/user/challenge', icon: EmojiEventsOutlined },
    { label: 'Plans', href: '/challenge-plans', icon: ViewListOutlined },
    { label: 'Identity', href: '/kyc', icon: BadgeOutlined },
  ],
  admin: [
    { label: 'Overview', href: '/dashboard/admin', icon: DashboardOutlined, exact: true },
    { label: 'Users', href: '/dashboard/admin/users', icon: PeopleOutlined },
    { label: 'KYC', href: '/dashboard/admin/kyc', icon: FactCheckOutlined },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: SettingsOutlined },
  ],
};

export const publicNav = [
  { label: 'How it works', href: '/#pathway' },
  { label: 'Learning', href: '/#learning' },
  { label: 'About', href: '/about' },
];

export function areaForPath(pathname: string): AppArea {
  return pathname.startsWith('/dashboard/admin') ? 'admin' : 'trader';
}

export function isActive(item: NavItem, pathname: string): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function dashboardPathForRole(role: string | undefined | null): string {
  return role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user';
}
