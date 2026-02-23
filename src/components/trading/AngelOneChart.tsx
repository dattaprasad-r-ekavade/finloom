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

  const dataRef = useRef<string>('');

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !data || data.length === 0) {
      return;
    }

    // Create a hash of the data to check if it has changed
    const dataHash = JSON.stringify(data.map(d => ({ t: d.time, c: d.close })));

    // Skip update if data hasn't changed
    if (dataRef.current === dataHash) {
      return;
    }

    dataRef.current = dataHash;

    // Update candle data (using update for smooth transition)
    const candleData = data.map(d => ({
      time: d.time as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candleSeriesRef.current.setData(candleData);

    // Update volume data
    if (data[0].volume !== undefined) {
      const volumeData = data.map(d => ({
        time: d.time as any,
        value: d.volume || 0,
        color: d.close >= d.open ? '#26a69a80' : '#ef535080',
      }));

      volumeSeriesRef.current.setData(volumeData);
    }

    // Fit content only on first load
    if (chartRef.current && !dataRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  return <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', height: '100%' }} />;
};
