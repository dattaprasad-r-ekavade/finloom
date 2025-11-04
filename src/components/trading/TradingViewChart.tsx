'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string;
  height?: number;
  theme?: 'light' | 'dark';
}

const TRADING_VIEW_SCRIPT_ID = 'tradingview-advanced-chart-script';

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  height = 520,
  theme = 'light',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const containerIdRef = useRef<string>(
    `tradingview-container-${Math.random().toString(36).slice(2)}`,
  );

  useEffect(() => {
    const loadScript = () =>
      new Promise<void>((resolve) => {
        if (document.getElementById(TRADING_VIEW_SCRIPT_ID)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.id = TRADING_VIEW_SCRIPT_ID;
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://s3.tradingview.com/tv.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    const createWidget = () => {
      if (
        typeof window === 'undefined' ||
        !window.TradingView ||
        !containerRef.current
      ) {
        return;
      }

      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol,
        interval: '15',
        timezone: 'Asia/Kolkata',
        theme,
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        calendar: true,
        container_id: containerIdRef.current,
        hide_side_toolbar: false,
        studies: ['Volume@tv-basicstudies'],
      });
    };

    loadScript().then(() => {
      if (!containerRef.current) {
        return;
      }
      containerRef.current.innerHTML = '';
      const container = document.createElement('div');
      container.id = containerIdRef.current;
      container.style.height = `${height}px`;
      containerRef.current.appendChild(container);
      createWidget();
    });

    return () => {
      if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
        widgetRef.current.remove();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, height, theme]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: height,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    />
  );
};
