'use client';

import Link from 'next/link';
import { Link as MuiLink, Typography } from '@mui/material';
import LoginForm from '@/components/auth/LoginForm';

export default function AdminLoginPage() {
  return (
    <LoginForm
      expectedRole="ADMIN"
      eyebrow="Admin sign in"
      title="Finloom administration"
      description="Manage learners, identity reviews and platform settings."
      footer={
        process.env.NODE_ENV !== 'production' ? (
          <Typography variant="body2" color="text.secondary">
            Local development?{' '}
            <MuiLink component={Link} href="/admin/local-credentials" fontWeight={600} underline="hover">
              Edit local admin credentials
            </MuiLink>
          </Typography>
        ) : undefined
      }
    />
  );
}
