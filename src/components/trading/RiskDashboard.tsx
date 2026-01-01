'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface RiskDashboardProps {
  accountSize: number;
  dailyPnl: number;
  dailyPnlPct: number;
  dailyLossLimit: number; // percentage
  maxLossLimit: number; // percentage
  cumulativePnl: number;
  openPositionsCount: number;
  maxPositions?: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const getRiskLevel = (percentage: number): {
  level: 'safe' | 'caution' | 'danger' | 'critical';
  color: string;
  icon: React.ReactNode;
} => {
  if (percentage >= 95) {
    return {
      level: 'critical',
      color: '#d32f2f',
      icon: <ErrorIcon sx={{ fontSize: 18, animation: 'pulse 1s infinite' }} />,
    };
  }
  if (percentage >= 80) {
    return {
      level: 'danger',
      color: '#f44336',
      icon: <WarningIcon sx={{ fontSize: 18 }} />,
    };
  }
  if (percentage >= 50) {
    return {
      level: 'caution',
      color: '#ff9800',
      icon: <WarningIcon sx={{ fontSize: 18 }} />,
    };
  }
  return {
    level: 'safe',
    color: '#4caf50',
    icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
  };
};

export const RiskDashboard: React.FC<RiskDashboardProps> = ({
  accountSize,
  dailyPnl,
  dailyPnlPct,
  dailyLossLimit,
  maxLossLimit,
  cumulativePnl,
  openPositionsCount,
  maxPositions = 10,
}) => {
  // Calculate usage percentages (absolute value for losses)
  const dailyLossUsage = Math.abs((dailyPnlPct / dailyLossLimit) * 100);
  const maxLossUsage = Math.abs((cumulativePnl / accountSize / maxLossLimit) * 100);
  const positionsUsage = (openPositionsCount / maxPositions) * 100;

  const dailyRisk = getRiskLevel(dailyLossUsage);
  const maxRisk = getRiskLevel(maxLossUsage);

  const dailyLossAmount = (accountSize * dailyLossLimit) / 100;
  const maxLossAmount = (accountSize * maxLossLimit) / 100;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.9)'
            : 'rgba(30, 30, 30, 0.9)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Risk Monitor
          </Typography>
          <Chip
            size="small"
            label={dailyRisk.level.toUpperCase()}
            sx={{
              backgroundColor: dailyRisk.color,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </Stack>

        {/* Daily P&L */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {dailyRisk.icon}
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                Daily P&L
              </Typography>
            </Stack>
            <Tooltip title={`Limit: ${formatCurrency(dailyLossAmount)}`}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: dailyPnl >= 0 ? 'success.main' : dailyRisk.color,
                }}
              >
                {formatCurrency(dailyPnl)} / {formatCurrency(dailyLossAmount)}
              </Typography>
            </Tooltip>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(dailyLossUsage, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: dailyRisk.color,
                borderRadius: 4,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {dailyLossUsage.toFixed(1)}% of daily limit used
          </Typography>
        </Box>

        {/* Max Drawdown */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {maxRisk.icon}
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                Max Drawdown
              </Typography>
            </Stack>
            <Tooltip title={`Limit: ${formatCurrency(maxLossAmount)}`}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: cumulativePnl >= 0 ? 'success.main' : maxRisk.color,
                }}
              >
                {formatCurrency(cumulativePnl)} / {formatCurrency(maxLossAmount)}
              </Typography>
            </Tooltip>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(maxLossUsage, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: maxRisk.color,
                borderRadius: 4,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {maxLossUsage.toFixed(1)}% of max loss used
          </Typography>
        </Box>

        {/* Open Positions */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Open Positions
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {openPositionsCount} / {maxPositions}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={positionsUsage}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#2196f3',
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Warning if approaching limits */}
        {(dailyLossUsage >= 80 || maxLossUsage >= 80) && (
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: 'error.light',
              border: '1px solid',
              borderColor: 'error.main',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.dark' }}>
              ⚠️ WARNING: Approaching risk limits!
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default RiskDashboard;
