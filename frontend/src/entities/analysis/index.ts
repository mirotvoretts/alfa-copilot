export { runAnalysis } from './model/analysisStream';
export type { AnalysisEvent, AnalysisStepId, AnalysisStreamOptions } from './model/analysisStream';
export { classifyRisk } from './model/classifyRisk';
export { computeDiagnostics } from './model/computeDiagnostics';
export { forecastCashGap } from './model/forecastCashGap';
export {
  composeForecastNarrative,
  composeProactiveMessage,
  composeRecommendations,
  composeRiskExplanation,
} from './model/mockCopilotNarrator';
export type {
  CashGapForecast,
  Diagnostics,
  ForecastConfidence,
  ProactiveMessage,
  Recommendation,
  RevenueTrend,
  RiskLevel,
} from './model/types';
