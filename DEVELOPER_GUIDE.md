# Developer Guide: Trading Platform Best Practices

## Quick Start Guide

This guide shows you how to use the new custom hooks and utilities when building trading features.

## Table of Contents
1. [Using Trading Data Hook](#using-trading-data-hook)
2. [Using Order Execution Hook](#using-order-execution-hook)
3. [Using Chart Data Hook](#using-chart-data-hook)
4. [Using Formatters](#using-formatters)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Common Patterns](#common-patterns)

---

## Using Trading Data Hook

### Basic Setup
```typescript
import { useTradingData } from '@/hooks/useTradingData';

function MyTradingComponent() {
  const user = useAuthStore((state) => state.user);
  
  const {
    selection,        // Current challenge selection
    summary,          // Trading summary data
    trades,           // List of all trades
    challengeId,      // Active challenge ID
    isChallengeActive, // Boolean: is challenge active?
    initializing,     // Loading state
    isRefreshing,     // Refresh in progress
    error,            // Error message if any
    refreshData,      // Manual refresh function
  } = useTradingData({ userId: user?.id });
  
  // Use the data
  if (initializing) return <LoadingOverlay />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!selection) return <NoChallenge />;
  
  return (
    <div>
      <h1>{selection.plan.name}</h1>
      <p>Account Size: ₹{selection.plan.accountSize}</p>
      {/* Your trading UI */}
    </div>
  );
}
```

### Auto-Refresh Pattern
```typescript
// Data auto-refreshes when selection changes
// No manual useEffect needed!

// Manual refresh on user action
<Button onClick={refreshData}>Refresh</Button>
```

---

## Using Order Execution Hook

### Basic Setup
```typescript
import { useOrderExecution } from '@/hooks/useOrderExecution';

function OrderPanel() {
  const { selection, refreshData } = useTradingData({...});
  
  const {
    isSubmitting,
    processingTrades,
    squaringOffAll,
    orderConfirmation,
    handlePlaceOrder,
    handleConfirmOrder,
    handleSquareOff,
    handleSquareOffAll,
    setOrderConfirmation,
  } = useOrderExecution({
    challengeId: selection?.id ?? null,
    accountSize: selection?.plan.accountSize ?? 0,
    onSuccess: (msg) => showToast(msg, 'success'),
    onError: (msg) => showToast(msg, 'error'),
    onRefresh: refreshData,
  });
  
  // Place an order
  const placeOrder = () => {
    handlePlaceOrder({
      scrip: selectedStock,
      quantity: 100,
      tradeType: 'BUY',
    });
  };
  
  return (
    <>
      <Button onClick={placeOrder} disabled={isSubmitting}>
        {isSubmitting ? 'Placing...' : 'Buy'}
      </Button>
      
      {/* Confirmation dialog automatically shows for large orders */}
      <OrderConfirmationDialog
        open={orderConfirmation.open}
        orderDetails={orderConfirmation.payload?.orderDetails}
        onConfirm={handleConfirmOrder}
        onCancel={() => setOrderConfirmation({ open: false, payload: null })}
      />
    </>
  );
}
```

### Square Off Single Trade
```typescript
<Button 
  onClick={() => handleSquareOff(trade.id)}
  disabled={processingTrades.has(trade.id)}
>
  {processingTrades.has(trade.id) ? 'Processing...' : 'Square Off'}
</Button>
```

### Square Off All Trades
```typescript
<Button 
  onClick={() => handleSquareOffAll(openTrades)}
  disabled={squaringOffAll}
>
  {squaringOffAll ? 'Squaring Off...' : 'Square Off All'}
</Button>
```

---

## Using Chart Data Hook

### Basic Setup
```typescript
import { useChartData } from '@/hooks/useChartData';

function ChartPanel() {
  const [selectedScrip, setSelectedScrip] = useState(DEFAULT_SYMBOL);
  
  const {
    historicalData,
    chartInterval,
    isLoadingChart,
    priceUpdateTrigger,
    setChartInterval,
    refreshChartData,
  } = useChartData({
    selectedScrip,
    refreshInterval: 5000, // Auto-refresh every 5 seconds
  });
  
  return (
    <>
      {/* Chart Interval Selector */}
      <select value={chartInterval} onChange={(e) => setChartInterval(e.target.value)}>
        <option value="ONE_MINUTE">1m</option>
        <option value="FIVE_MINUTE">5m</option>
        <option value="ONE_HOUR">1h</option>
      </select>
      
      {/* Chart Display */}
      {isLoadingChart ? (
        <LoadingSpinner />
      ) : (
        <AngelOneChart data={historicalData} />
      )}
      
      {/* Price Flash Animation */}
      <PriceUpdateFlash trigger={priceUpdateTrigger}>
        <Typography>LTP: ₹{selectedScrip.ltp}</Typography>
      </PriceUpdateFlash>
    </>
  );
}
```

### Custom Refresh Interval
```typescript
// Disable auto-refresh
useChartData({ selectedScrip, refreshInterval: 0 });

// Refresh every 10 seconds
useChartData({ selectedScrip, refreshInterval: 10000 });
```

---

## Using Formatters

### Currency Formatting
```typescript
import { formatCurrency, formatLargeNumber } from '@/lib/tradingFormatters';

// Basic currency
formatCurrency(1234.56);       // ₹1,235
formatCurrency(1234.56, 2);    // ₹1,234.56

// Large numbers with suffixes
formatLargeNumber(1500);        // ₹1,500
formatLargeNumber(150000);      // ₹1.50L
formatLargeNumber(10000000);    // ₹1.00Cr
```

### Percentage Formatting
```typescript
import { formatPercentage, calculatePnLPercentage } from '@/lib/tradingFormatters';

formatPercentage(5.67);                    // +5.67%
formatPercentage(-2.34);                   // -2.34%
calculatePnLPercentage(5000, 100000);      // 5.00
```

### Risk Level Colors
```typescript
import { getRiskLevelColor, getPnLColor } from '@/lib/tradingFormatters';

// Get color based on risk percentage
const color = getRiskLevelColor(75);  // 'warning' (caution)

// Get color for P&L display
const pnlColor = getPnLColor(1250);   // 'success.main' (profit)
const pnlColor2 = getPnLColor(-500);  // 'error.main' (loss)
```

### Date and Duration
```typescript
import { formatTradeDate, formatDuration } from '@/lib/tradingFormatters';

formatTradeDate(new Date());           // "14 Dec, 2024 02:30 PM"
formatDuration(90000);                 // "1m 30s"
formatDuration(7200000);               // "2h"
```

### Risk Validation
```typescript
import { validateTradeRisk, RiskLimits } from '@/lib/tradingFormatters';

const limits: RiskLimits = {
  maxPositionSize: 20,      // 20% of capital
  maxDailyLoss: 5000,       // ₹5,000
  maxDrawdown: 10000,       // ₹10,000
  maxOpenPositions: 5,      // 5 positions
};

const result = validateTradeRisk(
  orderValue: 15000,
  currentDailyPnL: -3000,
  currentDrawdown: 7000,
  openPositionsCount: 3,
  accountSize: 100000,
  limits
);

if (!result.isValid) {
  // Show errors
  result.errors.forEach(err => console.error(err));
}

if (result.warnings.length > 0) {
  // Show warnings
  result.warnings.forEach(warn => console.warn(warn));
}
```

---

## Keyboard Shortcuts

### Setup
```typescript
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function TradingTerminal() {
  useKeyboardShortcuts({
    onBuy: () => {
      // Focus buy button or quick buy action
      console.log('Quick Buy activated');
    },
    onSell: () => {
      // Focus sell button or quick sell action
      console.log('Quick Sell activated');
    },
    onEscape: () => {
      // Close modals
      closeAllModals();
    },
    onSquareOffAll: () => {
      // Square off all positions
      handleSquareOffAll();
    },
    onRefresh: () => {
      // Refresh data
      refreshData();
    },
    enabled: true, // Can be conditionally disabled
  });
  
  return <div>...</div>;
}
```

### Keyboard Map
- **B** - Quick Buy
- **S** - Quick Sell
- **ESC** - Close modals
- **Ctrl+Q** - Square Off All
- **R** - Refresh data

**Note:** Shortcuts automatically disabled when typing in input fields.

---

## Common Patterns

### Complete Trading Page Setup
```typescript
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTradingData } from '@/hooks/useTradingData';
import { useOrderExecution } from '@/hooks/useOrderExecution';
import { useChartData } from '@/hooks/useChartData';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { formatCurrency, formatPercentage } from '@/lib/tradingFormatters';

export default function TradingPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedScrip, setSelectedScrip] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  
  // Data management
  const tradingData = useTradingData({ userId: user?.id });
  
  // Order execution
  const orderExecution = useOrderExecution({
    challengeId: tradingData.challengeId,
    accountSize: tradingData.selection?.plan.accountSize ?? 0,
    onSuccess: (msg) => setToast({ open: true, message: msg, severity: 'success' }),
    onError: (msg) => setToast({ open: true, message: msg, severity: 'error' }),
    onRefresh: tradingData.refreshData,
  });
  
  // Chart management
  const chartData = useChartData({
    selectedScrip,
    refreshInterval: 5000,
  });
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    onBuy: () => console.log('Quick Buy'),
    onSell: () => console.log('Quick Sell'),
    onEscape: () => console.log('Close modals'),
    onSquareOffAll: () => orderExecution.handleSquareOffAll(openTrades),
    onRefresh: tradingData.refreshData,
    enabled: tradingData.isChallengeActive,
  });
  
  if (tradingData.initializing) return <LoadingOverlay />;
  if (!tradingData.selection) return <NoChallenge />;
  
  return (
    <div>
      {/* Your trading UI */}
      <RiskDashboard {...riskProps} />
      <Chart data={chartData.historicalData} />
      <OrderForm onPlaceOrder={orderExecution.handlePlaceOrder} />
      <TradesList 
        trades={tradingData.trades}
        onSquareOff={orderExecution.handleSquareOff}
      />
      
      <ToastNotification
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}
```

### Error Handling Pattern
```typescript
const {
  selection,
  error,
  initializing,
} = useTradingData({ userId });

if (initializing) {
  return <LoadingOverlay message="Loading..." />;
}

if (error) {
  return (
    <Alert severity="error" onClose={() => setError(null)}>
      {error}
    </Alert>
  );
}

if (!selection) {
  return (
    <Alert severity="warning">
      No active challenge found
    </Alert>
  );
}

// Normal rendering
return <TradingTerminal />;
```

### Loading States Pattern
```typescript
const { isSubmitting } = useOrderExecution({...});
const { isLoadingChart } = useChartData({...});
const { isRefreshing } = useTradingData({...});

// Button loading state
<Button disabled={isSubmitting || isRefreshing}>
  {isSubmitting ? 'Placing Order...' : 'Place Order'}
</Button>

// Chart loading state
{isLoadingChart ? <Skeleton /> : <Chart data={...} />}

// Refresh indicator
<IconButton onClick={refreshData} disabled={isRefreshing}>
  <RefreshIcon className={isRefreshing ? 'spinning' : ''} />
</IconButton>
```

### Toast Notification Pattern
```typescript
const [toast, setToast] = useState({
  open: false,
  message: '',
  severity: 'info' as 'success' | 'error' | 'info' | 'warning',
});

const showToast = (message: string, severity: typeof toast.severity) => {
  setToast({ open: true, message, severity });
};

// Use in callbacks
const orderExecution = useOrderExecution({
  onSuccess: (msg) => showToast(msg, 'success'),
  onError: (msg) => showToast(msg, 'error'),
  //...
});

// Render
<ToastNotification
  open={toast.open}
  message={toast.message}
  severity={toast.severity}
  onClose={() => setToast({ ...toast, open: false })}
/>
```

---

## Performance Tips

### 1. Memoize Expensive Calculations
```typescript
import { useMemo } from 'react';

const openTrades = useMemo(
  () => trades.filter((t) => t.status === 'OPEN'),
  [trades]
);
```

### 2. Debounce Search Inputs
```typescript
import { debounce } from '@/lib/tradingFormatters';

const debouncedSearch = useMemo(
  () => debounce((query) => searchScrips(query), 300),
  []
);
```

### 3. Conditional Hook Execution
```typescript
// Only fetch chart data if scrip is selected
const chartData = useChartData({
  selectedScrip,
  refreshInterval: selectedScrip ? 5000 : 0,
});
```

---

## Testing Examples

### Testing Custom Hooks
```typescript
import { renderHook, act } from '@testing-library/react';
import { useTradingData } from '@/hooks/useTradingData';

describe('useTradingData', () => {
  it('should load trading data', async () => {
    const { result } = renderHook(() => 
      useTradingData({ userId: 'test-user' })
    );
    
    expect(result.current.initializing).toBe(true);
    
    await act(async () => {
      // Wait for data to load
    });
    
    expect(result.current.initializing).toBe(false);
    expect(result.current.selection).toBeDefined();
  });
});
```

### Testing Formatters
```typescript
import { formatCurrency, formatPercentage } from '@/lib/tradingFormatters';

describe('tradingFormatters', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts', () => {
      expect(formatCurrency(1234)).toBe('₹1,234');
    });
    
    it('should format negative amounts', () => {
      expect(formatCurrency(-1234)).toBe('-₹1,234');
    });
  });
  
  describe('formatPercentage', () => {
    it('should add plus sign for positive', () => {
      expect(formatPercentage(5.5)).toBe('+5.50%');
    });
  });
});
```

---

## Troubleshooting

### Hook not updating?
- Check dependency arrays
- Ensure userId is defined
- Look for console errors

### Orders not placing?
- Verify challengeId is not null
- Check isChallengeActive is true
- Inspect network tab for API errors

### Chart not refreshing?
- Confirm refreshInterval > 0
- Check selectedScrip has valid data
- Verify API is returning data

### Keyboard shortcuts not working?
- Check if input fields are focused
- Verify enabled prop is true
- Look for event conflicts

---

## Additional Resources

- [Trading Utils API Documentation](./src/lib/tradingUtils.ts)
- [Challenge Credentials Helper](./src/lib/challengeCredentials.ts)
- [Date Formatting Utils](./src/lib/dateFormat.ts)
- [API Response Helper](./src/lib/apiResponse.ts)

---

## Support

For questions or issues:
1. Check error messages in browser console
2. Review network tab for API failures
3. Refer to this guide for usage examples
4. Check TypeScript types for hook parameters

---

**Last Updated:** December 2024  
**Version:** 1.0.0
