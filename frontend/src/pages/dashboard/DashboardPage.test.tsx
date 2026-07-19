import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { DashboardPage } from './DashboardPage';

afterEach(cleanup);

describe('DashboardPage', () => {
  it('shows the copilot header, entrepreneur profile and disclaimer', () => {
    render(<DashboardPage streamOptions={{ stepDelayMs: 0 }} />);
    expect(screen.getByText('АльфаКопилот')).toBeDefined();
    expect(screen.getByText(/Марина/)).toBeDefined();
    expect(screen.getByText(/рекомендации, а не финансовые консультации/)).toBeDefined();
  });

  it('streams all five step results after pressing the run button', async () => {
    const user = userEvent.setup();
    render(<DashboardPage streamOptions={{ stepDelayMs: 0 }} />);
    await user.click(screen.getByRole('button', { name: 'Запустить анализ' }));
    expect(await screen.findByText('Диагностика')).toBeDefined();
    expect(await screen.findByText('Прогноз кассового разрыва')).toBeDefined();
    expect(await screen.findByText('Уровень риска')).toBeDefined();
    expect(await screen.findByText('Что делать')).toBeDefined();
    expect(await screen.findByText('Сообщение от Копилота')).toBeDefined();
    expect(await screen.findByText(/Подключить «Подели»/)).toBeDefined();
  });

  it('lets the analysis be restarted after it finishes', async () => {
    const user = userEvent.setup();
    render(<DashboardPage streamOptions={{ stepDelayMs: 0 }} />);
    await user.click(screen.getByRole('button', { name: 'Запустить анализ' }));
    await screen.findByText(/Подключить «Подели»/);
    expect(screen.getByRole('button', { name: 'Повторить анализ' })).toBeDefined();
  });
});
