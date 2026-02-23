'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
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
  compact?: boolean;
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
  small?: boolean;
}> = ({ label, value, hint, tone = 'neutral', small = false }) => {
  const color =
    tone === 'positive'
      ? 'success.main'
      : tone === 'negative'
        ? 'error.main'
        : 'text.primary';

  return (
    <Stack spacing={0}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: small ? '0.65rem' : undefined }}>
        {label}
      </Typography>
      <Typography
        variant={small ? 'body2' : 'h6'}
        sx={{ fontWeight: 600, color, lineHeight: 1.3 }}
      >
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: small ? '0.6rem' : undefined }}>
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
  compact = false,
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

  if (compact) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Account: {currencyFormatter.format(accountSize)}
              </Typography>
              <Typography
                variant="caption"
                color={portfolio?.isMarketOpen ? 'success.main' : 'text.secondary'}
                sx={{ fontWeight: 500 }}
              >
                {portfolio?.isMarketOpen ? 'Market Open' : 'Market Closed'}
              </Typography>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <StatItem
                label="Capital Available"
                value={currencyFormatter.format(Math.max(0, capitalAvailable))}
                hint={`Used: ${decimalFormatter(totalExposurePct)}%`}
                small
              />
              <StatItem
                label="Day P&L"
                value={currencyFormatter.format(realizedPnlToday + unrealizedPnl)}
                hint={`${decimalFormatter(dayPnlPct, 2)}%`}
                tone={realizedPnlToday + unrealizedPnl >= 0 ? 'positive' : 'negative'}
                small
              />
              <StatItem
                label="Realized P&L"
                value={currencyFormatter.format(realizedPnl)}
                tone={realizedPnl >= 0 ? 'positive' : 'negative'}
                small
              />
              <StatItem
                label="Open / Closed"
                value={`${openTrades} / ${closedTradesToday}`}
                small
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

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

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <StatItem
              label="Capital Used"
              value={currencyFormatter.format(capitalUsed)}
              hint={`Exposure ${decimalFormatter(totalExposurePct)}%`}
            />
            <StatItem
              label="Capital Available"
              value={currencyFormatter.format(Math.max(0, capitalAvailable))}
            />
            <StatItem
              label="Realized P&L (Total)"
              value={currencyFormatter.format(realizedPnl)}
              tone={realizedPnl >= 0 ? 'positive' : 'negative'}
            />
            <StatItem
              label="Unrealized P&L"
              value={currencyFormatter.format(unrealizedPnl)}
              tone={unrealizedPnl >= 0 ? 'positive' : 'negative'}
            />
          </Box>

          <Divider flexItem />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <StatItem
              label="P&L Today"
              value={currencyFormatter.format(realizedPnlToday + unrealizedPnl)}
              hint={`Realized: ${currencyFormatter.format(realizedPnlToday)}`}
              tone={realizedPnlToday + unrealizedPnl >= 0 ? 'positive' : 'negative'}
            />
            <StatItem
              label="Day P&L %"
              value={`${decimalFormatter(dayPnlPct, 2)}%`}
              tone={dayPnlPct >= 0 ? 'positive' : 'negative'}
            />
            <StatItem
              label="Open / Closed (Today)"
              value={`${openTrades} / ${closedTradesToday}`}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
