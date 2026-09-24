'use client';

import { useState } from 'react';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { AppPage } from '@/components/shell/AppShell';
import { PageHeader, SectionCard } from '@/components/ui';

export default function FeedbackPage() {
  const [rating, setRating] = useState(3);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit() {
    setSaving(true);
    try {
      const response = await fetch('/api/pilot-feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, message }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to save feedback');
      setStatus('Thank you. Your feedback was saved.');
      setMessage('');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to save feedback'); }
    finally { setSaving(false); }
  }
  return <AppPage>
    <PageHeader title="Pilot feedback" description="Tell us what was confusing or useful during practice." />
    <SectionCard>
      <Stack spacing={2} sx={{ maxWidth: 600 }}>
        <Typography variant="body2" color="text.secondary">Do not include identity or payment details in your feedback.</Typography>
        <TextField select label="How useful was this session?" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
          {[1, 2, 3, 4, 5].map((value) => <MenuItem key={value} value={value}>{value} / 5</MenuItem>)}
        </TextField>
        <TextField multiline minRows={4} label="What should we improve?" value={message}
          onChange={(event) => setMessage(event.target.value)} inputProps={{ maxLength: 2000 }} />
        {status && <Alert severity={status.startsWith('Thank') ? 'success' : 'error'}>{status}</Alert>}
        <Button variant="contained" disabled={saving || message.trim().length < 5} onClick={submit}>Send feedback</Button>
      </Stack>
    </SectionCard>
  </AppPage>;
}
