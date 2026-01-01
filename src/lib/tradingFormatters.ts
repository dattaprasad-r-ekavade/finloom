/**
 * Trading utilities and formatting functions
 * Centralized helpers for common trading calculations and formatting
 */

/**
 * Format number as Indian Rupees currency
 */
export const formatCurrency = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format number as percentage
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with K, L, Cr suffixes (Indian number system)
 */
export const formatLargeNumber = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 10000000) {
    // 1 Crore = 10,000,000
    return `${sign}₹${(absValue / 10000000).toFixed(2)}Cr`;
  } else if (absValue >= 100000) {
    // 1 Lakh = 100,000
    return `${sign}₹${(absValue / 100000).toFixed(2)}L`;
  } else if (absValue >= 1000) {
    // 1 Thousand = 1,000
    return `${sign}₹${(absValue / 1000).toFixed(2)}K`;
  }
  return formatCurrency(value);
};

/**
 * Calculate P&L percentage
 */
export const calculatePnLPercentage = (
  pnl: number,
  capital: number,
): number => {
  if (capital === 0) return 0;
  return (pnl / capital) * 100;
};

/**
 * Calculate order value
 */
export const calculateOrderValue = (
  quantity: number,
  price: number,
): number => {
  return quantity * price;
};

/**
 * Calculate position size as percentage of capital
 */
export const calculatePositionPercentage = (
  positionValue: number,
  totalCapital: number,
): number => {
  if (totalCapital === 0) return 0;
  return (positionValue / totalCapital) * 100;
};

/**
 * Get risk level color based on percentage threshold
 */
export const getRiskLevelColor = (
  percentage: number,
  thresholds: {
    safe: number;
    caution: number;
    danger: number;
  } = { safe: 50, caution: 70, danger: 90 },
): 'success' | 'warning' | 'error' => {
  if (percentage < thresholds.safe) return 'success';
  if (percentage < thresholds.caution) return 'warning';
  return 'error';
};

/**
 * Format date for trading logs
 */
export const formatTradeDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Format time duration (e.g., holding time)
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};

/**
 * Check if market hours (simplified - 9:15 AM to 3:30 PM IST)
 */
export const isMarketHours = (): boolean => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = hours * 60 + minutes;

  // Market: 9:15 AM (555) to 3:30 PM (930)
  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;

  return time >= marketOpen && time <= marketClose;
};

/**
 * Calculate expected P&L for a trade
 */
export const calculateExpectedPnL = (
  entryPrice: number,
  currentPrice: number,
  quantity: number,
  tradeType: 'BUY' | 'SELL',
): number => {
  if (tradeType === 'BUY') {
    return (currentPrice - entryPrice) * quantity;
  } else {
    return (entryPrice - currentPrice) * quantity;
  }
};

/**
 * Validate trade against risk limits
 */
export interface RiskLimits {
  maxPositionSize: number; // % of capital
  maxDailyLoss: number; // absolute value
  maxDrawdown: number; // absolute value
  maxOpenPositions: number;
}

export interface RiskValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateTradeRisk = (
  orderValue: number,
  currentDailyPnL: number,
  currentDrawdown: number,
  openPositionsCount: number,
  accountSize: number,
  limits: RiskLimits,
): RiskValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check position size
  const positionPct = (orderValue / accountSize) * 100;
  if (positionPct > limits.maxPositionSize) {
    errors.push(
      `Position size (${positionPct.toFixed(1)}%) exceeds limit (${limits.maxPositionSize}%)`,
    );
  } else if (positionPct > limits.maxPositionSize * 0.8) {
    warnings.push(
      `Position size is ${positionPct.toFixed(1)}% of capital (approaching ${limits.maxPositionSize}% limit)`,
    );
  }

  // Check daily loss
  if (currentDailyPnL < -limits.maxDailyLoss) {
    errors.push(
      `Daily loss ${formatCurrency(Math.abs(currentDailyPnL))} exceeds limit ${formatCurrency(limits.maxDailyLoss)}`,
    );
  } else if (currentDailyPnL < -limits.maxDailyLoss * 0.8) {
    warnings.push(
      `Daily loss approaching limit (${formatCurrency(Math.abs(currentDailyPnL))} / ${formatCurrency(limits.maxDailyLoss)})`,
    );
  }

  // Check max drawdown
  if (currentDrawdown > limits.maxDrawdown) {
    errors.push(
      `Drawdown ${formatCurrency(currentDrawdown)} exceeds limit ${formatCurrency(limits.maxDrawdown)}`,
    );
  }

  // Check open positions
  if (openPositionsCount >= limits.maxOpenPositions) {
    errors.push(`Maximum open positions limit reached (${limits.maxOpenPositions})`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get color for P&L display
 */
export const getPnLColor = (pnl: number): 'success.main' | 'error.main' | 'text.secondary' => {
  if (pnl > 0) return 'success.main';
  if (pnl < 0) return 'error.main';
  return 'text.secondary';
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};
