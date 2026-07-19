import { useCallback, useRef, useState } from 'react';
import { runAnalysis } from 'entities/analysis';
import type { AnalysisEvent, AnalysisStreamOptions } from 'entities/analysis';
import type { DemoScenario } from 'shared/config';

export type AnalysisRunStatus = 'idle' | 'running' | 'done';

export interface AnalysisRun {
  readonly events: readonly AnalysisEvent[];
  readonly status: AnalysisRunStatus;
  readonly start: () => void;
}

export const useAnalysisRun = (
  scenario: DemoScenario,
  options: AnalysisStreamOptions = {},
): AnalysisRun => {
  const [events, setEvents] = useState<readonly AnalysisEvent[]>([]);
  const [status, setStatus] = useState<AnalysisRunStatus>('idle');
  const activeRunRef = useRef(0);
  const stepDelayMs = options.stepDelayMs;

  const start = useCallback(() => {
    const runId = activeRunRef.current + 1;
    activeRunRef.current = runId;
    setEvents([]);
    setStatus('running');
    void (async () => {
      const streamOptions = stepDelayMs === undefined ? {} : { stepDelayMs };
      for await (const event of runAnalysis(scenario, streamOptions)) {
        if (activeRunRef.current !== runId) {
          return;
        }
        setEvents((previousEvents) => [...previousEvents, event]);
      }
      if (activeRunRef.current === runId) {
        setStatus('done');
      }
    })();
  }, [scenario, stepDelayMs]);

  return { events, status, start };
};
