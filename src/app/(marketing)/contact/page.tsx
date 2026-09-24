'use client';

import Link from 'next/link';
import { Alert, Button, Typography } from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import { ContentPage } from '@/components/ui';

export default function ContactUs() {
  return (
    <ContentPage eyebrow="Finloom preview" title="Contact and support">
      <Alert severity="info" sx={{ mt: 3 }}>
        This review deployment does not yet have a verified support address, staffed help desk or registered-business contact details. We will publish working contact channels before inviting paid learners.
      </Alert>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
        If you are reviewing Finloom, you can explore the learning pathway and planned practice experience. Checkout is disabled; do not send identity or payment information through this preview.
      </Typography>
      <Button component={Link} href="/" startIcon={<ArrowBackRounded />} sx={{ mt: 2, ml: -1 }}>
        Back to Finloom
      </Button>
    </ContentPage>
  );
}
