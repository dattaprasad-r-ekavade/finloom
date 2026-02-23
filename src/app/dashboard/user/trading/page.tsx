'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Fade,
  Slide,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { AngelOneChart } from '@/components/trading/AngelOneChart';
import {
  OrderForm,
  OrderPayload,
} from '@/components/trading/OrderForm';
import {
  ScripOption,
  ScripSearchAutocomplete,
} from '@/components/trading/ScripSearchAutocomplete';
import {
  TradeRecord,
  TradesList,
} from '@/components/trading/TradesList';
import { ChallengeStatsCard } from '@/components/trading/ChallengeStatsCard';
import { LoadingOverlay } from '@/components/LoadingComponents';
import { ToastNotification, PriceUpdateFlash } from '@/components/AnimatedComponents';
import { RiskDashboard } from '@/components/trading/RiskDashboard';
import { OrderConfirmationDialog } from '@/components/trading/OrderConfirmationDialog';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface ChallengeSelection {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'PASSED' | 'FAILED';
  plan: {
    id: string;
    name: string;
    level: number;
    accountSize: number;
    profitTargetPct: number;
    maxLossPct: number;
    dailyLossPct: number;
    durationDays: number;
    profitSplit: number;
  };
}

interface TradingSummaryResponse {
  success: boolean;
  data?: {
    summary: {
      totalTrades: number;
      openTrades: number;
      closedTrades: number;
      realizedPnl: number;
      unrealizedPnl: number;
      capitalUsed: number;
      capitalAvailable: number;
      dayPnlPct: number;
    } | null;
    challenge: {
      id: string;
      status: string;
      accountSize: number;
    };
    metrics: {
      openTradesCount: number;
      closedTradesToday: number;
      realizedPnlToday: number;
      dayPnlPct: number;
    };
    portfolio: {
      capitalUsed: number;
      capitalAvailable: number;
      unrealizedPnl: number;
      realizedPnl: number;
      isMarketOpen: boolean;
    };
  };
  error?: string;
}

const DEFAULT_SYMBOL: ScripOption = {
  scrip: 'RELIANCE-EQ',
  scripFullName: 'Reliance Industries Ltd',
  ltp: 2450,
  exchange: 'NSE',
};

