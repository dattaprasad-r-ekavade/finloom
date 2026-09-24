'use client';

import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import AutoGraphRounded from '@mui/icons-material/AutoGraphRounded';
import MenuBookRounded from '@mui/icons-material/MenuBookRounded';
import ReplayRounded from '@mui/icons-material/ReplayRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import { Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';

const steps = [
  {
    number: '01',
    title: 'Learn the foundations',
    description: 'Build your understanding of securities markets, derivatives and risk, one clear lesson at a time.',
    icon: <MenuBookRounded />,
  },
  {
    number: '02',
    title: 'Practise with context',
    description: 'Work through past market sessions with simulated orders, then review what happened and why.',
    icon: <ReplayRounded />,
  },
  {
    number: '03',
    title: 'Show your process',
    description: 'Complete a published skills assessment and earn a Finloom certificate if you meet its criteria.',
    icon: <ShieldRounded />,
  },
];

function ReplayPreview() {
  return (
    <Box className="replay-preview" aria-label="Illustrative preview of a historical replay chart">
      <Box className="replay-preview__top">
        <Stack direction="row" spacing={1} alignItems="center">
          <Box className="replay-preview__mark"><AutoGraphRounded fontSize="small" /></Box>
          <Box>
            <Typography className="replay-preview__eyebrow">FINLOOM PRACTICE</Typography>
            <Typography className="replay-preview__title">A session, played back</Typography>
          </Box>
        </Stack>
        <Chip label="PRODUCT PREVIEW" size="small" className="replay-preview__chip" />
      </Box>

      <Box className="replay-preview__instrument">
        <Box>
          <Typography className="replay-preview__symbol">Market replay</Typography>
          <Typography className="replay-preview__sub">Illustrative chart · no live prices</Typography>
        </Box>
        <Typography className="replay-preview__period">PAST SESSION</Typography>
      </Box>

      <Box className="replay-chart" aria-hidden="true">
        <Box className="replay-chart__grid replay-chart__grid--one" />
        <Box className="replay-chart__grid replay-chart__grid--two" />
        <Box className="replay-chart__grid replay-chart__grid--three" />
        <svg viewBox="0 0 600 220" preserveAspectRatio="none" className="replay-chart__svg">
          <defs>
            <linearGradient id="replayArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" className="replay-chart__area-start" />
              <stop offset="100%" className="replay-chart__area-end" />
            </linearGradient>
          </defs>
          <path d="M0 171 C30 160 39 178 67 157 S103 142 122 155 S155 166 176 126 S208 112 229 130 S261 149 281 116 S315 94 340 106 S366 123 388 94 S416 77 435 90 S464 78 483 60 S520 78 540 48 S575 41 600 28 L600 220 L0 220 Z" fill="url(#replayArea)" />
          <path d="M0 171 C30 160 39 178 67 157 S103 142 122 155 S155 166 176 126 S208 112 229 130 S261 149 281 116 S315 94 340 106 S366 123 388 94 S416 77 435 90 S464 78 483 60 S520 78 540 48 S575 41 600 28" fill="none" className="replay-chart__line" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <circle cx="600" cy="28" r="5" className="replay-chart__dot" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
        <Box className="replay-chart__labels"><span>09:30</span><span>11:00</span><span>12:30</span><span>14:00</span><span>15:30</span></Box>
      </Box>

      <Box className="replay-preview__controls">
        <Box className="replay-preview__play"><ReplayRounded fontSize="small" /></Box>
        <Box className="replay-preview__timeline"><Box /></Box>
        <Typography className="replay-preview__time">Preview</Typography>
      </Box>
      <Typography className="replay-preview__note">Historical replay is in development. Licensed data access and release terms are being finalized.</Typography>
    </Box>
  );
}

