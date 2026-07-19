import { describe, expect, it } from 'vitest';
import { marinaScenario } from 'shared/config';
import { buildDailyBalances } from './buildDailyBalances';
import { generateTransactions } from './generateTransactions';

const transactions = generateTransactions(marinaScenario);
const balances = buildDailyBalances(transactions, marinaScenario);

const monthRevenue = (monthIndex: number): number =>
  transactions
    .filter((transaction) => {
      const dayOffset = Math.floor(
        (Date.parse(transaction.date) - Date.parse(marinaScenario.startDate)) / 86_400_000,
      );
      return Math.floor(dayOffset / 28) === monthIndex && transaction.amount > 0;
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);

describe('generateTransactions', () => {
  it('is deterministic for the fixed scenario seed', () => {
    expect(generateTransactions(marinaScenario)).toEqual(transactions);
  });

  it('covers 112 days with ascending dates', () => {
    const dates = [...new Set(transactions.map((transaction) => transaction.date))];
    expect(dates.length).toBe(112);
    expect(dates).toEqual([...dates].sort());
  });

  it('uses integer ruble amounts and known channels and categories', () => {
    for (const transaction of transactions) {
      expect(Number.isInteger(transaction.amount)).toBe(true);
      expect(['mPOS', 'QR-СБП', 'AlfaPay']).toContain(transaction.channel);
      expect([
        'услуга',
        'чаевые',
        'расход_оборудование',
        'расход_аренда',
        'расход_материалы',
      ]).toContain(transaction.category);
    }
  });

  it('grows revenue through months one and two then dips in month three', () => {
    expect(monthRevenue(1)).toBeGreaterThan(monthRevenue(0));
    expect(monthRevenue(2)).toBeLessThan(monthRevenue(1) * 0.75);
  });

  it('contains a single large equipment expense in month three', () => {
    const equipmentExpenses = transactions.filter(
      (transaction) => transaction.category === 'расход_оборудование',
    );
    expect(equipmentExpenses.length).toBe(1);
    const equipment = equipmentExpenses[0];
    expect(equipment).toBeDefined();
    if (!equipment) {
      return;
    }
    expect(equipment.amount).toBeLessThan(-30_000);
    const dayOffset = Math.floor(
      (Date.parse(equipment.date) - Date.parse(marinaScenario.startDate)) / 86_400_000,
    );
    expect(dayOffset).toBeGreaterThanOrEqual(56);
    expect(dayOffset).toBeLessThan(84);
  });
});

describe('buildDailyBalances', () => {
  it('produces one balance point per day ending today', () => {
    expect(balances.length).toBe(112);
    const lastBalance = balances[balances.length - 1];
    expect(lastBalance?.date).toBe(marinaScenario.todayDate);
  });

  it('keeps today balance positive but strained', () => {
    const lastBalance = balances[balances.length - 1];
    expect(lastBalance).toBeDefined();
    if (!lastBalance) {
      return;
    }
    expect(lastBalance.balance).toBeGreaterThan(0);
    expect(lastBalance.balance).toBeLessThan(40_000);
  });

  it('accumulates the opening balance plus every transaction', () => {
    const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const lastBalance = balances[balances.length - 1];
    expect(lastBalance?.balance).toBe(marinaScenario.openingBalance + total);
  });
});
