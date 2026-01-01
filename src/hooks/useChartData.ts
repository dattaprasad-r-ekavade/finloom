/**
 * Custom hook for managing chart data and intervals
 * Handles historical data fetching and auto-refresh
 */

import { useState, useEffect, useCallback } from 'react';
import { ScripOption } from '@/components/trading/ScripSearchAutocomplete';

interface UseChartDataProps {
  selectedScrip: ScripOption | null;
  refreshInterval?: number; // in milliseconds
}

export const useChartData = ({
  selectedScrip,
  refreshInterval = 5000,
}: UseChartDataProps) => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [chartInterval, setChartInterval] = useState('FIVE_MINUTE');
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [priceUpdateTrigger, setPriceUpdateTrigger] = useState(0);

  /**
   * Load historical chart data for the selected scrip
   */
  const loadChartData = useCallback(async () => {
    if (!selectedScrip) {
      setHistoricalData([]);
      return;
    }

    try {
      setIsLoadingChart(true);
      const params = new URLSearchParams({
        symboltoken: (selectedScrip as any).scripToken || '',
        exchange: selectedScrip.exchange,
        interval: chartInterval,
      });

      const response = await fetch(`/api/angelone-live/historical?${params}`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setHistoricalData(result.data);
        setPriceUpdateTrigger((prev) => prev + 1); // Trigger price flash animation
      } else {
        setHistoricalData([]);
      }
    } catch (err) {
      console.error('Error loading chart data:', err);
      setHistoricalData([]);
    } finally {
      setIsLoadingChart(false);
    }
  }, [selectedScrip, chartInterval]);

  // Load chart data when scrip or interval changes
  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  // Auto-refresh chart data
  useEffect(() => {
    if (!selectedScrip || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      loadChartData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [selectedScrip, refreshInterval, loadChartData]);

  return {
    historicalData,
    chartInterval,
    isLoadingChart,
    priceUpdateTrigger,
    setChartInterval,
    refreshChartData: loadChartData,
  };
};
