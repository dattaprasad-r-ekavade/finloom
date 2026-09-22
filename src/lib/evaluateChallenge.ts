import { ChallengePlan, ChallengeMetrics, ChallengeStatus } from '@prisma/client';
import { formatDate } from './dateFormat';

export interface ViolationDetail {
  type: 'DAILY_LOSS' | 'MAX_LOSS' | 'DURATION_EXPIRED' | 'OTHER';
  date: Date;
  description: string;
  severity: 'WARNING' | 'CRITICAL';
}

export interface EvaluationResult {
  status: ChallengeStatus;
  passed: boolean;
  failed: boolean;
  reason: string;
  violations: ViolationDetail[];
  profitTargetAchieved: boolean;
  progressPct: number;
  eligibleForNextLevel: boolean;
}

interface ChallengeData {
  id: string;
  status: ChallengeStatus;
  startDate: Date | null;
  endDate: Date | null;
  currentPnl: number;
  maxDrawdown: number;
  violationCount: number;
  plan: ChallengePlan;
  metrics: Array<Pick<ChallengeMetrics, 'date' | 'dailyPnl' | 'cumulativePnl' | 'maxDrawdown'>>;
}

/**
 * Evaluates a challenge against all rules and determines pass/fail status
 */
export const evaluateChallenge = (challenge: ChallengeData): EvaluationResult => {
  const violations: ViolationDetail[] = [];
  let failed = false;
  let passed = false;
  let reason = '';

  // Skip evaluation if challenge is not active
  if (challenge.status !== 'ACTIVE') {
    return {
      status: challenge.status,
      passed: challenge.status === 'PASSED',
      failed: challenge.status === 'FAILED',
      reason: `Challenge is ${challenge.status}`,
      violations: [],
      profitTargetAchieved: false,
      progressPct: 0,
      eligibleForNextLevel: challenge.status === 'PASSED',
    };
  }

  const { plan, metrics, startDate, maxDrawdown } = challenge;
  
  // Calculate key metrics
  const latestMetric = metrics[metrics.length - 1];
  const cumulativePnl = Number.isFinite(challenge.currentPnl)
    ? challenge.currentPnl
    : latestMetric?.cumulativePnl ?? 0;
  const profitTargetAmount = plan.accountSize * (plan.profitTargetPct / 100);
  const maxLossAmount = plan.accountSize * (plan.maxLossPct / 100);
  const dailyLossLimit = plan.accountSize * (plan.dailyLossPct / 100);
  const progressPct = profitTargetAmount ? (cumulativePnl / profitTargetAmount) * 100 : 0;

  // A target reached during the allowed period remains achieved even if a
  // scheduled evaluator runs later. Daily snapshots provide that evidence.
  const now = new Date();
  const expiresAt = startDate
    ? new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
    : null;
  const isExpired = expiresAt !== null && now >= expiresAt;
  const targetReachedWithinDuration = metrics.some(
    (metric) => metric.date <= (expiresAt ?? now) && metric.cumulativePnl >= profitTargetAmount,
  );
  const targetCanPass = !isExpired ? cumulativePnl >= profitTargetAmount : targetReachedWithinDuration;

  // Rule 1: Check duration expiry
  if (startDate) {
    if (isExpired && !targetReachedWithinDuration) {
      violations.push({
        type: 'DURATION_EXPIRED',
        date: now,
        description: `Challenge duration of ${plan.durationDays} days expired before the profit target was reached`,
        severity: 'CRITICAL',
      });

      failed = true;
      reason = `Duration of ${plan.durationDays} days expired without reaching the target`;
    }
  }

  // Rule 2: Check max drawdown (max loss limit)
  const observedMaxDrawdown = Math.max(maxDrawdown, ...metrics.map((metric) => metric.maxDrawdown));
  if (observedMaxDrawdown > maxLossAmount) {
    violations.push({
      type: 'MAX_LOSS',
      date: new Date(),
      description: `Maximum drawdown of ${observedMaxDrawdown.toFixed(2)} exceeded the ${plan.maxLossPct}% limit (${maxLossAmount.toFixed(2)})`,
      severity: 'CRITICAL',
    });
    failed = true;
    reason = `Maximum loss limit of ${plan.maxLossPct}% exceeded`;
  }

  // Rule 3: Check daily loss violations
  metrics.forEach((metric) => {
    if (metric.dailyPnl < 0 && Math.abs(metric.dailyPnl) > dailyLossLimit) {
      violations.push({
        type: 'DAILY_LOSS',
        date: metric.date,
        description: `Daily loss of ${Math.abs(metric.dailyPnl).toFixed(2)} exceeded the ${plan.dailyLossPct}% daily limit (${dailyLossLimit.toFixed(2)})`,
        severity: 'CRITICAL',
      });

      failed = true;
      reason = `Daily loss limit of ${plan.dailyLossPct}% exceeded on ${formatDate(metric.date)}`;
    }
  });

  // Rule 4: Check profit target achievement (if not already failed)
  const profitTargetAchieved = targetCanPass;
  if (!failed && targetCanPass) {
    passed = true;
    reason = `Profit target of ${plan.profitTargetPct}% achieved (${cumulativePnl.toFixed(2)} / ${profitTargetAmount.toFixed(2)})`;
  }

  // Rule 5: Check cumulative loss
  if (cumulativePnl < -maxLossAmount) {
    violations.push({
      type: 'MAX_LOSS',
      date: new Date(),
      description: `Cumulative loss of ${Math.abs(cumulativePnl).toFixed(2)} exceeded the ${plan.maxLossPct}% limit (${maxLossAmount.toFixed(2)})`,
      severity: 'CRITICAL',
    });
    failed = true;
    reason = `Cumulative loss exceeded ${plan.maxLossPct}% maximum loss limit`;
  }

  // Determine final status
  let finalStatus: ChallengeStatus = 'ACTIVE';
  if (failed) {
    finalStatus = 'FAILED';
  } else if (passed) {
    finalStatus = 'PASSED';
  }

  // Determine eligibility for next level
  const eligibleForNextLevel = passed && plan.level < 3;

  return {
    status: finalStatus,
    passed: finalStatus === 'PASSED',
    failed,
    reason: reason || 'Challenge is still active and within all limits',
    violations,
    profitTargetAchieved,
    progressPct: Math.min(100, progressPct),
    eligibleForNextLevel,
  };
};

/**
 * Gets a summary message for the evaluation result
 */
export const getEvaluationSummary = (result: EvaluationResult): string => {
  if (result.passed) {
    return ` Congratulations! ${result.reason}`;
  } else if (result.failed) {
    return ` Challenge Failed: ${result.reason}`;
  } else {
    return ` Challenge Active: ${result.reason}`;
  }
};

/**
 * Determines the next challenge level for a user
 */
export const getNextChallengeLevel = (currentLevel: number, passed: boolean): number | null => {
  if (!passed) {
    return null;
  }
  
  if (currentLevel >= 3) {
    return null; // Max level reached
  }
  
  return currentLevel + 1;
};
