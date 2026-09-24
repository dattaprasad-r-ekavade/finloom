// A daily summary is a snapshot: realizedPnl is for that day, while
// unrealizedPnl is the open-position value at the time of the snapshot.
export interface DailySnapshot {
  date: Date;
  realizedPnl: number;
  unrealizedPnl: number;
}

export interface RecordedTrade {
  entryTime: Date;
  exitTime: Date | null;
  pnl: number;
}

export interface ProgressMetric {
  id: string;
  date: Date;
  dailyPnl: number;
  cumulativePnl: number;
  tradesCount: number;
  winRate: number;
  maxDrawdown: number;
  profitTarget: number;
  violations: number;
}

export function deriveProgressMetrics(
  summaries: DailySnapshot[],
  trades: RecordedTrade[],
  profitTarget: number,
): ProgressMetric[] {
  let cumulativeRealized = 0;
  let previousEquityPnl = 0;
  let peakEquityPnl = 0;
  let maxDrawdown = 0;

  return [...summaries]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((snapshot) => {
      cumulativeRealized += snapshot.realizedPnl;
      const equityPnl = cumulativeRealized + snapshot.unrealizedPnl;
      const dailyPnl = equityPnl - previousEquityPnl;
      previousEquityPnl = equityPnl;
      peakEquityPnl = Math.max(peakEquityPnl, equityPnl);
      maxDrawdown = Math.max(maxDrawdown, peakEquityPnl - equityPnl);

      const entries = trades.filter((trade) =>
        trade.entryTime >= snapshot.date &&
        trade.entryTime < new Date(snapshot.date.getTime() + 86_400_000),
      );
      const closed = trades.filter((trade) => trade.exitTime && trade.exitTime < new Date(snapshot.date.getTime() + 86_400_000));
      const wins = closed.filter((trade) => trade.pnl > 0).length;

      return {
        id: snapshot.date.toISOString(),
        date: snapshot.date,
        dailyPnl,
        cumulativePnl: equityPnl,
        tradesCount: entries.length,
        winRate: closed.length ? (wins / closed.length) * 100 : 0,
        maxDrawdown,
        profitTarget,
        violations: 0,
      };
    });
}
