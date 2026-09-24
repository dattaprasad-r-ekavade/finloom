import type { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import SiteHeader from '@/components/shell/SiteHeader';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <SiteHeader />
      <Container component="main" maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: { xs: 4, md: 8 } }}>
        <Box sx={{ width: '100%' }}>{children}</Box>
      </Container>
    </Box>
  );
}
