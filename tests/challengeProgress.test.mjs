import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveProgressMetrics } from '../src/lib/challengeProgress.ts';

test('daily P&L is the change in equity, including an overnight open position', () => {
  const first = new Date('2026-09-21T18:30:00Z');
  const second = new Date('2026-09-22T18:30:00Z');
  const metrics = deriveProgressMetrics([
    { date: first, realizedPnl: 0, unrealizedPnl: -100 },
    { date: second, realizedPnl: -120, unrealizedPnl: 0 },
  ], [{ entryTime: new Date('2026-09-22T04:00:00Z'), exitTime: new Date('2026-09-23T04:00:00Z'), pnl: -120 }], 1000);

  assert.deepEqual(metrics.map((day) => [day.dailyPnl, day.cumulativePnl]), [[-100, -100], [-20, -120]]);
  assert.equal(metrics[1].maxDrawdown, 120);
  assert.equal(metrics[1].tradesCount, 0);
  assert.equal(metrics[1].winRate, 0);
});

test('trade counts and win rate are based on recorded trades', () => {
  const date = new Date('2026-09-22T18:30:00Z');
  const metrics = deriveProgressMetrics([{ date, realizedPnl: 25, unrealizedPnl: 0 }], [
    { entryTime: new Date('2026-09-23T04:00:00Z'), exitTime: new Date('2026-09-23T05:00:00Z'), pnl: 25 },
    { entryTime: new Date('2026-09-23T04:30:00Z'), exitTime: new Date('2026-09-23T05:30:00Z'), pnl: 0 },
  ], 1000);
  assert.equal(metrics[0].tradesCount, 2);
  assert.equal(metrics[0].winRate, 50);
});
