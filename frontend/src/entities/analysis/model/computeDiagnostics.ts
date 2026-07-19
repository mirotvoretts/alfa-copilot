import type { DailyBalance, Transaction } from 'entities/transaction';
import type { DemoScenario } from 'shared/config';
import { daysBetween } from 'shared/lib';
import type { Diagnostics, RevenueTrend } from './types';

const recentWindowDays = 28;

const detectTrend = (weeklyRevenue: readonly number[]): RevenueTrend => {
  const recentWeeks = weeklyRevenue.slice(-4);
  const previousWeeks = weeklyRevenue.slice(-8, -4);
  const sum = (values: readonly number[]): number =>
    values.reduce((total, value) => total + value, 0);
  const recentAverage = sum(recentWeeks) / Math.max(1, recentWeeks.length);
  const previousAverage = sum(previousWeeks) / Math.max(1, previousWeeks.length);
  if (recentAverage > previousAverage * 1.1) {
    return 'растет';
  }
  if (recentAverage < previousAverage * 0.9) {
    return 'падает';
  }
  return 'стабилен';
};

export const computeDiagnostics = (
  transactions: readonly Transaction[],
  balances: readonly DailyBalance[],
  scenario: DemoScenario,
): Diagnostics => {
  const weekCount = Math.ceil(scenario.totalDays / 7);
  const weeklyRevenue = Array.from({ length: weekCount }, () => 0);
  let serviceTotal = 0;
  let serviceCount = 0;
  let expenseTotal = 0;
  let equipmentExpenseTotal = 0;
  let recentExpenseTotal = 0;

  for (const transaction of transactions) {
    const dayOffset = daysBetween(scenario.startDate, transaction.date);
    if (transaction.amount > 0) {
      const weekIndex = Math.min(weekCount - 1, Math.floor(dayOffset / 7));
      weeklyRevenue[weekIndex] = (weeklyRevenue[weekIndex] ?? 0) + transaction.amount;
      if (transaction.category === 'услуга') {
        serviceTotal += transaction.amount;
        serviceCount += 1;
      }
    } else {
      expenseTotal += -transaction.amount;
      if (transaction.category === 'расход_оборудование') {
        equipmentExpenseTotal += -transaction.amount;
      }
      if (dayOffset >= scenario.totalDays - recentWindowDays) {
        recentExpenseTotal += -transaction.amount;
      }
    }
  }

  const balanceToday = balances[balances.length - 1]?.balance ?? 0;
  const dailyExpenseRate = recentExpenseTotal / recentWindowDays;
  const runwayDays = dailyExpenseRate > 0 ? Math.floor(balanceToday / dailyExpenseRate) : 0;

  return {
    averageTicket: serviceCount > 0 ? Math.round(serviceTotal / serviceCount) : 0,
    weeklyRevenue,
    trend: detectTrend(weeklyRevenue),
    runwayDays,
    largeExpenseShare: expenseTotal > 0 ? equipmentExpenseTotal / expenseTotal : 0,
    balanceToday,
  };
};
