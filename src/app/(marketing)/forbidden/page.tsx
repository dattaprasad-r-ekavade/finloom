'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Home from '@mui/icons-material/Home';
import { StatusScreen } from '@/components/ui';

export default function ForbiddenPage() {
  const router = useRouter();
  return (
    <StatusScreen
      code="403"
      title="You don't have access to this page"
      description="Your account doesn't have permission for this area. If you think this is a mistake, sign in with a different account."
      actions={
        <>
          <Button component={Link} href="/" variant="contained" size="large" startIcon={<Home />}>
            Go home
          </Button>
          <Button variant="outlined" size="large" startIcon={<ArrowBack />} onClick={() => router.back()}>
            Go back
          </Button>
        </>
      }
    />
  );
}
