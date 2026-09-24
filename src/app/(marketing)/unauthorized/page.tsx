'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import Home from '@mui/icons-material/Home';
import Login from '@mui/icons-material/Login';
import { StatusScreen } from '@/components/ui';

export default function UnauthorizedPage() {
  return (
    <StatusScreen
      code="401"
      title="Please sign in"
      description="You need to be signed in to view this page."
      actions={
        <>
          <Button component={Link} href="/login" variant="contained" size="large" startIcon={<Login />}>
            Sign in
          </Button>
          <Button component={Link} href="/" variant="outlined" size="large" startIcon={<Home />}>
            Go home
          </Button>
        </>
      }
    />
  );
}
