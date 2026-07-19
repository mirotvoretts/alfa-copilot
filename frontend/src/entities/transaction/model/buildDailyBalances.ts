import type { DemoScenario } from 'shared/config';
import { addDays } from 'shared/lib';
import type { DailyBalance, Transaction } from './types';

export const buildDailyBalances = (
  transactions: readonly Transaction[],
  scenario: DemoScenario,
): DailyBalance[] => {
  const dailyTotals = new Map<string, number>();
  for (const transaction of transactions) {
    dailyTotals.set(
      transaction.date,
      (dailyTotals.get(transaction.date) ?? 0) + transaction.amount,
    );
  }

  const balances: DailyBalance[] = [];
  let runningBalance = scenario.openingBalance;
  for (let dayOffset = 0; dayOffset < scenario.totalDays; dayOffset += 1) {
    const date = addDays(scenario.startDate, dayOffset);
    runningBalance += dailyTotals.get(date) ?? 0;
    balances.push({ date, balance: runningBalance });
  }
  return balances;
};
