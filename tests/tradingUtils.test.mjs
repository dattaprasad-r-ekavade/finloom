import test from 'node:test';
import assert from 'node:assert/strict';
import { getISTStartOfDay, isMarketOpen, isEntryWindow } from '../src/lib/tradingUtils.ts';

test('IST boundaries are independent of the host timezone', () => {
  assert.equal(getISTStartOfDay(new Date('2026-09-24T10:00:00Z')).toISOString(), '2026-09-23T18:30:00.000Z');
  assert.equal(isMarketOpen(new Date('2026-09-24T03:44:00Z')), false);
  assert.equal(isMarketOpen(new Date('2026-09-24T03:45:00Z')), true);
  assert.equal(isMarketOpen(new Date('2026-09-24T10:00:00Z')), false);
  assert.equal(isEntryWindow(new Date('2026-09-24T09:44:00Z')), true);
  assert.equal(isEntryWindow(new Date('2026-09-24T09:45:00Z')), false);
  assert.equal(isMarketOpen(new Date('2026-09-26T04:00:00Z')), false);
});