export default function TradingTerminalPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [selection, setSelection] = useState<ChallengeSelection | null>(null);
  const [selectedScrip, setSelectedScrip] = useState<ScripOption | null>(DEFAULT_SYMBOL);
  const [summary, setSummary] = useState<TradingSummaryResponse['data'] | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingTrades, setProcessingTrades] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [chartInterval, setChartInterval] = useState('FIVE_MINUTE');
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [showOpenTradesModal, setShowOpenTradesModal] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [priceUpdateTrigger, setPriceUpdateTrigger] = useState(0);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    open: boolean;
    payload: OrderPayload | null;
  }>({ open: false, payload: null });
  const [squaringOffAll, setSquaringOffAll] = useState(false);

  useEffect(() => {
    // Show risk guardrails modal on first load
    const hasSeenRiskModal = sessionStorage.getItem('hasSeenRiskModal');
    if (!hasSeenRiskModal) {
      setShowRiskModal(true);
      sessionStorage.setItem('hasSeenRiskModal', 'true');
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    const boot = async () => {
      try {
        setInitializing(true);
        setError(null);
        const selectionResponse = await fetch(
          '/api/challenges/selection',
        );
        const selectionPayload = await selectionResponse.json();
        if (!selectionResponse.ok) {
          throw new Error(
            selectionPayload?.error ?? 'Unable to load challenge selection.',
          );
        }

        if (!selectionPayload?.selection) {
          setSelection(null);
          setError(
            'No active challenge found. Reserve and activate a challenge to access demo trading.',
          );
          return;
        }

        setSelection(selectionPayload.selection as ChallengeSelection);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to initialize trading workspace.',
        );
      } finally {
        setInitializing(false);
      }
    };

    boot();
  }, [router, user]);

  const challengeId = selection?.id ?? null;
  const isChallengeActive = selection?.status === 'ACTIVE';

  const loadSummary = useCallback(async () => {
    if (!challengeId) return;
    try {
      const response = await fetch(
        `/api/trading/summary?challengeId=${encodeURIComponent(challengeId)}`,
        { cache: 'no-store' },
      );
      const json: TradingSummaryResponse = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Failed to load trading summary');
      }
      setSummary(json.data ?? null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Failed to load trading summary.',
      );
    }
  }, [challengeId]);

  const loadTrades = useCallback(async () => {
    if (!challengeId) return;
    try {
      const response = await fetch(
        `/api/trading/trades?challengeId=${encodeURIComponent(challengeId)}&limit=100`,
        { cache: 'no-store' },
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Failed to load trades');
      }
      const tradeItems: TradeRecord[] = json.data?.trades ?? [];
      setTrades(tradeItems);

      if (!selectedScrip && tradeItems.length) {
        const latest = tradeItems[0];
        setSelectedScrip({
          scrip: latest.scrip,
          scripFullName: latest.scripFullName,
          ltp: latest.exitPrice ?? latest.entryPrice,
          exchange: 'NSE',
        });
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Failed to load trades history.',
      );
    }
  }, [challengeId, selectedScrip]);

  const fetchHistoricalData = useCallback(async (scrip: string) => {
    if (!scrip) return;
    setIsLoadingChart(true);
    try {
      // Strip suffix to get base symbol for search (INFY-EQ -> INFY)
      const baseSymbol = scrip.split('-')[0];
      const chartSymbol = scrip.includes('-') ? scrip : `${scrip}-EQ`;
      
      const now = new Date();
      const toDate = now.toISOString().slice(0, 16).replace('T', ' ');
      
      let daysBack = 3;
      switch (chartInterval) {
        case 'ONE_MINUTE': daysBack = 1; break;
        case 'THREE_MINUTE': daysBack = 2; break;
        case 'FIVE_MINUTE': daysBack = 3; break;
        case 'FIFTEEN_MINUTE': daysBack = 7; break;
        case 'THIRTY_MINUTE': daysBack = 15; break;
        case 'ONE_HOUR': daysBack = 30; break;
        case 'ONE_DAY': daysBack = 365; break;
      }
      
      const fromDateObj = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const fromDate = fromDateObj.toISOString().slice(0, 16).replace('T', ' ');

      // Search using base symbol (without -EQ suffix)
      const searchRes = await fetch('/api/angelone-live/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange: 'NSE',
          searchScrip: baseSymbol,
        }),
      });

      const searchData = await searchRes.json();
      if (!searchRes.ok || !searchData.data || searchData.data.length === 0) {
        console.error('Failed to find scrip:', baseSymbol);
        return;
      }

      // Find the -EQ variant (or use first result if -EQ not found)
      const eqScrip = searchData.data.find((s: any) => s.tradingsymbol.endsWith('-EQ'));
      const symbolToken = eqScrip?.symboltoken || searchData.data[0]?.symboltoken;

      if (!symbolToken) {
        console.error('No symbol token found');
        return;
      }

      const res = await fetch('/api/angelone-live/historical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange: 'NSE',
          symbolToken: symbolToken,
          interval: chartInterval,
          fromDate: fromDate,
          toDate: toDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data && data.data.length > 0) {
        const candleData = data.data.map((candle: any[]) => ({
          time: Math.floor(new Date(candle[0]).getTime() / 1000),
          open: candle[1],
          high: candle[2],
          low: candle[3],
          close: candle[4],
          volume: candle[5],
        }));
        setHistoricalData(candleData);
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
    } finally {
      setIsLoadingChart(false);
    }
  }, [chartInterval]);

  const refreshAll = useCallback(async () => {
    if (!challengeId) return;
    setIsRefreshing(true);
    await Promise.all([loadSummary(), loadTrades()]);
    if (selectedScrip) {
      try {
        const detailResponse = await fetch(
          `/api/trading/market-data/${encodeURIComponent(selectedScrip.scrip)}`,
          { cache: 'no-store' },
        );
        const detailJson = await detailResponse.json();
        if (detailResponse.ok && detailJson?.success) {
          const data = detailJson.data?.marketData;
          if (data) {
            setSelectedScrip((prev) =>
              prev && prev.scrip === data.scrip
                ? {
                    ...prev,
                    ltp: data.ltp,
                    scripFullName: data.scripFullName,
                    exchange: data.exchange,
                  }
                : prev,
            );
          }
        }
      } catch (error) {
        console.error('Failed to refresh selected scrip LTP:', error);
      }
    }
    setIsRefreshing(false);
  }, [challengeId, loadSummary, loadTrades, selectedScrip]);

  useEffect(() => {
    if (!challengeId) return;
    refreshAll();
  }, [challengeId, refreshAll]);

  useEffect(() => {
    if (selectedScrip) {
      fetchHistoricalData(selectedScrip.scrip);
    }
  }, [selectedScrip, chartInterval, fetchHistoricalData]);

  // Auto-refresh LTP and chart every 5 seconds
  useEffect(() => {
    if (!selectedScrip || !isChallengeActive) return;

    const refreshInterval = setInterval(async () => {
      try {
        // Refresh LTP
        const detailResponse = await fetch(
          `/api/trading/market-data/${encodeURIComponent(selectedScrip.scrip.split('-')[0])}`,
          { cache: 'no-store' },
        );
        const detailJson = await detailResponse.json();
        if (detailResponse.ok && detailJson?.success) {
          const data = detailJson.data?.marketData;
          if (data) {
            setSelectedScrip((prev) =>
              prev && prev.scrip.startsWith(data.scrip)
                ? {
                    ...prev,
                    ltp: data.ltp,
                    scripFullName: data.scripFullName,
                    exchange: data.exchange,
                  }
                : prev,
            );
            // Trigger price flash animation
            setPriceUpdateTrigger(prev => prev + 1);
          }
        }

        // Refresh chart data
        await fetchHistoricalData(selectedScrip.scrip);
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(refreshInterval);
  }, [selectedScrip, isChallengeActive, fetchHistoricalData]);

  const handlePlaceOrder = useCallback(
    async (payload: OrderPayload) => {
      if (!challengeId) return;

      // Calculate capital percentage
      const capitalAvailable =
        summary?.portfolio?.capitalAvailable ??
        summary?.summary?.capitalAvailable ??
        selection?.plan.accountSize ??
        0;
      const orderValue = payload.scrip.ltp * payload.quantity;
      const capitalPercentage = (orderValue / capitalAvailable) * 100;

      // Show confirmation dialog for orders > 10% of capital
      if (capitalPercentage > 10) {
        const orderWithDetails: OrderPayload = {
          ...payload,
          orderDetails: {
            scrip: payload.scrip.scrip,
            scripFullName: payload.scrip.scripFullName,
            quantity: payload.quantity,
            tradeType: payload.tradeType,
            estimatedValue: orderValue,
            capitalPercentage,
          },
        };
        setOrderConfirmation({
          open: true,
          payload: orderWithDetails,
        });
        return;
      }

      // Execute order directly for small orders (<= 10%)
      await executeOrder(payload);
    },
    [challengeId, summary, selection],
  );

  const executeOrder = useCallback(
    async (payload: OrderPayload) => {
      if (!challengeId) return;
      try {
        setIsSubmitting(true);
        setError(null);
        setInfo(null);

        // Strip -EQ suffix for trading (only used for charting)
        const tradingScrip = payload.scrip.scrip.split('-')[0];

        const response = await fetch('/api/trading/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId,
            scrip: tradingScrip,
            quantity: payload.quantity,
            tradeType: payload.tradeType,
          }),
        });

        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error ?? 'Failed to execute trade');
        }

        const trade = json.data?.trade;
        if (trade) {
          setSelectedScrip((prev) =>
            prev && prev.scrip === trade.scrip
              ? {
                  ...prev,
                  ltp: trade.entryPrice,
                  scripFullName: trade.scripFullName,
                }
              : prev,
          );
        }

        setInfo('Trade executed successfully.');
        setToast({
          open: true,
          message: `${payload.tradeType} order executed successfully for ${tradingScrip}`,
          severity: 'success',
        });
        await refreshAll();
      } catch (err) {
        console.error(err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to execute trade.';
        setError(errorMsg);
        setToast({
          open: true,
          message: errorMsg,
          severity: 'error',
        });
      } finally {
        setIsSubmitting(false);
        setOrderConfirmation({ open: false, payload: null });
      }
    },
    [challengeId, refreshAll],
  );

  const handleSquareOff = useCallback(
    async (tradeId: string) => {
      if (!challengeId) return;
      setProcessingTrades((prev) => {
        const next = new Set(prev);
        next.add(tradeId);
        return next;
      });
      try {
        setError(null);
        const response = await fetch('/api/trading/square-off', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradeId }),
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error ?? 'Failed to square-off trade');
        }
        setInfo('Trade squared-off successfully.');
        setToast({
          open: true,
          message: 'Trade squared-off successfully',
          severity: 'success',
        });
        await refreshAll();
      } catch (err) {
        console.error(err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to square-off trade.';
        setError(errorMsg);
        setToast({
          open: true,
          message: errorMsg,
          severity: 'error',
        });
      } finally {
        setProcessingTrades((prev) => {
          const next = new Set(prev);
          next.delete(tradeId);
          return next;
        });
      }
    },
    [challengeId, refreshAll],
  );

  const handleSquareOffAll = useCallback(async () => {
    if (!challengeId) return;
    
    const openTrades = trades.filter(t => !t.exitPrice);
    if (openTrades.length === 0) {
      setToast({
        open: true,
        message: 'No open positions to square off',
        severity: 'info',
      });
      return;
    }

    if (!window.confirm(`Square off all ${openTrades.length} open positions?`)) {
      return;
    }

    setSquaringOffAll(true);
    let successCount = 0;
    let errorCount = 0;

    for (const trade of openTrades) {
      try {
        const response = await fetch('/api/trading/square-off', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradeId: trade.id }),
        });
        const json = await response.json();
        if (response.ok && json.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        console.error('Failed to square off trade:', trade.id, err);
        errorCount++;
      }
    }

    setSquaringOffAll(false);
    await refreshAll();

    if (errorCount === 0) {
      setToast({
        open: true,
        message: `Successfully squared off all ${successCount} positions`,
        severity: 'success',
      });
    } else {
      setToast({
        open: true,
        message: `Squared off ${successCount} positions, ${errorCount} failed`,
        severity: 'warning',
      });
    }
  }, [challengeId, trades, refreshAll]);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onBuy: () => {
      // Focus on order form and set to BUY
      setToast({
        open: true,
        message: 'Quick Buy (B) - Select quantity and confirm',
        severity: 'info',
      });
    },
    onSell: () => {
      // Focus on order form and set to SELL
      setToast({
        open: true,
        message: 'Quick Sell (S) - Select quantity and confirm',
        severity: 'info',
      });
    },
    onEscape: () => {
      // Close modals
      setShowRiskModal(false);
      setShowOpenTradesModal(false);
      setOrderConfirmation({ open: false, payload: null });
    },
    onSquareOffAll: handleSquareOffAll,
    onRefresh: refreshAll,
    enabled: isChallengeActive,
  });

  const tradingSymbol = useMemo(() => {
    if (!selectedScrip) {
      return 'NSE:RELIANCE';
    }
    const exchange = selectedScrip.exchange || 'NSE';
    return `${exchange}:${selectedScrip.scrip}`;
  }, [selectedScrip]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 2, flexGrow: 1 }}>
        <Fade in timeout={500}>
        <Stack spacing={2}>
          <Slide direction="down" in timeout={400}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <Chip
                label="Demo Trading"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Trading Terminal
              </Typography>
              <Tooltip title="Keyboard Shortcuts: B=Buy, S=Sell, Ctrl+Q=Square Off All, R=Refresh, ESC=Close">
                <Chip
                  label="⌨️ Shortcuts Active"
                  size="small"
                  variant="outlined"
                  color="success"
                  sx={{ ml: 1 }}
                />
              </Tooltip>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={handleSquareOffAll}
                disabled={!isChallengeActive || squaringOffAll || trades.filter(t => !t.exitPrice).length === 0}
                sx={{
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
              >
                {squaringOffAll ? 'Squaring Off...' : 'Square Off All'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowOpenTradesModal(true)}
                disabled={!isChallengeActive}
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
              >
                My Open Trades
              </Button>
              <IconButton
                size="small"
                onClick={() => setShowRiskModal(true)}
                sx={{ 
                  color: 'primary.main',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'rotate(90deg)' },
                }}
              >
                <InfoIcon />
              </IconButton>
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  isRefreshing ? <CircularProgress color="inherit" size={16} /> : <RefreshIcon />
                }
                onClick={refreshAll}
                disabled={isRefreshing || !isChallengeActive}
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
          </Slide>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {info && (
            <Alert severity="success" onClose={() => setInfo(null)}>
              {info}
            </Alert>
          )}

          {initializing ? (
            <LoadingOverlay message="Initializing trading terminal..." />
          ) : !selection ? (
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Activate a challenge to start trading
              </Typography>
              <Typography color="text.secondary">
                You need an active challenge to access the demo trading terminal. Head to
                the plans catalogue to reserve or activate a challenge first.
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => router.push('/challenge-plans')}
              >
                Browse challenge plans
              </Button>
            </Paper>
          ) : !isChallengeActive ? (
            <Alert severity="warning">
              Your challenge is currently <strong>{selection.status}</strong>. Demo
              trading activates once the challenge status becomes ACTIVE.
            </Alert>
          ) : (
            <>
              {/* Risk Dashboard - Always visible */}
              <RiskDashboard
                accountSize={selection.plan.accountSize}
                dailyPnl={summary?.metrics?.realizedPnlToday ?? summary?.summary?.realizedPnl ?? 0}
                dailyPnlPct={summary?.metrics?.dayPnlPct ?? summary?.summary?.dayPnlPct ?? 0}
                dailyLossLimit={selection.plan.dailyLossPct}
                maxLossLimit={selection.plan.maxLossPct}
                cumulativePnl={summary?.portfolio?.realizedPnl ?? summary?.summary?.realizedPnl ?? 0}
                openPositionsCount={summary?.metrics?.openTradesCount ?? summary?.summary?.openTrades ?? 0}
              />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' }, gap: 2, height: { xs: 'auto', lg: 'calc(100vh - 280px)' } }}>
                {/* Left Panel - Chart and Order Form */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  {/* Chart */}
                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ p: 1.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {selectedScrip
                          ? `${selectedScrip.scrip} • ${selectedScrip.scripFullName}`
                          : 'Trading Chart'}
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ flexWrap: 'wrap' }}>
                        <Box sx={{ width: { xs: '100%', sm: 200 } }}>
                          <ScripSearchAutocomplete
                            value={selectedScrip}
                            onChange={(option) => {
                              if (!option) {
                                setSelectedScrip(DEFAULT_SYMBOL);
                                return;
                              }
                              
                              // Always use -EQ variant for NSE stocks in charts
                              const scripForChart = option.scrip.includes('-') 
                                ? option.scrip 
                                : `${option.scrip}-EQ`;
                              
                              setSelectedScrip({
                                ...option,
                                scrip: scripForChart,
                              });
                              
                              fetch(`/api/trading/market-data/${option.scrip}`)
                                .then((res) => res.json())
                                .then((json) => {
                                  if (json?.success && json.data?.marketData) {
                                    setSelectedScrip({
                                      scrip: scripForChart,
                                      scripFullName: json.data.marketData.scripFullName,
                                      ltp: json.data.marketData.ltp,
                                      exchange: json.data.marketData.exchange,
                                    });
                                  }
                                })
                                .catch((err) =>
                                  console.error('Failed to load scrip details', err),
                                );
                            }}
                          />
                        </Box>
                        <PriceUpdateFlash trigger={priceUpdateTrigger}>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                          LTP: <Box component="span" sx={{ fontWeight: 600 }}>₹{selectedScrip?.ltp.toFixed(2) ?? '--'}</Box>
                        </Typography>
                        </PriceUpdateFlash>
                        <FormControl size="small" sx={{ minWidth: 80 }}>
                          <Select
                            value={chartInterval}
                            onChange={(e) => setChartInterval(e.target.value as string)}
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', height: 32 }}
                          >
                            <MenuItem value="ONE_MINUTE">1m</MenuItem>
                            <MenuItem value="THREE_MINUTE">3m</MenuItem>
                            <MenuItem value="FIVE_MINUTE">5m</MenuItem>
                            <MenuItem value="FIFTEEN_MINUTE">15m</MenuItem>
                            <MenuItem value="THIRTY_MINUTE">30m</MenuItem>
                            <MenuItem value="ONE_HOUR">1h</MenuItem>
                            <MenuItem value="ONE_DAY">1D</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      {isLoadingChart ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 300, md: 400, lg: 500 } }}>
                          <CircularProgress size={30} />
                        </Box>
                      ) : historicalData.length > 0 ? (
                        <Box sx={{ height: { xs: 300, md: 400, lg: 500 } }}>
                          <AngelOneChart data={historicalData} height={500} />
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 300, md: 400, lg: 500 } }}>
                          <Typography color="text.secondary">No chart data available</Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>

                  {/* Order Form - Compact */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <OrderForm
                      challengeId={selection.id}
                      selectedScrip={selectedScrip}
                      onSelectScrip={setSelectedScrip}
                      capitalAvailable={
                        summary?.portfolio?.capitalAvailable ??
                        summary?.summary?.capitalAvailable ??
                        selection.plan.accountSize
                      }
                      onPlaceOrder={handlePlaceOrder}
                      isSubmitting={isSubmitting}
                    />
                  </Paper>
                </Box>

                {/* Right Panel - Stats and Trades (Fixed width 400px) */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <ChallengeStatsCard
                    accountSize={selection.plan.accountSize}
                    portfolio={summary?.portfolio ?? null}
                    metrics={summary?.metrics ?? null}
                    summary={summary?.summary ?? null}
                  />

                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ p: 1.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Positions & Trades
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                      <TradesList
                        trades={trades}
                        onSquareOff={handleSquareOff}
                        processingTrades={processingTrades}
                      />
                    </Box>
                  </Paper>
                </Box>
              </Box>

              {/* Risk Guardrails Modal */}
              <Dialog
                open={showRiskModal}
                onClose={() => setShowRiskModal(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Risk Guardrails
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setShowRiskModal(false)}>
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Profit Target
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selection.plan.profitTargetPct}% of account size (₹{(selection.plan.accountSize * selection.plan.profitTargetPct / 100).toLocaleString('en-IN')})
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Maximum Loss
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overall: {selection.plan.maxLossPct}% • Daily: {selection.plan.dailyLossPct}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Trading Hours
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        9:15 AM - 3:30 PM IST (Market Hours)
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Auto Square-Off
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        All open positions are automatically squared off at 3:30 PM IST daily
                      </Typography>
                    </Box>
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Violating daily loss or max drawdown limits will result in challenge failure
                    </Alert>
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowRiskModal(false)} variant="contained">
                    Got it
                  </Button>
                </DialogActions>
              </Dialog>

              {/* My Open Trades Modal */}
              <Dialog
                open={showOpenTradesModal}
                onClose={() => setShowOpenTradesModal(false)}
                maxWidth="md"
                fullWidth
              >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    My Open Trades
                  </Typography>
                  <IconButton size="small" onClick={() => setShowOpenTradesModal(false)}>
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                  {trades.filter(t => !t.exitPrice).length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">No open positions</Typography>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Scrip</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell align="right"><strong>Qty</strong></TableCell>
                            <TableCell align="right"><strong>Entry</strong></TableCell>
                            <TableCell align="right"><strong>LTP</strong></TableCell>
                            <TableCell align="right"><strong>P&L</strong></TableCell>
                            <TableCell align="center"><strong>Action</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {trades.filter(t => !t.exitPrice).map((trade) => {
                            const currentLTP = selectedScrip?.scrip.startsWith(trade.scrip) ? selectedScrip.ltp : trade.entryPrice;
                            const pnl = trade.tradeType === 'BUY' 
                              ? (currentLTP - trade.entryPrice) * trade.quantity
                              : (trade.entryPrice - currentLTP) * trade.quantity;
                            const isProcessing = processingTrades.has(trade.id);

                            return (
                              <TableRow key={trade.id} hover>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {trade.scrip}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {trade.scripFullName}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={trade.tradeType} 
                                    size="small"
                                    color={trade.tradeType === 'BUY' ? 'success' : 'error'}
                                    sx={{ fontWeight: 600 }}
                                  />
                                </TableCell>
                                <TableCell align="right">{trade.quantity}</TableCell>
                                <TableCell align="right">₹{trade.entryPrice.toFixed(2)}</TableCell>
                                <TableCell align="right">₹{currentLTP.toFixed(2)}</TableCell>
                                <TableCell align="right">
                                  <Typography sx={{ color: pnl >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                                    {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    disabled={isProcessing}
                                    onClick={() => handleSquareOff(trade.id)}
                                  >
                                    {isProcessing ? 'Squaring...' : 'Square Off'}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowOpenTradesModal(false)} variant="contained">
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}

          {/* Order Confirmation Dialog */}
          {orderConfirmation.payload && (
            <OrderConfirmationDialog
              open={orderConfirmation.open}
              orderDetails={
                orderConfirmation.payload.orderDetails ?? null
              }
              onConfirm={() => {
                if (orderConfirmation.payload) {
                  executeOrder(orderConfirmation.payload);
                }
              }}
              onCancel={() => setOrderConfirmation({ open: false, payload: null })}
            />
          )}
        </Stack>
        </Fade>

        {/* Toast Notifications */}
        <ToastNotification
          open={toast.open}
          message={toast.message}
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
        />
      </Container>
    </Box>
  );
}
