import { ChallengePlan } from '@prisma/client';

export interface MockMetric {
  date: Date;
  dailyPnl: number;
  cumulativePnl: number;
  tradesCount: number;
  winRate: number;
  maxDrawdown: number;
  profitTarget: number;
  violations: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const buildMockMetrics = (
  plan: ChallengePlan,
  startDate: Date,
  daysToGenerate = Math.min(plan.durationDays, 20)
): MockMetric[] => {
  const profitTargetAmount = plan.accountSize * (plan.profitTargetPct / 100);
  const maxLossAmount = plan.accountSize * (plan.maxLossPct / 100);
  const dailyBase = profitTargetAmount / (daysToGenerate * 1.25);

  const metrics: MockMetric[] = [];
  let cumulative = 0;
  let runningDrawdown = 0;

  for (let index = 0; index < daysToGenerate; index += 1) {
    const dayMultiplier = 0.75 + Math.random() * 0.5;
    let dailyPnl = dailyBase * dayMultiplier;

    if (index % 5 === 4) {
      dailyPnl *= 0.5;
    }

    cumulative += dailyPnl;
    const drawdownCandidate = Math.max(0, maxLossAmount * Math.random() * 0.3);
    runningDrawdown = Math.max(runningDrawdown, drawdownCandidate);

    const tradesCount = Math.round(3 + Math.random() * 5);
    const winRate = clamp(55 + Math.random() * 20, 50, 90);

    metrics.push({
      date: new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000),
      dailyPnl,
      cumulativePnl: cumulative,
      tradesCount,
      winRate,
      maxDrawdown: clamp(runningDrawdown, 0, maxLossAmount),
      profitTarget: profitTargetAmount,
      violations: 0,
    });
  }

  return metrics;
};
