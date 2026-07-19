import { describe, expect, it } from 'vitest';
import { marinaScenario } from 'shared/config';
import { runAnalysis } from './analysisStream';
import type { AnalysisEvent } from './analysisStream';

const collectEvents = async (): Promise<AnalysisEvent[]> => {
  const events: AnalysisEvent[] = [];
  for await (const event of runAnalysis(marinaScenario, { stepDelayMs: 0 })) {
    events.push(event);
  }
  return events;
};

describe('runAnalysis', () => {
  it('emits started and ready events for all five steps in order', async () => {
    const events = await collectEvents();
    expect(events.map((event) => event.kind)).toEqual([
      'step_started',
      'diagnostics_ready',
      'step_started',
      'forecast_ready',
      'step_started',
      'risk_ready',
      'step_started',
      'recommendations_ready',
      'step_started',
      'message_ready',
    ]);
  });

  it('announces steps in the canonical pipeline order', async () => {
    const events = await collectEvents();
    const startedSteps = events
      .filter((event) => event.kind === 'step_started')
      .map((event) => (event.kind === 'step_started' ? event.step : null));
    expect(startedSteps).toEqual(['diagnostics', 'forecast', 'risk', 'recommendation', 'message']);
  });

  it('produces identical results on every run', async () => {
    const firstRun = await collectEvents();
    const secondRun = await collectEvents();
    expect(firstRun).toEqual(secondRun);
  });

  it('carries the yellow risk verdict and a non-empty support plan', async () => {
    const events = await collectEvents();
    const riskEvent = events.find((event) => event.kind === 'risk_ready');
    const recommendationsEvent = events.find((event) => event.kind === 'recommendations_ready');
    const messageEvent = events.find((event) => event.kind === 'message_ready');
    expect(riskEvent?.kind === 'risk_ready' && riskEvent.risk).toBe('yellow');
    expect(
      recommendationsEvent?.kind === 'recommendations_ready' &&
        recommendationsEvent.recommendations.length,
    ).toBe(3);
    expect(messageEvent?.kind === 'message_ready' && messageEvent.message.text).toContain(
      marinaScenario.entrepreneur.name,
    );
  });
});
