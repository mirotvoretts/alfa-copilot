import type { RiskThresholds } from 'shared/config';
import type { RiskLevel } from './types';

export const classifyRisk = (
  daysUntilGap: number | null,
  thresholds: RiskThresholds,
): RiskLevel => {
  if (daysUntilGap === null || daysUntilGap > thresholds.greenFromDays) {
    return 'green';
  }
  if (daysUntilGap >= thresholds.yellowFromDays) {
    return 'yellow';
  }
  return 'red';
};
