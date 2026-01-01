/**
 * Custom hook for managing order execution logic
 * Handles order placement, square off, and batch operations
 */

import { useState, useCallback } from 'react';
import { OrderPayload } from '@/components/trading/OrderForm';

interface UseOrderExecutionProps {
  challengeId: string | null;
  accountSize: number;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onRefresh?: () => void;
}

export const useOrderExecution = ({
  challengeId,
  accountSize,
  onSuccess,
  onError,
  onRefresh,
}: UseOrderExecutionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingTrades, setProcessingTrades] = useState<Set<string>>(new Set());
  const [squaringOffAll, setSquaringOffAll] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    open: boolean;
    payload: OrderPayload | null;
  }>({ open: false, payload: null });

  /**
   * Calculate order value as percentage of account capital
   */
  const calculateOrderPercentage = (payload: OrderPayload) => {
    const estimatedValue = payload.scrip.ltp * payload.quantity;
    return (estimatedValue / accountSize) * 100;
  };

  /**
   * Execute a single order
   */
  const executeOrder = useCallback(
    async (payload: OrderPayload) => {
      if (!challengeId) {
        onError?.('Challenge ID missing');
        return;
      }

      try {
        setIsSubmitting(true);
        const response = await fetch('/api/trading/place-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId,
            ...payload,
          }),
        });

        const result = await response.json();

        if (result.success) {
          onSuccess?.(
            `${payload.tradeType} order placed for ${payload.quantity} units of ${payload.scrip.scrip}`,
          );
          onRefresh?.();
        } else {
          onError?.(result.error || 'Failed to place order');
        }
      } catch (err) {
        console.error('Order execution error:', err);
        onError?.('Failed to place order');
      } finally {
        setIsSubmitting(false);
      }
    },
    [challengeId, onSuccess, onError, onRefresh],
  );

  /**
   * Handle order placement with smart confirmation
   * Shows confirmation dialog for orders >10% of capital
   */
  const handlePlaceOrder = useCallback(
    async (payload: OrderPayload) => {
      const orderPercentage = calculateOrderPercentage(payload);

      // Show confirmation for large orders (>10% of capital)
      if (orderPercentage > 10) {
        setOrderConfirmation({ open: true, payload });
      } else {
        // Execute small orders directly
        await executeOrder(payload);
      }
    },
    [accountSize, executeOrder],
  );

  /**
   * Confirm and execute an order from the confirmation dialog
   */
  const handleConfirmOrder = useCallback(async () => {
    if (orderConfirmation.payload) {
      setOrderConfirmation({ open: false, payload: null });
      await executeOrder(orderConfirmation.payload);
    }
  }, [orderConfirmation, executeOrder]);

  /**
   * Square off a single trade
   */
  const handleSquareOff = useCallback(
    async (tradeId: string) => {
      if (!challengeId) {
        onError?.('Challenge ID missing');
        return;
      }

      setProcessingTrades((prev) => new Set(prev).add(tradeId));

      try {
        const response = await fetch('/api/trading/square-off', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId, tradeId }),
        });

        const result = await response.json();

        if (result.success) {
          onSuccess?.('Position squared off successfully');
          onRefresh?.();
        } else {
          onError?.(result.error || 'Failed to square off position');
        }
      } catch (err) {
        console.error('Square off error:', err);
        onError?.('Failed to square off position');
      } finally {
        setProcessingTrades((prev) => {
          const next = new Set(prev);
          next.delete(tradeId);
          return next;
        });
      }
    },
    [challengeId, onSuccess, onError, onRefresh],
  );

  /**
   * Square off all open positions
   * Emergency function to close all trades
   */
  const handleSquareOffAll = useCallback(
    async (openTrades: Array<{ id: string; scripName: string }>) => {
      if (!challengeId || openTrades.length === 0) {
        onError?.('No open positions to close');
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to square off all ${openTrades.length} open positions?`,
      );

      if (!confirmed) return;

      setSquaringOffAll(true);
      let successCount = 0;
      let failCount = 0;

      for (const trade of openTrades) {
        try {
          const response = await fetch('/api/trading/square-off', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ challengeId, tradeId: trade.id }),
          });

          const result = await response.json();

          if (result.success) {
            successCount++;
          } else {
            failCount++;
            console.error(`Failed to square off ${trade.scripName}:`, result.error);
          }
        } catch (err) {
          failCount++;
          console.error(`Error squaring off ${trade.scripName}:`, err);
        }

        // Small delay to prevent rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      setSquaringOffAll(false);

      if (successCount > 0) {
        onSuccess?.(
          `Successfully squared off ${successCount} position(s)${failCount > 0 ? `, ${failCount} failed` : ''}`,
        );
        onRefresh?.();
      } else {
        onError?.('Failed to square off any positions');
      }
    },
    [challengeId, onSuccess, onError, onRefresh],
  );

  return {
    // State
    isSubmitting,
    processingTrades,
    squaringOffAll,
    orderConfirmation,
    
    // Actions
    handlePlaceOrder,
    handleConfirmOrder,
    handleSquareOff,
    handleSquareOffAll,
    setOrderConfirmation,
  };
};
