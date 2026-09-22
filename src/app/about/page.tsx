'use client';

import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import MenuBookRounded from '@mui/icons-material/MenuBookRounded';
import ReplayRounded from '@mui/icons-material/ReplayRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const pathway = [
  { number: '01', title: 'Build market knowledge', text: 'Study core market concepts and develop a clear understanding of instruments, orders and risk.', icon: <MenuBookRounded /> },
  { number: '02', title: 'Practise on past sessions', text: 'Use simulated orders against historical market sessions and review each decision in context.', icon: <ReplayRounded /> },
  { number: '03', title: 'Complete an assessment', text: 'Work through published stages and earn a private Finloom skills certificate if you meet the criteria.', icon: <ShieldRounded /> },
];

export default function AboutUs() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#152720', background: '#fbfcf9' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Box sx={{ py: { xs: 8, md: 12 }, background: 'radial-gradient(ellipse at 82% 12%, rgba(193,225,205,.5), transparent 32%), linear-gradient(120deg,#fbfcf9,#f0f6ef)' }}>
          <Container maxWidth="md">
            <Typography sx={{ color: '#588268', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' }}>About Finloom</Typography>
            <Typography component="h1" sx={{ mt: 2, maxWidth: 800, color: '#152720', fontFamily: 'var(--font-poppins),sans-serif', fontSize: { xs: 39, md: 60 }, fontWeight: 500, letterSpacing: '-.06em', lineHeight: 1.15 }}>
              A thoughtful way to learn, practise and show your process.
            </Typography>
            <Typography sx={{ mt: 2.5, maxWidth: 690, color: '#647169', fontSize: { xs: 15, md: 17 }, lineHeight: 1.8 }}>
              Finloom is building a market-learning and simulated-practice platform for aspiring trading professionals in India. The focus is on knowledge, historical context and risk discipline.
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
          <Box sx={{ maxWidth: 800, mb: 6 }}>
            <Typography sx={{ color: '#588268', fontSize: 10, fontWeight: 700, letterSpacing: '.16em' }}>THE LEARNING PATH</Typography>
            <Typography component="h2" sx={{ mt: 1.5, fontFamily: 'var(--font-poppins),sans-serif', fontSize: { xs: 29, md: 40 }, fontWeight: 500, letterSpacing: '-.05em' }}>Practice is useful when it teaches you something.</Typography>
            <Typography sx={{ mt: 1.5, color: '#6c7971', fontSize: 14, lineHeight: 1.8 }}>We want learners to understand both the market decision and the risk behind it—not mistake a simulated result for an investment return.</Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 2 }}>
            {pathway.map((item) => (
              <Card key={item.number} elevation={0} sx={{ border: '1px solid #e5ebe4', borderRadius: '18px', background: 'white' }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ width: 42, height: 42, display: 'grid', placeItems: 'center', border: '1px solid #e1eee3', borderRadius: '13px', color: '#3c7754', background: '#f1f7f0' }}>{item.icon}</Box>
                    <Typography sx={{ color: '#a2b3a5', fontSize: 11, fontWeight: 700 }}>{item.number}</Typography>
                  </Stack>
                  <Typography component="h3" sx={{ mt: 2.5, fontFamily: 'var(--font-poppins),sans-serif', fontSize: 17, fontWeight: 500 }}>{item.title}</Typography>
                  <Typography sx={{ mt: 1, color: '#718077', fontSize: 12, lineHeight: 1.75 }}>{item.text}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ mt: 7, p: { xs: 3, md: 4 }, borderRadius: '20px', color: 'white', background: '#103b30' }}>
            <Typography component="h2" sx={{ maxWidth: 680, fontFamily: 'var(--font-poppins),sans-serif', fontSize: { xs: 25, md: 34 }, fontWeight: 500, letterSpacing: '-.04em', lineHeight: 1.3 }}>A certificate can support an application. It cannot promise a job.</Typography>
            <Typography sx={{ mt: 2, maxWidth: 800, color: '#cfddd1', fontSize: 13, lineHeight: 1.85 }}>
              Passing all published assessment stages may earn a private Finloom skills certificate. It can be used when applying for a separate prop-desk role, subject to that firm&apos;s independent screening, interviews and hiring decision. Finloom simulated trades use no real capital, and their gains or losses are never paid out.
            </Typography>
            <Typography sx={{ mt: 1.5, color: '#9db4a3', fontSize: 11, lineHeight: 1.75 }}>
              Historical market replay is in development. A launch will depend on a suitable licensed data source and review of its permitted use. Any future educational material for NISM exams would be independent preparation; NISM exams and certificates remain separate.
            </Typography>
            <Button onClick={() => router.push('/')} endIcon={<ArrowForwardRounded />} sx={{ mt: 2, ml: -1, color: '#c0e1c8', fontWeight: 700 }}>Explore Finloom</Button>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
