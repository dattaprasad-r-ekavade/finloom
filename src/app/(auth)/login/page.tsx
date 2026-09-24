'use client';

import Link from 'next/link';
import { Link as MuiLink, Typography } from '@mui/material';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <LoginForm
      footer={
        <Typography variant="body2" color="text.secondary">
          New to Finloom?{' '}
          <MuiLink component={Link} href="/signup" fontWeight={600} underline="hover">
            Create an account
          </MuiLink>
        </Typography>
      }
    />
  );
}
