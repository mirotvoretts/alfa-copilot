import type { DailyBalance } from 'entities/transaction';

export interface ChartLayout {
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly totalDays: number;
  readonly projectionDays: number;
  readonly maxBalance: number;
}

export const createChartLayout = (
  balances: readonly DailyBalance[],
  projectionDays: number,
): ChartLayout => {
  const maxBalance = balances.reduce((peak, point) => Math.max(peak, point.balance), 0);
  return {
    width: 760,
    height: 330,
    left: 62,
    right: 18,
    top: 22,
    bottom: 36,
    totalDays: balances.length,
    projectionDays,
    maxBalance: Math.ceil((maxBalance * 1.12) / 10_000) * 10_000,
  };
};

export const xForDay = (layout: ChartLayout, dayOffset: number): number => {
  const domainDays = layout.totalDays - 1 + layout.projectionDays;
  const innerWidth = layout.width - layout.left - layout.right;
  return layout.left + (dayOffset / domainDays) * innerWidth;
};

export const yForBalance = (layout: ChartLayout, balance: number): number => {
  const innerHeight = layout.height - layout.top - layout.bottom;
  return layout.top + (1 - balance / layout.maxBalance) * innerHeight;
};

export const balancesToPath = (layout: ChartLayout, balances: readonly DailyBalance[]): string =>
  balances
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command}${xForDay(layout, index).toFixed(1)},${yForBalance(layout, point.balance).toFixed(1)}`;
    })
    .join(' ');
