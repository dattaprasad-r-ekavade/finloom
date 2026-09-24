'use client';

import { IconButton, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlined from '@mui/icons-material/SettingsBrightnessOutlined';

const order = ['system', 'light', 'dark'] as const;
type Mode = (typeof order)[number];

const labels: Record<Mode, string> = {
  system: 'Theme: follows system',
  light: 'Theme: light',
  dark: 'Theme: dark',
};

/** Cycles system → light → dark. Mode is persisted by MUI in localStorage. */
export default function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  // `mode` is undefined until mounted; render a stable placeholder icon.
  const current: Mode = (mode as Mode | undefined) ?? 'system';
  const next = order[(order.indexOf(current) + 1) % order.length];
  const Icon = current === 'dark' ? DarkModeOutlined : current === 'light' ? LightModeOutlined : SettingsBrightnessOutlined;

  return (
    <Tooltip title={`${labels[current]} (switch to ${next})`}>
      <IconButton aria-label={labels[current]} onClick={() => setMode(next)} size="small" sx={{ color: 'text.secondary' }}>
        <Icon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
