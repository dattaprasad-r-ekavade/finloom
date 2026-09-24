import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import SiteHeader from '@/components/shell/SiteHeader';
import Footer from '@/components/shell/Footer';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <SiteHeader />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
