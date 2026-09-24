'use client';

import Link from 'next/link';
import { Link as MuiLink, Typography } from '@mui/material';
import SignupForm from '@/components/auth/SignupForm';

export default function TraderSignupPage() {
  return (
    <SignupForm
      eyebrow="Learner sign up"
      nextPath="/dashboard/user"
      footer={
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <MuiLink component={Link} href="/trader/login" fontWeight={600} underline="hover">
            Sign in
          </MuiLink>
        </Typography>
      }
    />
  );
}
