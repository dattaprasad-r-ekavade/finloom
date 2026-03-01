'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Divider,
  Alert,
} from '@mui/material';

interface AdvancedMetricsProps {
  trades: Array<{
    id: string;
    tradeType: 'BUY' | 'SELL';
    entryPrice: number;
    exitPrice: number | null;
    quantity: number;
    createdAt: string;
  }>;
  accountSize: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const calculateMetrics = (trades: AdvancedMetricsProps['trades']) => {
  const closedTrades = trades.filter((t) => t.exitPrice !== null);
  
  if (closedTrades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      bestTrade: 0,
      worstTrade: 0,
      profitFactor: 0,
      expectancy: 0,
      sharpeRatio: 0,
      avgHoldingTime: 0,
    };
  }

  let totalProfit = 0;
  let totalLoss = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let bestTrade = 0;
  let worstTrade = 0;
  const pnls: number[] = [];
  const holdingTimes: number[] = [];

  closedTrades.forEach((trade) => {
    const pnl =
      trade.tradeType === 'BUY'
        ? (trade.exitPrice! - trade.entryPrice) * trade.quantity
        : (trade.entryPrice - trade.exitPrice!) * trade.quantity;

    pnls.push(pnl);

    if (pnl > 0) {
      totalProfit += pnl;
      winningTrades++;
      bestTrade = Math.max(bestTrade, pnl);
    } else {
      totalLoss += Math.abs(pnl);
      losingTrades++;
      worstTrade = Math.min(worstTrade, pnl);
    }

    const entryTime = new Date(trade.createdAt).getTime();
    const exitTime = new Date().getTime();
    const holdingTime = (exitTime - entryTime) / (1000 * 60);
    holdingTimes.push(holdingTime);
  });

  const winRate = (winningTrades / closedTrades.length) * 100;
  const avgWin = winningTrades > 0 ? totalProfit / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? totalLoss / losingTrades : 0;
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;

  const avgReturn = pnls.reduce((sum, pnl) => sum + pnl, 0) / pnls.length;
  const variance =
    pnls.reduce((sum, pnl) => sum + Math.pow(pnl - avgReturn, 2), 0) / pnls.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  const avgHoldingTime =
    holdingTimes.length > 0
      ? holdingTimes.reduce((sum, time) => sum + time, 0) / holdingTimes.length
      : 0;

  return {
    totalTrades: closedTrades.length,
    winningTrades,
    losingTrades,
    winRate,
    avgWin,
    avgLoss,
    bestTrade,
    worstTrade,
    profitFactor,
    expectancy,
    sharpeRatio,
    avgHoldingTime,
  };
};

export const AdvancedPerformanceMetrics: React.FC<AdvancedMetricsProps> = ({
  trades,
}) => {
  const metrics = calculateMetrics(trades);

  const MetricItem: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }> = ({ title, value, subtitle, color = 'text.primary' }) => (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600, color }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Advanced Performance Metrics
        </Typography>

        <Stack spacing={3}>
          {/* Win/Loss Stats */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Win/Loss Statistics
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <MetricItem title="Total Trades" value={metrics.totalTrades} />
              <MetricItem
                title="Win Rate"
                value={`${metrics.winRate.toFixed(1)}%`}
                color={metrics.winRate >= 50 ? 'success.main' : 'error.main'}
              />
              <MetricItem
                title="Winning Trades"
                value={metrics.winningTrades}
                subtitle={`Avg: ${formatCurrency(metrics.avgWin)}`}
                color="success.main"
              />
              <MetricItem
                title="Losing Trades"
                value={metrics.losingTrades}
                subtitle={`Avg: ${formatCurrency(metrics.avgLoss)}`}
                color="error.main"
              />
            </Box>
          </Box>

          <Divider />

          {/* Trade Quality */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Trade Quality
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <MetricItem
                title="Best Trade"
                value={formatCurrency(metrics.bestTrade)}
                color="success.main"
              />
              <MetricItem
                title="Worst Trade"
                value={formatCurrency(metrics.worstTrade)}
                color="error.main"
              />
              <MetricItem
                title="Profit Factor"
                value={
                  metrics.profitFactor === Infinity
                    ? '∞'
                    : metrics.profitFactor.toFixed(2)
                }
                subtitle={
                  metrics.profitFactor > 1.5
                    ? 'Excellent'
                    : metrics.profitFactor > 1
                      ? 'Good'
                      : 'Needs Improvement'
                }
                color={
                  metrics.profitFactor > 1.5
                    ? 'success.main'
                    : metrics.profitFactor > 1
                      ? 'warning.main'
                      : 'error.main'
                }
              />
              <MetricItem
                title="Expectancy"
                value={formatCurrency(metrics.expectancy)}
                subtitle="Per trade"
                color={metrics.expectancy > 0 ? 'success.main' : 'error.main'}
              />
            </Box>
          </Box>

          <Divider />

          {/* Advanced Metrics */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Risk-Adjusted Returns & Behavior
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
              }}
            >
              <MetricItem
                title="Sharpe Ratio"
                value={metrics.sharpeRatio.toFixed(2)}
                subtitle={
                  metrics.sharpeRatio > 2
                    ? 'Excellent'
                    : metrics.sharpeRatio > 1
                      ? 'Good'
                      : metrics.sharpeRatio > 0
                        ? 'Acceptable'
                        : 'Poor'
                }
                color={
                  metrics.sharpeRatio > 1
                    ? 'success.main'
                    : metrics.sharpeRatio > 0
                      ? 'warning.main'
                      : 'error.main'
                }
              />
              <MetricItem
                title="Avg Holding Time"
                value={
                  metrics.avgHoldingTime < 60
                    ? `${metrics.avgHoldingTime.toFixed(0)} min`
                    : `${(metrics.avgHoldingTime / 60).toFixed(1)} hrs`
                }
              />
            </Box>
          </Box>

          {/* Insights */}
          {metrics.totalTrades > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                💡 Key Insights
              </Typography>
              <Stack spacing={0.5}>
                {metrics.winRate < 40 && (
                  <Alert severity="error" variant="outlined" sx={{ py: 0.5 }}>
                    Win rate below 40% - Consider reviewing your strategy
                  </Alert>
                )}
                {metrics.profitFactor < 1 && (
                  <Alert severity="error" variant="outlined" sx={{ py: 0.5 }}>
                    Profit factor below 1 - Losses exceed profits
                  </Alert>
                )}
                {metrics.avgLoss > metrics.avgWin * 2 && (
                  <Alert severity="warning" variant="outlined" sx={{ py: 0.5 }}>
                    Average loss is significantly larger than average win
                  </Alert>
                )}
                {metrics.sharpeRatio > 1.5 && (
                  <Alert severity="success" variant="outlined" sx={{ py: 0.5 }}>
                    Excellent risk-adjusted returns (Sharpe Ratio)
                  </Alert>
                )}
                {metrics.profitFactor > 2 && (
                  <Alert severity="success" variant="outlined" sx={{ py: 0.5 }}>
                    Strong profit factor indicates good risk/reward management
                  </Alert>
                )}
                {metrics.totalTrades < 10 && (
                  <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
                    Sample size is small - metrics will be more reliable with more trades
                  </Alert>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AdvancedPerformanceMetrics;
