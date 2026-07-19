import { buildDailyBalances, generateTransactions } from 'entities/transaction';
import type { DemoScenario } from 'shared/config';
import { classifyRisk } from './classifyRisk';
import { computeDiagnostics } from './computeDiagnostics';
import { forecastCashGap } from './forecastCashGap';
import {
  composeForecastNarrative,
  composeProactiveMessage,
  composeRecommendations,
  composeRiskExplanation,
} from './mockCopilotNarrator';
import type {
  CashGapForecast,
  Diagnostics,
  ProactiveMessage,
  Recommendation,
  RiskLevel,
} from './types';

export type AnalysisStepId = 'diagnostics' | 'forecast' | 'risk' | 'recommendation' | 'message';

export type AnalysisEvent =
  | { readonly kind: 'step_started'; readonly step: AnalysisStepId }
  | { readonly kind: 'diagnostics_ready'; readonly diagnostics: Diagnostics }
  | {
      readonly kind: 'forecast_ready';
      readonly forecast: CashGapForecast;
      readonly narrative: string;
    }
  | { readonly kind: 'risk_ready'; readonly risk: RiskLevel; readonly explanation: string }
  | {
      readonly kind: 'recommendations_ready';
      readonly recommendations: readonly Recommendation[];
    }
  | { readonly kind: 'message_ready'; readonly message: ProactiveMessage };

export interface AnalysisStreamOptions {
  readonly stepDelayMs?: number;
}

const defaultStepDelayMs = 1_100;

const wait = (delayMs: number): Promise<void> =>
  delayMs > 0
    ? new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      })
    : Promise.resolve();

export async function* runAnalysis(
  scenario: DemoScenario,
  options: AnalysisStreamOptions = {},
): AsyncGenerator<AnalysisEvent> {
  const stepDelayMs = options.stepDelayMs ?? defaultStepDelayMs;
  const transactions = generateTransactions(scenario);
  const balances = buildDailyBalances(transactions, scenario);

  yield { kind: 'step_started', step: 'diagnostics' };
  await wait(stepDelayMs);
  const diagnostics = computeDiagnostics(transactions, balances, scenario);
  yield { kind: 'diagnostics_ready', diagnostics };

  yield { kind: 'step_started', step: 'forecast' };
  await wait(stepDelayMs);
  const forecast = forecastCashGap(balances, scenario);
  yield { kind: 'forecast_ready', forecast, narrative: composeForecastNarrative(forecast) };

  yield { kind: 'step_started', step: 'risk' };
  await wait(stepDelayMs);
  const risk = classifyRisk(forecast.daysUntilGap, scenario.riskThresholds);
  yield { kind: 'risk_ready', risk, explanation: composeRiskExplanation(risk, forecast, scenario) };

  yield { kind: 'step_started', step: 'recommendation' };
  await wait(stepDelayMs);
  const recommendations = composeRecommendations(diagnostics, forecast, risk, scenario);
  yield { kind: 'recommendations_ready', recommendations };

  yield { kind: 'step_started', step: 'message' };
  await wait(stepDelayMs);
  yield { kind: 'message_ready', message: composeProactiveMessage(recommendations, scenario) };
}
