import type { DailyBalance } from 'entities/transaction';
import type { DemoScenario } from 'shared/config';
import { addDays } from 'shared/lib';
import type { CashGapForecast, ForecastConfidence } from './types';

const longWindowDays = 28;
const nearHorizonDays = 7;
const clearHorizonDays = 21;

const burnOverWindow = (balances: readonly DailyBalance[], windowDays: number): number => {
  const last = balances[balances.length - 1];
  const first = balances[balances.length - 1 - windowDays];
  if (!last || !first) {
    return 0;
  }
  return (first.balance - last.balance) / windowDays;
};

const confidenceFromHorizon = (daysUntilGap: number): ForecastConfidence => {
  if (daysUntilGap < nearHorizonDays) {
    return 'высокая';
  }
  if (daysUntilGap <= clearHorizonDays) {
    return 'средняя';
  }
  return 'низкая';
};

export const forecastCashGap = (
  balances: readonly DailyBalance[],
  scenario: DemoScenario,
): CashGapForecast => {
  const longBurn = burnOverWindow(balances, longWindowDays);
  const balanceToday = balances[balances.length - 1]?.balance ?? 0;

  if (longBurn <= 0 || balanceToday <= 0) {
    return { daysUntilGap: null, gapDate: null, dailyBurn: longBurn, confidence: 'низкая' };
  }

  const daysUntilGap = Math.floor(balanceToday / longBurn);
  return {
    daysUntilGap,
    gapDate: addDays(scenario.todayDate, daysUntilGap),
    dailyBurn: longBurn,
    confidence: confidenceFromHorizon(daysUntilGap),
  };
};
