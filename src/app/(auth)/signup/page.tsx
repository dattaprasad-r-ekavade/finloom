'use client';

import Link from 'next/link';
import { Link as MuiLink, Typography } from '@mui/material';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <SignupForm
      footer={
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <MuiLink component={Link} href="/login" fontWeight={600} underline="hover">
            Sign in
          </MuiLink>
        </Typography>
      }
    />
  );
}
