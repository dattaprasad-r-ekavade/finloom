'use client';

import Link from 'next/link';
import { Link as MuiLink, Typography } from '@mui/material';
import LoginForm from '@/components/auth/LoginForm';

export default function TraderLoginPage() {
  return (
    <LoginForm
      expectedRole="TRADER"
      eyebrow="Learner sign in"
      description="Continue your lessons and simulated practice. Simulated results have no cash value."
      footer={
        <Typography variant="body2" color="text.secondary">
          New to Finloom?{' '}
          <MuiLink component={Link} href="/trader/signup" fontWeight={600} underline="hover">
            Create an account
          </MuiLink>
        </Typography>
      }
    />
  );
}
