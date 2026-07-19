export type RevenueTrend = 'растет' | 'падает' | 'стабилен';

export type ForecastConfidence = 'низкая' | 'средняя' | 'высокая';

export type RiskLevel = 'green' | 'yellow' | 'red';

export interface Diagnostics {
  readonly averageTicket: number;
  readonly weeklyRevenue: readonly number[];
  readonly trend: RevenueTrend;
  readonly runwayDays: number;
  readonly largeExpenseShare: number;
  readonly balanceToday: number;
}

export interface CashGapForecast {
  readonly daysUntilGap: number | null;
  readonly gapDate: string | null;
  readonly dailyBurn: number;
  readonly confidence: ForecastConfidence;
}

export interface Recommendation {
  readonly productTitle: string;
  readonly action: string;
}

export interface ProactiveMessage {
  readonly text: string;
  readonly ctaLabel: string;
}
