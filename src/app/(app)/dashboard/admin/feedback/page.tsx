'use client';

import { useEffect, useState } from 'react';
import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import { AppPage } from '@/components/shell/AppShell';
import { PageHeader, SectionCard } from '@/components/ui';

interface Feedback { id: string; rating: number; message: string; createdAt: string; user: { name: string | null; email: string } }

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/pilot-feedback').then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to load feedback');
      setFeedback(result.data.feedback);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load feedback'))
      .finally(() => setLoading(false));
  }, []);
  return <AppPage>
    <PageHeader title="Pilot feedback" description="Recent observations from invited testers." />
    {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> :
      feedback.length === 0 ? <Alert severity="info">No feedback yet.</Alert> :
      <Stack spacing={2}>{feedback.map((item) => <SectionCard key={item.id}>
        <Typography variant="subtitle2">{item.user.name || item.user.email} · {item.rating}/5</Typography>
        <Typography variant="caption" color="text.secondary">{new Date(item.createdAt).toLocaleString('en-IN')}</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{item.message}</Typography>
      </SectionCard>)}</Stack>}
  </AppPage>;
}
