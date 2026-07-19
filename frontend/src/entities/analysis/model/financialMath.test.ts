import { describe, expect, it } from 'vitest';
import { buildDailyBalances, generateTransactions } from 'entities/transaction';
import { marinaScenario } from 'shared/config';
import { addDays } from 'shared/lib';
import { classifyRisk } from './classifyRisk';
import { computeDiagnostics } from './computeDiagnostics';
import { forecastCashGap } from './forecastCashGap';

const transactions = generateTransactions(marinaScenario);
const balances = buildDailyBalances(transactions, marinaScenario);
const diagnostics = computeDiagnostics(transactions, balances, marinaScenario);
const forecast = forecastCashGap(balances, marinaScenario);

describe('computeDiagnostics', () => {
  it('reports sixteen weekly revenue points', () => {
    expect(diagnostics.weeklyRevenue.length).toBe(16);
  });

  it('detects a falling trend at the end of the period', () => {
    expect(diagnostics.trend).toBe('падает');
  });

  it('reports a plausible beauty-service average ticket', () => {
    expect(diagnostics.averageTicket).toBeGreaterThan(300);
    expect(diagnostics.averageTicket).toBeLessThan(3_000);
  });

  it('reports a strained runway below thirty days', () => {
    expect(diagnostics.runwayDays).toBeGreaterThan(0);
    expect(diagnostics.runwayDays).toBeLessThan(30);
  });

  it('attributes a visible share of expenses to the one-off equipment purchase', () => {
    expect(diagnostics.largeExpenseShare).toBeGreaterThan(0.15);
    expect(diagnostics.largeExpenseShare).toBeLessThan(0.5);
  });
});

describe('forecastCashGap', () => {
  it('predicts a gap two to three weeks ahead', () => {
    expect(forecast.daysUntilGap).not.toBeNull();
    expect(forecast.daysUntilGap).toBeGreaterThanOrEqual(14);
    expect(forecast.daysUntilGap).toBeLessThanOrEqual(21);
  });

  it('derives the gap date from today plus the predicted days', () => {
    expect(forecast.daysUntilGap).not.toBeNull();
    if (forecast.daysUntilGap === null) {
      return;
    }
    expect(forecast.gapDate).toBe(addDays(marinaScenario.todayDate, forecast.daysUntilGap));
  });

  it('stays consistent with the balance curve via linear burn', () => {
    const lastBalance = balances[balances.length - 1];
    expect(lastBalance).toBeDefined();
    if (!lastBalance || forecast.daysUntilGap === null) {
      return;
    }
    const projectedAtGap = lastBalance.balance - forecast.dailyBurn * forecast.daysUntilGap;
    expect(projectedAtGap).toBeLessThanOrEqual(forecast.dailyBurn);
  });
});

describe('classifyRisk', () => {
  it('marks more than thirty days as green', () => {
    expect(classifyRisk(31, marinaScenario.riskThresholds)).toBe('green');
    expect(classifyRisk(null, marinaScenario.riskThresholds)).toBe('green');
  });

  it('marks fourteen to thirty days as yellow', () => {
    expect(classifyRisk(30, marinaScenario.riskThresholds)).toBe('yellow');
    expect(classifyRisk(14, marinaScenario.riskThresholds)).toBe('yellow');
  });

  it('marks less than fourteen days as red', () => {
    expect(classifyRisk(13, marinaScenario.riskThresholds)).toBe('red');
  });

  it('classifies the marina scenario as yellow', () => {
    expect(classifyRisk(forecast.daysUntilGap, marinaScenario.riskThresholds)).toBe('yellow');
  });
});
