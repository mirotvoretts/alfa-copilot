import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { AnalysisEvent } from 'entities/analysis';
import { CopilotFeed } from './ui/CopilotFeed';

afterEach(cleanup);

const riskEvent: AnalysisEvent = {
  kind: 'risk_ready',
  risk: 'yellow',
  explanation: 'До прогнозируемого разрыва 18 дней',
};

describe('CopilotFeed', () => {
  it('invites to run the analysis while idle', () => {
    render(<CopilotFeed events={[]} status="idle" />);
    expect(screen.getByText(/Запустите анализ/)).toBeDefined();
  });

  it('shows a live thinking indicator for a started step', () => {
    render(
      <CopilotFeed events={[{ kind: 'step_started', step: 'diagnostics' }]} status="running" />,
    );
    expect(screen.getByText('Диагностика')).toBeDefined();
    expect(screen.getByText(/анализирую/i)).toBeDefined();
  });

  it('renders a completed risk step with its verdict', () => {
    render(<CopilotFeed events={[riskEvent]} status="running" />);
    expect(screen.getByText('Жёлтый уровень')).toBeDefined();
    expect(screen.getByText(/18 дней/)).toBeDefined();
  });
});
