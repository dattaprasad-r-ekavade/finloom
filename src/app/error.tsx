'use client';

import { useEffect } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import Home from '@mui/icons-material/Home';
import Refresh from '@mui/icons-material/Refresh';
import SiteHeader from '@/components/shell/SiteHeader';
import { StatusScreen } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <SiteHeader />
      <StatusScreen
        code="500"
        title="Something went wrong"
        description="An unexpected error occurred. Please try again or return to the home page."
        actions={
          <>
            <Button variant="contained" size="large" startIcon={<Refresh />} onClick={reset}>
              Try again
            </Button>
            {/* Full reload: the error may have left client state unusable. */}
            <Button component="a" href="/" variant="outlined" size="large" startIcon={<Home />}>
              Go home
            </Button>
          </>
        }
      >
        {process.env.NODE_ENV === 'development' && error.message && (
          <Alert severity="error" sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {error.message}
            </Typography>
          </Alert>
        )}
      </StatusScreen>
    </Box>
  );
}
