'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

interface PortfolioSnapshot {
  capitalUsed: number;
  capitalAvailable: number;
  unrealizedPnl: number;
  realizedPnl: number;
  isMarketOpen: boolean;
}

interface MetricsSnapshot {
  openTradesCount: number;
  closedTradesToday: number;
  realizedPnlToday: number;
  dayPnlPct: number;
}

interface SummarySnapshot {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  realizedPnl: number;
  unrealizedPnl: number;
  capitalUsed: number;
  capitalAvailable: number;
  dayPnlPct: number;
}

interface ChallengeStatsCardProps {
  accountSize: number;
  portfolio: PortfolioSnapshot | null;
  metrics: MetricsSnapshot | null;
  summary: SummarySnapshot | null;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const decimalFormatter = (value: number, fractionDigits = 2) =>
  Number(value).toFixed(fractionDigits);

const StatItem: React.FC<{
  label: string;
  value: string;
  hint?: string;
  tone?: 'positive' | 'negative' | 'neutral';
}> = ({ label, value, hint, tone = 'neutral' }) => {
  const color =
    tone === 'positive'
      ? 'success.main'
      : tone === 'negative'
        ? 'error.main'
        : 'text.primary';

  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600, color }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Stack>
  );
};

export const ChallengeStatsCard: React.FC<ChallengeStatsCardProps> = ({
  accountSize,
  portfolio,
  metrics,
  summary,
}) => {
  const capitalUsed =
    portfolio?.capitalUsed ?? summary?.capitalUsed ?? 0;
  const capitalAvailable =
    portfolio?.capitalAvailable ?? summary?.capitalAvailable ?? 0;
  const unrealizedPnl =
    portfolio?.unrealizedPnl ?? summary?.unrealizedPnl ?? 0;
  const realizedPnl = portfolio?.realizedPnl ?? summary?.realizedPnl ?? 0;

  const dayPnlPct =
    metrics?.dayPnlPct ?? summary?.dayPnlPct ?? 0;
  const realizedPnlToday = metrics?.realizedPnlToday ?? summary?.realizedPnl ?? 0;
  const openTrades =
    metrics?.openTradesCount ?? summary?.openTrades ?? 0;
  const closedTradesToday =
    metrics?.closedTradesToday ?? summary?.closedTrades ?? 0;

  const totalExposurePct =
    accountSize > 0 ? (capitalUsed / accountSize) * 100 : 0;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        height: '100%',
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Challenge Snapshot
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Account size:{' '}
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {currencyFormatter.format(accountSize)}
                </Box>
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color={portfolio?.isMarketOpen ? 'success.main' : 'text.secondary'}
            >
              {portfolio?.isMarketOpen ? 'Market Open' : 'Market Closed'}
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StatItem
                label="Capital Used"
                value={currencyFormatter.format(capitalUsed)}
                hint={`Exposure ${decimalFormatter(totalExposurePct)}%`}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatItem
                label="Capital Available"
                value={currencyFormatter.format(Math.max(0, capitalAvailable))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatItem
                label="Realized P&L (Total)"
                value={currencyFormatter.format(realizedPnl)}
                tone={realizedPnl >= 0 ? 'positive' : 'negative'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatItem
                label="Unrealized P&L"
                value={currencyFormatter.format(unrealizedPnl)}
                tone={unrealizedPnl >= 0 ? 'positive' : 'negative'}
              />
            </Grid>
          </Grid>

          <Divider flexItem />

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <StatItem
                label="P&L Today"
                value={currencyFormatter.format(realizedPnlToday + unrealizedPnl)}
                hint={`Realized: ${currencyFormatter.format(realizedPnlToday)}`}
                tone={realizedPnlToday + unrealizedPnl >= 0 ? 'positive' : 'negative'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatItem
                label="Day P&L %"
                value={`${decimalFormatter(dayPnlPct, 2)}%`}
                tone={dayPnlPct >= 0 ? 'positive' : 'negative'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatItem
                label="Open / Closed (Today)"
                value={`${openTrades} / ${closedTradesToday}`}
              />
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};
