'use client';

import Link from 'next/link';
import { Box, Button } from '@mui/material';
import Home from '@mui/icons-material/Home';
import SiteHeader from '@/components/shell/SiteHeader';
import { StatusScreen } from '@/components/ui';

export default function NotFound() {
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <SiteHeader />
      <StatusScreen
        code="404"
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        actions={
          <Button component={Link} href="/" variant="contained" size="large" startIcon={<Home />}>
            Go home
          </Button>
        }
      />
    </Box>
  );
}
