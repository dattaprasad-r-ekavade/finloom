'use client';

import Link from 'next/link';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import MenuBookRounded from '@mui/icons-material/MenuBookRounded';
import ReplayRounded from '@mui/icons-material/ReplayRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';

const pathway = [
  { number: '01', title: 'Build market knowledge', text: 'Study core market concepts and develop a clear understanding of instruments, orders and risk.', icon: <MenuBookRounded /> },
  { number: '02', title: 'Practise on past sessions', text: 'Use simulated orders against historical market sessions and review each decision in context.', icon: <ReplayRounded /> },
  { number: '03', title: 'Complete an assessment', text: 'Work through published stages and earn a private Finloom skills certificate if you meet the criteria.', icon: <ShieldRounded /> },
];

const displayHeading = { fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-.05em' };

export default function AboutUs() {
  return (
    <>
      <Box sx={{ py: { xs: 8, md: 12 }, background: 'radial-gradient(ellipse at 82% 12%, color-mix(in srgb, var(--fl-brand-muted) 45%, transparent), transparent 40%)' }}>
        <Container maxWidth="md">
          <Typography variant="overline" color="primary" component="p">About Finloom</Typography>
          <Typography component="h1" sx={{ ...displayHeading, mt: 2, maxWidth: 800, fontSize: { xs: 39, md: 60 }, lineHeight: 1.15 }}>
            A thoughtful way to learn, practise and show your process.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2.5, maxWidth: 690, fontSize: { xs: 15, md: 17 }, lineHeight: 1.8 }}>
            Finloom is building a market-learning and simulated-practice platform for aspiring trading professionals in India. The focus is on knowledge, historical context and risk discipline.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Box sx={{ maxWidth: 800, mb: 6 }}>
          <Typography variant="overline" color="primary" component="p">The learning path</Typography>
          <Typography component="h2" sx={{ ...displayHeading, mt: 1.5, fontSize: { xs: 29, md: 40 } }}>Practice is useful when it teaches you something.</Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: 15, lineHeight: 1.8 }}>We want learners to understand both the market decision and the risk behind it—not mistake a simulated result for an investment return.</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 2 }}>
          {pathway.map((item) => (
            <Card key={item.number}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 3, color: 'brand.onSubtle', bgcolor: 'brand.subtle' }}>{item.icon}</Box>
                  <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 700 }}>{item.number}</Typography>
                </Stack>
                <Typography component="h3" sx={{ ...displayHeading, mt: 2.5, fontSize: 18, letterSpacing: '-.03em' }}>{item.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, fontSize: 14, lineHeight: 1.7 }}>{item.text}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ mt: 7, p: { xs: 3, md: 4 }, borderRadius: 5, color: 'inverse.text', bgcolor: 'inverse.bgDeep' }}>
          <Typography component="h2" sx={{ ...displayHeading, maxWidth: 680, fontSize: { xs: 25, md: 34 }, letterSpacing: '-.04em', lineHeight: 1.3 }}>A certificate can support an application. It cannot promise a job.</Typography>
          <Typography sx={{ mt: 2, maxWidth: 800, opacity: 0.85, fontSize: 15, lineHeight: 1.8 }}>
            Passing all published assessment stages may earn a private Finloom skills certificate. It can be used when applying for a separate prop-desk role, subject to that firm&apos;s independent screening, interviews and hiring decision. Finloom simulated trades use no real capital, and their gains or losses are never paid out.
          </Typography>
          <Typography sx={{ mt: 1.5, color: 'inverse.textMuted', fontSize: 12, lineHeight: 1.75 }}>
            Historical market replay is in development. A launch will depend on a suitable licensed data source and review of its permitted use. Any future educational material for NISM exams would be independent preparation; NISM exams and certificates remain separate.
          </Typography>
          <Button component={Link} href="/" endIcon={<ArrowForwardRounded />} sx={{ mt: 2, ml: -1, color: 'inverse.accent' }}>Explore Finloom</Button>
        </Box>
      </Container>
    </>
  );
}
