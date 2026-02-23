'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi
} from 'lightweight-charts';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface AngelOneChartProps {
  data: CandleData[];
  height?: number;
}

export const AngelOneChart: React.FC<AngelOneChartProps> = ({ data, height = 600 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const bgColor = isDark ? '#161B22' : '#ffffff';
    const textColor = isDark ? '#8B949E' : '#333';
    const gridColor = isDark ? '#21262D' : '#f0f0f0';
    const borderColor = isDark ? '#30363D' : '#cccccc';

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: borderColor,
      },
      timeScale: {
        borderColor: borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    candleSeriesRef.current = candleSeries;

    // Add volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    volumeSeriesRef.current = volumeSeries;

    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Use ResizeObserver for accurate container sizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (chartRef.current) {
          chartRef.current.applyOptions({
            width: entry.contentRect.width,
          });
        }
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [height, isDark]);

  const prevDataRef = useRef<CandleData[]>([]);

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !data || data.length === 0) {
      return;
    }

    const prevData = prevDataRef.current;
    const isInitialLoad = prevData.length === 0;

    // Check if this is a full dataset change (symbol/interval switch)
    // by comparing the first candle's timestamp
    const isFullChange = !isInitialLoad && (
      prevData[0]?.time !== data[0]?.time ||
      Math.abs(prevData.length - data.length) > 2
    );

    if (isInitialLoad || isFullChange) {
      // Full setData — only on first load or symbol/interval change
      const candleData = data.map(d => ({
        time: d.time as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      candleSeriesRef.current.setData(candleData);

      if (data[0]?.volume !== undefined) {
        const volumeData = data.map(d => ({
          time: d.time as any,
          value: d.volume || 0,
          color: d.close >= d.open ? '#26a69a80' : '#ef535080',
        }));
        volumeSeriesRef.current.setData(volumeData);
      }

      if (isInitialLoad && chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } else {
      // Incremental update — only update the last candle(s)
      // Find where new data diverges from previous data
      const lastPrev = prevData[prevData.length - 1];
      const lastNew = data[data.length - 1];

      if (!lastNew) {
        prevDataRef.current = data;
        return;
      }

      // If there's a new candle (new timestamp), update it
      if (data.length > prevData.length) {
        // New candle appeared — update the previous last candle first (it may have finalized),
        // then add the new one
        const secondToLast = data[data.length - 2];
        if (secondToLast) {
          candleSeriesRef.current.update({
            time: secondToLast.time as any,
            open: secondToLast.open,
            high: secondToLast.high,
            low: secondToLast.low,
            close: secondToLast.close,
          });
          if (secondToLast.volume !== undefined) {
            volumeSeriesRef.current.update({
              time: secondToLast.time as any,
              value: secondToLast.volume || 0,
              color: secondToLast.close >= secondToLast.open ? '#26a69a80' : '#ef535080',
            });
          }
        }

        candleSeriesRef.current.update({
          time: lastNew.time as any,
          open: lastNew.open,
          high: lastNew.high,
          low: lastNew.low,
          close: lastNew.close,
        });
        if (lastNew.volume !== undefined) {
          volumeSeriesRef.current.update({
            time: lastNew.time as any,
            value: lastNew.volume || 0,
            color: lastNew.close >= lastNew.open ? '#26a69a80' : '#ef535080',
          });
        }
      } else {
        // Same number of candles — the last candle is still forming, just update it
        if (
          lastPrev.time === lastNew.time &&
          (lastPrev.open !== lastNew.open ||
            lastPrev.high !== lastNew.high ||
            lastPrev.low !== lastNew.low ||
            lastPrev.close !== lastNew.close)
        ) {
          candleSeriesRef.current.update({
            time: lastNew.time as any,
            open: lastNew.open,
            high: lastNew.high,
            low: lastNew.low,
            close: lastNew.close,
          });
          if (lastNew.volume !== undefined) {
            volumeSeriesRef.current.update({
              time: lastNew.time as any,
              value: lastNew.volume || 0,
              color: lastNew.close >= lastNew.open ? '#26a69a80' : '#ef535080',
            });
          }
        }
      }
    }

    prevDataRef.current = data;
  }, [data]);

  return <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', height: '100%' }} />;
};
