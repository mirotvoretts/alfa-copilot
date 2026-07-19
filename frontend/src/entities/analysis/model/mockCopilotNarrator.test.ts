import { describe, expect, it } from 'vitest';
import { buildDailyBalances, generateTransactions } from 'entities/transaction';
import { marinaScenario } from 'shared/config';
import { classifyRisk } from './classifyRisk';
import { computeDiagnostics } from './computeDiagnostics';
import { forecastCashGap } from './forecastCashGap';
import {
  composeForecastNarrative,
  composeProactiveMessage,
  composeRecommendations,
  composeRiskExplanation,
} from './mockCopilotNarrator';

const transactions = generateTransactions(marinaScenario);
const balances = buildDailyBalances(transactions, marinaScenario);
const diagnostics = computeDiagnostics(transactions, balances, marinaScenario);
const forecast = forecastCashGap(balances, marinaScenario);
const risk = classifyRisk(forecast.daysUntilGap, marinaScenario.riskThresholds);
const recommendations = composeRecommendations(diagnostics, forecast, risk, marinaScenario);
const message = composeProactiveMessage(recommendations, marinaScenario);

describe('composeForecastNarrative', () => {
  it('mentions the predicted number of days and a confidence level', () => {
    const narrative = composeForecastNarrative(forecast);
    expect(narrative).toContain(String(forecast.daysUntilGap));
    expect(narrative).toContain(forecast.confidence);
  });
});

describe('composeRiskExplanation', () => {
  it('explains the yellow status in one sentence', () => {
    const explanation = composeRiskExplanation(risk, forecast, marinaScenario);
    expect(explanation.length).toBeGreaterThan(20);
    expect(explanation.split('.').filter((part) => part.trim().length > 0).length).toBe(1);
  });
});

describe('composeRecommendations', () => {
  it('returns two or three actions tied to payment products', () => {
    expect(recommendations.length).toBeGreaterThanOrEqual(2);
    expect(recommendations.length).toBeLessThanOrEqual(3);
    const productTitles = marinaScenario.products.map((product) => product.title);
    for (const recommendation of recommendations) {
      expect(productTitles).toContain(recommendation.productTitle);
      expect(recommendation.action.length).toBeGreaterThan(15);
    }
  });

  it('is deterministic', () => {
    expect(composeRecommendations(diagnostics, forecast, risk, marinaScenario)).toEqual(
      recommendations,
    );
  });
});

describe('composeProactiveMessage', () => {
  it('addresses the entrepreneur by name without panic wording', () => {
    expect(message.text).toContain(marinaScenario.entrepreneur.name);
    expect(message.text.toLowerCase()).not.toContain('паника');
    expect(message.text.toLowerCase()).not.toContain('срочно');
  });

  it('carries a single call to action button label', () => {
    expect(message.ctaLabel.length).toBeGreaterThan(3);
    const firstProduct = recommendations[0];
    expect(firstProduct).toBeDefined();
    if (!firstProduct) {
      return;
    }
    expect(message.ctaLabel).toContain(firstProduct.productTitle);
  });
});
