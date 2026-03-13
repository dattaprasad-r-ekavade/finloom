'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
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
  liveStreamUrl?: string;
  onLTPUpdate?: (ltp: number) => void;
}

interface ChartMutableState {
  prevData: CandleData[];
  liveCandle: CandleData | null;
}

const UP_COLOR = '#26a69a';
const DOWN_COLOR = '#ef5350';

export const AngelOneChart: React.FC<AngelOneChartProps> = ({
  data,
  height = 600,
  liveStreamUrl,
  onLTPUpdate,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const chartStateRef = useRef<ChartMutableState>({
    prevData: [],
    liveCandle: null,
  });
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const bgColor = isDark ? '#161B22' : '#ffffff';
    const textColor = isDark ? '#8B949E' : '#333';
    const gridColor = isDark ? '#21262D' : '#f0f0f0';
    const borderColor = isDark ? '#30363D' : '#cccccc';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor,
      },
      timeScale: {
        borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: UP_COLOR,
      downColor: DOWN_COLOR,
      borderVisible: false,
      wickUpColor: UP_COLOR,
      wickDownColor: DOWN_COLOR,
    });

    volumeSeriesRef.current = chart.addSeries(HistogramSeries, {
      color: UP_COLOR,
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chartRef.current?.applyOptions({
          width: entry.contentRect.width,
        });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      chartStateRef.current = {
        prevData: [],
        liveCandle: null,
      };
    };
  }, [height, isDark]);

  useEffect(() => {
    const chartState = chartStateRef.current;
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;

    if (!candleSeries || !volumeSeries || data.length === 0) {
      chartStateRef.current = {
        ...chartState,
        prevData: [],
      };
      return;
    }

    const prevData = chartState.prevData;
    const isInitialLoad = prevData.length === 0;
    const isFullChange =
      !isInitialLoad &&
      (prevData[0]?.time !== data[0]?.time ||
        Math.abs(prevData.length - data.length) > 2);

    if (isInitialLoad || isFullChange) {
      const candleData = data.map((item) => ({
        time: item.time as never,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));
      candleSeries.setData(candleData);

      if (data[0]?.volume !== undefined) {
        volumeSeries.setData(
          data.map((item) => ({
            time: item.time as never,
            value: item.volume || 0,
            color: item.close >= item.open ? `${UP_COLOR}80` : `${DOWN_COLOR}80`,
          })),
        );
      }

      if (isInitialLoad) {
        chartRef.current?.timeScale().fitContent();
      }

      chartStateRef.current = {
        prevData: data,
        liveCandle: null,
      };
      return;
    }

    const lastPrev = prevData[prevData.length - 1];
    const lastNew = data[data.length - 1];

    if (!lastNew) {
      chartStateRef.current = {
        ...chartState,
        prevData: data,
      };
      return;
    }

    if (data.length > prevData.length) {
      const secondToLast = data[data.length - 2];
      if (secondToLast) {
        candleSeries.update({
          time: secondToLast.time as never,
          open: secondToLast.open,
          high: secondToLast.high,
          low: secondToLast.low,
          close: secondToLast.close,
        });

        if (secondToLast.volume !== undefined) {
          volumeSeries.update({
            time: secondToLast.time as never,
            value: secondToLast.volume || 0,
            color:
              secondToLast.close >= secondToLast.open
                ? `${UP_COLOR}80`
                : `${DOWN_COLOR}80`,
          });
        }
      }

      candleSeries.update({
        time: lastNew.time as never,
        open: lastNew.open,
        high: lastNew.high,
        low: lastNew.low,
        close: lastNew.close,
      });

      if (lastNew.volume !== undefined) {
        volumeSeries.update({
          time: lastNew.time as never,
          value: lastNew.volume || 0,
          color: lastNew.close >= lastNew.open ? `${UP_COLOR}80` : `${DOWN_COLOR}80`,
        });
      }
    } else if (
      lastPrev.time === lastNew.time &&
      (lastPrev.open !== lastNew.open ||
        lastPrev.high !== lastNew.high ||
        lastPrev.low !== lastNew.low ||
        lastPrev.close !== lastNew.close)
    ) {
      candleSeries.update({
        time: lastNew.time as never,
        open: lastNew.open,
        high: lastNew.high,
        low: lastNew.low,
        close: lastNew.close,
      });

      if (lastNew.volume !== undefined) {
        volumeSeries.update({
          time: lastNew.time as never,
          value: lastNew.volume || 0,
          color: lastNew.close >= lastNew.open ? `${UP_COLOR}80` : `${DOWN_COLOR}80`,
        });
      }
    }

    chartStateRef.current = {
      ...chartStateRef.current,
      prevData: data,
    };
  }, [data]);

  useEffect(() => {
    if (!liveStreamUrl) {
      chartStateRef.current = {
        ...chartStateRef.current,
        liveCandle: null,
      };
      return;
    }

    const eventSource = new EventSource(liveStreamUrl);

    eventSource.onmessage = (event) => {
      try {
        const tick: {
          ltp: number;
          time: number;
          candleTimeMs?: number;
          open?: number;
          high?: number;
          low?: number;
          close?: number;
          volume?: number;
        } = JSON.parse(event.data);

        const { ltp, time } = tick;
        if (typeof ltp !== 'number' || !Number.isFinite(ltp)) {
          return;
        }

        onLTPUpdate?.(ltp);

        if (
          tick.candleTimeMs != null &&
          tick.open != null &&
          tick.high != null &&
          tick.low != null &&
          tick.close != null
        ) {
          const candleTs = Math.floor(tick.candleTimeMs / 1000);
          const liveCandle = {
            time: candleTs,
            open: tick.open,
            high: tick.high,
            low: tick.low,
            close: tick.close,
          };

          chartStateRef.current = {
            ...chartStateRef.current,
            liveCandle,
          };

          candleSeriesRef.current?.update({
            time: candleTs as never,
            open: tick.open,
            high: tick.high,
            low: tick.low,
            close: tick.close,
          });
          return;
        }

        const minuteTs = Math.floor(time / 60000) * 60;
        const prev = chartStateRef.current.liveCandle;
        const liveCandle =
          !prev || minuteTs > prev.time
            ? { time: minuteTs, open: ltp, high: ltp, low: ltp, close: ltp }
            : {
                time: prev.time,
                open: prev.open,
                high: Math.max(prev.high, ltp),
                low: Math.min(prev.low, ltp),
                close: ltp,
              };

        chartStateRef.current = {
          ...chartStateRef.current,
          liveCandle,
        };

        candleSeriesRef.current?.update({
          time: liveCandle.time as never,
          open: liveCandle.open,
          high: liveCandle.high,
          low: liveCandle.low,
          close: liveCandle.close,
        });
      } catch {
        // Ignore malformed SSE messages.
      }
    };

    eventSource.onerror = () => {
      // EventSource reconnects automatically.
    };

    return () => {
      eventSource.close();
      chartStateRef.current = {
        ...chartStateRef.current,
        liveCandle: null,
      };
    };
  }, [liveStreamUrl, onLTPUpdate]);

  return (
    <div
      ref={chartContainerRef}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    />
  );
};
