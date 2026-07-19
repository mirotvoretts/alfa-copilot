import type { DailyBalance } from 'entities/transaction';
import type { DemoScenario } from 'shared/config';
import { addDays } from 'shared/lib';
import type { CashGapForecast, ForecastConfidence } from './types';

const longWindowDays = 28;
const shortWindowDays = 14;

const burnOverWindow = (balances: readonly DailyBalance[], windowDays: number): number => {
  const last = balances[balances.length - 1];
  const first = balances[balances.length - 1 - windowDays];
  if (!last || !first) {
    return 0;
  }
  return (first.balance - last.balance) / windowDays;
};

const confidenceFromWindows = (longBurn: number, shortBurn: number): ForecastConfidence => {
  if (longBurn <= 0 || shortBurn <= 0) {
    return 'низкая';
  }
  const deviation = Math.abs(shortBurn - longBurn) / longBurn;
  if (deviation < 0.25) {
    return 'высокая';
  }
  if (deviation < 0.6) {
    return 'средняя';
  }
  return 'низкая';
};

export const forecastCashGap = (
  balances: readonly DailyBalance[],
  scenario: DemoScenario,
): CashGapForecast => {
  const longBurn = burnOverWindow(balances, longWindowDays);
  const shortBurn = burnOverWindow(balances, shortWindowDays);
  const balanceToday = balances[balances.length - 1]?.balance ?? 0;

  if (longBurn <= 0 || balanceToday <= 0) {
    return { daysUntilGap: null, gapDate: null, dailyBurn: longBurn, confidence: 'низкая' };
  }

  const daysUntilGap = Math.floor(balanceToday / longBurn);
  return {
    daysUntilGap,
    gapDate: addDays(scenario.todayDate, daysUntilGap),
    dailyBurn: longBurn,
    confidence: confidenceFromWindows(longBurn, shortBurn),
  };
};
