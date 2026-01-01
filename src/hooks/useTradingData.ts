/**
 * Custom hook for managing trading data and state
 * Handles challenge selection, summary data, and trades loading
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface ChallengeSelection {
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

export interface TradingSummaryResponse {
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

export interface TradeRecord {
  id: string;
  symbolToken: string;
  scripName: string;
  exchange: string;
  tradeType: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  exitPrice: number | null;
  status: 'OPEN' | 'CLOSED';
  pnl: number;
  currentPrice: number;
  createdAt: string;
  closedAt: string | null;
}

interface UseTradingDataProps {
  userId: string | undefined;
}

export const useTradingData = ({ userId }: UseTradingDataProps) => {
  const router = useRouter();
  const [selection, setSelection] = useState<ChallengeSelection | null>(null);
  const [summary, setSummary] = useState<TradingSummaryResponse['data'] | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Load challenge selection for the user
   */
  const loadSelection = useCallback(async () => {
    if (!userId) {
      router.replace('/login');
      return;
    }

    try {
      setInitializing(true);
      setError(null);
      
      const response = await fetch(
        `/api/challenges/selection?userId=${encodeURIComponent(userId)}`,
      );
      const payload = await response.json();
      
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to load challenge selection.');
      }

      if (!payload?.selection) {
        setSelection(null);
        setError(
          'No active challenge found. Reserve and activate a challenge to access demo trading.',
        );
        return;
      }

      setSelection(payload.selection as ChallengeSelection);
    } catch (err) {
      console.error('Error loading selection:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to initialize trading workspace.',
      );
    } finally {
      setInitializing(false);
    }
  }, [userId, router]);

  /**
   * Load trading summary data
   */
  const loadSummary = useCallback(async () => {
    if (!selection?.id) return;

    try {
      const response = await fetch(
        `/api/trading/summary?challengeId=${encodeURIComponent(selection.id)}`,
      );
      const payload = await response.json();

      if (payload.success && payload.data) {
        setSummary(payload.data);
      } else {
        setSummary(null);
      }
    } catch (err) {
      console.error('Error loading summary:', err);
      setSummary(null);
    }
  }, [selection?.id]);

  /**
   * Load all trades for the challenge
   */
  const loadTrades = useCallback(async () => {
    if (!selection?.id) return;

    try {
      const response = await fetch(
        `/api/trading/trades?challengeId=${encodeURIComponent(selection.id)}`,
      );
      const payload = await response.json();

      if (payload.success && Array.isArray(payload.data)) {
        setTrades(payload.data);
      } else {
        setTrades([]);
      }
    } catch (err) {
      console.error('Error loading trades:', err);
      setTrades([]);
    }
  }, [selection?.id]);

  /**
   * Refresh all trading data
   */
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadSummary(), loadTrades()]);
    setIsRefreshing(false);
  }, [loadSummary, loadTrades]);

  // Load selection on mount
  useEffect(() => {
    loadSelection();
  }, [loadSelection]);

  // Load summary and trades when selection changes
  useEffect(() => {
    if (selection?.id) {
      loadSummary();
      loadTrades();
    }
  }, [selection?.id, loadSummary, loadTrades]);

  const challengeId = selection?.id ?? null;
  const isChallengeActive = selection?.status === 'ACTIVE';

  return {
    // Data
    selection,
    summary,
    trades,
    challengeId,
    isChallengeActive,
    
    // Loading states
    initializing,
    isRefreshing,
    error,
    
    // Actions
    setError,
    refreshData,
    setTrades,
    setSummary,
  };
};