export default function Home() {
  return (
    <Box>
      <Box>
        <Box className="home-hero">
          <Container maxWidth="xl" className="home-hero__container">
            <Box className="home-hero__copy">
              <Chip label="A clearer path into trading work" className="home-eyebrow" />
              <Typography component="h1" className="home-hero__heading">
                Learn the market.<br />
                <span>Practise with purpose.</span>
              </Typography>
              <Typography className="home-hero__body">
                Build your knowledge, practise decisions on historical sessions, and show how you manage risk. Finloom is creating a more thoughtful route for aspiring trading professionals.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className="home-hero__actions">
                <Button variant="contained" component={Link} href="/trader/signup" endIcon={<ArrowForwardRounded />}>
                  Get started
                </Button>
                <Button variant="outlined" component={Link} href="#pathway">
                  See how it works
                </Button>
              </Stack>
              <Box className="home-hero__proof">
                <Box className="home-hero__proof-dot" />
                <Typography>Virtual practice · Clear assessment rules · No simulated profit payouts</Typography>
              </Box>
            </Box>
            <ReplayPreview />
          </Container>
        </Box>

        <Box className="home-intro-strip">
          <Container maxWidth="xl" className="home-intro-strip__inner">
            <Typography className="home-intro-strip__label">A PRACTICAL LEARNING PATH</Typography>
            <Typography className="home-intro-strip__text">Knowledge first. Practice with context. Decisions you can explain.</Typography>
          </Container>
        </Box>

        <Box component="section" id="pathway" className="pathway-section">
          <Container maxWidth="xl">
            <Box className="section-heading">
              <Typography className="section-kicker">HOW FINLOOM WORKS</Typography>
              <Typography component="h2" className="section-title">Turn curiosity into capability.</Typography>
              <Typography className="section-description">A structured way to study, practise and demonstrate your process—without treating virtual profits as real returns.</Typography>
            </Box>

            <Box className="pathway-grid">
              {steps.map((step) => (
                <Card className="pathway-card" key={step.number}>
                  <CardContent className="pathway-card__content">
                    <Box className="pathway-card__top">
                      <Box className="pathway-card__icon">{step.icon}</Box>
                      <Typography className="pathway-card__number">{step.number}</Typography>
                    </Box>
                    <Typography component="h3" className="pathway-card__title">{step.title}</Typography>
                    <Typography className="pathway-card__description">{step.description}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Container>
        </Box>

        <Box component="section" id="learning" className="learning-section">
          <Container maxWidth="xl" className="learning-section__inner">
            <Box className="learning-section__copy">
              <Typography className="section-kicker">LEARN AT YOUR OWN PACE</Typography>
              <Typography component="h2" className="section-title">Solid foundations make better practice.</Typography>
              <Typography className="section-description">Finloom is exploring independent preparation for NISM examinations, starting with securities-market fundamentals and equity derivatives.</Typography>
              <Stack spacing={1.5} className="learning-points">
                <Typography><span>01</span> Original explanations and worked examples</Typography>
                <Typography><span>02</span> Topic quizzes with clear answer reviews</Typography>
                <Typography><span>03</span> Practice lessons that connect concepts to risk</Typography>
              </Stack>
              <Typography className="learning-disclosure">Independent preparation only. NISM examinations and certificates are separate; Finloom is not an NISM-authorized training partner.</Typography>
            </Box>
            <Box className="learning-note">
              <Box className="learning-note__icon"><MenuBookRounded /></Box>
              <Typography className="learning-note__tag">START WITH THE BASICS</Typography>
              <Typography className="learning-note__title">Understand the rules before you place a trade.</Typography>
              <Typography className="learning-note__body">Markets, instruments, orders and risk—explained in language you can use.</Typography>
              <Chip label="Learning library in development" className="learning-note__chip" />
            </Box>
          </Container>
        </Box>

        <Box component="section" className="certificate-section">
          <Container maxWidth="xl" className="certificate-section__inner">
            <Box>
              <Typography className="section-kicker section-kicker--light">A CLEAR, HONEST OUTCOME</Typography>
              <Typography component="h2" className="certificate-section__title">A Finloom certificate is a step toward applying—not a promise of a job.</Typography>
            </Box>
            <Box className="certificate-section__detail">
              <Typography>Pass all published assessment stages and earn a private Finloom skills certificate. Eligible candidates may then apply for relevant prop-desk roles, with separate screening and interviews.</Typography>
              <Typography className="certificate-section__disclosure">Simulated trades have no cash value. No simulated profits are paid. Hiring depends on role requirements, vacancies and the selection process.</Typography>
              <Button className="certificate-section__link" component={Link} href="/about" endIcon={<ArrowForwardRounded />}>Read about the pathway</Button>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
