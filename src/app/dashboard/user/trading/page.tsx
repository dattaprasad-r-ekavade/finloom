'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';
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
  scrip: 'GOLD1!',
  scripFullName: 'Gold Futures',
  ltp: 0,
  exchange: 'MCX',
};

export default function TradingTerminalPage() {
  const router = useRouter();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
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
  const [liveStreamUrl, setLiveStreamUrl] = useState<string | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [showOpenTradesModal, setShowOpenTradesModal] = useState(false);
  const [mobileTab, setMobileTab] = useState(0);
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
  const isInitialChartLoadRef = React.useRef(true);
  const symbolTokenCacheRef = React.useRef<Record<string, { symbolToken: string; tradingSymbol: string }>>({});
  const selectedScripRef = React.useRef<ScripOption | null>(DEFAULT_SYMBOL);

  // Keep ref in sync so callbacks can read latest value without it being a dependency
  useEffect(() => {
    selectedScripRef.current = selectedScrip;
  }, [selectedScrip]);

  useEffect(() => {
    const hasSeenRiskModal = sessionStorage.getItem('hasSeenRiskModal');
    if (!hasSeenRiskModal) {
      setShowRiskModal(true);
      sessionStorage.setItem('hasSeenRiskModal', 'true');
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    const boot = async () => {
      try {
        setInitializing(true);
        setError(null);
        const selectionResponse = await fetch('/api/challenges/selection');
        const selectionPayload = await selectionResponse.json();
        if (!selectionResponse.ok) {
          throw new Error(selectionPayload?.error ?? 'Unable to load challenge selection.');
        }

        if (!selectionPayload?.selection) {
          setSelection(null);
          setError('No active challenge found. Reserve and activate a challenge to access demo trading.');
          return;
        }

        setSelection(selectionPayload.selection as ChallengeSelection);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unable to initialize trading workspace.');
      } finally {
        setInitializing(false);
      }
    };

    boot();
  }, [isLoading, router, user]);

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
      setError(err instanceof Error ? err.message : 'Failed to load trading summary.');
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

      if (!selectedScripRef.current && tradeItems.length) {
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
      setError(err instanceof Error ? err.message : 'Failed to load trades history.');
    }
  }, [challengeId]);

  // Resolve symbol token + trading symbol from AngelOne search
  const resolveSymbolToken = useCallback(async (baseSymbol: string, exchange: string): Promise<{ symbolToken: string; tradingSymbol: string } | null> => {
    const cleanSymbol = baseSymbol.replace(/[!@#]/g, '').replace(/\d+$/, '') || baseSymbol.replace(/[!@#]/g, '');
    const searchTerm = cleanSymbol || baseSymbol;
    const cacheKey = `${exchange}:${baseSymbol}`;
    const cached = symbolTokenCacheRef.current[cacheKey];
    if (cached) return cached;

    try {
      const searchRes = await fetch('/api/angelone-live/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchange, searchScrip: searchTerm }),
      });

      const searchData = await searchRes.json();
      if (!searchRes.ok || !searchData.data || searchData.data.length === 0) {
        return null;
      }

      const preferredScrip = exchange === 'NSE'
        ? searchData.data.find((s: any) => s.tradingsymbol.endsWith('-EQ'))
        : searchData.data[0];
      const token = preferredScrip?.symboltoken || searchData.data[0]?.symboltoken;
      const tradingSymbol = preferredScrip?.tradingsymbol || searchData.data[0]?.tradingsymbol;
      if (token && tradingSymbol) {
        const entry = { symbolToken: token, tradingSymbol };
        symbolTokenCacheRef.current[cacheKey] = entry;
        return entry;
      }
      return null;
    } catch (err) {
      console.error('[chart] AngelOne search fetch failed:', err);
      return null;
    }
  }, []);

  const fetchHistoricalData = useCallback(async (scrip: string, exchange: string) => {
    if (!scrip) return;

    if (isInitialChartLoadRef.current) {
      setIsLoadingChart(true);
    }

    try {
      const baseSymbol = scrip.split('-')[0];
      const tokenInfo = await resolveSymbolToken(baseSymbol, exchange);

      if (!tokenInfo) {
        setLiveStreamUrl(null);
        return;
      }

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

      const res = await fetch('/api/angelone-live/historical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange,
          symbolToken: tokenInfo.symbolToken,
          interval: chartInterval,
          fromDate,
          toDate,
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

      // Start live SSE stream for this scrip
      const streamUrl = `/api/angelone-live/stream?symbolToken=${encodeURIComponent(tokenInfo.symbolToken)}&exchange=${encodeURIComponent(exchange)}&tradingSymbol=${encodeURIComponent(tokenInfo.tradingSymbol)}`;
      setLiveStreamUrl(streamUrl);
    } catch (err) {
      console.error('Error fetching historical data:', err);
    } finally {
      setIsLoadingChart(false);
      isInitialChartLoadRef.current = false;
    }
  }, [chartInterval, resolveSymbolToken]);

  const refreshAll = useCallback(async () => {
    if (!challengeId) return;
    setIsRefreshing(true);
    await Promise.all([loadSummary(), loadTrades()]);
    setIsRefreshing(false);
  }, [challengeId, loadSummary, loadTrades]);

  useEffect(() => {
    if (!challengeId) return;
    refreshAll();
  }, [challengeId, refreshAll]);

  // Load historical data + start SSE stream when scrip or interval changes
  useEffect(() => {
    if (selectedScrip) {
      isInitialChartLoadRef.current = true;
      setHistoricalData([]); // clear old candles so chart always does a full reset
      setLiveStreamUrl(null);
      fetchHistoricalData(selectedScrip.scrip, selectedScrip.exchange);
    }
  }, [selectedScrip?.scrip, selectedScrip?.exchange, chartInterval, fetchHistoricalData]);

  // Callback for AngelOneChart to feed live LTP back to the page
  const handleChartLTPUpdate = useCallback((ltp: number) => {
    setSelectedScrip((prev) => prev ? { ...prev, ltp } : prev);
    setPriceUpdateTrigger((t) => t + 1);
  }, []);

  const executeOrder = useCallback(
    async (payload: OrderPayload) => {
      if (!challengeId) return;
      try {
        setIsSubmitting(true);
        setError(null);
        setInfo(null);

        const tradingScrip = payload.scrip.scrip.split('-')[0];

        const response = await fetch('/api/trading/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId,
            scrip: tradingScrip,
            exchange: payload.scrip.exchange || selectedScripRef.current?.exchange || 'NSE',
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
              ? { ...prev, ltp: trade.entryPrice, scripFullName: trade.scripFullName }
              : prev,
          );
        }

        setInfo('Trade executed successfully.');
        setToast({ open: true, message: `${payload.tradeType} order executed for ${tradingScrip}`, severity: 'success' });
        await refreshAll();
      } catch (err) {
        console.error(err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to execute trade.';
        setError(errorMsg);
        setToast({ open: true, message: errorMsg, severity: 'error' });
      } finally {
        setIsSubmitting(false);
        setOrderConfirmation({ open: false, payload: null });
      }
    },
    [challengeId, refreshAll],
  );

  const handlePlaceOrder = useCallback(
    async (payload: OrderPayload) => {
      if (!challengeId) return;

      const capitalAvailable =
        summary?.portfolio?.capitalAvailable ??
        summary?.summary?.capitalAvailable ??
        selection?.plan.accountSize ??
        0;
      const orderValue = payload.scrip.ltp * payload.quantity;
      const capitalPercentage = (orderValue / capitalAvailable) * 100;

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
        setOrderConfirmation({ open: true, payload: orderWithDetails });
        return;
      }

      await executeOrder(payload);
    },
    [challengeId, executeOrder, selection, summary],
  );

  const handleSquareOff = useCallback(
    async (tradeId: string) => {
      if (!challengeId) return;
      setProcessingTrades((prev) => { const next = new Set(prev); next.add(tradeId); return next; });
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
        setToast({ open: true, message: 'Trade squared-off successfully', severity: 'success' });
        await refreshAll();
      } catch (err) {
        console.error(err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to square-off trade.';
        setError(errorMsg);
        setToast({ open: true, message: errorMsg, severity: 'error' });
      } finally {
        setProcessingTrades((prev) => { const next = new Set(prev); next.delete(tradeId); return next; });
      }
    },
    [challengeId, refreshAll],
  );

  const handleSquareOffAll = useCallback(async () => {
    if (!challengeId) return;

    const openTrades = trades.filter(t => !t.exitPrice);
    if (openTrades.length === 0) {
      setToast({ open: true, message: 'No open positions to square off', severity: 'info' });
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
        if (response.ok && json.success) successCount++;
        else errorCount++;
      } catch (err) {
        console.error('Failed to square off trade:', trade.id, err);
        errorCount++;
      }
    }

    setSquaringOffAll(false);
    await refreshAll();

    if (errorCount === 0) {
      setToast({ open: true, message: `Squared off all ${successCount} positions`, severity: 'success' });
    } else {
      setToast({ open: true, message: `Squared off ${successCount}, ${errorCount} failed`, severity: 'warning' });
    }
  }, [challengeId, trades, refreshAll]);

  useKeyboardShortcuts({
    onBuy: () => { setToast({ open: true, message: 'Quick Buy (B) - Select quantity and confirm', severity: 'info' }); },
    onSell: () => { setToast({ open: true, message: 'Quick Sell (S) - Select quantity and confirm', severity: 'info' }); },
    onEscape: () => { setShowRiskModal(false); setShowOpenTradesModal(false); setOrderConfirmation({ open: false, payload: null }); },
    onSquareOffAll: handleSquareOffAll,
    onRefresh: refreshAll,
    enabled: isChallengeActive,
  });

  // ── Chart header bar (shared between mobile and desktop) ──
  const chartHeaderBar = (
    <Box sx={{ p: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ width: { xs: 140, sm: 180 }, flexShrink: 0 }}>
          <ScripSearchAutocomplete
            value={selectedScrip}
            onChange={(option) => {
              if (!option) { setSelectedScrip(DEFAULT_SYMBOL); return; }
              setSelectedScrip({
                scrip: option.scrip,
                scripFullName: option.scripFullName,
                ltp: option.ltp || 0,
                exchange: option.exchange || 'NSE',
              });
            }}
          />
        </Box>
        <PriceUpdateFlash trigger={priceUpdateTrigger}>
          <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
            ₹{selectedScrip?.ltp.toFixed(2) ?? '--'}
          </Typography>
        </PriceUpdateFlash>
      </Stack>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 70 }}>
          <Select
            value={chartInterval}
            onChange={(e) => setChartInterval(e.target.value as string)}
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 28 }}
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
        <Tooltip title="Risk Guardrails">
          <IconButton size="small" onClick={() => setShowRiskModal(true)} sx={{ color: 'primary.main' }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton
          size="small"
          onClick={refreshAll}
          disabled={isRefreshing || !isChallengeActive}
        >
          {isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
        </IconButton>
      </Stack>
    </Box>
  );

  // ── Chart content ──
  const chartContent = (
    <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
      {isLoadingChart && historicalData.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress size={28} />
        </Box>
      ) : historicalData.length > 0 ? (
        <AngelOneChart data={historicalData} liveStreamUrl={liveStreamUrl ?? undefined} onLTPUpdate={handleChartLTPUpdate} />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" color="text.secondary">No chart data</Typography>
        </Box>
      )}
    </Box>
  );

  // ── Order + Risk + Stats sidebar content ──
  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', p: { xs: 1.5, lg: 0 } }}>
      {/* Order Form */}
      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <OrderForm
          challengeId={selection?.id ?? ''}
          selectedScrip={selectedScrip}
          capitalAvailable={
            summary?.portfolio?.capitalAvailable ??
            summary?.summary?.capitalAvailable ??
            selection?.plan.accountSize ?? 0
          }
          onPlaceOrder={handlePlaceOrder}
          isSubmitting={isSubmitting}
        />
      </Paper>

      {/* Action Buttons */}
      <Stack direction="row" spacing={0.5}>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={handleSquareOffAll}
          disabled={!isChallengeActive || squaringOffAll || trades.filter(t => !t.exitPrice).length === 0}
          sx={{ flex: 1, fontSize: '0.75rem', py: 0.5 }}
        >
          {squaringOffAll ? 'Squaring...' : 'Square Off All'}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowOpenTradesModal(true)}
          disabled={!isChallengeActive}
          sx={{ flex: 1, fontSize: '0.75rem', py: 0.5 }}
        >
          Open Trades
        </Button>
      </Stack>

      {/* Risk Dashboard (compact) */}
      <RiskDashboard
        accountSize={selection?.plan.accountSize ?? 0}
        dailyPnl={summary?.metrics?.realizedPnlToday ?? summary?.summary?.realizedPnl ?? 0}
        dailyPnlPct={summary?.metrics?.dayPnlPct ?? summary?.summary?.dayPnlPct ?? 0}
        dailyLossLimit={selection?.plan.dailyLossPct ?? 5}
        maxLossLimit={selection?.plan.maxLossPct ?? 10}
        cumulativePnl={summary?.portfolio?.realizedPnl ?? summary?.summary?.realizedPnl ?? 0}
        openPositionsCount={summary?.metrics?.openTradesCount ?? summary?.summary?.openTrades ?? 0}
        compact
      />

      {/* Stats (compact) */}
      <ChallengeStatsCard
        accountSize={selection?.plan.accountSize ?? 0}
        portfolio={summary?.portfolio ?? null}
        metrics={summary?.metrics ?? null}
        summary={summary?.summary ?? null}
        compact
      />
    </Box>
  );

  // ── Trades panel ──
  const tradesPanel = (
    <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
      <TradesList
        trades={trades}
        onSquareOff={handleSquareOff}
        processingTrades={processingTrades}
      />
    </Box>
  );

  // ── Main content (active trading state) ──
  const renderActiveTrading = () => {
    if (isMobile) {
      // Mobile: Tab-based layout filling viewport
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <Tabs
            value={mobileTab}
            onChange={(_, v) => setMobileTab(v)}
            variant="fullWidth"
            sx={{
              minHeight: 36,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: '0.8rem' },
            }}
          >
            <Tab icon={<ShowChartIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Chart" />
            <Tab icon={<ShoppingCartIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Trade" />
            <Tab icon={<ListAltIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Positions" />
          </Tabs>

          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {mobileTab === 0 && (
              <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, borderRadius: 0, border: 'none' }}>
                {chartHeaderBar}
                {chartContent}
              </Paper>
            )}
            {mobileTab === 1 && sidebarContent}
            {mobileTab === 2 && tradesPanel}
          </Box>
        </Box>
      );
    }

    // Desktop: Full viewport grid layout
    return (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: 1.5,
        flex: 1,
        minHeight: 0,
      }}>
        {/* Left: Chart (fills all available space) */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
          }}
        >
          {chartHeaderBar}
          {chartContent}
        </Paper>

        {/* Right: Sidebar — order, risk, stats, trades */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0, overflow: 'hidden' }}>
          {sidebarContent}

          {/* Trades list fills remaining space */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              minHeight: 0,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ p: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Positions & Trades</Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              <TradesList
                trades={trades}
                onSquareOff={handleSquareOff}
                processingTrades={processingTrades}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}
    >
      <Navbar />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, px: { xs: 1, md: 1.5 }, pb: 1 }}>
        {/* Compact header */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ py: 0.75, flexWrap: 'wrap', gap: 0.5 }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip label="Demo" color="primary" variant="outlined" size="small" sx={{ fontWeight: 600, height: 22 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Trading Terminal
            </Typography>
            <Tooltip title="B=Buy, S=Sell, Ctrl+Q=Square Off All, R=Refresh, ESC=Close">
              <Chip label="Shortcuts" size="small" variant="outlined" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
            </Tooltip>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 0.5, py: 0 }}>
            {error}
          </Alert>
        )}
        {info && (
          <Alert severity="success" onClose={() => setInfo(null)} sx={{ mb: 0.5, py: 0 }}>
            {info}
          </Alert>
        )}

        {initializing ? (
          <LoadingOverlay message="Initializing trading terminal..." />
        ) : !selection ? (
          <Paper sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Activate a challenge to start trading
            </Typography>
            <Typography color="text.secondary" variant="body2">
              You need an active challenge to access the demo trading terminal.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push('/challenge-plans')}>
              Browse challenge plans
            </Button>
          </Paper>
        ) : !isChallengeActive ? (
          <Alert severity="warning">
            Your challenge is currently <strong>{selection.status}</strong>. Demo trading activates once ACTIVE.
          </Alert>
        ) : (
          renderActiveTrading()
        )}
      </Box>

      {/* Risk Guardrails Modal */}
      <Dialog open={showRiskModal} onClose={() => setShowRiskModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Risk Guardrails</Typography>
          </Box>
          <IconButton size="small" onClick={() => setShowRiskModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Profit Target</Typography>
              <Typography variant="body2" color="text.secondary">
                {selection?.plan.profitTargetPct}% of account size
                {selection ? ` (₹${(selection.plan.accountSize * selection.plan.profitTargetPct / 100).toLocaleString('en-IN')})` : ''}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Maximum Loss</Typography>
              <Typography variant="body2" color="text.secondary">
                Overall: {selection?.plan.maxLossPct}% | Daily: {selection?.plan.dailyLossPct}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Trading Hours</Typography>
              <Typography variant="body2" color="text.secondary">9:15 AM - 3:30 PM IST</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Auto Square-Off</Typography>
              <Typography variant="body2" color="text.secondary">All open positions squared off at 3:30 PM IST daily</Typography>
            </Box>
            <Alert severity="warning" sx={{ mt: 1 }}>Violating daily loss or max drawdown limits will fail the challenge</Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRiskModal(false)} variant="contained">Got it</Button>
        </DialogActions>
      </Dialog>

      {/* My Open Trades Modal */}
      <Dialog open={showOpenTradesModal} onClose={() => setShowOpenTradesModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>My Open Trades</Typography>
          <IconButton size="small" onClick={() => setShowOpenTradesModal(false)}><CloseIcon /></IconButton>
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
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{trade.scrip}</Typography>
                          <Typography variant="caption" color="text.secondary">{trade.scripFullName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={trade.tradeType} size="small" color={trade.tradeType === 'BUY' ? 'success' : 'error'} sx={{ fontWeight: 600 }} />
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
                          <Button variant="outlined" size="small" color="error" disabled={isProcessing} onClick={() => handleSquareOff(trade.id)}>
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
          <Button onClick={() => setShowOpenTradesModal(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Order Confirmation Dialog */}
      {orderConfirmation.payload && (
        <OrderConfirmationDialog
          open={orderConfirmation.open}
          orderDetails={orderConfirmation.payload.orderDetails ?? null}
          onConfirm={() => { if (orderConfirmation.payload) executeOrder(orderConfirmation.payload); }}
          onCancel={() => setOrderConfirmation({ open: false, payload: null })}
        />
      )}

      {/* Toast Notifications */}
      <ToastNotification
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
}
