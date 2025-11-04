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
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { TradingViewChart } from '@/components/trading/TradingViewChart';
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
  scrip: 'RELIANCE',
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
          `/api/challenges/selection?userId=${encodeURIComponent(user.id)}`,
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

  const handlePlaceOrder = useCallback(
    async (payload: OrderPayload) => {
      if (!challengeId) return;
      try {
        setIsSubmitting(true);
        setError(null);
        setInfo(null);

        const response = await fetch('/api/trading/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId,
            scrip: payload.scrip.scrip,
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
        await refreshAll();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to execute trade.');
      } finally {
        setIsSubmitting(false);
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
        await refreshAll();
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : 'Failed to square-off trade.',
        );
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
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label="Demo Trading"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Trading Terminal
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                size="small"
                onClick={() => setShowRiskModal(true)}
                sx={{ color: 'primary.main' }}
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
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 320,
              }}
            >
              <CircularProgress />
            </Box>
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
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 2, height: 'calc(100vh - 180px)' }}>
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
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 200 }}>
                          <ScripSearchAutocomplete
                            value={selectedScrip}
                            onChange={(option) => {
                              setSelectedScrip(option ?? DEFAULT_SYMBOL);
                              if (option) {
                                fetch(`/api/trading/market-data/${option.scrip}`)
                                  .then((res) => res.json())
                                  .then((json) => {
                                    if (json?.success && json.data?.marketData) {
                                      setSelectedScrip({
                                        scrip: json.data.marketData.scrip,
                                        scripFullName: json.data.marketData.scripFullName,
                                        ltp: json.data.marketData.ltp,
                                        exchange: json.data.marketData.exchange,
                                      });
                                    }
                                  })
                                  .catch((err) =>
                                    console.error('Failed to load scrip details', err),
                                  );
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                          LTP: <Box component="span" sx={{ fontWeight: 600 }}>₹{selectedScrip?.ltp.toFixed(2) ?? '--'}</Box>
                        </Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      <TradingViewChart symbol={tradingSymbol} height={500} />
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
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
