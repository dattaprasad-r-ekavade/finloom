import type { ReactNode } from 'react';
import { Container, Paper, Typography } from '@mui/material';

interface ContentPageProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** e.g. "Preview notice · September 23, 2026" */
  meta?: ReactNode;
  children: ReactNode;
}

/** Readable single-column page for legal, policy and informational content. */
export default function ContentPage({ eyebrow, title, meta, children }: ContentPageProps) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
        {eyebrow && (
          <Typography variant="overline" color="primary" component="p">
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '1.9rem', md: '2.3rem' } }}>
          {title}
        </Typography>
        {meta && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {meta}
          </Typography>
        )}
        {children}
      </Paper>
    </Container>
  );
}
